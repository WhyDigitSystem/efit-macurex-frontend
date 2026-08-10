import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import QualityScrapNoteList from "./QualityScrapNoteList";
import QualityScrapNoteForm from "./QualityScrapNoteForm";
import qualityScrapNoteAPI from "../../../api/quality/qualityScrapNoteAPI";
import { toast } from "../../../utils/toast";

const QualityScrapNoteMaster = () => {
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
        const records = await qualityScrapNoteAPI.getQualityScrapNoteByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch Quality Scrap Note for edit:", error);
        toast.error("Failed to load Quality Scrap Note details");
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

  // List screen back button -> return to the Quality module home.
  const handleNavigateHome = () => {
    navigate("/quality");
  };

  if (view === "form") {
    return (
      <QualityScrapNoteForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <QualityScrapNoteList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default QualityScrapNoteMaster;
