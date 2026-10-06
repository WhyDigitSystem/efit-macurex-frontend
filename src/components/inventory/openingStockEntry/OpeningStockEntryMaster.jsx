// src/components/Inventory/OpeningStockEntry/OpeningStockEntryMaster.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OpeningStockEntryList from "./OpeningStockEntryList";
import OpeningStockEntryForm from "./OpeningStockEntryForm";

import { toast } from "../../../utils/toast";

const OpeningStockEntryMaster = () => {
  const navigate = useNavigate();

  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  /*
   * The form fetches the full record itself with getById
   * (loading overlay + merge), so the Master only passes the list row.
   */
  const handleEdit = (row) => {
    if (!row?.id) {
      toast.error("Opening Stock Entry ID is missing.");
      return;
    }

    setEditData(row);
    setView("form");
  };

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((previous) => previous + 1);
  };

  if (view === "form") {
    return <OpeningStockEntryForm data={editData} onBack={handleBack} />;
  }

  return (
    <OpeningStockEntryList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={() => navigate("/inventory")}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default OpeningStockEntryMaster;
