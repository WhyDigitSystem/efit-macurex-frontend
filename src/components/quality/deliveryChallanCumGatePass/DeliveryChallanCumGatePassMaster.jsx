import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryChallanCumGatePassList from "./DeliveryChallanCumGatePassList";
import DeliveryChallanCumGatePassForm from "./DeliveryChallanCumGatePassForm";
import deliveryChallanCumGatePassAPI from "../../../api/quality/deliveryChallanCumGatePassAPI";
import { toast } from "../../../utils/toast";

const DeliveryChallanCumGatePassMaster = () => {
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

  // Pencil icon click -> fetch fresh data by orgId, find the matching record, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const records = await deliveryChallanCumGatePassAPI.getDcgpByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch DCGP for edit:", error);
        toast.error("Failed to load Delivery Challan Cum Gate Pass details");
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

  // List screen back button -> return to the Quality module home.
  const handleNavigateHome = () => {
    navigate("/quality");
  };

  if (view === "form") {
    return (
      <DeliveryChallanCumGatePassForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <DeliveryChallanCumGatePassList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default DeliveryChallanCumGatePassMaster;
