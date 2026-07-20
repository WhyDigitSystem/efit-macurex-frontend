import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="
      rounded-lg border
      border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-900
      px-3 py-2 shadow-lg
      "
    >
      <p
        className="
      text-xs font-semibold
      text-gray-700 dark:text-gray-200
      "
      >
        {payload[0].name}
      </p>

      <p
        className="text-xs mt-1"
        style={{
          color: payload[0].payload.color,
        }}
      >
        Count: {payload[0].value}
      </p>
    </div>
  );
};

const InventoryStatusPieChart = () => {
  const inventoryStatusData = [
    {
      name: "Available",
      value: 820,
      color: "#10b981",
    },
    {
      name: "Blocked",
      value: 120,
      color: "#8b5cf6",
    },
    {
      name: "Expired",
      value: 60,
      color: "#f43f5e",
    },
    {
      name: "Near Expiry",
      value: 90,
      color: "#f59e0b",
    },
  ];

  const totalInventory = inventoryStatusData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div
      className="
rounded-xl
border border-gray-200
dark:border-gray-800

bg-white
dark:bg-gray-900

p-3
shadow-sm
"
    >
      {/* Header */}

      <div className="mb-2">
        <h3
          className="
text-sm
font-semibold
text-gray-800
dark:text-gray-100
"
        >
          Inventory Status
        </h3>

        <p
          className="
text-[11px]
text-gray-500
dark:text-gray-400
"
        >
          Current stock condition
        </p>
      </div>

      {/* Pie Chart */}

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={inventoryStatusData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            <Label
              content={({ viewBox }) => {
                const { cx, cy } = viewBox;

                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={cx}
                      dy="-10"
                      className="
            fill-gray-900
            dark:fill-gray-100
            text-lg
            font-semibold
          "
                    >
                      {totalInventory?.toLocaleString("en-IN")}
                    </tspan>

                    <tspan
                      x={cx}
                      dy="18"
                      className="
            fill-gray-500
            dark:fill-gray-400
            text-[11px]
          "
                    >
                      Total
                    </tspan>
                  </text>
                );
              }}
            />

            {inventoryStatusData.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          <Legend
            iconType="circle"
            wrapperStyle={{
              fontSize: "11px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryStatusPieChart;
