const Course = require('../models/Course');
const Video = require('../models/Video');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublic: true })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get course by ID
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'name avatar');
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if course is private and user is not the creator
    if (!course.isPublic && 
        (!req.user || req.user.id.toString() !== course.creator._id.toString())) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a course
exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, description, category, tags, thumbnail, isPublic, difficulty, videos, duration, isGenerated } = req.body;
  
  try {
    const newCourse = new Course({
      title,
      description,
      creator: req.user.id,
      category,
      topic: title, // Use title as topic for simpler courses
      tags: tags || [],
      thumbnail,
      isPublic: isPublic !== undefined ? isPublic : true,
      difficulty: difficulty || 'intermediate',
      videos: videos || [],
      duration: duration || '',
      totalLessons: videos ? videos.length : 0,
      isGenerated: isGenerated || false
    });
    
    const course = await newCourse.save();
    console.log(`✅ Course created: ${course.title} (ID: ${course._id})`);
    
    // Add course to user's created courses
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { createdCourses: course._id } }
    );
    
    res.json(course);
  } catch (err) {
    console.error('Error creating course:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  const { title, description, category, tags, thumbnail, isPublic, difficulty } = req.body;
  
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check ownership
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (tags) course.tags = tags;
    if (thumbnail) course.thumbnail = thumbnail;
    if (isPublic !== undefined) course.isPublic = isPublic;
    if (difficulty) course.difficulty = difficulty;
    
    await course.save();
    
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check ownership
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Delete all videos in the course
    await Video.deleteMany({ courseId: req.params.id });
    
    // Remove course from user's created courses
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { createdCourses: req.params.id } }
    );
    
    // Delete the course
    await course.remove();
    
    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get videos for a course
exports.getCourseVideos = async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.id })
      .sort({ order: 1 });
    
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Check if user is already enrolled
    const user = await User.findById(req.user.id);
    if (user.enrolledCourses.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Already enrolled in this course' });
    }
    
    // Add course to enrolled courses
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { enrolledCourses: req.params.id } }
    );
    
    // Increment enrollment count
    course.enrollments += 1;
    await course.save();
    
    res.json({ msg: 'Successfully enrolled' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Search courses
exports.searchCourses = async (req, res) => {
  const { query, category, difficulty } = req.query;
  
  try {
    let searchQuery = { isPublic: true };
    
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (difficulty) {
      searchQuery.difficulty = difficulty;
    }
    
    const courses = await Course.find(searchQuery)
      .populate('creator', 'name avatar')
      .sort({ score: { $meta: 'textScore' } });
    
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};