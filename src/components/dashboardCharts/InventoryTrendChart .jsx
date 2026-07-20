import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="
      rounded-lg border 
      border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-900
      px-3 py-2 shadow-lg
    ">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </p>

      {payload.map((item, index) => (
        <p
          key={index}
          className="text-xs mt-1"
          style={{ color: item.color }}
        >
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};


const InventoryTrendChart = () => {

  const inventoryTrendData = [
    { month: "Jan", inbound: 4200, outbound: 3800 },
    { month: "Feb", inbound: 5100, outbound: 4300 },
    { month: "Mar", inbound: 3900, outbound: 4100 },
    { month: "Apr", inbound: 6200, outbound: 5500 },
    { month: "May", inbound: 5800, outbound: 5200 },
    { month: "Jun", inbound: 7100, outbound: 6300 },
    { month: "Jul", inbound: 6400, outbound: 5900 },
  ];


  const theme = {
    gridLine: "#374151",
    axisText: "#9CA3AF",
  };


  return (
    <div
      className="
      rounded-xl
      border border-gray-200 dark:border-gray-800
      bg-white dark:bg-gray-900
      p-3
      shadow-sm
      "
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-2">

        <div>
          <h3 className="
            text-sm font-semibold
            text-gray-800 dark:text-gray-100
          ">
            Inventory Trend
          </h3>

          <p className="
            text-[11px]
            text-gray-500 dark:text-gray-400
          ">
            Inbound vs Outbound
          </p>
        </div>


        <div className="flex gap-3 text-[11px]">

          <span className="flex items-center gap-1 text-indigo-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500"/>
            Inbound
          </span>


          <span className="flex items-center gap-1 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"/>
            Outbound
          </span>

        </div>

      </div>



      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>

        <AreaChart
          data={inventoryTrendData}
          margin={{
            top:5,
            right:5,
            left:-18,
            bottom:0
          }}
        >

          <defs>

            <linearGradient id="inboundGradient">
              <stop 
                offset="0%"
                stopColor="#6366f1"
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor="#6366f1"
                stopOpacity={0}
              />

            </linearGradient>



            <linearGradient id="outboundGradient">

              <stop
                offset="0%"
                stopColor="#10b981"
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor="#10b981"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>



          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.gridLine}
            vertical={false}
            opacity={0.3}
          />


          <XAxis
            dataKey="month"
            tick={{
              fontSize:11,
              fill:theme.axisText
            }}
            axisLine={false}
            tickLine={false}
          />


          <YAxis
            tick={{
              fontSize:11,
              fill:theme.axisText
            }}
            axisLine={false}
            tickLine={false}
          />


          <Tooltip content={<CustomTooltip/>}/>



          <Area
            type="monotone"
            dataKey="inbound"
            name="Inbound"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#inboundGradient)"
          />


          <Area
            type="monotone"
            dataKey="outbound"
            name="Outbound"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#outboundGradient)"
          />


        </AreaChart>

      </ResponsiveContainer>


    </div>
  );
};


export default InventoryTrendChart;