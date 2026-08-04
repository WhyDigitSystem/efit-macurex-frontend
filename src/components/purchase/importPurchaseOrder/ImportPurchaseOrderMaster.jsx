import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImportPurchaseOrderList from "./ImportPurchaseOrderList";
import ImportPurchaseOrderForm from "./ImportPurchaseOrderForm";
import importPurchaseOrderAPI from "../../../api/Purchase/importPurchaseOrderAPI";
import { toast } from "../../../utils/toast";

const ImportPurchaseOrderMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by orgId, find the matching PO, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const orders = await importPurchaseOrderAPI.getByOrgId(ORG_ID);
        const fresh = orders.find((o) => o.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch import purchase order for edit:", error);
        toast.error("Failed to load Import Purchase Order details");
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

  // List screen back button -> return to the Purchase module home.
  const handleNavigateHome = () => {
    navigate("/purchase");
  };

  if (view === "form") {
    return <ImportPurchaseOrderForm data={editData} onBack={handleBack} />;
  }

  return (
    <ImportPurchaseOrderList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ImportPurchaseOrderMaster;