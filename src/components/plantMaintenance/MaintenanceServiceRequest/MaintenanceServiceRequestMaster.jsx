import { useState } from "react";
import MaintenanceServiceRequestList from "./MaintenanceServiceRequestList";
import MaintenanceServiceRequestForm from "./MaintenanceServiceRequestForm";


const MaintenanceServiceRequestMaster = () => {
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
      await maintenanceServiceRequestAPI.updateCreateMaintenanceServiceRequest(
        payload,
      ); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving maintenance service request:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <MaintenanceServiceRequestList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
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
