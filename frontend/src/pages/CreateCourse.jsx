import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { generateThumbnail } from '../utils/thumbnailGenerator';

const SUGGESTED_TOPICS = [
  { id: 1, name: 'JavaScript Fundamentals', color: 'bg-yellow-100' },
  { id: 2, name: 'React.js Basics', color: 'bg-blue-100' },
  { id: 3, name: 'Python Programming', color: 'bg-green-100' },
  { id: 4, name: 'Web Development', color: 'bg-purple-100' },
  { id: 5, name: 'Data Structures', color: 'bg-red-100' }
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    videos: [{ title: '', url: '' }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Complete JavaScript Tutorial"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Describe what students will learn..."
            />
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Topic
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUGGESTED_TOPICS.map(topic => (
                <motion.button
                  key={topic.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, topic: topic.name })}
                  className={`p-3 rounded-lg text-center ${topic.color} ${
                    formData.topic === topic.name ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  {topic.name}
                </motion.button>
              ))}
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  value={video.url}
                  onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                  placeholder="YouTube URL"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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