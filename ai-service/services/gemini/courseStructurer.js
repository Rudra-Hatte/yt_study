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
 * Generate structured course outline with logical progression using Groq AI
 * @param {Array} videoSummaries - Array of video summaries with metadata
 * @param {string} courseTopic - The main course topic
 * @returns {Object} Structured course outline with modules
 */
async function generateCourseStructure(videoSummaries, courseTopic) {
  try {
    console.log('🤖 Generating course structure with Groq AI (Llama 3.3)...');
    const client = getGroqClient();
    
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

    const prompt = `You are an expert educational course designer. Based on the following video summaries for the topic "${courseTopic}", create a structured learning path with logical progression from fundamental concepts to advanced topics.

VIDEOS TO ANALYZE:
${videoAnalysisText}

Create a structured course outline that:
1. Groups videos into logical learning modules
2. Orders modules from foundational to advanced
3. Ensures prerequisite knowledge is covered before dependent concepts
4. Creates smooth learning progression

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON object.

The JSON must have this exact structure:
{
  "courseStructure": {
    "title": "Generated course title",
    "description": "Course overview and learning objectives",
    "estimatedDuration": "Total estimated learning time",
    "difficulty": "beginner|intermediate|advanced",
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
}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational course designer. Always respond with valid JSON only, no markdown or extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const textResponse = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq responded successfully for course structure');
    
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
    console.log('✅ Course structure generated successfully');
    return result;
  } catch (error) {
    console.error('❌ Error generating course structure:', error.message);
    throw new Error(`Failed to generate course structure: ${error.message}`);
  }
}

/**
 * Generate semantic representations and concept relationships using Groq AI
 * @param {Array} transcripts - Array of video transcripts
 * @param {string} courseTopic - Main course topic
 * @returns {Object} Semantic analysis and concept relationships
 */
async function analyzeConceptRelationships(transcripts, courseTopic) {
  try {
    console.log('🤖 Analyzing concept relationships with Groq AI (Llama 3.3)...');
    const client = getGroqClient();
    
    // Limit analysis to avoid token limits
    const limitedTranscripts = transcripts.slice(0, 10).map((transcript, index) => 
      `Transcript ${index + 1}:\n${transcript.substring(0, 2000)}...\n---`
    ).join('\n\n');

    const prompt = `You are an expert in educational content analysis. Analyze the following video transcripts for the topic "${courseTopic}" to identify:
1. Key concepts and their relationships
2. Prerequisite dependencies between concepts
3. Concept difficulty levels
4. Learning progression recommendations

TRANSCRIPTS:
${limitedTranscripts}

IMPORTANT: Return ONLY valid JSON with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON object.

The JSON must have this exact structure:
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
}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in educational content analysis. Always respond with valid JSON only, no markdown or extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const textResponse = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq responded successfully for concept analysis');
    
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
    console.log('✅ Concept relationships analyzed successfully');
    return result;
  } catch (error) {
    console.error('❌ Error analyzing concept relationships:', error.message);
    throw new Error(`Failed to analyze concept relationships: ${error.message}`);
  }
}

module.exports = {
  generateCourseStructure,
  analyzeConceptRelationships
};