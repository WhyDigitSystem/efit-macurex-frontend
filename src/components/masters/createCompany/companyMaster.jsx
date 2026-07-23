// CreateCompanyPage.jsx (Main container)
import { useState } from "react";
import CreateCompanyListview from "./createCompanyListview";
import CreateCompanyForm from "./createCompanyMaster";
import UpdateCompanyForm from "./UpdateCompanyForm";

const CreateCompanyPage = () => {
  const [screen, setScreen] = useState("list"); // list | form | edit | details
  const [editData, setEditData] = useState(null); // when editing or viewing

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (data) => {
    setEditData(data);
    setScreen("edit");
  };

  const handleView = (data) => {
    setEditData(data);
    setScreen("details");
  };

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <CreateCompanyListview
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}

      {screen === "form" && <CreateCompanyForm onBack={handleBack} />}

      {screen === "edit" && (
        <UpdateCompanyForm editData={editData} onBack={handleBack} />
      )}
    </>
  );
};

export default CreateCompanyPage;
