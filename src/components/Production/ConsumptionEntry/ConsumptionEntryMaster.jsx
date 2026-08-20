import { useState } from "react";
import ConsumptionEntryList from "./ConsumptionEntryList";
import ConsumptionEntryForm from "./ConsumptionEntryForm";

const ConsumptionEntryMaster = () => {
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
      await consumptionEntryAPI.updateCreateConsumptionEntry(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving consumption entry:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <ConsumptionEntryList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ConsumptionEntryForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ConsumptionEntryMaster;
