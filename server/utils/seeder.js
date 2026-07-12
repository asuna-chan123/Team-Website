const Category = require('../models/category.model');
const Product = require('../models/product.model');

const seedData = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();

    // Nếu database đã có dữ liệu sản phẩm hoặc danh mục, không gieo dữ liệu mới
    if (categoryCount > 0 || productCount > 0) {
      console.log('Database đã có dữ liệu. Bỏ qua Seeder.');
      return;
    }

    console.log('Database trống. Đang tiến hành nạp dữ liệu mẫu...');

    // Đọc dữ liệu mẫu từ các file JSON
    const categoriesData = require('./mockCategories.json');
    const productsData = require('./mockProducts.json');

    // Nạp danh mục trước để lấy _id liên kết với sản phẩm
    const categoryDocs = [];
    for (const name of categoriesData) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCategory = new Category({ name, slug });
      const savedCategory = await newCategory.save();
      categoryDocs.push(savedCategory);
    }
    console.log(`Đã tạo thành công ${categoryDocs.length} danh mục mẫu.`);

    // Nạp danh sách 20 sản phẩm
    let productSeedCount = 0;
    for (const prod of productsData) {
      // Tìm danh mục tương ứng để liên kết
      const matchedCat = categoryDocs.find(c => c.name.toLowerCase() === prod.category.toLowerCase());
      if (!matchedCat) continue;

      const newProduct = new Product({
        name: prod.name,
        slug: prod.id, // Ánh xạ trường id của mock thành slug
        description: prod.description,
        price: prod.price,
        image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
        images: prod.images,
        categoryId: matchedCat._id,
        categoryName: matchedCat.name,
        brand: prod.brand,
        stock: prod.stock,
        rating: 4.5,
        isFeatured: prod.isFeatured || false,
        colors: prod.color ? [prod.color] : [],
        specifications: []
      });

      await newProduct.save();
      productSeedCount++;
    }
    console.log(`Đã nạp thành công ${productSeedCount} sản phẩm mẫu.`);
  } catch (err) {
    console.error('Lỗi khi chạy Seeder:', err);
  }
};

module.exports = seedData;