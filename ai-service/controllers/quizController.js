const { generateQuiz } = require('../services/model/quizGenerator');
const ragService = require('../services/rag/ragService');

// Generate quiz questions from a video
exports.createQuiz = async (req, res, next) => {
  try {
    const { videoId, numQuestions = 10, difficulty = 'medium', title, useRag = true } = req.body;
    
    console.log('📝 Quiz generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    let quiz;
    const ragEnabled = String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false';

    if (useRag && ragEnabled) {
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
        console.warn('⚠️ RAG quiz path failed, using standard generation:', ragError.message);
      }
    }

    if (!quiz) {
      // Fallback: existing behavior
      console.log('🤖 Generating quiz with standard fallback path...');
      quiz = await generateQuiz(videoId, title || 'YouTube Video', numQuestions, difficulty);
      quiz.rag = { used: false, fallback: true };
    }
    
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