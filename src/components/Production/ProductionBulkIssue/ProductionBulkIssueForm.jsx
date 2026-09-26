import { ArrowLeft, Save, X, Plus, Trash2, Calendar } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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

/* API dates are ISO (YYYY-MM-DD); the pickers display DD-MM-YYYY. */
const isoToDisplay = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY") : "";

const displayToIso = (value) => {
  if (!value) return "";
  const [day, month, year] = String(value).split("-");
  if (!day || !month || !year) return "";
  return `${year}-${month}-${day}`;
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

/* ---- table ----
   Natural-width table (no table-fixed / percentage colgroup): each cell
   declares its own min-width via the `width` prop on InputCell, and the
   wrapper scrolls horizontally, so columns never get squeezed. */

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

const getDefaultValues = (record) => ({
  plant: record?.plant?.id ?? record?.plantId ?? "",
  issueNo: record?.docId || record?.issueNo || "",
  belongsTo: record?.belongsTo || "",
  date:
    isoToDisplay(record?.date || record?.docDate) ||
    dayjs().format("DD-MM-YYYY"),
  fgItemId: record?.fgItem?.id ?? record?.fgItemId ?? "",
  fgItemDescription:
    record?.fgItem?.itemDescription || record?.fgItemDescription || "",
  indentNo: record?.indent?.docId || record?.indentNo || "",
  /* Unlike the Indent No cascade in ProductionIssueForm, Issue Date here has
       no source API in the spec — it stays a plain, manual, required date. */
  issueDate: isoToDisplay(record?.issueDate),
  purchaseMaterialRef: record?.purchaseMaterialRef || "",
  type: record?.issueType || "",
  referenceNo: record?.referenceNo || "",
  fromLocation: record?.fromLocation?.id ?? record?.fromLocationId ?? "",
  toLocation: record?.toLocation?.id ?? record?.toLocationId ?? "",
  remarks: record?.remarks || "",
  productionBulkIssueDetails: record?.productionBulkIssueDetailsResponseDTO
    ?.length
    ? record.productionBulkIssueDetailsResponseDTO.map((row) => ({
        id: row.id || 0,
        itemId: row.item?.id ?? row.itemId ?? "",
        itemCode: row.item?.itemCode || row.itemCode || "",
        itemDescription: row.item?.itemDescription || row.itemDescription || "",
        unit: row.unit?.id ?? row.unit ?? "",
        unitLabel: row.unit?.unitId || row.unitDescription || "",
        availableQty: row.availableQty ?? "",
        indentRequiredQty: row.indentReqQty ?? row.indentRequiredQty ?? "",
        indentPendingQty: row.indPendingQty ?? row.indentPendingQty ?? "",
        issueQty: row.issueQty ?? "",
        rate: row.rate ?? "",
        amount: row.amount ?? "",
      }))
    : [getDefaultDetailRow()],
});

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
  const dataLoadedRef = useRef(null);

  /* lookups — plant / belongs-to / location reuse the same source modules
       as MaterialIndentForProductionForm / ProductionIssueForm ("refer
       previous code" in the spec). */
  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  /* FG item cascade */
  const [fgItemOptions, setFgItemOptions] = useState([]);
  const [fgItemMap, setFgItemMap] = useState({});

  /* Indent rows (docId + item/unit/qty) for the selected FG item */
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

  /* Loads the indent rows for whichever FG item is currently selected —
       runs on manual selection and on edit-mode hydration alike, since it
       only feeds the Indent No dropdown and never clears sibling fields. */
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

  const indentNoOptions = indentRows.map((row) => ({
    value: row.docId,
    label: row.docId,
  }));

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
  /* EDIT MODE HYDRATION                                                   */
  /* ===================================================================== */

  useEffect(() => {
    const issueId = record?.id;

    if (!issueId || dataLoadedRef.current === issueId) return;

    dataLoadedRef.current = issueId;

    const load = async () => {
      try {
        const issue = (await productionBulkIssueAPI.getById(issueId)) || record;
        reset(getDefaultValues(issue));
      } catch (error) {
        console.error("Error loading production bulk issue:", error);
        addToast("Failed to load Production (Bulk) Issue data", "error");
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  /* ===================================================================== */
  /* FG ITEM / INDENT CASCADE                                              */
  /* ===================================================================== */

  /* Selecting an FG item only sets its description and clears whatever
       depends on an indent — Indent No options come from the loadIndentRows
       effect above. */
  const applyFgItem = useCallback(
    (fgItemId) => {
      const row = fgItemMap[fgItemId];

      setValue("fgItemDescription", row?.itemDescription || "", {
        shouldDirty: true,
      });
      setValue("indentNo", "", { shouldDirty: true });

      detailsArray.replace([getDefaultDetailRow()]);
    },
    [fgItemMap, setValue, detailsArray],
  );

  /* Selecting an Indent No resolves the single matching indent line
       (item / unit / required qty) and drops it into the (single) detail
       row — the API returns one item+qty per indent, not a breakdown of
       several lines within one indent. */
  const applyIndentNo = useCallback(
    (indentNoValue) => {
      const row = indentRows.find((r) => r.docId === indentNoValue);

      if (!row) {
        detailsArray.replace([getDefaultDetailRow()]);
        return;
      }

      detailsArray.replace([
        {
          id: 0,
          itemId: row.itemId ?? "",
          itemCode: row.itemCode || "",
          itemDescription: row.itemDescription || "",
          unit: row.primaryUnitId ?? "",
          unitLabel: row.primaryUnitCode || row.primaryUnitDescription || "",
          availableQty: "",
          indentRequiredQty:
            row.qtyinprimaryUnit || row.qtyinpurchaseUnit || "",
          indentPendingQty: "",
          issueQty: "",
          rate: "",
          amount: "",
        },
      ]);
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

  /* Ind. Pending Qty = Available Qty - Ind. Req Qty, mirroring the
       backend's BigDecimal subtraction so the grid matches what gets saved. */
  const recalcPending = (index) => {
    const row = getValues(`productionBulkIssueDetails.${index}`);
    const pending =
      (parseFloat(row?.availableQty) || 0) -
      (parseFloat(row?.indentRequiredQty) || 0);
    setValue(
      `productionBulkIssueDetails.${index}.indentPendingQty`,
      pending.toFixed(2),
      {
        shouldDirty: true,
      },
    );
  };

  /* Amount = Issue Qty x Rate, also mirroring the backend calculation. */
  const recalcAmount = (index) => {
    const row = getValues(`productionBulkIssueDetails.${index}`);
    const amount =
      (parseFloat(row?.issueQty) || 0) * (parseFloat(row?.rate) || 0);
    setValue(`productionBulkIssueDetails.${index}.amount`, amount.toFixed(2), {
      shouldDirty: true,
    });
  };

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

    const payload = {
      active: true,
      belongsTo: formData.belongsTo || "",
      branch: effectiveBranchId,
      createdBy: (isUpdate ? record?.createdBy : usersId) || "SYSTEM",
      ...(isUpdate && { updatedBy: usersId || "SYSTEM" }),
      date: displayToIso(formData.date) || "",
      fgItem: toInteger(formData.fgItemId),
      fromLocation: toInteger(formData.fromLocation),
      ...(isUpdate && { id: toInteger(record.id) }),
      indentNo: formData.indentNo || "",
      issueDate: displayToIso(formData.issueDate) || "",
      issueNo: formData.issueNo || "",
      issueType: formData.type || "",
      orgId: ORG_ID,
      plant: toInteger(formData.plant),
      purchaseMaterialRef: formData.purchaseMaterialRef || "",
      referenceNo: formData.referenceNo || "",
      remarks: formData.remarks || "",
      toLocation: toInteger(formData.toLocation),
      productionBulkIssueDetailsDTO: (formData.productionBulkIssueDetails || [])
        .filter((row) => row.itemId)
        .map((row) => ({
          ...(row.id ? { id: toInteger(row.id) } : {}),
          item: toInteger(row.itemId),
          unit: toInteger(row.unit),
          availableQty: toNumber(row.availableQty),
          indReqQty: toNumber(row.indentRequiredQty),
          issueQty: toNumber(row.issueQty),
          rate: toNumber(row.rate),
          amount: toNumber(row.amount),
        })),
    };

    try {
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
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Production (Bulk) Issues</SectionHeader>

          <div className={fieldGrid}>
            <SelectField
              control={control}
              name="plant"
              label="Plant ID"
              options={plantOptions}
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
              options={belongsToOptions}
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
              options={fgItemOptions}
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
              options={TYPE_OPTIONS}
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
              options={locationOptions}
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="toLocation"
              label="To Location"
              options={locationOptions.filter(
                (loc) => String(loc.value) !== String(watchedFromLocation),
              )}
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
                        onChange={() => recalcPending(index)}
                        width={detailColumns[3].width}
                      />

                      <InputCell
                        control={control}
                        name={`productionBulkIssueDetails.${index}.indentRequiredQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        readOnly
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
                        onChange={() => recalcAmount(index)}
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
                        onChange={() => recalcAmount(index)}
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
            disabled={saving || isSubmitting}
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
