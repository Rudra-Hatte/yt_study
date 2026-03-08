const { getRAGService } = require('../services/ragService');

/**
 * RAG Controller - Handles content indexing and retrieval operations
 */

/**
 * Index video content for RAG retrieval
 */
exports.indexVideoContent = async (req, res) => {
  try {
    const { 
      videoId, 
      youtubeId, 
      title, 
      description, 
      transcript, 
      aiSummary, 
      keyPoints, 
      difficulty, 
      tags, 
      duration, 
      courseId,
      flashcards,
      quizzes 
    } = req.body;

    console.log('📚 Video indexing requested for:', title);

    // Validate required fields
    if (!videoId && !youtubeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Video ID or YouTube ID is required' 
      });
    }

    if (!title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Video title is required' 
      });
    }

    // Prepare video data for indexing
    const videoData = {
      videoId: videoId || youtubeId,
      youtubeId: youtubeId || videoId,
      title,
      description,
      transcript,
      aiSummary,
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      difficulty: difficulty || 'intermediate',
      tags: Array.isArray(tags) ? tags : [],
      duration: duration || 0,
      courseId,
      flashcards: Array.isArray(flashcards) ? flashcards : [],
      quizzes: Array.isArray(quizzes) ? quizzes : []
    };

    // Index the content
    const ragService = getRAGService();
    const indexResult = await ragService.indexVideoContent(videoData);

    console.log('✅ Video indexed successfully');

    res.json({
      success: true,
      message: 'Video content indexed successfully',
      data: indexResult
    });

  } catch (error) {
    console.error('❌ Video indexing error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to index video content',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Queue video for background indexing
 */
exports.queueVideoForIndexing = async (req, res) => {
  try {
    const videoData = req.body;

    if (!videoData.title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Video title is required' 
      });
    }

    console.log('📋 Queueing video for indexing:', videoData.title);

    const ragService = getRAGService();
    await ragService.queueVideoForIndexing(videoData);

    res.json({
      success: true,
      message: 'Video queued for indexing',
      data: {
        title: videoData.title,
        status: 'queued'
      }
    });

  } catch (error) {
    console.error('❌ Video queueing error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to queue video for indexing'
    });
  }
};

/**
 * Search content using semantic similarity
 */
exports.searchContent = async (req, res) => {
  try {
    const { 
      query, 
      courseId, 
      contentTypes, 
      maxResults = 10, 
      threshold = 0.7,
      includeMetadata = true 
    } = req.body;

    console.log('🔍 Content search requested:', query?.substring(0, 100) + '...');

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }

    const searchOptions = {
      courseId,
      contentTypes: Array.isArray(contentTypes) ? contentTypes : undefined,
      maxResults: Math.min(maxResults, 50), // Limit max results
      threshold: Math.max(threshold, 0.3), // Minimum threshold
      includeMetadata
    };

    const ragService = getRAGService();
    const searchResults = await ragService.searchContent(query, searchOptions);

    console.log(`✅ Found ${searchResults.results.length} relevant results`);

    res.json({
      success: true,
      data: searchResults
    });

  } catch (error) {
    console.error('❌ Content search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search content'
    });
  }
};

/**
 * Find related/similar content
 */
exports.findRelatedContent = async (req, res) => {
  try {
    const { 
      referenceContent, 
      excludeSource, 
      courseId, 
      maxResults = 5, 
      threshold = 0.75,
      contentTypes 
    } = req.body;

    console.log('🔗 Related content search requested');

    if (!referenceContent) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reference content is required' 
      });
    }

    const searchOptions = {
      excludeSource,
      courseId,
      maxResults: Math.min(maxResults, 20),
      threshold: Math.max(threshold, 0.5),
      contentTypes: Array.isArray(contentTypes) ? contentTypes : undefined
    };

    const ragService = getRAGService();
    const relatedContent = await ragService.findRelatedContent(referenceContent, searchOptions);

    console.log(`✅ Found ${relatedContent.length} related items`);

    res.json({
      success: true,
      data: {
        relatedContent,
        count: relatedContent.length
      }
    });

  } catch (error) {
    console.error('❌ Related content search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to find related content'
    });
  }
};

/**
 * Generate learning path recommendations
 */
exports.recommendLearningPath = async (req, res) => {
  try {
    const { 
      userProgress, 
      courseId, 
      difficulty, 
      maxRecommendations = 5 
    } = req.body;

    console.log('🎯 Learning path recommendations requested');

    if (!userProgress) {
      return res.status(400).json({ 
        success: false, 
        error: 'User progress data is required' 
      });
    }

    const options = {
      courseId,
      difficulty,
      maxRecommendations: Math.min(maxRecommendations, 10)
    };

    const ragService = getRAGService();
    const recommendations = await ragService.recommendLearningPath(userProgress, options);

    console.log(`✅ Generated ${recommendations.length} learning recommendations`);

    res.json({
      success: true,
      data: {
        recommendations,
        userProgress,
        count: recommendations.length
      }
    });

  } catch (error) {
    console.error('❌ Learning path recommendation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate learning recommendations'
    });
  }
};

/**
 * Enhanced chat responses using RAG
 */
exports.enhancedChatResponse = async (req, res) => {
  try {
    const { 
      query, 
      courseId, 
      conversationHistory = [] 
    } = req.body;

    console.log('💬 Enhanced chat response requested');

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chat query is required' 
      });
    }

    const options = {
      courseId,
      conversationHistory: conversationHistory.slice(-5) // Limit history
    };

    const ragService = getRAGService();
    const enhancedResponse = await ragService.generateEnhancedChatResponse(query, options);

    console.log('✅ Generated enhanced chat response');

    res.json({
      success: true,
      data: enhancedResponse
    });

  } catch (error) {
    console.error('❌ Enhanced chat response error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate enhanced chat response'
    });
  }
};

/**
 * Get RAG service statistics
 */
exports.getServiceStats = async (req, res) => {
  try {
    console.log('📊 RAG service stats requested');

    const ragService = getRAGService();
    const stats = await ragService.getServiceStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Service stats error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve service statistics'
    });
  }
};

/**
 * Clear RAG service caches
 */
exports.clearCaches = async (req, res) => {
  try {
    console.log('🧹 Cache clearing requested');

    const ragService = getRAGService();
    await ragService.clearCaches();

    res.json({
      success: true,
      message: 'RAG service caches cleared successfully'
    });

  } catch (error) {
    console.error('❌ Cache clearing error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear caches'
    });
  }
};

/**
 * RAG service health check
 */
exports.healthCheck = async (req, res) => {
  try {
    console.log('🏥 RAG health check requested');

    const ragService = getRAGService();
    const healthStatus = await ragService.healthCheck();

    const statusCode = healthStatus.healthy ? 200 : 503;

    res.status(statusCode).json({
      success: healthStatus.healthy,
      data: healthStatus
    });

  } catch (error) {
    console.error('❌ Health check error:', error.message);
    res.status(503).json({
      success: false,
      error: error.message || 'Health check failed',
      healthy: false
    });
  }
};