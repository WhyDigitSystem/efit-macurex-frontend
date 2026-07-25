import { clsx } from "clsx";
import Lottie from "lottie-react";
import { LayoutDashboard, BookOpenCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

const Sidebar = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);

  const userType =
    user?.type?.toUpperCase() ||
    localStorage.getItem("userType")?.toUpperCase();

  const userEmail =
    user?.email?.toLowerCase() || localStorage.getItem("email")?.toLowerCase();

  // Special menu for sadmin@gmail.com
  const isMainSAdmin = userType === "SADMIN";

  const navigation = isMainSAdmin
    ? [
        {
          name: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          bgColor:
            "bg-gradient-to-br from-indigo-600 to-cyan-500 dark:from-indigo-500 dark:to-cyan-400",
          screenCode: "DASHBOARD",
        },
        {
          name: "Add Company",
          href: "/new-entries",
          icon: BookOpenCheck,
          bgColor:
            "bg-gradient-to-br from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400",
          screenCode: "COMPANY",
        },
      ]
    : [
        {
          name: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          bgColor:
            "bg-gradient-to-br from-indigo-600 to-cyan-500 dark:from-indigo-500 dark:to-cyan-400",
          screenCode: "DASHBOARD",
        },
        {
          name: "Masters",
          href: "/masters",
          icon: BookOpenCheck,
          bgColor:
            "bg-gradient-to-br from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400",
          screenCode: "MASTERS",
        },
      ];

  // Permission filtering
  const filteredNavigation = navigation.filter((item) => {
    // For sadmin@gmail.com show only Dashboard & Add Company
    if (isMainSAdmin) return true;

    // Other Super Admins
    if (userType === "SADMIN") return true;

    return hasScreenAccess(item.screenCode);
  });

  if (!user || filteredNavigation.length === 0) {
    return null;
  }

  return (
    <aside
      id="sidebar"
      className={clsx(
        "bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col",

        // Mobile
        "absolute md:relative left-0 top-14 md:top-auto z-40",
        "h-[calc(100%-3.5rem)] md:h-full",

        sidebarOpen ? "w-[170px]" : "w-20",

        // Animation
        "transform md:transform-none",
        "transition-transform duration-300 ease-in-out md:transition-all md:duration-300",

        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",

        "flex-shrink-0",
      )}
    >
      {/* ================= Navigation ================= */}
      <div className="mt-2 flex-1 px-1.5 space-y-0.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  "flex transition-all duration-200 group border",
                  isActive
                    ? "border-blue-300 dark:border-blue-700 bg-gray-100/50 dark:bg-gray-800/50"
                    : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                  sidebarOpen
                    ? "items-center px-2 py-1.5 rounded-md"
                    : "flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-md",
                )
              }
            >
              {/* Icon */}
              <div className={clsx("rounded-md p-1.5", item.bgColor)}>
                <Icon className="h-4 w-4 text-white" />
              </div>

              {/* Label */}
              <span
                className={clsx(
                  "font-medium text-gray-600 dark:text-gray-300",
                  sidebarOpen
                    ? "ml-2.5 text-sm"
                    : "text-[10px] leading-tight text-center",
                )}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* ================= Footer ================= */}
      {sidebarOpen && (
        <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Version 1.0
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
