import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PreDeliveryInspectionReportList from "./PreDeliveryInspectionReportList";
import PreDeliveryInspectionReportForm from "./PreDeliveryInspectionReportForm";
import preDeliveryInspectionReportAPI from "../../../api/quality/preDeliveryInspectionReportAPI";
import { toast } from "../../../utils/toast";

const PreDeliveryInspectionReportMaster = () => {
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

  // Pencil icon click -> fetch the record by id, then open the form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const fresh =
          (await preDeliveryInspectionReportAPI.getPreDeliveryInspectionReportById(
            row.id,
          )) || row;
        setEditData(fresh);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch report for edit:", error);
        toast.error("Failed to load Pre-Delivery Inspection Report details");
      }
    },
    [],
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
      <PreDeliveryInspectionReportForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <PreDeliveryInspectionReportList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default PreDeliveryInspectionReportMaster;
