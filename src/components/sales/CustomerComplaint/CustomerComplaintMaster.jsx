import { useCallback, useState } from "react";
import CustomerComplaintList from "./CustomerComplaintList";
import CustomerComplaintForm from "./CustomerComplaintForm";
import { customerComplaintAPI } from "../../../api/Sales/customerComplaintAPI";
import { toast } from "../../../utils/toast";

const CustomerComplaintMaster = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching complaint, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
        const complaints =
          await customerComplaintAPI.getComplaintByOrgId(ORG_ID);
        const fresh = complaints.find((c) => c.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch customer complaint for edit:", error);
        toast.error("Failed to load Customer Complaint details");
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
    return <CustomerComplaintForm data={editData} onBack={handleBack} />;
  }

  return (
    <CustomerComplaintList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default CustomerComplaintMaster;
