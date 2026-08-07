import { useState } from "react";
import SalesContractForm from "./SalesContractForm";
import SalesContractList from "./SalesContractList";

const SalesContract = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const addNew = () => {
    console.log("Add button clicked");
    setEditData(null);
    setIsEditMode(false);
    setScreen("form");
  };

  const edit = (row) => {
    console.log("Edit clicked with row:", row);
    setEditData(row);
    setIsEditMode(true);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
    setEditData(null);
    setIsEditMode(false);
  };

  return (
    <>
      {screen === "list" && (
        <SalesContractList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <SalesContractForm
          data={editData}
          onBack={handleBack}
          isEditMode={isEditMode}
        />
      )}
    </>
  );
};

export default SalesContract;