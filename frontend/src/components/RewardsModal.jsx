import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RewardsModal = ({ isOpen, onClose }) => {
  const rewards = [
    { id: 1, name: '3-Day Streak', progress: 2, total: 3, icon: '🔥' },
    { id: 2, name: 'Quiz Master', progress: 8, total: 10, icon: '📝' },
    { id: 3, name: 'Early Bird', progress: 4, total: 5, icon: '🌅' },
    { id: 4, name: 'Night Owl', progress: 2, total: 7, icon: '🌙' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Achievements</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{reward.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{reward.name}</h3>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(reward.progress / reward.total) * 100}%` }}
                            className="bg-indigo-600 h-2 rounded-full"
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {reward.progress}/{reward.total} completed
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RewardsModal;