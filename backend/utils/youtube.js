const axios = require('axios');

// Extract YouTube video ID from URL
const extractVideoId = (url) => {
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return videoMatch ? videoMatch[1] : null;
};

// Extract YouTube playlist ID from URL
const extractPlaylistId = (url) => {
  const playlistMatch = url.match(/[?&]list=([^&\n?#]+)/);
  return playlistMatch ? playlistMatch[1] : null;
};

// Get video details from YouTube API
const getVideoDetails = async (videoId) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.maxres?.url || 
                 video.snippet.thumbnails.high?.url ||
                 video.snippet.thumbnails.default.url,
      duration: parseDuration(video.contentDetails.duration),
      publishedAt: video.snippet.publishedAt,
      channelTitle: video.snippet.channelTitle
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    throw error;
  }
};

// Parse YouTube duration format (PT4M13S) to seconds
const parseDuration = (duration) => {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

module.exports = {
  extractVideoId,
  extractPlaylistId,
  getVideoDetails,
  parseDuration
};