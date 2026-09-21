import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubContractingGrnList from "./SubContractingGrnList";
import SubContractingGrnForm from "./SubContractingGrnForm";
import { subContractingGrnAPI } from "../../../api/Inventory/subContractingGrnAPI";
import { toast } from "../../../utils/toast";

const SubContractingGrnMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Action (pencil) click -> fetch the record by id -> open form with the raw record
  const handleEdit = useCallback(async (row) => {
    try {
      let record = await subContractingGrnAPI.getGrnById(row.id);
      if (Array.isArray(record)) record = record[0];

      // fall back to the untouched list record if by-id returns nothing
      if (!record) record = row.raw || null;

      if (!record?.id) {
        toast.error("Sub Contracting GRN not found");
        return;
      }

      setEditData(record); // form reads the raw API shape directly
      setView("form");
    } catch (error) {
      console.error("Failed to fetch sub contracting GRN for edit:", error);
      toast.error("Failed to load Sub Contracting GRN details");
    }
  }, []);

  // Form back -> list, and refresh the list after add/update
  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  // List back -> Sub Contract module home
  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return <SubContractingGrnForm data={editData} onBack={handleBack} />;
  }

  return (
    <SubContractingGrnList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SubContractingGrnMaster;
