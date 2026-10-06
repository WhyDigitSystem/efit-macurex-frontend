// src/components/Inventory/OpeningStockEntry/OpeningStockEntryForm.jsx

import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { branchAPI } from "../../../api/branchAPI";
import itemAPI from "../../../api/itemAPI";
import { useToast } from "../../Toast/ToastContext";

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 " +
  "disabled:text-gray-900 dark:disabled:text-gray-100 " +
  "disabled:opacity-100 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 " +
  "focus:ring-red-500 focus:border-red-500";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] " +
  "gap-x-4 gap-y-3 items-start";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getToday = () => dayjs().format("YYYY-MM-DD");

const isObj = (v) => v !== null && typeof v === "object";

/* First value that is not undefined / null / "" */
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

/*
 * Value of the first exact key that has a primitive value; otherwise the first
 * key whose NAME matches the pattern. Used because backends name qty / rate /
 * amount fields differently (qty, quantity, openingQty, stockQty ...).
 */
const pickKey = (obj, exactKeys, regex) => {
  if (!isObj(obj)) return "";

  const usable = (v) => v !== undefined && v !== null && v !== "" && !isObj(v);

  for (const key of exactKeys) {
    if (usable(obj[key])) return obj[key];
  }

  if (regex) {
    const found = Object.keys(obj).find(
      (key) => regex.test(key) && usable(obj[key]),
    );

    if (found) return obj[found];
  }

  return "";
};

/* Converts "2026-09-01T00:00:00", "01-09-2026", "01/09/2026" -> "2026-09-01" */
const toDateInput = (v) => {
  const text = String(v ?? "").trim();

  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const dmy = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);

  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  const parsed = dayjs(text);

  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

const calculateAmount = (quantity, rate) => {
  const qty = Number(quantity);
  const price = Number(rate);

  if (
    quantity === "" ||
    rate === "" ||
    !Number.isFinite(qty) ||
    !Number.isFinite(price) ||
    qty <= 0 ||
    price < 0
  ) {
    return "";
  }

  return (qty * price).toFixed(2);
};

const getLocalStorageNumber = (key) => {
  const value = Number(localStorage.getItem(key));

  return Number.isFinite(value) && value > 0 ? value : null;
};

const getCurrentUser = () =>
  localStorage.getItem("userId") ||
  localStorage.getItem("usersId") ||
  localStorage.getItem("userName") ||
  localStorage.getItem("username") ||
  "";

/*
 * Make sure the saved value is always visible in a <select>, even if it is not
 * (yet) one of the options (options still loading, different case, etc.).
 */
const withCurrent = (options, value, fallbackLabel) => {
  const list = options || [];

  if (value === "" || value === null || value === undefined) return list;

  const exists = list.some((o) => String(o.value) === String(value));

  return exists
    ? list
    : [...list, { value, label: fallbackLabel || String(value) }];
};

/* -------------------------------------------------------------------------- */
/* Item information                                                           */
/* -------------------------------------------------------------------------- */

/* Unit can be an object, an id or a plain text */
const unitText = (u) => {
  if (isObj(u)) {
    return String(
      pick(u.unitName, u.primaryUnit, u.name, u.unit, u.unitId, u.id),
    );
  }

  return String(u ?? "");
};

const getItemCode = (item) => {
  if (!item) return "";

  if (typeof item === "string") return item;

  return String(pick(item.itemCode, item.code, item.item_code));
};

const getItemDescription = (item) => {
  if (!item || typeof item === "string") return "";

  return String(
    pick(
      item.itemDescription,
      item.itemDesc,
      item.description,
      item.itemName,
      item.name,
    ),
  );
};

const getItemUnit = (item) => {
  if (!item || typeof item === "string") return "";

  const direct = unitText(
    pick(
      item.unit,
      item.primaryUnits,
      item.primaryUnit,
      item.uom,
      item.unitName,
      item.unitId,
    ),
  );

  if (direct) return direct;

  /* any key that looks like a unit */
  const key = Object.keys(item).find(
    (k) => /unit|uom/i.test(k) && item[k] !== null && item[k] !== "",
  );

  return key ? unitText(item[key]) : "";
};

const getItemId = (item) => {
  if (!isObj(item)) return "";

  return String(pick(item.itemId, item.id));
};

/* -------------------------------------------------------------------------- */
/* Edit data: extract + map                                                   */
/* -------------------------------------------------------------------------- */

/*
 * openingStockEntryAPI.getById already unwraps paramObjectsMap and returns the
 * record (or null). It may be an object or a one-item array, and this also
 * accepts a raw { paramObjectsMap: { ... } } response, so every shape works.
 */
const extractRecord = (response) => {
  if (!response) return null;

  if (Array.isArray(response)) {
    return isObj(response[0]) ? response[0] : null;
  }

  const map = response?.paramObjectsMap || response?.data?.paramObjectsMap;

  if (map) {
    let record =
      map.openStockEntryResponseVO ??
      map.openStockEntryVO ??
      map.openStockEntry ??
      Object.values(map).find((v) => isObj(v));

    if (Array.isArray(record)) record = record[0];

    return isObj(record) ? record : null;
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

const createInitialHeader = () => ({
  plant: "",
  plantName: "",
  docDate: getToday(),
  asOnDate: getToday(),
  docId: "",
  location: "",
  locationName: "",
  itemCode: "",
  itemId: "",
  itemDescription: "",
  unit: "",
  quantity: "",
  rate: "",
  amount: "",
  remarks: "",
});

const QTY_KEYS = [
  "quantity",
  "qty",
  "openingQty",
  "openQty",
  "openingQuantity",
  "stockQty",
  "stockQuantity",
];

const RATE_KEYS = ["rate", "unitRate", "itemRate", "price", "unitPrice"];

const AMOUNT_KEYS = ["amount", "totalAmount", "value", "stockValue"];

/*
 * Works for both shapes:
 *   - flat record (itemCode / quantity / rate on the record itself)
 *   - header + details array (first detail row holds the item)
 */
const mapEditData = (d) => {
  const detail =
    findArray(
      d,
      [
        "openStockEntryDetailsResponseDTO",
        "openStockEntryDetailsVO",
        "openStockEntryDetailsDTO",
        "openingStockEntryDetailsVO",
        "stockDetails",
        "stockDetailList",
        "openStockEntryDetails",
        "details",
      ],
      /detail/i,
    )[0] ||
    d.detail ||
    {};

  const item = isObj(detail.item) ? detail.item : isObj(d.item) ? d.item : null;

  const itemCode = String(
    pick(
      getItemCode(item),
      typeof detail.item === "string" ? detail.item : "",
      detail.itemCode,
      d.itemCode,
    ),
  );

  /* qty / rate / amount: detail row first, then the record, then the item */
  const quantity = pick(
    pickKey(detail, QTY_KEYS, /qty|quantity/i),
    pickKey(d, QTY_KEYS, /qty|quantity/i),
  );

  const rate = pick(
    pickKey(detail, RATE_KEYS, /^(.*rate|price)$/i),
    pickKey(d, RATE_KEYS, /^(.*rate|price)$/i),
  );

  const savedAmount = pick(
    pickKey(detail, AMOUNT_KEYS, /amount/i),
    pickKey(d, AMOUNT_KEYS, /amount/i),
  );

  return {
    ...createInitialHeader(),

    plant: String(pick(idOf(d.branch, "branchId"), d.plant, d.branchId)),

    plantName: String(
      pick(isObj(d.branch) ? d.branch.branchName : "", d.branchName),
    ),

    docDate: toDateInput(d.docDate) || getToday(),

    asOnDate: toDateInput(d.asOnDate) || getToday(),

    docId: String(pick(d.docId, d.docNo)),

    location: String(pick(idOf(d.location, "locationId"), d.locationId)),

    locationName: String(
      pick(isObj(d.location) ? d.location.locationName : "", d.locationName),
    ),

    itemCode,

    itemId: getItemId(item),

    itemDescription: String(
      pick(
        getItemDescription(item),
        detail.itemDescription,
        detail.itemDesc,
        detail.description,
        d.itemDescription,
      ),
    ),

    unit: String(pick(getItemUnit(item), getItemUnit(detail), getItemUnit(d))),

    quantity,

    rate,

    amount: savedAmount !== "" ? savedAmount : calculateAmount(quantity, rate),

    remarks: d.remarks || "",
  };
};

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

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
  readOnly = false,
  placeholder = "",
  step,
  min,
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
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>

          {(options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          rows={3}
          placeholder={placeholder}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug " +
            "transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "disabled:bg-gray-100 dark:disabled:bg-gray-800 " +
            "disabled:text-gray-900 dark:disabled:text-gray-100 " +
            "disabled:opacity-100 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 " +
            "focus:border-blue-500 " +
            `${
              error ? controlErrClasses : "border-gray-300 dark:border-gray-600"
            }`
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
        readOnly={readOnly}
        placeholder={placeholder}
        step={step}
        min={min}
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

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

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
      className={
        "flex items-center gap-1 px-3 py-1.5 rounded text-xs " +
        "border border-gray-300 dark:border-gray-600 " +
        "text-gray-700 dark:text-gray-200 " +
        "bg-white dark:bg-gray-800 " +
        "hover:bg-gray-50 dark:hover:bg-gray-700 " +
        "disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
      onClick={onSave}
      disabled={isSubmitting || disabled}
      className={
        "flex items-center gap-1 px-3 py-1.5 rounded text-xs " +
        "text-white bg-blue-600 hover:bg-blue-700 " +
        "dark:bg-blue-600 dark:hover:bg-blue-500 " +
        "disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      {isSubmitting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Save className="h-3 w-3" />
      )}

      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const OpeningStockEntryForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const orgId = getLocalStorageNumber("orgId");
  const branchId = getLocalStorageNumber("branchId");
  const finYear = localStorage.getItem("finYear");
  const currentUser = getCurrentUser();

  const existingId =
    data?.id ?? data?.header?.id ?? data?.openStockEntryId ?? null;

  const isEdit = Boolean(existingId);

  /*
   * The row passed in from the list seeds the form instantly.
   * The full record is then fetched with getById (effect below), merged over
   * the list row, and replaces this state.
   */
  const [header, setHeader] = useState(() =>
    isEdit
      ? mapEditData(data?.header || data?.openStockEntry || data || {})
      : createInitialHeader(),
  );

  /* keeps the saved record (createdBy / active) for the update payload */
  const [savedRecord, setSavedRecord] = useState(() =>
    isEdit ? data?.header || data?.openStockEntry || data || {} : {},
  );

  /* true while getById is running (edit mode only) */
  const [loadingData, setLoadingData] = useState(isEdit);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});

  /* item ids already looked up, so a missing unit does not cause a loop */
  const itemLookupDone = useRef(new Set());

  /* ---------------------------------------------------------------------- */
  /* Edit: load by id                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    const loadById = async () => {
      setLoadingData(true);

      try {
        const response = await openingStockEntryAPI.getById(existingId);

        if (cancelled) return;

        console.log("Get Opening Stock Entry By ID Response:", response);

        const record = extractRecord(response);

        if (!record) {
          console.error(
            "getById returned no record. Check the key names inside getById in openingStockEntryAPI.",
          );
          addToast("Opening Stock Entry data not found", "error");
          return;
        }

        console.log("Opening Stock Entry record (raw):", record);
        console.log("Record keys:", Object.keys(record));

        /*
         * The by-id response may omit some fields. Fall back to the list row
         * for anything the by-id response leaves out.
         */
        const nonNull = Object.fromEntries(
          Object.entries(record).filter(
            ([, v]) => v !== null && v !== undefined,
          ),
        );

        const merged = { ...(data?.header || data || {}), ...nonNull };

        const result = mapEditData(merged);

        console.log("Mapped Opening Stock Entry form:", result);

        setHeader(result);
        setSavedRecord(merged);
      } catch (error) {
        console.error("Failed to load Opening Stock Entry:", error);

        if (!cancelled) {
          addToast("Failed to load Opening Stock Entry data", "error");
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
  }, [isEdit, existingId]);

  /* ---------------------------------------------------------------------- */
  /* Recalculate amount                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (header.quantity === "" || header.rate === "") return;

    const calculatedAmount = calculateAmount(header.quantity, header.rate);

    if (calculatedAmount !== String(header.amount)) {
      setHeader((previous) => ({ ...previous, amount: calculatedAmount }));
    }
  }, [header.quantity, header.rate, header.amount]);

  /* ---------------------------------------------------------------------- */
  /* Load branches + items                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadMasters = async () => {
      if (!orgId || !branchId) return;

      try {
        setLoadingMasters(true);

        const [branches, items] = await Promise.all([
          branchAPI.getBranchByOrgId(orgId),
          openingStockEntryAPI.getItemCodeDropdown(branchId, orgId),
        ]);

        if (cancelled) return;

        /* ---------------- Branches ---------------- */

        const branchList = Array.isArray(branches) ? branches : [];

        setPlantOptions(
          branchList
            .map((branch) => ({
              value: branch?.id ?? branch?.branchId ?? "",

              label:
                branch?.branchName ||
                branch?.name ||
                branch?.branchCode ||
                String(branch?.id ?? branch?.branchId ?? ""),
            }))
            .filter((option) => option.value !== ""),
        );

        /* ---------------- Default branch (new record only) ---------------- */

        if (!isEdit) {
          setHeader((previous) => ({
            ...previous,
            plant: previous.plant || String(branchId),
          }));
        }

        /* ---------------- Items ---------------- */

        const itemList = Array.isArray(items) ? items : [];

        console.log("Item dropdown sample:", itemList[0]);

        const nextItemMap = {};

        const nextItemOptions = itemList
          .map((item) => {
            const code = getItemCode(item);

            if (!code) return null;

            nextItemMap[code] = item;

            return { value: code, label: code };
          })
          .filter(Boolean);

        setItemMap(nextItemMap);
        setItemOptions(nextItemOptions);
      } catch (error) {
        console.error("Opening Stock Entry master loading error:", error);

        if (!cancelled) {
          setPlantOptions([]);
          setItemOptions([]);
          setItemMap({});

          addToast("Failed to load Opening Stock Entry master data.", "error");
        }
      } finally {
        if (!cancelled) setLoadingMasters(false);
      }
    };

    loadMasters();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, branchId, isEdit]);

  /* ---------------------------------------------------------------------- */
  /* Load locations (follows the selected plant)                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      if (!orgId || !header.plant) {
        setLocationOptions([]);
        return;
      }

      try {
        setLoadingLocations(true);

        const locations = await openingStockEntryAPI.getLocationByOrgId(
          orgId,
          Number(header.plant),
        );

        if (cancelled) return;

        const list = Array.isArray(locations) ? locations : [];

        setLocationOptions(
          list
            .map((location) => ({
              value: location?.id ?? location?.locationId ?? "",

              label:
                location?.locationName ||
                location?.name ||
                String(location?.id ?? location?.locationId ?? ""),
            }))
            .filter((option) => option.value !== ""),
        );
      } catch (error) {
        console.error("Opening Stock Entry location loading error:", error);

        if (!cancelled) {
          setLocationOptions([]);
          addToast("Failed to load locations.", "error");
        }
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, header.plant]);

  /* ---------------------------------------------------------------------- */
  /* Fill description / unit (add + edit)                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (loadingData || !header.itemCode) return;

    if (header.itemDescription && header.unit) return;

    const code = header.itemCode;

    /* 1. item dropdown list */
    const listed = itemMap[code];

    if (listed) {
      const description = getItemDescription(listed);
      const unit = getItemUnit(listed);

      if ((!header.itemDescription && description) || (!header.unit && unit)) {
        setHeader((previous) =>
          previous.itemCode !== code
            ? previous
            : {
                ...previous,
                itemDescription: previous.itemDescription || description,
                unit: previous.unit || unit,
                itemId: previous.itemId || getItemId(listed),
              },
        );

        return;
      }
    }

    /* 2. item master by id (once per item) */
    const itemId = header.itemId || getItemId(listed);

    if (!itemId || !/^\d+$/.test(String(itemId))) {
      console.warn(
        "Cannot look up item details: no numeric item id for",
        code,
        listed,
      );
      return;
    }

    if (itemLookupDone.current.has(String(itemId))) return;

    itemLookupDone.current.add(String(itemId));

    (async () => {
      try {
        const itemDetail = await itemAPI.getItemById(itemId);

        console.log("Item master response:", itemDetail);

        if (!itemDetail) return;

        const description = getItemDescription(itemDetail);
        const unit = getItemUnit(itemDetail);

        /* not cancelled on re-render; only skipped if the item changed */
        setHeader((previous) =>
          previous.itemCode !== code
            ? previous
            : {
                ...previous,
                itemId: previous.itemId || String(itemId),
                itemDescription: previous.itemDescription || description,
                unit: previous.unit || unit,
              },
        );
      } catch (error) {
        console.error("Failed to load item details:", error);
        itemLookupDone.current.delete(String(itemId));
      }
    })();
  }, [
    loadingData,
    header.itemCode,
    header.itemId,
    header.itemDescription,
    header.unit,
    itemMap,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Generate document id (new record only)                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (isEdit) return;

    if (!orgId || header.docId) return;

    let cancelled = false;

    const generateDocId = async () => {
      const financialYear = localStorage.getItem("finYear");

      try {
        const docId = await openingStockEntryAPI.getOpenStockEntryDocId(
          financialYear,
          orgId,
          "OSE",
        );

        if (!cancelled && docId) {
          setHeader((previous) => ({ ...previous, docId }));
        }
      } catch (error) {
        console.error("Opening Stock Entry Doc ID generation error:", error);

        if (!cancelled) {
          addToast("Failed to generate Opening Stock Entry Doc Id.", "error");
        }
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, isEdit, header.docId]);

  /* ---------------------------------------------------------------------- */
  /* Select options (the saved value is always visible)                     */
  /* ---------------------------------------------------------------------- */

  const finalPlantOptions = useMemo(
    () => withCurrent(plantOptions, header.plant, header.plantName),
    [plantOptions, header.plant, header.plantName],
  );

  const finalLocationOptions = useMemo(
    () => withCurrent(locationOptions, header.location, header.locationName),
    [locationOptions, header.location, header.locationName],
  );

  const finalItemOptions = useMemo(
    () => withCurrent(itemOptions, header.itemCode),
    [itemOptions, header.itemCode],
  );

  /* ---------------------------------------------------------------------- */
  /* Change handler                                                         */
  /* ---------------------------------------------------------------------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFieldErrors((previous) => ({ ...previous, [name]: "" }));

    /* ---------------- Plant ---------------- */

    if (name === "plant") {
      setHeader((previous) => ({
        ...previous,
        plant: value,
        plantName: "",
        location: "",
        locationName: "",
      }));

      setFieldErrors((previous) => ({
        ...previous,
        plant: "",
        location: "",
      }));

      return;
    }

    /* ---------------- Location ---------------- */

    if (name === "location") {
      const selected = locationOptions.find(
        (option) => String(option.value) === String(value),
      );

      setHeader((previous) => ({
        ...previous,
        location: value,
        locationName: selected?.label || "",
      }));

      return;
    }

    /* ---------------- Item code ---------------- */

    if (name === "itemCode") {
      const selectedItem = itemMap[value];

      if (selectedItem) {
        itemLookupDone.current.delete(getItemId(selectedItem));
      }

      setHeader((previous) => ({
        ...previous,

        itemCode: value,

        itemId: getItemId(selectedItem),

        /* a different item must not keep the previous item's values */
        itemDescription: getItemDescription(selectedItem),

        unit: getItemUnit(selectedItem),
      }));

      setFieldErrors((previous) => ({
        ...previous,
        itemCode: "",
        itemDescription: "",
        unit: "",
      }));

      return;
    }

    /* ---------------- Quantity / rate ---------------- */

    if (name === "quantity" || name === "rate") {
      setHeader((previous) => {
        const quantity = name === "quantity" ? value : previous.quantity;
        const rate = name === "rate" ? value : previous.rate;

        return {
          ...previous,
          [name]: value,
          amount: calculateAmount(quantity, rate),
        };
      });

      return;
    }

    /* ---------------- Other fields ---------------- */

    setHeader((previous) => ({ ...previous, [name]: value }));
  };

  /* ---------------------------------------------------------------------- */
  /* Validation                                                             */
  /* ---------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant is required";

    if (!header.docDate) errors.docDate = "Doc Date is required";

    if (!header.asOnDate) errors.asOnDate = "As On Date is required";

    if (!String(header.docId || "").trim()) errors.docId = "Doc Id is required";

    if (!header.location) errors.location = "Location is required";

    if (!String(header.itemCode || "").trim()) {
      errors.itemCode = "Item Code is required";
    }

    if (!String(header.itemDescription || "").trim()) {
      errors.itemDescription = "Item Description is required";
    }

    if (!String(header.unit || "").trim()) errors.unit = "Unit is required";

    if (
      header.quantity === "" ||
      !Number.isFinite(Number(header.quantity)) ||
      Number(header.quantity) <= 0
    ) {
      errors.quantity = "Qty must be greater than 0";
    }

    if (
      header.rate === "" ||
      !Number.isFinite(Number(header.rate)) ||
      Number(header.rate) < 0
    ) {
      errors.rate = "Rate cannot be negative";
    }

    if (!calculateAmount(header.quantity, header.rate)) {
      errors.amount = "Invalid Qty / Rate";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ---------------------------------------------------------------------- */
  /* Build payload                                                          */
  /* ---------------------------------------------------------------------- */

  const buildPayload = () => {
    const amount = calculateAmount(header.quantity, header.rate);

    /* the backend stores the item by ID, not by code */
    const itemId = header.itemId || getItemId(itemMap[header.itemCode]);

    return {
      ...(isEdit ? { id: Number(existingId) } : {}),

      orgId: Number(orgId),

      branch: Number(header.plant),

      docDate: header.docDate,

      asOnDate: header.asOnDate,

      docId: header.docId,
      financialYear: finYear,

      location: Number(header.location),

      /* item ID, not the code */
      item: Number(itemId),

      /* backend key is "qty", not "quantity" */
      qty: Number(header.quantity),

      rate: Number(header.rate),

      amount: Number(amount),

      remarks: header.remarks || "",

      active:
        typeof savedRecord?.active === "boolean"
          ? savedRecord.active
          : String(savedRecord?.active).toLowerCase() !== "inactive",

      createdBy: isEdit ? savedRecord?.createdBy || currentUser : currentUser,

      ...(isEdit ? { updatedBy: currentUser } : {}),
    };
  };

  /* ---------------------------------------------------------------------- */
  /* Save                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleSave = async () => {
    if (isSubmitting || loadingData) return;

    if (!validate()) {
      addToast("Please fill all mandatory fields before saving.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = buildPayload();

      console.log(
        "OPENING STOCK ENTRY PAYLOAD:",
        JSON.stringify(payload, null, 2),
      );

      const response = await openingStockEntryAPI.createUpdate(payload);

      if (response?.status === true) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isEdit
              ? "Opening Stock Entry updated successfully!"
              : "Opening Stock Entry created successfully!"),
          "success",
        );

        onBack?.();

        return;
      }

      addToast(
        response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save Opening Stock Entry.",
        "error",
      );
    } catch (error) {
      console.error("Opening Stock Entry Save Error:", error);

      const responseData = error?.response?.data;

      addToast(
        responseData?.errors?.[0]?.shortMessage ||
          responseData?.errors?.[0]?.longMessage ||
          responseData?.paramObjectsMap?.errorMessage ||
          responseData?.paramObjectsMap?.message ||
          responseData?.message ||
          error?.message ||
          "Something went wrong while saving.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="p-2 max-w-7xl">
      {/* Title */}

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={
            "p-1 rounded-md text-gray-600 " +
            "dark:text-gray-300 " +
            "hover:bg-gray-100 " +
            "dark:hover:bg-gray-700 " +
            "hover:text-gray-900 " +
            "dark:hover:text-white " +
            "disabled:opacity-50"
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Opening Stock Entry" : "Add Opening Stock Entry"}
        </h2>
      </div>

      {/* Main card */}

      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Loading overlay (edit mode, while getById runs) */}
        {loadingData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-800/70 text-xs text-gray-600 dark:text-gray-300">
            Loading opening stock entry...
          </div>
        )}

        {/* Document details */}

        <div>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plant"
              value={header.plant}
              onChange={handleChange}
              options={finalPlantOptions}
              error={fieldErrors.plant}
              required
              disabled={loadingMasters || isEdit}
            />

            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleChange}
              error={fieldErrors.docDate}
              required
              disabled={isSubmitting}
            />

            <Field
              type="date"
              label="As On Date"
              name="asOnDate"
              value={header.asOnDate}
              onChange={handleChange}
              error={fieldErrors.asOnDate}
              required
              disabled={isSubmitting}
            />

            <Field
              label="Doc Id"
              name="docId"
              value={header.docId}
              onChange={handleChange}
              error={fieldErrors.docId}
              required
              disabled
              placeholder="Auto generated"
            />
          </div>
        </div>

        {/* Stock details */}

        <div>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Location"
              name="location"
              value={header.location}
              onChange={handleChange}
              options={finalLocationOptions}
              error={fieldErrors.location}
              required
              disabled={!header.plant || loadingLocations}
            />

            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleChange}
              options={finalItemOptions}
              error={fieldErrors.itemCode}
              required
              disabled={loadingMasters}
            />

            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleChange}
              error={fieldErrors.itemDescription}
              required
              disabled
            />

            <Field
              label="Unit"
              name="unit"
              value={header.unit}
              onChange={handleChange}
              error={fieldErrors.unit}
              required
              disabled
            />

            <Field
              type="number"
              label="Qty"
              name="quantity"
              value={header.quantity}
              onChange={handleChange}
              error={fieldErrors.quantity}
              required
              min="0"
              step="0.001"
              placeholder="0.000"
              disabled={isSubmitting}
            />

            <Field
              type="number"
              label="Rate"
              name="rate"
              value={header.rate}
              onChange={handleChange}
              error={fieldErrors.rate}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={isSubmitting}
            />

            <Field
              type="number"
              label="Amount"
              name="amount"
              value={header.amount}
              error={fieldErrors.amount}
              readOnly
              disabled
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Remarks */}

        <div>
          <div className={fieldGrid}>
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={header.remarks}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter remarks..."
              className="col-span-full"
            />
          </div>
        </div>

        {/* Buttons */}

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          disabled={loadingData}
          saveLabel={isEdit ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default OpeningStockEntryForm;
