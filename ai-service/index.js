const express = require('express');
const cors = require('cors');
require('dotenv').config();
const aiRoutes = require('./routes');

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, process.env.BACKEND_URL, 'http://localhost:5173', 'http://localhost:5000']
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoints (IMPORTANT for Render deployment)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'AI Service is running',
    service: 'yt-study-ai-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'yt-study-ai-service',
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Something went wrong with the AI service',
    success: false 
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 AI Service running on port ${PORT}`);
});