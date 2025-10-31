import { generateThumbnail } from './thumbnailGenerator';

export const MOCK_COURSES = [
  {
    id: 1,
    title: 'Complete React.js Tutorial',
    description: 'Learn React from scratch with this comprehensive tutorial covering hooks, components, and state management.',
    thumbnail: `https://placehold.co/600x400/3b82f6/ffffff?text=React.js%0AMastery`,
    duration: '3h 45m',
    progress: 75,
    totalLessons: 8,
    completedLessons: 6,
    status: 'in-progress',
    level: 'Intermediate',
    videos: [
      {
        id: 'v1',
        title: '1. React Fundamentals & Setup',
        youtubeId: 'w7ejDZ8SWv8',
        duration: '30:00',
        completed: true
      },
      {
        id: 'v2',
        title: '2. Components & Props Deep Dive',
        youtubeId: 'bMknfKXIFA8',
        duration: '45:00',
        completed: true
      },
      {
        id: 'v3',
        title: '3. State & Hooks in React',
        youtubeId: 'TNhaISOUy6Q',
        duration: '35:00',
        completed: true
      },
      {
        id: 'v4',
        title: '4. Building Forms in React',
        youtubeId: 'PkZNo7MFNFg',
        duration: '25:00',
        completed: true
      },
      {
        id: 'v5',
        title: '5. React Router & Navigation',
        youtubeId: 'Ul3y1LXxzdU',
        duration: '40:00',
        completed: true
      },
      {
        id: 'v6',
        title: '6. Context API & State Management',
        youtubeId: '4UZrsTqkcW4',
        duration: '30:00',
        completed: true
      },
      {
        id: 'v7',
        title: '7. Advanced Hooks (useCallback, useMemo)',
        youtubeId: 'LlvBzyy-558',
        duration: '35:00',
        completed: false
      },
      {
        id: 'v8',
        title: '8. Building Final Project',
        youtubeId: 'jS4aFq5-91M',
        duration: '50:00',
        completed: false
      }
    ]
  },
  {
    id: 2,
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
    thumbnail: `https://placehold.co/600x400/3b82f6/ffffff?text=Node.js%0AMastery`,
    duration: '5h 20m',
    progress: 45,
    totalLessons: 32,
    completedLessons: 14,
    status: 'in-progress',
    level: 'Intermediate',
    videos: [
      {
        id: 'v1',
        title: 'Node.js Crash Course',
        youtubeId: 'fBNz5xF-Kx4',
        duration: '1:30:00'
      }
    ]
  },
  {
    id: 3,
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
    thumbnail: `https://placehold.co/600x400/3b82f6/ffffff?text=ML%0AMastery`,
    duration: '8h 15m',
    progress: 100,
    totalLessons: 45,
    completedLessons: 45,
    status: 'completed',
    level: 'Advanced',
    videos: [
      {
        id: 'v1',
        title: 'ML Basics',
        youtubeId: 'JcI5Vnw0b2c',
        duration: '1:00:00'
      }
    ]
  }
];

export const MOCK_PROGRESS = {
  courseProgress: {},
  videoProgress: {}
};

export const MOCK_USERS = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    enrolledCourses: ['1']
  }
];