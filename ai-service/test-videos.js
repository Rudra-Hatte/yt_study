// Test script to verify which videos have captions
const axios = require('axios');

async function checkVideoForCaptions(videoId) {
  try {
    console.log(`\n🔍 Checking video: ${videoId}`);
    console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
    
    const watchPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(watchPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const html = response.data;
    
    // Extract ytInitialPlayerResponse
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      console.log('❌ Could not find player response');
      return false;
    }
    
    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      console.log('❌ No captions found');
      return false;
    }
    
    console.log(`✅ Found ${captionTracks.length} caption track(s)`);
    captionTracks.forEach(track => {
      console.log(`   - ${track.name?.simpleText || track.languageCode} (${track.languageCode})`);
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Test videos
const testVideos = [
  'fBNz5xF-Kx4', // Current failing video
  'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up (popular, should have captions)
  'jNQXAC9IVRw', // "Me at the zoo" - first YouTube video
  'w7ejDZ8SWv8', // Previous test video
  '9bZkp7q19f0', // Gangnam Style (popular, should have captions)
];

async function testAll() {
  console.log('🎬 Testing YouTube videos for caption availability...\n');
  
  for (const videoId of testVideos) {
    await checkVideoForCaptions(videoId);
    // Wait 2 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Test complete!');
}

testAll();
