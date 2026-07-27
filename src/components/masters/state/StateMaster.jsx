import { useState } from "react";
import StateMasterList from "./StateMasterList";
import StateMasterForm from "./StateMasterForm";
import stateAPI from "../../../api/stateAPI";

const StateMaster = () => {
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
      await stateAPI.createUpdateState(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving state:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <StateMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <StateMasterForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default StateMaster;