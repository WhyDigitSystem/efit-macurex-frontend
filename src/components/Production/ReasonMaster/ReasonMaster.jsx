import { useState } from "react";
import ReasonMasterList from "./ReasonMasterList";
import ReasonMasterForm from "./ReasonMasterForm";

const ReasonMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditId(null);
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditData(row);
    setScreen("form");
  };

  const handleBack = () => {
    setScreen("list");
    setEditId(null);
    setEditData(null);
  };

  return (
    <>
      {screen === "list" && (
        <ReasonMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ReasonMasterForm
          editId={editId}
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default ReasonMaster;