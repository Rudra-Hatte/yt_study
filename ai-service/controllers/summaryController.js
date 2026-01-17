const { generateSummary } = require('../services/gemini/summaryGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate summary from a video
exports.createSummary = async (req, res, next) => {
  try {
    const { videoId, format = 'detailed', title } = req.body;
    
    console.log('📄 Summary generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    // Get the video transcript
    console.log('📥 Fetching transcript...');
    const transcript = await getVideoTranscript(videoId);
    
    if (!transcript || transcript.length < 100) {
      console.error('❌ Transcript too short or unavailable');
      return res.status(400).json({ 
        success: false, 
        error: 'Unable to get sufficient transcript content. Video may not have captions available.' 
      });
    }
    
    console.log(`✅ Transcript fetched: ${transcript.length} characters`);
    
    // Generate summary
    console.log('🤖 Generating summary with Gemini...');
    const summary = await generateSummary(transcript, title || 'YouTube Video', format);
    
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