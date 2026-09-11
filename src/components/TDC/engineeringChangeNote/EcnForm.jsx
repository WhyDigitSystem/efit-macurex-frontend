import { ArrowLeft, Save, X, Plus, Trash2, FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";

import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import engineeringChangeNoteAPI from "../../../api/TDC/engineeringChangeNoteAPI";
import { useToast } from "../../Toast/ToastContext";

/* ========================================================================= */
/* DESIGN TOKENS                                                             */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-x-4 gap-y-3 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  const number = parseInt(value, 10);

  return Number.isFinite(number) ? number : fallback;
};

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const todayISO = () => dayjs().format("YYYY-MM-DD");

/* A row counts as "filled" if any of its values is non-empty, so blank
   trailing rows the user never touched don't get sent to the backend. */
const rowHasValue = (row) =>
  Object.values(row).some((value) => String(value ?? "").trim() !== "");

/* ========================================================================= */
/* SHARED FIELD / TABLE COMPONENTS                                          */
/* ========================================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  disabled = false,
  className = "",
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option
              key={typeof opt === "object" ? opt.value : opt}
              value={typeof opt === "object" ? opt.value : opt}
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={3}
          disabled={disabled}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-y " +
            "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />

      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

/* File-picker field used for PDF attachments. Keeps the same visual
   footprint as a normal input/select so it lines up in the field grid. */
const FileField = ({
  label,
  name,
  file,
  onChange,
  required,
  accept = ".pdf,application/pdf",
}) => (
  <div className="w-full">
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <div className="flex items-center gap-2">
      <label
        className={`${controlClasses} flex items-center gap-1.5 cursor-pointer overflow-hidden`}
      >
        <FileText size={12} className="shrink-0 text-gray-400" />
        <span className="truncate">
          {file
            ? typeof file === "string"
              ? file
              : file.name
            : "Choose PDF..."}
        </span>
        <input
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(name, e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <button
          type="button"
          onClick={() => onChange(name, null)}
          className="h-[30px] w-[30px] shrink-0 rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
        >
          <X size={12} />
        </button>
      )}
    </div>
  </div>
);

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

/* Fixed widths for the row-number and action columns; every data column
   gets an explicit width via colgroup so the header cells and every body
   row line up in the same columns instead of each row sizing itself
   independently based on its own content. */
const ROW_NUM_WIDTH = "36px";
const ACTION_WIDTH = "64px";

const TableWrapper = ({ children, colWidths }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs table-fixed border-collapse">
      <colgroup>
        <col style={{ width: ROW_NUM_WIDTH }} />
        {colWidths.map((width, index) => (
          <col key={index} style={{ width }} />
        ))}
        <col style={{ width: ACTION_WIDTH }} />
      </colgroup>
      {children}
    </table>
  </div>
);

const TableHead = ({ columns }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      <th className="p-2 text-center text-[10px] font-medium dark:text-white">
        #
      </th>

      {columns.map((col) => (
        <th
          key={col.key}
          className={`p-2 whitespace-nowrap text-[10px] font-medium dark:text-white ${
            col.type === "number" ? "text-right" : "text-left"
          }`}
        >
          {col.label}
        </th>
      ))}

      <th className="p-2 text-center text-[10px] font-medium dark:text-white">
        Action
      </th>
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center align-top font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>

    {children}

    <td className="p-2 text-center align-top">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

/* Generic dynamic table for the array sub-DTOs (text / number / date columns).
   Pass col.width (e.g. "18%") to control the exact share of the table each
   column takes; columns without one split the remaining space evenly, so
   header and body cells always line up. Numeric columns are right-aligned
   in both the header and the input for scannability. */
const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper
    colWidths={columns.map(
      (col) => col.width || `${Math.floor(100 / columns.length)}%`,
    )}
  >
    <TableHead columns={columns} />
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) => (
            <td className="p-2 align-top" key={col.key}>
              {col.readOnly ? (
                <div className={cellReadOnlyClasses} title={row[col.key] ?? ""}>
                  {row[col.key] ?? ""}
                </div>
              ) : (
                <input
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={row[col.key] ?? ""}
                  min={col.type === "number" ? 0 : undefined}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={`${cellInputClasses} ${col.type === "number" ? "text-right" : ""}`}
                />
              )}
            </td>
          ))}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* OPTIONS                                                                   */
/* ========================================================================= */

const YES_NO = ["Yes", "No"];
const DECISION = ["Approved", "Not Approved", "Pending"];
const REQUIRED_NOT_REQUIRED = ["Required", "Not Required"];
const DEPARTMENTS = [
  "Design",
  "Purchase",
  "Stores",
  "Quality",
  "Production",
  "Engineering",
];

const CHILD_TABS = [
  { key: "partDetails", label: "1-Part Details", kind: "fields" },
  { key: "changeOverview", label: "2-Change Overview", kind: "fields" },
  { key: "changeRequired", label: "3-Change Required", kind: "table" },
  { key: "processChanges", label: "4-Process Changes", kind: "table" },
  { key: "inspectionTesting", label: "5-Inspection & Testing", kind: "table" },
  { key: "documents", label: "6-Documents/Drawings", kind: "table" },
  { key: "documentChanges", label: "7-Document Changes", kind: "table" },
  { key: "remarks", label: "8-Remarks", kind: "remarks" },
  { key: "storesStock", label: "9-Stores & Stock", kind: "fields" },
  { key: "validation", label: "10-Validation", kind: "fields" },
  { key: "requirements", label: "11-Requirements", kind: "fields" },
  { key: "cftApproval", label: "12-CFT Approval", kind: "fields" },
  { key: "cancelInfo", label: "13-Cancel", kind: "fields" },
];

/* ---- empty row factories, matching the real sub-DTO field names ---- */

const emptyChangeRequiredRow = () => ({
  anyChanges: "",
  fixtures: "",
  estimatedCost: "",
  leadTime: "",
});

const emptyProcessChangeRow = () => ({
  processChange: "",
  layOut: "",
  actions: "",
  estimatedCost: "",
  leadTime: "",
});

const emptyInspectionRow = () => ({
  newGauge: "",
  estimatedCost: "",
  leadTime: "",
});

const emptyDocumentRow = () => ({
  drawing: "",
  partNo: "",
  issue: "",
  remarks: "",
});

const emptyDocumentChangeRow = () => ({
  stationNo: "",
  sopNo: "",
  completionDate: "",
  remarks: "",
});

const emptyRemarksRow = () => ({
  indicate1: "",
  indicate2: "",
});

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const EcnForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const ORG_ID = toInteger(localStorage.getItem("orgId"));
  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(data?.id);

  const [activeChildTab, setActiveChildTab] = useState("partDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState(DEPARTMENTS);

  /* ---------------- header ---------------- */

  const [header, setHeader] = useState(() => ({
    branch: data?.branch ?? BRANCH_ID ?? "",
    docId: data?.docId || "",
    docDate: fmtDate(data?.docDate) || todayISO(),
    financialYear: data?.financialYear || String(new Date().getFullYear()),
    fromDepartment: data?.fromDepartment || "",
    active: data?.active !== false,
  }));

  /* ---------------- tab 1: part details ---------------- */

  const [partDetails, setPartDetails] = useState({
    partNo: data?.partNo || "",
    partDescription: data?.partDescription || "",
    productName: data?.productName || "",
    productNo: data?.productNo || "",
    customerName: data?.customerName || "",
    customerPartNo: data?.customerPartNo || "",
  });

  /* ---------------- tab 2: change overview ---------------- */

  const [changeOverview, setChangeOverview] = useState({
    doesChangeChangeThePart: data?.doesChangeChangeThePart || "",
    partToBeReworked: data?.partToBeReworked || "",
    partToBeScrapped: data?.partToBeScrapped || "",
    valueEngineering: data?.valueEngineering || "",
    changesInvolvingCost: data?.changesInvolvingCost ?? "",
    changesCanBeImplementedBy: data?.changesCanBeImplementedBy || "",
  });

  /* ---------------- tabs 3-7: array sub-DTOs ---------------- */

  const [changeRequiredRows, setChangeRequiredRows] = useState(
    data?.changeRequiredDTO?.length
      ? data.changeRequiredDTO
      : [emptyChangeRequiredRow()],
  );

  const [processChangeRows, setProcessChangeRows] = useState(
    data?.processChangesDTO?.length
      ? data.processChangesDTO
      : [emptyProcessChangeRow()],
  );

  const [inspectionRows, setInspectionRows] = useState(
    data?.inspectionTestingDTO?.length
      ? data.inspectionTestingDTO
      : [emptyInspectionRow()],
  );

  const [documentRows, setDocumentRows] = useState(
    data?.documentsDTO?.length ? data.documentsDTO : [emptyDocumentRow()],
  );

  /* PDF attachments for the Documents/Drawings tab. These sit alongside the
     documents table rather than inside it, since they're single files for
     the whole ECN rather than per-row data. Pre-existing uploads (edit mode)
     come through as URLs/filenames on `data`; a freshly chosen file is a
     browser File object until it's uploaded. */
  const [documentAttachments, setDocumentAttachments] = useState({
    pdfAttachmentDrawing: data?.pdfAttachmentDrawing || null,
    pdfAttachmentBOM: data?.pdfAttachmentBOM || null,
  });

  const [documentChangeRows, setDocumentChangeRows] = useState(
    data?.documentsChangesDTO?.length
      ? data.documentsChangesDTO.map((row) => ({
          ...row,
          completionDate: fmtDate(row.completionDate),
        }))
      : [emptyDocumentChangeRow()],
  );

  /* ---------------- tab 8: remarks ---------------- */

  const [remarksRows, setRemarksRows] = useState(
    data?.remarksDTO?.length ? data.remarksDTO : [emptyRemarksRow()],
  );

  const [remarksMeta, setRemarksMeta] = useState({
    changesAccepted: data?.changesAccepted || "",
    changesRejected: data?.changesRejected || "",
  });

  /* ---------------- tab 9: stores & stock ---------------- */

  const [storesStock, setStoresStock] = useState({
    stores: data?.stores || "",
    wip: data?.wip || "",
    costOfStockPlusWIP: data?.costOfStockPlusWIP ?? "",
    existingStockCanBeUsedTillStockIsExhausted:
      data?.existingStockCanBeUsedTillStockIsExhausted || "",
    ifNoCostOfObselecence: data?.ifNoCostOfObselecence || "",
    ifYesAction: data?.ifYesAction || "",
  });

  /* ---------------- tab 10: validation ---------------- */

  const [validationInfo, setValidationInfo] = useState({
    processValidationRequired: data?.processValidationRequired || "",
    validationDetail: data?.validationDetail || "",
    validationReportToBeAttached: data?.validationReportToBeAttached || "",
    isThereanyBillOfMaterialChangeRequired:
      data?.isThereanyBillOfMaterialChangeRequired || "",
    ifyespleasemention: data?.ifyespleasemention || "",
    expectedDateOfCompletion: fmtDate(data?.expectedDateOfCompletion),
  });

  /* ---------------- tab 11: requirements ---------------- */

  const [requirements, setRequirements] = useState({
    purchaseRequirements: data?.purchaseRequirements || "",
    qualityRequirements: data?.qualityRequirements || "",
    customerRequirements: data?.customerRequirements || "",
    supplierIncludePo: data?.supplierIncludePo || "",
    inCaseOthersPleaseMentionDetails:
      data?.inCaseOthersPleaseMentionDetails || "",
  });

  /* ---------------- tab 12: CFT approval ---------------- */

  const [cft, setCft] = useState({
    approvalByTDCMgr: data?.approvalByTDCMgr || "",
    acceptedByQADMgr: data?.acceptedByQADMgr || "",
    acceptedByPURMgr: data?.acceptedByPURMgr || "",
    acceptedbyPRODMgr: data?.acceptedbyPRODMgr || "",
    acceptedByStoresMgr: data?.acceptedByStoresMgr || "",
    nonAcceptedQADReason: data?.nonAcceptedQADReason || "",
    nonAcceptedPURReason: data?.nonAcceptedPURReason || "",
    nonAcceptedPRODReason: data?.nonAcceptedPRODReason || "",
    nonAcceptedStoreReason: data?.nonAcceptedStoreReason || "",
    controlPlanReviewedAndUpdated: data?.controlPlanReviewedAndUpdated || "",
    anyChangeInWorkInstructionSOP: data?.anyChangeInWorkInstructionSOP || "",
    customerApproval: data?.customerApproval || "",
    conformationOnImplementationByQAD:
      data?.conformationOnImplementationByQAD || "",
  });

  /* ---------------- tab 13: cancel ---------------- */

  const [cancelInfo, setCancelInfo] = useState({
    cancel: data?.cancel ? "Yes" : "No",
    cancelRemarks: data?.cancelRemarks || "",
  });

  /* ========================================================================= */
  /* MASTER DATA                                                               */
  /* ========================================================================= */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((branch) => ({
          value: branch.id,
          label:
            branch.branchName ||
            branch.name ||
            branch.branchCode ||
            `Branch ${branch.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadDepartments = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await departmentAPI.getAllDepartments(ORG_ID);

      const list =
        response?.paramObjectsMap?.departmentVO ||
        response?.paramObjectsMap?.departmentMasterVO ||
        response?.paramObjectsMap?.departments ||
        (Array.isArray(response) ? response : []);

      if (list.length) {
        setDepartmentOptions(
          list.map((department) => ({
            value: department.departmentName || department.name,
            label:
              department.departmentName ||
              department.name ||
              `Dept ${department.id}`,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadBranches();
    loadDepartments();
  }, [loadBranches, loadDepartments]);

  /* ========================================================================= */
  /* DOCUMENT NUMBER                                                           */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generate = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await engineeringChangeNoteAPI.getEcnDocId({
          financialYear: header.financialYear,
          orgId: ORG_ID,
        });

        if (!cancelled) {
          setHeader((previous) => ({ ...previous, docId: docId || "" }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating ECN doc id:", error);
          addToast("Failed to generate ECN No", "error");
        }
      } finally {
        if (!cancelled) {
          setGeneratingDocId(false);
        }
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.financialYear, isEditMode]);

  /* ========================================================================= */
  /* HANDLERS                                                                  */
  /* ========================================================================= */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    }

    setHeader((previous) => ({ ...previous, [name]: value }));
  };

  const handlePartDetailsChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    }

    setPartDetails((previous) => ({ ...previous, [name]: value }));
  };

  const handleChangeOverviewChange = (e) => {
    const { name, value } = e.target;
    setChangeOverview((previous) => ({ ...previous, [name]: value }));
  };

  const handleRemarksMetaChange = (e) => {
    const { name, value } = e.target;
    setRemarksMeta((previous) => ({ ...previous, [name]: value }));
  };

  const handleDocumentAttachmentChange = (name, file) => {
    setDocumentAttachments((previous) => ({ ...previous, [name]: file }));
  };

  const handleStoresStockChange = (e) => {
    const { name, value } = e.target;
    setStoresStock((previous) => ({ ...previous, [name]: value }));
  };

  const handleValidationChange = (e) => {
    const { name, value } = e.target;
    setValidationInfo((previous) => ({ ...previous, [name]: value }));
  };

  const handleRequirementsChange = (e) => {
    const { name, value } = e.target;
    setRequirements((previous) => ({ ...previous, [name]: value }));
  };

  const handleCftChange = (e) => {
    const { name, value } = e.target;
    setCft((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancelInfoChange = (e) => {
    const { name, value } = e.target;
    setCancelInfo((previous) => ({ ...previous, [name]: value }));
  };

  /* ---- generic row helpers for the five array-of-objects tabs ---- */

  const makeRowHandlers = (setRows, emptyRowFactory) => ({
    onCellChange: (idx, key, value) =>
      setRows((previous) =>
        previous.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setRows((previous) => [...previous, emptyRowFactory()]),
    onRemoveRow: (idx) =>
      setRows((previous) => {
        if (previous.length <= 1) return previous;
        return previous.filter((_, i) => i !== idx);
      }),
  });

  const changeRequiredHandlers = makeRowHandlers(
    setChangeRequiredRows,
    emptyChangeRequiredRow,
  );
  const processChangeHandlers = makeRowHandlers(
    setProcessChangeRows,
    emptyProcessChangeRow,
  );
  const inspectionHandlers = makeRowHandlers(
    setInspectionRows,
    emptyInspectionRow,
  );
  const documentHandlers = makeRowHandlers(setDocumentRows, emptyDocumentRow);
  const documentChangeHandlers = makeRowHandlers(
    setDocumentChangeRows,
    emptyDocumentChangeRow,
  );
  const remarksRowHandlers = makeRowHandlers(setRemarksRows, emptyRemarksRow);

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Plant is required";
    if (!header.docId) errors.docId = "ECN No is required";
    if (!header.docDate) errors.docDate = "Date is required";
    if (!header.fromDepartment)
      errors.fromDepartment = "From Department is required";
    if (!partDetails.partNo) errors.partNo = "Part No is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields correctly", "error");
      return false;
    }

    return true;
  };

  /* ========================================================================= */
  /* SAVE - build the FLAT payload the backend actually expects              */
  /* ========================================================================= */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...(isEditMode && { id: data.id }),

        orgId: ORG_ID,
        branch: toInteger(header.branch),
        docId: header.docId || "",
        docDate: header.docDate || todayISO(),
        financialYear: header.financialYear || String(new Date().getFullYear()),
        fromDepartment: header.fromDepartment || "",
        active: header.active !== false,

        partNo: partDetails.partNo || "",
        partDescription: partDetails.partDescription || "",
        productName: partDetails.productName || "",
        productNo: partDetails.productNo || "",
        customerName: partDetails.customerName || "",
        customerPartNo: partDetails.customerPartNo || "",

        doesChangeChangeThePart: changeOverview.doesChangeChangeThePart || "",
        partToBeReworked: changeOverview.partToBeReworked || "",
        partToBeScrapped: changeOverview.partToBeScrapped || "",
        valueEngineering: changeOverview.valueEngineering || "",
        changesInvolvingCost: toNumber(changeOverview.changesInvolvingCost),
        changesCanBeImplementedBy:
          changeOverview.changesCanBeImplementedBy || "",

        changeRequiredDTO: changeRequiredRows
          .filter(rowHasValue)
          .map((row) => ({
            anyChanges: row.anyChanges || "",
            fixtures: row.fixtures || "",
            estimatedCost: toNumber(row.estimatedCost),
            leadTime: toInteger(row.leadTime),
          })),

        processChangesDTO: processChangeRows.filter(rowHasValue).map((row) => ({
          processChange: row.processChange || "",
          layOut: row.layOut || "",
          actions: row.actions || "",
          estimatedCost: toNumber(row.estimatedCost),
          leadTime: toInteger(row.leadTime),
        })),

        inspectionTestingDTO: inspectionRows.filter(rowHasValue).map((row) => ({
          newGauge: row.newGauge || "",
          estimatedCost: toNumber(row.estimatedCost),
          leadTime: toInteger(row.leadTime),
        })),

        documentsDTO: documentRows.filter(rowHasValue).map((row) => ({
          drawing: row.drawing || "",
          partNo: row.partNo || "",
          issue: row.issue || "",
          remarks: row.remarks || "",
        })),

        /* NOTE: these are raw File objects when the user just picked a new
           PDF (or a string/URL when carried over from an existing record in
           edit mode). If the backend expects multipart upload rather than a
           JSON field, swap createUpdateEcn's call below for a FormData
           request that appends these two files alongside `payload`. */
        pdfAttachmentDrawing: documentAttachments.pdfAttachmentDrawing || null,
        pdfAttachmentBOM: documentAttachments.pdfAttachmentBOM || null,

        documentsChangesDTO: documentChangeRows
          .filter(rowHasValue)
          .map((row) => ({
            stationNo: row.stationNo || "",
            sopNo: row.sopNo || "",
            completionDate: row.completionDate || "",
            remarks: row.remarks || "",
          })),

        remarksDTO: remarksRows.filter(rowHasValue).map((row) => ({
          indicate1: row.indicate1 || "",
          indicate2: row.indicate2 || "",
        })),

        changesAccepted: remarksMeta.changesAccepted || "",
        changesRejected: remarksMeta.changesRejected || "",

        stores: storesStock.stores || "",
        wip: storesStock.wip || "",
        costOfStockPlusWIP: toNumber(storesStock.costOfStockPlusWIP),
        existingStockCanBeUsedTillStockIsExhausted:
          storesStock.existingStockCanBeUsedTillStockIsExhausted || "",
        ifNoCostOfObselecence: storesStock.ifNoCostOfObselecence || "",
        ifYesAction: storesStock.ifYesAction || "",

        processValidationRequired:
          validationInfo.processValidationRequired || "",
        validationDetail: validationInfo.validationDetail || "",
        validationReportToBeAttached:
          validationInfo.validationReportToBeAttached || "",
        isThereanyBillOfMaterialChangeRequired:
          validationInfo.isThereanyBillOfMaterialChangeRequired || "",
        ifyespleasemention: validationInfo.ifyespleasemention || "",
        expectedDateOfCompletion: validationInfo.expectedDateOfCompletion || "",

        purchaseRequirements: requirements.purchaseRequirements || "",
        qualityRequirements: requirements.qualityRequirements || "",
        customerRequirements: requirements.customerRequirements || "",
        supplierIncludePo: requirements.supplierIncludePo || "",
        inCaseOthersPleaseMentionDetails:
          requirements.inCaseOthersPleaseMentionDetails || "",

        approvalByTDCMgr: cft.approvalByTDCMgr || "",
        acceptedByQADMgr: cft.acceptedByQADMgr || "",
        acceptedByPURMgr: cft.acceptedByPURMgr || "",
        acceptedbyPRODMgr: cft.acceptedbyPRODMgr || "",
        acceptedByStoresMgr: cft.acceptedByStoresMgr || "",
        nonAcceptedQADReason: cft.nonAcceptedQADReason || "",
        nonAcceptedPURReason: cft.nonAcceptedPURReason || "",
        nonAcceptedPRODReason: cft.nonAcceptedPRODReason || "",
        nonAcceptedStoreReason: cft.nonAcceptedStoreReason || "",
        controlPlanReviewedAndUpdated: cft.controlPlanReviewedAndUpdated || "",
        anyChangeInWorkInstructionSOP: cft.anyChangeInWorkInstructionSOP || "",
        customerApproval: cft.customerApproval || "",
        conformationOnImplementationByQAD:
          cft.conformationOnImplementationByQAD || "",

        cancel: cancelInfo.cancel === "Yes",
        cancelRemarks: cancelInfo.cancelRemarks || "",

        createdBy:
          (isEditMode ? data?.createdBy : localStorage.getItem("userName")) ||
          "SYSTEM",
        ...(isEditMode && {
          updatedBy: localStorage.getItem("userName") || "SYSTEM",
        }),
      };

      const response = await engineeringChangeNoteAPI.createUpdateEcn(payload);

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isEditMode
            ? "Engineering Change Note updated successfully"
            : "Engineering Change Note created successfully",
          "success",
        );

        onBack?.();
      } else {
        const errorMessage =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save Engineering Change Note";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving engineering change note:", error);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Engineering Change Note.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  const addRowForTab = () => {
    switch (activeChildTab) {
      case "changeRequired":
        return changeRequiredHandlers.onAddRow();
      case "processChanges":
        return processChangeHandlers.onAddRow();
      case "inspectionTesting":
        return inspectionHandlers.onAddRow();
      case "documents":
        return documentHandlers.onAddRow();
      case "documentChanges":
        return documentChangeHandlers.onAddRow();
      case "remarks":
        return remarksRowHandlers.onAddRow();
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode
            ? "Edit Engineering Change Note"
            : "Add Engineering Change Note"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header fields ---------------- */}
        <div>
          <SectionHeader>Engineering Change Note</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
            />

            <Field
              label="ECN No"
              name="docId"
              value={generatingDocId ? "Generating..." : header.docId}
              onChange={() => {}}
              error={fieldErrors.docId}
              disabled
              required
            />

            <Field
              type="date"
              label="Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              disabled
              required
            />

            <Field
              type="select"
              label="From Department"
              name="fromDepartment"
              value={header.fromDepartment}
              onChange={handleHeaderChange}
              error={fieldErrors.fromDepartment}
              options={departmentOptions}
              required
            />

            <Field
              label="Financial Year"
              name="financialYear"
              value={header.financialYear}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="relative min-w-0 flex-1">
              <div className="flex flex-nowrap overflow-x-auto">
                {CHILD_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveChildTab(tab.key)}
                    className={`shrink-0 px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${
                      activeChildTab === tab.key
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {(activeTabMeta.kind === "table" ||
              activeTabMeta.kind === "remarks") && (
              <button
                type="button"
                onClick={addRowForTab}
                className="shrink-0 h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Part Details */}
          {activeChildTab === "partDetails" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  label="Part No"
                  name="partNo"
                  value={partDetails.partNo}
                  onChange={handlePartDetailsChange}
                  error={fieldErrors.partNo}
                  required
                />
                <Field
                  label="Part Description"
                  name="partDescription"
                  value={partDetails.partDescription}
                  onChange={handlePartDetailsChange}
                />
                <Field
                  label="Product Name"
                  name="productName"
                  value={partDetails.productName}
                  onChange={handlePartDetailsChange}
                />
                <Field
                  label="Product No"
                  name="productNo"
                  value={partDetails.productNo}
                  onChange={handlePartDetailsChange}
                />
                <Field
                  label="Customer Name"
                  name="customerName"
                  value={partDetails.customerName}
                  onChange={handlePartDetailsChange}
                />
                <Field
                  label="Customer Part No"
                  name="customerPartNo"
                  value={partDetails.customerPartNo}
                  onChange={handlePartDetailsChange}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Change Overview */}
          {activeChildTab === "changeOverview" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Does this change the part"
                  name="doesChangeChangeThePart"
                  value={changeOverview.doesChangeChangeThePart}
                  onChange={handleChangeOverviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Part to be Reworked"
                  name="partToBeReworked"
                  value={changeOverview.partToBeReworked}
                  onChange={handleChangeOverviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Part to be Scrapped"
                  name="partToBeScrapped"
                  value={changeOverview.partToBeScrapped}
                  onChange={handleChangeOverviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Value Engineering"
                  name="valueEngineering"
                  value={changeOverview.valueEngineering}
                  onChange={handleChangeOverviewChange}
                  options={YES_NO}
                />
                <Field
                  type="number"
                  label="Changes Involving Cost"
                  name="changesInvolvingCost"
                  value={changeOverview.changesInvolvingCost}
                  onChange={handleChangeOverviewChange}
                />
                <Field
                  type="textarea"
                  label="Changes can be implemented by"
                  name="changesCanBeImplementedBy"
                  value={changeOverview.changesCanBeImplementedBy}
                  onChange={handleChangeOverviewChange}
                  className="col-span-2"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Change Required */}
          {activeChildTab === "changeRequired" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "anyChanges", label: "Any Changes", width: "34%" },
                  { key: "fixtures", label: "Fixtures", width: "26%" },
                  {
                    key: "estimatedCost",
                    label: "Estimated Cost",
                    type: "number",
                    width: "20%",
                  },
                  {
                    key: "leadTime",
                    label: "Lead Time (days)",
                    type: "number",
                    width: "20%",
                  },
                ]}
                rows={changeRequiredRows}
                onCellChange={changeRequiredHandlers.onCellChange}
                onRemoveRow={changeRequiredHandlers.onRemoveRow}
              />
            </div>
          )}

          {/* Tab 4: Process Changes */}
          {activeChildTab === "processChanges" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "processChange",
                    label: "Process Change",
                    width: "24%",
                  },
                  { key: "layOut", label: "Layout Impact", width: "20%" },
                  { key: "actions", label: "Actions", width: "24%" },
                  {
                    key: "estimatedCost",
                    label: "Estimated Cost",
                    type: "number",
                    width: "16%",
                  },
                  {
                    key: "leadTime",
                    label: "Lead Time (days)",
                    type: "number",
                    width: "16%",
                  },
                ]}
                rows={processChangeRows}
                onCellChange={processChangeHandlers.onCellChange}
                onRemoveRow={processChangeHandlers.onRemoveRow}
              />
            </div>
          )}

          {/* Tab 5: Inspection & Testing */}
          {activeChildTab === "inspectionTesting" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "newGauge",
                    label: "New Gauge / Test Method",
                    width: "50%",
                  },
                  {
                    key: "estimatedCost",
                    label: "Estimated Cost",
                    type: "number",
                    width: "25%",
                  },
                  {
                    key: "leadTime",
                    label: "Lead Time (days)",
                    type: "number",
                    width: "25%",
                  },
                ]}
                rows={inspectionRows}
                onCellChange={inspectionHandlers.onCellChange}
                onRemoveRow={inspectionHandlers.onRemoveRow}
              />
            </div>
          )}

          {/* Tab 6: Documents / Drawings */}
          {activeChildTab === "documents" && (
            <div className="pt-3 space-y-3">
              <div className={fieldGrid}>
                <FileField
                  label="Pdf Attachment Drawing"
                  name="pdfAttachmentDrawing"
                  file={documentAttachments.pdfAttachmentDrawing}
                  onChange={handleDocumentAttachmentChange}
                />
                <FileField
                  label="Pdf Attachment BOM"
                  name="pdfAttachmentBOM"
                  file={documentAttachments.pdfAttachmentBOM}
                  onChange={handleDocumentAttachmentChange}
                />
              </div>

              <DynamicTable
                columns={[
                  { key: "drawing", label: "Drawing No", width: "20%" },
                  { key: "partNo", label: "Part No", width: "20%" },
                  { key: "issue", label: "Issue", width: "15%" },
                  { key: "remarks", label: "Remarks", width: "45%" },
                ]}
                rows={documentRows}
                onCellChange={documentHandlers.onCellChange}
                onRemoveRow={documentHandlers.onRemoveRow}
              />
            </div>
          )}

          {/* Tab 7: Document Changes */}
          {activeChildTab === "documentChanges" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "stationNo", label: "Station No", width: "18%" },
                  { key: "sopNo", label: "SOP No", width: "18%" },
                  {
                    key: "completionDate",
                    label: "Completion Date",
                    type: "date",
                    width: "20%",
                  },
                  { key: "remarks", label: "Remarks", width: "44%" },
                ]}
                rows={documentChangeRows}
                onCellChange={documentChangeHandlers.onCellChange}
                onRemoveRow={documentChangeHandlers.onRemoveRow}
              />
            </div>
          )}

          {/* Tab 8: Remarks */}
          {activeChildTab === "remarks" && (
            <div className="pt-3 space-y-3">
              <DynamicTable
                columns={[
                  { key: "indicate1", label: "Indicate 1", width: "50%" },
                  { key: "indicate2", label: "Indicate 2", width: "50%" },
                ]}
                rows={remarksRows}
                onCellChange={remarksRowHandlers.onCellChange}
                onRemoveRow={remarksRowHandlers.onRemoveRow}
              />

              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Changes Accepted"
                  name="changesAccepted"
                  value={remarksMeta.changesAccepted}
                  onChange={handleRemarksMetaChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Changes Rejected"
                  name="changesRejected"
                  value={remarksMeta.changesRejected}
                  onChange={handleRemarksMetaChange}
                  options={YES_NO}
                />
              </div>
            </div>
          )}

          {/* Tab 9: Stores & Stock */}
          {activeChildTab === "storesStock" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Stores"
                  name="stores"
                  value={storesStock.stores}
                  onChange={handleStoresStockChange}
                />
                <Field
                  type="textarea"
                  label="WIP"
                  name="wip"
                  value={storesStock.wip}
                  onChange={handleStoresStockChange}
                />
                <Field
                  type="number"
                  label="Cost of Stock + WIP"
                  name="costOfStockPlusWIP"
                  value={storesStock.costOfStockPlusWIP}
                  onChange={handleStoresStockChange}
                />
                <Field
                  type="select"
                  label="Existing Stock can be used till exhausted"
                  name="existingStockCanBeUsedTillStockIsExhausted"
                  value={storesStock.existingStockCanBeUsedTillStockIsExhausted}
                  onChange={handleStoresStockChange}
                  options={YES_NO}
                />
                <Field
                  label="If No, Cost of Obsolescence"
                  name="ifNoCostOfObselecence"
                  value={storesStock.ifNoCostOfObselecence}
                  onChange={handleStoresStockChange}
                />
                <Field
                  type="textarea"
                  label="If Yes, Action"
                  name="ifYesAction"
                  value={storesStock.ifYesAction}
                  onChange={handleStoresStockChange}
                />
              </div>
            </div>
          )}

          {/* Tab 10: Validation */}
          {activeChildTab === "validation" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Process Validation Required"
                  name="processValidationRequired"
                  value={validationInfo.processValidationRequired}
                  onChange={handleValidationChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="Validation Detail"
                  name="validationDetail"
                  value={validationInfo.validationDetail}
                  onChange={handleValidationChange}
                />
                <Field
                  type="select"
                  label="Validation Report to be Attached"
                  name="validationReportToBeAttached"
                  value={validationInfo.validationReportToBeAttached}
                  onChange={handleValidationChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Is there any BOM Change Required"
                  name="isThereanyBillOfMaterialChangeRequired"
                  value={validationInfo.isThereanyBillOfMaterialChangeRequired}
                  onChange={handleValidationChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="If Yes, Please Mention"
                  name="ifyespleasemention"
                  value={validationInfo.ifyespleasemention}
                  onChange={handleValidationChange}
                />
                <Field
                  type="date"
                  label="Expected Date of Completion"
                  name="expectedDateOfCompletion"
                  value={validationInfo.expectedDateOfCompletion}
                  onChange={handleValidationChange}
                />
              </div>
            </div>
          )}

          {/* Tab 11: Requirements */}
          {activeChildTab === "requirements" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Purchase Requirements"
                  name="purchaseRequirements"
                  value={requirements.purchaseRequirements}
                  onChange={handleRequirementsChange}
                />
                <Field
                  type="textarea"
                  label="Quality Requirements"
                  name="qualityRequirements"
                  value={requirements.qualityRequirements}
                  onChange={handleRequirementsChange}
                />
                <Field
                  type="textarea"
                  label="Customer Requirements"
                  name="customerRequirements"
                  value={requirements.customerRequirements}
                  onChange={handleRequirementsChange}
                />
                <Field
                  type="select"
                  label="Supplier to Include PO Reference"
                  name="supplierIncludePo"
                  value={requirements.supplierIncludePo}
                  onChange={handleRequirementsChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="In case of Others, Please Mention"
                  name="inCaseOthersPleaseMentionDetails"
                  value={requirements.inCaseOthersPleaseMentionDetails}
                  onChange={handleRequirementsChange}
                  className="col-span-2"
                />
              </div>
            </div>
          )}

          {/* Tab 12: CFT Approval */}
          {activeChildTab === "cftApproval" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Approval by TDC Manager"
                  name="approvalByTDCMgr"
                  value={cft.approvalByTDCMgr}
                  onChange={handleCftChange}
                  options={DECISION}
                />
                <Field
                  type="select"
                  label="Accepted by QAD Manager"
                  name="acceptedByQADMgr"
                  value={cft.acceptedByQADMgr}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Accepted by Purchase Manager"
                  name="acceptedByPURMgr"
                  value={cft.acceptedByPURMgr}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Accepted by Production Manager"
                  name="acceptedbyPRODMgr"
                  value={cft.acceptedbyPRODMgr}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Accepted by Stores Manager"
                  name="acceptedByStoresMgr"
                  value={cft.acceptedByStoresMgr}
                  onChange={handleCftChange}
                  options={YES_NO}
                />

                <Field
                  type="textarea"
                  label="Non-Accepted Reason (QAD)"
                  name="nonAcceptedQADReason"
                  value={cft.nonAcceptedQADReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (Purchase)"
                  name="nonAcceptedPURReason"
                  value={cft.nonAcceptedPURReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (Production)"
                  name="nonAcceptedPRODReason"
                  value={cft.nonAcceptedPRODReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (Stores)"
                  name="nonAcceptedStoreReason"
                  value={cft.nonAcceptedStoreReason}
                  onChange={handleCftChange}
                />

                <Field
                  type="select"
                  label="Control Plan Reviewed & Updated"
                  name="controlPlanReviewedAndUpdated"
                  value={cft.controlPlanReviewedAndUpdated}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Any Change in Work Instruction/SOP"
                  name="anyChangeInWorkInstructionSOP"
                  value={cft.anyChangeInWorkInstructionSOP}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Customer Approval"
                  name="customerApproval"
                  value={cft.customerApproval}
                  onChange={handleCftChange}
                  options={REQUIRED_NOT_REQUIRED}
                />
                <Field
                  type="textarea"
                  label="Confirmation on Implementation by QAD"
                  name="conformationOnImplementationByQAD"
                  value={cft.conformationOnImplementationByQAD}
                  onChange={handleCftChange}
                  className="col-span-2"
                />
              </div>
            </div>
          )}

          {/* Tab 13: Cancel */}
          {activeChildTab === "cancelInfo" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Cancel this ECN"
                  name="cancel"
                  value={cancelInfo.cancel}
                  onChange={handleCancelInfoChange}
                  options={YES_NO}
                />

                {cancelInfo.cancel === "Yes" && (
                  <Field
                    type="textarea"
                    label="Cancel Remarks"
                    name="cancelRemarks"
                    value={cancelInfo.cancelRemarks}
                    onChange={handleCancelInfoChange}
                    className="col-span-2"
                  />
                )}
              </div>
            </div>
          )}
        </section>

        {/* ---------------- Buttons ---------------- */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EcnForm;
