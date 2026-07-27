import { useState } from "react";
import CityMasterList from "./CityMasterList";
import CityMasterForm from "./CityMasterForm";
import { cityAPI } from "../../../api/cityAPI";

const CityMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // "list", "add", "edit"
  const [selectedCity, setSelectedCity] = useState(null);
  const [editId, setEditId] = useState(null);

  const handleAddNew = () => {
    setSelectedCity(null);
    setEditId(null);
    setCurrentView("add");
  };

  const handleEdit = (city) => {
    setSelectedCity(city);
    setEditId(city.id);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCity(null);
    setEditId(null);
  };

  const handleSave = async (payload) => {
    try {
      // The form now handles the save internally
      // Just refresh the list after successful save
      handleBackToList();
    } catch (error) {
      console.error("Error saving city:", error);
      throw error;
    }
  };

  return (
    <>
      {currentView === "list" && (
        <CityMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
        />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <CityMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedCity}
          editId={editId}
        />
      )}
    </>
  );
};

export default CityMaster;