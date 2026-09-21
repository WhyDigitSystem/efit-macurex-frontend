import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierChangeRequestList from "./SupplierChangeRequestList";
import SupplierChangeRequestForm from "./SupplierChangeRequestForm";
import supplierChangeRequestAPI from "../../../api/TDC/supplierChangeRequestAPI";
import { toast } from "../../../utils/toast";

/* ------------------------------------------------------------------ */
/* Map the flat backend response into the shape the form expects      */

const empId = (obj) =>
  obj && typeof obj === "object" ? obj.employeeId ?? obj.id ?? "" : obj ?? "";

const mapApiToFormData = (src) => {
  if (!src) return null;

  return {
    id: src.id,
    active: src.active === true || src.active === "Active",
    createdBy: src.createdBy,
    updatedBy: src.updatedBy,

    // ---- header fields the form reads as data.xxx ----
    scrNo: src.docId ?? "",
    date: src.docDate ?? "",
    plantId: src.branch?.id ?? "",
    vendorCode: src.vendorCode?.id ?? "",
    supplierName: src.vendorCode?.customerName ?? "",
    partNumber: src.partNo ?? "",
    partDescription: src.partDescription ?? "",
    supplierContact: src.supplierContact ?? "",
    supplierPhoneNo: src.supplierPhoneNo ?? "",
    supplierEmailId: src.supplierEmailId ?? "",
    buyerName: empId(src.buyerName),
    buyerPhoneNo: src.buyerPhoneNo ?? "",
    buyerEmailId: src.buyerEmailId ?? "",
    sourceTriggeredBy: empId(src.sourceTriggeredBy),
    sourcePhoneNo: src.sourcePhoneNo ?? "",
    sourceEmailId: src.sourceEmailId ?? "",

    // ---- Reason for Change ----
    reasonForChange: {
      capacityIssueExistingSupplier:
        src.capacityIssueWithExisitingSupplier ?? "",
      customerRequirementDemandIncreased:
        src.customerRequirementDemandIncreased ?? "",
      alternativeRmSource:
        src.alternativeRMSourceorAdditionalRMSource ?? "",
      internalCapacityIssue: src.internalCapacityIssue ?? "",
      supplierBaseChange:
        src.changeInSupplierBaseQualityIssueinExisitingSupplier ?? "",
      supplierCommercialIssue: src.supplierCommercialIssue ?? "",
      customerApprovedSource: src.customeApprovedSource ?? "",
      others: src.others ?? "",
      changeDescriptionDetails: src.changeDescriptionInDetails ?? "",
      proposedProcessOutsourced:
        src.detailOfProposedProcessOfOutSourced ?? "",
    },

    // ---- Impact of Change ----
    impactOfChange: {
      qualityImprovement: src.qualityImprovement ?? "",
      reducedLeadTime: src.reducedLeadTime ?? "",
      costReduction: src.costReduction ?? "",
      increaseManufacturingEfficiency:
        src.increaseManufacturingEfficiency ?? "",
      othersSpecify: src.othersPleaseSpecify ?? "",
      effectOfChanges: src.effectOfChanges ?? "",
      riskAssessment: src.riskAssessment ?? "",
      proposedImplementationDate:
        src.proposedIntroductionImplementationDate ?? "",
      supplierEvaluationReport: src.supplierEvaluationReport ?? "",
      reliabilityFunctionalReportTdc:
        src.reliabilityFunctionalReportFromTDC ?? "",
      customerApproval: src.customerApproval ?? "",
      onJobTrainingReportManufacturing:
        src.onJobTrainingReportFromMfg ?? "",
      processAuditReport: src.processAuditReport ?? "",
      supplierRegistrationForm: src.supplierRegistrationFrom ?? "",
      ppapSirRequired: src.ppapIsirRequired ?? "",
      changeRequestApproval: src.changeRequestApproval ?? "",
    },

    // ---- Authorized Signatures ----
    authorizedSignatures: {
      purchaseSignBy: empId(src.signByPurchase),
      purchaseDisposition: src.purchaseDisposition ?? "",
      tqcSignBy: empId(src.signByTDC),
      tqcDisposition: src.tdcDisposition ?? "",
      productionSignBy: empId(src.signByProduction),
      productionDisposition: src.productionDisposition ?? "",
      qualitySignBy: empId(src.signByQuality),
      qualityDisposition: src.qualityDisposition ?? "",
      note: src.note ?? "",
    },
  };
};

/* ------------------------------------------------------------------ */

const SupplierChangeRequestMaster = () => {
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
      const fresh = await supplierChangeRequestAPI.getById(row.id);
      setEditData(mapApiToFormData(fresh));
      setView("form");
    } catch (error) {
      console.error("Failed to fetch SCR for edit:", error);
      toast.error("Failed to load Supplier Change Request details");
    }
  }, []);

  const handleBack = () => {
    setEditData(null);
    setView("list");
    // bump refreshTrigger so the list re-fetches after add/update
    setRefreshTrigger((prev) => prev + 1);
  };

  // List screen back button → return to the TDC module home.
  const handleNavigateHome = () => {
    navigate("/TDC");
  };

  if (view === "form") {
    return <SupplierChangeRequestForm data={editData} onBack={handleBack} />;
  }

  return (
    <SupplierChangeRequestList
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      onBack={handleNavigateHome}
      refreshTrigger={refreshTrigger}
    />
  );
};

export default SupplierChangeRequestMaster;