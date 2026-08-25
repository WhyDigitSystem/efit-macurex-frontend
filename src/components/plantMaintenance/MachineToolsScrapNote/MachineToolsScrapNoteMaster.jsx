import { useState } from "react";
import MachineToolsScrapNoteList from "./MachineToolsScrapNoteList";
import MachineToolsScrapNoteForm from "./MachineToolsScrapNoteForm";


const MachineToolsScrapNoteMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

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
  };

  const handleSave = async (payload) => {
    try {
      await machineToolsScrapNoteAPI.updateCreateMachineToolsScrapNote(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving machine tools scrap note:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <MachineToolsScrapNoteList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
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
