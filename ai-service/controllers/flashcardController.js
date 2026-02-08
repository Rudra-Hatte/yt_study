const { generateFlashcards } = require('../services/gemini/flashcardGenerator');

// Generate flashcards from a video
exports.createFlashcards = async (req, res, next) => {
  try {
    const { videoId, numCards = 10, title } = req.body;
    
    console.log('🃏 Flashcard generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Video title is required' });
    }
    
    // Generate flashcards using Groq AI (no transcript needed)
    console.log('🤖 Generating flashcards with Groq AI...');
    const flashcards = await generateFlashcards(videoId, title, numCards);
    
    console.log('✅ Flashcards generated successfully');
    
    // Send response
    res.json({ success: true, data: flashcards });
  } catch (error) {
    console.error('❌ Flashcard generation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate flashcards',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};