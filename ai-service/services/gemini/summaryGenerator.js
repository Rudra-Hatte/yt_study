const { getGeminiModel } = require('../../config/gemini');

/**
 * Generate summary from video transcript
 * @param {string} transcript - The video transcript text
 * @param {string} title - The video title
 * @param {string} format - Summary format (brief, detailed, bullet)
 * @returns {Object} Summary and key points
 */
async function generateSummary(transcript, title, format = 'detailed') {
  try {
    const model = getGeminiModel();
    
    // Truncate transcript if too long (Gemini has token limits)
    const maxTranscriptLength = 15000;
    const truncatedTranscript = transcript.length > maxTranscriptLength 
      ? transcript.substring(0, maxTranscriptLength) + "..." 
      : transcript;
    
    let formatInstructions = '';
    if (format === 'brief') {
      formatInstructions = 'Create a concise summary in 3-4 sentences.';
    } else if (format === 'bullet') {
      formatInstructions = 'Create a bullet-point summary with the main points.';
    } else {
      formatInstructions = 'Create a detailed summary in 5-7 paragraphs covering the main topics.';
    }
    
    const prompt = `
You are an expert educational content summarizer. Based on the following video transcript, ${formatInstructions}
The video is titled: "${title}"

Additionally, extract 5-7 key learning points from the content.

Format the output as valid JSON with this structure:
{
  "summary": "The complete summary here",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    etc.
  ],
  "difficulty": "beginner|intermediate|advanced", // Estimate the content difficulty
  "topics": ["topic1", "topic2"] // Main topics covered
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
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

module.exports = {
  generateSummary
};