from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from pydantic import BaseModel
import os
import base64
import io
import sys
from PIL import Image, UnidentifiedImageError
from typing import Optional, List, Dict, Any
import uuid
from dotenv import load_dotenv
import imghdr  # Add this to help with image format detection

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Gemini Image Editor API")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use API key from environment variable
API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_ID = "gemini-2.0-flash-exp"  # Using the model from the notebook

# Initialize Gemini API client
client = genai.Client(api_key=API_KEY)

# Store active chat sessions
chat_sessions = {}

class ImageEditRequest(BaseModel):
    image: Optional[str] = None  # Base64 encoded image
    command: str
    session_id: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Gemini Image Editor API is running"}

@app.post("/process-image")
async def process_image(
    file: UploadFile = File(None),
    command: str = Form(...),
    session_id: str = Form(None),
):
    try:
        print(f"Processing command: '{command}'")
        print(f"Session ID: {session_id}")
        
        # Create a new session if none exists
        if not session_id or session_id not in chat_sessions:
            session_id = str(uuid.uuid4())
            print(f"Creating new session: {session_id}")
            chat_sessions[session_id] = client.chats.create(
                model=MODEL_ID,
                config=types.GenerateContentConfig(
                    response_modalities=['Text', 'Image']
                )
            )
        
        # Get the chat session
        chat = chat_sessions[session_id]
        
        # If file is provided, process the image
        if file:
            print(f"Processing uploaded file: {file.filename}, content type: {file.content_type}")
            # Read image file
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            print(f"Image opened successfully: {image.format}, size: {image.size}")
            
            # Send message with both image and command
            print("Sending message with image to Gemini API...")
            response = chat.send_message([
                f"Edit this image according to the following instruction: {command}",
                image
            ])
        else:
            print("No file provided, sending text-only command")
            # If no file, just send the command
            response = chat.send_message(command)
        
        # Extract image and text from response
        response_text = None
        response_image = None
        
        # Check if we got a valid response with candidates
        if not response.candidates or not response.candidates[0].content.parts:
            print("Empty response from Gemini API")
            raise HTTPException(status_code=500, detail="Empty response from Gemini API")
        
        print(f"Response received with {len(response.candidates[0].content.parts)} parts")
        
        part_index = 0
        for part in response.candidates[0].content.parts:
            part_index += 1
            if part.text is not None:
                response_text = part.text
                print(f"Part {part_index}: Text content received")
            elif part.inline_data is not None:
                try:
                    mime = part.inline_data.mime_type
                    data = part.inline_data.data
                    
                    print(f"Part {part_index}: Inline data received with MIME type: {mime}")
                    print(f"Data size: {len(data)} bytes")
                    
                    # Validate that we received image data
                    if not mime.startswith('image/'):
                        print(f"Unexpected MIME type: {mime}")
                        continue
                    
                    # Check if data is valid before attempting to create an image
                    if not data or len(data) == 0:
                        print("Empty image data received")
                        continue
                    
                    # Write data to disk for debugging (optional)
                    # with open("debug_image.bin", "wb") as f:
                    #     f.write(data)
                    
                    # Try to detect the image format
                    img_format = imghdr.what(None, h=data)
                    print(f"Detected image format: {img_format}")
                    
                    # Create a new BytesIO object with the image data
                    img_data = io.BytesIO(data)
                    img_data.seek(0)  # Ensure we're at the start of the stream
                    
                    try:
                        # Try to open the image data to verify it's valid
                        test_img = Image.open(img_data)
                        # Force load the image data to verify it's complete
                        test_img.load()
                        print(f"Verified image data: format={test_img.format}, size={test_img.size}")
                        
                        # Save to a new buffer with explicit format
                        output_buffer = io.BytesIO()
                        test_img.save(output_buffer, format=test_img.format)
                        output_buffer.seek(0)
                        data = output_buffer.getvalue()
                        
                        test_img.close()
                    except (UnidentifiedImageError, IOError) as img_err:
                        print(f"Invalid image data received: {str(img_err)}")
                        # Try different formats
                        for fmt in ['PNG', 'JPEG', 'GIF', 'WEBP']:
                            try:
                                print(f"Attempting to save as {fmt}")
                                # Create a new BytesIO object for each attempt
                                temp_buffer = io.BytesIO()
                                temp_buffer.write(data)
                                temp_buffer.seek(0)
                                
                                # Try to force the format
                                temp_img = Image.new('RGB', (1, 1))  # Create a dummy image
                                temp_img.save(temp_buffer, format=fmt)  # Just to initialize the buffer
                                
                                temp_buffer.seek(0)
                                temp_buffer.write(data)  # Write the actual data
                                temp_buffer.seek(0)
                                
                                # Try to open and verify
                                converted_img = Image.open(temp_buffer)
                                converted_img.verify()  # This will raise an error if the data is invalid
                                
                                # If we get here, it worked
                                print(f"Successfully identified as {fmt}")
                                
                                # Re-save with the correct format
                                temp_buffer = io.BytesIO()
                                temp_buffer.write(data)
                                temp_buffer.seek(0)
                                
                                converted_img = Image.open(temp_buffer)
                                output_buffer = io.BytesIO()
                                converted_img.save(output_buffer, format=fmt)
                                output_buffer.seek(0)
                                data = output_buffer.getvalue()
                                mime = f"image/{fmt.lower()}"
                                
                                break
                            except Exception as e:
                                print(f"Failed with {fmt}: {str(e)}")
                                continue
                        else:
                            print("All format attempts failed")
                            # If all attempts fail, try one more approach - save the raw bytes
                            try:
                                # Just use the raw bytes and set a generic image type
                                print("Using raw bytes as PNG")
                                mime = "image/png"
                            except Exception as recovery_err:
                                print(f"Image recovery completely failed: {str(recovery_err)}")
                                continue
                    
                    # Convert image data to base64 for frontend
                    encoded_data = base64.b64encode(data).decode('utf-8')
                    print(f"Base64 encoded data length: {len(encoded_data)}")
                    
                    # Ensure mime type is properly set
                    if not mime or mime == "application/octet-stream":
                        mime = "image/png"  # Default to PNG if MIME type is generic
                        
                    response_image = f"data:{mime};base64,{encoded_data}"
                    print(f"Data URL created, total length: {len(response_image)}")
                    
                except Exception as e:
                    print(f"Error processing image data: {str(e)}")
                    continue
            else:
                print(f"Part {part_index}: Unknown part type")
        
        # If no image in response but we have text, return just the text
        if not response_image and response_text:
            print("No image was found in the response, but text was found")
            result = {
                "success": True,
                "message": response_text or f"Applied command: {command}",
                "session_id": session_id
            }
            return result
            
        # If no image and no meaningful text, raise exception
        if not response_image:
            print("No image was found in the response")
            raise HTTPException(status_code=500, detail="No image was returned from Gemini API")
        
        result = {
            "success": True,
            "message": response_text or f"Applied command: {command}",
            "image": response_image,
            "session_id": session_id
        }
        
        print(f"Returning successful response with image data (length: {len(response_image)})")
        return result
    
    except Exception as e:
        print(f"Error in process_image: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Error: {str(e)}"}
        )

@app.post("/reset-session")
async def reset_session(session_id: str = Form(None)):
    if session_id and session_id in chat_sessions:
        del chat_sessions[session_id]
    
    return {"success": True, "message": "Session reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)