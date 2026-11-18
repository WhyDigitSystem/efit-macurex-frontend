import { useState } from "react";
import LCPurchaseOrderShortCloseList from "./LCPurchaseOrderShortCloseList";
import LCPurchaseOrderShortCloseForm from "./LCPurchaseOrderShortCloseForm";

const LCPurchaseOrderShortClose = () => {
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
        <LCPurchaseOrderShortCloseList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LCPurchaseOrderShortCloseForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LCPurchaseOrderShortClose;
