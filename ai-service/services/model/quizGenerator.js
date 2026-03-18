const { chatWithFallback } = require('../modelClient');
require('dotenv').config();

/**
 * Generate quiz questions using the model gateway
 * @param {string} videoId - The YouTube video ID
 * @param {string} title - The video title
 * @param {number} numQuestions - Number of questions to generate (default: 5)
 * @param {string} difficulty - Quiz difficulty level (easy, medium, hard)
 * @returns {Array} Array of quiz questions with options and correct answers
 */
async function generateQuiz(videoId, title, numQuestions = 5, difficulty = 'medium') {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('🎬 Generating quiz for video:', videoUrl);
  console.log('📝 Title:', title);
  
  const prompt = `You are a quiz generator. Based on the YouTube video title and topic, create ${numQuestions} multiple-choice quiz questions at ${difficulty} difficulty level.

Video Title: "${title}"
Video URL: ${videoUrl}

Create educational questions that would test understanding of a video about this topic. Make the questions relevant to what someone would learn from watching a video with this title.
Also that questions should be techincal as well more complex and related to video not just therotical questions 
IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON object.

The JSON must have this exact structure:
{"questions":[{"question":"Question text here?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"explanation":"Brief explanation of why the correct answer is right"}]}

Where correctAnswer is the index (0-3) of the correct option in the options array.`;

  try {
    console.log('🤖 Calling model gateway for quiz generation...');
    const response = await chatWithFallback({
      systemPrompt: 'You are a quiz generator that creates educational multiple-choice questions. Always respond with valid JSON only, no markdown or extra text.',
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 2000
    });

    const textResponse = response.text || '';
    console.log('✅ Model response received');
    
    // Extract JSON from response
    let jsonStr = textResponse.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/) || 
                      jsonStr.match(/```\n?([\s\S]*?)\n?```/) ||
                      jsonStr.match(/({[\s\S]*})/);
                      
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const result = JSON.parse(jsonStr);
    console.log(`✅ Generated ${result.questions?.length || 0} quiz questions`);
    return result;
    
  } catch (error) {
    console.error('❌ Quiz generation error:', error.message);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

module.exports = {
  generateQuiz
};