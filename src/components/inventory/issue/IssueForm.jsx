// src/components/Inventory/Issue/IssueForm.jsx

import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import issueAPI from "../../../api/Inventory/issueAPI";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { departmentAPI } from "../../../api/departmentAPI";

import { toast } from "../../../utils/toast";

/* ========================================================================= */
/* DESIGN TOKENS                                                             */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const readOnlyCellClasses = `${cellInputClasses} bg-gray-50 dark:bg-gray-800`;

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const todayISO = () => new Date().toISOString().slice(0, 10);

const nowTime = () => new Date().toTimeString().slice(0, 5);

const isObj = (v) => v !== null && typeof v === "object";

const norm = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

const pick = (...values) => {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
};

/* ID of a backend value that can be an object or a primitive */
const idOf = (v, ...keys) => {
  if (isObj(v)) return pick(...keys.map((k) => v[k]), v.id);
  return v ?? "";
};

/* "2026-09-01T00:00:00" / "01-09-2026" / "01/09/2026" -> "2026-09-01" */
const toDateInput = (v) => {
  const text = String(v ?? "").trim();

  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const dmy = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  return "";
};

const toIdOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((num(value) + Number.EPSILON) * factor) / factor;
};

const pickArray = (source, keys) => {
  if (Array.isArray(source)) return source;

  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, k) => (acc ? acc[k] : undefined), source);

    if (Array.isArray(value)) return value;
  }

  return [];
};

/* Keeps the saved value visible in a <select> even before options load */
const withCurrent = (options, value, label) => {
  const list = options || [];

  if (value === "" || value === null || value === undefined) return list;

  const exists = list.some((o) => String(o.value) === String(value));

  return exists ? list : [...list, { value, label: String(label || value) }];
};

let rowCounter = 0;
const newRowKey = () => `row-${Date.now()}-${rowCounter++}`;

const emptyHeader = (branchId = "") => ({
  branch: branchId ? String(branchId) : "",
  department: "",
  belongsTo: "",
  docDate: todayISO(),
  time: nowTime(),
  docId: "",
  issueFrom: "",
  issueTo: "",
  indentNo: "",
  refNo: "",
  refDate: "",
});

const emptySummary = () => ({ narration: "" });

const emptyItemRow = () => ({
  _key: newRowKey(),
  id: 0,
  item: "", // item id (select value)
  itemCode: "", // label for the select
  itemDescription: "",
  unit: "",
  qtyAvailable: "",
  indentQty: "",
  previouslyIssuedQty: "",
  pendingQty: "",
  qty: "",
  rate: "",
  amount: "",
});

/* ========================================================================= */
/* CALCULATIONS                                                              */
/* ========================================================================= */
/*
 * Amount      = Qty x Rate
 * Pending Qty = Indent Qty - Previously Issued Qty - Qty   (never below 0)
 *
 * Recalculated every time Indent Qty, Prev. Issued Qty, Qty or Rate changes.
 */
const CALC_KEYS = ["indentQty", "previouslyIssuedQty", "qty", "rate"];

const recalcRow = (row) => {
  const hasIndent = row.indentQty !== "" && row.indentQty !== null;

  const pending = hasIndent
    ? Math.max(
        num(row.indentQty) - num(row.previouslyIssuedQty) - num(row.qty),
        0,
      )
    : "";

  return {
    ...row,
    pendingQty: pending === "" ? "" : round(pending, 3),
    amount: row.qty === "" ? "" : round(num(row.qty) * num(row.rate), 2),
  };
};

/* ========================================================================= */
/* EDIT DATA: EXTRACT + MAP                                                  */
/* ========================================================================= */

const extractRecord = (response) => {
  if (!response) return null;

  if (Array.isArray(response)) return isObj(response[0]) ? response[0] : null;

  const map = response?.paramObjectsMap || response?.data?.paramObjectsMap;

  if (map) {
    let record =
      map.issuesVO ??
      map.issuesResponseVO ??
      Object.values(map).find((v) => isObj(v));

    if (Array.isArray(record)) record = record[0];

    return isObj(record) ? record : null;
  }

  return isObj(response) ? response : null;
};

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

  const unitSource = pick(
    itemObj?.unitId,
    itemObj?.unit,
    detail.unitId,
    detail.unit,
  );

  const unitText = isObj(unitSource)
    ? pick(unitSource.unitId, unitSource.unitName, unitSource.name)
    : unitSource;

  const qty = pick(detail.qty, detail.issuedQty);
  const rate = pick(detail.rate);

  return {
    ...emptyItemRow(),

    id: detail.id ?? 0,

    item: String(
      pick(
        itemObj ? pick(itemObj.id, itemObj.itemId) : detail.item,
        detail.itemId,
      ),
    ),

    itemCode: String(pick(itemObj?.itemCode, detail.itemCode)),

    itemDescription: String(
      pick(itemObj?.itemDescription, detail.itemDescription),
    ),

    unit: String(unitText ?? ""),

    qtyAvailable: pick(detail.qtyAvailable),
    indentQty: pick(detail.indentQty),
    previouslyIssuedQty: pick(detail.previouslyIssuedQty),
    pendingQty: pick(detail.pendingQty),
    qty,
    rate,
    amount: pick(
      detail.amount,
      qty !== "" ? round(num(qty) * num(rate), 2) : "",
    ),
  };
};

const mapEditData = (d, fallbackBranchId) => {
  const header = {
    ...emptyHeader(fallbackBranchId),

    branch: String(
      pick(idOf(d.branch, "branchId"), d.branchId, fallbackBranchId),
    ),

    department: String(idOf(d.department, "departmentId")),

    belongsTo: String(pick(d.belongsTo, d.belongTo)),

    docDate: toDateInput(pick(d.docDate, d.issDate)) || todayISO(),

    time: String(pick(d.time, nowTime())).slice(0, 5),

    docId: String(pick(d.docId, d.docNo, d.issNo)),

    issueFrom: String(idOf(d.issueFrom, "locationId")),

    issueTo: String(idOf(d.issueTo, "locationId")),

    indentNo: String(pick(d.indentNo)),

    refNo: String(pick(d.refNo)),

    refDate: toDateInput(d.refDate),
  };

  const summary = { narration: d.narration || "" };

  const rawDetails = findArray(
    d,
    ["issuesDetails", "issuesDetailsVO", "issuesDetailsDTO", "details"],
    /detail/i,
  );

  const itemRows = rawDetails.length
    ? rawDetails.map(mapDetailRow)
    : [emptyItemRow()];

  /* Names shown while the dropdowns are still loading */
  const labels = {
    issueFrom: isObj(d.issueFrom) ? d.issueFrom.locationName : "",
    issueTo: isObj(d.issueTo) ? d.issueTo.locationName : "",
    department: isObj(d.department) ? d.department.departmentName : "",
    branch: isObj(d.branch) ? d.branch.branchName : "",
  };

  return { header, summary, itemRows, labels };
};

/* ========================================================================= */
/* SMALL COMPONENTS                                                          */
/* ========================================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  currentLabel,
  disabled = false,
  className = "",
  placeholder,
}) => {
  const errorText = error && (
    <p className="text-[11px] text-red-500 mt-0.5">{error}</p>
  );

  const labelNode = (
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );

  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        {labelNode}

        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
        >
          <option value="">-- Select --</option>

          {withCurrent(options, value, currentLabel).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {errorText}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        {labelNode}

        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={4}
          disabled={disabled}
          placeholder={placeholder}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
            `focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
              error ? "border-red-500" : ""
            }`
          }
        />

        {errorText}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {labelNode}

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${controlClasses} ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />

      {errorText}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const ITEM_HEADERS = [
  "#",
  "Item Code",
  "Item Description",
  "Unit",
  "Qty Available",
  "Indent Qty",
  "Prev. Issued Qty",
  "Pending Qty",
  "Qty",
  "Rate",
  "Amount",
  "Action",
];

/* ========================================================================= */
/* ISSUE FORM                                                                */
/* ========================================================================= */

const IssueForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = localStorage.getItem("branchId");
  const FINANCIAL_YEAR = localStorage.getItem("finYear") || "";

  const USER_NAME =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    localStorage.getItem("usersId") ||
    "SYSTEM";

  const isEditMode = Boolean(editData?.id);

  /* The list row seeds the form instantly; getIssuesById then replaces it */
  const [mapped] = useState(() =>
    isEditMode ? mapEditData(editData, BRANCH_ID) : null,
  );

  const [header, setHeader] = useState(() =>
    mapped ? mapped.header : emptyHeader(BRANCH_ID),
  );
  const [summary, setSummary] = useState(() =>
    mapped ? mapped.summary : emptySummary(),
  );
  const [itemRows, setItemRows] = useState(() =>
    mapped ? mapped.itemRows : [emptyItemRow()],
  );

  /* Display names for saved values until the dropdowns finish loading */
  const [labels, setLabels] = useState(() => mapped?.labels || {});

  const [loadingData, setLoadingData] = useState(isEditMode);
  const [hydrationKey, setHydrationKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("issuesDetail");
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [issueFromOptions, setIssueFromOptions] = useState([]);
  const [issueToOptions, setIssueToOptions] = useState([]);
  const [indentNoOptions, setIndentNoOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  /* ----------------------------------------------------------------------- */
  /* EDIT: LOAD BY ID                                                        */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadById = async () => {
      setLoadingData(true);

      try {
        const response = await issueAPI.getIssueById(editData.id);

        if (cancelled) return;

        const record = extractRecord(response);

        if (!record) {
          toast.error("Issue details not found");
          return;
        }

        /* Fall back to the list row for anything by-id leaves out */
        const nonNull = Object.fromEntries(
          Object.entries(record).filter(
            ([, v]) => v !== null && v !== undefined,
          ),
        );

        const result = mapEditData({ ...editData, ...nonNull }, BRANCH_ID);

        console.log("Mapped Issue form data:", result);

        setHeader(result.header);
        setSummary(result.summary);
        setItemRows(result.itemRows);
        setLabels(result.labels);

        setHydrationKey((key) => key + 1);
      } catch (error) {
        console.error("Error loading Issue:", error);

        if (!cancelled) toast.error("Failed to load Issue details");
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

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA LOADERS                                                     */
  /* ----------------------------------------------------------------------- */

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((branch) => ({
          value: branch.id,
          label: branch.branchName || branch.name || `Branch ${branch.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(ORG_ID);

      const list = pickArray(response, [
        "paramObjectsMap.departmentVO",
        "paramObjectsMap.departmentMasterVO",
        "paramObjectsMap.departmentList",
        "paramObjectsMap.department",
        "data.paramObjectsMap.departmentVO",
      ]);

      setDepartmentOptions(
        list.map((department) => ({
          value: department.id,
          label: department.departmentName ?? department.name,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
    }
  }, [ORG_ID]);

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

            // Belongs To sends the description string, not the LOV id
            return { value: description, label: description };
          })
          .filter((item) => item.value),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);
      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  const loadIssueFrom = useCallback(async () => {
    try {
      const list = await issueAPI.getIssueFromLocations(BRANCH_ID, ORG_ID);

      setIssueFromOptions(
        list.map((l) => ({
          value: l.id,
          label: l.locationName ?? l.name ?? l.locationId,
        })),
      );
    } catch (error) {
      console.error("Failed to load Issue From:", error);
      setIssueFromOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadIndentNos = useCallback(async () => {
    try {
      const list = await issueAPI.getIssueIndentNos(BRANCH_ID, ORG_ID);

      setIndentNoOptions(
        list.map((i) => {
          const value = i?.indentNo ?? i?.docId ?? i;
          return { value, label: String(value) };
        }),
      );
    } catch (error) {
      console.error("Failed to load Indent Nos:", error);
      setIndentNoOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadBranches();
    loadDepartments();
    loadBelongsTo();
    loadIssueFrom();
    loadIndentNos();
  }, [
    loadBranches,
    loadDepartments,
    loadBelongsTo,
    loadIssueFrom,
    loadIndentNos,
  ]);

  /* Issue To depends on the selected Issue From id */
  useEffect(() => {
    if (!header.issueFrom) {
      setIssueToOptions([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const list = await issueAPI.getIssueToLocations(
          BRANCH_ID,
          header.issueFrom,
          ORG_ID,
        );

        if (cancelled) return;

        setIssueToOptions(
          list.map((l) => ({
            value: l.id,
            label: l.locationName ?? l.name ?? l.locationId,
          })),
        );
      } catch (error) {
        console.error("Failed to load Issue To:", error);
        if (!cancelled) setIssueToOptions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [header.issueFrom, BRANCH_ID, ORG_ID]);

  /* Item Code depends on the selected Indent No (string) */
  useEffect(() => {
    if (!header.indentNo) {
      setItemOptions([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const list = await issueAPI.getIssueItemCodes(
          BRANCH_ID,
          header.indentNo,
          ORG_ID,
        );

        if (cancelled) return;

        setItemOptions(
          list.map((i) => ({
            value: i.id,
            label: i.itemCode,
            itemCode: i.itemCode,
            itemDescription: i.itemDescription || "",
            unit: i.unitId || "",
            stock: i.stock,
          })),
        );
      } catch (error) {
        console.error("Failed to load Item Codes:", error);
        if (!cancelled) setItemOptions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [header.indentNo, BRANCH_ID, ORG_ID]);

  /* ----------------------------------------------------------------------- */
  /* EDIT: RESOLVE SAVED VALUES AGAINST LOADED OPTIONS                       */
  /* ----------------------------------------------------------------------- */

  const resolveValue = (current, options) => {
    if (current === "" || current === null || current === undefined)
      return current;

    if (!options.length) return current;

    if (options.some((o) => String(o.value) === String(current))) {
      return current;
    }

    const match = options.find((o) => norm(o.label) === norm(current));

    return match ? String(match.value) : current;
  };

  useEffect(() => {
    if (!isEditMode || loadingData) return;

    setHeader((prev) => {
      const branch = resolveValue(prev.branch, branchOptions);
      const department = resolveValue(prev.department, departmentOptions);
      const belongsTo = resolveValue(prev.belongsTo, belongsToOptions);
      const issueFrom = resolveValue(prev.issueFrom, issueFromOptions);
      const issueTo = resolveValue(prev.issueTo, issueToOptions);

      if (
        branch === prev.branch &&
        department === prev.department &&
        belongsTo === prev.belongsTo &&
        issueFrom === prev.issueFrom &&
        issueTo === prev.issueTo
      ) {
        return prev;
      }

      return { ...prev, branch, department, belongsTo, issueFrom, issueTo };
    });

    setItemRows((prev) => {
      let changed = false;

      const next = prev.map((row) => {
        const item = resolveValue(row.item, itemOptions);

        if (item === row.item) return row;

        changed = true;

        return { ...row, item: String(item) };
      });

      return changed ? next : prev;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditMode,
    loadingData,
    hydrationKey,
    branchOptions,
    departmentOptions,
    belongsToOptions,
    issueFromOptions,
    issueToOptions,
    itemOptions,
  ]);

  /* ----------------------------------------------------------------------- */
  /* GENERATE DOC ID (new record only)                                       */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (isEditMode) return;

    if (!ORG_ID || !FINANCIAL_YEAR) {
      toast.error("Organization ID or Financial Year is missing");
      return;
    }

    let cancelled = false;

    (async () => {
      setGeneratingDocId(true);

      try {
        const docId = await issueAPI.getIssuesDocId({
          orgId: ORG_ID,
          financialYear: FINANCIAL_YEAR,
        });

        if (cancelled) return;

        if (!docId) {
          toast.error(
            "Document number was not generated. Please check Document Type Mapping.",
          );
          return;
        }

        setHeader((prev) => ({ ...prev, docId }));
      } catch (error) {
        if (cancelled) return;

        const errorData = error?.response?.data;

        toast.error(
          errorData?.paramObjectsMap?.errorMessage ||
            errorData?.paramObjectsMap?.message ||
            error?.message ||
            "Failed to generate document number",
        );
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, ORG_ID, FINANCIAL_YEAR]);

  /* ----------------------------------------------------------------------- */
  /* HANDLERS                                                                */
  /* ----------------------------------------------------------------------- */

  const handleHeaderChange = (event) => {
    const { name, value } = event.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setHeader((prev) => ({
      ...prev,
      [name]: value,
      // changing Issue From invalidates Issue To
      ...(name === "issueFrom" ? { issueTo: "" } : {}),
    }));

    if (name === "issueFrom") {
      setLabels((prev) => ({ ...prev, issueTo: "" }));
    }

    // changing Indent No invalidates the item rows (user action only)
    if (name === "indentNo") {
      setItemRows([emptyItemRow()]);
    }
  };

  const handleSummaryChange = (event) => {
    const { name, value } = event.target;

    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSelect = (index, itemId) => {
    const option = itemOptions.find((o) => String(o.value) === String(itemId));

    setItemRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...emptyItemRow(),
              _key: row._key,
              id: row.id,
              item: itemId,
              itemCode: option?.itemCode || "",
              itemDescription: option?.itemDescription || "",
              unit: option?.unit || "",
              // keep whatever the user already typed
              qtyAvailable: row.qtyAvailable,
              indentQty: row.indentQty,
              previouslyIssuedQty: row.previouslyIssuedQty,
              qty: row.qty,
              rate: row.rate,
            }
          : row,
      ),
    );

    // recompute pending / amount for the kept values
    setItemRows((prev) =>
      prev.map((row, i) => (i === index ? recalcRow(row) : row)),
    );
  };

  const handleItemChange = (index, key, value) => {
    if (key === "item") {
      handleItemSelect(index, value);
      return;
    }

    setItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updated = { ...row, [key]: value };

        return CALC_KEYS.includes(key) ? recalcRow(updated) : updated;
      }),
    );

    const errorKey = `${key}_${index}`;

    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addItemRow = () => setItemRows((prev) => [...prev, emptyItemRow()]);

  const removeItemRow = (index) => {
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const totalAmount = round(
    itemRows.reduce((sum, row) => sum + num(row.amount), 0),
    2,
  );

  /* ----------------------------------------------------------------------- */
  /* VALIDATION                                                              */
  /* ----------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Branch is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.docDate) errors.docDate = "Iss. Date is required";
    if (!header.issueFrom) errors.issueFrom = "Issues From is required";
    if (!header.issueTo) errors.issueTo = "Issue To is required";

    const filledRows = itemRows.filter((row) => row.item);

    if (!filledRows.length) errors.items = "At least one item is required";

    itemRows.forEach((row, index) => {
      if (!row.item) return;

      if (row.qty === "" || num(row.qty) <= 0) {
        errors[`qty_${index}`] = "Qty must be greater than 0";
        return;
      }

      if (row.qtyAvailable !== "" && num(row.qty) > num(row.qtyAvailable)) {
        errors[`qty_${index}`] = "Qty exceeds available qty";
        return;
      }

      if (
        row.indentQty !== "" &&
        num(row.qty) > num(row.indentQty) - num(row.previouslyIssuedQty)
      ) {
        errors[`qty_${index}`] = "Qty exceeds the balance of the indent";
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return false;
    }

    return true;
  };

  /* ----------------------------------------------------------------------- */
  /* SAVE                                                                    */
  /* ----------------------------------------------------------------------- */

  const buildPayload = () => ({
    ...(isEditMode ? { id: Number(editData.id) } : {}),

    active: true,

    // Belongs To is a LOV description string. Do NOT convert to Number().
    belongsTo: header.belongsTo || "Domestic",

    branch: toIdOrNull(header.branch),

    cancelRemarks: editData?.cancelRemarks || "",

    createdBy: editData?.createdBy || USER_NAME,

    department: toIdOrNull(header.department),

    docDate: header.docDate || todayISO(),

    financialYear: FINANCIAL_YEAR,

    indentNo: header.indentNo || "",

    issueFrom: toIdOrNull(header.issueFrom),

    issueTo: toIdOrNull(header.issueTo),

    narration: summary.narration || "",

    orgId: ORG_ID,

    refDate: header.refDate || null,

    refNo: header.refNo || "",

    time: header.time
      ? header.time.length === 5
        ? `${header.time}:00`
        : header.time
      : "00:00:00",

    issuesDetails: itemRows
      .filter((row) => row.item)
      .map((row) => ({
        ...(row.id ? { id: Number(row.id) } : {}),
        item: Number(row.item),
        qtyAvailable: num(row.qtyAvailable),
        indentQty: num(row.indentQty),
        previouslyIssuedQty: num(row.previouslyIssuedQty),
        pendingQty: num(row.pendingQty),
        qty: num(row.qty),
        rate: num(row.rate),
      })),
  });

  const handleSave = async () => {
    if (isSubmitting || loadingData) return;

    if (!validate()) return;

    const payload = buildPayload();

    console.log("ISSUE FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

    try {
      setIsSubmitting(true);

      const response = await issueAPI.updateCreateIssue(payload);

      const success =
        response?.status === true || response?.statusFlag === "Ok";

      if (!success) {
        toast.error(
          response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save Issue",
        );
        return;
      }

      toast.success(
        isEditMode
          ? "Issue updated successfully"
          : "Issue created successfully",
      );

      onSave?.(payload);
    } catch (error) {
      console.error("Issue save error:", error);

      toast.error(
        error?.response?.data?.paramObjectsMap?.errorMessage ||
          error?.response?.data?.paramObjectsMap?.message ||
          "Failed to save Issue",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <div className="p-2 max-w-7xl">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Issue" : "Issues"}
        </h2>
      </div>

      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {loadingData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-800/70 text-xs text-gray-600 dark:text-gray-300">
            Loading issue...
          </div>
        )}

        {/* ISSUE DETAILS */}
        <div>
          <SectionHeader>Issue Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Branch"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              options={branchOptions}
              currentLabel={labels.branch}
              error={fieldErrors.branch}
              required
              disabled={isEditMode}
            />

            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              options={departmentOptions}
              currentLabel={labels.department}
              error={fieldErrors.department}
              required
            />

            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={belongsToOptions}
            />

            <Field
              type="date"
              label="Iss. Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />

            <Field
              type="time"
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
            />

            <Field
              label="Iss. No."
              name="docId"
              value={header.docId}
              placeholder={generatingDocId ? "Generating..." : ""}
              disabled
            />

            <Field
              type="select"
              label="Issues From"
              name="issueFrom"
              value={header.issueFrom}
              onChange={handleHeaderChange}
              options={issueFromOptions}
              currentLabel={labels.issueFrom}
              error={fieldErrors.issueFrom}
              required
            />

            <Field
              type="select"
              label="Issue To"
              name="issueTo"
              value={header.issueTo}
              onChange={handleHeaderChange}
              options={issueToOptions}
              currentLabel={labels.issueTo}
              error={fieldErrors.issueTo}
              disabled={!header.issueFrom}
              required
            />

            <Field
              type="select"
              label="Indent No"
              name="indentNo"
              value={header.indentNo}
              onChange={handleHeaderChange}
              options={indentNoOptions}
            />

            <Field
              label="Ref. No."
              name="refNo"
              value={header.refNo}
              onChange={handleHeaderChange}
            />

            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={header.refDate}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* TABS */}
        <section>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {[
                { key: "issuesDetail", label: "1-Issues Detail" },
                { key: "summary", label: "2-Summary" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "issuesDetail" && (
              <button
                type="button"
                onClick={addItemRow}
                disabled={isSubmitting}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* ISSUES DETAIL TAB */}
          {activeTab === "issuesDetail" && (
            <div className="mt-2">
              {!header.indentNo && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-1">
                  Select an Indent No to load the item codes.
                </p>
              )}

              {fieldErrors.items && (
                <p className="text-[11px] text-red-500 mb-1">
                  {fieldErrors.items}
                </p>
              )}

              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      {ITEM_HEADERS.map((h, i) => (
                        <th
                          key={h}
                          className={`p-1 whitespace-nowrap dark:text-white ${
                            i === 0
                              ? "w-8 text-center"
                              : i === ITEM_HEADERS.length - 1
                                ? "w-16 text-center"
                                : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {itemRows.map((row, index) => (
                      <tr
                        key={row._key}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-1 text-center dark:text-white">
                          {index + 1}
                        </td>

                        {/* ITEM CODE */}
                        <td className="p-1 align-top min-w-[140px]">
                          <select
                            value={row.item}
                            onChange={(e) =>
                              handleItemChange(index, "item", e.target.value)
                            }
                            className={cellInputClasses}
                          >
                            <option value="">-- Select Item --</option>

                            {withCurrent(
                              itemOptions,
                              row.item,
                              row.itemCode,
                            ).map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* ITEM DESCRIPTION */}
                        <td className="p-1 align-top min-w-[160px]">
                          <input
                            type="text"
                            value={row.itemDescription || ""}
                            readOnly
                            className={readOnlyCellClasses}
                          />
                        </td>

                        {/* UNIT */}
                        <td className="p-1 align-top w-20">
                          <input
                            type="text"
                            value={row.unit || ""}
                            readOnly
                            className={readOnlyCellClasses}
                          />
                        </td>

                        {/* NUMERIC ENTRY CELLS */}
                        {[
                          "qtyAvailable",
                          "indentQty",
                          "previouslyIssuedQty",
                        ].map((key) => (
                          <td key={key} className="p-1 align-top w-24">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row[key] ?? ""}
                              onChange={(e) =>
                                handleItemChange(index, key, e.target.value)
                              }
                              className={cellInputClasses}
                            />
                          </td>
                        ))}

                        {/* PENDING QTY (auto) */}
                        <td className="p-1 align-top w-24">
                          <input
                            type="number"
                            value={row.pendingQty ?? ""}
                            readOnly
                            className={readOnlyCellClasses}
                          />
                        </td>

                        {/* QTY */}
                        <td className="p-1 align-top w-24">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.qty ?? ""}
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                            className={`${cellInputClasses} ${
                              fieldErrors[`qty_${index}`]
                                ? "border-red-500"
                                : ""
                            }`}
                          />

                          {fieldErrors[`qty_${index}`] && (
                            <p className="text-[10px] text-red-500 mt-0.5">
                              {fieldErrors[`qty_${index}`]}
                            </p>
                          )}
                        </td>

                        {/* RATE */}
                        <td className="p-1 align-top w-24">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.rate ?? ""}
                            onChange={(e) =>
                              handleItemChange(index, "rate", e.target.value)
                            }
                            className={cellInputClasses}
                          />
                        </td>

                        {/* AMOUNT (auto) */}
                        <td className="p-1 align-top w-28">
                          <input
                            type="number"
                            value={row.amount ?? ""}
                            readOnly
                            className={readOnlyCellClasses}
                          />
                        </td>

                        {/* ACTION */}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            disabled={itemRows.length <= 1 || isSubmitting}
                            className={`h-5 w-5 rounded text-white inline-flex items-center justify-center ${
                              itemRows.length <= 1 || isSubmitting
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

                  <tfoot>
                    <tr className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-semibold">
                      <td
                        colSpan={10}
                        className="p-1 text-right dark:text-white"
                      >
                        Total Amount
                      </td>
                      <td className="p-1 dark:text-white">{totalAmount}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  label="Total Amount"
                  name="totalAmount"
                  value={totalAmount}
                  disabled
                />

                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
                  onChange={handleSummaryChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
              </div>
            </div>
          )}
        </section>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || loadingData}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />

            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueForm;
