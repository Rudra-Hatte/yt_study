const { generateSummary } = require('../services/gemini/summaryGenerator');

// Generate summary from a video
exports.createSummary = async (req, res, next) => {
  try {
    const { videoId, format = 'detailed', title } = req.body;
    
    console.log('📄 Summary generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Video title is required' });
    }
    
    // Generate summary using Groq AI (no transcript needed)
    console.log('🤖 Generating summary with Groq AI...');
    const summary = await generateSummary(videoId, title, format);
    
    console.log('✅ Summary generated successfully');
    
    // Send response
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('❌ Summary generation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate summary',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};