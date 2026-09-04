import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EcrList from "./EcrList";
import EcrForm from "./EcrForm";
import engineeringChangeRecordAPI from "../../../api/TDC/engineeringChangeRecordAPI";

const EcrMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  const handleEdit = async (row) => {
    const id = row?.id ?? row?._raw?.id;
    if (!id) {
      setEditData(row?._raw || row);
      setView("form");
      return;
    }

    setLoadingEdit(true);
    try {
      const record = await engineeringChangeRecordAPI.getEcrById(id);
      setEditData(record);
      setView("form");
    } catch (error) {
      console.error("Failed to load Engineering Change Record details:", error);
      setEditData(row?._raw || row);
      setView("form");
    } finally {
      setLoadingEdit(false);
    }
  };

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
    return <EcrForm data={editData} onBack={handleBack} />;
  }

  return (
    <EcrList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
      loadingEdit={loadingEdit}
    />
  );
};

export default EcrMaster;
