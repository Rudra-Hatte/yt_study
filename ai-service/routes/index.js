const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const flashcardController = require('../controllers/flashcardController');
const summaryController = require('../controllers/summaryController');
const curatorController = require('../controllers/curatorController');
const courseStructureController = require('../controllers/courseStructureController');
const chatController = require('../controllers/chatController');

// Quiz routes
router.post('/quiz', quizController.createQuiz);

// Flashcard routes
router.post('/flashcards', flashcardController.createFlashcards);

// Summary routes
router.post('/summary', summaryController.createSummary);

// Video curation routes
router.post('/recommend', curatorController.recommendVideos);
router.post('/search-videos', curatorController.searchAndCurateVideos);

// Course structure and automated learning path routes
router.post('/generate-course', courseStructureController.generateCourse);
router.post('/generate-course-ai', courseStructureController.generateCourseAI);
router.post('/generate-modules', courseStructureController.generateModules);
router.post('/analyze-concepts', courseStructureController.analyzeContentRelationships);

// AI Chat routes
router.post('/chat', chatController.chatWithAI);

// Basic route for testing
router.get('/status', (req, res) => {
  res.json({ status: 'AI service operational', version: '1.0.0' });
});

module.exports = router;