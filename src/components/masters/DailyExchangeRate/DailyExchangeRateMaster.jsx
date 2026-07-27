import { useState } from "react";
import DailyExchangeRateMasterList from "./DailyExchangeRateMasterList";
import DailyExchangeRateMasterForm from "./DailyExchangeRateMasterForm";
import dailyExchangeRateAPI from "../../../api/dailyExchangeRateAPI";

const DailyExchangeRateMaster = () => {
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
      await dailyExchangeRateAPI.updateCreateExchangeRate(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving exchange rate:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <DailyExchangeRateMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <DailyExchangeRateMasterForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default DailyExchangeRateMaster;
