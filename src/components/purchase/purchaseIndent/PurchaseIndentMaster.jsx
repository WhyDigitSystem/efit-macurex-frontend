import { useState } from "react";
import PurchaseIndentList from "./PurchaseIndentList";
import PurchaseIndentForm from "./PurchaseIndentForm";

const PurchaseIndentMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
    console.log("Add Purchase Indent clicked");

    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    console.log("Edit Purchase Indent row:", row);

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
        <PurchaseIndentList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PurchaseIndentForm
          data={editData}
          onBack={backToList}
          onSave={backToList}
        />
      )}
    </>
  );
};

export default PurchaseIndentMaster;
