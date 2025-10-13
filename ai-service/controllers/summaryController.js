const { generateSummary } = require('../services/gemini/summaryGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate summary from a video
exports.createSummary = async (req, res, next) => {
  try {
    const { videoId, format = 'detailed', title } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    // Get the video transcript
    const transcript = await getVideoTranscript(videoId);
    
    if (!transcript || transcript.length < 100) {
      return res.status(400).json({ success: false, error: 'Unable to get sufficient transcript content' });
    }
    
    // Generate summary
    const summary = await generateSummary(transcript, title || 'YouTube Video', format);
    
    // Send response
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};