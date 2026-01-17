const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  tags: [String],
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  lastReviewed: {
    type: Date
  },
  nextReviewDate: {
    type: Date
  },
  difficulty: {
    type: Number,
    min: 0,
    max: 5,
    default: 2.5
  },
  repetitions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

flashcardSchema.index({ userId: 1, videoId: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);