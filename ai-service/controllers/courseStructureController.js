const { generateCourseStructure, analyzeConceptRelationships } = require('../services/gemini/courseStructurer');
const { generateSummary } = require('../services/gemini/summaryGenerator');
const { getVideoTranscript } = require('../utils/youtube');
const { preprocessTranscript } = require('../utils/contentPreprocessor');

/**
 * Generate a complete course with AI-powered content curation
 */
exports.generateCourseAI = async (req, res, next) => {
  try {
    const { topic, difficulty = 'beginner', duration = '4-6 hours' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      });
    }

    // Generate AI-powered course structure
    const aiCourseStructure = await generateAICourseStructure(topic, difficulty, duration);

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
 * Generate AI course structure based on topic, difficulty, and duration
 */
async function generateAICourseStructure(topic, difficulty, duration) {
  // Mock AI-generated course structure for now
  const mockVideos = [
    {
      id: '1',
      title: `${topic} - Introduction and Overview`,
      youtubeId: 'dQw4w9WgXcQ', // Mock video ID
      duration: '15:30',
      description: `Introduction to ${topic} covering fundamental concepts and what you'll learn in this comprehensive course.`,
      concepts: ['Introduction', 'Overview', 'Prerequisites', 'Learning Goals'],
      order: 1
    },
    {
      id: '2',
      title: `${topic} - Core Concepts and Principles`,
      youtubeId: 'dQw4w9WgXcQ',
      duration: '25:45',
      description: `Deep dive into the core concepts and fundamental principles of ${topic}.`,
      concepts: ['Core Concepts', 'Fundamental Principles', 'Basic Theory'],
      order: 2
    },
    {
      id: '3',
      title: `${topic} - Hands-on Practice`,
      youtubeId: 'dQw4w9WgXcQ',
      duration: '30:20',
      description: `Practical hands-on exercises and examples to solidify your understanding of ${topic}.`,
      concepts: ['Practical Application', 'Hands-on Practice', 'Examples'],
      order: 3
    },
    {
      id: '4',
      title: `${topic} - Advanced Techniques`,
      youtubeId: 'dQw4w9WgXcQ',
      duration: '20:15',
      description: `Advanced techniques and best practices for mastering ${topic}.`,
      concepts: ['Advanced Techniques', 'Best Practices', 'Optimization'],
      order: 4
    },
    {
      id: '5',
      title: `${topic} - Real-world Applications`,
      youtubeId: 'dQw4w9WgXcQ',
      duration: '22:30',
      description: `Real-world applications and use cases of ${topic} in industry.`,
      concepts: ['Real-world Applications', 'Industry Use Cases', 'Case Studies'],
      order: 5
    },
    {
      id: '6',
      title: `${topic} - Final Project and Next Steps`,
      youtubeId: 'dQw4w9WgXcQ',
      duration: '18:40',
      description: `Capstone project bringing together all concepts learned, plus recommendations for next steps.`,
      concepts: ['Final Project', 'Integration', 'Next Steps', 'Career Path'],
      order: 6
    }
  ];

  // Filter videos based on duration
  let selectedVideos = mockVideos;
  if (duration === '2-3 hours') {
    selectedVideos = mockVideos.slice(0, 3);
  } else if (duration === '4-6 hours') {
    selectedVideos = mockVideos.slice(0, 4);
  } else if (duration === '8-12 hours') {
    selectedVideos = mockVideos.slice(0, 5);
  }

  const courseStructure = {
    title: `Complete ${topic} Course - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
    description: `A comprehensive ${difficulty}-level course on ${topic} designed to take you from beginner to proficient. This AI-curated course includes hands-on practice, real-world examples, and everything you need to master ${topic}.`,
    topic,
    difficulty,
    duration,
    totalLessons: selectedVideos.length,
    estimatedHours: duration,
    videos: selectedVideos,
    learningPath: [
      {
        module: 1,
        title: "Foundation",
        lessons: selectedVideos.slice(0, 2),
        description: "Build a solid foundation with core concepts"
      },
      {
        module: 2,
        title: "Application",
        lessons: selectedVideos.slice(2, 4),
        description: "Apply your knowledge with practical exercises"
      },
      {
        module: 3,
        title: "Mastery",
        lessons: selectedVideos.slice(4),
        description: "Master advanced concepts and real-world applications"
      }
    ].filter(module => module.lessons.length > 0),
    roadmap: {
      prerequisites: difficulty === 'beginner' ? 
        ["Basic computer literacy", "Willingness to learn"] :
        difficulty === 'intermediate' ? 
        ["Basic understanding of programming", "Familiarity with development tools"] :
        ["Strong programming background", "Experience with related technologies"],
      outcomes: [
        `Complete understanding of ${topic} fundamentals`,
        `Ability to build projects using ${topic}`,
        `Knowledge of best practices and advanced techniques`,
        `Preparation for real-world applications`
      ],
      careerPaths: [
        `${topic} Developer`,
        `${topic} Specialist`,
        `Senior Developer with ${topic} expertise`,
        `Technical Lead in ${topic} projects`
      ]
    },
    keywords: generateKeywords(topic),
    metadata: {
      generatedBy: 'AI',
      generatedAt: new Date().toISOString(),
      version: '1.0',
      aiModel: 'YT-Study AI Course Generator'
    }
  };

  return courseStructure;
}

/**
 * Generate relevant keywords for a topic
 */
function generateKeywords(topic) {
  const commonKeywords = ['programming', 'development', 'coding', 'software', 'tutorial', 'course', 'learning'];
  const topicKeywords = topic.toLowerCase().split(' ');
  
  // Add some related keywords based on common topics
  const topicRelatedKeywords = {
    'react': ['jsx', 'components', 'hooks', 'state', 'props', 'virtual dom'],
    'javascript': ['es6', 'functions', 'objects', 'dom', 'async', 'promises'],
    'python': ['syntax', 'functions', 'classes', 'modules', 'libraries', 'data'],
    'machine learning': ['algorithms', 'models', 'training', 'data science', 'ai', 'neural networks'],
    'web development': ['html', 'css', 'javascript', 'responsive', 'frontend', 'backend']
  };

  let keywords = [...new Set([...commonKeywords, ...topicKeywords])];
  
  // Add topic-specific keywords
  for (const [key, values] of Object.entries(topicRelatedKeywords)) {
    if (topic.toLowerCase().includes(key)) {
      keywords.push(...values);
      break;
    }
  }

  return keywords.slice(0, 15); // Limit to 15 keywords
}

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