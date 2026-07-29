import { useState } from "react";
import PhysicalStockReconciliationList from "./PhysicalStockReconciliationList";
import PhysicalStockReconciliationForm from "./PhysicalStockReconciliationForm";
import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";

const PhysicalStockReconciliationMaster = () => {
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
      await physicalStockReconciliationAPI.updateCreateReconciliation(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving physical stock reconciliation:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <PhysicalStockReconciliationList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
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
