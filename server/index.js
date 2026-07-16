const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const mongoose = require('mongoose');
const { connectRedis, client: redisClient } = require('./redisClient');
const { clearCache } = require('./middleware/cache.middleware');
const seedData = require('./utils/seeder');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

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

  // Clear Redis Cache on startup to remove stale old-db entries
  await clearCache();

  // Run Seeder
  //await seedData();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
