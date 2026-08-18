import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierResponseList from "./SupplierResponseList";
import SupplierResponseForm from "./SupplierResponseForm";
import supplierResponseAPI from "../../../api/quality/supplierResponseAPI";
import { toast } from "../../../utils/toast";

const SupplierResponseMaster = () => {
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
        (await supplierResponseAPI.getSupplierResponseById(row.id)) || row;
      setEditData(fresh);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch supplier response for edit:", error);
      toast.error("Failed to load Supplier Response Entry details");
    }
  }, []);

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
    return <SupplierResponseForm data={editData} onBack={handleBack} />;
  }

  return (
    <SupplierResponseList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SupplierResponseMaster;