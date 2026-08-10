import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SetUpApprovalList from "./SetUpApprovalList";
import SetUpApprovalForm from "./SetUpApprovalForm";
import setUpApprovalAPI from "../../../api/quality/setUpApprovalAPI";
import { toast } from "../../../utils/toast";

const SetUpApprovalMaster = () => {
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

  // Pencil icon click -> fetch the record by id, then open the form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh =
          (await setUpApprovalAPI.getSetUpApprovalById(row.id)) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch set up approval for edit:", error);
        toast.error("Failed to load Set Up Approval details");
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

  // List screen back button -> return to the Quality module home.
  const handleNavigateHome = () => {
    navigate("/quality");
  };

  if (view === "form") {
    return <SetUpApprovalForm data={editData} onBack={handleBack} />;
  }

  return (
    <SetUpApprovalList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SetUpApprovalMaster;
