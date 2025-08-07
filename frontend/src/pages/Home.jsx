import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '🎥',
      title: 'YouTube Integration',
      description: 'Seamlessly import any YouTube video and convert it into structured learning content'
    },
    {
      icon: '📚',
      title: 'AI-Powered Courses',
      description: 'Our AI automatically creates comprehensive courses with chapters, quizzes, and notes'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and completion tracking'
    },
    {
      icon: '🎯',
      title: 'Smart Quizzes',
      description: 'Interactive quizzes generated from video content to test your understanding'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform YouTube Videos into
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Structured Courses
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Turn any YouTube video into a comprehensive learning experience with AI-powered course generation, 
              interactive quizzes, and progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200">
                    Start Learning Free
                  </Link>
                  <Link to="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose YT Study?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make learning from YouTube videos more effective and organized
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already using YT Study to master new skills
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg">
              Get Started Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;