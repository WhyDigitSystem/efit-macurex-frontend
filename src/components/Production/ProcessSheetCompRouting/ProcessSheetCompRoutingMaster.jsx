import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProcessSheetCompRoutingList from "./ProcessSheetCompRoutingList";
import ProcessSheetCompRoutingForm from "./ProcessSheetCompRoutingForm";
import processSheetCompRoutingAPI from "../../../api/Production/processSheetCompRoutingAPI";
import { toast } from "../../../utils/toast";

const ProcessSheetCompRoutingMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Edit: fetch the full record (header + routing + tool/fixture + machine rows)
  // by id and hand the normalised object to the form.
  const handleEdit = useCallback(async (row) => {
    try {
      const record = await processSheetCompRoutingAPI.getById(row?.id);
      if (!record) {
        toast.error("Process Sheet / Routing details not found");
        return;
      }
      setEditData(record);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch process sheet / routing for edit:", error);
      toast.error("Failed to load Process Sheet / Routing details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  if (view === "form") {
    return <ProcessSheetCompRoutingForm data={editData} onBack={handleBack} />;
  }

  return (
    <ProcessSheetCompRoutingList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={() => navigate("/production")}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ProcessSheetCompRoutingMaster;
