import { useState } from "react";
import PurchaseIndentList from "./PurchaseIndentList";
import PurchaseIndentForm from "./PurchaseIndentForm";
import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";

const PurchaseIndentMaster = () => {
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
      await purchaseIndentAPI.updateCreatePurchaseIndent(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving purchase indent:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <PurchaseIndentList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PurchaseIndentForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default PurchaseIndentMaster;
