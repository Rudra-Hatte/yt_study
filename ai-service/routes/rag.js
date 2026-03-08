const express = require('express');
const router = express.Router();

// Import RAG controller
const {
  indexVideoContent,
  queueVideoForIndexing,
  searchContent,
  findRelatedContent,
  recommendLearningPath,
  enhancedChatResponse,
  getServiceStats,
  clearCaches,
  healthCheck
} = require('../controllers/ragController');

/**
 * @route   POST /api/rag/index
 * @desc    Index video content for RAG retrieval
 * @access  Public (should be protected in production)
 * @body    {videoId, title, transcript, aiSummary, keyPoints, etc.}
 */
router.post('/index', indexVideoContent);

/**
 * @route   POST /api/rag/queue
 * @desc    Queue video for background indexing
 * @access  Public (should be protected in production)
 * @body    {videoData}
 */
router.post('/queue', queueVideoForIndexing);

/**
 * @route   POST /api/rag/search
 * @desc    Search content using semantic similarity
 * @access  Public
 * @body    {query, courseId?, contentTypes?, maxResults?, threshold?}
 */
router.post('/search', searchContent);

/**
 * @route   POST /api/rag/related
 * @desc    Find related/similar content
 * @access  Public
 * @body    {referenceContent, excludeSource?, courseId?, maxResults?, threshold?}
 */
router.post('/related', findRelatedContent);

/**
 * @route   POST /api/rag/recommend
 * @desc    Generate learning path recommendations
 * @access  Public (should require auth in production)
 * @body    {userProgress, courseId?, difficulty?, maxRecommendations?}
 */
router.post('/recommend', recommendLearningPath);

/**
 * @route   POST /api/rag/chat
 * @desc    Generate enhanced chat responses using RAG
 * @access  Public
 * @body    {query, courseId?, conversationHistory?}
 */
router.post('/chat', enhancedChatResponse);

/**
 * @route   GET /api/rag/stats
 * @desc    Get RAG service statistics
 * @access  Public (should be admin only in production)
 */
router.get('/stats', getServiceStats);

/**
 * @route   POST /api/rag/clear-cache
 * @desc    Clear RAG service caches
 * @access  Public (should be admin only in production)
 */
router.post('/clear-cache', clearCaches);

/**
 * @route   GET /api/rag/health
 * @desc    RAG service health check
 * @access  Public
 */
router.get('/health', healthCheck);

module.exports = router;