import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import screensAPI from "../../../api/screensAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const Field = ({
    label,
    name,
    value,
    onChange,
    error,
    required,
    type = "text",
    options = [],
    className = "",
    placeholder = "",
    disabled = false,
    checked = false,
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
                    className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                    disabled={disabled}
                >
                    <option value="">Select</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
            </div>
        );
    }

    if (type === "checkbox") {
        return (
            <div className={`w-full ${className}`}>
                <label className={`${labelClasses} select-none`}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
                <label className={`${controlClasses} flex items-center gap-2 cursor-pointer h-[30px]`}>
                    <input
                        type="checkbox"
                        name={name}
                        checked={checked}
                        onChange={onChange}
                        className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200 text-xs">{label}</span>
                </label>
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
                className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                placeholder={placeholder}
                disabled={disabled}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

const ScreenNamesForm = ({ onBack, onSave, editData }) => {
    const ORG_ID = parseInt(localStorage.getItem("orgId")) || 1000000001;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const loginUserName = localStorage.getItem("userName") || "SYSTEM";

    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        id: editData?.id || 0,
        screenCode: editData?.screenCode || "",
        screenName: editData?.screenName || "",
        active: editData?.active ?? true,
        createdBy: localStorage.getItem("userName") || "SYSTEM",
    });

    // Field labels for toast messages
    const fieldLabels = {
        screenCode: "Screen Code",
        screenName: "Screen Name",
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        const alphanumericRegex = /^[A-Za-z0-9]*$/;
        const nameRegex = /^[A-Za-z ]*$/;

        let errorMessage = "";

        // Handle checkbox separately
        if (name === "active") {
            setForm(prev => ({ ...prev, active: checked }));
            return;
        }

        switch (name) {
            case "screenCode":
                if (!alphanumericRegex.test(value)) {
                    errorMessage = "Only alphanumeric characters are allowed";
                } else if (value.length > 10) {
                    errorMessage = "Screen Code must be maximum 10 characters";
                }
                break;
            case "screenName":
                if (!nameRegex.test(value)) {
                    errorMessage = "Only alphabets and spaces are allowed";
                }
                break;
            default:
                break;
        }

        if (errorMessage) {
            setFieldErrors(prev => ({ ...prev, [name]: errorMessage }));
        } else {
            const updatedValue = value.toUpperCase();
            setForm(prev => ({ ...prev, [name]: updatedValue }));
        }
    };

    const handleSave = async () => {
        // Validate form and show toast for first error
        const errors = {};

        if (!form.screenCode.trim()) errors.screenCode = "Screen Code is required";
        if (!form.screenName.trim()) errors.screenName = "Screen Name is required";

        // Validate lengths
        if (form.screenCode && form.screenCode.length > 10) errors.screenCode = "Screen Code must be maximum 10 characters";

        setFieldErrors(errors);

        // If there are errors, show the first one in toast and return
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
            const errorMessage = errors[firstErrorField];

            addToast(`${fieldLabel}: ${errorMessage}`, 'error');
            return;
        }

        setIsSubmitting(true);

        // Build payload - only include id if it exists and is not 0 (update scenario)
        const payload = {
            screenCode: form.screenCode,
            screenName: form.screenName,
            active: form.active === true || form.active === "true" ? true : false,
            createdBy: form.createdBy,
        };

        // Only add id if it exists and is not 0 (update scenario)
        if (form.id && form.id !== 0) {
            payload.id = form.id;
        }

        console.log("📤 Saving Screen Payload:", payload);

        try {
            const response = await screensAPI.saveScreen(payload);
            console.log("📥 Save Response:", response);

            // Check response status - similar to CityForm
            const status = response?.status === true || response?.statusFlag === "Ok";

            if (status) {
                const successMessage = response?.paramObjectsMap?.message ||
                    (form.id && form.id !== 0 ? "Screen updated successfully!" : "Screen created successfully!");

                addToast(successMessage, 'success');

                if (onSave) onSave(payload);
            } else {
                const errorMessage = response?.paramObjectsMap?.errorMessage ||
                    response?.paramObjectsMap?.message ||
                    response?.message ||
                    "Failed to save screen";

                addToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error("❌ Save Error:", error);
            const errorMessage = error.response?.data?.paramObjectsMap?.message ||
                error.response?.data?.paramObjectsMap?.errorMessage ||
                error.response?.data?.message ||
                "Save failed! Try again.";

            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-2 max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <button
                    onClick={onBack}
                    className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {editData ? "Edit Screen" : "Add Screen"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        label="Screen Code"
                        name="screenCode"
                        value={form.screenCode}
                        onChange={handleChange}
                        error={fieldErrors.screenCode}
                        required
                        placeholder="Enter Screen Code"
                    />

                    <Field
                        label="Screen Name"
                        name="screenName"
                        value={form.screenName}
                        onChange={handleChange}
                        error={fieldErrors.screenName}
                        required
                        placeholder="Enter Screen Name"
                    />

                    <Field
                        type="checkbox"
                        label="Active"
                        name="active"
                        checked={form.active}
                        onChange={handleChange}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="h-3 w-3" />
                        {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScreenNamesForm;