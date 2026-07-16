const mongoose = require('mongoose');
const Product = require('../models/product.model');
const { clearCache } = require('../middleware/cache.middleware');

// Hàm lấy tên danh mục an toàn (hỗ trợ chuỗi và object lồng từ DB cũ)
const getCategoryName = (categoryField) => {
  if (!categoryField) return "";
  if (typeof categoryField === "string") return categoryField;
  if (typeof categoryField === "object") {
    return categoryField.name || categoryField.category_name || categoryField.slug || "";
  }
  return "";
};

// Hàm lấy ID danh mục an toàn
const getCategoryId = (categoryField) => {
  if (!categoryField) return null;
  if (typeof categoryField === "object") {
    return categoryField._id || null;
  }
  return null;
};

// Hàm bổ trợ định dạng lại sản phẩm trả về nhằm tương thích hoàn toàn với Frontend cũ (React components)
// Hỗ trợ đồng thời cả dữ liệu chuẩn schema mới và dữ liệu cũ hiện có trong MongoDB
const formatProduct = (productDoc) => {
  if (!productDoc) return null;
  const doc = productDoc.toObject ? productDoc.toObject() : productDoc;

  // Ánh xạ tên danh mục và ID danh mục (hỗ trợ cả phẳng và object lồng từ DB cũ)
  const categoryName = getCategoryName(doc.category) || doc.categoryName || "";
  const categoryId = getCategoryId(doc.category) || doc.categoryId || null;

  // Tính tổng số lượng hàng tồn kho (từ các variants, hoặc trường stock, hoặc dựa trên status)
  let stock = doc.stock;
  if (stock === undefined || stock === 0) {
    if (doc.variants && Array.isArray(doc.variants) && doc.variants.length > 0) {
      stock = doc.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
    }
  }

  // Lấy đánh giá (rating) từ trường ratings.average_rating hoặc rating
  const rating = (doc.ratings && doc.ratings.average_rating) || doc.rating || 0;

  // Trích xuất danh sách màu sắc từ các variants hoặc attributes
  let colors = doc.colors || [];
  if ((!colors || colors.length === 0) && doc.variants && Array.isArray(doc.variants)) {
    const extractedColors = [];
    doc.variants.forEach(variant => {
      if (variant.color && !extractedColors.includes(variant.color)) {
        extractedColors.push(variant.color);
      }
      if (variant.attributes && Array.isArray(variant.attributes)) {
        const colorAttr = variant.attributes.find(attr => attr.name === 'Màu sắc' || attr.name === 'Color');
        if (colorAttr && colorAttr.value && !extractedColors.includes(colorAttr.value)) {
          extractedColors.push(colorAttr.value);
        }
      }
    });
    colors = extractedColors;
  }
  if ((!colors || colors.length === 0) && doc.attributes && Array.isArray(doc.attributes)) {
    const colorAttr = doc.attributes.find(attr => attr.name === 'Màu sắc' || attr.name === 'Color');
    if (colorAttr && colorAttr.value) {
      colors = [colorAttr.value];
    }
  }

  // Lấy thông số kỹ thuật (attributes hoặc specifications)
  const specifications = (doc.attributes && doc.attributes.length > 0)
    ? doc.attributes
    : (doc.specifications || []);

  let priceVal = doc.price;
  if (!priceVal && doc.variants && doc.variants.length > 0) {
    priceVal = doc.variants[0].price;
  }
  if (doc.sale_price > 0) {
    priceVal = doc.sale_price;
  }

  let imageVal = doc.image;
  if (!imageVal && doc.variants && doc.variants.length > 0) {
    imageVal = doc.variants[0].image || (doc.variants[0].images && doc.variants[0].images[0]);
  }
  if (!imageVal && Array.isArray(doc.images) && doc.images.length > 0) {
    imageVal = doc.images[0];
  }

  return {
    ...doc,
    id: doc.slug || (doc._id ? doc._id.toString() : ""),
    _id: doc._id,
    name: doc.name,
    slug: doc.slug,
    sku: doc.sku,
    brand: doc.brand,
    description: doc.description || doc.short_description || "",
    shortDescription: doc.short_description || "",
    price: priceVal,
    originalPrice: doc.price || priceVal,
    discountPercentage: doc.discount_percentage || 0,
    images: Array.isArray(doc.images) && doc.images.length > 0 ? doc.images : (imageVal ? [imageVal] : []),
    image: imageVal || "",
    category: categoryName,
    categoryName: categoryName,
    categoryId,
    stock,
    availability: stock > 0 ? "In Stock" : "Out of Stock",
    isFeatured: Boolean(doc.is_featured ?? doc.isFeatured),
    rating,
    colors,
    color: colors.length > 0 ? colors[0] : "",
    specifications,
    createdAt: doc.createdAt || doc.created_at || new Date(),
    updatedAt: doc.updatedAt || doc.updated_at || new Date()
  };
};

// 1. GET /api/products - Lấy danh sách toàn bộ sản phẩm
// Hỗ trợ: tìm kiếm theo tên, danh mục, và sắp xếp (sorting)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const filter = {};

    // Lọc theo tên danh mục sản phẩm nếu có (hỗ trợ cả phẳng và object lồng từ DB cũ)
    if (category) {
      filter.$or = [
        { category: category },
        { categoryName: category },
        { 'category.name': category }
      ];
    }

    // Lọc theo từ khóa tìm kiếm (trong tên, SKU, mô tả hoặc thương hiệu) nếu có
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Xây dựng câu lệnh sắp xếp (sorting)
    let sortQuery = {};
    if (sort === 'price-asc') {
      sortQuery = { 'variants.price': 1 }; // Sắp xếp giá tăng dần
    } else if (sort === 'price-desc') {
      sortQuery = { 'variants.price': -1 }; // Sắp xếp giá giảm dần
    } else if (sort === 'name-az') {
      sortQuery = { name: 1 }; // Sắp xếp tên từ A đến Z
    } else {
      sortQuery = { createdAt: -1 }; // Sắp xếp mặc định: sản phẩm mới nhất
    }

    // Truy vấn cơ sở dữ liệu MongoDB
    const productsDocs = await Product.find(filter).sort(sortQuery).lean();
    
    // Định dạng lại toàn bộ danh sách sản phẩm để Frontend dùng được luôn
    const formattedProducts = productsDocs.map(formatProduct);

    // Trả dữ liệu thành công cho Frontend
    res.json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: formattedProducts
    });
  } catch (error) {
    // Xử lý lỗi hệ thống
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách sản phẩm: " + error.message,
      data: null
    });
  }
};

// 2. GET /api/products/:id - Lấy thông tin chi tiết của một sản phẩm
// Hỗ trợ truy vấn bằng Mongoose _id hoặc bằng custom slug (như hp-1, kb-1)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};

    // Kiểm tra xem tham số truyền vào có phải là ObjectId hợp lệ của MongoDB không
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id }; // Nếu không phải ObjectId, tìm theo slug (như hp-1, kb-1)
    }

    const productDoc = await Product.findOne(query).lean();
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm yêu cầu",
        data: null
      });
    }

    // Trả dữ liệu chi tiết sản phẩm cho Frontend sau khi định dạng lại
    res.json({
      success: true,
      message: "Lấy thông tin chi tiết sản phẩm thành công",
      data: formatProduct(productDoc)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin chi tiết sản phẩm: " + error.message,
      data: null
    });
  }
};

// 3. GET /api/products/search - Tìm kiếm sản phẩm theo từ khóa
// Định dạng: ?q=headphone
exports.searchProducts = async (req, res) => {
  try {
    const queryTerm = req.query.q;
    if (!queryTerm) {
      return res.status(400).json({
        success: false,
        message: "Từ khóa tìm kiếm là bắt buộc",
        data: null
      });
    }

    // Tìm kiếm các sản phẩm khớp với từ khóa trong tên, SKU, mô tả hoặc thương hiệu hoặc danh mục
    const searchFilter = {
      $or: [
        { name: { $regex: queryTerm, $options: 'i' } },
        { sku: { $regex: queryTerm, $options: 'i' } },
        { description: { $regex: queryTerm, $options: 'i' } },
        { brand: { $regex: queryTerm, $options: 'i' } },
        { category: { $regex: queryTerm, $options: 'i' } },
        { categoryName: { $regex: queryTerm, $options: 'i' } },
        { 'category.name': { $regex: queryTerm, $options: 'i' } }
      ]
    };

    const productsDocs = await Product.find(searchFilter).lean();
    const formattedProducts = productsDocs.map(formatProduct);

    // Trả dữ liệu tìm kiếm thành công cho Frontend
    res.json({
      success: true,
      message: "Tìm kiếm sản phẩm thành công",
      data: formattedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tìm kiếm sản phẩm: " + error.message,
      data: null
    });
  }
};

// C. Các hàm bổ sung để thay đổi dữ liệu sản phẩm (Create, Update, Delete)
// Sẽ tự động gọi clearCache() để làm trống cache Redis mỗi khi thay đổi
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    
    // Xóa cache Redis của danh sách sản phẩm để cập nhật dữ liệu mới nhất
    await clearCache();
    
    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: formatProduct(savedProduct)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo sản phẩm: " + error.message,
      data: null
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    const updatedProduct = await Product.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật",
        data: null
      });
    }

    // Xóa cache Redis của danh sách sản phẩm để đồng bộ dữ liệu mới nhất
    await clearCache();

    res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: formatProduct(updatedProduct)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật sản phẩm: " + error.message,
      data: null
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    const deletedProduct = await Product.findOneAndDelete(query);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để xóa",
        data: null
      });
    }

    // Xóa cache Redis của danh sách sản phẩm
    await clearCache();

    res.json({
      success: true,
      message: "Xóa sản phẩm thành công",
      data: formatProduct(deletedProduct)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sản phẩm: " + error.message,
      data: null
    });
  }
};
