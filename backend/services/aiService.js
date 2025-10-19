const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001/api/ai';

// Generate quiz from video
const generateQuiz = async (videoId, title, numQuestions = 5, difficulty = 'medium') => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/quiz`, {
      videoId,
      title,
      numQuestions,
      difficulty
    });
    return response.data;
  } catch (error) {
    console.error('AI Quiz generation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to generate quiz');
  }
};

// Generate flashcards from video
const generateFlashcards = async (videoId, title, numCards = 10) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/flashcards`, {
      videoId,
      title,
      numCards
    });
    return response.data;
  } catch (error) {
    console.error('AI Flashcard generation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to generate flashcards');
  }
};

// Generate summary from video
const generateSummary = async (videoId, title, format = 'detailed') => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/summary`, {
      videoId,
      title,
      format
    });
    return response.data;
  } catch (error) {
    console.error('AI Summary generation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to generate summary');
  }
};

// Get video recommendations
const getRecommendations = async (watchHistory, availableVideos, learningGoal = '') => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/recommend`, {
      watchHistory,
      availableVideos,
      learningGoal
    });
    return response.data;
  } catch (error) {
    console.error('AI Recommendation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to get recommendations');
  }
};

module.exports = {
  generateQuiz,
  generateFlashcards,
  generateSummary,
  getRecommendations
};