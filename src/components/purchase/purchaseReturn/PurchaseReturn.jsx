import { useState } from "react";
import PurchaseReturnList from "./PurchaseReturnList";
import PurchaseReturnForm from "./PurchaseReturnForm";

const PurchaseReturn = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const addNew = () => {
    setEditData(null);
    setIsEditMode(false);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setIsEditMode(true);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
    setEditData(null);
    setIsEditMode(false);
    setRefreshTrigger((n) => n + 1); // refresh list after save/cancel
  };

  return (
    <>
      {screen === "list" && (
        <PurchaseReturnList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <PurchaseReturnForm
          data={editData}
          onBack={handleBack}
          isEditMode={isEditMode}
        />
      )}
    </>
  );
};

export default PurchaseReturn;