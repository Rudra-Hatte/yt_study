import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { AI_SERVICE_URL } from '../config/api';
import { extractYouTubeCaptions } from '../utils/youtubeCaptions';
import { transcribeWithUserHelp } from '../utils/speechToText';
import toast from 'react-hot-toast';

const SummaryModal = ({ isOpen, onClose, videoTitle, videoId }) => {
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen && !summary && !isGenerating) {
      generateSummary();
    }
  }, [isOpen, videoId]);

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let transcript = null;
      
      // Method 1: Try browser-side caption extraction
      try {
        transcript = await extractYouTubeCaptions(videoId);
        console.log('✅ Browser extraction successful');
      } catch (browserError) {
        console.log('⚠️ Browser extraction failed, trying server-side...');
        
        // Method 2: Try server-side extraction
        try {
          const response = await fetch(`${AI_SERVICE_URL}/api/ai/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoId: videoId,
              title: videoTitle,
              format: 'detailed'
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setSummary(result.data);
              return;
            }
          }
        } catch (serverError) {
          console.log('⚠️ Server extraction also failed');
        }
        
        // Method 3: ULTIMATE FALLBACK - Speech-to-Text
        const useSpeechToText = window.confirm(
          '⚠️ Caption extraction failed!\n\n' +
          '🎤 Would you like to use speech-to-text instead?\n\n' +
          'Instructions:\n' +
          '1. Click OK\n' +
          '2. Play the video with sound\n' +
          '3. Wait for transcription to complete\n\n' +
          'Note: Your browser will ask for microphone permission.'
        );
        
        if (useSpeechToText) {
          toast.loading('Starting speech recognition... Please play the video!');
          
          transcript = await transcribeWithUserHelp(
            (progress) => console.log(`Transcription progress: ${progress}%`),
            (status) => toast.loading(status)
          );
          
          console.log('✅ Speech-to-text transcription successful!');
          toast.success('Transcription complete!');
        } else {
          throw new Error('All transcription methods failed or cancelled');
        }
      }
      
      // Send to backend with transcript
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript,
          videoId: videoId,
          title: videoTitle,
          format: 'detailed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        throw new Error(result.error || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Summary generation error:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAndClose = () => {
    setSummary(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">📑 Lesson Summary</h2>
                <p className="text-purple-100">{videoTitle}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                  title="Print Summary"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="text-sm">Print</span>
                </button>
                <button
                  onClick={resetAndClose}
                  className="text-white hover:text-purple-200 text-2xl font-semibold"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner />
                <p className="text-gray-600 mt-4">Generating comprehensive summary...</p>
                <p className="text-sm text-gray-500">Analyzing key concepts and extracting insights</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={generateSummary}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            ) : summary && (
              <div className="space-y-8">
                {/* Overview */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">📖</span> Overview
                  </h3>
                  <p className="text-blue-700 leading-relaxed">{summary.summary}</p>
                </div>

                {/* Main Concepts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🎯</span> Main Concepts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {summary.mainConcepts.map((concept, index) => (
                      <div
                        key={index}
                        className="bg-green-50 px-4 py-3 rounded-lg border border-green-200"
                      >
                        <span className="text-green-700 font-medium">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">💡</span> Key Points
                  </h3>
                  <div className="space-y-3">
                    {summary.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-orange-500 font-bold mt-1">•</span>
                        <p className="text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🏷️</span> Important Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border hover:bg-gray-200 transition-colors"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Practical Applications */}
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                    <span className="mr-2">🛠️</span> Practical Applications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {summary.practicalApplications.map((application, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-600">✓</span>
                        <span className="text-yellow-700">{application}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">🚀</span> Recommended Next Steps
                  </h3>
                  <div className="space-y-2">
                    {summary.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-purple-600 font-bold">{index + 1}.</span>
                        <span className="text-purple-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={resetAndClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              {summary && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  📄 Print Summary
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;