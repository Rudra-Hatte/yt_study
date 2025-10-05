const { generateQuiz } = require('../services/gemini/quizGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate quiz questions from a video
exports.createQuiz = async (req, res, next) => {
  try {
    const { videoId, numQuestions = 5, difficulty = 'medium', title } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    // Get the video transcript
    const transcript = await getVideoTranscript(videoId);
    
    if (!transcript || transcript.length < 100) {
      return res.status(400).json({ success: false, error: 'Unable to get sufficient transcript content' });
    }
    
    // Generate quiz questions
    const quiz = await generateQuiz(transcript, title || 'YouTube Video', numQuestions, difficulty);
    
    // Send response
    res.json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};