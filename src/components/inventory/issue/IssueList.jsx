// src/components/Inventory/Issue/IssueMaster.jsx

import { useState } from "react";
import IssueList from "./IssueList";
import IssueForm from "./IssueForm";

const IssueMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  // The form itself calls getIssuesById using row.id, so only pass the row.
  const handleEdit = (row) => {
    setEditData(row);
    setScreen("form");
  };

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
  };

  // The form already saved and toasted; just return to the list.
  const handleSave = () => {
    setEditData(null);
    setScreen("list");
  };

  return (
    <>
      {screen === "list" && (
        <IssueList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <IssueForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default IssueMaster;
