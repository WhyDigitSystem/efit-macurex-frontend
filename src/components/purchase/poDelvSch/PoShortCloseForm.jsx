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

    if (type === "radio") {
        return (
            <div className={`w-full ${className}`}>
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
                <div className="flex items-center gap-4">
                    {options.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name={name}
                                value={opt.value}
                                checked={value === opt.value}
                                onChange={onChange}
                                className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
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
                className={`${controlClasses} ${error ? "border-red-500" : ""}`}
                placeholder={placeholder}
                disabled={disabled}
            />
            {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
        </div>
    );
};

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

// Dummy data for dropdowns
const PLANT_OPTIONS = [
    { value: "plant_001", label: "Plant 001" },
    { value: "plant_002", label: "Plant 002" },
    { value: "plant_003", label: "Plant 003" },
];

const BELONGS_TO_OPTIONS = [
    { value: "company", label: "Company" },
    { value: "individual", label: "Individual" },
    { value: "other", label: "Other" },
];

const TYPE_OPTIONS = [
    { value: "po", label: "PO" },
    { value: "delivery_schedule", label: "Delivery Schedule" },
];

const SUPPLIER_CODE_OPTIONS = [
    { value: "sup_001", label: "SUP001 - ABC Suppliers" },
    { value: "sup_002", label: "SUP002 - XYZ Traders" },
    { value: "sup_003", label: "SUP003 - PQR Enterprises" },
];

const PO_OPTIONS = [
    { value: "po_001", label: "PO001" },
    { value: "po_002", label: "PO002" },
    { value: "po_003", label: "PO003" },
];

const ITEM_CODE_OPTIONS = [
    { value: "item_001", label: "ITEM001" },
    { value: "item_002", label: "ITEM002" },
    { value: "item_003", label: "ITEM003" },
    { value: "item_004", label: "ITEM004" },
];

const UNIT_OPTIONS = [
    { value: "nos", label: "Nos" },
    { value: "kg", label: "KG" },
    { value: "gms", label: "GMS" },
    { value: "ltr", label: "LTR" },
    { value: "mtr", label: "MTR" },
];

const ORDER_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "closed", label: "Closed" },
    { value: "partial", label: "Partial" },
];

const PoShortCloseForm = ({ data, onBack }) => {
    const [activeTab, setActiveTab] = useState("orderClosedDetail");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        belongsTo: data?.belongsTo || "",
        type: data?.type || "",
        supplierCode: data?.supplierCode || "",
        poNo: data?.poNo || "",
        shortCloseNo: data?.shortCloseNo || "",
        shortCloseDate: data?.shortCloseDate || new Date().toISOString().split('T')[0],
        supplierName: data?.supplierName || "",
        orderStatus: data?.orderStatus || "",
        reference: data?.reference || "",
    });

    // Order Closed Detail Rows
    const [orderRows, setOrderRows] = useState([
        {
            id: 1,
            itemCode: "",
            itemDescription: "",
            unit: "",
            orderedQty: "",
            suppliedQty: "",
            pendingQty: "",
            newRequiredQty: "",
            shortCloseQty: "",
        },
    ]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleOrderRowChange = (index, field, value) => {
        const updatedRows = [...orderRows];
        updatedRows[index][field] = value;

        // Auto-calculate pending qty = ordered - supplied
        if (field === "orderedQty" || field === "suppliedQty") {
            const ordered = parseFloat(updatedRows[index].orderedQty) || 0;
            const supplied = parseFloat(updatedRows[index].suppliedQty) || 0;
            updatedRows[index].pendingQty = (ordered - supplied).toFixed(3);
        }

        setOrderRows(updatedRows);
    };

    const handleAddOrderRow = () => {
        setOrderRows([
            ...orderRows,
            {
                id: Date.now(),
                itemCode: "",
                itemDescription: "",
                unit: "",
                orderedQty: "",
                suppliedQty: "",
                pendingQty: "",
                newRequiredQty: "",
                shortCloseQty: "",
            },
        ]);
    };

    const handleRemoveOrderRow = (index) => {
        if (orderRows.length > 1) {
            setOrderRows(orderRows.filter((_, i) => i !== index));
        }
    };

    const validate = () => {
        const errors = {};
        if (!form.plantId) errors.plantId = "Plant ID is required";
        if (!form.type) errors.type = "Type is required";
        if (!form.supplierCode) errors.supplierCode = "Supplier Code is required";
        if (!form.poNo) errors.poNo = "PO/ Del.Sch.No is required";
        if (!form.shortCloseDate) errors.shortCloseDate = "Short Close Date is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const payload = {
            ...form,
            orderRows,
        };
        console.log("Saving payload:", payload);

        setTimeout(() => {
            alert(data ? "PO Short Close Updated Successfully!" : "PO Short Close Saved Successfully!");
            setIsSubmitting(false);
            onBack();
        }, 1000);
    };

    const getAvailableItems = (currentIndex) => {
        const selectedItems = orderRows
            .filter((_, index) => index !== currentIndex)
            .map((row) => row.itemCode);
        return ITEM_CODE_OPTIONS.filter((item) => !selectedItems.includes(item.value));
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
                    {data ? "Edit PO/Delv.Sch. Shortclose" : "Add PO/Delv.Sch. Shortclose"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        type="select"
                        label="Plant ID"
                        name="plantId"
                        value={form.plantId}
                        onChange={handleChange}
                        error={fieldErrors.plantId}
                        required
                        options={PLANT_OPTIONS}
                    />
                    <Field
                        label="Short Close No."
                        name="shortCloseNo"
                        value={form.shortCloseNo}
                        onChange={handleChange}
                        placeholder="Auto"
                        disabled={true}
                    />
                    
                    <Field
                        label="Short Close Date"
                        name="shortCloseDate"
                        type="date"
                        value={form.shortClosedate}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Belongs To"
                        name="belongsTo"
                        value={form.belongsTo}
                        onChange={handleChange}
                        options={BELONGS_TO_OPTIONS}
                    />

                    <Field
                        type="select"
                        label="Type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        error={fieldErrors.type}
                        required
                        options={TYPE_OPTIONS}
                    />

                    <Field
                        type="select"
                        label="Supplier Code"
                        name="supplierCode"
                        value={form.supplierCode}
                        onChange={handleChange}
                        error={fieldErrors.supplierCode}
                        required
                        options={SUPPLIER_CODE_OPTIONS}
                    />

                    <Field
                        label="Supplier Name"
                        name="supplierName"
                        value={form.supplierName}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="PO/Del.Sch.No"
                        name="poNo"
                        value={form.poNo}
                        onChange={handleChange}
                        error={fieldErrors.poNo}
                        required
                        options={PO_OPTIONS}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("orderClosedDetail")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "orderClosedDetail"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Order Closed Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("summary")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "summary"
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Summary
                    </button>
                </div>

                {/* Order Closed Detail Tab */}
                {activeTab === "orderClosedDetail" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Order Closed Detail
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddOrderRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[800px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.no</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Item Code *</th>
                                        <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Item Description</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Unit</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Ordered Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Supplied Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Pending Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">New Required Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Short Close Qty</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderRows.map((row, index) => (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.itemCode}
                                                    onChange={(e) => handleOrderRowChange(index, "itemCode", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="">Select an option</option>
                                                    {getAvailableItems(index).map((item) => (
                                                        <option key={item.value} value={item.value}>
                                                            {item.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={row.itemDescription}
                                                    onChange={(e) => handleOrderRowChange(index, "itemDescription", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[140px]`}
                                                    placeholder="Description"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.unit}
                                                    onChange={(e) => handleOrderRowChange(index, "unit", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                >
                                                    <option value="">Select</option>
                                                    {UNIT_OPTIONS.map((unit) => (
                                                        <option key={unit.value} value={unit.value}>
                                                            {unit.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.orderedQty}
                                                    onChange={(e) => handleOrderRowChange(index, "orderedQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.suppliedQty}
                                                    onChange={(e) => handleOrderRowChange(index, "suppliedQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.pendingQty}
                                                    onChange={(e) => handleOrderRowChange(index, "pendingQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.newRequiredQty}
                                                    onChange={(e) => handleOrderRowChange(index, "newRequiredQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.shortCloseQty}
                                                    onChange={(e) => handleOrderRowChange(index, "shortCloseQty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOrderRow(index)}
                                                    disabled={orderRows.length <= 1}
                                                    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${orderRows.length <= 1
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
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && (
                    <div className="mt-2 space-y-4">
                        {/* Reference for Short Close */}
                        <div className={fieldGrid}>
                            <Field
                                label="Reference for Short Close"
                                name="reference"
                                value={form.reference}
                                onChange={handleChange}
                                placeholder="Enter Reference"
                                className="col-span-2"
                            />
                        </div>
                    </div>
                )}

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

export default PoShortCloseForm;