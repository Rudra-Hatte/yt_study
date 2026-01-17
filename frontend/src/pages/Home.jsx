import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, BookOpen, Brain, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl tracking-tight font-bold text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            <span className="block">Transform YouTube Videos</span>
            <span className="block mt-2 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Into Structured Learning
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Create interactive courses, generate quizzes, and master content with AI-powered study tools.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-dark-600 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Play className="w-5 h-5" />
              Explore Courses
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="card p-8 text-center hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Structured Courses
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize YouTube videos into comprehensive learning paths
            </p>
          </div>

          <div className="card p-8 text-center hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generate quizzes, flashcards, and summaries automatically
            </p>
          </div>

          <div className="card p-8 text-center hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor your learning journey and achieve your goals
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;