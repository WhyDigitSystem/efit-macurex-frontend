// PurchaseDeliveryPage.jsx
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseDeliveryScheduleList from "./PurchaseDeliveryScheduleList";
import PurchaseDeliveryScheduleForm from "./PurchaseDeliveryScheduleForm";
import { purchaseDeliveryScheduleAPI } from "../../../api/Purchase/purchaseDeliveryScheduleAPI";
import { toast } from "../../../utils/toast";

const PurchaseDeliveryPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch data by ID, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        // Use the get by ID API instead of fetching all schedules
        const response = await purchaseDeliveryScheduleAPI.getPurchaseDeliveryScheduleById(row.id);

        console.log("Edit API Response:", response);

        // Extract the data from the response
        const scheduleData = response?.paramObjectsMap?.purchaseDeliveryScheduleVO || row;

        setEditData(scheduleData);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch purchase delivery schedule for edit:", error);
        toast.error("Failed to load Purchase Delivery Schedule details");
      }
    },
    []
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Purchase module home.
  // (Form's back button goes back to the list via handleBack.)
  const handleNavigateHome = () => {
    navigate("/purchase");
  };

  if (view === "form") {
    return <PurchaseDeliveryScheduleForm data={editData} onBack={handleBack} />;
  }

  return (
    <PurchaseDeliveryScheduleList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default PurchaseDeliveryPage;