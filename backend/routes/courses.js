const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getCourses, 
  getCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCourseVideos,
  enrollCourse,
  searchCourses
} = require('../controllers/courseController');
const auth = require('../middleware/auth');

// Get all courses
router.get('/', getCourses);

// Search courses
router.get('/search', searchCourses);

// Get user's enrolled courses
router.get('/enrolled', auth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id).populate('enrolledCourses');
    res.json(user.enrolledCourses || []);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', getCourse);

// Create a course
router.post('/', [
  auth,
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty()
], createCourse);

// Update a course
router.put('/:id', auth, updateCourse);

// Delete a course
router.delete('/:id', auth, deleteCourse);

// Get videos for a course
router.get('/:id/videos', getCourseVideos);

// Enroll in a course
router.post('/:id/enroll', auth, enrollCourse);

module.exports = router;