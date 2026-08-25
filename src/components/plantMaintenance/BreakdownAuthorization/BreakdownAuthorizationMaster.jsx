import { useState } from "react";
import BreakdownAuthorizationList from "./BreakdownAuthorizationList";
import BreakdownAuthorizationForm from "./BreakdownAuthorizationForm";

const BreakdownAuthorizationMaster = () => {
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
      await breakdownAuthorizationAPI.updateCreateBreakdownAuthorization(
        payload,
      ); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving breakdown authorization:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <BreakdownAuthorizationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
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
