const { generateQuiz } = require('../services/gemini/quizGenerator');

// Generate quiz questions from a video
exports.createQuiz = async (req, res, next) => {
  try {
    const { videoId, numQuestions = 10, difficulty = 'medium', title, courseId, transcript, enableRAG = true } = req.body;
    
    console.log('📝 Quiz generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    // Generate RAG-enhanced quiz using Groq AI
    console.log('🤖 Generating RAG-enhanced quiz with Groq AI...');
    const quizOptions = {
      courseId,
      transcript,
      enableRAG
    };
    
    const quiz = await generateQuiz(videoId, title || 'YouTube Video', numQuestions, difficulty, quizOptions);
    
    console.log('✅ Quiz generated successfully');
    
    // Send response with RAG metadata
    res.json({ 
      success: true, 
      data: quiz,
      ragInfo: quiz.ragMetadata ? {
        enhanced: quiz.ragMetadata.enhanced,
        sourcesUsed: quiz.ragMetadata.sourcesUsed?.length || 0,
        contextCount: quiz.ragMetadata.contextCount || 0,
        recommendations: quiz.ragMetadata.recommendations
      } : null
    });
  } catch (error) {
    console.error('❌ Quiz generation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate quiz',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};