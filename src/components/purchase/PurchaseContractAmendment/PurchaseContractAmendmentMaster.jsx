import { useState } from "react";
import PurchaseContractAmendmentForm from "./PurchaseContractAmendmentForm";
import PurchaseContractAmendmentList from "./PurchaseContractAmendmentList";

const PurchaseContractAmendmentMaster = () => {
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
    return <PurchaseContractAmendmentForm data={editData} onBack={handleBack} />;
  }

  return <PurchaseContractAmendmentList onAdd={handleAdd} onEdit={handleEdit} />;
};

export default PurchaseContractAmendmentMaster;
