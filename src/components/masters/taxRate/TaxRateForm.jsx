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
                    <option value="">-- Select --</option>
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
                <label className={`${labelClasses} select-none opacity-0`}>-</label>
                <label className={`${controlClasses} flex items-center gap-1.5 cursor-pointer`}>
                    <input
                        type="checkbox"
                        name={name}
                        checked={value}
                        onChange={onChange}
                        className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">{label}</span>
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
                className={controlClasses}
                placeholder={placeholder}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-3 gap-y-2 items-start";

// Dummy data for dropdowns
const CATEGORY_OPTIONS = [
    { value: "goods", label: "Goods" },
    { value: "services", label: "Services" },
];

const HSN_OPTIONS = [
    { value: "hsn_1", label: "HSN 1 - 0101" },
    { value: "hsn_2", label: "HSN 2 - 0201" },
    { value: "hsn_3", label: "HSN 3 - 0301" },
    { value: "hsn_4", label: "HSN 4 - 0401" },
    { value: "hsn_5", label: "HSN 5 - 0501" },
];

const IGST_OPTIONS = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
];

const CGST_OPTIONS = [
    { value: "0", label: "0%" },
    { value: "2.5", label: "2.5%" },
    { value: "6", label: "6%" },
    { value: "9", label: "9%" },
    { value: "14", label: "14%" },
];

const TAXABLE_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const TaxRateForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [form, setForm] = useState({
        category: data?.category || "",
        hsnCode: data?.hsnCode || "",
        description: data?.description || "",
        wef: data?.wef || "",
        igstRate: data?.igstRate || "",
        taxableYN: data?.taxableYN || "",
        rate: data?.rate || "",
        cgstRate: data?.cgstRate || "",
        active: data?.active ?? true,
        id: data?.id || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validate = () => {
        const errors = {};

        if (!form.category)
            errors.category = "Category is required";
        if (!form.hsnCode)
            errors.hsnCode = "HSN/SAC Code is required";
        if (!form.wef)
            errors.wef = "WEF Date is required";
        if (!form.taxableYN)
            errors.taxableYN = "Taxable Y/N is required";
        if (!form.rate)
            errors.rate = "Rate is required";
        else if (isNaN(form.rate) || parseFloat(form.rate) < 0)
            errors.rate = "Rate must be a positive number";
        if (form.cgstRate && isNaN(form.cgstRate))
            errors.cgstRate = "CGST Rate must be a number";

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
                    ? "Tax Rate Updated Successfully!"
                    : "Tax Rate Saved Successfully!"
            );
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to save Tax Rate.");
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
                    {data ? "Edit Tax Rate" : "Add Tax Rate"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        error={fieldErrors.category}
                        required
                        options={CATEGORY_OPTIONS}
                    />

                    <Field
                        type="select"
                        label="HSN/SAC Code"
                        name="hsnCode"
                        value={form.hsnCode}
                        onChange={handleChange}
                        error={fieldErrors.hsnCode}
                        required
                        options={HSN_OPTIONS}
                    />

                    <Field
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Enter Description"
                    />

                    <Field
                        type="date"
                        label="WEF"
                        name="wef"
                        value={form.wef}
                        onChange={handleChange}
                        error={fieldErrors.wef}
                        required
                    />

                    <Field
                        label="IGST Rate"
                        name="igstRate"
                        value={form.igstRate}
                        onChange={handleChange}
                    />

                    <Field
                        label="SGST Rate"
                        name="sgstRate"
                        value={form.sgstRate}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Taxable Y/N"
                        name="taxableYN"
                        value={form.taxableYN}
                        onChange={handleChange}
                        error={fieldErrors.taxableYN}
                        required
                        options={TAXABLE_OPTIONS}
                    />

                    <Field
                        label="Rate"
                        name="rate"
                        type="number"
                        value={form.rate}
                        onChange={handleChange}
                        error={fieldErrors.rate}
                        required
                        placeholder="Enter Rate"
                    />

                    <Field
                        label="CGST Rate"
                        name="cgstRate"
                        value={form.cgstRate}
                        onChange={handleChange}
                    />
                </div>

                {/* Active Toggle */}
                {/* <div className="flex items-center gap-2">
                    <label className={labelClasses}>Active</label>
                    <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
                        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                    >
                        <span
                            className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-6" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                </div> */}

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

export default TaxRateForm;