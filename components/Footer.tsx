'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visibility after component mounts for animation
    setIsVisible(true);
  }, []);

  return (
    <motion.footer 
      className="py-4 mt-8 text-center border-t dark:border-slate-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20 
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="text-slate-600 dark:text-slate-400 font-medium"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Made with <motion.span 
          className="text-red-500" 
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >⚡</motion.span> by <motion.span 
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold"
          whileHover={{ 
            backgroundImage: "linear-gradient(to right, #4f46e5, #f43f5e)",
          }}
        >Khalid</motion.span>
      </motion.div>
    </motion.footer>
  );
}