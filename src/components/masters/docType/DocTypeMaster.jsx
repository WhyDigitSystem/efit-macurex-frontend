import { useState } from "react";
import DocTypeMasterList from "./DocTypeMasterList";
import DocTypeMasterForm from "./DocTypeMasterForm";
import docTypeAPI from "../../../api/docTypeAPI";

const DocTypeMaster = () => {
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
      await docTypeAPI.updateCreateDocType(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving doc type:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <DocTypeMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <DocTypeMasterForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default DocTypeMaster;
