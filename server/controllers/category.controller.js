const Category = require('../models/category.model');
const { clearCache } = require('../middleware/cache.middleware');

// Lấy danh sách tất cả các danh mục
exports.getCategories = async (req, res) => {
  try {
    // Tìm toàn bộ danh mục trong MongoDB
    const categoriesDocs = await Category.find();
    
    // Trích xuất tên danh mục thành mảng chuỗi để phù hợp với định dạng của Frontend
    const names = categoriesDocs.map(c => c.name);
    
    // Trả về kết quả thành công cho Frontend
    res.json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: names
    });
  } catch (error) {
    // Trả về lỗi nếu có sự cố xảy ra
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách danh mục: " + error.message,
      data: null
    });
  }
};

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục là bắt buộc",
        data: null
      });
    }

    // Tạo slug từ name nếu không được cung cấp
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCategory = new Category({ name, slug: categorySlug });
    const savedCategory = await newCategory.save();
    
    // Xóa cache Redis khi dữ liệu danh mục thay đổi
    await clearCache();
    
    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: savedCategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo danh mục: " + error.message,
      data: null
    });
  }
};

// Xóa danh mục theo tên
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findOneAndDelete({ name: req.params.name });
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục để xóa",
        data: null
      });
    }
    
    // Xóa cache Redis khi dữ liệu danh mục thay đổi
    await clearCache();
    
    res.json({
      success: true,
      message: "Xóa danh mục thành công",
      data: deletedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa danh mục: " + error.message,
      data: null
    });
  }
};
