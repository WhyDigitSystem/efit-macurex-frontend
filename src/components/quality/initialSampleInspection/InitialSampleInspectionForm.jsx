import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import initialSampleInspectionAPI from "../../../api/quality/initialSampleInspectionAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import employeeAPI from "../../../api/employeeAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start";

const cellInputClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
  "border-gray-300 dark:border-gray-600 cursor-default";

/* ---------------------------------------------------------------------------- */
/* Building blocks                                                             */

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
      <X className="h-3 w-3" /> Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : saveLabel}
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
                    className={cellInputClasses}
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
                  className={col.readOnly ? cellReadOnlyClasses : cellInputClasses}
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

const CHILD_TABS = [
  { key: "firstArticleDetails", label: "First Article Detail", kind: "table" },
  { key: "sampleSummary", label: "Sample Summary", kind: "fields" },
];

const PARAMETER_TYPE_OPTIONS = [
  { value: "Dimension", label: "Dimension" },
  { value: "Visual", label: "Visual" },
  { value: "Functional", label: "Functional" },
  { value: "Material", label: "Material" },
  { value: "Hardness", label: "Hardness" },
];

const UOM_OPTIONS = [
  { value: "mm", label: "mm" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "pcs", label: "pcs" },
  { value: "deg", label: "deg" },
  { value: "%", label: "%" },
];

const DECISION_OPTIONS = ["Accepted", "Rejected", "Hold", "Rework"];

const REASON_OPTIONS = [
  { value: "New Part", label: "New Part" },
  { value: "Design Change", label: "Design Change" },
  { value: "Process Change", label: "Process Change" },
  { value: "Supplier Change", label: "Supplier Change" },
  { value: "Routine Sampling", label: "Routine Sampling" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateInspectionNo = () =>
  `ISI-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */
/* Initial Sample Inspection Form                                                */

const InitialSampleInspectionForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("firstArticleDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      inspectionNo: data?.inspectionNo || "",
      department: data?.department?.id ?? data?.department ?? "",
      date: data?.date ? fmtDate(data.date) : fmtDate(dayjs()),
      supplierId: data?.supplierId?.id ?? data?.supplierId ?? "",
      supplierName: data?.supplierName || "",
      issueNo: data?.issueNo || "",
      issueDate: data?.issueDate ? fmtDate(data.issueDate) : "",
      itemCode: data?.itemCode?.id ?? data?.itemCode ?? "",
      itemDescription: data?.itemDescription || "",
      drawingNo: data?.drawingNo || "",
      noOfSamples: data?.noOfSamples ?? "",
      batchNo: data?.batchNo || "",
      sampleWeight: data?.sampleWeight ?? "",
    };
    if (!base.inspectionNo) base.inspectionNo = generateInspectionNo();
    return base;
  });

  const [detailRows, setDetailRows] = useState(
    data?.firstArticleDetails?.length
      ? data.firstArticleDetails
      : [{}],
  );

  const [summary, setSummary] = useState({
    acceptedQty: data?.summary?.acceptedQty ?? "",
    deviationOnAcceptedQty: data?.summary?.deviationOnAcceptedQty ?? "",
    acceptedQtySegregation: data?.summary?.acceptedQtySegregation ?? "",
    reworkQty: data?.summary?.reworkQty ?? "",
    totalAcceptedQty: data?.summary?.totalAcceptedQty ?? "",
    rejectedQty: data?.summary?.rejectedQty ?? "",
    decision: data?.summary?.decision || "",
    reasonForInitialInspection: data?.summary?.reasonForInitialInspection || "",
    comment: data?.summary?.comment || "",
    preparedBy: data?.summary?.preparedBy?.id ?? data?.summary?.preparedBy ?? "",
    preparedDate: data?.summary?.preparedDate
      ? fmtDate(data.summary.preparedDate)
      : "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

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
      const res = await departmentAPI.getAllDepartments(orgId);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        departments.map((d) => ({
          value: d.id,
          label: d.departmentName || d.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId, branch]);

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setSupplierOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          supplierName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load supplier options:", error);
      setSupplierOptions([]);
    }
  }, [orgId, branch]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      setItemOptions(
        (res || []).map((it) => ({
          value: it.id,
          label: it.itemCode || it.id,
          itemDescription: it.itemDescription || it.itemName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeCode || e.employeeName || e.id,
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
      loadDepartments();
      loadSuppliers();
      loadItems();
      loadEmployees();
    }
  }, [orgId, loadDepartments, loadSuppliers, loadItems, loadEmployees]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "supplierId") {
        const supplier = supplierOptions.find(
          (s) => String(s.value) === String(value),
        );
        next.supplierName = supplier?.supplierName || "";
      }
      if (name === "itemCode") {
        const item = itemOptions.find((i) => String(i.value) === String(value));
        next.itemDescription = item?.itemDescription || "";
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        return { ...row, [key]: value };
      }),
    );
  };

  const handleAddRow = () => setDetailRows((prev) => [...prev, {}]);
  const handleRemoveRow = (idx) =>
    setDetailRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => {
      const next = { ...prev, [name]: value };

      if (["acceptedQty", "deviationOnAcceptedQty", "acceptedQtySegregation", "reworkQty"].includes(name)) {
        const toNum = (v) => Number(v) || 0;
        next.totalAcceptedQty =
          toNum(next.acceptedQty) +
          toNum(next.deviationOnAcceptedQty) +
          toNum(next.acceptedQtySegregation) +
          toNum(next.reworkQty);
      }

      return next;
    });
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.inspectionNo?.trim()) errors.inspectionNo = "Inspection No is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.supplierId) errors.supplierId = "Supplier ID is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";
    if (header.noOfSamples === "" || header.noOfSamples === null || header.noOfSamples === undefined)
      errors.noOfSamples = "No. of Samples is required";

    const validRows = detailRows.filter(
      (r) => r.parametersToBeChecked?.trim() || r.parameterType?.trim(),
    );
    if (!validRows.length)
      errors.firstArticleDetails =
        "Add at least one First Article Detail row with Parameters to be Checked";
    detailRows.forEach((r, i) => {
      if (!r.parametersToBeChecked?.trim())
        errors[`detail.${i}.parametersToBeChecked`] = "Parameters to be Checked is required";
      if (!r.parameterType?.trim())
        errors[`detail.${i}.parameterType`] = "Parameter Type is required";
      if (!r.uom?.trim()) errors[`detail.${i}.uom`] = "UOM is required";
      if (!r.decision?.trim()) errors[`detail.${i}.decision`] = "Decision is required";
    });

    if (!summary.decision) errors.decision = "Decision is required";
    if (!summary.reasonForInitialInspection)
      errors.reasonForInitialInspection = "Reason for Initial Inspection is required";
    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!summary.preparedDate) errors.preparedDate = "Prepared Date is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      firstArticleDetails: detailRows,
      summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await initialSampleInspectionAPI.createUpdateInitialSampleInspection(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Initial Sample Inspection updated successfully!"
              : "Initial Sample Inspection created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Initial Sample Inspection.",
        );
      }
    } catch (err) {
      console.error("Save Initial Sample Inspection Error:", err);
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

  /* ---------------------------------------------------------------------------- */

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
          {data ? "Edit Initial Sample Inspection" : "Add Initial Sample Inspection"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Inspection Details</SectionHeader>
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
              label="Inspection No"
              name="inspectionNo"
              value={header.inspectionNo}
              onChange={handleHeaderChange}
              error={fieldErrors.inspectionNo}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={departmentOptions}
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
            />
            <Field
              type="select"
              label="Supplier ID"
              name="supplierId"
              value={header.supplierId}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierId}
              options={supplierOptions}
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
              label="Issue No"
              name="issueNo"
              value={header.issueNo}
              onChange={handleHeaderChange}
              error={fieldErrors.issueNo}
            />
            <Field
              type="date"
              label="Issue Date"
              name="issueDate"
              value={header.issueDate}
              onChange={handleHeaderChange}
              error={fieldErrors.issueDate}
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
              label="Drawing No"
              name="drawingNo"
              value={header.drawingNo}
              onChange={handleHeaderChange}
              error={fieldErrors.drawingNo}
            />
            <Field
              type="number"
              label="No. of Samples"
              name="noOfSamples"
              value={header.noOfSamples}
              onChange={handleHeaderChange}
              error={fieldErrors.noOfSamples}
              required
            />
            <Field
              label="Batch No"
              name="batchNo"
              value={header.batchNo}
              onChange={handleHeaderChange}
              error={fieldErrors.batchNo}
            />
            <Field
              type="number"
              label="Sample Weight"
              name="sampleWeight"
              value={header.sampleWeight}
              onChange={handleHeaderChange}
              error={fieldErrors.sampleWeight}
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${
                    activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

          {/* Tab 1: First Article Detail */}
          {activeChildTab === "firstArticleDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "parametersToBeChecked", label: "Parameters to be Checked", type: "text" },
                  {
                    key: "parameterType",
                    label: "Parameter Type",
                    type: "select",
                    options: PARAMETER_TYPE_OPTIONS,
                  },
                  { key: "specification", label: "Specification", type: "text" },
                  { key: "tolerance", label: "Tolerance", type: "number" },
                  { key: "uom", label: "UOM", type: "select", options: UOM_OPTIONS },
                  { key: "sampleInspection1", label: "Sample Inspection 1", type: "number" },
                  { key: "sampleInspection2", label: "Sample Inspection 2", type: "number" },
                  { key: "sampleInspection3", label: "Sample Inspection 3", type: "number" },
                  { key: "sampleInspection4", label: "Sample Inspection 4", type: "number" },
                  { key: "sampleInspection5", label: "Sample Inspection 5", type: "number" },
                  {
                    key: "decision",
                    label: "Decision",
                    type: "select",
                    options: DECISION_OPTIONS,
                  },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.firstArticleDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.firstArticleDetails}
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.parametersToBeChecked`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Parameters to be Checked is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.parameterType`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Parameter Type is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.uom`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  UOM is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.decision`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Decision is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Sample Summary */}
          {activeChildTab === "sampleSummary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Accepted Qty"
                  name="acceptedQty"
                  value={summary.acceptedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Deviation on Accepted Qty"
                  name="deviationOnAcceptedQty"
                  value={summary.deviationOnAcceptedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Accepted Qty Segregation"
                  name="acceptedQtySegregation"
                  value={summary.acceptedQtySegregation}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Rework Qty"
                  name="reworkQty"
                  value={summary.reworkQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Total Accepted Qty"
                  name="totalAcceptedQty"
                  value={summary.totalAcceptedQty}
                  onChange={handleSummaryChange}
                  disabled
                />
                <Field
                  type="number"
                  label="Rejected Qty"
                  name="rejectedQty"
                  value={summary.rejectedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Decision"
                  name="decision"
                  value={summary.decision}
                  onChange={handleSummaryChange}
                  error={fieldErrors.decision}
                  options={DECISION_OPTIONS}
                  required
                />
                <Field
                  type="select"
                  label="Reason for Initial Inspection"
                  name="reasonForInitialInspection"
                  value={summary.reasonForInitialInspection}
                  onChange={handleSummaryChange}
                  error={fieldErrors.reasonForInitialInspection}
                  options={REASON_OPTIONS}
                  required
                />
                <Field
                  type="textarea"
                  label="Comment"
                  name="comment"
                  value={summary.comment}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.preparedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="date"
                  label="Prepared Date"
                  name="preparedDate"
                  value={summary.preparedDate}
                  onChange={handleSummaryChange}
                  error={fieldErrors.preparedDate}
                  required
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={data ? "Update" : "Save"}
      />
    </div>
  );
};

export default InitialSampleInspectionForm;