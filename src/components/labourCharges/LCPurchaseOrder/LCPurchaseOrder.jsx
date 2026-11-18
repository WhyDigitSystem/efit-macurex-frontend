import { useState } from "react";
import LCPurchaseOrderList from "./LCPurchaseOrderList";
import LCPurchaseOrderForm from "./LCPurchaseOrderForm";

const LCPurchaseOrder = () => {
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
        <LCPurchaseOrderList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <LCPurchaseOrderForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default LCPurchaseOrder;
