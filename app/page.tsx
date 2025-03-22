"use client";
import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePromptInput } from "@/components/ImagePromptInput";
import { ImageResultDisplay } from "@/components/ImageResultDisplay";
import { ImageIcon, Sparkles, ArrowRight, Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HistoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [activeSample, setActiveSample] = useState<number | null>(null);

  // Sample showcase images
  const showcaseExamples = [
    {
      before: "/samples/sample1-before.jpg",
      after: "/samples/sample1-after.jpg",
      prompt: "Transform this photo into a cyberpunk cityscape with neon lights"
    },
    {
      before: "/samples/sample2-before.jpg",
      after: "/samples/sample2-after.jpg",
      prompt: "Make this into a fantasy scene with magical elements and a dragon"
    },
    {
      before: "/samples/sample3-before.jpg",
      after: "/samples/sample3-after.jpg",
      prompt: "Convert to an oil painting in the style of Monet"
    }
  ];

  // Animate components after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleImageSelect = (imageData: string) => {
    setImage(imageData || null);
  };

  const handlePromptSubmit = async (prompt: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // If we have a generated image, use that for editing, otherwise use the uploaded image
      const imageToEdit = generatedImage || image;
      
      // Keep only the last interaction in history to prevent payload size issues
      const recentHistory = history.slice(-2);
      
      // Prepare the request data as JSON
      const requestData = {
        prompt,
        image: imageToEdit,
        history: recentHistory.length > 0 ? recentHistory : undefined,
      };
      
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to generate image";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          if (response.status === 413) {
            errorMessage = "Request too large. Try starting a new conversation.";
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (data.image) {
        // Update the generated image and description
        setGeneratedImage(data.image);
        setDescription(data.description || null);
        
        // Update history locally - add user message
        const userMessage: HistoryItem = {
          role: "user",
          parts: [
            { text: prompt },
            ...(imageToEdit ? [{ image: imageToEdit }] : []),
          ],
        };
        
        // Add AI response
        const aiResponse: HistoryItem = {
          role: "model",
          parts: [
            ...(data.description ? [{ text: data.description }] : []),
            ...(data.image ? [{ image: data.image }] : []),
          ],
        };
        
        // Update history with both messages
        setHistory((prevHistory) => [...prevHistory, userMessage, aiResponse]);
      } else {
        setError("No image returned from API");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error processing request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setGeneratedImage(null);
    setDescription(null);
    setLoading(false);
    setError(null);
    setHistory([]);
  };

  const scrollToApp = () => {
    const appSection = document.getElementById('app-section');
    if (appSection) {
      appSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If we have a generated image, we want to edit it next time
  const currentImage = generatedImage || image;
  const isEditing = !!currentImage;
  
  // Get the latest image to display (always the generated image)
  const displayImage = generatedImage;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + custom * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_40%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full opacity-30 dark:opacity-40 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.3),transparent_40%)]" />
        </div>

        <div className="container mx-auto max-w-7xl px-4">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6"
            >
              <Image src="/ADAX.png" alt="addXmakeY logo" width={120} height={120} priority />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              addXmakeY
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Create and transform images with the power of Gemini 2.0 AI.
              <span className="hidden md:inline"> Upload, generate, and edit with natural language prompts.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button 
                size="lg" 
                className="rounded-full px-8 gap-2"
                onClick={scrollToApp}
              >
                <Sparkles className="w-5 h-5" />
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </motion.div>
            
            <motion.div 
              className="relative w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Image 
                src="/app-preview.png" 
                alt="App Preview" 
                width={1200} 
                height={800}
                className="w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transform your creative process with our cutting-edge AI-powered tools
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ImageIcon className="w-12 h-12 text-primary" />,
                title: "Image Generation",
                description: "Create stunning images from detailed text descriptions using Google's Gemini 2.0 AI technology"
              },
              {
                icon: <Sparkles className="w-12 h-12 text-primary" />,
                title: "Image Editing",
                description: "Transform your existing images by describing the changes you want to make in natural language"
              },
              {
                icon: <Star className="w-12 h-12 text-primary" />,
                title: "Conversation History",
                description: "Keep track of your creative journey with a detailed history of prompts and generated images"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-300"
              >
                <div className="mb-4 bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore some examples of what our AI can do with these transformative examples
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300"
                onMouseEnter={() => setActiveSample(i)}
                onMouseLeave={() => setActiveSample(null)}
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.div 
                    className="absolute inset-0"
                    animate={{ 
                      opacity: activeSample === i ? 0 : 1
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image 
                      src={i === 0 ? "/samples/sample1-before.jpg" : 
                            i === 1 ? "/samples/sample2-before.jpg" : 
                            "/samples/sample3-before.jpg"} 
                      alt="Before" 
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0"
                    animate={{ 
                      opacity: activeSample === i ? 1 : 0
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image 
                      src={i === 0 ? "/samples/sample1-after.jpg" : 
                            i === 1 ? "/samples/sample2-after.jpg" : 
                            "/samples/sample3-after.jpg"} 
                      alt="After" 
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                    <p className="text-sm font-medium">
                      {activeSample === i ? "After" : "Before"}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-medium mb-2">
                    {i === 0 ? "Cyberpunk Transformation" : 
                     i === 1 ? "Fantasy Conversion" : 
                     "Artistic Style Transfer"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {i === 0 ? "Transform a cityscape into a futuristic cyberpunk scene" : 
                     i === 1 ? "Convert a landscape into a magical fantasy world" : 
                     "Apply the artistic style of famous painters to photos"}
                  </p>
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex items-center gap-1"
                      onClick={() => setActiveSample(activeSample === i ? null : i)}
                    >
                      {activeSample === i ? "View Original" : "See Result"}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Section */}
      <section id="app-section" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Create Your Image
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Upload an image or generate one from scratch using natural language prompts
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {showContent && (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Card className="border-0 bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 mb-6 text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 mr-2 flex-shrink-0 flex items-center justify-center rounded-full bg-red-200 dark:bg-red-800/30">
                            ⚠️
                          </div>
                          <p>{error}</p>
                        </div>
                      </motion.div>
                    )}

                    {!displayImage && !loading ? (
                      <>
                        <motion.div variants={itemVariants}>
                          <ImageUpload
                            onImageSelect={handleImageSelect}
                            currentImage={currentImage}
                          />
                        </motion.div>
                        <motion.div 
                          variants={itemVariants}
                          className="mt-8"
                        >
                          <ImagePromptInput
                            onSubmit={handlePromptSubmit}
                            isEditing={isEditing}
                            isLoading={loading}
                          />
                        </motion.div>
                      </>
                    ) : loading ? (
                      <motion.div
                        className="flex flex-col items-center justify-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="relative mb-6">
                          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-xl font-medium mb-2">Creating your masterpiece...</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          Our AI is processing your request. This may take a moment as we generate high-quality results.
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <ImageResultDisplay
                          imageUrl={displayImage || ""}
                          description={description}
                          onReset={handleReset}
                          conversationHistory={history}
                        />
                        <motion.div variants={itemVariants} className="mt-8">
                          <ImagePromptInput
                            onSubmit={handlePromptSubmit}
                            isEditing={true}
                            isLoading={loading}
                          />
                        </motion.div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 dark:bg-primary/10">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Images?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start creating amazing AI-generated images with just a few clicks
            </p>
            <Button 
              size="lg" 
              className="rounded-full px-8"
              onClick={scrollToApp}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
