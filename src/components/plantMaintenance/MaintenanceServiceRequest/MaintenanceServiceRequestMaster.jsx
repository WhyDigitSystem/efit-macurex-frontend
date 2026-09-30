import { useState } from "react";
import MaintenanceServiceRequestList from "./MaintenanceServiceRequestList";
import MaintenanceServiceRequestForm from "./MaintenanceServiceRequestForm";

const MaintenanceServiceRequestMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setEditData(null);
    setRefreshTrigger((n) => n + 1); // refresh list after save/cancel
  };

  // Form already called the save API and, on success, calls onSave.
  // Here we only need to navigate back to the list.
  const handleSave = () => {
    handleBack();
  };

  return (
    <>
      {screen === "list" && (
        <MaintenanceServiceRequestList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <MaintenanceServiceRequestForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default MaintenanceServiceRequestMaster;