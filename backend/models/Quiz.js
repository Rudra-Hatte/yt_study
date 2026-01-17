const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [String],
    correctAnswer: {
      type: Number,
      required: true
    },
    explanation: String
  }],
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

quizSchema.index({ videoId: 1 });

module.exports = mongoose.model('Quiz', quizSchema);