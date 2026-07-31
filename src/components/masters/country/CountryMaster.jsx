import { useState } from "react";
import CountryMasterList from "./CountryMasterList";
import CountryMasterForm from "./CountryMasterForm";

const CountryMaster = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list"); // "list", "add", "edit"
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [editId, setEditId] = useState(null);

  const handleAddNew = () => {
    setSelectedCountry(null);
    setEditId(null);
    setCurrentView("add");
  };

  const handleEdit = (country) => {
    setSelectedCountry(country);
    setEditId(country.id);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCountry(null);
    setEditId(null);
  };

  const handleSave = async () => {
    // The form now handles the save internally
    // Just go back to the list after a successful save
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <CountryMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
        />
      )}

      {(currentView === "add" || currentView === "edit") && (
        <CountryMasterForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedCountry}
          editId={editId}
        />
      )}
    </>
  );
};

export default CountryMaster;
