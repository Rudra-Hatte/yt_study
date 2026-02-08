const { generateQuiz } = require('../services/gemini/quizGenerator');

// Generate quiz questions from a video
exports.createQuiz = async (req, res, next) => {
  try {
    const { videoId, numQuestions = 10, difficulty = 'medium', title } = req.body;
    
    console.log('📝 Quiz generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    // Generate quiz by sending video URL to Gemini
    console.log('🤖 Sending video to Gemini for quiz generation...');
    const quiz = await generateQuiz(videoId, title || 'YouTube Video', numQuestions, difficulty);
    
    console.log('✅ Quiz generated successfully');
    
    // Send response
    res.json({ success: true, data: quiz });
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