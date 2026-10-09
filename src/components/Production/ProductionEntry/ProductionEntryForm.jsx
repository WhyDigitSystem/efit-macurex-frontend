import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import productionEntryAPI from "../../../api/Production/productionEntryAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";

// ===================== Styles =====================

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

// ===================== Helpers =====================

const str = (v) => (v === null || v === undefined ? "" : String(v));

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// Strips floating point noise (backend uses BigDecimal)
const calc = (n) => String(parseFloat(n.toFixed(6)));

// A row is sent when the user filled anything in it (not only one key field)
const isFilled = (row) =>
  Object.values(row || {}).some((v) => str(v).trim() !== "");

const toHHMMSS = (t) => (!t ? "" : t.length === 5 ? `${t}:00` : t);

// Merge options so a saved value that is not in the live list is still shown on edit
const mergeOptions = (base = [], extra = []) => {
  const seen = new Set(base.map((o) => o.value));
  const added = [];
  extra.forEach((o) => {
    if (o?.value && !seen.has(o.value)) {
      seen.add(o.value);
      added.push(o);
    }
  });
  return [...added, ...base];
};

const getErrorMessage = (errors, name) => {
  let error = errors;
  for (const part of name.split(".")) {
    if (error && error[part]) error = error[part];
    else return null;
  }
  return error?.message;
};

// ===================== Reusable Components =====================

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
  step,
  readOnly,
  onChange,
}) => {
  const errorMessage = getErrorMessage(errors, name);
  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e.target.value);
            }}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  onChange,
  placeholder = "-- Select --",
}) => {
  const errorMessage = getErrorMessage(errors, name);
  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <select
            {...field}
            value={field.value ?? ""}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e.target.value);
            }}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => {
              const value = typeof opt === "object" ? opt.value : opt;
              const label = typeof opt === "object" ? opt.label : opt;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const TableCell = ({ control, name, col, errors, index }) => {
  const errorMessage = getErrorMessage(errors, name);
  const isSelect = col.type === "select";

  return (
    <td className="p-2 align-top min-w-[110px]">
      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          isSelect ? (
            <select
              {...field}
              value={field.value ?? ""}
              className={`${controlClasses} ${errorMessage ? "border-red-500" : ""}`}
              onChange={(e) => {
                field.onChange(e);
                col.onChange?.(e.target.value, index);
              }}
            >
              <option value="">-- Select --</option>
              {(col.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              {...field}
              value={field.value ?? ""}
              type={col.type || "text"}
              step={col.type === "number" ? col.step || "0.01" : undefined}
              placeholder={
                col.placeholder || (col.type === "number" ? "0.00" : "")
              }
              readOnly={col.readOnly}
              className={`${controlClasses} ${col.type === "number" ? "text-right" : ""} ${col.readOnly ? "bg-gray-50 dark:bg-gray-800" : ""} ${errorMessage ? "border-red-500" : ""}`}
              onChange={(e) => {
                field.onChange(e);
                col.onChange?.(e.target.value, index);
              }}
            />
          )
        }
      />
      {errorMessage && (
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

const DetailTable = ({
  title,
  name,
  columns,
  array,
  control,
  errors,
  makeRow,
}) => (
  <div className="pt-2 space-y-2">
    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
      <span>{title}</span>
      <button
        type="button"
        onClick={() => array.append(makeRow())}
        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
      >
        <Plus size={12} />
      </button>
    </div>

    <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="w-full min-w-max text-xs">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-2 w-8 text-center text-[10px] font-medium text-gray-700 dark:text-gray-200">
              S.No
            </th>
            {columns.map((c) => (
              <th
                key={c.key}
                className="p-2 text-left whitespace-nowrap text-[10px] font-medium text-gray-700 dark:text-gray-200"
              >
                {c.label}
              </th>
            ))}
            <th className="p-2 w-16 text-center text-[10px] font-medium text-gray-700 dark:text-gray-200">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {array.fields.map((field, index) => (
            <tr
              key={field.id}
              className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="p-2 text-center font-medium dark:text-white text-[10px]">
                {index + 1}
              </td>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  control={control}
                  name={`${name}.${index}.${c.key}`}
                  col={c}
                  errors={errors}
                  index={index}
                />
              ))}
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => array.fields.length > 1 && array.remove(index)}
                  disabled={array.fields.length <= 1}
                  className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                    array.fields.length <= 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  <Trash2 size={10} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ===================== Constants =====================

const SHIFTS = ["General", "Morning", "Afternoon", "Night"];

const TABS = [
  { key: "productionDetail", label: "Production Detail" },
  { key: "toolDetails", label: "Tool Details" },
  { key: "stoppageReason", label: "Stoppage Reason" },
  { key: "reworkReason", label: "Rework Reason" },
  { key: "scrapDetails", label: "Scrap Details" },
  { key: "productionSummary", label: "Production Summary" },
];

// ===================== Default Rows =====================

const getDefaultProductionRow = () => ({
  operationNo: "",
  machine: "",
  machineName: "",
  machineHourRate: "",
  labourHourRate: "",
  operationName: "",
  frTimeHrs: "",
  frTimeMins: "",
  toTimeHrs: "",
  toTimeMins: "",
  lunchTimeMins: "",
  totTimeMins: "",
  stoppageTimeMins: "",
  productiveHrsMins: "",
  qtyProduced: "",
  qtyPassed: "",
  qtyRejected: "",
  reason: "",
  qtyRework: "",
  noOfTools: "",
  qtyScrap: "",
  operationBy: "",
  remarks: "",
  stdRunTimePcsInSec: "",
  stdLabourCost: "",
  stdMcCost: "",
  runningActCostLabour: "",
  runningActCostMc: "",
  stdToolCost: "",
  runningActCostTool: "",
  stdConsumCost: "",
  runningActCostConsum: "",
});

const getDefaultToolRow = () => ({
  toolNo: "",
  toolName: "",
  strokes: "",
  strokesRate: "",
  toolValue: "",
});

const getDefaultStoppageRow = () => ({
  frTimeHrs: "",
  frTimeMins: "",
  toTimeHrs: "",
  toTimeMins: "",
  totTimeInMins: "",
  reason: "",
  stoppageMcCost: "",
  stoppageLabourCost: "",
  remarks: "",
});

const getDefaultReworkRow = () => ({
  reason: "",
  reasonDescription: "",
  qty: "",
  timePerQty: "",
  reworkProdHrs: "",
  reworkMcCost: "",
  reworkLabourCost: "",
});

const getDefaultScrapRow = () => ({
  scrap: "",
  scrapDescription: "",
  weight: "",
  qty: "",
});

const getDefaultValues = () => ({
  branch: "",
  docNo: "",
  docDate: dayjs().format("DD-MM-YYYY"),
  belongsTo: "",
  shiftTimeFrom: "",
  shiftTimeTo: "",
  shift: "",
  fgItemCode: "",
  fgItemDescription: "",
  location: "",
  productionQty: "",
  schOrderNo: "",
  preparedBy: "",
  processSheetNo: "",
  approvedBy: "",
  bomId: "",
  narration: "",
  productionDetails: [getDefaultProductionRow()],
  toolDetails: [getDefaultToolRow()],
  stoppageDetails: [getDefaultStoppageRow()],
  reworkDetails: [getDefaultReworkRow()],
  scrapDetails: [getDefaultScrapRow()],
});

// ===================== API response -> form values =====================
// Maps getProductionEntryById response to form values and also returns the
// "extras" (saved dropdown values) so they always show even if they are not
// part of the live dropdown lists.

const mapRecordToForm = (entry) => {
  const extras = {
    branch: [],
    belongsTo: [],
    fgItem: [],
    location: [],
    employees: [],
    bom: [],
    schOrder: [],
    processSheet: [],
    machine: [],
    reason: [],
    tool: [],
    scrap: [],
  };

  const pushExtra = (key, obj, labelFn) => {
    if (obj?.id !== undefined && obj?.id !== null) {
      extras[key].push({ value: str(obj.id), label: labelFn(obj) });
    }
  };

  const reasonLabel = (r) =>
    [r.reasonCode, r.reasonDescription].filter(Boolean).join(" - ") ||
    str(r.id);
  const empLabel = (e) => e.employeeName || e.employeeCode || str(e.id);

  pushExtra(
    "branch",
    entry.branch,
    (o) => o.branchName || o.branchCode || str(o.id),
  );
  if (entry.belongsTo)
    extras.belongsTo.push({ value: entry.belongsTo, label: entry.belongsTo });

  const fg = entry.fgItemCode || entry.fgItem;
  pushExtra("fgItem", fg, (o) => o.itemCode || str(o.id));
  pushExtra("location", entry.location, (o) => o.locationName || str(o.id));
  pushExtra("employees", entry.preparedBy, empLabel);
  pushExtra("employees", entry.approvedBy, empLabel);
  pushExtra("bom", entry.bomId, (o) => o.docId || str(o.id));

  if (entry.schOrderNo)
    extras.schOrder.push({ value: entry.schOrderNo, label: entry.schOrderNo });
  if (entry.processSheetNo)
    extras.processSheet.push({
      value: entry.processSheetNo,
      label: entry.processSheetNo,
    });

  const productionDetails = (entry.productionEntryDetailsResponseDTO || []).map(
    (d) => {
      pushExtra("machine", d.machine, (o) => o.machineName || str(o.id));
      pushExtra("reason", d.reason, reasonLabel);
      pushExtra("employees", d.operationBy, empLabel);

      return {
        operationNo: str(d.operationNo),
        machine: str(d.machine?.id),
        machineName: d.machine?.machineName || "",
        machineHourRate: str(d.machineHourRate),
        labourHourRate: str(d.labourHourRate),
        operationName: str(d.operationName),
        frTimeHrs: str(d.frTimeHrs),
        frTimeMins: str(d.frTimeMins),
        toTimeHrs: str(d.toTimeHrs),
        toTimeMins: str(d.toTimeMins),
        lunchTimeMins: str(d.lunchTimeMins),
        totTimeMins: str(d.totTimeMins),
        stoppageTimeMins: str(d.stoppageTimeMins),
        productiveHrsMins: str(d.productiveHrsMins),
        qtyProduced: str(d.qtyProduced),
        qtyPassed: str(d.qtyPassed),
        qtyRejected: str(
          d.qtyRejected ?? num(d.qtyProduced) - num(d.qtyPassed),
        ),
        reason: str(d.reason?.id),
        qtyRework: str(d.qtyRework),
        noOfTools: str(d.noOfTools),
        qtyScrap: str(d.qtyScrap),
        operationBy: str(d.operationBy?.id),
        remarks: str(d.remarks),
        stdRunTimePcsInSec: str(d.stdRunTimePcsInSec),
        stdLabourCost: str(d.stdLabourCost),
        stdMcCost: str(d.stdMcCost),
        runningActCostLabour: str(d.runningActCostLabour),
        runningActCostMc: str(d.runningActCostMc),
        stdToolCost: str(d.stdToolCost),
        runningActCostTool: str(d.runningActCostTool),
        stdConsumCost: str(d.stdConsumCost),
        runningActCostConsum: str(d.runningActCostConsum),
      };
    },
  );

  const toolDetails = (entry.toolDetailsResponseDTO || []).map((t) => {
    pushExtra("tool", t.toolNo, (o) => o.toolName || str(o.id));
    return {
      toolNo: str(t.toolNo?.id),
      toolName: t.toolNo?.toolName || "",
      strokes: str(t.strokes),
      strokesRate: str(t.strokesRate),
      toolValue: str(t.toolValue),
    };
  });

  const stoppageDetails = (entry.stoppageReasonResponseDTO || []).map((s) => {
    pushExtra("reason", s.reason, reasonLabel);
    return {
      frTimeHrs: str(s.frTimeHrs),
      frTimeMins: str(s.frTimeMins),
      toTimeHrs: str(s.toTimeHrs),
      toTimeMins: str(s.toTimeMins),
      totTimeInMins: str(s.totTimeInMins),
      reason: str(s.reason?.id),
      stoppageMcCost: str(s.stoppageMcCost),
      stoppageLabourCost: str(s.stoppageLabourCost),
      remarks: str(s.remarks),
    };
  });

  const reworkDetails = (entry.reworkReasonResponseDTO || []).map((r) => {
    pushExtra("reason", r.reason, reasonLabel);
    return {
      reason: str(r.reason?.id),
      reasonDescription: r.reason?.reasonDescription || "",
      qty: str(r.qty),
      timePerQty: str(r.timePerQty),
      reworkProdHrs: str(r.reworkProdHrs),
      reworkMcCost: str(r.reworkMcCost),
      reworkLabourCost: str(r.reworkLabourCost),
    };
  });

  const scrapDetails = (entry.scrapDetailsResponseDTO || []).map((s) => {
    pushExtra(
      "scrap",
      s.scrap,
      (o) =>
        o.itemCode || o.code || o.itemDescription || o.description || str(o.id),
    );
    return {
      scrap: str(s.scrap?.id),
      scrapDescription: s.scrap?.itemDescription || s.scrap?.description || "",
      weight: str(s.weight),
      qty: str(s.qty),
    };
  });

  const values = {
    branch: str(entry.branch?.id),
    docNo: entry.docId || "",
    docDate: entry.docDate ? dayjs(entry.docDate).format("DD-MM-YYYY") : "",
    belongsTo: entry.belongsTo || "",
    shiftTimeFrom: (entry.shiftTimeFrom || "").slice(0, 5),
    shiftTimeTo: (entry.shiftTimeTo || "").slice(0, 5),
    shift: entry.shift || "",
    fgItemCode: str(fg?.id),
    fgItemDescription: fg?.itemDescription || "",
    location: str(entry.location?.id),
    productionQty: str(entry.productionQty),
    schOrderNo: entry.schOrderNo || "",
    preparedBy: str(entry.preparedBy?.id),
    processSheetNo: entry.processSheetNo || "",
    approvedBy: str(entry.approvedBy?.id),
    bomId: str(entry.bomId?.id),
    narration: entry.narration || "",
    productionDetails: productionDetails.length
      ? productionDetails
      : [getDefaultProductionRow()],
    toolDetails: toolDetails.length ? toolDetails : [getDefaultToolRow()],
    stoppageDetails: stoppageDetails.length
      ? stoppageDetails
      : [getDefaultStoppageRow()],
    reworkDetails: reworkDetails.length
      ? reworkDetails
      : [getDefaultReworkRow()],
    scrapDetails: scrapDetails.length ? scrapDetails : [getDefaultScrapRow()],
  };

  return { values, extras };
};

// ===================== Main Component =====================

const ProductionEntryForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;

  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [defaultBranch] = useState(
    Number(localStorage.getItem("branchId")) || 0,
  );
  const usersId = localStorage.getItem("usersId");
  const finYear = localStorage.getItem("finYear") || String(dayjs().year());

  const isEdit = Boolean(data?.id);

  const [activeTab, setActiveTab] = useState("productionDetail");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Live lookups
  const [branches, setBranches] = useState([]);
  const [belongsToList, setBelongsToList] = useState([]);
  const [fgItems, setFgItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [tools, setTools] = useState([]);
  const [bomList, setBomList] = useState([]);
  const [schList, setSchList] = useState([]);
  const [processSheetList, setProcessSheetList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [scrapList, setScrapList] = useState([]);

  // Saved dropdown values (so edit mode always shows them)
  const [extras, setExtras] = useState({});

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { ...getDefaultValues(), branch: str(defaultBranch) },
  });

  const productionArray = useFieldArray({ control, name: "productionDetails" });
  const toolArray = useFieldArray({ control, name: "toolDetails" });
  const stoppageArray = useFieldArray({ control, name: "stoppageDetails" });
  const reworkArray = useFieldArray({ control, name: "reworkDetails" });
  const scrapArray = useFieldArray({ control, name: "scrapDetails" });

  const fgItem = useWatch({ control, name: "fgItemCode" });
  const watchedProduction = useWatch({ control, name: "productionDetails" });
  const watchedBranch = useWatch({ control, name: "branch" });
  const branch = Number(watchedBranch) || defaultBranch;

  // ---------- Load record on edit ----------
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const entry = await productionEntryAPI.getById(data.id);
        if (cancelled) return;

        if (!entry) {
          toastRef.current("Failed to load Production Entry data", "error");
          return;
        }

        const { values, extras: ex } = mapRecordToForm(entry);
        setExtras(ex);
        reset(values);
      } catch (error) {
        console.error("Error loading production entry:", error);
        toastRef.current("Failed to load Production Entry data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, data?.id, reset]);

  // ---------- Doc No for new entry ----------
  useEffect(() => {
    if (isEdit || !orgId) return;
    productionEntryAPI
      .getDocId(finYear, orgId)
      .then((docId) => docId && setValue("docNo", docId))
      .catch((e) => console.error("Failed to load doc id:", e));
  }, [isEdit, orgId, finYear, setValue]);

  // ---------- Branch + Belongs To lookups ----------
  useEffect(() => {
    if (!orgId) return;

    (async () => {
      const [br, bt] = await Promise.allSettled([
        productionEntryAPI.getBranches(orgId),
        productionEntryAPI.getListValues("BELONGS TO", orgId),
      ]);

      if (br.status === "fulfilled")
        setBranches(
          (br.value || []).map((b) => ({
            value: str(b.id),
            label: b.branchName || b.branchCode || str(b.id),
          })),
        );
      if (bt.status === "fulfilled")
        setBelongsToList(
          (bt.value || []).map((v) => ({
            value: v.valuesDescription,
            label: v.valuesDescription,
          })),
        );
    })();
  }, [orgId]);

  // ---------- Master lookups ----------
  useEffect(() => {
    if (!orgId) return;

    (async () => {
      const [fg, loc, emp, rsn, tl, scp] = await Promise.allSettled([
        productionEntryAPI.getFgItems(branch, orgId),
        locationMasterAPI.getLocationMasterByOrgId(orgId, branch),
        employeeAPI.getEmployeeByOrgId(orgId),
        productionEntryAPI.getReasons(orgId),
        productionEntryAPI.getTools(branch, orgId),
        productionEntryAPI.getScrapItems(branch, orgId),
      ]);

      if (fg.status === "fulfilled")
        setFgItems(
          (fg.value || []).map((i) => ({
            value: str(i.itemId),
            label: i.itemCode,
            description: i.itemDescription,
          })),
        );
      if (loc.status === "fulfilled")
        setLocations(
          (loc.value || []).map((l) => ({
            value: str(l.id),
            label: l.locationName || l.locationCode || str(l.id),
          })),
        );
      if (emp.status === "fulfilled")
        setEmployees(
          (emp.value || []).map((e) => ({
            value: str(e.id),
            label: e.employeeName || e.name || str(e.id),
          })),
        );
      if (rsn.status === "fulfilled")
        setReasons(
          (rsn.value || []).map((r) => ({
            value: str(r.id),
            label:
              [r.reasonCode, r.reasonDescription].filter(Boolean).join(" - ") ||
              str(r.id),
            description: r.reasonDescription || "",
          })),
        );
      if (scp.status === "fulfilled")
        setScrapList(
          (scp.value || []).map((s) => ({
            value: str(s.itemId),
            label: s.itemCode || str(s.itemId),
            description: s.itemDescription || "",
          })),
        );
      if (tl.status === "fulfilled")
        setTools(
          (tl.value || []).map((t) => ({
            value: str(t.id),
            label:
              [t.toolNo, t.toolName].filter(Boolean).join(" - ") || str(t.id),
            toolName: t.toolName || "",
          })),
        );
    })();
  }, [orgId, branch]);

  // ---------- FG item dependent lookups (BOM / Sch.Order / Process Sheet) ----------
  useEffect(() => {
    if (!fgItem || !orgId) {
      setBomList([]);
      setSchList([]);
      setProcessSheetList([]);
      return;
    }

    let cancelled = false;
    (async () => {
      const [bom, sch, ps] = await Promise.allSettled([
        productionEntryAPI.getBomNo(branch, fgItem, orgId),
        productionEntryAPI.getSchNo(branch, fgItem, orgId),
        productionEntryAPI.getProcessSheets(branch, fgItem, orgId),
      ]);
      if (cancelled) return;

      setBomList(
        bom.status === "fulfilled"
          ? bom.value.map((b) => ({ value: str(b.bomId), label: b.docId }))
          : [],
      );
      setSchList(
        sch.status === "fulfilled"
          ? sch.value.map((s) => ({ value: s.docId, label: s.docId }))
          : [],
      );
      setProcessSheetList(
        ps.status === "fulfilled"
          ? ps.value.map((p) => ({ value: p.docId, label: p.docId }))
          : [],
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [fgItem, orgId, branch]);

  // ---------- Merged option lists ----------
  const fgItemOptions = useMemo(
    () => mergeOptions(fgItems, extras.fgItem),
    [fgItems, extras],
  );
  const locationOptions = useMemo(
    () => mergeOptions(locations, extras.location),
    [locations, extras],
  );
  const employeeOptions = useMemo(
    () => mergeOptions(employees, extras.employees),
    [employees, extras],
  );
  const reasonOptions = useMemo(
    () => mergeOptions(reasons, extras.reason),
    [reasons, extras],
  );
  const toolOptions = useMemo(
    () => mergeOptions(tools, extras.tool),
    [tools, extras],
  );
  const bomOptions = useMemo(
    () => mergeOptions(bomList, extras.bom),
    [bomList, extras],
  );
  const schOptions = useMemo(
    () => mergeOptions(schList, extras.schOrder),
    [schList, extras],
  );
  const processSheetOptions = useMemo(
    () => mergeOptions(processSheetList, extras.processSheet),
    [processSheetList, extras],
  );
  const machineOptions = useMemo(
    () => mergeOptions(machineList, extras.machine),
    [machineList, extras],
  );
  const scrapOptions = useMemo(
    () => mergeOptions(scrapList, extras.scrap),
    [scrapList, extras],
  );
  const branchOptions = useMemo(
    () => mergeOptions(branches, extras.branch),
    [branches, extras],
  );
  const belongsToOptions = useMemo(
    () => mergeOptions(belongsToList, extras.belongsTo),
    [belongsToList, extras],
  );

  // ---------- Handlers ----------
  const handleBranchChange = () => {
    // FG item and everything that depends on it is branch specific
    setValue("fgItemCode", "");
    setValue("fgItemDescription", "");
    setValue("bomId", "");
    setValue("schOrderNo", "");
    setValue("processSheetNo", "");
  };

  const handleFGItemChange = (id) => {
    const item = fgItems.find((i) => i.value === id);
    setValue("fgItemDescription", item?.description || "");
    setValue("bomId", "");
    setValue("schOrderNo", "");
    setValue("processSheetNo", "");
  };

  const handleProcessSheetChange = async (processSheet) => {
    if (!processSheet) return;
    try {
      const ops = await productionEntryAPI.getProcessSheetOperations(
        branch,
        orgId,
        processSheet,
      );
      if (!ops.length) return;

      setMachineList(
        ops
          .filter((o) => o.machineEquipmentsMasterId)
          .map((o) => ({
            value: str(o.machineEquipmentsMasterId),
            label: o.machineInstrumentName || o.machineInstrumentNo || "",
          })),
      );

      productionArray.replace(
        ops.map((o) => ({
          ...getDefaultProductionRow(),
          operationNo: str(o.operation),
          operationName: o.description || "",
          machine: str(o.machineEquipmentsMasterId),
          machineName: o.machineInstrumentName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load process sheet operations:", error);
      addToast("Failed to load process sheet operations", "error");
    }
  };

  // Production row calculations
  const recalcTimes = (i) => {
    const g = (k) => num(getValues(`productionDetails.${i}.${k}`));
    // Same as backend: totTimeMins = frTimeMins + toTimeMins + lunchTimeMins
    const total = g("frTimeMins") + g("toTimeMins") + g("lunchTimeMins");
    setValue(`productionDetails.${i}.totTimeMins`, calc(total));
    // Same as backend: productiveHrsMins = totTimeMins - stoppageTimeMins
    setValue(
      `productionDetails.${i}.productiveHrsMins`,
      calc(total - g("stoppageTimeMins")),
    );
  };

  const recalcRejected = (i) => {
    const produced = num(getValues(`productionDetails.${i}.qtyProduced`));
    const passed = num(getValues(`productionDetails.${i}.qtyPassed`));
    // Same as backend: qtyRejected = qtyProduced - qtyPassed
    setValue(`productionDetails.${i}.qtyRejected`, calc(produced - passed));
  };

  const handleMachineChange = (value, i) => {
    const m = machineOptions.find((o) => o.value === value);
    setValue(`productionDetails.${i}.machineName`, m?.label || "");
  };

  // Stoppage row calculation
  const recalcStoppage = (i) => {
    const g = (k) => num(getValues(`stoppageDetails.${i}.${k}`));
    const total = Math.max(
      g("toTimeHrs") * 60 +
        g("toTimeMins") -
        (g("frTimeHrs") * 60 + g("frTimeMins")),
      0,
    );
    setValue(`stoppageDetails.${i}.totTimeInMins`, String(total));
  };

  // Tool row
  const handleToolChange = (value, i) => {
    const t = toolOptions.find((o) => o.value === value);
    setValue(`toolDetails.${i}.toolName`, t?.toolName || "");
  };

  const recalcToolValue = (i) => {
    const strokes = num(getValues(`toolDetails.${i}.strokes`));
    const rate = num(getValues(`toolDetails.${i}.strokesRate`));
    // Same as backend: toolValue = strokes * strokesRate
    setValue(`toolDetails.${i}.toolValue`, calc(strokes * rate));
  };

  // Rework row
  const handleReworkReasonChange = (value, i) => {
    const r = reasonOptions.find((o) => o.value === value);
    setValue(`reworkDetails.${i}.reasonDescription`, r?.description || "");
  };

  const recalcRework = (i) => {
    const qty = num(getValues(`reworkDetails.${i}.qty`));
    const per = num(getValues(`reworkDetails.${i}.timePerQty`));
    // Same as backend: reworkProdHrs = qty * timePerQty
    setValue(`reworkDetails.${i}.reworkProdHrs`, calc(qty * per));
  };

  // Scrap row
  const handleScrapChange = (value, i) => {
    const s = scrapOptions.find((o) => o.value === value);
    setValue(`scrapDetails.${i}.scrapDescription`, s?.description || "");
  };

  // ---------- Column definitions ----------
  const productionColumns = [
    { key: "operationNo", label: "Operation No.", type: "text" },
    {
      key: "machine",
      label: "Machine",
      type: "select",
      options: machineOptions,
      onChange: handleMachineChange,
    },
    { key: "machineName", label: "Machine Name", type: "text", readOnly: true },
    { key: "machineHourRate", label: "Machine Hour Rate", type: "number" },
    { key: "labourHourRate", label: "Labour Hour Rate", type: "number" },
    { key: "operationName", label: "Operation Name", type: "text" },
    {
      key: "frTimeHrs",
      label: "Fr.Time (Hrs.)",
      type: "number",
      onChange: (v, i) => recalcTimes(i),
    },
    {
      key: "frTimeMins",
      label: "Fr.Time (Mins.)",
      type: "number",
      onChange: (v, i) => recalcTimes(i),
    },
    {
      key: "toTimeHrs",
      label: "To Time (Hrs.)",
      type: "number",
      onChange: (v, i) => recalcTimes(i),
    },
    {
      key: "toTimeMins",
      label: "To Time (Mins.)",
      type: "number",
      onChange: (v, i) => recalcTimes(i),
    },
    {
      key: "lunchTimeMins",
      label: "Lunch Time (Mins)",
      type: "number",
      onChange: (v, i) => recalcTimes(i),
    },
    {
      key: "totTimeMins",
      label: "Tot.Time (Mins)",
      type: "number",
      readOnly: true,
    },
    {
      key: "stoppageTimeMins",
      label: "Stoppage Time (Mins)",
      type: "number",
      onChange: (v, i) => recalcTimes(i),
    },
    {
      key: "productiveHrsMins",
      label: "Productive Hrs (Mins)",
      type: "number",
      readOnly: true,
    },
    {
      key: "qtyProduced",
      label: "Qty Produced",
      type: "number",
      onChange: (v, i) => recalcRejected(i),
    },
    {
      key: "qtyPassed",
      label: "Qty Passed",
      type: "number",
      onChange: (v, i) => recalcRejected(i),
    },
    {
      key: "qtyRejected",
      label: "Qty Rejected",
      type: "number",
      readOnly: true,
    },
    { key: "reason", label: "Reason", type: "select", options: reasonOptions },
    { key: "qtyRework", label: "Qty Rework", type: "number" },
    { key: "noOfTools", label: "No Of Tools", type: "number" },
    { key: "qtyScrap", label: "Qty Scrap", type: "number" },
    {
      key: "operationBy",
      label: "Operation By",
      type: "select",
      options: employeeOptions,
    },
    { key: "remarks", label: "Remarks", type: "text" },
    {
      key: "stdRunTimePcsInSec",
      label: "Std.Run Time/Pcs In Sec.",
      type: "number",
    },
    { key: "stdLabourCost", label: "Std.Labour Cost", type: "number" },
    { key: "stdMcCost", label: "Std.M/C Cost", type: "number" },
    {
      key: "runningActCostLabour",
      label: "Running Act. Cost (Labour)",
      type: "number",
    },
    {
      key: "runningActCostMc",
      label: "Running Act. Cost (M/C)",
      type: "number",
    },
    { key: "stdToolCost", label: "Std.Tool Cost", type: "number" },
    {
      key: "runningActCostTool",
      label: "Running Act. Cost (Tool)",
      type: "number",
    },
    { key: "stdConsumCost", label: "Std.Consum. Cost", type: "number" },
    {
      key: "runningActCostConsum",
      label: "Running Act. Cost (Consum.)",
      type: "number",
    },
  ];

  const toolColumns = [
    {
      key: "toolNo",
      label: "Tool No",
      type: "select",
      options: toolOptions,
      onChange: handleToolChange,
    },
    { key: "toolName", label: "Tool Name", type: "text", readOnly: true },
    {
      key: "strokes",
      label: "Strokes",
      type: "number",
      onChange: (v, i) => recalcToolValue(i),
    },
    {
      key: "strokesRate",
      label: "Strokes Rate",
      type: "number",
      onChange: (v, i) => recalcToolValue(i),
    },
    { key: "toolValue", label: "Tool Value", type: "number", readOnly: true },
  ];

  const stoppageColumns = [
    {
      key: "frTimeHrs",
      label: "Fr.Time (Hrs.)",
      type: "number",
      onChange: (v, i) => recalcStoppage(i),
    },
    {
      key: "frTimeMins",
      label: "Fr.Time (Mins.)",
      type: "number",
      onChange: (v, i) => recalcStoppage(i),
    },
    {
      key: "toTimeHrs",
      label: "To Time (Hrs.)",
      type: "number",
      onChange: (v, i) => recalcStoppage(i),
    },
    {
      key: "toTimeMins",
      label: "To Time (Mins.)",
      type: "number",
      onChange: (v, i) => recalcStoppage(i),
    },
    {
      key: "totTimeInMins",
      label: "Tot. Time in Mins.",
      type: "number",
      readOnly: true,
    },
    { key: "reason", label: "Reason", type: "select", options: reasonOptions },
    { key: "stoppageMcCost", label: "Stoppage M/C Cost", type: "number" },
    {
      key: "stoppageLabourCost",
      label: "Stoppage Labour Cost",
      type: "number",
    },
    { key: "remarks", label: "Remarks", type: "text" },
  ];

  const reworkColumns = [
    {
      key: "reason",
      label: "Reason",
      type: "select",
      options: reasonOptions,
      onChange: handleReworkReasonChange,
    },
    {
      key: "reasonDescription",
      label: "Reason Description",
      type: "text",
      readOnly: true,
    },
    {
      key: "qty",
      label: "Qty.",
      type: "number",
      onChange: (v, i) => recalcRework(i),
    },
    {
      key: "timePerQty",
      label: "Time per qty.",
      type: "number",
      onChange: (v, i) => recalcRework(i),
    },
    {
      key: "reworkProdHrs",
      label: "Rework Prod.Hrs",
      type: "number",
      readOnly: true,
    },
    { key: "reworkMcCost", label: "Rework M/C Cost", type: "number" },
    { key: "reworkLabourCost", label: "Rework Labour Cost", type: "number" },
  ];

  const scrapColumns = [
    {
      key: "scrap",
      label: "Scrap Id",
      type: "select",
      options: scrapOptions,
      onChange: handleScrapChange,
    },
    {
      key: "scrapDescription",
      label: "Scrap Description",
      type: "text",
      readOnly: true,
    },
    { key: "weight", label: "Weight", type: "number" },
    { key: "qty", label: "Qty", type: "number" },
  ];

  // ---------- Summary totals (sum of production rows) ----------
  const totals = useMemo(() => {
    const rows = watchedProduction || [];
    const sum = (k) => rows.reduce((s, r) => s + num(r?.[k]), 0).toFixed(2);
    return {
      labour: sum("runningActCostLabour"),
      machine: sum("runningActCostMc"),
      tool: sum("runningActCostTool"),
      consumables: sum("runningActCostConsum"),
    };
  }, [watchedProduction]);

  // ---------- Save ----------
  const onSubmit = async (f) => {
    const productionRows = (f.productionDetails || []).filter(isFilled);

    if (!productionRows.length) {
      addToast("Add at least one production detail row", "error");
      setActiveTab("productionDetail");
      return;
    }

    const badRow = productionRows.findIndex(
      (r) => num(r.qtyPassed) > num(r.qtyProduced),
    );
    if (badRow >= 0) {
      addToast(
        `Production Detail row ${badRow + 1}: Qty Passed cannot be greater than Qty Produced`,
        "error",
      );
      setActiveTab("productionDetail");
      return;
    }

    setSaving(true);

    const payload = {
      active: true,
      approvedBy: num(f.approvedBy),
      belongsTo: f.belongsTo || "",
      bom: num(f.bomId),
      branch: num(f.branch) || branch,
      cancelRemarks: "",
      createdBy: usersId || "admin",
      fgItem: num(f.fgItemCode),
      financialYear: finYear,
      ...(isEdit ? { id: Number(data.id) } : {}),
      location: num(f.location),
      narration: f.narration || "",
      orgId,
      preparedBy: num(f.preparedBy),
      processSheetNo: f.processSheetNo || "",
      productionQty: num(f.productionQty),
      schOrderNo: f.schOrderNo || "",
      shift: f.shift || "",
      shiftTimeFrom: toHHMMSS(f.shiftTimeFrom),
      shiftTimeTo: toHHMMSS(f.shiftTimeTo),

      productionEntryDetailsDTO: productionRows.map((d) => ({
        frTimeHrs: num(d.frTimeHrs),
        frTimeMins: num(d.frTimeMins),
        labourHourRate: num(d.labourHourRate),
        lunchTimeMins: num(d.lunchTimeMins),
        machine: num(d.machine),
        machineHourRate: num(d.machineHourRate),
        noOfTools: num(d.noOfTools),
        operationBy: num(d.operationBy),
        operationName: d.operationName || "",
        operationNo: d.operationNo || "",
        qtyPassed: num(d.qtyPassed),
        qtyProduced: num(d.qtyProduced),
        qtyRework: num(d.qtyRework),
        qtyScrap: num(d.qtyScrap),
        reason: num(d.reason),
        remarks: d.remarks || "",
        runningActCostConsum: num(d.runningActCostConsum),
        runningActCostLabour: num(d.runningActCostLabour),
        runningActCostMc: num(d.runningActCostMc),
        runningActCostTool: num(d.runningActCostTool),
        stdConsumCost: num(d.stdConsumCost),
        stdLabourCost: num(d.stdLabourCost),
        stdMcCost: num(d.stdMcCost),
        stdRunTimePcsInSec: num(d.stdRunTimePcsInSec),
        stdToolCost: num(d.stdToolCost),
        stoppageTimeMins: num(d.stoppageTimeMins),
        toTimeHrs: num(d.toTimeHrs),
        toTimeMins: num(d.toTimeMins),
      })),

      toolDetailsDTO: (f.toolDetails || []).filter(isFilled).map((t) => ({
        strokes: num(t.strokes),
        strokesRate: num(t.strokesRate),
        toolNo: num(t.toolNo),
      })),

      stoppageReasonDTO: (f.stoppageDetails || [])
        .filter(isFilled)
        .map((s) => ({
          frTimeHrs: num(s.frTimeHrs),
          frTimeMins: num(s.frTimeMins),
          reason: num(s.reason),
          remarks: s.remarks || "",
          stoppageLabourCost: num(s.stoppageLabourCost),
          stoppageMcCost: num(s.stoppageMcCost),
          toTimeHrs: num(s.toTimeHrs),
          toTimeMins: num(s.toTimeMins),
          totTimeInMins: num(s.totTimeInMins),
        })),

      reworkReasonDTO: (f.reworkDetails || []).filter(isFilled).map((r) => ({
        qty: num(r.qty),
        reason: num(r.reason),
        reasonDescription: r.reasonDescription || "",
        reworkLabourCost: num(r.reworkLabourCost),
        reworkMcCost: num(r.reworkMcCost),
        timePerQty: num(r.timePerQty),
      })),

      scrapDetailsDTO: (f.scrapDetails || []).filter(isFilled).map((s) => ({
        qty: num(s.qty),
        scrap: num(s.scrap),
        weight: num(s.weight),
      })),
    };

    try {
      const response = await productionEntryAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isEdit
              ? "Production Entry updated successfully!"
              : "Production Entry created successfully!"),
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.paramObjectsMap?.message ||
            "Failed to save Production Entry.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Production Entry Error:", err);
      const d = err?.response?.data;
      addToast(
        d?.message || d?.statusMessage || d?.error || "Something went wrong.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  // On validation failure, jump back to header errors
  const onInvalid = () => addToast("Please fill all mandatory fields", "error");

  // ===================== Render =====================

  const renderHeader = () => (
    <div className={fieldGrid}>
      <SelectField
        control={control}
        name="branch"
        label="Branch"
        options={branchOptions}
        required
        errors={errors}
        onChange={handleBranchChange}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="docNo"
        label="Doc No."
        placeholder="Auto"
        readOnly
        errors={errors}
      />
      <InputField
        control={control}
        name="docDate"
        label="Date"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="belongsTo"
        label="Belongs To"
        options={belongsToOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <div className="flex gap-2 items-end">
        <InputField
          control={control}
          name="shiftTimeFrom"
          label="Shift Time From"
          type="time"
          required
          errors={errors}
        />
        <InputField
          control={control}
          name="shiftTimeTo"
          label="To"
          type="time"
          required
          errors={errors}
        />
      </div>

      <SelectField
        control={control}
        name="shift"
        label="Shift"
        options={SHIFTS}
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="fgItemCode"
        label="FG Item Code"
        options={fgItemOptions}
        required
        errors={errors}
        onChange={handleFGItemChange}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="fgItemDescription"
        label="FG Item Description"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="location"
        label="Location"
        options={locationOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="productionQty"
        label="Production QTY"
        type="number"
        step="0.01"
        required
        errors={errors}
        placeholder="0"
      />

      <SelectField
        control={control}
        name="schOrderNo"
        label="Sch.Order No."
        options={schOptions}
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="preparedBy"
        label="Prepared By"
        options={employeeOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="processSheetNo"
        label="Process Sheet No"
        options={processSheetOptions}
        errors={errors}
        onChange={handleProcessSheetChange}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="approvedBy"
        label="Approved By"
        options={employeeOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="bomId"
        label="BOM No"
        options={bomOptions}
        errors={errors}
        placeholder="Select an option"
      />
    </div>
  );

  const renderSummaryTab = () => (
    <div className="pt-2 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Labour Cost", totals.labour],
          ["Total Machine Cost", totals.machine],
          ["Total Tool Cost", totals.tool],
          ["Total Consumables Cost", totals.consumables],
        ].map(([label, value]) => (
          <div key={label}>
            <label className={labelClasses}>{label}</label>
            <input
              className={`${controlClasses} bg-gray-50 dark:bg-gray-800 text-right`}
              value={value}
              readOnly
            />
          </div>
        ))}
      </div>

      <div className="md:max-w-xl">
        <InputField
          control={control}
          name="narration"
          label="Narration"
          placeholder="Enter narration..."
          errors={errors}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full p-6 text-xs text-gray-500 dark:text-gray-400">
        Loading Production Entry...
      </div>
    );
  }

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
          {isEdit ? "Edit Production Entry" : "Add Production Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Production Entry</SectionHeader>
          {renderHeader()}
        </div>

        {/* Tabs */}
        <section className="bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "productionDetail" && (
            <DetailTable
              title="Add production details"
              name="productionDetails"
              columns={productionColumns}
              array={productionArray}
              control={control}
              errors={errors}
              makeRow={getDefaultProductionRow}
            />
          )}
          {activeTab === "toolDetails" && (
            <DetailTable
              title="Add tool details"
              name="toolDetails"
              columns={toolColumns}
              array={toolArray}
              control={control}
              errors={errors}
              makeRow={getDefaultToolRow}
            />
          )}
          {activeTab === "stoppageReason" && (
            <DetailTable
              title="Add stoppage reasons"
              name="stoppageDetails"
              columns={stoppageColumns}
              array={stoppageArray}
              control={control}
              errors={errors}
              makeRow={getDefaultStoppageRow}
            />
          )}
          {activeTab === "reworkReason" && (
            <DetailTable
              title="Add rework reasons"
              name="reworkDetails"
              columns={reworkColumns}
              array={reworkArray}
              control={control}
              errors={errors}
              makeRow={getDefaultReworkRow}
            />
          )}
          {activeTab === "scrapDetails" && (
            <DetailTable
              title="Add scrap details"
              name="scrapDetails"
              columns={scrapColumns}
              array={scrapArray}
              control={control}
              errors={errors}
              makeRow={getDefaultScrapRow}
            />
          )}
          {activeTab === "productionSummary" && renderSummaryTab()}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit, onInvalid)}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionEntryForm;
