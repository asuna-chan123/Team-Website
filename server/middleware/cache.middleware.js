const { client: redisClient } = require('../redisClient');

// Middleware lưu cache bằng Redis
const cacheMiddleware = async (req, res, next) => {
  // Nếu Redis chưa được cấu hình hoặc chưa mở kết nối, bỏ qua cache
  if (!redisClient || !redisClient.isOpen) {
    return next();
  }

  // Tạo cache key dựa vào đường dẫn URL gốc của request (req.originalUrl)
  const key = `cache:url:${req.originalUrl}`;

  try {
    // Kiểm tra Redis trước
    const cachedData = await redisClient.get(key);
    
    // Nếu cache tồn tại thì trả về ngay cho Frontend
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT'); // Đánh dấu cache hit
      return res.json(JSON.parse(cachedData));
    }

    // Nếu cache chưa có (cache miss), ghi đè hàm res.json để chụp lại dữ liệu phản hồi
    res.setHeader('X-Cache', 'MISS'); // Đánh dấu cache miss
    const originalJson = res.json;
    
    res.json = function (body) {
      // Chỉ lưu cache khi mã phản hồi HTTP là 200 (Thành công)
      if (res.statusCode === 200) {
        // Lưu dữ liệu vào Redis với thời gian hết hạn (TTL) là 1 giờ (3600 giây)
        redisClient.set(key, JSON.stringify(body), { EX: 3600 })
          .catch(err => console.error('Lỗi khi ghi dữ liệu vào Redis cache:', err));
      }
      return originalJson.call(this, body);
    };

    next();
  } catch (err) {
    console.error('Lỗi xảy ra trong Redis Cache Middleware:', err);
    next();
  }
};

// Xóa cache khi có thay đổi dữ liệu sản phẩm hoặc danh mục (CUD)
const clearCache = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      console.log('Đang xóa toàn bộ cache Redis liên quan...');
      // Tìm toàn bộ key có mẫu 'cache:url:*'
      const keys = await redisClient.keys('cache:url:*');
      if (keys.length > 0) {
        // Xóa các keys tìm thấy trong Redis
        await redisClient.del(keys);
        console.log(`Đã xóa thành công ${keys.length} key cache.`);
      }
    } catch (err) {
      console.error('Lỗi khi thực hiện xóa cache Redis:', err);
    }
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
};
