const { generateCourseStructure, analyzeConceptRelationships } = require('../services/model/courseStructurer');
const { generateSummary } = require('../services/model/summaryGenerator');
const { buildPersonalizedCourse } = require('../services/coursePlanner');
const { getVideoTranscript } = require('../utils/youtube');
const { preprocessTranscript } = require('../utils/contentPreprocessor');

/**
 * Generate a complete course with AI-powered content curation
 */
exports.generateCourseAI = async (req, res, next) => {
  try {
    const { topic, difficulty = 'beginner', duration = '4-6 hours', requireAiTopicFlow = true } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      });
    }

    // Generate algorithmic personalized course structure
    const aiCourseStructure = await buildPersonalizedCourse(topic, difficulty, duration);

    const topicFlowSource = aiCourseStructure?.metadata?.topicFlow?.source;
    if (requireAiTopicFlow && topicFlowSource === 'fallback') {
      return res.status(503).json({
        success: false,
        error: 'AI topic planner is unavailable. Please check model API keys and PRIMARY_MODEL configuration.',
        details: aiCourseStructure?.metadata?.topicFlow || null
      });
    }

    res.json({
      success: true,
      data: aiCourseStructure
    });

  } catch (error) {
    console.error('AI Course generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI course'
    });
  }
};

/**
 * Generate a complete course structure from a topic and video URLs
 */
exports.generateCourse = async (req, res, next) => {
  try {
    const { topic, videoUrls, title, description } = req.body;
    
    if (!topic || !videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic and video URLs are required' 
      });
    }

    const courseData = {
      topic,
      title: title || `Learning ${topic}`,
      description: description || `A comprehensive course on ${topic} generated from curated video content.`,
      videos: [],
      processing: {
        totalVideos: videoUrls.length,
        processedVideos: 0,
        errors: []
      }
    };

    // Process each video
    for (let i = 0; i < videoUrls.length; i++) {
      try {
        const videoUrl = videoUrls[i];
        const videoId = extractVideoId(videoUrl);
        
        if (!videoId) {
          courseData.processing.errors.push({
            videoIndex: i,
            url: videoUrl,
            error: 'Invalid YouTube URL'
          });
          continue;
        }

        // Get transcript and preprocess it
        const rawTranscript = await getVideoTranscript(videoId);
        const preprocessedContent = preprocessTranscript(rawTranscript);
        
        // Generate summary and analysis
        const summaryData = await generateSummary(
          preprocessedContent.cleanedText,
          `Video ${i + 1} - ${topic}`,
          'detailed'
        );

        courseData.videos.push({
          index: i,
          videoId,
          url: videoUrl,
          transcript: {
            raw: rawTranscript,
            processed: preprocessedContent
          },
          analysis: summaryData,
          metadata: {
            estimatedWatchTime: Math.ceil(preprocessedContent.metadata.wordCount / 150), // Words per minute for video
            readingTime: preprocessedContent.metadata.estimatedReadingTime,
            complexity: preprocessedContent.metadata.contentComplexity,
            primaryTopics: preprocessedContent.metadata.primaryTopics
          }
        });

        courseData.processing.processedVideos++;
        
      } catch (error) {
        courseData.processing.errors.push({
          videoIndex: i,
          url: videoUrls[i],
          error: error.message
        });
      }
    }

    if (courseData.videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No videos could be processed successfully',
        details: courseData.processing.errors
      });
    }

    // Prepare video summaries for structure generation
    const videoSummaries = courseData.videos.map(video => ({
      title: video.analysis.title || `Video ${video.index + 1}`,
      summary: video.analysis.summary,
      keyPoints: video.analysis.keyPoints,
      topics: video.analysis.topics,
      difficulty: video.analysis.difficulty,
      duration: video.metadata.estimatedWatchTime,
      complexity: video.metadata.complexity
    }));

    // Generate structured course outline
    const courseStructure = await generateCourseStructure(videoSummaries, topic);

    // Analyze concept relationships for semantic understanding
    const transcripts = courseData.videos.map(video => video.transcript.processed.cleanedText);
    const conceptAnalysis = await analyzeConceptRelationships(transcripts, topic);

    // Compile final course data
    const finalCourse = {
      ...courseData,
      structure: courseStructure,
      conceptualFramework: conceptAnalysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - req.startTime,
        totalDuration: videoSummaries.reduce((total, video) => total + video.duration, 0),
        averageComplexity: calculateAverageComplexity(courseData.videos),
        recommendedLearningPath: courseStructure.learningPath.recommendedSequence
      }
    };

    res.json({ 
      success: true, 
      data: finalCourse,
      message: `Course generated successfully with ${courseData.videos.length} videos`
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Generate learning modules from existing course content
 */
exports.generateModules = async (req, res, next) => {
  try {
    const { courseId, moduleCount = 'auto' } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Course ID is required' 
      });
    }

    // This would typically fetch course data from database
    // For now, we'll expect the course data to be provided in the request
    const { courseData } = req.body;
    
    if (!courseData || !courseData.videos) {
      return res.status(400).json({
        success: false,
        error: 'Course data with videos is required'
      });
    }

    // Prepare video summaries
    const videoSummaries = courseData.videos.map(video => ({
      title: video.title || `Video ${video.index + 1}`,
      summary: video.analysis?.summary || video.summary,
      keyPoints: video.analysis?.keyPoints || video.keyPoints || [],
      topics: video.analysis?.topics || video.topics || [],
      difficulty: video.analysis?.difficulty || video.difficulty || 'intermediate',
      duration: video.metadata?.estimatedWatchTime || video.duration || 5
    }));

    // Generate modules
    const moduleStructure = await generateCourseStructure(videoSummaries, courseData.topic);

    res.json({
      success: true,
      data: moduleStructure,
      message: 'Learning modules generated successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Analyze content relationships for personalized learning paths
 */
exports.analyzeContentRelationships = async (req, res, next) => {
  try {
    const { transcripts, topic } = req.body;
    
    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transcripts array is required'
      });
    }

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const conceptAnalysis = await analyzeConceptRelationships(transcripts, topic);

    res.json({
      success: true,
      data: conceptAnalysis,
      message: 'Content relationships analyzed successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to extract video ID from YouTube URL
 */
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Calculate average complexity across videos
 */
function calculateAverageComplexity(videos) {
  if (!videos || videos.length === 0) return 'intermediate';
  
  const complexityScores = videos.map(video => {
    const complexity = video.metadata?.complexity?.level || 'intermediate';
    return complexity === 'beginner' ? 1 : complexity === 'intermediate' ? 2 : 3;
  });

  const avgScore = complexityScores.reduce((sum, score) => sum + score, 0) / complexityScores.length;
  
  if (avgScore <= 1.5) return 'beginner';
  if (avgScore <= 2.5) return 'intermediate';
  return 'advanced';
}

module.exports = exports;