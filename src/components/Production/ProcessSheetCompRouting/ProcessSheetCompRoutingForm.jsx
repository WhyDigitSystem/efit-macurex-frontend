import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import TabComponent from "../../common/TabComponent";
import processSheetCompRoutingAPI from "../../../api/Production/processSheetCompRoutingAPI";
import { branchAPI } from "../../../api/branchAPI";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Design tokens                                                                */

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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

/* ---------------------------------------------------------------------------- */
/* Static options                                                               */

const ITEM_TYPE_OPTIONS = [
  { value: "FG", label: "FG" },
  { value: "SFG", label: "SFG" },
];

const USAGE_OPTIONS = [
  { value: "Regular", label: "Regular" },
  { value: "Alternative", label: "Alternative" },
];

/* ---------------------------------------------------------------------------- */
/* Building blocks                                                              */

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
  placeholder,
}) => (
  <div className="w-full">
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>

    {type === "select" ? (
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      >
        <option value="">Select {label}</option>
        {(options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />
    )}

    {error && (
      <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
        {error}
      </p>
    )}
  </div>
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

const AddButton = ({ onClick }) => (
  <div className="flex justify-end mb-2">
    <button
      type="button"
      onClick={onClick}
      className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
    >
      <Plus size={12} />
    </button>
  </div>
);

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
          className={`p-1 whitespace-nowrap text-left dark:text-white ${
            i === 0 ? "w-8 text-center" : ""
          }`}
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
  <td className="p-1 align-top min-w-[130px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      className={`${cellInputClasses} ${error ? controlErrClasses : ""}`}
    >
      <option value="">-- Select --</option>
      {(options || []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", step, error }) => (
  <td
    className={`p-1 align-top ${type === "number" ? "min-w-[100px]" : "min-w-[120px]"}`}
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
      className={`${cellInputClasses} h-8 min-h-[32px] py-1.5 resize-y`}
    />
  </td>
);

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top min-w-[120px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
  </td>
);

/* ---------------------------------------------------------------------------- */
/* Helpers + calculations                                                       */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fix2 = (n) => (Number.isFinite(n) ? n.toFixed(2) : "0.00");

/* Machine tab calculations
   - Activity M/C Cost   = Machine Hour Rate x (Setup Time/60 + 1/Output per Hour)
   - Activity Labour Cost = Labour Hour Rate x (Labour Minutes/60)
   - Total               = Activity M/C Cost + Activity Labour Cost
   Confirm this basis with the business owner (same as the Axpert screen). */
const calcMachine = (row) => {
  const hours =
    num(row.setupTimeMinutes) / 60 +
    (num(row.outputPerHour) > 0 ? 1 / num(row.outputPerHour) : 0);
  const mc = num(row.machineHourRate) * hours;
  const labour = num(row.labourHourRate) * (num(row.labourHourMinutes) / 60);
  return { mc, labour, total: mc + labour };
};

const emptyRoutingRow = () => ({
  location: "",
  operation: "",
  description: "",
  outputItemCode: "",
  spec: "",
  noOfToolsFixture: "",
  sequence: "",
  activityConsumCost: "",
  sourceOfVariation: "",
  productCharacteristics: "",
  processCharacteristics: "",
});

const emptyToolRow = () => ({
  usageType: "",
  toolFixtureNo: "",
  toolFixtureName: "",
  activityToolFixtureCost: "",
});

const emptyMachineRow = () => ({
  usageMachine: "",
  machineNo: "",
  machineName: "",
  setupTimeMinutes: "",
  outputPerHour: "",
  machineHourRate: "",
  labourHourMinutes: "",
  labourHourRate: "",
});

const withRows = (rows, empty) =>
  Array.isArray(rows) && rows.length
    ? rows.map((r) => ({ ...empty(), ...r }))
    : [empty()];

/* ---------------------------------------------------------------------------- */

const ProcessSheetCompRoutingForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");
  const finYear =
    localStorage.getItem("finYear") || String(new Date().getFullYear());

  const isEdit = Boolean(data?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  /* ---------------- lookups ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [bomOptions, setBomOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [operationOptions, setOperationOptions] = useState([]);
  const [operationMap, setOperationMap] = useState({});
  const [machineOptions, setMachineOptions] = useState([]);
  const [machineMap, setMachineMap] = useState({});
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [outputItemOptions, setOutputItemOptions] = useState([]);
  const [toolOptions, setToolOptions] = useState([]);
  const [toolMap, setToolMap] = useState({});

  /* ---------------- form state (pre-filled from `data` in edit mode) ------- */
  const [header, setHeader] = useState(() => ({
    docId: data?.docId || "",
    docDate: data?.docDate
      ? dayjs(data.docDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
    plantId: data?.plantId || (branch ? String(branch) : ""),
    fgSfgItemType: data?.fgSfgItemType || "",
    fgSfgItemCode: data?.fgSfgItemCode || "",
    itemDescription: data?.itemDescription || "",
    bomId: data?.bomId || "",
    drawingNo: data?.drawingNo || "",
    costRateId: data?.costRateId || "",
    active: data?.active ?? true,
  }));
  const [preparedBy, setPreparedBy] = useState(data?.preparedBy || "");
  const [routingRows, setRoutingRows] = useState(() =>
    withRows(data?.routingRows, emptyRoutingRow),
  );
  const [toolRows, setToolRows] = useState(() =>
    withRows(data?.toolFixtureRows, emptyToolRow),
  );
  const [machineRows, setMachineRows] = useState(() =>
    withRows(data?.machineRows, emptyMachineRow),
  );

  /* ---------------- derived values ---------------- */

  const routingWithCum = useMemo(() => {
    let running = 0;
    return routingRows.map((r) => {
      running += num(r.activityConsumCost);
      return { ...r, cumulativeConsumCost: running };
    });
  }, [routingRows]);

  const totals = useMemo(() => {
    const consumables = routingRows.reduce(
      (a, r) => a + num(r.activityConsumCost),
      0,
    );
    const tool = toolRows.reduce(
      (a, r) => a + num(r.activityToolFixtureCost),
      0,
    );
    let mc = 0;
    let labour = 0;
    machineRows.forEach((r) => {
      const c = calcMachine(r);
      mc += c.mc;
      labour += c.labour;
    });
    return {
      totalMcValue: mc,
      totalLabourValue: labour,
      totalToolFixtureValue: tool,
      totalConsumablesValue: consumables,
      totalOperationValue: mc + labour + tool + consumables,
    };
  }, [routingRows, toolRows, machineRows]);

  /* ---------------- load lookups ---------------- */

  useEffect(() => {
    if (!orgId) return;

    const safe = async (fn, onOk) => {
      try {
        onOk(await fn());
      } catch (e) {
        console.error("Lookup load failed:", e);
      }
    };

    safe(
      () => branchAPI.getBranchByOrgId(orgId),
      (res) =>
        setPlantOptions(
          (Array.isArray(res) ? res : []).map((b) => ({
            value: String(b.id ?? b.branchId),
            label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
          })),
        ),
    );

    safe(
      () => processSheetCompRoutingAPI.getBoms(orgId, branch),
      (list) =>
        setBomOptions(
          list.map((b) => ({
            value: String(b.id),
            label: b.docId || String(b.id),
          })),
        ),
    );

    safe(
      () => processSheetCompRoutingAPI.getLocations(orgId, branch),
      (list) =>
        setLocationOptions(
          list.map((l) => ({
            value: String(l.id),
            label: `${l.locationId || ""}${l.locationName ? ` - ${l.locationName}` : ""}`,
          })),
        ),
    );

    safe(
      () => processSheetCompRoutingAPI.getOperations(orgId),
      (list) => {
        const map = {};
        setOperationOptions(
          list.map((o) => {
            const v = String(o.operationMasterBasicId);
            map[v] = o;
            return { value: v, label: o.operationId };
          }),
        );
        setOperationMap(map);
      },
    );

    safe(
      () => processSheetCompRoutingAPI.getMachines(orgId, branch),
      (list) => {
        const map = {};
        setMachineOptions(
          list.map((m) => {
            const v = String(m.MachineId);
            map[v] = m;
            return { value: v, label: m.machineInstrumentNo };
          }),
        );
        setMachineMap(map);
      },
    );

    safe(
      () => processSheetCompRoutingAPI.getEmployees(orgId),
      (list) =>
        setEmployeeOptions(
          list.map((e) => ({
            value: String(e.id),
            label: `${e.employeeName || ""}${e.employeeId ? ` (${e.employeeId})` : ""}`,
          })),
        ),
    );

    // Tool/Fixture No dropdown -> tool master (value = tool id)
    safe(
      () => processSheetCompRoutingAPI.getTools(orgId, branch),
      (list) => {
        const map = {};
        setToolOptions(
          list.map((t) => {
            const v = String(t.id);
            map[v] = t;
            return {
              value: v,
              label: `${t.toolNo || ""}${t.toolName ? ` - ${t.toolName}` : ""}`,
            };
          }),
        );
        setToolMap(map);
      },
    );

    // Output Item Code dropdown -> item master (value = item id)
    safe(
      () => processSheetCompRoutingAPI.getItemMaster(orgId, branch),
      (list) =>
        setOutputItemOptions(
          list.map((it) => ({
            value: String(it.id),
            label: `${it.itemCode || ""}${it.itemDescription ? ` - ${it.itemDescription}` : ""}`,
          })),
        ),
    );
  }, [orgId, branch]);

  // Edit mode: if `data` arrives/changes after mount, keep Doc No in sync
  useEffect(() => {
    if (data?.docId) setHeader((p) => ({ ...p, docId: data.docId }));
  }, [data?.docId]);

  // Doc No is only generated for a new record
  useEffect(() => {
    if (isEdit || !orgId) return;
    processSheetCompRoutingAPI
      .getDocId(orgId, finYear)
      .then((docId) => setHeader((p) => ({ ...p, docId })))
      .catch((e) => console.error("DocId load failed:", e));
  }, [isEdit, orgId, finYear]);

  // FG/SFG items depend on the selected type (also runs on edit to resolve the saved item)
  useEffect(() => {
    if (!orgId || !header.fgSfgItemType) {
      setItemOptions([]);
      setItemMap({});
      return;
    }
    processSheetCompRoutingAPI
      .getFgSfgItems(orgId, branch, header.fgSfgItemType.toLowerCase())
      .then((list) => {
        const map = {};
        setItemOptions(
          list.map((it) => {
            const v = String(it.itemId);
            map[v] = it;
            return { value: v, label: it.itemCode };
          }),
        );
        setItemMap(map);
      })
      .catch((e) => {
        console.error("Item load failed:", e);
        setItemOptions([]);
        setItemMap({});
      });
  }, [orgId, branch, header.fgSfgItemType]);

  /* ---------------- handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "fgSfgItemType") {
        // changing the type invalidates the chosen item
        next.fgSfgItemCode = "";
        next.itemDescription = "";
        next.drawingNo = "";
      }
      if (name === "fgSfgItemCode") {
        const it = itemMap[value];
        next.itemDescription = it?.itemDescription || "";
        next.drawingNo = it?.drawingNo || "";
      }
      return next;
    });
  };

  const updateRow = (setter, idx, patch) =>
    setter((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const handleRoutingChange = (idx, key, value) => {
    const patch = { [key]: value };
    if (key === "operation") {
      const op = operationMap[value];
      if (op?.description) patch.description = op.description;
    }
    updateRow(setRoutingRows, idx, patch);
  };

  const handleToolChange = (idx, key, value) => {
    const patch = { [key]: value };
    if (key === "toolFixtureNo") {
      patch.toolFixtureName = toolMap[value]?.toolName || "";
    }
    updateRow(setToolRows, idx, patch);
  };

  const handleMachineChange = (idx, key, value) => {
    const patch = { [key]: value };
    if (key === "machineNo") {
      const m = machineMap[value];
      patch.machineName = m?.machineInstrumentName || "";
      patch.machineHourRate = m ? String(m.hourlyRate ?? "") : "";
    }
    updateRow(setMachineRows, idx, patch);
  };

  const addRow = (setter, empty) => setter((p) => [...p, empty()]);
  const removeRow = (setter, idx) =>
    setter((p) => p.filter((_, i) => i !== idx));

  /* ---------------- validation ---------------- */

  const routingRowErrors = (row) => ({
    location: !row.location,
    operation: !row.operation,
    sequence: !(num(row.sequence) > 0),
  });

  const validate = () => {
    const errors = {};
    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.fgSfgItemType)
      errors.fgSfgItemType = "FG/SFG Item Type is required";
    if (!header.fgSfgItemCode)
      errors.fgSfgItemCode = "FG/SFG Item Code is required";
    if (!preparedBy) errors.preparedBy = "Prepared By is required";
    setFieldErrors(errors);

    const routingOk = routingRows.every(
      (r) => !Object.values(routingRowErrors(r)).some(Boolean),
    );
    const toolOk = toolRows.every((r) => r.usageType);

    const valid = !Object.keys(errors).length && routingOk && toolOk;
    setShowErrors(!valid);
    return valid;
  };

  /* ---------------- save ---------------- */

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fill all mandatory fields before saving.", "error");
      return;
    }
    setIsSubmitting(true);

    const idIf = (r) => (r.id ? { id: r.id } : {});

    const payload = {
      ...(isEdit ? { id: data.id } : {}),
      active: header.active,
      bom: header.bomId ? Number(header.bomId) : null,
      branch: Number(header.plantId) || branch,
      cancel: false,
      cancelRemarks: "",
      fgSfgItemCode: Number(header.fgSfgItemCode),
      fgSfgItemType: header.fgSfgItemType,
      itemDescription: header.itemDescription,
      orgId,
      preparedBy: Number(preparedBy),
      createdBy: isEdit ? data?.createdBy || usersId : usersId,
      ...(isEdit ? { updatedBy: usersId } : {}),

      processSheetCompRoutingDetailDTO: routingWithCum.map((r) => ({
        ...idIf(r),
        activityConsumCost: num(r.activityConsumCost),
        cumulativeConsumCost: num(r.cumulativeConsumCost),
        description: r.description,
        location: Number(r.location),
        noOfToolsFixture: num(r.noOfToolsFixture),
        operation: Number(r.operation),
        outputItemCode: num(r.outputItemCode),
        processCharacteristics: r.processCharacteristics,
        productCharacteristics: r.productCharacteristics,
        sequence: num(r.sequence),
        sourceOfVariation: r.sourceOfVariation,
        spec: r.spec,
      })),

      processSheetToolFixtureDetailsDTO: toolRows.map((r) => ({
        ...idIf(r),
        activityToolFixtureCost: num(r.activityToolFixtureCost),
        toolFixtureName: r.toolFixtureName,
        toolFixtureNo: num(r.toolFixtureNo),
        usageType: r.usageType,
      })),

      processSheetCompRoutingMachineDTO: machineRows.map((r) => {
        const c = calcMachine(r);
        return {
          ...idIf(r),
          activityLabourCost: Number(c.labour.toFixed(2)),
          activityMcCost: Number(c.mc.toFixed(2)),
          labourHourMinutes: num(r.labourHourMinutes),
          labourHourRate: num(r.labourHourRate),
          machineHourRate: num(r.machineHourRate),
          machineName: r.machineName,
          machineNo: Number(r.machineNo) || 0,
          outputPerHour: num(r.outputPerHour),
          setupTimeMinutes: num(r.setupTimeMinutes),
          total: Number(c.total.toFixed(2)),
          usageMachine: r.usageMachine,
        };
      }),

      totalConsumablesValue: Number(totals.totalConsumablesValue.toFixed(2)),
      totalLabourValue: Number(totals.totalLabourValue.toFixed(2)),
      totalMcValue: Number(totals.totalMcValue.toFixed(2)),
      totalOperationValue: Number(totals.totalOperationValue.toFixed(2)),
      totalToolFixtureValue: Number(totals.totalToolFixtureValue.toFixed(2)),
    };

    try {
      const response = await processSheetCompRoutingAPI.createUpdate(payload);
      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isEdit
              ? "Process Sheet / Routing updated successfully!"
              : "Process Sheet / Routing created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            "Failed to save Process Sheet / Routing.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Process Sheet / Routing Error:", err);
      addToast(
        err.response?.data?.paramObjectsMap?.errorMessage ||
          err.response?.data?.message ||
          "Something went wrong.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- columns ---------------- */

  const routingColumns = [
    {
      key: "location",
      label: "Location *",
      type: "select",
      options: locationOptions,
    },
    {
      key: "operation",
      label: "Operation *",
      type: "select",
      options: operationOptions,
    },
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "outputItemCode",
      label: "Output Item Code",
      type: "select",
      options: outputItemOptions,
    },
    { key: "spec", label: "Spec.", type: "text" },
    {
      key: "noOfToolsFixture",
      label: "No. of Tools/Fixture",
      type: "number",
      step: "1",
    },
    { key: "sequence", label: "Sequence *", type: "number", step: "1" },
    {
      key: "activityConsumCost",
      label: "Activity Consum. Cost",
      type: "number",
      step: "0.01",
    },
    {
      key: "cumulativeConsumCost",
      label: "Cumulative Consum. Cost",
      readOnly: true,
    },
    { key: "sourceOfVariation", label: "Source of Variation", type: "text" },
    {
      key: "productCharacteristics",
      label: "Product Characteristics",
      type: "textarea",
    },
    {
      key: "processCharacteristics",
      label: "Process Characteristics",
      type: "textarea",
    },
  ];

  const toolColumns = [
    {
      key: "usageType",
      label: "Usage Type *",
      type: "select",
      options: USAGE_OPTIONS,
    },
    {
      key: "toolFixtureNo",
      label: "Tool/Fixture No",
      type: "select",
      options: toolOptions,
    },
    { key: "toolFixtureName", label: "Tool/Fixture Name", type: "text" },
    {
      key: "activityToolFixtureCost",
      label: "Activity Tool/Fixture Cost",
      type: "number",
      step: "0.01",
    },
  ];

  const machineColumns = [
    {
      key: "usageMachine",
      label: "Usage",
      type: "select",
      options: USAGE_OPTIONS,
    },
    {
      key: "machineNo",
      label: "Machine No.",
      type: "select",
      options: machineOptions,
    },
    { key: "machineName", label: "Machine Name", readOnly: true },
    {
      key: "setupTimeMinutes",
      label: "Setup Time (Minutes)",
      type: "number",
      step: "1",
    },
    {
      key: "outputPerHour",
      label: "Output/Hour",
      type: "number",
      step: "0.001",
    },
    {
      key: "machineHourRate",
      label: "Machine Hour Rate",
      type: "number",
      step: "0.01",
    },
    { key: "activityMcCost", label: "Activity M/C Cost", readOnly: true },
    {
      key: "labourHourMinutes",
      label: "Labour Hour (Mins)",
      type: "number",
      step: "1",
    },
    {
      key: "labourHourRate",
      label: "Labour Hour Rate",
      type: "number",
      step: "0.01",
    },
    {
      key: "activityLabourCost",
      label: "Activity Labour Cost",
      readOnly: true,
    },
    { key: "total", label: "Total", readOnly: true },
  ];

  /* ---------------- tabs ---------------- */

  const renderRoutingTab = () => (
    <div>
      <AddButton onClick={() => addRow(setRoutingRows, emptyRoutingRow)} />
      {showErrors &&
        routingRows.some((r) =>
          Object.values(routingRowErrors(r)).some(Boolean),
        ) && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
            Complete all mandatory columns in the Routing grid (Location,
            Operation, Sequence)
          </p>
        )}
      <TableWrapper>
        <TableHead
          headers={["#", ...routingColumns.map((c) => c.label), "Action"]}
        />
        <tbody>
          {routingWithCum.map((row, idx) => {
            const errs = showErrors ? routingRowErrors(routingRows[idx]) : {};
            return (
              <TableRow
                key={row.id ?? idx}
                index={idx}
                onRemove={() => removeRow(setRoutingRows, idx)}
                disabled={routingRows.length <= 1}
              >
                {routingColumns.map((col) => {
                  const onChange = (e) =>
                    handleRoutingChange(idx, col.key, e.target.value);
                  if (col.readOnly)
                    return (
                      <ReadOnlyCell
                        key={col.key}
                        value={fix2(num(row[col.key]))}
                      />
                    );
                  if (col.type === "select")
                    return (
                      <SelectCell
                        key={col.key}
                        value={row[col.key]}
                        options={col.options}
                        error={errs[col.key]}
                        onChange={onChange}
                      />
                    );
                  if (col.type === "textarea")
                    return (
                      <TextAreaCell
                        key={col.key}
                        value={row[col.key]}
                        onChange={onChange}
                      />
                    );
                  return (
                    <InputCell
                      key={col.key}
                      value={row[col.key]}
                      type={col.type}
                      step={col.step}
                      error={errs[col.key]}
                      onChange={onChange}
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
    const items = [
      ["Total M/C Value", totals.totalMcValue],
      ["Total Labour Value", totals.totalLabourValue],
      ["Total Tool/Fixture Value", totals.totalToolFixtureValue],
      ["Total Consumables Value", totals.totalConsumablesValue],
      ["Total Operation Value", totals.totalOperationValue],
    ];
    return (
      <div className={fieldGrid}>
        {items.map(([label, value]) => (
          <Field key={label} label={label} value={fix2(value)} disabled />
        ))}
        <Field
          type="select"
          label="Prepared By"
          name="preparedBy"
          value={preparedBy}
          onChange={(e) => {
            setPreparedBy(e.target.value);
            if (fieldErrors.preparedBy)
              setFieldErrors((p) => ({ ...p, preparedBy: "" }));
          }}
          options={employeeOptions}
          error={fieldErrors.preparedBy}
          required
        />
      </div>
    );
  };

  const renderToolTab = () => (
    <div>
      <AddButton onClick={() => addRow(setToolRows, emptyToolRow)} />
      {showErrors && toolRows.some((r) => !r.usageType) && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
          Complete all mandatory columns in the Tool/Fixture grid (Usage Type)
        </p>
      )}
      <TableWrapper>
        <TableHead
          headers={["#", ...toolColumns.map((c) => c.label), "Action"]}
        />
        <tbody>
          {toolRows.map((row, idx) => (
            <TableRow
              key={row.id ?? idx}
              index={idx}
              onRemove={() => removeRow(setToolRows, idx)}
              disabled={toolRows.length <= 1}
            >
              {toolColumns.map((col) => {
                const onChange = (e) =>
                  handleToolChange(idx, col.key, e.target.value);
                if (col.type === "select")
                  return (
                    <SelectCell
                      key={col.key}
                      value={row[col.key]}
                      options={col.options}
                      error={
                        showErrors && col.key === "usageType" && !row[col.key]
                      }
                      onChange={onChange}
                    />
                  );
                return (
                  <InputCell
                    key={col.key}
                    value={row[col.key]}
                    type={col.type}
                    step={col.step}
                    onChange={onChange}
                  />
                );
              })}
            </TableRow>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );

  const renderMachineTab = () => (
    <div>
      <AddButton onClick={() => addRow(setMachineRows, emptyMachineRow)} />
      <TableWrapper>
        <TableHead
          headers={["#", ...machineColumns.map((c) => c.label), "Action"]}
        />
        <tbody>
          {machineRows.map((row, idx) => {
            const calc = calcMachine(row);
            const readOnlyValues = {
              machineName: row.machineName,
              activityMcCost: fix2(calc.mc),
              activityLabourCost: fix2(calc.labour),
              total: fix2(calc.total),
            };
            return (
              <TableRow
                key={row.id ?? idx}
                index={idx}
                onRemove={() => removeRow(setMachineRows, idx)}
                disabled={machineRows.length <= 1}
              >
                {machineColumns.map((col) => {
                  const onChange = (e) =>
                    handleMachineChange(idx, col.key, e.target.value);
                  if (col.readOnly)
                    return (
                      <ReadOnlyCell
                        key={col.key}
                        value={readOnlyValues[col.key]}
                      />
                    );
                  if (col.type === "select")
                    return (
                      <SelectCell
                        key={col.key}
                        value={row[col.key]}
                        options={col.options}
                        onChange={onChange}
                      />
                    );
                  return (
                    <InputCell
                      key={col.key}
                      value={row[col.key]}
                      type={col.type}
                      step={col.step}
                      onChange={onChange}
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
    { label: "Tool/Fixture Details" },
    { label: "Machine" },
    { label: "Charges Summary" },
  ];

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEdit
            ? "Edit Process Sheet / Component Routing"
            : "Add Process Sheet / Component Routing"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
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
            label="Doc. No."
            name="docId"
            value={header.docId || "Auto"}
            disabled
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
            type="date"
            label="Date"
            name="docDate"
            value={header.docDate}
            onChange={handleHeaderChange}
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
            label="Item Description"
            name="itemDescription"
            value={header.itemDescription}
            disabled
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
            label="Drawing No."
            name="drawingNo"
            value={header.drawingNo}
            disabled
          />
          <Field
            label="Cost Rate ID"
            name="costRateId"
            value={header.costRateId}
            onChange={handleHeaderChange}
          />
          <YesNoToggle
            name="active"
            value={header.active}
            onChange={handleHeaderChange}
          />
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TabComponent
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="p-3">
            {activeTab === 0 && renderRoutingTab()}
            {activeTab === 1 && renderToolTab()}
            {activeTab === 2 && renderMachineTab()}
            {activeTab === 3 && renderChargesTab()}
          </div>
        </div>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={isEdit ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default ProcessSheetCompRoutingForm;
