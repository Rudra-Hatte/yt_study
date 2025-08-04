const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log(' MONGODB_URI not found, skipping database connection');
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(` YT Study MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    console.log(' Server will continue without database connection');
  }
};

module.exports = connectDB;