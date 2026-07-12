require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const mongoose = require('mongoose');
const { connectRedis, client: redisClient } = require('./redisClient');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', async (req, res) => {
  try {
    // Test Redis connection
    await redisClient.set('health_check', 'ok', { EX: 10 });
    const redisVal = await redisClient.get('health_check');
    
    res.json({ 
      status: 'ok', 
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisVal === 'ok' ? 'connected' : 'disconnected'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect Databases
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
