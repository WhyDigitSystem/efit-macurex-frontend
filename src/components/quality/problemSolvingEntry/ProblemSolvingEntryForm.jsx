import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import problemSolvingEntryAPI from "../../../api/quality/problemSolvingEntryAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import employeeAPI from "../../../api/employeeAPI";
import { controlPlanAPI } from "../../../api/quality/controlPlanAPI";

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
  { key: "problemSolvingRoot", label: "Problem Solving Root", kind: "table" },
  { key: "problemSolvingOther", label: "Problem Solving Other", kind: "table" },
  { key: "problemAction", label: "Problem Action", kind: "table" },
  { key: "problemSolvingSummary", label: "Problem Solving Summary", kind: "fields" },
];

const REFERENCE_OPTIONS = [
  { value: "Customer Complaint", label: "Customer Complaint" },
  { value: "Internal Rejection", label: "Internal Rejection" },
  { value: "Inward Inspection", label: "Inward Inspection" },
  { value: "In-Process Inspection", label: "In-Process Inspection" },
  { value: "Audit", label: "Audit" },
];

const ACTION_OPTIONS = [
  { value: "Containment", label: "Containment" },
  { value: "Corrective Action", label: "Corrective Action" },
  { value: "Preventive Action", label: "Preventive Action" },
  { value: "Training", label: "Training" },
  { value: "Inspection", label: "Inspection" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateAnalysisNo = () =>
  `PS-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */
/* Problem Solving Entry Form                                                    */

const ProblemSolvingEntryForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("problemSolvingRoot");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      analysisNo: data?.analysisNo || "",
      analysisDate: data?.analysisDate
        ? fmtDate(data.analysisDate)
        : fmtDate(dayjs()),
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      department: data?.department?.id ?? data?.department ?? "",
      reference: data?.reference || "",
      customerId: data?.customerId?.id ?? data?.customerId ?? "",
      customerName: data?.customerName || "",
      itemCode: data?.itemCode?.id ?? data?.itemCode ?? "",
      itemDescription: data?.itemDescription || "",
      machineNo: data?.machineNo || "",
      machineName: data?.machineName || "",
      manufacturingDate: data?.manufacturingDate
        ? fmtDate(data.manufacturingDate)
        : "",
      defectDescription: data?.defectDescription || "",
      teamMember1: data?.teamMember1?.id ?? data?.teamMember1 ?? "",
      teamMember2: data?.teamMember2?.id ?? data?.teamMember2 ?? "",
      shortTermAction: data?.shortTermAction || "",
      closeDate: data?.closeDate ? fmtDate(data.closeDate) : "",
      preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
      recognizeTheTeam: data?.recognizeTheTeam || "",
    };
    if (!base.analysisNo) base.analysisNo = generateAnalysisNo();
    return base;
  });

  const [rootCauses, setRootCauses] = useState(
    data?.problemSolvingRoot?.length ? data.problemSolvingRoot : [{}],
  );

  const [correctiveActions, setCorrectiveActions] = useState(
    data?.problemSolvingOther?.length ? data.problemSolvingOther : [{}],
  );

  const [problemActions, setProblemActions] = useState(
    data?.problemAction?.length ? data.problemAction : [{}],
  );

  const [summary, setSummary] = useState({
    overallSummary: data?.summary?.overallSummary || "",
    remarks: data?.summary?.remarks || "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
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
      const res = await departmentAPI.getAllDepartments(orgId, branch);
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

  const loadCustomers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          customerName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
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

  const loadMachines = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getMachineFixtures(orgId);
      setMachineOptions(
        (res || []).map((m) => ({
          value: m.machineFixtureNo || m.id,
          label: m.machineFixtureNo || m.machineFixtureName || m.id,
          machineName: m.machineFixtureName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load machine options:", error);
      setMachineOptions([]);
    }
  }, [orgId]);

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
      loadCustomers();
      loadItems();
      loadMachines();
      loadEmployees();
    }
  }, [orgId, loadDepartments, loadCustomers, loadItems, loadMachines, loadEmployees]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "customerId") {
        const customer = customerOptions.find(
          (c) => String(c.value) === String(value),
        );
        next.customerName = customer?.customerName || "";
      }
      if (name === "itemCode") {
        const item = itemOptions.find((i) => String(i.value) === String(value));
        next.itemDescription = item?.itemDescription || "";
      }
      if (name === "machineNo") {
        const machine = machineOptions.find(
          (m) => String(m.value) === String(value),
        );
        next.machineName = machine?.machineName || "";
      }
      return next;
    });
  };

  const handleRootChange = (idx, key, value) => {
    setRootCauses((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleCorrectiveChange = (idx, key, value) => {
    setCorrectiveActions((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleProblemActionChange = (idx, key, value) => {
    setProblemActions((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddRow = (setter) => setter((prev) => [...prev, {}]);
  const handleRemoveRow = (setter) => (idx) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const tabAddRowSetter = {
    problemSolvingRoot: setRootCauses,
    problemSolvingOther: setCorrectiveActions,
    problemAction: setProblemActions,
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.analysisNo?.trim()) errors.analysisNo = "Analysis No is required";
    if (!header.analysisDate) errors.analysisDate = "Analysis Date is required";
    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.reference) errors.reference = "Reference is required";
    if (!header.customerId) errors.customerId = "Customer ID is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";
    if (!header.defectDescription?.trim())
      errors.defectDescription = "Defect Description is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";

    const validRoots = rootCauses.filter((r) => r.rootCause?.trim());
    if (!validRoots.length)
      errors.problemSolvingRoot =
        "Add at least one Problem Solving Root row with Root Cause";
    rootCauses.forEach((r, i) => {
      if (!r.rootCause?.trim())
        errors[`root.${i}.rootCause`] = "Root Cause is required";
    });

    const validActions = correctiveActions.filter((r) => r.permanentCorrectiveActions?.trim());
    if (!validActions.length)
      errors.problemSolvingOther =
        "Add at least one Problem Solving Other row with Permanent Corrective Actions";
    correctiveActions.forEach((r, i) => {
      if (!r.permanentCorrectiveActions?.trim())
        errors[`other.${i}.permanentCorrectiveActions`] = "Permanent Corrective Actions is required";
    });

    const validProblemActions = problemActions.filter(
      (r) => r.action?.trim() && r.implementationDate,
    );
    if (!validProblemActions.length)
      errors.problemAction =
        "Add at least one Problem Action row with Action and Implementation Date";
    problemActions.forEach((r, i) => {
      if (!r.action?.trim()) errors[`pa.${i}.action`] = "Action is required";
      if (!r.responsible?.trim())
        errors[`pa.${i}.responsible`] = "Responsible is required";
      if (!r.implementationDate)
        errors[`pa.${i}.implementationDate`] = "Implementation Date is required";
    });

    if (!summary.overallSummary?.trim())
      errors.overallSummary = "Overall Summary is required";

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
      problemSolvingRoot: rootCauses,
      problemSolvingOther: correctiveActions,
      problemAction: problemActions,
      summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await problemSolvingEntryAPI.createUpdateProblemSolvingEntry(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Problem Solving Entry updated successfully!"
              : "Problem Solving Entry created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Problem Solving Entry.",
        );
      }
    } catch (err) {
      console.error("Save Problem Solving Entry Error:", err);
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
          {data ? "Edit Problem Solving Entry" : "Add Problem Solving Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Problem Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              label="Analysis No"
              name="analysisNo"
              value={header.analysisNo}
              onChange={handleHeaderChange}
              error={fieldErrors.analysisNo}
              required
            />
            <Field
              type="date"
              label="Analysis Date"
              name="analysisDate"
              value={header.analysisDate}
              onChange={handleHeaderChange}
              error={fieldErrors.analysisDate}
              required
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
              type="select"
              label="Reference"
              name="reference"
              value={header.reference}
              onChange={handleHeaderChange}
              error={fieldErrors.reference}
              options={REFERENCE_OPTIONS}
              required
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
              label="Customer Name"
              name="customerName"
              value={header.customerName}
              onChange={handleHeaderChange}
              disabled
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
              label="Machine No"
              name="machineNo"
              value={header.machineNo}
              onChange={handleHeaderChange}
              error={fieldErrors.machineNo}
              options={machineOptions}
            />
            <Field
              label="Machine Name"
              name="machineName"
              value={header.machineName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="date"
              label="Manufacturing Date"
              name="manufacturingDate"
              value={header.manufacturingDate}
              onChange={handleHeaderChange}
              error={fieldErrors.manufacturingDate}
            />
            <Field
              type="textarea"
              label="Defect Description"
              name="defectDescription"
              value={header.defectDescription}
              onChange={handleHeaderChange}
              error={fieldErrors.defectDescription}
              required
            />
            <Field
              type="select"
              label="Team Member 1"
              name="teamMember1"
              value={header.teamMember1}
              onChange={handleHeaderChange}
              error={fieldErrors.teamMember1}
              options={employeeOptions}
            />
            <Field
              type="select"
              label="Team Member 2"
              name="teamMember2"
              value={header.teamMember2}
              onChange={handleHeaderChange}
              error={fieldErrors.teamMember2}
              options={employeeOptions}
            />
            <Field
              type="textarea"
              label="Short Term Action"
              name="shortTermAction"
              value={header.shortTermAction}
              onChange={handleHeaderChange}
              error={fieldErrors.shortTermAction}
            />
            <Field
              type="date"
              label="Close Date"
              name="closeDate"
              value={header.closeDate}
              onChange={handleHeaderChange}
              error={fieldErrors.closeDate}
            />
            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={employeeOptions}
              required
            />
            <Field
              type="textarea"
              label="Recognize the Team"
              name="recognizeTheTeam"
              value={header.recognizeTheTeam}
              onChange={handleHeaderChange}
              error={fieldErrors.recognizeTheTeam}
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
                onClick={() => handleAddRow(tabAddRowSetter[activeTabMeta.key])}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Problem Solving Root */}
          {activeChildTab === "problemSolvingRoot" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "rootCause", label: "Root Cause", type: "textarea" },
                  { key: "contributionPct", label: "Contribution %", type: "number" },
                ]}
                rows={rootCauses}
                onCellChange={handleRootChange}
                onRemoveRow={handleRemoveRow(setRootCauses)}
              />
              {fieldErrors.problemSolvingRoot && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.problemSolvingRoot}
                </p>
              )}
              {rootCauses.some((r, i) => fieldErrors[`root.${i}.rootCause`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Root Cause is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Problem Solving Other */}
          {activeChildTab === "problemSolvingOther" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "permanentCorrectiveActions",
                    label: "Permanent Corrective Actions",
                    type: "textarea",
                  },
                  { key: "effectsPct", label: "Effects %", type: "number" },
                ]}
                rows={correctiveActions}
                onCellChange={handleCorrectiveChange}
                onRemoveRow={handleRemoveRow(setCorrectiveActions)}
              />
              {fieldErrors.problemSolvingOther && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.problemSolvingOther}
                </p>
              )}
              {correctiveActions.some((r, i) => fieldErrors[`other.${i}.permanentCorrectiveActions`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Permanent Corrective Actions is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Problem Action */}
          {activeChildTab === "problemAction" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "action",
                    label: "Action",
                    type: "select",
                    options: ACTION_OPTIONS,
                  },
                  { key: "description", label: "Description", type: "textarea" },
                  {
                    key: "responsible",
                    label: "Responsible",
                    type: "select",
                    options: employeeOptions,
                  },
                  {
                    key: "implementationDate",
                    label: "Implementation Date",
                    type: "date",
                  },
                ]}
                rows={problemActions}
                onCellChange={handleProblemActionChange}
                onRemoveRow={handleRemoveRow(setProblemActions)}
              />
              {fieldErrors.problemAction && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.problemAction}
                </p>
              )}
              {problemActions.some((r, i) => fieldErrors[`pa.${i}.action`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Action is required in every row
                </p>
              )}
              {problemActions.some((r, i) => fieldErrors[`pa.${i}.responsible`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Responsible is required in every row
                </p>
              )}
              {problemActions.some((r, i) => fieldErrors[`pa.${i}.implementationDate`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Implementation Date is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 4: Problem Solving Summary */}
          {activeChildTab === "problemSolvingSummary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Overall Summary"
                  name="overallSummary"
                  value={summary.overallSummary}
                  onChange={handleSummaryChange}
                  error={fieldErrors.overallSummary}
                  required
                />
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

export default ProblemSolvingEntryForm;