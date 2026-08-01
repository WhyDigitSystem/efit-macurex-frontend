import { useCallback, useEffect, useState } from "react";
import taxDefinitionAPI from "../../../api/taxDefinitionAPI";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const formatDate = (val) => {
  if (!val) return "";
  // Normalizes an ISO date ("2026-07-31") to dd/mm/yyyy for display
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    const [y, m, d] = val.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  return val;
};

const TaxDefinationList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [taxData, setTaxData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [moduleMap, setModuleMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  const ORG_ID = Number(localStorage.getItem("orgId"));

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

  // Load module list, used only to translate module id -> readable label.
  // FIX: listOfValuesAPI.getListValuesGroup now needs (listCode, branchId, orgId) —
  // there's no per-group backend endpoint, it filters the full
  // getListOfValuesByOrgId response client-side. Needs a branch selected first.
  const loadModules = useCallback(async () => {
    if (!selectedBranch) {
      setModuleMap({});
      return;
    }

    try {
      const values = await listOfValuesAPI.getListValuesGroup(
        "MODULE",
        selectedBranch,
        ORG_ID,
      );

      const map = {};
      values.forEach((v) => {
        map[String(v.value)] = v.label;
      });
      setModuleMap(map);
    } catch (error) {
      console.error("Failed to load modules:", error);
    }
  }, [selectedBranch, ORG_ID]);

  // Load tax definitions by branch
  const loadTaxDefinitions = useCallback(async () => {
    if (!selectedBranch) {
      setTaxData([]);
      return;
    }

    try {
      setLoading(true);

      const taxList = await taxDefinitionAPI.getTaxDefinitionByOrgId(
        selectedBranch,
        ORG_ID,
      );

      const formattedData = (taxList || [])
        .map((item) => ({
          ...item,
          isActive: item.active === true || item.active === "Active",
          // Module may come back either as a nested { id, valueDescription }
          // object, or as a plain id — fall back to moduleMap for the latter.
          module:
            item.module && typeof item.module === "object"
              ? item.module.valueDescription ||
                item.module.valuesDescription ||
                ""
              : moduleMap[String(item.module)] || "",
          effectiveDate: formatDate(item.effectiveDate),
          createdOn: formatDate(item.docDate || item.createdOn),
          fillCopyOf: item.fillCopyOF || item.fillCopyOf || "",
        }))
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setTaxData(formattedData);
    } catch (error) {
      console.error("Failed to load tax definitions:", error);
      setTaxData([]);
      toast.error("Failed to fetch tax definitions");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, ORG_ID, moduleMap]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  useEffect(() => {
    loadTaxDefinitions();
  }, [loadTaxDefinitions, refreshTrigger]);

  // Pass only the id up — the Form now always refetches the FULL record by
  // id when editing, so partial/flattened list-row data is never relied on.
  const handleEdit = (tax) => {
    onEdit({ id: tax.id });
  };

  const columns = [
    {
      key: "taxNo",
      label: "Tax No",
      accessor: "taxNo",
      type: "text",
      noWrap: true,
    },
    {
      key: "taxDescription",
      label: "Tax Description",
      accessor: "taxDescription",
      type: "text",
    },
    {
      key: "module",
      label: "Module",
      accessor: "module",
      type: "text",
    },
    {
      key: "effectiveDate",
      label: "Effective Date",
      accessor: "effectiveDate",
      type: "text",
      noWrap: true,
    },
    {
      key: "createdOn",
      label: "Created On",
      accessor: "createdOn",
      type: "text",
      noWrap: true,
    },
    {
      key: "fillCopyOf",
      label: "Fill Copy Of",
      accessor: "fillCopyOf",
      type: "text",
    },
    {
      key: "isActive",
      label: "Status",
      accessor: "isActive",
      type: "status",
      statusVariants: {
        true: {
          label: "Active",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        },
        false: {
          label: "Inactive",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        },
      },
    },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "center",
      width: "90px",
    },
  ];

  const searchFields = ["taxNo", "taxDescription", "module", "fillCopyOf"];

  const filterOptions = [
    {
      value: "all",
      label: "All",
      field: null,
    },
    {
      value: "active",
      label: "Active",
      field: "isActive",
      filterValue: "active",
      activeValue: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
      field: "isActive",
      filterValue: "inactive",
      activeValue: "Active",
    },
  ];

  // Branch dropdown, rendered inside CommonListViewTable's header row
  // (next to the search box) via the customHeaderActions slot.
  const branchDropdown = (
    <select
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
      className="
        w-full sm:w-48
        px-2 py-1.5 rounded-md border text-sm
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        border-gray-300 dark:border-gray-600
        focus:outline-none
        focus:ring-2 focus:ring-blue-500
        disabled:opacity-50
      "
      disabled={branchLoading}
    >
      <option
        value=""
        className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      >
        Select Branch
      </option>

      {branches.map((branch) => (
        <option
          key={branch.id}
          value={branch.id}
          className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        >
          {branch.branchName}
        </option>
      ))}
    </select>
  );

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Tax Definition"
        data={taxData}
        loading={loading}
        columns={columns}
        searchFields={searchFields}
        filterOptions={filterOptions}
        defaultFilter="all"
        onBack={onBack}
        onAddNew={onAddNew}
        onEdit={handleEdit}
        onView={false}
        showSerialNumber={true}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        defaultItemsPerPage={10}
        emptyMessage={
          selectedBranch
            ? "No Tax Definition records found"
            : "Select branch to load Tax Definitions"
        }
        loadingMessage="Loading Tax Definition records..."
        enableRefresh={true}
        onRefresh={loadTaxDefinitions}
        enableExport={true}
        exportFileName="Tax_Definition_Master"
        customHeaderActions={branchDropdown}
      />
    </div>
  );
};

export default TaxDefinationList;
