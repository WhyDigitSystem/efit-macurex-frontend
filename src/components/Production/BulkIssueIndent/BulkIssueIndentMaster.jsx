import { useState } from "react";
import BulkIssueIndentList from "./BulkIssueIndentList";
import BulkIssueIndentForm from "./BulkIssueIndentForm";

const BulkIssueIndentMaster = () => {
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
      await bulkIssueIndentAPI.updateCreateBulkIssueIndent(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving bulk issue indent:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <BulkIssueIndentList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <BulkIssueIndentForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default BulkIssueIndentMaster;
