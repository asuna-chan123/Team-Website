const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Redis = require('ioredis');

// Connect to Redis (from env REDIS_URL, REDIS_URI or default localhost:6379)
const redisURI = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://127.0.0.1:6379';

const redis = new Redis(redisURI, {
  family: 4,
  connectTimeout: 10000,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 5) {
      console.warn('[Redis] Unable to connect to Cloud Redis after 5 retries. Using In-Memory fallback.');
      return null;
    }
    return Math.min(times * 200, 2000);
  }
});

let isRedisConnected = false;

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Connected successfully to Redis server!');
});

redis.on('ready', () => {
  isRedisConnected = true;
});

redis.on('error', (err) => {
  console.warn('[Redis Notice]', err.message);
});

// Helper check
function canUseRedis() {
  return isRedisConnected || redis.status === 'ready' || redis.status === 'connect' || redis.status === 'connecting';
}

// ----------------------------------------------------
// IN-MEMORY FALLBACK (Dùng tạm nếu chưa kết nối được Redis)
// ----------------------------------------------------
const inMemoryStore = new Map();
const inMemoryTTLs = new Map();

function setInMemory(key, value, ttlSeconds) {
  inMemoryStore.set(key, value);
  if (inMemoryTTLs.has(key)) clearTimeout(inMemoryTTLs.get(key));
  if (ttlSeconds && ttlSeconds > 0) {
    const timer = setTimeout(() => {
      inMemoryStore.delete(key);
      inMemoryTTLs.delete(key);
    }, ttlSeconds * 1000);
    inMemoryTTLs.set(key, timer);
  }
}

function getInMemory(key) {
  return inMemoryStore.get(key) || null;
}

function deleteInMemory(key) {
  inMemoryStore.delete(key);
  if (inMemoryTTLs.has(key)) {
    clearTimeout(inMemoryTTLs.get(key));
    inMemoryTTLs.delete(key);
  }
}

// ====================================================
// 1. SESSION ĐĂNG NHẬP (TTL: 1.800 giây = 30 phút)
// Key: session:{session_id} | String JSON
// ====================================================
async function setSession(sessionId, data, ttlSeconds = 1800) {
  const key = `session:${sessionId}`;
  const value = JSON.stringify(data);
  try {
    if (canUseRedis()) {
      await redis.set(key, value, 'EX', ttlSeconds);
      return;
    }
  } catch (err) {
    console.warn('Fallback setSession:', err.message);
  }
  setInMemory(key, value, ttlSeconds);
}

async function getSession(sessionId) {
  const key = `session:${sessionId}`;
  try {
    if (canUseRedis()) {
      const raw = await redis.get(key);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Fallback getSession:', err.message);
  }
  const raw = getInMemory(key);
  return raw ? JSON.parse(raw) : null;
}

async function deleteSession(sessionId) {
  const key = `session:${sessionId}`;
  try {
    if (canUseRedis()) {
      await redis.del(key);
      return;
    }
  } catch (err) {}
  deleteInMemory(key);
}

// ====================================================
// 2. GIỎ HÀNG ĐANG HOẠT ĐỘNG (TTL: 604.800 giây = 7 ngày)
// Key: cart:{user_id} | Hash (field=variant_id, value=quantity)
// ====================================================
async function setCartItem(userId, variantId, quantity, ttlSeconds = 604800) {
  const key = `cart:${userId}`;
  try {
    if (canUseRedis()) {
      await redis.hset(key, variantId, quantity);
      await redis.expire(key, ttlSeconds);
      return;
    }
  } catch (err) {}
  let cart = getInMemory(key) || {};
  cart[variantId] = quantity;
  setInMemory(key, cart, ttlSeconds);
}

async function getCart(userId) {
  const key = `cart:${userId}`;
  try {
    if (canUseRedis()) {
      return await redis.hgetall(key);
    }
  } catch (err) {}
  return getInMemory(key) || {};
}

// ====================================================
// 3. CACHE CHI TIẾT SẢN PHẨM RÚT GỌN (TTL: 300 giây = 5 phút)
// Key: cache:product:{product_id} | String JSON
// ====================================================
async function cacheProduct(productId, productData, ttlSeconds = 300) {
  const key = `cache:product:${productId}`;
  const value = JSON.stringify(productData);
  try {
    if (canUseRedis()) {
      await redis.set(key, value, 'EX', ttlSeconds);
      return;
    }
  } catch (err) {}
  setInMemory(key, value, ttlSeconds);
}

async function getProductCache(productId) {
  const key = `cache:product:${productId}`;
  try {
    if (canUseRedis()) {
      const raw = await redis.get(key);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {}
  const raw = getInMemory(key);
  return raw ? JSON.parse(raw) : null;
}

async function invalidateProductCache(productId) {
  const key = `cache:product:${productId}`;
  try {
    if (canUseRedis()) {
      await redis.del(key);
      return;
    }
  } catch (err) {}
  deleteInMemory(key);
}

// ====================================================
// 4. CACHE DANH SÁCH PRODUCT_ID THEO DANH MỤC (TTL: 600 giây = 10 phút)
// Key: cache:category:{category_id} | Set
// ====================================================
async function cacheCategoryProducts(categoryId, productIds, ttlSeconds = 600) {
  const key = `cache:category:${categoryId}`;
  try {
    if (canUseRedis() && productIds && productIds.length > 0) {
      await redis.del(key);
      await redis.sadd(key, ...productIds);
      await redis.expire(key, ttlSeconds);
      return;
    }
  } catch (err) {}
  setInMemory(key, new Set(productIds), ttlSeconds);
}

async function getCategoryProductsCache(categoryId) {
  const key = `cache:category:${categoryId}`;
  try {
    if (canUseRedis()) {
      const members = await redis.smembers(key);
      if (members && members.length > 0) return members;
    }
  } catch (err) {}
  const setVal = getInMemory(key);
  return setVal ? Array.from(setVal) : null;
}

// ====================================================
// 5. KHÓA NGẮN HẠN TÙY CHỌN - DISTRIBUTED LOCK (TTL: 10 giây)
// Key: lock:stock:{variant_id} | String (Token checkout)
// ====================================================
async function acquireStockLock(variantId, token, ttlSeconds = 10) {
  const key = `lock:stock:${variantId}`;
  try {
    if (canUseRedis()) {
      const result = await redis.set(key, token, 'NX', 'EX', ttlSeconds);
      return result === 'OK';
    }
  } catch (err) {}
  const existing = getInMemory(key);
  if (existing) return false;
  setInMemory(key, token, ttlSeconds);
  return true;
}

async function releaseStockLock(variantId, token) {
  const key = `lock:stock:${variantId}`;
  try {
    if (canUseRedis()) {
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(luaScript, 1, key, token);
      return;
    }
  } catch (err) {}
  if (getInMemory(key) === token) {
    deleteInMemory(key);
  }
}

module.exports = {
  redis,
  setSession,
  getSession,
  deleteSession,
  setCartItem,
  getCart,
  cacheProduct,
  getProductCache,
  invalidateProductCache,
  cacheCategoryProducts,
  getCategoryProductsCache,
  acquireStockLock,
  releaseStockLock
};
