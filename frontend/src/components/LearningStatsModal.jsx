import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Clock, Target, BookOpen, Award, Calendar, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext_simple';

const LearningStatsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalXP: 1250,
    currentStreak: 5,
    longestStreak: 12,
    totalStudyTime: 1847, // minutes
    coursesCompleted: 3,
    coursesInProgress: 5,
    videosWatched: 47,
    quizzesTaken: 23,
    flashcardsReviewed: 156,
    averageSessionTime: 28, // minutes
    weeklyActivity: [30, 45, 60, 40, 50, 35, 55] // Last 7 days in minutes
  });

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivity = Math.max(...stats.weeklyActivity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Learning Statistics</h2>
                      <p className="text-indigo-100 text-sm">Your progress at a glance</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalXP}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak} days</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatTime(stats.totalStudyTime)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.coursesCompleted} courses</p>
                  </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="bg-gray-50 dark:bg-dark-700 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Weekly Activity</h3>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {stats.weeklyActivity.map((minutes, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-t-lg relative overflow-hidden" style={{ height: '100px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(minutes / maxActivity) * 100}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{weekDays[index]}</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{minutes}m</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Learning Progress */}
                  <div className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Learning Progress</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Courses Completed</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stats.coursesCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Courses In Progress</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stats.coursesInProgress}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Videos Watched</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stats.videosWatched}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stats.quizzesTaken}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Flashcards Reviewed</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stats.flashcardsReviewed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Milestones</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{stats.longestStreak} days 🔥</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Session</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{stats.averageSessionTime} min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total XP Earned</span>
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{stats.totalXP} XP ⚡</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    🎉 Great job! You've spent <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatTime(stats.totalStudyTime)}</span> learning this month. Keep up the momentum!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LearningStatsModal;
