"use client";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, MessageCircle, ZoomIn, ZoomOut, Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef } from "react";
import { HistoryItem, HistoryPart } from "@/lib/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ImageResultDisplayProps {
  imageUrl: string;
  description: string | null;
  onReset: () => void;
  conversationHistory?: HistoryItem[];
}

export function ImageResultDisplay({
  imageUrl,
  description,
  onReset,
  conversationHistory = [],
}: ImageResultDisplayProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle download functionality
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `addxmakey-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle zoom functionality
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.25, 3)); // Max zoom: 3x
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.25, 0.5)); // Min zoom: 0.5x
  };

  // Handle fullscreen toggling
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (isFullScreen) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  };

  // Copy image URL to clipboard
  const copyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Format timestamp for history display
  const formatTimestamp = (index: number) => {
    const minutesAgo = conversationHistory.length - index > 1 
      ? (conversationHistory.length - index) * 2 // Simulate time passing
      : 'Just now';
    return typeof minutesAgo === 'number' ? `${minutesAgo} min ago` : minutesAgo;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
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

  const historyItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Full screen image view */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
            onClick={toggleFullScreen}
          >
            <motion.div 
              className="relative max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Image
                src={imageUrl}
                alt="Generated"
                width={1200}
                height={1200}
                className="max-w-full max-h-[90vh] object-contain"
                unoptimized
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full"
                onClick={toggleFullScreen}
              >
                <Minimize2 className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image result header */}
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold flex items-center">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
            <Maximize2 className="w-4 h-4" />
          </div>
          Result
        </h2>
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
                {conversationHistory.length > 0 && (
                  <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {Math.floor(conversationHistory.length / 2)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-md overflow-y-auto">
              <SheetHeader className="pb-4">
                <SheetTitle>Conversation History</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pr-2">
                {conversationHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No history yet.</p>
                ) : (
                  conversationHistory.map((item, index) => (
                    <motion.div 
                      key={index} 
                      className={`p-4 rounded-lg ${
                        item.role === "user" 
                          ? "bg-slate-100 dark:bg-slate-800" 
                          : "bg-primary/5 dark:bg-primary/10"
                      }`}
                      custom={index}
                      variants={historyItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-xs font-medium ${
                            item.role === "user" 
                              ? "text-foreground" 
                              : "text-primary"
                          }`}
                        >
                          {item.role === "user" ? "You" : "AI"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(index)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {item.parts.map((part: HistoryPart, partIndex) => (
                          <div key={partIndex}>
                            {part.text && (
                              <p className="text-sm">{part.text}</p>
                            )}
                            {part.image && (
                              <div className="mt-2 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                                <Image
                                  src={part.image}
                                  alt={`${item.role} image`}
                                  width={320}
                                  height={320}
                                  className="w-full h-auto object-contain"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1 h-8"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1 h-8"
            onClick={copyImageUrl}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1 h-8"
            onClick={onReset}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
      </motion.div>

      {/* Image container with zoom controls */}
      <motion.div
        className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md"
        variants={itemVariants}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-white dark:bg-slate-900 rounded-lg shadow-md px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div 
          ref={imageContainerRef}
          className="overflow-auto relative h-[500px] p-4 flex items-center justify-center"
          style={{ cursor: zoomLevel > 1 ? 'move' : 'default' }}
        >
          <div
            className="transition-transform duration-200 ease-out"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={imageUrl}
                alt="Generated"
                width={800}
                height={800}
                className="max-w-full object-contain rounded-md"
                unoptimized
                quality={100}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Description card */}
      {description && (
        <motion.div 
          className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <MessageCircle className="h-4 w-4 mr-2 text-primary" />
              AI Description
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={copyImageUrl}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </motion.div>
      )}
      
      {/* Action buttons */}
      <motion.div 
        className="pt-2 flex justify-center"
        variants={itemVariants}
      >
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onReset}
          className="rounded-full px-8"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Create New Image
        </Button>
      </motion.div>
    </motion.div>
  );
}
