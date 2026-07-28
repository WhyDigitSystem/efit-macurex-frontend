import { useCallback, useEffect, useState } from "react";
import documentTypeAPI from "../../../api/docTypeAPI";
import branchAPI from "../../../api/branchAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const DocumentTypeMasterList = ({
  onAddNew,
  onEdit,
  onBack,
  refreshTrigger,
}) => {
  const [documentTypeData, setDocumentTypeData] = useState([]);
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

  // Load document types
  const loadDocumentTypes = useCallback(async () => {
    if (!selectedBranch) {
      setDocumentTypeData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await documentTypeAPI.getDocumentTypeByOrgId(
        selectedBranch,
        ORG_ID,
      );

      const sortedData = (response || []).sort(
        (a, b) => (b.id || 0) - (a.id || 0),
      );

      setDocumentTypeData(sortedData);
    } catch (error) {
      console.error("Failed to load document types:", error);
      setDocumentTypeData([]);
      toast.error("Failed to fetch document types");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, ORG_ID]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadDocumentTypes();
  }, [loadDocumentTypes, refreshTrigger]);

  const columns = [
    {
      key: "code",
      label: "Code",
      accessor: "code",
      type: "text",
    },
    {
      key: "name",
      label: "Name",
      accessor: "name",
      type: "text",
    },
    {
      key: "docCode",
      label: "Doc Code",
      accessor: "docCode",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      accessor: "description",
      type: "text",
    },
    {
      key: "financialYear",
      label: "Financial Year",
      accessor: "financialYear",
      type: "text",
    },
    {
      key: "branch",
      label: "Branch",
      accessor: (row) => row.branch?.branchName || "-",
      type: "text",
    },
    {
      key: "branchCode",
      label: "Branch Code",
      accessor: (row) => row.branch?.branchCode || "-",
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

  const searchFields = ["code", "name", "docCode", "description"];

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
      <option value="">Select Branch</option>

      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.branchName} ({branch.branchCode})
        </option>
      ))}
    </select>
  );

  return (
    <div className="h-full flex flex-col">
      <CommonListViewTable
        title="Document Type Master"
        data={documentTypeData}
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
            ? "No Document Types found"
            : "Select a branch to load document types"
        }
        loadingMessage="Loading Document Types..."
        enableRefresh={true}
        onRefresh={loadDocumentTypes}
        enableExport={true}
        exportFileName="DocumentTypeMaster"
        customHeaderActions={branchDropdown}
      />
    </div>
  );
};

export default DocumentTypeMasterList;
