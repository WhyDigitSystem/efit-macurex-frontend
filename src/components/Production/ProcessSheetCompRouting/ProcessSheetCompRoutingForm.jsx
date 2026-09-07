import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import TabComponent from "../../common/TabComponent";
import processSheetCompRoutingAPI from "../../../api/Production/processSheetCompRoutingAPI";
import { branchAPI } from "../../../api/branchAPI";
import bomMasterAPI from "../../../api/PPC/bomMasterAPI";
import { itemAPI } from "../../../api/itemAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { useToast } from "../../Toast/ToastContext";

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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

// Adequate spacing between header fields for clarity
const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const MULTILINE_CLASSES =
  "w-full px-2 py-1.5 rounded border text-xs leading-relaxed transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

/* ---------------------------------------------------------------------------- */
/* Static option lists (screen design) - wire to backend masters when available  */

const ITEM_TYPE_OPTIONS = [
  { value: "FG", label: "Finished Good (FG)" },
  { value: "SFG", label: "Semi Finished Good (SFG)" },
];

const COST_RATE_OPTIONS = [
  { value: "CR001", label: "Cost Rate 1" },
  { value: "CR002", label: "Cost Rate 2" },
  { value: "CR003", label: "Cost Rate 3" },
];

const TOOL_USAGE_TYPE_OPTIONS = [
  { value: "USED", label: "Used" },
  { value: "REUSED", label: "Reused" },
];

const MACHINE_USAGE_OPTIONS = [
  { value: "OPERATION", label: "Operation" },
  { value: "SETUP", label: "Setup" },
  { value: "AUXILIARY", label: "Auxiliary" },
];

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
  placeholder,
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
          <option value="">Select {label}</option>
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
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className={`${MULTILINE_CLASSES} ${error ? controlErrClasses : ""}`}
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
        placeholder={placeholder}
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

const YesNoToggle = ({ name, value, onChange }) => (
  <div>
    <label className={labelClasses}>Active</label>
    <div className="flex items-center gap-1 h-[30px]">
      {["Yes", "No"].map((opt) => {
        const active = value === (opt === "Yes");
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange({ target: { name, value: opt === "Yes" } })}
            className={`px-3 rounded text-xs leading-none h-[26px] transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Table building blocks                                                       */

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-1 whitespace-nowrap ${
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
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-1 text-center">
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
        X
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options, error }) => (
  <td className="p-1 align-top min-w-[120px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      className={`${cellInputClasses} ${error ? controlErrClasses : ""}`}
    >
      <option value="">-- Select --</option>
      {(options || []).map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", step, error }) => (
  <td
    className={`p-1 align-top ${
      type === "date"
        ? "min-w-[140px]"
        : type === "number"
          ? "min-w-[100px]"
          : "min-w-[120px]"
    }`}
  >
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={onChange}
      className={`${cellInputClasses} ${error ? controlErrClasses : ""}`}
    />
  </td>
);

const TextAreaCell = ({ value, onChange }) => (
  <td className="p-1 align-top min-w-[160px]">
    <textarea
      value={value ?? ""}
      onChange={onChange}
      rows={1}
      className={`${cellInputClasses} h-[30px] min-h-[30px] resize-y`}
    />
  </td>
);

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top min-w-[120px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
  </td>
);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const round2 = (value) =>
  Number.isFinite(value) && value !== 0 ? value.toFixed(2) : "";

// Auto-calculations for the Machine tab.
// Placeholder formulas - confirm the exact cost basis with the backend.
const computeMachineRow = (row) => {
  const machineHours =
    toNumber(row.setupTime) / 60 +
    (toNumber(row.outputPerHour) > 0 ? 1 / toNumber(row.outputPerHour) : 0);
  const activityMachineCost = toNumber(row.machineHourRate) * machineHours;
  const activityLabourCost =
    toNumber(row.labourHourRate) * (toNumber(row.labourHour) / 60);
  return {
    activityMachineCost: round2(activityMachineCost),
    activityLabourCost: round2(activityLabourCost),
    total: round2(activityMachineCost + activityLabourCost),
  };
};

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  plantId: "",
  fgSfgItemType: "",
  fgSfgItemCode: "",
  itemDescription: "",
  bomId: "",
  drawingNo: "",
  costRateId: "",
  active: true,
});

const emptyRoutingRow = () => ({
  location: "",
  operation: "",
  description: "",
  outputItemCode: "",
  specification: "",
  noOfToolsFixtures: "",
  sequence: "",
  activityConsumableCost: "",
  cumulativeConsumableCost: "",
  sourceOfVariation: "",
  productCharacteristics: "",
  processCharacteristics: "",
});

const emptyCharges = () => ({
  totalMachineValue: "",
  totalLabourValue: "",
  totalToolFixtureValue: "",
  totalConsumablesValue: "",
  totalOperationValue: "",
  preparedBy: "",
});

const emptyToolFixtureRow = () => ({
  usageType: "",
  toolFixtureNo: "",
  toolFixtureName: "",
  activityToolFixtureCost: "",
});

const emptyMachineRow = () => ({
  usage: "",
  machineNo: "",
  machineName: "",
  setupTime: "",
  outputPerHour: "",
  machineHourRate: "",
  activityMachineCost: "",
  labourHour: "",
  labourHourRate: "",
  activityLabourCost: "",
  total: "",
});

/* ---------------------------------------------------------------------------- */

const ProcessSheetCompRoutingForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableErrors, setTableErrors] = useState({}); // { routing: bool, toolFixture: bool }
  const [showErrors, setShowErrors] = useState(false);

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [bomOptions, setBomOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [operationOptions, setOperationOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const d = data?.header || data || {};
    return { ...emptyHeader(), ...d, active: d.active ?? true };
  });

  const [routingRows, setRoutingRows] = useState(() => {
    const rows = data?.routingDetails || data?.routingList || [];
    return rows.length ? rows.map((r) => ({ ...emptyRoutingRow(), ...r })) : [emptyRoutingRow()];
  });

  const [charges, setCharges] = useState(() => ({
    ...emptyCharges(),
    ...(data?.chargesSummary || {}),
  }));

  const [toolFixtureRows, setToolFixtureRows] = useState(() => {
    const rows = data?.toolFixtureDetails || data?.toolFixtureList || [];
    return rows.length
      ? rows.map((r) => ({ ...emptyToolFixtureRow(), ...r }))
      : [emptyToolFixtureRow()];
  });

  const [machineRows, setMachineRows] = useState(() => {
    const rows = data?.machineDetails || data?.machineList || [];
    return rows.length ? rows.map((r) => ({ ...emptyMachineRow(), ...r })) : [emptyMachineRow()];
  });

  /* ---------------- Derived auto-calculations ---------------- */

  // Cumulative consumable cost per routing row (running total)
  const routingWithCumulative = useMemo(() => {
    let running = 0;
    return routingRows.map((row) => {
      running += toNumber(row.activityConsumableCost);
      return { ...row, cumulativeConsumableCost: round2(running) };
    });
  }, [routingRows]);

  const chargesTotals = useMemo(() => {
    const totalConsumablesValue = routingRows.reduce(
      (acc, r) => acc + toNumber(r.activityConsumableCost),
      0,
    );
    const totalToolFixtureValue = toolFixtureRows.reduce(
      (acc, r) => acc + toNumber(r.activityToolFixtureCost),
      0,
    );
    const totalMachineValue = machineRows.reduce(
      (acc, r) => acc + (computeMachineRow(r).activityMachineCost || 0),
      0,
    );
    const totalLabourValue = machineRows.reduce(
      (acc, r) => acc + (computeMachineRow(r).activityLabourCost || 0),
      0,
    );
    const totalOperationValue =
      totalMachineValue + totalLabourValue + totalToolFixtureValue + totalConsumablesValue;
    return {
      totalConsumablesValue: round2(totalConsumablesValue),
      totalToolFixtureValue: round2(totalToolFixtureValue),
      totalMachineValue: round2(totalMachineValue),
      totalLabourValue: round2(totalLabourValue),
      totalOperationValue: round2(totalOperationValue),
    };
  }, [routingRows, toolFixtureRows, machineRows]);

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

    const loadPlants = async () => {
      try {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (Array.isArray(res) ? res : []).map((b) => ({
            value: b.id ?? b.branchId,
            label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
          })),
        );
      } catch {
        setPlantOptions([]);
      }
    };

    const loadItems = async () => {
      try {
        const res = await itemAPI.getItems(orgId, branch);
        const map = {};
        const opts = (res || []).map((it) => {
          const code = it.itemCode || it.code || it.id?.toString() || "";
          map[code] = it;
          return { value: code, label: code };
        });
        setItemOptions(opts);
        setItemMap(map);
      } catch {
        setItemOptions([]);
        setItemMap({});
      }
    };

    const loadBoms = async () => {
      try {
        const res = await bomMasterAPI.getByOrgId(orgId);
        setBomOptions(
          (Array.isArray(res) ? res : []).map((b) => {
            const code =
              b?.header?.fgSfgItemCode || b?.fgSfgItemCode || b?.itemCode || "";
            return { value: b.id ?? b.bomId, label: `${b.id ?? b.bomId}${code ? ` - ${code}` : ""}` };
          }),
        );
      } catch {
        setBomOptions([]);
      }
    };

    const loadLocations = async () => {
      try {
        const res = await processSheetCompRoutingAPI.getLocations(orgId, branch);
        setLocationOptions(
          (Array.isArray(res) ? res : []).map((loc) => ({
            value: loc.id ?? loc.locationId ?? loc.code,
            label:
              loc.locationName ||
              loc.name ||
              loc.location ||
              loc.code ||
              `Location ${loc.id ?? loc.locationId}`,
          })),
        );
      } catch {
        setLocationOptions([]);
      }
    };

    const loadOperations = async () => {
      try {
        const res = await processSheetCompRoutingAPI.getOperations(orgId, branch);
        setOperationOptions(
          (Array.isArray(res) ? res : []).map((op) => ({
            value: op.id ?? op.operationNo ?? op.operationCode,
            label: `${op.operationCode || op.operationNo || op.id || ""}${
              op.operationName ? ` - ${op.operationName}` : ""
            }`,
          })),
        );
      } catch {
        setOperationOptions([]);
      }
    };

    const loadMachines = async () => {
      try {
        const res = await processSheetCompRoutingAPI.getMachines(orgId, branch);
        setMachineOptions(
          (Array.isArray(res) ? res : []).map((m) => ({
            value: m.id ?? m.machineNo ?? m.machineCode,
            label: `${m.machineCode || m.machineNo || m.id || ""}${
              m.machineName ? ` - ${m.machineName}` : ""
            }`,
            name: m.machineName || m.name || "",
          })),
        );
      } catch {
        setMachineOptions([]);
      }
    };

    const loadEmployees = async () => {
      try {
        const res = await employeeAPI.getEmployeeByOrgId(orgId);
        setEmployeeOptions(
          (Array.isArray(res) ? res : []).map((emp) => ({
            value: emp.id ?? emp.employeeCode,
            label: `${emp.employeeCode || ""}${emp.employeeName || emp.name ? ` - ${emp.employeeName || emp.name}` : ""}`,
          })),
        );
      } catch {
        setEmployeeOptions([]);
      }
    };

    Promise.all([
      loadPlants(),
      loadItems(),
      loadBoms(),
      loadLocations(),
      loadOperations(),
      loadMachines(),
      loadEmployees(),
    ]);
  }, [orgId, branch]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      let next = { ...prev, [name]: value };
      if (name === "fgSfgItemCode") {
        const item = itemMap[value];
        next.itemDescription = item?.itemDescription || item?.description || "";
      }
      return next;
    });
  };

  const handleActiveToggle = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Grid row handlers ---------------- */

  const updateRows = (setter) => (idx, key, value) => {
    setter((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "operation") {
          const op = operationOptions.find((o) => String(o.value) === String(value));
          if (op?.name) next.description = op.name;
        }
        return next;
      }),
    );
  };

  const handleRoutingChange = updateRows(setRoutingRows);
  const handleToolFixtureChange = updateRows(setToolFixtureRows);

  const handleMachineChange = (idx, key, value) => {
    setMachineRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "machineNo") {
          const m = machineOptions.find((o) => String(o.value) === String(value));
          if (m?.name) next.machineName = m.name;
        }
        const calc = computeMachineRow(next);
        next.activityMachineCost = calc.activityMachineCost;
        next.activityLabourCost = calc.activityLabourCost;
        next.total = calc.total;
        return next;
      }),
    );
  };

  const handleAddRow = (setter) => (emptyRow) =>
    setter((prev) => [...prev, emptyRow()]);

  const handleRemoveRow = (setter) => (idx) =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Charges handlers ---------------- */

  const handleChargesChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setCharges((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.fgSfgItemType?.trim())
      errors.fgSfgItemType = "FG/SFG Item Type is required";
    if (!header.fgSfgItemCode?.trim())
      errors.fgSfgItemCode = "FG/SFG Item Code is required";
    if (!header.itemDescription?.trim())
      errors.itemDescription = "Item Description is required";
    if (!header.costRateId?.trim()) errors.costRateId = "Cost Rate ID is required";
    if (!charges.preparedBy?.trim())
      errors.preparedBy = "Prepared By is required";

    setFieldErrors(errors);

    const routingOk = routingRows.every(
      (r) =>
        r.location?.trim() && r.operation?.trim() && r.sequence !== "" && Number(r.sequence) > 0,
    );
    const toolFixtureOk = toolFixtureRows.every((r) => r.usageType?.trim());

    setTableErrors({
      routing: !routingOk,
      toolFixture: !toolFixtureOk,
    });

    const valid =
      Object.keys(errors).length === 0 && routingOk && toolFixtureOk;
    setShowErrors(!valid);
    return valid;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fill all mandatory fields before saving.", "error");
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id ?? data?.header?.id);

    // Single-transaction payload: header + routing details + charges summary +
    // tool/fixture details + machine details. The backend persists all of these
    // together, links the record to the plant, FG/SFG item, BOM and cost rate
    // details and keeps the complete routing history with charges, tools and
    // machine usage (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data?.id ?? data?.header?.id } : {}),
      orgId,
      header: {
        ...header,
        plantId: header.plantId,
        active: header.active,
      },
      routingDetails: routingWithCumulative,
      chargesSummary: {
        ...chargesTotals,
        preparedBy: charges.preparedBy,
      },
      toolFixtureDetails: toolFixtureRows,
      machineDetails: machineRows.map((r) => ({ ...r, ...computeMachineRow(r) })),
      active: header.active,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await processSheetCompRoutingAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Process Sheet / Routing updated successfully!"
              : "Process Sheet / Routing created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Process Sheet / Routing.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Process Sheet / Routing Error:", err);
      addToast(
        err.response?.data?.message || err.response?.data?.error || "Something went wrong.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Column configs ---------------- */

  const routingColumns = [
    { key: "location", label: "Location *", type: "select" },
    { key: "operation", label: "Operation *", type: "select" },
    { key: "description", label: "Description", type: "textarea", rows: "1" },
    { key: "outputItemCode", label: "Output Item Code", type: "select" },
    { key: "specification", label: "Specification", type: "text" },
    { key: "noOfToolsFixtures", label: "No. of Tools/Fixtures", type: "number", step: "1" },
    { key: "sequence", label: "Sequence *", type: "number", step: "1" },
    { key: "activityConsumableCost", label: "Activity Consumable Cost", type: "number", step: "0.01" },
    { key: "cumulativeConsumableCost", label: "Cumul. Consumable Cost", readOnly: true },
    { key: "sourceOfVariation", label: "Source of Variation", type: "text" },
    { key: "productCharacteristics", label: "Product Characteristics", type: "textarea", rows: "1" },
    { key: "processCharacteristics", label: "Process Characteristics", type: "textarea", rows: "4" },
  ];

  const toolFixtureColumns = [
    { key: "usageType", label: "Usage Type *", type: "select" },
    { key: "toolFixtureNo", label: "Tool/Fixture No", type: "text" },
    { key: "toolFixtureName", label: "Tool/Fixture Name", type: "text" },
    { key: "activityToolFixtureCost", label: "Activity Tool/Fixture Cost", type: "number", step: "0.01" },
  ];

  const machineColumns = [
    { key: "usage", label: "Usage", type: "select" },
    { key: "machineNo", label: "Machine No", type: "select" },
    { key: "machineName", label: "Machine Name", readOnly: true },
    { key: "setupTime", label: "Setup Time (min)", type: "number", step: "1" },
    { key: "outputPerHour", label: "Output/Hour", type: "number", step: "0.001" },
    { key: "machineHourRate", label: "Machine Hour Rate", type: "number", step: "0.01" },
    { key: "activityMachineCost", label: "Activity Machine Cost", readOnly: true },
    { key: "labourHour", label: "Labour Hour (min)", type: "number", step: "1" },
    { key: "labourHourRate", label: "Labour Hour Rate", type: "number", step: "0.01" },
    { key: "activityLabourCost", label: "Activity Labour Cost", readOnly: true },
    { key: "total", label: "Total", readOnly: true },
  ];

  const routingRowErrors = showErrors
    ? routingRows.reduce((acc, row, idx) => {
        const errs = {};
        if (!row.location?.trim()) errs.location = true;
        if (!row.operation?.trim()) errs.operation = true;
        if (row.sequence === "" || Number(row.sequence) <= 0) errs.sequence = true;
        if (Object.keys(errs).length > 0) acc[idx] = errs;
        return acc;
      }, {})
    : {};

  const toolFixtureRowErrors = showErrors
    ? toolFixtureRows.reduce((acc, row, idx) => {
        if (!row.usageType?.trim()) acc[idx] = { usageType: true };
        return acc;
      }, {})
    : {};

  /* ---------------- Render helpers ---------------- */

  const renderRoutingTab = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionHeader></SectionHeader>
        <button
          type="button"
          onClick={() => handleAddRow(setRoutingRows)(emptyRoutingRow)}
          className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Plus size={12} />
        </button>
      </div>

      {showErrors && tableErrors.routing && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
          Complete all mandatory columns in the Routing grid (Location, Operation, Sequence)
        </p>
      )}

      <TableWrapper>
        <TableHead headers={["#", ...routingColumns.map((c) => c.label), "Action"]} />
        <tbody>
          {routingWithCumulative.map((row, idx) => {
            const errs = routingRowErrors[idx] || {};
            return (
              <TableRow
                key={idx}
                index={idx}
                onRemove={() => handleRemoveRow(setRoutingRows)(idx)}
                disabled={routingRows.length <= 1}
              >
                {routingColumns.map((col) => {
                  if (col.type === "select") {
                    let options = itemOptions;
                    if (col.key === "location") options = locationOptions;
                    else if (col.key === "operation") options = operationOptions;
                    return (
                      <SelectCell
                        key={col.key}
                        value={row[col.key]}
                        error={errs[col.key]}
                        options={options}
                        onChange={(e) =>
                          handleRoutingChange(idx, col.key, e.target.value)
                        }
                      />
                    );
                  }
                  if (col.type === "textarea") {
                    return (
                      <TextAreaCell
                        key={col.key}
                        value={row[col.key]}
                        onChange={(e) =>
                          handleRoutingChange(idx, col.key, e.target.value)
                        }
                      />
                    );
                  }
                  if (col.readOnly) {
                    return <ReadOnlyCell key={col.key} value={row[col.key]} />;
                  }
                  return (
                    <InputCell
                      key={col.key}
                      value={row[col.key]}
                      type={col.type}
                      step={col.step}
                      error={errs[col.key]}
                      onChange={(e) =>
                        handleRoutingChange(idx, col.key, e.target.value)
                      }
                    />
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </TableWrapper>
    </div>
  );

  const renderChargesTab = () => {
    const totals = [
      { key: "totalMachineValue", label: "Total Machine Value" },
      { key: "totalLabourValue", label: "Total Labour Value" },
      { key: "totalToolFixtureValue", label: "Total Tool/Fixture Value" },
      { key: "totalConsumablesValue", label: "Total Consumables Value" },
      { key: "totalOperationValue", label: "Total Operation Value" },
    ];
    return (
      <div>
        <div className={fieldGrid}>
          {totals.map((t) => (
            <Field
              key={t.key}
              type="number"
              label={t.label}
              name={t.key}
              value={chargesTotals[t.key]}
              disabled
            />
          ))}
          <Field
            type="select"
            label="Prepared By"
            name="preparedBy"
            value={charges.preparedBy}
            onChange={handleChargesChange}
            error={fieldErrors.preparedBy}
            options={employeeOptions}
            required
          />
        </div>
      </div>
    );
  };

  const renderToolFixtureTab = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionHeader></SectionHeader>
        <button
          type="button"
          onClick={() => handleAddRow(setToolFixtureRows)(emptyToolFixtureRow)}
          className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Plus size={12} />
        </button>
      </div>

      {showErrors && tableErrors.toolFixture && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
          Complete all mandatory columns in the Tool/Fixture grid (Usage Type)
        </p>
      )}

      <TableWrapper>
        <TableHead headers={["#", ...toolFixtureColumns.map((c) => c.label), "Action"]} />
        <tbody>
          {toolFixtureRows.map((row, idx) => {
            const errs = toolFixtureRowErrors[idx] || {};
            return (
              <TableRow
                key={idx}
                index={idx}
                onRemove={() => handleRemoveRow(setToolFixtureRows)(idx)}
                disabled={toolFixtureRows.length <= 1}
              >
                {toolFixtureColumns.map((col) => {
                  if (col.type === "select") {
                    return (
                      <SelectCell
                        key={col.key}
                        value={row[col.key]}
                        error={errs[col.key]}
                        options={
                          col.key === "usageType" ? TOOL_USAGE_TYPE_OPTIONS : []
                        }
                        onChange={(e) =>
                          handleToolFixtureChange(idx, col.key, e.target.value)
                        }
                      />
                    );
                  }
                  return (
                    <InputCell
                      key={col.key}
                      value={row[col.key]}
                      type={col.type}
                      step={col.step}
                      error={errs[col.key]}
                      onChange={(e) =>
                        handleToolFixtureChange(idx, col.key, e.target.value)
                      }
                    />
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </TableWrapper>
    </div>
  );

  const renderMachineTab = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionHeader></SectionHeader>
        <button
          type="button"
          onClick={() => handleAddRow(setMachineRows)(emptyMachineRow)}
          className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Plus size={12} />
        </button>
      </div>

      <TableWrapper>
        <TableHead headers={["#", ...machineColumns.map((c) => c.label), "Action"]} />
        <tbody>
          {machineRows.map((row, idx) => {
            const calc = computeMachineRow(row);
            return (
              <TableRow
                key={idx}
                index={idx}
                onRemove={() => handleRemoveRow(setMachineRows)(idx)}
                disabled={machineRows.length <= 1}
              >
                {machineColumns.map((col) => {
                  if (col.type === "select") {
                    return (
                      <SelectCell
                        key={col.key}
                        value={row[col.key]}
                        options={
                          col.key === "usage" ? MACHINE_USAGE_OPTIONS : machineOptions
                        }
                        onChange={(e) =>
                          handleMachineChange(idx, col.key, e.target.value)
                        }
                      />
                    );
                  }
                  if (col.readOnly) {
                    const displayValue =
                      col.key === "activityMachineCost"
                        ? calc.activityMachineCost
                        : col.key === "activityLabourCost"
                          ? calc.activityLabourCost
                          : col.key === "total"
                            ? calc.total
                            : row[col.key];
                    return (
                      <ReadOnlyCell key={col.key} value={displayValue} />
                    );
                  }
                  return (
                    <InputCell
                      key={col.key}
                      value={row[col.key]}
                      type={col.type}
                      step={col.step}
                      onChange={(e) =>
                        handleMachineChange(idx, col.key, e.target.value)
                      }
                    />
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </TableWrapper>
    </div>
  );

  const tabs = [
    { label: "Routing" },
    { label: "Charges Summary" },
    { label: "Tool/Fixture Details" },
    { label: "Machine" },
  ];

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
          {data ? "Edit Process Sheet / Component Routing" : "Add Process Sheet / Component Routing"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Section ---------------- */}
        <div>
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
              label="FG/SFG Item Type"
              name="fgSfgItemType"
              value={header.fgSfgItemType}
              onChange={handleHeaderChange}
              error={fieldErrors.fgSfgItemType}
              options={ITEM_TYPE_OPTIONS}
              required
            />
            <Field
              type="select"
              label="FG/SFG Item Code"
              name="fgSfgItemCode"
              value={header.fgSfgItemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.fgSfgItemCode}
              options={itemOptions}
              required
            />
            <Field
              type="text"
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
              error={fieldErrors.itemDescription}
              required
            />
            <Field
              type="select"
              label="BOM ID"
              name="bomId"
              value={header.bomId}
              onChange={handleHeaderChange}
              options={bomOptions}
            />
            <Field
              type="text"
              label="Drawing No"
              name="drawingNo"
              value={header.drawingNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Cost Rate ID"
              name="costRateId"
              value={header.costRateId}
              onChange={handleHeaderChange}
              error={fieldErrors.costRateId}
              options={COST_RATE_OPTIONS}
              required
            />
            <YesNoToggle
              name="active"
              value={header.active}
              onChange={handleActiveToggle}
            />
          </div>
        </div>

        {/* ---------------- Tabbed Sections ---------------- */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TabComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-3">
            {activeTab === 0 && renderRoutingTab()}
            {activeTab === 1 && renderChargesTab()}
            {activeTab === 2 && renderToolFixtureTab()}
            {activeTab === 3 && renderMachineTab()}
          </div>
        </div>

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

export default ProcessSheetCompRoutingForm;