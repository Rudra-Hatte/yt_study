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

// Get dashboard overview data
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const Progress = require('../models/Progress');
    const User = require('../models/User');
    
    // Get user with enrolled courses
    const user = await User.findById(userId).populate('enrolledCourses');
    
    // Get all progress records for the user
    const progressRecords = await Progress.find({ userId });
    
    // Calculate statistics
    const totalCourses = user.enrolledCourses?.length || 0;
    const completedCourses = progressRecords.filter(p => p.completed).length;
    const inProgressCourses = progressRecords.filter(p => p.watchTime > 0 && !p.completed).length;
    const notStartedCourses = totalCourses - completedCourses - inProgressCourses;
    
    // Calculate total study time in minutes
    const totalStudyTime = progressRecords.reduce((sum, record) => sum + (record.watchTime || 0), 0);
    
    // Calculate study streak (simplified - days with activity in last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentActivity = progressRecords.filter(p => p.updatedAt >= oneWeekAgo);
    const streak = recentActivity.length > 0 ? Math.min(recentActivity.length, 7) : 0;
    
    // Generate weekly activity data (mock for now)
    const weeklyActivity = [0, 0, 0, 0, 0, 0, 0]; // This would need real activity tracking
    
    res.json({
      totalCourses,
      totalStudyTime,
      streak,
      courseStats: {
        completed: completedCourses,
        inProgress: inProgressCourses,
        notStarted: notStartedCourses
      },
      weeklyActivity,
      recentActivity: progressRecords
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
    });
    
  } catch (error) {
    console.error('Error fetching progress overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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