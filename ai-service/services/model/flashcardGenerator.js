const { chatWithFallback } = require('../modelClient');

/**
 * Generate flashcards using the model gateway based on video title
 * @param {string} videoId - The YouTube video ID
 * @param {string} title - The video title
 * @param {number} numCards - Number of flashcards to generate (default: 10)
 * @returns {Array} Array of flashcards with front and back content
 */
async function generateFlashcards(videoId, title, numCards = 10) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('📚 Generating flashcards for video:', videoUrl);
  console.log('📝 Title:', title);
  
  const prompt = `You are an expert at creating educational flashcards. Based on the YouTube video title and topic, create ${numCards} effective flashcards that highlight key concepts, definitions, and principles.

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

  try {
    console.log('🤖 Calling model gateway for flashcards...');
    const response = await chatWithFallback({
      systemPrompt: 'You are an educational flashcard creator. Always respond with valid JSON only, no markdown or extra text.',
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 3000
    });

    const textResponse = response.text || '';
    console.log('✅ Model response received for flashcards');
    
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
    
    console.log(`✅ Generated ${result.flashcards?.length || 0} flashcards`);
    return result;
    
  } catch (error) {
    console.error('❌ Flashcard generation error:', error.message);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
}

module.exports = {
  generateFlashcards
};