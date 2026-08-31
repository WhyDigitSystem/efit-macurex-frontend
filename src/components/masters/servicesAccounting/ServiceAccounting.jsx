import { useState } from "react";
import ServiceAccountingList from "./ServiceAccountingList";
import ServiceAccountingForm from "./ServicesAccountingMaster";
import servicesAccountingAPI from "../../../api/servicesAccountingAPI";
import { useToast } from "../../../components/Toast/ToastContext";

const ServiceAccounting = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = async (data) => {
    // Fetch full data by ID
    try {
      setLoading(true);
      const response = await servicesAccountingAPI.getById(data.id);
      console.log("Full service data:", response);

      // Extract the serviceAccMasterVO from the response
      const fullData = response?.paramObjectsMap?.serviceAccMasterVO || data;

      setEditData(fullData);
      setScreen("form");
    } catch (error) {
      console.error("Error fetching service details:", error);
      addToast("Failed to load service details", "error");
      // Fallback to the data from list view
      setEditData(data);
      setScreen("form");
    } finally {
      setLoading(false);
    }
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
          data={editData}
          onBack={handleBack}
          loading={loading}
        />
      )}
    </>
  );
};

export default ServiceAccounting;