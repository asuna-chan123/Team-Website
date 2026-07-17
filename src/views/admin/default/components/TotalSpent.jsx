import React from "react";
import { MdOutlineCalendarToday, MdBarChart } from "react-icons/md";
import Card from "components/card";
import LineChart from "components/charts/LineChart";

const TotalSpent = ({ orders = [] }) => {
  // Let's group sales revenue by month
  // We will show the last 6 months
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  
  const currentMonth = new Date().getMonth();
  const recentMonthsIndex = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    if (m < 0) m += 12;
    recentMonthsIndex.push(m);
  }

  // Calculate revenue for each of the last 6 months
  const monthlyRevenue = [0, 0, 0, 0, 0, 0];
  const validOrders = Array.isArray(orders) ? orders : [];
  validOrders.forEach(o => {
    if (o.status !== "Đã hủy" && o.createdAt) {
      const orderDate = new Date(o.createdAt);
      const orderMonth = orderDate.getMonth();
      const index = recentMonthsIndex.indexOf(orderMonth);
      if (index > -1) {
        monthlyRevenue[index] += o.totalAmount;
      }
    }
  });

  const categories = recentMonthsIndex.map(idx => monthNames[idx]);

  const lineChartData = [
    {
      name: "Doanh thu",
      data: monthlyRevenue,
    }
  ];

  const lineChartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      dropShadow: {
        enabled: true,
        top: 9,
        left: 0,
        blur: 13,
        color: "#4318FF",
        opacity: 0.2,
      },
    },
    colors: ["#4318FF"],
    markers: {
      size: 0,
      colors: ["#4318FF"],
      strokeColors: "#3013c7",
      strokeWidth: 2,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      shape: "circle",
      radius: 2,
      offsetX: 0,
      offsetY: 0,
      onClick: undefined,
      onDblClick: undefined,
      showNullDataPoints: true,
      hover: {
        size: undefined,
        sizeOffset: 3,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
        formatter: function (value) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "Mđ";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "Kđ";
          }
          return value + "đ";
        }
      },
    },
    grid: {
      show: false,
    },
    tooltip: {
      theme: "dark",
    },
  };

  const totalSpentSum = monthlyRevenue.reduce((a, b) => a + b, 0);

  return (
    <Card extra="!p-[20px] text-center">
      <div className="flex justify-between">
        <button className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80">
          <MdOutlineCalendarToday />
          <span className="text-sm font-medium text-gray-600">6 tháng qua</span>
        </button>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white text-left">
            {totalSpentSum.toLocaleString('vi-VN')}đ
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600">Doanh số tích lũy</p>
          </div>
        </div>
        <div className="h-full w-full">
          <LineChart
            options={lineChartOptions}
            series={lineChartData}
          />
        </div>
      </div>
    </Card>
  );
};

export default TotalSpent;
