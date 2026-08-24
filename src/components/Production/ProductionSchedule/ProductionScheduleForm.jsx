import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Calendar
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import productionScheduleAPI from "../../../api/Production/productionScheduleAPI";
import itemAPI from "../../../api/itemAPI";

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

const TableHead = ({ headers, widths }) => (
    <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
            {headers.map((h, i) => {
                const cls = widths && widths[i]
                    ? widths[i]
                    : i === 0
                        ? "w-8 text-center"
                        : i === headers.length - 1
                            ? "w-20 text-left"
                            : "text-left";
                return (
                    <th key={i} className={`${cls} p-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-[10px] font-medium`}>
                        {h}
                    </th>
                );
            })}
        </tr>
    </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="p-2 text-center font-medium dark:text-white text-[10px]">{index + 1}</td>
        {children}
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

// ===================== Utility Functions =====================

const fmtDate = (value) =>
    value ? dayjs(value).format("DD-MM-YYYY") : "";

const buildFinYearMonthOptions = () => {
    // Financial Year runs April 1st - March 31st.
    // Only the current financial year is selectable.
    const options = [];

    const now = dayjs();

    const fyStartYear = now.month() >= 3 ? now.year() : now.year() - 1;

    let m = dayjs(new Date(fyStartYear, 3, 1));

    for (let i = 0; i < 12; i++) {
        options.push({
            value: m.format("MM-YYYY"),
            label: m.format("MMM-YYYY"),
        });
        m = m.add(1, "month");
    }

    return options;
};

const MONTH_YEAR_OPTIONS = buildFinYearMonthOptions();

// ===================== Default Values =====================

const getDefaultMonthRow = () => ({
    date: "",
    itemCode: "",
    itemDescription: "",
    january: "",
    february: "",
    march: "",
    april: "",
    may: "",
    june: "",
    july: "",
    august: "",
    september: "",
    october: "",
    november: "",
    december: "",
});

const getDefaultDetailRow = () => ({
    itemCode: "",
    itemDescription: "",
    plannedQty: "",
    actualQty: "",
    variance: "",
    remarks: "",
});

const getDefaultValues = (record) => ({
    fromMonthYear: record?.fromMonthYear || "",
    toMonthYear: record?.toMonthYear || "",
    productionScheduleMonth: record?.productionScheduleMonthResponseDTO?.length
        ? record.productionScheduleMonthResponseDTO.map((row) => ({
            id: row.id || 0,
            date: fmtDate(row.date),
            itemCode: row.item?.id ?? row.itemId ?? "",
            itemDescription: row.item?.itemDescription || row.itemDescription || "",
            january: row.january ?? "",
            february: row.february ?? "",
            march: row.march ?? "",
            april: row.april ?? "",
            may: row.may ?? "",
            june: row.june ?? "",
            july: row.july ?? "",
            august: row.august ?? "",
            september: row.september ?? "",
            october: row.october ?? "",
            november: row.november ?? "",
            december: row.december ?? "",
        }))
        : [getDefaultMonthRow()],
    productionScheduleDetails: record?.productionScheduleDetailsResponseDTO?.length
        ? record.productionScheduleDetailsResponseDTO.map((row) => ({
            id: row.id || 0,
            itemCode: row.item?.id ?? row.itemId ?? "",
            itemDescription: row.item?.itemDescription || row.itemDescription || "",
            plannedQty: row.plannedQty ?? "",
            actualQty: row.actualQty ?? "",
            variance: row.variance ?? "",
            remarks: row.remarks || "",
        }))
        : [getDefaultDetailRow()],
});

// ===================== Main Component =====================

const ProductionScheduleForm = ({ data, editData, onBack }) => {
    const record = data || editData;

    const { addToast } = useToast();
    const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
    const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
    const usersId = localStorage.getItem("usersId");

    const [activeTab, setActiveTab] = useState("month");
    const [saving, setSaving] = useState(false);

    // Lookup data states
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});

    const defaults = useCallback(() => getDefaultValues(record), [record]);

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

    const monthArray = useFieldArray({
        control,
        name: "productionScheduleMonth",
    });

    const detailsArray = useFieldArray({
        control,
        name: "productionScheduleDetails",
    });

    // ===================== Data Loading =====================

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

    useEffect(() => {
        if (orgId) {
            loadItems();
        }
    }, [orgId, loadItems]);

    // ===================== Handlers =====================

    const handleFromMonthChange = (value) => {
        if (!value) {
            setValue("toMonthYear", "", { shouldDirty: true });
            return;
        }

        const [month, year] = value.split("-").map(Number);

        if (!month || !year) {
            return;
        }

        // Current financial year ends in March.
        const now = dayjs();
        const fyStartYear = now.month() >= 3 ? now.year() : now.year() - 1;
        const fyEnd = dayjs(new Date(fyStartYear + 1, 2, 1));

        let to = dayjs(new Date(year, month - 1, 1)).add(3, "month");

        // If From + 3 crosses the financial year end (Jan/Feb/Mar),
        // clamp To to March - the last month of the current FY.
        if (to.isAfter(fyEnd)) {
            to = fyEnd;
        }

        setValue("toMonthYear", to.format("MM-YYYY"), { shouldDirty: true });
    };

    const handleMonthItemChange = (idx, field, value) => {
        setValue(`productionScheduleMonth.${idx}.${field}`, value, { shouldDirty: true });

        if (field === "itemCode") {
            const item = itemMap[value];
            setValue(`productionScheduleMonth.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });
        }
    };

    const handleDetailItemChange = (idx, field, value) => {
        setValue(`productionScheduleDetails.${idx}.${field}`, value, { shouldDirty: true });

        if (field === "itemCode") {
            const item = itemMap[value];
            setValue(`productionScheduleDetails.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });
        }
    };

    const recalcVariance = (idx) => {
        const row = getValues(`productionScheduleDetails.${idx}`);
        const variance =
            (parseFloat(row?.actualQty) || 0) - (parseFloat(row?.plannedQty) || 0);
        setValue(`productionScheduleDetails.${idx}.variance`, variance.toFixed(2), { shouldDirty: true });
    };

    const handleAddMonthRow = () => {
        monthArray.append(getDefaultMonthRow());
    };

    const handleRemoveMonthRow = (index) => {
        if (monthArray.fields.length > 1) monthArray.remove(index);
    };

    const handleAddDetailRow = () => {
        detailsArray.append(getDefaultDetailRow());
    };

    const handleRemoveDetailRow = (index) => {
        if (detailsArray.fields.length > 1) detailsArray.remove(index);
    };

    // ===================== Validation & Save =====================

    const validate = () => {
        const missingFields = [];
        if (!watch("fromMonthYear")) missingFields.push("From Month-Year");
        if (!watch("toMonthYear")) missingFields.push("To Month-Year");

        if (missingFields.length) {
            addToast(`Missing mandatory fields: ${missingFields.join(", ")}`, "error");
            return false;
        }

        const monthRows = getValues("productionScheduleMonth") || [];
        const hasValidMonthRow = monthRows.some(
            (row) => row.itemCode && row.date
        );

        if (!hasValidMonthRow) {
            addToast("At least one schedule month row with Date and Item Code is required", "error");
            setActiveTab("month");
            return false;
        }

        const detailRows = getValues("productionScheduleDetails") || [];
        const hasValidDetailRow = detailRows.some(
            (row) => row.itemCode && parseFloat(row.plannedQty) > 0
        );

        if (!hasValidDetailRow) {
            addToast("At least one schedule detail row with Item Code and Planned Qty is required", "error");
            setActiveTab("details");
            return false;
        }

        return true;
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return "";

        const [day, month, year] = dateString.split("-");

        if (!day || !month || !year) {
            return "";
        }

        return `${year}-${month}-${day}`;
    };

    const onSubmit = async (formData) => {
        if (!validate()) return;

        setSaving(true);
        const isUpdate = Boolean(record?.id);

        const payload = {
            active: true,
            branchId: branch,
            createdBy: usersId || "admin",
            id: isUpdate ? parseInt(record.id) : 0,
            fromMonthYear: formData.fromMonthYear || "",
            toMonthYear: formData.toMonthYear || "",
            orgId: orgId,
            productionScheduleMonthDTO: (formData.productionScheduleMonth || [])
                .filter((row) => row.itemCode)
                .map((row) => ({
                    ...(row.id ? { id: parseInt(row.id) } : {}),
                    date: formatDateForAPI(row.date) || "",
                    item: row.itemCode ? parseInt(row.itemCode) || 0 : 0,
                    itemDescription: row.itemDescription || "",
                    january: parseFloat(row.january) || 0,
                    february: parseFloat(row.february) || 0,
                    march: parseFloat(row.march) || 0,
                    april: parseFloat(row.april) || 0,
                    may: parseFloat(row.may) || 0,
                    june: parseFloat(row.june) || 0,
                    july: parseFloat(row.july) || 0,
                    august: parseFloat(row.august) || 0,
                    september: parseFloat(row.september) || 0,
                    october: parseFloat(row.october) || 0,
                    november: parseFloat(row.november) || 0,
                    december: parseFloat(row.december) || 0,
                })),
            productionScheduleDetailsDTO: (formData.productionScheduleDetails || [])
                .filter((row) => row.itemCode)
                .map((row) => ({
                    ...(row.id ? { id: parseInt(row.id) } : {}),
                    item: row.itemCode ? parseInt(row.itemCode) || 0 : 0,
                    itemDescription: row.itemDescription || "",
                    plannedQty: parseFloat(row.plannedQty) || 0,
                    actualQty: parseFloat(row.actualQty) || 0,
                    variance: parseFloat(row.variance) || 0,
                    remarks: row.remarks || "",
                })),
        };

        if (!isUpdate) {
            delete payload.id;
        }

        try {
            const response = await productionScheduleAPI.createUpdate(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Production Schedule updated successfully!"
                        : "Production Schedule created successfully!"),
                    "success"
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.paramObjectsMap?.errorMessage ||
                    response?.message ||
                    "Failed to save Production Schedule.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save Production Schedule Error:", err);
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

    const getToMonthOptions = () => {
        const from = watch("fromMonthYear");

        if (!from) return MONTH_YEAR_OPTIONS;

        const [m, y] = from.split("-").map(Number);

        if (!m || !y) return MONTH_YEAR_OPTIONS;

        // Only months after the selected From month are shown.
        const fromMonth = dayjs(new Date(y, m - 1, 1));

        return MONTH_YEAR_OPTIONS.filter((opt) => {
            const [om, oy] = opt.value.split("-").map(Number);
            return dayjs(new Date(oy, om - 1, 1)).isAfter(fromMonth);
        });
    };

    const renderHeader = () => (
        <div className={fieldGrid}>
            <SelectField
                control={control}
                name="fromMonthYear"
                label="From Month-Year"
                options={MONTH_YEAR_OPTIONS}
                required
                errors={errors}
                onChange={handleFromMonthChange}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="toMonthYear"
                label="To Month-Year"
                options={getToMonthOptions()}
                required
                errors={errors}
                placeholder="Auto"
            />
        </div>
    );

    const DatePickerCell = ({ control, name, errors }) => {
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
                    rules={{ required: "This field is required" }}
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

    const renderMonthTab = () => {
        const headers = ["S.No", "Date", "Item Code", "Item Description", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        onClick={handleAddMonthRow}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {monthArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveMonthRow(index)}
                                disabled={monthArray.fields.length <= 1}
                            >
                                <DatePickerCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.date`}
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.itemCode`}
                                    options={itemOptions}
                                    required
                                    errors={errors}
                                    onChange={(v) => handleMonthItemChange(index, "itemCode", v)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.itemDescription`}
                                    placeholder="Description"
                                    required
                                    errors={errors}
                                    onChange={() => { }}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.january`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.february`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.march`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.april`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.may`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.june`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.july`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.august`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.september`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.october`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.november`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.december`}
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

    const renderDetailsTab = () => {
        const headers = ["S.No", "Item Code", "Item Description", "Planned Qty", "Actual Qty", "Variance", "Remarks", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        onClick={handleAddDetailRow}
                        className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                </div>

                <TableWrapper>
                    <TableHead headers={headers} />
                    <tbody>
                        {detailsArray.fields.map((field, index) => (
                            <TableRow
                                key={field.id}
                                index={index}
                                onRemove={() => handleRemoveDetailRow(index)}
                                disabled={detailsArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`productionScheduleDetails.${index}.itemCode`}
                                    options={itemOptions}
                                    required
                                    errors={errors}
                                    onChange={(v) => handleDetailItemChange(index, "itemCode", v)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleDetails.${index}.itemDescription`}
                                    placeholder="Description"
                                    required
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleDetails.${index}.plannedQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    required
                                    errors={errors}
                                    onChange={() => recalcVariance(index)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleDetails.${index}.actualQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                    onChange={() => recalcVariance(index)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleDetails.${index}.variance`}
                                    type="number"
                                    readOnly
                                    align="right"
                                    errors={errors}
                                />
                                <td className="p-2 align-top min-w-[200px]">
                                    <Controller
                                        name={`productionScheduleDetails.${index}.remarks`}
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                {...field}
                                                rows={1}
                                                placeholder="Enter remarks..."
                                                className="w-full px-2 py-1.5 rounded border text-xs leading-snug resize-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
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
                    {record ? "Edit Production Schedule (for next 3 months)" : "Add Production Schedule (for next 3 months)"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
                <div>
                    <SectionHeader>Production Schedule (for next 3 months)</SectionHeader>
                    {renderHeader()}
                </div>

                {/* Tabs */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("month")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "month"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Schedule Month
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("details")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "details"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Schedule Details
                        </button>
                    </div>

                    {activeTab === "month" && renderMonthTab()}
                    {activeTab === "details" && renderDetailsTab()}
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
                        {saving || isSubmitting ? "Saving..." : record ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionScheduleForm;
