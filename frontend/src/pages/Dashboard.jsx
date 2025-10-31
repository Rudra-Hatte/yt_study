import React from 'react';
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
} from 'chart.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const { courses, getCourseProgress } = useCourses();

  const enrolledCourses = courses.filter(course => 
    user.enrolledCourses?.includes(course.id)
  );

  // Mock data for charts
  const learningProgress = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [2.5, 3, 4, 2, 3.5, 5, 3],
      borderColor: 'rgb(99, 102, 241)',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
    }]
  };

  const completionRate = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: [
        'rgb(34, 197, 94)',
        'rgb(99, 102, 241)',
        'rgb(229, 231, 235)'
      ]
    }]
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="mt-2 text-gray-600">Track your progress and continue learning</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Total Study Time</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">23.5 hrs</p>
            <p className="text-sm text-green-600 mt-2">↑ 12% from last week</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Completed Lessons</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">15</p>
            <p className="text-sm text-green-600 mt-2">↑ 5 this week</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">Quiz Score Avg.</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">85%</p>
            <p className="text-sm text-green-600 mt-2">↑ 7% improvement</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
            <Line data={learningProgress} options={{ responsive: true }} />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion</h3>
            <Doughnut data={completionRate} options={{ responsive: true }} />
          </motion.div>
        </div>

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
      </div>
    </div>
  );
};

export default Dashboard;