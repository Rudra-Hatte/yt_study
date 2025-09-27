const Progress = require('../models/Progress');
const Video = require('../models/Video');

// Get progress for a user's video
exports.getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      videoId: req.params.videoId
    });
    
    if (!progress) {
      return res.status(404).json({ msg: 'Progress not found' });
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update progress
exports.updateProgress = async (req, res) => {
  const { watchTime, totalDuration, watchPercentage, completed } = req.body;
  
  try {
    // Check if video exists
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    
    // Calculate watch percentage if not provided
    let calculatedWatchPercentage = watchPercentage;
    if (totalDuration && watchTime && !watchPercentage) {
      calculatedWatchPercentage = Math.min(Math.floor((watchTime / totalDuration) * 100), 100);
    }
    
    // Set completed based on watch percentage if not provided
    let isCompleted = completed;
    if (calculatedWatchPercentage >= 90 && isCompleted === undefined) {
      isCompleted = true;
    }
    
    let progress = await Progress.findOne({
      userId: req.user.id,
      videoId: req.params.videoId
    });
    
    if (progress) {
      // Update existing progress
      progress = await Progress.findOneAndUpdate(
        { userId: req.user.id, videoId: req.params.videoId },
        { 
          watchTime,
          totalDuration,
          watchPercentage: calculatedWatchPercentage,
          completed: isCompleted,
          lastAccessed: Date.now()
        },
        { new: true }
      );
    } else {
      // Create new progress
      progress = new Progress({
        userId: req.user.id,
        videoId: req.params.videoId,
        watchTime,
        totalDuration,
        watchPercentage: calculatedWatchPercentage,
        completed: isCompleted
      });
      
      await progress.save();
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add bookmark
exports.addBookmark = async (req, res) => {
  const { timestamp, note } = req.body;
  
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      videoId: req.params.videoId
    });
    
    if (!progress) {
      // Create new progress with bookmark
      const newProgress = new Progress({
        userId: req.user.id,
        videoId: req.params.videoId,
        bookmarks: [{ timestamp, note }]
      });
      
      await newProgress.save();
      return res.json(newProgress);
    }
    
    // Add bookmark to existing progress
    progress.bookmarks.push({ timestamp, note });
    await progress.save();
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all progress for a user
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .populate('videoId', 'title thumbnail youtubeId courseId')
      .sort({ lastAccessed: -1 });
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update study session
exports.updateStudySession = async (req, res) => {
  const { startTime, endTime, duration, activity } = req.body;
  
  try {
    let progress = await Progress.findOne({
      userId: req.user.id,
      videoId: req.params.videoId
    });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.id,
        videoId: req.params.videoId,
        studySessions: [{ startTime, endTime, duration, activity }]
      });
      
      await progress.save();
      return res.json(progress);
    }
    
    progress.studySessions.push({ startTime, endTime, duration, activity });
    await progress.save();
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update ratings
exports.updateRatings = async (req, res) => {
  const { difficulty, usefulness, clarity } = req.body;
  
  try {
    let progress = await Progress.findOne({
      userId: req.user.id,
      videoId: req.params.videoId
    });
    
    if (!progress) {
      progress = new Progress({
        userId: req.user.id,
        videoId: req.params.videoId,
        ratings: { difficulty, usefulness, clarity }
      });
      
      await progress.save();
      return res.json(progress);
    }
    
    progress.ratings = { difficulty, usefulness, clarity };
    await progress.save();
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};