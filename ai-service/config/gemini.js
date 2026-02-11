const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const apiKeyRotator = require('./apiKeyRotator');

// Function to get a new Gemini AI instance with rotated key
const getGenAI = () => {
  const apiKey = apiKeyRotator.getGeminiKey();
  return new GoogleGenerativeAI(apiKey);
};

// For safety settings
const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// Get Gemini Pro model
const getGeminiModel = () => {
  const genAI = getGenAI();
  // Using gemini-2.0-flash model (gemini-pro was deprecated)
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    safetySettings
  });
};

// Get Gemini Vision model
const getGeminiVisionModel = () => {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({ 
    model: "gemini-pro-vision",
    safetySettings
  });
};

module.exports = {
  getGeminiModel,
  getGeminiVisionModel,
  apiKeyRotator
};