import { useState } from "react";
import PurchaseOrderAmendmentForm from "./PurchaseOrderAmendmentForm";
import PurchaseOrderAmendmentList from "./PurchaseOrderAmendmentList";

const PurchaseOrderAmendmentMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAdd = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
  };

  if (screen === "form") {
    return <PurchaseOrderAmendmentForm data={editData} onBack={handleBack} />;
  }

  return <PurchaseOrderAmendmentList onAdd={handleAdd} onEdit={handleEdit} />;
};

export default PurchaseOrderAmendmentMaster;
