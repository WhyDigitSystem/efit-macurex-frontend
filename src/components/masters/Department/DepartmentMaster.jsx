import { useState } from "react";
import DepartmentListView from "./DepartmentListView";
import DepartmentMasterForm from "./DepartmentMasterForm";

const DepartmentMasterPage = () => {
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
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <DepartmentListView
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <DepartmentMasterForm
          data={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default DepartmentMasterPage;