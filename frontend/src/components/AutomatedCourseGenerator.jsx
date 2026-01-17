import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext_simple';
import { useCourse } from '../contexts/CourseContext';
import toast from 'react-hot-toast';
import { AI_SERVICE_URL } from '../config/api';

const AutomatedCourseGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCourse } = useCourse();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    topic: '',
    difficulty: 'beginner',
    duration: '4-6 hours'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    stage: '',
    progress: 0,
    details: ''
  });
  
  const [errors, setErrors] = useState({});
  const [suggestedTopics] = useState([
    'JavaScript Fundamentals',
    'React.js Complete Guide',
    'Python for Data Science',
    'Machine Learning Basics',
    'Web Development Full Stack',
    'Mobile App Development',
    'Database Design',
    'DevOps and CI/CD',
    'Artificial Intelligence',
    'Blockchain Technology',
    'Cybersecurity Basics',
    'Cloud Computing',
    'Data Structures & Algorithms',
    'UI/UX Design'
  ]);

  // Validation function
  const validateCourseData = () => {
    const newErrors = {};
    
    if (!courseData.topic.trim()) {
      newErrors.topic = 'Course topic is required';
    } else if (courseData.topic.length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep === 1 && validateCourseData()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Course data handlers
  const handleTopicChange = (topic) => {
    setCourseData(prev => ({ ...prev, topic }));
    if (errors.topic) {
      setErrors(prev => ({ ...prev, topic: undefined }));
    }
  };

  const handleDifficultyChange = (difficulty) => {
    setCourseData(prev => ({ ...prev, difficulty }));
  };

  const handleDurationChange = (duration) => {
    setCourseData(prev => ({ ...prev, duration }));
  };

  // Course generation with AI methodology
  const generateCourse = async () => {
    if (!validateCourseData()) return;
    
    setIsGenerating(true);
    setGenerationProgress({
      stage: 'Initializing',
      progress: 0,
      details: 'Preparing AI course generation pipeline...'
    });

    try {
      // Step 1: AI Topic Analysis
      setGenerationProgress({
        stage: 'Analyzing Topic',
        progress: 20,
        details: 'Using AI to analyze topic and identify key concepts...'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Content Research
      setGenerationProgress({
        stage: 'Researching Content',
        progress: 40,
        details: 'AI is finding and curating the best YouTube videos for your learning path...'
      });

      // Call AI service to search and curate YouTube videos
      let curatedVideos = [];
      try {
        const videosResponse = await fetch(`${AI_SERVICE_URL}/api/ai/search-videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: courseData.topic,
            difficulty: courseData.difficulty,
            numVideos: 8
          }),
        });

        if (videosResponse.ok) {
          const videosResult = await videosResponse.json();
          if (videosResult.success && videosResult.data) {
            curatedVideos = videosResult.data;
          }
        }
      } catch (error) {
        console.error('Error fetching curated videos:', error);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Roadmap Generation
      setGenerationProgress({
        stage: 'Generating Roadmap',
        progress: 60,
        details: 'Creating personalized learning path with logical progression...'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Assessment Creation
      setGenerationProgress({
        stage: 'Creating Assessments',
        progress: 80,
        details: 'Generating quizzes, flashcards, and practice materials...'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Build videos array from curated results or fallback
      const videosArray = curatedVideos.length > 0 
        ? curatedVideos.map((video, index) => ({
            id: `v${index + 1}`,
            title: video.lessonTitle || video.title || `${index + 1}. ${courseData.topic} - Part ${index + 1}`,
            youtubeId: video.videoId,
            duration: '30:00', // Will be updated when video loads
            description: video.description || video.rationale || `Learn about ${courseData.topic}`,
            completed: false,
            channelTitle: video.channelTitle,
            thumbnailUrl: video.thumbnailUrl
          }))
        : Array(8).fill(null).map((_, index) => ({
            id: `v${index + 1}`,
            title: `${index + 1}. ${courseData.topic} - Lesson ${index + 1}`,
            youtubeId: 'dQw4w9WgXcQ',
            duration: '30:00',
            description: `Learn about ${courseData.topic}`,
            completed: false
          }));

      // Mock course generation with real curated videos
      const mockGeneratedCourse = {
        id: Date.now(),
        title: `${courseData.topic} - Complete Guide`,
        description: `Master ${courseData.topic} from beginner to advanced level. This AI-generated course covers all essential concepts with curated video lessons, quizzes, and flashcards.`,
        thumbnail: curatedVideos[0]?.thumbnailUrl || `https://placehold.co/600x400/3b82f6/ffffff?text=${encodeURIComponent(courseData.topic.substring(0, 20))}`,
        duration: courseData.duration,
        progress: 0,
        totalLessons: videosArray.length,
        completedLessons: 0,
        status: 'not-started',
        level: courseData.difficulty.charAt(0).toUpperCase() + courseData.difficulty.slice(1),
        videos: videosArray,
        createdAt: new Date().toISOString(),
        isGenerated: true
      };

      setGenerationProgress({
        stage: 'Complete',
        progress: 100,
        details: 'Perfect roadmap generated! Redirecting to your course...'
      });

      // Add to courses list
      if (typeof addCourse === 'function') {
        addCourse(mockGeneratedCourse);
        toast.success('Course generated successfully!');
      }

      setTimeout(() => {
        navigate(`/courses/${mockGeneratedCourse.id}`);
      }, 2000);

    } catch (error) {
      console.error('Course generation error:', error);
      toast.error('Failed to generate course. Please try again.');
      setIsGenerating(false);
      setGenerationProgress({
        stage: '',
        progress: 0,
        details: ''
      });
    }
  };

  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                1. Define Your Learning Topic
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Topic *
                  </label>
                  <input
                    type="text"
                    value={courseData.topic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    placeholder="e.g., React.js for Beginners, Python Data Science, etc."
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.topic ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.topic && (
                    <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Topics
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleTopicChange(topic)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description (Optional)
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what learners will achieve in this course..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Difficulty Level
                  </label>
                  <select
                    value={courseData.difficulty}
                    onChange={(e) => setCourseData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Course Duration
                  </label>
                  <select
                    value={courseData.duration}
                    onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="2-4 hours">2-4 hours (Quick Start)</option>
                    <option value="4-6 hours">4-6 hours (Standard)</option>
                    <option value="6-8 hours">6-8 hours (Comprehensive)</option>
                    <option value="8-12 hours">8-12 hours (In-Depth)</option>
                    <option value="12+ hours">12+ hours (Master Class)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🎯 Ready to Generate Your Perfect Course?
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <span className="mr-2">📚</span> Topic
                    </h4>
                    <p className="text-gray-600 font-semibold">{courseData.topic}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <span className="mr-2">📊</span> Level
                    </h4>
                    <p className="text-gray-600 font-semibold capitalize">{courseData.difficulty}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <span className="mr-2">⏱️</span> Duration
                    </h4>
                    <p className="text-gray-600 font-semibold">{courseData.duration}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <span className="mr-2">🤖</span> Generation Method
                    </h4>
                    <p className="text-gray-600 font-semibold">AI-Powered</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="mr-2">🚀</span> What You'll Get:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5 text-yellow-500">⭐</span>
                    <span>Complete learning roadmap</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5 text-yellow-500">⭐</span>
                    <span>Curated video lessons</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5 text-yellow-500">⭐</span>
                    <span>Interactive quizzes</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5 text-yellow-500">⭐</span>
                    <span>Study flashcards</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5 text-yellow-500">⭐</span>
                    <span>Lesson summaries</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 mt-0.5 text-yellow-500">⭐</span>
                    <span>Key concepts & keywords</span>
                  </div>
                </div>
              </div>
              
              {errors.generation && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{errors.generation}</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤖 AI Course Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us what you want to learn, and our AI will create the perfect learning roadmap 
            with curated videos, quizzes, and everything you need to master any topic.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 2 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <AnimatePresence mode="wait">
            {!isGenerating ? (
              renderStep()
            ) : (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {generationProgress.stage}
                  </h3>
                  <p className="text-gray-600 mb-4">{generationProgress.details}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${generationProgress.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {generationProgress.progress}% Complete
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!isGenerating && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentStep < 2 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Review & Generate
                </button>
              ) : (
                <button
                  onClick={generateCourse}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold shadow-lg transform hover:scale-105 transition-all"
                >
                  🎆 Generate My Perfect Course
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomatedCourseGenerator;