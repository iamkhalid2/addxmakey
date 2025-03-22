'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModeToggle } from './ModeToggle';
import Image from 'next/image';
import Link from 'next/link';
import { GithubIcon, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Image 
                src="/ADAX.png" 
                alt="addXmakeY logo" 
                width={40} 
                height={40} 
                className="mr-2"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col"
            >
              <span className="font-bold text-xl text-primary">addXmakeY</span>
              <span className="text-xs text-muted-foreground">Powered by Gemini 2.0</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex items-center space-x-8"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="#features" className="text-foreground hover:text-primary transition-colors">
                Features
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link href="#examples" className="text-foreground hover:text-primary transition-colors">
                Examples
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="GitHub">
                <GithubIcon className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <ModeToggle />
            </motion.div>
          </motion.nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ModeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="relative z-20"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-white dark:bg-slate-950 z-10 md:hidden"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container mx-auto px-4 pt-20 pb-8 h-full flex flex-col">
              <nav className="flex flex-col space-y-6 text-center">
                <Link 
                  href="/" 
                  className="text-xl font-medium hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                <Link 
                  href="#features" 
                  className="text-xl font-medium hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Features
                </Link>
                <Link 
                  href="#examples" 
                  className="text-xl font-medium hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Examples
                </Link>
              </nav>
              <div className="mt-auto flex justify-center">
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="GitHub">
                  <GithubIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}