import { useState, useCallback } from "react";
import SalesContractAmendmentForm from "./SalesContractAmendmentForm";
import SalesContractAmendmentList from "./SalesContractAmendmentList";
import salesContractAmendmentAPI from "../../../api/Sales/salesContractAmendmentAPI";
import { toast } from "../../../utils/toast";

const SalesContractAmendmentMaster = () => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setEditData(null);
    setScreen("form");
  };

  // Pencil icon click -> fetch the record by id, then open the form
  const handleEdit = useCallback(async (row) => {
    try {
      const fresh =
        (await salesContractAmendmentAPI.getById(row.id)) || row;
      setEditData(fresh);
      setScreen("form");
    } catch (error) {
      console.error("Failed to fetch SC amendment for edit:", error);
      toast.error("Failed to load Sales Contract Amendment details");
      setEditData(row);
      setScreen("form");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setScreen("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  if (screen === "form") {
    return <SalesContractAmendmentForm data={editData} onBack={handleBack} />;
  }

  return (
    <SalesContractAmendmentList
      onAddNew={handleAdd}
      onEdit={handleEdit}
      onBack={() => {}}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SalesContractAmendmentMaster;