import { useState } from "react";
import LMEMasterList from "./LMEMasterList";
import LMEMasterForm from "./LMEMasterForm";

const LMEMaster = () => {
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
        <LMEMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LMEMasterForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default LMEMaster;