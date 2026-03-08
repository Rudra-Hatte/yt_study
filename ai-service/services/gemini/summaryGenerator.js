const Groq = require('groq-sdk');
const { getRAGService } = require('../ragService');

// Initialize Groq client
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return new Groq({ apiKey });
};

/**
 * Generate summary using Groq AI (Llama 3.3) with RAG enhancement
 * @param {string} videoId - The YouTube video ID
 * @param {string} title - The video title
 * @param {string} format - Summary format (brief, detailed, bullet)
 * @param {Object} options - Additional options including RAG context
 * @returns {Object} Summary and key points with RAG metadata
 */
async function generateSummary(videoId, title, format = 'detailed', options = {}) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('📝 Generating RAG-enhanced summary for video:', videoUrl);
  console.log('📝 Title:', title);
  
  const { courseId, transcript, enableRAG = true } = options;
  
  let formatInstructions = '';
  if (format === 'brief') {
    formatInstructions = 'Create a concise summary in 3-4 sentences.';
  } else if (format === 'bullet') {
    formatInstructions = 'Create a bullet-point summary with the main points.';
  } else {
    formatInstructions = 'Create a detailed summary in 5-7 paragraphs covering the main topics.';
  }
  
  // Base prompt
  let prompt = `You are an expert educational content summarizer. Based on the YouTube video title and topic, ${formatInstructions}

Video Title: "${title}"
Video URL: ${videoUrl}

Create a comprehensive educational summary. Return ONLY valid JSON with NO markdown, NO code blocks.

JSON structure (keep responses concise to avoid truncation):
{"summary":"2-3 sentence overview","mainConcepts":["concept1","concept2","concept3"],"keyPoints":["point1","point2","point3"],"keywords":["word1","word2","word3"],"practicalApplications":["app1","app2"],"nextSteps":["step1","step2"],"difficulty":"beginner"}

Where difficulty is: beginner, intermediate, or advanced`;

  let ragMetadata = {
    enhanced: false,
    sourcesUsed: [],
    contextCount: 0,
    averageRelevance: 0,
    recommendations: []
  };

  // Attempt RAG enhancement
  if (enableRAG) {
    try {
      const ragService = getRAGService();
      const ragResult = await ragService.generateEnhancedSummary(
        videoId, 
        title, 
        transcript, 
        { courseId, format }
      );
      
      if (ragResult && ragResult.enhancedPrompt) {
        prompt = ragResult.enhancedPrompt;
        ragMetadata = {
          enhanced: true,
          sourcesUsed: ragResult.contextInfo?.sourcesUsed || [],
          contextCount: ragResult.contextInfo?.contextCount || 0,
          averageRelevance: ragResult.contextInfo?.averageRelevance || 0,
          recommendations: ragResult.recommendations || []
        };
        
        console.log(`🎯 Using RAG-enhanced prompt with ${ragMetadata.contextCount} context sources`);
      }
    } catch (ragError) {
      console.log('⚠️ RAG enhancement failed, using fallback:', ragError.message);
      ragMetadata.recommendations.push('RAG enhancement unavailable');
    }
  }

  try {
    console.log('🤖 Calling Groq AI (Llama 3.3) for summary...');
    const client = getGroqClient();
    
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content summarizer. Always respond with valid JSON only, no markdown or extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const textResponse = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq responded successfully for summary');
    
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
      difficulty: result.difficulty || 'intermediate',
      // RAG metadata
      ragMetadata
    };
    
    console.log(`✅ Generated ${ragMetadata.enhanced ? 'RAG-enhanced' : 'standard'} summary with ${finalResult.keyPoints?.length || 0} key points`);
    return finalResult;
    
  } catch (error) {
    console.error('❌ Summary generation error:', error.message);
    
    // Return fallback result with RAG metadata 
    const fallbackResult = {
      summary: `This video covers ${title}. Unable to generate detailed summary due to an error.`,
      mainConcepts: ['Core concepts', 'Fundamentals'],
      keyPoints: ['Main topic from video title'],
      keywords: [title.split(' ')[0] || 'video'],
      practicalApplications: ['Review content when available'],
      nextSteps: ['Try generating summary again'],
      difficulty: 'intermediate',
      ragMetadata: {
        enhanced: false,
        sourcesUsed: [],
        contextCount: 0,
        averageRelevance: 0,
        recommendations: ['Summary generation failed'],
        error: error.message
      }
    };
    
    return fallbackResult;
  }
}

module.exports = {
  generateSummary
};