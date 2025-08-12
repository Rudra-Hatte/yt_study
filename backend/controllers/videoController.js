const Video = require('../models/Video');
const Course = require('../models/Course');

// Get video details
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('course', 'title creator')
      .populate('quizzes');

    if (!video) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'Video with this ID does not exist'
      });
    }

    // Increment view count
    video.watchStats.totalViews += 1;
    await video.save();

    res.json({
      success: true,
      data: { video }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      error: 'Failed to fetch video',
      message: error.message
    });
  }
};

// Update video watch progress
const updateVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { watchTime, completed = false } = req.body;

    // Find user's enrollment for this video's course
    const video = await Video.findById(videoId).populate('course');
    if (!video) {
      return res.status(404).json({
        error: 'Video not found',
        message: 'Video does not exist'
      });
    }

    const enrollment = req.user.enrolledCourses.find(
      ec => ec.course.toString() === video.course._id.toString()
    );

    if (!enrollment) {
      return res.status(403).json({
        error: 'Not enrolled',
        message: 'You must be enrolled in the course to track progress'
      });
    }

    // TODO: Update user's video progress in a separate Progress model
    // For now, just acknowledge the update

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        videoId,
        watchTime,
        completed,
        courseProgress: enrollment.progress
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      error: 'Failed to update progress',
      message: error.message
    });
  }
};

// Get course videos
const getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const videos = await Video.find({ course: courseId })
      .sort({ order: 1 })
      .select('-transcript'); // Exclude large transcript field

    res.json({
      success: true,
      data: { videos }
    });
  } catch (error) {
    console.error('Get course videos error:', error);
    res.status(500).json({
      error: 'Failed to fetch course videos',
      message: error.message
    });
  }
};

module.exports = {
  getVideoById,
  updateVideoProgress,
  getCourseVideos
};