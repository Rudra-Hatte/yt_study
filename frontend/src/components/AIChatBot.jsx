import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext_simple';
import { AI_SERVICE_URL } from '../config/api';
import toast from 'react-hot-toast';
import { MessageCircle, Send, X } from 'lucide-react';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi! I'm your AI study buddy. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'general_study_help'
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMessages(prev => [...prev, { type: 'bot', text: data.data.response }]);
      } else {
        // Fallback response
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "I'm having trouble connecting right now. Try asking about course content, study tips, or learning strategies!" 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having some technical difficulties. You can still browse courses and use other features while I get back online!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-80 mb-4 border border-gray-200 dark:border-dark-700"
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Study Buddy</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-900">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                        : 'bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-dark-600'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg p-3 border border-gray-200 dark:border-dark-600">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 dark:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 dark:hover:bg-indigo-600"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default AIChatBot;