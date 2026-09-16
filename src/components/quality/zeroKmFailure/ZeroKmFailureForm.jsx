import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import zeroKmFailureAPI from "../../../api/quality/zeroKmFailureAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// Spacious grid for the header section so fields breathe.
const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-x-5 gap-y-4 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-5 gap-y-4 items-start";

const YES_NO = ["Yes", "No"];

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
          value={value ?? ""}
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
          value={value ?? ""}
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
        value={value ?? ""}
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

/* Generic dynamic table. Supports text / number / date / select / textarea /
   readonly columns. Options may be plain strings or { value, label } objects. */
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
                    value={row[col.key] ?? ""}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
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

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    value={row[col.key] ?? ""}
                    rows={1}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-44 h-8 px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
                      "bg-white dark:bg-gray-900 " +
                      "border-gray-300 dark:border-gray-600 " +
                      "text-gray-900 dark:text-gray-100 " +
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                      "dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    }
                  />
                </td>
              );
            }

            if (col.readOnly) {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <div
                    className={cellReadOnlyClasses}
                    title={row[col.key] ?? ""}
                  >
                    {row[col.key] ?? ""}
                  </div>
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={row[col.key] ?? ""}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={cellInputClasses}
                />
              </td>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

const CHILD_TABS = [
  { key: "zeroEntryDetails", label: "Zero Entry Details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
  { key: "cancelInfo", label: "Cancel", kind: "fields" },
];

/* Matches zeroEntryDetailDTO: { id?, partNo, partName, failureQty, reason } */
const emptyDetailRow = () => ({
  partNo: "",
  partName: "",
  failureQty: "",
  reason: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");
const todayISO = () => dayjs().format("YYYY-MM-DD");

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toInteger = (value, fallback = 0) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

/* A detail row counts as "filled" if the user touched Part No or Reason,
   so blank trailing rows aren't sent to the backend. */
const rowHasValue = (row) =>
  String(row.partNo ?? "").trim() !== "" ||
  String(row.reason ?? "").trim() !== "";

/* ---------------------------------------------------------------------------- */

const ZeroKmFailureForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branchId = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const isEditMode = Boolean(data?.id);

  const [activeChildTab, setActiveChildTab] = useState("zeroEntryDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [docIdGenerationFailed, setDocIdGenerationFailed] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [partOptions, setPartOptions] = useState([]);
  const [partMasterMap, setPartMasterMap] = useState({});

  const [header, setHeader] = useState(() => ({
    branch: data?.branch?.id ?? data?.branch ?? branchId ?? "",
    docId: data?.docId || "",
    docDate: fmtDate(data?.docDate) || todayISO(),
    financialYear: data?.financialYear || String(new Date().getFullYear()),
    customer: data?.customer?.id ?? data?.customer ?? "",
    partyName: data?.partyName || "",
    active: data?.active !== false,
  }));

  const [detailRows, setDetailRows] = useState(
    data?.zeroEntryDetailDTO?.length
      ? data.zeroEntryDetailDTO
      : [emptyDetailRow()],
  );

  const [summary, setSummary] = useState({
    remarks: data?.remarks || "",
  });

  const [cancelInfo, setCancelInfo] = useState({
    cancel: data?.cancel ? "Yes" : "No",
    cancelRemarks: data?.cancelRemarks || "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadBranches = useCallback(async () => {
    try {
      if (!orgId) return;
      const res = await branchAPI.getBranchByOrgId(orgId);
      const list = Array.isArray(res)
        ? res
        : res?.paramObjectsMap?.branches ||
          res?.paramObjectsMap?.branchVO ||
          [];
      setBranchOptions(
        list.map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || `Branch ${b.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branch options:", error);
      setBranchOptions([]);
    }
  }, [orgId]);

  /* partyMasterAPI.getPartyByOrgId hits /api/partyMaster/getCustomerByOrgId
     and already unwraps paramObjectsMap.customerList for us. Dropdown shows
     customerCode; Party Name is filled in from customerName of whichever
     customer is selected. */
  const loadCustomers = useCallback(async () => {
    try {
      if (!orgId) return;
      const list = await partyMasterAPI.getPartyByOrgId(orgId, branchId);
      const map = {};
      const options = list.map((c) => {
        map[c.id] = c;
        return { value: c.id, label: c.customerCode || c.id };
      });
      setCustomerOptions(options);
      setCustomerMap(map);
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
      setCustomerMap({});
    }
  }, [orgId, branchId]);

  const loadParts = useCallback(async () => {
    try {
      if (!orgId) return;
      const res = await itemAPI.getItems(orgId, branchId);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode || it.id };
      });
      setPartOptions(options);
      setPartMasterMap(map);
    } catch (error) {
      console.error("Failed to load part options:", error);
      setPartOptions([]);
      setPartMasterMap({});
    }
  }, [orgId, branchId]);

  useEffect(() => {
    loadBranches();
    loadCustomers();
    loadParts();
  }, [loadBranches, loadCustomers, loadParts]);

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generate = async () => {
      setGeneratingDocId(true);
      setDocIdGenerationFailed(false);
      try {
        const docId = await zeroKmFailureAPI.getZeroKmFailureEntryDocId(
          orgId,
          header.financialYear,
        );
        if (!cancelled) {
          setHeader((prev) => ({ ...prev, docId: docId || "" }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error generating Zero Km Failure Entry doc id:",
            error,
          );
        
          addToast(
            error?.message ||
              error?.response?.data?.paramObjectsMap?.errorMessage ||
              "Failed to generate Doc No",
            "error",
          );
          setDocIdGenerationFailed(true);
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.financialYear, isEditMode]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "customer") {
        const customer = customerMap[value];
        next.partyName = customer?.customerName || "";
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "partNo") {
          const part = partMasterMap[value];
          next.partName = part?.itemDescription || part?.partName || "";
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);
  const handleRemoveRow = (idx) =>
    setDetailRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelInfoChange = (e) => {
    const { name, value } = e.target;
    setCancelInfo((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Plant ID is required";
    if (!header.docId) errors.docId = "Doc No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.customer) errors.customer = "Party ID is required";

    const validRows = detailRows.filter(rowHasValue);
    if (!validRows.length) {
      errors.zeroEntryDetails =
        "Add at least one Zero Entry Details row with Part No";
    }
    validRows.forEach((r, i) => {
      if (!r.partNo?.trim())
        errors[`detail.${i}.partNo`] = "Part No is required";
      if (
        r.failureQty === "" ||
        r.failureQty === null ||
        r.failureQty === undefined
      )
        errors[`detail.${i}.failureQty`] = "Failure Qty is required";
      if (!r.reason?.trim())
        errors[`detail.${i}.reason`] = "Reason is required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    // Payload shape matches zeroKmFailureEntryDTO exactly.
    const payload = {
      ...(isEditMode && { id: data.id }),
      orgId,
      branch: toInteger(header.branch),
      docId: header.docId || "",
      docDate: header.docDate || todayISO(),
      financialYear: header.financialYear || String(new Date().getFullYear()),
      customer: toInteger(header.customer),
      partyName: header.partyName || "",
      active: header.active !== false,
      remarks: summary.remarks || "",
      cancel: cancelInfo.cancel === "Yes",
      cancelRemarks: cancelInfo.cancelRemarks || "",

      zeroEntryDetailDTO: detailRows.filter(rowHasValue).map((row) => ({
        ...(row.id ? { id: row.id } : {}),
        partNo: toInteger(row.partNo),
        partName: row.partName || "",
        failureQty: toNumber(row.failureQty),
        reason: row.reason || "",
      })),

      createdBy: isEditMode ? data?.createdBy || usersId : usersId,
      ...(isEditMode && { updatedBy: usersId }),
    };

    try {
      const response =
        await zeroKmFailureAPI.createUpdateZeroKmFailureEntry(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isEditMode
              ? "Zero Km Failure Entry updated successfully!"
              : "Zero Km Failure Entry created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Zero Km Failure Entry.",
        );
      }
    } catch (err) {
      console.error("Save Zero Km Failure Entry Error:", err);
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
          {isEditMode
            ? "Edit Zero Km Failure Entry"
            : "Add Zero Km Failure Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Zero Km Failure Entry</SectionHeader>
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
              label="Doc No"
              name="docId"
              value={generatingDocId ? "Generating..." : header.docId}
              onChange={docIdGenerationFailed ? handleHeaderChange : () => {}}
              error={
                fieldErrors.docId ||
                (docIdGenerationFailed
                  ? "Auto-numbering failed — enter a Doc No manually"
                  : "")
              }
              disabled={
                generatingDocId || (isEditMode ? true : !docIdGenerationFailed)
              }
              required
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />
            <Field
              type="select"
              label="Party ID"
              name="customer"
              value={header.customer}
              onChange={handleHeaderChange}
              error={fieldErrors.customer}
              options={customerOptions}
              required
            />
            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Financial Year"
              name="financialYear"
              value={header.financialYear}
              onChange={handleHeaderChange}
              disabled={isEditMode}
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

            {activeTabMeta?.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Zero Entry Details */}
          {activeChildTab === "zeroEntryDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "partNo",
                    label: "Part No",
                    type: "select",
                    options: partOptions,
                  },
                  { key: "partName", label: "Part Name", readOnly: true },
                  { key: "failureQty", label: "Failure Qty", type: "number" },
                  { key: "reason", label: "Reason", type: "textarea" },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.zeroEntryDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.zeroEntryDetails}
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.partNo`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Part No is required in every row
                </p>
              )}
              {detailRows.some(
                (r, i) => fieldErrors[`detail.${i}.failureQty`],
              ) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Failure Qty is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.reason`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Reason is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Cancel */}
          {activeChildTab === "cancelInfo" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Cancel this Entry"
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
                  />
                )}
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={isEditMode ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default ZeroKmFailureForm;
