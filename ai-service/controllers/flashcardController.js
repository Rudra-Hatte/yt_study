const { generateFlashcards } = require('../services/gemini/flashcardGenerator');

// Generate flashcards from a video
exports.createFlashcards = async (req, res, next) => {
  try {
    const { videoId, numCards = 10, title, courseId, transcript, enableRAG = true } = req.body;
    
    console.log('🃏 Flashcard generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Video title is required' });
    }
    
    // Generate RAG-enhanced flashcards using Groq AI
    console.log('🤖 Generating RAG-enhanced flashcards with Groq AI...');
    const flashcardOptions = {
      courseId,
      transcript,
      enableRAG
    };
    
    const flashcards = await generateFlashcards(videoId, title, numCards, flashcardOptions);
    
    console.log('✅ Flashcards generated successfully');
    
    // Send response with RAG metadata
    res.json({ 
      success: true, 
      data: flashcards,
      ragInfo: flashcards.ragMetadata ? {
        enhanced: flashcards.ragMetadata.enhanced,
        sourcesUsed: flashcards.ragMetadata.sourcesUsed?.length || 0,
        contextCount: flashcards.ragMetadata.contextCount || 0,
        recommendations: flashcards.ragMetadata.recommendations
      } : null
    });
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