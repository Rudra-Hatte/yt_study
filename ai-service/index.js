const express = require('express');
const cors = require('cors');
require('dotenv').config();
const aiRoutes = require('./routes');
const ragRoutes = require('./routes/rag');
const apiKeyRotator = require('./config/apiKeyRotator');
const { connectDatabase } = require('./config/database');

const app = express();

// Validate API keys are loaded
console.log('🔑 API Key Rotation System Initialized');
console.log(apiKeyRotator.getStats());

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, process.env.BACKEND_URL, 'http://localhost:5173', 'http://localhost:5000']
  : ['http://localhost:5173', 'http://localhost:5000'];

console.log('🌐 Allowed CORS origins:', allowedOrigins);

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
    uptime: process.uptime(),
    ragEnabled: String(process.env.RAG_ENABLED || 'true').toLowerCase() !== 'false'
  });
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);

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

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🤖 AI Service running on port ${PORT}`);
      console.log('🧠 RAG endpoints available at /api/rag/*');
    });
  } catch (error) {
    console.error('❌ Failed to start AI service:', error.message);
    process.exit(1);
  }
}

start();