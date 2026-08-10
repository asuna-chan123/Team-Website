import React, { useState, useEffect } from "react";
import Card from "components/card";
import InputField from "components/fields/InputField";
import { MdClose, MdHistory, MdPerson, MdAdd, MdLock, MdLockOpen, MdDelete } from "react-icons/md";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [group, setGroup] = useState("Mới");

  // Filters
  const [searchCustomer, setSearchCustomer] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/customers");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error("Customers response is not an array:", data);
        setCustomers([]);
      }
    } catch (err) {
      console.error(err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setGroup("Mới");
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const customerData = { name, email, phone, address, group, status: "Active" };

    try {
      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData)
      });

      if (res.ok) {
        fetchCustomers();
        setShowAddModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi khi thêm khách hàng");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLock = async (cust) => {
    const custName = cust.name || cust.user_name || cust.email || "khách hàng này";
    const newStatus = cust.status === "Active" ? "Locked" : "Active";
    const confirmMsg = cust.status === "Active"
      ? `Bạn có chắc muốn khóa tài khoản của khách hàng "${custName}"?`
      : `Bạn có chắc muốn mở khóa tài khoản cho khách hàng "${custName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/customers/${cust._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này? (Xóa mềm)")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHistory = async (cust) => {
    setSelectedCustomer(cust);
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${encodeURIComponent(cust.email || "")}/orders`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistoryOrders(data);
      } else {
        setHistoryOrders([]);
      }
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
      setHistoryOrders([]);
      setShowHistoryModal(true);
    }
  };

  const getGroupBadge = (group) => {
    switch (group) {
      case "VIP":
        return <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 dark:bg-red-950/30 dark:text-red-400">★ VIP</span>;
      case "Thân thiết":
        return <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Thân thiết</span>;
      case "Mới":
        return <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 dark:bg-navy-700 dark:text-gray-300">Mới</span>;
      default:
        return <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">{group || "Mới"}</span>;
    }
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const filteredCustomers = safeCustomers.filter((c) => {
    const custName = String(c.name || c.user_name || c.email || "");
    const custPhone = String(c.phone || "");
    const custEmail = String(c.email || "");
    const searchTerm = (searchCustomer || "").toLowerCase();

    const matchesSearch = custName.toLowerCase().includes(searchTerm) || 
                          custPhone.includes(searchTerm) ||
                          custEmail.toLowerCase().includes(searchTerm);
    const matchesGroup = groupFilter === "" || c.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="pt-5">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy-700 dark:text-white">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Quản lý danh sách người mua, phân nhóm, trạng thái hoạt động (khóa/mở khóa) và lịch sử mua hàng.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          <MdAdd className="h-4 w-4" /> Thêm Khách Hàng
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm theo Tên, Số điện thoại hoặc Email khách hàng..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
          >
            <option value="">Tất cả phân nhóm</option>
            <option value="VIP">VIP</option>
            <option value="Thân thiết">Thân thiết</option>
            <option value="Mới">Mới</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <Card extra="w-full pb-6 p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-white/10">
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Liên Hệ (SĐT / Email)</th>
                <th className="py-3 px-4">Địa Chỉ</th>
                <th className="py-3 px-4">Phân Nhóm</th>
                <th className="py-3 px-4">Số Đơn Hàng</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="text-sm font-medium text-navy-700 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700/50 transition">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${c.status === 'Locked' ? 'bg-red-100 text-red-500' : 'bg-lightPrimary text-brand-500'}`}>
                      <MdPerson className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">{c.name || c.user_name || c.email || "Khách hàng"}</p>
                      {c.status === "Locked" && <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold">Đã Khóa</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold">{c.email || "N/A"}</p>
                    <p className="text-xs text-gray-400">SĐT: {c.phone || "Chưa cập nhật"}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={c.address || "Chưa cập nhật"}>
                    {c.address || "Chưa cập nhật"}
                  </td>
                  <td className="py-4 px-4">{getGroupBadge(c.group)}</td>
                  <td className="py-4 px-4 font-bold text-center sm:text-left">
                    <span className="rounded bg-gray-50 dark:bg-navy-700/50 px-2.5 py-1 text-xs">
                      {c.totalOrders || 0} đơn
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {c.status === "Locked" ? (
                      <span className="text-xs text-red-500 font-bold">Bị Khóa</span>
                    ) : (
                      <span className="text-xs text-green-500 font-bold">Hoạt động</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenHistory(c)}
                        className="rounded-lg p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
                        title="Xem chi tiết & lịch sử đặt hàng"
                      >
                        <MdPerson className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleLock(c)}
                        className={`rounded-lg p-2 transition ${c.status === 'Locked' ? 'text-green-500 hover:bg-green-50' : 'text-yellow-500 hover:bg-yellow-50'}`}
                        title={c.status === 'Locked' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      >
                        {c.status === 'Locked' ? <MdLockOpen className="h-5 w-5" /> : <MdLock className="h-5 w-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Không tìm thấy khách hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold">Thêm khách hàng mới</h2>
            <form onSubmit={handleCreateCustomer} className="flex flex-col gap-4">
              <InputField
                label="Họ và Tên*"
                id="name"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                extra="w-full"
              />
              <InputField
                label="Email*"
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                extra="w-full"
              />
              <InputField
                label="Số điện thoại*"
                id="phone"
                placeholder="0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                extra="w-full"
              />
              <InputField
                label="Địa chỉ giao hàng*"
                id="address"
                placeholder="Nhập địa chỉ cụ thể..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                extra="w-full"
              />
              <div className="flex flex-col">
                <label className="text-sm font-bold text-navy-700 dark:text-white ml-3">Nhóm khách hàng</label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none dark:border-white/10 dark:bg-navy-800 dark:text-white"
                >
                  <option value="Mới">Mới</option>
                  <option value="Thân thiết">Thân thiết</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-navy-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400"
                >
                  Tạo khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Customer & Transaction History Modal */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-navy-800 dark:text-white max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="mb-4 text-xl font-bold border-b pb-2 dark:border-white/10 flex items-center gap-2">
              <MdPerson className="text-brand-500 h-6 w-6" />
              Chi tiết Khách hàng: {selectedCustomer.name}
            </h2>
            
            {/* Customer Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-navy-700/30 p-4 rounded-xl">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Họ và Tên</p>
                <p className="font-semibold text-navy-700 dark:text-white">{selectedCustomer.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                <p className="font-semibold text-navy-700 dark:text-white">{selectedCustomer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Số điện thoại</p>
                <p className="font-semibold text-navy-700 dark:text-white">{selectedCustomer.phone || "Chưa cập nhật"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Địa chỉ</p>
                <p className="font-semibold text-navy-700 dark:text-white truncate" title={selectedCustomer.address}>
                  {selectedCustomer.address || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Phân nhóm / Trạng thái</p>
                <div className="flex items-center gap-2 mt-1">
                  {getGroupBadge(selectedCustomer.group)}
                  {selectedCustomer.status === "Locked" ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Đã Khóa</span>
                  ) : (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Hoạt động</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Tổng chi tiêu</p>
                <p className="text-lg font-bold text-brand-500 mt-0.5">
                  {(selectedCustomer.totalSpent || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            <h3 className="mb-3 text-lg font-bold flex items-center gap-2">
              <MdHistory className="text-brand-500 h-5 w-5" />
              Lịch sử đơn hàng ({(historyOrders || []).length} đơn)
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {(historyOrders || []).map((o) => (
                <div key={o._id} className="rounded-xl border border-gray-100 p-4 dark:border-white/10 bg-white dark:bg-navy-800/50">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-2">
                    <div>
                      <span className="font-bold text-brand-500">{o.orderNumber || "Đơn hàng"}</span>
                      <span className="text-xs text-gray-400 ml-2">({o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'N/A'})</span>
                    </div>
                    <div>
                      <span className="mr-2 text-xs text-gray-400">Trạng thái:</span>
                      {o.status === "Chờ duyệt" && <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Chờ duyệt</span>}
                      {o.status === "Đang xử lý" && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Đang xử lý</span>}
                      {o.status === "Đang giao" && <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800">Đang giao</span>}
                      {o.status === "Đã giao thành công" && <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Đã giao thành công</span>}
                      {o.status === "Đã hủy" && <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">Đã hủy</span>}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50 dark:divide-white/5 border-t border-b border-gray-50 dark:border-white/5 py-2 my-2 text-xs">
                    {(o.products || []).map((p, idx) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span>{p.productName || "Sản phẩm"} (x{p.quantity || 1})</span>
                        <span className="font-semibold">{(p.price || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-sm font-bold">
                    <span>Tổng số tiền:</span>
                    <span className="text-navy-700 dark:text-white">{(o.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              ))}

              {(!historyOrders || historyOrders.length === 0) && (
                <div className="py-8 text-center text-gray-500 italic border border-dashed rounded-xl dark:border-white/10">
                  Khách hàng chưa có giao dịch nào.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
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
