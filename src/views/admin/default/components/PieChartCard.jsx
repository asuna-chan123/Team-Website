import React from "react";
import PieChart from "components/charts/PieChart";
import Card from "components/card";

const PieChartCard = ({ products = [] }) => {
  // Count products per category
  const catCounts = {};
  const validProducts = Array.isArray(products) ? products : [];
  validProducts.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });

  const categories = Object.keys(catCounts);
  const dataSeries = Object.values(catCounts);
  const total = dataSeries.reduce((sum, val) => sum + val, 0);

  const pieChartOptions = {
    labels: categories,
    colors: ["#4318FF", "#6AD2FF", "#EFF4FB", "#FFB547", "#10B981"],
    chart: {
      width: "100%",
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    plotOptions: {
      donut: {
        expandOnClick: false,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    fill: {
      colors: ["#4318FF", "#6AD2FF", "#EFF4FB", "#FFB547", "#10B981"],
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
  };

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-between px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Cơ cấu Sản phẩm
          </h4>
          <p className="text-xs text-gray-400">Theo danh mục</p>
        </div>
      </div>

      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        {total > 0 ? (
          <PieChart options={pieChartOptions} series={dataSeries} />
        ) : (
          <p className="text-sm text-gray-400 italic">Chưa có dữ liệu</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl px-4 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none max-h-[100px] overflow-y-auto">
        {categories.slice(0, 4).map((cat, index) => {
          const count = catCounts[cat];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const colors = ["bg-[#4318FF]", "bg-[#6AD2FF]", "bg-gray-200", "bg-[#FFB547]", "bg-[#10B981]"];
          const colorClass = colors[index % colors.length];

          return (
            <div key={index} className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center">
                <div className={`h-2 w-2 rounded-full ${colorClass}`} />
                <p className="ml-1 text-xs text-gray-500 truncate max-w-[80px]">{cat}</p>
              </div>
              <p className="text-sm font-bold text-navy-700 dark:text-white">{pct}% ({count})</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PieChartCard;
