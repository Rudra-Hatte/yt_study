/**
 * Client-side YouTube caption extractor (NoteGPT-style)
 * Runs in browser with user's session - bypasses all server blocks!
 */

/**
 * Extract captions from YouTube video (browser-side)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Full transcript text
 */
export async function extractYouTubeCaptions(videoId) {
  console.log(`🎬 [Browser] Extracting captions for: ${videoId}`);
  
  try {
    // Method 1: Fetch video page and extract caption tracks
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await fetch(watchUrl, {
      credentials: 'include', // Include cookies (user session)
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract ytInitialPlayerResponse JSON
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    
    if (!playerResponseMatch) {
      throw new Error('Could not find player response in page');
    }
    
    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No captions available for this video');
    }
    
    console.log(`📋 Found ${captionTracks.length} caption track(s)`);
    
    // Find best caption track (prefer English auto-generated)
    let selectedTrack = 
      captionTracks.find(t => t.languageCode === 'en' && t.kind === 'asr') ||
      captionTracks.find(t => t.languageCode === 'en') ||
      captionTracks.find(t => t.languageCode.startsWith('en')) ||
      captionTracks[0];
    
    const trackInfo = selectedTrack.name?.simpleText || selectedTrack.languageCode;
    const trackType = selectedTrack.kind === 'asr' ? '(auto)' : '(manual)';
    console.log(`✅ Selected: ${trackInfo} ${trackType}`);
    
    // Fetch caption XML from timedtext API (using browser session!)
    const captionUrl = selectedTrack.baseUrl;
    const captionResponse = await fetch(captionUrl, {
      credentials: 'include'
    });
    
    if (!captionResponse.ok) {
      throw new Error(`Failed to fetch captions: ${captionResponse.status}`);
    }
    
    const captionXml = await captionResponse.text();
    
    // Parse XML to extract text
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(captionXml, 'text/xml');
    const textElements = xmlDoc.getElementsByTagName('text');
    
    if (textElements.length === 0) {
      throw new Error('No text found in caption XML');
    }
    
    // Extract and clean text segments
    const segments = [];
    for (let i = 0; i < textElements.length; i++) {
      const text = textElements[i].textContent
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ')
        .trim();
      
      if (text) {
        segments.push(text);
      }
    }
    
    const fullTranscript = segments.join(' ');
    console.log(`✅ [Browser] Extracted ${fullTranscript.length} characters`);
    
    return fullTranscript;
    
  } catch (error) {
    console.error('❌ [Browser] Caption extraction failed:', error);
    throw new Error(`Could not extract captions: ${error.message}`);
  }
}

/**
 * Extract video metadata from YouTube
 * @param {string} videoId 
 * @returns {Promise<object>}
 */
export async function getVideoMetadata(videoId) {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(watchUrl, { credentials: 'include' });
    const html = await response.text();
    
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      throw new Error('Could not extract video metadata');
    }
    
    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const details = playerResponse.videoDetails;
    
    return {
      title: details.title,
      author: details.author,
      lengthSeconds: details.lengthSeconds,
      viewCount: details.viewCount,
      thumbnail: details.thumbnail?.thumbnails?.[0]?.url
    };
  } catch (error) {
    console.error('Failed to get metadata:', error);
    return null;
  }
}
