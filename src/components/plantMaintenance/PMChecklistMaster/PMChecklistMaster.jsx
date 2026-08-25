import { useState } from "react";
import PMChecklistMasterList from "./PMChecklistMasterList";
import PMChecklistMasterForm from "./PMChecklistMasterForm";

const PMChecklistMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedChecklist(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (checklist) => {
    setSelectedChecklist(checklist);
    setEditId(checklist.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedChecklist(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <PMChecklistMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <PMChecklistMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedChecklist}
          editId={editId}
        />
      )}
    </>
  );
};

export default PMChecklistMaster;
