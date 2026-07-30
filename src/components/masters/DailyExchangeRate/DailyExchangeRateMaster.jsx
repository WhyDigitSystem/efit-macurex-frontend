import { useState } from "react";
import DailyExchangeRateMasterList from "./DailyExchangeRateMasterList";
import DailyExchangeRateMasterForm from "./DailyExchangeRateMasterForm";

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
        />
      )}
    </>
  );
};

export default DailyExchangeRateMaster;
