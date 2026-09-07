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

  const ORG_ID = localStorage.getItem("orgId");

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  //  Pencil icon click -> fetch fresh data by orgId, find the matching GRN, open form
  const handleEdit = useCallback(
    async (row) => {
      try {
        const grns = await subContractingGrnAPI.getGrnByOrgId(ORG_ID);
        const fresh = grns.find((g) => g.id === row.id) || row;
        setEditData({
          id: fresh.id,
          general: fresh,
          grnDetail:
            fresh.grnDetail ||
            fresh.grnDetailList ||
            fresh.itemDetails ||
            [],
          taxDetails: fresh.taxDetails || fresh.taxDetailList || [],
          summary: fresh.summary || {},
          invoiceCopy: [],
          consumptionScrap:
            fresh.consumptionScrap || fresh.consumptionScrapList || [],
        });
        setView("form");
      } catch (error) {
        console.error("Failed to fetch sub contracting GRN for edit:", error);
        toast.error("Failed to load Sub Contracting GRN details");
      }
    },
    [ORG_ID],
  );

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button -> return to the Sub Contract module home.
  // (Form's back button goes back to the list via handleBack.)
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
