const { generateFlashcards } = require('../services/gemini/flashcardGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate flashcards from a video
exports.createFlashcards = async (req, res, next) => {
  try {
    const { videoId, numCards = 10, title } = req.body;
    
    console.log('🃏 Flashcard generation requested for video:', videoId);
    
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
    
    // Generate flashcards
    console.log('🤖 Generating flashcards with Gemini...');
    const flashcards = await generateFlashcards(transcript, title || 'YouTube Video', numCards);
    
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