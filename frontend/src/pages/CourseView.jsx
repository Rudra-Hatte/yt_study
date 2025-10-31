import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_COURSES } from '../utils/mockData';
import { getQuizForVideo } from '../utils/quizData';
import { getFlashcardsForVideo } from '../utils/flashcardData';
import QuizModal from '../components/QuizModal';
import FlashcardModal from '../components/FlashcardModal';
import LoadingOverlay from '../components/LoadingOverlay';
import toast from 'react-hot-toast';

const CourseView = () => {
  const { courseId } = useParams();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [course, setCourse] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState([]);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);

  useEffect(() => {
    const foundCourse = MOCK_COURSES.find(c => c.id === parseInt(courseId));
    setCourse(foundCourse);
  }, [courseId]);

  if (!course) return null;

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const quizData = getQuizForVideo();
      setCurrentQuiz(quizData);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setGeneratingType('flashcards');
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const flashcardData = getFlashcardsForVideo();
      setCurrentFlashcards(flashcardData);
      setShowFlashcards(true);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
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
                <div className="mt-4 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateQuiz}
                    className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📝</span>
                    Take Quiz
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateFlashcards}
                    className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">🎴</span>
                    Study Flashcards
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
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
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

      <LoadingOverlay
        isLoading={isGenerating}
        type={generatingType}
      />
    </div>
  );
};

export default CourseView;