import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Calendar,
    FilePlus2,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import pmChecklistMasterAPI, {
    PM_CHECKLIST_FOR_OPTIONS,
    FREQUENCY_OPTIONS,
} from "../../../api/plantMaintenance/pmChecklistMasterAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import branchAPI from "../../../api/branchAPI";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
    "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-4 items-start";

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

const SelectField = ({
    control,
    name,
    label,
    options,
    required,
    errors,
    placeholder = "-- Select --",
    disabled,
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
                                    onClick={() => setOpen((prev) => !prev)}
                                    className={`${controlClasses} cursor-pointer pr-8 ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                                />
                                <Calendar
                                    size={15}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                />
                            </div>
                            {open && (
                                <div className="absolute z-[9999] mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.subtract(1, "month")
                                                )
                                            }
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        >
                                            &#8249;
                                        </button>
                                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                            {currentMonth.format("MMMM YYYY")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.add(1, "month")
                                                )
                                            }
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        >
                                            &#8250;
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                            (d) => (
                                                <div
                                                    key={d}
                                                    className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400"
                                                >
                                                    {d}
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {getCalendarDays(currentMonth).map(
                                            (day, idx) => {
                                                if (!day) {
                                                    return (
                                                        <div
                                                            key={`empty-${idx}`}
                                                        />
                                                    );
                                                }
                                                const isToday =
                                                    day.isSame(dayjs(), "day");
                                                const isSelected =
                                                    selectedDate &&
                                                    day.isSame(selectedDate, "day");
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            field.onChange(
                                                                day.format("DD-MM-YYYY")
                                                            );
                                                            setOpen(false);
                                                        }}
                                                        className={`text-[11px] p-1.5 rounded ${
                                                            isSelected
                                                                ? "bg-blue-600 text-white"
                                                                : isToday
                                                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                        }`}
                                                    >
                                                        {day.date()}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            field.onChange(dayjs().format("DD-MM-YYYY"));
                                            setOpen(false);
                                        }}
                                        className="mt-2 w-full text-[11px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded py-1"
                                    >
                                        Today
                                    </button>
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

const TextareaField = ({
    control,
    name,
    label,
    required,
    placeholder,
    errors,
    rows = 2,
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
                    <textarea
                        {...field}
                        rows={rows}
                        placeholder={placeholder}
                        className={`w-full px-2 py-1.5 rounded border text-xs leading-relaxed transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500" : ""}`}
                    />
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
            )}
        </div>
    );
};

// ===================== Table Components =====================

const TableWrapper = ({ children }) => (
    <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-max text-xs">{children}</table>
    </div>
);

const TableHead = ({ headers }) => (
    <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
            {headers.map((h, i) => {
                const cls =
                    i === 0
                        ? "w-8 text-center"
                        : i === headers.length - 1
                            ? "w-20 text-center"
                            : "text-left";
                return (
                    <th
                        key={i}
                        className={`${cls} p-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
                    >
                        {h}
                    </th>
                );
            })}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white text-[10px]">
            {index + 1}
        </td>
        {children}
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
                            if (onChange) onChange(e.target.value);
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

const TextareaCell = ({ control, name, placeholder, errors, rows = 1 }) => {
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
                render={({ field }) => (
                    <textarea
                        {...field}
                        rows={rows}
                        placeholder={placeholder}
                        className={`w-full px-2 py-1 rounded border text-xs leading-relaxed transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500" : ""}`}
                    />
                )}
            />
            {errorMessage && (
                <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
            )}
        </td>
    );
};

// ===================== Utility =====================

const fmtDate = (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "");

const generateDocNo = () => {
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
    ].join("");
    return `PMC-${stamp}`;
};

// ===================== Defaults =====================

const getDefaultDetailRow = () => ({
    category: "",
    activity: "",
    checkingPoints: "",
    parameter: "",
    specification: "",
    generalDeviationsObserved: "",
    remediesRemarks: "",
    noOfHours: "0.00",
    frequency: "",
});

const getDefaultValues = (record) => ({
    plant: record?.plant?.id ?? record?.plantId ?? "",
    documentNo: record?.documentNo || record?.docNo || "",
    date: fmtDate(record?.date || record?.docDate) || dayjs().format("DD-MM-YYYY"),
    department: record?.department || "",
    pmChecklistFor: record?.pmChecklistFor || "",
    pmChecklistNo: record?.pmChecklistNo || "",
    machineToolCategory: record?.machineToolCategory || "",
    preparedBy: record?.preparedBy || "",
    approvedBy: record?.approvedBy || "",
    pmChecklistDetails: record?.pmChecklistDetailsResponseDTO?.length
        ? record.pmChecklistDetailsResponseDTO.map((row) => ({
            id: row.id || 0,
            category: row.category || "",
            activity: row.activity || "",
            checkingPoints: row.checkingPoints || "",
            parameter: row.parameter || "",
            specification: row.specification || "",
            generalDeviationsObserved: row.generalDeviationsObserved || "",
            remediesRemarks: row.remediesRemarks || "",
            noOfHours: row.noOfHours?.toString() || "0.00",
            frequency: row.frequency || "",
        }))
        : [getDefaultDetailRow()],
});

// ===================== Main Form =====================

const PMChecklistMasterForm = ({ onBack, onSave, editData, editId }) => {
    const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
    const BRANCH = localStorage.getItem("branch") || "";
    const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

    const { addToast } = useToast();

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plantOptions, setPlantOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [activityOptions, setActivityOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const saveCounter = useRef(0);

    const {
        control,
        handleSubmit,
        watch,
        getValues,
        reset,
        formState: { errors },
    } = useForm({
        mode: "onTouched",
        defaultValues: getDefaultValues(editData),
    });

    const detailsArray = useFieldArray({
        control,
        name: "pmChecklistDetails",
    });

    useEffect(() => {
        reset(getDefaultValues(editData));
    }, [editData, editId, reset]);

    // ===================== Data Loading =====================

    const loadPlants = useCallback(async () => {
        try {
            const isMacurex =
                (localStorage.getItem("isMacurex") || "").toLowerCase() === "true";
            if (isMacurex) {
                const res = await locationMasterAPI.getPlants(ORG_ID);
                setPlantOptions(
                    (res || []).map((p) => ({
                        value: p.id,
                        label: p.plantName || p.plantId || p.id,
                    }))
                );
            } else {
                const res = await branchAPI.getBranchByOrgId(ORG_ID);
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
    }, [ORG_ID]);

    const loadDepartments = useCallback(async () => {
        try {
            const res = await departmentAPI.getAllDepartments(ORG_ID);
            const departments = res?.paramObjectsMap?.departmentVO || [];
            if (departments.length) {
                setDepartmentOptions(
                    departments.map((d) => ({
                        value: d.departmentName,
                        label: d.departmentName,
                    }))
                );
            } else {
                setDepartmentOptions([
                    { value: "Design", label: "Design" },
                    { value: "Purchase", label: "Purchase" },
                    { value: "Stores", label: "Stores" },
                    { value: "Quality", label: "Quality" },
                    { value: "Production", label: "Production" },
                    { value: "Maintenance", label: "Maintenance" },
                ]);
            }
        } catch (error) {
            console.error("Failed to load department options:", error);
            setDepartmentOptions([
                { value: "Design", label: "Design" },
                { value: "Purchase", label: "Purchase" },
                { value: "Stores", label: "Stores" },
                { value: "Quality", label: "Quality" },
                { value: "Production", label: "Production" },
                { value: "Maintenance", label: "Maintenance" },
            ]);
        }
    }, [ORG_ID, BRANCH]);

    const loadCategories = useCallback(async () => {
        try {
            const res = await pmChecklistMasterAPI.getMachineToolCategories(ORG_ID);
            const cats = res || [];
            if (cats.length) {
                setCategoryOptions(
                    cats.map((c) => ({
                        value: c.category || c.categoryName || c.id,
                        label: c.category || c.categoryName || c.id,
                    }))
                );
            } else {
                setCategoryOptions([
                    { value: "CNC Machine", label: "CNC Machine" },
                    { value: "Lathe Machine", label: "Lathe Machine" },
                    { value: "Milling Machine", label: "Milling Machine" },
                    { value: "Grinding Machine", label: "Grinding Machine" },
                    { value: "Drilling Machine", label: "Drilling Machine" },
                    { value: "Power Press", label: "Power Press" },
                    { value: "Welding Machine", label: "Welding Machine" },
                    { value: "Compressor", label: "Compressor" },
                    { value: "Other", label: "Other" },
                ]);
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
            setCategoryOptions([
                { value: "CNC Machine", label: "CNC Machine" },
                { value: "Lathe Machine", label: "Lathe Machine" },
                { value: "Milling Machine", label: "Milling Machine" },
                { value: "Grinding Machine", label: "Grinding Machine" },
                { value: "Drilling Machine", label: "Drilling Machine" },
                { value: "Power Press", label: "Power Press" },
                { value: "Welding Machine", label: "Welding Machine" },
                { value: "Compressor", label: "Compressor" },
                { value: "Other", label: "Other" },
            ]);
        }
    }, [ORG_ID]);

    const loadActivities = useCallback(async () => {
        try {
            const res = await pmChecklistMasterAPI.getActivities(ORG_ID);
            const acts = res || [];
            if (acts.length) {
                setActivityOptions(
                    acts.map((a) => ({
                        value: a.activity || a.activityName || a.id,
                        label: a.activity || a.activityName || a.id,
                    }))
                );
            } else {
                setActivityOptions([
                    { value: "Lubrication", label: "Lubrication" },
                    { value: "Cleaning", label: "Cleaning" },
                    { value: "Calibration", label: "Calibration" },
                    { value: "Inspection", label: "Inspection" },
                    { value: "Tightening", label: "Tightening" },
                    { value: "Filter Replacement", label: "Filter Replacement" },
                    { value: "Oil Change", label: "Oil Change" },
                    { value: "Belt Replacement", label: "Belt Replacement" },
                    { value: "Other", label: "Other" },
                ]);
            }
        } catch (error) {
            console.error("Failed to load activities:", error);
            setActivityOptions([
                { value: "Lubrication", label: "Lubrication" },
                { value: "Cleaning", label: "Cleaning" },
                { value: "Calibration", label: "Calibration" },
                { value: "Inspection", label: "Inspection" },
                { value: "Tightening", label: "Tightening" },
                { value: "Filter Replacement", label: "Filter Replacement" },
                { value: "Oil Change", label: "Oil Change" },
                { value: "Belt Replacement", label: "Belt Replacement" },
                { value: "Other", label: "Other" },
            ]);
        }
    }, [ORG_ID]);

    const loadEmployees = useCallback(async () => {
        try {
            const res = await pmChecklistMasterAPI.getEmployees(ORG_ID);
            const emps = res || [];
            if (emps.length) {
                setEmployeeOptions(
                    emps.map((e) => ({
                        value: e.employeeName || e.name || e.id,
                        label: e.employeeName || e.name || e.id,
                    }))
                );
            } else {
                setEmployeeOptions([]);
            }
        } catch (error) {
            console.error("Failed to load employees:", error);
            setEmployeeOptions([]);
        }
    }, [ORG_ID]);

    useEffect(() => {
        loadPlants();
        loadDepartments();
        loadCategories();
        loadActivities();
        loadEmployees();
    }, [loadPlants, loadDepartments, loadCategories, loadActivities, loadEmployees]);

    // ===================== Detail Row Handlers =====================

    const handleAddDetail = () => {
        detailsArray.append(getDefaultDetailRow());
    };

    const handleRemoveDetail = (index) => {
        if (detailsArray.fields.length > 1) detailsArray.remove(index);
    };

    // ===================== Validation & Save =====================

    const validate = () => {
        const missingFields = [];
        if (!watch("plant")) missingFields.push("Plant ID");
        if (!watch("date")) missingFields.push("Date");
        if (!watch("department")) missingFields.push("Department");
        if (!watch("pmChecklistFor")) missingFields.push("PM Checklist For");
        if (!watch("pmChecklistNo")) missingFields.push("PM Checklist No");
        if (!watch("machineToolCategory")) missingFields.push("Machine/Tool Category");
        if (!watch("preparedBy")) missingFields.push("Prepared By");
        if (!watch("approvedBy")) missingFields.push("Approved By");

        if (missingFields.length) {
            addToast(`Missing mandatory fields: ${missingFields.join(", ")}`, "error");
            return false;
        }

        const details = getValues("pmChecklistDetails") || [];
        const hasValidRow = details.some((row) => row.checkingPoints && row.frequency);

        if (!hasValidRow) {
            addToast(
                "At least one detail row with Checking Points and Frequency is required",
                "error"
            );
            return false;
        }

        return true;
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return "";
        const [day, month, year] = dateString.split("-");
        if (!day || !month || !year) return "";
        return `${year}-${month}-${day}`;
    };

    const onSubmit = async (formData) => {
        if (!validate()) return;

        setSaving(true);
        const isUpdate = Boolean(editData?.id);

        const payload = {
            active: true,
            id: isUpdate ? parseInt(editData.id) : 0,
            orgId: ORG_ID,
            createdBy: CREATED_BY,
            requestNo: `REQ-${Date.now()}-${saveCounter.current}`,
            plant: formData.plant ? parseInt(formData.plant) : 0,
            documentNo: formData.documentNo || "",
            date: formatDateForAPI(formData.date) || "",
            department: formData.department || "",
            pmChecklistFor: formData.pmChecklistFor || "",
            pmChecklistNo: formData.pmChecklistNo || "",
            machineToolCategory: formData.machineToolCategory || "",
            preparedBy: formData.preparedBy || "",
            approvedBy: formData.approvedBy || "",
            pmChecklistDetailsDTO: (formData.pmChecklistDetails || [])
                .filter((row) => row.checkingPoints)
                .map((row) => ({
                    ...(row.id ? { id: parseInt(row.id) } : {}),
                    category: row.category || "",
                    activity: row.activity || "",
                    checkingPoints: row.checkingPoints || "",
                    parameter: row.parameter || "",
                    specification: row.specification || "",
                    generalDeviationsObserved: row.generalDeviationsObserved || "",
                    remediesRemarks: row.remediesRemarks || "",
                    noOfHours: parseFloat(row.noOfHours) || 0,
                    frequency: row.frequency || "",
                })),
        };

        saveCounter.current += 1;
        console.log("Submitting PM Checklist Payload:", payload);

        try {
            const response =
                await pmChecklistMasterAPI.createUpdateChecklist(payload);

            const status =
                response?.status === true || response?.statusFlag === "Ok";

            if (status) {
                const successMessage =
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "PM Checklist updated successfully!"
                        : "PM Checklist created successfully!");

                addToast(successMessage, "success");

                if (onSave) {
                    const savedData = {
                        ...payload,
                        id:
                            response?.paramObjectsMap?.pmChecklistVO?.id ||
                            payload.id,
                    };
                    onSave(savedData);
                } else {
                    onBack();
                }
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.message ||
                    response?.paramObjectsMap?.errorMessage ||
                    response?.message ||
                    "Failed to save PM Checklist";

                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage =
                error.response?.data?.paramObjectsMap?.message ||
                error.response?.data?.paramObjectsMap?.errorMessage ||
                error.response?.data?.message ||
                "Save failed! Try again.";

            addToast(errorMessage, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    const detailHeaders = [
        "S.No",
        "Category",
        "Activity",
        "Checking Points",
        "Parameter",
        "Specification",
        "General Deviations Observed",
        "Remedies / Remarks",
        "No. of Hours",
        "Frequency",
        "Action",
    ];

    return (
        <div className="p-2 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={onBack}
                    className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {editData || editId
                        ? "Edit PM Checklist"
                        : "Add PM Checklist"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                {/* Header Section */}
                <SectionHeader>Header</SectionHeader>
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
                        name="documentNo"
                        label="Document No"
                        required
                        readOnly
                        placeholder="Auto-generated"
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
                        name="department"
                        label="Department"
                        options={departmentOptions}
                        required
                        errors={errors}
                    />

                    <SelectField
                        control={control}
                        name="pmChecklistFor"
                        label="PM Checklist For"
                        options={PM_CHECKLIST_FOR_OPTIONS.map((o) => ({
                            value: o,
                            label: o,
                        }))}
                        required
                        errors={errors}
                    />

                    <InputField
                        control={control}
                        name="pmChecklistNo"
                        label="PM Checklist No"
                        required
                        placeholder="Enter checklist no"
                        errors={errors}
                    />

                    <SelectField
                        control={control}
                        name="machineToolCategory"
                        label="Machine/Tool Category"
                        options={categoryOptions}
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
                        name="approvedBy"
                        label="Approved By"
                        options={employeeOptions}
                        required
                        errors={errors}
                    />
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 mb-4"></div>

                {/* Checklist Details Section */}
                <div>
                    <SectionHeader>Checklist Details</SectionHeader>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                        <button
                            type="button"
                            onClick={handleAddDetail}
                            className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    <TableWrapper>
                        <TableHead headers={detailHeaders} />
                        <tbody>
                            {detailsArray.fields.map((field, index) => (
                                <TableRow
                                    key={field.id}
                                    index={index}
                                    onRemove={() => handleRemoveDetail(index)}
                                    disabled={detailsArray.fields.length <= 1}
                                >
                                    <SelectCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.category`}
                                        options={categoryOptions}
                                        required
                                        errors={errors}
                                    />
                                    <SelectCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.activity`}
                                        options={activityOptions}
                                        required
                                        errors={errors}
                                    />
                                    <InputCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.checkingPoints`}
                                        required
                                        placeholder="Enter checking points"
                                        errors={errors}
                                    />
                                    <InputCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.parameter`}
                                        placeholder="Enter parameter"
                                        errors={errors}
                                    />
                                    <InputCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.specification`}
                                        placeholder="Enter specification"
                                        errors={errors}
                                    />
                                    <TextareaCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.generalDeviationsObserved`}
                                        placeholder="Deviations"
                                        errors={errors}
                                        rows={1}
                                    />
                                    <TextareaCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.remediesRemarks`}
                                        placeholder="Remedies"
                                        errors={errors}
                                        rows={1}
                                    />
                                    <InputCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.noOfHours`}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        errors={errors}
                                        align="right"
                                    />
                                    <SelectCell
                                        control={control}
                                        name={`pmChecklistDetails.${index}.frequency`}
                                        options={FREQUENCY_OPTIONS.map((o) => ({
                                            value: o,
                                            label: o,
                                        }))}
                                        required
                                        errors={errors}
                                    />
                                </TableRow>
                            ))}
                        </tbody>
                    </TableWrapper>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
                    >
                        <X className="h-3 w-3" />
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            reset(getDefaultValues(null));
                            if (!editData && !editId) {
                                // stay on new form
                            }
                        }}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-60"
                    >
                        <FilePlus2 className="h-3 w-3" />
                        New
                    </button>

                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Save className="h-3 w-3" />
                        {saving
                            ? "Saving..."
                            : editData || editId
                                ? "Update"
                                : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PMChecklistMasterForm;
