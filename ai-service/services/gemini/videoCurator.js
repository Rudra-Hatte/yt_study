const { getGeminiModel } = require('../../config/gemini');

/**
 * Recommend related videos or curate learning paths
 * @param {Array} watchHistory - Array of videos the user has watched
 * @param {Array} availableVideos - Array of available videos in the database
 * @param {string} learningGoal - Optional learning goal specified by the user
 * @returns {Object} Recommended videos and suggested learning path
 */
async function curateVideos(watchHistory, availableVideos, learningGoal = '') {
  try {
    const model = getGeminiModel();
    
    // Format watch history for the prompt
    const watchHistoryText = watchHistory.map(video => 
      `- ${video.title} (${video.tags ? video.tags.join(', ') : 'No tags'})`
    ).join('\n');
    
    // Format available videos for the prompt (limit to 50 to avoid token limits)
    const limitedVideos = availableVideos.slice(0, 50);
    const availableVideosText = limitedVideos.map(video => 
      `ID: ${video.id} | ${video.title} | ${video.description ? video.description.substring(0, 100) + '...' : 'No description'} | Tags: ${video.tags ? video.tags.join(', ') : 'No tags'} | Difficulty: ${video.difficulty || 'Not specified'}`
    ).join('\n');
    
    const prompt = `
You are an educational content curator specializing in creating personalized learning paths. 
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

Format the output as valid JSON with this structure:
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
}
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
    console.error('Error curating videos:', error);
    throw new Error(`Failed to curate videos: ${error.message}`);
  }
}

module.exports = {
  curateVideos
};