const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { cacheMiddleware } = require('../middleware/cache.middleware');

// Định nghĩa các route cho Danh mục (Categories)

// Lấy danh sách toàn bộ danh mục sản phẩm (hỗ trợ cache)
router.get('/', cacheMiddleware, categoryController.getCategories);

// Tạo danh mục mới
router.post('/', categoryController.createCategory);

// Xóa danh mục theo tên
router.delete('/:name', categoryController.deleteCategory);

module.exports = router;
