import React from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  FileText,
  CheckCircle2,
  FileSignature,
  CalendarClock,
  XCircle,
  Send,
  FileStack,
  Receipt,
  ReceiptText,
  Ban,
  RotateCcw,
  MessageSquareWarning,
  PackageSearch,
  Truck,
  ClipboardList,
  FileEdit,
  ShoppingCart,
} from "lucide-react";
import { hasScreenAccess } from "../../utils/accessControl";

// Same section/item shape as menu-items config, so this page reads
// like every other module page in the app (mirrors MastersList.js).
const SECTIONS = [
  {
    items: [
      {
        name: "Enquiry",
        icon: HelpCircle,
        path: "/sales/enquiry",
        screenCode: "ENQUIRY",
      },
      {
        name: "Quotation",
        icon: FileText,
        path: "/sales/quotation",
        screenCode: "QUOTATION",
      },
      {
        name: "Order Acceptance",
        icon: CheckCircle2,
        path: "/orderacceptance",
        screenCode: "ORDER_ACCEPTANCE",
      },
      {
        name: "Sales Return",
        icon: RotateCcw,
        path: "/salesreturn",
        screenCode: "SALES_RETURN",
      },
      {
        name: "Customer Complaint Escalation",
        icon: MessageSquareWarning,
        path: "/customercomplaintescalation",
        screenCode: "CUSTOMER_COMPLAINT_ESCALATION",
      },
      {
        name: "Sales Contract",
        icon: FileSignature,
        path: "/salescontract",
        screenCode: "SALES_CONTRACT",
      },
      {
        name: "Sales Delivery Schedule",
        icon: CalendarClock,
        path: "/sales/salesdelivery",
        screenCode: "SALES_DELIVERY_SCHEDULE",
      },
      {
        name: "Sales Order Short Close",
        icon: XCircle,
        path: "/salesordershortclose",
        screenCode: "SALES_ORDER_SHORT_CLOSE",
      },
      {
        name: "Despatch Instruction",
        icon: Send,
        path: "/despatchinstruction",
        screenCode: "DESPATCH_INSTRUCTION",
      },
      {
        name: "DC Cum Invoice",
        icon: FileStack,
        path: "/dccuminvoice",
        screenCode: "DC_CUM_INVOICE",
      },
      {
        name: "Stock Transfer Challan",
        icon: PackageSearch,
        path: "/stocktransferchallan",
        screenCode: "STOCK_TRANSFER_CHALLAN",
      },
      {
        name: "Transport Bill",
        icon: Truck,
        path: "/transportbill",
        screenCode: "TRANSPORT_BILL",
      },
      {
        name: "Docket/Invoice Details",
        icon: ClipboardList,
        path: "/docketinvoicedetails",
        screenCode: "DOCKET_INVOICE_DETAILS",
      },
      {
        name: "Proforma Invoice",
        icon: Receipt,
        path: "/proformainvoice",
        screenCode: "PROFORMA_INVOICE",
      },
      {
        name: "Other Sales Invoice",
        icon: ReceiptText,
        path: "/othersalesinvoice",
        screenCode: "OTHER_SALES_INVOICE",
      },
      {
        name: "Rejection Invoice",
        icon: Ban,
        path: "/rejectioninvoice",
        screenCode: "REJECTION_INVOICE",
      },
    ],
  },

  {
    title: "Amendment",
    description: "Amendments to contracts and orders",
    icon: FileEdit,
    gradient: "from-teal-500 to-teal-600",
    color: "teal",
    items: [
      {
        name: "Sales Contract Amendment",
        icon: FileEdit,
        path: "/salescontractamendment",
        screenCode: "SALES_CONTRACT_AMENDMENT",
      },
      {
        name: "Sales Order Amendment",
        icon: FileEdit,
        path: "/salesorderamendment",
        screenCode: "SALES_ORDER_AMENDMENT",
      },
    ],
  },
];

// Same color-token map used across the app's module pages, expanded so
// every item card can get its own distinct color instead of every card
// in a section sharing one color.
const getColorStyles = (color) => {
  const colors = {
    blue: {
      hover: "hover:bg-blue-50 dark:hover:bg-blue-900/30",
      border: "hover:border-blue-300 dark:hover:border-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      iconBg:
        "bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    },
    cyan: {
      hover: "hover:bg-cyan-50 dark:hover:bg-cyan-900/30",
      border: "hover:border-cyan-300 dark:hover:border-cyan-600",
      text: "text-cyan-600 dark:text-cyan-400",
      iconBg:
        "bg-cyan-100 dark:bg-cyan-900/40 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800",
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
    purple: {
      hover: "hover:bg-purple-50 dark:hover:bg-purple-900/30",
      border: "hover:border-purple-300 dark:hover:border-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      iconBg:
        "bg-purple-100 dark:bg-purple-900/40 group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    },
    pink: {
      hover: "hover:bg-pink-50 dark:hover:bg-pink-900/30",
      border: "hover:border-pink-300 dark:hover:border-pink-600",
      text: "text-pink-600 dark:text-pink-400",
      iconBg:
        "bg-pink-100 dark:bg-pink-900/40 group-hover:bg-pink-200 dark:group-hover:bg-pink-800",
    },
    orange: {
      hover: "hover:bg-orange-50 dark:hover:bg-orange-900/30",
      border: "hover:border-orange-300 dark:hover:border-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      iconBg:
        "bg-orange-100 dark:bg-orange-900/40 group-hover:bg-orange-200 dark:group-hover:bg-orange-800",
    },
    emerald: {
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
      border: "hover:border-emerald-300 dark:hover:border-emerald-600",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    },
    sky: {
      hover: "hover:bg-sky-50 dark:hover:bg-sky-900/30",
      border: "hover:border-sky-300 dark:hover:border-sky-600",
      text: "text-sky-600 dark:text-sky-400",
      iconBg:
        "bg-sky-100 dark:bg-sky-900/40 group-hover:bg-sky-200 dark:group-hover:bg-sky-800",
    },
    violet: {
      hover: "hover:bg-violet-50 dark:hover:bg-violet-900/30",
      border: "hover:border-violet-300 dark:hover:border-violet-600",
      text: "text-violet-600 dark:text-violet-400",
      iconBg:
        "bg-violet-100 dark:bg-violet-900/40 group-hover:bg-violet-200 dark:group-hover:bg-violet-800",
    },
    fuchsia: {
      hover: "hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/30",
      border: "hover:border-fuchsia-300 dark:hover:border-fuchsia-600",
      text: "text-fuchsia-600 dark:text-fuchsia-400",
      iconBg:
        "bg-fuchsia-100 dark:bg-fuchsia-900/40 group-hover:bg-fuchsia-200 dark:group-hover:bg-fuchsia-800",
    },
    lime: {
      hover: "hover:bg-lime-50 dark:hover:bg-lime-900/30",
      border: "hover:border-lime-300 dark:hover:border-lime-600",
      text: "text-lime-600 dark:text-lime-400",
      iconBg:
        "bg-lime-100 dark:bg-lime-900/40 group-hover:bg-lime-200 dark:group-hover:bg-lime-800",
    },
    red: {
      hover: "hover:bg-red-50 dark:hover:bg-red-900/30",
      border: "hover:border-red-300 dark:hover:border-red-600",
      text: "text-red-600 dark:text-red-400",
      iconBg:
        "bg-red-100 dark:bg-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-800",
    },
    yellow: {
      hover: "hover:bg-yellow-50 dark:hover:bg-yellow-900/30",
      border: "hover:border-yellow-300 dark:hover:border-yellow-600",
      text: "text-yellow-600 dark:text-yellow-400",
      iconBg:
        "bg-yellow-100 dark:bg-yellow-900/40 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800",
    },
  };
  return colors[color] || colors.blue;
};

// Pool of colors cycled through per item, so cards next to each other
// don't all look the same.
const ITEM_COLOR_PALETTE = [
  "blue",
  "cyan",
  "teal",
  "indigo",
  "amber",
  "rose",
  "purple",
  "pink",
  "orange",
  "emerald",
  "sky",
  "violet",
  "fuchsia",
  "lime",
  "red",
  "yellow",
];

const SalesList = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType")?.toUpperCase();

  let colorIndex = 0;
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
      style={{ transform: "scale(0.98)", transformOrigin: "top left" }}
    >
      {hasAnyItems ? (
        <>
          {/* Main Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Sales
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Manage the entire sales workflow, from enquiry to invoicing
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
          </div>

          {/* Each section gets its own row heading (when it has a title)
              + each item card gets its own color */}
          {filteredSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;

            return (
              <div
                key={section.title || `section-${sectionIndex}`}
                className="mb-5"
              >
                {/* Section Row Heading — only rendered when the section
                    actually has a title (skips the unnamed first section) */}
                {section.title && (
                  <div className="flex items-center gap-2 mb-2">
                    {SectionIcon && (
                      <div
                        className={`p-1 rounded-md bg-gradient-to-br ${section.gradient} shadow-sm`}
                      >
                        <SectionIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <h3
                      className={`text-sm font-semibold ${getColorStyles(section.color).text}`}
                    >
                      {section.title}
                    </h3>
                    {section.description && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {section.description}
                      </span>
                    )}
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
                  </div>
                )}

                <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
                  {section.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    const colors = getColorStyles(item.color);

                    return (
                      <div
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className="group cursor-pointer animate-slideUp"
                        style={{
                          animationDelay: `${(sectionIndex * 6 + itemIndex) * 30}ms`,
                        }}
                      >
                        <div
                          className={`
                          relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg
                          border border-gray-200 dark:border-gray-700
                          ${colors.border} ${colors.hover}
                          transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                        `}
                        >
                          <div className="p-1 h-20 flex flex-col items-center justify-center text-center">
                            <div
                              className={`
                              p-2 rounded-lg ${colors.iconBg}
                              transition-all duration-200 group-hover:scale-105
                              mb-1.5
                            `}
                            >
                              <ItemIcon className={`h-4 w-4 ${colors.text}`} />
                            </div>

                            <h3
                              className={`text-xs font-medium ${colors.text} transition-colors leading-tight line-clamp-2`}
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
              No sales modules available
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You do not have access to any sales module.
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

export default SalesList;
