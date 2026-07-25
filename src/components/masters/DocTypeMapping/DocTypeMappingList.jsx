import { useCallback, useEffect, useMemo, useState } from "react";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
import branchAPI from "../../../api/branchAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

// How many years back/forward to show in the Year filter dropdown
const YEARS_BACK = 5;
const YEARS_FORWARD = 2;

const DocTypeMappingList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [mappingData, setMappingData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

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

  // Load branches
  const loadBranches = useCallback(async () => {
    try {
      setBranchLoading(true);

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      setBranches(response || []);
    } catch (error) {
      console.error("Failed to load branches:", error);
      toast.error("Failed to fetch branches");
    } finally {
      setBranchLoading(false);
    }
  }, [ORG_ID]);

  // Load doc type mappings by branch + year
  const loadMappings = useCallback(async () => {
    if (!selectedBranch || !selectedYear) {
      setMappingData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await docTypeMappingAPI.getDocTypeMappingByOrgId(
        selectedBranch,
        selectedYear,
        ORG_ID,
      );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setMappingData(sortedData);
    } catch (error) {
      console.error("Failed to load doc type mappings:", error);
      setMappingData([]);
      toast.error("Failed to fetch doc type mappings");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, selectedYear, ORG_ID]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings, refreshTrigger]);

  const columns = [
    {
      key: "screenName",
      label: "Screen Name",
      accessor: "screenName",
      type: "text",
    },
    {
      key: "screenCode",
      label: "Screen Code",
      accessor: "screenCode",
      type: "text",
    },
    {
      key: "docCode",
      label: "Doc Code",
      accessor: "docCode",
      type: "text",
    },
    {
      key: "prefix",
      label: "Prefix",
      accessor: "prefix",
      type: "text",
    },
    {
      key: "branch",
      label: "Branch",
      accessor: "branch",
      type: "text",
    },
    {
      key: "year",
      label: "Year",
      accessor: "year",
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

  const searchFields = ["screenName", "screenCode", "docCode", "prefix"];

  // Branch + Year filters, rendered inside CommonListViewTable's header row
  // (next to the search box) via the customHeaderActions slot.
  const headerFilters = (
    <div className="flex items-center gap-2">
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        className="
          w-full sm:w-44
          px-3 py-1.5 rounded-md border text-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border-gray-300 dark:border-gray-600
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
          disabled:opacity-50
        "
        disabled={branchLoading}
      >
        <option value="">Select Branch</option>

        {branches.map((branch) => (
          <option key={branch.id} value={branch.branchCode}>
            {branch.branchName} ({branch.branchCode})
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
        title="Doc Type Mapping"
        data={mappingData}
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
          selectedBranch && selectedYear
            ? "No Doc Type Mappings found"
            : "Select branch and year to load mappings"
        }
        loadingMessage="Loading Doc Type Mappings..."
        enableRefresh={true}
        onRefresh={loadMappings}
        enableExport={true}
        exportFileName="DocTypeMappings"
        customHeaderActions={headerFilters}
      />
    </div>
  );
};

export default DocTypeMappingList;
