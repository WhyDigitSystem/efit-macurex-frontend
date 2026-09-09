import { useState } from "react";
import DirectPurchaseList from "./DirectPurchaseList";
import DirectPurchaseForm from "./DirectPurchaseForm";

const DirectPurchaseMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

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
  };

  return (
    <>
      {screen === "list" && (
        <DirectPurchaseList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <DirectPurchaseForm
          editData={editData}
          onBack={handleBack}
          onSave={handleBack}
        />
      )}
    </>
  );
};

export default DirectPurchaseMaster;
