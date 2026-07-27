import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Map,
  Landmark,
  MapPin,
  Building2,
  GitBranch,
  CalendarDays,
  Users,
  Package,
  Scale,
  User,
  Briefcase,
  BadgeCheck,
  Coins,
  Truck,
  FileText,
  FileCog,
  DollarSign,
  MapPinned,
  Link,
  RefreshCw,
  ReceiptText
} from "lucide-react";
import { hasScreenAccess } from "../../utils/accessControl";

// Same section/item shape as menu-items config, so this page reads
// like every other module page in the app.
const SECTIONS = [
  {
    title: "Geography",
    description: "Country, state, city and location hierarchy",
    icon: Globe,
    gradient: "from-teal-500 to-teal-600",
    color: "teal",
    items: [
      {
        name: "Country",
        icon: Globe,
        path: "/country",
        screenCode: "COUNTRY",
      },
      {
        name: "State",
        icon: Map,
        path: "/state",
        screenCode: "STATE",
      },
      {
        name: "City",
        icon: Landmark,
        path: "/city",
        screenCode: "CITY",
      },
      {
        name: "Location",
        icon: MapPin,
        path: "/location",
        screenCode: "LOCATION",
      },
      {
        name: "Currency",
        icon: Coins,
        path: "/currency",
        screenCode: "CURRENCY",
      },
      {
        name: "Gst State",
        icon: MapPinned,
        path: "/gst_state",
        screenCode: "GST_STATE",
      },
      {
        name: "Gst Rate",
        icon: CalendarDays,
        path: "/gst_rate",
        screenCode: "GST_RATE",
      },
    ],
  },

  {
    title: "Organization",
    description: "Company structure and business setup",
    icon: Building2,
    gradient: "from-indigo-500 to-indigo-600",
    color: "indigo",
    items: [
      {
        name: "Company",
        icon: Building2,
        path: "/company",
        screenCode: "COMPANY",
      },
      {
        name: "Branch",
        icon: GitBranch,
        path: "/branch",
        screenCode: "BRANCH",
      },
      {
        name: "Financial Year",
        icon: CalendarDays,
        path: "/financialyear",
        screenCode: "FINYEAR",
      },
      {
        name: "Calendar Master",
        icon: CalendarDays,
        path: "/calendar",
        screenCode: "CALENDAR",
      },
    ],
  },

  {
    title: "Commercial",
    description: "Business partners, documents and exchange rates",
    icon: Briefcase,
    gradient: "from-blue-500 to-blue-600",
    color: "blue",
    items: [
      {
        name: "Party",
        icon: Users,
        path: "/party",
        screenCode: "PARTY",
      },
      {
        name: "Mapping Of Party To Account",
        icon: Link,
        path: "/partymappingaccount",
        screenCode: "PARTY_ACCOUNT_MAPPING",
      },
      {
        name: "Transporter",
        icon: Truck,
        path: "/transporter",
        screenCode: "TRANSPORTER",
      },
      {
        name: "Document Type",
        icon: FileText,
        path: "/documenttype",
        screenCode: "DOCUMENT_TYPE",
      },
      {
        name: "Doc Type Mapping",
        icon: FileCog,
        path: "/documenttypemapping",
        screenCode: "DOCUMENT_TYPE_MAPPING",
      },
      {
        name: "Exchange Rate",
        icon: DollarSign,
        path: "/exchangerate",
        screenCode: "EXCHANGE_RATE",
      },
      {
        name: "Exchange Rate Update",
        icon: RefreshCw,
        path: "/exchangerateupdate",
        screenCode: "EXCHANGE_RATE_UPDATE",
      },
      {
        name: "Daily Exchange Rate",
        icon: DollarSign,
        path: "/dailyexchangerate",
        screenCode: "DAILY_EXCHANGE_RATE",
      },
      {
        name: "Sales Zone",
        icon: MapPinned,
        path: "/saleszone",
        screenCode: "SALES_ZONE",
      },
    ],
  },

  {
    title: "Inventory",
    description: "Items, units and conversion rules",
    icon: Package,
    gradient: "from-amber-500 to-amber-600",
    color: "amber",
    items: [
      {
        name: "Item",
        icon: Package,
        path: "/item",
        screenCode: "ITEM",
      },
      {
        name: "Unit",
        icon: Scale,
        path: "/unit",
        screenCode: "UNIT",
      },
      {
        name: "Unit Conversion",
        icon: Scale,
        path: "/unitconversion",
        screenCode: "UNIT_CONVERSION",
      },
      {
        name: "List of Values",
        icon: Package,
        path: "/listofvalues",
        screenCode: "LIST_OF_VALUES",
      },
      {
        name: "LME Rate",
        icon: BadgeCheck,
        path: "/lmtrate",
        screenCode: "LME_Ratez",
      },
      {
        name: "Bank Master",
        icon: Landmark,
        path: "/bank",
        screenCode: "BANK",
      },
      {
        name: "Tax Rate",
        icon: ReceiptText,
        path: "/taxRate",
        screenCode: "TAXRATE",
      },
      {
        name: "Tax Defination",
        icon: FileText,
        path: "/taxDefination",
        screenCode: "TAXDEF",
      },
      {
        name: "HSN/SAC Master",
        icon: FileText,
        path: "/hsnsac",
        screenCode: "HSN_SAC",
      },
    ],
  },

  {
    title: "People",
    description: "Employees, departments and designations",
    icon: Users,
    gradient: "from-rose-500 to-rose-600",
    color: "rose",
    items: [
      {
        name: "Employee",
        icon: User,
        path: "/employee",
        screenCode: "EMPLOYEE",
      },
      {
        name: "Department",
        icon: Briefcase,
        path: "/department",
        screenCode: "DEPT",
      },
      {
        name: "Designation",
        icon: BadgeCheck,
        path: "/designation",
        screenCode: "DESIGNATION",
      },
    ],
  },
];

// Same color-token map used across the app's module pages.
const getColorStyles = (color) => {
  const colors = {
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    teal: {
      hover: "hover:bg-teal-50 dark:hover:bg-teal-900/30",
      border: "hover:border-teal-300 dark:hover:border-teal-600",
      text: "text-teal-600 dark:text-teal-400",
      iconBg:
        "bg-teal-100 dark:bg-teal-900/40 group-hover:bg-teal-200 dark:group-hover:bg-teal-800",
    },
    indigo: {
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
      border: "hover:border-indigo-300 dark:hover:border-indigo-600",
      text: "text-indigo-600 dark:text-indigo-400",
      iconBg:
        "bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800",
    },
    amber: {
      hover: "hover:bg-amber-50 dark:hover:bg-amber-900/30",
      border: "hover:border-amber-300 dark:hover:border-amber-600",
      text: "text-amber-600 dark:text-amber-400",
      iconBg:
        "bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800",
    },
    rose: {
      hover: "hover:bg-rose-50 dark:hover:bg-rose-900/30",
      border: "hover:border-rose-300 dark:hover:border-rose-600",
      text: "text-rose-600 dark:text-rose-400",
      iconBg:
        "bg-rose-100 dark:bg-rose-900/40 group-hover:bg-rose-200 dark:group-hover:bg-rose-800",
    },
  };
  return colors[color] || colors.blue;
};

const MastersList = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType")?.toUpperCase();

  const filteredSections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (userType === "SADMIN") return false;
      return hasScreenAccess(item.screenCode);
    }),
  })).filter((section) => section.items.length > 0);

  // All items across every section, flattened - no section headers/grouping,
  // just a single grid of icon + title tiles.
  const allItems = filteredSections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      colors: getColorStyles("blue"),
    })),
  );

  return (
    <div
      className="animate-fadeIn px-3 py-3"
      style={{ transform: "scale(0.98)", transformOrigin: "top left" }}
    >
      {allItems.length > 0 ? (
        <>
          {/* Main Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Masters
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Manage all master data across the application
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
            {allItems.map((item, itemIndex) => {
              const ItemIcon = item.icon;

              return (
                <div
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="group cursor-pointer animate-slideUp"
                  style={{ animationDelay: `${itemIndex * 30}ms` }}
                >
                  <div
                    className={`
                    relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg
                    border border-gray-200 dark:border-gray-700
                    ${item.colors.border} ${item.colors.hover}
                    transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                  `}
                  >
                    <div className="p-1 h-20 flex flex-col items-center justify-center text-center">
                      <div
                        className={`
                        p-2 rounded-lg ${item.colors.iconBg}
                        transition-all duration-200 group-hover:scale-105
                        mb-1.5
                      `}
                      >
                        <ItemIcon className={`h-4 w-4 ${item.colors.text}`} />
                      </div>

                      <h3
                        className={`text-xs font-medium ${item.colors.text} transition-colors leading-tight line-clamp-2`}
                      >
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
              No masters available
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You do not have access to any master module.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Shared entrance animations, consistent with the rest of the app's module pages.
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
  opacity: 0;
}
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MastersList;
