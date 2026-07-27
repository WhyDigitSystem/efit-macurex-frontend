import { useState } from "react";
import LocationMasterList from "./LocationMasterList";
import LocationMasterForm from "./LocationMasterForm";

const LocationMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
    console.log("Add button clicked");
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  return (
    <>
      {screen === "list" && (
        <LocationMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LocationMasterForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default LocationMaster;