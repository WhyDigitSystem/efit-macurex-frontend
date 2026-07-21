import { useState } from "react";
import FinancialYearMasterList from "./FinancialYearMasterList";
import FinancialYearMasterForm from "./FinancialYearMasterForm";

const FinancialYearMaster = () => {
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
        <FinancialYearMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <FinancialYearMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default FinancialYearMaster;