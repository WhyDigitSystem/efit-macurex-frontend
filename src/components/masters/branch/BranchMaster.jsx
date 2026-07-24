import { useCallback, useState } from "react";
import BranchMasterList from "./BranchList";
import BranchMasterForm from "./BranchMasterForm";
import { branchAPI } from "../../../api/branchAPI";
import { toast } from "../../../utils/toast";

const BranchMasterPage = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching branch, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
        const branches = await branchAPI.getBranchByOrgId(ORG_ID);
        const fresh = branches.find((b) => b.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch branch for edit:", error);
        toast.error("Failed to load branch details");
      } finally {
        setLoadingEdit(false);
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

  if (view === "form") {
    return <BranchMasterForm data={editData} onBack={handleBack} />;
  }

  return (
    <BranchMasterList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default BranchMasterPage;
