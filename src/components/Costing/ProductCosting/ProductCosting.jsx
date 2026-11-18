import { useState } from "react";
import ProductCostingList from "./ProductCostingList";
import ProductCostingForm from "./ProductCostingForm";

const ProductCosting = () => {
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
        <ProductCostingList
          onAddNew={addNew}
          onEdit={edit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ProductCostingForm data={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default ProductCosting;
