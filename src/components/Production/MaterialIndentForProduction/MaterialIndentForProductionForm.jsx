import { ArrowLeft, Save, X, Plus, Trash2, Calendar } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";

import { useToast } from "../../Toast/ToastContext";
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

const subTabFieldGrid =
  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4 items-start";

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

/* ---- table ---- */

const ROW_NUM_WIDTH = "40px";
const ACTION_WIDTH = "64px";

const TableWrapper = ({ children, colWidths }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs table-fixed border-collapse">
      <colgroup>
        <col style={{ width: ROW_NUM_WIDTH }} />
        {colWidths.map((width, i) => (
          <col key={i} style={{ width }} />
        ))}
        <col style={{ width: ACTION_WIDTH }} />
      </colgroup>
      {children}
    </table>
  </div>
);

const TableHead = ({ columns }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      <th className="p-2 text-center text-[10px] font-medium text-gray-700 dark:text-gray-200">
        S.No
      </th>

      {columns.map((col) => (
        <th
          key={col.key}
          className={`p-2 whitespace-nowrap text-[10px] font-medium text-gray-700 dark:text-gray-200 ${
            col.align === "right" ? "text-right" : "text-left"
          }`}
        >
          {col.label}
        </th>
      ))}

      <th className="p-2 text-center text-[10px] font-medium text-gray-700 dark:text-gray-200">
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

const SelectCell = ({ control, name, options, required, errors, disabled }) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className="p-2 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "Required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            value={field.value ?? ""}
            disabled={disabled}
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
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className="p-2 align-top">
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

const YES_NO = ["Yes", "No"];

const getDefaultItemDetailRow = () => ({
  itemId: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  schQty: "",
  stockAvailable: 0,
  requiredQty: "",
});

const getDefaultValues = () => ({
  plantId: "",
  indentNo: "",
  indentDate: dayjs().format("DD-MM-YYYY"),
  department: "",
  scheduleOrderNo: "",
  /* The DTO carries the schedule order as a docId STRING, while the
       select is keyed by fgItemId — both are tracked. */
  schOrderNo: "",
  fgItemId: "",
  fgItemCode: "",
  itemDescription: "",
  belongsTo: "",
  schQty: "",
  scheduledDate: "",
  indentTime: dayjs().format("HH:mm:ss"),
  toLocation: "",
  fromLocation: "",
  approvedBy: "No",
  preparedBy: "",
  authorisedBy: "",
  remarks: "",
  cancelRemarks: "",
  itemDetails: [getDefaultItemDetailRow()],
});

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const MaterialIndentForProductionForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const ORG_ID = toInteger(localStorage.getItem("orgId"));
  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  /* The DTO expects financialYear as a string; the app stores it under
       "finYear", falling back to the calendar year if it isn't set yet. */
  const FIN_YEAR =
    localStorage.getItem("finYear") || String(new Date().getFullYear());

  const isEditMode = Boolean(data?.id);

  const [activeTab, setActiveTab] = useState("itemDetails");
  const [saving, setSaving] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const dataLoadedRef = useRef(null);

  /* lookups */
  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  /* FG/SFG header rows keyed by fgItemId — drives Sch. Order No,
       FG Item Code, Item Description and Scheduled Date together. */
  const [fgRows, setFgRows] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const itemDetailsArray = useFieldArray({ control, name: "itemDetails" });

  const watchedPlant = watch("plantId");
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

  const loadDepartments = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const list = await materialIndentForProductionAPI.getDepartments(ORG_ID);

      /* departmentName comes back null for some records, so fall back
               to departmentCode rather than rendering a blank option. */
      setDepartmentOptions(
        list.map((d) => ({
          value: d.id,
          label: d.departmentName || d.departmentCode || `Dept ${d.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
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

  const loadUnits = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const list = await materialIndentForProductionAPI.getUnits(ORG_ID);

      setUnitOptions(
        list.map((u) => ({
          value: u.id,
          label: u.unitId,
        })),
      );
    } catch (error) {
      console.error("Failed to load units:", error);
      setUnitOptions([]);
    }
  }, [ORG_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const list = await materialIndentForProductionAPI.getEmployees(ORG_ID);

      setEmployeeOptions(
        list.map((e) => ({
          value: e.id,
          label: e.employeeName || e.employeeId || `Employee ${e.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
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

  const loadFgRows = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) return;

      const list = await materialIndentForProductionAPI.getFgAndSfgItemDetails(
        effectiveBranchId,
        ORG_ID,
      );

      setFgRows(list);
    } catch (error) {
      console.error("Failed to load FG/SFG rows:", error);
      setFgRows([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  useEffect(() => {
    loadPlants();
    loadDepartments();
    loadBelongsTo();
    loadUnits();
    loadEmployees();
  }, [loadPlants, loadDepartments, loadBelongsTo, loadUnits, loadEmployees]);

  useEffect(() => {
    loadLocations();
    loadFgRows();
  }, [loadLocations, loadFgRows]);

  /* ===================================================================== */
  /* DOCUMENT NUMBER                                                       */
  /* ===================================================================== */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generate = async () => {
      setGeneratingDocId(true);

      try {
        const docId =
          await materialIndentForProductionAPI.getMaterialIndentDocId({
            financialYear: FIN_YEAR,
            orgId: ORG_ID,
          });

        if (!cancelled) setValue("indentNo", docId || "");
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating indent doc id:", error);
          addToast("Failed to generate Indent No.", "error");
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
    const indentId = data?.id;

    if (!indentId || dataLoadedRef.current === indentId) return;

    dataLoadedRef.current = indentId;

    const load = async () => {
      try {
        const indent =
          (await materialIndentForProductionAPI.getMaterialIndentById(
            indentId,
          )) || data;

        reset({
          ...getDefaultValues(),
          plantId: indent.branch?.id ?? indent.branch ?? indent.plant ?? "",
          indentNo: indent.docId || indent.indentNo || "",
          indentDate: isoToDisplay(indent.docDate || indent.indentDate),
          department: indent.department?.id ?? indent.department ?? "",
          schOrderNo: indent.schOrderNo || "",
          /* The select is keyed by fgItemId, so drive it from fgItem. */
          scheduleOrderNo: indent.fgItem?.id ?? indent.fgItem ?? "",
          fgItemId: indent.fgItem?.id ?? indent.fgItem ?? "",
          fgItemCode: indent.fgItem?.itemCode || indent.fgItemCode || "",
          itemDescription: indent.itemDescription || "",
          belongsTo: indent.belongsTo || "",
          schQty: indent.schQty ?? "",
          scheduledDate: isoToDisplay(indent.scheduledDate),
          indentTime: indent.indentTime || dayjs().format("HH:mm:ss"),
          toLocation: indent.toLocation?.id ?? indent.toLocation ?? "",
          fromLocation: indent.fromLocation?.id ?? indent.fromLocation ?? "",
          approvedBy: indent.approvedBy || "No",
          preparedBy: indent.preparedBy?.id ?? indent.preparedBy ?? "",
          authorisedBy: indent.authorisedBy?.id ?? indent.authorisedBy ?? "",
          remarks: indent.remarks || "",
          cancelRemarks: indent.cancelRemarks || "",
          itemDetails: indent.materialIndentForProductionDetailsDTO?.length
            ? indent.materialIndentForProductionDetailsDTO.map((row) => ({
                itemId: row.item?.id ?? row.item ?? row.itemId ?? "",
                itemCode: row.item?.itemCode || row.itemCode || "",
                itemDescription:
                  row.item?.itemDescription || row.itemDescription || "",
                unit: row.unit?.id ?? row.unit ?? "",
                schQty: row.schQty ?? "",
                stockAvailable: row.stockAvailable ?? 0,
                requiredQty: row.requiredQty ?? "",
              }))
            : [getDefaultItemDetailRow()],
        });
      } catch (error) {
        console.error("Error loading material indent:", error);
        addToast("Failed to load Material Indent data", "error");
      }
    };

    load();
  }, [data, reset, addToast]);

  /* ===================================================================== */
  /* FG / SFG CASCADE                                                      */
  /* ===================================================================== */

  /* One FG row feeds four header fields plus the whole item grid, so
       selecting from either Sch. Order No or FG Item Code resolves the
       same row and applies it consistently. */
  const applyFgRow = useCallback(
    async (fgItemId) => {
      const row = fgRows.find((r) => String(r.fgItemId) === String(fgItemId));

      if (!row) {
        setValue("fgItemId", "");
        setValue("scheduleOrderNo", "");
        setValue("schOrderNo", "");
        setValue("fgItemCode", "");
        setValue("itemDescription", "");
        setValue("scheduledDate", "");
        itemDetailsArray.replace([getDefaultItemDetailRow()]);
        return;
      }

      setValue("fgItemId", row.fgItemId, { shouldDirty: true });
      setValue("scheduleOrderNo", row.fgItemId, { shouldDirty: true });
      /* DTO wants the schedule order as its docId string, not the id. */
      setValue("schOrderNo", row.docId || "", { shouldDirty: true });
      setValue("fgItemCode", row.itemCode || "", { shouldDirty: true });
      setValue("itemDescription", row.itemDescription || "", {
        shouldDirty: true,
      });
      setValue("scheduledDate", isoToDisplay(row.docDate), {
        shouldDirty: true,
      });

      /* Pull the detail lines for this FG item. */
      try {
        const lines =
          await materialIndentForProductionAPI.getFgAndSfgItemDetailLines(
            effectiveBranchId,
            row.fgItemId,
            ORG_ID,
          );

        if (!lines.length) {
          itemDetailsArray.replace([getDefaultItemDetailRow()]);
          return;
        }

        itemDetailsArray.replace(
          lines.map((line) => ({
            itemId: line.itemId ?? "",
            itemCode: line.itemCode || "",
            itemDescription: line.itemDescription || "",
            unit: "",
            schQty: line.qty ?? "",
            stockAvailable: 0,
            requiredQty: "",
          })),
        );
      } catch (error) {
        console.error("Failed to load item detail lines:", error);
        addToast("Failed to load item details", "error");
        itemDetailsArray.replace([getDefaultItemDetailRow()]);
      }
    },
    [fgRows, effectiveBranchId, ORG_ID, setValue, itemDetailsArray, addToast],
  );

  const scheduleOrderOptions = fgRows.map((row) => ({
    value: row.fgItemId,
    label: row.docId || `FG ${row.fgItemId}`,
  }));

  const fgItemOptions = fgRows.map((row) => ({
    value: row.fgItemId,
    label: row.itemCode || `Item ${row.fgItemId}`,
  }));

  /* ===================================================================== */
  /* ROW HANDLERS                                                          */
  /* ===================================================================== */

  const handleAddItemDetail = () =>
    itemDetailsArray.append(getDefaultItemDetailRow());

  const handleRemoveItemDetail = (index) => {
    if (itemDetailsArray.fields.length > 1) itemDetailsArray.remove(index);
  };

  /* ===================================================================== */
  /* SAVE                                                                  */
  /* ===================================================================== */

  const onSubmit = async (formData) => {
    setSaving(true);

    try {
      const payload = {
        ...(isEditMode && { id: toInteger(data.id) }),

        active: true,
        orgId: ORG_ID,
        branch: effectiveBranchId,

        plant: toInteger(formData.plantId),
        indentNo: formData.indentNo || "",
        indentDate: displayToIso(formData.indentDate),
        indentTime: formData.indentTime || "",
        department: toInteger(formData.department),
        financialYear: FIN_YEAR,
        scheduleOrder: toInteger(formData.scheduleOrderNo),
        fgItem: toInteger(formData.fgItemId),
        itemDescription: formData.itemDescription || "",
        belongsTo: formData.belongsTo || "",
        schQty: toNumber(formData.schQty),
        scheduledDate: displayToIso(formData.scheduledDate),

        toLocation: toInteger(formData.toLocation),
        fromLocation: toInteger(formData.fromLocation),

        approvedByPM: formData.approvedByPM === "Yes" ? 1 : 0,
        preparedBy: toInteger(formData.preparedBy),
        authorisedBy: toInteger(formData.authorisedBy),
        remarks: formData.remarks || "",

        itemDetails: (formData.itemDetails || [])
          .filter((row) => row.itemId || row.itemCode)
          .map((row) => ({
            item: toInteger(row.itemId),
            schQty: toNumber(row.schQty),
            stockAvailable: toNumber(row.stockAvailable),
            requiredQty: toNumber(row.requiredQty),
            unit: toInteger(row.unit),
          })),

        createdBy: (isEditMode ? data?.createdBy : usersId) || "SYSTEM",
        ...(isEditMode && { updatedBy: usersId || "SYSTEM" }),
      };

      if (!payload.itemDetails.length) {
        addToast("Please add at least one item", "error");
        setSaving(false);
        return;
      }

      console.log("Material Indent Payload:", payload);

      const response =
        await materialIndentForProductionAPI.createUpdateMaterialIndent(
          payload,
        );

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isEditMode
            ? "Material Indent updated successfully"
            : "Material Indent created successfully",
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
            "Failed to save Material Indent",
          "error",
        );
      }
    } catch (error) {
      console.error("Save Material Indent Error:", error);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Material Indent.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================================== */
  /* RENDER                                                                */
  /* ===================================================================== */

  const itemColumns = [
    { key: "itemCode", label: "Item Code", width: "16%" },
    { key: "itemDescription", label: "Item Description", width: "28%" },
    { key: "unit", label: "Unit", width: "14%" },
    { key: "schQty", label: "Sch. Qty", width: "14%", align: "right" },
    {
      key: "stockAvailable",
      label: "Stock Available",
      width: "14%",
      align: "right",
    },
    { key: "requiredQty", label: "Required Qty", width: "14%", align: "right" },
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
          {isEditMode ? "Edit Material Indent" : "Add Material Indent"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Material Indent For Production</SectionHeader>

          <div className={fieldGrid}>
            <SelectField
              control={control}
              name="plantId"
              label="Plant Id"
              options={plantOptions}
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="indentNo"
              label="Indent No."
              placeholder={generatingDocId ? "Generating..." : "Auto"}
              readOnly
              errors={errors}
            />

            <DatePickerField
              control={control}
              name="indentDate"
              label="Indent Date"
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="department"
              label="Department"
              options={departmentOptions}
              errors={errors}
            />

            <SelectField
              control={control}
              name="scheduleOrderNo"
              label="Sch. Order No."
              options={scheduleOrderOptions}
              errors={errors}
              onChange={applyFgRow}
            />

            <SelectField
              control={control}
              name="belongsTo"
              label="Belongs To"
              options={belongsToOptions}
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="fgItemId"
              label="FG/SFG Item Code"
              options={fgItemOptions}
              required
              errors={errors}
              onChange={applyFgRow}
            />

            <InputField
              control={control}
              name="itemDescription"
              label="Item Description"
              readOnly
              errors={errors}
            />

            <InputField
              control={control}
              name="schQty"
              label="Sch Qty"
              type="number"
              step="0.001"
              placeholder="0.000"
              errors={errors}
            />

            <DatePickerField
              control={control}
              name="scheduledDate"
              label="Scheduled Date"
              required
              errors={errors}
              readOnly
            />

            <InputField
              control={control}
              name="indentTime"
              label="Indent Time"
              type="time"
              errors={errors}
            />

            <SelectField
              control={control}
              name="toLocation"
              label="To Location"
              options={locationOptions}
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="fromLocation"
              label="From Location"
              options={locationOptions}
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
                onClick={() => setActiveTab("itemDetails")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "itemDetails"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Item Details
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("materialSummary")}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${
                  activeTab === "materialSummary"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Material Summary
              </button>
            </div>

            {activeTab === "itemDetails" && (
              <button
                type="button"
                onClick={handleAddItemDetail}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeTab === "itemDetails" && (
            <div className="pt-3">
              <TableWrapper colWidths={itemColumns.map((c) => c.width)}>
                <TableHead columns={itemColumns} />
                <tbody>
                  {itemDetailsArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemoveItemDetail(index)}
                      disabled={itemDetailsArray.fields.length <= 1}
                    >
                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.itemCode`}
                        readOnly
                        errors={errors}
                      />

                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.itemDescription`}
                        readOnly
                        errors={errors}
                      />

                      <SelectCell
                        control={control}
                        name={`itemDetails.${index}.unit`}
                        options={unitOptions}
                        errors={errors}
                      />

                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.schQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        readOnly
                        errors={errors}
                      />

                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.stockAvailable`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        errors={errors}
                      />

                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.requiredQty`}
                        type="number"
                        step="0.001"
                        align="right"
                        placeholder="0.000"
                        errors={errors}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {activeTab === "materialSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <SelectField
                  control={control}
                  name="approvedByPM"
                  label="Approved By PM"
                  options={YES_NO}
                  required
                  errors={errors}
                />

                <SelectField
                  control={control}
                  name="preparedBy"
                  label="Prepared By"
                  options={employeeOptions}
                  required
                  errors={errors}
                />

                <SelectField
                  control={control}
                  name="authorisedBy"
                  label="Authorised By"
                  options={employeeOptions}
                  required
                  errors={errors}
                />

                <div className="col-span-1 md:col-span-2 xl:col-span-3">
                  <InputField
                    control={control}
                    name="remarks"
                    label="Remarks"
                    placeholder="Enter remarks..."
                    errors={errors}
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

export default MaterialIndentForProductionForm;
