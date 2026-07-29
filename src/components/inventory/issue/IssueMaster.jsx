import { useState } from "react";
import IssueList from "./IssueList";
import IssueForm from "./IssueForm";
import issueAPI from "../../../api/Inventory/issueAPI";

const IssueMaster = () => {
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

  const handleSave = async (payload) => {
    try {
      await issueAPI.updateCreateIssue(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving issue:", error);
      throw error;
    }
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
