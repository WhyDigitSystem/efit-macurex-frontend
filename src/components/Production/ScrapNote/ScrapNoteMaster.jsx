import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrapNoteList from "./ScrapNoteList";
import ScrapNoteForm from "./ScrapNoteForm";
import scrapNoteAPI from "../../../api/Production/scrapNoteAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const fmtDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active === true || src.active === "Active",

    branch: src.branch ? { id: src.branch.id } : null,
    department: src.department ? { id: src.department.id } : null,
    fromLocation: src.fromLocation ? { id: src.fromLocation.id } : null,
    toLocation: src.toLocation ? { id: src.toLocation.id } : null,
    fgPart: src.fgPart ? { id: src.fgPart.id } : null,
    bom: src.bom ? { id: src.bom.id } : null,
    scrapPart: src.scrapPart ? { id: src.scrapPart.id } : null,
    preparedBy: src.preparedBy ? { id: src.preparedBy.id } : null,
    authorisedBy: src.authorisedBy ? { id: src.authorisedBy.id } : null,
    scrapId: src.scrapId ? { id: src.scrapId.id } : null,

    belongsTo: src.belongsTo ?? "",
    schOrderNo: src.schOrderNo ?? "",
    docId: src.docId ?? "",
    docDate: src.docDate ?? "",
    time: src.time ?? "",
    narration: src.narration ?? "",

    pmApproval: src.pmApproval ?? "",
    qualityApproval: src.qualityApproval ?? "",
    storeApproval: src.storeApproval ?? "",

    // details
    scrapNoteDetails: (src.scrapNoteDetails || []).map((d) => ({
      id: d.id ?? "",
      item: d.item?.id ?? "",
      itemCode: d.item?.itemCode ?? "",
      itemDescription: d.item?.itemDescription ?? "",
      primaryUnit: d.primaryUnit?.id ?? "",
      primaryUnitCode: d.primaryUnit?.unitId ?? "",
      stock: d.stock ?? "",
      quantity: d.quantity ?? "",
      weight: d.weight ?? "",
      rate: d.rate ?? "",
      value: d.value ?? "",
    })),

    // reasons
    scrapNoteReasonDetails: (src.scrapNoteReasonDetails || []).map((r) => ({
      id: r.id ?? "",
      reasonCode: r.reasonCode ?? "",
      reasonDescription: r.reasonDescription ?? "",
      rejQty: r.rejQty ?? 0,
    })),

    // these come from the backend response but form expects them
    preparedById: src.preparedBy?.id ?? "",
    authorisedById: src.authorisedBy?.id ?? "",
  };
};

/* ------------------------------------------------------------------ */

const ScrapNoteMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Invalid record");
      return;
    }

    try {
      const fresh = await scrapNoteAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error("Failed to fetch Scrap Note for edit:", error);
      toast.error("Failed to load Scrap Note details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateHome = () => {
    navigate("/production");
  };

  if (view === "form") {
    return <ScrapNoteForm data={editData} onBack={handleBack} />;
  }

  return (
    <ScrapNoteList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default ScrapNoteMaster;