const { generateFlashcards } = require('../services/gemini/flashcardGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate flashcards from a video
exports.createFlashcards = async (req, res, next) => {
  try {
    const { videoId, numCards = 10, title } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    // Get the video transcript
    const transcript = await getVideoTranscript(videoId);
    
    if (!transcript || transcript.length < 100) {
      return res.status(400).json({ success: false, error: 'Unable to get sufficient transcript content' });
    }
    
    // Generate flashcards
    const flashcards = await generateFlashcards(transcript, title || 'YouTube Video', numCards);
    
    // Send response
    res.json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
};