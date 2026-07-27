import React, { useState } from "react";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";

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
                    className={controlClasses}
                    disabled={disabled}
                >
                    <option value="">Select an option</option>
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
                <label className={`${controlClasses} flex items-center gap-1.5 cursor-pointer h-[30px]`}>
                    <input
                        type="checkbox"
                        name={name}
                        checked={checked}
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
                disabled={disabled}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

// Dummy data for dropdowns
const MODULE_OPTIONS = [
    { value: "sales", label: "Sales" },
    { value: "purchase", label: "Purchase" },
    { value: "inventory", label: "Inventory" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "HR" },
];

const FILL_COPY_OPTIONS = [
    { value: "none", label: "None" },
    { value: "original", label: "Original" },
    { value: "duplicate", label: "Duplicate" },
    { value: "triplicate", label: "Triplicate" },
];

const TAX_TYPE_OPTIONS = [
    { value: "cgst", label: "CGST" },
    { value: "sgst", label: "SGST" },
    { value: "igst", label: "IGST" },
    { value: "cess", label: "CESS" },
    { value: "vat", label: "VAT" },
    { value: "service_tax", label: "Service Tax" },
];

const ADD_LESS_OPTIONS = [
    { value: "add", label: "Add" },
    { value: "less", label: "Less" },
];

const TAX_PERCENTAGE_OPTIONS = [
    { value: "0", label: "0%" },
    { value: "2.5", label: "2.5%" },
    { value: "5", label: "5%" },
    { value: "6", label: "6%" },
    { value: "9", label: "9%" },
    { value: "12", label: "12%" },
    { value: "14", label: "14%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
];

const TAX_ID_OPTIONS = [
    { value: "tax_001", label: "Tax ID 001" },
    { value: "tax_002", label: "Tax ID 002" },
    { value: "tax_003", label: "Tax ID 003" },
    { value: "tax_004", label: "Tax ID 004" },
    { value: "tax_005", label: "Tax ID 005" },
];

const FORMULA_OPTIONS = [
    { value: "fixed", label: "Fixed" },
    { value: "percentage", label: "Percentage" },
    { value: "slab", label: "Slab" },
    { value: "custom", label: "Custom" },
];

const POST_TO_FINANCE_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const DB_CR_OPTIONS = [
    { value: "dr", label: "Dr" },
    { value: "cr", label: "Cr" },
];

const GL_ACCOUNT_OPTIONS = [
    { value: "gl_001", label: "GL Account 001" },
    { value: "gl_002", label: "GL Account 002" },
    { value: "gl_003", label: "GL Account 003" },
    { value: "gl_004", label: "GL Account 004" },
    { value: "gl_005", label: "GL Account 005" },
];

const PRINT_YN_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const TAX_POST_GST_OPTIONS = [
    { value: "gst_on_sales", label: "GST on Sales" },
    { value: "gst_on_purchase", label: "GST on Purchase" },
    { value: "gst_on_both", label: "GST on Both" },
];

const TaxDefinationForm = ({ data, onBack }) => {
    const [orgId] = useState(localStorage.getItem("orgId"));
    const [taxRows, setTaxRows] = useState([
        {
            id: 1,
            taxType: "",
            name: "",
            addLess: "",
            taxPercentage: "",
            taxId: "",
            formula: "",
            postToFinance: "",
            dbCr: "",
            glAccountName: "",
            printYN: "",
            taxPostGST: "",
        },
    ]);

    const [form, setForm] = useState({
        taxNo: data?.taxNo || "",
        auto: data?.auto || false,
        createdOn: data?.createdOn || new Date().toISOString().split('T')[0],
        taxDescription: data?.taxDescription || "",
        module: data?.module || "",
        effectiveDate: data?.effectiveDate || new Date().toISOString().split('T')[0],
        isActive: data?.isActive ?? false,
        fillCopyOf: data?.fillCopyOf || "",
        printName: data?.printName || '',
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

    const handleTaxRowChange = (index, field, value) => {
        const updatedRows = [...taxRows];
        updatedRows[index][field] = value;
        setTaxRows(updatedRows);
    };

    const handleAddRow = () => {
        setTaxRows([
            ...taxRows,
            {
                id: taxRows.length + 1,
                taxType: "",
                name: "",
                addLess: "",
                taxPercentage: "",
                taxId: "",
                formula: "",
                postToFinance: "",
                dbCr: "",
                glAccountName: "",
                printYN: "",
                taxPostGST: "",
            },
        ]);
    };

    const handleRemoveRow = (index) => {
        if (taxRows.length > 1) {
            setTaxRows(taxRows.filter((_, i) => i !== index));
        }
    };

    const validate = () => {
        const errors = {};

        if (!form.taxDescription.trim())
            errors.taxDescription = "Tax Description is required";
        if (!form.module)
            errors.module = "Module is required";
        if (!form.effectiveDate)
            errors.effectiveDate = "Effective Date is required";

        // Validate tax rows
        taxRows.forEach((row, index) => {
            if (!row.taxType) {
                errors[`taxType_${index}`] = "Tax Type is required";
            }
        });

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
            taxRows,
            cancel: false,
            createdBy: "ITC001",
        };

        console.log(payload);

        try {
            alert(
                data
                    ? "Tax Definition Updated Successfully!"
                    : "Tax Definition Saved Successfully!"
            );
            onBack();
        } catch (error) {
            console.error(error);
            alert("Failed to save Tax Definition.");
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
                    {data ? "Edit Tax Definition" : "Add Tax Definition"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        label="Tax No"
                        name="taxNo"
                        type="text"
                        value={form.taxNo}
                        onChange={handleChange}
                        disabled={true}
                        placeholder="Auto-generated"
                    />

                    <Field
                        type="date"
                        label="Created On"
                        name="createdOn"
                        value={form.createdOn}
                        onChange={handleChange}
                        disabled={true}
                    />

                    <Field
                        label="Tax Description"
                        name="taxDescription"
                        value={form.taxDescription}
                        onChange={handleChange}
                        error={fieldErrors.taxDescription}
                        required
                        placeholder="Enter Tax Description"
                    />

                    <Field
                        type="select"
                        label="Module"
                        name="module"
                        value={form.module}
                        onChange={handleChange}
                        error={fieldErrors.module}
                        required
                        options={MODULE_OPTIONS}
                    />

                    <Field
                        type="date"
                        label="Effective Date"
                        name="effectiveDate"
                        value={form.effectiveDate}
                        onChange={handleChange}
                        error={fieldErrors.effectiveDate}
                        required
                    />

                    <Field
                        type="checkbox"
                        label="Is Active"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Fill Copy Of"
                        name="fillCopyOf"
                        value={form.fillCopyOf}
                        onChange={handleChange}
                        options={FILL_COPY_OPTIONS}
                    />

                    <Field
                        label="Print Name"
                        name="printName"
                        value={form.printName}
                        onChange={handleChange}
                    />
                </div>

                {/* Tax Calculation Setup */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Tax Calculation Setup
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddRow}
                            className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-xs min-w-[1200px]">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="p-1 text-left w-10 text-center dark:text-gray-200">S.no</th>
                                    <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Tax Type</th>
                                    <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Name</th>
                                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Add/Less</th>
                                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Tax (%)</th>
                                    <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Tax ID</th>
                                    <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Formula</th>
                                    <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Post to Finance (Y/N)</th>
                                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Db/Cr</th>
                                    <th className="p-1 text-left min-w-[140px] dark:text-gray-200">GL Account Name</th>
                                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Print (Y/N)</th>
                                    <th className="p-1 text-left min-w-[140px] dark:text-gray-200">Tax Post(GST)</th>
                                    <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxRows.map((row, index) => (
                                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-1 text-center font-medium dark:text-gray-300">
                                            {index + 1}
                                        </td>
                                        <td className="p-1">
                                            <select
                                                value={row.taxType}
                                                onChange={(e) => handleTaxRowChange(index, 'taxType', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                                            >
                                                <option value="">Select</option>
                                                {TAX_TYPE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {fieldErrors[`taxType_${index}`] && (
                                                <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors[`taxType_${index}`]}</p>
                                            )}
                                        </td>
                                        <td className="p-1">
                                            <select
                                                value={row.name}
                                                onChange={(e) => handleTaxRowChange(index, 'name', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                                            >
                                                <option value="">Select</option>
                                                {TAX_TYPE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-1">
                                            <select
                                                value={row.addLess}
                                                onChange={(e) => handleTaxRowChange(index, 'addLess', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                            >
                                                <option value="">Select</option>
                                                {ADD_LESS_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-1">
                                            <input
                                                type="number"
                                                value={row.taxPercentage}
                                                onChange={(e) => handleTaxRowChange(index, 'taxPercentage', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                placeholder="Enter %"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                value={row.taxId}
                                                onChange={(e) => handleTaxRowChange(index, 'taxId', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                                                placeholder="Enter Tax ID"
                                            />
                                        </td>
                                        <td className="p-1">
                                            <input
                                                type="text"
                                                value={row.formula}
                                                onChange={(e) => handleTaxRowChange(index, 'formula', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                                                placeholder="Enter Formula"
                                            />
                                        </td>
                                        <td className="p-1">
                                            <div className="flex items-center justify-center min-w-[120px]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTaxRowChange(index, 'postToFinance', row.postToFinance === 'yes' ? 'no' : 'yes')}
                                                    className={`relative flex items-center w-10 h-5 rounded-full transition-colors ${row.postToFinance === 'yes' ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${row.postToFinance === 'yes' ? "translate-x-5" : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </button>
                                                <span className="ml-2 text-[10px] text-gray-600 dark:text-gray-400 min-w-[30px]">
                                                    {row.postToFinance === 'yes' ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-1">
                                            <select
                                                value={row.dbCr}
                                                onChange={(e) => handleTaxRowChange(index, 'dbCr', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                            >
                                                <option value="">Select</option>
                                                {DB_CR_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-1">
                                            <select
                                                value={row.glAccountName}
                                                onChange={(e) => handleTaxRowChange(index, 'glAccountName', e.target.value)}
                                                className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                                            >
                                                <option value="">Select</option>
                                                {GL_ACCOUNT_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-1">
                                            <div className="flex items-center justify-center min-w-[90px]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTaxRowChange(index, 'printYN', row.printYN === 'yes' ? 'no' : 'yes')}
                                                    className={`relative flex items-center w-10 h-5 rounded-full transition-colors ${row.printYN === 'yes' ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${row.printYN === 'yes' ? "translate-x-5" : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </button>
                                                <span className="ml-2 text-[10px] text-gray-600 dark:text-gray-400 min-w-[30px]">
                                                    {row.printYN === 'yes' ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-1">
                                            <div className="flex items-center justify-center min-w-[120px]">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTaxRowChange(index, 'taxPostGST', row.taxPostGST === 'yes' ? 'no' : 'yes')}
                                                    className={`relative flex items-center w-10 h-5 rounded-full transition-colors ${row.taxPostGST === 'yes' ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${row.taxPostGST === 'yes' ? "translate-x-5" : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </button>
                                                <span className="ml-2 text-[10px] text-gray-600 dark:text-gray-400 min-w-[30px]">
                                                    {row.taxPostGST === 'yes' ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRow(index)}
                                                disabled={taxRows.length <= 1}
                                                className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${taxRows.length <= 1
                                                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                                    : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                                    }`}
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

export default TaxDefinationForm;