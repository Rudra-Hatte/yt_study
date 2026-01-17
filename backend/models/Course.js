const mongoose = require('mongoose');

// Module schema for structured learning paths
const moduleSchema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  estimatedDuration: {
    type: Number, // Duration in minutes
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  videos: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    orderInModule: {
      type: Number,
      default: 0
    },
    learningObjectives: [String],
    prerequisites: [String]
  }],
  learningOutcomes: [String],
  assessments: {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    flashcards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard'
    }]
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  enrollments: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  // Enhanced structure for methodology support
  topic: {
    type: String,
    required: true,
    index: true
  },
  
  // AI-generated course structure
  structure: {
    modules: [moduleSchema],
    totalDuration: {
      type: Number,
      default: 0
    },
    estimatedCompletionTime: {
      type: Number, // In hours
      default: 0
    },
    prerequisites: [String],
    learningOutcomes: [String]
  },
  
  // Learning path and progression data
  learningPath: {
    recommendedSequence: [Number], // Video indices in recommended order
    alternativeSequences: [{
      name: String,
      description: String,
      sequence: [Number]
    }]
  },
  
  // Conceptual framework from semantic analysis
  conceptualFramework: {
    concepts: [{
      name: String,
      description: String,
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      },
      prerequisites: [String],
      relatedConcepts: [String],
      videoReferences: [Number]
    }],
    semanticClusters: [{
      clusterName: String,
      concepts: [String],
      recommendedOrder: [Number]
    }]
  },
  
  // Generation metadata
  generationData: {
    methodology: {
      type: String,
      default: 'automated_youtube_curation'
    },
    sourceVideos: [{
      youtubeId: String,
      url: String,
      title: String,
      processed: {
        type: Boolean,
        default: false
      },
      transcriptQuality: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }],
    aiProcessingStats: {
      totalProcessingTime: Number, // milliseconds
      preprocessingTime: Number,
      structuringTime: Number,
      contentAnalysisTime: Number,
      assessmentGenerationTime: Number
    },
    qualityMetrics: {
      contentCoverage: {
        type: Number,
        min: 0,
        max: 1
      },
      conceptualCoherence: {
        type: Number,
        min: 0,
        max: 1
      },
      learningProgression: {
        type: Number,
        min: 0,
        max: 1
      }
    }
  }
}, {
  timestamps: true
});

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ creator: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ topic: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ 'structure.totalDuration': 1 });

module.exports = mongoose.model('Course', courseSchema);