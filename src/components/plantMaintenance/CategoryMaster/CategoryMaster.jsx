import { useState } from "react";
import CategoryMasterList from "./CategoryMasterList";
import CategoryMasterForm from "./CategoryMasterForm";

const CategoryMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedCategory(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditId(category.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCategory(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <CategoryMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <CategoryMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedCategory}
          editId={editId}
        />
      )}
    </>
  );
};

export default CategoryMaster;
