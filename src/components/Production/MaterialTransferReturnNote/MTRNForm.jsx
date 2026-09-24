import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import materialTransferReturnNoteAPI from "../../../api/Production/materialTransferReturnNoteAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import employeeAPI from "../../../api/employeeAPI";

/* ---------------------------------------------------------------------------- */
/* Design tokens                                                                */

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
    const safeValue = value === null || value === undefined ? "" : value;
    const safeOptions = (options || []).map((opt) =>
      typeof opt === "object" ? opt : { value: opt, label: opt },
    );
    const inOptions = safeOptions.some(
      (o) => String(o.value) === String(safeValue),
    );
    const showGhost = safeValue !== "" && !inOptions;

    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select
          name={name}
          value={safeValue}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
          {safeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
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

const ToggleField = ({ label, checked, onChange }) => (
  <div className="w-full">
    <label className={labelClasses}>{label}</label>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full h-[30px] px-2 rounded border text-xs leading-none flex items-center justify-between transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
    >
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
        {checked ? "Yes" : "No"}
      </span>
      <span
        className={
          "relative inline-flex h-[16px] w-[30px] shrink-0 items-center rounded-full transition-colors " +
          (checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600")
        }
      >
        <span
          className={
            "inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-[15px]" : "translate-x-[2px]")
          }
        />
      </span>
    </button>
  </div>
);

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
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
          className={`p-2 whitespace-nowrap ${i === 0
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700"
          }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

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
              const safeValue =
                row[col.key] === null || row[col.key] === undefined
                  ? ""
                  : row[col.key];
              const opts = (col.options || []).map((opt) =>
                typeof opt === "object" ? opt : { value: opt, label: opt },
              );
              const inOptions = opts.some(
                (o) => String(o.value) === String(safeValue),
              );
              const showGhost = safeValue !== "" && !inOptions;

              return (
                <td className="p-2 align-top min-w-[140px]" key={col.key}>
                  <select
                    value={safeValue}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {showGhost && (
                      <option value={safeValue}>{String(safeValue)}</option>
                    )}
                    {opts.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top min-w-[160px]" key={col.key}>
                  <textarea
                    value={row[col.key]}
                    rows={1}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={cellInputClasses}
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top min-w-[110px]" key={col.key}>
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
                  onChange={(e) =>
                    onCellChange(idx, col.key, e.target.value)
                  }
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
/* Constants                                                                    */

const BELONGS_TO_LIST_NAME = "SDS BELONGS TO";

const CHILD_TABS = [
  { key: "itemTransferDetails", label: "Item Transfer Details", kind: "table" },
  { key: "summary", label: "Transfer/Return Summary", kind: "fields" },
];

const TYPE_OPTIONS = [
  { value: "Material Rejection Note", label: "Material Rejection Note" },
  { value: "Material Transfer Note", label: "Material Transfer Note" },
];

const YES_NO_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");
const toNum = (v) => Number(v) || 0;

const emptyDetailRow = () => ({
  item: "",
  itemDescription: "",
  unit: "",
  unitDisplay: "",
  availableQty: "",
  qty: "",
  rate: "",
  value: "",
  reason: "",
  supplier: "",
  supplierName: "",
});

/* ---------------------------------------------------------------------------- */

const MTRNForm = ({ data, onBack, onSave }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const isEditMode = Boolean(data?.id);
  const docIdLoadedRef = useRef(false);
  const dataLoadedRef = useRef(false);

  const [activeChildTab, setActiveChildTab] = useState("itemTransferDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- Lookup state ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [fgItemOptions, setFgItemOptions] = useState([]);
  const [schOrderOptions, setSchOrderOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [scheduleItemOptions, setScheduleItemOptions] = useState([]);

  const supplierMapRef = useRef({}); // supplierId -> supplier object
  const scheduleItemMapRef = useRef({}); // itemId -> schedule item object

  /* ---------------- Header state ---------------- */
  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId?.id ?? data?.plantId ?? "",
    belongsTo: data?.belongsTo?.id ?? data?.belongsTo ?? "",
    mtrnNo: data?.docId ?? data?.mtrnNo ?? "",
    mtrnDate: data?.docDate
      ? fmtDate(data.docDate)
      : data?.mtrnDate
        ? fmtDate(data.mtrnDate)
        : fmtDate(dayjs()),
    type: data?.type ?? "",
    fromLocation: data?.fromLocation?.id ?? data?.fromLocation ?? "",
    toLocation: data?.toLocation?.id ?? data?.toLocation ?? "",
    fgSfgPartNo: data?.fgItem?.id ?? data?.fgSfgPartNo ?? "",
    subOrderNo: data?.schOrderNo ?? data?.subOrderNo ?? "",
    time: data?.time ?? dayjs().format("HH:mm:ss"),
    preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
  }));

  const [detailRows, setDetailRows] = useState(() => {
    const raw =
      data?.materialTransferReturnNoteDetailsDTO ||
      data?.itemDetails ||
      data?.details ||
      [];

    if (raw.length) {
      return raw.map((item) => ({
        item: item.item?.id ?? item.item ?? "",
        itemDescription:
          item.item?.itemDescription ?? item.itemDescription ?? "",
        unit: item.unit?.id ?? item.unit ?? "",
        unitDisplay:
          item.unit?.unitId ?? item.unitDisplay ?? item.unit?.unitDescription ?? "",
        availableQty: item.availableQty ?? "",
        qty: item.qty ?? "",
        rate: item.rate ?? "",
        value: toNum(item.qty) * toNum(item.rate),
        reason: item.reasonForRejectionTransfer ?? "",
        supplier: item.supplier?.id ?? item.supplier ?? "",
        supplierName:
          item.supplier?.supplierName ??
          item.supplier?.customerName ??
          item.supplierName ??
          "",
      }));
    }
    return [emptyDetailRow()];
  });

  const [summary, setSummary] = useState({
    approvedByPm: data?.approvedByPm ?? "",
    approvedByQc: data?.approvedByQc ?? "",
    approvedByStores: data?.approvedByStores ?? "",
    narration: data?.narration ?? "",
  });

  /* ---------------- Load master data ---------------- */

  useEffect(() => {
    if (!orgId) return;

    // Plants
    (async () => {
      try {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || String(b.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load plants:", err);
      }
    })();

    // Belongs To — list-of-values
    (async () => {
      try {
        const list = await materialTransferReturnNoteAPI.getListValuesGroup(
          BELONGS_TO_LIST_NAME,
          orgId,
        );
        setBelongsToOptions(
          (list || []).map((item) => ({
            value: item.valuesDescription ?? item.value ?? item.id ?? "",
            label:
              item.valuesDescription ?? item.value ?? item.id ?? "",
          })),
        );
      } catch (err) {
        console.error("Failed to load Belongs To list:", err);
      }
    })();

    // Locations
    (async () => {
      try {
        const list = await locationMasterAPI.getLocationMasterByOrgId(
          orgId,
          branch,
        );
        setLocationOptions(
          (list || []).map((loc) => ({
            value: loc.id,
            label: loc.locationName || loc.locationId || String(loc.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    })();

    // FG / SFG Items
    (async () => {
      try {
        const list = await materialTransferReturnNoteAPI.getFgAndSfg({
          branch,
          orgId,
        });
        setFgItemOptions(
          (list || []).map((it) => ({
            value: it.itemId,
            label: it.itemCode || String(it.itemId),
          })),
        );
      } catch (err) {
        console.error("Failed to load FG/SFG items:", err);
      }
    })();

    // Schedule Orders
    (async () => {
      try {
        const list = await materialTransferReturnNoteAPI.getScheduleOrders({
          branch,
          orgId,
        });
        setSchOrderOptions(
          (list || []).map((o) => ({
            value: o.docId,
            label: o.docId,
          })),
        );
      } catch (err) {
        console.error("Failed to load schedule orders:", err);
      }
    })();

    // Employees
    (async () => {
      try {
        const list = await employeeAPI.getEmployeeByOrgId(orgId);
        setEmployeeOptions(
          (list || []).map((e) => ({
            value: e.id,
            label: e.employeeName || e.employeeId || String(e.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
    })();

    // Suppliers
    (async () => {
      try {
        const list = await materialTransferReturnNoteAPI.getSuppliers({
          branch,
          orgId,
        });
        const map = {};
        setSupplierOptions(
          (list || []).map((s) => {
            const value = s.supplierId;
            map[value] = s;
            return {
              value,
              label: s.supplierName || s.supplierCode || String(value),
            };
          }),
        );
        supplierMapRef.current = map;
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      }
    })();
  }, [orgId, branch]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */

  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!orgId) return;

    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await materialTransferReturnNoteAPI.getDocId({
          financialYear,
          orgId,
        });
        if (docId) {
          setHeader((prev) => ({ ...prev, mtrnNo: docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Doc Id:", err);
      }
    })();
  }, [isEditMode, orgId]);

  /* ---------------- Load schedule items when Sch Order changes ---------------- */

  useEffect(() => {
    const schNo = header.subOrderNo;
    if (!schNo) {
      setScheduleItemOptions([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const list = await materialTransferReturnNoteAPI.getScheduleItems({
          branch,
          orgId,
          schNo,
        });

        const map = {};
        const opts = (list || []).map((it) => {
          const value = it.itemId;
          map[value] = it;
          return {
            value,
            label: `${it.itemCode} — ${it.itemDescription}`,
          };
        });

        if (!cancelled) {
          scheduleItemMapRef.current = map;
          setScheduleItemOptions(opts);

          // Only pre-fill the first row when adding a NEW record.
          if (!isEditMode && opts.length) {
            const first = map[opts[0].value];
            setDetailRows([
              {
                item: first.itemId,
                itemDescription: first.itemDescription || "",
                unit: first.unitMasterId ?? "",
                unitDisplay: first.unitMasterDescription ?? "",
                availableQty: "",
                qty: first.qtyRequired ?? "",
                rate: "",
                value: 0,
                reason: "",
                supplier: "",
                supplierName: "",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load schedule items:", err);
        if (!cancelled) setScheduleItemOptions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [header.subOrderNo, branch, orgId, isEditMode]);

  /* ---------------- Re-sync when data prop changes (edit mode) ---------------- */
  useEffect(() => {
    if (!data) return;

    setHeader({
      plantId: data.plantId ?? data.branch?.id ?? "",
      belongsTo: data.belongsTo?.id ?? data.belongsTo ?? "",
      mtrnNo: data.docId ?? data.mtrnNo ?? "",
      mtrnDate: data.docDate
        ? fmtDate(data.docDate)
        : data.mtrnDate
          ? fmtDate(data.mtrnDate)
          : fmtDate(dayjs()),
      type: data.type ?? "",
      fromLocation: data.fromLocation?.id ?? data.fromLocation ?? "",
      toLocation: data.toLocation?.id ?? data.toLocation ?? "",
      fgSfgPartNo: data.fgItem?.id ?? data.fgItem ?? data.fgSfgPartNo ?? "",
      subOrderNo: data.schOrderNo ?? data.subOrderNo ?? "",
      time: data.time ?? dayjs().format("HH:mm:ss"),
      preparedBy: data.preparedBy?.id ?? data.preparedBy ?? "",
    });

    const raw =
      data.materialTransferReturnNoteDetailsDTO ||
      data.itemDetails ||
      data.details ||
      [];

    setDetailRows(
      raw.length
        ? raw.map((item) => {
          // Backend sometimes returns numeric fields as strings.
          const qty = toNum(item.qty);
          const rate = toNum(item.rate);
          const value =
            item.value !== undefined && item.value !== null
              ? toNum(item.value)
              : qty * rate;

          return {
            item: item.item?.id ?? item.item ?? "",
            itemDescription:
              item.item?.itemDescription ?? item.itemDescription ?? "",
            unit: item.unit?.id ?? item.unit ?? "",
            unitDisplay:
              item.unit?.unitId ??
              item.unitDisplay ??
              item.unit?.unitDescription ??
              "",
            availableQty:
              item.availableQty !== undefined && item.availableQty !== null
                ? item.availableQty
                : "",
            qty: qty || "",
            rate: rate || "",
            value: value || "",
            reason: item.reasonForRejectionTransfer ?? "",
            supplier: item.supplier?.id ?? item.supplier ?? "",
            supplierName:
              item.supplier?.supplierName ??
              item.supplier?.customerName ??
              item.supplierName ??
              "",
          };
        })
        : [emptyDetailRow()],
    );

    setSummary({
      approvedByPm: data.approvedByPm ?? "",
      approvedByQc: data.approvedByQc ?? "",
      approvedByStores: data.approvedByStores ?? "",
      narration: data.narration ?? "",
    });

    if (data.docId) docIdLoadedRef.current = true;
    // NOTE: Do NOT set dataLoadedRef.current = true here — allow re-sync.
  }, [data]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "item") {
          const it = scheduleItemMapRef.current[value];
          if (it) {
            next.itemDescription = it.itemDescription || "";
            next.unit = it.unitMasterId ?? "";
            next.unitDisplay = it.unitMasterDescription ?? "";
            next.qty = it.qtyRequired ?? next.qty;
          }
        }

        if (key === "supplier") {
          const s = supplierMapRef.current[value];
          next.supplierName = s ? s.supplierName || "" : "";
        }

        // Value = Qty * Rate
        const q = key === "qty" ? toNum(value) : toNum(next.qty);
        const r = key === "rate" ? toNum(value) : toNum(next.rate);
        next.value = q * r;

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const totalValue = detailRows.reduce((sum, r) => sum + toNum(r.value), 0);

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.mtrnNo?.trim()) errors.mtrnNo = "MTRN No is required";
    if (!header.mtrnDate) errors.mtrnDate = "MTRN Date is required";
    if (!header.type) errors.type = "Type is required";
    if (!header.fromLocation) errors.fromLocation = "From Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";
    if (!header.fgSfgPartNo) errors.fgSfgPartNo = "FG/SFG Part No is required";
    if (!header.subOrderNo) errors.subOrderNo = "Sub Order No is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";

    const validRows = detailRows.some(
      (r) => r.item && r.unit && toNum(r.qty) > 0,
    );
    if (!validRows)
      errors.itemTransferDetails =
        "Add at least one Item Transfer Detail row with Item, Unit and Qty";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const financialYear = String(new Date().getFullYear());

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),

      active: true,
      cancel: false,
      cancelRemarks: "",
      orgId,
      branch: Number(header.plantId) || branch || 0,
      financialYear,

      createdBy: isUpdate ? data?.createdBy ?? usersId : usersId,

      belongsTo: header.belongsTo || "",
      type: header.type || "",
      fromLocation: Number(header.fromLocation) || 0,
      toLocation: Number(header.toLocation) || 0,
      fgItem: Number(header.fgSfgPartNo) || 0,
      schOrderNo: header.subOrderNo || "",
      preparedBy: Number(header.preparedBy) || 0,

      approvedByPm: summary.approvedByPm || "",
      approvedByQc: summary.approvedByQc || "",
      approvedByStores: summary.approvedByStores || "",
      narration: summary.narration || "",

      materialTransferReturnNoteDetailsDTO: (detailRows || [])
        .filter((r) => r.item)
        .map((r) => ({
          item: Number(r.item) || 0,
          unit: Number(r.unit) || 0,
          availableQty: Number(r.availableQty) || 0,
          qty: Number(r.qty) || 0,
          rate: Number(r.rate) || 0,
          reasonForRejectionTransfer: r.reason || "",
          supplier: Number(r.supplier) || 0,
        })),
    };

    console.log("📤 Saving Material Transfer/Return Note:", payload);

    try {
      const response = await materialTransferReturnNoteAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Material Transfer/Return Note updated successfully!"
            : "Material Transfer/Return Note created successfully!"),
          "success",
        );
        if (onSave) onSave(payload);
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Material Transfer/Return Note.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save MTRN Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.statusMessage ||
        err.response?.data?.error ||
        "Something went wrong.";
      addToast(errorMessage, "error");
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
          {data
            ? "Edit Material Transfer/Return Note"
            : "Add Material Transfer/Return Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>MTRN Header</SectionHeader>
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
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={belongsToOptions}
              required
            />
            <Field
              label="MTRN No"
              name="mtrnNo"
              value={header.mtrnNo}
              onChange={handleHeaderChange}
              error={fieldErrors.mtrnNo}
              disabled
              required
            />
            <Field
              type="date"
              label="MTRN Date"
              name="mtrnDate"
              value={header.mtrnDate}
              onChange={handleHeaderChange}
              error={fieldErrors.mtrnDate}
              disabled
              required
            />
            <Field
              type="select"
              label="Type"
              name="type"
              value={header.type}
              onChange={handleHeaderChange}
              error={fieldErrors.type}
              options={TYPE_OPTIONS}
              required
            />
            <Field
              type="select"
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="To Location"
              name="toLocation"
              value={header.toLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.toLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="FG/SFG Part No"
              name="fgSfgPartNo"
              value={header.fgSfgPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.fgSfgPartNo}
              options={fgItemOptions}
              required
            />
            <Field
              type="select"
              label="Sch.Order No"
              name="subOrderNo"
              value={header.subOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.subOrderNo}
              options={schOrderOptions}
              required
            />
            <Field
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
              disabled
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
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${activeChildTab === tab.key
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

          {activeChildTab === "itemTransferDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "item",
                    label: "Item Code",
                    type: "select",
                    options: scheduleItemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    type: "text",
                    readOnly: true,
                  },
                  {
                    key: "unitDisplay",
                    label: "Unit",
                    type: "text",
                    readOnly: true,
                  },
                  { key: "availableQty", label: "Available Qty", type: "number" },
                  { key: "qty", label: "Qty", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "value", label: "Value", type: "number", readOnly: true },
                  {
                    key: "reason",
                    label: "Reason for Rejection/Transfer",
                    type: "textarea",
                  },
                  {
                    key: "supplier",
                    label: "Supplier ID",
                    type: "select",
                    options: supplierOptions,
                  },
                  {
                    key: "supplierName",
                    label: "Supplier Name",
                    type: "text",
                    readOnly: true,
                  },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
            </div>
          )}

          {activeChildTab === "summary" && (
            <div className="pt-3 pb-1">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Total Value"
                  name="totalValue"
                  value={totalValue}
                  onChange={() => { }}
                  disabled
                />
                <Field
                  type="select"
                  label="Approved By PM"
                  name="approvedByPm"
                  value={summary.approvedByPm}
                  onChange={handleSummaryChange}
                  options={YES_NO_OPTIONS}
                />
                <Field
                  type="select"
                  label="Approved By Q/C"
                  name="approvedByQc"
                  value={summary.approvedByQc}
                  onChange={handleSummaryChange}
                  options={YES_NO_OPTIONS}
                />
                <Field
                  type="select"
                  label="Approved By Stores"
                  name="approvedByStores"
                  value={summary.approvedByStores}
                  onChange={handleSummaryChange}
                  options={YES_NO_OPTIONS}
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
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

export default MTRNForm;