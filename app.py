import os
import pathlib
import io
import uuid
import base64
from flask import Flask, request, render_template, send_file, redirect, url_for, flash, session, send_from_directory, jsonify
from google import genai
from google.genai import types
from werkzeug.utils import secure_filename
import PIL.Image
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set configuration values
API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL_ID = "gemini-2.0-flash-exp-image-generation"  # Hardcoded model ID
UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
SECRET_KEY = "gemini_image_processor"

# Check if running on Vercel
IS_VERCEL = os.environ.get('VERCEL', False)

# In Vercel, we'll use in-memory storage since the filesystem is read-only
if IS_VERCEL:
    UPLOAD_FOLDER = "/tmp/uploads"
    RESULT_FOLDER = "/tmp/results"

# Initialize Flask with proper static folder configuration for Vercel
app = Flask(__name__, static_folder='static')
app.secret_key = SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER
app.config['SESSION_TYPE'] = 'filesystem'

# Create directories only if not on Vercel or if using /tmp (which is writable on Vercel)
if not IS_VERCEL or (IS_VERCEL and '/tmp' in UPLOAD_FOLDER):
    try:
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)
    except OSError as e:
        print(f"Warning: Could not create directories: {e}")
        # Continue anyway, as we'll handle file operations carefully

# In-memory storage for Vercel deployment
if IS_VERCEL:
    # Dictionary to store uploaded/generated images in memory
    in_memory_files = {}

# Initialize the AI client
try:
    client = genai.Client(api_key=API_KEY)
except Exception as e:
    print(f"Error initializing AI client: {e}")
    client = None

# Store chats in memory (in production, use a database)
active_chats = {}

def save_image(response, path):
    """Save image from response, handling Vercel's read-only filesystem"""
    for part in response.candidates[0].content.parts:
        if part.text is not None:
            continue
        elif part.inline_data is not None:
            data = part.inline_data.data
            if IS_VERCEL:
                # In Vercel, store in memory dictionary instead of filesystem
                filename = os.path.basename(path)
                in_memory_files[filename] = data
                return filename
            else:
                # Normal filesystem storage
                pathlib.Path(path).write_bytes(data)
                return os.path.basename(path)
    return None

def load_image_from_path(image_path):
    """Load an image from filesystem or memory storage"""
    if IS_VERCEL:
        # For Vercel, look for image in memory
        filename = os.path.basename(image_path)
        if filename in in_memory_files:
            return PIL.Image.open(io.BytesIO(in_memory_files[filename]))
        return None
    else:
        # Normal filesystem operation
        if os.path.exists(image_path):
            return PIL.Image.open(image_path)
        return None

@app.route('/')
def index():
    # Generate a new session ID if none exists
    if 'chat_id' not in session:
        session['chat_id'] = str(uuid.uuid4())
        
    # Initialize new chat for this session if needed
    chat_id = session['chat_id']
    if chat_id not in active_chats and client is not None:
        try:
            active_chats[chat_id] = {
                'chat': client.chats.create(
                    model=MODEL_ID,
                    config=types.GenerateContentConfig(
                        response_modalities=['Text', 'Image']
                    )
                ),
                'history': []  # Store previous messages and images
            }
        except Exception as e:
            flash(f"Error creating chat: {str(e)}")
    
    # Get chat history for display
    chat_history = []
    if chat_id in active_chats:
        chat_history = active_chats[chat_id]['history']
    
    return render_template('index.html', chat_history=chat_history)

@app.route('/generate', methods=['POST'])
def generate_image():
    if client is None:
        error_msg = "API client not initialized. Please check your API key."
        # Check if it's an AJAX request
        is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax_request:
            return jsonify({'error': error_msg}), 500
        else:
            flash(error_msg)
            return redirect(url_for('index'))
    
    # Get the chat ID from the session
    chat_id = session.get('chat_id')
    if not chat_id or chat_id not in active_chats:
        error_msg = "Chat session expired or not found. Starting a new one."
        # Check if it's an AJAX request
        is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax_request:
            return jsonify({'error': error_msg}), 500
        else:
            flash(error_msg)
            return redirect(url_for('index'))
    
    # Determine if this is a regeneration request
    is_regeneration = request.form.get('is_regeneration') == 'true'
    
    # Get prompt from form
    prompt = request.form.get('prompt', '')
    if not prompt:
        error_msg = "Please provide a prompt for image generation"
        # Check if it's an AJAX request
        is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax_request:
            return jsonify({'error': error_msg}), 400
        else:
            flash(error_msg)
            return redirect(url_for('index'))
    
    # Determine if we need to use a previous image for regeneration
    previous_image = None
    if is_regeneration:
        # Get index of the message to regenerate
        try:
            regenerate_index = int(request.form.get('regenerate_index', 0))
            chat_history = active_chats[chat_id]['history']
            
            # Get the previous message's image (one before the one we're regenerating)
            if regenerate_index < len(chat_history) - 1:
                previous_message = chat_history[regenerate_index + 1]  # +1 because history is newest-first
                previous_image_path = previous_message['image_path']
                previous_image = load_image_from_path(previous_image_path)
        except (ValueError, IndexError) as e:
            print(f"Error finding previous image: {e}")
            # Continue without previous image if there's an error
    
    # Check if there's an uploaded file (only for non-regeneration initial messages)
    has_file = not is_regeneration and 'image' in request.files and request.files['image'].filename != ''
    
    try:
        chat = active_chats[chat_id]['chat']
        
        # Handle file upload for the initial message if needed
        if has_file:
            # Get the image file
            file = request.files['image']
            filename = secure_filename(file.filename)
            
            if IS_VERCEL:
                # For Vercel, keep the image in memory
                image_data = file.read()
                in_memory_files[filename] = image_data
                image = PIL.Image.open(io.BytesIO(image_data))
            else:
                # Normal filesystem operation
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                image = PIL.Image.open(filepath)
            
            # Send message with the uploaded image
            response = chat.send_message([prompt, image])
        elif previous_image:
            # Send message with the previous image for regeneration
            response = chat.send_message([prompt, previous_image])
        else:
            # Send text-only message
            response = chat.send_message(prompt)
        
        # Extract text and image from response
        text_response = ""
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                text_response += part.text
        
        # Save the image to a file
        result_filename = f"result_{int(os.urandom(4).hex(), 16)}.png"
        result_path = os.path.join(app.config['RESULT_FOLDER'], result_filename)
        saved_filename = save_image(response, result_path)
        
        # Update chat history
        new_message = {
            'prompt': prompt,
            'text_response': text_response,
            'image_path': f"results/{saved_filename}" if IS_VERCEL else result_path,
            'download_name': saved_filename
        }
        
        # For regeneration, we don't want to add to history, just replace
        if is_regeneration:
            # Since we reversed the list for display, we need to handle indexes carefully
            # chat_history is newest-first, so regenerate_index 0 is the newest message
            try:
                regenerate_index = int(request.form.get('regenerate_index', 0))
                # Remove the message at the regenerate index
                active_chats[chat_id]['history'].pop(regenerate_index)
                # Insert the new message at the same index
                active_chats[chat_id]['history'].insert(regenerate_index, new_message)
            except (ValueError, IndexError):
                # If there's an error with the index, just add it as a new message
                active_chats[chat_id]['history'].insert(0, new_message)
        else:
            # For normal messages, insert at beginning (newest first)
            active_chats[chat_id]['history'].insert(0, new_message)
        
        # Check if it's an AJAX request
        is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        if is_ajax_request:
            # Return only the chat history HTML snippet for AJAX requests
            return render_template('chat_history.html', 
                                  chat_history=active_chats[chat_id]['history'])
        else:
            # Return full page for non-AJAX requests (fallback)
            return render_template('index.html', 
                                  chat_history=active_chats[chat_id]['history'])
    except Exception as e:
        error_msg = f"Error generating image: {str(e)}"
        
        # Check if it's an AJAX request
        is_ajax_request = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        if is_ajax_request:
            return jsonify({'error': error_msg}), 500
        else:
            flash(error_msg)
            return redirect(url_for('index'))

@app.route('/reset_chat')
def reset_chat():
    # Generate a new session ID to start fresh
    session['chat_id'] = str(uuid.uuid4())
    return redirect(url_for('index'))

@app.route('/download/<filename>')
def download_file(filename):
    if IS_VERCEL and filename in in_memory_files:
        # Serve from memory in Vercel
        return send_file(
            io.BytesIO(in_memory_files[filename]),
            mimetype='image/png',
            as_attachment=True,
            download_name=filename
        )
    else:
        # Serve from filesystem
        return send_file(os.path.join(app.config['RESULT_FOLDER'], filename), as_attachment=True)

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    if IS_VERCEL and filename in in_memory_files:
        # Serve from memory in Vercel
        return send_file(
            io.BytesIO(in_memory_files[filename]),
            mimetype='image/png'
        )
    else:
        # Serve from filesystem
        return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

@app.route('/results/<path:filename>')
def serve_result(filename):
    if IS_VERCEL and filename in in_memory_files:
        # Serve from memory in Vercel
        return send_file(
            io.BytesIO(in_memory_files[filename]),
            mimetype='image/png'
        )
    else:
        # Serve from filesystem
        return send_file(os.path.join(app.config['RESULT_FOLDER'], filename))

# Add explicit route for static files (helps with Vercel)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Health check endpoint for Vercel
@app.route('/_health')
def health_check():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True)