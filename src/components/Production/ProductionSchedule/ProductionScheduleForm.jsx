import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Calendar
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
                        onChange={(e) => {
                            field.onChange(e);
                            if (onChange) onChange(e);
                        }}
                    />
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

// ===================== DatePickerCell =====================

const DatePickerCell = ({ control, name, errors }) => {
    const [open, setOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [anchorRect, setAnchorRect] = useState(null);
    const inputRef = useRef(null);
    const popupRef = useRef(null);

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

    const openCalendar = () => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (rect) {
            setAnchorRect({
                top: rect.bottom + 4,
                left: rect.left,
                width: 250,
            });
        }
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const onDocClick = (e) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        const onScrollOrResize = () => setOpen(false);

        document.addEventListener("mousedown", onDocClick);
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);

        return () => {
            document.removeEventListener("mousedown", onDocClick);
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [open]);

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
                                    ref={inputRef}
                                    type="text"
                                    value={field.value || ""}
                                    placeholder="DD-MM-YYYY"
                                    readOnly
                                    onClick={() =>
                                        open ? setOpen(false) : openCalendar()
                                    }
                                    className={`${controlClasses} pr-7 cursor-pointer ${errorMessage ? "border-red-500" : ""
                                        }`}
                                />

                                <Calendar
                                    size={14}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                />
                            </div>

                            {open && anchorRect && (
                                <div
                                    ref={popupRef}
                                    style={{
                                        position: "fixed",
                                        top: anchorRect.top,
                                        left: anchorRect.left,
                                        width: anchorRect.width,
                                        zIndex: 9999,
                                    }}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) =>
                                                    prev.subtract(1, "month")
                                                )
                                            }
                                            className="h-6 w-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                            className="h-6 w-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            ›
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                                            (day) => (
                                                <div
                                                    key={day}
                                                    className="text-center text-[9px] text-gray-500 py-1"
                                                >
                                                    {day}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {getCalendarDays(currentMonth).map((date, index) =>
                                            date ? (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => {
                                                        field.onChange(
                                                            date.format("DD-MM-YYYY")
                                                        );
                                                        setOpen(false);
                                                    }}
                                                    className={`h-7 w-7 rounded-full text-[10px] ${selectedDate?.isValid() &&
                                                        date.isSame(selectedDate, "day")
                                                        ? "bg-blue-600 text-white"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                                        }`}
                                                >
                                                    {date.date()}
                                                </button>
                                            ) : (
                                                <div key={index} className="h-7" />
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
                <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
            )}
        </td>
    );
};

// ===================== Utility Functions =====================

const fmtDate = (value) =>
    value ? dayjs(value).format("DD-MM-YYYY") : "";

// "DD-MM-YYYY" (UI) -> "YYYY-MM-DD" (API)
const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("-");
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day}`;
};

// Anything dayjs can parse -> "DD-MM-YYYY" (UI)
const toUiDate = (value) => {
    if (!value) return "";
    const d = dayjs(value);
    return d.isValid() ? d.format("DD-MM-YYYY") : "";
};

const buildFinYearMonthOptions = () => {
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

const getFinancialYear = () => {
    const now = dayjs();
    const startYear = now.month() >= 3 ? now.year() : now.year() - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
};

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

const getDefaultValues = () => ({
    fromMonthYear: "",
    toMonthYear: "",
    productionScheduleMonth: [getDefaultMonthRow()],
});

// ===================== Main Component =====================

const ProductionScheduleForm = ({ data, editData, onBack }) => {
    const recordId = editData?.id ?? data?.id;

    const { addToast } = useToast();
    const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
    const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
    const usersId = localStorage.getItem("usersId");

    const [activeTab, setActiveTab] = useState("month");
    const [saving, setSaving] = useState(false);
    const [loadingRecord, setLoadingRecord] = useState(false);

    const [itemOptions, setItemOptions] = useState([]);
    const [itemMap, setItemMap] = useState({});

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
        defaultValues: getDefaultValues(),
    });

    const monthArray = useFieldArray({
        control,
        name: "productionScheduleMonth",
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

    // ===================== Hydration =====================

    const hydrateFromRecord = useCallback(
        (rec) => {
            if (!rec) return;

            const rows = rec.productionScheduleForNextThreeMonthDetails?.length
                ? rec.productionScheduleForNextThreeMonthDetails.map((row) => ({
                    id: row.id || 0,
                    // API date "YYYY-MM-DD" -> UI "DD-MM-YYYY"
                    date: toUiDate(row.date),
                    itemCode: row.item?.id ?? row.itemId ?? "",
                    itemDescription:
                        row.item?.itemDescription ||
                        row.itemDescription ||
                        "",
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
                : [getDefaultMonthRow()];

            reset({
                fromMonthYear: rec.monthYear || "",
                toMonthYear: "",
                productionScheduleMonth: rows,
            });
        },
        [reset]
    );

    useEffect(() => {
        const loadById = async () => {
            if (!recordId) return;

            try {
                setLoadingRecord(true);
                const rec =
                    await productionScheduleAPI.getByIdForNextThreeMonth(
                        recordId
                    );
                if (rec) hydrateFromRecord(rec);
            } catch (error) {
                console.error(
                    "Failed to load production schedule by id:",
                    error
                );
                addToast("Failed to load Production Schedule.", "error");
            } finally {
                setLoadingRecord(false);
            }
        };

        loadById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordId]);

    // ===================== Handlers =====================

    const handleMonthItemChange = (idx, field, value) => {
        setValue(`productionScheduleMonth.${idx}.${field}`, value, {
            shouldDirty: true,
        });

        if (field === "itemCode") {
            const item = itemMap[value];
            setValue(
                `productionScheduleMonth.${idx}.itemDescription`,
                item?.itemDescription || "",
                { shouldDirty: true }
            );
        }
    };

    const handleAddMonthRow = () => {
        monthArray.append(getDefaultMonthRow());
    };

    const handleRemoveMonthRow = (index) => {
        if (monthArray.fields.length > 1) monthArray.remove(index);
    };

    // ===================== Validation & Save =====================

    const validate = () => {
        if (!watch("fromMonthYear")) {
            addToast("Month-Year is required", "error");
            return false;
        }

        const monthRows = getValues("productionScheduleMonth") || [];
        const hasValidRow = monthRows.some(
            (row) =>
                row.itemCode &&
                (parseFloat(row.january) ||
                    parseFloat(row.february) ||
                    parseFloat(row.march) ||
                    parseFloat(row.april) ||
                    parseFloat(row.may) ||
                    parseFloat(row.june) ||
                    parseFloat(row.july) ||
                    parseFloat(row.august) ||
                    parseFloat(row.september) ||
                    parseFloat(row.october) ||
                    parseFloat(row.november) ||
                    parseFloat(row.december))
        );

        if (!hasValidRow) {
            addToast(
                "At least one row with Item Code and a monthly quantity is required",
                "error"
            );
            setActiveTab("month");
            return false;
        }

        return true;
    };

    const onSubmit = async (formData) => {
        if (!validate()) return;

        setSaving(true);
        const isUpdate = Boolean(recordId);

        const monthRows = formData.productionScheduleMonth || [];

        const details = monthRows
            .filter((row) => row.itemCode)
            .map((row) => ({
                // UI "DD-MM-YYYY" -> API "YYYY-MM-DD"
                date: formatDateForAPI(row.date),
                item: row.itemCode ? parseInt(row.itemCode, 10) || 0 : 0,
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
            }));

        const payload = {
            active: true,
            branch: branch,
            cancelRemarks: "",
            createdBy: usersId || "admin",
            financialYear: getFinancialYear(),
            monthYear: formData.fromMonthYear || "",
            orgId: orgId,
            productionScheduleForNextThreeMonthDetails: details,
        };

        if (isUpdate) {
            payload.id = parseInt(recordId, 10);
        }

        try {
            const response =
                await productionScheduleAPI.createUpdateForNextThreeMonth(
                    payload
                );

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

    const renderHeader = () => (
        <div className={fieldGrid}>
            <InputField
                control={control}
                name="fromMonthYear"
                label="Month-Year"
                placeholder="MM-YYYY"
                required
                errors={errors}
            />
        </div>
    );

    const renderMonthTab = () => {
        const headers = [
            "S.No",
            "Date",
            "Item Code",
            "Item Description",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "Action",
        ];

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
                                    onChange={(v) =>
                                        handleMonthItemChange(index, "itemCode", v)
                                    }
                                />
                                <InputCell
                                    control={control}
                                    name={`productionScheduleMonth.${index}.itemDescription`}
                                    placeholder="Description"
                                    readOnly
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

    // ===================== Main Render =====================

    if (loadingRecord) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">
                    Loading Production Schedule...
                </div>
            </div>
        );
    }

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
                    {recordId
                        ? "Edit Production Schedule (for next 3 months)"
                        : "Add Production Schedule (for next 3 months)"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Info */}
                <div>
                    <SectionHeader>
                        Production Schedule (for next 3 months)
                    </SectionHeader>
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
                    </div>

                    {activeTab === "month" && renderMonthTab()}
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
                        {saving || isSubmitting
                            ? "Saving..."
                            : recordId
                                ? "Update"
                                : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionScheduleForm;