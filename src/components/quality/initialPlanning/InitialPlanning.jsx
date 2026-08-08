import { useState } from "react";
import InitialPlanningList from "./InitialPlanningList";
import InitialPlanningForm from "./InitialPlanningForm";

const InitialPlanning = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedPlanning(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (planning) => {
    setSelectedPlanning(planning);
    setEditId(planning.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedPlanning(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <InitialPlanningList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <InitialPlanningForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedPlanning}
          editId={editId}
        />
      )}
    </>
  );
};

export default InitialPlanning;
