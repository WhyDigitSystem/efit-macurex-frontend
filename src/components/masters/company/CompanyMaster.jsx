import { useState } from "react";
import CompanyMasterList from "./CompanyMasterList";
import CompanyMasterForm from "./CompanyMasterForm";

const CompanyMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <CompanyMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <CompanyMasterForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default CompanyMaster;