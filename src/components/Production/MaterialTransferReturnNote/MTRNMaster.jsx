import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import MTRNList from "./MTRNList";
import MTRNForm from "./MTRNForm";
import materialTransferReturnNoteAPI from "../../../api/Production/materialTransferReturnNoteAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected shape       */

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active === true || src.active === "Active" || src.active === "Y",
    createdBy: src.createdBy,
    updatedBy: src.updatedBy,

    // header fields (form reads via data.xxx)
    plantId: src.branch?.id ?? "",
    belongsTo: src.belongsTo ?? "",
    docId: src.docId ?? "",
    docDate: src.docDate ?? "",
    type: src.type ?? "",
    fromLocation: src.fromLocation?.id ?? "",
    toLocation: src.toLocation?.id ?? "",
    fgItem: src.fgItem?.id ?? "",
    schOrderNo: src.schOrderNo ?? "",
    time: src.time ?? "",
    preparedBy: src.preparedBy?.id ?? "",

    // summary
    approvedByPm: src.approvedByPm ?? "",
    approvedByQc: src.approvedByQc ?? "",
    approvedByStores: src.approvedByStores ?? "",
    narration: src.narration ?? "",

    // details
    materialTransferReturnNoteDetailsDTO: (src.itemDetails || []).map((d) => ({
      item: d.item?.id ?? "",
      itemCode: d.item?.itemCode ?? "",
      itemDescription: d.item?.itemDescription ?? "",
      unit: d.unit?.id ?? "",
      unitDisplay: d.unit?.unitId ?? "",
      availableQty: d.availableQty ?? "",
      qty: d.qty ?? "",
      rate: d.rate ?? "",
      value: d.value ?? 0,
      reasonForRejectionTransfer: d.reasonForRejectionTransfer ?? "",
      supplier: d.supplier?.id ?? "",
      supplierName: d.supplier?.customerName ?? "",
    })),
  };
};

/* ------------------------------------------------------------------ */

const MTRNMaster = () => {
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
      const fresh = await materialTransferReturnNoteAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error("Failed to fetch MTRN for edit:", error);
      toast.error("Failed to load Material Transfer/Return Note details");
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
    return <MTRNForm data={editData} onBack={handleBack} />;
  }

  return (
    <MTRNList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default MTRNMaster;