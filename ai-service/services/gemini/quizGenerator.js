const { getGeminiModel } = require('../../config/gemini');

/**
 * Generate quiz questions based on video transcript
 * @param {string} transcript - The video transcript text
 * @param {string} title - The video title
 * @param {number} numQuestions - Number of questions to generate (default: 5)
 * @param {string} difficulty - Quiz difficulty level (easy, medium, hard)
 * @returns {Array} Array of quiz questions with options and correct answers
 */
async function generateQuiz(transcript, title, numQuestions = 5, difficulty = 'medium') {
  try {
    const model = getGeminiModel();
    
    // Truncate transcript if too long (Gemini has token limits)
    const maxTranscriptLength = 15000;
    const truncatedTranscript = transcript.length > maxTranscriptLength 
      ? transcript.substring(0, maxTranscriptLength) + "..." 
      : transcript;
    
    const prompt = `
You are an educational quiz creator. Based on the following video transcript, create ${numQuestions} multiple-choice questions at a ${difficulty} difficulty level.
The video is titled: "${title}"

For each question:
1. Make sure the question is directly based on the content in the transcript
2. Provide 4 possible answers (A, B, C, D)
3. Indicate the correct answer
4. Add a brief explanation why it's correct

Format the output as valid JSON with this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, // Index of the correct option (0-3)
      "explanation": "Brief explanation why this is correct"
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
    console.error('Error generating quiz:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

module.exports = {
  generateQuiz
};