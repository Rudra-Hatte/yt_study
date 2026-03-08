const EmbeddingsService = require('./embeddingsService');
const VectorStore = require('./vectorStore');
const natural = require('natural');

/**
 * KnowledgeBase - Main RAG service that orchestrates embeddings and retrieval
 */
class KnowledgeBase {
  constructor() {
    this.embeddingsService = new EmbeddingsService();
    this.vectorStore = new VectorStore();
    this.tokenizer = new natural.WordTokenizer();
    
    // Content indexing queue
    this.indexingQueue = [];
    this.isProcessingQueue = false;
    
    console.log('🧠 KnowledgeBase initialized');
  }

  /**
   * Index video content for RAG retrieval
   * @param {Object} videoData - Complete video data with transcript, summary, etc.
   * @returns {Promise<Object>} Indexing results
   */
  async indexVideoContent(videoData) {
    try {
      console.log(`📚 Indexing video content: ${videoData.title}`);
      
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
        flashcards = [],
        quizzes = []
      } = videoData;

      const results = [];
      const errors = [];

      // 1. Index raw transcript (if available)
      if (transcript && transcript.trim().length > 0) {
        try {
          const transcriptChunks = this.chunkText(transcript, 1000, 100);
          
          for (let i = 0; i < transcriptChunks.length; i++) {
            const chunk = transcriptChunks[i];
            const embedding = await this.embeddingsService.generateEmbedding(chunk.text);
            
            const vectorData = {
              id: `transcript_${youtubeId}_chunk_${i}`,
              contentType: 'transcript',
              sourceId: youtubeId,
              sourceMetadata: {
                title,
                description,
                tags,
                difficulty,
                duration,
                courseId,
                chunkIndex: i,
                totalChunks: transcriptChunks.length
              },
              embedding,
              content: {
                text: chunk.text,
                chunks: [{ 
                  text: chunk.text, 
                  startIndex: chunk.startIndex, 
                  endIndex: chunk.endIndex 
                }]
              },
              keywords: this.extractKeywords(chunk.text),
              concepts: this.extractConcepts(chunk.text),
              quality: this.assessContentQuality(chunk.text)
            };

            await this.vectorStore.storeVector(vectorData);
            results.push({ type: 'transcript_chunk', id: vectorData.id });
          }
        } catch (error) {
          console.error('❌ Error indexing transcript:', error.message);
          errors.push({ type: 'transcript', error: error.message });
        }
      }

      // 2. Index AI summary
      if (aiSummary && aiSummary.trim().length > 0) {
        try {
          const embedding = await this.embeddingsService.generateEmbedding(aiSummary);
          
          const vectorData = {
            id: `summary_${youtubeId}`,
            contentType: 'summary',
            sourceId: youtubeId,
            sourceMetadata: {
              title,
              description,
              tags,
              difficulty,
              duration,
              courseId
            },
            embedding,
            content: {
              text: aiSummary
            },
            keywords: this.extractKeywords(aiSummary),
            concepts: this.extractConcepts(aiSummary),
            quality: this.assessContentQuality(aiSummary)
          };

          await this.vectorStore.storeVector(vectorData);
          results.push({ type: 'summary', id: vectorData.id });
        } catch (error) {
          console.error('❌ Error indexing summary:', error.message);
          errors.push({ type: 'summary', error: error.message });
        }
      }

      // 3. Index key points
      if (keyPoints && keyPoints.length > 0) {
        try {
          const keyPointsText = keyPoints.join('. ');
          const embedding = await this.embeddingsService.generateEmbedding(keyPointsText);
          
          const vectorData = {
            id: `keypoints_${youtubeId}`,
            contentType: 'keypoints',
            sourceId: youtubeId,
            sourceMetadata: {
              title,
              description,
              tags,
              difficulty,
              duration,
              courseId,
              pointCount: keyPoints.length
            },
            embedding,
            content: {
              text: keyPointsText,
              chunks: keyPoints.map((point, index) => ({
                text: point,
                startIndex: index,
                endIndex: index
              }))
            },
            keywords: this.extractKeywords(keyPointsText),
            concepts: this.extractConcepts(keyPointsText),
            quality: this.assessContentQuality(keyPointsText)
          };

          await this.vectorStore.storeVector(vectorData);
          results.push({ type: 'keypoints', id: vectorData.id });
        } catch (error) {
          console.error('❌ Error indexing key points:', error.message);
          errors.push({ type: 'keypoints', error: error.message });
        }
      }

      // 4. Index flashcards (if available)
      if (flashcards && flashcards.length > 0) {
        try {
          const flashcardText = flashcards.map(fc => `${fc.front} ${fc.back}`).join(' ');
          const embedding = await this.embeddingsService.generateEmbedding(flashcardText);
          
          const vectorData = {
            id: `flashcards_${youtubeId}`,
            contentType: 'flashcard',
            sourceId: youtubeId,
            sourceMetadata: {
              title,
              description,
              tags,
              difficulty,
              duration,
              courseId,
              flashcardCount: flashcards.length
            },
            embedding,
            content: {
              text: flashcardText,
              chunks: flashcards.map((fc, index) => ({
                text: `${fc.front} ${fc.back}`,
                startIndex: index,
                endIndex: index,
                metadata: { front: fc.front, back: fc.back, tags: fc.tags }
              }))
            },
            keywords: this.extractKeywords(flashcardText),
            concepts: this.extractConcepts(flashcardText),
            quality: this.assessContentQuality(flashcardText)
          };

          await this.vectorStore.storeVector(vectorData);
          results.push({ type: 'flashcards', id: vectorData.id });
        } catch (error) {
          console.error('❌ Error indexing flashcards:', error.message);
          errors.push({ type: 'flashcards', error: error.message });
        }
      }

      // 5. Index title and description as overview
      try {
        const overviewText = `${title}. ${description || ''}`;
        const embedding = await this.embeddingsService.generateEmbedding(overviewText);
        
        const vectorData = {
          id: `overview_${youtubeId}`,
          contentType: 'video',
          sourceId: youtubeId,
          sourceMetadata: {
            title,
            description,
            tags,
            difficulty,
            duration,
            courseId
          },
          embedding,
          content: {
            text: overviewText
          },
          keywords: this.extractKeywords(overviewText),
          concepts: this.extractConcepts(overviewText),
          quality: this.assessContentQuality(overviewText)
        };

        await this.vectorStore.storeVector(vectorData);
        results.push({ type: 'overview', id: vectorData.id });
      } catch (error) {
        console.error('❌ Error indexing overview:', error.message);
        errors.push({ type: 'overview', error: error.message });
      }

      console.log(`✅ Indexed video ${youtubeId}: ${results.length} vectors created, ${errors.length} errors`);
      
      return {
        success: true,
        videoId: youtubeId,
        indexedItems: results,
        errors,
        stats: {
          totalVectors: results.length,
          successfulIndexes: results.length,
          failedIndexes: errors.length
        }
      };

    } catch (error) {
      console.error('❌ Error indexing video content:', error.message);
      throw error;
    }
  }

  /**
   * Retrieve relevant context for a query using RAG
   * @param {string} query - User query or prompt
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Retrieved context and metadata
   */
  async retrieveContext(query, options = {}) {
    try {
      console.log(`🔍 Retrieving context for query: "${query.substring(0, 100)}..."`);
      
      const {
        courseId = null,
        contentTypes = ['transcript', 'summary', 'keypoints', 'video'],
        maxResults = 10,
        threshold = 0.65,
        includeMetadata = true,
        diversityWeight = 0.3 // Weight for diversity in results
      } = options;

      // Perform hybrid search
      const searchOptions = {
        contentTypes,
        courseId,
        limit: maxResults * 2, // Get more candidates for diversity filtering
        threshold,
        includeContent: true
      };

      const searchResults = await this.vectorStore.hybridSearch(query, searchOptions);
      
      // Apply diversity filtering to avoid redundant results
      const diverseResults = this.applyDiversityFilter(searchResults, maxResults, diversityWeight);
      
      // Format context for consumption by AI models
      const context = this.formatRetrievedContext(diverseResults, includeMetadata);
      
      console.log(`✅ Retrieved ${diverseResults.length} relevant context items`);
      
      return {
        query,
        context,
        results: diverseResults,
        metadata: {
          totalFound: searchResults.length,
          returnedCount: diverseResults.length,
          averageRelevance: diverseResults.length > 0 
            ? diverseResults.reduce((sum, r) => sum + (r.similarity || r.combinedScore || 0), 0) / diverseResults.length 
            : 0,
          contentTypes: [...new Set(diverseResults.map(r => r.contentType))],
          sources: [...new Set(diverseResults.map(r => r.sourceId))]
        }
      };

    } catch (error) {
      console.error('❌ Error retrieving context:', error.message);
      throw error;
    }
  }

  /**
   * Generate enhanced content using RAG-retrieved context
   * @param {string} prompt - Original prompt
   * @param {string} contentType - Type of content to generate
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Enhanced generation result
   */
  async generateWithRAG(prompt, contentType, options = {}) {
    try {
      const {
        videoId = null,
        courseId = null,
        maxContextLength = 4000,
        contextWeight = 0.7
      } = options;

      // Retrieve relevant context
      const contextOptions = {
        courseId,
        contentTypes: this.getRelevantContentTypes(contentType),
        maxResults: 8,
        threshold: 0.6
      };

      const retrieved = await this.retrieveContext(prompt, contextOptions);
      
      // Format enhanced prompt with context
      const enhancedPrompt = this.createEnhancedPrompt(
        prompt, 
        retrieved.context, 
        contentType,
        maxContextLength
      );
      
      console.log(`🚀 Generated RAG-enhanced prompt for ${contentType}`);
      
      return {
        originalPrompt: prompt,
        enhancedPrompt,
        contextUsed: retrieved.context,
        contextMetadata: retrieved.metadata,
        recommendations: this.generateContextRecommendations(retrieved.results)
      };

    } catch (error) {
      console.error('❌ Error generating with RAG:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar content across the knowledge base
   * @param {Object} referenceContent - Content to find similar items for
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Similar content items
   */
  async findSimilarContent(referenceContent, options = {}) {
    try {
      const {
        contentTypes = null,
        excludeSource = null,
        maxResults = 5,
        threshold = 0.75
      } = options;

      let queryText;
      if (typeof referenceContent === 'string') {
        queryText = referenceContent;
      } else {
        // Extract text from content object
        queryText = [
          referenceContent.title,
          referenceContent.description,
          referenceContent.summary,
          ...(referenceContent.keyPoints || [])
        ].filter(Boolean).join(' ');
      }

      const searchOptions = {
        contentTypes,
        limit: maxResults,
        threshold,
        includeContent: true
      };

      const results = await this.vectorStore.hybridSearch(queryText, searchOptions);
      
      // Filter out the reference source if specified
      const filteredResults = excludeSource 
        ? results.filter(r => r.sourceId !== excludeSource)
        : results;

      console.log(`🔗 Found ${filteredResults.length} similar content items`);
      return filteredResults;

    } catch (error) {
      console.error('❌ Error finding similar content:', error.message);
      throw error;
    }
  }

  /**
   * Add content to indexing queue for background processing
   */
  async queueForIndexing(videoData) {
    this.indexingQueue.push(videoData);
    console.log(`📋 Added to indexing queue: ${videoData.title} (Queue size: ${this.indexingQueue.length})`);
    
    // Start processing if not already running
    if (!this.isProcessingQueue) {
      this.processIndexingQueue();
    }
  }

  /**
   * Process the indexing queue in background
   */
  async processIndexingQueue() {
    if (this.isProcessingQueue || this.indexingQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`⚡ Starting to process indexing queue (${this.indexingQueue.length} items)`);

    while (this.indexingQueue.length > 0) {
      const videoData = this.indexingQueue.shift();
      
      try {
        await this.indexVideoContent(videoData);
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing queue item ${videoData.videoId}:`, error.message);
      }
    }

    this.isProcessingQueue = false;
    console.log('✅ Finished processing indexing queue');
  }

  /**
   * Utility Methods
   */

  /**
   * Chunk text into smaller segments with overlap
   */
  chunkText(text, chunkSize = 1000, overlap = 100) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunkText = text.substring(start, end);
      
      chunks.push({
        text: chunkText,
        startIndex: start,
        endIndex: end
      });
      
      start = end - overlap;
      if (start <= 0) start = end;
    }
    
    return chunks;
  }

  /**
   * Extract keywords from text using NLP
   */
  extractKeywords(text, maxKeywords = 10) {
    try {
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      const filteredTokens = tokens.filter(token => 
        token.length > 3 && 
        !/^\d+$/.test(token) && // Not just numbers
        !['this', 'that', 'with', 'from', 'they', 'have', 'were', 'been', 'said'].includes(token)
      );
      
      // Simple frequency analysis
      const frequency = {};
      filteredTokens.forEach(token => {
        frequency[token] = (frequency[token] || 0) + 1;
      });
      
      return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, maxKeywords)
        .map(([word]) => word);
        
    } catch (error) {
      console.error('Error extracting keywords:', error.message);
      return [];
    }
  }

  /**
   * Extract concepts from text (simple implementation)
   */
  extractConcepts(text, maxConcepts = 5) {
    try {
      // Look for potential concepts (capitalized words, technical terms)
      const conceptPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
      const matches = text.match(conceptPattern) || [];
      
      const uniqueConcepts = [...new Set(matches)]
        .filter(concept => concept.length > 3 && concept.length < 30)
        .slice(0, maxConcepts);
      
      return uniqueConcepts;
      
    } catch (error) {
      console.error('Error extracting concepts:', error.message);
      return [];
    }
  }

  /**
   * Assess content quality based on various factors
   */
  assessContentQuality(text) {
    try {
      const length = text.length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgSentenceLength = sentences.length > 0 ? length / sentences.length : 0;
      
      // Quality factors
      let qualityScore = 0.5; // Base score
      
      // Length factor (sweet spot around 200-2000 characters)
      if (length > 100 && length < 3000) qualityScore += 0.1;
      if (length > 500 && length < 2000) qualityScore += 0.1;
      
      // Sentence structure factor
      if (avgSentenceLength > 20 && avgSentenceLength < 150) qualityScore += 0.1;
      
      // Content diversity (presence of educational indicators)
      const educationalIndicators = ['learn', 'understand', 'concept', 'example', 'important', 'key'];
      const indicatorCount = educationalIndicators.filter(indicator => 
        text.toLowerCase().includes(indicator)
      ).length;
      qualityScore += Math.min(indicatorCount * 0.05, 0.2);
      
      return {
        score: Math.min(Math.max(qualityScore, 0), 1),
        confidence: length > 100 ? 0.8 : 0.4,
        relevance: 0.7 // Default relevance, can be improved with ML models
      };
      
    } catch (error) {
      console.error('Error assessing content quality:', error.message);
      return { score: 0.5, confidence: 0.5, relevance: 0.5 };
    }
  }

  /**
   * Apply diversity filtering to search results
   */
  applyDiversityFilter(results, maxResults, diversityWeight) {
    if (results.length <= maxResults) return results;
    
    const selected = [results[0]]; // Always include the top result
    
    for (let i = 1; i < results.length && selected.length < maxResults; i++) {
      const candidate = results[i];
      
      // Calculate diversity score (how different this is from already selected)
      let diversityScore = 1.0;
      
      for (const selectedItem of selected) {
        // Penalize if same content type
        if (candidate.contentType === selectedItem.contentType) {
          diversityScore -= 0.3;
        }
        
        // Penalize if same source
        if (candidate.sourceId === selectedItem.sourceId) {
          diversityScore -= 0.2;
        }
        
        // Penalize similar keywords
        const commonKeywords = candidate.keywords?.filter(k => 
          selectedItem.keywords?.includes(k)
        ).length || 0;
        diversityScore -= commonKeywords * 0.1;
      }
      
      // Combine similarity and diversity scores
      const combinedScore = (candidate.similarity || candidate.combinedScore || 0) * (1 - diversityWeight) + 
                          diversityScore * diversityWeight;
      
      candidate.combinedScore = combinedScore;
      
      if (diversityScore > 0.3) { // Minimum diversity threshold
        selected.push(candidate);
      }
    }
    
    return selected.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
  }

  /**
   * Format retrieved context for AI consumption
   */
  formatRetrievedContext(results, includeMetadata = true) {
    return results.map((result, index) => {
      const context = {
        index: index + 1,
        type: result.contentType,
        content: result.content?.text || '',
        relevance: result.similarity || result.combinedScore || 0
      };
      
      if (includeMetadata) {
        context.metadata = {
          source: result.sourceId,
          title: result.sourceMetadata?.title,
          difficulty: result.sourceMetadata?.difficulty,
          tags: result.sourceMetadata?.tags || [],
          quality: result.quality?.score || 0
        };
      }
      
      return context;
    });
  }

  /**
   * Create enhanced prompt with retrieved context
   */
  createEnhancedPrompt(originalPrompt, context, contentType, maxLength = 4000) {
    let enhancedPrompt = originalPrompt;
    
    if (context && context.length > 0) {
      const contextText = context
        .slice(0, Math.min(context.length, 5)) // Limit context items
        .map(item => `[${item.type.toUpperCase()}] ${item.content}`)
        .join('\n\n');
      
      // Truncate if too long
      const truncatedContext = contextText.length > maxLength 
        ? contextText.substring(0, maxLength) + '...'
        : contextText;
      
      enhancedPrompt = `Based on the following relevant educational content, ${originalPrompt}

RELEVANT CONTEXT:
${truncatedContext}

Please use this context to provide more accurate and comprehensive responses.`;
    }
    
    return enhancedPrompt;
  }

  /**
   * Get relevant content types for different generation types
   */
  getRelevantContentTypes(generationType) {
    const typeMapping = {
      'summary': ['transcript', 'summary', 'keypoints'],
      'quiz': ['transcript', 'keypoints', 'summary'],
      'flashcard': ['transcript', 'keypoints', 'summary', 'flashcard'],
      'course': ['summary', 'keypoints', 'video'],
      'chat': ['transcript', 'summary', 'keypoints', 'flashcard', 'video']
    };
    
    return typeMapping[generationType] || ['transcript', 'summary', 'keypoints', 'video'];
  }

  /**
   * Generate recommendations based on retrieved context
   */
  generateContextRecommendations(results) {
    const recommendations = [];
    
    if (results.length === 0) {
      recommendations.push('Consider adding more content to improve context retrieval');
    }
    
    if (results.length < 3) {
      recommendations.push('Limited relevant content found. Consider expanding the knowledge base');
    }
    
    const contentTypes = [...new Set(results.map(r => r.contentType))];
    if (contentTypes.length === 1) {
      recommendations.push('Consider diversifying content types for better context');
    }
    
    const avgQuality = results.reduce((sum, r) => sum + (r.quality?.score || 0), 0) / results.length;
    if (avgQuality < 0.6) {
      recommendations.push('Content quality could be improved for better results');
    }
    
    return recommendations;
  }

  /**
   * Get knowledge base statistics
   */
  async getStats() {
    return await this.vectorStore.getStats();
  }

  /**
   * Clear embeddings cache
   */
  clearCache() {
    this.embeddingsService.clearCache();
  }
}

module.exports = KnowledgeBase;