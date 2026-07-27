import { useState } from "react";
import HsnSacMasterList from "./HsnSacMasterList";
import HsnSacMasterForm from "./HsnSacMasterForm";

const HsnSacMaster = () => {
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
        <HsnSacMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <HsnSacMasterForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default HsnSacMaster;
