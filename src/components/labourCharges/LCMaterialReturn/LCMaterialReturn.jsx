import { useState } from "react";
import LCMaterialReturnList from "./LCMaterialReturnList";
import LCMaterialReturnForm from "./LCMaterialReturnForm";

const LCMaterialReturn = () => {
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
        <LCMaterialReturnList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LCMaterialReturnForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LCMaterialReturn;
