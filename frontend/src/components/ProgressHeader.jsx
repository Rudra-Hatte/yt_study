import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CourseContext';

const ProgressHeader = ({ course }) => {
  const progress = Math.round((course.completedLessons / course.totalLessons) * 100);

  return (
    <div className="fixed top-16 left-0 right-0 bg-white shadow-sm z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-8">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {course.title}
            </h2>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-2 rounded-full ${
                    progress === 100 ? 'bg-green-500' :
                    progress > 50 ? 'bg-blue-500' : 'bg-indigo-500'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {progress}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;