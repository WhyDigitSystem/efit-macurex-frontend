import { useCallback, useState } from "react";
import SubContractingGrnList from "./SubContractingGrnList";
import SubContractingGrnForm from "./SubContractingGrnForm";
import { subContractingGrnAPI } from "../../../api/Inventory/subContractingGrnAPI";
import { toast } from "../../../utils/toast";

const SubContractingGrnMaster = () => {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching GRN, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        setLoadingEdit(true);
        const grns = await subContractingGrnAPI.getGrnByOrgId(ORG_ID);
        const fresh = grns.find((g) => g.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch sub contracting GRN for edit:", error);
        toast.error("Failed to load Sub Contracting GRN details");
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
    return <SubContractingGrnForm data={editData} onBack={handleBack} />;
  }

  return (
    <SubContractingGrnList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SubContractingGrnMaster;
