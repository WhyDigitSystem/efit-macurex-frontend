import { useState } from "react";
import ProductionTransferSlipList from "./ProductionTransferSlipList";
import ProductionTransferSlipForm from "./ProductionTransferSlipForm";

const ProductionTransferSlip = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  /* Bump refreshTrigger on the way back so the list re-fetches after a
       create or update instead of showing stale rows. */
  const handleBackToList = () => {
    setEditData(null);
    setScreen("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  if (screen === "form") {
    return (
      <ProductionTransferSlipForm data={editData} onBack={handleBackToList} />
    );
  }

  return (
    <ProductionTransferSlipList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={() => window.history.back()}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ProductionTransferSlip;
