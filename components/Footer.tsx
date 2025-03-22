'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ModeToggle } from './ModeToggle';
import { ChevronUp, HeartIcon, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      ref={ref}
      className="w-full py-16 border-t dark:border-slate-800 bg-white dark:bg-slate-950"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <motion.div variants={itemVariants} className="flex flex-col space-y-4">
            <div className="flex items-center">
              <Image src="/ADAX.png" alt="addXmakeY logo" width={30} height={30} className="mr-2" />
              <span className="font-bold text-xl text-primary">addXmakeY</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and edit stunning images with the power of Gemini 2.0 AI
            </p>
            <div className="flex space-x-4 mt-2">
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#1DA1F2' }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={18} />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#E1306C' }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, color: '#0077B5' }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={18} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-4">
            <h3 className="font-semibold text-foreground">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#image-generation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Image Generation
                </Link>
              </li>
              <li>
                <Link href="#image-editing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Image Editing
                </Link>
              </li>
              <li>
                <Link href="#conversation-history" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Conversation History
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#documentation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#tutorials" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="#faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Have questions or suggestions? Get in touch with us.
            </p>
            <Link 
              href="mailto:contact@addxmakey.com" 
              className="text-sm text-primary hover:underline"
            >
              contact@addxmakey.com
            </Link>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="pt-8 border-t dark:border-slate-800 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm text-muted-foreground order-2 md:order-1 mt-4 md:mt-0">
            © {new Date().getFullYear()} addXmakeY. All rights reserved. Made with 
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="inline-block mx-1 text-red-500"
            >
              <HeartIcon size={14} />
            </motion.span> 
            by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">Khalid</span>
          </p>
          
          <div className="flex items-center space-x-4 order-1 md:order-2">
            <ModeToggle />
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-primary text-primary-foreground"
              aria-label="Scroll to top"
            >
              <ChevronUp size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}