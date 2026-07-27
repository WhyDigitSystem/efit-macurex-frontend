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

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const BankMasterForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [form, setForm] = useState({
        tsBank: data?.tsBank || "",
        beneficiaryName: data?.beneficiaryName || "",
        bankName: data?.bankName || "",
        acNo: data?.acNo || "",
        branch: data?.branch || "",
        ifscCode: data?.ifscCode || "",
        active: data?.active ?? true,
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

        // Auto-uppercase IFSC code
        const finalValue = name === "ifscCode" ? value.toUpperCase() : value;

        setForm((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const validate = () => {
        const errors = {};

        if (!form.tsBank.trim())
            errors.tsBank = "TSBank is required";
        if (!form.beneficiaryName.trim())
            errors.beneficiaryName = "Beneficiary Name is required";
        if (!form.bankName.trim())
            errors.bankName = "Bank Name is required";
        if (!form.acNo.trim())
            errors.acNo = "AC No is required";
        if (!form.branch.trim())
            errors.branch = "Branch is required";
        if (!form.ifscCode.trim())
            errors.ifscCode = "IFSC Code is required";
        else if (form.ifscCode.length < 11)
            errors.ifscCode = "IFSC Code must be at least 11 characters";

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
                    ? "Bank Updated Successfully!"
                    : "Bank Saved Successfully!"
            );
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to save Bank.");
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
                    {data ? "Edit Bank" : "Add Bank"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        label="Beneficiary Name"
                        name="beneficiaryName"
                        value={form.beneficiaryName}
                        onChange={handleChange}
                        error={fieldErrors.beneficiaryName}
                        required
                        placeholder="Enter Beneficiary Name"
                    />
                    <Field
                        label="Bank Name"
                        name="bankName"
                        value={form.bankName}
                        onChange={handleChange}
                        error={fieldErrors.bankName}
                        required
                        placeholder="Enter Bank Name"
                    />
                    <Field
                        label="AC No"
                        name="acNo"
                        value={form.acNo}
                        onChange={handleChange}
                        error={fieldErrors.acNo}
                        required
                        placeholder="Enter Account Number"
                    />
                    <Field
                        label="Branch"
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        error={fieldErrors.branch}
                        required
                        placeholder="Enter Branch"
                    />
                    <Field
                        label="IFSC Code"
                        name="ifscCode"
                        value={form.ifscCode}
                        onChange={handleChange}
                        error={fieldErrors.ifscCode}
                        required
                        placeholder="Enter IFSC Code"
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

export default BankMasterForm;