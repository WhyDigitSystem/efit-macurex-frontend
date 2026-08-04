import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DcForCapitalItemsList from "./DcForCapitalItemsList";
import DcForCapitalItemsForm from "./DcForCapitalItemsForm";
import dcForCapitalItemsAPI from "../../../api/dcForCapitalItemsAPI";
import { toast } from "../../../utils/toast";

const DcForCapitalItemsMaster = () => {
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

  // Pencil icon click -> fetch fresh data by orgId, find the matching record, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const records =
          await dcForCapitalItemsAPI.getDcForCapitalItemsByOrgId(
            ORG_ID,
            BRANCH_ID,
          );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch DC for capital items for edit:", error);
        toast.error("Failed to load DC for capital items details");
      }
    },
    [ORG_ID, BRANCH_ID],
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

  if (view === "form") {
    return <DcForCapitalItemsForm data={editData} onBack={handleBack} />;
  }

  return (
    <DcForCapitalItemsList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default DcForCapitalItemsMaster;