import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext_simple';
import { useCourse } from '../contexts/CourseContext';
import SkeletonCourseCard from '../components/SkeletonCourseCard';
import toast from 'react-hot-toast';

const Courses = () => {
  const { user } = useAuth();
  const { myCourses, loading: contextLoading, fetchMyCourses, getCourseProgress } = useCourse();
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseUrl, setNewCourseUrl] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      await fetchMyCourses();
      setLoading(false);
    };
    loadCourses();
  }, [fetchMyCourses]);

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

  const getStatusBadge = (course) => {
    const progress = getCourseProgress(course._id || course.id);
    if (progress === 100) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Completed</span>;
    } else if (progress > 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">In Progress</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Not Started</span>;
  };

  // Format courses for display
  const courses = myCourses.map(course => ({
    ...course,
    id: course._id || course.id,
    progress: getCourseProgress(course._id || course.id),
    totalLessons: course.videos?.length || course.totalLessons || 0,
    completedLessons: 0, // Will be calculated from progress
    level: course.difficulty ? course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1) : course.level || 'Beginner',
    thumbnail: course.thumbnail || `https://placehold.co/600x400/3b82f6/ffffff?text=${encodeURIComponent(course.title?.substring(0, 20) || 'Course')}`
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your learning journey</p>
          </div>
          <Link
            to="/create-course"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCourseCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02, translateY: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-dark-700 hover:shadow-xl transition-all"
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
                        ${course.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        course.level === 'Intermediate' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'}`}>
                        {course.level}
                      </span>
                      {getStatusBadge(course)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              course.progress === 100 ? 'bg-green-500' :
                              course.progress > 50 ? 'bg-blue-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.progress}%</span>
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
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No courses yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first AI-powered course</p>
            <Link
              to="/create-course"
              className="btn-primary inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Your First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;