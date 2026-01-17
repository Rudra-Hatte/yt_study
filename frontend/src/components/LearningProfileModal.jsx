import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext_simple';
import toast from 'react-hot-toast';
import { Gauge, Eye, Headphones, BookText, Hand, Sprout, TreePine, Settings, BarChart3 } from 'lucide-react';

const LearningProfileModal = ({ isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    pace: 'medium',
    style: 'visual',
    difficulty: 'intermediate',
    preferences: {
      sessionLength: 30,
      breakFrequency: 3,
      reminderEnabled: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/learning-profile', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/learning-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast.success('Learning profile updated successfully!');
        onUpdate(profile);
        onClose();
      } else {
        toast.error('Failed to update learning profile');
      }
    } catch (error) {
      toast.error('Failed to update learning profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Personalize Your Learning</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Learning Pace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Gauge className="w-4 h-4 mr-2" />
                Learning Pace
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'slow', label: 'Steady & Thorough', Icon: Sprout, desc: 'Take time to deeply understand' },
                  { value: 'medium', label: 'Balanced', Icon: TreePine, desc: 'Regular steady progress' },
                  { value: 'fast', label: 'Quick & Intensive', Icon: Gauge, desc: 'Fast-paced learning' }
                ].map((option) => {
                  const IconComponent = option.Icon;
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProfile({ ...profile, pace: option.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profile.pace === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1 mx-auto text-gray-700 dark:text-gray-300" />
                      <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Learning Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'visual', label: 'Visual', Icon: Eye, desc: 'Learn through images, diagrams, videos' },
                  { value: 'auditory', label: 'Auditory', Icon: Headphones, desc: 'Learn through listening and discussion' },
                  { value: 'reading', label: 'Reading/Writing', Icon: BookText, desc: 'Learn through text and writing' },
                  { value: 'kinesthetic', label: 'Hands-on', Icon: Hand, desc: 'Learn through doing and practice' }
                ].map((option) => {
                  const IconComponent = option.Icon;
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProfile({ ...profile, style: option.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profile.style === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1 mx-auto text-gray-700 dark:text-gray-300" />
                      <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Current Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Current Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'beginner', label: 'Beginner', Icon: Sprout, desc: 'New to most topics' },
                  { value: 'intermediate', label: 'Intermediate', Icon: TreePine, desc: 'Some experience' },
                  { value: 'advanced', label: 'Advanced', Icon: BarChart3, desc: 'Experienced learner' }
                ].map((option) => {
                  const IconComponent = option.Icon;
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProfile({ ...profile, difficulty: option.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profile.difficulty === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 mb-1 mx-auto text-gray-700 dark:text-gray-300" />
                      <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Study Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Study Preferences
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Preferred Session Length: {profile.preferences.sessionLength} minutes
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={profile.preferences.sessionLength}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        sessionLength: parseInt(e.target.value)
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Study reminders</span>
                  <button
                    onClick={() => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        reminderEnabled: !profile.preferences.reminderEnabled
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      profile.preferences.reminderEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.preferences.reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Your preferences help us personalize your learning experience
            </div>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LearningProfileModal;