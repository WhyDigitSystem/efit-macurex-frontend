import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import shiftAPI from "../../../api/shiftAPI";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Design tokens                                                               */

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs dark:text-gray-100 leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
    "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const cellInputClasses =
    "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
    "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-4 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
    label,
    name,
    value,
    onChange,
    error,
    required,
    type = "text",
    options,
    className = "",
    disabled = false,
    readOnly = false,
    placeholder,
}) => {
    if (type === "select") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>

                <select
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    disabled={disabled}
                    className={`${controlClasses} ${error ? controlErrClasses : ""}`}
                >
                    <option value="">Select an option</option>
                    {(options || []).map((opt) => (
                        <option key={opt.value ?? opt} value={opt.value ?? opt}>
                            {opt.label ?? opt}
                        </option>
                    ))}
                </select>

                {error && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <label className={labelClasses}>
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>

            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`${controlClasses} ${error ? controlErrClasses : ""} ${readOnly ? "bg-gray-100 dark:bg-gray-800" : ""
                    }`}
            />

            {error && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
};

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <X className="h-3 w-3" />
            Cancel
        </button>

        <button
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : saveLabel}
        </button>
    </div>
);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                     */

const timeToMinutes = (time) => {
    if (!time || typeof time !== "string") return null;
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

const formatTimeLabel = (minutes) => {
    const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours = Math.floor(normalized / 60);
    const mins = normalized % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${String(displayHour).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0",
    )} ${period}`;
};

/**
 * Normalize any incoming time value to `HH:mm`.
 * Handles: "04:30", "04:30:00", ISO strings, dayjs-parseable values.
 */
const normalizeToHHmm = (value) => {
    if (!value) return null;
    const str = String(value);

    // Already HH:mm or HH:mm:ss
    const m = str.match(/^(\d{1,2}):(\d{2})/);
    if (m) {
        return `${String(Number(m[1])).padStart(2, "0")}:${m[2]}`;
    }

    // Fallback for ISO / date strings
    const d = dayjs(value);
    return d.isValid() ? d.format("HH:mm") : null;
};

/**
 * Normalizes a break-timing string coming from the API into `{ from, to }`
 * Supports formats like:
 *   "1.15PM-2.00PM"
 *   "13:15-14:00"
 *   "01:15 PM - 02:00 PM"
 */
const parseBreakTiming = (value) => {
    if (!value || typeof value !== "string") return { from: "", to: "" };

    const parts = value.split(/[-–—]/).map((p) => p.trim());
    if (parts.length < 2) return { from: "", to: "" };

    const to24 = (str) => {
        if (!str) return "";

        // Already HH:mm
        const hhmmMatch = str.match(/^(\d{1,2}):(\d{2})$/);
        if (hhmmMatch) {
            const h = String(Math.min(23, Number(hhmmMatch[1]))).padStart(2, "0");
            const m = String(Math.min(59, Number(hhmmMatch[2]))).padStart(2, "0");
            return `${h}:${m}`;
        }

        // 12-hour format: 1.15PM / 1:15 PM / 01:15PM
        const match = str.match(/^(\d{1,2})[.:](\d{2})\s*(AM|PM)$/i);
        if (!match) return "";

        let h = Number(match[1]);
        const m = Number(match[2]);
        const period = match[3].toUpperCase();

        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;

        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    return { from: to24(parts[0]), to: to24(parts[1]) };
};

/**
 * Combines `HH:mm` from + to into a display string like "01:15 PM - 02:00 PM"
 */
const buildBreakTimingString = (from, to) => {
    const fromMin = timeToMinutes(from);
    const toMin = timeToMinutes(to);
    if (fromMin === null || toMin === null) return "";
    return `${formatTimeLabel(fromMin)} - ${formatTimeLabel(toMin)}`;
};

/* ---------------------------------------------------------------------------- */
/* Empty row builders                                                          */

const emptyBreakRow = () => ({
    id: Date.now() + Math.random(),
    break: "",
    breakFrom: "",
    breakTo: "",
});

const emptyHeader = () => ({
    shiftName: "",
    shiftType: "",
    shiftCode: "",
    fromHour: null,
    toHour: null,
    timing: "",
    active: true,
});

/* ---------------------------------------------------------------------------- */

const ShiftForm = ({ data, onBack }) => {
    const { addToast } = useToast();
    const orgId = Number(localStorage.getItem("orgId"));
    const finYear = localStorage.getItem("finYear") || "";
    const loginUserName = localStorage.getItem("userName") || "SYSTEM";

    const [header, setHeader] = useState(emptyHeader());
    const [shiftTimingRows, setShiftTimingRows] = useState([]);
    const [breakRows, setBreakRows] = useState([emptyBreakRow()]);
    const [breakErrors, setBreakErrors] = useState([
        { break: "", breakFrom: "", breakTo: "" },
    ]);
    const [activeTab, setActiveTab] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [editId, setEditId] = useState(data?.id || "");

    /* ---------------- Auto-calculate Shift Timing rows ---------------- */
    useEffect(() => {
        if (editId) return;

        const { fromHour, toHour } = header;

        if (!fromHour || !toHour) {
            setShiftTimingRows([]);
            setHeader((prev) => ({ ...prev, timing: "" }));
            return;
        }

        const fromMinutes = timeToMinutes(fromHour);
        let toMinutes = timeToMinutes(toHour);

        if (fromMinutes === null || toMinutes === null) return;

        // Handle overnight shift (22:00 → 06:00)
        if (toMinutes <= fromMinutes) {
            toMinutes += 24 * 60;
        }

        const totalMinutes = toMinutes - fromMinutes;
        if (totalMinutes <= 0) {
            setShiftTimingRows([]);
            setHeader((prev) => ({ ...prev, timing: "" }));
            return;
        }

        const rows = [];
        let currentMinutes = fromMinutes;
        let rowId = 1;

        while (currentMinutes < toMinutes) {
            const nextMinutes = Math.min(currentMinutes + 60, toMinutes);

            rows.push({
                id: rowId++,
                shiftTiming: `${formatTimeLabel(currentMinutes)} - ${formatTimeLabel(
                    nextMinutes,
                )}`,
            });

            currentMinutes = nextMinutes;
        }

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        let timing = "";
        if (remainingMinutes === 0) {
            timing = `${totalHours} hrs`;
        } else {
            timing = `${totalHours} hrs ${remainingMinutes} mins`;
        }

        setHeader((prev) => ({ ...prev, timing }));
        setShiftTimingRows(rows);
    }, [header.fromHour, header.toHour, editId]);

    /* ---------------- Hydrate from getById ---------------- */
    const hydrateFromRecord = useCallback((rec) => {
        if (!rec) return;

        setHeader((prev) => ({
            ...prev,
            shiftName: rec.shiftName || "",
            shiftType: rec.shiftType || "",
            shiftCode: rec.shiftCode || "",
            fromHour: normalizeToHHmm(rec.fromHour),
            toHour: normalizeToHHmm(rec.toHour),
            timing: rec.timing || "",
            active: !(
                rec.active === false ||
                rec.active === "Inactive" ||
                rec.active === "inactive"
            ),
        }));

        // Shift detail rows
        const details = rec.shiftDetailsVO || rec.shiftDetailsDTO || [];
        if (details.length) {
            setShiftTimingRows(
                details.map((r, i) => ({
                    id: r.id || i + 1,
                    shiftTiming: r.timingInHours || "",
                })),
            );
        } else {
            setShiftTimingRows([]);
        }

        // Break rows — API returns breakTimings like "1.15PM-2.00PM"
        const breakDetails =
            rec.shiftBreakTimingDetailsVO ||
            rec.shiftBreakTimingDetailsDTO ||
            [];

        if (breakDetails.length) {
            const parsed = breakDetails.map((r, i) => {
                const { from, to } = parseBreakTiming(r.breakTimings || "");
                return {
                    id: r.id || i + 1,
                    break: r.breakCategory || "",
                    breakFrom: from,
                    breakTo: to,
                };
            });
            setBreakRows(parsed);
            setBreakErrors(
                parsed.map(() => ({ break: "", breakFrom: "", breakTo: "" })),
            );
        } else {
            setBreakRows([emptyBreakRow()]);
            setBreakErrors([{ break: "", breakFrom: "", breakTo: "" }]);
        }
    }, []);

    useEffect(() => {
        const loadById = async () => {
            if (!data?.id) return;
            try {
                setLoadingRecord(true);
                setEditId(data.id);

                // API: api/commonmaster/getShiftById?id=...
                const record = await shiftAPI.getById(data.id);
                if (record) hydrateFromRecord(record);
            } catch (err) {
                console.error("Failed to load shift by id:", err);
                addToast("Failed to load Shift.", "error");
            } finally {
                setLoadingRecord(false);
            }
        };
        loadById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.id]);

    /* ---------------- Handlers ---------------- */
    const handleHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

        const nameRegex = /^[A-Za-z- ]*$/;
        const allRegex = /^[a-zA-Z0-9- ]*$/;

        let errorMessage = "";
        if (["shiftType"].includes(name) && !nameRegex.test(value)) {
            errorMessage = "Invalid Format";
        } else if (name === "shiftCode" && !allRegex.test(value)) {
            errorMessage = "Invalid Format";
        }

        if (errorMessage) {
            setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
            return;
        }

        setHeader((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : typeof value === "string"
                        ? value.toUpperCase()
                        : value,
        }));
    };

    const handleBreakCellChange = (idx, key, value) => {
        setBreakRows((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
        );
        setBreakErrors((prev) =>
            prev.map((row, i) =>
                i === idx
                    ? {
                        ...row,
                        [key]: value ? "" : "Required",
                    }
                    : row,
            ),
        );
    };

    const addBreakRow = () => {
        const last = breakRows[breakRows.length - 1];
        if (last && (!last.break || !last.breakFrom || !last.breakTo)) {
            setBreakErrors((prev) =>
                prev.map((row, i) =>
                    i === prev.length - 1
                        ? {
                            break: !last.break ? "Break is required" : "",
                            breakFrom: !last.breakFrom
                                ? "From time is required"
                                : "",
                            breakTo: !last.breakTo
                                ? "To time is required"
                                : "",
                        }
                        : row,
                ),
            );
            return;
        }
        setBreakRows((prev) => [...prev, emptyBreakRow()]);
        setBreakErrors((prev) => [
            ...prev,
            { break: "", breakFrom: "", breakTo: "" },
        ]);
    };

    const removeBreakRow = (idx) => {
        setBreakRows((prev) =>
            prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
        );
        setBreakErrors((prev) =>
            prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
        );
    };

    /* ---------------- Validation ---------------- */
    const validate = () => {
        const errors = {};
        if (!header.shiftName?.trim()) errors.shiftName = "Shift Name is required";
        if (!header.shiftType?.trim()) errors.shiftType = "Shift Type is required";
        if (!header.shiftCode?.trim()) errors.shiftCode = "Shift Code is required";
        if (!header.fromHour) errors.fromHour = "From Hour is required";
        if (!header.toHour) errors.toHour = "To Hour is required";
        if (!header.timing) errors.timing = "Timing is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ---------------- Save ---------------- */
    const handleSave = async () => {
        if (!validate()) {
            addToast("Please fix validation errors before saving.", "error");
            return;
        }

        if (!shiftTimingRows.length || shiftTimingRows.some((r) => !r.shiftTiming)) {
            addToast("All shift timing rows must be filled.", "error");
            return;
        }

        // Break row validation
        const hasBreakError = breakRows.some(
            (r) => !r.break || !r.breakFrom || !r.breakTo,
        );
        if (hasBreakError) {
            setBreakErrors(
                breakRows.map((r) => ({
                    break: !r.break ? "Break is required" : "",
                    breakFrom: !r.breakFrom ? "From time is required" : "",
                    breakTo: !r.breakTo ? "To time is required" : "",
                })),
            );
            addToast("Please fix break timing errors before saving.", "error");
            return;
        }

        setIsSubmitting(true);
        const isUpdate = Boolean(editId);

        const base = dayjs().startOf("day");
        const fromHour = header.fromHour
            ? dayjs(`${base.format("YYYY-MM-DD")}T${header.fromHour}:00`).toISOString()
            : base.toISOString();
        const toHour = header.toHour
            ? dayjs(`${base.format("YYYY-MM-DD")}T${header.toHour}:00`).toISOString()
            : base.endOf("day").toISOString();

        const payload = {
            active: header.active ?? true,
            createdBy: loginUserName,
            fromHour,
            orgId,
            shiftBreakTimingDetailsDTO: breakRows.map((r) => ({
                breakCategory: r.break || "",
                breakTimings: buildBreakTimingString(r.breakFrom, r.breakTo),
                id: 0,
            })),
            shiftCode: header.shiftCode,
            shiftDetailsDTO: shiftTimingRows.map((r) => ({
                timingInHours: r.shiftTiming,
            })),
            shiftName: header.shiftName,
            shiftType: header.shiftType,
            timing: header.timing || "",
            toHour,
            financialYear: finYear,
            ...(isUpdate ? { id: editId } : {}),
        };

        try {
            const response = await shiftAPI.updateCreateShift(payload);

            if (response?.status) {
                addToast(
                    response?.paramObjectsMap?.message ||
                    (isUpdate
                        ? "Shift Master Updated Successfully"
                        : "Shift Master Created Successfully"),
                );
                onBack?.();
            } else {
                addToast(
                    response?.errors?.[0]?.shortMessage ||
                    response?.errors?.[0]?.longMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Save failed. Please try again.",
                    "error",
                );
            }
        } catch (err) {
            console.error("Save Shift Error:", err);
            addToast("An error occurred while saving.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------------- Clear ---------------- */
    const handleClear = () => {
        setHeader(emptyHeader());
        setShiftTimingRows([]);
        setBreakRows([emptyBreakRow()]);
        setBreakErrors([{ break: "", breakFrom: "", breakTo: "" }]);
        setFieldErrors({});
        setEditId("");
        setActiveTab(0);
    };

    /* ---------------- Render ---------------- */

    if (loadingRecord) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">
                    Loading Shift...
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
                    {data ? "Edit Shift" : "Add Shift"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* ---------------- Header Fields ---------------- */}
                <div className={fieldGrid}>
                    <Field
                        label="Shift Name"
                        name="shiftName"
                        value={header.shiftName}
                        onChange={handleHeaderChange}
                        error={fieldErrors.shiftName}
                        required
                    />
                    <Field
                        label="Shift Type"
                        name="shiftType"
                        value={header.shiftType}
                        onChange={handleHeaderChange}
                        error={fieldErrors.shiftType}
                        required
                    />
                    <Field
                        label="Shift Code"
                        name="shiftCode"
                        value={header.shiftCode}
                        onChange={handleHeaderChange}
                        error={fieldErrors.shiftCode}
                        required
                    />

                    <div className="relative">
                        <label className={labelClasses}>
                            From Hour <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            name="fromHour"
                            value={header.fromHour || ""}
                            onChange={handleHeaderChange}
                            disabled={Boolean(editId)}
                            className={`${controlClasses} ${fieldErrors.fromHour ? controlErrClasses : ""
                                }`}
                        />
                        {fieldErrors.fromHour && (
                            <p className="text-[11px] text-red-500 mt-0.5">
                                {fieldErrors.fromHour}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <label className={labelClasses}>
                            To Hour <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            name="toHour"
                            value={header.toHour || ""}
                            onChange={handleHeaderChange}
                            disabled={Boolean(editId)}
                            className={`${controlClasses} ${fieldErrors.toHour ? controlErrClasses : ""
                                }`}
                        />
                        {fieldErrors.toHour && (
                            <p className="text-[11px] text-red-500 mt-0.5">
                                {fieldErrors.toHour}
                            </p>
                        )}
                    </div>

                    <Field
                        label="Timing"
                        name="timing"
                        value={header.timing}
                        onChange={handleHeaderChange}
                        error={fieldErrors.timing}
                        disabled
                    />
                    <div className="flex items-end h-full pb-1.5">
                        <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
                            <input
                                type="checkbox"
                                name="active"
                                checked={header.active}
                                onChange={handleHeaderChange}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                            />
                            Active
                        </label>
                    </div>
                </div>

                {/* ---------------- Child Tabs ---------------- */}
                <section className="bg-white dark:bg-gray-800">
                    <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setActiveTab(0)}
                            className={`px-4 py-1 text-xs font-semibold ${activeTab === 0
                                    ? "text-purple-700 dark:text-purple-300 border-b-2 border-purple-600"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            Shift Timing Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(1)}
                            className={`px-4 py-1 text-xs font-semibold ${activeTab === 1
                                    ? "text-purple-700 dark:text-purple-300 border-b-2 border-purple-600"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            Break Timing Details
                        </button>
                    </div>

                    {/* -------- Shift Timing Details Tab -------- */}
                    {activeTab === 0 && (
                        <div className="pt-3">
                            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-purple-700 text-white">
                                            <th className="p-2 w-20 text-center">
                                                S.No
                                            </th>
                                            <th className="p-2 text-left">Timing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shiftTimingRows.length ? (
                                            shiftTimingRows.map((row, idx) => (
                                                <tr
                                                    key={row.id || idx}
                                                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="p-2 text-center text-gray-800 dark:text-white">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="p-2 text-gray-800 dark:text-white">
                                                        {row.shiftTiming}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={2}
                                                    className="p-3 text-center text-gray-400"
                                                >
                                                    Select From Hour / To Hour to
                                                    generate timing rows.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* -------- Break Timing Details Tab -------- */}
                    {activeTab === 1 && (
                        <div className="pt-3">
                            <div className="flex items-center gap-1 pb-2">
                                <button
                                    type="button"
                                    onClick={addBreakRow}
                                    className="h-6 w-6 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-purple-700 text-white">
                                            <th className="p-2 w-20 text-left">
                                                Action
                                            </th>
                                            <th className="p-2 w-16 text-left">
                                                S.No
                                            </th>
                                            <th className="p-2 text-left">Break</th>
                                            <th className="p-2 text-left">
                                                Break Timing (From - To)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakRows.map((row, idx) => (
                                            <tr
                                                key={row.id}
                                                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="p-1 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeBreakRow(idx)
                                                        }
                                                        disabled={
                                                            breakRows.length <= 1
                                                        }
                                                        className={`h-6 w-6 rounded text-white flex items-center justify-center ${breakRows.length <= 1
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-red-600 hover:bg-red-700"
                                                            }`}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                                <td className="p-2 text-center text-gray-800 dark:text-white">
                                                    {idx + 1}
                                                </td>
                                                <td className="p-1 align-top">
                                                    <input
                                                        value={row.break}
                                                        onChange={(e) =>
                                                            handleBreakCellChange(
                                                                idx,
                                                                "break",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`${cellInputClasses} ${breakErrors[idx]?.break
                                                                ? controlErrClasses
                                                                : ""
                                                            }`}
                                                    />
                                                    {breakErrors[idx]?.break && (
                                                        <p className="text-[10px] text-red-500 mt-0.5">
                                                            {breakErrors[idx].break}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-1 align-top">
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="time"
                                                            value={row.breakFrom}
                                                            onChange={(e) =>
                                                                handleBreakCellChange(
                                                                    idx,
                                                                    "breakFrom",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className={`${cellInputClasses} ${breakErrors[idx]
                                                                    ?.breakFrom
                                                                    ? controlErrClasses
                                                                    : ""
                                                                }`}
                                                        />
                                                        <span className="text-gray-400 text-[11px]">
                                                            to
                                                        </span>
                                                        <input
                                                            type="time"
                                                            value={row.breakTo}
                                                            onChange={(e) =>
                                                                handleBreakCellChange(
                                                                    idx,
                                                                    "breakTo",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className={`${cellInputClasses} ${breakErrors[idx]
                                                                    ?.breakTo
                                                                    ? controlErrClasses
                                                                    : ""
                                                                }`}
                                                        />
                                                    </div>
                                                    {(breakErrors[idx]?.breakFrom ||
                                                        breakErrors[idx]
                                                            ?.breakTo) && (
                                                            <p className="text-[10px] text-red-500 mt-0.5">
                                                                {breakErrors[idx]
                                                                    ?.breakFrom ||
                                                                    breakErrors[idx]
                                                                        ?.breakTo}
                                                            </p>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                <FormButtons
                    onCancel={handleClear}
                    onSave={handleSave}
                    isSubmitting={isSubmitting}
                    saveLabel={data ? "Update" : "Save"}
                />
            </div>
        </div>
    );
};

export default ShiftForm;