import { useState } from "react";
import ConsumptionEntryList from "./ConsumptionEntryList";
import ConsumptionEntryForm from "./ConsumptionEntryForm";

const ConsumptionEntryMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  // The form already calls the save API itself - here we only return to the
  // list and refresh it (calling the API again here would save twice).
  const handleSaved = () => {
    setRefreshTrigger((n) => n + 1);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <ConsumptionEntryList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ConsumptionEntryForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSaved}
        />
      )}
    </>
  );
};

export default ConsumptionEntryMaster;
