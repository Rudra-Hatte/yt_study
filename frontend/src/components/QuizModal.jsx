import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext_simple';
import { API_URL } from '../config/api';
import toast from 'react-hot-toast';

const QuizModal = ({ isOpen, onClose, questions, videoTitle, videoId, courseId, courseName }) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const startTimeRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setIsCompleted(false);
      setScore(0);
      setAnswers([]);
      startTimeRef.current = Date.now();
    }
  }, [isOpen]);

  // Save quiz attempt when completed
  const saveQuizAttempt = async (finalScore) => {
    if (!user?.token) {
      console.log('No user token, cannot save quiz attempt');
      return;
    }
    
    setIsSaving(true);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    try {
      console.log('Saving quiz attempt:', { videoId, videoTitle, score: finalScore });
      const response = await fetch(`${API_URL}/api/quizzes/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          videoId: videoId || 'unknown',
          videoTitle: videoTitle || 'Quiz',
          courseId,
          courseName,
          score: finalScore,
          totalQuestions: questions.length,
          timeTaken,
          answers
        })
      });
      
      if (response.ok) {
        console.log('Quiz attempt saved successfully');
        toast.success('Quiz result saved!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save quiz attempt:', errorData);
        toast.error('Failed to save quiz result');
      }
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      toast.error('Error saving quiz result');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !questions || questions.length === 0) return null;

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      isCorrect
    }];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
      // Calculate final score
      const finalScore = answers.filter(a => a.isCorrect).length + 
        (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0);
      saveQuizAttempt(finalScore);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6"
      >
        {!isCompleted ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 text-2xl">
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-gray-900 dark:text-gray-100">{questions[currentQuestion].question}</p>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      selectedAnswer === null 
                        ? 'border-gray-200 dark:border-dark-600 hover:border-indigo-500 dark:hover:border-indigo-500 text-gray-900 dark:text-gray-100' 
                        : index === questions[currentQuestion].correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                        : selectedAnswer === index
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                        : 'border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {selectedAnswer !== null && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNext}
                  className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </motion.button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quiz Complete!</h2>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              Score: {score}/{questions.length}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {Math.round((score / questions.length) * 100)}%
            </p>
            {isSaving && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Saving result...</p>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close Quiz
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizModal;