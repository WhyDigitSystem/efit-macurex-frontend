import { useCallback, useState } from "react";
import SupplierRateContractList from "./SupplierRateContractList";
import SupplierRateContractForm from "./SupplierRateContractForm";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import { toast } from "../../../utils/toast";

const SupplierRateContractMaster = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");
  const BRANCH_ID = localStorage.getItem("branchId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by orgId, find the matching record, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const records =
          await supplierRateContractAPI.getSupplierRateContractByOrgId(
            ORG_ID,
            BRANCH_ID,
          );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch supplier rate contract for edit:", error);
        toast.error("Failed to load supplier rate contract details");
      }
    },
    [ORG_ID, BRANCH_ID],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  if (view === "form") {
    return <SupplierRateContractForm data={editData} onBack={handleBack} />;
  }

  return (
    <SupplierRateContractList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SupplierRateContractMaster;
