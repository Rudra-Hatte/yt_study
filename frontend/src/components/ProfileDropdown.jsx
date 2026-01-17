import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BarChart3, Target, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext_simple';
import RewardsModal from './RewardsModal';
import LearningStatsModal from './LearningStatsModal';
import MonthlyGoalsModal from './MonthlyGoalsModal';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  const stats = {
    xp: 1250,
    streak: 5,
    monthlyProgress: 40,
    completedCourses: 3
  };

  // Don't render if no user
  if (!user) return null;

  // Get user initials safely
  const getUserInitial = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
      >
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-medium">
            {getUserInitial()}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-dark-700"
          >
            {/* Profile Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
            </div>

            {/* Stats Overview */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">{stats.xp}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total XP</p>
                </div>
                <div className="text-center flex items-center justify-center gap-1">
                  <p className="text-xl font-semibold text-orange-500 dark:text-orange-400">{stats.streak}</p>
                  <span className="text-xl">🔥</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-2 py-2 space-y-1">
              <button
                onClick={() => {
                  setShowRewards(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>View Achievements</span>
              </button>
              <button
                onClick={() => {
                  setShowStats(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Learning Stats</span>
              </button>
              <button
                onClick={() => {
                  setShowGoals(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Monthly Goals</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RewardsModal isOpen={showRewards} onClose={() => setShowRewards(false)} />
      <LearningStatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
      <MonthlyGoalsModal isOpen={showGoals} onClose={() => setShowGoals(false)} />
    </div>
  );
};

export default ProfileDropdown;