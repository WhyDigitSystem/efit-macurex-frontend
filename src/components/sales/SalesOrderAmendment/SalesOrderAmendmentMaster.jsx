import { useState } from "react";
import SalesOrderAmendmentForm from "./SalesOrderAmendmentForm";
import SalesOrderAmendmentList from "./SalesOrderAmendmentList";

const SalesOrderAmendmentMaster = () => {
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
    return <SalesOrderAmendmentForm data={editData} onBack={handleBack} />;
  }

  return <SalesOrderAmendmentList onAdd={handleAdd} onEdit={handleEdit} />;
};

export default SalesOrderAmendmentMaster;
