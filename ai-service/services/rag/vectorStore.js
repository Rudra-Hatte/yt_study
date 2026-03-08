const mongoose = require('mongoose');
const EmbeddingsService = require('./embeddingsService');

/**
 * VectorStore - Handles storage and retrieval of vector embeddings
 */
class VectorStore {
  constructor() {
    this.embeddingsService = new EmbeddingsService();
    this.initializeSchema();
    console.log('🗄️ VectorStore initialized');
  }

  /**
   * Initialize MongoDB schema for storing vectors
   */
  initializeSchema() {
    // Define the vector document schema
    const vectorSchema = new mongoose.Schema({
      // Identifiers
      id: { type: String, required: true, unique: true },
      contentType: { 
        type: String, 
        enum: ['video', 'transcript', 'summary', 'keypoints', 'flashcard', 'quiz', 'course'],
        required: true
      },
      
      // Source information
      sourceId: { type: String, required: true }, // videoId, courseId, etc.
      sourceMetadata: {
        title: String,
        description: String,
        tags: [String],
        difficulty: String,
        duration: Number,
        courseId: String,
        moduleId: String
      },
      
      // Vector data
      embedding: { 
        type: [Number], 
        required: true,
        validate: {
          validator: function(arr) {
            return arr && arr.length > 0;
          },
          message: 'Embedding must be a non-empty array'
        }
      },
      dimension: { type: Number, required: true },
      
      // Content being embedded
      content: {
        text: { type: String, required: true },
        chunks: [{
          text: String,
          startIndex: Number,
          endIndex: Number,
          embedding: [Number] // Optional chunk-level embeddings
        }]
      },
      
      // Search optimization
      searchableText: String, // Preprocessed text for text search fallback
      keywords: [String],
      concepts: [String],
      
      // Quality and relevance metrics
      quality: {
        score: { type: Number, default: 0.5, min: 0, max: 1 },
        confidence: { type: Number, default: 0.5, min: 0, max: 1 },
        relevance: { type: Number, default: 0.5, min: 0, max: 1 }
      },
      
      // Timestamps
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      lastAccessed: { type: Date, default: Date.now },
      accessCount: { type: Number, default: 0 }
    });

    // Create indexes for efficient querying
    vectorSchema.index({ contentType: 1, sourceId: 1 });
    vectorSchema.index({ sourceId: 1 });
    vectorSchema.index({ 'sourceMetadata.courseId': 1 });
    vectorSchema.index({ keywords: 1 });
    vectorSchema.index({ concepts: 1 });
    vectorSchema.index({ createdAt: -1 });
    vectorSchema.index({ 'quality.score': -1 });
    
    // Compound index for search optimization
    vectorSchema.index({ 
      contentType: 1, 
      'quality.score': -1, 
      createdAt: -1 
    });

    // Add pre-save middleware
    vectorSchema.pre('save', function(next) {
      this.updatedAt = new Date();
      // Update dimension based on embedding length
      if (this.embedding && this.embedding.length > 0) {
        this.dimension = this.embedding.length;
      }
      next();
    });

    // Only create the model if it doesn't exist
    this.VectorDocument = mongoose.models.VectorDocument || 
                           mongoose.model('VectorDocument', vectorSchema);
  }

  /**
   * Store a vector with its metadata
   */
  async storeVector(data) {
    try {
      const {
        id,
        contentType,
        sourceId,
        sourceMetadata,
        embedding,
        content,
        keywords = [],
        concepts = [],
        quality = { score: 0.5, confidence: 0.5, relevance: 0.5 }
      } = data;

      // Validate required fields
      if (!id || !contentType || !sourceId || !embedding || !content?.text) {
        throw new Error('Missing required fields for vector storage');
      }

      // Create searchable text
      const searchableText = this.createSearchableText(content.text, keywords, concepts);

      const vectorDoc = new this.VectorDocument({
        id,
        contentType,
        sourceId,
        sourceMetadata,
        embedding,
        dimension: embedding.length,
        content,
        searchableText,
        keywords,
        concepts,
        quality
      });

      await vectorDoc.save();
      console.log(`✅ Stored vector: ${id} (${contentType})`);
      return vectorDoc;

    } catch (error) {
      console.error('❌ Error storing vector:', error.message);
      throw error;
    }
  }

  /**
   * Store multiple vectors in batch
   */
  async storeBatchVectors(vectors) {
    const results = [];
    const errors = [];

    for (let i = 0; i < vectors.length; i++) {
      try {
        const result = await this.storeVector(vectors[i]);
        results.push(result);
      } catch (error) {
        console.error(`❌ Error storing vector ${i}:`, error.message);
        errors.push({ index: i, error: error.message });
      }
    }

    console.log(`📦 Batch storage complete: ${results.length}/${vectors.length} successful`);
    return { results, errors };
  }

  /**
   * Retrieve similar vectors using embedding similarity
   */
  async findSimilarVectors(queryEmbedding, options = {}) {
    try {
      const {
        contentTypes = null,
        sourceId = null,
        courseId = null,
        limit = 10,
        threshold = 0.7,
        includeContent = true,
        qualityMin = 0.3
      } = options;

      // Build the MongoDB aggregation pipeline
      const pipeline = [];

      // Match stage - filter by criteria
      const matchStage = {
        'quality.score': { $gte: qualityMin }
      };

      if (contentTypes && contentTypes.length > 0) {
        matchStage.contentType = { $in: contentTypes };
      }

      if (sourceId) {
        matchStage.sourceId = sourceId;
      }

      if (courseId) {
        matchStage['sourceMetadata.courseId'] = courseId;
      }

      pipeline.push({ $match: matchStage });

      // Add computed similarity field (cosine similarity approximation)
      // Note: This is a simplified approach. For better performance in production,
      // consider using specialized vector databases like Pinecone, Qdrant, or Weaviate
      pipeline.push({
        $addFields: {
          similarity: {
            $divide: [
              {
                $reduce: {
                  input: { $zip: { inputs: ["$embedding", queryEmbedding] } },
                  initialValue: 0,
                  in: {
                    $add: ["$$value", { $multiply: [{ $arrayElemAt: ["$$this", 0] }, { $arrayElemAt: ["$$this", 1] }] }]
                  }
                }
              },
              {
                $multiply: [
                  { $sqrt: { $sum: { $map: { input: "$embedding", as: "e", in: { $multiply: ["$$e", "$$e"] } } } } },
                  { $sqrt: { $sum: { $map: { input: queryEmbedding, as: "e", in: { $multiply: ["$$e", "$$e"] } } } } }
                ]
              }
            ]
          }
        }
      });

      // Filter by threshold
      pipeline.push({
        $match: {
          similarity: { $gte: threshold }
        }
      });

      // Sort by similarity (descending)
      pipeline.push({ $sort: { similarity: -1 } });

      // Limit results
      pipeline.push({ $limit: limit });

      // Project fields (exclude embedding if not needed to reduce bandwidth)
      const projectStage = {
        _id: 0,
        id: 1,
        contentType: 1,
        sourceId: 1,
        sourceMetadata: 1,
        dimension: 1,
        searchableText: 1,
        keywords: 1,
        concepts: 1,
        quality: 1,
        similarity: 1,
        createdAt: 1,
        accessCount: 1
      };

      if (includeContent) {
        projectStage.content = 1;
      }

      pipeline.push({ $project: projectStage });

      const results = await this.VectorDocument.aggregate(pipeline);

      // Update access statistics
      const resultIds = results.map(r => r.id);
      if (resultIds.length > 0) {
        await this.VectorDocument.updateMany(
          { id: { $in: resultIds } },
          { 
            $inc: { accessCount: 1 },
            $set: { lastAccessed: new Date() }
          }
        );
      }

      console.log(`🔍 Found ${results.length} similar vectors (threshold: ${threshold})`);
      return results;

    } catch (error) {
      console.error('❌ Error finding similar vectors:', error.message);
      throw error;
    }
  }

  /**
   * Hybrid search: combine vector similarity with text search
   */
  async hybridSearch(query, options = {}) {
    try {
      const {
        alpha = 0.7, // Weight for vector search (0.3 for text search)
        limit = 10,
        ...vectorOptions
      } = options;

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingsService.generateEmbedding(query);

      // Perform vector search
      const vectorResults = await this.findSimilarVectors(queryEmbedding, {
        ...vectorOptions,
        limit: Math.min(limit * 2, 50) // Get more candidates for re-ranking
      });

      // Perform text search as fallback/supplement
      const textResults = await this.textSearch(query, {
        ...vectorOptions,
        limit: Math.min(limit * 2, 50)
      });

      // Combine and re-rank results
      const combinedResults = this.combineSearchResults(
        vectorResults, 
        textResults, 
        alpha,
        limit
      );

      console.log(`🎯 Hybrid search returned ${combinedResults.length} results`);
      return combinedResults;

    } catch (error) {
      console.error('❌ Error in hybrid search:', error.message);
      throw error;
    }
  }

  /**
   * Text-based search as fallback
   */
  async textSearch(query, options = {}) {
    try {
      const {
        contentTypes = null,
        sourceId = null,
        courseId = null,
        limit = 10,
        qualityMin = 0.3
      } = options;

      const matchStage = {
        $text: { $search: query },
        'quality.score': { $gte: qualityMin }
      };

      if (contentTypes && contentTypes.length > 0) {
        matchStage.contentType = { $in: contentTypes };
      }

      if (sourceId) {
        matchStage.sourceId = sourceId;
      }

      if (courseId) {
        matchStage['sourceMetadata.courseId'] = courseId;
      }

      const results = await this.VectorDocument.find(matchStage)
        .select('-embedding') // Exclude embedding for performance
        .sort({ score: { $meta: 'textScore' }, 'quality.score': -1 })
        .limit(limit);

      console.log(`📝 Text search found ${results.length} results`);
      return results;

    } catch (error) {
      console.error('❌ Error in text search:', error.message);
      return []; // Return empty array if text search fails
    }
  }

  /**
   * Combine vector and text search results with weighted scoring
   */
  combineSearchResults(vectorResults, textResults, alpha, limit) {
    const resultMap = new Map();

    // Add vector results with vector scoring
    vectorResults.forEach((result, index) => {
      const score = alpha * result.similarity + (1 - alpha) * (1 - index / vectorResults.length);
      resultMap.set(result.id, {
        ...result,
        combinedScore: score,
        vectorRank: index + 1,
        textRank: null
      });
    });

    // Add text results and update scoring
    textResults.forEach((result, index) => {
      const textScore = 1 - index / textResults.length;
      
      if (resultMap.has(result.id)) {
        // Update existing result
        const existing = resultMap.get(result.id);
        existing.combinedScore = alpha * (existing.similarity || 0) + (1 - alpha) * textScore;
        existing.textRank = index + 1;
      } else {
        // Add new result
        resultMap.set(result.id, {
          ...result,
          combinedScore: (1 - alpha) * textScore,
          vectorRank: null,
          textRank: index + 1
        });
      }
    });

    // Sort by combined score and limit
    return Array.from(resultMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit);
  }

  /**
   * Create searchable text for MongoDB text search
   */
  createSearchableText(content, keywords, concepts) {
    const parts = [content];
    
    if (keywords && keywords.length > 0) {
      parts.push(keywords.join(' '));
    }
    
    if (concepts && concepts.length > 0) {
      parts.push(concepts.join(' '));
    }
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Update vector metadata
   */
  async updateVector(id, updates) {
    try {
      const result = await this.VectorDocument.findOneAndUpdate(
        { id },
        { 
          ...updates,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (result) {
        console.log(`✅ Updated vector: ${id}`);
      } else {
        console.log(`⚠️ Vector not found: ${id}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Error updating vector:', error.message);
      throw error;
    }
  }

  /**
   * Delete vector by ID
   */
  async deleteVector(id) {
    try {
      const result = await this.VectorDocument.findOneAndDelete({ id });
      
      if (result) {
        console.log(`🗑️ Deleted vector: ${id}`);
      } else {
        console.log(`⚠️ Vector not found for deletion: ${id}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Error deleting vector:', error.message);
      throw error;
    }
  }

  /**
   * Get vectors by source ID
   */
  async getVectorsBySource(sourceId, contentTypes = null) {
    try {
      const query = { sourceId };
      
      if (contentTypes && contentTypes.length > 0) {
        query.contentType = { $in: contentTypes };
      }

      const results = await this.VectorDocument.find(query)
        .select('-embedding')
        .sort({ createdAt: -1 });

      console.log(`📋 Found ${results.length} vectors for source: ${sourceId}`);
      return results;

    } catch (error) {
      console.error('❌ Error getting vectors by source:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics about stored vectors
   */
  async getStats() {
    try {
      const stats = await this.VectorDocument.aggregate([
        {
          $group: {
            _id: '$contentType',
            count: { $sum: 1 },
            avgQuality: { $avg: '$quality.score' },
            avgDimension: { $avg: '$dimension' },
            totalAccesses: { $sum: '$accessCount' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalVectors = await this.VectorDocument.countDocuments();
      
      console.log(`📊 Vector store contains ${totalVectors} vectors`);
      return {
        totalVectors,
        byContentType: stats,
        cacheStats: this.embeddingsService.getCacheStats()
      };

    } catch (error) {
      console.error('❌ Error getting vector store stats:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old or low-quality vectors
   */
  async cleanup(options = {}) {
    try {
      const {
        maxAge = 90, // days
        minQuality = 0.2,
        minAccess = 0,
        dryRun = true
      } = options;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);

      const query = {
        $or: [
          { 'quality.score': { $lt: minQuality } },
          { 
            accessCount: { $lte: minAccess },
            createdAt: { $lt: cutoffDate }
          }
        ]
      };

      if (dryRun) {
        const count = await this.VectorDocument.countDocuments(query);
        console.log(`🧹 Cleanup would remove ${count} vectors (dry run)`);
        return { removed: 0, wouldRemove: count };
      } else {
        const result = await this.VectorDocument.deleteMany(query);
        console.log(`🧹 Cleaned up ${result.deletedCount} vectors`);
        return { removed: result.deletedCount, wouldRemove: 0 };
      }

    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
      throw error;
    }
  }
}

module.exports = VectorStore;