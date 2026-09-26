import { useState } from "react";
import PurchaseBillList from "./PurchaseBillList";
import PurchaseBillForm from "./PurchaseBillForm";

const PurchaseBill = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  // Which list is showing; also the default Type when clicking Add
  const [listType, setListType] = useState("purchaseBill");

  const addNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const edit = (row) => {
    // row.type decides which form layout opens
    setEditData(row);
    setScreen("form");
  };

  // The form passes the saved type so the list returns to the matching tab
  const handleBack = (savedType) => {
    if (typeof savedType === "string") setListType(savedType);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <PurchaseBillList
          type={listType}
          onTypeChange={setListType}
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <PurchaseBillForm
          data={editData}
          defaultType={listType}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default PurchaseBill;
