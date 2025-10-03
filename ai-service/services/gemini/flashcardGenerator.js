const { getGeminiModel } = require('../../config/gemini');

/**
 * Generate flashcards from video transcript
 * @param {string} transcript - The video transcript text
 * @param {string} title - The video title
 * @param {number} numCards - Number of flashcards to generate (default: 10)
 * @returns {Array} Array of flashcards with front and back content
 */
async function generateFlashcards(transcript, title, numCards = 10) {
  try {
    const model = getGeminiModel();
    
    // Truncate transcript if too long (Gemini has token limits)
    const maxTranscriptLength = 15000;
    const truncatedTranscript = transcript.length > maxTranscriptLength 
      ? transcript.substring(0, maxTranscriptLength) + "..." 
      : transcript;
    
    const prompt = `
You are an expert at creating educational flashcards. Based on the following video transcript, create ${numCards} effective flashcards that highlight key concepts, definitions, and principles.
The video is titled: "${title}"

For each flashcard:
1. Front side should contain a clear question, term, or concept
2. Back side should contain a concise but comprehensive answer or explanation
3. Focus on the most important information in the transcript
4. Ensure the flashcards cover different aspects of the content

Format the output as valid JSON with this structure:
{
  "flashcards": [
    {
      "front": "Question or term here",
      "back": "Answer or explanation here",
      "tags": ["relevant", "topic", "tags"]
    }
  ]
}

VIDEO TRANSCRIPT:
${truncatedTranscript}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Extract the JSON part from the response
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      textResponse.match(/```\n([\s\S]*?)\n```/) ||
                      textResponse.match(/({[\s\S]*})/);
                      
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    } else {
      // If no JSON formatting found, try to parse the whole response
      return JSON.parse(textResponse);
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
}

module.exports = {
  generateFlashcards
};