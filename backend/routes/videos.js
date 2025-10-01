const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getVideos, 
  getVideo, 
  createVideo, 
  updateVideo, 
  deleteVideo
} = require('../controllers/videoController');
const auth = require('../middleware/auth');

// Get all videos (admin only)
router.get('/', getVideos);

// Get video by ID
router.get('/:id', getVideo);

// Create a video
router.post('/', [
  auth,
  check('youtubeId', 'YouTube ID is required').not().isEmpty(),
  check('courseId', 'Course ID is required').not().isEmpty()
], createVideo);

// Update a video
router.put('/:id', auth, updateVideo);

// Delete a video
router.delete('/:id', auth, deleteVideo);

module.exports = router;