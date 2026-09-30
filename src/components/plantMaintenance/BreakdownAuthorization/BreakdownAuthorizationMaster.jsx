import { useState } from "react";
import BreakdownAuthorizationList from "./BreakdownAuthorizationList";
import BreakdownAuthorizationForm from "./BreakdownAuthorizationForm";

const BreakdownAuthorizationMaster = () => {
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

  // The form already calls the save API and, on success, calls onSave.
  // So here we only need to navigate back.
  const handleSave = () => {
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <BreakdownAuthorizationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <BreakdownAuthorizationForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default BreakdownAuthorizationMaster;