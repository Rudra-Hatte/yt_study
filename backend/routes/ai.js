const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');
const Video = require('../models/Video');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');

// Generate quiz for a video and save to database
router.post('/generate-quiz/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { numQuestions = 5, difficulty = 'medium' } = req.body;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Check if quiz already exists
    let existingQuiz = await Quiz.findOne({ videoId });
    
    if (existingQuiz) {
      return res.status(400).json({ msg: 'Quiz already exists for this video' });
    }
    
    // Generate quiz
    const result = await aiService.generateQuiz(video.youtubeId, video.title, numQuestions, difficulty);
    
    if (!result.success || !result.data || !result.data.questions) {
      return res.status(500).json({ msg: 'Failed to generate quiz' });
    }
    
    // Save quiz to database
    const newQuiz = new Quiz({
      videoId,
      title: `Quiz for ${video.title}`,
      questions: result.data.questions,
      difficultyLevel: difficulty,
      isAIGenerated: true
    });
    
    await newQuiz.save();
    res.json(newQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Generate flashcards for a video
router.post('/generate-flashcards/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { numCards = 10 } = req.body;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Generate flashcards
    const result = await aiService.generateFlashcards(video.youtubeId, video.title, numCards);
    
    if (!result.success || !result.data || !result.data.flashcards) {
      return res.status(500).json({ msg: 'Failed to generate flashcards' });
    }
    
    // Save flashcards to database
    const savedFlashcards = [];
    for (const card of result.data.flashcards) {
      const newFlashcard = new Flashcard({
        userId: req.user.id,
        videoId,
        front: card.front,
        back: card.back,
        tags: card.tags || [],
        isAIGenerated: true
      });
      
      await newFlashcard.save();
      savedFlashcards.push(newFlashcard);
    }
    
    res.json(savedFlashcards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Generate summary for a video
router.post('/generate-summary/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { format = 'detailed' } = req.body;
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Generate summary
    const result = await aiService.generateSummary(video.youtubeId, video.title, format);
    
    if (!result.success || !result.data) {
      return res.status(500).json({ msg: 'Failed to generate summary' });
    }
    
    // Update video with AI summary and key points
    video.aiSummary = result.data.summary;
    video.keyPoints = result.data.keyPoints || [];
    
    await video.save();
    
    res.json({ 
      summary: result.data.summary, 
      keyPoints: result.data.keyPoints,
      difficulty: result.data.difficulty,
      topics: result.data.topics
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get personalized video recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get user's watch history
    const progress = await Progress.find({ userId: req.user.id })
      .sort({ lastAccessed: -1 })
      .limit(10)
      .populate('videoId', 'title tags difficulty');
    
    const watchHistory = progress.map(p => ({
      id: p.videoId._id,
      title: p.videoId.title,
      tags: p.videoId.tags || [],
      difficulty: p.videoId.difficulty,
      watchPercentage: p.watchPercentage
    }));
    
    // Get available videos (excluding watched ones)
    const watchedVideoIds = progress.map(p => p.videoId._id.toString());
    
    const availableVideos = await Video.find({
      _id: { $nin: watchedVideoIds }
    })
    .select('title description tags difficulty')
    .limit(100);
    
    // Get recommendations
    const result = await aiService.getRecommendations(
      watchHistory,
      availableVideos.map(v => ({
        id: v._id,
        title: v.title,
        description: v.description,
        tags: v.tags || [],
        difficulty: v.difficulty
      })),
      req.query.learningGoal
    );
    
    if (!result.success || !result.data) {
      return res.status(500).json({ msg: 'Failed to get recommendations' });
    }
    
    // Get full video details for recommended videos
    const recommendedVideos = await Video.find({
      _id: { $in: result.data.recommendedVideos }
    });
    
    res.json({
      recommendedVideos,
      learningPath: result.data.learningPath,
      explanation: result.data.explanation
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;