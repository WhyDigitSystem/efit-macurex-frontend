import { useState } from "react";
import UnitMasterList from "./UnitMasterList";
import UnitMasterForm from "./UnitMasterForm";

const UnitMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    console.log("=== PARENT: EDIT TRIGGERED ===");
    console.log("Data received from list:", data);

    // Store the entire object or just the ID
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <UnitMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <UnitMasterForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default UnitMaster;