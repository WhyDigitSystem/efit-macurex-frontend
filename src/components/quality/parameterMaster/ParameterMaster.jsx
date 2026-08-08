import { useState } from "react";
import ParameterMasterList from "./ParameterMasterList";
import ParameterMasterForm from "./ParameterMasterForm";

const ParameterMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedParameter(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (parameter) => {
    setSelectedParameter(parameter);
    setEditId(parameter.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedParameter(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <ParameterMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <ParameterMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedParameter}
          editId={editId}
        />
      )}
    </>
  );
};

export default ParameterMaster;
