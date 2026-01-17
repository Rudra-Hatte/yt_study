import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext_simple';
import { generateThumbnail } from '../utils/thumbnailGenerator';
import AutomatedCourseGenerator from '../components/AutomatedCourseGenerator';
import toast from 'react-hot-toast';
import { Zap, Code2, DatabaseZap, Globe, BarChart3, Bot, Smartphone, Database, Edit3, Sparkles, BookOpen, Target } from 'lucide-react';

const SUGGESTED_TOPICS = [
  { id: 1, name: 'JavaScript Fundamentals', color: 'bg-yellow-100 dark:bg-yellow-900', Icon: Zap },
  { id: 2, name: 'React.js Basics', color: 'bg-blue-100 dark:bg-blue-900', Icon: Code2 },
  { id: 3, name: 'Python Programming', color: 'bg-green-100 dark:bg-green-900', Icon: DatabaseZap },
  { id: 4, name: 'Web Development', color: 'bg-purple-100 dark:bg-purple-900', Icon: Globe },
  { id: 5, name: 'Data Structures', color: 'bg-red-100 dark:bg-red-900', Icon: BarChart3 },
  { id: 6, name: 'Machine Learning', color: 'bg-pink-100 dark:bg-pink-900', Icon: Bot },
  { id: 7, name: 'Mobile Development', color: 'bg-indigo-100 dark:bg-indigo-900', Icon: Smartphone },
  { id: 8, name: 'Database Design', color: 'bg-gray-100 dark:bg-gray-700', Icon: Database }
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMethodModal, setShowMethodModal] = useState(true);
  const [creationMethod, setCreationMethod] = useState(null); // 'manual' or 'ai'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    videos: [{ title: '', url: '' }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const selectCreationMethod = (method) => {
    setCreationMethod(method);
    setShowMethodModal(false);
  };

  if (creationMethod === 'ai') {
    return <AutomatedCourseGenerator />;
  }

  const validateYoutubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...formData.videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setFormData({ ...formData, videos: newVideos });
  };

  const addVideoField = () => {
    setFormData({
      ...formData,
      videos: [...formData.videos, { title: '', url: '' }]
    });
  };

  const removeVideoField = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData({ ...formData, videos: newVideos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors = {};

    // Validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    formData.videos.forEach((video, index) => {
      if (!video.title.trim()) {
        newErrors[`video${index}title`] = 'Video title is required';
      }
      if (!validateYoutubeUrl(video.url)) {
        newErrors[`video${index}url`] = 'Invalid YouTube URL';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const courseData = {
        ...formData,
        createdBy: user.id,
        thumbnail: generateThumbnail(formData.title, formData.topic),
        videos: formData.videos.map(video => ({
          ...video,
          youtubeId: extractVideoId(video.url)
        }))
      };

      // TODO: Add API call to save course
      console.log('Course Data:', courseData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigate('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      setErrors({ submit: 'Failed to create course' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Creation Method Modal */}
      <AnimatePresence>
        {showMethodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Your Course</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose how you'd like to create your course</p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectCreationMethod('ai')}
                  className="w-full p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="w-8 h-8 mr-3" />
                    <span className="text-xl font-semibold">AI-Powered Course</span>
                  </div>
                  <p className="text-purple-100 text-sm">
                    Let AI help you create a structured course from any topic. 
                    Just provide the topic, difficulty, and duration - we'll handle the rest!
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3 text-xs text-purple-200">
                    <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1" />Auto-generates</span>
                    <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" />Structured</span>
                    <span className="flex items-center"><Target className="w-3 h-3 mr-1" />Personalized</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectCreationMethod('manual')}
                  className="w-full p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Edit3 className="w-8 h-8 mr-3" />
                    <span className="text-xl font-semibold">Manual Course Creation</span>
                  </div>
                  <p className="text-emerald-100 text-sm">
                    Create a course manually by adding your own videos and content. 
                    Perfect for existing playlists or custom content.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3 text-xs text-emerald-200">
                    <span className="flex items-center"><Globe className="w-3 h-3 mr-1" />Add videos</span>
                    <span className="flex items-center"><Edit3 className="w-3 h-3 mr-1" />Custom</span>
                    <span className="flex items-center"><Target className="w-3 h-3 mr-1" />Full control</span>
                  </div>
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You can always enhance your course with AI-generated quizzes and flashcards later!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Create New Course - Manual Mode
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Complete JavaScript Tutorial"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Describe what students will learn..."
            />
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Topic
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUGGESTED_TOPICS.map(topic => {
                const IconComponent = topic.Icon;
                return (
                  <motion.button
                    key={topic.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, topic: topic.name })}
                    className={`p-3 rounded-lg text-center flex flex-col items-center gap-2 ${topic.color} ${
                      formData.topic === topic.name ? 'ring-2 ring-indigo-500' : ''
                    } text-gray-800 dark:text-gray-200`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">{topic.name}</span>
                  </motion.button>
                );
              })}
            </div>
            {errors.topic && (
              <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
            )}
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Course Videos</h2>
            <button
              type="button"
              onClick={addVideoField}
              className="text-indigo-600 hover:text-indigo-700"
            >
              + Add Video
            </button>
          </div>

          {formData.videos.map((video, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={video.title}
                  onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                  placeholder="Video Title"
                  className="block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  value={video.url}
                  onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                  placeholder="YouTube URL"
                  className="block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors[`video${index}title`] && (
                  <p className="text-sm text-red-600">{errors[`video${index}title`]}</p>
                )}
                {errors[`video${index}url`] && (
                  <p className="text-sm text-red-600">{errors[`video${index}url`]}</p>
                )}
              </div>
              {formData.videos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVideoField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating Course...' : 'Create Course'}
          </motion.button>
        </div>

        {errors.submit && (
          <p className="text-center text-red-600">{errors.submit}</p>
        )}
      </form>
    </div>
  );
};

export default CreateCourse;