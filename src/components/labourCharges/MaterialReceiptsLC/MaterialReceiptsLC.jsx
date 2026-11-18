import { useState } from "react";
import MaterialReceiptsLCList from "./MaterialReceiptsLCList";
import MaterialReceiptsLCForm from "./MaterialReceiptsLCForm";

const MaterialReceiptsLC = () => {
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
        <MaterialReceiptsLCList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <MaterialReceiptsLCForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default MaterialReceiptsLC;
