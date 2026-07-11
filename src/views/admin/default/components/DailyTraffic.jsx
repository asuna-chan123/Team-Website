import React from "react";
import BarChart from "components/charts/BarChart";
import { MdArrowDropUp } from "react-icons/md";
import Card from "components/card";

const DailyTraffic = ({ orders = [] }) => {
  // Count orders per day of week
  const daysCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

  orders.forEach(o => {
    if (o.createdAt) {
      const date = new Date(o.createdAt);
      const day = date.getDay();
      daysCounts[day]++;
    }
  });

  const chartDataWeekly = [
    daysCounts[1],
    daysCounts[2],
    daysCounts[3],
    daysCounts[4],
    daysCounts[5],
    daysCounts[6],
    daysCounts[0]
  ];

  const chartData = [
    {
      name: "Số đơn hàng",
      data: chartDataWeekly,
    }
  ];

  const chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      theme: "dark",
    },
    xaxis: {
      categories: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        colorStops: [
          [
            {
              offset: 0,
              color: "#4318FF",
              opacity: 1,
            },
            {
              offset: 100,
              color: "rgba(67, 24, 255, 1)",
              opacity: 0.28,
            },
          ],
        ],
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "20px",
      },
    },
  };

  const totalOrders = orders.length;

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Lượng đơn đặt hàng
          </p>
          <p className="text-[30px] font-bold text-navy-700 dark:text-white">
            {totalOrders}{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Đơn hàng
            </span>
          </p>
        </div>
      </div>

      <div className="h-[220px] w-full pt-4 pb-0">
        <BarChart
          chartData={chartData}
          chartOptions={chartOptions}
        />
      </div>
    </Card>
  );
};

export default DailyTraffic;
