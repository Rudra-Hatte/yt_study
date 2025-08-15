const User = require('../models/User');

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title category');

    const stats = {
      totalCoursesEnrolled: user.enrolledCourses.length,
      totalCoursesCompleted: user.stats.totalCoursesCompleted,
      totalStudyTime: user.stats.totalStudyTime,
      currentStreak: user.stats.streak,
      enrolledCourses: user.enrolledCourses.map(ec => ({
        course: ec.course,
        progress: ec.progress,
        enrolledAt: ec.enrolledAt
      }))
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user stats',
      message: error.message
    });
  }
};

// Update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const { emailNotifications, learningReminders, theme } = req.body;

    const user = await User.findById(req.user._id);
    
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }
    if (learningReminders !== undefined) {
      user.preferences.learningReminders = learningReminders;
    }
    if (theme !== undefined) {
      user.preferences.theme = theme;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message
    });
  }
};

module.exports = {
  getUserStats,
  updateUserPreferences
};