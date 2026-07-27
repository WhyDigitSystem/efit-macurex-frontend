import { useState } from "react";
import PartyAccountMappingList from "./PartyAccountMappingList";
import PartyAccountMappingForm from "./PartyAccountMappingForm";
import partyAccountMappingAPI from "../../../api/partyAccountMappingAPI";

const PartyAccountMappingMaster = () => {
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
      await partyAccountMappingAPI.updateCreateMapping(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving party account mapping:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <PartyAccountMappingList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PartyAccountMappingForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default PartyAccountMappingMaster;
