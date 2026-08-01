import { useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { qtyShortageReportAPI } from "../../../api/Inventory/qtyShortageReportAPI";
import { toast } from "../../../utils/toast";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens (matches other master forms in this app)               */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ITEMS_PER_PAGE = 10;

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

const QtyShortageReport = () => {
  const ORG_ID = localStorage.getItem("orgId");

  const [filters, setFilters] = useState(emptyFilters());
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);

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
    setSortKey(null);
    setSortDir("asc");
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;

    const col = COLUMNS.find((c) => c.key === sortKey);

    return [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      let cmp;
      if (col?.numeric) {
        cmp = (Number(aVal) || 0) - (Number(bVal) || 0);
      } else {
        cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / ITEMS_PER_PAGE));
  const pageStart =
    totalRows === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalRows);
  const pageRows = sortedRows.slice(pageStart - 1, pageEnd);

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
    <div className="p-2 max-w-6xl">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
        Report For Qty Shortage
      </h2>

      {/* ---------------- Filter bar ---------------- */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
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

      {/* ---------------- Results ---------------- */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Report For Qty Shortage
          </h3>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Rows: {pageStart}-{pageEnd} of {totalRows}
          </span>
        </div>

        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="p-1.5 text-left font-medium text-gray-600 dark:text-gray-200 whitespace-nowrap cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          sortKey === col.key
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        } ${
                          sortKey === col.key && sortDir === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="p-4 text-center text-gray-400"
                  >
                    Loading report...
                  </td>
                </tr>
              )}

              {!loading && !hasSearched && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="p-4 text-center text-gray-400"
                  >
                    Set your filters and click Search to view the report.
                  </td>
                </tr>
              )}

              {!loading && hasSearched && pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="p-4 text-center text-gray-400"
                  >
                    No shortage records found for the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                pageRows.map((row, idx) => (
                  <tr
                    key={row.id ?? idx}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="p-1.5 text-gray-700 dark:text-gray-200 whitespace-nowrap"
                      >
                        {row[col.key] ?? "--"}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRows > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QtyShortageReport;
