import { useCallback, useState } from "react";
import PurchaseContractList from "./PurchaseContractList";
import PurchaseContractForm from "./PurchaseContractForm";
import { purchaseContractAPI } from "../../../api/Purchase/purchaseContractAPI";
import { toast } from "../../../utils/toast";

const PurchaseContractMaster = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching contract, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
        const contracts = await purchaseContractAPI.getContractByOrgId(ORG_ID);
        const fresh = contracts.find((c) => c.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch purchase contract for edit:", error);
        toast.error("Failed to load Purchase Contract details");
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
    return <PurchaseContractForm data={editData} onBack={handleBack} />;
  }

  return (
    <PurchaseContractList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default PurchaseContractMaster;
