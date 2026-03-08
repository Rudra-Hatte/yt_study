const KnowledgeBase = require('./rag/knowledgeBase');
const EmbeddingsService = require('./rag/embeddingsService');
const VectorStore = require('./rag/vectorStore');

/**
 * RAGService - Main service for Retrieval-Augmented Generation
 * This is the primary interface for all RAG operations in the application
 */
class RAGService {
  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.embeddingsService = new EmbeddingsService();
    this.vectorStore = new VectorStore();
    
    // Service state
    this.isInitialized = false;
    this.initializationPromise = null;
    
    console.log('🎯 RAGService initialized');
  }

  /**
   * Initialize the RAG service (lazy loading)
   */
  async initialize() {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      console.log('🚀 Initializing RAG Service...');
      
      // Verify OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required for RAG functionality');
      }
      
      // Test embeddings service
      await this.embeddingsService.generateEmbedding('test initialization');
      
      this.isInitialized = true;
      console.log('✅ RAG Service initialization complete');
      
    } catch (error) {
      console.error('❌ RAG Service initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Enhanced content generation methods that integrate RAG
   */

  /**
   * Generate enhanced summary using RAG context
   */
  async generateEnhancedSummary(videoId, title, transcript, options = {}) {
    await this.initialize();
    
    try {
      const { courseId, format = 'detailed' } = options;
      
      // Create base prompt for summary generation
      const basePrompt = `Generate a comprehensive educational summary for the video "${title}".`;
      
      // Retrieve relevant context from knowledge base
      const ragContext = await this.knowledgeBase.generateWithRAG(
        basePrompt,
        'summary',
        { videoId, courseId, maxContextLength: 2000 }
      );
      
      console.log(`🎯 Generated RAG-enhanced summary prompt for: ${title}`);
      
      return {
        enhancedPrompt: ragContext.enhancedPrompt,
        contextInfo: {
          sourcesUsed: ragContext.contextMetadata?.sources || [],
          contextCount: ragContext.contextMetadata?.returnedCount || 0,
          averageRelevance: ragContext.contextMetadata?.averageRelevance || 0
        },
        recommendations: ragContext.recommendations || []
      };
      
    } catch (error) {
      console.error('❌ Error generating enhanced summary:', error.message);
      // Fallback to original behavior
      return {
        enhancedPrompt: `Generate a comprehensive educational summary for the video "${title}".`,
        contextInfo: { sourcesUsed: [], contextCount: 0, averageRelevance: 0 },
        recommendations: ['RAG enhancement unavailable, using fallback']
      };
    }
  }

  /**
   * Generate enhanced quiz using RAG context
   */
  async generateEnhancedQuiz(videoId, title, transcript, options = {}) {
    await this.initialize();
    
    try {
      const { courseId, numQuestions = 5, difficulty = 'medium' } = options;
      
      const basePrompt = `Generate ${numQuestions} educational quiz questions at ${difficulty} difficulty level for the video "${title}".`;
      
      const ragContext = await this.knowledgeBase.generateWithRAG(
        basePrompt,
        'quiz',
        { videoId, courseId, maxContextLength: 3000 }
      );
      
      console.log(`🎯 Generated RAG-enhanced quiz prompt for: ${title}`);
      
      return {
        enhancedPrompt: ragContext.enhancedPrompt,
        contextInfo: {
          sourcesUsed: ragContext.contextMetadata?.sources || [],
          contextCount: ragContext.contextMetadata?.returnedCount || 0,
          averageRelevance: ragContext.contextMetadata?.averageRelevance || 0
        },
        recommendations: ragContext.recommendations || []
      };
      
    } catch (error) {
      console.error('❌ Error generating enhanced quiz:', error.message);
      return {
        enhancedPrompt: `Generate ${options.numQuestions || 5} educational quiz questions at ${options.difficulty || 'medium'} difficulty level for the video "${title}".`,
        contextInfo: { sourcesUsed: [], contextCount: 0, averageRelevance: 0 },
        recommendations: ['RAG enhancement unavailable, using fallback']
      };
    }
  }

  /**
   * Generate enhanced flashcards using RAG context
   */
  async generateEnhancedFlashcards(videoId, title, transcript, options = {}) {
    await this.initialize();
    
    try {
      const { courseId, numCards = 10 } = options;
      
      const basePrompt = `Generate ${numCards} educational flashcards for the video "${title}".`;
      
      const ragContext = await this.knowledgeBase.generateWithRAG(
        basePrompt,
        'flashcard',
        { videoId, courseId, maxContextLength: 2500 }
      );
      
      console.log(`🎯 Generated RAG-enhanced flashcards prompt for: ${title}`);
      
      return {
        enhancedPrompt: ragContext.enhancedPrompt,
        contextInfo: {
          sourcesUsed: ragContext.contextMetadata?.sources || [],
          contextCount: ragContext.contextMetadata?.returnedCount || 0,
          averageRelevance: ragContext.contextMetadata?.averageRelevance || 0
        },
        recommendations: ragContext.recommendations || []
      };
      
    } catch (error) {
      console.error('❌ Error generating enhanced flashcards:', error.message);
      return {
        enhancedPrompt: `Generate ${options.numCards || 10} educational flashcards for the video "${title}".`,
        contextInfo: { sourcesUsed: [], contextCount: 0, averageRelevance: 0 },
        recommendations: ['RAG enhancement unavailable, using fallback']
      };
    }
  }

  /**
   * Generate enhanced course structure using RAG context
   */
  async generateEnhancedCourseStructure(videoSummaries, courseTopic, options = {}) {
    await this.initialize();
    
    try {
      const { difficulty = 'intermediate' } = options;
      
      const basePrompt = `Generate a structured learning course outline for the topic "${courseTopic}" at ${difficulty} level.`;
      
      const ragContext = await this.knowledgeBase.generateWithRAG(
        basePrompt,
        'course',
        { courseId: courseTopic, maxContextLength: 3500 }
      );
      
      console.log(`🎯 Generated RAG-enhanced course structure prompt for: ${courseTopic}`);
      
      return {
        enhancedPrompt: ragContext.enhancedPrompt,
        contextInfo: {
          sourcesUsed: ragContext.contextMetadata?.sources || [],
          contextCount: ragContext.contextMetadata?.returnedCount || 0,
          averageRelevance: ragContext.contextMetadata?.averageRelevance || 0
        },
        recommendations: ragContext.recommendations || []
      };
      
    } catch (error) {
      console.error('❌ Error generating enhanced course structure:', error.message);
      return {
        enhancedPrompt: basePrompt,
        contextInfo: { sourcesUsed: [], contextCount: 0, averageRelevance: 0 },
        recommendations: ['RAG enhancement unavailable, using fallback']
      };
    }
  }

  /**
   * Enhanced chatbot responses using RAG
   */
  async generateEnhancedChatResponse(query, options = {}) {
    await this.initialize();
    
    try {
      const { courseId, conversationHistory = [] } = options;
      
      // Incorporate conversation history into the query context
      const contextualQuery = conversationHistory.length > 0 
        ? `${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}\nCurrent question: ${query}`
        : query;
      
      const ragContext = await this.knowledgeBase.generateWithRAG(
        contextualQuery,
        'chat',
        { courseId, maxContextLength: 3000 }
      );
      
      console.log(`🎯 Generated RAG-enhanced chat response for query: "${query.substring(0, 50)}..."`);
      
      return {
        enhancedPrompt: ragContext.enhancedPrompt,
        contextInfo: {
          sourcesUsed: ragContext.contextMetadata?.sources || [],
          contextCount: ragContext.contextMetadata?.returnedCount || 0,
          averageRelevance: ragContext.contextMetadata?.averageRelevance || 0
        },
        recommendations: ragContext.recommendations || [],
        relatedContent: await this.findRelatedContent(query, { courseId, maxResults: 3 })
      };
      
    } catch (error) {
      console.error('❌ Error generating enhanced chat response:', error.message);
      return {
        enhancedPrompt: query,
        contextInfo: { sourcesUsed: [], contextCount: 0, averageRelevance: 0 },
        recommendations: ['RAG enhancement unavailable, using fallback'],
        relatedContent: []
      };
    }
  }

  /**
   * Content indexing and knowledge base management
   */

  /**
   * Index video content for RAG retrieval
   */
  async indexVideoContent(videoData) {
    await this.initialize();
    
    try {
      console.log(`📚 Indexing video for RAG: ${videoData.title}`);
      
      const result = await this.knowledgeBase.indexVideoContent(videoData);
      
      console.log(`✅ Successfully indexed video: ${videoData.youtubeId || videoData.videoId}`);
      return result;
      
    } catch (error) {
      console.error('❌ Error indexing video content:', error.message);
      throw error;
    }
  }

  /**
   * Queue video for background indexing
   */
  async queueVideoForIndexing(videoData) {
    try {
      await this.knowledgeBase.queueForIndexing(videoData);
      console.log(`📋 Queued video for indexing: ${videoData.title}`);
    } catch (error) {
      console.error('❌ Error queueing video for indexing:', error.message);
    }
  }

  /**
   * Search and content discovery methods
   */

  /**
   * Search for content using semantic similarity
   */
  async searchContent(query, options = {}) {
    await this.initialize();
    
    try {
      const searchResults = await this.knowledgeBase.retrieveContext(query, {
        ...options,
        includeMetadata: true
      });
      
      return {
        query,
        results: searchResults.results,
        metadata: searchResults.metadata,
        formattedResults: this.formatSearchResults(searchResults.results)
      };
      
    } catch (error) {
      console.error('❌ Error searching content:', error.message);
      throw error;
    }
  }

  /**
   * Find related/similar content
   */
  async findRelatedContent(referenceContent, options = {}) {
    await this.initialize();
    
    try {
      const { maxResults = 5, threshold = 0.75 } = options;
      
      const similarContent = await this.knowledgeBase.findSimilarContent(
        referenceContent,
        { maxResults, threshold, ...options }
      );
      
      return this.formatSearchResults(similarContent);
      
    } catch (error) {
      console.error('❌ Error finding related content:', error.message);
      return [];
    }
  }

  /**
   * Recommend learning path based on user progress
   */
  async recommendLearningPath(userProgress, options = {}) {
    await this.initialize();
    
    try {
      const { courseId, difficulty, maxRecommendations = 5 } = options;
      
      // Create query based on user's learning history
      const progressQuery = this.createProgressBasedQuery(userProgress);
      
      const recommendations = await this.searchContent(progressQuery, {
        courseId,
        contentTypes: ['video', 'summary', 'keypoints'],
        maxResults: maxRecommendations * 2,
        threshold: 0.6
      });
      
      // Filter and rank recommendations based on user progress
      const rankedRecommendations = this.rankRecommendations(
        recommendations.results,
        userProgress,
        difficulty
      );
      
      return rankedRecommendations.slice(0, maxRecommendations);
      
    } catch (error) {
      console.error('❌ Error generating learning path recommendations:', error.message);
      return [];
    }
  }

  /**
   * Utility and management methods
   */

  /**
   * Get RAG service statistics
   */
  async getServiceStats() {
    try {
      const vectorStats = await this.knowledgeBase.getStats();
      
      return {
        isInitialized: this.isInitialized,
        vectorStore: vectorStats,
        embeddings: {
          cacheStats: this.embeddingsService.getCacheStats(),
          apiStatus: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting service stats:', error.message);
      throw error;
    }
  }

  /**
   * Clear all caches and reset service
   */
  async clearCaches() {
    try {
      this.knowledgeBase.clearCache();
      console.log('🧹 RAG Service caches cleared');
    } catch (error) {
      console.error('❌ Error clearing caches:', error.message);
    }
  }

  /**
   * Private utility methods
   */

  /**
   * Format search results for API consumption
   */
  formatSearchResults(results) {
    return results.map(result => ({
      id: result.id,
      type: result.contentType,
      title: result.sourceMetadata?.title || 'Untitled',
      content: result.content?.text?.substring(0, 200) + '...',
      relevance: result.similarity || result.combinedScore || 0,
      source: {
        id: result.sourceId,
        difficulty: result.sourceMetadata?.difficulty,
        tags: result.sourceMetadata?.tags || [],
        duration: result.sourceMetadata?.duration
      },
      quality: result.quality?.score || 0,
      metadata: {
        createdAt: result.createdAt,
        accessCount: result.accessCount || 0
      }
    }));
  }

  /**
   * Create search query based on user progress
   */
  createProgressBasedQuery(userProgress) {
    const completedTopics = userProgress.completedVideoTags || [];
    const currentLevel = userProgress.currentDifficulty || 'beginner';
    const learningGoals = userProgress.learningGoals || [];
    
    return [
      ...completedTopics,
      ...learningGoals,
      `${currentLevel} level`,
      'next steps',
      'advanced concepts'
    ].join(' ');
  }

  /**
   * Rank recommendations based on user progress and preferences
   */
  rankRecommendations(results, userProgress, targetDifficulty) {
    return results.map(result => {
      let score = result.similarity || result.combinedScore || 0;
      
      // Boost score for appropriate difficulty
      if (result.sourceMetadata?.difficulty === targetDifficulty) {
        score += 0.1;
      }
      
      // Boost score for new content (not in user's completed videos)
      const completedVideos = userProgress.completedVideoIds || [];
      if (!completedVideos.includes(result.sourceId)) {
        score += 0.05;
      }
      
      // Boost score for content matching user's interests
      const userTags = userProgress.preferredTags || [];
      const contentTags = result.sourceMetadata?.tags || [];
      const tagOverlap = contentTags.filter(tag => userTags.includes(tag)).length;
      score += tagOverlap * 0.02;
      
      return {
        ...result,
        recommendationScore: score
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  /**
   * Health check for RAG service dependencies
   */
  async healthCheck() {
    try {
      const checks = {
        initialized: this.isInitialized,
        openaiKey: !!process.env.OPENAI_API_KEY,
        embeddings: false,
        vectorStore: false
      };
      
      if (checks.openaiKey) {
        try {
          await this.embeddingsService.generateEmbedding('health check');
          checks.embeddings = true;
        } catch (error) {
          console.error('Embeddings health check failed:', error.message);
        }
      }
      
      try {
        await this.vectorStore.getStats();
        checks.vectorStore = true;
      } catch (error) {
        console.error('Vector store health check failed:', error.message);
      }
      
      const healthy = Object.values(checks).every(Boolean);
      
      return {
        healthy,
        checks,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ RAG Service health check failed:', error.message);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
let ragServiceInstance = null;

/**
 * Get the singleton RAG service instance
 */
function getRAGService() {
  if (!ragServiceInstance) {
    ragServiceInstance = new RAGService();
  }
  return ragServiceInstance;
}

module.exports = {
  RAGService,
  getRAGService
};