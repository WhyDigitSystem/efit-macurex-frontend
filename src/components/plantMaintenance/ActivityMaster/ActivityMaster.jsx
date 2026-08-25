import { useState } from "react";
import ActivityMasterList from "./ActivityMasterList";
import ActivityMasterForm from "./ActivityMasterForm";

const ActivityMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedActivity(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setEditId(activity.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedActivity(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <ActivityMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <ActivityMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedActivity}
          editId={editId}
        />
      )}
    </>
  );
};

export default ActivityMaster;
