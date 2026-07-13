import React, { useState, useEffect } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import { MdEdit, MdClose, MdInfo, MdAdd, MdDelete } from "react-icons/md";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit fields state
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  // Create order fields state
  const [orderNumber, setOrderNumber] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  
  // Selected product items to add
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProdIndex, setSelectedProdIndex] = useState(0);
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [itemQty, setItemQty] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [searchOrder, setSearchOrder] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProductsAndCustomers = async () => {
    try {
      const pRes = await fetch("http://localhost:5000/api/products");
      const pData = await pRes.json();
      setProducts(pData);

      const cRes = await fetch("http://localhost:5000/api/customers");
      const cData = await cRes.json();
      setCustomers(cData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProductsAndCustomers();
  }, []);

  const handleOpenEdit = (order) => {
    setSelectedOrder(order);
    setRecipientName(order.shippingInfo?.recipientName || "");
    setPhone(order.shippingInfo?.phone || "");
    setAddress(order.shippingInfo?.address || "");
    setStatus(order.status);
    setTrackingNumber(order.trackingNumber || "");
    setCarrier(order.carrier || "");
    setShowEditModal(true);
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleOpenCreate = () => {
    setOrderNumber("DH" + Math.floor(100000 + Math.random() * 900000));
    setCustEmail("");
    setCustName("");
    setCustPhone("");
    setCustAddress("");
    setOrderItems([]);
    setSelectedProdIndex(0);
    setSelectedVarIndex(0);
    setItemQty(1);
    setShowCreateModal(true);
  };

  const handleSelectCustomer = (email) => {
    setCustEmail(email);
    const chosen = customers.find(c => c.email === email);
    if (chosen) {
      setCustName(chosen.name);
      setCustPhone(chosen.phone);
      setCustAddress(chosen.address);
    }
  };

  const handleAddItem = () => {
    const product = products[selectedProdIndex];
    if (!product) return;
    const variant = product.variants?.[selectedVarIndex];
    if (!variant) return;

    // Check if variant already added
    const itemSku = product.sku;
    const fullProductName = `${product.name} (${variant.name})`;

    const existingIndex = orderItems.findIndex(item => item.productSku === itemSku && item.productName === fullProductName);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += Number(itemQty);
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productSku: itemSku,
          productName: fullProductName,
          quantity: Number(itemQty),
          price: variant.price
        }
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.");
      return;
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      orderNumber,
      customerEmail: custEmail,
      shippingInfo: {
        recipientName: custName,
        phone: custPhone,
        address: custAddress
      },
      products: orderItems,
      totalAmount,
      status: "Chờ duyệt",
      trackingNumber: "",
      carrier: ""
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        fetchOrders();
        setShowCreateModal(false);
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi khi tạo đơn hàng");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    const updatedData = {
      status,
      trackingNumber,
      carrier,
      shippingInfo: {
        recipientName,
        phone,
        address
      }
    };

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        fetchOrders();
        setShowEditModal(false);
      } else {
        alert("Có lỗi xảy ra khi cập nhật đơn hàng");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Chờ duyệt":
        return <span className="rounded bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Chờ duyệt</span>;
      case "Đang xử lý":
        return <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Đang xử lý</span>;
      case "Đang giao":
        return <span className="rounded bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Đang giao</span>;
      case "Đã giao thành công":
        return <span className="rounded bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">Đã giao thành công</span>;
      case "Đã hủy":
        return <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">Đã hủy</span>;
      default:
        return <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = (o.orderNumber || "").toLowerCase().includes(searchOrder.toLowerCase()) || 
                          (o.shippingInfo?.recipientName || "").toLowerCase().includes(searchOrder.toLowerCase()) ||
                          (o.customerEmail || "").toLowerCase().includes(searchOrder.toLowerCase());
    const matchesStatus = statusFilter === "" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-5">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 dark:text-white">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Xem danh sách đơn hàng, cập nhật trạng thái vận chuyển và tạo đơn hàng mới.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          <MdAdd className="h-4 w-4" /> Tạo Đơn Hàng
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm theo Mã đơn hàng, Tên khách hàng hoặc Email..."
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao thành công">Đã giao thành công</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card extra="w-full pb-6 p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-white/10">
                <th className="py-3 px-4">Mã Đơn Hàng</th>
                <th className="py-3 px-4">Khách Hàng (Email)</th>
                <th className="py-3 px-4">Người Nhận & Liên hệ</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Vận Chuyển</th>
                <th className="py-3 px-4">Trạng Thế</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredOrders.map((o) => (
                <tr key={o._id} className="text-sm font-medium text-navy-700 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700/50 transition">
                  <td className="py-4 px-4 font-bold text-brand-500">{o.orderNumber}</td>
                  <td className="py-4 px-4">
                    <p className="font-semibold">{o.customerEmail}</p>
                    <p className="text-xs text-gray-400">Đặt lúc: {new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold">{o.shippingInfo?.recipientName}</p>
                    <p className="text-xs text-gray-400">SĐT: {o.shippingInfo?.phone}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]" title={o.shippingInfo?.address}>Đ/C: {o.shippingInfo?.address}</p>
                  </td>
                  <td className="py-4 px-4 font-bold text-navy-700 dark:text-white">
                    {o.totalAmount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400">
                    {o.carrier ? (
                      <div>
                        <p className="font-bold">{o.carrier}</p>
                        <p className="text-gray-400">{o.trackingNumber}</p>
                      </div>
                    ) : (
                      <span className="italic text-gray-300">Chưa tạo vận đơn</span>
                    )}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(o.status)}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(o)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800 transition"
                        title="Xem chi tiết đơn hàng"
                      >
                        <MdInfo className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(o)}
                        className="rounded-lg p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
                        title="Chỉnh sửa trạng thái / Liên lạc"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold">Tạo đơn hàng mới: {orderNumber}</h2>
            <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
              
              <div className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
                <h3 className="mb-3 text-sm font-bold text-gray-400">Chọn hoặc điền thông tin Khách hàng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Chọn Khách hàng sẵn có</label>
                    <select
                      value={custEmail}
                      onChange={(e) => handleSelectCustomer(e.target.value)}
                      className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map(c => (
                        <option key={c._id} value={c.email}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    label="Email khách hàng*"
                    id="custEmail"
                    placeholder="example@gmail.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    label="Tên người nhận*"
                    id="custName"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                  />
                  <InputField
                    label="Số điện thoại*"
                    id="custPhone"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                  />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Địa chỉ giao hàng*</label>
                  <textarea
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white h-16"
                    placeholder="Nhập địa chỉ giao hàng cụ thể..."
                  />
                </div>
              </div>

              {/* Add items to order */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
                <h3 className="mb-3 text-sm font-bold text-gray-400">Chọn sản phẩm & biến thể</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="flex flex-col sm:col-span-2">
                    <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Chọn Sản phẩm</label>
                    <select
                      value={selectedProdIndex}
                      onChange={(e) => {
                        setSelectedProdIndex(e.target.value);
                        setSelectedVarIndex(0);
                      }}
                      className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    >
                      {products.map((p, idx) => (
                        <option key={p._id} value={idx}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Chọn Biến thể</label>
                    <select
                      value={selectedVarIndex}
                      onChange={(e) => setSelectedVarIndex(e.target.value)}
                      className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                    >
                      {products[selectedProdIndex]?.variants?.map((v, idx) => (
                        <option key={idx} value={idx}>{v.name} ({v.price.toLocaleString('vi-VN')}đ)</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-1">
                    <InputField
                      label="S/L*"
                      id="itemQty"
                      type="number"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      extra="flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="rounded-xl bg-brand-500 px-4 py-2.5 text-white font-bold h-12 text-sm"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="mt-4 space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-navy-700/50 p-2.5 rounded-lg text-sm">
                      <div>
                        <p className="font-bold">{item.productName}</p>
                        <p className="text-xs text-gray-400">SKU: {item.productSku} | S/L: {item.quantity} x {item.price.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 font-bold hover:text-red-700"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {orderItems.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">Chưa có sản phẩm nào được chọn.</p>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between font-bold text-lg text-navy-700 dark:text-white border-t border-gray-100 dark:border-white/10 pt-4">
                <span>Tổng số tiền:</span>
                <span className="text-brand-500">
                  {orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-navy-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400"
                >
                  Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold">Cập nhật đơn hàng: {selectedOrder.orderNumber}</h2>
            <form onSubmit={handleSaveOrder} className="flex flex-col gap-4">
              
              <div className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
                <h3 className="mb-3 text-sm font-bold text-gray-400">Thông tin liên lạc giao hàng</h3>
                <div className="flex flex-col gap-3">
                  <InputField
                    label="Tên người nhận*"
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                  <InputField
                    label="Số điện thoại*"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <div>
                    <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Địa chỉ giao hàng*</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white h-20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Trạng thái đơn hàng*</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                  >
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao thành công">Đã giao thành công</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>

                <InputField
                  label="Đơn vị vận chuyển"
                  id="carrier"
                  placeholder="Ví dụ: Giao Hàng Nhanh, Viettel Post"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                />
              </div>

              <InputField
                label="Mã vận đơn (Tracking Code)"
                id="trackingNumber"
                placeholder="Nhập mã định tuyến từ shipper..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-navy-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Order Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold">Chi tiết Đơn hàng: {selectedOrder.orderNumber}</h2>
            
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Email Khách hàng:</p>
                <p className="font-semibold">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <p className="text-gray-400">Trạng thái:</p>
                <p>{getStatusBadge(selectedOrder.status)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Địa chỉ nhận hàng:</p>
                <p className="font-semibold">{selectedOrder.shippingInfo?.recipientName} - {selectedOrder.shippingInfo?.phone}</p>
                <p className="font-semibold">{selectedOrder.shippingInfo?.address}</p>
              </div>
            </div>

            <h3 className="mb-2 text-sm font-bold text-gray-400">Danh sách sản phẩm</h3>
            <div className="mb-4 divide-y divide-gray-100 dark:divide-white/10 border-t border-b border-gray-100 dark:border-white/10 py-2">
              {selectedOrder.products.map((p, index) => (
                <div key={index} className="flex justify-between py-2 text-sm">
                  <div>
                    <p className="font-bold">{p.productName}</p>
                    <p className="text-xs text-gray-400">Mã SKU: {p.productSku} x {p.quantity}</p>
                  </div>
                  <p className="font-bold">{(p.price * p.quantity).toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg text-navy-700 dark:text-white">
              <span>Tổng cộng:</span>
              <span className="text-brand-500">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
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
