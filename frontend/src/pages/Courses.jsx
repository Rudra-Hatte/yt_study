import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext_simple';
import { MOCK_COURSES } from '../utils/mockData';
import SkeletonCourseCard from '../components/SkeletonCourseCard';
import toast from 'react-hot-toast';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseUrl, setNewCourseUrl] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Mock data with professional thumbnails
      setTimeout(() => {
        setCourses([
          {
            id: 1,
            title: 'Complete React.js Tutorial',
            description: 'Learn React from scratch with this comprehensive tutorial covering hooks, components, and state management.',
            thumbnail: `https://placehold.co/600x400/3b82f6/ffffff?text=${encodeURIComponent('React.js\nMastery')}`,
            duration: '3h 45m',
            progress: 45,
            totalLessons: 24,
            completedLessons: 18,
            createdAt: '2024-01-15',
            status: 'in-progress',
            level: 'Intermediate'
          },
          {
            id: 2,
            title: 'Node.js Backend Development',
            description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
            thumbnail: `https://placehold.co/600x400/16a34a/ffffff?text=${encodeURIComponent('Node.js\nBackend')}`,
            duration: '5h 20m',
            progress: 45,
            totalLessons: 32,
            completedLessons: 14,
            createdAt: '2024-01-10',
            status: 'in-progress',
            level: 'Advanced'
          },
          {
            id: 3,
            title: 'Machine Learning Fundamentals',
            description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
            thumbnail: `https://placehold.co/600x400/8b5cf6/ffffff?text=${encodeURIComponent('ML\nFundamentals')}`,
            duration: '8h 15m',
            progress: 100,
            totalLessons: 1,
            completedLessons: 1,
            createdAt: '2024-01-05',
            status: 'completed',
            level: 'Advanced'
          }
        ]);
        setLoading(false);
      }, 1500); // Simulate network delay
    } catch (error) {
      toast.error('Error fetching courses.');
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        toast.success('Course created successfully! (This is a demo)');
        setNewCourseUrl('');
        setShowCreateForm(false);
        setCreating(false);
      }, 2000);
    } catch (error) {
      toast.error('Error creating course.');
      setCreating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Started</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-2">Manage your learning journey</p>
          </div>
          <Link
            to="/create-course"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg 
              className="-ml-1 mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Create New Course
          </Link>
        </div>

        {/* Create Course Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
                <form onSubmit={handleCreateCourse}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      type="url"
                      value={newCourseUrl}
                      onChange={(e) => setNewCourseUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste any YouTube video URL to create an AI-powered course
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 btn-primary"
                    >
                      {creating ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </div>
                      ) : (
                        'Create Course'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewCourseUrl('');
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid or Skeletons */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCourseCard key={i} />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02, translateY: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
              >
                <Link to={`/courses/${course.id}`}>
                  <div className="relative pb-[56.25%] bg-gradient-to-br from-gray-900 to-gray-800">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="absolute top-0 left-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded-md">
                      <span className="text-white text-sm font-medium">{course.duration}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold 
                        ${course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'}`}>
                        {course.level}
                      </span>
                      {getStatusBadge(course.status)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.progress === 100 ? 'bg-green-500' :
                              course.progress > 50 ? 'bg-blue-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Create your first course by pasting a YouTube URL</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;