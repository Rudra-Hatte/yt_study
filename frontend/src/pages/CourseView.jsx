import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourse } from '../contexts/CourseContext';
import QuizModal from '../components/QuizModal';
import FlashcardModal from '../components/FlashcardModal';
import SummaryModal from '../components/SummaryModal';
import LoadingOverlay from '../components/LoadingOverlay';
import { AI_SERVICE_URL, API_URL } from '../config/api';
import toast from 'react-hot-toast';

const CourseView = () => {
  const { courseId } = useParams();
  const { courses } = useCourse();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState([]);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      
      // First try to find in local courses (context)
      let foundCourse = courses.find(c => 
        (c._id === courseId) || 
        (c.id === courseId) || 
        (c.id === parseInt(courseId)) ||
        (String(c._id) === String(courseId))
      );
      
      if (foundCourse) {
        setCourse(foundCourse);
        setLoading(false);
        return;
      }
      
      // If not found locally, try to fetch from API
      try {
        const response = await fetch(`${API_URL}/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        } else {
          console.error('Course not found');
          toast.error('Course not found');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
      
      setLoading(false);
    };
    
    fetchCourse();
  }, [courseId, courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleVideoComplete = (videoIndex) => {
    const updatedCourse = { ...course };
    updatedCourse.videos[videoIndex].completed = true;
    updatedCourse.completedLessons = updatedCourse.videos.filter(v => v.completed).length;
    setCourse(updatedCourse);
  };

  const handleGenerateQuiz = async () => {
    try {
      setGeneratingType('quiz');
      setIsGenerating(true);
      
      // Get the video ID from current video
      const videoId = course.videos[currentVideo].youtubeId;
      const videoTitle = course.videos[currentVideo].title;
      
      console.log('🎬 Sending video to Gemini:', videoId);
      toast.loading('Generating quiz from video...');
      
      // Try to get quiz from Gemini API
      try {
        const response = await fetch(`${AI_SERVICE_URL}/api/ai/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: videoId,
            title: videoTitle,
            numQuestions: 10,
            difficulty: 'medium'
          }),
        });

        const result = await response.json();
        console.log('📝 Quiz Response from Gemini:', result);
        
        if (result.success && result.data) {
          // Extract questions array from response
          const questions = result.data.questions || result.data;
          console.log('✅ Quiz questions received:', questions);
          
          if (Array.isArray(questions) && questions.length > 0) {
            setCurrentQuiz(questions);
            setShowQuiz(true);
            toast.dismiss();
            toast.success('Quiz generated successfully!');
          } else {
            throw new Error('No questions in response');
          }
        } else {
          throw new Error(result.error || 'Failed to generate quiz');
        }
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        throw apiError;
      }
      
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      toast.dismiss();
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  }

  const handleGenerateFlashcards = async () => {
    try {
      setGeneratingType('flashcards');
      setIsGenerating(true);
      
      const videoId = course.videos[currentVideo].youtubeId;
      let transcript = null;
      
      // Try browser-side extraction first
      try {
        toast.loading('Extracting captions from browser...');
        transcript = await extractYouTubeCaptions(videoId);
        console.log('G�� Browser extraction successful');
      } catch (browserError) {
        console.log('G��n+� Browser extraction failed, letting backend handle it');
      }
      
      // Send to backend
      toast.loading('Generating flashcards...');
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript,
          videoId: videoId,
          title: course.videos[currentVideo].title,
          numCards: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Extract flashcards array from the response
        const flashcardsArray = result.data.flashcards || result.data;
        setCurrentFlashcards(flashcardsArray);
        setShowFlashcards(true);
        toast.success('Flashcards generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate flashcards');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleGenerateSummary = () => {
    setShowSummary(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative pb-[56.25%] bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${course.videos[currentVideo].youtubeId}`}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.videos[currentVideo].title}
                </h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateQuiz}
                    className="py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">=���</span>
                    Take Quiz
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateFlashcards}
                    className="py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">=�Ħ</span>
                    Study Flashcards
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateSummary}
                    className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">=���</span>
                    Summarize
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">About this lesson</h2>
              <p className="text-gray-600">
                {course.videos[currentVideo].description || 'Master the concepts covered in this lesson through hands-on practice and examples.'}
              </p>
            </div>
          </div>

          {/* Course Content Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg sticky top-4">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Course Content</h2>
                <div className="text-sm text-gray-600">
                  {course.completedLessons}/{course.totalLessons} completed
                </div>
              </div>
              <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
                {course.videos.map((video, index) => (
                  <motion.button
                    key={video.id}
                    whileHover={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
                    onClick={() => setCurrentVideo(index)}
                    className={`w-full p-4 text-left flex items-center ${
                      currentVideo === index ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="mr-4 flex-shrink-0">
                      {video.completed ? (
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">G��</span>
                      ) : (
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                      <p className="text-sm text-gray-500">{video.duration}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        questions={currentQuiz}
        videoTitle={course.videos[currentVideo].title}
      />

      <FlashcardModal
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
        flashcards={currentFlashcards}
        videoTitle={course.videos[currentVideo].title}
      />

      <SummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        videoTitle={course.videos[currentVideo].title}
        videoId={course.videos[currentVideo].youtubeId}
      />

      <LoadingOverlay
        isLoading={isGenerating}
        type={generatingType}
      />
    </div>
  );
};

export default CourseView;
