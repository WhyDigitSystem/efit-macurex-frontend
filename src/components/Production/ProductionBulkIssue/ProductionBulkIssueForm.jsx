import { ArrowLeft, Save, X, Plus, Trash2, Calendar } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import dayjs from "dayjs";

import { useToast } from "../../Toast/ToastContext";
import productionBulkIssueAPI from "../../../api/Production/productionBulkIssueAPI";
import materialIndentForProductionAPI from "../../../api/Production/materialIndentForProductionAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";

/* ========================================================================= */
/* DESIGN TOKENS                                                             */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const readOnlyClasses = "bg-gray-50 dark:bg-gray-800 cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  const number = parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
};

/* API dates are ISO (YYYY-MM-DD); the pickers display DD-MM-YYYY.
   Already-formatted DD-MM-YYYY values pass through untouched. */
const isoToDisplay = (value) => {
  if (!value) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(String(value))) return String(value);
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD-MM-YYYY") : "";
};

const displayToIso = (value) => {
  if (!value) return "";
  const [day, month, year] = String(value).split("-");
  if (!day || !month || !year) return "";
  return `${year}-${month}-${day}`;
};

/* First usable id from candidates: an object ({ id }), a number or a numeric
   string. Non-numeric strings (display names) are skipped. */
const pickId = (...candidates) => {
  for (const c of candidates) {
    if (c === null || c === undefined || c === "") continue;
    if (typeof c === "object") {
      if (c.id !== null && c.id !== undefined && c.id !== "") return c.id;
      continue;
    }
    if (typeof c === "number" || (typeof c === "string" && !isNaN(c))) {
      return c;
    }
  }
  return "";
};

/* First NON-EMPTY array (an empty array is truthy, so `a || b` would stop
   at an empty list and never reach the real one). */
const firstNonEmptyArray = (...candidates) =>
  candidates.find((c) => Array.isArray(c) && c.length > 0) || [];

/* Overlay `override` on `base`, ignoring null / undefined / "" values. */
const mergeRecord = (base, override) => {
  const out = { ...(base || {}) };
  Object.entries(override || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      out[key] = value;
    }
  });
  return out;
};

/* Make sure the selected value always exists as an <option>, otherwise a
   <select> renders blank when the lookup doesn't contain it (yet). */
const withCurrent = (options, value, label) => {
  if (value === "" || value === null || value === undefined) return options;
  const exists = (options || []).some(
    (o) => String(typeof o === "object" ? o.value : o) === String(value),
  );
  if (exists) return options;
  return [{ value, label: label || String(value) }, ...(options || [])];
};

const getFieldError = (errors, name) => {
  let error = errors;
  for (const part of name.split(".")) {
    if (error && error[part]) error = error[part];
    else return null;
  }
  return error?.message;
};

/* ========================================================================= */
/* SHARED COMPONENTS                                                         */
/* ========================================================================= */

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
  disabled,
  step,
  readOnly,
}) => {
  const errorMessage = getFieldError(errors, name);

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
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? readOnlyClasses : ""}`}
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
  disabled,
  placeholder = "-- Select --",
}) => {
  const errorMessage = getFieldError(errors, name);

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
            disabled={disabled}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e.target.value);
            }}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
          >
            <option value="">{placeholder}</option>
            {(options || []).map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />

      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const DatePickerField = ({
  control,
  name,
  label,
  required,
  errors,
  readOnly,
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const errorMessage = getFieldError(errors, name);

  const getCalendarDays = (month) => {
    const startDay = month.startOf("month").day();
    const daysInMonth = month.daysInMonth();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(month.date(i));
    return days;
  };

  return (
    <div className="relative">
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => {
          const selectedDate = field.value
            ? dayjs(field.value, "DD-MM-YYYY", true)
            : null;

          return (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={field.value || ""}
                  placeholder="DD-MM-YYYY"
                  readOnly
                  onClick={() => !readOnly && setOpen((prev) => !prev)}
                  className={`${controlClasses} pr-8 ${readOnly ? readOnlyClasses : "cursor-pointer"} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                />

                <Calendar
                  size={15}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>

              {open && !readOnly && (
                <div className="absolute z-[9999] mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth((p) => p.subtract(1, "month"))
                      }
                      className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      ‹
                    </button>

                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                      {currentMonth.format("MMMM YYYY")}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCurrentMonth((p) => p.add(1, "month"))}
                      className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      ›
                    </button>
                  </div>

                  <div className="grid grid-cols-7 mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays(currentMonth).map((date, index) => {
                      if (!date) return <div key={index} className="h-8" />;

                      const isSelected =
                        selectedDate?.isValid() &&
                        date.isSame(selectedDate, "day");
                      const isToday = date.isSame(dayjs(), "day");

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            field.onChange(date.format("DD-MM-YYYY"));
                            setOpen(false);
                          }}
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : isToday
                                ? "border border-blue-600 text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {date.date()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = dayjs();
                        field.onChange(today.format("DD-MM-YYYY"));
                        setCurrentMonth(today);
                        setOpen(false);
                      }}
                      className="w-full text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded py-1.5"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        }}
      />

      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

/* ---- table ---- */

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs border-collapse">{children}</table>
  </div>
);

const TableHead = ({ columns }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      <th className="p-2 text-center text-[10px] font-medium text-gray-700 dark:text-gray-200 w-10">
        S.No
      </th>

      {columns.map((col) => (
        <th
          key={col.key}
          className={`p-2 whitespace-nowrap text-[10px] font-medium text-gray-700 dark:text-gray-200 ${col.width || ""} ${
            col.align === "right" ? "text-right" : "text-left"
          }`}
        >
          {col.label}
        </th>
      ))}

      <th className="p-2 text-center text-[10px] font-medium text-gray-700 dark:text-gray-200 w-16">
        Action
      </th>
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center align-top font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>

    {children}

    <td className="p-2 text-center align-top">
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

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
  align = "left",
  readOnly,
  onChange,
  width = "min-w-[100px]",
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className={`p-2 align-top ${width}`}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "Required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            value={field.value ?? ""}
            type={type}
            step={step}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`${controlClasses} ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? readOnlyClasses : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e);
            }}
          />
        )}
      />

      {errorMessage && (
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

/* ========================================================================= */
/* CONSTANTS / DEFAULTS                                                      */
/* ========================================================================= */

const TYPE_OPTIONS = ["Regular", "Addl Issues"];

const getDefaultDetailRow = () => ({
  id: 0,
  itemId: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  unitLabel: "",
  availableQty: "",
  indentRequiredQty: "",
  indentPendingQty: "",
  issueQty: "",
  rate: "",
  amount: "",
});

/* One saved detail row from details[] -> form row.
   Response shape: { id, item{}, unit{ id, unitId }, availableQty,
   indReqQty, indPendQty, issueQty, rate, amount } */
const mapDetailRow = (row) => {
  const unitObj = row.unit && typeof row.unit === "object" ? row.unit : null;

  return {
    id: row.id || 0,
    itemId: pickId(row.item, row.itemId),
    itemCode: row.item?.itemCode || row.itemCode || "",
    itemDescription: row.item?.itemDescription || row.itemDescription || "",
    unit: pickId(row.unit, row.unitId),
    unitLabel:
      unitObj?.unitId ||
      unitObj?.unitName ||
      row.unitDescription ||
      row.unitLabel ||
      row.unitCode ||
      (typeof row.unit === "string" && isNaN(row.unit) ? row.unit : "") ||
      "",
    availableQty: row.availableQty ?? "",
    indentRequiredQty:
      row.indReqQty ?? row.indentReqQty ?? row.indentRequiredQty ?? "",
    indentPendingQty:
      row.indPendQty ?? row.indPendingQty ?? row.indentPendingQty ?? "",
    issueQty: row.issueQty ?? "",
    rate: row.rate ?? "",
    amount: row.amount ?? "",
  };
};

/* One row from getIndentByItemForProductionBulkIssues -> form row. */
/* One row from getIndentByItemForProductionBulkIssues -> form row.
   Ind. Req. Qty is a user entry, so it is NOT prefilled from the indent. */
const mapIndentRow = (row) => ({
  id: 0,
  itemId: row.itemId ?? "",
  itemCode: row.itemCode || "",
  itemDescription: row.itemDescription || "",
  unit: row.primaryUnitId ?? "",
  unitLabel: row.primaryUnitCode || row.primaryUnitDescription || "",
  availableQty: "",
  indentRequiredQty: "",
  indentPendingQty: "",
  issueQty: "",
  rate: "",
  amount: "",
});

const getDefaultValues = (record) => {
  const detailRows = firstNonEmptyArray(
    record?.details,
    record?.productionBulkIssueDetailsResponseDTO,
    record?.productionBulkIssueDetails,
    record?.productionBulkIssueDetailsDTO,
    record?.itemDetails,
  );

  const dateValue = isoToDisplay(record?.date || record?.docDate);

  return {
    plant: pickId(
      record?.branch,
      record?.branchId,
      record?.plantId,
      record?.plant,
    ),
    plantLabel:
      record?.branch?.branchName ||
      record?.branch?.branchCode ||
      (typeof record?.plant === "string" && isNaN(record.plant)
        ? record.plant
        : "") ||
      "",

    issueNo: record?.docId || (record?.id ? `PBI-${record.id}` : ""),

    belongsTo: record?.belongsTo || "",

    date: dateValue || dayjs().format("DD-MM-YYYY"),

    fgItemId: pickId(record?.fgItem, record?.fgItemId),
    fgItemCode: record?.fgItem?.itemCode || record?.fgItemCode || "",
    fgItemDescription:
      record?.fgItem?.itemDescription || record?.fgItemDescription || "",

    indentNo: record?.indentNo || record?.indent?.docId || "",

    issueDate: isoToDisplay(record?.issueDate) || dateValue,

    purchaseMaterialRef: record?.purchaseMaterialRef || "",
    type: record?.type || record?.issueType || "",
    referenceNo: record?.refNo || record?.referenceNo || "",

    fromLocation: pickId(record?.fromLocation, record?.fromLocationId),
    fromLocationLabel:
      record?.fromLocation?.locationName ||
      record?.fromLocation?.locationCode ||
      "",
    toLocation: pickId(record?.toLocation, record?.toLocationId),
    toLocationLabel:
      record?.toLocation?.locationName ||
      record?.toLocation?.locationCode ||
      "",

    /* Remarks box = cancelRemarks in the backend */
    remarks: record?.cancelRemarks || record?.remarks || "",

    productionBulkIssueDetails: detailRows.length
      ? detailRows.map(mapDetailRow)
      : [getDefaultDetailRow()],
  };
};

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const ProductionBulkIssueForm = ({ data, editData, onBack }) => {
  const record = data || editData;
  const { addToast } = useToast();

  const ORG_ID = toInteger(localStorage.getItem("orgId"));
  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");
  const FIN_YEAR =
    localStorage.getItem("finYear") || String(new Date().getFullYear());

  const isEditMode = Boolean(record?.id);

  const [activeTab, setActiveTab] = useState("details");
  const [saving, setSaving] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const dataLoadedRef = useRef(null);

  /* lookups */
  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  /* FG item cascade */
  const [fgItemOptions, setFgItemOptions] = useState([]);
  const [fgItemMap, setFgItemMap] = useState({});

  /* Indent rows for the selected FG item */
  const [indentRows, setIndentRows] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(record),
  });

  const detailsArray = useFieldArray({
    control,
    name: "productionBulkIssueDetails",
  });

  const watchedPlant = watch("plant");
  const watchedFgItemId = watch("fgItemId");
  const watchedFromLocation = watch("fromLocation");
  const watchedToLocation = watch("toLocation");
  const watchedIndentNo = watch("indentNo");
  const watchedBelongsTo = watch("belongsTo");
  const watchedType = watch("type");
  const watchedPlantLabel = watch("plantLabel");
  const watchedFgItemCode = watch("fgItemCode");
  const watchedFromLabel = watch("fromLocationLabel");
  const watchedToLabel = watch("toLocationLabel");

  /* useWatch re-renders on every nested field change inside the field array,
     which drives the auto calculation below. */
  const watchDetails = useWatch({
    control,
    name: "productionBulkIssueDetails",
  });

  const effectiveBranchId = toInteger(watchedPlant || BRANCH_ID);

  /* ===================================================================== */
  /* LOOKUP LOADERS                                                        */
  /* ===================================================================== */

  const loadPlants = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branchVO ||
          response?.paramObjectsMap?.branches ||
          [];

      setPlantOptions(
        list.map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || `Branch ${b.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load plants:", error);
      setPlantOptions([]);
    }
  }, [ORG_ID]);

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const list = await materialIndentForProductionAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      setBelongsToOptions(
        list.map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);
      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  const loadLocations = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await locationMasterAPI.getLocationMasterByOrgId(
        ORG_ID,
        effectiveBranchId,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.locationMasterVO || [];

      setLocationOptions(
        list.map((l) => ({
          value: l.id,
          label: l.locationName || l.locationCode || `Location ${l.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadFgItems = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) return;

      const list = await productionBulkIssueAPI.getFgItems(
        effectiveBranchId,
        ORG_ID,
      );

      setFgItemOptions(
        list.map((r) => ({
          value: r.itemId,
          label: r.itemCode || `Item ${r.itemId}`,
        })),
      );

      const map = {};
      list.forEach((r) => {
        map[r.itemId] = r;
      });
      setFgItemMap(map);
    } catch (error) {
      console.error("Failed to load FG items:", error);
      setFgItemOptions([]);
      setFgItemMap({});
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadIndentRows = useCallback(
    async (fgItemId) => {
      try {
        if (!ORG_ID || !effectiveBranchId || !fgItemId) {
          setIndentRows([]);
          return;
        }

        const list = await productionBulkIssueAPI.getIndentsForItem(
          effectiveBranchId,
          fgItemId,
          ORG_ID,
        );

        setIndentRows(list);
      } catch (error) {
        console.error("Failed to load indents for item:", error);
        setIndentRows([]);
      }
    },
    [ORG_ID, effectiveBranchId],
  );

  useEffect(() => {
    loadPlants();
    loadBelongsTo();
  }, [loadPlants, loadBelongsTo]);

  useEffect(() => {
    loadLocations();
    loadFgItems();
  }, [loadLocations, loadFgItems]);

  useEffect(() => {
    loadIndentRows(watchedFgItemId);
  }, [watchedFgItemId, loadIndentRows]);

  /* Keep From/To Location mutually exclusive. */
  useEffect(() => {
    if (
      watchedFromLocation &&
      String(watchedFromLocation) === String(getValues("toLocation"))
    ) {
      setValue("toLocation", "", { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFromLocation]);

  /* Dropdown options always include the saved value. */
  const plantSelectOptions = withCurrent(
    plantOptions,
    watchedPlant,
    watchedPlantLabel,
  );

  const belongsToSelectOptions = withCurrent(
    belongsToOptions,
    watchedBelongsTo,
    watchedBelongsTo,
  );

  const typeSelectOptions = withCurrent(TYPE_OPTIONS, watchedType, watchedType);

  const fgItemSelectOptions = withCurrent(
    fgItemOptions,
    watchedFgItemId,
    watchedFgItemCode,
  );

  const indentNoOptions = withCurrent(
    indentRows.map((row) => ({ value: row.docId, label: row.docId })),
    watchedIndentNo,
    watchedIndentNo,
  );

  const fromLocationOptions = withCurrent(
    locationOptions,
    watchedFromLocation,
    watchedFromLabel,
  );

  const toLocationOptions = withCurrent(
    locationOptions.filter(
      (loc) => String(loc.value) !== String(watchedFromLocation),
    ),
    watchedToLocation,
    watchedToLabel,
  );

  /* ===================================================================== */
  /* DOCUMENT NUMBER                                                       */
  /* ===================================================================== */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generate = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await productionBulkIssueAPI.getDocId({
          financialYear: FIN_YEAR,
          orgId: ORG_ID,
        });

        if (!cancelled) setValue("issueNo", docId || "");
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating issue doc id:", error);
          addToast("Failed to generate Issue No.", "error");
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, ORG_ID, FIN_YEAR]);

  /* ===================================================================== */
  /* EDIT MODE HYDRATION  (getProductionBulkIssuesById)                    */
  /* ===================================================================== */

  useEffect(() => {
    const issueId = record?.id;

    if (!issueId || dataLoadedRef.current === issueId) return;

    dataLoadedRef.current = issueId;

    const load = async () => {
      setLoadingRecord(true);

      try {
        const issue = await productionBulkIssueAPI.getById(issueId);
        const merged = mergeRecord(record, issue);
        const values = getDefaultValues(merged);
        const branchId = toInteger(values.plant || BRANCH_ID);

        /* No saved detail rows came back — rebuild from the saved indent. */
        const hasSavedRows = values.productionBulkIssueDetails.some(
          (r) => r.itemId,
        );

        if (!hasSavedRows && values.indentNo && values.fgItemId) {
          const list = await productionBulkIssueAPI.getIndentsForItem(
            branchId,
            values.fgItemId,
            ORG_ID,
          );

          const match = list.find((r) => r.docId === values.indentNo);

          if (match) {
            values.productionBulkIssueDetails = [mapIndentRow(match)];
          }
        }

        reset(values);
      } catch (error) {
        console.error("Error loading production bulk issue:", error);
        addToast("Failed to load Production (Bulk) Issue data", "error");
      } finally {
        setLoadingRecord(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  /* ===================================================================== */
  /* FG ITEM / INDENT CASCADE                                              */
  /* ===================================================================== */

  const applyFgItem = useCallback(
    (fgItemId) => {
      const row = fgItemMap[fgItemId];

      setValue("fgItemDescription", row?.itemDescription || "", {
        shouldDirty: true,
      });
      setValue("fgItemCode", row?.itemCode || "", { shouldDirty: true });
      setValue("indentNo", "", { shouldDirty: true });

      detailsArray.replace([getDefaultDetailRow()]);
    },
    [fgItemMap, setValue, detailsArray],
  );

  const applyIndentNo = useCallback(
    (indentNoValue) => {
      const row = indentRows.find((r) => r.docId === indentNoValue);

      if (!row) {
        detailsArray.replace([getDefaultDetailRow()]);
        return;
      }

      detailsArray.replace([mapIndentRow(row)]);
    },
    [indentRows, detailsArray],
  );

  /* ===================================================================== */
  /* ROW HANDLERS                                                          */
  /* ===================================================================== */

  const handleAddDetail = () => detailsArray.append(getDefaultDetailRow());

  const handleRemoveDetail = (index) => {
    if (detailsArray.fields.length > 1) detailsArray.remove(index);
  };

  /* ===================================================================== */
  /* AUTO CALCULATION                                                      */
  /* ===================================================================== */

  /*
   * Per row:
   *   Ind. Pend. Qty = Available Qty − Ind. Req. Qty
   *   Amount         = Issue Qty × Rate
   */
  useEffect(() => {
    (watchDetails || []).forEach((row, index) => {
      /* Amount */
      const amount = Number(
        (toNumber(row?.issueQty) * toNumber(row?.rate)).toFixed(2),
      );

      if (String(row?.amount ?? "") !== String(amount)) {
        setValue(`productionBulkIssueDetails.${index}.amount`, amount, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      /* Pending */
      const hasAvail =
        row?.availableQty !== "" &&
        row?.availableQty !== null &&
        row?.availableQty !== undefined;
      const hasReq =
        row?.indentRequiredQty !== "" &&
        row?.indentRequiredQty !== null &&
        row?.indentRequiredQty !== undefined;

      const pending =
        hasAvail || hasReq
          ? Number(
              (
                toNumber(row?.availableQty) - toNumber(row?.indentRequiredQty)
              ).toFixed(2),
            )
          : "";

      if (String(row?.indentPendingQty ?? "") !== String(pending)) {
        setValue(
          `productionBulkIssueDetails.${index}.indentPendingQty`,
          pending,
          { shouldDirty: true, shouldValidate: false },
        );
      }
    });
  }, [watchDetails, setValue]);

  /* ===================================================================== */
  /* VALIDATION & SAVE                                                     */
  /* ===================================================================== */

  const validate = () => {
    const missingFields = [];
    if (!watch("plant")) missingFields.push("Plant ID");
    if (!watch("belongsTo")) missingFields.push("Belongs To");
    if (!watch("date")) missingFields.push("Date");
    if (!watch("fgItemId")) missingFields.push("FG Item Code");
    if (!watch("indentNo")) missingFields.push("Indent No");
    if (!watch("issueDate")) missingFields.push("Issue Date");
    if (!watch("type")) missingFields.push("Type");
    if (!watch("fromLocation")) missingFields.push("From Location");
    if (!watch("toLocation")) missingFields.push("To Location");

    if (missingFields.length) {
      addToast(
        `Missing mandatory fields: ${missingFields.join(", ")}`,
        "error",
      );
      return false;
    }

    const details = getValues("productionBulkIssueDetails") || [];
    const hasValidRow = details.some(
      (row) =>
        row.itemId && parseFloat(row.issueQty) > 0 && parseFloat(row.rate) > 0,
    );

    if (!hasValidRow) {
      addToast(
        "At least one detail row with an item, Issue Qty and Rate is required",
        "error",
      );
      setActiveTab("details");
      return false;
    }

    return true;
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;

    setSaving(true);
    const isUpdate = Boolean(record?.id);

    try {
      /* ---- docId: a real number is always sent to the backend ----------- */
      let docId = /^PBI-\d+$/.test(formData.issueNo || "")
        ? ""
        : formData.issueNo || "";

      if (!docId) {
        docId =
          (await productionBulkIssueAPI.getDocId({
            financialYear: FIN_YEAR,
            orgId: ORG_ID,
          })) || "";

        if (docId) setValue("issueNo", docId);
      }

      const detailRows = (formData.productionBulkIssueDetails || [])
        .filter((row) => row.itemId)
        .map((row) => ({
          ...(row.id ? { id: toInteger(row.id) } : {}),
          item: toInteger(row.itemId),
          unit: toInteger(row.unit),
          availableQty: toNumber(row.availableQty),
          indReqQty: toNumber(row.indentRequiredQty), // user entry
          indPendQty: toNumber(row.indentPendingQty),
          indPendingQty: toNumber(row.indentPendingQty),
          issueQty: toNumber(row.issueQty),
          rate: toNumber(row.rate),
          amount: toNumber(row.amount),
        }));

      const headerUnit = detailRows.length ? detailRows[0].unit : 0;

      const payload = {
        active: true,
        belongsTo: formData.belongsTo || "",
        branch: effectiveBranchId,
        plant: toInteger(formData.plant),
        cancel: record?.cancel === true || record?.cancel === "T",
        cancelRemarks: formData.remarks || "", // Remarks box = cancelRemarks
        createdBy: (isUpdate ? record?.createdBy : usersId) || "SYSTEM",
        ...(isUpdate && { updatedBy: usersId || "SYSTEM" }),
        date: displayToIso(formData.date) || "",
        docDate: displayToIso(formData.date) || "",
        docId,
        issueNo: docId,
        fgItem: toInteger(formData.fgItemId),
        financialYear: FIN_YEAR,
        fromLocation: toInteger(formData.fromLocation),
        ...(isUpdate && { id: toInteger(record.id) }),
        indentNo: formData.indentNo || "",
        issueDate: displayToIso(formData.issueDate) || "",
        issueType: formData.type || "",
        type: formData.type || "",
        orgId: ORG_ID,
        purchaseMaterialRef: formData.purchaseMaterialRef || "",
        referenceNo: formData.referenceNo || "",
        refNo: formData.referenceNo || "",
        toLocation: toInteger(formData.toLocation),
        unit: headerUnit,
        productionBulkIssueDetailsDTO: detailRows,
        details: detailRows,
      };

      console.log("createUpdateProductionBulkIssues payload ->", payload);

      const response = await productionBulkIssueAPI.createUpdate(payload);

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isUpdate
            ? "Production (Bulk) Issue updated successfully"
            : "Production (Bulk) Issue created successfully",
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save Production (Bulk) Issue.",
          "error",
        );
      }
    } catch (error) {
      console.error("Save Production (Bulk) Issue Error:", error);
      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Production (Bulk) Issue.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================================== */
  /* RENDER                                                                */
  /* ===================================================================== */

  const detailColumns = [
    { key: "itemCode", label: "Item Code", width: "min-w-[110px]" },
    {
      key: "itemDescription",
      label: "Item Description",
      width: "min-w-[200px]",
    },
    { key: "unitLabel", label: "Unit", width: "min-w-[70px]" },
    {
      key: "availableQty",
      label: "Available Qty",
      width: "min-w-[105px]",
      align: "right",
    },
    {
      key: "indentRequiredQty",
      label: "Ind. Req. Qty",
      width: "min-w-[105px]",
      align: "right",
    },
    {
      key: "indentPendingQty",
      label: "Ind. Pend. Qty",
      width: "min-w-[105px]",
      align: "right",
    },
    {
      key: "issueQty",
      label: "Issue Qty",
      width: "min-w-[100px]",
      align: "right",
    },
    { key: "rate", label: "Rate", width: "min-w-[90px]", align: "right" },
    { key: "amount", label: "Amount", width: "min-w-[100px]", align: "right" },
  ];

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode
            ? "Edit Production (Bulk) Issue"
            : "Add Production (Bulk) Issue"}
        </h2>

        {loadingRecord && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Loading...
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Production (Bulk) Issues</SectionHeader>

          <div className={fieldGrid}>
            <SelectField
              control={control}
              name="plant"
              label="Plant ID"
              options={plantSelectOptions}
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="issueNo"
              label="Issue No."
              placeholder={generatingDocId ? "Generating..." : "Auto"}
              readOnly
              errors={errors}
            />

            <SelectField
              control={control}
              name="belongsTo"
              label="Belongs To"
              options={belongsToSelectOptions}
              required
              errors={errors}
            />

            <DatePickerField
              control={control}
              name="date"
              label="Date"
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="fgItemId"
              label="FG Item Code"
              options={fgItemSelectOptions}
              required
              errors={errors}
              onChange={applyFgItem}
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
              name="indentNo"
              label="Indent No."
              options={indentNoOptions}
              required
              errors={errors}
              onChange={applyIndentNo}
            />

            <DatePickerField
              control={control}
              name="issueDate"
              label="Issue Date"
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="purchaseMaterialRef"
              label="Purchase Material Ref."
              errors={errors}
            />

            <SelectField
              control={control}
              name="type"
              label="Type"
              options={typeSelectOptions}
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="referenceNo"
              label="Ref. No"
              errors={errors}
            />

            <SelectField
              control={control}
              name="fromLocation"
              label="From Location"
              options={fromLocationOptions}
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="toLocation"
              label="To Location"
              options={toLocationOptions}
              required
              errors={errors}
            />
          </div>
        </div>

        {/* Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "details"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Production Details
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "summary"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Production (Bulk) Issues Summary
              </button>
            </div>

            {activeTab === "details" && (
              <button
                type="button"
                onClick={handleAddDetail}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeTab === "details" && (
            <div className="pt-3">
              <TableWrapper>
                <TableHead columns={detailColumns} />
                <tbody>
                  {detailsArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemoveDetail(index)}
                      disabled={detailsArray.fields.length <= 1}
                    >
                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.itemCode`}
                        readOnly
                        errors={errors}
                        width={detailColumns[0].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.itemDescription`}
                        readOnly
                        errors={errors}
                        width={detailColumns[1].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.unitLabel`}
                        readOnly
                        errors={errors}
                        width={detailColumns[2].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.availableQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        errors={errors}
                        width={detailColumns[3].width}
                      />

                      {/* Ind. Req. Qty: user entry (editable) */}
                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.indentRequiredQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        required
                        errors={errors}
                        width={detailColumns[4].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.indentPendingQty`}
                        type="number"
                        align="right"
                        readOnly
                        errors={errors}
                        width={detailColumns[5].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.issueQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        required
                        errors={errors}
                        width={detailColumns[6].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.rate`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        required
                        errors={errors}
                        width={detailColumns[7].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.amount`}
                        type="number"
                        align="right"
                        readOnly
                        errors={errors}
                        width={detailColumns[8].width}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="pt-3 space-y-2">
              <label className={labelClasses}>Remarks</label>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    placeholder="Enter remarks..."
                    className="w-full px-2 py-1.5 rounded border text-xs leading-tight resize-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  />
                )}
              />
            </div>
          )}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={saving || isSubmitting || loadingRecord}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving || isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionBulkIssueForm;
