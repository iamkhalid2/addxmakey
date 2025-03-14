import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// Components
import Header from './components/ui/Header';
import Footer from './components/ui/Footer';
import AnimatedBackground from './components/ui/AnimatedBackground';
import ImageUploader from './components/canvas/ImageUploader';
import Scene3D from './components/canvas/Scene3D';
import CommandInterface from './components/commander/CommandInterface';

// Hooks
import useGeminiImageProcessor from './hooks/useGeminiImageProcessor';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('3d'); // '3d' or 'flat'
  
  const {
    originalImage,
    currentImage,
    setImage,
    processCommand,
    undoLastOperation,
    history,
    processing,
    error
  } = useGeminiImageProcessor();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (imageDataUrl) => {
    setImage(imageDataUrl);
  };

  const handleCommandSubmit = async (command) => {
    if (command.toLowerCase() === 'undo') {
      return undoLastOperation();
    }
    
    return processCommand(command);
  };

  const handleDownload = () => {
    if (!currentImage) return;
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `gemini-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContainer>
      {/* Loading screen */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="fixed inset-0 z-50 bg-white dark:bg-secondary-950 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-display text-xl text-secondary-900 dark:text-secondary-100">
                Gemini AI Image Editor
              </p>
              <div className="mt-4 flex space-x-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary-500"
                  animate={{ y: [-5, 0, -5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary-500"
                  animate={{ y: [-5, 0, -5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary-500"
                  animate={{ y: [-5, 0, -5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <motion.div
          className="w-full max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Canvas section */}
          <section className="mb-12">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-display font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                Gemini AI Image Editor
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-2xl text-center">
                Upload an image and transform it using natural language commands powered by Google's Gemini AI.
              </p>

              {/* Toggle view mode */}
              {currentImage && (
                <div className="mb-6 flex bg-white/50 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === '3d'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-secondary-700 hover:text-secondary-900'
                    }`}
                    onClick={() => setActiveTab('3d')}
                  >
                    3D View
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === 'flat'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-secondary-700 hover:text-secondary-900'
                    }`}
                    onClick={() => setActiveTab('flat')}
                  >
                    Flat View
                  </button>
                </div>
              )}

              {/* Canvas container */}
              <div className="w-full max-w-5xl aspect-video bg-gradient-to-br from-secondary-50/50 to-white/50 backdrop-blur-sm rounded-xl border border-white/50 shadow-xl overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {!currentImage ? (
                    <motion.div
                      key="uploader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                    >
                      <ImageUploader onImageUpload={handleImageUpload} hasImage={!!currentImage} />
                    </motion.div>
                  ) : activeTab === '3d' ? (
                    <motion.div
                      key="3d-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                    >
                      <Scene3D image={currentImage} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="flat-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex items-center justify-center p-8"
                    >
                      <img
                        src={currentImage}
                        alt="Processed"
                        className="max-w-full max-h-full object-contain"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls overlay */}
                {currentImage && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <motion.button
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-secondary-700 hover:text-primary-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setImage(null)}
                      title="Clear image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-secondary-700 hover:text-primary-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownload}
                      title="Download image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-secondary-700 hover:text-primary-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCommandSubmit('undo')}
                      title="Undo last change"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10h10a8 8 0 010 16h-1" />
                        <polyline points="3 6 3 10 7 10" />
                      </svg>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Image upload button (when image already exists) */}
              {currentImage && (
                <div className="mt-6">
                  <motion.label
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-secondary-200 rounded-lg shadow-sm text-secondary-900 hover:bg-secondary-50 transition-colors cursor-pointer flex items-center gap-2 text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Choose another image
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            handleImageUpload(ev.target.result);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </motion.label>
                </div>
              )}
            </div>
          </section>

          {/* Command section */}
          <section className="mb-12 flex justify-center">
            <CommandInterface onCommandSubmit={handleCommandSubmit} hasImage={!!currentImage} />
          </section>

          {/* Features section */}
          {!currentImage && (
            <section className="mt-12">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                  Edit images with AI using natural language
                </h2>
                <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
                  Our app lets you edit images using Google's Gemini AI. Just upload an image and describe the changes you want.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                  title="Smart Editing"
                  description="Describe what you want in plain text and let Gemini AI handle the complex editing work."
                  icon={(
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                      <path d="M20.83 11A10 10 0 0 0 12 2v10h8.83z" />
                    </svg>
                  )}
                />
                
                <FeatureCard
                  title="Style Transfer"
                  description="Transform your images into different artistic styles with a simple command."
                  icon={(
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  )}
                />
                
                <FeatureCard
                  title="Creative Effects"
                  description="Add effects, filters, and modifications using natural language commands."
                  icon={(
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                />
              </div>
            </section>
          )}
        </motion.div>
      </main>

      <Footer />
    </AppContainer>
  );
};

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

const FeatureCard = ({ title, description, icon }) => {
  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-6 shadow-lg"
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-secondary-900 mb-2">{title}</h3>
      <p className="text-secondary-600 text-sm">{description}</p>
    </motion.div>
  );
};

export default App;
