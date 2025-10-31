import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import RewardsModal from './RewardsModal';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const stats = {
    xp: 1250,
    streak: 5,
    monthlyProgress: 40,
    completedCourses: 3
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
      >
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50"
          >
            {/* Profile Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {/* Stats Overview */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-indigo-600">{stats.xp}</p>
                  <p className="text-xs text-gray-500">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-orange-500">
                    {stats.streak} 🔥
                  </p>
                  <p className="text-xs text-gray-500">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-2 py-2 space-y-1">
              <button
                onClick={() => setShowRewards(true)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              >
                <span className="mr-2">🏆</span> View Achievements
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              >
                <span className="mr-2">📊</span> Learning Stats
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
              >
                <span className="mr-2">🎯</span> Monthly Goals
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
              >
                <span className="mr-2">👋</span> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RewardsModal isOpen={showRewards} onClose={() => setShowRewards(false)} />
    </div>
  );
};

export default ProfileDropdown;