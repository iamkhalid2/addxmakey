import os
import pathlib
from flask import Flask, request, render_template, send_file, redirect, url_for, flash, session, send_from_directory
from google import genai
from google.genai import types
from werkzeug.utils import secure_filename
import PIL.Image
import io
import uuid
import config  # Import the config module

# Initialize Flask with proper static folder configuration for Vercel
app = Flask(__name__, static_folder='static')
app.secret_key = config.SECRET_KEY
app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = config.RESULT_FOLDER
app.config['SESSION_TYPE'] = 'filesystem'

# Create folders if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

# Initialize the Gemini client
try:
    client = genai.Client(api_key=config.API_KEY)
except Exception as e:
    print(f"Error initializing Gemini client: {e}")
    client = None

# Store chats in memory (in production, use a database)
active_chats = {}

def save_image(response, path):
    for part in response.candidates[0].content.parts:
        if part.text is not None:
            continue
        elif part.inline_data is not None:
            data = part.inline_data.data
            pathlib.Path(path).write_bytes(data)
    return os.path.basename(path)

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
                    model=config.MODEL_ID,
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
        flash("API client not initialized. Please check your API key.")
        return redirect(url_for('index'))
    
    # Get the chat ID from the session
    chat_id = session.get('chat_id')
    if not chat_id or chat_id not in active_chats:
        flash("Chat session expired or not found. Starting a new one.")
        return redirect(url_for('index'))
    
    # Check if there's a prompt
    prompt = request.form.get('prompt', '')
    if not prompt:
        flash("Please provide a prompt for image generation")
        return redirect(url_for('index'))
    
    # Check if there's an uploaded file (only for the initial message)
    has_file = 'image' in request.files and request.files['image'].filename != ''
    
    try:
        chat = active_chats[chat_id]['chat']
        
        # Handle file upload for the initial message if needed
        if has_file:
            # Get the image file
            file = request.files['image']
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Send message with the uploaded image
            image = PIL.Image.open(filepath)
            response = chat.send_message([prompt, image])
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
        save_image(response, result_path)
        
        # Update chat history
        active_chats[chat_id]['history'].append({
            'prompt': prompt,
            'text_response': text_response,
            'image_path': result_path,
            'download_name': os.path.basename(result_path)
        })
        
        return render_template('index.html', 
                              chat_history=active_chats[chat_id]['history'])
    except Exception as e:
        flash(f"Error generating image: {str(e)}")
        return redirect(url_for('index'))

@app.route('/reset_chat')
def reset_chat():
    # Generate a new session ID to start fresh
    session['chat_id'] = str(uuid.uuid4())
    return redirect(url_for('index'))

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(app.config['RESULT_FOLDER'], filename), as_attachment=True)

# Add a new route to directly serve the images
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

@app.route('/results/<path:filename>')
def serve_result(filename):
    return send_file(os.path.join(app.config['RESULT_FOLDER'], filename))

# Add explicit route for static files (helps with Vercel)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)