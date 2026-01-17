const { generateSummary } = require('../services/gemini/summaryGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate summary from a video
exports.createSummary = async (req, res, next) => {
  try {
    const { videoId, transcript, format = 'detailed', title } = req.body;
    
    console.log('📄 Summary generation requested for video:', videoId);
    
    // Accept transcript from frontend (browser-extracted) or fall back to server extraction
    let videoTranscript = transcript;
    
    if (!videoTranscript) {
      console.log('📥 No transcript provided, attempting server-side extraction...');
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'Video ID or transcript is required' });
      }
      const { getVideoTranscript } = require('../utils/youtube');
      videoTranscript = await getVideoTranscript(videoId);
    } else {
      console.log('✅ Using browser-extracted transcript:', videoTranscript.length, 'characters');
    }
    
    if (!videoTranscript || videoTranscript.length < 100) {
      console.error('❌ Transcript too short or unavailable');
      return res.status(400).json({ 
        success: false, 
        error: 'Unable to get sufficient transcript content. Video may not have captions available.' 
      });
    }
    
    // Generate summary
    console.log('🤖 Generating summary with Gemini...');
    const summary = await generateSummary(videoTranscript, title || 'YouTube Video', format);
    
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