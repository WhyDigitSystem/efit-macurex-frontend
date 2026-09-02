import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseOrderAmendmentForm from "./PurchaseOrderAmendmentForm";
import PurchaseOrderAmendmentList from "./PurchaseOrderAmendmentList";
import purchaseOrderAmendmentAPI from "../../../api/Purchase/purchaseOrderAmendmentAPI";
import { useToast } from "../../Toast/ToastContext";

const PurchaseOrderAmendmentMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { addToast } = useToast();

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by id, open form in edit mode
  const handleEdit = useCallback(async (row) => {
    try {
      const fresh = await purchaseOrderAmendmentAPI.getById(row.id);
      setEditData(fresh || row);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch PO amendment for edit:", error);
      addToast("Failed to load PO amendment details", "error");
    }
  }, [addToast]);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Purchase module home.
  // (Form's back button goes back to the list via handleBack.)
  const handleNavigateHome = () => {
    navigate("/purchase");
  };

  if (view === "form") {
    return <PurchaseOrderAmendmentForm data={editData} onBack={handleBack} />;
  }

  return (
    <PurchaseOrderAmendmentList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default PurchaseOrderAmendmentMaster;
