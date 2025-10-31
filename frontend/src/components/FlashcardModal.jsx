import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlashcardModal = ({ isOpen, onClose, flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen]);

  // Safety check for empty or invalid flashcards
  if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
    console.warn('No flashcards provided to FlashcardModal');
    return null;
  }

  const currentCard = flashcards[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-xl"
          >
            {/* Modal content */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Flashcard {currentIndex + 1} of {flashcards.length}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>

            {/* Flashcard */}
            <div 
              className="relative h-64 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 backface-hidden bg-indigo-50 rounded-lg p-6 flex items-center justify-center"
              >
                <p className="text-xl text-center">{currentCard.front}</p>
              </motion.div>
              <motion.div
                animate={{ rotateY: isFlipped ? 0 : -180 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 backface-hidden bg-purple-50 rounded-lg p-6 flex items-center justify-center"
              >
                <p className="text-xl text-center">{currentCard.back}</p>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                  setIsFlipped(false);
                }}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:bg-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1));
                  setIsFlipped(false);
                }}
                disabled={currentIndex === flashcards.length - 1}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FlashcardModal;