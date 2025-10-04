const { curateVideos } = require('../services/gemini/videoCurator');

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