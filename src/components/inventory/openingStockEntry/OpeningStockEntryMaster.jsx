import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import OpeningStockEntryList from "./OpeningStockEntryList";
import OpeningStockEntryForm from "./OpeningStockEntryForm";

import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { toast } from "../../../utils/toast";

const OpeningStockEntryMaster = () => {
  const navigate = useNavigate();

  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* ---------------------------------------------------------------------- */
  /* Add                                                                    */
  /* ---------------------------------------------------------------------- */

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  /* ---------------------------------------------------------------------- */
  /* Edit                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Opening Stock Entry ID is missing.");
      return;
    }

    try {
      const record = await openingStockEntryAPI.getById(row.id);

      setEditData(record || row);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch Opening Stock Entry for edit:", error);

      toast.error(
        error?.message || "Failed to load Opening Stock Entry details",
      );
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Back from Form                                                         */
  /* ---------------------------------------------------------------------- */

  const handleBack = () => {
    setEditData(null);
    setView("list");

    setRefreshTrigger((previous) => previous + 1);
  };

  /* ---------------------------------------------------------------------- */
  /* Back to Inventory                                                       */
  /* ---------------------------------------------------------------------- */

  const handleNavigateHome = () => {
    navigate("/inventory");
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  if (view === "form") {
    return <OpeningStockEntryForm data={editData} onBack={handleBack} />;
  }

  return (
    <OpeningStockEntryList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default OpeningStockEntryMaster;
