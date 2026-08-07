import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import InspectionRequisitionNoteList from "./InspectionRequisitionNoteList";
import InspectionRequisitionNoteForm from "./InspectionRequisitionNoteForm";
import inspectionRequisitionNoteAPI from "../../../api/TDC/inspectionRequisitionNoteAPI";
import { toast } from "../../../utils/toast";

const InspectionRequisitionNoteMaster = () => {
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
        const records = await inspectionRequisitionNoteAPI.getIrnByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch IRN for edit:", error);
        toast.error("Failed to load Inspection Requisition Note details");
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

  // List screen back button -> return to the TDC module home.
  const handleNavigateHome = () => {
    navigate("/TDC");
  };

  if (view === "form") {
    return <InspectionRequisitionNoteForm data={editData} onBack={handleBack} />;
  }

  return (
    <InspectionRequisitionNoteList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default InspectionRequisitionNoteMaster;
