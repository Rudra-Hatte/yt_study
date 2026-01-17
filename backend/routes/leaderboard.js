const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Hardcoded leaderboard data with Indian names
const hardcodedLeaderboard = [
  {
    rank: 1,
    userId: 'user1',
    name: 'Priya Sharma',
    avatar: 'PS',
    learningRate: 98,
    coursesCompleted: 24,
    totalHours: 142,
    streak: 45
  },
  {
    rank: 2,
    userId: 'user2',
    name: 'Arjun Patel',
    avatar: 'AP',
    learningRate: 95,
    coursesCompleted: 21,
    totalHours: 128,
    streak: 38
  },
  {
    rank: 3,
    userId: 'user3',
    name: 'Ananya Kumar',
    avatar: 'AK',
    learningRate: 92,
    coursesCompleted: 19,
    totalHours: 115,
    streak: 32
  },
  {
    rank: 4,
    userId: 'user4',
    name: 'Rohan Mehta',
    avatar: 'RM',
    learningRate: 89,
    coursesCompleted: 18,
    totalHours: 107,
    streak: 28
  },
  {
    rank: 5,
    userId: 'user5',
    name: 'Sneha Reddy',
    avatar: 'SR',
    learningRate: 87,
    coursesCompleted: 17,
    totalHours: 98,
    streak: 25
  },
  {
    rank: 6,
    userId: 'user6',
    name: 'Vikram Singh',
    avatar: 'VS',
    learningRate: 85,
    coursesCompleted: 16,
    totalHours: 92,
    streak: 21
  },
  {
    rank: 7,
    userId: 'user7',
    name: 'Diya Joshi',
    avatar: 'DJ',
    learningRate: 83,
    coursesCompleted: 15,
    totalHours: 87,
    streak: 18
  },
  {
    rank: 8,
    userId: 'user8',
    name: 'Aditya Verma',
    avatar: 'AV',
    learningRate: 81,
    coursesCompleted: 14,
    totalHours: 79,
    streak: 15
  },
  {
    rank: 9,
    userId: 'user9',
    name: 'Kavya Iyer',
    avatar: 'KI',
    learningRate: 78,
    coursesCompleted: 13,
    totalHours: 72,
    streak: 12
  },
  {
    rank: 10,
    userId: 'user10',
    name: 'Ishaan Desai',
    avatar: 'ID',
    learningRate: 76,
    coursesCompleted: 12,
    totalHours: 68,
    streak: 10
  }
];

// @route   GET /api/leaderboard
// @desc    Get top learners (currently hardcoded, will be replaced with real data)
// @access  Public or Private (based on your needs)
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with real database query
    // const leaderboard = await User.find()
    //   .sort({ learningRate: -1 })
    //   .limit(10)
    //   .select('name avatar learningRate coursesCompleted totalHours streak');
    
    // For now, return hardcoded data
    res.json({
      success: true,
      data: hardcodedLeaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's rank and position
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // TODO: Replace with real database query
    // Find user's rank in the leaderboard
    const userIndex = hardcodedLeaderboard.findIndex(u => u.userId === userId);
    
    if (userIndex === -1) {
      return res.json({
        success: true,
        data: {
          rank: null,
          message: 'Keep learning to get on the leaderboard!'
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        ...hardcodedLeaderboard[userIndex],
        position: userIndex + 1
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank'
    });
  }
});

// @route   POST /api/leaderboard/update
// @desc    Update user's learning stats (for future real implementation)
// @access  Private
router.post('/update', auth, async (req, res) => {
  try {
    const { coursesCompleted, totalHours, learningRate } = req.body;
    const userId = req.user.id;
    
    // TODO: Implement real update logic
    // const user = await User.findById(userId);
    // user.coursesCompleted = coursesCompleted;
    // user.totalHours = totalHours;
    // user.learningRate = learningRate;
    // await user.save();
    
    res.json({
      success: true,
      message: 'Learning stats updated successfully (currently using mock data)'
    });
  } catch (error) {
    console.error('Error updating learning stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning stats'
    });
  }
});

module.exports = router;
