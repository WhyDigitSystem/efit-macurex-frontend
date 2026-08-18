import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Calendar
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import productionTransferSlipAPI from "../../../api/Production/productionTransferSlipAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import { employeeAPI } from "../../../api/employeeAPI";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
    "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

const subTabFieldGrid =
    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4 items-start";

// ===================== Reusable Components =====================

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
    const getError = () => {
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

    const errorMessage = getError();

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
                        type={type}
                        step={step}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
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

    const getError = () => {
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

    const errorMessage = getError();

    const getCalendarDays = (month) => {
        const startOfMonth = month.startOf("month");
        const endOfMonth = month.endOf("month");

        const startDay = startOfMonth.day();
        const daysInMonth = endOfMonth.date();

        const days = [];

        // Previous month's empty days
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(month.date(i));
        }

        return days;
    };

    return (
        <div className="relative">
            <label className={labelClasses}>
                {label}{" "}
                {required && <span className="text-red-500">*</span>}
            </label>

            <Controller
                name={name}
                control={control}
                rules={
                    required
                        ? { required: `${label} is required` }
                        : undefined
                }
                render={({ field }) => {
                    const selectedDate = field.value
                        ? dayjs(field.value, "DD-MM-YYYY", true)
                        : null;

                    return (
                        <>
                            {/* Date Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={field.value || ""}
                                    readOnly
                                    placeholder="DD-MM-YYYY"
                                    onClick={() => setOpen(!open)}
                                    className={`${controlClasses} cursor-pointer pr-8 ${errorMessage
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                        }`}
                                />

                                <Calendar
                                    size={15}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                />
                            </div>

                            {/* Calendar */}
                            {open && (
                                <div className="absolute z-50 mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3">

                                    {/* Calendar Header */}
                                    <div className="flex items-center justify-between mb-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth(
                                                    currentMonth.subtract(
                                                        1,
                                                        "month"
                                                    )
                                                )
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
                                                setCurrentMonth(
                                                    currentMonth.add(
                                                        1,
                                                        "month"
                                                    )
                                                )
                                            }
                                            className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                        >
                                            ›
                                        </button>

                                    </div>

                                    {/* Week Days */}
                                    <div className="grid grid-cols-7 mb-1">
                                        {[
                                            "Su",
                                            "Mo",
                                            "Tu",
                                            "We",
                                            "Th",
                                            "Fr",
                                            "Sa",
                                        ].map((day) => (
                                            <div
                                                key={day}
                                                className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-1"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {getCalendarDays(currentMonth).map(
                                            (date, index) => {
                                                if (!date) {
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="h-8"
                                                        />
                                                    );
                                                }

                                                const isSelected =
                                                    selectedDate?.isValid() &&
                                                    date.isSame(
                                                        selectedDate,
                                                        "day"
                                                    );

                                                const isToday = date.isSame(
                                                    dayjs(),
                                                    "day"
                                                );

                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            field.onChange(
                                                                date.format(
                                                                    "DD-MM-YYYY"
                                                                )
                                                            );
                                                            setOpen(false);
                                                        }}
                                                        className={`
                                                            h-8 w-8 rounded-full
                                                            text-xs
                                                            flex items-center justify-center
                                                            transition-colors
                                                            ${isSelected
                                                                ? "bg-blue-600 text-white"
                                                                : isToday
                                                                    ? "border border-blue-600 text-blue-600 dark:text-blue-400"
                                                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            }
                                                        `}
                                                    >
                                                        {date.date()}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    {/* Today */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = dayjs();

                                                field.onChange(
                                                    today.format(
                                                        "DD-MM-YYYY"
                                                    )
                                                );

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
                <p className="text-red-500 text-[11px] mt-1">
                    {errorMessage}
                </p>
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
    const getError = () => {
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

    const errorMessage = getError();

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
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
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

const CheckboxField = ({
    control,
    name,
    label,
    errors,
    disabled,
}) => {
    return (
        <div className="flex items-center gap-2 mt-1">
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="checkbox"
                        checked={field.value === "Yes" || field.value === true}
                        onChange={(e) => {
                            const value = e.target.checked ? "Yes" : "No";
                            field.onChange(value);
                        }}
                        disabled={disabled}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                )}
            />
            <label className="text-[11px] text-gray-700 dark:text-gray-300">{label}</label>
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
                    className={`p-2 whitespace-nowrap ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
                >
                    {h}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white text-[10px]">{index + 1}</td>
        {children}
        {showDelete && (
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
        )}
    </tr>
);

const SelectCell = ({ control, name, options, required, errors, onChange, disabled }) => {
    const getError = () => {
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

    const errorMessage = getError();

    return (
        <td className="p-2 align-top min-w-[120px]">
            <Controller
                name={name}
                control={control}
                rules={required ? { required: "This field is required" } : undefined}
                render={({ field }) => (
                    <select
                        {...field}
                        className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                        onChange={(e) => {
                            field.onChange(e);
                            if (onChange) {
                                onChange(e.target.value);
                            }
                        }}
                        disabled={disabled}
                    >
                        <option value="">-- Select --</option>
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
    const getError = () => {
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

    const errorMessage = getError();

    return (
        <td className="p-2 align-top min-w-[100px]">
            <Controller
                name={name}
                control={control}
                rules={required ? { required: "This field is required" } : undefined}
                render={({ field }) => (
                    <input
                        {...field}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
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

// ===================== Constants =====================

const BELONGS_TO = ["Appliances", "Bosch", "Electronics", "Automotive"];
const YES_NO = ["Yes", "No"];
const ITEM_TYPES = ["FG", "SFG", "Raw Material", "Semi-Finished", "Finished Goods"];

// ===================== Utility Functions =====================

const fmtDate = (value) =>
    value ? dayjs(value).format("DD-MM-YYYY") : "";

// ===================== Default Values =====================

const getDefaultInputBOMRow = () => ({
    inputItemCode: "",
    inputItemDesc: "",
    itemType: "",
    stock: 0,
    bomQty: "",
    inputQty: "",
    rate: "",
    value: "",
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
    totalValue: 0,
    remarks: "",
    inputBOM: [getDefaultInputBOMRow()],
});

// ===================== Main Component =====================

const ProductionTransferSlipForm = ({ data, onBack }) => {
    const { addToast } = useToast();
    const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
    const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
    const usersId = localStorage.getItem("usersId");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
    const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

    const [activeTab, setActiveTab] = useState("inputBOM");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const dataLoadedRef = useRef(false);

    // Lookup data states
    const [plantOptions, setPlantOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [unitOptions, setUnitOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);
    const [bomOptions, setBomOptions] = useState([]);
    const [scrapOptions, setScrapOptions] = useState([]);
    const [schDateOptions, setSchDateOptions] = useState([]);

    const defaults = useCallback(() => {
        const base = getDefaultValues();
        if (data) {
            base.plantId = data.plant?.id ?? data.plantId ?? "";
            base.issueNo = data.issueNo || data.docId || "";
            base.belongsTo = data.belongsTo || "";
            base.issueDate = fmtDate(data.issueDate || data.docDate);
            base.fromLocation = data.fromLocation?.id ?? data.fromLocation ?? "";
            base.toLocation = data.toLocation?.id ?? data.toLocation ?? "";
            base.scrapToLocation = data.scrapToLocation?.id ?? data.scrapToLocation ?? "";
            // Fixed: Using || instead of mixing || and ??
            base.fgPartNo = data.fgPartNo || data.fgItem?.id || "";
            base.sfgPartNo = data.sfgPartNo || data.sfgItem?.id || "";
            base.sfgDescription = data.sfgDescription || "";
            base.scheduleOrderNo = data.scheduleOrder?.id ?? data.scheduleOrderNo ?? "";
            base.bomId = data.bomId || "";
            base.schDates = data.schDates || "";
            base.alterInputItem = data.alterInputItem === true ? "Yes" : data.alterInputItem === false ? "No" : data.alterInputItem || "No";
            base.issueQty = data.issueQty || "";
            base.rate = data.rate || "";
            base.itemType = data.itemType || "";
            base.unit = data.unit || "";
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

    // ===================== Load Data for Edit =====================

    const loadTransferSlipData = useCallback(async (slipId) => {
        if (!slipId) return;

        setLoading(true);
        try {
            const response = await productionTransferSlipAPI.getById(slipId);
            console.log("Production Transfer Slip Data:", response);

            if (response) {
                const slip = response;

                setValue("plantId", slip.plant?.id || "");
                setValue("issueNo", slip.docId || "");
                setValue("belongsTo", slip.belongsTo || "");
                setValue(
                    "issueDate",
                    slip.docDate
                        ? dayjs(slip.docDate).format("DD-MM-YYYY")
                        : ""
                );
                setValue("fromLocation", slip.fromLocation?.id || "");
                setValue("toLocation", slip.toLocation?.id || "");
                setValue("scrapToLocation", slip.scrapToLocation?.id || "");
                setValue("fgPartNo", slip.fgPartNo || slip.fgItem?.id || "");
                setValue("sfgPartNo", slip.sfgPartNo || slip.sfgItem?.id || "");
                setValue("sfgDescription", slip.sfgDescription || "");
                setValue("scheduleOrderNo", slip.scheduleOrder?.id || "");
                setValue("bomId", slip.bomId || "");
                setValue("schDates", slip.schDates || "");
                setValue("alterInputItem", slip.alterInputItem ? "Yes" : "No");
                setValue("issueQty", slip.issueQty || "");
                setValue("rate", slip.rate || "");
                setValue("itemType", slip.itemType || "");
                setValue("unit", slip.unit || "");
                setValue("totalValue", slip.totalValue || 0);
                setValue("remarks", slip.remarks || "");

                if (slip.inputBOM?.length > 0) {
                    inputBOMArray.replace(slip.inputBOM);
                }

                addToast("Production Transfer Slip loaded successfully", "success");
            } else {
                addToast("Failed to load Production Transfer Slip data", "error");
            }
        } catch (error) {
            console.error("Error loading production transfer slip:", error);
            addToast("Failed to load Production Transfer Slip data", "error");
        } finally {
            setLoading(false);
        }
    }, [setValue, inputBOMArray, addToast]);

    useEffect(() => {
        const slipId = data?.id;

        if (!slipId) return;

        if (dataLoadedRef.current === slipId) {
            return;
        }

        dataLoadedRef.current = slipId;
        loadTransferSlipData(slipId);
    }, [data?.id, loadTransferSlipData]);

    // ===================== Data Loading =====================

    const loadPlants = useCallback(async () => {
        try {
            if (isMacurex) {
                const res = await locationMasterAPI.getPlants(orgId);
                setPlantOptions(
                    (res || []).map((p) => ({
                        value: p.id,
                        label: p.plantName || p.plantId || p.id,
                    }))
                );
            } else {
                const res = await branchAPI.getBranchByOrgId(orgId);
                setPlantOptions(
                    (res || []).map((b) => ({
                        value: b.id,
                        label: b.branchName || b.branchCode || b.id,
                    }))
                );
            }
        } catch (error) {
            console.error("Failed to load plant options:", error);
            setPlantOptions([]);
        }
    }, [orgId, isMacurex]);

    const loadItems = useCallback(async () => {
        try {
            const res = await itemAPI.getItems(orgId, branch);
            const map = {};
            const options = (res || []).map((it) => {
                map[it.id] = it;
                return { value: it.id, label: it.itemCode };
            });
            setItemOptions(options);
            setItemMap(map);
        } catch (error) {
            console.error("Failed to load item options:", error);
            setItemOptions([]);
            setItemMap({});
        }
    }, [orgId, branch]);

    const loadUnits = useCallback(async () => {
        try {
            const res = await unitMasterAPI.getUnits(branch, orgId);
            setUnitOptions(
                (res || []).map((u) => ({
                    value: u.id,
                    label: u.unitId,
                }))
            );
        } catch (error) {
            console.error("Failed to load unit options:", error);
            setUnitOptions([]);
        }
    }, [orgId, branch]);

    const loadLocations = useCallback(async () => {
        try {
            const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
            setLocationOptions(
                (res || []).map((l) => ({
                    value: l.id,
                    label: l.locationName || l.locationCode || l.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load location options:", error);
            setLocationOptions([]);
        }
    }, [orgId, branch]);

    const loadScheduleOrders = useCallback(async () => {
        try {
            const res = await productionTransferSlipAPI.getScheduleOrders?.(orgId, branch) || [];
            setScheduleOrderOptions(
                (res || []).map((s) => ({
                    value: s.id || s.scheduleOrderNo,
                    label: s.scheduleOrderNo || s.docId || s.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load schedule order options:", error);
            setScheduleOrderOptions([]);
        }
    }, [orgId, branch]);

    const loadBOMs = useCallback(async () => {
        try {
            const res = await productionTransferSlipAPI.getBOMs?.(orgId, branch) || [];
            setBomOptions(
                (res || []).map((b) => ({
                    value: b.id || b.bomId,
                    label: b.bomName || b.bomId || b.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load BOM options:", error);
            setBomOptions([]);
        }
    }, [orgId, branch]);

    const loadScrapItems = useCallback(async () => {
        try {
            const res = await productionTransferSlipAPI.getScrapItems?.(orgId, branch) || [];
            setScrapOptions(
                (res || []).map((s) => ({
                    value: s.id || s.scrapId,
                    label: s.scrapDescription || s.scrapId || s.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load scrap options:", error);
            setScrapOptions([]);
        }
    }, [orgId, branch]);

    const loadSchDates = useCallback(async () => {
        try {
            const res = await productionTransferSlipAPI.getSchDates?.(orgId, branch) || [];
            setSchDateOptions(
                (res || []).map((d) => ({
                    value: d.id || d.date,
                    label: d.date || d.scheduleDate || d.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load schedule dates:", error);
            setSchDateOptions([]);
        }
    }, [orgId, branch]);

    useEffect(() => {
        if (orgId) {
            loadPlants();
            loadItems();
            loadUnits();
            loadLocations();
            loadScheduleOrders();
            loadBOMs();
            loadScrapItems();
            loadSchDates();
        }
    }, [
        orgId,
        loadPlants,
        loadItems,
        loadUnits,
        loadLocations,
        loadScheduleOrders,
        loadBOMs,
        loadScrapItems,
        loadSchDates,
    ]);

    // ===================== Handlers =====================

    const handleAddRow = () => {
        inputBOMArray.append(getDefaultInputBOMRow());
    };

    const handleRemoveRow = (index) => {
        if (inputBOMArray.fields.length > 1) inputBOMArray.remove(index);
    };

    const handleInputItemChange = (idx, value) => {
        const item = itemMap[value];
        setValue(`inputBOM.${idx}.inputItemCode`, value, { shouldDirty: true });
        setValue(`inputBOM.${idx}.inputItemDesc`, item?.itemDescription || "", { shouldDirty: true });
        setValue(`inputBOM.${idx}.primaryUnit`, item?.primaryUnits?.id || "", { shouldDirty: true });
    };

    // Calculate total value
    const calculateTotalValue = useCallback(() => {
        const inputBOM = watchInputBOM || [];
        let total = 0;
        inputBOM.forEach(item => {
            const value = parseFloat(item.value) || 0;
            total += value;
        });
        setValue("totalValue", total, { shouldDirty: true });
    }, [watchInputBOM, setValue]);

    useEffect(() => {
        calculateTotalValue();
    }, [watchInputBOM, calculateTotalValue]);

    // ===================== Validation & Save =====================

    const validate = () => {
        const fundErrors = [];
        if (!watch("plantId")) fundErrors.push("Plant");
        if (!watch("issueDate")) fundErrors.push("Issue Date");
        if (!watch("belongsTo")) fundErrors.push("Belongs To");
        if (!watch("fromLocation")) fundErrors.push("From Location");
        if (!watch("toLocation")) fundErrors.push("To Location");
        if (!watch("fgPartNo")) fundErrors.push("FG Part No");
        if (!watch("scheduleOrderNo")) fundErrors.push("Sch.Order No");
        if (fundErrors.length)
            addToast(`Missing mandatory fields: ${fundErrors.join(", ")}`, "error");
        return fundErrors.length === 0;
    };

    const onSubmit = async (formData) => {
        if (!validate()) return;

        setSaving(true);
        const isUpdate = Boolean(data?.id);

        const formatDateForAPI = (dateString) => {
            if (!dateString) return null;

            const [day, month, year] = dateString.split("-");

            if (!day || !month || !year) {
                return null;
            }

            return `${year}-${month}-${day}`;
        };

        const payload = {
            active: true,
            alterInputItem: formData.alterInputItem === "Yes" ? 1 : 0,
            belongsTo: formData.belongsTo || "",
            bomId: formData.bomId || "",
            branch: branch,
            createdBy: usersId || "admin",
            fgPartNo: formData.fgPartNo || "",
            fromLocation: formData.fromLocation ? parseInt(formData.fromLocation) : 0,
            id: isUpdate ? parseInt(data.id) : 0,
            issueDate: formatDateForAPI(formData.issueDate) || "",
            issueNo: formData.issueNo || "",
            issueQty: parseFloat(formData.issueQty) || 0,
            itemType: formData.itemType || "",
            orgId: orgId,
            plant: formData.plantId ? parseInt(formData.plantId) : 0,
            rate: parseFloat(formData.rate) || 0,
            remarks: formData.remarks || "",
            schDates: formData.schDates || "",
            scheduleOrder: formData.scheduleOrderNo ? parseInt(formData.scheduleOrderNo) : 0,
            scrapToLocation: formData.scrapToLocation ? parseInt(formData.scrapToLocation) : 0,
            sfgDescription: formData.sfgDescription || "",
            sfgPartNo: formData.sfgPartNo || "",
            toLocation: formData.toLocation ? parseInt(formData.toLocation) : 0,
            totalValue: parseFloat(formData.totalValue) || 0,
            unit: formData.unit || "",
            inputBOM: (formData.inputBOM || [])
                .filter((r) => r.inputItemCode?.trim())
                .map((item) => ({
                    inputItemCode: item.inputItemCode || "",
                    inputItemDesc: item.inputItemDesc || "",
                    itemType: item.itemType || "",
                    stock: parseFloat(item.stock) || 0,
                    bomQty: parseFloat(item.bomQty) || 0,
                    inputQty: parseFloat(item.inputQty) || 0,
                    rate: parseFloat(item.rate) || 0,
                    value: parseFloat(item.value) || 0,
                    primaryUnit: item.primaryUnit || "",
                    scrapId: item.scrapId || "",
                    scrapQty: parseFloat(item.scrapQty) || 0,
                    scrapTotal: parseFloat(item.scrapTotal) || 0,
                    lcoequal: item.lcoequal === true || item.lcoequal === "Yes" || item.lcoequal === "true",
                })),
        };

        if (!isUpdate) {
            delete payload.id;
        }

        console.log("Saving Production Transfer Slip Payload:", payload);

        try {
            const response = await productionTransferSlipAPI.createUpdate(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Production Transfer Slip updated successfully!"
                        : "Production Transfer Slip created successfully!"),
                    "success"
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.message ||
                    response?.paramObjectsMap?.message ||
                    "Failed to save Production Transfer Slip.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save Production Transfer Slip Error:", err);
            if (err.response?.data) {
                addToast(
                    err.response.data.message ||
                    err.response.data.statusMessage ||
                    err.response.data.error ||
                    JSON.stringify(err.response.data),
                    "error"
                );
            } else {
                addToast("Something went wrong.", "error");
            }
        } finally {
            setSaving(false);
        }
    };

    // ===================== Render Functions =====================

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
                readOnly={!data}
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
                options={itemOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="sfgPartNo"
                label="SFG Part No"
                options={itemOptions}
                errors={errors}
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
                name="rate"
                label="Rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                errors={errors}
            />

            <SelectField
                control={control}
                name="itemType"
                label="Item Type"
                options={ITEM_TYPES}
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="unit"
                label="Unit"
                options={unitOptions}
                errors={errors}
                placeholder="Select an option"
            />
        </div>
    );

    const renderInputBOMTab = () => {
        const headers = [
            "S.No", "Input Item Code", "Input Item Desc.", "Item Type", "Stock",
            "BOM Qty", "Input Qty", "Rate", "Value", "Primary Unit",
            "Scrap ID", "Scrap Qty.", "Scrap Total", "lcoequal", "Action"
        ];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add input BOM items</span>
                    <button
                        type="button"
                        onClick={handleAddRow}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
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
                                disabled={inputBOMArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`inputBOM.${index}.inputItemCode`}
                                    options={itemOptions}
                                    errors={errors}
                                    onChange={(v) => handleInputItemChange(index, v)}
                                    placeholder="Select an option"
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.inputItemDesc`}
                                    readOnly
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`inputBOM.${index}.itemType`}
                                    options={ITEM_TYPES}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.stock`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    readOnly
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.bomQty`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.inputQty`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.rate`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.value`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    readOnly
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`inputBOM.${index}.primaryUnit`}
                                    options={unitOptions}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <SelectCell
                                    control={control}
                                    name={`inputBOM.${index}.scrapId`}
                                    options={scrapOptions}
                                    errors={errors}
                                    placeholder="Select an option"
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.scrapQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`inputBOM.${index}.scrapTotal`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.000"
                                    readOnly
                                    errors={errors}
                                />
                                <td className="p-2 align-top">
                                    <Controller
                                        name={`inputBOM.${index}.lcoequal`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="checkbox"
                                                checked={field.value === true || field.value === "Yes" || field.value === "true"}
                                                onChange={(e) => {
                                                    field.onChange(e.target.checked);
                                                }}
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

    // ===================== Main Render =====================

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
                    {data ? "Edit Production Transfer Slip" : "Add Production Transfer Slip"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
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
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "inputBOM"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Input BOM
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("transferSlipSummary")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "transferSlipSummary"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Transfer Slip Summary
                        </button>
                    </div>

                    {activeTab === "inputBOM" && renderInputBOMTab()}
                    {activeTab === "transferSlipSummary" && renderTransferSlipSummaryTab()}
                </section>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={saving || isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Cancel
                    </button>

                    <button
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