import { useState } from "react";
import DirectPurchaseList from "./DirectPurchaseList";
import DirectPurchaseForm from "./DirectPurchaseForm";

const DirectPurchaseMaster = () => {
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

  return (
    <>
      {screen === "list" && (
        <DirectPurchaseList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}
      {screen === "form" && (
        <DirectPurchaseForm
          data={editData}
          onBack={() => setScreen("list")}
        />
      )}
    </>
  );
};

export default DirectPurchaseMaster;
