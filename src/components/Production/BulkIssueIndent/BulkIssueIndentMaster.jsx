import { useCallback, useState } from "react";
import BulkIssueIndentList from "./BulkIssueIndentList";
import BulkIssueIndentForm from "./BulkIssueIndentForm";
import bulkIssueIndentAPI from "../../../api/Production/bulkIssueIndentAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the form's expected structure   */

const mapApiToFormData = (src) => {
  if (!src) return null;

  const empId = (obj) =>
    obj && typeof obj === "object" ? obj.employeeId ?? obj.id ?? "" : obj ?? "";

  return {
    id: src.id,
    active: src.active !== false,
    createdBy: src.createdBy,
    updatedBy: src.updatedBy,

    // header fields (match header.xxx in the form)
    header: {
      plant: src.branch?.id ?? "",
      docId: src.docId ?? "",
      department: src.department?.id ?? "",
      docDate: src.docDate ?? "",
      belongsTo: src.belongsTo ?? "",
      fgSfgItemId: src.fgSfgItem?.id ?? "",
      fgDescription: src.fgSfgItem?.itemDescription ?? "",
      bomId: src.bomId ?? "",
      timeOfIndent: src.timeOfIndent ?? "",
      fromLocation: src.fromLocation?.id ?? "",
    },

    // Indent Detail table rows
    indentDetails: (src.details || []).map((d) => ({
      item: d.item?.id ?? "",
      reqQty: d.reqQty ?? "",
      unit: d.unit?.id ?? "",
      unitDisplay: d.unit?.unitId ?? "",
      requiredDate: d.requiredDate ?? "",
      purpose: d.purpose ?? "",
    })),

    // Indent Summary fields
    indentSummary: {
      approvedByPM: src.approvedByPM ?? "",
      preparedBy: empId(src.preparedBy),
      authorisedBy: empId(src.authorisedBy),
      remarks: src.remarks ?? "",
    },
  };
};

/* ------------------------------------------------------------------ */

const BulkIssueIndentMaster = ({ onBack }) => {
  const [screen, setScreen] = useState("list");
  const [editData, setEditData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setScreen("form");
  };

  const handleEdit = useCallback(async (row) => {
    if (!row?.id) {
      toast.error("Invalid record");
      return;
    }

    try {
      const fresh = await bulkIssueIndentAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setScreen("form");
    } catch (error) {
      console.error("Failed to fetch Bulk Issue Indent:", error);
      toast.error("Failed to load Bulk Issue Indent");
    }
  }, []);

  const handleBackToList = () => {
    setScreen("list");
    setEditData(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      {screen === "list" && (
        <BulkIssueIndentList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <BulkIssueIndentForm
          editData={editData}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      )}
    </>
  );
};

export default BulkIssueIndentMaster;