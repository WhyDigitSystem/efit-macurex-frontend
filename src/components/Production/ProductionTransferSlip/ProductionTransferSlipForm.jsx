import { ArrowLeft, Save, X, Plus, Trash2, Calendar } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";

import { useToast } from "../../Toast/ToastContext";
import productionTransferSlipAPI from "../../../api/Production/productionTransferSlipAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";

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

const subTabFieldGrid =
  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4 items-start";

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const getNestedError = (errors, name) => {
  const parts = name.split(".");
  let error = errors;

  for (const part of parts) {
    if (error && error[part]) {
      error = error[part];
    } else {
      return null;
    }
  }

  return error?.message;
};

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
  const errorMessage = getNestedError(errors, name);

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                required: `${label} is required`,
              }
            : undefined
        }
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            } ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
          />
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
  required = false,
  errors,
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const errorMessage = getNestedError(errors, name);

  const getCalendarDays = (month) => {
    const startOfMonth = month.startOf("month");
    const endOfMonth = month.endOf("month");

    const startDay = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(month.date(i));
    }

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
        rules={
          required
            ? {
                required: `${label} is required`,
              }
            : undefined
        }
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
                  readOnly
                  placeholder="DD-MM-YYYY"
                  onClick={() => setOpen(!open)}
                  className={`${controlClasses} cursor-pointer pr-8 ${
                    errorMessage ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />

                <Calendar
                  size={15}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>

              {open && (
                <div className="absolute z-50 mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(currentMonth.subtract(1, "month"))
                      }
                      className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      ‹
                    </button>

                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {currentMonth.format("MMMM YYYY")}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth(currentMonth.add(1, "month"))
                      }
                      className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
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
                      if (!date) {
                        return <div key={index} className="h-8" />;
                      }

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
                          className={`h-8 w-8 rounded-full text-xs flex items-center justify-center transition-colors ${
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
  const errorMessage = getNestedError(errors, name);

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                required: `${label} is required`,
              }
            : undefined
        }
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }`}
            onChange={(e) => {
              field.onChange(e);

              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>

            {options.map((opt) => (
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
          className={`p-2 whitespace-nowrap ${
            i === 0
              ? "w-8 text-center"
              : i === headers.length - 1
                ? "w-20 text-left"
                : "text-left"
          } text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({
  children,
  index,
  onRemove,
  disabled,
  showDelete = true,
}) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>

    {children}

    {showDelete && (
      <td className="p-2 text-center">
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
    )}
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
  placeholder = "-- Select --",
}) => {
  const errorMessage = getNestedError(errors, name);

  return (
    <td className="p-2 align-top min-w-[120px]">
      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                required: "This field is required",
              }
            : undefined
        }
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }`}
            onChange={(e) => {
              field.onChange(e);

              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>

            {options.map((opt) => (
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
  disabled,
  readOnly,
  onChange,
}) => {
  const errorMessage = getNestedError(errors, name);

  return (
    <td className="p-2 align-top min-w-[100px]">
      <Controller
        name={name}
        control={control}
        rules={
          required
            ? {
                required: "This field is required",
              }
            : undefined
        }
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${
              align === "right" ? "text-right" : ""
            } ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${
              readOnly ? "bg-gray-50 dark:bg-gray-800" : ""
            }`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
              field.onChange(e);

              if (onChange) {
                onChange(e);
              }
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

// ============================================================================
// CONSTANTS
// ============================================================================

const BELONGS_TO = ["Appliances", "Bosch", "Electronics", "Automotive"];

const YES_NO = ["Yes", "No"];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const fmtDate = (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "");

const toNum = (value) => {
  const number = parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const getDefaultInputBOMRow = () => ({
  inputItemCode: "",
  inputItemDesc: "",
  itemType: "",
  stock: "",
  bomQty: "",
  inputQty: 0,
  rate: "",
  value: 0,
  primaryUnit: "",
  scrapId: "",
  scrapQty: "",
  scrapTotal: 0,
  lcoequal: false,
});

const getDefaultValues = () => ({
  plantId: "",
  issueNo: "",
  belongsTo: "",
  issueDate: dayjs().format("DD-MM-YYYY"),

  fromLocation: "",
  toLocation: "",
  scrapToLocation: "",

  fgPartNo: "",
  sfgPartNo: "",
  sfgDescription: "",

  scheduleOrderNo: "",
  bomId: "",
  schDates: "",

  alterInputItem: "No",

  issueQty: "",
  rate: "",
  itemType: "",
  unit: "",
  value: "",

  totalValue: 0,
  remarks: "",

  inputBOM: [getDefaultInputBOMRow()],
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProductionTransferSlipForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);

  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);

  const usersId = localStorage.getItem("usersId");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();

  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeTab, setActiveTab] = useState("inputBOM");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const dataLoadedRef = useRef(false);

  // ==========================================================================
  // LOOKUP DATA
  // ==========================================================================

  const [plantOptions, setPlantOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  const [itemMap, setItemMap] = useState({});

  const [unitOptions, setUnitOptions] = useState([]);

  const [locationOptions, setLocationOptions] = useState([]);

  const [fgOptions, setFgOptions] = useState([]);

  const [sfgOptions, setSfgOptions] = useState([]);

  const [sfgMap, setSfgMap] = useState({});

  const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);

  const [bomOptions, setBomOptions] = useState([]);

  const [scrapOptions, setScrapOptions] = useState([]);

  const [schDateOptions, setSchDateOptions] = useState([]);

  const [financialYear, setFinancialYear] = useState("");

  const issueNoGeneratedRef = useRef(false);

  // ==========================================================================
  // FORM
  // ==========================================================================

  const defaults = useCallback(() => {
    const base = getDefaultValues();

    if (data) {
      base.plantId = data.branch?.id ?? data.plant?.id ?? data.plantId ?? "";

      base.issueNo = data.issueNo || data.docId || "";

      base.belongsTo = data.belongsTo || "";

      base.issueDate = fmtDate(data.issueDate || data.docDate);

      base.fromLocation = data.fromLocation?.id ?? data.fromLocation ?? "";

      base.toLocation = data.toLocation?.id ?? data.toLocation ?? "";

      base.scrapToLocation =
        data.scrapToLocation?.id ?? data.scrapToLocation ?? "";

      base.fgPartNo = data.fgPartNo || data.fgItem?.id || "";

      base.sfgPartNo = data.sfgPartNo || data.sfgItem?.id || "";

      base.sfgDescription = data.sfgDescription || "";

      base.scheduleOrderNo =
        data.schOrderNo ?? data.scheduleOrder?.id ?? data.scheduleOrderNo ?? "";

      base.bomId = data.bom || data.bomId || "";

      base.schDates = data.schDates || "";

      base.alterInputItem =
        data.alterInputItem === true
          ? "Yes"
          : data.alterInputItem === false
            ? "No"
            : data.alterInputItem || "No";

      base.issueQty = data.issueQty || "";

      base.rate = data.rate || "";

      base.itemType = data.itemType || "";

      base.unit = data.unit || "";

      base.value = data.value || "";

      base.totalValue = data.totalValue || 0;

      base.remarks = data.remarks || "";

      base.inputBOM = data.inputBOM?.length
        ? data.inputBOM
        : [getDefaultInputBOMRow()];
    }

    return base;
  }, [data]);

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
    defaultValues: defaults(),
  });

  useEffect(() => {
    reset(defaults());
  }, [data, defaults, reset]);

  const inputBOMArray = useFieldArray({
    control,
    name: "inputBOM",
  });

  const watchInputBOM = watch("inputBOM");

  const alterInputItem = watch("alterInputItem");

  const issueQty = watch("issueQty");

  const canAlterRows = alterInputItem === "Yes";

  // ==========================================================================
  // LOAD EDIT DATA
  // ==========================================================================

  const loadTransferSlipData = useCallback(
    async (slipId) => {
      if (!slipId) return;

      setLoading(true);

      try {
        const response = await productionTransferSlipAPI.getById(slipId);

        console.log("Production Transfer Slip Data:", response);

        if (!response) {
          addToast("Failed to load Production Transfer Slip data", "error");
          return;
        }

        const slip = response;

        setValue("plantId", slip.branch?.id || slip.plant?.id || "");

        setValue("issueNo", slip.docId || "");

        setValue("belongsTo", slip.belongsTo || "");

        setValue(
          "issueDate",
          slip.docDate ? dayjs(slip.docDate).format("DD-MM-YYYY") : "",
        );

        setValue("fromLocation", slip.fromLocation?.id || "");

        setValue("toLocation", slip.toLocation?.id || "");

        setValue("scrapToLocation", slip.scrapToLocation?.id || "");

        setValue("fgPartNo", slip.fgPartNo || slip.fgItem?.id || "");

        setValue("sfgPartNo", slip.sfgPartNo || slip.sfgItem?.id || "");

        setValue("sfgDescription", slip.sfgDescription || "");

        setValue(
          "scheduleOrderNo",
          slip.schOrderNo || slip.scheduleOrder?.id || "",
        );

        setValue("bomId", slip.bom || slip.bomId || "");

        setValue("schDates", slip.schDates || "");

        setValue("alterInputItem", slip.alterInputItem ? "Yes" : "No");

        setValue("issueQty", slip.issueQty || "");

        setValue("rate", slip.rate || "");

        setValue("itemType", slip.itemType || "");

        setValue("unit", slip.unit || "");

        setValue("value", slip.value || "");

        setValue("totalValue", slip.totalValue || 0);

        setValue("remarks", slip.remarks || "");

        setFinancialYear(slip.financialYear || "");

        if (slip.inputBOM?.length > 0) {
          inputBOMArray.replace(slip.inputBOM);
        }

        const fgItem = slip.fgPartNo || slip.fgItem?.id;

        const sfgItem = slip.sfgPartNo || slip.sfgItem?.id;

        if (fgItem && sfgItem) {
          await loadSchAndBomOptions(fgItem, sfgItem);
        }

        addToast("Production Transfer Slip loaded successfully", "success");
      } catch (error) {
        console.error("Error loading production transfer slip:", error);

        addToast("Failed to load Production Transfer Slip data", "error");
      } finally {
        setLoading(false);
      }
    },
    [setValue, inputBOMArray, addToast],
  );

  useEffect(() => {
    const slipId = data?.id;

    if (!slipId) return;

    if (dataLoadedRef.current === slipId) {
      return;
    }

    dataLoadedRef.current = slipId;

    loadTransferSlipData(slipId);
  }, [data?.id, loadTransferSlipData]);

  // ==========================================================================
  // FINANCIAL YEAR / ISSUE NO
  // ==========================================================================

  const getCurrentFinancialYear = () => {
    const today = dayjs();

    return String(today.month() >= 3 ? today.year() : today.year() - 1);
  };

  const generateIssueNo = useCallback(async () => {
    if (!orgId) {
      console.warn("Cannot generate PTS Issue No: orgId is missing");
      return;
    }

    try {
      let finYear = "";

      if (branch) {
        try {
          const mappingRes =
            await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
              orgId,
              branch,
            );

          const mappings = Array.isArray(mappingRes)
            ? mappingRes
            : mappingRes
              ? [mappingRes]
              : [];

          const details = mappings.flatMap((mapping) => {
            if (Array.isArray(mapping?.documentTypeMappingDetails)) {
              return mapping.documentTypeMappingDetails;
            }

            if (Array.isArray(mapping?.documentTypeMappingDetailsVO)) {
              return mapping.documentTypeMappingDetailsVO;
            }

            if (Array.isArray(mapping?.details)) {
              return mapping.details;
            }

            return [];
          });

          const ptsEntry = details.find(
            (item) =>
              String(item?.screenCode ?? item?.screen ?? item?.screenName ?? "")
                .trim()
                .toUpperCase() === "PTS",
          );

          if (ptsEntry) {
            finYear =
              ptsEntry?.finYear ??
              ptsEntry?.financialYear ??
              ptsEntry?.financialyear ??
              "";
          }
        } catch (mappingError) {
          console.warn(
            "Unable to fetch PTS document type mapping. Using fallback.",
            mappingError,
          );
        }
      }

      if (!finYear) {
        finYear =
          localStorage.getItem("financialYear") ||
          localStorage.getItem("finYear") ||
          "";
      }

      if (!finYear) {
        finYear = getCurrentFinancialYear();
      }

      finYear = String(finYear).trim();

      console.log("Final Financial Year:", finYear);

      const docId =
        await productionTransferSlipAPI.getProductionTransferSlipDocId(
          finYear,
          orgId,
        );

      console.log("Generated PTS Doc ID:", docId);

      if (docId) {
        setValue("issueNo", String(docId), {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });

        setFinancialYear(finYear);
      }
    } catch (error) {
      console.error(
        "Failed to auto-generate Production Transfer Slip Issue No:",
        error,
      );
    }
  }, [orgId, branch, setValue]);

  useEffect(() => {
    if (!data && orgId && !issueNoGeneratedRef.current) {
      issueNoGeneratedRef.current = true;

      generateIssueNo();
    }
  }, [data, orgId, generateIssueNo]);

  // ==========================================================================
  // LOAD PLANTS
  // ==========================================================================

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);

        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);

        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);

      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  // ==========================================================================
  // LOAD ITEMS
  // ==========================================================================

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);

      const map = {};

      const options = (res || []).map((item) => {
        map[item.id] = item;

        return {
          value: item.id,
          label: item.itemCode,
        };
      });

      setItemOptions(options);

      setItemMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);

      setItemOptions([]);
      setItemMap({});
    }
  }, [orgId, branch]);

  // ==========================================================================
  // LOAD UNITS
  // ==========================================================================

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branch, orgId);

      setUnitOptions(
        (res || []).map((unit) => ({
          value: unit.id,
          label: unit.unitId,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);

      setUnitOptions([]);
    }
  }, [orgId, branch]);

  // ==========================================================================
  // LOAD LOCATIONS
  // ==========================================================================

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(
        orgId,
        branch,
      );

      setLocationOptions(
        (res || []).map((location) => ({
          value: location.id,
          label: location.locationName || location.locationCode || location.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);

      setLocationOptions([]);
    }
  }, [orgId, branch]);

  // ==========================================================================
  // LOAD FG
  // ==========================================================================

  const loadFgPartNo = useCallback(async () => {
    try {
      const res = await productionTransferSlipAPI.getFgPartNoDetails(
        branch,
        orgId,
      );

      setFgOptions(
        (res || []).map((item) => ({
          value: item.itemId,
          label: item.itemCode,
        })),
      );
    } catch (error) {
      console.error("Failed to load FG part options:", error);

      setFgOptions([]);
    }
  }, [orgId, branch]);

  // ==========================================================================
  // LOAD SFG
  // ==========================================================================

  const loadSfgPartNo = useCallback(async () => {
    try {
      const res = await productionTransferSlipAPI.getSfgPartNoDetails(
        branch,
        orgId,
      );

      const map = {};

      const options = (res || []).map((item) => {
        map[item.itemId] = item;

        return {
          value: item.itemId,
          label: item.itemCode,
        };
      });

      setSfgOptions(options);

      setSfgMap(map);
    } catch (error) {
      console.error("Failed to load SFG part options:", error);

      setSfgOptions([]);
      setSfgMap({});
    }
  }, [orgId, branch]);

  // ==========================================================================
  // LOAD SCRAP ID
  // ==========================================================================

  const loadScrapOptions = useCallback(async () => {
    try {
      const res = await productionTransferSlipAPI.getListValuesGroup(
        "SCRAP ID",
        orgId,
      );

      setScrapOptions(
        (res || []).map((scrap) => ({
          value: scrap.id,
          label: scrap.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load scrap options:", error);

      setScrapOptions([]);
    }
  }, [orgId]);

  // ==========================================================================
  // LOAD SCH ORDER / SCH DATE / BOM
  // ==========================================================================

  const loadSchAndBomOptions = useCallback(
    async (fgItem, sfgItem) => {
      if (!fgItem || !sfgItem) {
        setScheduleOrderOptions([]);

        setSchDateOptions([]);

        setBomOptions([]);

        return;
      }

      try {
        const [schRes, bomRes] = await Promise.all([
          productionTransferSlipAPI.getSchNoFromTransferSlip(
            branch,
            fgItem,
            orgId,
            sfgItem,
          ),

          productionTransferSlipAPI.getBomNoFromTransferSlip(
            branch,
            fgItem,
            orgId,
            sfgItem,
          ),
        ]);

        console.log("Sch Order API Result:", schRes);

        console.log("BOM API Result:", bomRes);

        // ================================================================
        // SCH ORDER NO
        // API response is extracted from:
        // paramObjectsMap.mapp
        //
        // [
        //   {
        //     docId: "BLR/PSO/26-27/00007",
        //     docDate: "2026-09-15"
        //   }
        // ]
        // ================================================================

        const schOptions = (schRes || [])
          .filter((item) => item?.docId)
          .map((item) => ({
            value: item.docId,
            label: item.docId,
          }));

        setScheduleOrderOptions(schOptions);

        // ================================================================
        // SCH. DATES
        // Uses docDate from the same API response.
        // ================================================================

        const dateOptions = (schRes || [])
          .filter((item) => item?.docDate)
          .map((item) => ({
            value: item.docDate,

            label: dayjs(item.docDate).format("DD-MM-YYYY"),
          }));

        setSchDateOptions(dateOptions);

        // ================================================================
        // BOM
        // ================================================================

        const bomOptionsList = (bomRes || [])
          .filter((item) => item?.bomId)
          .map((item) => ({
            value: item.bomId,

            label: item.docId || item.bomId,
          }));

        setBomOptions(bomOptionsList);
      } catch (error) {
        console.error(
          "Failed to load Sch Order No / Sch Dates / BOM options:",
          error,
        );

        setScheduleOrderOptions([]);

        setSchDateOptions([]);

        setBomOptions([]);
      }
    },
    [branch, orgId],
  );

  // ==========================================================================
  // INITIAL LOAD
  // ==========================================================================

  useEffect(() => {
    if (!orgId) return;

    loadPlants();
    loadItems();
    loadUnits();
    loadLocations();
    loadFgPartNo();
    loadSfgPartNo();
    loadScrapOptions();
  }, [
    orgId,
    loadPlants,
    loadItems,
    loadUnits,
    loadLocations,
    loadFgPartNo,
    loadSfgPartNo,
    loadScrapOptions,
  ]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleAddRow = () => {
    inputBOMArray.append(getDefaultInputBOMRow());
  };

  const handleRemoveRow = (index) => {
    if (inputBOMArray.fields.length > 1) {
      inputBOMArray.remove(index);
    }
  };

  // ==========================================================================
  // FG CHANGE
  // ==========================================================================

  const handleFgChange = (value) => {
    setValue("scheduleOrderNo", "", {
      shouldDirty: true,
    });

    setValue("schDates", "", {
      shouldDirty: true,
    });

    setValue("bomId", "", {
      shouldDirty: true,
    });

    loadSchAndBomOptions(value, getValues("sfgPartNo"));
  };

  // ==========================================================================
  // SFG CHANGE
  // ==========================================================================

  const handleSfgChange = (value) => {
    const item = sfgMap[value];

    setValue("sfgDescription", item?.itemDescription || "", {
      shouldDirty: true,
    });

    setValue("scheduleOrderNo", "", {
      shouldDirty: true,
    });

    setValue("schDates", "", {
      shouldDirty: true,
    });

    setValue("bomId", "", {
      shouldDirty: true,
    });

    loadSchAndBomOptions(getValues("fgPartNo"), value);
  };

  // ==========================================================================
  // BOM CHANGE
  // ==========================================================================

  const handleBomChange = async (bomId) => {
    if (!bomId) {
      inputBOMArray.replace([getDefaultInputBOMRow()]);

      setValue("totalValue", 0);

      return;
    }

    try {
      const details =
        await productionTransferSlipAPI.getBomNoFromTransferSlipDetails(
          bomId,
          branch,
          orgId,
        );

      console.log("BOM Details:", details);

      const currentIssueQty = toNum(getValues("issueQty"));

      const rows = (details || []).map((detail) => {
        // ============================================================
        // BOM QTY
        // Comes from BOM API qty
        // ============================================================

        const bomQty = toNum(detail.qty);

        // ============================================================
        // INPUT QTY
        // Issue Qty × BOM Qty
        // ============================================================

        const inputQty = Number((currentIssueQty * bomQty).toFixed(3));

        const item = itemMap[detail.itemId];

        return {
          inputItemCode: detail.itemId ?? "",

          inputItemDesc: detail.itemDescription || item?.itemDescription || "",

          itemType: detail.itemType || item?.itemType || "",

          // User enters
          stock: "",

          // BOM API
          bomQty,

          // Calculated
          inputQty,

          // User enters
          rate: "",

          // Calculated
          value: 0,

          // Unit Master / Item Primary Unit
          primaryUnit: item?.primaryUnits?.id || detail.primaryUnit || "",

          // Scrap ID master
          scrapId: "",

          // User enters
          scrapQty: "",

          // Calculated
          scrapTotal: 0,

          lcoequal: false,
        };
      });

      inputBOMArray.replace(rows.length ? rows : [getDefaultInputBOMRow()]);

      setValue("totalValue", 0);
    } catch (error) {
      console.error("Failed to load BOM details:", error);

      addToast("Failed to load BOM details", "error");
    }
  };

  // ==========================================================================
  // INPUT ITEM CHANGE
  // ==========================================================================

  const handleInputItemChange = (index, value) => {
    const item = itemMap[value];

    setValue(`inputBOM.${index}.inputItemCode`, value, {
      shouldDirty: true,
    });

    setValue(`inputBOM.${index}.inputItemDesc`, item?.itemDescription || "", {
      shouldDirty: true,
    });

    setValue(`inputBOM.${index}.primaryUnit`, item?.primaryUnits?.id || "", {
      shouldDirty: true,
    });

    setValue(`inputBOM.${index}.itemType`, item?.itemType || "", {
      shouldDirty: true,
    });
  };

  // ==========================================================================
  // CALCULATIONS
  // ==========================================================================

  useEffect(() => {
    const rows = watchInputBOM || [];

    const currentIssueQty = toNum(issueQty);

    rows.forEach((row, index) => {
      // ================================================================
      // INPUT QTY
      //
      // Input Qty = Issue Qty × BOM Qty
      // ================================================================

      const bomQty = toNum(row.bomQty);

      const inputQty = Number((currentIssueQty * bomQty).toFixed(3));

      if (toNum(row.inputQty) !== inputQty) {
        setValue(`inputBOM.${index}.inputQty`, inputQty, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      // ================================================================
      // VALUE
      //
      // Value = Input Qty × Rate
      // ================================================================

      const rate = toNum(row.rate);

      const value = Number((inputQty * rate).toFixed(2));

      if (toNum(row.value) !== value) {
        setValue(`inputBOM.${index}.value`, value, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }

      // ================================================================
      // SCRAP TOTAL
      //
      // Scrap Total = Scrap Qty × Rate
      // ================================================================

      const scrapQty = toNum(row.scrapQty);

      const scrapTotal = Number((scrapQty * rate).toFixed(2));

      if (toNum(row.scrapTotal) !== scrapTotal) {
        setValue(`inputBOM.${index}.scrapTotal`, scrapTotal, {
          shouldDirty: true,
          shouldValidate: false,
        });
      }
    });
  }, [issueQty, watchInputBOM, setValue]);

  // ==========================================================================
  // TOTAL VALUE
  // ==========================================================================

  const calculateTotalValue = useCallback(() => {
    const rows = watchInputBOM || [];

    const total = rows.reduce((sum, row) => {
      return sum + toNum(row.value);
    }, 0);

    setValue("totalValue", Number(total.toFixed(2)), {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [watchInputBOM, setValue]);

  useEffect(() => {
    calculateTotalValue();
  }, [calculateTotalValue]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validate = () => {
    const fieldErrors = [];

    if (!watch("plantId")) {
      fieldErrors.push("Plant");
    }

    if (!watch("issueDate")) {
      fieldErrors.push("Issue Date");
    }

    if (!watch("belongsTo")) {
      fieldErrors.push("Belongs To");
    }

    if (!watch("fromLocation")) {
      fieldErrors.push("From Location");
    }

    if (!watch("toLocation")) {
      fieldErrors.push("To Location");
    }

    if (!watch("fgPartNo")) {
      fieldErrors.push("FG Part No");
    }

    if (!watch("scheduleOrderNo")) {
      fieldErrors.push("Sch.Order No");
    }

    if (!watch("issueQty")) {
      fieldErrors.push("Issue Qty");
    }

    if (fieldErrors.length) {
      addToast(`Missing mandatory fields: ${fieldErrors.join(", ")}`, "error");

      return false;
    }

    return true;
  };

  // ==========================================================================
  // SAVE
  // ==========================================================================

  const onSubmit = async (formData) => {
    if (!validate()) {
      return;
    }

    setSaving(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      active: true,

      alterInputItem: formData.alterInputItem || "No",

      belongsTo: formData.belongsTo || "",

      bom: formData.bomId || "",

      branch: formData.plantId ? parseInt(formData.plantId) : 0,

      cancelRemarks: "",

      createdBy: usersId || "admin",

      fgPartNo: formData.fgPartNo ? parseInt(formData.fgPartNo) : 0,

      financialYear: financialYear || "",

      fromLocation: formData.fromLocation ? parseInt(formData.fromLocation) : 0,

      id: isUpdate ? parseInt(data.id) : 0,

      issueQty: parseFloat(formData.issueQty) || 0,

      itemType: formData.itemType || "",

      orgId,

      rate: parseFloat(formData.rate) || 0,

      remarks: formData.remarks || "",

      schDates: formData.schDates || "",

      schOrderNo: formData.scheduleOrderNo || "",

      scrapToLocation: formData.scrapToLocation
        ? parseInt(formData.scrapToLocation)
        : 0,

      sfgDescription: formData.sfgDescription || "",

      sfgPartNo: formData.sfgPartNo ? parseInt(formData.sfgPartNo) : 0,

      toLocation: formData.toLocation ? parseInt(formData.toLocation) : 0,

      totalValue: parseFloat(formData.totalValue) || 0,

      unit: formData.unit || "",

      value: parseFloat(formData.value) || 0,

      // ================================================================
      // DETAIL DTO
      // ================================================================

      productionTransferSlipDetailsDTO: (formData.inputBOM || [])
        .filter((row) => row.inputItemCode?.toString().trim())
        .map((row) => ({
          item: row.inputItemCode ? parseInt(row.inputItemCode) : 0,

          bomQty: parseFloat(row.bomQty) || 0,

          primaryUnit: row.primaryUnit ? parseInt(row.primaryUnit) : 0,

          rate: parseFloat(row.rate) || 0,

          scrap: row.scrapId ? parseInt(row.scrapId) : 0,

          scrapQty: parseFloat(row.scrapQty) || 0,

          stock: parseFloat(row.stock) || 0,
        })),
    };

    if (!isUpdate) {
      delete payload.id;
    }

    console.log("Saving Production Transfer Slip Payload:", payload);

    try {
      const response = await productionTransferSlipAPI.createUpdate(payload);

      console.log("Save Response:", response);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Production Transfer Slip updated successfully!"
              : "Production Transfer Slip created successfully!"),
          "success",
        );

        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Production Transfer Slip.",
          "error",
        );
      }
    } catch (error) {
      console.error("Save Production Transfer Slip Error:", error);

      if (error.response?.data) {
        addToast(
          error.response.data.message ||
            error.response.data.statusMessage ||
            error.response.data.error ||
            JSON.stringify(error.response.data),
          "error",
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================================
  // HEADER
  // ==========================================================================

  const renderHeader = () => (
    <div className={fieldGrid}>
      <SelectField
        control={control}
        name="plantId"
        label="Plant ID"
        options={plantOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="issueNo"
        label="Issue No."
        placeholder="Auto"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="belongsTo"
        label="Belongs to"
        options={BELONGS_TO}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <DatePickerField
        control={control}
        name="issueDate"
        label="Issue Date"
        required
        errors={errors}
      />

      <SelectField
        control={control}
        name="fromLocation"
        label="From Location"
        options={locationOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="toLocation"
        label="To Location"
        options={locationOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="scrapToLocation"
        label="Scrap To Location"
        options={locationOptions}
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="fgPartNo"
        label="FG Part No."
        options={fgOptions}
        required
        errors={errors}
        onChange={handleFgChange}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="sfgPartNo"
        label="SFG Part No"
        options={sfgOptions}
        errors={errors}
        onChange={handleSfgChange}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="sfgDescription"
        label="SFG Description"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="scheduleOrderNo"
        label="Sch.Order No."
        options={scheduleOrderOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="bomId"
        label="BOM ID"
        options={bomOptions}
        errors={errors}
        onChange={handleBomChange}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="schDates"
        label="Sch. Dates"
        options={schDateOptions}
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="alterInputItem"
        label="Alter Input Item"
        options={YES_NO}
        errors={errors}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="issueQty"
        label="Issue Qty"
        type="number"
        step="0.01"
        required
        placeholder="Value"
        errors={errors}
      />

      <InputField
        control={control}
        name="unit"
        label="Unit"
        errors={errors}
        placeholder="Enter unit"
      />

      <InputField
        control={control}
        name="itemType"
        label="Item Type"
        errors={errors}
        placeholder="Enter item type"
      />

      <InputField
        control={control}
        name="value"
        label="Value"
        type="number"
        step="0.01"
        placeholder="0.00"
        errors={errors}
      />

      <InputField
        control={control}
        name="rate"
        label="Rate"
        type="number"
        step="0.01"
        placeholder="0.00"
        errors={errors}
      />
    </div>
  );

  // ==========================================================================
  // INPUT BOM TAB
  // ==========================================================================

  const renderInputBOMTab = () => {
    const headers = [
      "S.No",
      "Input Item Code",
      "Input Item Desc.",
      "Item Type",
      "Stock",
      "BOM Qty",
      "Input Qty",
      "Rate",
      "Value",
      "Primary Unit",
      "Scrap ID",
      "Scrap Qty.",
      "Scrap Total",
      "lcoequal",
      "Action",
    ];

    return (
      <div className="pt-2 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span>
            {canAlterRows
              ? "Add input BOM items"
              : 'Rows are populated from the selected BOM. Set "Alter Input Item" to Yes to edit item / qty / add rows.'}
          </span>

          <button
            type="button"
            onClick={handleAddRow}
            disabled={!canAlterRows}
            className={`ml-auto h-6 w-6 rounded-md text-white flex items-center justify-center transition-colors ${
              canAlterRows
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus size={12} />
          </button>
        </div>

        <TableWrapper>
          <TableHead headers={headers} />

          <tbody>
            {inputBOMArray.fields.map((field, index) => (
              <TableRow
                key={field.id}
                index={index}
                onRemove={() => handleRemoveRow(index)}
                disabled={!canAlterRows || inputBOMArray.fields.length <= 1}
              >
                {/* Input Item Code */}
                <SelectCell
                  control={control}
                  name={`inputBOM.${index}.inputItemCode`}
                  options={itemOptions}
                  errors={errors}
                  disabled={!canAlterRows}
                  onChange={(value) => handleInputItemChange(index, value)}
                />

                {/* Input Item Description */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.inputItemDesc`}
                  readOnly
                  placeholder="Description"
                  errors={errors}
                />

                {/* Item Type */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.itemType`}
                  readOnly={!canAlterRows}
                  placeholder="Item Type"
                  errors={errors}
                />

                {/* Stock - MANUAL */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.stock`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  errors={errors}
                />

                {/* BOM Qty - FROM BOM */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.bomQty`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  readOnly={!canAlterRows}
                  errors={errors}
                />

                {/* Input Qty = Issue Qty × BOM Qty */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.inputQty`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  readOnly
                  align="right"
                  errors={errors}
                />

                {/* Rate - MANUAL */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.rate`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  align="right"
                  errors={errors}
                />

                {/* Value = Input Qty × Rate */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.value`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  readOnly
                  align="right"
                  errors={errors}
                />

                {/* Primary Unit */}
                <SelectCell
                  control={control}
                  name={`inputBOM.${index}.primaryUnit`}
                  options={unitOptions}
                  errors={errors}
                  placeholder="Select"
                />

                {/* Scrap ID */}
                <SelectCell
                  control={control}
                  name={`inputBOM.${index}.scrapId`}
                  options={scrapOptions}
                  errors={errors}
                  placeholder="Select an option"
                />

                {/* Scrap Qty - MANUAL */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.scrapQty`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  align="right"
                  errors={errors}
                />

                {/* Scrap Total = Scrap Qty × Rate */}
                <InputCell
                  control={control}
                  name={`inputBOM.${index}.scrapTotal`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  readOnly
                  align="right"
                  errors={errors}
                />

                {/* lcoequal */}
                <td className="p-2 align-top">
                  <Controller
                    name={`inputBOM.${index}.lcoequal`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={
                          field.value === true ||
                          field.value === "Yes" ||
                          field.value === "true"
                        }
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    )}
                  />
                </td>
              </TableRow>
            ))}
          </tbody>
        </TableWrapper>
      </div>
    );
  };

  // ==========================================================================
  // SUMMARY TAB
  // ==========================================================================

  const renderTransferSlipSummaryTab = () => (
    <div className="pt-2 space-y-4">
      <div className={subTabFieldGrid}>
        <InputField
          control={control}
          name="totalValue"
          label="Total Value"
          type="number"
          step="0.01"
          placeholder="0.00"
          readOnly
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
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data
            ? "Edit Production Transfer Slip"
            : "Add Production Transfer Slip"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Information */}
        <div>
          <SectionHeader>Production Transfer Slip</SectionHeader>

          {renderHeader()}
        </div>

        {/* Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
            <button
              type="button"
              onClick={() => setActiveTab("inputBOM")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${
                activeTab === "inputBOM"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Input BOM
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transferSlipSummary")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${
                activeTab === "transferSlipSummary"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Transfer Slip Summary
            </button>
          </div>

          {activeTab === "inputBOM" && renderInputBOMTab()}

          {activeTab === "transferSlipSummary" &&
            renderTransferSlipSummaryTab()}
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

            {saving || isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionTransferSlipForm;
