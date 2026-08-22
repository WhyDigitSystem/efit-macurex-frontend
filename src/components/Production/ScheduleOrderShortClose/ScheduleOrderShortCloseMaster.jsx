import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleOrderShortCloseList from "./ScheduleOrderShortCloseList";
import ScheduleOrderShortCloseForm from "./ScheduleOrderShortCloseForm";
import productionScheduleOrderShortCloseAPI from "../../../api/Production/productionScheduleOrderShortCloseAPI";
import { toast } from "../../../utils/toast";

const ScheduleOrderShortCloseMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch the record by id, then open the form
  const handleEdit = useCallback(async (row) => {
    try {
      const fresh =
        (await productionScheduleOrderShortCloseAPI.getById(row.id)) || row;
      setEditData(fresh);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch Short Close for edit:", error);
      toast.error("Failed to load Short Close details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Production module home.
  const handleNavigateHome = () => {
    navigate("/production");
  };

  if (view === "form") {
    return <ScheduleOrderShortCloseForm data={editData} onBack={handleBack} />;
  }

  return (
    <ScheduleOrderShortCloseList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ScheduleOrderShortCloseMaster;