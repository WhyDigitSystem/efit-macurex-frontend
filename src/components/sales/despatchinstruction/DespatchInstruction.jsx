import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DispatchList from "./DispatchList";
import DispatchForm from "./DispatchForm";

const DespatchInstruction = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // This will be called from DispatchList with the full record from getDispatchById
  const handleEdit = useCallback((fullRecord) => {
    setEditData(fullRecord);
    setView("form");
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

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