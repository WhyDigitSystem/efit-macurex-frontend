import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowLeft } from "lucide-react";
import { qtyShortageReportAPI } from "../../../api/Inventory/qtyShortageReportAPI";
import { toast } from "../../../utils/toast";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens (matches subContract module forms / CommonListViewTable) */

const controlClasses =
  "w-full py-1.5 px-3 text-sm border border-gray-300 dark:border-gray-600 " +
  "rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
  "focus:border-transparent";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 10;

/* ---------------------------------------------------------------------------- */
/* Columns shown in the results table                                          */

const COLUMNS = [
  { key: "grnNo", label: "GRN No." },
  { key: "supplierDcNo", label: "Supplier DC No" },
  { key: "supplierDcDate", label: "Supplier DC Date" },
  { key: "itemCode", label: "Item Code" },
  { key: "itemDescription", label: "Item Description" },
  { key: "unit", label: "Unit" },
  { key: "orderQty", label: "Order Qty", numeric: true },
  { key: "challanQty", label: "Challan Qty", numeric: true },
  { key: "receivedQty", label: "Received Qty", numeric: true },
  { key: "shortageQty", label: "Shortage Qty", numeric: true },
];

const emptyFilters = () => ({
  fromDate: "",
  toDate: "",
  partyName: "",
});

const formatNumber = (value) =>
  Number(value) || value === 0 ? Number(value).toLocaleString() : "--";

const QtyShortageReport = () => {
  const navigate = useNavigate();
  const ORG_ID = localStorage.getItem("orgId");

  const [filters, setFilters] = useState(emptyFilters());
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (
      filters.fromDate &&
      filters.toDate &&
      filters.toDate < filters.fromDate
    ) {
      toast.error("To Date cannot be before From Date");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      setCurrentPage(1);

      const data = await qtyShortageReportAPI.getQtyShortageReport({
        orgId: ORG_ID,
        ...filters,
      });

      setRows(data);
      setAppliedFilters({ ...filters });
    } catch (error) {
      console.error("Failed to load Qty Shortage report:", error);
      setRows([]);
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters(emptyFilters());
    setAppliedFilters(null);
    setRows([]);
    setHasSearched(false);
    setCurrentPage(1);
  };

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));
  const pageStart = totalRows === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEnd = Math.min(currentPage * itemsPerPage, totalRows);
  const pageRows = rows.slice(pageStart - 1, pageEnd);

  const totalShortage = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.shortageQty) || 0), 0),
    [rows],
  );

  const appliedChips = appliedFilters
    ? [
        appliedFilters.fromDate && {
          label: "From",
          value: appliedFilters.fromDate,
        },
        appliedFilters.toDate && { label: "To", value: appliedFilters.toDate },
        appliedFilters.partyName && {
          label: "Party",
          value: appliedFilters.partyName,
        },
      ].filter(Boolean)
    : [];

  return (
    <div className="p-3">
      {/* ---------------- Header ---------------- */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory")}
            className="flex items-center justify-center h-8 w-8 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-700 dark:text-gray-200">
              Report For Qty Shortage
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Filter by date range and party to view quantity shortages
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- Filter bar ---------------- */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-2 items-end">
            <div>
              <label className={labelClasses}>From Date</label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className={controlClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>To Date</label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className={controlClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Party Name</label>
              <input
                type="text"
                name="partyName"
                value={filters.partyName}
                onChange={handleFilterChange}
                placeholder="Search party..."
                className={controlClasses}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Search className="h-3 w-3" />
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>

          {/* Applied params chips */}
          {appliedChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                Params:
              </span>
              {appliedChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {chip.label}: {chip.value}
                </span>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  S.No
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                      col.numeric ? "text-right" : "text-left"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {loading && (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading report...
                  </td>
                </tr>
              )}

              {!loading && !hasSearched && (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Set your filters and click Search to view the report.
                  </td>
                </tr>
              )}

              {!loading && hasSearched && pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No shortage records found for the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                pageRows.map((row, idx) => (
                  <tr
                    key={row.id ?? idx}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-1.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {pageStart + idx}
                    </td>
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={`px-6 py-1.5 text-xs text-gray-900 dark:text-white whitespace-nowrap ${
                          col.numeric ? "text-right tabular-nums" : "text-left"
                        }`}
                      >
                        {col.numeric
                          ? formatNumber(row[col.key])
                          : (row[col.key] ?? "--")}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && hasSearched && rows.length > 0 && (
          <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Shortage Qty:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(totalShortage)}
                </span>
                <span className="mx-2">•</span>
                Showing {pageStart} to {pageEnd} of {totalRows} entries
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      «
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>

                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 3;

                      if (totalPages <= maxVisiblePages) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
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
                          if (i > 1 && i < totalPages) pages.push(i);
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
                            onClick={() => setCurrentPage(page)}
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QtyShortageReport;
