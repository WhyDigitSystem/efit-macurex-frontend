import { useState } from "react";
import ExchangeRateList from "./ExchangeRateList";
import ExchangeRateForm from "./ExchangeRateForm";
import exchangeRateAPI from "../../../api/exchangeRateAPI";

const ExchangeRateMaster = () => {
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
      await exchangeRateAPI.updateCreateExchangeRate(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving exchange rate:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <ExchangeRateList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ExchangeRateForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ExchangeRateMaster;
