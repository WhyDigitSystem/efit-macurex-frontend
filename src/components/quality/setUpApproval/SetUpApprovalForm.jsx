import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import setUpApprovalAPI from "../../../api/quality/setUpApprovalAPI";
import controlPlanAPI from "../../../api/quality/controlPlanAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { PARAMETER_TYPES } from "../../../api/quality/parameterMasterAPI";

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

/* Generic dynamic table. Supports text / number / select / textarea /
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
                    value={row[col.key]}
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
                    value={row[col.key]}
                    rows={1}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-40 h-8 px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
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

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const SHIFTS = ["A", "B", "C"];
const RECEIVED_FOR_PRODUCTION = ["Yes", "No"];

const CHILD_TABS = [
  { key: "approvalDetails", label: "Approval Details", kind: "table" },
  { key: "approvalSummary", label: "Approval Summary", kind: "fields" },
  { key: "parameters", label: "Parameters", kind: "table" },
];

const emptyDetailRow = () => ({
  operationNo: "",
  description: "",
  specification: "",
  mv1: "",
  mv2: "",
  mv3: "",
  mv4: "",
  mv5: "",
  mv6: "",
  mv7: "",
  mv8: "",
  time: dayjs().format("HH:mm:ss"),
  remarks: "",
});

const emptyParameterRow = () => ({
  parameter: "",
  parameterType: "",
  tol: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateInspectionNo = () =>
  `SUA-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const SetUpApprovalForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("approvalDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [processSheetOptions, setProcessSheetOptions] = useState([]);
  const [controlPlanOptions, setControlPlanOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      shift: data?.shift || "",
      inspectionNo: data?.inspectionNo || (data ? "" : generateInspectionNo()),
      date: data?.date || dayjs().format("YYYY-MM-DD"),
      itemCode: data?.itemCode?.id ?? data?.itemCode ?? "",
      itemDescription: data?.itemDescription || "",
      processSheetNo: data?.processSheetNo || "",
      drawingNo: data?.drawingNo || "",
      partyId: data?.partyId?.id ?? data?.partyId ?? "",
      partyName: data?.partyName || "",
      controlPlan: data?.controlPlan?.id ?? data?.controlPlan ?? "",
      active: data?.active !== false,
    };
    base.date = fmtDate(base.date);
    return base;
  });

  const [detailRows, setDetailRows] = useState(
    data?.approvalDetails?.length
      ? data.approvalDetails
      : [emptyDetailRow()],
  );

  const [summary, setSummary] = useState({
    checkedBy:
      data?.approvalSummary?.checkedBy?.id ??
      data?.approvalSummary?.checkedBy ??
      "",
    approvedBy:
      data?.approvalSummary?.approvedBy?.id ??
      data?.approvalSummary?.approvedBy ??
      "",
    receivedForProduction:
      data?.approvalSummary?.receivedForProduction || "",
  });

  const [parameterRows, setParameterRows] = useState(
    data?.parameters?.length ? data.parameters : [emptyParameterRow()],
  );

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

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode };
      });
      setItemOptions(options);
      setItemMasterMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [orgId, branch]);

  const loadProcessSheets = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getProcessSheets(orgId);
      setProcessSheetOptions(
        (res || []).map((p) => ({
          value: p.processSheetNo || p.id,
          label: p.processSheetNo || p.processSheetName || p.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load process sheet options:", error);
      setProcessSheetOptions([]);
    }
  }, [orgId]);

  const loadControlPlans = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getControlPlans(orgId);
      setControlPlanOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.planNo || c.controlPlanNo || c.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load control plan options:", error);
      setControlPlanOptions([]);
    }
  }, [orgId]);

  const loadParties = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setPartyOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          partyName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
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

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId) {
      loadItems();
      loadProcessSheets();
      loadControlPlans();
      loadParties();
      loadEmployees();
    }
  }, [
    orgId,
    loadItems,
    loadProcessSheets,
    loadControlPlans,
    loadParties,
    loadEmployees,
  ]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "itemCode") {
        const item = itemMasterMap[value];
        next.itemDescription = item?.itemDescription || "";
        next.drawingNo = item?.drawingNo || item?.itemDrawingNo || "";
      }
      if (name === "partyId") {
        const party = partyOptions.find(
          (p) => String(p.value) === String(value),
        );
        next.partyName = party?.partyName || "";
      }
      if (name === "processSheetNo") {
        next.drawingNo = next.drawingNo || "";
      }
      return next;
    });
  };

  const handleDetailCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddDetailRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);
  const handleRemoveDetailRow = (idx) =>
    setDetailRows((prev) => prev.filter((_, i) => i !== idx));

  const handleParameterCellChange = (idx, key, value) => {
    setParameterRows((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddParameterRow = () =>
    setParameterRows((prev) => [...prev, emptyParameterRow()]);
  const handleRemoveParameterRow = (idx) =>
    setParameterRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.shift) errors.shift = "Shift is required";
    if (!header.inspectionNo?.trim())
      errors.inspectionNo = "Inspection No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";
    if (!header.processSheetNo)
      errors.processSheetNo = "Process Sheet No is required";
    if (!header.partyId) errors.partyId = "Party ID is required";
    if (!header.controlPlan) errors.controlPlan = "Control Plan is required";

    const validDetails = detailRows.filter(
      (r) => r.operationNo?.trim() || r.description?.trim(),
    );
    if (!validDetails.length)
      errors.approvalDetails =
        "Add at least one approval detail row with Operation No or Description";

    const validParameters = parameterRows.filter((r) => r.parameter?.trim());
    if (!validParameters.length)
      errors.parameters = "Add at least one Parameter row with a Parameter";
    validParameters.forEach((r, i) => {
      if (!r.parameter?.trim())
        errors[`parameter.${i}.parameter`] = "Parameter is required";
      if (!r.parameterType)
        errors[`parameter.${i}.parameterType`] = "Parameter Type is required";
      if (!r.tol && Number(r.tol) !== 0)
        errors[`parameter.${i}.tol`] = "TOL is required";
    });

    if (!summary.checkedBy) errors.checkedBy = "Checked By is required";
    if (!summary.approvedBy) errors.approvedBy = "Approved By is required";
    if (!summary.receivedForProduction)
      errors.receivedForProduction = "Received For Production is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + approval details + summary +
    // parameters. The backend maintains the complete approval history with
    // parameters and summary tracking (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      approvalDetails: detailRows.filter(
        (r) => r.operationNo?.trim() || r.description?.trim(),
      ),
      approvalSummary: summary,
      parameters: parameterRows.filter((r) => r.parameter?.trim()),
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await setUpApprovalAPI.createUpdateSetUpApproval(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Set Up Approval updated successfully!"
              : "Set Up Approval created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Set Up Approval.",
        );
      }
    } catch (err) {
      console.error("Save Set Up Approval Error:", err);
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

  const canAddRow =
    activeTabMeta.kind === "table" &&
    ["approvalDetails", "parameters"].includes(activeChildTab);

  const handleAddRow = () => {
    if (activeChildTab === "approvalDetails") handleAddDetailRow();
    else if (activeChildTab === "parameters") handleAddParameterRow();
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
          {data ? "Edit Set Up Approval" : "Add Set Up Approval"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Set Up Approval</SectionHeader>
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
              type="select"
              label="Shift"
              name="shift"
              value={header.shift}
              onChange={handleHeaderChange}
              error={fieldErrors.shift}
              options={SHIFTS}
              required
            />
            <Field
              label="Inspection No"
              name="inspectionNo"
              value={header.inspectionNo}
              onChange={handleHeaderChange}
              error={fieldErrors.inspectionNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              required
            />
            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.itemCode}
              options={itemOptions}
              required
            />
            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Process Sheet No"
              name="processSheetNo"
              value={header.processSheetNo}
              onChange={handleHeaderChange}
              error={fieldErrors.processSheetNo}
              options={processSheetOptions}
              required
            />
            <Field
              label="Drawing No"
              name="drawingNo"
              value={header.drawingNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Party ID"
              name="partyId"
              value={header.partyId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyId}
              options={partyOptions}
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
              type="select"
              label="Control Plan"
              name="controlPlan"
              value={header.controlPlan}
              onChange={handleHeaderChange}
              error={fieldErrors.controlPlan}
              options={controlPlanOptions}
              required
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

            {canAddRow && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Approval Details */}
          {activeChildTab === "approvalDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "operationNo", label: "Operation No" },
                  { key: "description", label: "Description" },
                  { key: "specification", label: "Specification" },
                  { key: "mv1", label: "Value 1", type: "number" },
                  { key: "mv2", label: "Value 2", type: "number" },
                  { key: "mv3", label: "Value 3", type: "number" },
                  { key: "mv4", label: "Value 4", type: "number" },
                  { key: "mv5", label: "Value 5", type: "number" },
                  { key: "mv6", label: "Value 6", type: "number" },
                  { key: "mv7", label: "Value 7", type: "number" },
                  { key: "mv8", label: "Value 8", type: "number" },
                  { key: "time", label: "Time", readOnly: true },
                  { key: "remarks", label: "Remarks", type: "textarea" },
                ]}
                rows={detailRows}
                onCellChange={handleDetailCellChange}
                onRemoveRow={handleRemoveDetailRow}
              />
              {fieldErrors.approvalDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.approvalDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Approval Summary */}
          {activeChildTab === "approvalSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Checked By"
                  name="checkedBy"
                  value={summary.checkedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.checkedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Approved By"
                  name="approvedBy"
                  value={summary.approvedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.approvedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Received For Production"
                  name="receivedForProduction"
                  value={summary.receivedForProduction}
                  onChange={handleSummaryChange}
                  error={fieldErrors.receivedForProduction}
                  options={RECEIVED_FOR_PRODUCTION}
                  required
                />
              </div>
            </div>
          )}

          {/* Tab 3: Parameters */}
          {activeChildTab === "parameters" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "parameter", label: "Parameter" },
                  {
                    key: "parameterType",
                    label: "Parameter Type",
                    type: "select",
                    options: PARAMETER_TYPES,
                  },
                  { key: "tol", label: "TOL", type: "number" },
                ]}
                rows={parameterRows}
                onCellChange={handleParameterCellChange}
                onRemoveRow={handleRemoveParameterRow}
              />
              {fieldErrors.parameters && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.parameters}
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

export default SetUpApprovalForm;
