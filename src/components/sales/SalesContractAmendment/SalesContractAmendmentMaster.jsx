import { useState } from "react";
import SalesContractAmendmentForm from "./SalesContractAmendmentForm";
import SalesContractAmendmentList from "./SalesContractAmendmentList";

const SalesContractAmendmentMaster = () => {
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
    return <SalesContractAmendmentForm data={editData} onBack={handleBack} />;
  }

  return <SalesContractAmendmentList onAdd={handleAdd} onEdit={handleEdit} />;
};

export default SalesContractAmendmentMaster;
