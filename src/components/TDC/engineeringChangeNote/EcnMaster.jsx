import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import EcnList from "./EcnList";
import EcnForm from "./EcnForm";
import engineeringChangeNoteAPI from "../../../api/TDC/engineeringChangeNoteAPI";
import { useToast } from "../../Toast/ToastContext";

const EcnMaster = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch the single record fresh by id, then open the form.
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh = await engineeringChangeNoteAPI.getEcnById(row.id);
        setEditData(fresh || row);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch ECN for edit:", error);
        addToast("Failed to load Engineering Change Note details", "error");

        // Fall back to the row data already in the list rather than blocking the user.
        setEditData(row);
        setView("form");
      }
    },
    [addToast],
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
    return <EcnForm data={editData} onBack={handleBack} />;
  }

  return (
    <EcnList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default EcnMaster;
