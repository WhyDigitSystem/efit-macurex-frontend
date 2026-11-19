import { useState } from "react";
import WorkingDaysCalculationList from "./WorkingDaysCalculationList";
import WorkingDaysCalculationForm from "./WorkingDaysCalculationForm";

const WorkingDaysCalculation = () => {
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
        <WorkingDaysCalculationList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <WorkingDaysCalculationForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default WorkingDaysCalculation;
