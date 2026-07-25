import { useCallback, useEffect, useState } from "react";
import docTypeAPI from "../../../api/docTypeAPI";
import branchAPI from "../../../api/branchAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DocTypeMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [docTypeData, setDocTypeData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

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

  // Load doc types by branch
  const loadDocTypes = useCallback(async () => {
    if (!selectedBranch) {
      setDocTypeData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await docTypeAPI.getDocTypeByOrgId(
        selectedBranch,
        ORG_ID,
      );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setDocTypeData(sortedData);
    } catch (error) {
      console.error("Failed to load doc types:", error);
      setDocTypeData([]);
      toast.error("Failed to fetch doc types");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, ORG_ID]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadDocTypes();
  }, [loadDocTypes, refreshTrigger]);

  const columns = [
    {
      key: "docTypeName",
      label: "Doc Type Name",
      accessor: "docTypeName",
      type: "text",
    },
    {
      key: "docTypeCode",
      label: "Doc Type Code",
      accessor: "docTypeCode",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      accessor: "description",
      type: "text",
    },
    {
      key: "branch",
      label: "Branch",
      accessor: "branch",
      type: "text",
    },
    {
      key: "branchCode",
      label: "Branch Code",
      accessor: "branchCode",
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

  const searchFields = ["docTypeName", "docTypeCode", "description", "branch"];

  // Branch dropdown, rendered inside CommonListViewTable's header row
  // (next to the search box) via the customHeaderActions slot.
  const branchDropdown = (
    <select
      value={selectedBranch}
      onChange={(e) => setSelectedBranch(e.target.value)}
      className="
        w-full sm:w-48
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
      <option
        value=""
        className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      >
        Select Branch
      </option>

      {branches.map((branch) => (
        <option
          key={branch.id}
          value={branch.branchCode}
          className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        >
          {branch.branchName} ({branch.branchCode})
        </option>
      ))}
    </select>
  );

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Document Type"
        data={docTypeData}
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
          selectedBranch
            ? "No Doc Types found"
            : "Select branch to load doc types"
        }
        loadingMessage="Loading Doc Types..."
        enableRefresh={true}
        onRefresh={loadDocTypes}
        enableExport={true}
        exportFileName="DocTypes"
        customHeaderActions={branchDropdown}
      />
    </div>
  );
};

export default DocTypeMasterList;
