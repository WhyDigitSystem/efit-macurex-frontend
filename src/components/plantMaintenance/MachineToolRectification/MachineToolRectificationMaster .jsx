import { useState } from "react";
import MachineToolRectificationList from "./MachineToolRectificationList";
import MachineToolRectificationForm from "./MachineToolRectificationForm";

const MachineToolRectificationMaster = () => {
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
      await machineToolRectificationAPI.updateCreateMachineToolRectification(
        payload,
      ); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving machine/tool rectification:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <MachineToolRectificationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <MachineToolRectificationForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default MachineToolRectificationMaster;
