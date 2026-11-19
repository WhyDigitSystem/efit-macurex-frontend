import { useState } from "react";
import LabourHourRateList from "./LabourHourRateList";
import LabourHourRateForm from "./LabourHourRateForm";

const LabourHourRate = () => {
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
        <LabourHourRateList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LabourHourRateForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LabourHourRate;
