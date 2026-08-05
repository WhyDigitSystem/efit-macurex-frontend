import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import MaterialPlanningList from "./MaterialPlanningList";
import MaterialPlanningForm from "./MaterialPlanningForm";
import materialPlanningAPI from "../../../api/PPC/materialPlanningAPI";
import { toast } from "../../../utils/toast";

const MaterialPlanningMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by orgId, find the matching record, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const records = await materialPlanningAPI.getByOrgId(ORG_ID);
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch material planning for edit:", error);
        toast.error("Failed to load Material Planning details");
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

  // List screen back button -> return to the PPC module home.
  const handleNavigateHome = () => {
    navigate("/ppc");
  };

  if (view === "form") {
    return <MaterialPlanningForm data={editData} onBack={handleBack} />;
  }

  return (
    <MaterialPlanningList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default MaterialPlanningMaster;