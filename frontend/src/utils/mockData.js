export const mockCourses = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming',
    thumbnail: 'https://via.placeholder.com/300x200',
    creator: { name: 'John Doe' },
    enrollments: 1250,
    rating: 4.8,
    category: 'Programming',
    difficulty: 'beginner'
  },
  {
    id: '2',
    title: 'React.js Complete Guide',
    description: 'Master React.js from beginner to advanced',
    thumbnail: 'https://via.placeholder.com/300x200',
    creator: { name: 'Jane Smith' },
    enrollments: 890,
    rating: 4.9,
    category: 'Web Development',
    difficulty: 'intermediate'
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js',
    thumbnail: 'https://via.placeholder.com/300x200',
    creator: { name: 'Mike Johnson' },
    enrollments: 567,
    rating: 4.7,
    category: 'Backend',
    difficulty: 'advanced'
  }
];

export const mockVideos = [
  {
    id: '1',
    title: 'Variables and Data Types',
    youtubeId: 'dQw4w9WgXcQ',
    duration: 1200,
    order: 1
  },
  {
    id: '2',
    title: 'Functions in JavaScript',
    youtubeId: 'W6NZfCO5SIk',
    duration: 1800,
    order: 2
  }
];

export const mockProgress = {
  '1': { watchTime: 600, totalDuration: 1200, completed: false, watchPercentage: 50 },
  '2': { watchTime: 1800, totalDuration: 1800, completed: true, watchPercentage: 100 }
};