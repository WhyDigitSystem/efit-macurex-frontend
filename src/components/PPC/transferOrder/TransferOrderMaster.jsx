import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransferOrderList from "./TransferOrderList";
import TransferOrderForm from "./TransferOrderForm";
import transferOrderAPI from "../../../api/PPC/transferOrderAPI";
import { toast } from "../../../utils/toast";

const TransferOrderMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by orgId, find the matching record, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const records = await transferOrderAPI.getByOrgId(ORG_ID);
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch transfer order for edit:", error);
        toast.error("Failed to load Transfer Order details");
      }
    },
    [ORG_ID],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the PPC module home.
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