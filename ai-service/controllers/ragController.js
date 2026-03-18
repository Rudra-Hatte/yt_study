const ragService = require('../services/rag/ragService');

exports.indexVideo = async (req, res) => {
  try {
    const { videoId, title } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'videoId is required' });
    }

    const result = await ragService.indexVideo(videoId, title);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('RAG index error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { query, limit = 6, videoId } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'query is required' });
    }

    const result = await ragService.retrieveContext(query, {
      limit: Number(limit) || 6,
      videoId: videoId || null
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('RAG search error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const stats = await ragService.getStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('RAG stats error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};