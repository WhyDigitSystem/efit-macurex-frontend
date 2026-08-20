import { useState } from "react";
import FGTransferSlipList from "./FGTransferSlipList";
import FGTransferSlipForm from "./FGTransferSlipForm";

const FGTransferSlipMaster = () => {
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
      await fgTransferSlipAPI.updateCreateFGTransferSlip(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving FG transfer slip:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <FGTransferSlipList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <FGTransferSlipForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default FGTransferSlipMaster;
