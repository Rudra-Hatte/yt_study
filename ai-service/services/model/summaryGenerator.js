const { chatWithFallback } = require('../modelClient');

/**
 * Generate summary using the model gateway based on video title
 * @param {string} videoId - The YouTube video ID
 * @param {string} title - The video title
 * @param {string} format - Summary format (brief, detailed, bullet)
 * @returns {Object} Summary and key points
 */
async function generateSummary(videoId, title, format = 'detailed') {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('📝 Generating summary for video:', videoUrl);
  console.log('📝 Title:', title);
  
  let formatInstructions = '';
  if (format === 'brief') {
    formatInstructions = 'Create a concise summary in 3-4 sentences.';
  } else if (format === 'bullet') {
    formatInstructions = 'Create a bullet-point summary with the main points.';
  } else {
    formatInstructions = 'Create a detailed summary in 5-7 paragraphs covering the main topics.';
  }
  
  const prompt = `You are an expert educational content summarizer. Based on the YouTube video title and topic, ${formatInstructions}

Video Title: "${title}"
Video URL: ${videoUrl}

Create a comprehensive educational summary. Return ONLY valid JSON with NO markdown, NO code blocks.

JSON structure (keep responses concise to avoid truncation):
{"summary":"2-3 sentence overview","mainConcepts":["concept1","concept2","concept3"],"keyPoints":["point1","point2","point3"],"keywords":["word1","word2","word3"],"practicalApplications":["app1","app2"],"nextSteps":["step1","step2"],"difficulty":"beginner"}

Where difficulty is: beginner, intermediate, or advanced`;

  try {
    console.log('🤖 Generating summary using model gateway...');
    const response = await chatWithFallback({
      systemPrompt: 'You are an educational content summarizer. Always respond with valid JSON only, no markdown or extra text.',
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 3000
    });

    const textResponse = response.text || '';
    console.log('✅ Model response received for summary');
    
    // Extract JSON from response
    let jsonStr = textResponse.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/) || 
                      jsonStr.match(/```\n?([\s\S]*?)\n?```/) ||
                      jsonStr.match(/({[\s\S]*})/);
                      
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // Try to parse JSON, handle truncated responses
    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      // Try to fix common JSON issues
      console.log('⚠️ JSON parse failed, attempting to fix...');
      
      // Extract summary - handle multi-line strings
      let summaryText = '';
      const summaryStartIndex = jsonStr.indexOf('"summary"');
      if (summaryStartIndex !== -1) {
        const colonIndex = jsonStr.indexOf(':', summaryStartIndex);
        const quoteStart = jsonStr.indexOf('"', colonIndex + 1);
        if (quoteStart !== -1) {
          // Find the end of the summary string (handle escaped quotes)
          let quoteEnd = quoteStart + 1;
          while (quoteEnd < jsonStr.length) {
            if (jsonStr[quoteEnd] === '"' && jsonStr[quoteEnd - 1] !== '\\') {
              break;
            }
            quoteEnd++;
          }
          summaryText = jsonStr.substring(quoteStart + 1, quoteEnd)
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
        }
      }
      
      // Extract key points
      let keyPoints = [];
      const keyPointsMatch = jsonStr.match(/"keyPoints"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
      if (keyPointsMatch) {
        const pointsStr = keyPointsMatch[1];
        const pointMatches = pointsStr.match(/"([^"]+)"/g);
        if (pointMatches) {
          keyPoints = pointMatches.map(p => p.replace(/"/g, ''));
        }
      }
      
      // Extract difficulty
      const difficultyMatch = jsonStr.match(/"difficulty"\s*:\s*"(\w+)"/);
      const difficulty = difficultyMatch ? difficultyMatch[1] : 'intermediate';
      
      // Extract topics
      let topics = [];
      const topicsMatch = jsonStr.match(/"topics"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
      if (topicsMatch) {
        const topicMatches = topicsMatch[1].match(/"([^"]+)"/g);
        if (topicMatches) {
          topics = topicMatches.map(t => t.replace(/"/g, ''));
        }
      }
      
      if (summaryText) {
        result = {
          summary: summaryText,
          mainConcepts: topics.length > 0 ? topics : ['Core concepts', 'Fundamentals', 'Best practices'],
          keyPoints: keyPoints.length > 0 ? keyPoints : ['Key concepts from this video'],
          keywords: topics.length > 0 ? topics : [title.split(' ')[0]],
          practicalApplications: ['Apply in real projects', 'Practice exercises'],
          nextSteps: ['Review the material', 'Try hands-on examples'],
          difficulty: difficulty
        };
        console.log('✅ Recovered partial summary data');
      } else {
        // If all else fails, create a basic summary from the video title
        result = {
          summary: `This video covers ${title}. The content provides educational insights and key concepts related to the topic.`,
          mainConcepts: ['Core concepts', 'Fundamentals', 'Best practices'],
          keyPoints: ['Main topic covered in the video', 'Key concepts explained', 'Practical examples demonstrated'],
          keywords: [title.split(' ')[0], 'learning', 'tutorial'],
          practicalApplications: ['Apply in real projects', 'Practice exercises'],
          nextSteps: ['Review the material', 'Try hands-on examples'],
          difficulty: 'intermediate'
        };
        console.log('⚠️ Using fallback summary');
      }
    }
    
    // Ensure all required fields exist with defaults
    const finalResult = {
      summary: result.summary || `This video covers ${title}.`,
      mainConcepts: result.mainConcepts || result.topics || ['Core concepts', 'Fundamentals', 'Best practices'],
      keyPoints: result.keyPoints || ['Key learning points from this video'],
      keywords: result.keywords || result.topics || [title.split(' ')[0]],
      practicalApplications: result.practicalApplications || ['Apply in real projects', 'Practice exercises'],
      nextSteps: result.nextSteps || ['Review the material', 'Try hands-on examples'],
      difficulty: result.difficulty || 'intermediate'
    };
    
    console.log(`✅ Generated summary with ${finalResult.keyPoints?.length || 0} key points`);
    return finalResult;
    
  } catch (error) {
    console.error('❌ Summary generation error:', error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

module.exports = {
  generateSummary
};