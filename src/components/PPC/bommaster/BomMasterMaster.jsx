import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import BomMasterList from "./BomMasterList";
import BomMasterForm from "./BomMasterForm";
import bomMasterAPI from "../../../api/PPC/bomMasterAPI";
import { toast } from "../../../utils/toast";

const BomMasterMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil icon click -> fetch fresh data by id, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const record = await bomMasterAPI.getById(row?.id);
        setEditData(record || row);
        setView("form");
      } catch (error) {
        console.error("Failed to fetch BOM master for edit:", error);
        toast.error("Failed to load BOM master details");
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

  // List screen back button -> return to the PPC module home.
  const handleNavigateHome = () => {
    navigate("/ppc");
  };

  if (view === "form") {
    return <BomMasterForm data={editData} onBack={handleBack} />;
  }

  return (
    <BomMasterList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default BomMasterMaster;