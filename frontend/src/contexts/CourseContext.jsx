import React, { createContext, useContext, useState } from 'react';
import { MOCK_COURSES, MOCK_PROGRESS } from '../utils/mockData';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses] = useState(MOCK_COURSES);
  const [progress, setProgress] = useState(MOCK_PROGRESS);

  const updateVideoProgress = (courseId, videoId, completed) => {
    setProgress(prev => ({
      ...prev,
      videoProgress: {
        ...prev.videoProgress,
        [`${courseId}-${videoId}`]: completed
      }
    }));
  };

  const getCourseProgress = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;

    const totalVideos = course.videos.length;
    const completedVideos = course.videos.filter(v => 
      progress.videoProgress[`${courseId}-${v.id}`]
    ).length;

    return Math.round((completedVideos / totalVideos) * 100);
  };

  return (
    <CourseContext.Provider value={{
      courses,
      progress,
      updateVideoProgress,
      getCourseProgress
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);