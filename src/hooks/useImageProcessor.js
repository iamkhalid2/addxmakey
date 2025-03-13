import { useState, useCallback, useEffect } from 'react';

const useImageProcessor = (initialImage = null) => {
  const [image, setImage] = useState(initialImage);
  const [processedImage, setProcessedImage] = useState(initialImage);
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Reset processed image when original image changes
  useEffect(() => {
    if (image) {
      setProcessedImage(image);
      setHistory([]);
    } else {
      setProcessedImage(null);
    }
  }, [image]);

  // Process commands
  const processCommand = useCallback(async (command) => {
    if (!processedImage) return { success: false, message: 'No image to process' };
    
    setProcessing(true);
    
    // Parse the command and arguments
    const [action, ...args] = command.trim().toLowerCase().split(' ');
    
    try {
      let result;
      let response = { success: true, message: `Applied ${action}` };
      
      // Create a new Image to work with
      const img = new Image();
      img.src = processedImage;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Create a canvas to manipulate the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Process different command types
      switch(action) {
        case 'rotate': {
          const degrees = parseInt(args[0]) || 90;
          
          // Adjust canvas size for rotation
          if (Math.abs(degrees) === 90 || Math.abs(degrees) === 270) {
            canvas.width = img.height;
            canvas.height = img.width;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          
          // Translate and rotate
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((degrees * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          
          response.message = `Rotated image by ${degrees} degrees`;
          break;
        }
        
        case 'flip': {
          const direction = args[0] || 'horizontal';
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (direction === 'horizontal') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            response.message = 'Flipped image horizontally';
          } else if (direction === 'vertical') {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
            response.message = 'Flipped image vertically';
          }
          
          ctx.drawImage(img, 0, 0);
          break;
        }
        
        case 'resize': {
          const sizeArg = args[0] || '800x600';
          const [width, height] = sizeArg.split('x').map(n => parseInt(n));
          
          if (width && height) {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            response.message = `Resized image to ${width}x${height}`;
          } else {
            throw new Error('Invalid resize dimensions');
          }
          break;
        }
        
        case 'crop': {
          // Simple centered crop
          const size = parseInt(args[0]) || Math.min(img.width, img.height) / 2;
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
          response.message = `Cropped image to ${size}x${size}`;
          break;
        }
        
        case 'filter': {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const type = args[0] || 'grayscale';
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          switch(type) {
            case 'grayscale':
              for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg; // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
              }
              response.message = 'Applied grayscale filter';
              break;
              
            case 'sepia':
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
              }
              response.message = 'Applied sepia filter';
              break;
              
            case 'invert':
              for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i]; // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
              }
              response.message = 'Applied invert filter';
              break;
              
            default:
              throw new Error(`Unknown filter type: ${type}`);
          }
          
          ctx.putImageData(imageData, 0, 0);
          break;
        }
        
        case 'brightness': {
          const value = parseInt(args[0]) || 0;
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Adjust brightness
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + value));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + value));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + value));
          }
          
          ctx.putImageData(imageData, 0, 0);
          response.message = `Adjusted brightness by ${value}`;
          break;
        }
        
        case 'save': {
          // Return the current processed image
          return {
            success: true,
            message: 'Image ready to save',
            dataUrl: processedImage,
            action: 'save'
          };
        }
        
        case 'reset':
          setProcessedImage(image);
          setHistory([]);
          return { success: true, message: 'Image reset to original' };
        
        default:
          throw new Error(`Unknown command: ${action}`);
      }
      
      // Convert canvas to data URL
      result = canvas.toDataURL('image/png');
      
      // Add to history and update processed image
      const historyEntry = {
        id: Date.now(),
        command,
        imageDataUrl: result
      };
      
      setHistory(prevHistory => [...prevHistory, historyEntry]);
      setProcessedImage(result);
      
      return { ...response, dataUrl: result };
    } catch (error) {
      console.error('Error processing command:', error);
      return { 
        success: false, 
        message: `Error: ${error.message || 'Failed to process command'}` 
      };
    } finally {
      setProcessing(false);
    }
  }, [processedImage, image]);
  
  // Undo last operation
  const undoLastOperation = useCallback(() => {
    if (history.length === 0) {
      // If no history, reset to original image
      setProcessedImage(image);
      return { success: true, message: 'Reset to original image' };
    }
    
    // Remove last history entry
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    
    // Get the previous image state
    const prevImage = newHistory.length > 0 
      ? newHistory[newHistory.length - 1].imageDataUrl 
      : image;
      
    setProcessedImage(prevImage);
    return { success: true, message: 'Undid last operation' };
  }, [history, image]);

  return {
    originalImage: image,
    currentImage: processedImage,
    setImage,
    processCommand,
    undoLastOperation,
    history,
    processing,
  };
};

export default useImageProcessor;