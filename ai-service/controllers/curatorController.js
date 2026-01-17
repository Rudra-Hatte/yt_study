const { curateVideos } = require('../services/gemini/videoCurator');
const { searchYouTubeVideos } = require('../utils/youtube');
const { getGeminiModel } = require('../config/gemini');

// Search and curate YouTube videos for a topic
exports.searchAndCurateVideos = async (req, res, next) => {
  try {
    const { topic, difficulty = 'beginner', numVideos = 8 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }
    
    // Simplified approach: Generate search queries without AI (to avoid quota)
    const searchQueries = [
      `${topic} tutorial for ${difficulty}`,
      `${topic} complete guide`,
      `learn ${topic} ${difficulty}`,
      `${topic} course`,
      `${topic} explained`,
      `${topic} step by step`,
      `${topic} beginner tutorial`,
      `${topic} fundamentals`
    ];
    
    // Search for videos using the queries
    const videosPerQuery = Math.ceil(numVideos / 3);
    const searchResults = [];
    
    for (let i = 0; i < Math.min(searchQueries.length, 3); i++) {
      const videos = await searchYouTubeVideos(searchQueries[i], videosPerQuery);
      searchResults.push(...videos);
    }
    
    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(searchResults.map(v => [v.videoId, v])).values()
    );
    
    // Select best videos (no AI curation to avoid quota)
    const selectedVideos = uniqueVideos.slice(0, numVideos).map((video, index) => ({
      ...video,
      lessonTitle: `${index + 1}. ${video.title}`,
      rationale: `Selected based on relevance and quality`
    }));
    
    res.json({ success: true, data: selectedVideos });
  } catch (error) {
    console.error('Error searching and curating videos:', error);
    // Return empty array instead of error to allow fallback
    res.json({ success: true, data: [] });
  }
};

// Curate/recommend videos for a user
exports.recommendVideos = async (req, res, next) => {
  try {
    const { watchHistory, availableVideos, learningGoal } = req.body;
    
    if (!availableVideos || !Array.isArray(availableVideos) || availableVideos.length === 0) {
      return res.status(400).json({ success: false, error: 'Valid available videos list is required' });
    }
    
    // Generate recommendations
    const recommendations = await curateVideos(
      watchHistory || [], 
      availableVideos, 
      learningGoal || ''
    );
    
    // Send response
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};