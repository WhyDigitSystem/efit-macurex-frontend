import { ArrowLeft, Save, X, Plus, Trash2, Calendar } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import dayjs from "dayjs";

import { useToast } from "../../Toast/ToastContext";
import productionIssueAPI from "../../../api/Production/productionIssueAPI";
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
   Already-formatted DD-MM-YYYY values are passed through untouched. */
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

/* Returns the first usable id from a list of candidates. A candidate may be
   an object ({ id }), a number, or a numeric string. Non-numeric strings
   (e.g. a display name) are skipped. */
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

/* First candidate that is a NON-EMPTY array. (An empty array is truthy, so a
   plain `a || b` would stop at an empty list and never reach the real one.) */
const firstNonEmptyArray = (...candidates) =>
  candidates.find((c) => Array.isArray(c) && c.length > 0) || [];

/* Overlay `override` on `base`, ignoring null / undefined / "" values so the
   list row can fill any gaps in the by-id response. */
const mergeRecord = (base, override) => {
  const out = { ...(base || {}) };
  Object.entries(override || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      out[key] = value;
    }
  });
  return out;
};

/* Make sure the currently selected value always exists as an <option>,
   otherwise a <select> renders blank when the lookup list doesn't contain it
   (not loaded yet, or the saved value is no longer in the list). */
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

const SelectCell = ({
  control,
  name,
  options,
  required,
  errors,
  onChange,
  disabled,
  width = "min-w-[130px]",
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className={`p-2 align-top ${width}`}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "Required" } : undefined}
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
            <option value="">-- Select --</option>
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
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

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
  grnNo: "",
  grnDate: "",
  internalRequiredQty: "",
  internalFundedQty: "",
  issueQty: "",
  itemMinimumQty: "",
  rate: "",
  amount: "",
});

/* Maps one saved detail row (itemDetails from the API) to the form row.
   Backend names: intReqQty, itemMinQty. Older names are still accepted. */
const mapDetailRow = (row) => {
  const unitObj = row.unit && typeof row.unit === "object" ? row.unit : null;

  const issueQty = row.issueQty ?? "";
  const rate = row.rate ?? "";

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
      (typeof row.unit === "string" && isNaN(row.unit) ? row.unit : "") ||
      "",
    availableQty: row.availableQty ?? "",
    grnNo: row.grnNo || "",
    grnDate: isoToDisplay(row.grnDate),
    internalRequiredQty: row.intReqQty ?? row.internalRequiredQty ?? "",
    internalFundedQty: row.internalFundedQty ?? "",
    issueQty,
    itemMinimumQty: row.itemMinQty ?? row.itemMinimumQty ?? "",
    rate,
    amount:
      row.amount ??
      (issueQty !== "" && rate !== ""
        ? Number((toNumber(issueQty) * toNumber(rate)).toFixed(2))
        : ""),
  };
};

/* Maps one line from getIndentNoDetailsForProductionIssue to a form row. */
const mapIndentLine = (line) => ({
  id: 0,
  itemId: line.itemId ?? "",
  itemCode: line.itemCode || "",
  itemDescription: line.itemDescription || "",
  unit: line.unit ?? "",
  unitLabel: line.unitDescription || "",
  availableQty: "",
  grnNo: "",
  grnDate: "",
  internalRequiredQty: line.requiredQty ?? "",
  internalFundedQty: "",
  issueQty: "",
  itemMinimumQty: "",
  rate: "",
  amount: "",
});

/* Builds the form values from a getProductionIssueById entry, a list row,
   or a merge of both. */
const getDefaultValues = (record) => {
  const detailRows = firstNonEmptyArray(
    record?.itemDetails,
    record?.productionIssueDetailsResponseDTO,
    record?.productionIssueDetailsVO,
    record?.productionIssueDetails,
    record?.productionIssueDetailsDTO,
  );

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

    /* Issue No. = docId from the backend. Temporary PI-<id> only while the
       backend still returns docId = null. */
    issueNo: record?.docId || (record?.id ? `PI-${record.id}` : ""),

    belongsTo: record?.belongsTo || "",

    /* Date = docDate (issueDate is accepted as a fallback). */
    date:
      isoToDisplay(record?.docDate || record?.issueDate) ||
      dayjs().format("DD-MM-YYYY"),

    fgItemId: pickId(record?.fgItem, record?.fgItemId),
    fgItemCode: record?.fgItem?.itemCode || record?.fgItemCode || "",
    fgItemDescription:
      record?.fgItem?.itemDescription || record?.fgItemDescription || "",

    indentNo: record?.indentNo || "",

    /* Read-only indent reference date; re-derived from the Indent No list
       once it has loaded. */
    issueRefDate: "",
    scheduleOrderNo: record?.schOrderNo || record?.scheduleOrderNo || "",
    type: record?.type || record?.issueType || "",

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

    narration: record?.narration || "",
    totalValue: record?.totalValue || 0,

    productionIssueDetails: detailRows.length
      ? detailRows.map(mapDetailRow)
      : [getDefaultDetailRow()],
  };
};

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const ProductionIssueForm = ({ data, editData, onBack }) => {
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

  /* Indent cascade (schOrderNo / docId / docDate) for the selected FG item */
  const [indentRows, setIndentRows] = useState([]);

  /* GRN options per item id (filled on indent selection AND on edit load) */
  const [grnOptionsMap, setGrnOptionsMap] = useState({});

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
    name: "productionIssueDetails",
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

  /* useWatch re-renders on every nested field change inside the field array
     (Issue Qty, Rate, ...), which drives the auto calculation below. */
  const watchDetails = useWatch({
    control,
    name: "productionIssueDetails",
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

      const list = await productionIssueAPI.getFgItems(
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

        const list = await productionIssueAPI.getIndentsForFgItem(
          effectiveBranchId,
          fgItemId,
          ORG_ID,
        );

        setIndentRows(list);
      } catch (error) {
        console.error("Failed to load indent numbers:", error);
        setIndentRows([]);
      }
    },
    [ORG_ID, effectiveBranchId],
  );

  const loadGrnOptionsForRows = useCallback(
    async (rows, branchId) => {
      const itemIds = [
        ...new Set((rows || []).map((r) => r.itemId).filter(Boolean)),
      ];

      if (!itemIds.length || !branchId || !ORG_ID) return;

      const entries = await Promise.all(
        itemIds.map(async (itemId) => [
          itemId,
          await productionIssueAPI.getGrnForItem(branchId, itemId, ORG_ID),
        ]),
      );

      setGrnOptionsMap(Object.fromEntries(entries));
    },
    [ORG_ID],
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

  /* Fill the read-only Issue Date (indent date) and Sch. Order No. from the
     matching indent once the indent list has loaded — only when still empty,
     so nothing the user picked or the backend returned is overwritten. */
  useEffect(() => {
    if (!watchedIndentNo || !indentRows.length) return;

    const row = indentRows.find((r) => r.docId === watchedIndentNo);
    if (!row) return;

    if (!getValues("issueRefDate") && row.docDate) {
      setValue("issueRefDate", isoToDisplay(row.docDate));
    }

    if (!getValues("scheduleOrderNo") && row.schOrderNo) {
      setValue("scheduleOrderNo", row.schOrderNo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indentRows, watchedIndentNo]);

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
    indentRows.map((row) => ({
      value: row.docId,
      label: row.docId,
    })),
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
        const docId = await productionIssueAPI.getDocId({
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
  /* EDIT MODE HYDRATION  (getProductionIssueById)                         */
  /* ===================================================================== */

  useEffect(() => {
    const issueId = record?.id;

    if (!issueId || dataLoadedRef.current === issueId) return;

    dataLoadedRef.current = issueId;

    const load = async () => {
      setLoadingRecord(true);

      try {
        const issue = await productionIssueAPI.getById(issueId);
        const merged = mergeRecord(record, issue);
        const values = getDefaultValues(merged);
        const branchId = toInteger(values.plant || BRANCH_ID);

        /* Saved issue has no detail rows (itemDetails empty) — rebuild them
           from the saved indent so the grid isn't blank. */
        const hasSavedRows = values.productionIssueDetails.some(
          (r) => r.itemId,
        );

        if (!hasSavedRows && values.indentNo) {
          const lines = await productionIssueAPI.getIndentDetails(
            branchId,
            values.indentNo,
            ORG_ID,
          );

          if (lines.length) {
            values.productionIssueDetails = lines.map(mapIndentLine);
          }
        }

        reset(values);

        await loadGrnOptionsForRows(values.productionIssueDetails, branchId);
      } catch (error) {
        console.error("Error loading production issue:", error);
        addToast("Failed to load Production Issue data", "error");
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
      setValue("issueRefDate", "", { shouldDirty: true });
      setValue("scheduleOrderNo", "", { shouldDirty: true });

      setGrnOptionsMap({});
      detailsArray.replace([getDefaultDetailRow()]);
    },
    [fgItemMap, setValue, detailsArray],
  );

  const applyIndentNo = useCallback(
    async (indentNoValue) => {
      const row = indentRows.find((r) => r.docId === indentNoValue);

      setValue("issueRefDate", isoToDisplay(row?.docDate), {
        shouldDirty: true,
      });
      setValue("scheduleOrderNo", row?.schOrderNo || "", { shouldDirty: true });

      if (!indentNoValue) {
        detailsArray.replace([getDefaultDetailRow()]);
        setGrnOptionsMap({});
        return;
      }

      try {
        const lines = await productionIssueAPI.getIndentDetails(
          effectiveBranchId,
          indentNoValue,
          ORG_ID,
        );

        if (!lines.length) {
          detailsArray.replace([getDefaultDetailRow()]);
          setGrnOptionsMap({});
          return;
        }

        detailsArray.replace(lines.map(mapIndentLine));

        const grnEntries = await Promise.all(
          lines.map(async (line) => {
            const grnList = await productionIssueAPI.getGrnForItem(
              effectiveBranchId,
              line.itemId,
              ORG_ID,
            );
            return [line.itemId, grnList];
          }),
        );

        setGrnOptionsMap(Object.fromEntries(grnEntries));
      } catch (error) {
        console.error("Failed to load indent item details:", error);
        addToast(
          "Failed to load item details for the selected indent",
          "error",
        );
        detailsArray.replace([getDefaultDetailRow()]);
        setGrnOptionsMap({});
      }
    },
    [indentRows, effectiveBranchId, ORG_ID, setValue, detailsArray, addToast],
  );

  /* ===================================================================== */
  /* ROW HANDLERS                                                          */
  /* ===================================================================== */

  const handleAddDetail = () => detailsArray.append(getDefaultDetailRow());

  const handleRemoveDetail = (index) => {
    if (detailsArray.fields.length > 1) detailsArray.remove(index);
  };

  const grnOptionsFor = (index) => {
    const row = watchDetails?.[index];

    const options = (grnOptionsMap[row?.itemId] || []).map((g) => ({
      value: g.docId,
      label: g.docId,
    }));

    return withCurrent(options, row?.grnNo, row?.grnNo);
  };

  const handleGrnChange = (index, grnDocId) => {
    const itemId = getValues(`productionIssueDetails.${index}.itemId`);
    const grnList = grnOptionsMap[itemId] || [];
    const match = grnList.find((g) => g.docId === grnDocId);

    setValue(
      `productionIssueDetails.${index}.grnDate`,
      isoToDisplay(match?.docDate),
      { shouldDirty: true },
    );
  };

  /* ===================================================================== */
  /* AUTO CALCULATION                                                      */
  /* ===================================================================== */

  /*
   * Per row:
   *   Amount        = Issue Qty × Rate
   *   Int. Pend Qty = Int. Req. Qty − Issue Qty   (never below 0)
   * Summary:
   *   Total Value   = sum of all row Amounts
   */
  useEffect(() => {
    const details = watchDetails || [];

    let total = 0;

    details.forEach((row, index) => {
      const issueQty = toNumber(row?.issueQty);
      const rate = toNumber(row?.rate);

      /* Amount */
      const amount = Number((issueQty * rate).toFixed(2));
      total += amount;

      if (String(row?.amount ?? "") !== String(amount)) {
        setValue(`productionIssueDetails.${index}.amount`, amount, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      /* Int. Pend. Qty */
      const req = row?.internalRequiredQty;
      const hasReq = req !== "" && req !== null && req !== undefined;

      const pending = hasReq
        ? Number(Math.max(toNumber(req) - issueQty, 0).toFixed(3))
        : "";

      if (String(row?.internalFundedQty ?? "") !== String(pending)) {
        setValue(`productionIssueDetails.${index}.internalFundedQty`, pending, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    });

    /* Total Value (Summary tab) */
    const totalValue = Number(total.toFixed(2));

    if (toNumber(getValues("totalValue")) !== totalValue) {
      setValue("totalValue", totalValue, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [watchDetails, setValue, getValues]);

  /* ===================================================================== */
  /* VALIDATION & SAVE                                                     */
  /* ===================================================================== */

  const validate = () => {
    const missingFields = [];
    if (!watch("plant")) missingFields.push("Plant ID");
    if (!watch("belongsTo")) missingFields.push("Belongs To");
    if (!watch("date")) missingFields.push("Date");
    if (!watch("fgItemId")) missingFields.push("FG Item ID");
    if (!watch("indentNo")) missingFields.push("Indent No");
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

    const details = getValues("productionIssueDetails") || [];
    const hasValidRow = details.some(
      (row) => row.itemId && parseFloat(row.issueQty) > 0,
    );

    if (!hasValidRow) {
      addToast(
        "At least one detail row with an item and Issue Qty is required",
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

    /* Payload follows the createUpdateProductionIssue schema exactly. */
    const payload = {
      active: true,
      belongsTo: formData.belongsTo || "",
      branch: effectiveBranchId,
      cancel: record?.cancel === true || record?.cancel === "T",
      cancelRemarks: record?.cancelRemarks || "",
      createdBy: (isUpdate ? record?.createdBy : usersId) || "SYSTEM",
      fgItem: toInteger(formData.fgItemId),
      financialYear: record?.financialYear || FIN_YEAR,
      fromLocation: toInteger(formData.fromLocation),
      ...(isUpdate && { id: toInteger(record.id) }),
      indentNo: formData.indentNo || "",
      issueDate: displayToIso(formData.date) || "",
      itemDetails: (formData.productionIssueDetails || [])
        .filter((row) => row.itemId)
        .map((row) => ({
          ...(row.id ? { id: toInteger(row.id) } : {}),
          availableQty: toNumber(row.availableQty),
          grnDate: displayToIso(row.grnDate) || "",
          grnNo: row.grnNo || "",
          intReqQty: toNumber(row.internalRequiredQty),
          issueQty: toNumber(row.issueQty),
          item: toInteger(row.itemId),
          itemMinQty: toNumber(row.itemMinimumQty),
          rate: toNumber(row.rate),
          unit: toInteger(row.unit),
        })),
      narration: formData.narration || "",
      orgId: ORG_ID,
      schOrderNo: formData.scheduleOrderNo || "",
      toLocation: toInteger(formData.toLocation),
      type: formData.type || "",
    };

    console.log("createUpdateProductionIssue payload ->", payload);

    try {
      const response = await productionIssueAPI.createUpdate(payload);

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isUpdate
            ? "Production Issue updated successfully"
            : "Production Issue created successfully",
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
            "Failed to save Production Issue.",
          "error",
        );
      }
    } catch (error) {
      console.error("Save Production Issue Error:", error);
      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Production Issue.",
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
      width: "min-w-[190px]",
    },
    { key: "unitLabel", label: "Unit", width: "min-w-[70px]" },
    {
      key: "availableQty",
      label: "Available Qty",
      width: "min-w-[105px]",
      align: "right",
    },
    { key: "grnNo", label: "GRN No", width: "min-w-[150px]" },
    { key: "grnDate", label: "GRN Date", width: "min-w-[100px]" },
    {
      key: "internalRequiredQty",
      label: "Int. Req. Qty",
      width: "min-w-[105px]",
      align: "right",
    },
    {
      key: "internalFundedQty",
      label: "Int. Pend. Qty",
      width: "min-w-[105px]",
      align: "right",
    },
    {
      key: "issueQty",
      label: "Issue Qty",
      width: "min-w-[100px]",
      align: "right",
    },
    {
      key: "itemMinimumQty",
      label: "Item Min Qty",
      width: "min-w-[105px]",
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
          {isEditMode ? "Edit Production Issue" : "Add Production Issue"}
        </h2>

        {loadingRecord && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Loading...
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Production Issues</SectionHeader>

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
              label="FG Item ID"
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
              name="issueRefDate"
              label="Issue Date"
              errors={errors}
              readOnly
            />

            <InputField
              control={control}
              name="scheduleOrderNo"
              label="Sch. Order No."
              readOnly
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
                Production Issues Details
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
                Production Issues Summary
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
                        name={`productionIssueDetails.${index}.itemCode`}
                        readOnly
                        errors={errors}
                        width={detailColumns[0].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.itemDescription`}
                        readOnly
                        errors={errors}
                        width={detailColumns[1].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.unitLabel`}
                        readOnly
                        errors={errors}
                        width={detailColumns[2].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.availableQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        errors={errors}
                        width={detailColumns[3].width}
                      />

                      <SelectCell
                        control={control}
                        name={`productionIssueDetails.${index}.grnNo`}
                        options={grnOptionsFor(index)}
                        errors={errors}
                        onChange={(v) => handleGrnChange(index, v)}
                        width={detailColumns[4].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.grnDate`}
                        readOnly
                        errors={errors}
                        width={detailColumns[5].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.internalRequiredQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        readOnly
                        errors={errors}
                        width={detailColumns[6].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.internalFundedQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        readOnly
                        errors={errors}
                        width={detailColumns[7].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.issueQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        required
                        errors={errors}
                        width={detailColumns[8].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.itemMinimumQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        errors={errors}
                        width={detailColumns[9].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.rate`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        errors={errors}
                        width={detailColumns[10].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionIssueDetails.${index}.amount`}
                        type="number"
                        align="right"
                        readOnly
                        errors={errors}
                        width={detailColumns[11].width}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  control={control}
                  name="totalValue"
                  label="Total Value"
                  readOnly
                  errors={errors}
                />

                <div className="md:col-span-2">
                  <label className={labelClasses}>Narration</label>
                  <Controller
                    name="narration"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={2}
                        placeholder="Enter narration..."
                        className="w-full px-2 py-1.5 rounded border text-xs leading-tight resize-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                      />
                    )}
                  />
                </div>
              </div>
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

export default ProductionIssueForm;
