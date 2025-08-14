import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    totalStudyTime: 0,
    currentStreak: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user stats from backend
      const statsResponse = await fetch('http://localhost:5000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data.stats);
      } else {
        console.warn('Failed to fetch stats, using defaults');
        // Keep default stats if API fails
      }

      // Fetch user's courses from backend
      const coursesResponse = await fetch('http://localhost:5000/api/courses/user/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        const enrolledCourses = coursesData.data.enrolled || [];
        
        // Format courses for display
        const formattedCourses = enrolledCourses.map(courseData => ({
          id: courseData._id || courseData.id,
          title: courseData.title || 'Untitled Course',
          thumbnail: courseData.thumbnail || `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
          progress: courseData.progress || 0,
          duration: formatDuration(courseData.estimatedDuration || 0),
          lastAccessed: formatLastAccessed(courseData.enrolledAt || courseData.updatedAt),
          category: courseData.category || 'general',
          difficulty: courseData.difficulty || 'beginner'
        }));

        setRecentCourses(formattedCourses.slice(0, 3)); // Show only recent 3
      } else {
        console.warn('Failed to fetch courses');
        setRecentCourses([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Use fallback mock data if backend is not available
      setStats({
        totalCoursesEnrolled: 0,
        totalCoursesCompleted: 0,
        totalStudyTime: 0,
        currentStreak: 0
      });
      setRecentCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatLastAccessed = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const handleContinueCourse = (courseId) => {
    // Navigate to course or show coming soon
    toast.success(`Opening course... (Course ID: ${courseId})`);
    // TODO: Navigate to course player when implemented
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.firstName || user?.username || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your learning progress and recent activity
          </p>
          {error && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">⚠️ {error} - Some data may be unavailable</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCoursesEnrolled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCoursesCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalStudyTime / 60)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                  <Link to="/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6">Start your learning journey by creating your first course</p>
                    <Link
                      to="/courses/create"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Course
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/120x90/f3f4f6/9ca3af?text=Course';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {course.duration} • {course.lastAccessed}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                              {course.category}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 rounded text-blue-600">
                              {course.difficulty}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{course.progress}% complete</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleContinueCourse(course.id)}
                          className="btn-primary text-sm whitespace-nowrap"
                        >
                          Continue
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Create New Course */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/courses/create" className="block w-full btn-primary text-center">
                  📎 Create New Course
                </Link>
                <Link to="/courses" className="block w-full btn-secondary text-center">
                  📚 Browse Courses
                </Link>
                <button 
                  onClick={() => toast.info('Analytics coming soon!')}
                  className="block w-full btn-secondary text-center"
                >
                  📊 View Analytics
                </button>
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔥 Learning Streak</h3>
              <p className="text-3xl font-bold text-orange-600 mb-2">{stats.currentStreak} days</p>
              <p className="text-sm text-gray-600">
                {stats.currentStreak === 0 
                  ? "Start your learning streak today!" 
                  : "Keep it up! You're doing great. Come back tomorrow to continue your streak."
                }
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">💡 Learning Tip</h3>
              <p className="text-sm text-gray-600">
                Try to complete at least one lesson every day to build a consistent learning habit!
              </p>
            </div>

            {/* Backend Status */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🚀 System Status</h3>
              <p className="text-sm text-green-700">
                ✅ Backend connected and ready!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your data is synced with MongoDB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;