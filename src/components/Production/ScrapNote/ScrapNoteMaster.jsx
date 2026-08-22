import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrapNoteList from "./ScrapNoteList";
import ScrapNoteForm from "./ScrapNoteForm";
import scrapNoteAPI from "../../../api/Production/scrapNoteAPI";
import { toast } from "../../../utils/toast";

const ScrapNoteMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch the record by id, then open the form
  const handleEdit = useCallback(async (row) => {
    try {
      const fresh = (await scrapNoteAPI.getById(row.id)) || row;
      setEditData(fresh);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch Scrap Note for edit:", error);
      toast.error("Failed to load Scrap Note details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Production module home.
  const handleNavigateHome = () => {
    navigate("/production");
  };

  if (view === "form") {
    return <ScrapNoteForm data={editData} onBack={handleBack} />;
  }

  return (
    <ScrapNoteList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ScrapNoteMaster;