const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const { cacheProduct, cacheCategoryProducts, redis } = require('./redisClient');

async function seedCache() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({});
    console.log('Pushing cache to Redis Cloud for MongoDB products:', products.length);

    const categoryGroupMap = {};
    for (const prod of products) {
      const prodId = prod._id.toString();
      const compactProduct = {
        _id: prod._id,
        products_id: prod.products_id,
        product_name: prod.product_name || prod.name,
        category: prod.category,
        variants: prod.variants,
        price: prod.price
      };

      await cacheProduct(prodId, compactProduct, 300);
      if (prod.products_id && prod.products_id !== prodId) {
        await cacheProduct(prod.products_id, compactProduct, 300);
      }

      if (prod.category) {
        if (!categoryGroupMap[prod.category]) {
          categoryGroupMap[prod.category] = [];
        }
        categoryGroupMap[prod.category].push(prod.products_id || prodId);
      }
    }

    for (const [catId, pIds] of Object.entries(categoryGroupMap)) {
      await cacheCategoryProducts(catId, pIds, 600);
    }

    const keys = await redis.keys('*');
    console.log('\n======================================================');
    console.log('SUCCESS! TOTAL KEYS IN REDIS CLOUD NOW:', keys.length);
    console.log('KEYS LIST:');
    for (let k of keys) {
      const ttl = await redis.ttl(k);
      const type = await redis.type(k);
      console.log(` - Key: ${k} | Type: ${type} | TTL: ${ttl}s`);
    }
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding cache:', err);
    process.exit(1);
  }
}

seedCache();
