import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TranscriptInputModal = ({ isOpen, onClose, onSubmit, title }) => {
  const [transcript, setTranscript] = useState('');

  const handleSubmit = () => {
    if (transcript.trim().length < 100) {
      alert('Please paste at least 100 characters of transcript');
      return;
    }
    onSubmit(transcript);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              {title || 'Paste Video Transcript'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Since automatic caption extraction isn't working, please:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Open the video on YouTube</li>
                <li>Click the "..." menu → "Show transcript"</li>
                <li>Copy all the transcript text</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste video transcript here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            />

            <div className="mt-2 text-sm text-gray-500">
              {transcript.length} characters {transcript.length < 100 && '(minimum 100 required)'}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={transcript.length < 100}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Use This Transcript
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TranscriptInputModal;
