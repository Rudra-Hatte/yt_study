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
 * Generate flashcards using Groq AI (Llama 3.3) with RAG enhancement
 * @param {string} videoId - The YouTube video ID
 * @param {string} title - The video title
 * @param {number} numCards - Number of flashcards to generate (default: 10)
 * @param {Object} options - Additional options including RAG context
 * @returns {Array} Array of flashcards with front and back content
 */
async function generateFlashcards(videoId, title, numCards = 10, options = {}) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('📚 Generating RAG-enhanced flashcards for video:', videoUrl);
  console.log('📝 Title:', title);
  
  const { courseId, transcript, enableRAG = true } = options;
  
  // Base prompt
  let prompt = `You are an expert at creating educational flashcards. Based on the YouTube video title and topic, create ${numCards} effective flashcards that highlight key concepts, definitions, and principles.

Video Title: "${title}"
Video URL: ${videoUrl}

Create educational flashcards that would help someone learn from a video about this topic. Make the flashcards relevant to what someone would learn from watching a video with this title.

For each flashcard:
1. Front side should contain a clear question, term, or concept
2. Back side should contain a concise but comprehensive answer or explanation
3. Focus on the most important concepts related to this topic
4. Ensure the flashcards cover different aspects of the content
5. Make flashcards technical and practical, not just theoretical

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON object.

The JSON must have this exact structure:
{"flashcards":[{"front":"Question or term here","back":"Answer or explanation here","tags":["relevant","topic","tags"]}]}`;

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
      const ragResult = await ragService.generateEnhancedFlashcards(
        videoId, 
        title, 
        transcript, 
        { courseId, numCards }
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
        
        console.log(`🎯 Using RAG-enhanced flashcards prompt with ${ragMetadata.contextCount} context sources`);
      }
    } catch (ragError) {
      console.log('⚠️ RAG enhancement failed, using fallback:', ragError.message);
      ragMetadata.recommendations.push('RAG enhancement unavailable');
    }
  }

  try {
    console.log('🤖 Calling Groq AI (Llama 3.3) for flashcards...');
    const client = getGroqClient();
    
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an educational flashcard creator. Always respond with valid JSON only, no markdown or extra text.'
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
    console.log('✅ Groq responded successfully for flashcards');
    
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
      
      // Try to extract flashcards array even if JSON is malformed
      const flashcardsMatch = jsonStr.match(/"flashcards"\s*:\s*\[([\s\S]*)\]/);
      
      if (flashcardsMatch) {
        try {
          // Try to extract individual flashcard objects
          const cardMatches = flashcardsMatch[1].matchAll(/{[^{}]*"front"[^{}]*"back"[^{}]*}/g);
          const cards = [];
          
          for (const match of cardMatches) {
            try {
              const card = JSON.parse(match[0]);
              if (card.front && card.back) {
                cards.push({
                  front: card.front,
                  back: card.back,
                  tags: card.tags || []
                });
              }
            } catch (e) {
              // Skip malformed cards
            }
          }
          
          if (cards.length > 0) {
            result = { flashcards: cards };
            console.log(`✅ Recovered ${cards.length} flashcards from partial data`);
          } else {
            throw parseError;
          }
        } catch (e) {
          throw parseError;
        }
      } else {
        throw parseError;
      }
    }
    
    // Add RAG metadata to the result
    const finalResult = {
      ...result,
      ragMetadata
    };
    
    console.log(`✅ Generated ${ragMetadata.enhanced ? 'RAG-enhanced' : 'standard'} ${result.flashcards?.length || 0} flashcards`);
    return finalResult;
    
  } catch (error) {
    console.error('❌ Flashcard generation error:', error.message);
    
    // Return fallback result with RAG metadata
    const fallbackResult = {
      flashcards: [{
        front: `What is ${title}?`,
        back: 'This is a fallback flashcard generated due to processing error.',
        tags: ['fallback', 'error']
      }],
      ragMetadata: {
        enhanced: false,
        sourcesUsed: [],
        contextCount: 0,
        averageRelevance: 0,
        recommendations: ['Flashcard generation failed'],
        error: error.message
      }
    };
    
    return fallbackResult;
  }
}

module.exports = {
  generateFlashcards
};