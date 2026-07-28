import { useState } from "react";
import InternalIndentList from "./";
import InternalIndentForm from "./InternalIndentForm";
import internalIndentAPI from "../../../api/Inventory/internalIndentAPI";

const InternalIndentMaster = () => {
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
      await internalIndentAPI.updateCreateInternalIndent(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving internal indent:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <InternalIndentList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <InternalIndentForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default InternalIndentMaster;
