import { useState } from "react";
import ProductionScheduleList from "./ProductionScheduleList";
import ProductionScheduleForm from "./ProductionScheduleForm";

const ProductionScheduleMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
    // Pass only the id — the form fetches the full record by itself.
    setEditData({ id: row?.id });
    setScreen("form");
  };

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <ProductionScheduleList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ProductionScheduleForm
          editData={editData}
          onBack={handleBack}
          onSave={handleBack}
        />
      )}
    </>
  );
};

export default ProductionScheduleMaster;