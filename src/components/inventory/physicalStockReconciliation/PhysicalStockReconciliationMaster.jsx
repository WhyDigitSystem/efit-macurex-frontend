import { useState } from "react";
import PhysicalStockReconciliationList from "./PhysicalStockReconciliationList";
import PhysicalStockReconciliationForm from "./PhysicalStockReconciliationForm";

const PhysicalStockReconciliationMaster = () => {
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
    setEditData(null);
    setScreen("list");
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <PhysicalStockReconciliationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <PhysicalStockReconciliationForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default PhysicalStockReconciliationMaster;
