import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TransferOrderList from "./TransferOrderList";
import TransferOrderForm from "./TransferOrderForm";
import transferOrderAPI from "../../../api/PPC/transferOrderAPI";
import { useToast } from "../../Toast/ToastContext";

const TransferOrderMaster = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Fetch fresh record by id when the pencil is clicked
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh = await transferOrderAPI.getById(row.id);
        setEditData(fresh || row);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch transfer order for edit:", error);
        addToast("Failed to load Transfer Order details", "error");
      }
    },
    [addToast]
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/ppc");
  };

  if (view === "form") {
    return <TransferOrderForm data={editData} onBack={handleBack} />;
  }

  return (
    <TransferOrderList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default TransferOrderMaster;