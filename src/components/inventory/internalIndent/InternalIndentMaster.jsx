// src/components/Inventory/InternalIndent/InternalIndentMaster.jsx

import { useState } from "react";
import InternalIndentList from "./InternalIndentList";
import InternalIndentForm from "./InternalIndentForm";

const InternalIndentMaster = () => {
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

  // The Form already calls updateCreateInternalIndent and only invokes
  // this after a successful save. Master must NOT call the save API
  // again here - it only switches the screen back to the list.
  const handleSave = () => {
    setEditData(null);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <InternalIndentList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <InternalIndentForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default InternalIndentMaster;
