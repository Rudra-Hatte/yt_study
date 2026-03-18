const { generateFlashcards } = require('../services/model/flashcardGenerator');
const ragService = require('../services/rag/ragService');

// Generate flashcards from a video
exports.createFlashcards = async (req, res, next) => {
  try {
    const { videoId, numCards = 10, title, useRag = true } = req.body;
    
    console.log('🃏 Flashcard generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Video title is required' });
    }
    
    let flashcards;
    const ragEnabled = String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false';

    if (useRag && ragEnabled) {
      try {
        await ragService.ensureIndexed(videoId, title);
        const ragResponse = await ragService.generateWithRAG({
          query: `Generate ${numCards} study flashcards for ${title}`,
          task: `Generate ${numCards} flashcards with front, back, and tags. Keep cards concrete and practical.`,
          schemaHint: '{"flashcards":[{"front":"...","back":"...","tags":["tag1","tag2"]}]}',
          temperature: 0.65,
          maxTokens: 2400,
          videoId
        });

        flashcards = { ...ragResponse.data, rag: ragResponse.rag };
      } catch (ragError) {
        console.warn('⚠️ RAG flashcard path failed, using standard generation:', ragError.message);
      }
    }

    if (!flashcards) {
      // Fallback: existing behavior
      console.log('🤖 Generating flashcards with standard fallback path...');
      flashcards = await generateFlashcards(videoId, title, numCards);
      flashcards.rag = { used: false, fallback: true };
    }
    
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