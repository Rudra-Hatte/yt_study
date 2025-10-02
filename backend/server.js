const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const videoRoutes = require('./routes/videos');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quizzes');
const flashcardRoutes = require('./routes/flashcards');
const aiRoutes = require('./routes/ai');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Database Connection Error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));