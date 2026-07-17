import React, { useState, useEffect } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import { MdWarning, MdEdit, MdDelete, MdAdd, MdClose, MdInfo } from "react-icons/md";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState("");
  const [variants, setVariants] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setSku("");
    setName("");
    setDescription("");
    setCategory(categories[0]?.name || "");
    setLowStockAlert("5");
    setVariants([{ name: "Mặc định", price: 0, stock: 0, images: [], imgInput: "" }]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod._id);
    setSku(prod.sku);
    setName(prod.product_name);
    setDescription(prod.description || "");
    setCategory(prod.category);
    
    // Map existing variants and add helper field for inputting new image URLs
    const mappedVariants = (prod.variants || []).map(v => ({
      ...v,
      imgInput: ""
    }));
    
    if (mappedVariants.length === 0) {
      mappedVariants.push({ name: "Mặc định", price: 0, stock: 0, images: [], imgInput: "" });
    }
    
    setVariants(mappedVariants);
    setShowModal(true);
  };

  const handleOpenDetail = (prod) => {
    setSelectedProduct(prod);
    setShowDetailModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    // Validate variants
    if (variants.length === 0) {
      alert("Vui lòng thiết lập ít nhất một biến thể.");
      return;
    }

    const cleanVariants = variants.map(v => ({
      name: v.name || "Mặc định",
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      images: (v.images || []).filter(img => img.trim() !== "")
    }));

    let finalSku = sku;
    if (!finalSku || finalSku.trim() === "") {
      finalSku = "SP" + Math.floor(100000 + Math.random() * 900000);
    }

    const productData = {
      sku: finalSku,
      product_name: name,
      description,
      category,
      variants: cleanVariants
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`http://localhost:5000/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });
      } else {
        res = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });
      }

      if (res.ok) {
        fetchProducts();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi khi lưu sản phẩm");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      if (res.ok) {
        fetchCategories();
        setCategory(newCatName);
        setShowCatModal(false);
        setNewCatName("");
        setNewCatDesc("");
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi khi tạo danh mục");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper functions for dynamic variant manager
  const addVariantField = () => {
    setVariants([...variants, { name: "", price: 0, stock: 0, images: [], imgInput: "" }]);
  };

  const removeVariantField = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantValue = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantImage = (vIndex) => {
    const updated = [...variants];
    const newUrl = updated[vIndex].imgInput;
    if (newUrl && newUrl.trim() !== "") {
      updated[vIndex].images = [...(updated[vIndex].images || []), newUrl.trim()];
      updated[vIndex].imgInput = "";
      setVariants(updated);
    }
  };

  const removeVariantImage = (vIndex, imgIndex) => {
    const updated = [...variants];
    updated[vIndex].images = updated[vIndex].images.filter((_, idx) => idx !== imgIndex);
    setVariants(updated);
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesName = (p.product_name || "").toLowerCase().includes(term);
    const matchesSku = p.sku.toLowerCase().includes(term);
    
    const matchesVariants = (p.variants || []).some(v => 
      v.name.toLowerCase().includes(term) || 
      v.price.toString().includes(term)
    );

    const matchesSearch = matchesName || matchesSku || matchesVariants;
    const matchesCategory = filterCategory === "" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-5">
      {/* Header section */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 dark:text-white">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Xem danh sách, quản lý biến thể sản phẩm, giá bán, tồn kho và danh mục.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCatModal(true)}
            className="flex items-center gap-1 rounded-xl border border-brand-500 bg-transparent px-4 py-2 text-sm font-medium text-brand-500 transition duration-200 hover:bg-brand-500/10 active:bg-brand-500/20 dark:border-brand-400 dark:text-brand-400"
          >
            <MdAdd className="h-4 w-4" /> Danh mục
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            <MdAdd className="h-4 w-4" /> Thêm Sản phẩm
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main product table */}
      <Card extra="w-full pb-6 p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-white/10">
                <th className="py-3 px-4">Ảnh</th>
                <th className="py-3 px-4">Sản phẩm / SKU</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Khoảng giá</th>
                <th className="py-3 px-4">Tổng tồn kho</th>
                <th className="py-3 px-4">Biến thể</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredProducts.map((p) => {
                // Find primary image from first variant
                const primaryImg = p.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100";
                
                // Calculate total stock
                const totalStock = (p.variants || []).reduce((sum, v) => sum + v.stock, 0);
                
                // Calculate price range
                const prices = (p.variants || []).map(v => v.price);
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                
                const isLowStock = totalStock <= 5;

                return (
                  <tr key={p._id} className="text-sm font-medium text-navy-700 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700/50 transition">
                    <td className="py-4 px-4">
                      <img
                        src={primaryImg}
                        alt={p.product_name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold">{p.product_name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{p.category}</td>
                    <td className="py-4 px-4 font-bold text-brand-500 dark:text-white">
                      {minPrice === maxPrice 
                        ? `${minPrice.toLocaleString('vi-VN')}đ` 
                        : `${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span>{totalStock} sản phẩm</span>
                        {isLowStock && (
                          <div className="flex items-center gap-0.5 text-xs text-red-500 font-bold" title="Sắp hết hàng!">
                            <MdWarning /> Sắp hết
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="max-w-[200px] truncate">
                        {p.variants?.map((v, i) => (
                          <div key={i} className="mb-0.5">
                            • {v.name} ({v.stock} chiếc)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(p)}
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-navy-700 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-white transition"
                          title="Xem chi tiết"
                        >
                          <MdInfo className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-lg p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
                          title="Sửa"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                          title="Xóa"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Không tìm thấy sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold">{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  label="Mã sản phẩm (SKU)*"
                  id="sku"
                  placeholder="Ví dụ: SP001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  extra="w-full"
                />
                <InputField
                  label="Tên sản phẩm*"
                  id="name"
                  placeholder="Tên sản phẩm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  extra="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả sản phẩm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white h-24"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Danh mục*</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Variants and Images Section */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-bold text-navy-700 dark:text-white">Thiết lập biến thể & hình ảnh</h3>
                  <button
                    type="button"
                    onClick={addVariantField}
                    className="flex items-center gap-1 rounded-xl bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-500 dark:text-brand-400 transition"
                  >
                    + Thêm Biến Thể
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((v, vIndex) => (
                    <div key={vIndex} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-700 border border-gray-100 dark:border-white/5 space-y-3 relative">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantField(vIndex)}
                          className="absolute top-2 right-2 text-xs font-bold text-red-500 hover:text-red-700"
                        >
                          Xóa biến thể
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InputField
                          label="Tên biến thể*"
                          placeholder="Ví dụ: Màu Đỏ - Size L"
                          value={v.name}
                          onChange={(e) => updateVariantValue(vIndex, "name", e.target.value)}
                          extra="w-full"
                        />
                        <InputField
                          label="Giá bán (đ)*"
                          type="number"
                          placeholder="Giá bán"
                          value={v.price}
                          onChange={(e) => updateVariantValue(vIndex, "price", e.target.value)}
                          extra="w-full"
                        />
                        <InputField
                          label="Số lượng kho*"
                          type="number"
                          placeholder="Tồn kho"
                          value={v.stock}
                          onChange={(e) => updateVariantValue(vIndex, "stock", e.target.value)}
                          extra="w-full"
                        />
                      </div>

                      {/* Variant images management */}
                      <div>
                        <div className="flex items-end gap-2">
                          <InputField
                            label="Đường dẫn ảnh cho biến thể này"
                            placeholder="Nhập link ảnh (URL)..."
                            value={v.imgInput || ""}
                            onChange={(e) => updateVariantValue(vIndex, "imgInput", e.target.value)}
                            extra="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => addVariantImage(vIndex)}
                            className="rounded-xl bg-brand-500 px-4 py-2.5 text-white font-bold h-12 flex items-center justify-center text-sm"
                          >
                            + Thêm ảnh
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(v.images || []).map((img, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={img}
                                alt="preview"
                                className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-white/10"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100" }}
                              />
                              <button
                                type="button"
                                onClick={() => removeVariantImage(vIndex, imgIndex)}
                                className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center hover:bg-red-700 transition"
                              >
                                x
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-navy-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400"
                >
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white">
            <button
              onClick={() => setShowCatModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold">Thêm danh mục mới</h2>
            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <InputField
                label="Tên danh mục*"
                id="catName"
                placeholder="Ví dụ: Giày dép, Trang sức..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                extra="w-full"
              />
              <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Mô tả</label>
                <textarea
                  placeholder="Mô tả ngắn..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white h-20"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-navy-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400"
                >
                  Tạo danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            
            <div className="flex flex-col gap-4">
              <div>
                <span className="rounded bg-lightPrimary px-2.5 py-1 text-xs font-semibold text-brand-500 dark:bg-navy-700 dark:text-white">{selectedProduct.category}</span>
                <h2 className="mt-2 text-2xl font-bold text-navy-700 dark:text-white">{selectedProduct.product_name}</h2>
                <p className="text-sm text-gray-400">Mã SKU: {selectedProduct.sku}</p>
              </div>

              {selectedProduct.description && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400">Mô tả sản phẩm</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-navy-700/35 p-3 rounded-xl whitespace-pre-line">{selectedProduct.description}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-bold text-gray-400">Biến thể và Tồn kho</h3>
                <div className="space-y-3">
                  {(selectedProduct.variants || []).map((v, index) => (
                    <div key={index} className="flex flex-col sm:flex-row justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-navy-700/50">
                      <div className="flex-1">
                        <p className="font-bold text-navy-700 dark:text-white">{v.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>Giá bán: <strong className="text-brand-500 font-semibold">{v.price.toLocaleString('vi-VN')}đ</strong></span>
                          <span>|</span>
                          <span>Tồn kho: <strong>{v.stock} chiếc</strong></span>
                        </div>
                      </div>
                      
                      {/* Images for this variant */}
                      <div className="flex gap-1.5 flex-wrap">
                        {(v.images || []).map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={img}
                            alt={`${v.name} img`}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-white/10"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100" }}
                          />
                        ))}
                        {(v.images || []).length === 0 && (
                          <span className="text-xs text-gray-400 italic flex items-center">Chưa có ảnh</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
