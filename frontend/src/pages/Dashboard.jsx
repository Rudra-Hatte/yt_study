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
import { Settings, Sprout, Rocket, Eye, Headphones, Target, Zap, Trophy, Medal, Award as AwardIcon, TrendingUp } from 'lucide-react';

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
  
  console.log('Dashboard rendering, user:', user ? `${user.name || 'Unknown'} (token: ${user.token ? 'yes' : 'NO'})` : 'not logged in');
  
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
  const [isLoading, setIsLoading] = useState(false);
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
      // Load data in background without showing loading state
      fetchDashboardData().catch(err => {
        console.error('Dashboard data fetch failed:', err);
        // Continue rendering with empty state
      });
      fetchLearningProfile().catch(err => {
        console.error('Learning profile fetch failed:', err);
        // Generate recommendations with default profile
        generatePersonalizedRecommendations(learningProfile);
      });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.token) {
      console.log('No user token available');
      return;
    }
    
    // No loading state - show animations immediately
    try {
      console.log('Fetching dashboard data from:', API_URL);
      
      // Fetch user's enrolled courses
      const coursesResponse = await fetch(`${API_URL}/api/courses/enrolled`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      // Fetch user progress
      const progressResponse = await fetch(`${API_URL}/api/progress/overview`, {
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

      // If no courses, show mock data for pie chart
      const hasNoCourses = totalCourses === 0;
      const pieChartData = hasNoCourses 
        ? [3, 5, 2] // Mock data: 3 completed, 5 in progress, 2 not started
        : [completedCourses, inProgress, notStarted];

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
            data: progressData.weeklyActivity || [0.5, 1.2, 0.8, 1.5, 2.0, 1.0, 0.3],
            borderColor: 'rgb(99, 102, 241)',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          }]
        },
        completionRate: {
          labels: ['Completed', 'In Progress', 'Not Started'],
          datasets: [{
            data: pieChartData,
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
      console.log('Continuing with default empty state');
      // Dashboard will render with empty state and animations
    }
  };

  // Fetch personalized learning profile
  const fetchLearningProfile = async () => {
    if (!user?.token) {
      console.log('No user token, using default learning profile');
      generatePersonalizedRecommendations(learningProfile);
      return;
    }
    
    try {
      console.log('Fetching learning profile');
      const response = await fetch(`${API_URL}/api/users/learning-profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const profile = await response.json();
        setLearningProfile(profile);
        generatePersonalizedRecommendations(profile);
      } else {
        console.log('Learning profile not found, using defaults');
        // Generate recommendations with default profile
        generatePersonalizedRecommendations(learningProfile);
      }
    } catch (error) {
      console.error('Error fetching learning profile:', error);
      console.log('Using default learning profile');
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
        Icon: Sprout,
        color: 'bg-blue-100 dark:bg-blue-900/30'
      });
    } else if (profile.pace === 'fast') {
      recommendations.push({
        type: 'challenge',
        title: 'Ready for More?',
        message: 'Try advanced courses or increase your daily study goal.',
        Icon: Rocket,
        color: 'bg-green-100 dark:bg-green-900/30'
      });
    }
    
    // Learning style recommendations
    if (profile.style === 'visual') {
      recommendations.push({
        type: 'resource',
        title: 'Visual Learning Resources',
        message: 'Look for courses with diagrams, mind maps, and visual demonstrations.',
        Icon: Eye,
        color: 'bg-purple-100 dark:bg-purple-900/30'
      });
    } else if (profile.style === 'auditory') {
      recommendations.push({
        type: 'resource',
        title: 'Audio Learning',
        message: 'Enable audio descriptions and try listening to course content while walking.',
        Icon: Headphones,
        color: 'bg-yellow-100 dark:bg-yellow-900/30'
      });
    }
    
    // Difficulty-based recommendations
    if (profile.difficulty === 'beginner') {
      recommendations.push({
        type: 'guidance',
        title: 'Start With Basics',
        message: 'Focus on foundational concepts. Take your time with each module.',
        Icon: Sprout,
        color: 'bg-emerald-100 dark:bg-emerald-900/30'
      });
    } else if (profile.difficulty === 'advanced') {
      recommendations.push({
        type: 'challenge',
        title: 'Advanced Challenges',
        message: 'Try building projects while learning. Consider teaching others.',
        Icon: Zap,
        color: 'bg-red-100 dark:bg-red-900/30'
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

  // Safety check - should never happen with ProtectedRoute, but just in case
  if (!user) {
    console.log('Dashboard: No user found, returning loading state');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering main content');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.name}!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Track your progress and continue learning</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Customize Learning</span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-dark-700 overflow-hidden relative"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Courses</h3>
            {dashboardData.stats.totalCourses === 0 ? (
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2"
              >
                0
              </motion.p>
            ) : (
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                {dashboardData.stats.totalCourses}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enrolled courses</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-dark-700 overflow-hidden relative"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Completed</h3>
            {dashboardData.stats.completedCourses === 0 ? (
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2"
              >
                0
              </motion.p>
            ) : (
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {dashboardData.stats.completedCourses}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Finished courses</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-dark-700 overflow-hidden relative"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Study Time</h3>
            {dashboardData.stats.totalStudyTime === 0 ? (
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
                className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2"
              >
                0h
              </motion.p>
            ) : (
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                {`${(dashboardData.stats.totalStudyTime / 60).toFixed(1)}h`}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total hours studied</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-dark-700 overflow-hidden relative"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Study Streak</h3>
            {dashboardData.stats.streak === 0 ? (
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2"
              >
                0 days
              </motion.p>
            ) : (
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {`${dashboardData.stats.streak} days`}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current streak</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-dark-700 relative"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Weekly Progress</h3>
            {dashboardData.learningProgress.datasets[0].data.every(val => val === 0) ? (
              <div className="relative h-64 flex items-center justify-center">
                {/* Placeholder Chart Background */}
                <div className="absolute inset-0 flex items-end justify-around px-8 pb-12">
                  {[30, 50, 40, 60, 45, 70, 55].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0, opacity: 0.3 }}
                      animate={{ height: `${height}%`, opacity: [0.3, 0.5, 0.3] }}
                      transition={{
                        height: { duration: 1, delay: i * 0.1 },
                        opacity: { repeat: Infinity, duration: 2, delay: i * 0.1 }
                      }}
                      className="w-8 bg-gradient-to-t from-indigo-200 to-indigo-400 dark:from-indigo-900/40 dark:to-indigo-600/40 rounded-t-lg"
                    />
                  ))}
                </div>
                {/* Empty State Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="relative z-10 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <TrendingUp className="w-12 h-12 text-indigo-400 dark:text-indigo-500 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Start learning to see your progress!</p>
                </motion.div>
              </div>
            ) : (
              <Line data={dashboardData.learningProgress} options={{ responsive: true }} />
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-transparent dark:border-dark-700 relative"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Course Completion</h3>
            {dashboardData.completionRate.datasets[0].data.every(val => val === 0) ? (
              <div className="relative h-64 flex items-center justify-center">
                {/* Animated Placeholder Doughnut */}
                <div className="relative w-48 h-48">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="12"
                        strokeDasharray="80 170"
                        opacity="0.3"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient2)"
                        strokeWidth="12"
                        strokeDasharray="60 190"
                        strokeDashoffset="80"
                        opacity="0.3"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="url(#gradient3)"
                        strokeWidth="12"
                        strokeDasharray="110 140"
                        strokeDashoffset="140"
                        opacity="0.3"
                      />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                          <stop offset="100%" stopColor="rgb(34, 197, 94, 0.5)" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                          <stop offset="100%" stopColor="rgb(99, 102, 241, 0.5)" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgb(229, 231, 235)" />
                          <stop offset="100%" stopColor="rgb(229, 231, 235, 0.5)" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                </div>
                {/* Empty State Message */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Target className="w-12 h-12 text-indigo-400 dark:text-indigo-500 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Enroll to track completion!</p>
                </motion.div>
              </div>
            ) : (
              <Doughnut data={dashboardData.completionRate} options={{ responsive: true }} />
            )}
          </motion.div>
        </div>

        {/* Personalized Recommendations */}
        {personalizedRecommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Personalized for Your Learning Style
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalizedRecommendations.map((rec, index) => {
                const IconComponent = rec.Icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    className={`${rec.color} p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{rec.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rec.message}</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-white dark:bg-dark-700 bg-opacity-70 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                          {rec.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}



        {/* Leaderboard Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Trophy className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Top Learners
            </h2>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-transparent dark:border-dark-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Learner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Learning Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {[
                    { rank: 1, name: 'Priya Sharma', avatar: 'PS', rate: '98%', courses: 24, hours: 142, color: 'bg-yellow-500' },
                    { rank: 2, name: 'Arjun Patel', avatar: 'AP', rate: '95%', courses: 21, hours: 128, color: 'bg-gray-400' },
                    { rank: 3, name: 'Ananya Kumar', avatar: 'AK', rate: '92%', courses: 19, hours: 115, color: 'bg-orange-600' },
                    { rank: 4, name: 'Rohan Mehta', avatar: 'RM', rate: '89%', courses: 18, hours: 107, color: 'bg-indigo-500' },
                    { rank: 5, name: 'Sneha Reddy', avatar: 'SR', rate: '87%', courses: 17, hours: 98, color: 'bg-indigo-500' },
                    { rank: 6, name: 'Vikram Singh', avatar: 'VS', rate: '85%', courses: 16, hours: 92, color: 'bg-indigo-500' },
                    { rank: 7, name: 'Diya Joshi', avatar: 'DJ', rate: '83%', courses: 15, hours: 87, color: 'bg-indigo-500' },
                    { rank: 8, name: 'Aditya Verma', avatar: 'AV', rate: '81%', courses: 14, hours: 79, color: 'bg-indigo-500' },
                  ].map((learner) => (
                    <motion.tr
                      key={learner.rank}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {learner.rank <= 3 ? (
                            <div className={`w-8 h-8 rounded-full ${learner.color} flex items-center justify-center text-white font-bold`}>
                              {learner.rank === 1 && <Trophy className="w-5 h-5" />}
                              {learner.rank === 2 && <Medal className="w-5 h-5" />}
                              {learner.rank === 3 && <AwardIcon className="w-5 h-5" />}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold">
                              {learner.rank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold mr-3">
                            {learner.avatar}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{learner.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                              style={{ width: learner.rate }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{learner.rate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {learner.courses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {learner.hours}h
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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