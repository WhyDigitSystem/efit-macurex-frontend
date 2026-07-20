import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

// ============================================================
// 1. CONSTANTS
// ============================================================

const WAREHOUSE_DATA = [
  { name: "BLR", utilization: 92 },
  { name: "CHN", utilization: 78 },
  { name: "HYD", utilization: 65 },
  { name: "PUN", utilization: 88 },
];

const getBarColor = (value) => {
  if (value >= 90) return "#f43f5e"; // rose-500
  if (value >= 75) return "#f59e0b"; // amber-500
  return "#6366f1"; // indigo-500
};

// ============================================================
// 2. SUB-COMPONENTS
// ============================================================

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div
      className={`
        rounded-xl border px-3 py-2 shadow-xl pointer-events-none
        ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
      `}
    >
      <p
        className={`
          text-xs font-semibold mb-2
          ${isDark ? "text-gray-100" : "text-gray-700"}
        `}
      >
        {label}
      </p>

      {payload.map((item, index) => {
        // Get color from payload or fallback to bar color
        const color = item?.fill || item?.color || getBarColor(item?.value);
        
        return (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span className={isDark ? "text-gray-300" : "text-gray-600"}>
              {item.name}
            </span>
            <span
              className={`
                font-bold
                ${isDark ? "text-white" : "text-gray-900"}
              `}
            >
              {item.value}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// 3. MAIN COMPONENT
// ============================================================

const ChartCard = () => {
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div
      className="
        rounded-xl
        border border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900
        p-3
        shadow-sm
        w-full
      "
    >
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          WH Utilization
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Capacity used per warehouse
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={WAREHOUSE_DATA}
          margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
          barSize={20}
        >
          {/* <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDark ? "#374151" : "#e5e7eb"}
          /> */}

          <XAxis
            dataKey="name"
            // tick={{ fontSize: 10, fill: isDark ? "#9ca3af" : "#6b7280" }}
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 10, fill: "#9CA3AF"}}
            axisLine={false}
            tickLine={false}
            unit="%"
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(148,163,184,0.15)" }}
            wrapperStyle={{ zIndex: 9999 }}
            allowEscapeViewBox={{ x: true, y: true }}
          />

          <Bar
            dataKey="utilization"
            name="Utilization"
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          >
            {WAREHOUSE_DATA.map((item) => (
              <Cell
                key={item.name}
                fill={getBarColor(item.utilization)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;