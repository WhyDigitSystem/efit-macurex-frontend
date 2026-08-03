import { useState } from "react";
import PartyAccountMappingList from "./PartyAccountMappingList";
import PartyAccountMappingForm from "./PartyAccountMappingForm";

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

  // The form performs the create/update call itself and invokes this after a
  // successful save, so we only need to return to the list here.
  const handleSave = () => {
    handleBack();
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
