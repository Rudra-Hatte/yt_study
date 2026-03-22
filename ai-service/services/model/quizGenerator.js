const { chatWithFallback } = require('../modelClient');
require('dotenv').config();

/**
 * Generate quiz questions using the model gateway
 * @param {string} videoId - The YouTube video ID
 * @param {string} title - The video title
 * @param {number} numQuestions - Number of questions to generate (default: 5)
 * @param {string} difficulty - Quiz difficulty level (easy, medium, hard)
 * @param {string} [transcript] - Optional video transcript for better context
 * @param {string} [focusTopic] - Optional lesson topic to force topic-based questions
 * @returns {Array} Array of quiz questions with options and correct answers
 */
async function generateQuiz(videoId, title, numQuestions = 5, difficulty = 'medium', transcript = null, focusTopic = null) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const topicLabel = String(focusTopic || '').trim();
  console.log('Generating quiz for video:', videoUrl);
  console.log('Title:', title);
  if (topicLabel) {
    console.log('Topic focus:', topicLabel);
  }
  if (transcript) {
    console.log('Using transcript content (length:', transcript.length, 'chars)');
  }
  
  let contentSource = '';
  if (topicLabel) {
    contentSource = `Study Topic: "${topicLabel}"\n`;
  } else if (transcript && transcript.trim().length > 100) {
    // Use the actual transcript content
    contentSource = `Video Transcript (first 3000 chars):\n${transcript.substring(0, 3000)}\n\n`;
  } else {
    // Fallback to title-based generation
    contentSource = `Video Title: "${title}"\n`;
  }
  
  const prompt = `You are a quiz generator. Create ${numQuestions} multiple-choice quiz questions at ${difficulty} difficulty level.

${contentSource}
Video URL: ${videoUrl}

${topicLabel ? `Generate questions only about "${topicLabel}". Do not ask questions about video naming words like tutorial/course/beginners.
` : 'Create educational questions that test understanding of the actual video content/topic. Make questions technical, complex, and relevant to what someone would learn from this video.'}

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON object.

The JSON must have this exact structure:
{"questions":[{"question":"Question text here?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"explanation":"Brief explanation of why the correct answer is right"}]}

Where correctAnswer is the index (0-3) of the correct option in the options array.`;

  try {
    console.log('Calling model gateway for quiz generation...');
    const response = await chatWithFallback({
      systemPrompt: 'You are a quiz generator that creates educational multiple-choice questions. Always respond with valid JSON only, no markdown or extra text.',
      userPrompt: prompt,
      temperature: 0.7,
      maxTokens: 2000
    });

    const textResponse = response.text || '';
    console.log('Model response received');
    
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
    console.log(`Generated ${result.questions?.length || 0} quiz questions`);
    return result;
    
  } catch (error) {
    console.error('Quiz generation error:', error.message);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

module.exports = {
  generateQuiz
};