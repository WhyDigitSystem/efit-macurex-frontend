import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdvEntryList from "./AdvEntryList";
import AdvEntryForm from "./AdvEntryForm";

const AdvEntryMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pass only the id — the form fetches the full record itself.
  const handleEdit = useCallback((row) => {
    setEditData({ id: row?.id });
    setView("form");
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return <AdvEntryForm data={editData} onBack={handleBack} />;
  }

  return (
    <AdvEntryList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default AdvEntryMaster;