import { useState } from "react";
import UnitConversionMasterList from "./UnitConversionMasterList";
import UnitConversionMasterForm from "./UnitConversionMasterForm";

const UnitConversionMaster = () => {
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
        <UnitConversionMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <UnitConversionMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default UnitConversionMaster;