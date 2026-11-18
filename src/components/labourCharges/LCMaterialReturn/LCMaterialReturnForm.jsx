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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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
  step,
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
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
        value={value}
        onChange={onChange}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
      />
      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

// Dummy data for dropdowns
const PLANT_OPTIONS = [
  { value: "plant_001", label: "Plant 001" },
  { value: "plant_002", label: "Plant 002" },
  { value: "plant_003", label: "Plant 003" },
];

const BELONGS_TO_OPTIONS = [
  { value: "appliances", label: "APPLIANCES" },
  { value: "bosch", label: "BOSCH" },
];

// Customer master - name fills automatically on selection
const CUSTOMER_OPTIONS = [
  { value: "cust_001", label: "CUST001", name: "ABC Appliances" },
  { value: "cust_002", label: "CUST002", name: "Bosch Ltd" },
  { value: "cust_003", label: "CUST003", name: "XYZ Industries" },
];

const LOCATION_OPTIONS = [
  { value: "loc_001", label: "Location 001" },
  { value: "loc_002", label: "Location 002" },
  { value: "loc_003", label: "Location 003" },
];

const INVOICE_TYPE_OPTIONS = [
  { value: "tax_invoice", label: "Tax Invoice" },
  { value: "retail_invoice", label: "Retail Invoice" },
  { value: "export_invoice", label: "Export Invoice" },
];

// Invoice master - invoice date fills automatically on selection
const INVOICE_OPTIONS = [
  { value: "inv_001", label: "LCINV001", date: "2026-11-01" },
  { value: "inv_002", label: "LCINV002", date: "2026-11-05" },
  { value: "inv_003", label: "LCINV003", date: "2026-11-10" },
];

const RETURN_TYPE_OPTIONS = [
  { value: "rejection", label: "Rejection" },
  { value: "excess_supply", label: "Excess Supply" },
  { value: "wrong_item", label: "Wrong Item" },
];

const TAX_CODE_OPTIONS = [
  { value: "tax_001", label: "Tax Code 001" },
  { value: "tax_002", label: "Tax Code 002" },
  { value: "tax_003", label: "Tax Code 003" },
];

const CURRENCY_OPTIONS = [
  { value: "inr", label: "INR" },
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
];

const ITEM_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Housing Cover - Coated",
    unit: "nos",
    qtySold: "500",
    rate: "118.00",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Bracket Assembly - Plated",
    unit: "nos",
    qtySold: "1200",
    rate: "59.00",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Base Plate - Treated",
    unit: "nos",
    qtySold: "300",
    rate: "70.80",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Steel Sheet 1.2mm",
    unit: "kg",
    qtySold: "800",
    rate: "85.00",
  },
];

// Tax type carries its percentage, used for Amount With ED
const TAX_TYPE_OPTIONS = [
  { value: "ed", label: "Excise Duty", percent: 12.5 },
  { value: "gst", label: "GST", percent: 18 },
  { value: "exempt", label: "Exempt", percent: 0 },
];

const PARTICULARS_OPTIONS = [
  { value: "freight", label: "Freight" },
  { value: "insurance", label: "Insurance" },
  { value: "packing", label: "Packing" },
  { value: "handling", label: "Handling" },
  { value: "other", label: "Other" },
];

const UNIT_LABELS = {
  nos: "NOS",
  kg: "KG",
  gms: "GMS",
  ltr: "LTR",
  mtr: "MTR",
};

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  itemCode: "",
  itemDescription: "",
  unit: "",
  qtySold: "",
  recdQty: "",
  rate: "",
  taxType: "",
});

const emptyTaxRow = () => ({
  id: Date.now() + Math.random(),
  particulars: "",
  amount: "",
});

// Derived row values. Exchange rate = INR per 1 unit of the selected currency.
const calcRow = (row, exchangeRate) => {
  const qty = parseFloat(row.recdQty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const rateSelected = exchangeRate > 0 ? rate / exchangeRate : 0;
  const amount = qty * rate;
  const pct =
    TAX_TYPE_OPTIONS.find((t) => t.value === row.taxType)?.percent || 0;
  return {
    rateInSelectedCurrency: rateSelected.toFixed(2),
    amountInSelectedCurrency: (qty * rateSelected).toFixed(2),
    amount: amount.toFixed(2),
    amountWithEd: (amount + (amount * pct) / 100).toFixed(2),
  };
};

// Amount in words (Indian numbering)
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const twoDigits = (n) =>
  n < 20
    ? ONES[n]
    : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");

const threeDigits = (n) =>
  (n >= 100
    ? ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " : "")
    : "") + (n % 100 ? twoDigits(n % 100) : "");

const integerToWords = (n) => {
  if (n === 0) return "Zero";
  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(integerToWords(crore) + " Crore");
  if (lakh) parts.push(twoDigits(lakh) + " Lakh");
  if (thousand) parts.push(twoDigits(thousand) + " Thousand");
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" ");
};

const amountToWords = (amount) => {
  const total = Math.round((parseFloat(amount) || 0) * 100);
  const rupees = Math.floor(total / 100);
  const paise = total % 100;
  let words = "Rupees " + integerToWords(rupees);
  if (paise) words += " and " + twoDigits(paise) + " Paise";
  return words + " Only";
};

const TABS = [
  { key: "salesReturn", label: "1-SalesReturn" },
  { key: "taxDetails", label: "2-Tax Details" },
  { key: "summary", label: "3-Sales Return Summary" },
];

const LCMaterialReturnForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("salesReturn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    docNo: data?.docNo || "",
    belongsTo: data?.belongsTo || "",
    date: data?.date || "",
    customerId: data?.customerId || "",
    customerName: data?.customerName || "",
    locationId: data?.locationId || "",
    refNo: data?.refNo || "",
    refDate: data?.refDate || "",
    invoiceType: data?.invoiceType || "",
    invoiceNo: data?.invoiceNo || "",
    invoiceDate: data?.invoiceDate || "",
    returnType: data?.returnType || "",
    taxCode: data?.taxCode || "",
    currency: data?.currency || "inr",
    exchangeRate: data?.exchangeRate || "1",
    narration: data?.narration || "",
  });

  const [rows, setRows] = useState([emptyRow()]);
  const [taxRows, setTaxRows] = useState([emptyTaxRow()]);

  const isInr = form.currency === "inr";
  const exchangeRate = isInr ? 1 : parseFloat(form.exchangeRate) || 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Customer selection fills name
      if (name === "customerId") {
        const cust = CUSTOMER_OPTIONS.find((c) => c.value === value);
        next.customerName = cust?.name || "";
      }

      // Invoice selection fills invoice date
      if (name === "invoiceNo") {
        const inv = INVOICE_OPTIONS.find((i) => i.value === value);
        next.invoiceDate = inv?.date || "";
      }

      // INR is always 1:1
      if (name === "currency" && value === "inr") {
        next.exchangeRate = "1";
      }

      return next;
    });
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    let row = { ...updatedRows[index], [field]: value };

    // Item selection fills description, unit, qty sold and rate
    if (field === "itemCode") {
      const item = ITEM_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        itemDescription: item?.description || "",
        unit: item?.unit || "",
        qtySold: item?.qtySold || "",
        rate: item?.rate || "",
      };
    }

    updatedRows[index] = row;
    setRows(updatedRows);
  };

  const handleAddRow = () => setRows([...rows, emptyRow()]);
  const handleRemoveRow = (index) => {
    if (rows.length > 1) setRows(rows.filter((_, i) => i !== index));
  };

  const getAvailableItems = (currentIndex) => {
    const selectedItems = rows
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.itemCode);
    return ITEM_OPTIONS.filter((item) => !selectedItems.includes(item.value));
  };

  const handleTaxRowChange = (index, field, value) => {
    const updatedRows = [...taxRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setTaxRows(updatedRows);
  };

  const handleAddTaxRow = () => setTaxRows([...taxRows, emptyTaxRow()]);
  const handleRemoveTaxRow = (index) => {
    if (taxRows.length > 1) setTaxRows(taxRows.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!form.plantId) errors.plantId = "Plant ID is required";
    if (!form.customerId) errors.customerId = "Customer ID is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Derived values for display and totals
  const derivedRows = rows.map((row) => calcRow(row, exchangeRate));
  const itemsTotal = derivedRows.reduce(
    (s, d) => s + (parseFloat(d.amountWithEd) || 0),
    0,
  );
  const otherTaxTotal = taxRows.reduce(
    (s, r) => s + (parseFloat(r.amount) || 0),
    0,
  );
  const netAmount = itemsTotal + otherTaxTotal;

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      rows: rows.map((row, i) => ({ ...row, ...derivedRows[i] })),
      taxRows,
      netAmount: netAmount.toFixed(2),
      inWords: amountToWords(netAmount),
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "LC Material Return Updated Successfully!"
          : "LC Material Return Saved Successfully!",
      );
      setIsSubmitting(false);
      onBack();
    }, 1000);
  };

  const tabButtonClass = (key) =>
    `px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
      activeTab === key
        ? "bg-blue-600 text-white"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const removeBtnClass = (disabled) =>
    `h-5 w-5 rounded text-white flex items-center justify-center transition-colors ${
      disabled
        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
    }`;

  const addBtnClass =
    "h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors";
  const sectionTitle =
    "text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
  const cellInput = `${controlClasses} h-8 text-xs w-full min-w-[90px]`;
  const th = "p-1 text-left dark:text-gray-200";
  const readOnlyCell = "p-1 pt-2 dark:text-gray-300 text-right";
  const rowClass =
    "border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";

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
          {data ? "Edit LC Material Return" : "Add LC Material Return"}
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
            label="Doc. No"
            name="docNo"
            value={form.docNo || "Auto"}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Belongs to"
            name="belongsTo"
            value={form.belongsTo}
            onChange={handleChange}
            options={BELONGS_TO_OPTIONS}
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
            label="Customer ID"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            error={fieldErrors.customerId}
            required
            options={CUSTOMER_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <Field
            label="Customer Name"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Location ID"
            name="locationId"
            value={form.locationId}
            onChange={handleChange}
            options={LOCATION_OPTIONS}
          />
          <Field
            label="Ref. No."
            name="refNo"
            value={form.refNo}
            onChange={handleChange}
            placeholder="Enter Ref. No."
          />

          <Field
            type="date"
            label="Ref. Date"
            name="refDate"
            value={form.refDate}
            onChange={handleChange}
          />
          <Field
            type="select"
            label="Invoice Type"
            name="invoiceType"
            value={form.invoiceType}
            onChange={handleChange}
            options={INVOICE_TYPE_OPTIONS}
          />
          <Field
            type="select"
            label="Invoice No"
            name="invoiceNo"
            value={form.invoiceNo}
            onChange={handleChange}
            options={INVOICE_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <Field
            type="date"
            label="Invoice Date"
            name="invoiceDate"
            value={form.invoiceDate}
            onChange={handleChange}
            disabled
          />

          <Field
            type="select"
            label="Return Type"
            name="returnType"
            value={form.returnType}
            onChange={handleChange}
            options={RETURN_TYPE_OPTIONS}
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
            step="0.01"
            value={form.exchangeRate}
            onChange={handleChange}
            placeholder="Enter Exchange Rate"
            disabled={isInr}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={tabButtonClass(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1 - Sales Return */}
        {activeTab === "salesReturn" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Sales Return</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[1500px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[130px]`}>Item Code *</th>
                    <th className={`${th} min-w-[200px]`}>Item Description</th>
                    <th className={`${th} min-w-[80px]`}>Unit</th>
                    <th className={`${th} min-w-[100px]`}>Qty Sold</th>
                    <th className={`${th} min-w-[100px]`}>Recd. Qty *</th>
                    <th className={`${th} min-w-[100px]`}>Rate</th>
                    <th className={`${th} min-w-[130px]`}>
                      Rate In Selected Currency
                    </th>
                    <th className={`${th} min-w-[140px]`}>
                      Amount In Selected Currency
                    </th>
                    <th className={`${th} min-w-[120px]`}>Tax Type</th>
                    <th className={`${th} min-w-[100px]`}>Amount</th>
                    <th className={`${th} min-w-[110px]`}>Amount With ED</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.itemCode}
                          onChange={(e) =>
                            handleRowChange(index, "itemCode", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
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
                          className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={UNIT_LABELS[row.unit] || ""}
                          className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.qtySold}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.recdQty}
                          onChange={(e) =>
                            handleRowChange(index, "recdQty", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.rate}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className={readOnlyCell}>
                        {derivedRows[index].rateInSelectedCurrency}
                      </td>
                      <td className={readOnlyCell}>
                        {derivedRows[index].amountInSelectedCurrency}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.taxType}
                          onChange={(e) =>
                            handleRowChange(index, "taxType", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                        >
                          <option value="">Select</option>
                          {TAX_TYPE_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={readOnlyCell}>
                        {derivedRows[index].amount}
                      </td>
                      <td className={`${readOnlyCell} font-medium`}>
                        {derivedRows[index].amountWithEd}
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          disabled={rows.length <= 1}
                          className={removeBtnClass(rows.length <= 1)}
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

        {/* 2 - Tax Details */}
        {activeTab === "taxDetails" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Tax Details</h3>
              <button
                type="button"
                onClick={handleAddTaxRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[500px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.No
                    </th>
                    <th className={`${th} min-w-[200px]`}>Particulars</th>
                    <th className={`${th} min-w-[140px]`}>Amount</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {taxRows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.particulars}
                          onChange={(e) =>
                            handleTaxRowChange(
                              index,
                              "particulars",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                        >
                          <option value="">-- Select --</option>
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
                          onChange={(e) =>
                            handleTaxRowChange(index, "amount", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTaxRow(index)}
                          disabled={taxRows.length <= 1}
                          className={removeBtnClass(taxRows.length <= 1)}
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

        {/* 3 - Sales Return Summary */}
        {activeTab === "summary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Net Amount"
                name="netAmount"
                value={netAmount.toFixed(2)}
                onChange={handleChange}
                disabled
              />
              <Field
                label="In Words"
                name="inWords"
                value={amountToWords(netAmount)}
                onChange={handleChange}
                disabled
                className="md:col-span-2"
              />
              <Field
                label="Narration"
                name="narration"
                value={form.narration}
                onChange={handleChange}
                placeholder="Enter Narration"
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

export default LCMaterialReturnForm;
