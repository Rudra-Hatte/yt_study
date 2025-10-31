import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTIVATIONAL_QUOTES } from '../utils/motivationalQuotes';

const LoadingOverlay = ({ isLoading, type }) => {
  const getLoadingMessage = () => {
    switch (type) {
      case 'quiz':
        return 'Generating Quiz...';
      case 'flashcards':
        return 'Generating Flashcards...';
      default:
        return 'Loading...';
    }
  };

  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900">
                {getLoadingMessage()}
              </h3>
              <p className="text-gray-600 italic">{randomQuote}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;