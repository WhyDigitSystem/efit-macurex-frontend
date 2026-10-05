import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseContractAmendmentForm from "./PurchaseContractAmendmentForm";
import PurchaseContractAmendmentList from "./PurchaseContractAmendmentList";
import purchaseContractAmendmentAPI from "../../../api/Purchase/purchaseContractAmendmentAPI";
import { useToast } from "../../Toast/ToastContext";

const PurchaseContractAmendmentMaster = () => {
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
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh = await purchaseContractAmendmentAPI.getById(row.id);
        setEditData(fresh || row);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch PC amendment for edit:", error);
        addToast("Failed to load PC amendment details", "error");
      }
    },
    [addToast],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> Purchase module home
  const handleNavigateHome = () => {
    navigate("/purchase");
  };

  if (view === "form") {
    return (
      <PurchaseContractAmendmentForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <PurchaseContractAmendmentList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default PurchaseContractAmendmentMaster;
