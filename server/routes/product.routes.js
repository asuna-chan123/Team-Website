const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { cacheMiddleware } = require('../middleware/cache.middleware');

// Định nghĩa các route cho Sản phẩm (Products)
// Cần chú ý định nghĩa route '/search' TRƯỚC route '/:id' để tránh xung đột định tuyến trong Express

// Lấy danh sách sản phẩm (có bộ lọc và sắp xếp, hỗ trợ cache)
router.get('/', cacheMiddleware, productController.getProducts);

// Tìm kiếm sản phẩm theo từ khóa ?q= (hỗ trợ cache)
router.get('/search', cacheMiddleware, productController.searchProducts);

// Lấy chi tiết một sản phẩm theo Mongoose _id hoặc slug (hỗ trợ cache)
router.get('/:id', cacheMiddleware, productController.getProductById);

// Các route thay đổi dữ liệu sản phẩm (cho phép đồng bộ và xóa cache tự động)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
