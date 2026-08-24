import { useState } from "react";
import ProductionIssueList from "./ProductionIssueList";
import ProductionIssueForm from "./ProductionIssueForm";

const ProductionIssueMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
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

  return (
    <>
      {screen === "list" && (
        <ProductionIssueList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ProductionIssueForm
          editData={editData}
          onBack={handleBack}
          onSave={handleBack}
        />
      )}
    </>
  );
};

export default ProductionIssueMaster;