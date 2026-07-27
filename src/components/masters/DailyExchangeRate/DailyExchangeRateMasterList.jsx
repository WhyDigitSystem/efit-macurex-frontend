import { useCallback, useEffect, useMemo, useState } from "react";
import dailyExchangeRateAPI from "../../../api/dailyExchangeRateAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

// How many years back/forward to show in the Year filter dropdown
const YEARS_BACK = 5;
const YEARS_FORWARD = 2;

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const DailyExchangeRateMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [rateData, setRateData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [loading, setLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (
      let y = currentYear + YEARS_FORWARD;
      y >= currentYear - YEARS_BACK;
      y--
    ) {
      years.push(y);
    }
    return years;
  }, []);

  // Load exchange rates by month + year
  const loadRates = useCallback(async () => {
    if (!selectedMonth || !selectedYear) {
      setRateData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await dailyExchangeRateAPI.getExchangeRateByOrgId(
        selectedMonth,
        selectedYear,
        ORG_ID,
      );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setRateData(sortedData);
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
      setRateData([]);
      toast.error("Failed to fetch exchange rates");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, ORG_ID]);

  useEffect(() => {
    loadRates();
  }, [loadRates, refreshTrigger]);

  const columns = [
    {
      key: "currency",
      label: "Currency",
      accessor: "currency",
      type: "text",
    },
    {
      key: "currencyDesc",
      label: "Currency Desc",
      accessor: "currencyDesc",
      type: "text",
    },
    {
      key: "sellingExRate",
      label: "Selling Ex.Rate",
      accessor: "sellingExRate",
      type: "text",
    },
    {
      key: "buyingExRate",
      label: "Buying Ex.Rate",
      accessor: "buyingExRate",
      type: "text",
    },
    {
      key: "active",
      label: "Status",
      accessor: "active",
      type: "status",
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["currency", "currencyDesc"];

  // Month + Year filters, rendered inside CommonListViewTable's header row
  // (next to the search box) via the customHeaderActions slot.
  const headerFilters = (
    <div className="flex items-center gap-2">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="
          w-full sm:w-36
          px-3 py-1.5 rounded-md border text-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border-gray-300 dark:border-gray-600
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
        "
      >
        <option value="">Select Month</option>

        {MONTHS.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="
          w-full sm:w-28
          px-3 py-1.5 rounded-md border text-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border-gray-300 dark:border-gray-600
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
        "
      >
        <option value="">Select Year</option>

        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Daily Exchange Rate"
        data={rateData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={onEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage={
          selectedMonth && selectedYear
            ? "No Exchange Rates found"
            : "Select month and year to load exchange rates"
        }
        loadingMessage="Loading Exchange Rates..."
        enableRefresh={true}
        onRefresh={loadRates}
        enableExport={true}
        exportFileName="DailyExchangeRates"
        customHeaderActions={headerFilters}
      />
    </div>
  );
};

export default DailyExchangeRateMasterList;
