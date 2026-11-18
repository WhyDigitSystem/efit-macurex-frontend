import { useState } from "react";
import LCDespatchInstructionList from "./LCDespatchInstructionList";
import LCDespatchInstructionForm from "./LCDespatchInstructionForm";

const LCDespatchInstruction = () => {
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
        <LCDespatchInstructionList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LCDespatchInstructionForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LCDespatchInstruction;
