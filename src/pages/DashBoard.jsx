import React from "react";
import KPI from "../components/KPICards/DashboardKPI";
import InventoryTrendChart from "../components/dashboardCharts/InventoryTrendChart ";
import ChartCard from "../components/dashboardCharts/ChartCard ";
import PieChart from '../components/dashboardCharts/InventoryStatusPieChart'
import {
  Boxes,
  FileClock,
  ShoppingCart,
  PackageX,
  TimerReset,
  Ban,
  Truck,
  Target,
} from "lucide-react";
const Dashboard = () => {
 
  const kpiData = [
    {
      title: "Total Inventory",
      value: "25,840",
      icon: Boxes,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Pending GRN",
      value: "120",
      icon: FileClock,
      color: "amber",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      title: "Today Orders",
      value: "560",
      icon: ShoppingCart,
      color: "green",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "Expired Stock",
      value: "35",
      icon: PackageX,
      color: "red",
      bgColor: "bg-red-50 dark:bg-red-500/10",
    },
    {
      title: "Near Expiry",
      value: "85",
      icon: TimerReset,
      color: "orange",
      bgColor: "bg-orange-50 dark:bg-orange-500/10",
    },
    {
      title: "Blocked Stock",
      value: "42",
      icon: Ban,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
    },
  ];
  return (
    <>
      <section className="dashboad py-2 px-8">
        {/*  */}
        <section className="kpi_cards">
          <div className="mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              OverView
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {kpiData.map((item, index) => (
              <KPI key={index} {...item} />
            ))}
          </div>
        </section>

        <section className="Graph mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InventoryTrendChart />
            {/* chart card */}
            <ChartCard />
            <PieChart />
            {/*  */}
          </div>
        </section>
      </section>
    </>
  );
};

export default Dashboard;
