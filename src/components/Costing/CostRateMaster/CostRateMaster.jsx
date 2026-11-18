import { useState } from "react";
import CostRateMasterList from "./CostRateMasterList";
import CostRateMasterForm from "./CostRateMasterForm";

const CostRateMaster = () => {
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
        <CostRateMasterList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <CostRateMasterForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default CostRateMaster;
