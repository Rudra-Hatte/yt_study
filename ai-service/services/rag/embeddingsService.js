const OpenAI = require('openai');
const natural = require('natural');
require('dotenv').config();

/**
 * EmbeddingsService - Handles generation and management of text embeddings for RAG
 */
class EmbeddingsService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = natural.WordTokenizer;
    
    // Cache for embeddings to avoid re-computation
    this.embeddingCache = new Map();
    
    console.log('🚀 EmbeddingsService initialized');
  }

  /**
   * Generate embeddings for text using OpenAI's text-embedding-3-small model
   * @param {string} text - Text to embed
   * @param {string} cacheKey - Optional cache key for the embedding
   * @returns {Promise<number[]>} Array of embedding values
   */
  async generateEmbedding(text, cacheKey = null) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Check cache first
    if (cacheKey && this.embeddingCache.has(cacheKey)) {
      console.log('📦 Retrieved embedding from cache:', cacheKey);
      return this.embeddingCache.get(cacheKey);
    }

    try {
      // Clean and prepare text
      const cleanedText = this.preprocessText(text);
      
      console.log('🔄 Generating embedding for text:', cleanedText.substring(0, 100) + '...');
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanedText,
        encoding_format: 'float'
      });

      const embedding = response.data[0].embedding;
      
      // Cache the embedding
      if (cacheKey) {
        this.embeddingCache.set(cacheKey, embedding);
      }

      console.log('✅ Generated embedding with dimension:', embedding.length);
      return embedding;

    } catch (error) {
      console.error('❌ Error generating embedding:', error.message);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param {Array<string>} texts - Array of texts to embed
   * @param {Array<string>} cacheKeys - Optional array of cache keys
   * @returns {Promise<Array<number[]>>} Array of embedding arrays
   */
  async generateBatchEmbeddings(texts, cacheKeys = []) {
    const embeddings = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const cacheKey = cacheKeys[i] || null;
      
      try {
        const embedding = await this.generateEmbedding(text, cacheKey);
        embeddings.push(embedding);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error generating embedding for text ${i}:`, error.message);
        // Push null or empty array for failed embeddings
        embeddings.push(null);
      }
    }
    
    console.log(`✅ Generated ${embeddings.filter(e => e !== null).length}/${texts.length} embeddings`);
    return embeddings;
  }

  /**
   * Preprocess text before embedding generation
   * @param {string} text - Raw text input
   * @returns {string} Cleaned and preprocessed text
   */
  preprocessText(text) {
    if (!text) return '';
    
    // Remove excessive whitespace and line breaks
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
    
    // Remove excessive punctuation
    cleaned = cleaned.replace(/[.]{2,}/g, '.');
    cleaned = cleaned.replace(/[!]{2,}/g, '!');
    cleaned = cleaned.replace(/[?]{2,}/g, '?');
    
    // Limit length for embedding (OpenAI has token limits)
    const maxLength = 8000; // Conservative limit
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength) + '...';
    }
    
    return cleaned;
  }

  /**
   * Create embeddings for different content types in the platform
   */
  async generateContentEmbeddings(content) {
    const embeddings = {};
    
    try {
      // Video content embedding
      if (content.transcript) {
        embeddings.transcript = await this.generateEmbedding(
          content.transcript, 
          `transcript_${content.videoId}`
        );
      }
      
      // Summary embedding
      if (content.summary) {
        embeddings.summary = await this.generateEmbedding(
          content.summary,
          `summary_${content.videoId}`
        );
      }
      
      // Key points embedding
      if (content.keyPoints && content.keyPoints.length > 0) {
        const keyPointsText = content.keyPoints.join(' ');
        embeddings.keyPoints = await this.generateEmbedding(
          keyPointsText,
          `keypoints_${content.videoId}`
        );
      }
      
      // Title and description embedding
      const titleDescription = `${content.title} ${content.description || ''}`;
      embeddings.titleDescription = await this.generateEmbedding(
        titleDescription,
        `title_desc_${content.videoId}`
      );
      
      // Flashcard content embedding (if available)
      if (content.flashcards && content.flashcards.length > 0) {
        const flashcardText = content.flashcards.map(fc => `${fc.front} ${fc.back}`).join(' ');
        embeddings.flashcards = await this.generateEmbedding(
          flashcardText,
          `flashcards_${content.videoId}`
        );
      }
      
      console.log(`✅ Generated embeddings for content types:`, Object.keys(embeddings));
      return embeddings;
      
    } catch (error) {
      console.error('❌ Error generating content embeddings:', error.message);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param {number[]} embedding1 - First embedding vector
   * @param {number[]} embedding2 - Second embedding vector  
   * @returns {number} Similarity score between -1 and 1
   */
  calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      normA += embedding1[i] * embedding1[i];
      normB += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find most similar embeddings to a query embedding
   * @param {number[]} queryEmbedding - The query embedding vector
   * @param {Array} candidateEmbeddings - Array of {id, embedding, metadata} objects
   * @param {number} topK - Number of top results to return
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array} Array of similar embeddings with scores
   */
  findSimilar(queryEmbedding, candidateEmbeddings, topK = 5, threshold = 0.7) {
    const similarities = candidateEmbeddings
      .map((candidate, index) => ({
        ...candidate,
        similarity: this.calculateSimilarity(queryEmbedding, candidate.embedding),
        index
      }))
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`🔍 Found ${similarities.length} similar embeddings above threshold ${threshold}`);
    return similarities;
  }

  /**
   * Clear embedding cache
   */
  clearCache() {
    this.embeddingCache.clear();
    console.log('🧹 Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.embeddingCache.size,
      keys: Array.from(this.embeddingCache.keys())
    };
  }
}

module.exports = EmbeddingsService;