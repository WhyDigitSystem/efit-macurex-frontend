import { ClipboardCheck, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasScreenAccess } from "../../utils/accessControl";

// ============================================================
// REPORT SECTIONS
// ============================================================

const SECTIONS = [
  {
    title: "Reports",
    description: "View and manage reports",
    icon: ClipboardCheck,
    gradient: "from-purple-600 to-indigo-500",
    color: "purple",

    items: [
      {
        name: "Order Acceptance For Approval",
        icon: FileCheck,
        path: "/orderacceptanceforapproval",
        screenCode: "ORDER_ACCEPTANCE_FOR_APPROVAL",
      },
      {
        name: "Sales Contract For Approval",
        icon: FileCheck,
        path: "/salescontractforapproval",
        screenCode: "SALES_CONTRACT_FOR_APPROVAL",
      },
    ],
  },
];

// ============================================================
// COLOR STYLES
// ============================================================

const getColorStyles = (color) => {
  const colors = {
    purple: {
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
      border: "hover:border-purple-300 dark:hover:border-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    },
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    emerald: {
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
      border: "hover:border-emerald-300 dark:hover:border-emerald-600",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    },
    rose: {
      hover: "hover:bg-rose-50 dark:hover:bg-rose-900/30",
      border: "hover:border-rose-300 dark:hover:border-rose-600",
      text: "text-rose-600 dark:text-rose-400",
      iconBg:
        "bg-rose-100 dark:bg-rose-900/40 group-hover:bg-rose-200 dark:group-hover:bg-rose-800",
    },
    amber: {
      hover: "hover:bg-amber-50 dark:hover:bg-amber-900/30",
      border: "hover:border-amber-300 dark:hover:border-amber-600",
      text: "text-amber-600 dark:text-amber-400",
      iconBg:
        "bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800",
    },
  };

  return colors[color] || colors.purple;
};

// ============================================================
// REPORTS LIST
// ============================================================

const ReportsList = () => {
  const navigate = useNavigate();

  const userType = localStorage.getItem("userType")?.toUpperCase();

  let colorIndex = 0;

  const ITEM_COLOR_PALETTE = ["blue", "emerald", "rose", "amber", "purple"];

  const filteredSections = SECTIONS.map((section) => ({
    ...section,

    items: section.items
      .filter((item) => {
        if (userType === "SADMIN") return false;

        return hasScreenAccess(item.screenCode);
      })
      .map((item) => ({
        ...item,
        color: ITEM_COLOR_PALETTE[colorIndex++ % ITEM_COLOR_PALETTE.length],
      })),
  })).filter((section) => section.items.length > 0);

  const hasAnyItems = filteredSections.some(
    (section) => section.items.length > 0,
  );

  return (
    <div
      className="animate-fadeIn px-3 py-3"
      style={{
        transform: "scale(0.98)",
        transformOrigin: "top left",
      }}
    >
      {hasAnyItems ? (
        <>
          {filteredSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;

            return (
              <div key={section.title} className="mb-6">
                {/* SECTION HEADING */}

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`p-1.5 rounded-md bg-gradient-to-br ${section.gradient} shadow-sm`}
                  >
                    <SectionIcon className="h-3.5 w-3.5 text-white" />
                  </div>

                  <h3
                    className={`text-sm font-semibold ${
                      getColorStyles(section.color).text
                    }`}
                  >
                    {section.title}
                  </h3>

                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {section.description}
                  </span>

                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
                </div>

                {/* REPORT CARDS */}

                <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
                  {section.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    const colors = getColorStyles(item.color);

                    return (
                      <div
                        key={item.name}
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate(item.path)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(item.path);
                          }
                        }}
                        className="group cursor-pointer animate-slideUp"
                        style={{
                          animationDelay: `${
                            (sectionIndex * 6 + itemIndex) * 30
                          }ms`,
                        }}
                      >
                        <div
                          className={`
                            relative overflow-hidden
                            bg-white dark:bg-gray-800
                            rounded-lg
                            border border-gray-200 dark:border-gray-700
                            ${colors.border}
                            ${colors.hover}
                            transition-all duration-200
                            hover:shadow-md
                            hover:scale-[1.02]
                          `}
                        >
                          <div className="p-1 h-20 flex flex-col items-center justify-center text-center">
                            <div
                              className={`
                                p-2 rounded-lg
                                ${colors.iconBg}
                                transition-all duration-200
                                group-hover:scale-105
                                mb-1.5
                              `}
                            >
                              <ItemIcon className={`h-4 w-4 ${colors.text}`} />
                            </div>

                            <h3
                              className={`
                                text-xs font-medium
                                ${colors.text}
                                transition-colors
                                leading-tight
                                line-clamp-2
                              `}
                            >
                              {item.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
              No reports available
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You do not have access to any report.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// ANIMATIONS
// ============================================================

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

export default ReportsList;
