import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubContractSupplyScheduleList from "./SubContractSupplyScheduleList";
import SubContractSupplyScheduleForm from "./SubContractSupplyScheduleForm";
import subContractSupplyScheduleAPI from "../../../api/SubContract/subContractSupplyScheduleAPI";
import { toast } from "../../../utils/toast";

const SubContractSupplyScheduleMaster = () => {
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

  // Pencil icon click -> fetch fresh data by ID using getSubContractSupplyScheduleById
  const handleEdit = useCallback(
    async (row) => {
      try {
        // Fetch the full record by ID
        const response = await subContractSupplyScheduleAPI.getSubContractSupplyScheduleById(row.id);
        console.log("Get By ID Response:", response);

        // Extract data from response
        let fresh = null;
        if (response?.paramObjectsMap?.subContractSupplySchedule) {
          fresh = response.paramObjectsMap.subContractSupplySchedule;
        } else if (response?.data?.paramObjectsMap?.subContractSupplySchedule) {
          fresh = response.data.paramObjectsMap.subContractSupplySchedule;
        } else if (response?.subContractSupplySchedule) {
          fresh = response.subContractSupplySchedule;
        } else {
          fresh = row;
        }

        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch sub contract supply schedule for edit:", error);
        toast.error("Failed to load sub contract supply schedule details");
        // Fallback to using the row data from the list
        setEditData(row);
        setView("form");
      }
    },
    []
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sub Contract module home.
  // (Form's back button goes back to the list via handleBack.)
  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return (
      <SubContractSupplyScheduleForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <SubContractSupplyScheduleList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SubContractSupplyScheduleMaster;