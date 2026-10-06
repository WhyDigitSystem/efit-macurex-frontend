import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";
import branchAPI from "../../../api/branchAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

import { useToast } from "../../Toast/ToastContext";

/* ========================================================================= */
/* DESIGN TOKENS                                                             */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;

  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
};

const toInteger = (value, fallback = 0) => {
  const n = parseInt(value, 10);

  return Number.isFinite(n) ? n : fallback;
};

/* Number or null (never NaN) */
const toIdOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const n = Number(value);

  return Number.isFinite(n) ? n : null;
};

const round2 = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const money = (value) => round2(value).toFixed(2);

const todayISO = () => new Date().toISOString().slice(0, 10);

const nowTime = () => new Date().toTimeString().slice(0, 8);

const isObj = (v) => v !== null && typeof v === "object";

const norm = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

/* First value that is not undefined / null / "" */
const pick = (...values) => {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
};

/* ID of a backend value that can be an object or a primitive */
const idOf = (v, ...keys) => {
  if (isObj(v)) {
    return pick(...keys.map((k) => v[k]), v.id);
  }
  return v ?? "";
};

/* Unit label from an item record: object, plain text, or alternate keys */
const itemUnitText = (item) => {
  const source = item?.unit ?? item?.primaryUnits ?? item?.uom ?? null;

  const text = unitText(source);

  return text || String(pick(item?.primaryUnit, item?.unitName));
};

/* Unit can be an object or a plain text */
const unitText = (u) =>
  isObj(u)
    ? String(pick(u.unitName, u.primaryUnit, u.name, u.unit))
    : String(u ?? "");

/* Converts "2026-09-01T00:00:00", "01-09-2026", "01/09/2026" -> "2026-09-01" */
const toDateInput = (v) => {
  const text = String(v ?? "").trim();

  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const dmy = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);

  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  return "";
};

/*
 * Make sure the saved value is always visible in a <select>, even if it is not
 * (yet) one of the options (options still loading, name vs id, different case).
 */
const withCurrent = (options, value) => {
  const list = options || [];

  if (value === "" || value === null || value === undefined) return list;

  const exists = list.some(
    (o) => String(isObj(o) ? o.value : o) === String(value),
  );

  return exists ? list : [...list, { value, label: String(value) }];
};

const APPROVAL_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

/* ========================================================================= */
/* EMPTY ROW + DEFAULT FORM                                                  */
/* ========================================================================= */

const emptyItemRow = () => ({
  id: 0,
  item: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  bookStock: "",
  actualQty: "",
  difference: "",
  lcRate: "",
  rate: "",
  reasonCode: "",
  amount: "",
});

const getDefaultForm = (branch) => ({
  id: 0,
  active: true,

  approvedByPM: "Pending",

  belongsTo: "",

  branch: String(branch || ""),

  cancelRemarks: "",

  createdBy: "",

  docDate: todayISO(),

  docId: "",

  financialYear: `${new Date().getFullYear()}-${String(
    (new Date().getFullYear() % 100) + 1,
  ).padStart(2, "0")}`,

  location: "",

  locationType: "",

  narration: "",

  preparedBy: "",

  /* name sent by the backend, used only to resolve preparedBy against options */
  preparedByName: "",

  refDate: todayISO(),

  refNo: "",

  time: nowTime(),
});

/* ========================================================================= */
/* EDIT DATA: EXTRACT + MAP                                                  */
/* ========================================================================= */

/*
 * getReconciliationById may return:
 *   - the record itself
 *   - an array with one record
 *   - { status, paramObjectsMap: { <someVO>: {...} } }
 * so handle all of them.
 */
const extractRecord = (response) => {
  if (!response) return null;

  if (Array.isArray(response)) {
    return isObj(response[0]) ? response[0] : null;
  }

  const map = response?.paramObjectsMap || response?.data?.paramObjectsMap;

  if (map) {
    let record =
      map.physicalStockReConcilationVO ??
      map.physicalStockReconciliationVO ??
      map.physicalStockReConcilation ??
      map.physicalStockReconciliation ??
      Object.values(map).find((v) => isObj(v));

    if (Array.isArray(record)) record = record[0];

    return isObj(record) ? record : null;
  }

  if (isObj(response?.data) && !Array.isArray(response.data)) {
    return response.data;
  }

  return isObj(response) ? response : null;
};

/* Find an array on the record by exact key first, then by key pattern */
const findArray = (d, exactKeys, regex) => {
  for (const key of exactKeys) {
    if (Array.isArray(d[key]) && d[key].length) return d[key];
  }

  const found = Object.keys(d).find(
    (key) => regex.test(key) && Array.isArray(d[key]) && d[key].length,
  );

  return found ? d[found] : [];
};

const mapDetailRow = (detail) => {
  const itemObj = isObj(detail.item) ? detail.item : null;

  const bookStock = pick(detail.bookStock, detail.bookQty);
  const actualQty = pick(detail.actualQty, detail.actualStock);
  const rate = pick(detail.rate);

  const difference =
    pick(detail.difference) !== ""
      ? detail.difference
      : bookStock !== "" || actualQty !== ""
        ? round2(toNumber(actualQty) - toNumber(bookStock))
        : "";

  const amount =
    pick(detail.amount) !== ""
      ? detail.amount
      : actualQty !== "" && rate !== ""
        ? money(toNumber(actualQty) * toNumber(rate))
        : "";

  return {
    ...emptyItemRow(),

    id: detail.id ?? 0,

    /* item id (or code, resolved against options later) */
    item: String(
      pick(
        itemObj ? pick(itemObj.itemId, itemObj.id) : detail.item,
        detail.itemId,
      ),
    ),

    itemCode: String(pick(itemObj?.itemCode, detail.itemCode, itemObj?.code)),

    itemDescription: String(
      pick(
        itemObj?.itemDescription,
        detail.itemDescription,
        detail.description,
      ),
    ),

    unit: unitText(pick(detail.unit, itemObj?.unit, itemObj?.uom)),

    bookStock,
    actualQty,
    difference,

    lcRate: pick(detail.lcRate),
    rate,

    reasonCode: String(pick(detail.reasonCode)),

    amount,
  };
};

const mapEditData = (d, fallbackBranchId) => {
  const approval = APPROVAL_OPTIONS.find(
    (o) => norm(o.value) === norm(isObj(d.approvedByPM) ? "" : d.approvedByPM),
  );

  const preparedObj = isObj(d.preparedBy) ? d.preparedBy : null;

  const form = {
    ...getDefaultForm(fallbackBranchId),

    id: d.id || 0,

    active: d.active !== false && String(d.active).toLowerCase() !== "inactive",

    approvedByPM: approval?.value || "Pending",

    belongsTo: String(pick(d.belongsTo, d.belongTo)),

    branch: String(
      pick(idOf(d.branch, "branchId"), d.branchId, fallbackBranchId),
    ),

    cancelRemarks: d.cancelRemarks || "",

    createdBy: d.createdBy || "",

    docDate: toDateInput(d.docDate) || todayISO(),

    docId: String(pick(d.docId, d.docNo)),

    financialYear: String(
      pick(d.financialYear, getDefaultForm(fallbackBranchId).financialYear),
    ),

    location: String(idOf(d.location, "locationId")),

    locationType: String(idOf(d.locationType, "locationTypeId")),

    narration: d.narration || "",

    /* ID, or a name/code that is resolved against employees later */
    preparedBy: String(
      preparedObj
        ? pick(preparedObj.employeeId, preparedObj.id)
        : (d.preparedBy ?? ""),
    ),

    preparedByName: String(
      preparedObj
        ? pick(preparedObj.employeeName, preparedObj.employeeCode)
        : "",
    ),

    refDate: toDateInput(d.refDate) || todayISO(),

    refNo: d.refNo || "",

    time: String(pick(d.time, nowTime())).slice(0, 8),
  };

  const rawDetails = findArray(
    d,
    [
      "physicalStockReConcilationDetailsDTO",
      "physicalStockReConcilationDetailsVO",
      "physicalStockReConcilationDetailsResponseDTO",
      "physicalStockReconciliationDetailsVO",
      "physicalStockReconciliationDetailsDTO",
      "details",
    ],
    /detail/i,
  );

  const itemRows = rawDetails.length
    ? rawDetails.map(mapDetailRow)
    : [emptyItemRow()];

  return { form, itemRows };
};

/* ========================================================================= */
/* SHARED BUILDING BLOCKS                                                    */
/* ========================================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  disabled,
  className = "",
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
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        >
          <option value="">-- Select --</option>

          {withCurrent(options, value).map((opt) => (
            <option
              key={isObj(opt) ? opt.value : opt}
              value={isObj(opt) ? opt.value : opt}
            >
              {isObj(opt) ? opt.label : opt}
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
          rows={4}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
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
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
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

const FormButtons = ({
  onCancel,
  onSave,
  isSubmitting,
  disabled,
  saveLabel,
}) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
      onClick={onSave}
      disabled={isSubmitting || disabled}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ========================================================================= */
/* TABLE HELPERS                                                             */
/* ========================================================================= */

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
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top min-w-[120px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      className={cellInputClasses}
    >
      <option value="">-- Select --</option>

      {withCurrent(options, value).map((opt) => (
        <option
          key={isObj(opt) ? opt.value : opt}
          value={isObj(opt) ? opt.value : opt}
        >
          {isObj(opt) ? opt.label : opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", disabled }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className={`${cellInputClasses} ${
        disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
      }`}
    />
  </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />

    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={row.id || idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) =>
            col.type === "select" ? (
              <SelectCell
                key={col.key}
                value={row[col.key]}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                options={col.options}
              />
            ) : (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={col.type === "number" ? "number" : "text"}
                disabled={col.readOnly}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* CHILD TABS                                                                */
/* ========================================================================= */

const CHILD_TABS = [
  {
    key: "physicalStockDetail",
    label: "1-Physical Stock Detail",
    type: "table",
  },
  { key: "summary", label: "2-Summary", type: "fields" },
];

/* ========================================================================= */
/* MAIN COMPONENT                                                            */
/* ========================================================================= */

const PhysicalStockReconciliationForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));

  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  /*
   * The row passed in from the list seeds the form instantly.
   * The full record is then fetched by id (effect below), merged over the
   * list row, and replaces this state.
   */
  const [mapped] = useState(() =>
    isEditMode ? mapEditData(editData, BRANCH_ID) : null,
  );

  const [form, setForm] = useState(() =>
    mapped ? mapped.form : getDefaultForm(BRANCH_ID),
  );

  const [itemRows, setItemRows] = useState(() =>
    mapped ? mapped.itemRows : [emptyItemRow()],
  );

  const effectiveBranchId = toInteger(form.branch || BRANCH_ID);

  const [activeChildTab, setActiveChildTab] = useState("physicalStockDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* true while the by-id call is running (edit mode only) */
  const [loadingData, setLoadingData] = useState(isEditMode);

  /*
   * Bumped after the record is loaded so the "resolve saved values against
   * options" effect re-runs on the freshly fetched data.
   */
  const [hydrationKey, setHydrationKey] = useState(0);

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA                                                             */
  /* ----------------------------------------------------------------------- */

  const [branchOptions, setBranchOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [locationTypeOptions, setLocationTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  /* ======================================================================= */
  /* EDIT: LOAD BY ID                                                        */
  /* ======================================================================= */

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadById = async () => {
      setLoadingData(true);

      try {
        /*
         * NOTE: rename here if your API method has a different name.
         */
        const fetchById =
          physicalStockReconciliationAPI.getReconciliationById ||
          physicalStockReconciliationAPI.getPhysicalStockReconciliationById;

        if (typeof fetchById !== "function") {
          console.error(
            "No by-id method found on physicalStockReconciliationAPI",
          );
          addToast("By-id API method is missing", "error");
          return;
        }

        const response = await fetchById(editData.id);

        if (cancelled) return;

        console.log(
          "Get Physical Stock Reconciliation By ID Response:",
          response,
        );

        const record = extractRecord(response);

        if (!record) {
          console.error("Reconciliation record not found in response");
          addToast("Physical Stock Reconciliation data not found", "error");
          return;
        }

        console.log("Physical Stock Reconciliation record (raw):", record);

        /*
         * The by-id response may omit some fields. Fall back to the list row
         * for anything the by-id response leaves out.
         */
        const nonNull = Object.fromEntries(
          Object.entries(record).filter(
            ([, v]) => v !== null && v !== undefined,
          ),
        );

        const result = mapEditData({ ...editData, ...nonNull }, BRANCH_ID);

        console.log("Mapped Physical Stock Reconciliation form:", result);

        setForm(result.form);
        setItemRows(result.itemRows);

        setHydrationKey((key) => key + 1);
      } catch (error) {
        console.error("Failed to load Physical Stock Reconciliation:", error);

        if (!cancelled) {
          addToast(
            "Failed to load Physical Stock Reconciliation data",
            "error",
          );
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadById();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editData?.id]);

  /* ======================================================================= */
  /* MASTER DATA LOADERS                                                     */
  /* ======================================================================= */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setBranchOptions([]);
        return;
      }

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((b) => ({
          value: b.id,
          label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setEmployeeOptions([]);
        return;
      }

      const response = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.employees ||
          response?.paramObjectsMap?.employeeVO ||
          [];

      setEmployeeOptions(
        list.map((employee) => ({
          value: employee.id,
          label:
            employee.employeeName || employee.name || `Employee ${employee.id}`,
          code: employee.employeeCode || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
    }
  }, [ORG_ID]);

  const loadLocationTypes = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        setLocationTypeOptions([]);
        return;
      }

      const options =
        await physicalStockReconciliationAPI.getLocationTypeOptions(
          effectiveBranchId,
          ORG_ID,
        );

      setLocationTypeOptions(options || []);
    } catch (error) {
      console.error("Failed to load location types:", error);
      setLocationTypeOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setBelongsToOptions([]);
        return;
      }

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.listValues ||
          response?.paramObjectsMap?.values ||
          response?.paramObjectsMap?.listValueDetails ||
          [];

      setBelongsToOptions(
        list
          .map((item) => {
            const description =
              item?.valuesDescription ||
              item?.valueDescription ||
              item?.description ||
              item?.value ||
              "";

            /* Belongs To sends the LOV description, not the LOV ID */
            return { value: description, label: description };
          })
          .filter((item) => item.value),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);
      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  const loadLocations = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId || !form.locationType) {
        setLocationOptions([]);
        return;
      }

      const options = await physicalStockReconciliationAPI.getLocationDropdown(
        effectiveBranchId,
        form.locationType,
        ORG_ID,
      );

      setLocationOptions(options || []);
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationOptions([]);
    }
  }, [ORG_ID, effectiveBranchId, form.locationType]);

  const loadItems = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setItemOptions([]);
        return;
      }

      const response = await itemAPI.getItems(ORG_ID, effectiveBranchId);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.items ||
          response?.paramObjectsMap?.itemMasterVO ||
          [];

      setItemOptions(
        list.map((item) => ({
          value: item.itemId ?? item.id,

          label: item.itemCode || item.code || `Item ${item.itemId ?? item.id}`,

          itemDescription:
            item.itemDescription || item.itemDesc || item.description || "",

          unit: unitText(item.uom || item.unitId || item.unit || ""),
        })),
      );
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  useEffect(() => {
    loadBranches();
    loadEmployees();
    loadBelongsTo();
  }, [loadBranches, loadEmployees, loadBelongsTo]);

  useEffect(() => {
    loadLocationTypes();
    loadItems();
  }, [loadLocationTypes, loadItems]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  /* ======================================================================= */
  /* EDIT: RESOLVE SAVED VALUES AGAINST LOADED OPTIONS                       */
  /* ======================================================================= */

  /*
   * If the saved value is not an option value (for example the backend sent a
   * name or a code), match it by label / code and swap in the option value.
   * Only unmatched values are touched, so user edits are kept.
   */
  const resolveValue = (current, options, extras = []) => {
    if (current === "" || current === null || current === undefined) {
      return current;
    }

    if (!options.length) return current;

    const optValue = (o) => (isObj(o) ? o.value : o);

    if (options.some((o) => String(optValue(o)) === String(current))) {
      return current;
    }

    const match = options.find((o) => {
      if (!isObj(o)) return norm(o) === norm(current);

      return [o.label, o.code, ...extras]
        .filter(Boolean)
        .some((text) => norm(text) === norm(current));
    });

    return match ? String(optValue(match)) : current;
  };

  useEffect(() => {
    if (!isEditMode || loadingData) return;

    setForm((prev) => {
      const branch = resolveValue(prev.branch, branchOptions);
      const locationType = resolveValue(prev.locationType, locationTypeOptions);
      const location = resolveValue(prev.location, locationOptions);

      let preparedBy = resolveValue(prev.preparedBy, employeeOptions);

      /* still not an employee id -> try the name sent by the backend */
      if (
        employeeOptions.length &&
        preparedBy !== "" &&
        !employeeOptions.some((o) => String(o.value) === String(preparedBy)) &&
        prev.preparedByName
      ) {
        const byName = employeeOptions.find(
          (o) =>
            norm(o.label) === norm(prev.preparedByName) ||
            norm(o.code) === norm(prev.preparedByName),
        );

        if (byName) preparedBy = String(byName.value);
      }

      if (
        branch === prev.branch &&
        locationType === prev.locationType &&
        location === prev.location &&
        preparedBy === prev.preparedBy
      ) {
        return prev;
      }

      return { ...prev, branch, locationType, location, preparedBy };
    });

    setItemRows((prev) => {
      let changed = false;

      const next = prev.map((row) => {
        if (!row.item || !itemOptions.length) return row;

        const resolved = resolveValue(row.item, itemOptions);

        const option = itemOptions.find(
          (o) => String(o.value) === String(resolved),
        );

        if (!option) return row;

        const updated = {
          ...row,
          item: String(resolved),
          itemCode: row.itemCode || option.label || "",
          itemDescription: row.itemDescription || option.itemDescription || "",
          unit: row.unit || option.unit || "",
        };

        if (
          updated.item !== row.item ||
          updated.itemCode !== row.itemCode ||
          updated.itemDescription !== row.itemDescription ||
          updated.unit !== row.unit
        ) {
          changed = true;
          return updated;
        }

        return row;
      });

      return changed ? next : prev;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditMode,
    loadingData,
    hydrationKey,
    branchOptions,
    employeeOptions,
    locationTypeOptions,
    locationOptions,
    itemOptions,
  ]);

  /* ======================================================================= */
  /* DOC ID - NEW RECORD ONLY                                                */
  /* ======================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    if (!ORG_ID || !form.financialYear) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId =
          await physicalStockReconciliationAPI.getReconciliationDocId({
            financialYear: toInteger(String(form.financialYear).split("-")[0]),
            orgId: ORG_ID,
          });

        if (!cancelled) {
          setForm((prev) => ({ ...prev, docId: docId || "" }));
        }
      } catch (error) {
        console.error("Error generating doc id:", error);

        if (!cancelled) {
          setForm((prev) => ({ ...prev, docId: "" }));
          addToast("Failed to generate Doc No", "error");
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, ORG_ID, form.financialYear, addToast]);

  /* ======================================================================= */
  /* FIELD CHANGE                                                            */
  /* ======================================================================= */

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "locationType") {
      setForm((prev) => ({ ...prev, locationType: value, location: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================================================================= */
  /* ITEM ROWS                                                               */
  /* ======================================================================= */

  const calculateItemRow = (row, changedKey, changedValue) => {
    const updated = { ...row, [changedKey]: changedValue };

    if (changedKey === "item") {
      const selected = itemOptions.find(
        (opt) => String(opt.value) === String(changedValue),
      );

      if (selected) {
        updated.itemCode = selected.label || "";
        updated.itemDescription = selected.itemDescription || "";
        updated.unit = selected.unit || "";
      } else {
        updated.itemCode = "";
        updated.itemDescription = "";
        updated.unit = "";
      }
    }

    const actualQty = toNumber(updated.actualQty);
    const bookStock = toNumber(updated.bookStock);
    const rate = toNumber(updated.rate);

    updated.difference = round2(actualQty - bookStock);
    updated.amount = money(actualQty * rate);

    return updated;
  };

  const handleItemRowChange = (idx, key, value) => {
    setItemRows((prev) =>
      prev.map((row, i) =>
        i === idx ? calculateItemRow(row, key, value) : row,
      ),
    );
  };

  const addItemRow = () => setItemRows((prev) => [...prev, emptyItemRow()]);

  const removeItemRow = (idx) => {
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );
  };

  const totalAmount = useMemo(
    () => round2(itemRows.reduce((sum, r) => sum + toNumber(r.amount), 0)),
    [itemRows],
  );

  /* ======================================================================= */
  /* VALIDATION                                                              */
  /* ======================================================================= */

  const validate = () => {
    const errors = {};

    if (!form.branch) errors.branch = "Plant ID is required";

    if (!form.docDate) errors.docDate = "Doc. Date is required";

    if (!form.locationType) errors.locationType = "Location Type is required";

    if (!form.location) errors.location = "Location is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields correctly", "error");
      return false;
    }

    if (itemRows.filter((r) => r.item).length === 0) {
      addToast("Please add at least one item", "error");
      return false;
    }

    return true;
  };

  /* ======================================================================= */
  /* SAVE                                                                    */
  /* ======================================================================= */

  const handleSave = async () => {
    if (isSubmitting || loadingData) return;

    if (!validate()) return;

    setIsSubmitting(true);

    const userName = localStorage.getItem("userName") || "SYSTEM";

    const details = itemRows
      .filter((r) => r.item)
      .map((r) => ({
        ...(r.id ? { id: toInteger(r.id) } : {}),

        item: toInteger(r.item),

        bookStock: toNumber(r.bookStock),

        actualQty: toNumber(r.actualQty),

        difference: toNumber(r.difference),

        lcRate: toNumber(r.lcRate),

        rate: toNumber(r.rate),

        reasonCode: r.reasonCode || "",

        amount: toNumber(r.amount),
      }));

    const payload = {
      ...(isEditMode && { id: toInteger(editData.id) }),

      active: form.active !== false,

      approvedByPM: form.approvedByPM || "Pending",

      /* Belongs To sends the LOV description string, not the LOV ID */
      belongsTo: form.belongsTo || "",

      branch: toInteger(form.branch),

      cancelRemarks: form.cancelRemarks || "",

      createdBy: (isEditMode ? form.createdBy : userName) || userName,

      ...(isEditMode && { updatedBy: userName }),

      docDate: form.docDate || todayISO(),

      docId: form.docId || "",

      financialYear: toInteger(String(form.financialYear).split("-")[0]),

      location: toInteger(form.location),

      locationType: toInteger(form.locationType),

      narration: form.narration || "",

      orgId: ORG_ID,

      physicalStockReConcilationDetailsDTO: details,

      preparedBy: toIdOrNull(form.preparedBy),

      refDate: form.refDate || todayISO(),

      refNo: form.refNo || "",

      time: form.time || nowTime(),
    };

    console.log("Physical Stock Reconciliation Payload:", payload);

    try {
      const response =
        await physicalStockReconciliationAPI.updateCreateReconciliation(
          payload,
        );

      const success =
        response?.status === true || response?.statusFlag === "Ok";

      if (success) {
        addToast(
          isEditMode
            ? "Physical Stock Reconciliation updated successfully"
            : "Physical Stock Reconciliation created successfully",
          "success",
        );

        if (onSave) onSave(payload);
        else onBack();
      } else {
        addToast(
          response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save physical stock reconciliation",
          "error",
        );
      }
    } catch (error) {
      console.error("Save Error:", error);

      addToast(
        error?.response?.data?.paramObjectsMap?.errorMessage ||
          error?.response?.data?.paramObjectsMap?.message ||
          error?.response?.data?.message ||
          "Failed to save Physical Stock Reconciliation.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ======================================================================= */
  /* CHILD TAB CONFIG                                                        */
  /* ======================================================================= */

  const itemColumns = [
    { key: "item", label: "Item Code", type: "select", options: itemOptions },

    { key: "itemDescription", label: "Item Description", readOnly: true },

    { key: "unit", label: "Unit", readOnly: false },

    { key: "bookStock", label: "Book Stock", type: "number" },

    { key: "actualQty", label: "Actual Qty", type: "number" },

    { key: "difference", label: "Difference", type: "number", readOnly: true },

    { key: "lcRate", label: "LC Rate", type: "number" },

    { key: "rate", label: "Rate", type: "number" },

    { key: "reasonCode", label: "Reason Code" },

    { key: "amount", label: "Amount", type: "number", readOnly: true },
  ];

  const activeTabType = CHILD_TABS.find((t) => t.key === activeChildTab)?.type;

  /* ======================================================================= */
  /* UI                                                                      */
  /* ======================================================================= */

  return (
    <div className="p-2 max-w-7xl">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode
            ? "Edit Physical Stock Re-Conciliation"
            : "Physical Stock Re-Conciliation"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Loading overlay (edit mode, while the by-id call runs) */}
        {loadingData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-800/70 text-xs text-gray-600 dark:text-gray-300">
            Loading physical stock reconciliation...
          </div>
        )}

        {/* Header Fields */}
        <div>
          <SectionHeader>Reconciliation Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={form.branch}
              onChange={handleFieldChange}
              error={fieldErrors.branch}
              options={branchOptions}
              disabled={isEditMode}
              required
            />

            <Field
              label="Doc No."
              name="docId"
              value={generatingDocId ? "Generating..." : form.docId}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="Location Type"
              name="locationType"
              value={form.locationType}
              onChange={handleFieldChange}
              error={fieldErrors.locationType}
              options={locationTypeOptions}
              required
            />

            <Field
              type="select"
              label="Location"
              name="location"
              value={form.location}
              onChange={handleFieldChange}
              error={fieldErrors.location}
              options={locationOptions}
              disabled={!form.locationType}
              required
            />

            <Field
              type="date"
              label="Doc. Date"
              name="docDate"
              value={form.docDate}
              onChange={handleFieldChange}
              error={fieldErrors.docDate}
              required
            />

            <Field
              type="time"
              label="Time"
              name="time"
              value={form.time}
              onChange={handleFieldChange}
            />

            <Field
              label="Ref. No"
              name="refNo"
              value={form.refNo}
              onChange={handleFieldChange}
            />

            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={form.refDate}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="Belongs to"
              name="belongsTo"
              value={form.belongsTo}
              onChange={handleFieldChange}
              options={belongsToOptions}
            />

            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={form.preparedBy}
              onChange={handleFieldChange}
              options={employeeOptions}
            />

            <Field
              label="Financial Year"
              name="financialYear"
              value={form.financialYear}
              onChange={handleFieldChange}
              disabled={isEditMode}
            />

            <Field
              type="select"
              label="Approved By PM"
              name="approvedByPM"
              value={form.approvedByPM}
              onChange={handleFieldChange}
              options={APPROVAL_OPTIONS}
            />
          </div>
        </div>

        {/* Child Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
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

            {activeTabType === "table" && (
              <button
                type="button"
                onClick={addItemRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeTabType === "table" ? (
            <>
              <DynamicTable
                columns={itemColumns}
                rows={itemRows}
                onCellChange={handleItemRowChange}
                onRemoveRow={removeItemRow}
              />

              <div className="flex justify-end mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Total Amount:
                <span className="font-semibold ml-1">{money(totalAmount)}</span>
              </div>
            </>
          ) : (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={form.narration}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />

                <Field
                  label="Total Amount"
                  name="totalAmount"
                  value={money(totalAmount)}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
          )}
        </section>

        {/* Buttons */}
        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          disabled={loadingData}
          saveLabel={isEditMode ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default PhysicalStockReconciliationForm;
