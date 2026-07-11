import React, { useState, useEffect } from "react";
import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard, MdPeople, MdWarning, MdShoppingBag, MdReceipt } from "react-icons/md";
import Widget from "components/widget/Widget";
import Card from "components/card";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    pendingOrdersCount: 0
  });

  const fetchData = async () => {
    try {
      const pRes = await fetch("http://localhost:5000/api/products");
      const pData = await pRes.json();
      setProducts(pData);

      const oRes = await fetch("http://localhost:5000/api/orders");
      const oData = await oRes.json();
      setOrders(oData);

      const cRes = await fetch("http://localhost:5000/api/customers");
      const cData = await cRes.json();
      setCustomers(cData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate stats
    const revenue = orders
      .filter(o => o.status !== "Đã hủy")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter(o => o.status === "Chờ duyệt").length;
    
    const lowStockCount = products.filter(p => {
      const totalStock = (p.variants || []).reduce((sum, v) => sum + v.stock, 0);
      return totalStock <= p.lowStockAlert;
    }).length;

    setStats({
      revenue,
      ordersCount: orders.length,
      customersCount: customers.length,
      productsCount: products.length,
      lowStockCount,
      pendingOrdersCount
    });
  }, [products, orders, customers]);

  return (
    <div className="pt-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-700 dark:text-white">Bảng Điều Khiển Tổng Quan</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Xem thống kê doanh thu, đơn hàng, khách hàng và trạng thái hàng tồn kho trong hệ thống.</p>
      </div>

      {/* Card widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Tổng doanh thu"}
          subtitle={`${stats.revenue.toLocaleString('vi-VN')}đ`}
        />
        <Widget
          icon={<MdReceipt className="h-6 w-6" />}
          title={"Tổng số đơn hàng"}
          subtitle={`${stats.ordersCount} đơn`}
        />
        <Widget
          icon={<MdPeople className="h-7 w-7" />}
          title={"Tổng số khách hàng"}
          subtitle={`${stats.customersCount} người`}
        />
        <Widget
          icon={<MdShoppingBag className="h-6 w-6" />}
          title={"Tổng số sản phẩm"}
          subtitle={`${stats.productsCount} món`}
        />
        <Widget
          icon={<MdWarning className="h-7 w-7 text-red-500" />}
          title={"Sản phẩm sắp hết"}
          subtitle={`${stats.lowStockCount} sản phẩm`}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6 text-yellow-500" />}
          title={"Đơn hàng chờ duyệt"}
          subtitle={`${stats.pendingOrdersCount} đơn`}
        />
      </div>

      {/* Charts Section */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent orders={orders} />
        <WeeklyRevenue orders={orders} />
      </div>

      {/* Main dashboard content grids */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent orders */}
        <Card extra="col-span-2 p-5 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">Đơn hàng gần đây</h2>
            <span className="text-xs text-gray-400">Thời gian thực</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-white/10">
                  <th className="py-2">Mã Đơn</th>
                  <th className="py-2">Khách Hàng</th>
                  <th className="py-2">Tổng Tiền</th>
                  <th className="py-2">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50 transition">
                    <td className="py-3 font-bold text-brand-500">{o.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold">{o.shippingInfo.recipientName}</p>
                      <p className="text-xs text-gray-400">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 font-semibold">{o.totalAmount.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3">
                      {o.status === "Chờ duyệt" && <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Chờ duyệt</span>}
                      {o.status === "Đang xử lý" && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Đang xử lý</span>}
                      {o.status === "Đang giao" && <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800">Đang giao</span>}
                      {o.status === "Đã giao thành công" && <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Đã giao</span>}
                      {o.status === "Đã hủy" && <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">Đã hủy</span>}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500 italic">Chưa có đơn hàng nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Traffic chart & Pie Chart */}
        <div className="flex flex-col gap-5">
          <DailyTraffic orders={orders} />
          <PieChartCard products={products} />
          <Card extra="p-5">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-3">Lịch làm việc</h2>
            <MiniCalendar />
          </Card>
        </div>
      </div>
    </div>
  );
}
