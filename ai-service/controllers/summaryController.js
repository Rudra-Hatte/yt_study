const { generateSummary } = require('../services/gemini/summaryGenerator');

// Generate summary from a video
exports.createSummary = async (req, res, next) => {
  try {
    const { videoId, format = 'detailed', title, courseId, transcript, enableRAG = true } = req.body;
    
    console.log('📄 Summary generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Video title is required' });
    }
    
    // Generate RAG-enhanced summary using Groq AI
    console.log('🤖 Generating RAG-enhanced summary with Groq AI...');
    const summaryOptions = {
      courseId,
      transcript,
      enableRAG
    };
    
    const summary = await generateSummary(videoId, title, format, summaryOptions);
    
    console.log('✅ Summary generated successfully');
    
    // Send response with RAG metadata
    res.json({ 
      success: true, 
      data: summary,
      ragInfo: summary.ragMetadata ? {
        enhanced: summary.ragMetadata.enhanced,
        sourcesUsed: summary.ragMetadata.sourcesUsed?.length || 0,
        contextCount: summary.ragMetadata.contextCount || 0,
        recommendations: summary.ragMetadata.recommendations
      } : null
    });
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