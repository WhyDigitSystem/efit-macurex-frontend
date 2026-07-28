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

const DEPARTMENT_OPTIONS = [
    { value: "purchase", label: "Purchase" },
    { value: "sales", label: "Sales" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "HR" },
    { value: "production", label: "Production" },
];

const SUPPLIER_OPTIONS = [
    { value: "sup_001", label: "SUP001 - ABC Suppliers" },
    { value: "sup_002", label: "SUP002 - XYZ Traders" },
    { value: "sup_003", label: "SUP003 - PQR Enterprises" },
    { value: "sup_004", label: "SUP004 - LMN Industries" },
];

const PURCHASE_INDENT_OPTIONS = [
    { value: "pi_001", label: "PI001" },
    { value: "pi_002", label: "PI002" },
    { value: "pi_003", label: "PI003" },
];

const INDENT_DATE_OPTIONS = [
    { value: "2026-07-27", label: "27/07/2026" },
    { value: "2026-07-26", label: "26/07/2026" },
    { value: "2026-07-25", label: "25/07/2026" },
];

const GATE_PASS_OPTIONS = [
    { value: "gp_001", label: "GP001" },
    { value: "gp_002", label: "GP002" },
    { value: "gp_003", label: "GP003" },
];

const SUPPLIER_INV_OPTIONS = [
    { value: "inv_001", label: "INV001" },
    { value: "inv_002", label: "INV002" },
    { value: "inv_003", label: "INV003" },
];

const EXCISABLE_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const DATE_OPTIONS = [
    { value: "2026-07-27", label: "27/07/2026" },
    { value: "2026-07-26", label: "26/07/2026" },
    { value: "2026-07-25", label: "25/07/2026" },
];

const LOCATION_OPTIONS = [
    { value: "loc_001", label: "Location 001" },
    { value: "loc_002", label: "Location 002" },
    { value: "loc_003", label: "Location 003" },
    { value: "loc_004", label: "Location 004" },
];

const CURRENCY_OPTIONS = [
    { value: "inr", label: "INR" },
    { value: "usd", label: "USD" },
    { value: "eur", label: "EUR" },
    { value: "gbp", label: "GBP" },
];

const TAX_CODE_OPTIONS = [
    { value: "tax_001", label: "Tax Code 001" },
    { value: "tax_002", label: "Tax Code 002" },
    { value: "tax_003", label: "Tax Code 003" },
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

const PARTICULARS_OPTIONS = [
    { value: "freight", label: "Freight" },
    { value: "insurance", label: "Insurance" },
    { value: "packing", label: "Packing" },
    { value: "handling", label: "Handling" },
    { value: "other", label: "Other" },
];

const LEDGER_ACCOUNT_OPTIONS = [
    { value: "ledger_001", label: "Ledger Account 001" },
    { value: "ledger_002", label: "Ledger Account 002" },
    { value: "ledger_003", label: "Ledger Account 003" },
];

const YES_NO_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const APPROVED_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const DirectPurchaseForm = ({ data, onBack }) => {
    const [activeTab, setActiveTab] = useState("purchaseDetail");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        billNo: data?.billNo || "",
        auto: data?.auto || false,
        belongsTo: data?.belongsTo || "",
        department: data?.department || "",
        supplierName: data?.supplierName || "",
        purchaseIndentNo: data?.purchaseIndentNo || "",
        indentDate: data?.indentDate || "",
        gatePassNo: data?.gatePassNo || "",
        supplierInvNo: data?.supplierInvNo || "",
        excisable: data?.excisable || "",
        date: data?.date || "",
        location: data?.location || "",
        currency: data?.currency || "inr",
        exchangeRate: data?.exchangeRate || "",
        taxCode: data?.taxCode || "",
        totalAmount: data?.totalAmount || "",
        amountInWords: data?.amountInWords || "",
        paymentTerms: data?.paymentTerms || "",
        deliveryTerms: data?.deliveryTerms || "",
        narration: data?.narration || "",
        approved: data?.approved || "",
        notes: data?.notes || "",
        freight: data?.freight || "",
    });

    // Purchase Detail Rows
    const [purchaseRows, setPurchaseRows] = useState([
        {
            id: 1,
            itemCode: "",
            itemDescription: "",
            unit: "",
            rateDifference: "no",
            qty: "",
            rate: "",
            amount: "",
            discount: "",
            totalAmount: "",
        },
    ]);

    // Charges Summary Rows
    const [chargesRows, setChargesRows] = useState([
        {
            id: 1,
            particulars: "",
            amount: "",
            ledgerAccountName: "",
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

    const handlePurchaseRowChange = (index, field, value) => {
        const updatedRows = [...purchaseRows];
        updatedRows[index][field] = value;

        // Auto-calculate amount = qty * rate
        if (field === "qty" || field === "rate") {
            const qty = parseFloat(updatedRows[index].qty) || 0;
            const rate = parseFloat(updatedRows[index].rate) || 0;
            updatedRows[index].amount = (qty * rate).toFixed(2);

            // Calculate total amount after discount
            const amount = parseFloat(updatedRows[index].amount) || 0;
            const discount = parseFloat(updatedRows[index].discount) || 0;
            updatedRows[index].totalAmount = (amount - discount).toFixed(2);
        }

        if (field === "discount") {
            const amount = parseFloat(updatedRows[index].amount) || 0;
            const discount = parseFloat(updatedRows[index].discount) || 0;
            updatedRows[index].totalAmount = (amount - discount).toFixed(2);
        }

        setPurchaseRows(updatedRows);
    };

    const handleChargesRowChange = (index, field, value) => {
        const updatedRows = [...chargesRows];
        updatedRows[index][field] = value;
        setChargesRows(updatedRows);
    };

    const handleAddPurchaseRow = () => {
        setPurchaseRows([
            ...purchaseRows,
            {
                id: Date.now(),
                itemCode: "",
                itemDescription: "",
                unit: "",
                rateDifference: "no",
                qty: "",
                rate: "",
                amount: "",
                discount: "",
                totalAmount: "",
            },
        ]);
    };

    const handleRemovePurchaseRow = (index) => {
        if (purchaseRows.length > 1) {
            setPurchaseRows(purchaseRows.filter((_, i) => i !== index));
        }
    };

    const handleAddChargesRow = () => {
        setChargesRows([
            ...chargesRows,
            {
                id: Date.now(),
                particulars: "",
                amount: "",
                ledgerAccountName: "",
            },
        ]);
    };

    const handleRemoveChargesRow = (index) => {
        if (chargesRows.length > 1) {
            setChargesRows(chargesRows.filter((_, i) => i !== index));
        }
    };

    const getAvailableItems = (currentIndex) => {
        const selectedItems = purchaseRows
            .filter((_, index) => index !== currentIndex)
            .map((row) => row.itemCode);
        return ITEM_CODE_OPTIONS.filter((item) => !selectedItems.includes(item.value));
    };

    const validate = () => {
        const errors = {};
        if (!form.plantId) errors.plantId = "Plant ID is required";
        if (!form.department) errors.department = "Department is required";
        if (!form.location) errors.location = "Location is required";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Calculate totals
    const totalAmount = purchaseRows.reduce((sum, row) => sum + (parseFloat(row.totalAmount) || 0), 0);
    const totalCharges = chargesRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

    const handleSave = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const payload = {
            ...form,
            purchaseRows,
            chargesRows,
            totalAmount: totalAmount + totalCharges,
        };
        console.log("Saving payload:", payload);

        setTimeout(() => {
            alert(data ? "Direct Purchase Updated Successfully!" : "Direct Purchase Saved Successfully!");
            setIsSubmitting(false);
            onBack();
        }, 1000);
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
                    {data ? "Edit Direct Purchase" : "Add Direct Purchase"}
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
                        label="Bill No"
                        name="billNo"
                        value={form.billNo || "Auto"}
                        onChange={handleChange}
                        disabled={true}
                    />

                    <Field
                        label="Bill Date"
                        name="billDate"
                        type="date"
                        value={form.billDate || ""}
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
                        label="Department"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        error={fieldErrors.department}
                        required
                        options={DEPARTMENT_OPTIONS}
                    />

                    <Field
                        label="Supplier Code"
                        name="supplierCode"
                        value={form.supplierCode}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Supplier Name"
                        name="supplierName"
                        value={form.supplierName}
                        onChange={handleChange}
                        options={SUPPLIER_OPTIONS}
                    />

                    <Field
                        type="select"
                        label="Purchase Indent No."
                        name="purchaseIndentNo"
                        value={form.purchaseIndentNo}
                        onChange={handleChange}
                        options={PURCHASE_INDENT_OPTIONS}
                    />

                    <Field
                        type="date"
                        label="Indent Date"
                        name="indentDate"
                        value={form.indentDate}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Gate Pass No."
                        name="gatePassNo"
                        value={form.gatePassNo}
                        onChange={handleChange}
                        options={GATE_PASS_OPTIONS}
                    />

                    <Field
                        label="Supplier Inv No."
                        name="supplierInvNo"
                        value={form.supplierInvNo}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Excisable ?"
                        name="excisable"
                        value={form.excisable}
                        onChange={handleChange}
                        options={EXCISABLE_OPTIONS}
                    />

                    <Field
                        type="date"
                        label="Date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                    />

                    <Field
                        type="select"
                        label="Location"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        error={fieldErrors.location}
                        required
                        options={LOCATION_OPTIONS}
                    />

                    <Field
                        type="select"
                        label="Currency"
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                        options={CURRENCY_OPTIONS}
                    />

                    <Field
                        label="Exchange Rate"
                        name="exchangeRate"
                        type="number"
                        value={form.exchangeRate}
                        onChange={handleChange}
                        placeholder="Enter Exchange Rate"
                        step="0.01"
                    />

                    <Field
                        type="select"
                        label="Tax Code"
                        name="taxCode"
                        value={form.taxCode}
                        onChange={handleChange}
                        options={TAX_CODE_OPTIONS}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("purchaseDetail")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "purchaseDetail"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Purchase Detail
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("taxDetails")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "taxDetails"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Tax Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("chargesSummary")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "chargesSummary"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Charges Summary
                    </button>
                </div>

                {/* Purchase Detail Tab */}
                {activeTab === "purchaseDetail" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Purchase Detail
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddPurchaseRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[1100px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.no</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Item Code *</th>
                                        <th className="p-1 text-left min-w-[150px] dark:text-gray-200">Item Description</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Unit</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Rate Difference ?</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Qty *</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Rate *</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Amount</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Discount</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Total Amount</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseRows.map((row, index) => (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.itemCode}
                                                    onChange={(e) => handlePurchaseRowChange(index, "itemCode", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="">Select</option>
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
                                                    onChange={(e) => handlePurchaseRowChange(index, "itemDescription", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[140px]`}
                                                    placeholder="Description"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.unit}
                                                    onChange={(e) => handlePurchaseRowChange(index, "unit", e.target.value)}
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
                                                <select
                                                    value={row.rateDifference}
                                                    onChange={(e) => handlePurchaseRowChange(index, "rateDifference", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="yes">Yes</option>
                                                    <option value="no">No</option>
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.qty}
                                                    onChange={(e) => handlePurchaseRowChange(index, "qty", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.rate}
                                                    onChange={(e) => handlePurchaseRowChange(index, "rate", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1 pt-2 dark:text-gray-300 text-right">
                                                {row.amount || "0.00"}
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.discount}
                                                    onChange={(e) => handlePurchaseRowChange(index, "discount", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1 pt-2 dark:text-gray-300 text-right font-medium">
                                                {row.totalAmount || "0.00"}
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePurchaseRow(index)}
                                                    disabled={purchaseRows.length <= 1}
                                                    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${purchaseRows.length <= 1
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

                {/* Tax Details Tab */}
                {activeTab === "taxDetails" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Tax Details
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddChargesRow}
                                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-xs min-w-[600px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.No</th>
                                        <th className="p-1 text-left min-w-[180px] dark:text-gray-200">Particulars</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Amount</th>
                                        <th className="p-1 text-left min-w-[180px] dark:text-gray-200">Ledger Account name</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chargesRows.map((row, index) => (
                                        <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.particulars}
                                                    onChange={(e) => handleChargesRowChange(index, "particulars", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
                                                >
                                                    <option value="">Select an option</option>
                                                    {PARTICULARS_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.amount}
                                                    onChange={(e) => handleChargesRowChange(index, "amount", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.ledgerAccountName}
                                                    onChange={(e) => handleChargesRowChange(index, "ledgerAccountName", e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
                                                >
                                                    <option value="">Select</option>
                                                    {LEDGER_ACCOUNT_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveChargesRow(index)}
                                                    disabled={chargesRows.length <= 1}
                                                    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${chargesRows.length <= 1
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

                {/* Charges Summary Tab */}
                {activeTab === "chargesSummary" && (
                    <div className="mt-2 space-y-3">
                        <div className={fieldGrid}>
                            <Field
                                label="Total Amount"
                                name="totalAmount"
                                value={form.totalAmount}
                                onChange={handleChange}
                            />
                            <Field
                                label="Amt. in Words"
                                name="amountInWords"
                                value={form.amountInWords || "Rupees Only"}
                                onChange={handleChange}
                            />

                            <Field
                                label="Payment Terms"
                                name="paymentTerms"
                                value={form.paymentTerms}
                                onChange={handleChange}
                                placeholder="Enter Payment Terms"
                            />

                            <Field
                                label="Delivery Terms"
                                name="deliveryTerms"
                                value={form.deliveryTerms}
                                onChange={handleChange}
                                placeholder="Enter Delivery Terms"
                            />

                            <Field
                                label="Narration"
                                name="narration"
                                value={form.narration}
                                onChange={handleChange}
                                placeholder="Enter Narration"
                            />

                            <Field
                                type="select"
                                label="Approved"
                                name="approved"
                                value={form.approved}
                                onChange={handleChange}
                                options={APPROVED_OPTIONS}
                            />

                            <Field
                                label="Notes"
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Enter Notes"
                            />

                            <Field
                                label="Freight"
                                name="freight"
                                type="number"
                                value={form.freight}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
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

export default DirectPurchaseForm;