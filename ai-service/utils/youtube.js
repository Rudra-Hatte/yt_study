const { YoutubeTranscript } = require('youtube-transcript');
const { getSubtitles } = require('youtube-captions-scraper');
const axios = require('axios');

// Extract transcript from YouTube video
const getVideoTranscript = async (videoId) => {
  try {
    // Try primary method
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcript && transcript.length > 0) {
      return transcript.map(item => item.text).join(' ');
    }

    // If primary method fails, try backup method
    const captions = await getSubtitles({
      videoID: videoId,
      lang: 'en'
    });
    
    return captions.map(caption => caption.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error('Failed to fetch video transcript');
  }
};

// Get video metadata using YouTube API
const getVideoMetadata = async (videoId) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          id: videoId,
          part: 'snippet,contentDetails,statistics',
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );
    
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const video = response.data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      tags: video.snippet.tags || [],
      thumbnailUrl: video.snippet.thumbnails.high.url,
      duration: video.contentDetails.duration, // ISO 8601 format
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    throw error;
  }
};

module.exports = {
  getVideoTranscript,
  getVideoMetadata
};