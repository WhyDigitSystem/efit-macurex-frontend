import { useState } from "react";
import LocationCostMasterList from "./LocationCostMasterList";
import LocationCostMasterForm from "./LocationCostMasterForm";

const LocationCostMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <LocationCostMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LocationCostMasterForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LocationCostMaster;
