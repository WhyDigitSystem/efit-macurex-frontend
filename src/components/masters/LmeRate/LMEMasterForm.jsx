import React, { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

const controlClasses =
    "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
    "bg-white dark:bg-gray-900 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-gray-100 " +
    "placeholder-gray-400 dark:placeholder-gray-500 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
    "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
    "[color-scheme:light] dark:[color-scheme:dark]";

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
}) => {
    if (type === "select") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
                <select name={name} value={value} onChange={onChange} className={controlClasses}>
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
                className={controlClasses}
                placeholder={placeholder}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const LMEMasterForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [form, setForm] = useState({
        currencySymbol: data?.currencySymbol || "",
        currencyName: data?.currencyName || "",
        lmeRate: data?.lmeRate || "",
        lmeDateFrom: data?.lmeDateFrom || "",
        lmeDateTo: data?.lmeDateTo || "",
        id: data?.id || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const errors = {};

        if (!form.currencySymbol.trim())
            errors.currencySymbol = "Currency Symbol is required";
        if (!form.lmeRate)
            errors.lmeRate = "LME Rate is required";
        if (!form.lmeDateFrom)
            errors.lmeDateFrom = "LME Date From is required";
        if (!form.lmeDateTo)
            errors.lmeDateTo = "LME Date To is required";

        // Validate date range
        if (form.lmeDateFrom && form.lmeDateTo && new Date(form.lmeDateTo) < new Date(form.lmeDateFrom)) {
            errors.lmeDateTo = "LME Date To must be after LME Date From";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const payload = {
            ...(data?.id && { id: data.id }),
            orgId,
            ...form,
            cancel: false,
            createdBy: "ITC001",
        };

        console.log(payload);

        try {
            alert(
                data
                    ? "LME Updated Successfully!"
                    : "LME Saved Successfully!"
            );
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to save LME.");
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
                    {data ? "Edit LME" : "Add LME"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        label="Currency Symbol"
                        name="currencySymbol"
                        value={form.currencySymbol}
                        onChange={handleChange}
                        error={fieldErrors.currencySymbol}
                        required
                        placeholder="Enter Currency Symbol"
                    />
                    <Field
                        label="Currency Name"
                        name="currencyName"
                        value={form.currencyName}
                        onChange={handleChange}
                        placeholder="Enter Currency Name"
                    />
                    <Field
                        label="LME Rate"
                        name="lmeRate"
                        type="number"
                        value={form.lmeRate}
                        onChange={handleChange}
                        error={fieldErrors.lmeRate}
                        required
                        placeholder="Enter LME Rate"
                    />
                    <Field
                        label="LME Date From"
                        name="lmeDateFrom"
                        type="date"
                        value={form.lmeDateFrom}
                        onChange={handleChange}
                        error={fieldErrors.lmeDateFrom}
                        required
                    />
                    <Field
                        label="LME Date To"
                        name="lmeDateTo"
                        type="date"
                        value={form.lmeDateTo}
                        onChange={handleChange}
                        error={fieldErrors.lmeDateTo}
                        required
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
                        {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LMEMasterForm;