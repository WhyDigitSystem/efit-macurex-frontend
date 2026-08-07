import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DispatchList from "./DispatchList";
import DispatchForm from "./DispatchForm";

const DespatchInstruction = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> open the form with the selected row's data
  const handleEdit = useCallback((row) => {
    setEditData(row);
    setView("form");
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sales module home.
  const handleNavigateHome = () => {
    navigate("/Sales");
  };

  if (view === "form") {
    return <DispatchForm data={editData} onBack={handleBack} />;
  }

  return (
    <DispatchList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default DespatchInstruction;
