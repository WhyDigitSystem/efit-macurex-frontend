import { useState } from "react";
import DispatchList from "./DispatchList";
import DispatchForm from "./DispatchForm";

const DespatchInstruction = () => {
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
        <DispatchList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <DispatchForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default DespatchInstruction;