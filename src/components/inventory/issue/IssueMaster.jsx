import { useState } from "react";
import IssueList from "./IssueList";
import IssueForm from "./IssueForm";
import issueAPI from "../../../api/Inventory/issueAPI";
import { useToast } from "../../Toast/ToastContext";

const IssueMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const { addToast } = useToast();

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = async (row) => {
    try {
      const data = await issueAPI.getIssueById(row.id);
      setEditData(data || row);
      setScreen("form");
    } catch (error) {
      console.error("Failed to fetch issue for edit:", error);
      addToast("Failed to load Issue details", "error");
    }
  };

  const handleBack = () => {
    setScreen("list");
  };

  const handleSave = (payload) => {
    addToast("Issue saved successfully", "success");
    handleBack();
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
