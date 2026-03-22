const { generateQuiz } = require('../services/model/quizGenerator');
const ragService = require('../services/rag/ragService');
const { buildFallbackQuiz } = require('../services/model/localFallbackGenerator');
const { generateQuizFromLink } = require('../services/model/linkOnlyGenerator');
const { getVideoTranscript } = require('../utils/youtube');

// Generate quiz questions from a video
exports.createQuiz = async (req, res, next) => {
  try {
    const { videoId, numQuestions = 10, difficulty = 'medium', title, useRag = true, focusTopic } = req.body;
    
    console.log('Quiz generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    let quiz;
    let transcript = null;
    const ragEnabled = String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false';
    const topicFocus = String(focusTopic || '').trim();
    const shouldUseRag = useRag && ragEnabled && !topicFocus;

    if (shouldUseRag) {
      try {
        await ragService.ensureIndexed(videoId, title || 'YouTube Video');
        const ragResponse = await ragService.generateWithRAG({
          query: `Generate ${numQuestions} ${difficulty} quiz questions for ${title || 'YouTube Video'}`,
          task: `Generate ${numQuestions} multiple-choice questions with 4 options, correctAnswer index 0-3, and concise explanation.`,
          schemaHint: '{"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]}',
          temperature: 0.7,
          maxTokens: 2400,
          videoId
        });

        quiz = { ...ragResponse.data, rag: ragResponse.rag };
      } catch (ragError) {
        console.warn('RAG quiz path failed, trying transcript extraction:', ragError.message);
      }
    }

    if (!quiz) {
      // Try to extract transcript silently as fallback content source
      if (!transcript) {
        try {
          transcript = await getVideoTranscript(videoId);
          if (transcript && transcript.trim().length > 100) {
            console.log('Transcript extracted, will use for generation');
          } else {
            transcript = null;
          }
        } catch (transcriptError) {
          console.log('Transcript extraction failed, will use title-only mode:', transcriptError.message);
          transcript = null;
        }
      }

      // Fallback: generate from explicit topic when provided.
      console.log('Generating quiz with standard fallback path...');
      try {
        quiz = await generateQuiz(videoId, title || 'YouTube Video', numQuestions, difficulty, transcript, topicFocus || null);
        quiz.rag = { used: false, fallback: true, hasTranscript: !!transcript };
      } catch (modelError) {
        console.warn('Standard quiz generation failed, trying link-only fallback:', modelError.message);
        try {
          quiz = await generateQuizFromLink(videoId, title || 'YouTube Video', numQuestions, difficulty, topicFocus || null);
          quiz.rag = { used: false, fallback: true, mode: 'link-only-model' };
        } catch (linkError) {
          console.warn('Link-only quiz generation failed, using local fallback:', linkError.message);
          quiz = buildFallbackQuiz(videoId, title || 'YouTube Video', numQuestions, difficulty, topicFocus || null);
          quiz.rag = { used: false, fallback: true, mode: 'local' };
        }
      }
    }
    
    console.log('Quiz generated successfully');
    
    // Send response
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Quiz generation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate quiz',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};