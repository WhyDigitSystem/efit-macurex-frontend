import { useState } from "react";
import PurchaseBillList from "./PurchaseBillList";
import PurchaseBillForm from "./PurchaseBillForm";

const PurchaseBill = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const addNew = () => {
    console.log("Add button clicked");
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    console.log("Edit clicked:", row);
    setEditData(row);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <PurchaseBillList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PurchaseBillForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default PurchaseBill;