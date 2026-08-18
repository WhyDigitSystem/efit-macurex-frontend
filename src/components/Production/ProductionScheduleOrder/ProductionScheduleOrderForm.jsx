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
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
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
        const startDay = startOfMonth.day();
        const daysInMonth = month.daysInMonth();

        const days = [];

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Days of current month
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
                            {/* Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={field.value || ""}
                                    placeholder="DD-MM-YYYY"
                                    readOnly
                                    onClick={() => setOpen((prev) => !prev)}
                                    className={`${controlClasses}
                                        cursor-pointer pr-8
                                        ${errorMessage
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                        }`}
                                />

                                <Calendar
                                    size={15}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                />
                            </div>

                            {/* Calendar Popup */}
                            {open && (
                                <div className="absolute z-[9999] mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3">

                                    {/* Month Header */}
                                    <div className="flex items-center justify-between mb-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.subtract(
                                                        1,
                                                        "month"
                                                    )
                                                )
                                            }
                                            className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                        >
                                            ‹
                                        </button>

                                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                                            {currentMonth.format(
                                                "MMMM YYYY"
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.add(
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

                                    {/* Calendar Days */}
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

const SCHEDULE_ORDER_TYPES = ["Production", "Sub-Contract", "Repair", "Re-work"];
const ITEM_TYPES = ["FG", "SFG", "Raw Material", "Semi-Finished", "Finished Goods"];
const YES_NO = ["Yes", "No"];

// ===================== Utility Functions =====================

const fmtDate = (value) =>
    value ? dayjs(value).format("DD-MM-YYYY") : "";

// ===================== Default Values =====================

const getDefaultProductionDetailRow = () => ({
    itemCode: "",
    itemDescription: "",
    itemType: "",
    bomQty: "",
    qtyRequired: "",
    unit: "",
    scrapQty: "",
    scrapUnit: "",
});

const getDefaultScheduleRow = () => ({
    scheduledDate: dayjs().format("DD-MM-YYYY"),
    qty: "",
    remarks: "",
});

const getDefaultValues = () => ({
    plantId: "",
    scheduleOrderNo: "",
    scheduleOrderType: "",
    date: dayjs().format("DD-MM-YYYY"),
    lcPoNo: "",
    lcPoDate: "",
    fgItemCode: "",
    fgItemDescription: "",
    compRouteNo: "",
    bomId: "",
    scheduleStartDate: dayjs().format("DD-MM-YYYY"),
    scheduleEndDate: dayjs().format("DD-MM-YYYY"),
    batchQty: "",
    shortClosed: "No",
    totalQty: 0,
    productionDetails: [getDefaultProductionDetailRow()],
    schedules: [getDefaultScheduleRow()],
});

// ===================== Main Component =====================

const ProductionScheduleOrderForm = ({ data, onBack }) => {
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
    const isUpdatingRef = useRef(false);
    const dataLoadedRef = useRef(false);

    // Lookup data states
    const [plantOptions, setPlantOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [unitOptions, setUnitOptions] = useState([]);
    const [routeOptions, setRouteOptions] = useState([]);
    const [bomOptions, setBomOptions] = useState([]);
    const [lcPoOptions, setLcPoOptions] = useState([]);

    const defaults = useCallback(() => {
        const base = getDefaultValues();
        if (data) {
            base.plantId = data.plant?.id ?? data.plantId ?? "";
            base.scheduleOrderNo = data.scheduleOrderNo || data.docId || "";
            base.scheduleOrderType = data.scheduleOrderType || "";
            base.date = fmtDate(data.date || data.docDate);
            base.lcPoNo = data.lcPoNo || "";
            base.lcPoDate = fmtDate(data.lcPoDate);
            base.fgItemCode = data.fgItem?.id ?? data.fgItemCode ?? "";
            base.fgItemDescription = data.fgItem?.itemDescription || data.fgItemDescription || "";
            base.compRouteNo = data.compRouteNo || "";
            base.bomId = data.bomId || "";
            base.scheduleStartDate = fmtDate(data.scheduleStartDate);
            base.scheduleEndDate = fmtDate(data.scheduleEndDate);
            base.batchQty = data.batchQty || "";
            base.shortClosed = data.shortClosed === true ? "Yes" : data.shortClosed === false ? "No" : data.shortClosed || "No";
            base.totalQty = data.totalQty || 0;
            base.productionDetails = data.productionDetails?.length
                ? data.productionDetails
                : [getDefaultProductionDetailRow()];
            base.schedules = data.schedules?.length
                ? data.schedules
                : [getDefaultScheduleRow()];
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

    const productionDetailArray = useFieldArray({
        control,
        name: "productionDetails",
    });

    const schedulesArray = useFieldArray({
        control,
        name: "schedules",
    });

    const watchProductionDetails = watch("productionDetails");
    const watchSchedules = watch("schedules");

    // ===================== Load Data for Edit =====================

    const loadProductionScheduleOrderData = useCallback(async (orderId) => {
        if (!orderId) return;

        setLoading(true);
        try {
            const response = await productionScheduleOrderAPI.getProductionScheduleOrderById(orderId);
            console.log("Production Schedule Order Data:", response);

            if (response) {
                const order = response;

                setValue("plantId", order.plant?.id || "");
                setValue("scheduleOrderNo", order.docId || "");
                setValue("scheduleOrderType", order.scheduleOrderType || "");
                setValue("date", order.docDate || "");
                setValue("lcPoNo", order.lcPoNo || "");
                setValue("lcPoDate", order.lcPoDate || "");
                setValue("fgItemCode", order.fgItem?.id || "");
                setValue("fgItemDescription", order.fgItem?.itemDescription || "");
                setValue("compRouteNo", order.compRouteNo || "");
                setValue("bomId", order.bomId || "");
                setValue("scheduleStartDate", order.scheduleStartDate || "");
                setValue("scheduleEndDate", order.scheduleEndDate || "");
                setValue("batchQty", order.batchQty || "");
                setValue("shortClosed", order.shortClosed ? "Yes" : "No");
                setValue("totalQty", order.totalQty || 0);

                if (order.productionDetails?.length > 0) {
                    const details = order.productionDetails.map(item => ({
                        itemCode: item.item?.id || "",
                        itemDescription: item.item?.itemDescription || "",
                        itemType: item.itemType || "",
                        bomQty: item.bomQty || "",
                        qtyRequired: item.qtyRequired || "",
                        unit: item.unit?.id || "",
                        scrapQty: item.scrapQty || "",
                        scrapUnit: item.scrapUnit || "",
                    }));
                    productionDetailArray.replace(details);
                }

                if (order.schedules?.length > 0) {
                    schedulesArray.replace(order.schedules);
                }

                addToast("Production Schedule Order loaded successfully", "success");
            } else {
                addToast("Failed to load Production Schedule Order data", "error");
            }
        } catch (error) {
            console.error("Error loading production schedule order:", error);
            addToast("Failed to load Production Schedule Order data", "error");
        } finally {
            setLoading(false);
        }
    }, [setValue, productionDetailArray, schedulesArray, addToast]);

    useEffect(() => {
        const orderId = data?.id;

        if (!orderId) return;

        if (dataLoadedRef.current === orderId) {
            return;
        }

        dataLoadedRef.current = orderId;
        loadProductionScheduleOrderData(orderId);
    }, [data?.id, loadProductionScheduleOrderData]);

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

    const loadRoutes = useCallback(async () => {
        try {
            // Assuming there's a route API - adjust as needed
            const res = await productionScheduleOrderAPI.getRoutes(orgId, branch) || [];
            setRouteOptions(
                (res || []).map((r) => ({
                    value: r.id || r.routeNo,
                    label: r.routeName || r.routeNo || r.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load route options:", error);
            setRouteOptions([]);
        }
    }, [orgId, branch]);

    const loadBOMs = useCallback(async () => {
        try {
            // Assuming there's a BOM API - adjust as needed
            const res = await productionScheduleOrderAPI.getBOMs(orgId, branch) || [];
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

    const loadLCPOs = useCallback(async () => {
        try {
            // Assuming there's a PO/LC API - adjust as needed
            const res = await productionScheduleOrderAPI.getLCPOs(orgId, branch) || [];
            setLcPoOptions(
                (res || []).map((p) => ({
                    value: p.id || p.poNo,
                    label: p.poNo || p.lcNo || p.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load LC PO options:", error);
            setLcPoOptions([]);
        }
    }, [orgId, branch]);

    useEffect(() => {
        if (orgId) {
            loadPlants();
            loadItems();
            loadUnits();
            loadRoutes();
            loadBOMs();
            loadLCPOs();
        }
    }, [
        orgId,
        loadPlants,
        loadItems,
        loadUnits,
        loadRoutes,
        loadBOMs,
        loadLCPOs,
    ]);

    // ===================== Handlers =====================

    const handleFGItemChange = (id) => {
        const item = itemMap[id];
        setValue("fgItemCode", id, { shouldDirty: true });
        setValue("fgItemDescription", item?.itemDescription || "", { shouldDirty: true });
    };

    const handleProductionItemChange = (idx, field, value) => {
        setValue(`productionDetails.${idx}.${field}`, value, { shouldDirty: true });

        if (field === "itemCode") {
            const item = itemMap[value];
            setValue(`productionDetails.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });
            setValue(`productionDetails.${idx}.unit`, item?.primaryUnits?.id || "", { shouldDirty: true });
        }
    };

    const calculateTotalQty = useCallback(() => {
        const productionDetails = watchProductionDetails || [];
        let total = 0;
        productionDetails.forEach(item => {
            total += Number(item.qtyRequired) || 0;
        });
        setValue("totalQty", total, { shouldDirty: true });
    }, [watchProductionDetails, setValue]);

    useEffect(() => {
        calculateTotalQty();
    }, [watchProductionDetails, calculateTotalQty]);

    const handleAddProductionDetail = () => {
        productionDetailArray.append(getDefaultProductionDetailRow());
    };

    const handleRemoveProductionDetail = (index) => {
        if (productionDetailArray.fields.length > 1) productionDetailArray.remove(index);
    };

    const handleAddSchedule = () => {
        schedulesArray.append({
            ...getDefaultScheduleRow(),
            scheduledDate: dayjs().format("DD-MM-YYYY"),
        });
    };

    const handleRemoveSchedule = (index) => {
        if (schedulesArray.fields.length > 1) schedulesArray.remove(index);
    };

    // ===================== Validation & Save =====================

    const validate = () => {
        const fundErrors = [];
        if (!watch("plantId")) fundErrors.push("Plant");
        if (!watch("fgItemCode")) fundErrors.push("FG / SFG Item Code");
        if (!watch("date")) fundErrors.push("Date");
        if (!watch("batchQty")) fundErrors.push("Batch Qty");
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
            batchQty: parseFloat(formData.batchQty) || 0,
            bomId: formData.bomId || "",
            branch: branch,
            compRouteNo: formData.compRouteNo || "",
            createdBy: usersId || "admin",
            date: formatDateForAPI(formData.date) || "",
            fgItem: formData.fgItemCode ? parseInt(formData.fgItemCode) : 0,
            id: isUpdate ? parseInt(data.id) : 0,
            lcPoDate: formatDateForAPI(formData.lcPoDate) || "",
            lcPoNo: formData.lcPoNo || "",
            orgId: orgId,
            plant: formData.plantId ? parseInt(formData.plantId) : 0,
            scheduleEndDate: formatDateForAPI(formData.scheduleEndDate) || "",
            scheduleOrderNo: formData.scheduleOrderNo || "",
            scheduleOrderType: formData.scheduleOrderType || "",
            scheduleStartDate: formatDateForAPI(formData.scheduleStartDate) || "",
            shortClosed: formData.shortClosed === "Yes" ? 1 : 0,
            totalQty: formData.totalQty || 0,
            productionDetails: (formData.productionDetails || [])
                .filter((r) => r.itemCode?.trim())
                .map((item) => ({
                    item: itemMap[item.itemCode]?.id ? parseInt(itemMap[item.itemCode].id) : 0,
                    itemType: item.itemType || "",
                    bomQty: parseFloat(item.bomQty) || 0,
                    qtyRequired: parseFloat(item.qtyRequired) || 0,
                    unit: item.unit || "",
                    scrapQty: parseFloat(item.scrapQty) || 0,
                    scrapUnit: item.scrapUnit || "",
                })),
            schedules: (formData.schedules || [])
                .filter((r) => r.scheduledDate)
                .map((item) => ({
                    scheduledDate: formatDateForAPI(item.scheduledDate) || "",
                    qty: parseFloat(item.qty) || 0,
                    remarks: item.remarks || "",
                })),
        };

        if (!isUpdate) {
            delete payload.id;
        }

        console.log("Saving Production Schedule Order Payload:", payload);

        try {
            const response = await productionScheduleOrderAPI.createUpdateProductionScheduleOrder(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Production Schedule Order updated successfully!"
                        : "Production Schedule Order created successfully!"),
                    "success"
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.message ||
                    response?.paramObjectsMap?.message ||
                    "Failed to save Production Schedule Order.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save Production Schedule Order Error:", err);
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
                name="scheduleOrderNo"
                label="Sch. Order No"
                placeholder="Auto"
                readOnly={!data}
                errors={errors}
            />

            <SelectField
                control={control}
                name="scheduleOrderType"
                label="Sch. Order Type"
                options={SCHEDULE_ORDER_TYPES}
                errors={errors}
                placeholder="Select an option"
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
                name="lcPoNo"
                label="LC PO No."
                options={lcPoOptions}
                errors={errors}
                placeholder="Select an option"
            />

            <DatePickerField
                control={control}
                name="lcPoDate"
                label="LC PO Date"
                errors={errors}
            />

            <SelectField
                control={control}
                name="fgItemCode"
                label="FG / SFG Item Code *"
                options={itemOptions}
                required
                errors={errors}
                onChange={handleFGItemChange}
                placeholder="Select an option"
            />

            <InputField
                control={control}
                name="fgItemDescription"
                label="FG / SFG Item Desc."
                readOnly
                errors={errors}
            />

            <SelectField
                control={control}
                name="compRouteNo"
                label="Comp.Route No."
                options={routeOptions}
                errors={errors}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="bomId"
                label="BOM Id"
                options={bomOptions}
                errors={errors}
                placeholder="Select an option"
            />

            <DatePickerField
                control={control}
                name="scheduleStartDate"
                label="Schedule St.Date"
                errors={errors}
            />

            <DatePickerField
                control={control}
                name="scheduleEndDate"
                label="Schedule End Date"
                errors={errors}
            />

            <InputField
                control={control}
                name="batchQty"
                label="Batch Qty *"
                type="number"
                step="0.001"
                required
                placeholder="0.000"
                errors={errors}
            />
        </div>
    );

    const renderProductionDetailTab = () => {
        const headers = ["S.No", "Item Code", "Item Description", "Item Type", "BOM Qty", "Qty Required", "Unit", "Scrap Qty", "Scrap Unit", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add items to production detail</span>
                    <button
                        type="button"
                        onClick={handleAddProductionDetail}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {productionDetailArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveProductionDetail(index)}
                                disabled={productionDetailArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.itemCode`}
                                    options={itemOptions}
                                    errors={errors}
                                    onChange={(v) => handleProductionItemChange(index, "itemCode", v)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.itemDescription`}
                                    readOnly
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.itemType`}
                                    options={ITEM_TYPES}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.bomQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyRequired`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.unit`}
                                    options={unitOptions}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.scrapQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.scrapUnit`}
                                    placeholder="Unit"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const DatePickerCell = ({
        control,
        name,
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
            const startDay = month.startOf("month").day();
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
            <td className="p-2 align-top min-w-[150px]">
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => {
                        const selectedDate = field.value
                            ? dayjs(field.value, "DD-MM-YYYY", true)
                            : null;

                        return (
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={field.value || ""}
                                        placeholder="DD-MM-YYYY"
                                        readOnly
                                        onClick={() =>
                                            setOpen((prev) => !prev)
                                        }
                                        className={`${controlClasses} pr-7 cursor-pointer ${errorMessage
                                            ? "border-red-500"
                                            : ""
                                            }`}
                                    />

                                    <Calendar
                                        size={14}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                    />
                                </div>

                                {open && (
                                    <div className="absolute z-[9999] mt-1 left-0 w-[250px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3">

                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentMonth((prev) =>
                                                        prev.subtract(
                                                            1,
                                                            "month"
                                                        )
                                                    )
                                                }
                                                className="h-6 w-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                ‹
                                            </button>

                                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                                                {currentMonth.format(
                                                    "MMMM YYYY"
                                                )}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentMonth((prev) =>
                                                        prev.add(
                                                            1,
                                                            "month"
                                                        )
                                                    )
                                                }
                                                className="h-6 w-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                ›
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7">
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
                                                    className="text-center text-[9px] text-gray-500 py-1"
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {getCalendarDays(currentMonth).map(
                                                (date, index) =>
                                                    date ? (
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
                                                            h-7 w-7 rounded-full text-[10px]
                                                            ${selectedDate?.isValid() &&
                                                                    date.isSame(
                                                                        selectedDate,
                                                                        "day"
                                                                    )
                                                                    ? "bg-blue-600 text-white"
                                                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                                                }
                                                        `}
                                                        >
                                                            {date.date()}
                                                        </button>
                                                    ) : (
                                                        <div
                                                            key={index}
                                                            className="h-7"
                                                        />
                                                    )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />

                {errorMessage && (
                    <p className="text-red-500 text-[9px] mt-0.5">
                        {errorMessage}
                    </p>
                )}
            </td>
        );
    };

    const renderSchedulesTab = () => {
        const headers = ["S.No", "Scheduled Date", "Qty", "Remarks", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add production schedules</span>
                    <button
                        type="button"
                        onClick={handleAddSchedule}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {schedulesArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveSchedule(index)}
                                disabled={schedulesArray.fields.length <= 1}
                            >
                                <DatePickerCell
                                    control={control}
                                    name={`schedules.${index}.scheduledDate`}
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`schedules.${index}.qty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`schedules.${index}.remarks`}
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

    const renderSummaryTab = () => {
        const totalQty = watch("totalQty") || 0;

        return (
            <div className="pt-2 space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                        <label className={labelClasses}>Total Qty</label>
                        <div className="text-sm font-medium text-gray-900 dark:text-white border rounded p-2 bg-gray-50 dark:bg-gray-800">
                            {totalQty.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Short Closed?</label>
                        <SelectCell
                            control={control}
                            name={`productionSummary.shortClosed`}
                            options={YES_NO}
                            errors={errors}
                            placeholder="Select"
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        Submit
                    </button>
                </div>
            </div>
        );
    };

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
                    {data ? "Edit Production Schedule Order" : "Add Production Schedule Order"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
                <div>
                    <SectionHeader>Production Schedule Order</SectionHeader>
                    {renderHeader()}
                </div>

                {/* Tabs */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("productionDetail")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "productionDetail"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Detail
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("schedules")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "schedules"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Schedules
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("summary")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "summary"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Summary
                        </button>
                    </div>

                    {activeTab === "productionDetail" && renderProductionDetailTab()}
                    {activeTab === "schedules" && renderSchedulesTab()}
                    {activeTab === "summary" && renderSummaryTab()}
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

export default ProductionScheduleOrderForm;