import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    title: '',
    description: '',
    category: 'technology'
  });
  const [loading, setLoading] = useState(false);
  const [urlValidation, setUrlValidation] = useState({ isValid: false, type: null });
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { value: 'technology', label: '💻 Technology', icon: '💻' },
    { value: 'science', label: '🔬 Science', icon: '🔬' },
    { value: 'business', label: '💼 Business', icon: '💼' },
    { value: 'arts', label: '🎨 Arts & Design', icon: '🎨' },
    { value: 'language', label: '🌐 Language', icon: '🌐' },
    { value: 'health', label: '🏥 Health & Fitness', icon: '🏥' },
    { value: 'lifestyle', label: '🌱 Lifestyle', icon: '🌱' },
    { value: 'education', label: '📚 Education', icon: '📚' },
    { value: 'other', label: '📂 Other', icon: '📂' }
  ];

  // Validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) {
      setUrlValidation({ isValid: false, type: null });
      return;
    }

    const videoRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const playlistRegex = /[?&]list=([^&\n?#]+)/;
    
    const videoMatch = url.match(videoRegex);
    const playlistMatch = url.match(playlistRegex);

    if (playlistMatch) {
      setUrlValidation({ isValid: true, type: 'playlist' });
    } else if (videoMatch) {
      setUrlValidation({ isValid: true, type: 'video' });
    } else {
      setUrlValidation({ isValid: false, type: null });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate YouTube URL on change
    if (name === 'youtubeUrl') {
      validateYouTubeUrl(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!urlValidation.isValid) {
      toast.error('Please provide a valid YouTube video or playlist URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/courses/create-from-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('🎉 Course created successfully! Processing content...');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Create course error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrlTypeDisplay = () => {
    if (!urlValidation.isValid) return null;
    
    return (
      <div className="mt-2 flex items-center text-sm">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          urlValidation.type === 'playlist' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {urlValidation.type === 'playlist' ? '📋 Playlist' : '📹 Single Video'}
        </span>
        <span className="ml-2 text-green-600">✓ Valid URL</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              to="/dashboard" 
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600 mt-1">Transform YouTube content into structured learning experiences</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* YouTube URL Input */}
              <div>
                <label htmlFor="youtubeUrl" className="block text-sm font-semibold text-gray-700 mb-3">
                  YouTube URL *
                </label>
                <div className="relative">
                  <input
                    id="youtubeUrl"
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      !formData.youtubeUrl 
                        ? 'border-gray-300 focus:ring-blue-500 focus:border-transparent' 
                        : urlValidation.isValid 
                          ? 'border-green-300 focus:ring-green-500 bg-green-50' 
                          : 'border-red-300 focus:ring-red-500 bg-red-50'
                    }`}
                    placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=..."
                  />
                  {formData.youtubeUrl && (
                    <div className="absolute right-3 top-3">
                      {urlValidation.isValid ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </div>
                  )}
                </div>
                
                {getUrlTypeDisplay()}
                
                <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Supported formats:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Single Video:</strong> https://youtube.com/watch?v=VIDEO_ID</li>
                    <li>• <strong>Playlist:</strong> https://youtube.com/playlist?list=PLAYLIST_ID</li>
                    <li>• <strong>Short URLs:</strong> https://youtu.be/VIDEO_ID</li>
                  </ul>
                </div>
              </div>

              {/* Course Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                  Course Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a descriptive title for your course"
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {formData.title.length}/200 characters
                </div>
              </div>

              {/* Course Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                  Course Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe what students will learn in this course. What topics are covered? What skills will they gain?"
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {formData.description.length}/2000 characters
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.value}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        formData.category === cat.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={formData.category === cat.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-lg mr-2">{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {cat.label.replace(/^[^ ]+ /, '')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={loading || !urlValidation.isValid}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Course...
                    </div>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🤖 AI-Powered Course Creation</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">What happens next:</h4>
              <ul className="space-y-1">
                <li>• AI analyzes video content</li>
                <li>• Generates course structure</li>
                <li>• Creates interactive quizzes</li>
                <li>• Extracts key learning points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best practices:</h4>
              <ul className="space-y-1">
                <li>• Use educational content</li>
                <li>• Choose clear, structured videos</li>
                <li>• Prefer longer-form content</li>
                <li>• Select appropriate categories</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;