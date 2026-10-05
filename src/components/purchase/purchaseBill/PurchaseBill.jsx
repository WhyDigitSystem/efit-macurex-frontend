import { useState } from "react";
import PurchaseBillList from "./PurchaseBillList";
import PurchaseBillForm from "./PurchaseBillForm";

const PurchaseBill = () => {
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
    setEditData(null);
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
        <PurchaseBillForm editData={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default PurchaseBill;
