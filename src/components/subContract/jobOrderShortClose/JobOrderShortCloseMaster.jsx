import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobOrderShortCloseList from "./JobOrderShortCloseList";
import JobOrderShortCloseForm from "./JobOrderShortCloseForm";
import jobOrderShortCloseAPI from "../../../api/jobOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const JobOrderShortCloseMaster = () => {
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


  const handleEdit = useCallback(
    async (row) => {
      try {
        const records =
          await jobOrderShortCloseAPI.getJobOrderShortCloseByOrgId(
            ORG_ID,
            BRANCH_ID,
          );
        const fresh = records.find((r) => r.id === row.id) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch job order short close for edit:", error);
        toast.error("Failed to load job order short close details");
      }
    },
    [ORG_ID, BRANCH_ID],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
   
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return <JobOrderShortCloseForm data={editData} onBack={handleBack} />;
  }

  return (
    <JobOrderShortCloseList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default JobOrderShortCloseMaster;