import { useState } from "react";
import MachineToolsScrapNoteList from "./MachineToolsScrapNoteList";
import MachineToolsScrapNoteForm from "./MachineToolsScrapNoteForm";

const MachineToolsScrapNoteMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
    setEditData(null);
    setRefreshTrigger((n) => n + 1);
  };

  // Form already persisted the record and calls onSave on success.
  // Here we only need to navigate back to the list.
  const handleSave = () => {
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <MachineToolsScrapNoteList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <MachineToolsScrapNoteForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default MachineToolsScrapNoteMaster;