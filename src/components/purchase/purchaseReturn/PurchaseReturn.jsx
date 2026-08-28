import { useState } from "react";
import PurchaseReturnList from "./PurchaseReturnList";
import PurchaseReturnForm from "./PurchaseReturnForm";

const PurchaseReturn = () => {
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
        <PurchaseReturnList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PurchaseReturnForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default PurchaseReturn;
