import { useCallback, useEffect, useState } from "react";
import transportAPI from "../../../api/transportAPI";
import branchAPI from "../../../api/branchAPI";
import CommonListViewTable from "../../../utils/CommonListViewTable";
import { toast } from "../../../utils/toast";

const TransportMasterList = ({ onAddNew, onEdit, onBack, refreshTrigger }) => {
  const [transportData, setTransportData] = useState([]);
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

  // Load transports by branch
  const loadTransports = useCallback(async () => {
    if (!selectedBranch) {
      setTransportData([]);
      return;
    }

    try {
      setLoading(true);

      const response = await transportAPI.getTransportByOrgId(
        selectedBranch,
        ORG_ID,
      );

      const formattedData = (response || [])
        .map((item) => ({
          ...item,
          branch: item.branch?.branchName || "",
          branchCode: item.branch?.branchCode || "",
        }))
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      setTransportData(formattedData);
    } catch (error) {
      console.error("Failed to load transports:", error);
      setTransportData([]);
      toast.error("Failed to fetch transports");
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, ORG_ID]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    loadTransports();
  }, [loadTransports, refreshTrigger]);

  const columns = [
    {
      key: "transportName",
      label: "Transport Name",
      accessor: "transportName",
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
      key: "address",
      label: "Address",
      accessor: "address",
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

  const searchFields = ["transportName", "branch", "branchCode", "address"];

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
        title="Transport"
        data={transportData}
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
            ? "No Transports found"
            : "Select branch to load transports"
        }
        loadingMessage="Loading Transports..."
        enableRefresh={true}
        onRefresh={loadTransports}
        enableExport={true}
        exportFileName="Transports"
        customHeaderActions={branchDropdown}
      />
    </div>
  );
};

export default TransportMasterList;
