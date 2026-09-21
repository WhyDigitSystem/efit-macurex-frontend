import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import BomCorrectionRequestList from "./BomCorrectionRequestList";
import BomCorrectionRequestForm from "./BomCorrectionRequestForm";
import bomCorrectionRequestAPI from "../../../api/PPC/bomCorrectionRequestAPI";
import { toast } from "../../../utils/toast";

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    // record-level flags used by the form
    id: src.id,
    active: src.active,
    cancel: src.cancel,
    cancelRemarks: src.cancelRemarks ?? "",
    createdBy: src.createdBy,
    updatedBy: src.updatedBy,

    // header block
    header: {
      plantId: src.branch?.id ?? "",
      docId: src.docId ?? "",
      date: src.docDate ?? "",
      correctionRequestedBy: src.correctionRequestedBy?.employeeId ?? "",
      correctionRequestApprovedBy:
        src.correctionRequestApprovedBy?.employeeId ?? "",
      fgPartNo: src.fgPartNo?.itemCode ?? "",
      productName: src.productName ?? "",
      customerPartNo: src.customerPartNo ?? "",
      customerName: src.customerName ?? "",
      supplier: src.supplier ?? "",
      reasonForChange: src.reasonForChange ?? "",
    },

    // change details table rows
    changeDetails: (src.details || []).map((d) => ({
      partNo: d.partNo?.itemCode ?? "",
      partDescription: d.partNo?.itemDescription ?? "",
      unit: d.unit?.unitId ?? "",
      bomQty: d.bomQty ?? "",
      addedRemoved: d.addedRemoved ?? "",
    })),

    // approval block (mind the backend field-name quirks)
    approval: {
      managerProduction: src.managerProduction?.employeeId ?? "",
      managerQuality: src.managerQuality?.employeeId ?? "",
      managerTdCi: src.managerTdc?.employeeId ?? "",
      managerPurchase: src.managerPurchase?.employeeId ?? "",
      authorisedSignatory: src.authorisedSignator?.employeeId ?? "",
      decision: src.decision ?? "",
    },
  };
};

const BomCorrectionRequestMaster = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // "list" | "form"
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setView("form");
  };

  // Pencil click → fetch fresh record by id, shape it, open form
  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Invalid record");
      return;
    }

    try {
      const fresh = await bomCorrectionRequestAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error(
        "Failed to fetch BOM correction request for edit:",
        error,
      );
      toast.error("Failed to load BOM Correction Request details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List-screen back button → return to PPC module home
  const handleNavigateHome = () => {
    navigate("/ppc");
  };

  if (view === "form") {
    return (
      <BomCorrectionRequestForm data={editData} onBack={handleBack} />
    );
  }

  return (
    <BomCorrectionRequestList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default BomCorrectionRequestMaster;