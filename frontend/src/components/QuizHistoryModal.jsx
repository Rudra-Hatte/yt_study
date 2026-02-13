import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, XCircle, Trophy, TrendingUp, Calendar } from 'lucide-react';

const QuizHistoryModal = ({ isOpen, onClose, quizHistory }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  // Calculate stats
  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round(quizHistory.reduce((sum, q) => sum + q.percentage, 0) / totalQuizzes) 
    : 0;
  const highestScore = totalQuizzes > 0 
    ? Math.max(...quizHistory.map(q => q.percentage)) 
    : 0;
  const perfectScores = quizHistory.filter(q => q.percentage === 100).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Quiz History</h2>
                <p className="text-indigo-100 mt-1">Track your quiz performance over time</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-dark-900/50 border-b border-gray-200 dark:border-dark-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-2">
                <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalQuizzes}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Quizzes</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averageScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{highestScore}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Highest Score</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{perfectScores}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Perfect Scores</p>
            </div>
          </div>

          {/* Quiz History List */}
          <div className="overflow-y-auto max-h-[50vh] p-6">
            {quizHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No quizzes taken yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Complete some quizzes to see your history here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizHistory.map((quiz, index) => (
                  <motion.div
                    key={quiz._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {quiz.videoTitle || 'Quiz'}
                        </h4>
                        {quiz.courseName && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {quiz.courseName}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(quiz.createdAt)}
                          </span>
                          {quiz.timeTaken > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.floor(quiz.timeTaken / 60)}:{String(quiz.timeTaken % 60).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {quiz.score}/{quiz.totalQuestions}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${getScoreBg(quiz.percentage)}`}>
                          <p className={`text-xl font-bold ${getScoreColor(quiz.percentage)}`}>
                            {quiz.percentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
            <button
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuizHistoryModal;
