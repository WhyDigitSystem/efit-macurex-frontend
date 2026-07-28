import { useCallback, useState } from "react";
import PurchaseDeliveryScheduleList from "./PurchaseDeliveryScheduleList";
import PurchaseDeliveryScheduleForm from "./PurchaseDeliveryScheduleForm";
import { purchaseDeliveryScheduleAPI } from "../../../api/Purchase/purchaseDeliveryScheduleAPI";
import { toast } from "../../../utils/toast";

const PurchaseDeliveryPage = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching schedule, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
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
      } finally {
        setLoadingEdit(false);
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

  if (view === "form") {
    return <PurchaseDeliveryScheduleForm data={editData} onBack={handleBack} />;
  }

  return (
    <PurchaseDeliveryScheduleList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default PurchaseDeliveryPage;
