import { useState } from "react";
import DirectPurchaseList from "./DirectPurchaseList";
import DirectPurchaseForm from "./DirectPurchaseForm";

const DirectPurchaseMaster = () => {
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
    setEditData(null);
    setScreen("list");
    // re-fetch the list after add / update
    setRefreshTrigger((prev) => prev + 1);
  };

  if (screen === "form") {
    return (
      <DirectPurchaseForm
        data={editData} // <-- the form's prop is `data`, not `editData`
        onBack={handleBack}
      />
    );
  }

  return (
    <DirectPurchaseList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={() => window.history.back()}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default DirectPurchaseMaster;
