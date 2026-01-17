// API Configuration
// Uses environment variables for flexibility across environments

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

export { API_URL, AI_SERVICE_URL };
