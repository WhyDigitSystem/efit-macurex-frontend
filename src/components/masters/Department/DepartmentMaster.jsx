import { useState } from "react";
import DepartmentListView from "./DepartmentListView";
import DepartmentMasterForm from "./DepartmentMasterForm";

const DepartmentMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // "list", "add", "edit"
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [editId, setEditId] = useState(null);

  const handleAddNew = () => {
    setSelectedDepartment(null);
    setEditId(null);
    setCurrentView("add");
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setEditId(department.id);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedDepartment(null);
    setEditId(null);
  };

  const handleSave = (savedData) => {
    // Refresh the list after saving
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <DepartmentListView
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
        />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <DepartmentMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedDepartment}
          editId={editId}
        />
      )}
    </>
  );
};

export default DepartmentMaster;