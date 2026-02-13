const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');

// Save a quiz attempt
router.post('/attempt', auth, async (req, res) => {
  const { videoId, videoTitle, courseId, courseName, score, totalQuestions, timeTaken, answers } = req.body;
  
  try {
    console.log('Saving quiz attempt for user:', req.user.id, req.user.isMockUser ? '(MOCK)' : '');
    console.log('Request body:', { videoId, videoTitle, courseId, courseName, score, totalQuestions });
    
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Ensure userId is a valid ObjectId
    let userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      // Create a deterministic ObjectId from the user id string
      userId = new mongoose.Types.ObjectId();
      console.log('Created new ObjectId for user:', userId);
    }
    
    // Build the attempt object
    const attemptData = {
      userId: userId,
      videoId: videoId || 'unknown',
      videoTitle: videoTitle || 'Quiz',
      courseName: courseName || '',
      score,
      totalQuestions,
      percentage,
      timeTaken: timeTaken || 0,
      answers: answers || []
    };
    
    // Only add courseId if it's a valid ObjectId
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      attemptData.courseId = courseId;
    }
    
    const attempt = new QuizAttempt(attemptData);
    
    await attempt.save();
    console.log('Quiz attempt saved successfully:', attempt._id);
    res.json({ success: true, attempt });
  } catch (err) {
    console.error('Error saving quiz attempt:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get quiz history for user
router.get('/history', auth, async (req, res) => {
  try {
    console.log('Fetching quiz history for user:', req.user.id);
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('Quiz history found:', attempts.length);
    res.json(attempts);
  } catch (err) {
    console.error('Error fetching quiz history:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz stats for user (for dashboard)
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching quiz stats for user:', userId);
    
    // Get total quizzes taken
    const totalQuizzes = await QuizAttempt.countDocuments({ userId });
    console.log('Total quizzes for user:', totalQuizzes);
    
    // Get average score
    const avgResult = await QuizAttempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgPercentage: { $avg: '$percentage' } } }
    ]);
    const averageScore = avgResult.length > 0 ? Math.round(avgResult[0].avgPercentage) : 0;
    
    // Get weekly quiz activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    const weeklyAttempts = await QuizAttempt.find({
      userId: userId,
      createdAt: { $gte: oneWeekAgo }
    }).sort({ createdAt: 1 });
    
    // Group by day of week (Mon=0, Sun=6)
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    const weeklyScores = [[], [], [], [], [], [], []];
    
    weeklyAttempts.forEach(attempt => {
      const dayOfWeek = (attempt.createdAt.getDay() + 6) % 7; // Convert to Mon=0
      weeklyData[dayOfWeek]++;
      weeklyScores[dayOfWeek].push(attempt.percentage);
    });
    
    // Calculate average score per day
    const weeklyAvgScores = weeklyScores.map(scores => 
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    );
    
    res.json({
      totalQuizzes,
      averageScore,
      weeklyQuizCount: weeklyData,
      weeklyAvgScores,
      recentAttempts: weeklyAttempts.slice(-5).reverse()
    });
  } catch (err) {
    console.error('Error fetching quiz stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz by video ID
router.get('/video/:videoId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ videoId: req.params.videoId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create quiz
router.post('/', auth, async (req, res) => {
  const { videoId, title, description, questions, difficultyLevel } = req.body;
  
  try {
    // Check if quiz already exists for this video
    let quiz = await Quiz.findOne({ videoId });
    
    if (quiz) {
      return res.status(400).json({ msg: 'Quiz already exists for this video' });
    }
    
    const newQuiz = new Quiz({
      videoId,
      title,
      description,
      questions,
      difficultyLevel: difficultyLevel || 'medium'
    });
    
    quiz = await newQuiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update quiz
router.put('/:id', auth, async (req, res) => {
  const { title, description, questions, difficultyLevel } = req.body;
  
  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (difficultyLevel) quiz.difficultyLevel = difficultyLevel;
    
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete quiz
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    await quiz.remove();
    res.json({ msg: 'Quiz removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;