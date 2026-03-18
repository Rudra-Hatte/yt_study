const { generateFlashcards } = require('../services/model/flashcardGenerator');
const ragService = require('../services/rag/ragService');
const { buildFallbackFlashcards } = require('../services/model/localFallbackGenerator');
const { generateFlashcardsFromLink } = require('../services/model/linkOnlyGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate flashcards from a video
exports.createFlashcards = async (req, res, next) => {
  try {
    const { videoId, numCards = 10, title, useRag = true } = req.body;
    
    console.log('🃏 Flashcard generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    const safeTitle = title || `Video ${videoId}`;
    
    let flashcards;
    let transcript = null;
    const ragEnabled = String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false';

    if (useRag && ragEnabled) {
      try {
        await ragService.ensureIndexed(videoId, safeTitle);
        const ragResponse = await ragService.generateWithRAG({
          query: `Generate ${numCards} study flashcards for ${safeTitle}`,
          task: `Generate ${numCards} flashcards with front, back, and tags. Keep cards concrete and practical.`,
          schemaHint: '{"flashcards":[{"front":"...","back":"...","tags":["tag1","tag2"]}]}',
          temperature: 0.65,
          maxTokens: 2400,
          videoId
        });

        flashcards = { ...ragResponse.data, rag: ragResponse.rag };
      } catch (ragError) {
        console.warn('⚠️ RAG flashcard path failed, trying transcript extraction:', ragError.message);
      }
    }

    if (!flashcards) {
      // Try to extract transcript silently as fallback content source
      if (!transcript) {
        try {
          transcript = await getVideoTranscript(videoId);
          if (transcript && transcript.trim().length > 100) {
            console.log('✅ Transcript extracted, will use for generation');
          } else {
            transcript = null;
          }
        } catch (transcriptError) {
          console.log('ℹ️ Transcript extraction failed, will use title-only mode:', transcriptError.message);
          transcript = null;
        }
      }

      // Fallback: try standard generation with or without transcript
      console.log('🤖 Generating flashcards with standard fallback path...');
      try {
        flashcards = await generateFlashcards(videoId, safeTitle, numCards, transcript);
        flashcards.rag = { used: false, fallback: true, hasTranscript: !!transcript };
      } catch (modelError) {
        console.warn('⚠️ Standard flashcard generation failed, trying link-only fallback:', modelError.message);
        try {
          flashcards = await generateFlashcardsFromLink(videoId, safeTitle, numCards);
          flashcards.rag = { used: false, fallback: true, mode: 'link-only-model' };
        } catch (linkError) {
          console.warn('⚠️ Link-only flashcard generation failed, using local fallback:', linkError.message);
          flashcards = buildFallbackFlashcards(videoId, safeTitle, numCards);
          flashcards.rag = { used: false, fallback: true, mode: 'local' };
        }
      }
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