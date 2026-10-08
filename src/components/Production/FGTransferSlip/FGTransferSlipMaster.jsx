import { useState } from "react";
import FGTransferSlipList from "./FGTransferSlipList";
import FGTransferSlipForm from "./FGTransferSlipForm";

const FGTransferSlipMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setEditData(null);
    setRefreshTrigger((n) => n + 1); // refresh list after save/cancel
  };

  // The form already persists the record and calls onSave on success.
  const handleSave = () => {
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <FGTransferSlipList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
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