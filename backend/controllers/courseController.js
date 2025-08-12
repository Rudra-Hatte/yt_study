const Course = require('../models/Course');
const Video = require('../models/Video');
const axios = require('axios');

// Get all public courses
const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, difficulty } = req.query;
    
    const filter = { isPublic: true, status: 'published' };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }

    const courses = await Course.find(filter)
      .populate('creator', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: error.message
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'username profile')
      .populate('videos')
      .populate('quizzes');

    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course with this ID does not exist'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      error: 'Failed to fetch course',
      message: error.message
    });
  }
};

// Create course from YouTube URL
const createCourseFromYoutube = async (req, res) => {
  try {
    const { youtubeUrl, title, description, category = 'other' } = req.body;

    if (!youtubeUrl || !title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'YouTube URL and title are required'
      });
    }

    // Extract video/playlist ID from URL
    const videoMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const playlistMatch = youtubeUrl.match(/[?&]list=([^&\n?#]+)/);

    if (!videoMatch && !playlistMatch) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid YouTube video or playlist URL'
      });
    }

    const sourceType = playlistMatch ? 'youtube_playlist' : 'youtube_video';
    
    // Create course
    const course = new Course({
      title,
      description: description || `Course created from YouTube ${sourceType.replace('youtube_', '')}`,
      sourceType,
      sourceUrl: youtubeUrl,
      creator: req.user._id,
      category,
      aiGenerated: true
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully! Processing video content...',
      data: { 
        course,
        processingStatus: 'started'
      }
    });

    // TODO: Process videos in background
    // processYouTubeContent(course._id, youtubeUrl, sourceType);

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      error: 'Failed to create course',
      message: error.message
    });
  }
};

// Get user's courses
const getUserCourses = async (req, res) => {
  try {
    const enrolledCourses = await Course.find({
      '_id': { $in: req.user.enrolledCourses.map(ec => ec.course) }
    }).populate('creator', 'username');

    const createdCourses = await Course.find({
      creator: req.user._id
    });

    res.json({
      success: true,
      data: {
        enrolled: enrolledCourses,
        created: createdCourses
      }
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch user courses',
      message: error.message
    });
  }
};

// Enroll in course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'Course does not exist'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = req.user.enrolledCourses.some(
      ec => ec.course.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }

    // Add to user's enrolled courses
    req.user.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      progress: 0
    });

    await req.user.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course!',
      data: { courseId }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      error: 'Failed to enroll in course',
      message: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourseFromYoutube,
  getUserCourses,
  enrollInCourse
};