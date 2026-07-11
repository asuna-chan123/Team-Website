import React from "react";
import Card from "components/card";
import BarChart from "components/charts/BarChart";
import { MdBarChart } from "react-icons/md";

const WeeklyRevenue = ({ orders = [] }) => {
  // Group orders by day of week
  // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const daysRevenue = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

  orders.forEach(o => {
    if (o.status !== "Đã hủy" && o.createdAt) {
      const date = new Date(o.createdAt);
      const day = date.getDay();
      daysRevenue[day] += o.totalAmount;
    }
  });

  // Reorder to match: Thứ 2, Thứ 3, ..., Chủ Nhật
  // Mon (1), Tue (2), Wed (3), Thu (4), Fri (5), Sat (6), Sun (0)
  const chartDataWeekly = [
    daysRevenue[1],
    daysRevenue[2],
    daysRevenue[3],
    daysRevenue[4],
    daysRevenue[5],
    daysRevenue[6],
    daysRevenue[0]
  ];

  const chartData = [
    {
      name: "Doanh thu",
      data: chartDataWeekly,
    }
  ];

  const chartOptions = {
    chart: {
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
      onDatasetHover: {
        style: {
          fontSize: "12px",
          fontFamily: undefined,
        },
      },
      theme: "dark",
    },
    xaxis: {
      categories: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      show: true,
      labels: {
        show: true,
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
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
      color: "#A3AED0",
      labels: {
        show: true,
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
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
    fill: {
      colors: ["#5B3BE2"],
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "30px",
      },
    },
  };

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          Doanh thu theo Thứ trong tuần
        </h2>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-[250px] w-full xl:h-[350px]">
          <BarChart
            chartData={chartData}
            chartOptions={chartOptions}
          />
        </div>
      </div>
    </Card>
  );
};

export default WeeklyRevenue;
