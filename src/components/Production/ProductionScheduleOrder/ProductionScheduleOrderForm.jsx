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
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import unitMasterAPI from "../../../api/unitAPI";

/* ---------------------------------------------------------------------------- */
/* Design tokens                                                                */

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

const PSO_TYPE_LIST_NAME = "PRODUCTION SCHEDULE ORDER TYPE";

/* FG/SFG Item Code is only relevant for these Sch. Order Types */
const FG_SFG_ALLOWED_TYPES = ["DIRECT", "SALES"];

/* ---------------------------------------------------------------------------- */
/* Reusable Components                                                          */

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
    onChange,
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
            if (error && error[part]) error = error[part];
            else return null;
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
                        value={field.value ?? ""}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${errorMessage
                            ? "border-red-500 focus:border-red-500"
                            : ""
                            } ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
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

const DatePickerField = ({ control, name, label, required = false, errors }) => {
    const [open, setOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) error = error[part];
            else return null;
        }
        return error?.message;
    };

    const errorMessage = getError();

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
                                    onClick={() => setOpen((prev) => !prev)}
                                    className={`${controlClasses} cursor-pointer pr-8 ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                                        }`}
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
                                                setCurrentMonth((prev) => prev.subtract(1, "month"))
                                            }
                                            className="h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                        >
                                            ‹
                                        </button>
                                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                                            {currentMonth.format("MMMM YYYY")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentMonth((prev) => prev.add(1, "month"))
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
                                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-colors ${isSelected
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
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) error = error[part];
            else return null;
        }
        return error?.message;
    };

    const errorMessage = getError();
    const safeOptions = (options || []).map((opt) =>
        typeof opt === "object" ? opt : { value: opt, label: opt },
    );

    return (
        <div>
            <label className={labelClasses}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Controller
                name={name}
                control={control}
                rules={required ? { required: `${label} is required` } : undefined}
                render={({ field }) => {
                    const safeValue =
                        field.value === null || field.value === undefined ? "" : field.value;
                    const inOptions = safeOptions.some(
                        (o) => String(o.value) === String(safeValue),
                    );
                    const showGhost = safeValue !== "" && !inOptions;

                    return (
                        <select
                            {...field}
                            value={safeValue}
                            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                                }`}
                            onChange={(e) => {
                                field.onChange(e);
                                if (onChange) onChange(e.target.value);
                            }}
                            disabled={disabled}
                        >
                            <option value="">{placeholder}</option>
                            {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
                            {safeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    );
                }}
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
                    className={`p-2 whitespace-nowrap ${i === 0
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

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
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

const SelectCell = ({
    control,
    name,
    options,
    required,
    errors,
    onChange,
    disabled,
}) => {
    const getError = () => {
        const parts = name.split(".");
        let error = errors;
        for (const part of parts) {
            if (error && error[part]) error = error[part];
            else return null;
        }
        return error?.message;
    };

    const errorMessage = getError();
    const safeOptions = (options || []).map((opt) =>
        typeof opt === "object" ? opt : { value: opt, label: opt },
    );

    return (
        <td className="p-2 align-top min-w-[120px]">
            <Controller
                name={name}
                control={control}
                rules={required ? { required: "This field is required" } : undefined}
                render={({ field }) => {
                    const safeValue =
                        field.value === null || field.value === undefined ? "" : field.value;
                    const inOptions = safeOptions.some(
                        (o) => String(o.value) === String(safeValue),
                    );
                    const showGhost = safeValue !== "" && !inOptions;

                    return (
                        <select
                            {...field}
                            value={safeValue}
                            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
                                }`}
                            onChange={(e) => {
                                field.onChange(e);
                                if (onChange) onChange(e.target.value);
                            }}
                            disabled={disabled}
                        >
                            <option value="">-- Select --</option>
                            {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
                            {safeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    );
                }}
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
            if (error && error[part]) error = error[part];
            else return null;
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
                        value={field.value ?? ""}
                        type={type}
                        step={step}
                        className={`${controlClasses} ${align === "right" ? "text-right" : ""
                            } ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""
                            }`}
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

/* ---------------------------------------------------------------------------- */
/* Default Values                                                               */

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

const fmtDate = (value) => {
    if (!value) return "";
    // Already DD-MM-YYYY → return as-is
    if (typeof value === "string" && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
        return value;
    }
    const d = dayjs(value);
    return d.isValid() ? d.format("DD-MM-YYYY") : "";
};

const fmtISO = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    if (!day || !month || !year) return "";
    return `${year}-${month}-${day}`;
};

/* ---------------------------------------------------------------------------- */

const ProductionScheduleOrderForm = ({ data, onBack }) => {
    const { addToast } = useToast();
    const orgId = Number(localStorage.getItem("orgId")) || 0;
    const branch = Number(localStorage.getItem("branchId")) || 0;
    const usersId = localStorage.getItem("usersId");

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const orgName = (
        userData?.companyVO?.companyName ||
        userData?.orgName ||
        ""
    ).trim();
    const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

    const isEditMode = Boolean(data?.id);
    const docIdLoadedRef = useRef(false);
    const dataLoadedRef = useRef(false);

    const [activeTab, setActiveTab] = useState("productionDetail");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    /* ---------------- Lookups ---------------- */
    const [plantOptions, setPlantOptions] = useState([]);
    const [orderTypeOptions, setOrderTypeOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [routeOptions, setRouteOptions] = useState([]);
    const [bomOptions, setBomOptions] = useState([]);
    const [itemDetailOptions, setItemDetailOptions] = useState([]);

    const itemMapRef = useRef({});
    const itemDetailMapRef = useRef({});

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

    const productionDetailArray = useFieldArray({
        control,
        name: "productionDetails",
    });

    const schedulesArray = useFieldArray({
        control,
        name: "schedules",
    });

    const watchProductionDetails = watch("productionDetails");
    const watchBatchQty = watch("batchQty");
    const watchBomId = watch("bomId");
    const watchScheduleOrderType = watch("scheduleOrderType");

    /* Helper — is the current type in the FG/SFG allowed list? */
    const isFgSfgApplicable = FG_SFG_ALLOWED_TYPES.includes(
        (watchScheduleOrderType || "").trim().toUpperCase(),
    );

    /* ---------------- Load master data (plants, types, units, routes, BOMs) ---------------- */

    useEffect(() => {
        if (!orgId) return;

        // Plants
        (async () => {
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
            } catch (err) {
                console.error("Failed to load plants:", err);
            }
        })();

        // Sch. Order Type — list-of-values
        (async () => {
            try {
                const list = await productionScheduleOrderAPI.getListValuesGroup(
                    PSO_TYPE_LIST_NAME,
                    orgId,
                );
                setOrderTypeOptions(
                    (list || []).map((item) => ({
                        value: item.valuesDescription ?? item.value ?? item.id ?? "",
                        label: item.valuesDescription ?? item.value ?? item.id ?? "",
                    })),
                );
            } catch (err) {
                console.error("Failed to load order types:", err);
            }
        })();

        // Units
        (async () => {
            try {
                const res = await unitMasterAPI.getUnits(branch, orgId);
                setUnitOptions(
                    (res || []).map((u) => ({
                        value: u.id,
                        label: u.unitId || u.unitName || String(u.id),
                    })),
                );
            } catch (err) {
                console.error("Failed to load units:", err);
            }
        })();

        // Comp.Route No — process sheet routing
        (async () => {
            try {
                const list = await productionScheduleOrderAPI.getProcessSheetRouting({
                    branch,
                    orgId,
                });
                setRouteOptions(
                    (list || []).map((r) => ({
                        value: r.id,                                   // ✅ numeric id for payload
                        label: r.bomId || r.itemDescription || String(r.id),
                    })),
                );
            } catch (err) {
                console.error("Failed to load routes:", err);
            }
        })();

        // BOM Id
        (async () => {
            try {
                const list = await productionScheduleOrderAPI.getBomList({
                    branch,
                    orgId,
                });
                setBomOptions(
                    (list || []).map((b) => ({
                        value: b.id,
                        label: b.docId || String(b.id),
                    })),
                );
            } catch (err) {
                console.error("Failed to load BOMs:", err);
            }
        })();
    }, [orgId, branch, isMacurex]);

    /* ---------------- Load FG/SFG items ONLY for DIRECT / SALES ---------------- */

    useEffect(() => {
        const type = (watchScheduleOrderType || "").trim().toUpperCase();

        if (!FG_SFG_ALLOWED_TYPES.includes(type)) {
            // Clear the FG/SFG items and fields when the type isn't applicable
            setItemOptions([]);
            itemMapRef.current = {};
            setValue("fgItemCode", "", { shouldDirty: false });
            setValue("fgItemDescription", "", { shouldDirty: false });
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const list = await productionScheduleOrderAPI.getFgAndSfgItems({
                    branch,
                    orgId,
                });

                const map = {};
                const opts = (list || []).map((it) => {
                    const value = it.itemId;
                    map[value] = it;
                    return { value, label: it.itemCode || String(it.itemId) };
                });

                if (!cancelled) {
                    itemMapRef.current = map;
                    setItemOptions(opts);
                }
            } catch (err) {
                console.error("Failed to load FG/SFG items:", err);
                if (!cancelled) {
                    setItemOptions([]);
                    itemMapRef.current = {};
                }
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchScheduleOrderType, branch, orgId]);

    /* ---------------- Doc Id auto-generation (Add mode) ---------------- */

    useEffect(() => {
        if (isEditMode || docIdLoadedRef.current) return;
        if (!orgId) return;

        (async () => {
            try {
                const financialYear = String(new Date().getFullYear());
                const docId = await productionScheduleOrderAPI.getDocId({
                    financialYear,
                    orgId,
                });
                if (docId) {
                    setValue("scheduleOrderNo", docId);
                    docIdLoadedRef.current = true;
                }
            } catch (err) {
                console.error("Failed to generate Doc Id:", err);
            }
        })();
    }, [isEditMode, orgId, setValue]);

    /* ---------------- Load items when BOM changes ---------------- */

    useEffect(() => {
        if (!watchBomId) {
            setItemDetailOptions([]);
            itemDetailMapRef.current = {};
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const list = await productionScheduleOrderAPI.getItemsByBom({
                    bom: watchBomId,
                    branch,
                    orgId,
                });

                const map = {};
                const opts = (list || []).map((it) => {
                    const value = it.itemId;
                    map[value] = it;
                    return {
                        value,
                        label: `${it.itemCode} — ${it.itemDescription}`,
                    };
                });

                if (!cancelled) {
                    itemDetailMapRef.current = map;
                    setItemDetailOptions(opts);

                    // Recalculate existing rows against new BOM data
                    const batchQty = Number(getValues("batchQty")) || 0;
                    const currentRows = getValues("productionDetails") || [];
                    const nextRows = currentRows.map((row) => {
                        const detail = map[row.itemCode];
                        if (!detail) return row;
                        const bomQty = Number(row.bomQty) || 0;
                        return {
                            ...row,
                            itemDescription: detail.itemDescription || row.itemDescription,
                            itemType: detail.itemType || row.itemType,
                            qtyRequired:
                                batchQty && bomQty ? (batchQty * bomQty).toFixed(4) : row.qtyRequired,
                        };
                    });
                    productionDetailArray.replace(nextRows);
                }
            } catch (err) {
                console.error("Failed to load items by BOM:", err);
                if (!cancelled) {
                    setItemDetailOptions([]);
                    itemDetailMapRef.current = {};
                }
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchBomId, branch, orgId]);

    /* ---------------- Re-sync on edit data ---------------- */
    useEffect(() => {
        if (!data) return;

        reset({
            plantId: data.plant?.id ?? data.plantId ?? "",
            scheduleOrderNo: data.scheduleOrderNo ?? data.docId ?? "",
            scheduleOrderType: data.scheduleOrderType ?? data.orderType ?? "",
            date: fmtDate(data.date || data.docDate) || dayjs().format("DD-MM-YYYY"),
            lcPoNo: data.lcPoNo ?? "",
            lcPoDate: fmtDate(data.lcPoDate),
            fgItemCode: data.fgItem?.id ?? data.fgItemCode ?? "",
            fgItemDescription:
                data.fgItem?.itemDescription ?? data.fgItemDescription ?? "",
            compRouteNo: data.compRouteNo ?? "",
            bomId: data.bom?.id ?? data.bomId ?? "",
            scheduleStartDate: fmtDate(data.scheduleStartDate),
            scheduleEndDate: fmtDate(data.scheduleEndDate),
            batchQty: data.batchQty ?? "",
            shortClosed: /* ... */ "No",
            totalQty: data.totalQty ?? 0,
            productionDetails:
                (data.productionDetails || []).length
                    ? data.productionDetails.map((d) => ({
                        itemCode: d.item?.id ?? d.itemCode ?? "",
                        itemDescription: d.item?.itemDescription ?? "",
                        itemType: d.itemType ?? "",
                        bomQty: d.bomQty ?? "",
                        qtyRequired: d.qtyRequired ?? "",
                        unit: d.unit?.id ?? d.unit ?? "",
                        scrapQty: d.scrapQty ?? "",
                        scrapUnit: d.scrapUnit?.id ?? d.scrapUnit ?? "",
                    }))
                    : [getDefaultProductionDetailRow()],
            schedules:
                (data.schedules || []).length
                    ? data.schedules.map((s) => ({
                        scheduledDate: fmtDate(s.scheduleDate || s.scheduledDate),
                        qty: s.qty ?? "",
                        remarks: s.remarks ?? "",
                    }))
                    : [getDefaultScheduleRow()],
        });

        if (data.docId || data.scheduleOrderNo) docIdLoadedRef.current = true;
    }, [data, reset]);

    /* ---------------- Recalculate Qty Required when Batch Qty or any row's BOM Qty changes ---------------- */

    useEffect(() => {
        const batchQty = Number(watchBatchQty) || 0;
        const rows = watchProductionDetails || [];

        if (!rows.length) {
            setValue("totalQty", 0);
            return;
        }

        let totalQty = 0;

        const updatedRows = rows.map((row) => {
            const bomQty = Number(row.bomQty) || 0;

            // Qty Required = Batch Qty × BOM Qty
            const qtyRequired = batchQty * bomQty;

            totalQty += qtyRequired;

            return {
                ...row,
                qtyRequired: qtyRequired > 0
                    ? qtyRequired.toFixed(4)
                    : "",
            };
        });

        // Update rows only when Qty Required actually changed
        const changed = updatedRows.some(
            (row, index) =>
                String(row.qtyRequired) !==
                String(rows[index]?.qtyRequired ?? "")
        );

        if (changed) {
            productionDetailArray.replace(updatedRows);
        }

        // Total Qty = sum of all Qty Required
        setValue("totalQty", totalQty, {
            shouldDirty: true,
        });

    }, [watchBatchQty, watchProductionDetails, setValue]);

    /* ---------------- Handlers ---------------- */

    const handleFGItemChange = (id) => {
        const item = itemMapRef.current[id];
        setValue("fgItemCode", id, { shouldDirty: true });
        setValue("fgItemDescription", item?.itemDescription || "", {
            shouldDirty: true,
        });
    };

    const handleProductionItemChange = (idx, field, value) => {
        setValue(`productionDetails.${idx}.${field}`, value, { shouldDirty: true });

        if (field === "itemCode") {
            const detail = itemDetailMapRef.current[value];
            const batchQty = Number(getValues("batchQty")) || 0;

            setValue(
                `productionDetails.${idx}.itemDescription`,
                detail?.itemDescription || "",
                { shouldDirty: true },
            );
            setValue(
                `productionDetails.${idx}.itemType`,
                detail?.itemType || "",
                { shouldDirty: true },
            );

            const bomQty = Number(detail?.bomQty) || 0;
            setValue(`productionDetails.${idx}.bomQty`, bomQty || "", {
                shouldDirty: true,
            });
            setValue(
                `productionDetails.${idx}.qtyRequired`,
                batchQty && bomQty ? (batchQty * bomQty).toFixed(4) : "",
                { shouldDirty: true },
            );
        }
    };

    const handleBomQtyChange = (index, value) => {
        const bomQty = Number(value) || 0;
        const batchQty = Number(getValues("batchQty")) || 0;

        const qtyRequired = batchQty * bomQty;

        // Update BOM Qty
        setValue(`productionDetails.${index}.bomQty`, value, {
            shouldDirty: true,
            shouldValidate: true,
        });

        // Update Qty Required immediately
        setValue(
            `productionDetails.${index}.qtyRequired`,
            qtyRequired > 0 ? qtyRequired.toFixed(4) : "",
            {
                shouldDirty: true,
            }
        );

        // Recalculate Total Qty
        const rows = getValues("productionDetails") || [];

        const totalQty = rows.reduce((total, row, rowIndex) => {
            const currentBomQty =
                rowIndex === index ? bomQty : Number(row.bomQty) || 0;

            return total + batchQty * currentBomQty;
        }, 0);

        setValue("totalQty", totalQty, {
            shouldDirty: true,
        });
    };

    const handleAddProductionDetail = () => {
        productionDetailArray.append(getDefaultProductionDetailRow());
    };

    const handleRemoveProductionDetail = (index) => {
        if (productionDetailArray.fields.length > 1)
            productionDetailArray.remove(index);
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

    /* ---------------- Validation & Save ---------------- */

    const validate = () => {
        const missing = [];
        if (!watch("plantId")) missing.push("Plant");
        if (!watch("date")) missing.push("Date");
        if (!watch("batchQty")) missing.push("Batch Qty");

        // FG / SFG item is only required for DIRECT / SALES types
        const type = (watchScheduleOrderType || "").trim().toUpperCase();
        if (FG_SFG_ALLOWED_TYPES.includes(type) && !watch("fgItemCode")) {
            missing.push("FG / SFG Item Code");
        }

        if (missing.length) {
            addToast(`Missing mandatory fields: ${missing.join(", ")}`, "error");
            return false;
        }
        return true;
    };

    const onSubmit = async (formData) => {
        if (!validate()) return;

        setSaving(true);
        const isUpdate = Boolean(data?.id);
        const financialYear = String(new Date().getFullYear());

        const payload = {
            ...(isUpdate ? { id: Number(data.id) } : {}),

            active: true,
            cancelRemarks: "",
            orgId,
            branch,
            financialYear,

            createdBy: isUpdate ? data?.createdBy ?? usersId : usersId,

            plant: formData.plantId ? Number(formData.plantId) : 0,
            scheduleOrderNo: formData.scheduleOrderNo || "",
            orderType: formData.scheduleOrderType || "",
            date: fmtISO(formData.date),
            lcPoNo: formData.lcPoNo || "",
            lcPoDate: formData.lcPoDate ? fmtISO(formData.lcPoDate) : "",
            fgItem: formData.fgItemCode ? Number(formData.fgItemCode) : 0,
            compRouteNo: Number(formData.compRouteNo) || 0,
            bom: formData.bomId ? Number(formData.bomId) : 0,
            scheduleStartDate: formData.scheduleStartDate
                ? fmtISO(formData.scheduleStartDate)
                : "",
            scheduleEndDate: formData.scheduleEndDate
                ? fmtISO(formData.scheduleEndDate)
                : "",
            batchQty: Number(formData.batchQty) || 0,
            shortClose: formData.shortClosed || "No",

            productionScheduleOrderDetailsDTO: (formData.productionDetails || [])
                .filter((r) => r.itemCode)
                .map((r) => ({
                    item: Number(r.itemCode) || 0,
                    bomQty: Number(r.bomQty) || 0,
                    unit: Number(r.unit) || 0,
                    scrapQty: Number(r.scrapQty) || 0,
                    scrapUnit: Number(r.scrapUnit) || 0,
                })),

            scheduleDetailsDTO: (formData.schedules || [])
                .filter((r) => r.scheduledDate)
                .map((r) => ({
                    scheduleDate: fmtISO(r.scheduledDate),
                    qty: Number(r.qty) || 0,
                    remarks: r.remarks || "",
                })),
        };

        console.log("📤 Saving Production Schedule Order:", payload);

        try {
            const response = await productionScheduleOrderAPI.createUpdate(payload);

            const isSuccess =
                response?.status === true ||
                response?.statusFlag === "Ok" ||
                response?.status === 200 ||
                response?.statusCode === 200;

            if (isSuccess) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Production Schedule Order updated successfully!"
                        : "Production Schedule Order created successfully!"),
                    "success",
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.message ||
                    response?.paramObjectsMap?.message ||
                    "Failed to save Production Schedule Order.",
                    "error",
                );
            }
        } catch (err) {
            console.error("Save Production Schedule Order Error:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.statusMessage ||
                err.response?.data?.error ||
                "Something went wrong.";
            addToast(errorMessage, "error");
        } finally {
            setSaving(false);
        }
    };

    /* ---------------- Render ---------------- */

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
                readOnly
                errors={errors}
            />

            <SelectField
                control={control}
                name="scheduleOrderType"
                label="Sch. Order Type"
                options={orderTypeOptions}
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

            <InputField
                control={control}
                name="lcPoNo"
                label="LC PO No."
                errors={errors}
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
                label="FG / SFG Item Code"
                options={itemOptions}
                required={isFgSfgApplicable}
                errors={errors}
                onChange={handleFGItemChange}
                placeholder={
                    isFgSfgApplicable
                        ? "Select an option"
                        : "Not applicable for this type"
                }
                disabled={!isFgSfgApplicable}
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
                onChange={(e) => {
                    const batchQty = Number(e.target.value) || 0;
                    const rows = getValues("productionDetails") || [];

                    let totalQty = 0;

                    rows.forEach((row, index) => {
                        const bomQty = Number(row.bomQty) || 0;
                        const qtyRequired = batchQty * bomQty;

                        totalQty += qtyRequired;

                        setValue(
                            `productionDetails.${index}.qtyRequired`,
                            qtyRequired > 0 ? qtyRequired.toFixed(4) : "",
                            {
                                shouldDirty: true,
                            }
                        );
                    });

                    setValue("totalQty", totalQty, {
                        shouldDirty: true,
                    });
                }}
            />
        </div>
    );

    const renderProductionDetailTab = () => {
        const headers = [
            "S.No",
            "Item Code",
            "Item Description",
            "Item Type",
            "BOM Qty",
            "Qty Required",
            "Unit",
            "Scrap Qty",
            "Scrap Unit",
            "Action",
        ];

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
                                    options={itemDetailOptions}
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
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.itemType`}
                                    readOnly
                                    placeholder="Item Type"
                                    errors={errors}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.bomQty`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    errors={errors}
                                    onChange={(e) => handleBomQtyChange(index, e.target.value)}
                                />
                                <InputCell
                                    control={control}
                                    name={`productionDetails.${index}.qtyRequired`}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    readOnly
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
                                <SelectCell
                                    control={control}
                                    name={`productionDetails.${index}.scrapUnit`}
                                    options={unitOptions}
                                    errors={errors}
                                    placeholder="Select"
                                />
                            </TableRow>
                        ))}
                    </tbody>
                </TableWrapper>
            </div>
        );
    };

    const DatePickerCell = ({ control, name, errors }) => {
        const [open, setOpen] = useState(false);
        const [currentMonth, setCurrentMonth] = useState(dayjs());

        const getError = () => {
            const parts = name.split(".");
            let error = errors;
            for (const part of parts) {
                if (error && error[part]) error = error[part];
                else return null;
            }
            return error?.message;
        };

        const errorMessage = getError();

        const getCalendarDays = (month) => {
            const startDay = month.startOf("month").day();
            const daysInMonth = month.daysInMonth();
            const days = [];
            for (let i = 0; i < startDay; i++) days.push(null);
            for (let i = 1; i <= daysInMonth; i++) days.push(month.date(i));
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
                                        onClick={() => setOpen((prev) => !prev)}
                                        className={`${controlClasses} pr-7 cursor-pointer ${errorMessage ? "border-red-500" : ""
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
                                                    setCurrentMonth((prev) => prev.subtract(1, "month"))
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
                                                    setCurrentMonth((prev) => prev.add(1, "month"))
                                                }
                                                className="h-6 w-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                ›
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7">
                                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                                <div
                                                    key={d}
                                                    className="text-center text-[9px] text-gray-500 py-1"
                                                >
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {getCalendarDays(currentMonth).map((date, index) =>
                                                date ? (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            field.onChange(date.format("DD-MM-YYYY"));
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
                                                ),
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
                            {Number(totalQty).toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Short Closed?</label>
                        <SelectField
                            control={control}
                            name="shortClosed"
                            label=""
                            options={["Yes", "No"]}
                            errors={errors}
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-2">
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

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                <div>
                    <SectionHeader>Production Schedule Order</SectionHeader>
                    {renderHeader()}
                </div>

                <section className="mt-0 bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
                        {[
                            { key: "productionDetail", label: "Production Detail" },
                            { key: "schedules", label: "Schedules" },
                            { key: "summary", label: "Production Summary" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === tab.key
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 dark:text-gray-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "productionDetail" && renderProductionDetailTab()}
                    {activeTab === "schedules" && renderSchedulesTab()}
                    {activeTab === "summary" && renderSummaryTab()}
                </section>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={saving || isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" /> Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving || isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="h-3 w-3" />{" "}
                        {saving || isSubmitting ? "Saving..." : data ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductionScheduleOrderForm;