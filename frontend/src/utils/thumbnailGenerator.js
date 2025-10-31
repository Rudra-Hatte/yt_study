export const TOPIC_COLORS = {
  'JavaScript Fundamentals': '3b82f6',
  'React.js Basics': '06b6d4',
  'Python Programming': '22c55e',
  'Web Development': '8b5cf6',
  'Data Structures': 'ef4444',
  'default': '6366f1'
};

export const generateThumbnail = (title, topic) => {
  const color = TOPIC_COLORS[topic] || TOPIC_COLORS.default;
  // Format title - limit length and replace spaces with +
  const formattedTitle = encodeURIComponent(title.slice(0, 30))
    .replace(/%20/g, '+');
  
  // Return placeholder image URL with topic-based color
  return `https://placehold.co/600x400/${color}/ffffff?text=${formattedTitle}`;
};