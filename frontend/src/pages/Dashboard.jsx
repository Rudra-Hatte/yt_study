import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext_simple';
import { useCourses } from '../contexts/CourseContext';
import LearningProfileModal from '../components/LearningProfileModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCourses: 0,
      completedCourses: 0,
      totalStudyTime: 0,
      streak: 0
    },
    recentActivity: [],
    learningProgress: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Study Hours',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      }]
    },
    completionRate: {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(99, 102, 241)',
          'rgb(229, 231, 235)'
        ]
      }]
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [learningProfile, setLearningProfile] = useState({
    pace: 'medium', // slow, medium, fast
    style: 'visual', // visual, auditory, reading, kinesthetic
    difficulty: 'intermediate', // beginner, intermediate, advanced
    preferences: {
      sessionLength: 30, // minutes
      breakFrequency: 3, // sessions before break
      reminderEnabled: true
    }
  });
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchLearningProfile();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.token) return;
    
    setIsLoading(true);
    try {
      // Fetch user's enrolled courses
      const coursesResponse = await fetch('/api/courses/enrolled', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      // Fetch user progress
      const progressResponse = await fetch('/api/progress/overview', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      let enrolledCourses = [];
      let progressData = {
        totalCourses: 0,
        completedCourses: 0,
        totalStudyTime: 0,
        streak: 0,
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
        courseStats: { completed: 0, inProgress: 0, notStarted: 0 }
      };

      if (coursesResponse.ok) {
        enrolledCourses = await coursesResponse.json();
      }

      if (progressResponse.ok) {
        progressData = await progressResponse.json();
      }

      // Calculate real stats
      const totalCourses = enrolledCourses.length;
      const completedCourses = progressData.courseStats?.completed || 0;
      const inProgress = progressData.courseStats?.inProgress || 0;
      const notStarted = Math.max(0, totalCourses - completedCourses - inProgress);

      setDashboardData({
        stats: {
          totalCourses,
          completedCourses,
          totalStudyTime: progressData.totalStudyTime || 0,
          streak: progressData.streak || 0
        },
        recentActivity: progressData.recentActivity || [],
        learningProgress: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Study Hours',
            data: progressData.weeklyActivity || [0, 0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(99, 102, 241)',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          }]
        },
        completionRate: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            data: [completedCourses, inProgress, notStarted],
            backgroundColor: [
              'rgb(34, 197, 94)',
              'rgb(99, 102, 241)',
              'rgb(229, 231, 235)'
            ]
          }]
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep the initial empty state
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch personalized learning profile
  const fetchLearningProfile = async () => {
    try {
      const response = await fetch('/api/users/learning-profile', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const profile = await response.json();
        setLearningProfile(profile);
        generatePersonalizedRecommendations(profile);
      } else {
        // Generate recommendations with default profile
        generatePersonalizedRecommendations(learningProfile);
      }
    } catch (error) {
      console.error('Error fetching learning profile:', error);
      // Generate recommendations with default profile
      generatePersonalizedRecommendations(learningProfile);
    }
  };

  // Generate personalized recommendations based on user profile
  const generatePersonalizedRecommendations = (profile) => {
    const recommendations = [];
    
    // Pace-based recommendations
    if (profile.pace === 'slow') {
      recommendations.push({
        type: 'study_tip',
        title: 'Take Your Time',
        message: 'Break complex topics into smaller chunks. Consider 15-20 minute study sessions.',
        icon: '🐌',
        color: 'bg-blue-100'
      });
    } else if (profile.pace === 'fast') {
      recommendations.push({
        type: 'challenge',
        title: 'Ready for More?',
        message: 'Try advanced courses or increase your daily study goal.',
        icon: '🚀',
        color: 'bg-green-100'
      });
    }
    
    // Learning style recommendations
    if (profile.style === 'visual') {
      recommendations.push({
        type: 'resource',
        title: 'Visual Learning Resources',
        message: 'Look for courses with diagrams, mind maps, and visual demonstrations.',
        icon: '👁️',
        color: 'bg-purple-100'
      });
    } else if (profile.style === 'auditory') {
      recommendations.push({
        type: 'resource',
        title: 'Audio Learning',
        message: 'Enable audio descriptions and try listening to course content while walking.',
        icon: '🎧',
        color: 'bg-yellow-100'
      });
    }
    
    // Difficulty-based recommendations
    if (profile.difficulty === 'beginner') {
      recommendations.push({
        type: 'guidance',
        title: 'Start With Basics',
        message: 'Focus on foundational concepts. Take your time with each module.',
        icon: '🌱',
        color: 'bg-emerald-100'
      });
    } else if (profile.difficulty === 'advanced') {
      recommendations.push({
        type: 'challenge',
        title: 'Advanced Challenges',
        message: 'Try building projects while learning. Consider teaching others.',
        icon: '⚡',
        color: 'bg-red-100'
      });
    }
    
    setPersonalizedRecommendations(recommendations);
  };

  const enrolledCourses = courses.filter(course => 
    user?.enrolledCourses?.includes(course.id)
  );

  const recommendedVideos = [
    {
      id: 1,
      title: 'ReactJS Interview Questions',
      thumbnail: 'https://placehold.co/320x180/3b82f6/ffffff?text=React+Interview',
      duration: '13:55',
      views: '4K views',
      timestamp: '3 months ago'
    },
    {
      id: 2,
      title: 'Software Engineer Internship Guide',
      thumbnail: 'https://placehold.co/320x180/8b5cf6/ffffff?text=Internship+Guide',
      duration: '11:54',
      views: '9.5K views',
      timestamp: '4 days ago'
    },
    {
      id: 3,
      title: 'DSA & System Design Preparation',
      thumbnail: 'https://placehold.co/320x180/06b6d4/ffffff?text=DSA+Guide',
      duration: '10:35',
      views: '43K views',
      timestamp: '2 weeks ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="mt-2 text-gray-600">Track your progress and continue learning</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-2"
          >
            <span>⚙️</span>
            <span>Customize Learning</span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {isLoading ? '-' : dashboardData.stats.totalCourses}
            </p>
            <p className="text-sm text-gray-500 mt-2">Enrolled courses</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {isLoading ? '-' : dashboardData.stats.completedCourses}
            </p>
            <p className="text-sm text-gray-500 mt-2">Finished courses</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Study Time</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {isLoading ? '-' : `${(dashboardData.stats.totalStudyTime / 60).toFixed(1)}h`}
            </p>
            <p className="text-sm text-gray-500 mt-2">Total hours studied</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Study Streak</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {isLoading ? '-' : `${dashboardData.stats.streak} days`}
            </p>
            <p className="text-sm text-gray-500 mt-2">Current streak</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
            <Line data={dashboardData.learningProgress} options={{ responsive: true }} />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion</h3>
            <Doughnut data={dashboardData.completionRate} options={{ responsive: true }} />
          </motion.div>
        </div>

        {/* Personalized Recommendations */}
        {personalizedRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🎯 Personalized for Your Learning Style
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalizedRecommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className={`${rec.color} p-6 rounded-xl shadow-sm border border-gray-100`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{rec.message}</p>
                      <span className="inline-block mt-3 px-3 py-1 bg-white bg-opacity-70 rounded-full text-xs font-medium text-gray-600">
                        {rec.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Videos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedVideos.map(video => (
              <motion.div
                key={video.id}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 rounded text-white text-sm">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span>{video.views}</span>
                    <span className="mx-1">•</span>
                    <span>{video.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Continue Learning</h2>
              <p className="mt-2 text-indigo-100">Pick up where you left off in React.js Fundamentals</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold"
            >
              Resume
            </motion.button>
          </div>
        </div>

        {/* Learning Profile Modal */}
        <LearningProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(newProfile) => {
            setLearningProfile(newProfile);
            generatePersonalizedRecommendations(newProfile);
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;