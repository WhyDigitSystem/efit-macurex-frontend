import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrapMaterialReturnList from "./ScrapMaterialReturnList";
import ScrapMaterialReturnForm from "./ScrapMaterialReturnForm";
import scrapMaterialReturnAPI from "../../../api/scrapMaterialReturnAPI";
import { toast } from "../../../utils/toast";

const ScrapMaterialReturnMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  const handleEdit = useCallback(async (row) => {
    try {
      const raw = await scrapMaterialReturnAPI.getScrapMaterialReturnById(row.id);
      // 👇 Unwrap the nested VO — the API returns
      //    { statusFlag, status, paramObjectsMap: { scrapMaterialReturnRejectionVO: {...} } }
      const vo =
        raw?.paramObjectsMap?.scrapMaterialReturnRejectionVO ||
        raw?.scrapMaterialReturnRejectionVO ||
        raw ||
        row;
      setEditData(vo);
      setView("form");
    } catch (error) {
      console.error("Failed to fetch scrap/material return for edit:", error);
      toast.error("Failed to load scrap/material return details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/subcontract");
  };

  if (view === "form") {
    return <ScrapMaterialReturnForm data={editData} onBack={handleBack} />;
  }

  return (
    <ScrapMaterialReturnList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ScrapMaterialReturnMaster;