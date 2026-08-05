import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DrawingAttachmentList from "./DrawingAttachmentList";
import DrawingAttachmentForm from "./DrawingAttachmentForm";
import drawingAttachmentAPI from "../../../api/PPC/drawingAttachmentAPI";
import { toast } from "../../../utils/toast";

const DrawingAttachmentMaster = () => {
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
        const records = await drawingAttachmentAPI.getByOrgId(ORG_ID);
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch drawing attachment for edit:", error);
        toast.error("Failed to load Drawing Attachment details");
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
    return <DrawingAttachmentForm data={editData} onBack={handleBack} />;
  }

  return (
    <DrawingAttachmentList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default DrawingAttachmentMaster;