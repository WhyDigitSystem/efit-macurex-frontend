import { useState } from "react";
import ProcessValidationEntryList from "./loadProcessValidationEntries";
import ProcessValidationEntryForm from "./ProcessValidationEntryForm";

const ProcessValidationEntryMaster = () => {
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
      await processValidationEntryAPI.updateCreateProcessValidationEntry(
        payload,
      ); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving process validation entry:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <ProcessValidationEntryList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ProcessValidationEntryForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ProcessValidationEntryMaster;
