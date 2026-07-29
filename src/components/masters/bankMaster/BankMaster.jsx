import { useState, useCallback } from "react";
import BankList from "./BankList";
import BankMasterForm from "./BankMasterForm";

const BankMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const addNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const handleBack = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setEditData(null);
    setScreen("list");
  }, []);

  return (
    <>
      {screen === "list" && (
        <BankList
          key={refreshKey}
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshKey}
        />
      )}
      {screen === "form" && (
        <BankMasterForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default BankMaster;
