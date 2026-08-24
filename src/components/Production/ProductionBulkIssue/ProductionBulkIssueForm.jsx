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
import productionBulkIssueAPI from "../../../api/Production/productionBulkIssueAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";

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

// ===================== Default Values =====================

const getDefaultDetailRow = () => ({
    itemCode: "",
    itemDescription: "",
    unit: "",
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
    date: fmtDate(record?.date || record?.docDate) || dayjs().format("DD-MM-YYYY"),
    fgItemCode: record?.fgItem?.id ?? record?.fgItemId ?? "",
    fgItemDescription: record?.fgItem?.itemDescription || record?.fgItemDescription || "",
    indentNo: record?.indent?.docId || record?.indentNo || "",
    issueDate: fmtDate(record?.issueDate),
    purchaseMaterialRef: record?.purchaseMaterialRef || "",
    type: record?.issueType || "",
    referenceNo: record?.referenceNo || "",
    fromLocation: record?.fromLocation?.id ?? record?.fromLocationId ?? "",
    toLocation: record?.toLocation?.id ?? record?.toLocationId ?? "",
    remarks: record?.remarks || "",
    productionBulkIssueDetails: record?.productionBulkIssueDetailsResponseDTO?.length
        ? record.productionBulkIssueDetailsResponseDTO.map((row) => ({
            id: row.id || 0,
            itemCode: row.item?.id ?? row.itemId ?? "",
            itemDescription: row.item?.itemDescription || row.itemDescription || "",
            unit: row.unit?.id || row.unitId || "",
            availableQty: row.availableQty ?? "",
            indentRequiredQty: row.indentRequiredQty ?? "",
            indentPendingQty: row.indentPendingQty ?? "",
            issueQty: row.issueQty ?? "",
            rate: row.rate ?? "",
            amount: row.amount ?? "",
        }))
        : [getDefaultDetailRow()],
});

// ===================== Main Component =====================

const ProductionBulkIssueForm = ({ data, editData, onBack }) => {
    const record = data || editData;

    const { addToast } = useToast();
    const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
    const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
    const usersId = localStorage.getItem("usersId");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
    const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

    const [activeTab, setActiveTab] = useState("details");
    const [saving, setSaving] = useState(false);

    // Lookup data states
    const [plantOptions, setPlantOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});
    const [unitOptions, setUnitOptions] = useState([]);
    const [belongsToOptions, setBelongsToOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [indentOptions, setIndentOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);

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

    const detailsArray = useFieldArray({
        control,
        name: "productionBulkIssueDetails",
    });

    const watchDetails = watch("productionBulkIssueDetails");

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

    const loadBelongsTo = useCallback(async () => {
        try {
            const res = await productionBulkIssueAPI.getBelongsToOptions(orgId);
            setBelongsToOptions(
                (res || []).map((b) => ({
                    value: b.valuesDescription || b.description || b.id,
                    label: b.valuesDescription || b.description || b.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load belongs-to options:", error);
            setBelongsToOptions([]);
        }
    }, [orgId]);

    const loadTypes = useCallback(async () => {
        try {
            const res = await productionBulkIssueAPI.getIssueTypeOptions(orgId);
            setTypeOptions(
                (res || []).map((t) => ({
                    value: t.valuesDescription || t.description || t.id,
                    label: t.valuesDescription || t.description || t.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load type options:", error);
            setTypeOptions(["Regular", "Special"]);
        }
    }, [orgId]);

    const loadLocations = useCallback(async () => {
        try {
            const res = await productionBulkIssueAPI.getLocationOptions(orgId, branch);
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

    const loadIndents = useCallback(async () => {
        try {
            const res = await productionBulkIssueAPI.getIndentOptions(orgId, branch);
            setIndentOptions(
                (res || []).map((r) => ({
                    value: r.docId || r.id,
                    label: r.docId || r.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load indent options:", error);
            setIndentOptions([]);
        }
    }, [orgId, branch]);

    useEffect(() => {
        if (orgId) {
            loadPlants();
            loadItems();
            loadUnits();
            loadBelongsTo();
            loadTypes();
            loadLocations();
            loadIndents();
        }
    }, [
        orgId,
        loadPlants,
        loadItems,
        loadUnits,
        loadBelongsTo,
        loadTypes,
        loadLocations,
        loadIndents,
    ]);

    // ===================== Handlers =====================

    const handleFGItemChange = (id) => {
        const item = itemMap[id];
        setValue("fgItemCode", id, { shouldDirty: true });
        setValue("fgItemDescription", item?.itemDescription || "", { shouldDirty: true });
    };

    const handleFromLocationChange = (value) => {
        if (value && String(value) === String(getValues("toLocation"))) {
            setValue("toLocation", "", { shouldDirty: true });
        }
    };

    const handleDetailItemChange = (idx, field, value) => {
        setValue(`productionBulkIssueDetails.${idx}.${field}`, value, { shouldDirty: true });

        if (field === "itemCode") {
            const item = itemMap[value];
            setValue(`productionBulkIssueDetails.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });
            setValue(`productionBulkIssueDetails.${idx}.unit`, item?.primaryUnits?.id || "", { shouldDirty: true });
        }
    };

    const recalcAmount = (idx) => {
        const row = getValues(`productionBulkIssueDetails.${idx}`);
        const amount =
            (parseFloat(row?.issueQty) || 0) * (parseFloat(row?.rate) || 0);
        setValue(`productionBulkIssueDetails.${idx}.amount`, amount.toFixed(2), { shouldDirty: true });
    };

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
        if (!watch("belongsTo")) missingFields.push("Belongs To");
        if (!watch("date")) missingFields.push("Date");
        if (!watch("fgItemCode")) missingFields.push("FG Item Code");
        if (!watch("indentNo")) missingFields.push("Indent No");
        if (!watch("issueDate")) missingFields.push("Issue Date");
        if (!watch("type")) missingFields.push("Type");
        if (!watch("fromLocation")) missingFields.push("From Location");
        if (!watch("toLocation")) missingFields.push("To Location");

        if (missingFields.length) {
            addToast(`Missing mandatory fields: ${missingFields.join(", ")}`, "error");
            return false;
        }

        const details = getValues("productionBulkIssueDetails") || [];
        const hasValidRow = details.some(
            (row) =>
                row.itemCode &&
                parseFloat(row.issueQty) > 0 &&
                parseFloat(row.rate) > 0
        );

        if (!hasValidRow) {
            addToast("At least one detail row with Item Code, Issue Qty and Rate is required", "error");
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
            belongsTo: formData.belongsTo || "",
            branchId: branch,
            createdBy: usersId || "admin",
            date: formatDateForAPI(formData.date) || "",
            fgItem: formData.fgItemCode ? parseInt(formData.fgItemCode) : 0,
            fromLocation: formData.fromLocation ? parseInt(formData.fromLocation) : 0,
            id: isUpdate ? parseInt(record.id) : 0,
            indentNo: formData.indentNo || "",
            issueDate: formatDateForAPI(formData.issueDate) || "",
            issueNo: formData.issueNo || "",
            issueType: formData.type || "",
            orgId: orgId,
            plant: formData.plant ? parseInt(formData.plant) : 0,
            purchaseMaterialRef: formData.purchaseMaterialRef || "",
            referenceNo: formData.referenceNo || "",
            remarks: formData.remarks || "",
            toLocation: formData.toLocation ? parseInt(formData.toLocation) : 0,
            productionBulkIssueDetailsDTO: (formData.productionBulkIssueDetails || [])
                .filter((row) => row.itemCode)
                .map((row) => ({
                    ...(row.id ? { id: parseInt(row.id) } : {}),
                    item: row.itemCode ? parseInt(row.itemCode) || 0 : 0,
                    itemDescription: row.itemDescription || "",
                    unit: row.unit || "",
                    availableQty: parseFloat(row.availableQty) || 0,
                    indentRequiredQty: parseFloat(row.indentRequiredQty) || 0,
                    indentPendingQty: parseFloat(row.indentPendingQty) || 0,
                    issueQty: parseFloat(row.issueQty) || 0,
                    rate: parseFloat(row.rate) || 0,
                    amount: parseFloat(row.amount) || 0,
                })),
        };

        if (!isUpdate) {
            delete payload.id;
        }

        try {
            const response = await productionBulkIssueAPI.createUpdate(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Production (Bulk) Issue updated successfully!"
                        : "Production (Bulk) Issue created successfully!"),
                    "success"
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.paramObjectsMap?.errorMessage ||
                    response?.message ||
                    "Failed to save Production (Bulk) Issue.",
                    "error"
                );
            }
        } catch (err) {
            console.error("Save Production (Bulk) Issue Error:", err);
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
                name="plant"
                label="Plant ID"
                options={plantOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <InputField
                control={control}
                name="issueNo"
                label="Issue No"
                placeholder="Auto"
                readOnly={!record}
                errors={errors}
            />

            <SelectField
                control={control}
                name="belongsTo"
                label="Belongs To"
                options={belongsToOptions}
                required
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
                name="indentNo"
                label="Indent No"
                options={indentOptions}
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

            <InputField
                control={control}
                name="purchaseMaterialRef"
                label="Purchase Material Reference"
                errors={errors}
            />

            <SelectField
                control={control}
                name="type"
                label="Type"
                options={typeOptions}
                required
                errors={errors}
                placeholder="Select an option"
            />

            <InputField
                control={control}
                name="referenceNo"
                label="Reference No"
                errors={errors}
            />

            <SelectField
                control={control}
                name="fromLocation"
                label="From Location"
                options={locationOptions}
                required
                errors={errors}
                onChange={handleFromLocationChange}
                placeholder="Select an option"
            />

            <SelectField
                control={control}
                name="toLocation"
                label="To Location"
                options={locationOptions.filter(
                    (loc) => String(loc.value) !== String(watch("fromLocation"))
                )}
                required
                errors={errors}
                placeholder="Select an option"
            />
        </div>
    );

    const renderDetailsTab = () => {
        const headers = ["S.No", "Item Code", "Item Description", "Unit", "Available Qty", "Indent Required Qty", "Indent Pending Qty", "Issue Qty", "Rate", "Amount", "Action"];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        onClick={handleAddDetail}
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
                                onRemove={() => handleRemoveDetail(index)}
                                disabled={detailsArray.fields.length <= 1}
                            >
                                <SelectCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.itemCode`}
                                    options={itemOptions}
                                    required
                                    errors={errors}
                                    onChange={(v) => handleDetailItemChange(index, "itemCode", v)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.itemDescription`}
                                    readOnly
                                    placeholder="Description"
                                    errors={errors}
                                />
                                <SelectCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.unit`}
                                    options={unitOptions}
                                    required
                                    errors={errors}
                                    placeholder="Select"
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.availableQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.indentRequiredQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.indentPendingQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.issueQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    required
                                    errors={errors}
                                    onChange={() => recalcAmount(index)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.rate`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    required
                                    errors={errors}
                                    onChange={() => recalcAmount(index)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionBulkIssueDetails.${index}.amount`}
                                    type="number"
                                    readOnly
                                    align="right"
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
        const headers = ["S.No", "Remarks","  "];

        return (
            <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                   
                </div>

                <TableWrapper>
                    <TableHead headers={headers} widths={["w-2", "w-3", "w-70"]} />
                    <tbody>
                        <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2 text-center font-medium dark:text-white text-[10px]">1</td>
                            <td className="p-2">
                                <Controller
                                    name="remarks"
                                    control={control}
                                    render={({ field }) => (
                                        <textarea
                                            {...field}
                                            rows={1}
                                            placeholder="Enter remarks..."
                                            className="w-80 px-2 py-1.5 rounded border text-xs leading-snug resize-y transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                                        />
                                    )}
                                />
                            </td>
                        </tr>
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
                    {record ? "Edit Production (Bulk) Issue" : "Add Production (Bulk) Issue"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
                <div>
                    <SectionHeader>Production (Bulk) Issues</SectionHeader>
                    {renderHeader()}
                </div>

                {/* Tabs */}
                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("details")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "details"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("summary")}
                            className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "summary"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            Production (Bulk) Issues Summary
                        </button>
                    </div>

                    {activeTab === "details" && renderDetailsTab()}
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
                        {saving || isSubmitting ? "Saving..." : record ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionBulkIssueForm;
