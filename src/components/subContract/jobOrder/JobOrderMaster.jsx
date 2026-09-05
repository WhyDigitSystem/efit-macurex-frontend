import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobOrderList from "./JobOrderList";
import JobOrderForm from "./JobOrderForm";
import jobOrderAPI from "../../../api/SubContract/jobOrderAPI";
import { useToast } from "../../Toast/ToastContext";

const JobOrderMaster = () => {
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

  // Pencil icon click -> fetch fresh data by ID using getJobOrderById
  const handleEdit = useCallback(
    async (row) => {
      if (!row?.id) {
        addToast("Invalid record ID", "error");
        return;
      }

      try {
        setLoading(true);
        // Fetch the complete data by ID
        const response = await jobOrderAPI.getJobOrderById(row.id);
        console.log("Job Order Edit API Response:", response);

        // Extract the data from the response structure
        let freshData = null;
        if (response?.paramObjectsMap?.jobOrder) {
          freshData = response.paramObjectsMap.jobOrder;
        } else if (response?.data?.paramObjectsMap?.jobOrder) {
          freshData = response.data.paramObjectsMap.jobOrder;
        } else if (response?.jobOrder) {
          freshData = response.jobOrder;
        }

        if (freshData) {
          setEditData(freshData);
          setView("form");
        } else {
          addToast("Failed to load job order details", "error");
        }
      } catch (error) {
        console.error("Failed to fetch job order for edit:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to load job order details";
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
    return <JobOrderForm data={editData} onBack={handleBack} />;
  }

  return (
    <JobOrderList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default JobOrderMaster;