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
  }
}, {
  timestamps: true
});

videoSchema.index({ youtubeId: 1 });
videoSchema.index({ courseId: 1, order: 1 });
videoSchema.index({ 'aiAnalysis.topics': 1 });
videoSchema.index({ difficulty: 1 });
videoSchema.index({ 'qualityMetrics.transcriptQuality': 1 });

module.exports = mongoose.model('Video', videoSchema);