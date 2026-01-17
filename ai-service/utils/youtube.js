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

// Search YouTube videos by query
const searchYouTubeVideos = async (query, maxResults = 10) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, using fallback');
      // Return empty array if no API key - will be handled by calling function
      return [];
    }
    
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`, {
        params: {
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: maxResults,
          order: 'relevance',
          videoDuration: 'medium', // 4-20 minutes
          videoCaption: 'closedCaption', // Only videos with captions
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );
    
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }
    
    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url
    }));
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return []; // Return empty array on error
  }
};

module.exports = {
  getVideoTranscript,
  getVideoMetadata,
  searchYouTubeVideos
};