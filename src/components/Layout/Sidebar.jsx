import { clsx } from "clsx";
import Lottie from "lottie-react";
import {
  LayoutDashboard,
  BookOpenCheck,
  PackagePlus,
  PackageCheck,
  Wrench,
  Boxes,
  FileText,
  Settings,
  AlertTriangle,
  Building2
} from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import truckAnimation from "../../assets/lottieflow-ecommerce.json";
import { hasScreenAccess } from "../../utils/accessControl";

const Sidebar = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const userType = localStorage.getItem("userType")?.toUpperCase();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      iconColor: "text-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-300 dark:border-blue-700",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      screenCode: "DASHBOARD",
    },
    {
      name: "Masters",
      href: "/masters",
      icon: BookOpenCheck,
      iconColor: "text-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-300 dark:border-emerald-700",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      screenCode: "MASTERS",
    },
    
  ];

  const filteredNavigation = navigation.filter((item) => {
    if (userType === "SADMIN") {
      return item.screenCode === "SETUP";
    }

    return hasScreenAccess(item.screenCode);
  });

  if (filteredNavigation.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Sidebar Navigation"
      className={clsx(
        "bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 h-full",
        sidebarOpen ? "w-64" : "w-20",
      )}
    >
      <nav className="h-full flex flex-col">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-4 mt-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-xl shadow-md flex items-center justify-center">
            {/* <Lottie animationData={truckAnimation} loop autoplay /> */}
            <Building2 size="20" className="text-white" />
          </div>

          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
               ERP
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enterprise Resource Planning
              </p>
            </div>
          )}
        </div>

        

        {/* Links */}
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    "transition-all duration-200 border group hover:shadow-sm",
                    isActive
                      ? `${item.borderColor} ${item.bgColor} ${item.textColor}`
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
                    sidebarOpen
                      ? "flex items-center px-3 py-1 rounded-lg"
                      : "flex flex-col items-center justify-center px-2 py-1 rounded-lg",
                  )
                }
              >
                <Icon className={`h-4 w-4 ${item.iconColor}`} />

                {sidebarOpen ? (
                  <span className="ml-3 text-[15px]">{item.name}</span>
                ) : (
                  <span className="mt-1 text-[12px] text-center leading-tight break-words">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Version */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              v1.0.0
            </p>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
