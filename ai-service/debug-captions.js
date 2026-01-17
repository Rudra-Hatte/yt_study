// Debug timedtext XML parsing
const axios = require('axios');
const cheerio = require('cheerio');

async function debugTimedtext() {
  const videoId = 'w7ejDZ8SWv8';
  const watchPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  console.log('Fetching watch page...');
  const response = await axios.get(watchPageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const html = response.data;
  const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
  const playerResponse = JSON.parse(playerResponseMatch[1]);
  const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  
  const captionUrl = captionTracks[0].baseUrl;
  console.log('\nCaption URL:', captionUrl);
  
  console.log('\nFetching caption XML...');
  const captionResponse = await axios.get(captionUrl);
  
  console.log('\nRAW XML (first 500 chars):');
  console.log(captionResponse.data.substring(0, 500));
  
  const $ = cheerio.load(captionResponse.data, { xmlMode: true });
  console.log('\n\nParsing with cheerio...');
  console.log('Total <text> elements:', $('text').length);
  
  const textSegments = [];
  $('text').each((i, elem) => {
    const rawText = $(elem).text();
    console.log(`\nElement ${i}:`);
    console.log('Raw:', rawText);
    
    const cleaned = rawText
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, ' ')
      .trim();
    
    console.log('Cleaned:', cleaned);
    
    if (cleaned) {
      textSegments.push(cleaned);
    }
  });
  
  console.log('\n\nTotal segments:', textSegments.length);
  console.log('Joined length:', textSegments.join(' ').length);
}

debugTimedtext();
