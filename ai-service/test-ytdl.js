// Quick test of ytdl-core caption extraction
const { getVideoTranscript } = require('./utils/youtube');

async function test() {
  console.log('🧪 Testing ytdl-core caption extraction...\n');
  
  const testVideos = [
    'w7ejDZ8SWv8',  // Previously failing video
    'dQw4w9WgXcQ',  // Rick Astley (popular)
    'fBNz5xF-Kx4',  // Another test video
  ];
  
  for (const videoId of testVideos) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing video: ${videoId}`);
      console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
      console.log('='.repeat(60));
      
      const transcript = await getVideoTranscript(videoId);
      
      console.log(`\n✅ SUCCESS!`);
      console.log(`Transcript length: ${transcript.length} characters`);
      console.log(`First 200 chars: ${transcript.substring(0, 200)}...`);
      
    } catch (error) {
      console.log(`\n❌ FAILED: ${error.message}`);
    }
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n🎉 Test complete!');
}

test();
