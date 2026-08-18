import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { formatDateForDisplay } from "./dateFormatter";

const CommonListViewTable = ({
  // Core props
  title,
  subtitle,
  data = [],
  loading = false,
  renderFooter,

  // Configuration
  columns = [],
  searchFields = [],
  filterOptions = [],
  defaultFilter = "all",

  // Actions
  onAddNew,
  onEdit,
  onView,
  onCustomAction,
  onBack,

  // Custom renderers
  customCellRenderers = {},
  customHeaderActions = null,

  // Pagination
  itemsPerPageOptions = [5, 10, 25, 50, 100],
  defaultItemsPerPage = 10,

  // Search/filter state
  externalSearchTerm = null,
  externalStatusFilter = null,
  onSearchChange = null,
  onFilterChange = null,

  // Additional options
  showSerialNumber = true,
  serialNumberKey = "sno",
  rowClassName = "",
  emptyMessage = "No records found",
  loadingMessage = "Loading...",

  // Statistics props
  showStatistics = true,
  statisticsConfig = {
    activeField: "active",
    activeValue: "Active",
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    totalLabel: "Total Records",
    customStats: null,
  },
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalStatusFilter, setInternalStatusFilter] =
    useState(defaultFilter);
  const [openSection, setOpenSection] = useState({ listView: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const searchTerm =
    externalSearchTerm !== null ? externalSearchTerm : internalSearchTerm;
  const statusFilter =
    externalStatusFilter !== null ? externalStatusFilter : internalStatusFilter;

  const toggleSection = (key) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearchChange = (value) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchTerm(value);
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      setInternalStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const getNestedValue = (obj, path) => {
    if (typeof path === "function") {
      return path(obj);
    }
    if (typeof path === "string") {
      return path.split(".").reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : "";
      }, obj);
    }
    return "";
  };

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter((item) => {
        return searchFields.some((field) => {
          const fieldValue = getNestedValue(item, field);
          return (fieldValue || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });
      });
    }

    if (statusFilter !== "all" && filterOptions.length > 0) {
      const filterOption = filterOptions.find(
        (opt) => opt.value === statusFilter,
      );
      if (filterOption && filterOption.filterFn) {
        filtered = filtered.filter((item) => filterOption.filterFn(item));
      } else if (filterOption && filterOption.field) {
        filtered = filtered.filter((item) => {
          const fieldValue = getNestedValue(item, filterOption.field);
          return filterOption.filterValue === "active"
            ? fieldValue === filterOption.activeValue
            : fieldValue !== filterOption.activeValue;
        });
      }
    }

    return filtered;
  }, [data, searchTerm, statusFilter, searchFields, filterOptions]);

  const statistics = useMemo(() => {
    if (!showStatistics) return null;

    if (statisticsConfig.customStats) {
      return statisticsConfig.customStats(data, filteredData);
    }

    const isActive = (item) => {
      const value = getNestedValue(item, statisticsConfig.activeField);
      return value === statisticsConfig.activeValue || value === true;
    };

    const totalRecords = data.length;
    const activeCount = data.filter(isActive).length;
    const inactiveCount = totalRecords - activeCount;
    const filteredTotal = filteredData.length;
    const filteredActive = filteredData.filter(isActive).length;
    const filteredInactive = filteredTotal - filteredActive;

    return {
      totalRecords,
      activeCount,
      inactiveCount,
      filteredTotal,
      filteredActive,
      filteredInactive,
      isFiltered: searchTerm !== "" || statusFilter !== "all",
    };
  }, [
    data,
    filteredData,
    showStatistics,
    statisticsConfig,
    searchTerm,
    statusFilter,
  ]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const SectionHeader = ({ title, sectionKey }) => {
    const isOpen = openSection[sectionKey];
    return (
      <div
        className="flex items-center justify-between cursor-pointer select-none py-2 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <span className="text-gray-600 dark:text-gray-400">
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </span>
      </div>
    );
  };

  const defaultRenderers = {
    text: (value, row, column) => (
      <span className="text-xs text-gray-900 dark:text-white">
        {value || "-"}
      </span>
    ),
    badge: (value, row, column, badgeClass) => {
      const badgeClassName =
        typeof badgeClass === "function" ? badgeClass(value) : badgeClass;
      return (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badgeClassName || getDefaultBadgeClass(value)}`}
        >
          {value || "-"}
        </span>
      );
    },
    date: (value, row, column) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatDateForDisplay(value) || "-"}
      </span>
    ),
    actions: (row, index) => (
      <div className="flex items-center justify-end gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(row)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            title="Edit"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
        {onView && (
          <button
            onClick={() => onView(row)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
            title="View"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        )}
        {onCustomAction && onCustomAction(row)}
      </div>
    ),
  };

  const getDefaultBadgeClass = (value) => {
    const badgeMap = {
      TAX: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      PROFORMA: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      Approved:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      Rejected: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      PENDING:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    };
    return (
      badgeMap[value] ||
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
    );
  };

  const renderCell = (row, column, index) => {
    const value = column.accessor ? getNestedValue(row, column.accessor) : null;

    if (customCellRenderers[column.key]) {
      return customCellRenderers[column.key](value, row, index);
    }

    if (column.render) {
      return column.render(value, row, index);
    }

    switch (column.type) {
      case "badge":
        return defaultRenderers.badge(value, row, column, column.badgeClass);

      case "status":
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              value === true || value === "Active"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {value === true || value === "Active" ? "Active" : "Inactive"}
          </span>
        );

      case "date":
        return defaultRenderers.date(value, row, column);

      case "actions":
        return defaultRenderers.actions(row, index);

      default:
        return defaultRenderers.text(value, row, column);
    }
  };

  const renderStatistics = () => {
    if (!showStatistics || !statistics) return null;

    if (statisticsConfig.customStats) {
      return statisticsConfig.customStats(data, filteredData);
    }

    return (
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-4">
          <span className="font-medium">
            {" "}
            {statisticsConfig.totalLabel || "Total Records"}:{" "}
            {statistics.totalRecords}
          </span>
          <span className="text-green-600 dark:text-gray-400">
            {statisticsConfig.activeLabel || "Active"}: {statistics.activeCount}
          </span>
          <span className="text-red-600 dark:text-gray-400">
            {statisticsConfig.inactiveLabel || "Inactive"}:{" "}
            {statistics.inactiveCount}
          </span>
          {statistics.isFiltered && (
            <span className="text-blue-600 dark:text-blue-400 ml-4">
              Filtered: {statistics.filteredTotal} records (
              {statistics.filteredActive} active, {statistics.filteredInactive}{" "}
              inactive)
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3">
    
      <div className="mb-4 flex items-center justify-between">
        {/* Left */}
       <div className="flex items-center gap-3">
  {onBack && (
    <button
      onClick={onBack}
      className="
        flex items-center justify-center
        h-8 w-8
        rounded-full
        text-gray-600
        dark:text-gray-300
        hover:bg-gray-100
        dark:hover:bg-gray-700
        transition
        flex-shrink-0
      "
      title="Back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  )}

  <div>
    <h1 className="text-xl font-bold tracking-tight text-gray-700 dark:text-gray-200">
      {title}
    </h1>

    {subtitle && (
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    )}
  </div>
</div>

        {/* Right */}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {openSection.listView && (
          <>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search by ${searchFields.join(", ")}...`}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter */}
                  {filterOptions.length > 0 && (
                    <div className="relative w-full sm:w-40 sm:flex-shrink-0">
                      <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                      <select
                        value={statusFilter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                      >
                        {filterOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  )}

                  {/* Custom Actions */}
                  {customHeaderActions && (
                    <div className="flex-shrink-0">{customHeaderActions}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {showSerialNumber && (
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        S.No
                      </th>
                    )}

                    {columns.map((column) => (
                      <th
                        key={column.key}
                        style={{ width: column.width }}
                        className={`px-6 py-3 text-${column.align || "left"} text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {loading && currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + (showSerialNumber ? 1 : 0)}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {loadingMessage}
                      </td>
                    </tr>
                  ) : currentData.length > 0 ? (
                    currentData.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${rowClassName}`}
                      >
                        {showSerialNumber && (
                          <td className="px-6 py-1.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                            {startIndex + index + 1}
                          </td>
                        )}

                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`px-6 py-1.5 text-xs text-${column.align || "left"} ${
                              column.noWrap === false
                                ? "whitespace-normal"
                                : "whitespace-nowrap"
                            }`}
                          >
                            {renderCell(row, column, startIndex + index)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + (showSerialNumber ? 1 : 0)}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredData.length > 0 && (
              <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredData.length)} of{" "}
                    {filteredData.length} entries
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center gap-3">
                    {/* Page Size */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {itemsPerPageOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Page Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        «
                      </button>

                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ‹
                      </button>

                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 3;

                        if (totalPages <= maxVisiblePages) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          pages.push(1);

                          let startPage = Math.max(2, currentPage - 1);
                          let endPage = Math.min(
                            totalPages - 1,
                            currentPage + 1,
                          );

                          if (currentPage <= 3) {
                            startPage = 2;
                            endPage = 4;
                          }

                          if (currentPage >= totalPages - 2) {
                            startPage = totalPages - 3;
                            endPage = totalPages - 1;
                          }

                          if (startPage > 2) pages.push("...");

                          for (let i = startPage; i <= endPage; i++) {
                            if (i > 1 && i < totalPages) {
                              pages.push(i);
                            }
                          }

                          if (endPage < totalPages - 1) pages.push("...");

                          pages.push(totalPages);
                        }

                        return pages.map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-1 text-gray-500 dark:text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded-lg transition-colors ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          ),
                        );
                      })()}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        »
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommonListViewTable;
