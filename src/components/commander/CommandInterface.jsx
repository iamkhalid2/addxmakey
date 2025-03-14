import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const CommandItem = ({ command, index }) => {
  return (
    <motion.div
      className="flex items-start gap-3 text-sm mb-3 last:mb-0"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <span className="font-mono font-bold text-accent-400 mt-0.5">$</span>
      <div className="flex-1">
        <div className="font-mono text-secondary-100">{command.text}</div>
        {command.response && (
          <div className="mt-1.5 text-xs text-secondary-400 pl-1 border-l-2 border-secondary-800">
            {command.response}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CommandSuggestion = ({ suggestion, onClick }) => {
  return (
    <motion.button
      className="px-3 py-2 rounded-lg bg-secondary-800/50 hover:bg-secondary-700/50 text-sm text-secondary-300 font-mono transition-colors flex items-center gap-2"
      onClick={() => onClick(suggestion.command)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-primary-400">{suggestion.icon}</span>
      {suggestion.command}
    </motion.button>
  );
};

const CommandInterface = ({ onCommandSubmit, hasImage }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const commandInputRef = useRef(null);
  const historyContainerRef = useRef(null);
  
  // Updated suggestions for Gemini image editing
  const defaultSuggestions = [
    { icon: '🌈', command: 'make it more colorful' },
    { icon: '🎨', command: 'convert to cartoon style' },
    { icon: '🖼️', command: 'add a decorative frame' },
    { icon: '🌅', command: 'make it look like sunset' },
    { icon: '✏️', command: 'convert to pencil sketch' },
    { icon: '🔄', command: 'flip horizontally' }
  ];
  
  // Scroll to bottom of history when new commands are added
  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [history]);
  
  useEffect(() => {
    // Filter suggestions based on current command
    if (!command) {
      setSuggestions(defaultSuggestions);
    } else {
      const filtered = defaultSuggestions.filter(s => 
        s.command.toLowerCase().includes(command.toLowerCase())
      );
      setSuggestions(filtered);
    }
  }, [command]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!command.trim() || !hasImage) return;
    
    // Add command to history
    const newCommand = {
      id: Date.now(),
      text: command,
      timestamp: new Date()
    };
    
    setHistory([...history, newCommand]);
    setIsProcessing(true);
    
    // Process command via parent component
    onCommandSubmit(command)
      .then(result => {
        // Add response to the command
        setHistory(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            response: result.message || `Processed with Gemini AI: ${command}`
          };
          return updated;
        });
        setIsProcessing(false);
        setCommand('');
      })
      .catch(error => {
        // Handle error
        setHistory(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            response: `Error: ${error.message || 'Failed to process command'}`
          };
          return updated;
        });
        setIsProcessing(false);
      });
  };
  
  const handleSuggestionClick = (suggestionText) => {
    setCommand(suggestionText);
    commandInputRef.current?.focus();
  };
  
  const handleKeyDown = (e) => {
    // Update cursor position
    setTimeout(() => {
      if (commandInputRef.current) {
        setCursorPos(commandInputRef.current.selectionStart || 0);
      }
    }, 0);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-secondary-900 rounded-t-xl overflow-hidden">
        <div className="flex items-center px-4 py-3 bg-secondary-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-secondary-600" />
            <div className="w-3 h-3 rounded-full bg-secondary-600" />
            <div className="w-3 h-3 rounded-full bg-secondary-600" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-secondary-400">Gemini AI Image Editor</span>
          </div>
          <div className="w-12"></div> {/* Spacer for symmetry */}
        </div>
        
        <div 
          ref={historyContainerRef}
          className="p-4 h-56 overflow-y-auto scrollbar-thin"
        >
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-secondary-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 mb-2">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <p className="text-sm">Enter commands to edit your image with Gemini AI</p>
            </div>
          ) : (
            history.map((cmd, index) => (
              <CommandItem key={cmd.id} command={cmd} index={index} />
            ))
          )}
          
          {/* Processing indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-primary-500"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-primary-500"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-primary-500"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-xs text-secondary-500">Processing with Gemini AI...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="bg-secondary-800 p-4 rounded-b-xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-secondary-700 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary-500">
            <span className="text-primary-400 mr-3 font-mono">$</span>
            <input
              ref={commandInputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasImage ? "Describe how to edit the image..." : "Upload an image first..."}
              className="flex-1 bg-transparent text-secondary-100 placeholder:text-secondary-500 outline-none font-mono text-sm"
              disabled={!hasImage || isProcessing}
            />
            <motion.button
              type="submit"
              className="ml-2 p-1.5 rounded-md bg-primary-700 text-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!command.trim() || !hasImage || isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
          
          {/* Command cursor position indicator */}
          {command && (
            <div className="absolute left-0 bottom-full mb-1 text-xs text-secondary-500">
              <span className="font-mono">Position: {cursorPos}</span>
            </div>
          )}
        </form>
        
        {/* Command suggestions */}
        {hasImage && suggestions.length > 0 && !isProcessing && (
          <div className="mt-3">
            <div className="text-xs text-secondary-500 mb-2">Gemini AI Suggestions:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <CommandSuggestion 
                  key={index} 
                  suggestion={suggestion} 
                  onClick={handleSuggestionClick} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandInterface;