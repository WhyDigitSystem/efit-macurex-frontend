import { useState } from "react";
import SalesZoneMasterList from "./SalesZoneMasterList";
import SalesZoneMasterForm from "./SalesZoneMasterForm";
import salesZoneAPI from "../../../api/salesZoneAPI";

const SalesZoneMaster = () => {
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
      await salesZoneAPI.updateCreateSalesZone(payload); // Create/Update
      handleBack();
    } catch (error) {
      console.error("Error saving sales zone:", error);
      throw error;
    }
  };

  return (
    <>
      {screen === "list" && (
        <SalesZoneMasterList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <SalesZoneMasterForm
          editData={editData}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default SalesZoneMaster;
