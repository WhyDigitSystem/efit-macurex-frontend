import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import MaterialPlanningList from "./MaterialPlanningList";
import MaterialPlanningForm from "./MaterialPlanningForm";
import materialPlanningAPI from "../../../api/PPC/materialPlanningAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the shape the form expects      */

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active,
    cancel: src.cancel,
    cancelRemarks: src.cancelRemarks ?? "",
    createdBy: src.createdBy,
    updatedBy: src.updatedBy,

    header: {
      docNo: src.docId ?? "",
      docDate: src.docDate ?? "",
      fromDate: src.fromDate ?? "",
      // only include toDate when backend actually has a value,
      // otherwise the form's emptyHeader() default kicks in
      ...(src.toDate ? { toDate: src.toDate } : {}),
      mrpType: src.mrpType ?? "",
    },
  };
};

/* ------------------------------------------------------------------ */

const MaterialPlanningMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil click → fetch fresh record by id, shape it, open form
  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Invalid record");
      return;
    }

    try {
      const fresh = await materialPlanningAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error("Failed to fetch material planning for edit:", error);
      toast.error("Failed to load Material Planning details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button → return to the PPC module home.
  const handleNavigateHome = () => {
    navigate("/ppc");
  };

  if (view === "form") {
    return <MaterialPlanningForm data={editData} onBack={handleBack} />;
  }

  return (
    <MaterialPlanningList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default MaterialPlanningMaster;