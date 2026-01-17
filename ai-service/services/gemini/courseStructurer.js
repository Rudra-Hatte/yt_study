const { getGeminiModel } = require('../../config/gemini');

/**
 * Generate structured course outline with logical progression
 * @param {Array} videoSummaries - Array of video summaries with metadata
 * @param {string} courseTopic - The main course topic
 * @returns {Object} Structured course outline with modules
 */
async function generateCourseStructure(videoSummaries, courseTopic) {
  try {
    const model = getGeminiModel();
    
    // Format video summaries for analysis
    const videoAnalysisText = videoSummaries.map((video, index) => 
      `Video ${index + 1}: "${video.title}"
      Summary: ${video.summary}
      Key Points: ${video.keyPoints?.join(', ')}
      Topics: ${video.topics?.join(', ')}
      Difficulty: ${video.difficulty}
      Duration: ${video.duration}
      ---`
    ).join('\n\n');

    const prompt = `
You are an expert educational course designer. Based on the following video summaries for the topic "${courseTopic}", create a structured learning path with logical progression from fundamental concepts to advanced topics.

VIDEOS TO ANALYZE:
${videoAnalysisText}

Create a structured course outline that:
1. Groups videos into logical learning modules
2. Orders modules from foundational to advanced
3. Ensures prerequisite knowledge is covered before dependent concepts
4. Creates smooth learning progression

Format the output as valid JSON with this structure:
{
  "courseStructure": {
    "title": "Generated course title",
    "description": "Course overview and learning objectives",
    "estimatedDuration": "Total estimated learning time",
    "difficulty": "overall|beginner|intermediate|advanced",
    "modules": [
      {
        "moduleNumber": 1,
        "title": "Module title",
        "description": "What students will learn in this module",
        "estimatedDuration": "Module duration",
        "difficulty": "module difficulty level",
        "videos": [
          {
            "videoIndex": 0,
            "title": "Video title",
            "rationale": "Why this video belongs here in the learning path",
            "prerequisites": ["concepts that should be learned first"],
            "learningObjectives": ["what students will learn"]
          }
        ]
      }
    ]
  },
  "learningPath": {
    "totalVideos": 5,
    "recommendedSequence": [0, 1, 2, 3, 4],
    "alternativeSequences": [
      {
        "name": "Fast Track",
        "description": "For students with prior knowledge",
        "sequence": [0, 2, 4]
      }
    ]
  },
  "prerequisites": ["Overall course prerequisites"],
  "learningOutcomes": ["What students will achieve after completing the course"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Extract JSON from response
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      textResponse.match(/```\n([\s\S]*?)\n```/) ||
                      textResponse.match(/({[\s\S]*})/);
                      
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    } else {
      return JSON.parse(textResponse);
    }
  } catch (error) {
    console.error('Error generating course structure:', error);
    throw new Error(`Failed to generate course structure: ${error.message}`);
  }
}

/**
 * Generate semantic representations and concept relationships
 * @param {Array} transcripts - Array of video transcripts
 * @param {string} courseTopic - Main course topic
 * @returns {Object} Semantic analysis and concept relationships
 */
async function analyzeConceptRelationships(transcripts, courseTopic) {
  try {
    const model = getGeminiModel();
    
    // Limit analysis to avoid token limits
    const limitedTranscripts = transcripts.slice(0, 10).map((transcript, index) => 
      `Transcript ${index + 1}:\n${transcript.substring(0, 2000)}...\n---`
    ).join('\n\n');

    const prompt = `
You are an expert in educational content analysis. Analyze the following video transcripts for the topic "${courseTopic}" to identify:
1. Key concepts and their relationships
2. Prerequisite dependencies between concepts
3. Concept difficulty levels
4. Learning progression recommendations

TRANSCRIPTS:
${limitedTranscripts}

Provide a semantic analysis with this JSON structure:
{
  "concepts": [
    {
      "name": "Concept name",
      "description": "Brief description",
      "difficulty": "beginner|intermediate|advanced",
      "prerequisites": ["required concepts"],
      "relatedConcepts": ["similar or connected concepts"],
      "videoReferences": [0, 1, 2]
    }
  ],
  "conceptMap": {
    "fundamentalConcepts": ["concepts to learn first"],
    "intermediateConcepts": ["concepts requiring fundamentals"],
    "advancedConcepts": ["concepts requiring intermediate knowledge"]
  },
  "semanticClusters": [
    {
      "clusterName": "Topic cluster name",
      "concepts": ["related concepts"],
      "recommendedOrder": [0, 1, 2]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Extract JSON from response
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      textResponse.match(/```\n([\s\S]*?)\n```/) ||
                      textResponse.match(/({[\s\S]*})/);
                      
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    } else {
      return JSON.parse(textResponse);
    }
  } catch (error) {
    console.error('Error analyzing concept relationships:', error);
    throw new Error(`Failed to analyze concept relationships: ${error.message}`);
  }
}

module.exports = {
  generateCourseStructure,
  analyzeConceptRelationships
};