import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HistoryItem } from "@/lib/types";

// Initialize the Google Gen AI client with your API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the model ID for Gemini 2.0 Flash experimental
const MODEL_ID = "gemini-2.0-flash-exp-image-generation";

export async function POST(req: NextRequest) {
  try {
    // Check request size before parsing
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (contentLength > maxSize) {
      return NextResponse.json(
        { error: "Request payload too large. Try starting a new conversation or using a smaller image." },
        { status: 413 }
      );
    }

    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Error parsing JSON request:", error);
      return NextResponse.json(
        { error: "Invalid JSON request format" },
        { status: 400 }
      );
    }

    const { prompt, image: inputImage, history } = requestData;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate and sanitize history before using it
    const sanitizedHistory = history?.map((item: HistoryItem) => {
      // Ensure item has required fields
      if (!item || typeof item.role !== 'string' || !Array.isArray(item.parts)) {
        return null;
      }

      // Filter out invalid parts
      const validParts = item.parts.filter(part => {
        return (part.text !== undefined && typeof part.text === 'string') ||
               (part.image !== undefined && typeof part.image === 'string');
      });

      if (validParts.length === 0) return null;

      return {
        role: item.role,
        parts: validParts
      };
    }).filter(Boolean);

    // Keep only last 2 valid interactions
    const limitedHistory = (sanitizedHistory || []).slice(-2);

    // Get the model with the correct configuration
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        // @ts-expect-error - Gemini API JS is missing this type
        responseModalities: ["Text", "Image"],
      },
    });

    let result;

    try {
      // Create a chat session with validated history
      const chat = model.startChat({
        history: limitedHistory || [],
      });

      // Prepare the current message parts
      const messageParts = [];

      // Add the text prompt
      if (prompt) {
        messageParts.push({ text: prompt });
      }

      // Add the image if provided
      if (inputImage) {
        console.log("Processing image edit request");
        
        try {
          // Validate image data
          if (!inputImage.startsWith("data:")) {
            throw new Error("Invalid image data URL format");
          }

          const imageParts = inputImage.split(",");
          if (imageParts.length < 2) {
            throw new Error("Invalid image data URL format");
          }

          const base64Image = imageParts[1];
          const mimeType = inputImage.includes("image/png") ? "image/png" : "image/jpeg";
          
          console.log("Base64 image length:", base64Image.length, "MIME type:", mimeType);

          messageParts.push({
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          });
        } catch (imageError) {
          console.error("Error processing image:", imageError);
          throw new Error(`Invalid image format: ${imageError.message}`);
        }
      }

      // Ensure we have valid message parts before sending
      if (messageParts.length === 0) {
        throw new Error("No valid message parts to send");
      }

      console.log("Sending message with", messageParts.length, "parts");
      result = await chat.sendMessage(messageParts);
      
      // Validate response structure
      if (!result?.response?.candidates?.[0]?.content?.parts) {
        throw new Error("Invalid response format from Gemini API");
      }

      const response = result.response;
      let textResponse = null;
      let imageData = null;
      let mimeType = "image/png";

      // Process the response
      const parts = response.candidates[0].content.parts;
      console.log("Number of parts in response:", parts.length);

      for (const part of parts) {
        if (part && "inlineData" in part && part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
          console.log("Image data received, length:", imageData.length, "MIME type:", mimeType);
        } else if (part && "text" in part && part.text) {
          textResponse = part.text;
          console.log("Text response received:", textResponse.substring(0, 50) + "...");
        }
      }

      // Return the processed response
      return NextResponse.json({
        image: imageData ? `data:${mimeType};base64,${imageData}` : null,
        description: textResponse,
      });

    } catch (error) {
      console.error("Error in chat.sendMessage:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
