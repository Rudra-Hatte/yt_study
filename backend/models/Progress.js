const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  watchTime: {
    type: Number,
    default: 0
  },
  totalDuration: Number,
  watchPercentage: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  bookmarks: [{
    timestamp: Number,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  ratings: {
    difficulty: Number, // 1-5
    usefulness: Number, // 1-5
    clarity: Number // 1-5
  },
  studySessions: [{
    startTime: Date,
    endTime: Date,
    duration: Number,
    activity: {
      type: String,
      enum: ['watching', 'quiz', 'flashcards', 'notes']
    }
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

progressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);