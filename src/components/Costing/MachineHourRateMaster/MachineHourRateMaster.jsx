import { useState } from "react";
import MachineHourRateMasterList from "./MachineHourRateMasterList";
import MachineHourRateMasterForm from "./MachineHourRateMasterForm";

const MachineHourRateMaster = () => {
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
        <MachineHourRateMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <MachineHourRateMasterForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default MachineHourRateMaster;
