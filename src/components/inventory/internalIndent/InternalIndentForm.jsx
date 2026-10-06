// src/components/Inventory/InternalIndent/InternalIndentForm.jsx

import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import internalIndentAPI from "../../../api/Inventory/internalIndentAPI";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

// departmentAPI.js exports a named export, not a default export
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";

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

/* Converts "2026-09-01T00:00:00", "01-09-2026", "01/09/2026" -> "2026-09-01" */
const toDateInput = (v) => {
  const text = String(v ?? "").trim();

  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const dmy = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);

  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  return "";
};

/* Number or null (never NaN) */
const toIdOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const pickArray = (source, keys) => {
  if (Array.isArray(source)) return source;

  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, k) => (acc ? acc[k] : undefined), source);

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

/*
 * Make sure the saved value is always visible in a <select>, even if it is not
 * (yet) one of the options (options still loading, name vs id, different case).
 */
const withCurrent = (options, value) => {
  const list = options || [];

  if (value === "" || value === null || value === undefined) return list;

  const exists = list.some((o) => String(o.value) === String(value));

  return exists ? list : [...list, { value, label: String(value) }];
};

const emptyHeader = (branchId = "") => ({
  branch: branchId ? String(branchId) : "",
  docId: "",
  belongTo: "",
  docDate: todayISO(),
  department: "",
  timeOfIndent: nowTime(),
});

const emptySummary = () => ({
  approvedByPM: "Pending",
  preparedBy: "",
  authorizedBy: "",
  remarks: "",
});

const emptyItemRow = () => ({
  id: 0,
  itemCode: "",
  itemDescription: "",
  unit: "",
  unitLabel: "",
  requiredQty: "",
  purpose: "",
});

const APPROVAL_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

/* ========================================================================= */
/* EDIT DATA: EXTRACT + MAP                                                  */
/* ========================================================================= */

/*
 * getInternalIndentById may return:
 *   - the record itself
 *   - an array with one record
 *   - { status, paramObjectsMap: { internalIndentVO: {...} } }
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
      map.internalIndentVO ??
      map.internalIndent ??
      map.internalIndentDTO ??
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

  const unitSource = pick(itemObj?.unit, detail.unit, itemObj?.primaryUnits);

  const unitObj = isObj(unitSource) ? unitSource : null;

  return {
    ...emptyItemRow(),

    id: detail.id ?? 0,

    /* item id (or code / description, resolved against options later) */
    itemCode: String(
      pick(
        itemObj ? pick(itemObj.id, itemObj.itemId) : detail.item,
        detail.itemId,
      ),
    ),

    itemDescription: String(
      pick(
        itemObj?.itemDescription,
        detail.itemDescription,
        detail.description,
      ),
    ),

    unit: String(unitObj ? pick(unitObj.id, unitObj.unitId) : ""),

    unitLabel: String(
      unitObj
        ? pick(unitObj.unitName, unitObj.primaryUnit, unitObj.name)
        : pick(unitSource, detail.unitName),
    ),

    requiredQty: pick(detail.requiredQty, detail.qty),

    purpose: detail.purpose || "",
  };
};

const mapEditData = (d, fallbackBranchId) => {
  const header = {
    ...emptyHeader(fallbackBranchId),

    branch: String(
      pick(idOf(d.branch, "branchId"), d.branchId, fallbackBranchId),
    ),

    docId: String(pick(d.docId, d.docNo)),

    belongTo: String(pick(d.belongTo, d.belongsTo)),

    docDate: toDateInput(d.docDate) || todayISO(),

    department: String(idOf(d.department, "departmentId")),

    timeOfIndent: String(pick(d.timeOfIndent, d.indentTime, nowTime())).slice(
      0,
      5,
    ),
  };

  const approval = APPROVAL_OPTIONS.find(
    (o) => norm(o.value) === norm(d.approvedByPM),
  );

  const summary = {
    approvedByPM: approval?.value || "Pending",

    /* ID, or a name that is resolved against employees later */
    preparedBy: String(idOf(d.preparedBy, "employeeId")),

    authorizedBy: String(idOf(d.authorizedBy, "employeeId")),

    remarks: d.remarks || "",
  };

  const rawDetails = findArray(
    d,
    [
      "internalIndentDetailsResponseDTO",
      "internalIndentDetailsVO",
      "internalIndentDetailsDTO",
      "internalIndentDetails",
      "details",
    ],
    /detail/i,
  );

  const itemRows = rawDetails.length
    ? rawDetails.map(mapDetailRow)
    : [emptyItemRow()];

  return { header, summary, itemRows };
};

/* ========================================================================= */
/* FIELD                                                                     */
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
  disabled = false,
  className = "",
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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
        >
          <option value="">-- Select --</option>

          {withCurrent(options, value).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
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

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
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
        placeholder={placeholder}
        className={`${controlClasses} ${
          error ? "border-red-500 focus:border-red-500" : ""
        }`}
      />

      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((header, index) => (
        <th
          key={index}
          className={`p-1 whitespace-nowrap dark:text-white ${
            index === 0
              ? "w-8 text-center"
              : index === headers.length - 1
                ? "w-20 text-center"
                : "text-left"
          }`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

/* ========================================================================= */
/* INTERNAL INDENT FORM                                                      */
/* ========================================================================= */

const InternalIndentForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = localStorage.getItem("branchId");

  // Financial year is stored using "finYear"
  const FINANCIAL_YEAR = localStorage.getItem("finYear") || "";

  const USER_NAME =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "SYSTEM";

  const isEditMode = Boolean(editData?.id);

  /*
   * The row passed in from the list seeds the form instantly.
   * The full record is then fetched with getInternalIndentById (effect below),
   * merged over the list row, and replaces this state.
   */
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

  /* true while getInternalIndentById is running (edit mode only) */
  const [loadingData, setLoadingData] = useState(isEditMode);

  /*
   * Bumped after the record is loaded so the "resolve saved values against
   * options" effect re-runs on the freshly fetched data.
   */
  const [hydrationKey, setHydrationKey] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("indentDetail");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingItemRow, setLoadingItemRow] = useState(null);
  const [generatingDocId, setGeneratingDocId] = useState(false);

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA                                                             */
  /* ----------------------------------------------------------------------- */

  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);

  /* ----------------------------------------------------------------------- */
  /* EDIT: LOAD BY ID                                                        */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadById = async () => {
      setLoadingData(true);

      try {
        const response = await internalIndentAPI.getInternalIndentById(
          editData.id,
        );

        if (cancelled) return;

        console.log("Get Internal Indent By ID Response:", response);

        const record = extractRecord(response);

        if (!record) {
          console.error("Internal indent record not found in response");
          toast.error("Internal Indent details not found");
          return;
        }

        console.log("Internal Indent record (raw):", record);

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

        console.log("Mapped Internal Indent form data:", result);

        setHeader(result.header);
        setSummary(result.summary);
        setItemRows(result.itemRows);

        setHydrationKey((key) => key + 1);

        /*
         * If a detail row has an item but no description / unit,
         * fetch the item to fill them in.
         */
        result.itemRows.forEach(async (row, index) => {
          if (!row.itemCode || (row.itemDescription && row.unitLabel)) return;
          if (!/^\d+$/.test(String(row.itemCode))) return;

          try {
            const itemDetail = await itemAPI.getItemById(row.itemCode);

            if (cancelled || !itemDetail) return;

            const unitObject =
              itemDetail.unit ??
              itemDetail.primaryUnits ??
              itemDetail.uom ??
              null;

            setItemRows((prev) =>
              prev.map((r, i) =>
                i === index && String(r.itemCode) === String(row.itemCode)
                  ? {
                      ...r,
                      itemDescription:
                        r.itemDescription ||
                        itemDetail.itemDescription ||
                        itemDetail.description ||
                        "",
                      unit: r.unit || String(unitObject?.id ?? ""),
                      unitLabel:
                        r.unitLabel ||
                        unitObject?.unitName ||
                        unitObject?.primaryUnit ||
                        unitObject?.name ||
                        "",
                    }
                  : r,
              ),
            );
          } catch (error) {
            console.error("Failed to load item for row:", error);
          }
        });
      } catch (error) {
        console.error("Error loading Internal Indent:", error);

        if (!cancelled) {
          toast.error("Failed to load Internal Indent details");
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

  const loadEmployees = useCallback(async () => {
    try {
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
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
    }
  }, [ORG_ID]);

  const loadItems = useCallback(async () => {
    try {
      const response = await itemAPI.getItems(ORG_ID, BRANCH_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.items || [];

      setItemOptions(
        list.map((item) => ({
          value: item.id,
          label: item.itemCode ?? item.code ?? item.itemName,
          itemDescription: item.itemDescription || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) {
        console.warn("ORG_ID is missing. Cannot load Belongs To values.");
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

            // Belongs To sends the description/string to the backend,
            // not the LOV ID.
            return { value: description, label: description };
          })
          .filter((item) => item.value),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);
      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadBranches();
    loadDepartments();
    loadEmployees();
    loadItems();
    loadBelongsTo();
  }, [loadBranches, loadDepartments, loadEmployees, loadItems, loadBelongsTo]);

  /* ----------------------------------------------------------------------- */
  /* EDIT: RESOLVE SAVED VALUES AGAINST LOADED OPTIONS                       */
  /* ----------------------------------------------------------------------- */

  /*
   * If the saved value is not an option value (for example the backend sent a
   * name or a code), match it by label and swap in the option value.
   * Only unmatched values are touched, so user edits are kept.
   */
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

      if (branch === prev.branch && department === prev.department) {
        return prev;
      }

      return { ...prev, branch, department };
    });

    setSummary((prev) => {
      const preparedBy = resolveValue(prev.preparedBy, employeeOptions);
      const authorizedBy = resolveValue(prev.authorizedBy, employeeOptions);

      if (
        preparedBy === prev.preparedBy &&
        authorizedBy === prev.authorizedBy
      ) {
        return prev;
      }

      return { ...prev, preparedBy, authorizedBy };
    });

    setItemRows((prev) => {
      let changed = false;

      const next = prev.map((row) => {
        const itemCode = resolveValue(row.itemCode, itemOptions);

        if (itemCode === row.itemCode) return row;

        changed = true;

        return { ...row, itemCode: String(itemCode) };
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
    employeeOptions,
    itemOptions,
  ]);

  /* ----------------------------------------------------------------------- */
  /* GENERATE DOC ID FOR NEW RECORD ONLY                                     */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (isEditMode) return;

    if (!ORG_ID || !FINANCIAL_YEAR) {
      console.warn("orgId or financialYear is missing", {
        ORG_ID,
        FINANCIAL_YEAR,
      });

      toast.error("Organization ID or Financial Year is missing");
      return;
    }

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await internalIndentAPI.getInternalIndentDocId({
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

        console.error("INTERNAL INDENT DOC ID ERROR:", error);

        const errorData = error?.response?.data;

        toast.error(
          errorData?.paramObjectsMap?.errorMessage ||
            errorData?.paramObjectsMap?.message ||
            errorData?.message ||
            error?.message ||
            "Failed to generate document number",
        );
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, ORG_ID, FINANCIAL_YEAR]);

  /* ----------------------------------------------------------------------- */
  /* FIELD HANDLERS                                                          */
  /* ----------------------------------------------------------------------- */

  const handleHeaderChange = (event) => {
    const { name, value } = event.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (event) => {
    const { name, value } = event.target;

    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ----------------------------------------------------------------------- */
  /* ITEM SELECT                                                             */
  /* ----------------------------------------------------------------------- */

  const handleItemSelect = async (index, itemId) => {
    setItemRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...emptyItemRow(),
              id: row.id, // keep the detail id when editing
              itemCode: itemId,
              requiredQty: row.requiredQty,
              purpose: row.purpose,
            }
          : row,
      ),
    );

    if (!itemId) return;

    setLoadingItemRow(index);

    try {
      const itemDetail = await itemAPI.getItemById(itemId);

      if (!itemDetail) return;

      const unitObject =
        itemDetail.unit ?? itemDetail.primaryUnits ?? itemDetail.uom ?? null;

      setItemRows((prev) =>
        prev.map((row, rowIndex) => {
          if (rowIndex !== index) return row;

          if (String(row.itemCode) !== String(itemId)) return row;

          return {
            ...row,

            itemDescription:
              itemDetail.itemDescription ?? itemDetail.description ?? "",

            unit: unitObject?.id ?? "",

            unitLabel:
              unitObject?.unitName ??
              unitObject?.primaryUnit ??
              unitObject?.name ??
              "",
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoadingItemRow((current) => (current === index ? null : current));
    }
  };

  const handleItemChange = (index, key, value) => {
    if (key === "itemCode") {
      handleItemSelect(index, value);
      return;
    }

    setItemRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const addItemRow = () => {
    setItemRows((prev) => [...prev, emptyItemRow()]);
  };

  const removeItemRow = (index) => {
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  /* ----------------------------------------------------------------------- */
  /* VALIDATION                                                              */
  /* ----------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Branch is required";

    if (!header.docDate) errors.docDate = "Doc Date is required";

    if (!header.department) errors.department = "Department is required";

    if (!itemRows.length) errors.items = "At least one item is required";

    itemRows.forEach((row, index) => {
      if (!row.itemCode) {
        errors[`itemCode_${index}`] = "Item is required";
      }

      if (row.requiredQty === "" || Number(row.requiredQty) <= 0) {
        errors[`requiredQty_${index}`] =
          "Required quantity must be greater than 0";
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
  /* BUILD PAYLOAD                                                           */
  /* ----------------------------------------------------------------------- */

  const buildPayload = () => {
    const payload = {
      ...(isEditMode && editData?.id ? { id: Number(editData.id) } : {}),

      branch: toIdOrNull(header.branch),

      // Belongs To is a LOV DESCRIPTION/string. Do NOT convert to Number().
      belongTo: header.belongTo || "Domestic",

      docId: header.docId || "",

      docDate: header.docDate || todayISO(),

      department: toIdOrNull(header.department),

      financialYear: FINANCIAL_YEAR,

      timeOfIndent: header.timeOfIndent
        ? header.timeOfIndent.length === 5
          ? `${header.timeOfIndent}:00`
          : header.timeOfIndent
        : "00:00:00",

      approvedByPM: summary.approvedByPM || "Pending",

      preparedBy: toIdOrNull(summary.preparedBy),

      authorizedBy: toIdOrNull(summary.authorizedBy),

      remarks: summary.remarks || "",

      cancelRemarks: editData?.cancelRemarks || "",

      orgId: Number(ORG_ID),

      active: true,

      createdBy: editData?.createdBy || USER_NAME,

      internalIndentDetailsDTO: itemRows
        .filter((row) => row.itemCode)
        .map((row) => ({
          ...(row.id ? { id: Number(row.id) } : {}),

          item: Number(row.itemCode),

          requiredQty: Number(row.requiredQty),

          purpose: row.purpose?.trim() || "",
        })),
    };

    console.log(
      "INTERNAL INDENT FINAL PAYLOAD:",
      JSON.stringify(payload, null, 2),
    );

    return payload;
  };

  /* ----------------------------------------------------------------------- */
  /* SAVE                                                                    */
  /* ----------------------------------------------------------------------- */

  const handleSave = async () => {
    if (isSubmitting || loadingData) return;

    if (!validate()) return;

    const payload = buildPayload();

    try {
      setIsSubmitting(true);

      const response =
        await internalIndentAPI.updateCreateInternalIndent(payload);

      const success =
        response?.status === true || response?.statusFlag === "Ok";

      if (!success) {
        toast.error(
          response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save Internal Indent",
        );

        return;
      }

      toast.success(
        isEditMode
          ? "Internal Indent updated successfully"
          : "Internal Indent created successfully",
      );

      onSave?.(response?.paramObjectsMap?.internalIndentVO || payload);
    } catch (error) {
      console.error("Internal Indent save error:", error);

      toast.error(
        error?.response?.data?.paramObjectsMap?.errorMessage ||
          error?.response?.data?.paramObjectsMap?.message ||
          "Failed to save Internal Indent",
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
          {isEditMode ? "Edit Internal Indent" : "Internal Indent"}
        </h2>
      </div>

      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* LOADING OVERLAY (edit mode, while getInternalIndentById runs) */}
        {loadingData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-800/70 text-xs text-gray-600 dark:text-gray-300">
            Loading internal indent...
          </div>
        )}

        {/* INDENT DETAILS */}
        <div>
          <SectionHeader>Indent Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Branch"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              options={branchOptions}
              error={fieldErrors.branch}
              required
              disabled={isEditMode}
            />

            <Field
              label="Doc ID"
              name="docId"
              value={header.docId}
              placeholder={generatingDocId ? "Generating..." : ""}
              disabled
            />

            <Field
              type="select"
              label="Belongs To"
              name="belongTo"
              value={header.belongTo}
              onChange={handleHeaderChange}
              options={belongsToOptions}
            />

            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />

            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              options={departmentOptions}
              error={fieldErrors.department}
              required
            />

            <Field
              type="time"
              label="Time Of Indent"
              name="timeOfIndent"
              value={header.timeOfIndent}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* TABS */}
        <section>
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab("indentDetail")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "indentDetail"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                1-Indent Detail
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "summary"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                2-Summary
              </button>
            </div>

            {activeTab === "indentDetail" && (
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

          {/* INDENT DETAIL TAB */}
          {activeTab === "indentDetail" && (
            <div className="mt-2">
              <TableWrapper>
                <TableHead
                  headers={[
                    "#",
                    "Item Code",
                    "Item Description",
                    "Unit",
                    "Required Qty",
                    "Purpose",
                    "Action",
                  ]}
                />

                <tbody>
                  {itemRows.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-1 text-center dark:text-white">
                        {index + 1}
                      </td>

                      {/* ITEM CODE */}
                      <td className="p-1 align-top">
                        <select
                          value={row.itemCode}
                          onChange={(e) =>
                            handleItemChange(index, "itemCode", e.target.value)
                          }
                          className={cellInputClasses}
                        >
                          <option value="">-- Select Item --</option>

                          {withCurrent(itemOptions, row.itemCode).map(
                            (item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ),
                          )}
                        </select>

                        {fieldErrors[`itemCode_${index}`] && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldErrors[`itemCode_${index}`]}
                          </p>
                        )}
                      </td>

                      {/* ITEM DESCRIPTION */}
                      <td className="p-1 align-top">
                        <input
                          type="text"
                          value={
                            loadingItemRow === index
                              ? "Loading..."
                              : row.itemDescription || ""
                          }
                          readOnly
                          className={`${cellInputClasses} bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>

                      {/* UNIT */}
                      <td className="p-1 align-top">
                        <input
                          type="text"
                          value={row.unitLabel || ""}
                          readOnly
                          className={`${cellInputClasses} bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>

                      {/* REQUIRED QTY */}
                      <td className="p-1 align-top">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.requiredQty ?? ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "requiredQty",
                              e.target.value,
                            )
                          }
                          className={cellInputClasses}
                        />

                        {fieldErrors[`requiredQty_${index}`] && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldErrors[`requiredQty_${index}`]}
                          </p>
                        )}
                      </td>

                      {/* PURPOSE */}
                      <td className="p-1 align-top">
                        <input
                          type="text"
                          value={row.purpose || ""}
                          onChange={(e) =>
                            handleItemChange(index, "purpose", e.target.value)
                          }
                          className={cellInputClasses}
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
              </TableWrapper>
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Approved By PM"
                  name="approvedByPM"
                  value={summary.approvedByPM}
                  onChange={handleSummaryChange}
                  options={APPROVAL_OPTIONS}
                />

                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  options={employeeOptions}
                />

                <Field
                  type="select"
                  label="Authorised By"
                  name="authorizedBy"
                  value={summary.authorizedBy}
                  onChange={handleSummaryChange}
                  options={employeeOptions}
                />

                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
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

export default InternalIndentForm;
