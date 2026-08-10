import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesOrderShortCloseList from "./SalesOrderShortCloseList";
import SalesOrderShortCloseForm from "./SalesOrderShortCloseForm";
import salesOrderShortCloseAPI from "../../../api/Sales/salesOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const SalesOrderShortCloseMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch the record by id, then open the form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh =
          (await salesOrderShortCloseAPI.getSalesOrderShortCloseById(row.id)) ||
          row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch short-close for edit:", error);
        toast.error("Failed to load Sales Order Short-Close details");
      }
    },
    [],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sales module home.
  const handleNavigateHome = () => {
    navigate("/sales");
  };

  if (view === "form") {
    return (
      <SalesOrderShortCloseForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <SalesOrderShortCloseList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SalesOrderShortCloseMaster;
