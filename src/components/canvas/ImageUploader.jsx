import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const ImageUploader = ({ onImageUpload, hasImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Handle pointer events for custom drag indicator
  const handlePointerMove = (e) => {
    if (isDragActive) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    gsap.to(dropAreaRef.current, {
      scale: 1.02,
      boxShadow: '0 8px 30px rgba(14, 165, 233, 0.15)',
      borderColor: 'rgb(14, 165, 233)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    gsap.to(dropAreaRef.current, {
      scale: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      borderColor: 'rgba(203, 213, 225, 0.5)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragActive(false);
    
    gsap.to(dropAreaRef.current, {
      scale: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      borderColor: 'rgba(203, 213, 225, 0.5)',
      duration: 0.3,
      ease: 'power2.out'
    });
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };
  
  const handleFile = (file) => {
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageUpload(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Only show uploader if no image is present
  if (hasImage) return null;

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      onPointerMove={handlePointerMove}
    >
      <motion.div 
        ref={dropAreaRef}
        className={`
          relative w-full max-w-3xl aspect-video rounded-xl border-2 border-dashed 
          bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center p-8
          ${isDragging ? 'border-primary-500' : 'border-secondary-300/50'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden"
          onChange={handleFileInputChange}
        />
        
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div 
            className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-500"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </motion.div>
          
          <div className="text-center">
            <h3 className="font-display text-xl font-medium text-secondary-900 mb-2">Upload your image</h3>
            <p className="text-secondary-600 mb-2">Drag and drop or click to browse</p>
            <p className="text-xs text-secondary-500">Supports JPG, PNG, GIF up to 10MB</p>
          </div>
          
          <motion.button
            className="mt-4 bg-primary-500 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary-600 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Select Image
          </motion.button>
        </div>
        
        {isDragging && (
          <motion.div 
            className="absolute inset-0 bg-primary-50/30 rounded-xl backdrop-blur-sm flex items-center justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-lg shadow-lg border border-primary-100">
              <p className="text-primary-700 font-medium">Drop your image here</p>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Floating indicators when dragging a file over the window */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 border-4 border-primary-500/30 backdrop-blur-sm" />
            <motion.div 
              className="absolute left-0 top-0 w-full h-full flex items-center justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-primary-200 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-secondary-900 font-medium">Drop anywhere to upload</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;