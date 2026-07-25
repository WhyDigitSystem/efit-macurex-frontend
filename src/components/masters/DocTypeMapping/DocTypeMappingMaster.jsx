import { useState } from "react";
import DocTypeMappingList from "./DocTypeMappingList";
import DocTypeMappingForm from "./DocTypeMappingForm";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";

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

  const handleSave = async (payload) => {
    try {
      await docTypeMappingAPI.updateCreateDocTypeMapping(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving doc type mapping:", error);
      throw error;
    }
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
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default DocTypeMappingMaster;
