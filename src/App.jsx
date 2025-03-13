import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [image, setImage] = useState(null);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Draw the image on the canvas when it changes
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate aspect ratio to fit the image within canvas
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        
        if (canvasRatio > imgRatio) {
          drawWidth = canvas.height * imgRatio;
        } else {
          drawHeight = canvas.width / imgRatio;
        }
        
        // Center the image on the canvas
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      };
      
      img.src = image;
    }
  }, [image]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (command.trim()) {
      const newHistory = [...history, command];
      setHistory(newHistory);
      // Here you would handle the command processing
      console.log(`Processing command: ${command}`);
      setCommand('');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Photo Commander</h1>
        <p>Upload an image and use commands to edit it</p>
      </header>

      <main className="main-content">
        <section className="canvas-container">
          <div 
            className={`canvas-wrapper ${isDragging ? 'dragging' : ''} ${!image ? 'empty' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={!image ? triggerFileInput : undefined}
          >
            {!image ? (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p>Drag and drop your image here or click to browse</p>
              </div>
            ) : (
              <canvas ref={canvasRef} width={800} height={600}></canvas>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            style={{display: 'none'}} 
          />
          {image && (
            <div className="canvas-controls">
              <button className="btn" onClick={triggerFileInput}>Change Image</button>
              <button className="btn" onClick={() => setImage(null)}>Remove Image</button>
            </div>
          )}
        </section>

        <section className="command-section">
          <div className="command-history">
            {history.length > 0 ? (
              history.map((cmd, index) => (
                <div key={index} className="history-item">
                  <span className="history-prompt">$</span>
                  <span className="history-command">{cmd}</span>
                </div>
              ))
            ) : (
              <div className="empty-history">
                <p>Your command history will appear here</p>
              </div>
            )}
          </div>
          
          <form className="command-composer" onSubmit={handleCommandSubmit}>
            <div className="command-input-wrapper">
              <span className="command-prompt">$</span>
              <input
                type="text"
                className="command-input"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command (e.g., 'rotate 90', 'blur 5', 'crop')"
                autoFocus
              />
            </div>
            <button type="submit" className="command-submit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </section>
      </main>

      <footer className="app-footer">
        <p>Created with ❤️ using React and Vite</p>
      </footer>
    </div>
  );
}

export default App
