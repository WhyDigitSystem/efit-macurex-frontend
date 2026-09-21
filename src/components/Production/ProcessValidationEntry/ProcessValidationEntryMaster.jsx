import { useCallback, useState } from "react";
import ProcessValidationEntryList from "./loadProcessValidationEntries";
import ProcessValidationEntryForm from "./ProcessValidationEntryForm";
import processValidationEntryAPI from "../../../api/Production/processValidationEntryAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Reshape flat backend response into the form's expected structure   */

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active !== false,
    createdBy: src.createdBy,
    updatedBy: src.updatedBy,

    header: {
      // Fields the form reads via `data.header.xxx`
      plant: src.branch?.id ?? "",
      docNo: src.docId ?? "",
      itemCode: src.item?.id ?? "",
      itemDescription: src.item?.itemDescription ?? "",
      date: src.docDate ?? "",
      partyId: src.customer?.id ?? "",
      partyName: src.customer?.customerName ?? "",
      processSheetNo: src.processSheetNo?.id ?? "",
      operationNo: src.processSheetNo?.operations?.[0]?.id ?? "",
      operationName:
        src.processSheetNo?.operations?.[0]?.description ?? "",
      controlPlan: src.controlPlan?.id ?? "",
      validationReason: src.validationReason ?? "",
      detailsOfChanges: src.detailsOfChanges ?? "",
      characteristicsToBeMeasured: src.characteristicsToBeMeasured ?? "",
      specification: src.specification ?? "",
    },

    // Tab 1 — table rows
    processVadDetails: (src.details || []).map((d) => ({
      parameter1: d.parameter1 ?? "",
      parameter2: d.parameter2 ?? "",
      parameter3: d.parameter3 ?? "",
      parameter4: d.parameter4 ?? "",
      parameter5: d.parameter5 ?? "",
      parameter6: d.parameter6 ?? "",
      parameter7: d.parameter7 ?? "",
    })),

    // Tab 2 — summary fields
    processVadSummary: {
      dateImplemented: src.dateImplemented ?? "",
      recommendedForProduction: src.recommendedForProduction ?? "",
      dateOfNextValidation: src.dateOfNextValidation ?? "",
      resultsRemarks: src.resultsRemarks ?? "",
    },
  };
};

/* ------------------------------------------------------------------ */

const ProcessValidationEntryMaster = ({ onBack }) => {
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
      const fresh = await processValidationEntryAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setScreen("form");
    } catch (error) {
      console.error("Failed to fetch Process Validation Entry:", error);
      toast.error("Failed to load Process Validation Entry");
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
        <ProcessValidationEntryList
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBack={onBack || (() => window.history.back())}
          refreshTrigger={refreshTrigger}
        />
      )}

      {screen === "form" && (
        <ProcessValidationEntryForm
          editData={editData}
          onBack={handleBackToList}
          onSave={handleBackToList}
        />
      )}
    </>
  );
};

export default ProcessValidationEntryMaster;