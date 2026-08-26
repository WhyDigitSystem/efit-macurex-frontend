import { useCallback, useState } from "react";
import SalesReturnList from "./SalesReturnList";
import SalesReturnForm from "./SalesReturnForm";
import salesReturnAPI from "../../../api/Sales/salesReturnAPI";
import { useToast } from "../../Toast/ToastContext";

const SalesReturnMaster = () => {
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const { addToast } = useToast();

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
        const response = await salesReturnAPI.getSalesReturnById(row.id);
        const fresh = response?.paramObjectsMap?.salesReturnResponseVO || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch sales return for edit:", error);
        addToast("Failed to load Sales Return details", "error");
      } finally {
        setLoadingEdit(false);
      }
    },
    [ORG_ID],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  if (view === "form") {
    return <SalesReturnForm data={editData} onBack={handleBack} />;
  }

  return (
    <SalesReturnList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SalesReturnMaster;
