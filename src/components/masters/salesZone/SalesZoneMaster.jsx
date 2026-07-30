import { useState } from "react";
import SalesZoneMasterList from "./SalesZoneMasterList";
import SalesZoneMasterForm from "./SalesZoneMasterForm";

const SalesZoneMaster = () => {
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
        <SalesZoneMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <SalesZoneMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default SalesZoneMaster;
