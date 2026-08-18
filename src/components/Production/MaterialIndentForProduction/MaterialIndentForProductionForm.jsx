import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Calendar,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import materialIndentForProductionAPI from "../../../api/Production/materialIndentForProductionAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";

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

// ===================== Utility Functions =====================

const fmtDate = (value) =>
    value ? dayjs(value).format("DD-MM-YYYY") : "";
const fmtTime = (value) => {
    if (!value) return dayjs().format("HH:mm:ss");
    return value;
};

// ===================== Default Values =====================

const getDefaultItemDetailRow = () => ({
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
    belongsTo: "",
    itemDescription: "",
    fgItemCode: "",
    schQty: "",
    scheduledDate: dayjs().format("DD-MM-YYYY"),
    indentTime: dayjs().format("HH:mm:ss"),
    toLocation: "",
    fromLocation: "",
    approvedByPM: "No",
    preparedBy: "",
    authorisedBy: "",
    remarks: "",
    itemDetails: [getDefaultItemDetailRow()],
});

// ===================== Main Component =====================

const MaterialIndentForProductionForm = ({ data, onBack }) => {
    const { addToast } = useToast();
    const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
    const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
    const usersId = localStorage.getItem("usersId");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
    const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

    const [activeTab, setActiveTab] = useState("itemDetails");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isUpdatingRef = useRef(false);
    const dataLoadedRef = useRef(false);

    // Lookup data states
    const [plantOptions, setPlantOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [unitOptions, setUnitOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);

    const defaults = useCallback(() => {
        const base = getDefaultValues();
        if (data) {
            base.plantId = data.plant?.id ?? data.plantId ?? "";
            base.indentNo = data.indentNo || data.docId || "";
            base.indentDate = fmtDate(data.indentDate || data.docDate);
            base.department = data.department?.id ?? data.department ?? "";
            base.scheduleOrderNo = data.scheduleOrder?.id ?? data.scheduleOrderNo ?? "";
            base.belongsTo = data.belongsTo || "";
            base.itemDescription = data.itemDescription || "";
            base.fgItemCode = data.fgItem?.id ?? data.fgItemCode ?? "";
            base.schQty = data.schQty || "";
            base.scheduledDate = fmtDate(data.scheduledDate);
            base.indentTime = data.indentTime || dayjs().format("HH:mm:ss");
            base.toLocation = data.toLocation?.id ?? data.toLocation ?? "";
            base.fromLocation = data.fromLocation?.id ?? data.fromLocation ?? "";
            base.approvedByPM = data.approvedByPM === true ? "Yes" : data.approvedByPM === false ? "No" : data.approvedByPM || "No";
            base.preparedBy = data.preparedBy?.id ?? data.preparedBy ?? "";
            base.authorisedBy = data.authorisedBy?.id ?? data.authorisedBy ?? "";
            base.remarks = data.remarks || "";
            base.itemDetails = data.itemDetails?.length
                ? data.itemDetails
                : [getDefaultItemDetailRow()];
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

    const itemDetailsArray = useFieldArray({
        control,
        name: "itemDetails",
    });

    const watchItemDetails = watch("itemDetails");

    // ===================== Load Data for Edit =====================

    const loadMaterialIndentData = useCallback(async (indentId) => {
        if (!indentId) return;

        setLoading(true);
        try {
            const response = await materialIndentForProductionAPI.getMaterialIndentById(indentId);
            console.log("Material Indent Data:", response);

            if (response) {
                const indent = response;

                setValue("plantId", indent.plant?.id || "");
                setValue("indentNo", indent.docId || "");
                setValue(
                    "indentDate",
                    indent.docDate
                        ? dayjs(indent.docDate).format("DD-MM-YYYY")
                        : ""
                );
                setValue("department", indent.department?.id || "");
                setValue("scheduleOrderNo", indent.scheduleOrder?.id || "");
                setValue("belongsTo", indent.belongsTo || "");
                setValue("itemDescription", indent.itemDescription || "");
                setValue("fgItemCode", indent.fgItem?.id || "");
                setValue("schQty", indent.schQty || "");
                setValue(
                    "scheduledDate",
                    indent.scheduledDate
                        ? dayjs(indent.scheduledDate).format("DD-MM-YYYY")
                        : ""
                );
                setValue("indentTime", indent.indentTime || "");
                setValue("toLocation", indent.toLocation?.id || "");
                setValue("fromLocation", indent.fromLocation?.id || "");
                setValue("approvedByPM", indent.approvedByPM ? "Yes" : "No");
                setValue("preparedBy", indent.preparedBy?.id || "");
                setValue("authorisedBy", indent.authorisedBy?.id || "");
                setValue("remarks", indent.remarks || "");

                if (indent.itemDetails?.length > 0) {
                    const details = indent.itemDetails.map(item => ({
                        itemCode: item.item?.id || "",
                        itemDescription: item.item?.itemDescription || "",
                        unit: item.unit?.id || "",
                        schQty: item.schQty || "",
                        stockAvailable: item.stockAvailable || 0,
                        requiredQty: item.requiredQty || "",
                    }));
                    itemDetailsArray.replace(details);
                }

                addToast("Material Indent loaded successfully", "success");
            } else {
                addToast("Failed to load Material Indent data", "error");
            }
        } catch (error) {
            console.error("Error loading material indent:", error);
            addToast("Failed to load Material Indent data", "error");
        } finally {
            setLoading(false);
        }
    }, [setValue, itemDetailsArray, addToast]);

    useEffect(() => {
        const indentId = data?.id;

        if (!indentId) return;

        if (dataLoadedRef.current === indentId) {
            return;
        }

        dataLoadedRef.current = indentId;
        loadMaterialIndentData(indentId);
    }, [data?.id, loadMaterialIndentData]);

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

    const loadDepartments = useCallback(async () => {
        try {
            const res = await departmentAPI.getDepartments(orgId, branch);
            setDepartmentOptions(
                (res || []).map((d) => ({
                    value: d.id,
                    label: d.departmentName || d.name || d.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load department options:", error);
            setDepartmentOptions([]);
        }
    }, [orgId, branch]);

    const loadScheduleOrders = useCallback(async () => {
        try {
            const res = await materialIndentForProductionAPI.getScheduleOrders(orgId, branch);
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

    useEffect(() => {
        if (orgId) {
            loadPlants();
            loadDepartments();
            loadScheduleOrders();
            loadItems();
            loadUnits();
            loadLocations();
            loadEmployees();
        }
    }, [
        orgId,
        loadPlants,
        loadDepartments,
        loadScheduleOrders,
        loadItems,
        loadUnits,
        loadLocations,
        loadEmployees,
    ]);

    // ===================== Handlers =====================

    const handleFGItemChange = (id) => {
        const item = itemMap[id];
        setValue("fgItemCode", id, { shouldDirty: true });
        setValue("itemDescription", item?.itemDescription || "", { shouldDirty: true });
    };

    const handleItemDetailChange = (idx, field, value) => {
        setValue(`itemDetails.${idx}.${field}`, value, { shouldDirty: true });

        if (field === "itemCode") {
            const item = itemMap[value];
            setValue(`itemDetails.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });
            setValue(`itemDetails.${idx}.unit`, item?.primaryUnits?.id || "", { shouldDirty: true });
        }
    };

    const handleAddItemDetail = () => {
        itemDetailsArray.append(getDefaultItemDetailRow());
    };

    const handleRemoveItemDetail = (index) => {
        if (itemDetailsArray.fields.length > 1) itemDetailsArray.remove(index);
    };

    // ===================== Validation & Save =====================

    const validate = () => {
        const fundErrors = [];
        if (!watch("plantId")) fundErrors.push("Plant");
        if (!watch("indentDate")) fundErrors.push("Indent Date");
        if (!watch("belongsTo")) fundErrors.push("Belongs To");
        if (!watch("fgItemCode")) fundErrors.push("FG/SFG Item Code");
        if (!watch("scheduledDate")) fundErrors.push("Scheduled Date");
        if (!watch("toLocation")) fundErrors.push("To Location");
        if (!watch("preparedBy")) fundErrors.push("Prepared By");
        if (!watch("authorisedBy")) fundErrors.push("Authorised By");
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
            approvedByPM: formData.approvedByPM === "Yes" ? 1 : 0,
            authorisedBy: formData.authorisedBy ? parseInt(formData.authorisedBy) : 0,
            belongsTo: formData.belongsTo || "",
            branch: branch,
            createdBy: usersId || "admin",
            department: formData.department ? parseInt(formData.department) : 0,
            fgItem: formData.fgItemCode ? parseInt(formData.fgItemCode) : 0,
            fromLocation: formData.fromLocation ? parseInt(formData.fromLocation) : 0,
            id: isUpdate ? parseInt(data.id) : 0,
            indentDate: formatDateForAPI(formData.indentDate) || "",
            indentNo: formData.indentNo || "",
            indentTime: formData.indentTime || "",
            itemDescription: formData.itemDescription || "",
            orgId: orgId,
            plant: formData.plantId ? parseInt(formData.plantId) : 0,
            preparedBy: formData.preparedBy ? parseInt(formData.preparedBy) : 0,
            remarks: formData.remarks || "",
            scheduleOrder: formData.scheduleOrderNo ? parseInt(formData.scheduleOrderNo) : 0,
            scheduledDate: formatDateForAPI(formData.scheduledDate) || "",
            schQty: parseFloat(formData.schQty) || 0,
            toLocation: formData.toLocation ? parseInt(formData.toLocation) : 0,
            itemDetails: (formData.itemDetails || [])
                .filter((r) => r.itemCode?.trim())
                .map((item) => ({
                    item: itemMap[item.itemCode]?.id ? parseInt(itemMap[item.itemCode].id) : 0,
                    schQty: parseFloat(item.schQty) || 0,
                    requiredQty: parseFloat(item.requiredQty) || 0,
                    stockAvailable: parseFloat(item.stockAvailable) || 0,
                    unit: item.unit || "",
                })),
        };

        if (!isUpdate) {
            delete payload.id;
        }

        console.log("Saving Material Indent Payload:", payload);

        try {
            const response = await materialIndentForProductionAPI.createUpdateMaterialIndent(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Material Indent updated successfully!"
                        : "Material Indent created successfully!"),
                    "success"
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.message ||
                    response?.paramObjectsMap?.message ||
                    "Failed to save Material Indent.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save Material Indent Error:", err);
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
                label="Plant Id"
                options={plantOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <InputField
                control={control}
                name="indentNo"
                label="Indent No."
                placeholder="Auto"
                readOnly={!data}
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
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="scheduleOrderNo"
                label="Sch. Order No."
                options={scheduleOrderOptions}
                errors={errors}
                placeholder="Select an option"
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

            <SelectField
                control={control}
                name="fgItemCode"
                label="FG/SFG Item Code"
                options={itemOptions}
                required
                errors={errors}
                onChange={handleFGItemChange}
                placeholder="Select an option"
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
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="fromLocation"
                label="From Location"
                options={locationOptions}
                errors={errors}
                placeholder="Select an option"
            />
        </div>
    );

    const renderItemDetailsTab = () => {
        const headers = ["S.No", "Item Code", "Item Description", "Unit", "Sch. Qty", "Stock Available", "Required Qty", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Add items to the indent</span>
                    <button
                        type="button"
                        onClick={handleAddItemDetail}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {itemDetailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveItemDetail(index)}
                                disabled={itemDetailsArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`itemDetails.${index}.itemCode`}
                                    options={itemOptions}
                                    errors={errors}
                                    onChange={(v) => handleItemDetailChange(index, "itemCode", v)}
                                />
                                <InputCell
                                    control={control}
                                    name={`itemDetails.${index}.itemDescription`}
                                    readOnly
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`itemDetails.${index}.unit`}
                                    options={unitOptions}
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`itemDetails.${index}.schQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`itemDetails.${index}.stockAvailable`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.0000"
                                    readOnly
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`itemDetails.${index}.requiredQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const renderMaterialSummaryTab = () => (
        <div className="pt-2 space-y-4">
            <div className={subTabFieldGrid}>
                <SelectField
                    control={control}
                    name="approvedByPM"
                    label="Approved By PM"
                    options={YES_NO}
                    required
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
                    name="authorisedBy"
                    label="Authorised By"
                    options={employeeOptions}
                    required
                    errors={errors}
                    placeholder="Select an option"
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
                    {data ? "Edit Material Indent" : "Add Material Indent"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
                <div>
                    <SectionHeader>Material Indent For Production</SectionHeader>
                    {renderHeader()}
                </div>

                {/* Tabs */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("itemDetails")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "itemDetails"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Item Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("materialSummary")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "materialSummary"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Material Summary
                        </button>
                    </div>

                    {activeTab === "itemDetails" && renderItemDetailsTab()}
                    {activeTab === "materialSummary" && renderMaterialSummaryTab()}
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

export default MaterialIndentForProductionForm;