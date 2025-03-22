"use client";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { Upload as UploadIcon, Image as ImageIcon, X, FileIcon, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function ImageUpload({ onImageSelect, currentImage }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Update the selected file when the current image changes
  useEffect(() => {
    if (!currentImage) {
      setSelectedFile(null);
    }
  }, [currentImage]);

  const validateFile = (file: File) => {
    // Check file type
    if (!file.type.match('image/(jpeg|jpg|png|webp)')) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return false;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB');
      return false;
    }
    
    setError(null);
    return true;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      if (!validateFile(file)) return;
      
      setSelectedFile(file);
      setIsDragging(false);
      
      // Convert the file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const result = event.target.result as string;
          onImageSelect(result);
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setError("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => {
      setIsDragging(false);
      setError('Invalid file. Please check file type and size (max 10MB).');
    }
  });

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    onImageSelect("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const imageContainerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {!currentImage ? (
          <motion.div
            key="dropzone"
            exit={{ opacity: 0, y: -20 }}
            {...getRootProps()}
            className={`
              min-h-[220px] p-6 rounded-xl border-2 border-dashed
              transition-all duration-300 ease-in-out 
              ${error ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/20' : 
                isDragging || isDragActive ? 
                'border-primary bg-primary/5 scale-[1.02] shadow-lg' : 
                'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }
              cursor-pointer flex flex-col items-center justify-center gap-4
            `}
          >
            <input {...getInputProps()} />
            
            <motion.div
              variants={itemVariants}
              className={`w-16 h-16 rounded-full flex items-center justify-center
                ${error ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 
                  isDragging || isDragActive ? 'bg-primary/10 text-primary' : 
                  'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }
              `}
            >
              {error ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <UploadIcon className="w-8 h-8" />
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center space-y-1">
              {error ? (
                <p className="text-sm font-medium text-red-500">{error}</p>
              ) : (
                <>
                  <p className="text-lg font-medium text-foreground">
                    {isDragging || isDragActive ? "Drop your image here" : "Drop your image here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPEG, PNG and WebP (maximum 10MB)
                  </p>
                </>
              )}
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center mt-2"
            >
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-sm text-xs text-muted-foreground">
                Or paste an image from your clipboard
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            variants={imageContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-6 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-base font-medium truncate text-foreground">
                    {selectedFile?.name || "Current Image"}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile?.size ?? 0)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="rounded-full hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
            
            <motion.div 
              className="w-full overflow-hidden rounded-lg relative h-[320px] bg-slate-100 dark:bg-slate-900"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={currentImage}
                alt="Selected"
                fill
                className="object-contain"
                unoptimized // Since we're dealing with data URLs
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </motion.div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRemove}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Remove & Upload Different Image
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
