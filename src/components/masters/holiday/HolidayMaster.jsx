import { useState, useCallback } from "react";
import HolidayMasterList from "./HolidayMasterList";
import HolidayMasterForm from "./HolidayMasterForm";

const HolidayMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
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
        <HolidayMasterList
          key={refreshKey}
          onAddNew={handleAdd}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshKey}
        />
      )}
      {screen === "form" && (
        <HolidayMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default HolidayMaster;
