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
import productionEntryAPI from "../../../api/Production/productionEntryAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
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
        const startDay = startOfMonth.day();
        const daysInMonth = month.daysInMonth();

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
                {label}{" "}
                {required && (
                    <span className="text-red-500">*</span>
                )}
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
                            <div className="relative">
                                <input
                                    type="text"
                                    value={field.value || ""}
                                    placeholder="DD-MM-YYYY"
                                    readOnly
                                    onClick={() => setOpen((prev) => !prev)}
                                    className={`${controlClasses} pr-8 cursor-pointer ${errorMessage
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                        }`}
                                />

                                <Calendar
                                    size={15}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                />
                            </div>

                            {open && (
                                <div className="absolute z-[9999] mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3">

                                    {/* Month Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.subtract(1, "month")
                                                )
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
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.add(1, "month")
                                                )
                                            }
                                            className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
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

                                    {/* Calendar */}
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

                                                const isToday =
                                                    date.isSame(
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
                                                            flex items-center justify-center
                                                            text-xs
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
const SHIFTS = ["Morning", "Afternoon", "Night", "General"];
const REASONS = ["Machine Breakdown", "Power Failure", "Material Issue", "Quality Issue", "Other"];

// ===================== Utility Functions =====================

const fmtDate = (value) =>
    value ? dayjs(value).format("DD-MM-YYYY") : "";

// ===================== Default Values =====================

const getDefaultProductionDetailRow = () => ({
    operationNo: "",
    machine: "",
    machineName: "",
    machineHourRate: "",
    labourHourRate: "",
    operationName: "",
    frTimeHrs: "",
    frTimeMins: "",
    toTimeHrs: "",
    toTimeMins: "",
    lunchTimeMins: "",
    totTimeMins: "",
    stoppageTimeMins: "",
    productiveHrsMins: "",
    qtyProduced: "",
    qtyPassed: "",
    qtyRejected: "",
    reason: "",
    qtyRework: "",
    noOfTools: "",
    qtyScrap: "",
    operationBy: "",
    remarks: "",
    stdRunTimePerPcsSec: "",
    stdLabourCost: "",
    stdMCCost: "",
    runningActLabourCost: "",
    runningActMCCost: "",
    stdToolCost: "",
    runningActToolCost: "",
    stdConsumCost: "",
    runningActConsumCost: "",
});

const getDefaultToolDetailRow = () => ({
    toolNo: "",
    toolName: "",
    strikes: "",
    strikesRate: "",
    toolValue: "",
});

const getDefaultStoppageRow = () => ({
    frTimeHrs: "",
    frTimeMins: "",
    toTimeHrs: "",
    toTimeMins: "",
    totTimeMins: "",
    reason: "",
    description: "",
    stoppageMCCost: "",
    stoppageLabourCost: "",
    remarks: "",
});

const getDefaultReworkRow = () => ({
    reason: "",
    reasonDescription: "",
    qty: "",
    timePerQty: "",
    reworkProdHrs: "",
    reworkMCCost: "",
    reworkLabourCost: "",
});

const getDefaultScrapRow = () => ({
    scrapId: "",
    scrapDescription: "",
    weight: "",
    qty: "",
});

const getDefaultValues = () => ({
    plantId: "",
    docNo: "",
    date: dayjs().format("DD-MM-YYYY"),
    belongsTo: "",
    shiftTimeFrom: "",
    shiftTimeTo: "",
    shift: "",
    fgItemCode: "",
    fgItemDescription: "",
    location: "",
    productionQty: "",
    scheduleOrderNo: "",
    preparedBy: "",
    processSheetNo: "",
    approvedBy: "",
    bomId: "",
    totalLabourCost: "",
    totalMachineCost: "",
    totalToolCost: "",
    totalConsumablesCost: "",
    narration: "",
    productionDetails: [getDefaultProductionDetailRow()],
    toolDetails: [getDefaultToolDetailRow()],
    stoppageDetails: [getDefaultStoppageRow()],
    reworkDetails: [getDefaultReworkRow()],
    scrapDetails: [getDefaultScrapRow()],
});

// ===================== Main Component =====================

const ProductionEntryForm = ({ data, onBack }) => {
    const { addToast } = useToast();
    const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
    const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
    const usersId = localStorage.getItem("usersId");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
    const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

    const [activeTab, setActiveTab] = useState("productionDetail");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const dataLoadedRef = useRef(false);

    // Lookup data states
    const [plantOptions, setPlantOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [locationOptions, setLocationOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);
    const [processSheetOptions, setProcessSheetOptions] = useState([]);
    const [bomOptions, setBomOptions] = useState([]);
    const [toolOptions, setToolOptions] = useState([]);
    const [machineOptions, setMachineOptions] = useState([]);
    const [scrapOptions, setScrapOptions] = useState([]);

    const defaults = useCallback(() => {
        const base = getDefaultValues();
        if (data) {
            base.plantId = data.plant?.id ?? data.plantId ?? "";
            base.docNo = data.docNo || data.docId || "";
            base.date = fmtDate(data.date || data.docDate);
            base.belongsTo = data.belongsTo || "";
            base.shiftTimeFrom = data.shiftTimeFrom || "";
            base.shiftTimeTo = data.shiftTimeTo || "";
            base.shift = data.shift || "";
            base.fgItemCode = data.fgItem?.id ?? data.fgItemCode ?? "";
            base.fgItemDescription = data.fgItem?.itemDescription || data.fgItemDescription || "";
            base.location = data.location?.id ?? data.location ?? "";
            base.productionQty = data.productionQty || "";
            base.scheduleOrderNo = data.scheduleOrder?.id ?? data.scheduleOrderNo ?? "";
            base.preparedBy = data.preparedBy?.id ?? data.preparedBy ?? "";
            base.processSheetNo = data.processSheetNo || "";
            base.approvedBy = data.approvedBy?.id ?? data.approvedBy ?? "";
            base.bomId = data.bomId || "";
            base.totalLabourCost = data.totalLabourCost || "";
            base.totalMachineCost = data.totalMachineCost || "";
            base.totalToolCost = data.totalToolCost || "";
            base.totalConsumablesCost = data.totalConsumablesCost || "";
            base.narration = data.narration || "";
            base.productionDetails = data.productionDetails?.length
                ? data.productionDetails
                : [getDefaultProductionDetailRow()];
            base.toolDetails = data.toolDetails?.length
                ? data.toolDetails
                : [getDefaultToolDetailRow()];
            base.stoppageDetails = data.stoppageDetails?.length
                ? data.stoppageDetails
                : [getDefaultStoppageRow()];
            base.reworkDetails = data.reworkDetails?.length
                ? data.reworkDetails
                : [getDefaultReworkRow()];
            base.scrapDetails = data.scrapDetails?.length
                ? data.scrapDetails
                : [getDefaultScrapRow()];
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

    const productionDetailsArray = useFieldArray({
        control,
        name: "productionDetails",
    });

    const toolDetailsArray = useFieldArray({
        control,
        name: "toolDetails",
    });

    const stoppageDetailsArray = useFieldArray({
        control,
        name: "stoppageDetails",
    });

    const reworkDetailsArray = useFieldArray({
        control,
        name: "reworkDetails",
    });

    const scrapDetailsArray = useFieldArray({
        control,
        name: "scrapDetails",
    });

    // ===================== Load Data for Edit =====================

    const loadProductionEntryData = useCallback(async (entryId) => {
        if (!entryId) return;

        setLoading(true);
        try {
            const response = await productionEntryAPI.getById(entryId);
            console.log("Production Entry Data:", response);

            if (response) {
                const entry = response;

                setValue("plantId", entry.plant?.id || "");
                setValue("docNo", entry.docId || "");
                setValue(
                    "date",
                    entry.docDate
                        ? dayjs(entry.docDate).format("DD-MM-YYYY")
                        : ""
                );
                setValue("belongsTo", entry.belongsTo || "");
                setValue("shiftTimeFrom", entry.shiftTimeFrom || "");
                setValue("shiftTimeTo", entry.shiftTimeTo || "");
                setValue("shift", entry.shift || "");
                setValue("fgItemCode", entry.fgItem?.id || "");
                setValue("fgItemDescription", entry.fgItem?.itemDescription || "");
                setValue("location", entry.location?.id || "");
                setValue("productionQty", entry.productionQty || "");
                setValue("scheduleOrderNo", entry.scheduleOrder?.id || "");
                setValue("preparedBy", entry.preparedBy?.id || "");
                setValue("processSheetNo", entry.processSheetNo || "");
                setValue("approvedBy", entry.approvedBy?.id || "");
                setValue("bomId", entry.bomId || "");
                setValue("totalLabourCost", entry.totalLabourCost || "");
                setValue("totalMachineCost", entry.totalMachineCost || "");
                setValue("totalToolCost", entry.totalToolCost || "");
                setValue("totalConsumablesCost", entry.totalConsumablesCost || "");
                setValue("narration", entry.narration || "");

                if (entry.productionDetails?.length > 0) {
                    productionDetailsArray.replace(entry.productionDetails);
                }

                if (entry.toolDetails?.length > 0) {
                    toolDetailsArray.replace(entry.toolDetails);
                }

                if (entry.stoppageDetails?.length > 0) {
                    stoppageDetailsArray.replace(entry.stoppageDetails);
                }

                if (entry.reworkDetails?.length > 0) {
                    reworkDetailsArray.replace(entry.reworkDetails);
                }

                if (entry.scrapDetails?.length > 0) {
                    scrapDetailsArray.replace(entry.scrapDetails);
                }

                addToast("Production Entry loaded successfully", "success");
            } else {
                addToast("Failed to load Production Entry data", "error");
            }
        } catch (error) {
            console.error("Error loading production entry:", error);
            addToast("Failed to load Production Entry data", "error");
        } finally {
            setLoading(false);
        }
    }, [setValue, productionDetailsArray, toolDetailsArray, stoppageDetailsArray, reworkDetailsArray, scrapDetailsArray, addToast]);

    useEffect(() => {
        const entryId = data?.id;

        if (!entryId) return;

        if (dataLoadedRef.current === entryId) {
            return;
        }

        dataLoadedRef.current = entryId;
        loadProductionEntryData(entryId);
    }, [data?.id, loadProductionEntryData]);

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

    const loadEmployees = useCallback(async () => {
        try {
            const res = await employeeAPI.getEmployeeByOrgId(orgId);
            setEmployeeOptions(
                (res || []).map((e) => ({
                    value: e.id,
                    label: e.employeeName || e.name || e.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load employee options:", error);
            setEmployeeOptions([]);
        }
    }, [orgId]);

    const loadScheduleOrders = useCallback(async () => {
        try {
            const res = await productionEntryAPI.getScheduleOrders?.(orgId, branch) || [];
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

    const loadProcessSheets = useCallback(async () => {
        try {
            const res = await productionEntryAPI.getProcessSheets?.(orgId, branch) || [];
            setProcessSheetOptions(
                (res || []).map((p) => ({
                    value: p.id || p.processSheetNo,
                    label: p.processSheetNo || p.name || p.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load process sheet options:", error);
            setProcessSheetOptions([]);
        }
    }, [orgId, branch]);

    const loadBOMs = useCallback(async () => {
        try {
            const res = await productionEntryAPI.getBOMs?.(orgId, branch) || [];
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

    const loadTools = useCallback(async () => {
        try {
            const res = await productionEntryAPI.getTools?.(orgId, branch) || [];
            setToolOptions(
                (res || []).map((t) => ({
                    value: t.id || t.toolNo,
                    label: t.toolName || t.toolNo || t.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load tool options:", error);
            setToolOptions([]);
        }
    }, [orgId, branch]);

    const loadMachines = useCallback(async () => {
        try {
            const res = await productionEntryAPI.getMachines?.(orgId, branch) || [];
            setMachineOptions(
                (res || []).map((m) => ({
                    value: m.id || m.machineCode,
                    label: m.machineName || m.machineCode || m.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load machine options:", error);
            setMachineOptions([]);
        }
    }, [orgId, branch]);

    const loadScrapItems = useCallback(async () => {
        try {
            const res = await productionEntryAPI.getScrapItems?.(orgId, branch) || [];
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

    useEffect(() => {
        if (orgId) {
            loadPlants();
            loadItems();
            loadLocations();
            loadEmployees();
            loadScheduleOrders();
            loadProcessSheets();
            loadBOMs();
            loadTools();
            loadMachines();
            loadScrapItems();
        }
    }, [
        orgId,
        loadPlants,
        loadItems,
        loadLocations,
        loadEmployees,
        loadScheduleOrders,
        loadProcessSheets,
        loadBOMs,
        loadTools,
        loadMachines,
        loadScrapItems,
    ]);

    // ===================== Handlers =====================

    const handleFGItemChange = (id) => {
        const item = itemMap[id];
        setValue("fgItemCode", id, { shouldDirty: true });
        setValue("fgItemDescription", item?.itemDescription || "", { shouldDirty: true });
    };

    const handleAddRow = (array) => {
        array.append(getDefaultProductionDetailRow());
    };

    const handleRemoveRow = (array, index) => {
        if (array.fields.length > 1) array.remove(index);
    };

    // ===================== Validation & Save =====================

    const validate = () => {
        const fundErrors = [];
        if (!watch("plantId")) fundErrors.push("Plant");
        if (!watch("date")) fundErrors.push("Date");
        if (!watch("belongsTo")) fundErrors.push("Belongs To");
        if (!watch("fgItemCode")) fundErrors.push("FG Item Code");
        if (!watch("location")) fundErrors.push("Location");
        if (!watch("productionQty")) fundErrors.push("Production QTY");
        if (!watch("preparedBy")) fundErrors.push("Prepared By");
        if (!watch("approvedBy")) fundErrors.push("Approved By");
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
            approvedBy: formData.approvedBy ? parseInt(formData.approvedBy) : 0,
            belongsTo: formData.belongsTo || "",
            bomId: formData.bomId || "",
            branch: branch,
            createdBy: usersId || "admin",
            date: formatDateForAPI(formData.date) || "",
            docNo: formData.docNo || "",
            fgItem: formData.fgItemCode ? parseInt(formData.fgItemCode) : 0,
            fgItemDescription: formData.fgItemDescription || "",
            id: isUpdate ? parseInt(data.id) : 0,
            location: formData.location ? parseInt(formData.location) : 0,
            narration: formData.narration || "",
            orgId: orgId,
            plant: formData.plantId ? parseInt(formData.plantId) : 0,
            preparedBy: formData.preparedBy ? parseInt(formData.preparedBy) : 0,
            processSheetNo: formData.processSheetNo || "",
            productionQty: parseFloat(formData.productionQty) || 0,
            scheduleOrder: formData.scheduleOrderNo ? parseInt(formData.scheduleOrderNo) : 0,
            shift: formData.shift || "",
            shiftTimeFrom: formData.shiftTimeFrom || "",
            shiftTimeTo: formData.shiftTimeTo || "",
            totalConsumablesCost: parseFloat(formData.totalConsumablesCost) || 0,
            totalLabourCost: parseFloat(formData.totalLabourCost) || 0,
            totalMachineCost: parseFloat(formData.totalMachineCost) || 0,
            totalToolCost: parseFloat(formData.totalToolCost) || 0,
            productionDetails: (formData.productionDetails || [])
                .filter((r) => r.operationNo?.trim() || r.machine)
                .map((item) => ({
                    operationNo: item.operationNo || "",
                    machine: item.machine || "",
                    machineName: item.machineName || "",
                    machineHourRate: parseFloat(item.machineHourRate) || 0,
                    labourHourRate: parseFloat(item.labourHourRate) || 0,
                    operationName: item.operationName || "",
                    frTimeHrs: parseFloat(item.frTimeHrs) || 0,
                    frTimeMins: parseFloat(item.frTimeMins) || 0,
                    toTimeHrs: parseFloat(item.toTimeHrs) || 0,
                    toTimeMins: parseFloat(item.toTimeMins) || 0,
                    lunchTimeMins: parseFloat(item.lunchTimeMins) || 0,
                    totTimeMins: parseFloat(item.totTimeMins) || 0,
                    stoppageTimeMins: parseFloat(item.stoppageTimeMins) || 0,
                    productiveHrsMins: parseFloat(item.productiveHrsMins) || 0,
                    qtyProduced: parseFloat(item.qtyProduced) || 0,
                    qtyPassed: parseFloat(item.qtyPassed) || 0,
                    qtyRejected: parseFloat(item.qtyRejected) || 0,
                    reason: item.reason || "",
                    qtyRework: parseFloat(item.qtyRework) || 0,
                    noOfTools: parseFloat(item.noOfTools) || 0,
                    qtyScrap: parseFloat(item.qtyScrap) || 0,
                    operationBy: item.operationBy || "",
                    remarks: item.remarks || "",
                    stdRunTimePerPcsSec: parseFloat(item.stdRunTimePerPcsSec) || 0,
                    stdLabourCost: parseFloat(item.stdLabourCost) || 0,
                    stdMCCost: parseFloat(item.stdMCCost) || 0,
                    runningActLabourCost: parseFloat(item.runningActLabourCost) || 0,
                    runningActMCCost: parseFloat(item.runningActMCCost) || 0,
                    stdToolCost: parseFloat(item.stdToolCost) || 0,
                    runningActToolCost: parseFloat(item.runningActToolCost) || 0,
                    stdConsumCost: parseFloat(item.stdConsumCost) || 0,
                    runningActConsumCost: parseFloat(item.runningActConsumCost) || 0,
                })),
            toolDetails: (formData.toolDetails || [])
                .filter((r) => r.toolNo?.trim())
                .map((item) => ({
                    toolNo: item.toolNo || "",
                    toolName: item.toolName || "",
                    strikes: parseFloat(item.strikes) || 0,
                    strikesRate: parseFloat(item.strikesRate) || 0,
                    toolValue: parseFloat(item.toolValue) || 0,
                })),
            stoppageDetails: (formData.stoppageDetails || [])
                .filter((r) => r.reason?.trim())
                .map((item) => ({
                    frTimeHrs: parseFloat(item.frTimeHrs) || 0,
                    frTimeMins: parseFloat(item.frTimeMins) || 0,
                    toTimeHrs: parseFloat(item.toTimeHrs) || 0,
                    toTimeMins: parseFloat(item.toTimeMins) || 0,
                    totTimeMins: parseFloat(item.totTimeMins) || 0,
                    reason: item.reason || "",
                    description: item.description || "",
                    stoppageMCCost: parseFloat(item.stoppageMCCost) || 0,
                    stoppageLabourCost: parseFloat(item.stoppageLabourCost) || 0,
                    remarks: item.remarks || "",
                })),
            reworkDetails: (formData.reworkDetails || [])
                .filter((r) => r.reason?.trim())
                .map((item) => ({
                    reason: item.reason || "",
                    reasonDescription: item.reasonDescription || "",
                    qty: parseFloat(item.qty) || 0,
                    timePerQty: parseFloat(item.timePerQty) || 0,
                    reworkProdHrs: parseFloat(item.reworkProdHrs) || 0,
                    reworkMCCost: parseFloat(item.reworkMCCost) || 0,
                    reworkLabourCost: parseFloat(item.reworkLabourCost) || 0,
                })),
            scrapDetails: (formData.scrapDetails || [])
                .filter((r) => r.scrapId?.trim())
                .map((item) => ({
                    scrapId: item.scrapId || "",
                    scrapDescription: item.scrapDescription || "",
                    weight: parseFloat(item.weight) || 0,
                    qty: parseFloat(item.qty) || 0,
                })),
        };

        if (!isUpdate) {
            delete payload.id;
        }

        console.log("Saving Production Entry Payload:", payload);

        try {
            const response = await productionEntryAPI.createUpdate(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Production Entry updated successfully!"
                        : "Production Entry created successfully!"),
                    "success"
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.message ||
                    response?.paramObjectsMap?.message ||
                    "Failed to save Production Entry.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save Production Entry Error:", err);
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
                name="docNo"
                label="Doc No."
                placeholder="Auto"
                readOnly={!data}
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
                name="belongsTo"
                label="Belongs To"
                options={BELONGS_TO}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <div className="flex gap-2 items-end">
                <InputField
                    control={control}
                    name="shiftTimeFrom"
                    label="Shift Time From"
                    type="time"
                    errors={errors}
                />
                <InputField
                    control={control}
                    name="shiftTimeTo"
                    label="To"
                    type="time"
                    errors={errors}
                />
            </div>

            <SelectField
                control={control}
                name="shift"
                label="Shift"
                options={SHIFTS}
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="fgItemCode"
                label="FG Item Code"
                options={itemOptions}
                required
                errors={errors}
                onChange={handleFGItemChange}
                placeholder="Select an option"
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
                name="location"
                label="Location"
                options={locationOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="productionQty"
                label="Production QTY"
                options={[]} // This should be populated with quantity options or be a number input
                required
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="scheduleOrderNo"
                label="Sch.Order No."
                options={scheduleOrderOptions}
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="preparedBy"
                label="Prepared By"
                options={employeeOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="processSheetNo"
                label="Process Sheet No"
                options={processSheetOptions}
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="approvedBy"
                label="Approved By"
                options={employeeOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="bomId"
                label="Bomid"
                options={bomOptions}
                errors={errors}
                placeholder="Select an option"
            />
        </div>
    );

    const renderProductionDetailTab = () => {
        const headers = [
            "S.No", "Operation No.", "Machine", "Machine Name", "Machine Hour Rate",
            "Labour Hour Rate", "Operation Name", "Fr.Time (Hrs.)", "Fr.Time (Mins.)",
            "To Time (Hrs.)", "To Time (Mins.)", "Lunch Time(mins)", "Tot.Time (Mins)",
            "Stoppage Time(Mins)", "Productive Hrs(Mins).", "Qty Produced", "Qty Passed",
            "Qty Rejected", "Reason", "Qty Rework", "No Of Tools", "Qty Scrap",
            "Operation By", "Remarks", "Std.Run Time/Pcs In Sec.", "Std.Labour Cost",
            "Std.M/C Cost", "Running Act. Cost(Labour)", "Running Act. Cost(M/C)",
            "Std.Tool Cost", "Running Act. Cost(Tool)", "Std.Consum. Cost",
            "Running Act. Cost(Consum.)", "Action"
        ];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add production details</span>
                    <button
                        type="button"
                        onClick={() => handleAddRow(productionDetailsArray)}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {productionDetailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveRow(productionDetailsArray, index)}
                                disabled={productionDetailsArray.fields.length <= 1}
                            >
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.operationNo`}
                                    placeholder="Op No"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.machine`}
                                    options={machineOptions}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.machineName`}
                                    placeholder="Machine Name"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.machineHourRate`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.labourHourRate`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.operationName`}
                                    placeholder="Op Name"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.frTimeHrs`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.frTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.toTimeHrs`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.toTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.lunchTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.totTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.stoppageTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.productiveHrsMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyProduced`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyPassed`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyRejected`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.reason`}
                                    options={REASONS}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyRework`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.noOfTools`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyScrap`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.operationBy`}
                                    options={employeeOptions}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.remarks`}
                                    placeholder="Remarks"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.stdRunTimePerPcsSec`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.stdLabourCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.stdMCCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.runningActLabourCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.runningActMCCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.stdToolCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.runningActToolCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.stdConsumCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.runningActConsumCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const renderToolDetailsTab = () => {
        const headers = ["S.No", "Tool No", "Tool Name", "Strikes", "Strikes Rate", "Tool Value", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add tool details</span>
                    <button
                        type="button"
                        onClick={() => handleAddRow(toolDetailsArray)}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {toolDetailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveRow(toolDetailsArray, index)}
                                disabled={toolDetailsArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`toolDetails.${index}.toolNo`}
                                    options={toolOptions}
                                    errors={errors}
                                    placeholder="Select an option"
                                />
                                <InputCell
                                    control={control}
                                    name={`toolDetails.${index}.toolName`}
                                    placeholder="Tool Name"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`toolDetails.${index}.strikes`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`toolDetails.${index}.strikesRate`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`toolDetails.${index}.toolValue`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const renderStoppageReasonTab = () => {
        const headers = ["S.No", "Fr.Time(Hrs.)", "Fr.Time(Mins.)", "To Time(Hrs.)", "To Time(Mins.)", "Tot. Time in Mins.", "Reason", "Description", "Stopage M/C Cost", "Stopage Labour Cost", "Remarks", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add stoppage reasons</span>
                    <button
                        type="button"
                        onClick={() => handleAddRow(stoppageDetailsArray)}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {stoppageDetailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveRow(stoppageDetailsArray, index)}
                                disabled={stoppageDetailsArray.fields.length <= 1}
                            >
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.frTimeHrs`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.frTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.toTimeHrs`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.toTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.totTimeMins`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`stoppageDetails.${index}.reason`}
                                    options={REASONS}
                                    errors={errors}
                                    placeholder="Select an option"
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.description`}
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.stoppageMCCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.stoppageLabourCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`stoppageDetails.${index}.remarks`}
                                    placeholder="Remarks"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const renderReworkReasonTab = () => {
        const headers = ["S.No", "Reason", "Reason Description", "Qty.", "Time per qty.", "Rework Prod.Hrs", "Rework M/C Cost", "Rework Labour Cost", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add rework reasons</span>
                    <button
                        type="button"
                        onClick={() => handleAddRow(reworkDetailsArray)}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {reworkDetailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveRow(reworkDetailsArray, index)}
                                disabled={reworkDetailsArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`reworkDetails.${index}.reason`}
                                    options={REASONS}
                                    errors={errors}
                                    placeholder="Select an option"
                                />
                                <InputCell
                                    control={control}
                                    name={`reworkDetails.${index}.reasonDescription`}
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`reworkDetails.${index}.qty`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`reworkDetails.${index}.timePerQty`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`reworkDetails.${index}.reworkProdHrs`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`reworkDetails.${index}.reworkMCCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`reworkDetails.${index}.reworkLabourCost`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const renderScrapDetailsTab = () => {
        const headers = ["S.No", "Scrap Id", "Scrap Description", "Weight", "Qty", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add scrap details</span>
                    <button
                        type="button"
                        onClick={() => handleAddRow(scrapDetailsArray)}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {scrapDetailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveRow(scrapDetailsArray, index)}
                                disabled={scrapDetailsArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`scrapDetails.${index}.scrapId`}
                                    options={scrapOptions}
                                    errors={errors}
                                    placeholder="Select an option"
                                />
                                <InputCell
                                    control={control}
                                    name={`scrapDetails.${index}.scrapDescription`}
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`scrapDetails.${index}.weight`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`scrapDetails.${index}.qty`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const renderProductionSummaryTab = () => (
        <div className="pt-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputField
                    control={control}
                    name="totalLabourCost"
                    label="Total Labour Cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    errors={errors}
                />
                <InputField
                    control={control}
                    name="totalMachineCost"
                    label="Total Machine Cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    errors={errors}
                />
                <InputField
                    control={control}
                    name="totalToolCost"
                    label="Total Tool Cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    errors={errors}
                />
                <InputField
                    control={control}
                    name="totalConsumablesCost"
                    label="Total Consumables Cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    errors={errors}
                />
            </div>

            <div className="col-span-1 md:col-span-2 xl:col-span-3">
                <InputField
                    control={control}
                    name="narration"
                    label="Narration"
                    placeholder="Enter narration..."
                    errors={errors}
                />
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
                    {data ? "Edit Production Entry" : "Add Production Entry"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
                <div>
                    <SectionHeader>Production Entry</SectionHeader>
                    {renderHeader()}
                </div>

                {/* Tabs */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab("productionDetail")}
                            className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "productionDetail"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Detail
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("toolDetails")}
                            className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "toolDetails"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Tool Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("stoppageReason")}
                            className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "stoppageReason"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Stoppage Reason
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("reworkReason")}
                            className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "reworkReason"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Rework Reason
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("scrapDetails")}
                            className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "scrapDetails"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Scrap Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("productionSummary")}
                            className={`px-3 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === "productionSummary"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Summary
                        </button>
                    </div>

                    {activeTab === "productionDetail" && renderProductionDetailTab()}
                    {activeTab === "toolDetails" && renderToolDetailsTab()}
                    {activeTab === "stoppageReason" && renderStoppageReasonTab()}
                    {activeTab === "reworkReason" && renderReworkReasonTab()}
                    {activeTab === "scrapDetails" && renderScrapDetailsTab()}
                    {activeTab === "productionSummary" && renderProductionSummaryTab()}
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

export default ProductionEntryForm;