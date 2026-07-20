import { Globe, Map, Landmark, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

const MastersList = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType")?.toUpperCase();

  const masters = [
    {
      name: "Country",
      icon: Globe,
      path: "/country",
      bg: "bg-green-100 dark:bg-green-900/30",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      screenCode: "COUNTRY",
    },
    {
      name: "State",
      icon: Map,
      path: "/state",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      screenCode: "STATE",
    },
    {
      name: "City",
      icon: Landmark,
      path: "/city",
      bg: "bg-sky-100 dark:bg-sky-900/30",
      bgColor: "bg-sky-100 dark:bg-sky-900/30",
      iconColor: "text-sky-600 dark:text-sky-400",
      screenCode: "CITY",
    },
    {
      name: "Department",
      icon: Building2,
      path: "/department",
      bg: "bg-violet-100 dark:bg-violet-900/30",
      bgColor: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      screenCode: "DEPT",
    },
    {
      name: "Designation",
      icon: Building2,
      path: "/designation",
      bg: "bg-pink-100 dark:bg-pink-900/30",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400",
      screenCode: "DESIGNATION",
    },
  ];

  const filteredMasters = masters.filter((item) => {
    if (userType === "SADMIN") return false;
    return hasScreenAccess(item.screenCode);
  });

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 px-8 py-2">
      {/* Header */}
      <h1 className="text-sm font-semibold text-gray-800 dark:text-white wide-tracking mb-1">
        Masters
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3">
        {filteredMasters.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
          group cursor-pointer
          ${item.bgColor}
          border border-slate-200 dark:border-slate-700
          rounded-xl p-2
          shadow-sm hover:shadow-md
          hover:-translate-y-1
          transition-all duration-300
          flex flex-col items-center justify-center
          
        `}
            >
              <div
                className={`
            ${item.bg}
            ${item.iconColor}
            w-6 h-6 rounded-lg
            flex items-center justify-center
            mb-2
          `}
              >
                <Icon size={12} />
              </div>

              <h3 className="text-xs font-medium text-center text-gray-700 dark:text-gray-200 break-words">
                {item.name}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MastersList;
