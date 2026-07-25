import { useState } from "react";
import TransportMasterList from "./TransportMasterList";
import TransportMasterForm from "./TransportMasterForm";
import transportAPI from "../../../api/transportAPI";

const TransportMaster = () => {
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
      await transportAPI.createTransport(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving transport:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <TransportMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <TransportMasterForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default TransportMaster;
