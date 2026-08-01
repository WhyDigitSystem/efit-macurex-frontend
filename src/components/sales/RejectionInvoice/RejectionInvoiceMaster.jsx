import { useCallback, useState } from "react";
import RejectionInvoiceList from "./RejectionInvoiceList";
import RejectionInvoiceForm from "./RejectionInvoiceForm";
import { rejectionInvoiceAPI } from "../../../api/Sales/rejectionInvoiceAPI";
import { toast } from "../../../utils/toast";

const RejectionInvoiceMaster = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching invoice, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
        const invoices = await rejectionInvoiceAPI.getInvoiceByOrgId(ORG_ID);
        const fresh = invoices.find((i) => i.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch rejection invoice for edit:", error);
        toast.error("Failed to load Rejection Invoice details");
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
    return <RejectionInvoiceForm data={editData} onBack={handleBack} />;
  }

  return (
    <RejectionInvoiceList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default RejectionInvoiceMaster;
