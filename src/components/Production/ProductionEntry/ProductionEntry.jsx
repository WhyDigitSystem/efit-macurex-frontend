import { useState } from "react";
import ProductionEntryList from "./ProductionEntryList";
import ProductionEntryForm from "./ProductionEntryForm";

const ProductionEntry = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      {screen === "list" && (
        <ProductionEntryList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ProductionEntryForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default ProductionEntry;
