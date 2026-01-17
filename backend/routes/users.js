const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', (req, res) => {
  res.json({
    message: 'Users API endpoint',
    status: 'Working!'
  });
});

// Get user's learning profile
router.get('/learning-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return learning profile or defaults
    const profile = user.learningProfile || {
      pace: 'medium',
      style: 'visual',
      difficulty: 'intermediate',
      preferences: {
        sessionLength: 30,
        breakFrequency: 3,
        reminderEnabled: true
      }
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching learning profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's learning profile
router.put('/learning-profile', auth, async (req, res) => {
  try {
    const { pace, style, difficulty, preferences } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          learningProfile: {
            pace,
            style,
            difficulty,
            preferences
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Learning profile updated successfully',
      profile: updatedUser.learningProfile
    });
  } catch (error) {
    console.error('Error updating learning profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences: updates } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;