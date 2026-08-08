import { useState } from "react";
import ControlPlanList from "./ControlPlanList";
import ControlPlanForm from "./ControlPlanForm";

const ControlPlan = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editId, setEditId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedPlan(null);
    setEditId(null);
    setCurrentView("form");
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setEditId(plan.id);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedPlan(null);
    setEditId(null);
  };

  const handleSave = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleBackToList();
  };

  return (
    <>
      {currentView === "list" && (
        <ControlPlanList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === "form" && (
        <ControlPlanForm
          onBack={handleBackToList}
          onSave={handleSave}
          editData={selectedPlan}
          editId={editId}
        />
      )}
    </>
  );
};

export default ControlPlan;
