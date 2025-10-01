const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

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