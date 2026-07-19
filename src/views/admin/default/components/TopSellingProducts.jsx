import React, { useEffect, useState } from "react";
import Card from "components/card";
import { MdShoppingBag } from "react-icons/md";

const TopSellingProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/stats/top-selling")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching top selling products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card extra="pb-7 p-[20px] h-[330px]">
      <div className="flex flex-row justify-between items-center mb-4">
        <div>
          <p className="text-sm font-medium leading-4 text-gray-600">
            Top 5 Sản Phẩm Bán Chạy Nhất
          </p>
          <p className="text-[20px] font-bold text-navy-700 dark:text-white mt-1">
            Sản phẩm phổ biến
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-500 dark:bg-brand-400/10 dark:text-white">
          <MdShoppingBag className="h-6 w-6" />
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-1 h-[210px]">
        {loading ? (
          <p className="text-sm text-gray-500 italic">Đang tải...</p>
        ) : topProducts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Chưa có dữ liệu bán hàng.</p>
        ) : (
          topProducts.map((p, idx) => {
            // Find max quantity to compute percentage bar width
            const maxQty = topProducts[0]?.totalQty || 1;
            const percentage = Math.round((p.totalQty / maxQty) * 100);

            return (
              <div key={p._id || idx} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="font-bold text-navy-700 dark:text-white min-w-[20px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-gray-600 dark:text-gray-200 truncate" title={p.productName}>
                      {p.productName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-navy-700 dark:text-white">
                      {p.totalQty}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">đã bán</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 text-right">
                  Doanh thu: {(p.totalRevenue || 0).toLocaleString('vi-VN')}đ
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default TopSellingProducts;
