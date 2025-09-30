const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const auth = require('../middleware/auth');

// Get all flashcards for a video
router.get('/video/:videoId', auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      videoId: req.params.videoId
    }).sort({ createdAt: -1 });
    
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create a flashcard
router.post('/', auth, async (req, res) => {
  const { videoId, front, back, tags } = req.body;
  
  try {
    const newFlashcard = new Flashcard({
      userId: req.user.id,
      videoId,
      front,
      back,
      tags: tags || []
    });
    
    const flashcard = await newFlashcard.save();
    res.json(flashcard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update flashcard
router.put('/:id', auth, async (req, res) => {
  const { front, back, tags, difficulty } = req.body;
  
  try {
    let flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ msg: 'Flashcard not found' });
    }
    
    if (flashcard.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    if (front) flashcard.front = front;
    if (back) flashcard.back = back;
    if (tags) flashcard.tags = tags;
    if (difficulty !== undefined) flashcard.difficulty = difficulty;
    
    await flashcard.save();
    res.json(flashcard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete flashcard
router.delete('/:id', auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ msg: 'Flashcard not found' });
    }
    
    if (flashcard.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await flashcard.remove();
    res.json({ msg: 'Flashcard removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get due flashcards for spaced repetition
router.get('/due', auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      nextReviewDate: { $lte: new Date() }
    }).limit(20);
    
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update flashcard after review
router.post('/:id/review', auth, async (req, res) => {
  const { quality } = req.body; // Quality of response, 0-5
  
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ msg: 'Flashcard not found' });
    }
    
    if (flashcard.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Simple spaced repetition algorithm (SM-2)
    const { difficulty, repetitions } = flashcard;
    
    let newDifficulty = difficulty;
    let newRepetitions = repetitions;
    let interval = 0;
    
    if (quality < 3) {
      newRepetitions = 0;
    } else {
      newRepetitions += 1;
    }
    
    if (repetitions === 0) {
      interval = 1; // 1 day
    } else if (repetitions === 1) {
      interval = 6; // 6 days
    } else {
      interval = Math.round(difficulty * repetitions); // difficulty * days
    }
    
    // Update difficulty based on performance
    newDifficulty = difficulty + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Keep difficulty within range
    if (newDifficulty < 1.3) newDifficulty = 1.3;
    if (newDifficulty > 5) newDifficulty = 5;
    
    // Set next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    flashcard.difficulty = newDifficulty;
    flashcard.repetitions = newRepetitions;
    flashcard.lastReviewed = new Date();
    flashcard.nextReviewDate = nextReview;
    
    await flashcard.save();
    res.json(flashcard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;