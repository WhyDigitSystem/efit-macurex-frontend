import { useState } from "react";
import ReceiptList from "./ReceiptList";
import ReceiptForm from "./ReceiptForm";
import receiptAPI from "../../../api/Inventory/receiptAPI";

const ReceiptMaster = () => {
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
      await receiptAPI.updateCreateReceipt(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving receipt:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <ReceiptList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ReceiptForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ReceiptMaster;
