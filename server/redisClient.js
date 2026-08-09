const Redis = require('ioredis');

// Connect to Redis (from env REDIS_URI or default localhost:6379)
const redisURI = process.env.REDIS_URI || 'redis://127.0.0.1:6379';

const redis = new Redis(redisURI, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('[Redis] Connection failed 3 times. Falling back to In-Memory mode.');
      return null; // stop retrying, fallback mode enabled
    }
    return Math.min(times * 100, 2000);
  }
});

let isRedisConnected = false;

redis.connect().then(() => {
  isRedisConnected = true;
  console.log('[Redis] Connected successfully to Redis server!');
}).catch((err) => {
  isRedisConnected = false;
  console.warn('[Redis] Unable to connect to Redis server (will use fallback in-memory cache):', err.message);
});

redis.on('error', (err) => {
  if (isRedisConnected) {
    console.error('[Redis Error]', err.message);
  }
});

// ----------------------------------------------------
// IN-MEMORY FALLBACK (Dùng tạm nếu chưa bật Redis Server)
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

// 1. SESSION ĐĂNG NHẬP (TTL: 1.800 giây = 30 phút)
// Key: session:{session_id} | String JSON
async function setSession(sessionId, data, ttlSeconds = 1800) {
  const key = `session:${sessionId}`;
  const value = JSON.stringify(data);
  if (isRedisConnected) {
    await redis.set(key, value, 'EX', ttlSeconds);
  } else {
    setInMemory(key, value, ttlSeconds);
  }
}

async function getSession(sessionId) {
  const key = `session:${sessionId}`;
  let raw = null;
  if (isRedisConnected) {
    raw = await redis.get(key);
  } else {
    raw = getInMemory(key);
  }
  return raw ? JSON.parse(raw) : null;
}

async function deleteSession(sessionId) {
  const key = `session:${sessionId}`;
  if (isRedisConnected) {
    await redis.del(key);
  } else {
    deleteInMemory(key);
  }
}

// 2. GIỎ HÀNG ĐANG HOẠT ĐỘNG (TTL: 604.800 giây = 7 ngày)
// Key: cart:{user_id} | Hash (field=variant_id, value=quantity)
async function setCartItem(userId, variantId, quantity, ttlSeconds = 604800) {
  const key = `cart:${userId}`;
  if (isRedisConnected) {
    await redis.hset(key, variantId, quantity);
    await redis.expire(key, ttlSeconds);
  } else {
    let cart = getInMemory(key) || {};
    cart[variantId] = quantity;
    setInMemory(key, cart, ttlSeconds);
  }
}

async function getCart(userId) {
  const key = `cart:${userId}`;
  if (isRedisConnected) {
    return await redis.hgetall(key);
  } else {
    return getInMemory(key) || {};
  }
}

// 3. CACHE CHI TIẾT SẢN PHẨM RÚT GỌN (TTL: 300 giây = 5 phút)
// Key: cache:product:{product_id} | String JSON
async function cacheProduct(productId, productData, ttlSeconds = 300) {
  const key = `cache:product:${productId}`;
  const value = JSON.stringify(productData);
  if (isRedisConnected) {
    await redis.set(key, value, 'EX', ttlSeconds);
  } else {
    setInMemory(key, value, ttlSeconds);
  }
}

async function getProductCache(productId) {
  const key = `cache:product:${productId}`;
  let raw = null;
  if (isRedisConnected) {
    raw = await redis.get(key);
  } else {
    raw = getInMemory(key);
  }
  return raw ? JSON.parse(raw) : null;
}

async function invalidateProductCache(productId) {
  const key = `cache:product:${productId}`;
  if (isRedisConnected) {
    await redis.del(key);
  } else {
    deleteInMemory(key);
  }
}

// 4. CACHE DANH SÁCH PRODUCT_ID THEO DANH MỤC (TTL: 600 giây = 10 phút)
// Key: cache:category:{category_id} | Set
async function cacheCategoryProducts(categoryId, productIds, ttlSeconds = 600) {
  const key = `cache:category:${categoryId}`;
  if (isRedisConnected) {
    if (productIds && productIds.length > 0) {
      await redis.del(key);
      await redis.sadd(key, ...productIds);
      await redis.expire(key, ttlSeconds);
    }
  } else {
    setInMemory(key, new Set(productIds), ttlSeconds);
  }
}

async function getCategoryProductsCache(categoryId) {
  const key = `cache:category:${categoryId}`;
  if (isRedisConnected) {
    const members = await redis.smembers(key);
    return members.length > 0 ? members : null;
  } else {
    const setVal = getInMemory(key);
    return setVal ? Array.from(setVal) : null;
  }
}

// 5. KHÓA NGẮN HẠN TÙY CHỌN - DISTRIBUTED LOCK (TTL: 10 giây)
// Key: lock:stock:{variant_id} | String (Token checkout)
async function acquireStockLock(variantId, token, ttlSeconds = 10) {
  const key = `lock:stock:${variantId}`;
  if (isRedisConnected) {
    // SET key token NX EX ttlSeconds (Chỉ set nếu key chưa tồn tại)
    const result = await redis.set(key, token, 'NX', 'EX', ttlSeconds);
    return result === 'OK';
  } else {
    const existing = getInMemory(key);
    if (existing) return false;
    setInMemory(key, token, ttlSeconds);
    return true;
  }
}

async function releaseStockLock(variantId, token) {
  const key = `lock:stock:${variantId}`;
  if (isRedisConnected) {
    // Lua script giải phóng lock an toàn chỉ khi token trùng khớp
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await redis.eval(luaScript, 1, key, token);
  } else {
    if (getInMemory(key) === token) {
      deleteInMemory(key);
    }
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
