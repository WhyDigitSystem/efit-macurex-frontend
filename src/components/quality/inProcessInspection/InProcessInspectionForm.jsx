import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import inProcessInspectionAPI from "../../../api/quality/inProcessInspectionAPI";
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
                        : col.type === "time"
                          ? "time"
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
  { key: "inProcessDetails", label: "In-Process Details", kind: "table" },
  { key: "inProcessSummary", label: "In-Process Summary", kind: "fields" },
];

const PARAMETER_TYPE_OPTIONS = [
  { value: "Dimension", label: "Dimension" },
  { value: "Visual", label: "Visual" },
  { value: "Functional", label: "Functional" },
  { value: "Material", label: "Material" },
  { value: "Hardness", label: "Hardness" },
];

const SHIFT_OPTIONS = [
  { value: "1", label: "1st Shift" },
  { value: "2", label: "2nd Shift" },
  { value: "3", label: "3rd Shift" },
];

const LOCATION_OPTIONS = [
  { value: "Stores", label: "Stores" },
  { value: "Machining", label: "Machining" },
  { value: "Assembly", label: "Assembly" },
  { value: "FG Stores", label: "FG Stores" },
  { value: "Inspection", label: "Inspection" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const fmtTime = (value) => (value ? dayjs(value).format("HH:mm") : "");

const generateInspectionNo = () =>
  `IPI-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */
/* In-Process Inspection Form                                                    */

const InProcessInspectionForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("inProcessDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      department: data?.department?.id ?? data?.department ?? "",
      controlPlanNo: data?.controlPlanNo || "",
      partyId: data?.partyId?.id ?? data?.partyId ?? "",
      partyName: data?.partyName || "",
      operationNo: data?.operationNo || "",
      operationDescription: data?.operationDescription || "",
      specification: data?.specification || "",
      partNo: data?.partNo?.id ?? data?.partNo ?? "",
      partName: data?.partName || "",
      fromLocation: data?.fromLocation || "",
      stock: data?.stock ?? "",
      machineNo: data?.machineNo || "",
      machineName: data?.machineName || "",
      shift: data?.shift || "",
      inspectionNo: data?.inspectionNo || "",
      inspectionDate: data?.inspectionDate
        ? fmtDate(data.inspectionDate)
        : fmtDate(dayjs()),
    };
    if (!base.inspectionNo) base.inspectionNo = generateInspectionNo();
    return base;
  });

  const [detailRows, setDetailRows] = useState(
    data?.inProcessDetails?.length ? data.inProcessDetails : [{}],
  );

  const [summary, setSummary] = useState({
    producedQty: data?.summary?.producedQty ?? "",
    acceptedQty: data?.summary?.acceptedQty ?? "",
    rejectedQty: data?.summary?.rejectedQty ?? "",
    rawQty: data?.summary?.rawQty ?? "",
    inspectedBy: data?.summary?.inspectedBy?.id ?? data?.summary?.inspectedBy ?? "",
    verifiedBy: data?.summary?.verifiedBy?.id ?? data?.summary?.verifiedBy ?? "",
    toLocation: data?.summary?.toLocation || "",
    ncDetail: data?.summary?.ncDetail || "",
    actionTaken: data?.summary?.actionTaken || "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [controlPlanOptions, setControlPlanOptions] = useState([]);
  const [operationOptions, setOperationOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [partOptions, setPartOptions] = useState([]);
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

  const loadControlPlans = useCallback(async () => {
    try {
      const res = await controlPlanAPI.getControlPlans(orgId);
      setControlPlanOptions(
        (res || []).map((c) => ({
          value: c.planNo || c.id,
          label: c.planNo || c.id,
          id: c.id,
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

  const loadParts = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      setPartOptions(
        (res || []).map((it) => ({
          value: it.id,
          label: it.itemCode || it.id,
          partName: it.itemDescription || it.itemName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load part options:", error);
      setPartOptions([]);
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
      loadControlPlans();
      loadParties();
      loadParts();
      loadMachines();
      loadEmployees();
    }
  }, [orgId, loadDepartments, loadControlPlans, loadParties, loadParts, loadMachines, loadEmployees]);

  /* Load operations of the selected control plan */
  useEffect(() => {
    if (!header.controlPlanNo) {
      setOperationOptions([]);
      return;
    }
    const plan = controlPlanOptions.find(
      (p) => String(p.value) === String(header.controlPlanNo),
    );
    if (plan?.id) {
      controlPlanAPI
        .getControlPlanById(plan.id)
        .then((res) => {
          const details = res?.planDetails || res?.controlPlanVOList || [];
          setOperationOptions(
            details.map((d) => ({
              value: d.operationNo || d.id,
              label: d.operationNo || d.operationDesc || d.id,
              operationDescription: d.operationDesc || "",
              specification: d.specification || "",
            })),
          );
        })
        .catch(() => setOperationOptions([]));
    } else {
      setOperationOptions([]);
    }
  }, [header.controlPlanNo, controlPlanOptions]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "partyId") {
        const party = partyOptions.find((p) => String(p.value) === String(value));
        next.partyName = party?.partyName || "";
      }
      if (name === "partNo") {
        const part = partOptions.find((p) => String(p.value) === String(value));
        next.partName = part?.partName || "";
      }
      if (name === "machineNo") {
        const machine = machineOptions.find(
          (m) => String(m.value) === String(value),
        );
        next.machineName = machine?.machineName || "";
      }
      if (name === "operationNo") {
        const operation = operationOptions.find(
          (o) => String(o.value) === String(value),
        );
        next.operationDescription = operation?.operationDescription || "";
        next.specification = operation?.specification || "";
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        return next;
      }),
    );
  };

  const handleAddRow = () => {
    setDetailRows((prev) => [
      ...prev,
      { time: dayjs().format("HH:mm"), date: fmtDate(dayjs()) },
    ]);
  };

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.controlPlanNo) errors.controlPlanNo = "Control Plan No is required";
    if (!header.partyId) errors.partyId = "Party ID is required";
    if (!header.operationNo) errors.operationNo = "Operation No is required";
    if (!header.partNo) errors.partNo = "Part No is required";
    if (!header.partName?.trim()) errors.partName = "Part Name is required";
    if (!header.shift) errors.shift = "Shift is required";
    if (!header.inspectionNo?.trim()) errors.inspectionNo = "Inspection No is required";
    if (!header.inspectionDate) errors.inspectionDate = "Inspection Date is required";

    const validRows = detailRows.filter(
      (r) => r.parameter?.trim() || r.parameterType?.trim(),
    );
    if (!validRows.length)
      errors.inProcessDetails =
        "Add at least one In-Process Details row with Parameter Type";
    detailRows.forEach((r, i) => {
      if (!r.parameterType?.trim())
        errors[`detail.${i}.parameterType`] = "Parameter Type is required";
      if (!r.parameter?.trim())
        errors[`detail.${i}.parameter`] = "Parameter is required";
    });

    if (!summary.inspectedBy) errors.inspectedBy = "Inspected By is required";
    if (!summary.verifiedBy) errors.verifiedBy = "Verified By is required";

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
      inProcessDetails: detailRows,
      summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await inProcessInspectionAPI.createUpdateInProcessInspection(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "In-Process Inspection updated successfully!"
              : "In-Process Inspection created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save In-Process Inspection.",
        );
      }
    } catch (err) {
      console.error("Save In-Process Inspection Error:", err);
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
          {data ? "Edit In-Process Inspection" : "Add In-Process Inspection"}
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
              label="Control Plan No"
              name="controlPlanNo"
              value={header.controlPlanNo}
              onChange={handleHeaderChange}
              error={fieldErrors.controlPlanNo}
              options={controlPlanOptions}
              required
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
              label="Operation No"
              name="operationNo"
              value={header.operationNo}
              onChange={handleHeaderChange}
              error={fieldErrors.operationNo}
              options={operationOptions}
              required
            />
            <Field
              label="Operation Description"
              name="operationDescription"
              value={header.operationDescription}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Specification"
              name="specification"
              value={header.specification}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Part No"
              name="partNo"
              value={header.partNo}
              onChange={handleHeaderChange}
              error={fieldErrors.partNo}
              options={partOptions}
              required
            />
            <Field
              label="Part Name"
              name="partName"
              value={header.partName}
              onChange={handleHeaderChange}
              error={fieldErrors.partName}
              required
            />
            <Field
              type="select"
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={LOCATION_OPTIONS}
            />
            <Field
              type="number"
              label="Stock"
              name="stock"
              value={header.stock}
              onChange={handleHeaderChange}
              error={fieldErrors.stock}
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
              type="select"
              label="Shift"
              name="shift"
              value={header.shift}
              onChange={handleHeaderChange}
              error={fieldErrors.shift}
              options={SHIFT_OPTIONS}
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
              type="date"
              label="Inspection Date"
              name="inspectionDate"
              value={header.inspectionDate}
              onChange={handleHeaderChange}
              error={fieldErrors.inspectionDate}
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

          {/* Tab 1: In-Process Details */}
          {activeChildTab === "inProcessDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "parameterType",
                    label: "Parameter Type",
                    type: "select",
                    options: PARAMETER_TYPE_OPTIONS,
                  },
                  { key: "parameter", label: "Parameter", type: "text" },
                  { key: "tol", label: "TOL", type: "number" },
                  { key: "date", label: "Date", type: "date" },
                  { key: "time", label: "Time", type: "time", readOnly: true },
                  { key: "obs1", label: "Obs1", type: "number" },
                  { key: "obs2", label: "Obs2", type: "number" },
                  { key: "obs3", label: "Obs3", type: "number" },
                  { key: "obs4", label: "Obs4", type: "number" },
                  { key: "obs5", label: "Obs5", type: "number" },
                  {
                    key: "deviationObserved",
                    label: "Deviation Observed",
                    type: "textarea",
                  },
                  {
                    key: "correctiveAction",
                    label: "Corrective Action",
                    type: "textarea",
                  },
                  { key: "remarks", label: "Remarks", type: "textarea" },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.inProcessDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.inProcessDetails}
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.parameterType`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Parameter Type is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.parameter`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Parameter is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: In-Process Summary */}
          {activeChildTab === "inProcessSummary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Produced Qty"
                  name="producedQty"
                  value={summary.producedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Accepted Qty"
                  name="acceptedQty"
                  value={summary.acceptedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Rejected Qty"
                  name="rejectedQty"
                  value={summary.rejectedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Raw Qty"
                  name="rawQty"
                  value={summary.rawQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Inspected By"
                  name="inspectedBy"
                  value={summary.inspectedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.inspectedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Verified By"
                  name="verifiedBy"
                  value={summary.verifiedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.verifiedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="To Location"
                  name="toLocation"
                  value={summary.toLocation}
                  onChange={handleSummaryChange}
                  error={fieldErrors.toLocation}
                  options={LOCATION_OPTIONS}
                />
                <Field
                  type="textarea"
                  label="NC Detail"
                  name="ncDetail"
                  value={summary.ncDetail}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Action Taken"
                  name="actionTaken"
                  value={summary.actionTaken}
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

export default InProcessInspectionForm;