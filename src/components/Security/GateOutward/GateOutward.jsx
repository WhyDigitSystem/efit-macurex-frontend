import { useState } from "react";
import GateOutwardList from "./GateOutwardList";
import GateOutwardForm from "./GateOutwardForm";

const GateOutward = () => {
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

  const backToList = () => {
    setEditData(null);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <GateOutwardList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <GateOutwardForm
          data={editData}
          onBack={backToList}
          onSave={backToList}
        />
      )}
    </>
  );
};

export default GateOutward;
