import { useState } from "react";
import ProductionBulkIssueList from "./ProductionBulkIssueList";
import ProductionBulkIssueForm from "./ProductionBulkIssueForm";

const ProductionBulkIssueMaster = () => {
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
        <ProductionBulkIssueList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ProductionBulkIssueForm
          editData={editData}
          onBack={handleBack}
          onSave={handleBack}
        />
      )}
    </>
  );
};

export default ProductionBulkIssueMaster;
