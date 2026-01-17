const jwt = require('jsonwebtoken');
const axios = require('axios');
const apiKeyRotator = require('../config/apiKeyRotator');
require('dotenv').config();

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Get video info from YouTube API
exports.getYoutubeInfo = async (videoId) => {
  try {
    const apiKey = apiKeyRotator.getYoutubeKey();
    
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: apiKey
      }
    });
    
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const video = response.data.items[0];
    const { title, description } = video.snippet;
    const thumbnail = video.snippet.thumbnails.high.url;
    
    // Parse duration (PT1H23M45S format)
    const duration = parseDuration(video.contentDetails.duration);
    
    return {
      title,
      description,
      thumbnail,
      duration
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    throw error;
  }
};

// Parse ISO 8601 duration to seconds
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Get captions/transcript from YouTube video
exports.getYoutubeTranscript = async (videoId) => {
  // This is a placeholder - YouTube's API doesn't directly provide transcripts
  // You'd need to use a third-party service or library for this
  console.log(`Getting transcript for video ${videoId}`);
  return "Placeholder transcript - implement using a third-party service";
};