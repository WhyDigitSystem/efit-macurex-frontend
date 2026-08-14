import { useState } from "react";
import PurchaseOrderList from "./PurchaseOrderList";
import PurchaseOrderForm from "./PurchaseOrderForm";

const PurchaseOrderMaster = () => {
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
      await purchaseOrderAPI.updateCreatePurchaseOrder(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving purchase order:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <PurchaseOrderList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PurchaseOrderForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default PurchaseOrderMaster;
