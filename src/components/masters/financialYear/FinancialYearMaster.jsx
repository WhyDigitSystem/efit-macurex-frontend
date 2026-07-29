import { useCallback, useState } from "react";
import FinancialYearMasterList from "./FinancialYearMasterList";
import FinancialYearMasterForm from "./FinancialYearMasterForm";
import { financialYearAPI } from "../../../api/financialYearAPI";
import { toast } from "../../../utils/toast";

const FinancialYearMasterPage = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh record by id, open form
  const handleEdit = useCallback(async (row) => {
    try {
      setLoadingEdit(true);
      const fresh = await financialYearAPI.getFinancialYearById(row.id);
      setEditData(fresh || row);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch financial year for edit:", error);
      toast.error("Failed to load financial year details");
      setEditData(row); // fall back to row data from the list
      setView("form");
    } finally {
      setLoadingEdit(false);
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  if (view === "form") {
    return <FinancialYearMasterForm data={editData} onBack={handleBack} />;
  }

  return (
    <FinancialYearMasterList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default FinancialYearMasterPage;
