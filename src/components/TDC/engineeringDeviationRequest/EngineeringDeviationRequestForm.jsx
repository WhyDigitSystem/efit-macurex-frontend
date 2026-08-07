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
import engineeringDeviationRequestAPI from "../../../api/TDC/engineeringDeviationRequestAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";

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

/* File upload cell: drag-and-drop or click-to-upload. Displays the chosen
   file name; supports both new Files and existing names during edit. */
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
        accept="application/pdf,.pdf,.docx,.xlsx,.png,.jpg,.jpeg"
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

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const YES_NO = ["Yes", "No"];
const NATURE_OF_DEVIATION = [
  "Minor",
  "Major",
  "Critical",
  "Process Deviation",
  "Supplier Deviation",
];
const DISPOSITIONS = [
  "Approved",
  "Approved with Condition",
  "Not Approved",
  "Pending",
];

const CHILD_TABS = [
  { key: "requestOfDeviation", label: "Request of Deviation", kind: "fields" },
  { key: "reviewOfDeviation", label: "Review of Deviation", kind: "fields" },
  { key: "deviationApprovedBy", label: "Deviation Approved By", kind: "fields" },
  {
    key: "customerIntimation",
    label: "Customer Intimation and Feedback",
    kind: "fields",
  },
  { key: "pdfAttachment", label: "Pdf Attachment", kind: "table" },
];

const emptyPdfRow = () => ({
  referenceAttachFile: null,
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateRequestNo = () =>
  `EDR-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const EngineeringDeviationRequestForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const [activeChildTab, setActiveChildTab] = useState("requestOfDeviation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      date: data?.date || dayjs().format("YYYY-MM-DD"),
      requestNo: data?.requestNo || (data ? "" : generateRequestNo()),
      to: data?.to?.id ?? data?.to ?? "",
      deviationRequestedBy:
        data?.deviationRequestedBy?.id ?? data?.deviationRequestedBy ?? "",
      partDescription: data?.partDescription || "",
      customerId: data?.customerId?.id ?? data?.customerId ?? "",
      productName: data?.productName || "",
      quantityReceived: data?.quantityReceived ?? "",
      supplier: data?.supplier || "",
      deviationApprovedBy:
        data?.deviationApprovedBy?.id ?? data?.deviationApprovedBy ?? "",
      partNoDrawingNo: data?.partNoDrawingNo || "",
      invoiceNo: data?.invoiceNo || "",
      active: data?.active !== false,
    };
    base.date = fmtDate(base.date);
    return base;
  });

  const [requestOfDeviation, setRequestOfDeviation] = useState({
    descriptionOfNc: data?.requestOfDeviation?.descriptionOfNc || "",
    reasonForDeviationRequest:
      data?.requestOfDeviation?.reasonForDeviationRequest || "",
    actionOnNc: data?.requestOfDeviation?.actionOnNc || "",
    deviationPeriodFrom:
      fmtDate(data?.requestOfDeviation?.deviationPeriodFrom) || "",
    deviationPeriodTo: fmtDate(data?.requestOfDeviation?.deviationPeriodTo) || "",
    responsibleForName:
      data?.requestOfDeviation?.responsibleForName?.id ??
      data?.requestOfDeviation?.responsibleForName ??
      "",
    department:
      data?.requestOfDeviation?.department?.id ??
      data?.requestOfDeviation?.department ??
      "",
  });

  const [reviewOfDeviation, setReviewOfDeviation] = useState({
    affectFit: data?.reviewOfDeviation?.affectFit || "",
    affectForm: data?.reviewOfDeviation?.affectForm || "",
    affectFunction: data?.reviewOfDeviation?.affectFunction || "",
    affectSafety: data?.reviewOfDeviation?.affectSafety || "",
    natureOfDeviationRequest:
      data?.reviewOfDeviation?.natureOfDeviationRequest || "",
    intimatedToCustomer: data?.reviewOfDeviation?.intimatedToCustomer || "",
    note: data?.reviewOfDeviation?.note || "",
  });

  const [approvals, setApprovals] = useState({
    productionManager: data?.approvals?.productionManager?.id ?? data?.approvals?.productionManager ?? "",
    productionDisposition: data?.approvals?.productionDisposition || "",
    qualityManager: data?.approvals?.qualityManager?.id ?? data?.approvals?.qualityManager ?? "",
    qualityDisposition: data?.approvals?.qualityDisposition || "",
    tdcManager: data?.approvals?.tdcManager?.id ?? data?.approvals?.tdcManager ?? "",
    tdcDisposition: data?.approvals?.tdcDisposition || "",
    directorTechnical: data?.approvals?.directorTechnical?.id ?? data?.approvals?.directorTechnical ?? "",
    directorTechnicalDisposition: data?.approvals?.directorTechnicalDisposition || "",
    purchaseManager: data?.approvals?.purchaseManager?.id ?? data?.approvals?.purchaseManager ?? "",
    purchaseDisposition: data?.approvals?.purchaseDisposition || "",
  });

  const [customerIntimation, setCustomerIntimation] = useState({
    intimationModeRef: data?.customerIntimation?.intimationModeRef || "",
    customerFeedback: data?.customerIntimation?.customerFeedback || "",
    feedbackModeRef: data?.customerIntimation?.feedbackModeRef || "",
    decision: data?.customerIntimation?.decision || "",
  });

  const [pdfRows, setPdfRows] = useState(
    data?.pdfAttachments?.length
      ? data.pdfAttachments.map((p) => ({
          referenceAttachFile: p.fileName || p.referenceAttachFile || null,
        }))
      : [emptyPdfRow()],
  );

  /* ---------------- Lookup loading ---------------- */

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId, branch);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      if (departments.length) {
        setDepartmentOptions(
          departments.map((d) => ({ value: d.id, label: d.departmentName })),
        );
      } else {
        setDepartmentOptions(["Design", "Purchase", "Stores", "Quality", "Production"]);
      }
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions(["Design", "Purchase", "Stores", "Quality", "Production"]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerName || c.docId || c.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId && branch) {
      loadDepartments();
      loadEmployees();
      loadCustomers();
    }
  }, [orgId, branch, loadDepartments, loadEmployees, loadCustomers]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setRequestOfDeviation((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewOfDeviation((prev) => ({ ...prev, [name]: value }));
  };

  const handleApprovalsChange = (e) => {
    const { name, value } = e.target;
    setApprovals((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerIntimationChange = (e) => {
    const { name, value } = e.target;
    setCustomerIntimation((prev) => ({ ...prev, [name]: value }));
  };

  const handlePdfFileChange = (idx, file) => {
    setPdfRows((prev) =>
      prev.map((row, i) =>
        i !== idx ? row : { ...row, referenceAttachFile: file },
      ),
    );
  };

  const handleAddPdfRow = () =>
    setPdfRows((prev) => [...prev, emptyPdfRow()]);
  const handleRemovePdfRow = (idx) =>
    setPdfRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.date) errors.date = "Date is required";
    if (!header.requestNo?.trim()) errors.requestNo = "Request No is required";
    if (!header.to) errors.to = "To is required";
    if (!header.deviationRequestedBy)
      errors.deviationRequestedBy = "Deviation Requested By is required";
    if (!header.customerId) errors.customerId = "Customer ID is required";
    if (!header.deviationApprovedBy)
      errors.deviationApprovedBy = "Deviation Request Approved By is required";

    if (!requestOfDeviation.descriptionOfNc?.trim())
      errors.descriptionOfNc = "Description of the NC is required";
    if (!requestOfDeviation.reasonForDeviationRequest?.trim())
      errors.reasonForDeviationRequest =
        "Reason for Deviation Request is required";
    if (!requestOfDeviation.responsibleForName)
      errors.responsibleForName = "Responsible For Name is required";
    if (!requestOfDeviation.department)
      errors.department = "Department is required";

    if (requestOfDeviation.deviationPeriodFrom &&
        requestOfDeviation.deviationPeriodTo &&
        dayjs(requestOfDeviation.deviationPeriodTo).isBefore(
          dayjs(requestOfDeviation.deviationPeriodFrom),
        )) {
      errors.deviationPeriod =
        "Deviation Period 'To' must be on or after 'From'";
    }

    const hasValidPdf = pdfRows.some(
      (r) =>
        r.referenceAttachFile instanceof File || r.referenceAttachFile,
    );
    if (!hasValidPdf)
      errors.pdfAttachments =
        "Attach at least one reference file in the Pdf Attachment tab";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + request/review/approvals/
    // customer feedback + PDF attachments. The backend keeps the complete
    // deviation history with approval tracking (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      requestOfDeviation,
      reviewOfDeviation,
      approvals,
      customerIntimation,
      pdfAttachments: pdfRows
        .filter((r) => r.referenceAttachFile)
        .map((r) => ({
          fileName:
            r.referenceAttachFile instanceof File
              ? r.referenceAttachFile.name
              : r.referenceAttachFile,
        })),
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await engineeringDeviationRequestAPI.createUpdateEdr(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Engineering Deviation Request updated successfully!"
              : "Engineering Deviation Request created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Engineering Deviation Request.",
        );
      }
    } catch (err) {
      console.error("Save Engineering Deviation Request Error:", err);
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
            ? "Edit Engineering Deviation Request/Note"
            : "Add Engineering Deviation Request/Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Engineering Deviation Request/Note</SectionHeader>
          <div className={fieldGrid}>
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
              label="Request No"
              name="requestNo"
              value={header.requestNo}
              onChange={handleHeaderChange}
              error={fieldErrors.requestNo}
              required
              disabled={!data}
            />
            <Field
              type="select"
              label="To"
              name="to"
              value={header.to}
              onChange={handleHeaderChange}
              error={fieldErrors.to}
              options={departmentOptions}
              required
            />
            <Field
              type="select"
              label="Deviation Requested By"
              name="deviationRequestedBy"
              value={header.deviationRequestedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.deviationRequestedBy}
              options={employeeOptions}
              required
            />
            <Field
              label="Part Description"
              name="partDescription"
              value={header.partDescription}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Customer ID"
              name="customerId"
              value={header.customerId}
              onChange={handleHeaderChange}
              error={fieldErrors.customerId}
              options={customerOptions}
              required
            />
            <Field
              label="Product Name"
              name="productName"
              value={header.productName}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Quantity Received"
              name="quantityReceived"
              value={header.quantityReceived}
              onChange={handleHeaderChange}
            />
            <Field
              label="Supplier"
              name="supplier"
              value={header.supplier}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Deviation Request Approved By"
              name="deviationApprovedBy"
              value={header.deviationApprovedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.deviationApprovedBy}
              options={employeeOptions}
              required
            />
            <Field
              label="Part No / Drawing No"
              name="partNoDrawingNo"
              value={header.partNoDrawingNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Invoice No"
              name="invoiceNo"
              value={header.invoiceNo}
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

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={handleAddPdfRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Request of Deviation */}
          {activeChildTab === "requestOfDeviation" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Description of the NC"
                  name="descriptionOfNc"
                  value={requestOfDeviation.descriptionOfNc}
                  onChange={handleRequestChange}
                  error={fieldErrors.descriptionOfNc}
                  required
                />
                <Field
                  type="textarea"
                  label="Reason for Deviation Request"
                  name="reasonForDeviationRequest"
                  value={requestOfDeviation.reasonForDeviationRequest}
                  onChange={handleRequestChange}
                  error={fieldErrors.reasonForDeviationRequest}
                  required
                />
                <Field
                  type="textarea"
                  label="Action on NC"
                  name="actionOnNc"
                  value={requestOfDeviation.actionOnNc}
                  onChange={handleRequestChange}
                />
                <Field
                  type="date"
                  label="Deviation Period (From)"
                  name="deviationPeriodFrom"
                  value={requestOfDeviation.deviationPeriodFrom}
                  onChange={handleRequestChange}
                />
                <Field
                  type="date"
                  label="Deviation Period (To)"
                  name="deviationPeriodTo"
                  value={requestOfDeviation.deviationPeriodTo}
                  onChange={handleRequestChange}
                  error={fieldErrors.deviationPeriod}
                />
                <Field
                  type="select"
                  label="Responsible For Name"
                  name="responsibleForName"
                  value={requestOfDeviation.responsibleForName}
                  onChange={handleRequestChange}
                  error={fieldErrors.responsibleForName}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Department"
                  name="department"
                  value={requestOfDeviation.department}
                  onChange={handleRequestChange}
                  error={fieldErrors.department}
                  options={departmentOptions}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 2: Review of Deviation */}
          {activeChildTab === "reviewOfDeviation" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Will the NC affect Fit?"
                  name="affectFit"
                  value={reviewOfDeviation.affectFit}
                  onChange={handleReviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Will the NC affect Form?"
                  name="affectForm"
                  value={reviewOfDeviation.affectForm}
                  onChange={handleReviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Will the NC affect Function?"
                  name="affectFunction"
                  value={reviewOfDeviation.affectFunction}
                  onChange={handleReviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Will the NC affect Safety?"
                  name="affectSafety"
                  value={reviewOfDeviation.affectSafety}
                  onChange={handleReviewChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Nature of the Deviation Request"
                  name="natureOfDeviationRequest"
                  value={reviewOfDeviation.natureOfDeviationRequest}
                  onChange={handleReviewChange}
                  options={NATURE_OF_DEVIATION}
                />
                <Field
                  type="select"
                  label="To be Intimated to Customer and Action on Feedback"
                  name="intimatedToCustomer"
                  value={reviewOfDeviation.intimatedToCustomer}
                  onChange={handleReviewChange}
                  options={YES_NO}
                />
                <Field
                  type="textarea"
                  label="Note"
                  name="note"
                  value={reviewOfDeviation.note}
                  onChange={handleReviewChange}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Deviation Approved By */}
          {activeChildTab === "deviationApprovedBy" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Production Manager"
                  name="productionManager"
                  value={approvals.productionManager}
                  onChange={handleApprovalsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Production Disposition"
                  name="productionDisposition"
                  value={approvals.productionDisposition}
                  onChange={handleApprovalsChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="Quality Manager"
                  name="qualityManager"
                  value={approvals.qualityManager}
                  onChange={handleApprovalsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Quality Disposition"
                  name="qualityDisposition"
                  value={approvals.qualityDisposition}
                  onChange={handleApprovalsChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="TDC Manager"
                  name="tdcManager"
                  value={approvals.tdcManager}
                  onChange={handleApprovalsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="TDC Disposition"
                  name="tdcDisposition"
                  value={approvals.tdcDisposition}
                  onChange={handleApprovalsChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="Director Technical"
                  name="directorTechnical"
                  value={approvals.directorTechnical}
                  onChange={handleApprovalsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Director Technical Disposition"
                  name="directorTechnicalDisposition"
                  value={approvals.directorTechnicalDisposition}
                  onChange={handleApprovalsChange}
                  options={DISPOSITIONS}
                />
                <Field
                  type="select"
                  label="Purchase Manager"
                  name="purchaseManager"
                  value={approvals.purchaseManager}
                  onChange={handleApprovalsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Purchase Disposition"
                  name="purchaseDisposition"
                  value={approvals.purchaseDisposition}
                  onChange={handleApprovalsChange}
                  options={DISPOSITIONS}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Customer Intimation and Feedback */}
          {activeChildTab === "customerIntimation" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  label="Customer Intimation Mode and Reference"
                  name="intimationModeRef"
                  value={customerIntimation.intimationModeRef}
                  onChange={handleCustomerIntimationChange}
                />
                <Field
                  type="textarea"
                  label="Customer Feedback"
                  name="customerFeedback"
                  value={customerIntimation.customerFeedback}
                  onChange={handleCustomerIntimationChange}
                />
                <Field
                  label="Customer Feedback Mode and Reference"
                  name="feedbackModeRef"
                  value={customerIntimation.feedbackModeRef}
                  onChange={handleCustomerIntimationChange}
                />
                <Field
                  type="textarea"
                  label="Decision"
                  name="decision"
                  value={customerIntimation.decision}
                  onChange={handleCustomerIntimationChange}
                />
              </div>
            </div>
          )}

          {/* Tab 5: Pdf Attachment */}
          {activeChildTab === "pdfAttachment" && (
            <div className="pt-3">
              <TableWrapper>
                <TableHead
                  headers={["#", "Reference Attach File", "Action"]}
                />
                <tbody>
                  {pdfRows.map((row, idx) => (
                    <TableRow
                      key={idx}
                      index={idx}
                      onRemove={handleRemovePdfRow}
                      disabled={pdfRows.length <= 1}
                    >
                      <UploadCell
                        file={row.referenceAttachFile}
                        onFileChange={(f) => handlePdfFileChange(idx, f)}
                        error={
                          fieldErrors.pdfAttachments && pdfRows.length === 1
                            ? fieldErrors.pdfAttachments
                            : ""
                        }
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
              {fieldErrors.pdfAttachments && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.pdfAttachments}
                </p>
              )}
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

export default EngineeringDeviationRequestForm;
