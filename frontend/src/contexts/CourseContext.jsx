import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [progress, setProgress] = useState({ videoProgress: {} });
  const [loading, setLoading] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.token;
      } catch (e) {
        return null;
      }
    }
    return localStorage.getItem('token');
  };

  // Fetch user's created courses from API
  const fetchMyCourses = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      console.log('No auth token, skipping fetch');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched my courses:', data);
        setMyCourses(data);
        // Also add to main courses list
        setCourses(prev => {
          const existingIds = new Set(prev.map(c => c._id || c.id));
          const newCourses = data.filter(c => !existingIds.has(c._id || c.id));
          return [...newCourses, ...prev];
        });
      } else {
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all public courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add/Create a new course and save to backend
  const addCourse = async (newCourse) => {
    const token = getAuthToken();
    
    // Add to local state immediately for better UX
    const localCourse = {
      ...newCourse,
      id: newCourse.id || Date.now(),
      _id: newCourse._id || null
    };
    setCourses(prev => [localCourse, ...prev]);
    setMyCourses(prev => [localCourse, ...prev]);

    // If user is authenticated, save to backend
    if (token) {
      try {
        console.log('💾 Saving course to backend...');
        const response = await fetch(`${API_URL}/api/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newCourse.title,
            description: newCourse.description,
            category: newCourse.category || 'Technology',
            thumbnail: newCourse.thumbnail,
            tags: newCourse.tags || [],
            difficulty: newCourse.level?.toLowerCase() || newCourse.difficulty || 'beginner',
            isPublic: newCourse.isPublic !== false,
            videos: newCourse.videos || [],
            duration: newCourse.duration,
            isGenerated: newCourse.isGenerated || false
          })
        });

        if (response.ok) {
          const savedCourse = await response.json();
          console.log('✅ Course saved to backend:', savedCourse);
          
          // Update local state with backend course (has proper _id)
          setCourses(prev => prev.map(c => 
            c.id === localCourse.id ? { ...savedCourse, id: savedCourse._id } : c
          ));
          setMyCourses(prev => prev.map(c => 
            c.id === localCourse.id ? { ...savedCourse, id: savedCourse._id } : c
          ));

          // Notify dashboards/lists to refresh immediately after creation.
          window.dispatchEvent(new CustomEvent('course:created', {
            detail: { courseId: savedCourse._id }
          }));
          
          return savedCourse;
        } else {
          const error = await response.json();
          console.error('Failed to save course:', error);
        }
      } catch (error) {
        console.error('Error saving course to backend:', error);
      }
    }
    
    return localCourse;
  };

  // Update video progress
  const updateVideoProgress = async (courseId, videoId, completed, watchTime = 0, totalDuration = 0) => {
    setProgress(prev => ({
      ...prev,
      videoProgress: {
        ...prev.videoProgress,
        [`${courseId}-${videoId}`]: completed
      }
    }));

    // Keep course lists in sync locally.
    setCourses(prev => prev.map(course => {
      const currentCourseId = course._id || course.id;
      if (String(currentCourseId) !== String(courseId)) return course;

      const videos = (course.videos || []).map((video) => {
        const currentVideoId = video.dbVideoId || video._id || video.id;
        if (String(currentVideoId) !== String(videoId)) return video;
        return { ...video, completed };
      });
      const completedLessons = videos.filter(v => v.completed).length;

      return {
        ...course,
        videos,
        completedLessons,
        progress: videos.length ? Math.round((completedLessons / videos.length) * 100) : 0
      };
    }));

    setMyCourses(prev => prev.map(course => {
      const currentCourseId = course._id || course.id;
      if (String(currentCourseId) !== String(courseId)) return course;

      const videos = (course.videos || []).map((video) => {
        const currentVideoId = video.dbVideoId || video._id || video.id;
        if (String(currentVideoId) !== String(videoId)) return video;
        return { ...video, completed };
      });
      const completedLessons = videos.filter(v => v.completed).length;

      return {
        ...course,
        videos,
        completedLessons,
        progress: videos.length ? Math.round((completedLessons / videos.length) * 100) : 0
      };
    }));

    // Save progress to backend.
    const token = getAuthToken();
    if (token) {
      try {
        await fetch(`${API_URL}/api/progress/${videoId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            watchTime,
            totalDuration,
            completed,
            watchPercentage: totalDuration > 0 ? Math.min(Math.floor((watchTime / totalDuration) * 100), 100) : (completed ? 100 : 0)
          })
        });

        window.dispatchEvent(new CustomEvent('progress:updated', {
          detail: { courseId, videoId, completed }
        }));
      } catch (error) {
        console.error('Error saving video progress:', error);
      }
    }
  };

  // Get course progress percentage
  const getCourseProgress = (courseId) => {
    const course = courses.find(c => (c._id || c.id) === courseId);
    if (!course || !course.videos) return 0;

    const totalVideos = course.videos.length;
    if (totalVideos === 0) return 0;
    
    const completedVideos = course.videos.filter(v => 
      progress.videoProgress[`${courseId}-${v.dbVideoId || v._id || v.id}`]
    ).length;

    return Math.round((completedVideos / totalVideos) * 100);
  };

  // Load courses on mount
  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  return (
    <CourseContext.Provider value={{
      courses,
      myCourses,
      progress,
      loading,
      addCourse,
      fetchCourses,
      fetchMyCourses,
      updateVideoProgress,
      getCourseProgress
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);
export const useCourse = () => useContext(CourseContext);