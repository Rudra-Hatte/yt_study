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
  
  // Simple videos array for generated courses
  videos: [{
    id: String,
    title: String,
    youtubeId: String,
    duration: String,
    description: String,
    completed: { type: Boolean, default: false },
    channelTitle: String,
    thumbnailUrl: String,
    order: Number
  }],
  
  // Duration of the course
  duration: String,
  
  // Total lessons count
  totalLessons: {
    type: Number,
    default: 0
  },
  
  // Is this an AI-generated course
  isGenerated: {
    type: Boolean,
    default: false
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
  },

  // RAG (Retrieval-Augmented Generation) fields
  ragData: {
    isIndexed: {
      type: Boolean,
      default: false
    },
    lastIndexed: Date,
    courseEmbeddingId: String, // ID of course overview embedding
    videoEmbeddingIds: [String], // IDs of all video embeddings in this course
    knowledgeGraph: {
      concepts: [{
        name: String,
        connections: [{
          concept: String,
          relationship: String,
          strength: Number // 0-1 confidence score
        }]
      }]
    },
    searchOptimization: {
      primaryTopics: [String],
      secondaryTopics: [String],
      skillsAddressed: [String],
      targetAudience: String
    },
    ragEnhancements: {
      courseStructureEnhanced: {
        type: Boolean,
        default: false
      },
      recommendationsEnhanced: {
        type: Boolean,
        default: false
      },
      lastEnhanced: Date
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

// RAG-specific indexes
courseSchema.index({ 'ragData.isIndexed': 1 });
courseSchema.index({ 'ragData.searchOptimization.primaryTopics': 1 });
courseSchema.index({ 'ragData.searchOptimization.skillsAddressed': 1 });
courseSchema.index({ 'ragData.lastIndexed': -1 });

// Instance method to update RAG data
courseSchema.methods.updateRagData = function(ragUpdateData) {
  this.ragData = this.ragData || {};
  Object.assign(this.ragData, ragUpdateData);
  this.ragData.lastIndexed = new Date();
  return this.save();
};

// Instance method to add concept to knowledge graph
courseSchema.methods.addConceptConnection = function(conceptName, connectedConcept, relationship, strength) {
  this.ragData = this.ragData || {};
  this.ragData.knowledgeGraph = this.ragData.knowledgeGraph || { concepts: [] };
  
  let concept = this.ragData.knowledgeGraph.concepts.find(c => c.name === conceptName);
  if (!concept) {
    concept = { name: conceptName, connections: [] };
    this.ragData.knowledgeGraph.concepts.push(concept);
  }
  
  // Add or update connection
  let connection = concept.connections.find(conn => conn.concept === connectedConcept);
  if (!connection) {
    concept.connections.push({
      concept: connectedConcept,
      relationship,
      strength
    });
  } else {
    connection.relationship = relationship;
    connection.strength = strength;
  }
  
  return this.save();
};

// Static method to find courses by topic similarity
courseSchema.statics.findSimilarByTopic = function(topics, limit = 10) {
  return this.find({
    $or: [
      { 'ragData.searchOptimization.primaryTopics': { $in: topics } },
      { 'ragData.searchOptimization.secondaryTopics': { $in: topics } },
      { tags: { $in: topics } }
    ]
  }).limit(limit);
};

module.exports = mongoose.model('Course', courseSchema);