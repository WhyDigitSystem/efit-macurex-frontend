import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierRateContractList from "./SupplierRateContractList";
import SupplierRateContractForm from "./SupplierRateContractForm";
import supplierRateContractAPI from "../../../api/SubContract/supplierRateContractAPI";
import { useToast } from "../../Toast/ToastContext";

const SupplierRateContractMaster = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by ID using getSupplierRateContractById
  const handleEdit = useCallback(
    async (row) => {
      if (!row?.id) {
        addToast("Invalid record ID", "error");
        return;
      }

      try {
        setLoading(true);
        // Fetch the complete data by ID
        const response = await supplierRateContractAPI.getSupplierRateContractById(row.id);
        console.log("Edit API Response:", response);

        // Extract the data from the response
        let freshData = null;
        if (response?.paramObjectsMap?.supplierRateContract) {
          freshData = response.paramObjectsMap.supplierRateContract;
        } else if (response?.data?.paramObjectsMap?.supplierRateContract) {
          freshData = response.data.paramObjectsMap.supplierRateContract;
        } else if (response?.supplierRateContract) {
          freshData = response.supplierRateContract;
        }

        if (freshData) {
          setEditData(freshData);
          setView("form");
        } else {
          addToast("Failed to load supplier rate contract details", "error");
        }
      } catch (error) {
        console.error("Failed to fetch supplier rate contract for edit:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to load supplier rate contract details";
        addToast(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sub Contract module home.
  // (Form's back button goes back to the list via handleBack.)
  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (view === "form") {
    return <SupplierRateContractForm data={editData} onBack={handleBack} />;
  }

  return (
    <SupplierRateContractList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SupplierRateContractMaster;