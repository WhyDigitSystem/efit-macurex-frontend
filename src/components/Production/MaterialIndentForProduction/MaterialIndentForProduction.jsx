import { useState } from "react";
import MaterialIndentForProductionList from "./MaterialIndentForProductionList";
import MaterialIndentForProductionForm from "./MaterialIndentForProductionForm";

const MaterialIndentForProduction = () => {
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
      <MaterialIndentForProductionForm
        data={editData}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <MaterialIndentForProductionList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={() => window.history.back()}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default MaterialIndentForProduction;
