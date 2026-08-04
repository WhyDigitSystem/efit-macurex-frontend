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

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching schedule, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const schedules =
          await purchaseDeliveryScheduleAPI.getScheduleByOrgId(ORG_ID);
        const fresh = schedules.find((s) => s.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error(
          "Failed to fetch purchase delivery schedule for edit:",
          error,
        );
        toast.error("Failed to load Purchase Delivery Schedule details");
      }
    },
    [ORG_ID],
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
