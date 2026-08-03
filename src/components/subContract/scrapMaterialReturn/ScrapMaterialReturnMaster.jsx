import { useCallback, useState } from "react";
import ScrapMaterialReturnList from "./ScrapMaterialReturnList";
import ScrapMaterialReturnForm from "./ScrapMaterialReturnForm";
import scrapMaterialReturnAPI from "../../../api/scrapMaterialReturnAPI";
import { toast } from "../../../utils/toast";

const ScrapMaterialReturnMaster = () => {
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
        const records = await scrapMaterialReturnAPI.getScrapMaterialReturnByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch scrap/material return for edit:", error);
        toast.error("Failed to load scrap/material return details");
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
    return <ScrapMaterialReturnForm data={editData} onBack={handleBack} />;
  }

  return (
    <ScrapMaterialReturnList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleBack}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ScrapMaterialReturnMaster;
