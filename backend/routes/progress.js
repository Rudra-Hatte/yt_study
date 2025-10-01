const express = require('express');
const router = express.Router();
const { 
  getProgress, 
  updateProgress, 
  addBookmark, 
  getAllProgress,
  updateStudySession,
  updateRatings
} = require('../controllers/progressController');
const auth = require('../middleware/auth');

// Get all progress for a user
router.get('/', auth, getAllProgress);

// Get progress for a video
router.get('/:videoId', auth, getProgress);

// Update progress for a video
router.post('/:videoId', auth, updateProgress);

// Add a bookmark
router.post('/:videoId/bookmarks', auth, addBookmark);

// Update study session
router.post('/:videoId/sessions', auth, updateStudySession);

// Update ratings
router.post('/:videoId/ratings', auth, updateRatings);

module.exports = router;