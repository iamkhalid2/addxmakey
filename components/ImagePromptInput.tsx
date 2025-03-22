"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Sparkles, Send, Lightbulb, ArrowRight } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ImagePromptInputProps {
  onSubmit: (prompt: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

// Example prompts for inspiration
const EXAMPLE_PROMPTS = {
  generate: [
    "A surreal landscape with floating islands and waterfalls in the style of Studio Ghibli",
    "A futuristic cityscape at night with neon lights and flying cars",
    "An astronaut riding a unicorn through space with galaxies in the background",
    "A photorealistic portrait of a cybernetic being with glowing circuit patterns",
  ],
  edit: [
    "Change the background to a tropical beach at sunset",
    "Make the image look like an oil painting in the style of Monet",
    "Add a majestic dragon flying in the sky",
    "Apply a cyberpunk aesthetic with neon accents and a rainy atmosphere",
  ]
};

export function ImagePromptInput({
  onSubmit,
  isEditing,
  isLoading,
}: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [prompt]);
  
  // Update character count when prompt changes
  useEffect(() => {
    setCharacterCount(prompt.length);
  }, [prompt]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  // Handle example prompt selection
  const handleExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Set typing status for animation effects
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setIsTyping(true);
    
    // Clear typing status after a delay
    const timeoutId = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut" 
      }
    }
  };
  
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 },
    disabled: { 
      scale: 1, 
      opacity: 0.7 
    }
  };
  
  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Wand2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-base font-medium text-foreground">
              {isEditing ? "Edit Image" : "Create Image"}
            </h3>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span>Get inspired</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Example prompts</h4>
                <div className="grid gap-2">
                  {EXAMPLE_PROMPTS[isEditing ? 'edit' : 'generate'].map((example, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1.5 px-2 justify-start font-normal text-xs"
                      onClick={() => handleExamplePrompt(example)}
                    >
                      <ArrowRight className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      <span className="truncate text-left">{example}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="relative">
          <Textarea
            ref={textareaRef}
            id="prompt"
            className="min-h-[80px] resize-none pr-20 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm focus-visible:ring-primary"
            placeholder={
              isEditing
                ? "Describe how you want to modify this image..."
                : "Describe the image you want to create in detail..."
            }
            value={prompt}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim()) {
                handleSubmit(e);
              }
            }}
          />
          
          <div className="absolute bottom-2 right-3 flex items-center space-x-1 text-xs text-muted-foreground">
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1 mr-2"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-primary">Typing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <span>{characterCount}/1000</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            Enter
          </kbd>{" "}
          to submit
        </div>
      </div>
      
      <motion.div
        variants={buttonVariants}
        initial="idle"
        whileHover={!isLoading && prompt.trim() ? "hover" : "disabled"}
        whileTap={!isLoading && prompt.trim() ? "tap" : "disabled"}
      >
        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 shadow-md"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-opacity-20 border-t-white rounded-full" />
              Processing...
            </div>
          ) : (
            <>
              {isEditing ? (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Edit Image
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </>
          )}
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
              <div className="flex">
                <Lightbulb className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Pro tips for image editing:</p>
                  <ul className="list-disc list-inside mt-1 pl-1 text-xs space-y-1">
                    <li>Be specific about what you want to change</li>
                    <li>Mention colors, styles, and areas to modify</li>
                    <li>Try terms like "convert to", "change", or "transform"</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
