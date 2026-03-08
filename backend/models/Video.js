const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  youtubeId: {
    type: String,
    required: true,
    unique: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  thumbnail: {
    type: String
  },
  
  // Enhanced transcript handling
  transcript: {
    raw: String,
    processed: {
      cleanedText: String,
      segments: [{
        text: String,
        sentenceCount: Number,
        wordCount: Number,
        topics: [String],
        type: {
          type: String,
          enum: ['example', 'definition', 'procedure', 'concept', 'summary', 'general']
        }
      }],
      metadata: {
        wordCount: Number,
        sentenceCount: Number,
        estimatedReadingTime: Number,
        primaryTopics: [String],
        contentComplexity: {
          score: Number,
          level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced']
          },
          avgWordLength: Number,
          avgSentenceLength: Number,
          technicalTerms: [String]
        }
      },
      processingStats: {
        artifactsRemoved: Number,
        segmentCount: Number,
        averageSegmentLength: Number
      }
    }
  },
  
  order: {
    type: Number,
    default: 0
  },
  tags: [String],
  
  // AI-generated content analysis (enhanced from existing fields)
  aiSummary: {
    type: String
  },
  keyPoints: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  // Additional AI analysis fields
  aiAnalysis: {
    topics: [String],
    concepts: [{
      name: String,
      description: String,
      importance: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    learningObjectives: [String],
    prerequisites: [String]
  },
  
  // Quality metrics for transcript and content
  qualityMetrics: {
    transcriptQuality: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    contentRelevance: {
      type: Number,
      min: 0,
      max: 1
    },
    educationalValue: {
      type: Number,
      min: 0,
      max: 1
    }
  },

  // RAG (Retrieval-Augmented Generation) fields
  ragData: {
    isIndexed: {
      type: Boolean,
      default: false
    },
    lastIndexed: Date,
    indexingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    vectorIds: [String], // IDs of vector embeddings in vector store
    embeddingsMetadata: {
      transcriptEmbedded: Boolean,
      summaryEmbedded: Boolean,
      keyPointsEmbedded: Boolean,
      flashcardsEmbedded: Boolean,
      overviewEmbedded: Boolean
    },
    searchMetadata: {
      extractedKeywords: [String],
      detectedConcepts: [String],
      contentQuality: {
        score: Number,
        confidence: Number,
        relevance: Number
      }
    },
    ragEnhancements: {
      summaryEnhanced: {
        type: Boolean,
        default: false
      },
      quizEnhanced: {
        type: Boolean,
        default: false
      },
      flashcardsEnhanced: {
        type: Boolean,
        default: false
      },
      lastEnhanced: Date
    }
  }
}, {
  timestamps: true
});

videoSchema.index({ youtubeId: 1 });
videoSchema.index({ courseId: 1, order: 1 });
videoSchema.index({ 'aiAnalysis.topics': 1 });
videoSchema.index({ difficulty: 1 });
videoSchema.index({ 'qualityMetrics.transcriptQuality': 1 });

// RAG-specific indexes
videoSchema.index({ 'ragData.isIndexed': 1 });
videoSchema.index({ 'ragData.indexingStatus': 1 });
videoSchema.index({ 'ragData.lastIndexed': -1 });
videoSchema.index({ 'ragData.searchMetadata.extractedKeywords': 1 });
videoSchema.index({ 'ragData.searchMetadata.detectedConcepts': 1 });

// Virtual for checking if video needs RAG indexing
videoSchema.virtual('needsRagIndexing').get(function() {
  return !this.ragData?.isIndexed || 
         this.ragData?.indexingStatus === 'failed' ||
         (this.updatedAt && this.ragData?.lastIndexed && 
          this.updatedAt > this.ragData.lastIndexed);
});

// Instance method to mark video as indexed
videoSchema.methods.markAsIndexed = function(vectorIds = [], metadata = {}) {
  this.ragData = this.ragData || {};
  this.ragData.isIndexed = true;
  this.ragData.lastIndexed = new Date();
  this.ragData.indexingStatus = 'completed';
  this.ragData.vectorIds = vectorIds;
  
  // Update embeddings metadata
  this.ragData.embeddingsMetadata = {
    transcriptEmbedded: !!metadata.transcriptEmbedded,
    summaryEmbedded: !!metadata.summaryEmbedded,
    keyPointsEmbedded: !!metadata.keyPointsEmbedded,
    flashcardsEmbedded: !!metadata.flashcardsEmbedded,
    overviewEmbedded: !!metadata.overviewEmbedded
  };
  
  return this.save();
};

// Instance method to mark indexing as failed
videoSchema.methods.markIndexingFailed = function(error = '') {
  this.ragData = this.ragData || {};
  this.ragData.isIndexed = false;
  this.ragData.indexingStatus = 'failed';
  this.ragData.indexingError = error;
  return this.save();
};

// Static method to get videos needing indexing
videoSchema.statics.getNeedingIndexing = function(limit = 20) {
  return this.find({
    $or: [
      { 'ragData.isIndexed': { $ne: true } },
      { 'ragData.indexingStatus': 'failed' },
      { 
        $expr: {
          $gt: ['$updatedAt', '$ragData.lastIndexed']
        }
      }
    ]
  }).limit(limit);
};

// Static method to get RAG statistics
videoSchema.statics.getRagStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        indexedVideos: {
          $sum: {
            $cond: [{ $eq: ['$ragData.isIndexed', true] }, 1, 0]
          }
        },
        pendingIndexing: {
          $sum: {
            $cond: [{ $eq: ['$ragData.indexingStatus', 'pending'] }, 1, 0]
          }
        },
        failedIndexing: {
          $sum: {
            $cond: [{ $eq: ['$ragData.indexingStatus', 'failed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Video', videoSchema);