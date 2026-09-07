import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import OpeningStockEntryList from "./OpeningStockEntryList";
import OpeningStockEntryForm from "./OpeningStockEntryForm";
import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { toast } from "../../../utils/toast";

const OpeningStockEntryMaster = () => {
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

  // Pencil icon click -> fetch fresh data by id, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const record = await openingStockEntryAPI.getById(row?.id);
        setEditData(record || row);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch opening stock entry for edit:", error);
        toast.error("Failed to load Opening Stock Entry details");
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

  // List screen back button -> return to the Inventory module home.
  const handleNavigateHome = () => {
    navigate("/inventory");
  };

  if (view === "form") {
    return <OpeningStockEntryForm data={editData} onBack={handleBack} />;
  }

  return (
    <OpeningStockEntryList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default OpeningStockEntryMaster;