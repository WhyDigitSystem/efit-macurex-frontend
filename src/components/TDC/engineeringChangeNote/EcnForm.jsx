import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import engineeringChangeNoteAPI from "../../../api/TDC/engineeringChangeNoteAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import itemAPI from "../../../api/itemAPI";

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

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellTextareaClasses =
  "w-full h-8 px-2 py-[10px] rounded border text-xs leading-none transition-colors overflow-y-auto resize-none scrollbar-hide " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

// Spacious grid used inside the child tabs so fields breathe more.
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
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
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

const ToggleField = ({
  label,
  name,
  value,
  onChange,
  options = ["Yes", "No"],
}) => (
  <div>
    <label className={labelClasses}>{label}</label>
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(name, opt)}
          className={`h-[30px] px-3 rounded border text-xs transition-colors ${
            value === opt
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

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
/* Table helpers                                                               */

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-2 whitespace-nowrap ${
            i === 0
              ? "w-8 text-center"
              : i === headers.length - 1
                ? "w-20 text-left"
                : "text-left"
          } dark:text-white`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-2 text-center">
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

const CellToggle = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    {["Yes", "No"].map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`h-8 px-2.5 rounded border text-xs transition-colors ${
          value === opt
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

/* Generic dynamic table. Supports text / number / select / textarea / toggle
   / readonly columns. Options may be plain strings or { value, label }. */
const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) => {
            if (col.type === "select") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={row[col.key]}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {(col.options || []).map((opt) => (
                      <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }

            if (col.type === "toggle") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <CellToggle
                    value={row[col.key]}
                    onChange={(value) => onCellChange(idx, col.key, value)}
                  />
                </td>
              );
            }

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    rows={1}
                    value={row[col.key]}
                    readOnly={col.readOnly}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={col.readOnly ? cellReadOnlyClasses : cellTextareaClasses}
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
                />
              </td>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* File upload cell: drag-and-drop or click-to-upload. */
const UploadCell = ({ file, onFileChange, error }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const displayName =
    file instanceof File ? file.name : file || "Click or drop a file";

  return (
    <td className="p-2 align-top">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFileChange(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-2 rounded-md border-2 border-dashed px-3 py-2 cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : error
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
      >
        <UploadCloud className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
          {displayName}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileChange(e.target.files[0]);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </td>
  );
};

/* Upload grid used for the Pdf Attachments tab. Each row has an upload cell
   plus optional text columns. */
const UploadGrid = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) =>
            col.type === "upload" ? (
              <UploadCell
                key={col.key}
                file={row[col.key]}
                onFileChange={(f) => onCellChange(idx, col.key, f)}
              />
            ) : (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : "text"}
                  value={row[col.key]}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={cellInputClasses}
                />
              </td>
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const YES_NO = ["Yes", "No"];
const DEPARTMENTS = ["Design", "Purchase", "Stores", "Quality", "Production"];
const APPROVED_BY = ["TDC Manager", "QAD Manager", "Purchase Manager", "Production Manager", "Stores Manager"];
const DECISION = ["Approved", "Not Approved", "Pending"];
const STOCK_LOCATIONS = ["Plant A", "Plant B", "Warehouse", "FG Stores", "RM Stores"];
const STOCK_STATUS = ["Available", "Low Stock", "Nil", "Blocked"];
const DOCUMENT_TYPES = ["Drawing", "BOM", "Work Instruction", "Process Sheet", "SOP", "Specification", "Inspection Plan"];
const VALIDATION_REQUIRED = ["Required", "Not Required"];
const REQUIRED_NOT_REQUIRED = ["Required", "Not Required"];
const CUSTOMER_APPROVAL = ["Required", "Not Required"];

const CHILD_TABS = [
  { key: "partDetails", label: "Part Details", kind: "table" },
  { key: "reasonForChange", label: "Reason For Change", kind: "fields" },
  { key: "remarks", label: "Remarks", kind: "fields" },
  { key: "changeRequired", label: "Change Required", kind: "table" },
  { key: "processChanges", label: "Process Changes", kind: "table" },
  { key: "inspectionTesting", label: "Inspection & Testing Operations", kind: "table" },
  { key: "storesLogistics", label: "Stores & Logistics", kind: "fields" },
  { key: "stockAt", label: "What is the Stock at", kind: "fields" },
  { key: "docsObsolete", label: "Documents/Drawings/Records to be corrected/To be made obsolete", kind: "fields" },
  { key: "docsChangesI", label: "Documents Changes Required I", kind: "table" },
  { key: "docsChangesII", label: "Documents Changes Required II", kind: "table" },
  { key: "validation", label: "Stock and Design/Process Validation", kind: "fields" },
  { key: "conclusion", label: "Conclusion", kind: "fields" },
  { key: "pdfAttachments", label: "Pdf Attachments", kind: "attachments" },
  { key: "cftApproval", label: "CFT Approval/Concurrence", kind: "fields" },
];

const emptyPartRow = () => ({
  partNo: "",
  partDescription: "",
});

const emptyChangeRow = () => ({
  detailI: "",
  detailII: "",
});

const emptyProcessRow = () => ({
  processChangeRequired: "",
  affectsLayoutFlow: "",
  actions: "",
  estimatedCost: "",
  leadTimeRequired: "",
});

const emptyInspectionRow = () => ({
  required: "",
  newGaugeTestMethod: "",
  estimatedCost: "",
  leadTimeRequired: "",
});

const emptyDocChangeRow = () => ({
  documentName: "",
  changeRequired: "",
});

const emptyDrawingRow = () => ({
  drawing: null,
  partNo: "",
  issue: "",
  remark: "",
});

const emptyBomRow = () => ({
  bomCopy: null,
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateEcnNo = () =>
  `ECN-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const EcnForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("partDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [partOptions, setPartOptions] = useState([]);
  const [partMap, setPartMap] = useState({});

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      ecnNo: data?.ecnNo || (data ? "" : generateEcnNo()),
      ecnDate: data?.ecnDate || dayjs().format("YYYY-MM-DD"),
      fromDepartment: data?.fromDepartment?.id ?? data?.fromDepartment ?? "",
      productName: data?.productName || "",
      customerName: data?.customerName || "",
      productNo: data?.productNo || "",
      customerPartNo: data?.customerPartNo || "",
      active: data?.active !== false,
    };
    base.ecnDate = fmtDate(base.ecnDate);
    return base;
  });

  const [partRows, setPartRows] = useState(
    data?.partDetails?.length ? data.partDetails : [emptyPartRow()],
  );

  const [reasonForChange, setReasonForChange] = useState(
    data?.reasonForChange || "",
  );

  const [remarks, setRemarks] = useState({
    remarks: data?.remarks?.remarks || "",
    changesAccepted: data?.remarks?.changesAccepted || "",
    changesRejected: data?.remarks?.changesRejected || "",
    approvedBy: data?.remarks?.approvedBy || "",
    approvalStatus: data?.remarks?.approvalStatus || "",
  });

  const [changeRequiredRows, setChangeRequiredRows] = useState(
    data?.changeRequired?.length ? data.changeRequired : [emptyChangeRow()],
  );

  const [processRows, setProcessRows] = useState(
    data?.processChanges?.length ? data.processChanges : [emptyProcessRow()],
  );

  const [inspectionRows, setInspectionRows] = useState(
    data?.inspectionTesting?.length
      ? data.inspectionTesting
      : [emptyInspectionRow()],
  );

  const [storesLogistics, setStoresLogistics] = useState({
    stores: data?.storesLogistics?.stores || "",
    wip: data?.storesLogistics?.wip || "",
    supplier: data?.storesLogistics?.supplier || "",
    costStockWip: data?.storesLogistics?.costStockWip || "",
  });

  const [stockAt, setStockAt] = useState({
    currentStock: data?.stockAt?.currentStock || "",
    stockLocation: data?.stockAt?.stockLocation || "",
    stockStatus: data?.stockAt?.stockStatus || "",
  });

  const [docsObsolete, setDocsObsolete] = useState({
    documentType: data?.docsObsolete?.documentType || "",
    documentReferenceNo: data?.docsObsolete?.documentReferenceNo || "",
    obsoleteStatus: data?.docsObsolete?.obsoleteStatus || "",
    remarks: data?.docsObsolete?.remarks || "",
  });

  const [docChangesIRows, setDocChangesIRows] = useState(
    data?.docChangesI?.length ? data.docChangesI : [emptyDocChangeRow()],
  );

  const [docChangesIIRows, setDocChangesIIRows] = useState(
    data?.docChangesII?.length ? data.docChangesII : [emptyDocChangeRow()],
  );

  const [validation, setValidation] = useState({
    existingStockUse: data?.validation?.existingStockUse || "",
    obsolescenceCost: data?.validation?.obsolescenceCost || "",
    processValidationRequired: data?.validation?.processValidationRequired || "",
    processValidationDetail: data?.validation?.processValidationDetail || "",
    processValidationReport: data?.validation?.processValidationReport || null,
    designValidationRequired: data?.validation?.designValidationRequired || "",
    designValidationDetail: data?.validation?.designValidationDetail || "",
    designValidationReport: data?.validation?.designValidationReport || null,
    bomChangeRequired: data?.validation?.bomChangeRequired || "",
    bomChangeMention: data?.validation?.bomChangeMention || "",
    expectedDateOfCompletion: data?.validation?.expectedDateOfCompletion || "",
  });

  const [conclusionNotes, setConclusionNotes] = useState(
    data?.conclusionNotes || "",
  );

  const [drawingRows, setDrawingRows] = useState(
    data?.pdfDrawing?.length
      ? data.pdfDrawing.map((p) => ({
          drawing: p.fileName || p.drawing || null,
          partNo: p.partNo || "",
          issue: p.issue || "",
          remark: p.remark || "",
        }))
      : [emptyDrawingRow()],
  );

  const [bomRows, setBomRows] = useState(
    data?.pdfBom?.length
      ? data.pdfBom.map((p) => ({
          bomCopy: p.fileName || p.bomCopy || null,
        }))
      : [emptyBomRow()],
  );

  const [cft, setCft] = useState({
    tdcManager: data?.cft?.tdcManager || "",
    qadManager: data?.cft?.qadManager || "",
    purchaseManager: data?.cft?.purchaseManager || "",
    productionManager: data?.cft?.productionManager || "",
    storesManager: data?.cft?.storesManager || "",
    tdcNonAcceptedReason: data?.cft?.tdcNonAcceptedReason || "",
    qadNonAcceptedReason: data?.cft?.qadNonAcceptedReason || "",
    purchaseNonAcceptedReason: data?.cft?.purchaseNonAcceptedReason || "",
    productionNonAcceptedReason: data?.cft?.productionNonAcceptedReason || "",
    storesNonAcceptedReason: data?.cft?.storesNonAcceptedReason || "",
    controlPlanReviewed: data?.cft?.controlPlanReviewed || "",
    workInstructionSopChange: data?.cft?.workInstructionSopChange || "",
    customerApproval: data?.cft?.customerApproval || "",
  });

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

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId, branch);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      if (departments.length) {
        setDepartmentOptions(
          departments.map((d) => ({ value: d.id, label: d.departmentName })),
        );
      } else {
        setDepartmentOptions(DEPARTMENTS);
      }
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions(DEPARTMENTS);
    }
  }, [orgId, branch]);

  const loadParts = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode || it.id };
      });
      setPartOptions(options);
      setPartMap(map);
    } catch (error) {
      console.error("Failed to load part options:", error);
      setPartOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadDepartments();
      loadParts();
    }
  }, [orgId, branch, loadDepartments, loadParts]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemarksChange = (e) => {
    const { name, value } = e.target;
    setRemarks((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemarksToggle = (name, value) => {
    setRemarks((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoresChange = (e) => {
    const { name, value } = e.target;
    setStoresLogistics((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockAtChange = (e) => {
    const { name, value } = e.target;
    setStockAt((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocsObsoleteChange = (e) => {
    const { name, value } = e.target;
    setDocsObsolete((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocsObsoleteToggle = (name, value) => {
    setDocsObsolete((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidationChange = (e) => {
    const { name, value } = e.target;
    setValidation((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidationToggle = (name, value) => {
    setValidation((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidationFile = (name, file) => {
    setValidation((prev) => ({ ...prev, [name]: file }));
  };

  const handleCftChange = (e) => {
    const { name, value } = e.target;
    setCft((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartCellChange = (idx, key, value) => {
    setPartRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "partNo") {
          const item = partMap[value];
          next.partDescription = item?.itemDescription || "";
        }
        return next;
      }),
    );
  };

  const handleAddPartRow = () =>
    setPartRows((prev) => [...prev, emptyPartRow()]);
  const handleRemovePartRow = (idx) =>
    setPartRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddChangeRow = () =>
    setChangeRequiredRows((prev) => [...prev, emptyChangeRow()]);
  const handleRemoveChangeRow = (idx) =>
    setChangeRequiredRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddProcessRow = () =>
    setProcessRows((prev) => [...prev, emptyProcessRow()]);
  const handleRemoveProcessRow = (idx) =>
    setProcessRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddInspectionRow = () =>
    setInspectionRows((prev) => [...prev, emptyInspectionRow()]);
  const handleRemoveInspectionRow = (idx) =>
    setInspectionRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddDocChangeIRow = () =>
    setDocChangesIRows((prev) => [...prev, emptyDocChangeRow()]);
  const handleRemoveDocChangeIRow = (idx) =>
    setDocChangesIRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddDocChangeIIRow = () =>
    setDocChangesIIRows((prev) => [...prev, emptyDocChangeRow()]);
  const handleRemoveDocChangeIIRow = (idx) =>
    setDocChangesIIRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddDrawingRow = () =>
    setDrawingRows((prev) => [...prev, emptyDrawingRow()]);
  const handleRemoveDrawingRow = (idx) =>
    setDrawingRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddBomRow = () =>
    setBomRows((prev) => [...prev, emptyBomRow()]);
  const handleRemoveBomRow = (idx) =>
    setBomRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.ecnNo?.trim()) errors.ecnNo = "ECN No is required";
    if (!header.ecnDate) errors.ecnDate = "Date is required";
    if (!header.fromDepartment)
      errors.fromDepartment = "From Department is required";

    const hasValidPart = partRows.some((r) => r.partNo);
    if (!hasValidPart)
      errors.partDetails = "Add at least one Part with a Part No";

    if (!reasonForChange?.trim())
      errors.reasonForChange = "Reason For Change is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + all tab data. The backend keeps
    // the complete change history with approval tracking across departments
    // (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      partDetails: partRows.filter((r) => r.partNo?.trim()),
      reasonForChange,
      remarks,
      changeRequired: changeRequiredRows.filter(
        (r) => r.detailI?.trim() || r.detailII?.trim(),
      ),
      processChanges: processRows.filter(
        (r) => r.processChangeRequired?.trim() || r.actions?.trim(),
      ),
      inspectionTesting: inspectionRows.filter(
        (r) => r.required?.trim() || r.newGaugeTestMethod?.trim(),
      ),
      storesLogistics,
      stockAt,
      docsObsolete,
      docChangesI: docChangesIRows.filter((r) => r.documentName?.trim()),
      docChangesII: docChangesIIRows.filter((r) => r.documentName?.trim()),
      validation: {
        ...validation,
        processValidationReport:
          validation.processValidationReport instanceof File
            ? validation.processValidationReport.name
            : validation.processValidationReport || "",
        designValidationReport:
          validation.designValidationReport instanceof File
            ? validation.designValidationReport.name
            : validation.designValidationReport || "",
      },
      conclusionNotes,
      pdfDrawing: drawingRows
        .filter((r) => r.drawing)
        .map((r) => ({
          fileName:
            r.drawing instanceof File ? r.drawing.name : r.drawing,
          partNo: r.partNo,
          issue: r.issue,
          remark: r.remark,
        })),
      pdfBom: bomRows
        .filter((r) => r.bomCopy)
        .map((r) => ({
          fileName: r.bomCopy instanceof File ? r.bomCopy.name : r.bomCopy,
        })),
      cft,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await engineeringChangeNoteAPI.createUpdateEcn(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Engineering Change Note updated successfully!"
              : "Engineering Change Note created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Engineering Change Note.",
        );
      }
    } catch (err) {
      console.error("Save Engineering Change Note Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
        );
      } else {
        addToast("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);
  const isTableTab = ["table", "attachments"].includes(activeTabMeta.kind);

  const addRowForTab = () => {
    switch (activeChildTab) {
      case "partDetails":
        return handleAddPartRow();
      case "changeRequired":
        return handleAddChangeRow();
      case "processChanges":
        return handleAddProcessRow();
      case "inspectionTesting":
        return handleAddInspectionRow();
      case "docsChangesI":
        return handleAddDocChangeIRow();
      case "docsChangesII":
        return handleAddDocChangeIIRow();
      case "pdfAttachments":
        return handleAddDrawingRow();
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
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data
            ? "Edit Engineering Change Note"
            : "Add Engineering Change Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Engineering Change Note</SectionHeader>
          <div className={fieldGrid}>
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
              label="ECN No"
              name="ecnNo"
              value={header.ecnNo}
              onChange={handleHeaderChange}
              error={fieldErrors.ecnNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Date"
              name="ecnDate"
              value={header.ecnDate}
              onChange={handleHeaderChange}
              error={fieldErrors.ecnDate}
              required
              disabled
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
              label="Product Name"
              name="productName"
              value={header.productName}
              onChange={handleHeaderChange}
            />
            <Field
              label="Customer Name"
              name="customerName"
              value={header.customerName}
              onChange={handleHeaderChange}
            />
            <Field
              label="Product No"
              name="productNo"
              value={header.productNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Customer Part No"
              name="customerPartNo"
              value={header.customerPartNo}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isTableTab && (
              <button
                type="button"
                onClick={addRowForTab}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Part Details */}
          {activeChildTab === "partDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "partNo",
                    label: "Part No",
                    type: "select",
                    options: partOptions,
                  },
                  {
                    key: "partDescription",
                    label: "Part Description",
                    readOnly: true,
                  },
                ]}
                rows={partRows}
                onCellChange={handlePartCellChange}
                onRemoveRow={handleRemovePartRow}
              />
              {fieldErrors.partDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.partDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Reason For Change */}
          {activeChildTab === "reasonForChange" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Reason For Change"
                  name="reasonForChange"
                  value={reasonForChange}
                  onChange={(e) => {
                    if (fieldErrors.reasonForChange)
                      setFieldErrors((prev) => ({
                        ...prev,
                        reasonForChange: "",
                      }));
                    setReasonForChange(e.target.value);
                  }}
                  error={fieldErrors.reasonForChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 3: Remarks */}
          {activeChildTab === "remarks" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={remarks.remarks}
                  onChange={handleRemarksChange}
                />
                <Field
                  type="select"
                  label="Changes Accepted"
                  name="changesAccepted"
                  value={remarks.changesAccepted}
                  onChange={handleRemarksChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Changes Rejected"
                  name="changesRejected"
                  value={remarks.changesRejected}
                  onChange={handleRemarksChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Approved By"
                  name="approvedBy"
                  value={remarks.approvedBy}
                  onChange={handleRemarksChange}
                  options={APPROVED_BY}
                />
                <div>
                  <ToggleField
                    label="Approval Status"
                    name="approvalStatus"
                    value={remarks.approvalStatus}
                    onChange={handleRemarksToggle}
                    options={["Yes", "No"]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Change Required */}
          {activeChildTab === "changeRequired" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "detailI",
                    label: "Indicate Changes in Detail I",
                  },
                  {
                    key: "detailII",
                    label: "Indicate Changes in Detail II",
                  },
                ]}
                rows={changeRequiredRows}
                onCellChange={(idx, key, value) =>
                  setChangeRequiredRows((prev) =>
                    prev.map((row, i) =>
                      i === idx ? { ...row, [key]: value } : row,
                    ),
                  )
                }
                onRemoveRow={handleRemoveChangeRow}
              />
            </div>
          )}

          {/* Tab 5: Process Changes */}
          {activeChildTab === "processChanges" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "processChangeRequired",
                    label: "Process Change Required",
                  },
                  {
                    key: "affectsLayoutFlow",
                    label: "Does this affect Layout/Flow",
                    type: "toggle",
                  },
                  { key: "actions", label: "Actions" },
                  {
                    key: "estimatedCost",
                    label: "Estimated Cost",
                    type: "number",
                  },
                  {
                    key: "leadTimeRequired",
                    label: "Lead Time Required",
                    type: "number",
                  },
                ]}
                rows={processRows}
                onCellChange={(idx, key, value) =>
                  setProcessRows((prev) =>
                    prev.map((row, i) =>
                      i === idx ? { ...row, [key]: value } : row,
                    ),
                  )
                }
                onRemoveRow={handleRemoveProcessRow}
              />
            </div>
          )}

          {/* Tab 6: Inspection & Testing Operations */}
          {activeChildTab === "inspectionTesting" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "required", label: "Required" },
                  {
                    key: "newGaugeTestMethod",
                    label: "New Gauge/Test Method",
                  },
                  {
                    key: "estimatedCost",
                    label: "Estimated Cost",
                    type: "number",
                  },
                  {
                    key: "leadTimeRequired",
                    label: "Lead Time Required",
                    type: "number",
                  },
                ]}
                rows={inspectionRows}
                onCellChange={(idx, key, value) =>
                  setInspectionRows((prev) =>
                    prev.map((row, i) =>
                      i === idx ? { ...row, [key]: value } : row,
                    ),
                  )
                }
                onRemoveRow={handleRemoveInspectionRow}
              />
            </div>
          )}

          {/* Tab 7: Stores & Logistics */}
          {activeChildTab === "storesLogistics" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Stores"
                  name="stores"
                  value={storesLogistics.stores}
                  onChange={handleStoresChange}
                />
                <Field
                  type="number"
                  label="WIP"
                  name="wip"
                  value={storesLogistics.wip}
                  onChange={handleStoresChange}
                />
                <Field
                  type="textarea"
                  label="Supplier (incl. PO reference)"
                  name="supplier"
                  value={storesLogistics.supplier}
                  onChange={handleStoresChange}
                />
                <Field
                  type="number"
                  label="Cost of Stock + WIP (scrap cost)"
                  name="costStockWip"
                  value={storesLogistics.costStockWip}
                  onChange={handleStoresChange}
                />
              </div>
            </div>
          )}

          {/* Tab 8: What is the Stock at */}
          {activeChildTab === "stockAt" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Current Stock"
                  name="currentStock"
                  value={stockAt.currentStock}
                  onChange={handleStockAtChange}
                />
                <Field
                  type="select"
                  label="Stock Location"
                  name="stockLocation"
                  value={stockAt.stockLocation}
                  onChange={handleStockAtChange}
                  options={STOCK_LOCATIONS}
                />
                <Field
                  type="select"
                  label="Stock Status"
                  name="stockStatus"
                  value={stockAt.stockStatus}
                  onChange={handleStockAtChange}
                  options={STOCK_STATUS}
                />
              </div>
            </div>
          )}

          {/* Tab 9: Documents/Drawings/Records to be corrected/To be made obsolete */}
          {activeChildTab === "docsObsolete" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Document Type"
                  name="documentType"
                  value={docsObsolete.documentType}
                  onChange={handleDocsObsoleteChange}
                  options={DOCUMENT_TYPES}
                />
                <Field
                  label="Document Reference No"
                  name="documentReferenceNo"
                  value={docsObsolete.documentReferenceNo}
                  onChange={handleDocsObsoleteChange}
                />
                <div>
                  <ToggleField
                    label="Obsolete Status"
                    name="obsoleteStatus"
                    value={docsObsolete.obsoleteStatus}
                    onChange={handleDocsObsoleteToggle}
                    options={["Yes", "No"]}
                  />
                </div>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={docsObsolete.remarks}
                  onChange={handleDocsObsoleteChange}
                />
              </div>
            </div>
          )}

          {/* Tab 10: Documents Changes Required I */}
          {activeChildTab === "docsChangesI" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "documentName", label: "Document Name" },
                  {
                    key: "changeRequired",
                    label: "Change Required",
                    type: "textarea",
                  },
                ]}
                rows={docChangesIRows}
                onCellChange={(idx, key, value) =>
                  setDocChangesIRows((prev) =>
                    prev.map((row, i) =>
                      i === idx ? { ...row, [key]: value } : row,
                    ),
                  )
                }
                onRemoveRow={handleRemoveDocChangeIRow}
              />
            </div>
          )}

          {/* Tab 11: Documents Changes Required II */}
          {activeChildTab === "docsChangesII" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "documentName", label: "Document Name" },
                  {
                    key: "changeRequired",
                    label: "Change Required",
                    type: "textarea",
                  },
                ]}
                rows={docChangesIIRows}
                onCellChange={(idx, key, value) =>
                  setDocChangesIIRows((prev) =>
                    prev.map((row, i) =>
                      i === idx ? { ...row, [key]: value } : row,
                    ),
                  )
                }
                onRemoveRow={handleRemoveDocChangeIIRow}
              />
            </div>
          )}

          {/* Tab 12: Stock and Design/Process Validation */}
          {activeChildTab === "validation" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Existing Stock can be used till exhausted"
                  name="existingStockUse"
                  value={validation.existingStockUse}
                  onChange={handleValidationChange}
                  options={YES_NO}
                />
                <Field
                  type="number"
                  label="If No, Cost of Obsolescence"
                  name="obsolescenceCost"
                  value={validation.obsolescenceCost}
                  onChange={handleValidationChange}
                />
                <Field
                  type="select"
                  label="Process Validation Required"
                  name="processValidationRequired"
                  value={validation.processValidationRequired}
                  onChange={handleValidationChange}
                  options={VALIDATION_REQUIRED}
                />
                <Field
                  label="Process Validation Detail"
                  name="processValidationDetail"
                  value={validation.processValidationDetail}
                  onChange={handleValidationChange}
                />
                <div>
                  <label className={labelClasses}>Process Validation Report</label>
                  <UploadCell
                    file={validation.processValidationReport}
                    onFileChange={(f) =>
                      handleValidationFile("processValidationReport", f)
                    }
                  />
                </div>
                <Field
                  type="select"
                  label="Design Validation Required"
                  name="designValidationRequired"
                  value={validation.designValidationRequired}
                  onChange={handleValidationChange}
                  options={VALIDATION_REQUIRED}
                />
                <Field
                  label="Design Validation Detail"
                  name="designValidationDetail"
                  value={validation.designValidationDetail}
                  onChange={handleValidationChange}
                />
                <div>
                  <label className={labelClasses}>Design Validation Report</label>
                  <UploadCell
                    file={validation.designValidationReport}
                    onFileChange={(f) =>
                      handleValidationFile("designValidationReport", f)
                    }
                  />
                </div>
                <Field
                  type="select"
                  label="BOM Change Required"
                  name="bomChangeRequired"
                  value={validation.bomChangeRequired}
                  onChange={handleValidationChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="If Yes, Mention"
                  name="bomChangeMention"
                  value={validation.bomChangeMention}
                  onChange={handleValidationChange}
                />
                <Field
                  type="date"
                  label="Expected Date of Completion"
                  name="expectedDateOfCompletion"
                  value={validation.expectedDateOfCompletion}
                  onChange={handleValidationChange}
                />
              </div>
            </div>
          )}

          {/* Tab 13: Conclusion */}
          {activeChildTab === "conclusion" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Conclusion Notes"
                  name="conclusionNotes"
                  value={conclusionNotes}
                  onChange={(e) => setConclusionNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Tab 14: Pdf Attachments */}
          {activeChildTab === "pdfAttachments" && (
            <div className="pt-3 space-y-4">
              <div>
                <SectionHeader>Pdf Attachment Drawing</SectionHeader>
                <UploadGrid
                  columns={[
                    { key: "drawing", label: "Drawing", type: "upload" },
                    { key: "partNo", label: "Part No" },
                    { key: "issue", label: "Issue" },
                    { key: "remark", label: "Remark" },
                  ]}
                  rows={drawingRows}
                  onCellChange={(idx, key, value) =>
                    setDrawingRows((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, [key]: value } : row,
                      ),
                    )
                  }
                  onRemoveRow={handleRemoveDrawingRow}
                />
              </div>

              <div>
                <SectionHeader>Pdf Attachment BOM</SectionHeader>
                <UploadGrid
                  columns={[
                    { key: "bomCopy", label: "BOM Copy", type: "upload" },
                  ]}
                  rows={bomRows}
                  onCellChange={(idx, key, value) =>
                    setBomRows((prev) =>
                      prev.map((row, i) =>
                        i === idx ? { ...row, [key]: value } : row,
                      ),
                    )
                  }
                  onRemoveRow={handleRemoveBomRow}
                />
              </div>
            </div>
          )}

          {/* Tab 15: CFT Approval/Concurrence */}
          {activeChildTab === "cftApproval" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Approval by TDC Manager"
                  name="tdcManager"
                  value={cft.tdcManager}
                  onChange={handleCftChange}
                  options={DECISION}
                />
                <Field
                  type="select"
                  label="Accepted by QAD Manager"
                  name="qadManager"
                  value={cft.qadManager}
                  onChange={handleCftChange}
                  options={DECISION}
                />
                <Field
                  type="select"
                  label="Accepted by Purchase Manager"
                  name="purchaseManager"
                  value={cft.purchaseManager}
                  onChange={handleCftChange}
                  options={DECISION}
                />
                <Field
                  type="select"
                  label="Accepted by Production Manager"
                  name="productionManager"
                  value={cft.productionManager}
                  onChange={handleCftChange}
                  options={DECISION}
                />
                <Field
                  type="select"
                  label="Accepted by Stores Manager"
                  name="storesManager"
                  value={cft.storesManager}
                  onChange={handleCftChange}
                  options={DECISION}
                />

                <Field
                  type="textarea"
                  label="Non-Accepted Reason (TDC Manager)"
                  name="tdcNonAcceptedReason"
                  value={cft.tdcNonAcceptedReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (QAD Manager)"
                  name="qadNonAcceptedReason"
                  value={cft.qadNonAcceptedReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (Purchase Manager)"
                  name="purchaseNonAcceptedReason"
                  value={cft.purchaseNonAcceptedReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (Production Manager)"
                  name="productionNonAcceptedReason"
                  value={cft.productionNonAcceptedReason}
                  onChange={handleCftChange}
                />
                <Field
                  type="textarea"
                  label="Non-Accepted Reason (Stores Manager)"
                  name="storesNonAcceptedReason"
                  value={cft.storesNonAcceptedReason}
                  onChange={handleCftChange}
                />

                <Field
                  type="select"
                  label="Control Plan Reviewed & Updated"
                  name="controlPlanReviewed"
                  value={cft.controlPlanReviewed}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Change in Work Instruction/SOP"
                  name="workInstructionSopChange"
                  value={cft.workInstructionSopChange}
                  onChange={handleCftChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Customer Approval Required/Not Required"
                  name="customerApproval"
                  value={cft.customerApproval}
                  onChange={handleCftChange}
                  options={CUSTOMER_APPROVAL}
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

export default EcnForm;
