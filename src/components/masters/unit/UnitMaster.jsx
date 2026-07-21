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
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default UnitMaster;