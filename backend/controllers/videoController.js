const Video = require('../models/Video');
const Course = require('../models/Course');
const { getYoutubeInfo } = require('../utils/youtube');
const { validationResult } = require('express-validator');

// Get all videos (for admin)
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get video by ID
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('courseId', 'title creator');
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Check if the course is public or if user is the creator
    const course = await Course.findById(video.courseId);
    if (!course.isPublic && 
        (!req.user || req.user.id.toString() !== course.creator.toString())) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a video
exports.createVideo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, description, youtubeId, courseId, order, tags, difficulty } = req.body;
  
  try {
    // Check if the course exists and user is the creator
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Check if video with this youtubeId already exists
    const existingVideo = await Video.findOne({ youtubeId });
    if (existingVideo) {
      return res.status(400).json({ msg: 'Video already exists' });
    }
    
    // Get video info from YouTube
    let videoInfo = {};
    try {
      videoInfo = await getYoutubeInfo(youtubeId);
    } catch (error) {
      console.error('YouTube API error:', error);
      // Continue without YouTube info if API fails
    }
    
    const newVideo = new Video({
      title: title || videoInfo.title,
      description: description || videoInfo.description,
      youtubeId,
      courseId,
      duration: videoInfo.duration || 0,
      thumbnail: videoInfo.thumbnail || '',
      order: order || 0,
      tags: tags || [],
      difficulty: difficulty || 'intermediate'
    });
    
    const video = await newVideo.save();
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a video
exports.updateVideo = async (req, res) => {
  const { title, description, order, tags, difficulty, transcript, aiSummary, keyPoints } = req.body;
  
  try {
    let video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Check if user is the course creator
    const course = await Course.findById(video.courseId);
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (order !== undefined) video.order = order;
    if (tags) video.tags = tags;
    if (difficulty) video.difficulty = difficulty;
    if (transcript) video.transcript = transcript;
    if (aiSummary) video.aiSummary = aiSummary;
    if (keyPoints) video.keyPoints = keyPoints;
    
    await video.save();
    
    res.json(video);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Check if user is the course creator
    const course = await Course.findById(video.courseId);
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await video.remove();
    
    res.json({ msg: 'Video removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.status(500).send('Server error');
  }
};