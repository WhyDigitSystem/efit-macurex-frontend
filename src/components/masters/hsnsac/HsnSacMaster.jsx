import { useState, useCallback } from "react";
import HsnSacMasterList from "./HsnSacMasterList";
import HsnSacMasterForm from "./HsnSacMasterForm";

const HsnSacMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setScreen("list");
  }, []);

  return (
    <>
      {screen === "list" && (
        <HsnSacMasterList
          key={refreshKey}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <HsnSacMasterForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default HsnSacMaster;
