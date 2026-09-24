import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DrawingAttachmentList from "./DrawingAttachmentList";
import DrawingAttachmentForm from "./DrawingAttachmentForm";
import drawingAttachmentAPI from "../../../api/PPC/drawingAttachmentAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active === true || src.active === "Active",

    header: {
      typeOfItem: src.typeOfItem?.id ?? "",
      fgPartNo: src.fgPartNo?.id ?? "",
      fgPartDescription:
        src.fgPartDescription || src.fgPartNo?.itemDescription || "",
    },

    attachments: (src.drawingAttachmentDetailResponseDTO || []).map((d) => ({
      id: d.id ?? "",
      name: d.name ?? "",
      fileName: d.fileName ?? "",
      filePath: d.filePath ?? "",
      fileSize: d.fileSize ?? 0,
      contentType: d.contentType ?? "",
      uploadOn: d.uploadOn ?? "",
    })),
  };
};

/* ------------------------------------------------------------------ */

const DrawingAttachmentMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil click → fetch fresh record by id, reshape, open form
  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Invalid record");
      return;
    }

    try {
      const fresh = await drawingAttachmentAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error("Failed to fetch drawing attachment for edit:", error);
      toast.error("Failed to load Drawing Attachment details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

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