import { useState } from "react";
import ExchangeRateUpdateList from "./ExchangeRateUpdateList";
import ExchangeRateUpdateForm from "./ExchangeRateUpdateForm";
import exchangeRateUpdateAPI from "../../../api/exchangeRateUpdateAPI";

const ExchangeRateUpdateMaster = () => {
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
      await exchangeRateUpdateAPI.updateCreateExchangeRateUpdate(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving exchange rate update:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <ExchangeRateUpdateList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ExchangeRateUpdateForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ExchangeRateUpdateMaster;
