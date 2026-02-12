const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize Groq client
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  return new Groq({ apiKey });
};

/**
 * Recommend related videos or curate learning paths using Groq AI
 * @param {Array} watchHistory - Array of videos the user has watched
 * @param {Array} availableVideos - Array of available videos in the database
 * @param {string} learningGoal - Optional learning goal specified by the user
 * @returns {Object} Recommended videos and suggested learning path
 */
async function curateVideos(watchHistory, availableVideos, learningGoal = '') {
  try {
    console.log('🤖 Curating videos with Groq AI (Llama 3.3)...');
    const client = getGroqClient();
    
    // Format watch history for the prompt
    const watchHistoryText = watchHistory.map(video => 
      `- ${video.title} (${video.tags ? video.tags.join(', ') : 'No tags'})`
    ).join('\n');
    
    // Format available videos for the prompt (limit to 50 to avoid token limits)
    const limitedVideos = availableVideos.slice(0, 50);
    const availableVideosText = limitedVideos.map(video => 
      `ID: ${video.id} | ${video.title} | ${video.description ? video.description.substring(0, 100) + '...' : 'No description'} | Tags: ${video.tags ? video.tags.join(', ') : 'No tags'} | Difficulty: ${video.difficulty || 'Not specified'}`
    ).join('\n');
    
    const prompt = `You are an educational content curator specializing in creating personalized learning paths. 
Based on a user's watch history and available videos, recommend the most relevant next videos and suggest a learning path.

USER'S WATCH HISTORY:
${watchHistoryText || "No watch history available"}

USER'S LEARNING GOAL:
${learningGoal || "Not specified"}

AVAILABLE VIDEOS:
${availableVideosText || "No videos available"}

Please analyze the watch history and learning goal, then:
1. Recommend the top 5 most relevant next videos from the available videos list (use their IDs)
2. Suggest a logical learning path with 3-5 videos in sequence
3. Explain why these recommendations would help the user achieve their learning goal

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON object.

The JSON must have this exact structure:
{
  "recommendedVideos": ["video_id1", "video_id2", "video_id3", "video_id4", "video_id5"],
  "learningPath": [
    {
      "videoId": "video_id",
      "stepNumber": 1,
      "rationale": "Why this video is important at this step"
    }
  ],
  "explanation": "Overall explanation of the recommendations"
}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content curator. Always respond with valid JSON only, no markdown or extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const textResponse = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq responded successfully for video curation');
    
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
    console.log('✅ Video curation completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Error curating videos:', error.message);
    throw new Error(`Failed to curate videos: ${error.message}`);
  }
}

module.exports = {
  curateVideos
};