const { generateQuiz } = require('../services/gemini/quizGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate quiz questions from a video
exports.createQuiz = async (req, res, next) => {
  try {
    const { videoId, numQuestions = 5, difficulty = 'medium', title } = req.body;
    
    console.log('📝 Quiz generation requested for video:', videoId);
    
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
    
    // Generate quiz questions
    console.log('🤖 Generating quiz with Gemini...');
    const quiz = await generateQuiz(transcript, title || 'YouTube Video', numQuestions, difficulty);
    
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