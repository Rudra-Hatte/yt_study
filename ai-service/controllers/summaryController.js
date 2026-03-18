const { generateSummary } = require('../services/model/summaryGenerator');
const ragService = require('../services/rag/ragService');
const { buildFallbackSummary } = require('../services/model/localFallbackGenerator');
const { generateSummaryFromLink } = require('../services/model/linkOnlyGenerator');

// Generate summary from a video
exports.createSummary = async (req, res, next) => {
  try {
    const { videoId, format = 'detailed', title, useRag = true } = req.body;
    
    console.log('📄 Summary generation requested for video:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }
    
    const safeTitle = title || `Video ${videoId}`;
    
    let summary;
    const ragEnabled = String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false';

    if (useRag && ragEnabled) {
      try {
        await ragService.ensureIndexed(videoId, safeTitle);
        const ragResponse = await ragService.generateWithRAG({
          query: `Generate a ${format} learning summary for ${safeTitle}`,
          task: `Generate a ${format} summary with key points, main concepts, keywords, practical applications, next steps, and difficulty level.`,
          schemaHint: '{"summary":"...","mainConcepts":["..."],"keyPoints":["..."],"keywords":["..."],"practicalApplications":["..."],"nextSteps":["..."],"difficulty":"beginner|intermediate|advanced"}',
          temperature: 0.6,
          maxTokens: 2200,
          videoId
        });

        summary = { ...ragResponse.data, rag: ragResponse.rag };
      } catch (ragError) {
        console.warn('⚠️ RAG summary path failed, using standard generation:', ragError.message);
      }
    }

    if (!summary) {
      // Fallback: existing behavior
      console.log('🤖 Generating summary with standard fallback path...');
      try {
        summary = await generateSummary(videoId, safeTitle, format);
        summary.rag = { used: false, fallback: true };
      } catch (modelError) {
        console.warn('⚠️ Standard summary generation failed, trying link-only fallback:', modelError.message);
        try {
          summary = await generateSummaryFromLink(videoId, safeTitle, format);
          summary.rag = { used: false, fallback: true, mode: 'link-only-model' };
        } catch (linkError) {
          console.warn('⚠️ Link-only summary generation failed, using local fallback:', linkError.message);
          summary = buildFallbackSummary(videoId, safeTitle, format);
        }
      }
    }
    
    console.log('✅ Summary generated successfully');
    
    // Send response
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('❌ Summary generation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate summary',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};