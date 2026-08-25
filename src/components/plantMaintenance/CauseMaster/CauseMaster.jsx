import { useState } from "react";
import CauseMasterList from "./CauseMasterList";
import CauseMasterForm from "./CauseMasterForm";

const CauseMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedCause, setSelectedCause] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedCause(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (cause) => {
    setSelectedCause(cause);
    setEditId(cause.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCause(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <CauseMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <CauseMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedCause}
          editId={editId}
        />
      )}
    </>
  );
};

export default CauseMaster;
