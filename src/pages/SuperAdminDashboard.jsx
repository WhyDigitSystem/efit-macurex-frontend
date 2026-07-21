import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChevronDown,
  Users,
  UserRound,
  IndianRupee,
  Building2,
  Package,
  Search,
  Plus,
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * SuperAdminDashboard
 * ---------------------------------------------------------------
 * Renders when the logged-in user's email === "sadmin@gmail.com".
 * Sidebar/topbar are assumed to already exist in your app layout,
 * so this file only contains the dashboard content area.
 * Sizing has been tightened (smaller cards, tighter type scale,
 * smaller charts) compared to the first pass.
 * ---------------------------------------------------------------
 */

const kpiData = [
  {
    title: "Total Companies",
    value: "128",
    delta: "12% from last month",
    icon: Building2,
    iconBg: "bg-indigo-100 dark:bg-indigo-500/15",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Active Companies",
    value: "102",
    delta: "9% from last month",
    icon: Users,
    iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Total Users",
    value: "1,245",
    delta: "15% from last month",
    icon: UserRound,
    iconBg: "bg-sky-100 dark:bg-sky-500/15",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    title: "Monthly Revenue",
    value: "$24,850",
    delta: "18% from last month",
    icon: IndianRupee,
    iconBg: "bg-orange-100 dark:bg-orange-500/15",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    title: "Active Subscriptions",
    value: "116",
    delta: "8% from last month",
    icon: Package,
    iconBg: "bg-pink-100 dark:bg-pink-500/15",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
];

const growthData = [
  { month: "Dec 2024", value: 60 },
  { month: "Jan 2025", value: 78 },
  { month: "Feb 2025", value: 92 },
  { month: "Mar 2025", value: 100 },
  { month: "Apr 2025", value: 122 },
  { month: "May 2025", value: 128 },
];

const subscriptionData = [
  { name: "Active", value: 102, color: "#10b981" },
  { name: "Trial", value: 12, color: "#3b82f6" },
  { name: "Expired", value: 8, color: "#f97316" },
  { name: "Pending", value: 6, color: "#a855f7" },
];

const recentCompanies = [
  {
    name: "Tech Solutions Inc.",
    email: "admin@techsolutions.com",
    status: "Active",
    initial: "T",
    color: "bg-indigo-500",
  },
  {
    name: "Global Traders Pvt Ltd",
    email: "contact@globaltraders.com",
    status: "Active",
    initial: "G",
    color: "bg-emerald-500",
  },
  {
    name: "Innovate Systems",
    email: "info@innovatesys.com",
    status: "Trial",
    initial: "I",
    color: "bg-blue-500",
  },
  {
    name: "Retail Mart",
    email: "admin@retailmart.com",
    status: "Active",
    initial: "R",
    color: "bg-orange-500",
  },
  {
    name: "Skyline Enterprises",
    email: "hello@skyline.com",
    status: "Expired",
    initial: "S",
    color: "bg-pink-500",
  },
];

const companies = [
  {
    name: "Tech Solutions Inc.",
    code: "TSI001",
    users: 28,
    plan: "Professional",
    status: "Active",
    created: "May 01, 2025",
    color: "bg-indigo-500",
    initial: "T",
  },
  {
    name: "Global Traders Pvt Ltd",
    code: "GTP002",
    users: 45,
    plan: "Enterprise",
    status: "Active",
    created: "Apr 28, 2025",
    color: "bg-emerald-500",
    initial: "G",
  },
  {
    name: "Innovate Systems",
    code: "INS003",
    users: 15,
    plan: "Trial",
    status: "Trial",
    created: "Apr 25, 2025",
    color: "bg-blue-500",
    initial: "I",
  },
  {
    name: "Retail Mart",
    code: "RM004",
    users: 22,
    plan: "Professional",
    status: "Active",
    created: "Apr 20, 2025",
    color: "bg-orange-500",
    initial: "R",
  },
  {
    name: "Skyline Enterprises",
    code: "SE005",
    users: 18,
    plan: "Enterprise",
    status: "Expired",
    created: "Apr 15, 2025",
    color: "bg-pink-500",
    initial: "S",
  },
];

const statusStyles = {
  Active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Trial: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function KpiCard({ title, value, delta, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon
            className={`w-4.5 h-4.5 ${iconColor}`}
            style={{ width: 18, height: 18 }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            {value}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
        ↑ {delta}
      </p>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
      <main className="px-4 sm:px-6 py-4">
        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {kpiData.map((item, i) => (
            <KpiCard key={i} {...item} />
          ))}
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          {/* Companies growth */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Companies Growth
              </h3>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                Last 6 Months <ChevronDown className="w-3 h-3" />
              </span>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={growthData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-100 dark:text-gray-700"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "none",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription overview */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3.5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Subscription Overview
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center gap-6">
                {/* Pie Chart */}
                <div className="relative w-48 h-48 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={subscriptionData}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {subscriptionData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      128
                    </span>
                    <span className="text-sm text-gray-400">Total</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col justify-center space-y-3 min-w-[130px]">
                  {subscriptionData.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {s.name}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent companies */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Companies
              </h3>
              <button className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {recentCompanies.map((c) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg ${c.color} text-white text-[10px] font-semibold flex items-center justify-center shrink-0`}
                  >
                    {c.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {c.email}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Companies table */}
        <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3.5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Companies
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company..."
                  className="bg-transparent text-xs outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 w-32"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-600 dark:text-gray-200 outline-none"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Trial</option>
                <option>Expired</option>
              </select>
              <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create Company
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700/60">
                  <th className="py-2 font-medium">Company Name</th>
                  <th className="py-2 font-medium">Company Code</th>
                  <th className="py-2 font-medium">Users</th>
                  <th className="py-2 font-medium">Plan</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Created On</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((c) => (
                  <tr
                    key={c.code}
                    className="border-b border-gray-50 dark:border-gray-700/40 last:border-0"
                  >
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md ${c.color} text-white text-[10px] font-semibold flex items-center justify-center`}
                        >
                          {c.initial}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-gray-500 dark:text-gray-400">
                      {c.code}
                    </td>
                    <td className="text-gray-500 dark:text-gray-400">
                      {c.users}
                    </td>
                    <td className="text-gray-500 dark:text-gray-400">
                      {c.plan}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-gray-500 dark:text-gray-400">
                      {c.created}
                    </td>
                    <td>
                      <div className="flex items-center gap-0.5 text-gray-400">
                        <button className="p-1 hover:text-indigo-600">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 hover:text-indigo-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 hover:text-indigo-600">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
            <p className="text-[11px] text-gray-400">
              Showing 1 to {filteredCompanies.length} of 128 companies
            </p>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={`w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center ${
                    n === 1
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-1 text-gray-400 text-xs">...</span>
              <button className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-300 flex items-center justify-center">
                26
              </button>
              <button className="w-7 h-7 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
