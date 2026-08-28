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
const BELONGS_TO_OPTIONS = [
    { value: "company", label: "Company" },
    { value: "individual", label: "Individual" },
    { value: "other", label: "Other" },
];

const DEALER_TYPE_OPTIONS = [
    { value: "retailer", label: "Retailer" },
    { value: "wholesaler", label: "Wholesaler" },
    { value: "distributor", label: "Distributor" },
    { value: "manufacturer", label: "Manufacturer" },
];

const TAX_CODE_OPTIONS = [
    { value: "tax_001", label: "Tax Code 001" },
    { value: "tax_002", label: "Tax Code 002" },
    { value: "tax_003", label: "Tax Code 003" },
];

const POSTING_CATEGORY_OPTIONS = [
    { value: "purchase", label: "Purchase" },
    { value: "sales", label: "Sales" },
    { value: "journal", label: "Journal" },
];

const ECC_TYPE_OPTIONS = [
    { value: "ecc_001", label: "ECC Type 001" },
    { value: "ecc_002", label: "ECC Type 002" },
    { value: "ecc_003", label: "ECC Type 003" },
];

const CURRENCY_OPTIONS = [
    { value: "usd", label: "USD" },
    { value: "eur", label: "EUR" },
    { value: "inr", label: "INR" },
    { value: "gbp", label: "GBP" },
];

const TAX_TYPE_OPTIONS = [
    { value: "cgst", label: "CGST" },
    { value: "sgst", label: "SGST" },
    { value: "igst", label: "IGST" },
    { value: "cess", label: "CESS" },
];

const HSN_SAC_OPTIONS = [
    { value: "hsn_01", label: "HSN 01" },
    { value: "hsn_02", label: "HSN 02" },
    { value: "hsn_03", label: "HSN 03" },
    { value: "hsn_04", label: "HSN 04" },
];

const TARIFF_OPTIONS = [
    { value: "tariff_001", label: "Tariff 001" },
    { value: "tariff_002", label: "Tariff 002" },
    { value: "tariff_003", label: "Tariff 003" },
];

const UNIT_OPTIONS = [
    { value: "nos", label: "Nos" },
    { value: "kg", label: "KG" },
    { value: "gms", label: "GMS" },
    { value: "ltr", label: "LTR" },
    { value: "mtr", label: "MTR" },
];

const LEDGER_ACCOUNT_OPTIONS = [
    { value: "ledger_001", label: "Ledger Account 001" },
    { value: "ledger_002", label: "Ledger Account 002" },
    { value: "ledger_003", label: "Ledger Account 003" },
];

const DB_CR_OPTIONS = [
    { value: "dr", label: "Dr" },
    { value: "cr", label: "Cr" },
];

const YES_NO_OPTIONS = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
];

const PurchaseReturnForm = ({ data, onBack }) => {
    const [activeTab, setActiveTab] = useState("purchaseDetail");
    const [form, setForm] = useState({
        plantId: data?.plantId || "",
        prNo: data?.prNo || "",
        auto: data?.auto || false,
        belongsTo: data?.belongsTo || "",
        prDate: data?.prDate || new Date().toISOString().split('T')[0],
        supplierName: data?.supplierName || "",
        supplierId: data?.supplierId || "",
        gstState: data?.gstState || "",
        grnNo: data?.grnNo || "",
        grnDate: data?.grnDate || "",
        isIGSTAppl: data?.isIGSTAppl || "no",
        excisable: data?.excisable || false,
        currency: data?.currency || "",
        gstnNo: data?.gstnNo || "",
        vendorDCNo: data?.vendorDCNo || "",
        exchangeRate: data?.exchangeRate || "",
        dealerType: data?.dealerType || "",
        taxCode: data?.taxCode || "",
        poNo: data?.poNo || "",
        isReverseChrg: data?.isReverseChrg || false,
        voucherPostingDate: data?.voucherPostingDate || "",
        dutyPerUnit: data?.dutyPerUnit || "",
        poType: data?.poType || "",
        postingCategory: data?.postingCategory || "",
        modvatCopyReceived: data?.modvatCopyReceived || "",
        eccType: data?.eccType || "",
        supplierDCINVNo: data?.supplierDCINVNo || "",
        supplierDCINVDate: data?.supplierDCINVDate || "",
        entryTaxApplicable: data?.entryTaxApplicable || "",
        narration: data?.narration || "",
        paymentTerms: data?.paymentTerms || "",
    });

    // Purchase Return Detail Rows
    const [purchaseRows, setPurchaseRows] = useState([
        {
            id: 1,
            itemCode: "",
            itemDescription: "",
            hsnSacCode: "",
            taxType: "",
            taxPercentage: "",
            tariffNo: "",
            exciseToPost: "",
            challanQty: "",
            unit: "",
            grnReceivedQty: "",
            acceptedQty: "",
            rejectedQty: "",
            shortageQty: "",
            poRate: "",
            rateInINR: "",
            rateInSelectedCurrency: "",
            apportionedCost: "",
            landedCostRate: "",
            amount: "",
            amountInSelectedCurrency: "",
            additionalDuty: "",
            amountInINR: "",
            sgs: "",
            sgstRate: "",
            sgstAmount: "",
            cgstRate: "",
            cgstAmount: "",
            igstRate: "",
            igstAmount: "",
        },
    ]);

    // Charges Summary Rows
    const [chargesRows, setChargesRows] = useState([
        {
            id: 1,
            particulars: "",
            taxPercentage: "",
            acceptedQty: "",
            amount: "",
            revisedAmount: "",
            ledgerAccountName: "",
            dbcr: "",
            dbamt: "",
            cramt: "",
            postToFinance: "",
        },
    ]);

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

    const handlePurchaseRowChange = (index, field, value) => {
        const updatedRows = [...purchaseRows];
        updatedRows[index][field] = value;
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
                id: purchaseRows.length + 1,
                itemCode: "",
                itemDescription: "",
                hsnSacCode: "",
                taxType: "",
                taxPercentage: "",
                tariffNo: "",
                exciseToPost: "",
                challanQty: "",
                unit: "",
                grnReceivedQty: "",
                acceptedQty: "",
                rejectedQty: "",
                shortageQty: "",
                poRate: "",
                rateInINR: "",
                rateInSelectedCurrency: "",
                apportionedCost: "",
                landedCostRate: "",
                amount: "",
                amountInSelectedCurrency: "",
                additionalDuty: "",
                amountInINR: "",
                sgs: "",
                sgstRate: "",
                sgstAmount: "",
                cgstRate: "",
                cgstAmount: "",
                igstRate: "",
                igstAmount: "",
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
                id: chargesRows.length + 1,
                particulars: "",
                taxPercentage: "",
                acceptedQty: "",
                amount: "",
                revisedAmount: "",
                ledgerAccountName: "",
                dbcr: "",
                dbamt: "",
                cramt: "",
                postToFinance: "",
            },
        ]);
    };

    const handleRemoveChargesRow = (index) => {
        if (chargesRows.length > 1) {
            setChargesRows(chargesRows.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const payload = {
            ...form,
            purchaseRows,
            chargesRows,
        };
        console.log("Saving payload:", payload);
        setTimeout(() => {
            alert("Purchase Return Saved Successfully!");
            setIsSubmitting(false);
            onBack();
        }, 1000);
    };

    // Calculate totals
    const totalFreight = purchaseRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    const totalQty = purchaseRows.reduce((sum, row) => sum + (parseFloat(row.acceptedQty) || 0), 0);
    const basicValue = totalFreight;
    const totalAmount = totalFreight;

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
                    {data ? "Edit Purchase Return" : "Add Purchase Return"}
                </h2>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

                {/* Form Fields */}
                <div className={fieldGrid}>
                    <Field
                        label="Plant ID"
                        name="plantId"
                        value={form.plantId}
                        onChange={handleChange}
                        required
                        placeholder="Enter Plant ID"
                    />
                    <Field
                        label="PR No"
                        name="prNo"
                        value={form.prNo}
                        onChange={handleChange}
                        placeholder="Auto"
                        disabled={true}
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
                        type="date"
                        label="PR Date"
                        name="prDate"
                        value={form.prDate}
                        onChange={handleChange}
                    />
                    <Field
                        label="Supplier Name"
                        name="supplierName"
                        value={form.supplierName}
                        onChange={handleChange}
                        required
                        placeholder="Enter Supplier Name"
                    />
                    <Field
                        label="Supplier ID"
                        name="supplierId"
                        value={form.supplierId}
                        onChange={handleChange}
                        placeholder="Enter Supplier ID"
                    />
                    <Field
                        label="GST State"
                        name="gstState"
                        value={form.gstState}
                        onChange={handleChange}
                        placeholder="Enter GST State"
                    />
                    <Field
                        label="GRN No"
                        name="grnNo"
                        value={form.grnNo}
                        onChange={handleChange}
                        placeholder="Enter GRN No"
                    />
                    <Field
                        type="date"
                        label="GRN Date"
                        name="grnDate"
                        value={form.grnDate}
                        onChange={handleChange}
                    />
                    <Field
                        type="select"
                        label="Is IGST Appl"
                        name="isIGSTAppl"
                        value={form.isIGSTAppl}
                        onChange={handleChange}
                        options={YES_NO_OPTIONS}
                    />
                    <Field
                        type="checkbox"
                        label="Excisable ?"
                        name="excisable"
                        checked={form.excisable}
                        onChange={handleChange}
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
                        label="GSTN No"
                        name="gstnNo"
                        value={form.gstnNo}
                        onChange={handleChange}
                        placeholder="Enter GSTN No"
                    />
                    <Field
                        label="Vendor DC NO."
                        name="vendorDCNo"
                        value={form.vendorDCNo}
                        onChange={handleChange}
                        placeholder="Enter Vendor DC No"
                    />
                    <Field
                        label="Exchange Rate"
                        name="exchangeRate"
                        type="number"
                        value={form.exchangeRate}
                        onChange={handleChange}
                        placeholder="Enter Exchange Rate"
                    />
                    <Field
                        type="select"
                        label="Dealer Type"
                        name="dealerType"
                        value={form.dealerType}
                        onChange={handleChange}
                        options={DEALER_TYPE_OPTIONS}
                    />
                    <Field
                        type="select"
                        label="Tax Code"
                        name="taxCode"
                        value={form.taxCode}
                        onChange={handleChange}
                        options={TAX_CODE_OPTIONS}
                    />
                    <Field
                        label="PO No/PC No"
                        name="poNo"
                        value={form.poNo}
                        onChange={handleChange}
                        placeholder="Enter PO No"
                    />
                    <Field
                        type="checkbox"
                        label="Is Reverse Chrg"
                        name="isReverseChrg"
                        checked={form.isReverseChrg}
                        onChange={handleChange}
                    />
                    <Field
                        type="date"
                        label="Voucher Posting Date"
                        name="voucherPostingDate"
                        value={form.voucherPostingDate}
                        onChange={handleChange}
                    />
                    <Field
                        type="date"
                        label="Date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                    />
                    <Field
                        label="Duty Per Unit"
                        name="dutyPerUnit"
                        type="number"
                        value={form.dutyPerUnit}
                        onChange={handleChange}
                        placeholder="Enter Duty Per Unit"
                    />
                    <Field
                        label="PO Type"
                        name="poType"
                        value={form.poType}
                        onChange={handleChange}
                        placeholder="Enter PO Type"
                    />
                    <Field
                        type="select"
                        label="Posting Category"
                        name="postingCategory"
                        value={form.postingCategory}
                        onChange={handleChange}
                        options={POSTING_CATEGORY_OPTIONS}
                    />
                    <Field
                        type="select"
                        label="Modvat Copy Received"
                        name="modvatCopyReceived"
                        value={form.modvatCopyReceived}
                        onChange={handleChange}
                        options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                            { value: "partial", label: "Partial" },
                        ]}
                    />
                    <Field
                        type="select"
                        label="Ecc Type"
                        name="eccType"
                        value={form.eccType}
                        onChange={handleChange}
                        options={ECC_TYPE_OPTIONS}
                    />
                    <Field
                        label="Supplier DC/INV No."
                        name="supplierDCINVNo"
                        value={form.supplierDCINVNo}
                        onChange={handleChange}
                        placeholder="Enter Supplier DC/INV No"
                    />
                    <Field
                        type="date"
                        label="Supplier DC/INV Date"
                        name="supplierDCINVDate"
                        value={form.supplierDCINVDate}
                        onChange={handleChange}
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
                        onClick={() => setActiveTab("taxGrid")}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${activeTab === "taxGrid"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        Tax Grid
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
                                Purchase Return Details
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
                            <table className="w-full text-xs min-w-[1800px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.no</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Item Code *</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Item Description</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">HSN/SAC Code *</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Tax Type *</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Tax (%)</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Tariff No *</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Excise To Post</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Challan Qty</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Unit</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">GRN Received Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Accepted Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Rejected Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Shortage Qty</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">PO Rate</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Rate In INR *</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Rate In Selected Currency</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Apportioned Cost</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Landed Cost Rate</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Amount *</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Amount In Selected Currency</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Additional Duty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Amount In INR</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">SGST Rate</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">SGST Amount</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">CGST Rate</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">CGST Amount</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">IGST Rate</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">IGST Amount</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseRows.map((row, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={row.itemCode}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'itemCode', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="Item Code"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={row.itemDescription}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'itemDescription', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                    placeholder="Item Description"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.hsnSacCode}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'hsnSacCode', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                >
                                                    <option value="">Select</option>
                                                    {HSN_SAC_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.taxType}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'taxType', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
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
                                                <input
                                                    type="number"
                                                    value={row.taxPercentage}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'taxPercentage', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.tariffNo}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'tariffNo', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                >
                                                    <option value="">Select</option>
                                                    {TARIFF_OPTIONS.map((opt) => (
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
                                                        onClick={() => handlePurchaseRowChange(index, 'exciseToPost', row.exciseToPost === 'yes' ? 'no' : 'yes')}
                                                        className={`relative flex items-center w-10 h-5 rounded-full transition-colors ${row.exciseToPost === 'yes' ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${row.exciseToPost === 'yes' ? "translate-x-5" : "translate-x-0.5"
                                                                }`}
                                                        />
                                                    </button>
                                                    <span className="ml-2 text-[10px] text-gray-600 dark:text-gray-400 min-w-[30px]">
                                                        {row.exciseToPost === 'yes' ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.challanQty}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'challanQty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.unit}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'unit', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                >
                                                    <option value="">Unit</option>
                                                    {UNIT_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.grnReceivedQty}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'grnReceivedQty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.acceptedQty}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'acceptedQty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.rejectedQty}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'rejectedQty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.shortageQty}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'shortageQty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.poRate}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'poRate', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00000"
                                                    step="0.00001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.rateInINR}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'rateInINR', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00000"
                                                    step="0.00001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.rateInSelectedCurrency}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'rateInSelectedCurrency', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                    placeholder="0.00000"
                                                    step="0.00001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.apportionedCost}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'apportionedCost', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.landedCostRate}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'landedCostRate', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.000"
                                                    step="0.001"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.amount}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'amount', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.amountInSelectedCurrency}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'amountInSelectedCurrency', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.additionalDuty}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'additionalDuty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.amountInINR}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'amountInINR', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.sgstRate}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'sgstRate', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.sgstAmount}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'sgstAmount', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.cgstRate}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'cgstRate', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.cgstAmount}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'cgstAmount', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.igstRate}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'igstRate', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.igstAmount}
                                                    onChange={(e) => handlePurchaseRowChange(index, 'igstAmount', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
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

                {/* Tax Grid Tab */}
                {activeTab === "taxGrid" && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Tax Grid
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
                            <table className="w-full text-xs min-w-[800px]">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">S.No</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Particulars</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">Tax%</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Accepted Qty</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Amount</th>
                                        <th className="p-1 text-left min-w-[100px] dark:text-gray-200">Revised Amount</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Ledger Account Name</th>
                                        <th className="p-1 text-left min-w-[60px] dark:text-gray-200">dbcr</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">dbamt</th>
                                        <th className="p-1 text-left min-w-[80px] dark:text-gray-200">cramt</th>
                                        <th className="p-1 text-left min-w-[120px] dark:text-gray-200">Post To Finance A/c</th>
                                        <th className="p-1 text-center w-10 dark:text-gray-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chargesRows.map((row, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-1 text-center font-medium dark:text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.particulars}
                                                    onChange={(e) => handleChargesRowChange(index, 'particulars', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="freight">Freight</option>
                                                    <option value="insurance">Insurance</option>
                                                    <option value="packing">Packing</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.taxPercentage}
                                                    onChange={(e) => handleChargesRowChange(index, 'taxPercentage', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.acceptedQty}
                                                    onChange={(e) => handleChargesRowChange(index, 'acceptedQty', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.amount}
                                                    onChange={(e) => handleChargesRowChange(index, 'amount', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.revisedAmount}
                                                    onChange={(e) => handleChargesRowChange(index, 'revisedAmount', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.ledgerAccountName}
                                                    onChange={(e) => handleChargesRowChange(index, 'ledgerAccountName', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="">Select</option>
                                                    {LEDGER_ACCOUNT_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.dbcr}
                                                    onChange={(e) => handleChargesRowChange(index, 'dbcr', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[60px]`}
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
                                                <input
                                                    type="number"
                                                    value={row.dbamt}
                                                    onChange={(e) => handleChargesRowChange(index, 'dbamt', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input
                                                    type="number"
                                                    value={row.cramt}
                                                    onChange={(e) => handleChargesRowChange(index, 'cramt', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <select
                                                    value={row.postToFinance}
                                                    onChange={(e) => handleChargesRowChange(index, 'postToFinance', e.target.value)}
                                                    className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                                                >
                                                    <option value="">Select</option>
                                                    {YES_NO_OPTIONS.map((opt) => (
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

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Field
                                label="Total Freight"
                                name="totalFreight"
                                value={totalFreight}
                                onChange={() => {}}
                            />
                            <Field
                                label="Total—Qty"
                                name="totalQty"
                                value={totalQty}
                                onChange={() => {}}
                            />
                            <Field
                                label="Basic Value"
                                name="basicValue"
                                value={basicValue}
                                onChange={() => {}}
                            />
                            <Field
                                label="Total Amount"
                                name="totalAmount"
                                value={totalAmount}
                                onChange={() => {}}
                            />
                            <Field
                                label="Amount in Words"
                                name="amountInWords"
                                value="Rupees Only"
                                onChange={() => {}}
                                disabled={true}
                                className="col-span-2"
                            />
                            <Field
                                type="select"
                                label="Entry Tax Applicable *"
                                name="entryTaxApplicable"
                                value={form.entryTaxApplicable}
                                onChange={handleChange}
                                options={YES_NO_OPTIONS}
                                required
                            />
                        </div>

                        <div className={fieldGrid}>
                            <Field
                                label="Narration"
                                name="narration"
                                value={form.narration}
                                onChange={handleChange}
                                placeholder="Enter Narration"
                                className="col-span-2"
                            />
                            <Field
                                label="Payment Terms"
                                name="paymentTerms"
                                value={form.paymentTerms}
                                onChange={handleChange}
                                placeholder="Enter Payment Terms"
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
                        {isSubmitting ? "Saving..." : data ? "Update" : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseReturnForm;
