import { useState } from "react";
import DocTypeMappingList from "./DocTypeMappingList";
import DocTypeMappingForm from "./DocTypeMappingForm";

const DocTypeMappingMaster = () => {
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
        <DocTypeMappingList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <DocTypeMappingForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default DocTypeMappingMaster;
