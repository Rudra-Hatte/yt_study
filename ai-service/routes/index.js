const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const flashcardController = require('../controllers/flashcardController');
const summaryController = require('../controllers/summaryController');
const curatorController = require('../controllers/curatorController');

// Quiz routes
router.post('/quiz', quizController.createQuiz);

// Flashcard routes
router.post('/flashcards', flashcardController.createFlashcards);

// Summary routes
router.post('/summary', summaryController.createSummary);

// Video curation routes
router.post('/recommend', curatorController.recommendVideos);

// Basic route for testing
router.get('/status', (req, res) => {
  res.json({ status: 'AI service operational', version: '1.0.0' });
});

module.exports = router;