import { ArrowLeft, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import supplierChangeRequestAPI from "../../../api/TDC/supplierChangeRequestAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  className = "",
  disabled = false,
}) => {
  if (type === "select") {
    const safeValue = value === null || value === undefined ? "" : value;
    const inOptions = (options || []).some(
      (opt) => String(opt.value ?? opt) === String(safeValue),
    );
    const showGhost = safeValue !== "" && !inOptions;

    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select
          name={name}
          value={safeValue}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {showGhost && (
            <option value={safeValue}>{String(safeValue)}</option>
          )}
          {(options || []).map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={1}
          className={
            "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
            "bg-white dark:bg-gray-900 " +
            `${error ? controlErrClasses : "border-gray-300 dark:border-gray-600"} ` +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const YES_NO = ["Yes", "No"];

const DISPOSITIONS = ["APPROVED", "DISAPPROVED"];

const CHILD_TABS = [
  { key: "reasonForChange", label: "Reason for Change", kind: "fields" },
  { key: "impactOfChange", label: "Impact of Change", kind: "fields" },
  {
    key: "authorizedSignatures",
    label: "Authorized Signatures From MACUREX CFT",
    kind: "fields",
  },
];

/* ---------------- Department mapping for the Sign-by fields ---------------- */

const SIGNBY_DEPARTMENTS = {
  purchaseSignBy: "Purchase",
  tqcSignBy: "Quality",
  productionSignBy: "Production",
  qualitySignBy: "Quality",
};

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */

const SupplierChangeRequestForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const isEditMode = Boolean(data?.id);
  const docIdLoadedRef = useRef(false);

  const [activeChildTab, setActiveChildTab] = useState("reasonForChange");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [buyerEmployeeOptions, setBuyerEmployeeOptions] = useState([]); // Buyer Name (Purchase)
  const [sourceEmployeeOptions, setSourceEmployeeOptions] = useState([]); // Source Triggered By (all employees)
  const [signByOptionsByRole, setSignByOptionsByRole] = useState({});

  const [header, setHeader] = useState(() => {
    const base = {
      scrNo: data?.scrNo || "",
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      date: data?.date || dayjs().format("YYYY-MM-DD"),
      vendorCode: data?.vendorCode?.id ?? data?.vendorCode ?? "",
      supplierName: data?.supplierName || "",
      partNumber: data?.partNumber || "",
      partDescription: data?.partDescription || "",
      supplierContact: data?.supplierContact || "",
      supplierPhoneNo: data?.supplierPhoneNo ?? "",
      supplierEmailId: data?.supplierEmailId || "",
      buyerName: data?.buyerName?.id ?? data?.buyerName ?? "",
      buyerPhoneNo: data?.buyerPhoneNo ?? "",
      buyerEmailId: data?.buyerEmailId || "",
      sourceTriggeredBy:
        data?.sourceTriggeredBy?.id ?? data?.sourceTriggeredBy ?? "",
      sourcePhoneNo: data?.sourcePhoneNo ?? "",
      sourceEmailId: data?.sourceEmailId || "",
      active: data?.active !== false,
    };
    base.date = fmtDate(base.date);
    return base;
  });

  const [reasonForChange, setReasonForChange] = useState({
    capacityIssueExistingSupplier:
      data?.reasonForChange?.capacityIssueExistingSupplier || "",
    customerRequirementDemandIncreased:
      data?.reasonForChange?.customerRequirementDemandIncreased || "",
    alternativeRmSource: data?.reasonForChange?.alternativeRmSource || "",
    internalCapacityIssue:
      data?.reasonForChange?.internalCapacityIssue || "",
    supplierBaseChange: data?.reasonForChange?.supplierBaseChange || "",
    supplierCommercialIssue:
      data?.reasonForChange?.supplierCommercialIssue || "",
    customerApprovedSource:
      data?.reasonForChange?.customerApprovedSource || "",
    others: data?.reasonForChange?.others || "",
    changeDescriptionDetails:
      data?.reasonForChange?.changeDescriptionDetails || "",
    proposedProcessOutsourced:
      data?.reasonForChange?.proposedProcessOutsourced || "",
  });

  const [impactOfChange, setImpactOfChange] = useState({
    qualityImprovement: data?.impactOfChange?.qualityImprovement || "",
    reducedLeadTime: data?.impactOfChange?.reducedLeadTime || "",
    costReduction: data?.impactOfChange?.costReduction || "",
    increaseManufacturingEfficiency:
      data?.impactOfChange?.increaseManufacturingEfficiency || "",
    othersSpecify: data?.impactOfChange?.othersSpecify || "",
    effectOfChanges: data?.impactOfChange?.effectOfChanges || "",
    riskAssessment: data?.impactOfChange?.riskAssessment || "",
    proposedImplementationDate: fmtDate(
      data?.impactOfChange?.proposedImplementationDate,
    ),
    supplierEvaluationReport:
      data?.impactOfChange?.supplierEvaluationReport || "",
    reliabilityFunctionalReportTdc:
      data?.impactOfChange?.reliabilityFunctionalReportTdc || "",
    customerApproval: data?.impactOfChange?.customerApproval || "",
    onJobTrainingReportManufacturing:
      data?.impactOfChange?.onJobTrainingReportManufacturing || "",
    processAuditReport: data?.impactOfChange?.processAuditReport || "",
    supplierRegistrationForm:
      data?.impactOfChange?.supplierRegistrationForm || "",
    ppapSirRequired: data?.impactOfChange?.ppapSirRequired || "",
    changeRequestApproval: data?.impactOfChange?.changeRequestApproval || "",
  });

  const [authorizedSignatures, setAuthorizedSignatures] = useState({
    purchaseSignBy:
      data?.authorizedSignatures?.purchaseSignBy?.id ??
      data?.authorizedSignatures?.purchaseSignBy ??
      "",
    purchaseDisposition: data?.authorizedSignatures?.purchaseDisposition || "",
    tqcSignBy:
      data?.authorizedSignatures?.tqcSignBy?.id ??
      data?.authorizedSignatures?.tqcSignBy ??
      "",
    tqcDisposition: data?.authorizedSignatures?.tqcDisposition || "",
    productionSignBy:
      data?.authorizedSignatures?.productionSignBy?.id ??
      data?.authorizedSignatures?.productionSignBy ??
      "",
    productionDisposition:
      data?.authorizedSignatures?.productionDisposition || "",
    qualitySignBy:
      data?.authorizedSignatures?.qualitySignBy?.id ??
      data?.authorizedSignatures?.qualitySignBy ??
      "",
    qualityDisposition: data?.authorizedSignatures?.qualityDisposition || "",
    note: data?.authorizedSignatures?.note || "",
  });

  /* ---------------- Re-sync when data prop changes ---------------- */
  useEffect(() => {
    if (!data) return;

    setHeader((prev) => ({
      ...prev,
      scrNo: data?.scrNo || prev.scrNo,
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      date: fmtDate(data?.date) || prev.date,
      vendorCode: data?.vendorCode?.id ?? data?.vendorCode ?? "",
      supplierName: data?.supplierName || "",
      partNumber: data?.partNumber || "",
      partDescription: data?.partDescription || "",
      supplierContact: data?.supplierContact || "",
      supplierPhoneNo: data?.supplierPhoneNo ?? "",
      supplierEmailId: data?.supplierEmailId || "",
      buyerName: data?.buyerName?.id ?? data?.buyerName ?? "",
      buyerPhoneNo: data?.buyerPhoneNo ?? "",
      buyerEmailId: data?.buyerEmailId || "",
      sourceTriggeredBy:
        data?.sourceTriggeredBy?.id ?? data?.sourceTriggeredBy ?? "",
      sourcePhoneNo: data?.sourcePhoneNo ?? "",
      sourceEmailId: data?.sourceEmailId || "",
      active: data?.active !== false,
    }));

    setReasonForChange({
      capacityIssueExistingSupplier:
        data?.reasonForChange?.capacityIssueExistingSupplier || "",
      customerRequirementDemandIncreased:
        data?.reasonForChange?.customerRequirementDemandIncreased || "",
      alternativeRmSource: data?.reasonForChange?.alternativeRmSource || "",
      internalCapacityIssue:
        data?.reasonForChange?.internalCapacityIssue || "",
      supplierBaseChange: data?.reasonForChange?.supplierBaseChange || "",
      supplierCommercialIssue:
        data?.reasonForChange?.supplierCommercialIssue || "",
      customerApprovedSource:
        data?.reasonForChange?.customerApprovedSource || "",
      others: data?.reasonForChange?.others || "",
      changeDescriptionDetails:
        data?.reasonForChange?.changeDescriptionDetails || "",
      proposedProcessOutsourced:
        data?.reasonForChange?.proposedProcessOutsourced || "",
    });

    setImpactOfChange({
      qualityImprovement: data?.impactOfChange?.qualityImprovement || "",
      reducedLeadTime: data?.impactOfChange?.reducedLeadTime || "",
      costReduction: data?.impactOfChange?.costReduction || "",
      increaseManufacturingEfficiency:
        data?.impactOfChange?.increaseManufacturingEfficiency || "",
      othersSpecify: data?.impactOfChange?.othersSpecify || "",
      effectOfChanges: data?.impactOfChange?.effectOfChanges || "",
      riskAssessment: data?.impactOfChange?.riskAssessment || "",
      proposedImplementationDate: fmtDate(
        data?.impactOfChange?.proposedImplementationDate,
      ),
      supplierEvaluationReport:
        data?.impactOfChange?.supplierEvaluationReport || "",
      reliabilityFunctionalReportTdc:
        data?.impactOfChange?.reliabilityFunctionalReportTdc || "",
      customerApproval: data?.impactOfChange?.customerApproval || "",
      onJobTrainingReportManufacturing:
        data?.impactOfChange?.onJobTrainingReportManufacturing || "",
      processAuditReport: data?.impactOfChange?.processAuditReport || "",
      supplierRegistrationForm:
        data?.impactOfChange?.supplierRegistrationForm || "",
      ppapSirRequired: data?.impactOfChange?.ppapSirRequired || "",
      changeRequestApproval: data?.impactOfChange?.changeRequestApproval || "",
    });

    setAuthorizedSignatures({
      purchaseSignBy:
        data?.authorizedSignatures?.purchaseSignBy?.id ??
        data?.authorizedSignatures?.purchaseSignBy ??
        "",
      purchaseDisposition:
        data?.authorizedSignatures?.purchaseDisposition || "",
      tqcSignBy:
        data?.authorizedSignatures?.tqcSignBy?.id ??
        data?.authorizedSignatures?.tqcSignBy ??
        "",
      tqcDisposition: data?.authorizedSignatures?.tqcDisposition || "",
      productionSignBy:
        data?.authorizedSignatures?.productionSignBy?.id ??
        data?.authorizedSignatures?.productionSignBy ??
        "",
      productionDisposition:
        data?.authorizedSignatures?.productionDisposition || "",
      qualitySignBy:
        data?.authorizedSignatures?.qualitySignBy?.id ??
        data?.authorizedSignatures?.qualitySignBy ??
        "",
      qualityDisposition: data?.authorizedSignatures?.qualityDisposition || "",
      note: data?.authorizedSignatures?.note || "",
    });
  }, [data]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */
  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!orgId) return;

    let cancelled = false;

    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await supplierChangeRequestAPI.getDocId({
          financialYear,
          orgId,
        });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, scrNo: docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate SCR DocId:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, orgId]);

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadVendors = useCallback(async () => {
    try {
      const list = await supplierChangeRequestAPI.getVendorCodeDropdown({
        branch,
        orgId,
      });
      setVendorOptions(
        (list || []).map((v) => ({
          value: v.id,
          label: v.vendorCode || String(v.id),
          supplierName: v.supplierName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
    }
  }, [orgId, branch]);

  // Buyer Name — purchase employees only
  const loadBuyerEmployees = useCallback(async () => {
    try {
      const list =
        await supplierChangeRequestAPI.getPurchaseEmployeesDropdown({
          branch,
          orgId,
        });
      setBuyerEmployeeOptions(
        (list || []).map((e) => ({
          value: e.employeeId,
          label: e.employeeName || e.employeeCode || String(e.employeeId),
        })),
      );
    } catch (error) {
      console.error("Failed to load purchase employees:", error);
      setBuyerEmployeeOptions([]);
    }
  }, [orgId, branch]);

  // ✅ Source/Process Triggered By — ALL employees
  const loadAllEmployees = useCallback(async () => {
    try {
      const list = await supplierChangeRequestAPI.getAllEmployees(orgId);
      setSourceEmployeeOptions(
        (list || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.employeeId || String(e.id),
        })),
      );
    } catch (error) {
      console.error("Failed to load all employees:", error);
      setSourceEmployeeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadVendors();
      loadBuyerEmployees();
    }
  }, [orgId, branch, loadVendors, loadBuyerEmployees]);

  useEffect(() => {
    if (orgId) loadAllEmployees();
  }, [orgId, loadAllEmployees]);

  /* ---------------- Sign-by dropdowns — one per department ---------------- */
  useEffect(() => {
    if (!orgId || !branch) return;

    const loadAll = async () => {
      const entries = Object.entries(SIGNBY_DEPARTMENTS);
      const result = {};

      await Promise.all(
        entries.map(async ([key, dept]) => {
          try {
            const list =
              await supplierChangeRequestAPI.getEmployeesByDepartment({
                branch,
                department: dept,
                orgId,
              });
            result[key] = (list || []).map((e) => ({
              value: e.employeeId ?? e.id,
              label: e.employeeName || e.employeeCode || String(e.employeeId),
            }));
          } catch (err) {
            console.error(`Failed to load employees for ${dept}:`, err);
            result[key] = [];
          }
        }),
      );

      setSignByOptionsByRole(result);
    };

    loadAll();
  }, [orgId, branch]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "vendorCode") {
        const vendor = vendorOptions.find(
          (v) => String(v.value) === String(value),
        );
        next.supplierName = vendor?.supplierName || "";
      }
      return next;
    });
  };

  const handleReasonChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setReasonForChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleImpactChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setImpactOfChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignatureChange = (e) => {
    const { name, value } = e.target;
    setAuthorizedSignatures((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.scrNo?.trim()) errors.scrNo = "SCR No is required";
    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.vendorCode) errors.vendorCode = "Vendor Code is required";
    if (!header.partNumber?.trim())
      errors.partNumber = "Part Number is required";
    if (!header.buyerName) errors.buyerName = "Buyer Name is required";
    if (!header.sourceTriggeredBy)
      errors.sourceTriggeredBy = "Source/Process Triggered By is required";

    if (!reasonForChange.changeDescriptionDetails?.trim())
      errors.changeDescriptionDetails =
        "Change Description in Details is required";

    if (!impactOfChange.effectOfChanges?.trim())
      errors.effectOfChanges = "Effect of Changes is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const financialYear = String(new Date().getFullYear());

    /* ---- Payload remapped to the exact backend contract ---- */
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),

      active: header.active !== false,
      orgId: Number(orgId),
      branch: Number(header.plantId) || Number(branch) || 0,
      financialYear,

      createdBy: isUpdate ? data?.createdBy ?? usersId ?? "" : usersId ?? "",

      /* Header */
      vendorCode: Number(header.vendorCode) || 0,
      partNo: header.partNumber || "",
      partDescription: header.partDescription || "",

      supplierContact: header.supplierContact || "",
      supplierPhoneNo: Number(header.supplierPhoneNo) || 0,
      supplierEmailId: header.supplierEmailId || "",

      buyerName: Number(header.buyerName) || 0,
      buyerPhoneNo: Number(header.buyerPhoneNo) || 0,
      buyerEmailId: header.buyerEmailId || "",

      sourceTriggeredBy: Number(header.sourceTriggeredBy) || 0,
      sourcePhoneNo: Number(header.sourcePhoneNo) || 0,
      sourceEmailId: header.sourceEmailId || "",

      /* Reason for Change — backend key names */
      capacityIssueWithExisitingSupplier:
        reasonForChange.capacityIssueExistingSupplier || "",
      customerRequirementDemandIncreased:
        reasonForChange.customerRequirementDemandIncreased || "",
      alternativeRMSourceorAdditionalRMSource:
        reasonForChange.alternativeRmSource || "",
      internalCapacityIssue: reasonForChange.internalCapacityIssue || "",
      changeInSupplierBaseQualityIssueinExisitingSupplier:
        reasonForChange.supplierBaseChange || "",
      supplierCommercialIssue: reasonForChange.supplierCommercialIssue || "",
      customeApprovedSource: reasonForChange.customerApprovedSource || "",
      others: reasonForChange.others || "",
      changeDescriptionInDetails:
        reasonForChange.changeDescriptionDetails || "",
      detailOfProposedProcessOfOutSourced:
        reasonForChange.proposedProcessOutsourced || "",

      /* Impact of Change — backend key names */
      qualityImprovement: impactOfChange.qualityImprovement || "",
      reducedLeadTime: impactOfChange.reducedLeadTime || "",
      costReduction: impactOfChange.costReduction || "",
      increaseManufacturingEfficiency:
        impactOfChange.increaseManufacturingEfficiency || "",
      othersPleaseSpecify: impactOfChange.othersSpecify || "",
      effectOfChanges: impactOfChange.effectOfChanges || "",
      riskAssessment: impactOfChange.riskAssessment || "",
      proposedIntroductionImplementationDate:
        impactOfChange.proposedImplementationDate || "",
      supplierEvaluationReport:
        impactOfChange.supplierEvaluationReport || "",
      reliabilityFunctionalReportFromTDC:
        impactOfChange.reliabilityFunctionalReportTdc || "",
      customerApproval: impactOfChange.customerApproval || "",
      onJobTrainingReportFromMfg:
        impactOfChange.onJobTrainingReportManufacturing || "",
      processAuditReport: impactOfChange.processAuditReport || "",
      supplierRegistrationFrom:
        impactOfChange.supplierRegistrationForm || "",
      ppapIsirRequired: impactOfChange.ppapSirRequired || "",
      changeRequestApproval: impactOfChange.changeRequestApproval || "",

      /* Authorized Signatures — flattened */
      signByPurchase: Number(authorizedSignatures.purchaseSignBy) || 0,
      purchaseDisposition: authorizedSignatures.purchaseDisposition || "",

      signByTDC: Number(authorizedSignatures.tqcSignBy) || 0,
      tdcDisposition: authorizedSignatures.tqcDisposition || "",

      signByProduction: Number(authorizedSignatures.productionSignBy) || 0,
      productionDisposition:
        authorizedSignatures.productionDisposition || "",

      signByQuality: Number(authorizedSignatures.qualitySignBy) || 0,
      qualityDisposition: authorizedSignatures.qualityDisposition || "",

      note: authorizedSignatures.note || "",
    };

    console.log("Saving Supplier Change Request payload:", payload);

    try {
      const response =
        await supplierChangeRequestAPI.createUpdateScr(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Supplier Change Request updated successfully!"
            : "Supplier Change Request created successfully!"),
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Supplier Change Request.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Supplier Change Request Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          "Failed to save Supplier Change Request.",
          "error",
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data
            ? "Edit Supplier Change Request"
            : "Add Supplier Change Request"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Supplier Change Request</SectionHeader>
          <div className={fieldGrid}>
            <Field
              label="Supplier Change Request No"
              name="scrNo"
              value={header.scrNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scrNo}
              required
              disabled
            />
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              required
              disabled
            />
            <Field
              type="select"
              label="Vendor Code"
              name="vendorCode"
              value={header.vendorCode}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorCode}
              options={vendorOptions}
              required
            />
            <Field
              label="Supplier Name"
              name="supplierName"
              value={header.supplierName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Part Number"
              name="partNumber"
              value={header.partNumber}
              onChange={handleHeaderChange}
              error={fieldErrors.partNumber}
              required
            />
            <Field
              label="Part Description"
              name="partDescription"
              value={header.partDescription}
              onChange={handleHeaderChange}
            />
            <Field
              label="Supplier Contact"
              name="supplierContact"
              value={header.supplierContact}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Supplier Phone No"
              name="supplierPhoneNo"
              value={header.supplierPhoneNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="email"
              label="Supplier Email ID"
              name="supplierEmailId"
              value={header.supplierEmailId}
              onChange={handleHeaderChange}
            />
            {/* Buyer Name — purchase employees only */}
            <Field
              type="select"
              label="Buyer Name"
              name="buyerName"
              value={header.buyerName}
              onChange={handleHeaderChange}
              error={fieldErrors.buyerName}
              options={buyerEmployeeOptions}
              required
            />
            <Field
              type="number"
              label="Buyer Phone No"
              name="buyerPhoneNo"
              value={header.buyerPhoneNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="email"
              label="Buyer Email ID"
              name="buyerEmailId"
              value={header.buyerEmailId}
              onChange={handleHeaderChange}
            />
            {/* ✅ Source/Process Triggered By — ALL employees */}
            <Field
              type="select"
              label="Source/Process Triggered By"
              name="sourceTriggeredBy"
              value={header.sourceTriggeredBy}
              onChange={handleHeaderChange}
              error={fieldErrors.sourceTriggeredBy}
              options={sourceEmployeeOptions}
              required
            />
            <Field
              type="number"
              label="Source Phone No"
              name="sourcePhoneNo"
              value={header.sourcePhoneNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="email"
              label="Source Email ID"
              name="sourceEmailId"
              value={header.sourceEmailId}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Reason for Change */}
          {activeChildTab === "reasonForChange" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Capacity issue with existing supplier"
                  name="capacityIssueExistingSupplier"
                  value={reasonForChange.capacityIssueExistingSupplier}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Customer Requirement/Demand increased"
                  name="customerRequirementDemandIncreased"
                  value={reasonForChange.customerRequirementDemandIncreased}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Alternative RM Source or Additional RM Source"
                  name="alternativeRmSource"
                  value={reasonForChange.alternativeRmSource}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Internal Capacity issue"
                  name="internalCapacityIssue"
                  value={reasonForChange.internalCapacityIssue}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Change in Supplier Base / Quality issue in Existing Supplier"
                  name="supplierBaseChange"
                  value={reasonForChange.supplierBaseChange}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Supplier Commercial issue"
                  name="supplierCommercialIssue"
                  value={reasonForChange.supplierCommercialIssue}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Customer Approved Source"
                  name="customerApprovedSource"
                  value={reasonForChange.customerApprovedSource}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Others (Please Specify)"
                  name="others"
                  value={reasonForChange.others}
                  onChange={handleReasonChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="Change Description in Details"
                  name="changeDescriptionDetails"
                  value={reasonForChange.changeDescriptionDetails}
                  onChange={handleReasonChange}
                  error={fieldErrors.changeDescriptionDetails}
                  required
                />
                <Field
                  type="textarea"
                  label="Detail of Proposed Process of Outsourced"
                  name="proposedProcessOutsourced"
                  value={reasonForChange.proposedProcessOutsourced}
                  onChange={handleReasonChange}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Impact of Change */}
          {activeChildTab === "impactOfChange" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Quality Improvement"
                  name="qualityImprovement"
                  value={impactOfChange.qualityImprovement}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Reduced Lead Time"
                  name="reducedLeadTime"
                  value={impactOfChange.reducedLeadTime}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Cost Reduction"
                  name="costReduction"
                  value={impactOfChange.costReduction}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Increase Manufacturing Efficiency"
                  name="increaseManufacturingEfficiency"
                  value={impactOfChange.increaseManufacturingEfficiency}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Others Please Specify"
                  name="othersSpecify"
                  value={impactOfChange.othersSpecify}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="Effect of Changes"
                  name="effectOfChanges"
                  value={impactOfChange.effectOfChanges}
                  onChange={handleImpactChange}
                  error={fieldErrors.effectOfChanges}
                  required
                />
                <Field
                  type="textarea"
                  label="Risk Assessment (Failure Rates, Consequential Quality)"
                  name="riskAssessment"
                  value={impactOfChange.riskAssessment}
                  onChange={handleImpactChange}
                />
                <Field
                  type="date"
                  label="Proposed Introduction/Implementation Date"
                  name="proposedImplementationDate"
                  value={impactOfChange.proposedImplementationDate}
                  onChange={handleImpactChange}
                />
                <Field
                  type="select"
                  label="Supplier Evaluation Report"
                  name="supplierEvaluationReport"
                  value={impactOfChange.supplierEvaluationReport}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Reliability/Functional Report From TDC"
                  name="reliabilityFunctionalReportTdc"
                  value={impactOfChange.reliabilityFunctionalReportTdc}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Customer Approval"
                  name="customerApproval"
                  value={impactOfChange.customerApproval}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="On Job Training Report From Manufacturing"
                  name="onJobTrainingReportManufacturing"
                  value={impactOfChange.onJobTrainingReportManufacturing}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Process Audit Report"
                  name="processAuditReport"
                  value={impactOfChange.processAuditReport}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Supplier Registration Form"
                  name="supplierRegistrationForm"
                  value={impactOfChange.supplierRegistrationForm}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="PPAP/SIR Required"
                  name="ppapSirRequired"
                  value={impactOfChange.ppapSirRequired}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Change Request Approval"
                  name="changeRequestApproval"
                  value={impactOfChange.changeRequestApproval}
                  onChange={handleImpactChange}
                  options={YES_NO}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Authorized Signatures From MACUREX CFT */}
          {activeChildTab === "authorizedSignatures" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Sign by Purchase"
                  name="purchaseSignBy"
                  value={authorizedSignatures.purchaseSignBy}
                  onChange={handleSignatureChange}
                  options={signByOptionsByRole.purchaseSignBy || []}
                />
                <Field
                  type="select"
                  label="Purchase Disposition"
                  name="purchaseDisposition"
                  value={authorizedSignatures.purchaseDisposition}
                  onChange={handleSignatureChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="Sign by TQC"
                  name="tqcSignBy"
                  value={authorizedSignatures.tqcSignBy}
                  onChange={handleSignatureChange}
                  options={signByOptionsByRole.tqcSignBy || []}
                />
                <Field
                  type="select"
                  label="TQC Disposition"
                  name="tqcDisposition"
                  value={authorizedSignatures.tqcDisposition}
                  onChange={handleSignatureChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="Sign by Production"
                  name="productionSignBy"
                  value={authorizedSignatures.productionSignBy}
                  onChange={handleSignatureChange}
                  options={signByOptionsByRole.productionSignBy || []}
                />
                <Field
                  type="select"
                  label="Production Disposition"
                  name="productionDisposition"
                  value={authorizedSignatures.productionDisposition}
                  onChange={handleSignatureChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="Sign by Quality"
                  name="qualitySignBy"
                  value={authorizedSignatures.qualitySignBy}
                  onChange={handleSignatureChange}
                  options={signByOptionsByRole.qualitySignBy || []}
                />
                <Field
                  type="select"
                  label="Quality Disposition"
                  name="qualityDisposition"
                  value={authorizedSignatures.qualityDisposition}
                  onChange={handleSignatureChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="textarea"
                  label="Note"
                  name="note"
                  value={authorizedSignatures.note}
                  onChange={handleSignatureChange}
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default SupplierChangeRequestForm;