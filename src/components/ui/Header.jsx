import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const Header = () => {
  const headerRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Create subtle animation for the header background
    if (headerRef.current) {
      gsap.to(headerRef.current, {
        background: 'linear-gradient(90deg, rgba(7, 89, 133, 0.01) 0%, rgba(14, 165, 233, 0.02) 50%, rgba(7, 89, 133, 0.01) 100%)',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // Logo animation
    if (logoRef.current) {
      gsap.fromTo(logoRef.current, 
        { 
          rotationY: -10,
        }, 
        {
          rotationY: 10,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        }
      );
    }
  }, []);

  return (
    <motion.header
      ref={headerRef}
      className="w-full py-6 px-8 border-b border-secondary-200/10 backdrop-blur-md z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div ref={logoRef} className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-secondary-900 dark:text-secondary-100">PhotoScript</h1>
            <p className="text-xs text-secondary-600 dark:text-secondary-400">Image manipulation studio</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-500 transition-colors">About</a>
          <a href="#" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-500 transition-colors">Documentation</a>
          <a href="#" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-500 transition-colors">Examples</a>
          <a href="#" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-primary-500 transition-colors">API</a>
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 rounded-lg border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
          <motion.button
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;