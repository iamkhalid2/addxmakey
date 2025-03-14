import { useState, useCallback } from 'react';

/**
 * Custom hook for processing images with Google's Gemini 2.0 API via FastAPI backend
 * Implements image editing capabilities using the Image-out feature
 */
const useGeminiImageProcessor = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  // Configure API endpoint
  const API_URL = 'http://localhost:8000';

  // Function to convert base64 to blob
  const base64ToBlob = (base64) => {
    try {
      const byteString = atob(base64.split(',')[1]);
      const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      return new Blob([ab], { type: mimeString });
    } catch (err) {
      console.error('Error converting base64 to blob:', err);
      throw new Error('Invalid image format');
    }
  };

  // Function to validate image data URL
  const validateImageDataUrl = (dataUrl) => {
    if (!dataUrl) return false;
    
    // Basic validation to ensure it's a data URL for an image
    return dataUrl.startsWith('data:image/') && dataUrl.includes('base64,');
  };

  // Set image function
  const setImage = useCallback((imageDataUrl) => {
    if (!validateImageDataUrl(imageDataUrl)) {
      setError('Invalid image format');
      return;
    }
    
    setOriginalImage(imageDataUrl);
    setCurrentImage(imageDataUrl);
    setHistory([]);
    setError(null);
    setSessionId(null); // Reset session ID when uploading a new image
  }, []);

  // Process command with the FastAPI backend
  const processCommand = useCallback(async (command) => {
    if (!currentImage) {
      return { success: false, message: 'No image to process' };
    }

    // Handle 'reset' command separately
    if (command.toLowerCase() === 'reset') {
      try {
        // Tell the backend to reset the session
        if (sessionId) {
          const formData = new FormData();
          formData.append('session_id', sessionId);
          
          await fetch(`${API_URL}/reset-session`, {
            method: 'POST',
            body: formData,
          });
        }
        
        setCurrentImage(originalImage);
        setHistory([]);
        setSessionId(null);
        
        return { success: true, message: 'Image reset to original' };
      } catch (err) {
        console.error('Error resetting image:', err);
        return { 
          success: false, 
          message: `Error: ${err.message || 'Failed to reset image'}` 
        };
      }
    }

    try {
      setProcessing(true);
      setError(null);

      // Create FormData to send to the backend
      const formData = new FormData();
      
      try {
        // Convert the current image to a blob and add it to the formData
        const imageBlob = base64ToBlob(currentImage);
        formData.append('file', imageBlob);
      } catch (err) {
        throw new Error('Invalid image format or corrupted image data');
      }
      
      // Add command and session ID (if it exists)
      formData.append('command', command);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }
      
      // Call the FastAPI backend
      const response = await fetch(`${API_URL}/process-image`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API returned an error');
      }
      
      // Save the session ID for future requests
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      
      // Validate the returned image data
      if (!validateImageDataUrl(result.image)) {
        console.error('Invalid image data returned from API');
        throw new Error('Received invalid image data from the server');
      }
      
      // Create a new image object to ensure the browser properly loads the new image
      const img = new Image();
      img.onload = () => {
        // Once the image loads successfully, add to history and update current image
        const historyEntry = {
          id: Date.now(),
          command,
          imageDataUrl: result.image,
          responseText: result.message
        };
        
        setHistory(prevHistory => [...prevHistory, historyEntry]);
        setCurrentImage(result.image);
      };
      
      img.onerror = () => {
        throw new Error('Failed to load the generated image');
      };
      
      // Set the source to trigger loading
      img.src = result.image;
      
      return { 
        success: true, 
        message: result.message || `Applied command: ${command}`,
        dataUrl: result.image
      };
      
    } catch (err) {
      console.error('Error processing with Gemini API:', err);
      setError(err.message || 'An error occurred while processing the image');
      return { 
        success: false, 
        message: `Error: ${err.message || 'Failed to process command with Gemini'}` 
      };
    } finally {
      setProcessing(false);
    }
  }, [currentImage, originalImage, sessionId]);
  
  // Undo last operation
  const undoLastOperation = useCallback(() => {
    if (history.length === 0) {
      // If no history, reset to original image
      setCurrentImage(originalImage);
      return { success: true, message: 'Reset to original image' };
    }
    
    // Remove last history entry
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    
    // Get the previous image state
    const prevImage = newHistory.length > 0 
      ? newHistory[newHistory.length - 1].imageDataUrl 
      : originalImage;
      
    setCurrentImage(prevImage);
    return { success: true, message: 'Undid last operation' };
  }, [history, originalImage]);

  return {
    originalImage,
    currentImage,
    setImage,
    processCommand,
    undoLastOperation,
    history,
    processing,
    error,
  };
};

export default useGeminiImageProcessor;
