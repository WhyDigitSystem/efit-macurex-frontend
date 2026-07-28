import { useState } from "react";
import StockTransferList from "./StockTransferList";
import StockTransferForm from "./StockTransferForm";
import stockTransferAPI from "../../../api/Inventory/stockTransferAPI";

const StockTransferMaster = () => {
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
      await stockTransferAPI.updateCreateStockTransfer(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving stock transfer:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <StockTransferList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <StockTransferForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default StockTransferMaster;
