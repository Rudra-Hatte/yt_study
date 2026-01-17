const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    safetySettings
  });
};

// Get Gemini Vision model
const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ 
    model: "gemini-pro-vision",
    safetySettings
  });
};

module.exports = {
  getGeminiModel,
  getGeminiVisionModel
};