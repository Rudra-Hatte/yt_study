const mongoose = require('mongoose');

let connected = false;

async function connectDatabase() {
  if (connected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });

  connected = true;
  console.log('✅ MongoDB connected for RAG knowledge store');
  return mongoose.connection;
}

module.exports = {
  connectDatabase
};