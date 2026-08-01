import { useState } from "react";
import ServiceAccountingList from "./ServiceAccountingList";
import ServiceAccountingForm from "./ServicesAccountingMaster";

const ServiceAccounting = () => {
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

  return (
    <>
      {screen === "list" && (
        <ServiceAccountingList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "form" && (
        <ServiceAccountingForm
          editData={editData}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default ServiceAccounting;