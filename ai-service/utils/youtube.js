const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const cheerio = require('cheerio');
const { google } = require('googleapis');

// Method to fetch captions using YouTube's timedtext API (most reliable)
const getTimedTextCaptions = async (videoId) => {
  try {
    console.log('📥 Using YouTube timedtext API (native method)...');
    
    // Fetch the video watch page to extract caption track URLs
    const watchPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(watchPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      }
    });
    
    const html = response.data;
    
    // Extract the ytInitialPlayerResponse JSON from the page
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      throw new Error('Could not find player response in page');
    }
    
    const playerResponse = JSON.parse(playerResponseMatch[1]);
    
    // Get caption tracks
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    console.log(`📋 Caption tracks available: ${captionTracks?.length || 0}`);
    if (captionTracks && captionTracks.length > 0) {
      console.log(`Available languages: ${captionTracks.map(t => t.languageCode).join(', ')}`);
    }
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No caption tracks found');
    }
    
    // Find English caption track or use first available
    // Prefer auto-generated captions if available (more reliable)
    let selectedTrack = 
      captionTracks.find(track => track.languageCode === 'en' && track.kind === 'asr') || // Auto-generated English
      captionTracks.find(track => track.languageCode === 'en') || // Manual English
      captionTracks.find(track => track.languageCode.startsWith('en')) || // Any English variant
      captionTracks[0]; // Fallback to first available
    
    const trackType = selectedTrack.kind === 'asr' ? '(auto-generated)' : '(manual)';
    console.log(`✅ Found caption track: ${selectedTrack.name?.simpleText || selectedTrack.languageCode} ${trackType}`);
    
    // Fetch the caption data (XML format)
    const captionUrl = selectedTrack.baseUrl;
    const captionResponse = await axios.get(captionUrl);
    
    // Parse XML to extract text
    const $ = cheerio.load(captionResponse.data, { xmlMode: true });
    const textSegments = [];
    
    $('text').each((i, elem) => {
      const text = $(elem).text()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ')
        .trim();
      
      if (text) {
        textSegments.push(text);
      }
    });
    
    const fullTranscript = textSegments.join(' ');
    console.log(`✅ Timedtext method successful! Length: ${fullTranscript.length} characters`);
    
    return fullTranscript;
  } catch (error) {
    console.log(`⚠️ Timedtext method failed: ${error.message}`);
    throw error;
  }
};

// Method to fetch captions using YouTube Data API v3 (most reliable for servers)
const getYouTubeDataAPICaptions = async (videoId) => {
  try {
    console.log('📥 Using YouTube Data API v3 (official API)...');
    
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
    
    // List available captions
    const captionsList = await youtube.captions.list({
      videoId: videoId,
      part: ['snippet']
    });
    
    if (!captionsList.data.items || captionsList.data.items.length === 0) {
      throw new Error('No captions available via YouTube Data API');
    }
    
    console.log(`📋 Found ${captionsList.data.items.length} caption track(s) via API`);
    
    // Find English caption
    let caption = captionsList.data.items.find(c => 
      c.snippet.language === 'en' || 
      c.snippet.language.startsWith('en')
    ) || captionsList.data.items[0];
    
    console.log(`✅ Selected caption: ${caption.snippet.name || caption.snippet.language}`);
    
    // Download caption content
    const captionDownload = await youtube.captions.download({
      id: caption.id,
      tfmt: 'srt' // SubRip format
    });
    
    // Parse SRT format to extract text
    const srtContent = captionDownload.data;
    const textLines = srtContent
      .split('\n')
      .filter(line => line.trim() && !line.match(/^\d+$/) && !line.match(/\d{2}:\d{2}:\d{2}/))
      .join(' ')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`✅ YouTube Data API method successful! Length: ${textLines.length} characters`);
    return textLines;
    
  } catch (error) {
    console.log(`⚠️ YouTube Data API method failed: ${error.message}`);
    throw error;
  }
};

// Extract transcript from YouTube video with multiple fallback methods
const getVideoTranscript = async (videoId) => {
  console.log(`🔍 Attempting to fetch transcript for video: ${videoId}`);
  
  // Method 1: Try YouTube Data API v3 (most reliable for servers)
  try {
    const transcript = await getYouTubeDataAPICaptions(videoId);
    if (transcript && transcript.length > 100) {
      return transcript;
    }
  } catch (error) {
    console.log(`⚠️ Method 1 (YouTube Data API) failed: ${error.message}`);
  }
  
  // Method 2: Try YouTube's native timedtext API (scraping)
  try {
    const transcript = await getTimedTextCaptions(videoId);
    if (transcript && transcript.length > 100) {
      return transcript;
    }
  } catch (error) {
    console.log(`⚠️ Method 2 (timedtext) failed: ${error.message}`);
  }
  
  // Method 3: Try youtube-transcript library
  try {
    console.log('📥 Method 3: Using youtube-transcript library...');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcript && transcript.length > 0) {
      const fullTranscript = transcript.map(item => item.text).join(' ');
      console.log(`✅ Success! Transcript length: ${fullTranscript.length} characters`);
      return fullTranscript;
    }
  } catch (error) {
    console.log(`⚠️ Method 3 failed: ${error.message}`);
  }

  // Method 4: Try with language parameter variations
  const languages = ['en', 'en-US', 'en-GB', 'a.en'];
  for (const lang of languages) {
    try {
      console.log(`📥 Method 4: Trying language: ${lang}...`);
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
      if (transcript && transcript.length > 0) {
        const fullTranscript = transcript.map(item => item.text).join(' ');
        console.log(`✅ Success with ${lang}! Transcript length: ${fullTranscript.length} characters`);
        return fullTranscript;
      }
    } catch (error) {
      console.log(`⚠️ Method 4 (${lang}) failed: ${error.message}`);
    }
  }
  
  // All methods failed
  console.error('❌ All transcript methods failed');
  throw new Error('This video does not have captions/subtitles available. Please try a different video with captions enabled.');
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