import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import reasonMasterAPI from "../../../api/Production/reasonMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
    "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
    "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-5 gap-y-4 items-start";

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
    rows = 3,
    className = "",
    disabled = false,
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
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`${controlClasses} ${error ? controlErrClasses : ""}`}
                >
                    <option value="">-- Select --</option>
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

    if (type === "textarea") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>

                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    disabled={disabled}
                    className={`${controlClasses} h-auto min-h-[60px] resize-y pt-1 ${error ? controlErrClasses : ""}`}
                />

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
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`${controlClasses} ${error ? controlErrClasses : ""}`}
            />

            {error && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
};

/* ---------------------------------------------------------------------------- */

const ReasonMasterForm = ({ editId, editData, onBack }) => {
    const { addToast } = useToast();
    const orgId = Number(localStorage.getItem("orgId")) || 0;
    const usersId =
        localStorage.getItem("usersId") ||
        localStorage.getItem("userName") ||
        "SYSTEM";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [dataLoadedRef, setDataLoadedRef] = useState(false);

    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [reasonOptions, setReasonOptions] = useState([]);

    const [form, setForm] = useState({
        id: 0,
        department: "",
        reason: "",
        reasonCode: "",
        reasonDescription: "",
        narration: "",
        active: true,
    });

    /* ---------------- Load lookups ---------------- */

    const loadLookups = useCallback(async () => {
        try {
            const departments = await departmentAPI.getAllDepartments(orgId);
            const deptList = departments?.paramObjectsMap?.departmentVO || [];
            setDepartmentOptions(
                deptList.map((d) => ({
                    value: d.id,
                    label: d.departmentName || d.departmentCode || d.id,
                })),
            );
        } catch (error) {
            console.error("Failed to load department options:", error);
        }

        try {
            const reasons = await listOfValuesAPI.getListValuesGroup(
                "Reason Master",
                orgId,
            );
            setReasonOptions(
                (reasons || []).map((r) => ({
                    value: r.id,
                    label: r.valuesDescription || r.reasonName || r.id,
                })),
            );
        } catch (error) {
            console.error("Failed to load reason options:", error);
        }
    }, [orgId]);

    /* ---------------- Load edit data ---------------- */

    const loadRecord = useCallback(
        async (id) => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await reasonMasterAPI.getById(id);
                if (data) {
                    setForm({
                        id: data.id || 0,
                        department: data.department
                            ? typeof data.department === "object"
                                ? data.department.id ?? ""
                                : data.department
                            : "",
                        reason: data.reason
                            ? typeof data.reason === "object"
                                ? data.reason.id ?? ""
                                : data.reason
                            : "",
                        reasonCode:
                            data.reasonCode || data.reasoncode || data.code || "",
                        reasonDescription:
                            data.reasonDescription ||
                            data.reasondescription ||
                            data.description ||
                            "",
                        narration: data.narration || "",
                        active:
                            data.active === "Active" || data.active === true,
                    });
                    setDataLoadedRef(true);
                }
            } catch (error) {
                console.error("Error loading reason master:", error);
                addToast("Failed to load Reason Master data", "error");
            } finally {
                setLoading(false);
            }
        },
        [addToast],
    );

    useEffect(() => {
        loadLookups();
    }, [loadLookups]);

    useEffect(() => {
        if (editId && !dataLoadedRef) {
            loadRecord(editId);
        } else if (editData) {
            setForm({
                id: editData.id || 0,
                department: editData.department
                    ? typeof editData.department === "object"
                        ? editData.department.id ?? ""
                        : editData.department
                    : "",
                reason: editData.reason
                    ? typeof editData.reason === "object"
                        ? editData.reason.id ?? ""
                        : editData.reason
                    : "",
                reasonCode:
                    editData.reasonCode || editData.reasoncode || editData.code || "",
                reasonDescription:
                    editData.reasonDescription ||
                    editData.reasondescription ||
                    editData.description ||
                    "",
                narration: editData.narration || "",
                active: editData.active === "Active" || editData.active === true,
            });
            setDataLoadedRef(true);
        }
    }, [editData, editId, loadRecord]);

    /* ---------------- Handlers ---------------- */

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /* ---------------- Client-side validation ---------------- */

    const validate = () => {
        const errors = {};

        if (!form.department) {
            errors.department = "Department is required";
        }
        if (!form.reason) {
            errors.reason = "Reason is required";
        }
        if (!form.reasonCode.trim()) {
            errors.reasonCode = "Reason Code is required";
        }
        if (!form.reasonDescription.trim()) {
            errors.reasonDescription = "Reason Description is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ---------------- Save (single transaction) ---------------- */

    const handleSave = async () => {
        if (!validate()) {
            const firstError = Object.values(fieldErrors)[0];
            addToast(firstError, "error");
            return;
        }

        setIsSubmitting(true);

        const isUpdate = Boolean(form.id);

        const payload = {
            ...(isUpdate ? { id: form.id } : {}),
            department: Number(form.department) || null,
            reason: Number(form.reason) || null,
            reasonCode: form.reasonCode.trim(),
            reasonDescription: form.reasonDescription.trim(),
            narration: form.narration.trim(),
            active: form.active,
            cancel: false,
            cancelRemarks: "",
            orgId,
            createdBy: usersId,
            updatedBy: usersId,
            screenCode: "RM",
            screenName: "REASONMASTER",
        };

        try {
            const response = await reasonMasterAPI.createUpdate(payload);

            const isSuccess =
                response?.status === true ||
                response?.statusFlag === "Ok";

            if (isSuccess) {
                addToast(
                    isUpdate
                        ? "Reason updated successfully!"
                        : "Reason created successfully!",
                    "success",
                );
                onBack();
            } else {
                const errorMessage =
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Failed to save";
                addToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong";
            addToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>

                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {form.id ? "Edit Reason" : "Add Reason"}
                </h2>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
                {/* Header Section */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Department"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        error={fieldErrors.department}
                        options={departmentOptions}
                        required
                    />

                    <Field
                        type="select"
                        label="Reason"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        error={fieldErrors.reason}
                        options={reasonOptions}
                        required
                    />

                    <Field
                        label="Reason Code"
                        name="reasonCode"
                        value={form.reasonCode}
                        onChange={handleChange}
                        error={fieldErrors.reasonCode}
                        required
                    />
                </div>

                <div className={fieldGrid}>
                    <Field
                        type="textarea"
                        label="Reason Description"
                        name="reasonDescription"
                        value={form.reasonDescription}
                        onChange={handleChange}
                        error={fieldErrors.reasonDescription}
                        rows={3}
                        required
                    />

                    <Field
                        type="textarea"
                        label="Narration"
                        name="narration"
                        value={form.narration}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                    <span className={labelClasses}>Active</span>
                    <button
                        type="button"
                        onClick={() =>
                            setForm((prev) => ({ ...prev, active: !prev.active }))
                        }
                        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                            form.active
                                ? "bg-blue-600"
                                : "bg-gray-300 dark:bg-gray-600"
                        }`}
                    >
                        <span
                            className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                                form.active
                                    ? "translate-x-6"
                                    : "translate-x-0.5"
                            }`}
                        />
                    </button>
                </div>

                {/* Save / Cancel */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" /> Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="h-3 w-3" />
                        {isSubmitting
                            ? "Saving..."
                            : form.id
                                ? "Update"
                                : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReasonMasterForm;