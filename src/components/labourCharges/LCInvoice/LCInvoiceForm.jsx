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

const DEPARTMENT_OPTIONS = [
  { value: "sales", label: "Sales" },
  { value: "dispatch", label: "Dispatch" },
  { value: "production", label: "Production" },
  { value: "finance", label: "Finance" },
];

// Customer master - name / CST / TIN / GSTN / GST state fill on selection
const CUSTOMER_OPTIONS = [
  {
    value: "cust_001",
    label: "CUST001",
    name: "ABC Appliances",
    cstNo: "CST1001",
    tinNo: "TIN1001",
    gstnNo: "29ABCDE1234F1Z5",
    gstState: "Karnataka",
  },
  {
    value: "cust_002",
    label: "CUST002",
    name: "Bosch Ltd",
    cstNo: "CST1002",
    tinNo: "TIN1002",
    gstnNo: "33BOSCH5678K1Z2",
    gstState: "Tamil Nadu",
  },
  {
    value: "cust_003",
    label: "CUST003",
    name: "XYZ Industries",
    cstNo: "CST1003",
    tinNo: "TIN1003",
    gstnNo: "27XYZIN4321L1Z9",
    gstState: "Maharashtra",
  },
];

const INDENT_OPTIONS = [
  { value: "ind_001", label: "IND001" },
  { value: "ind_002", label: "IND002" },
  { value: "ind_003", label: "IND003" },
];

const LOCATION_OPTIONS = [
  { value: "loc_001", label: "Location 001" },
  { value: "loc_002", label: "Location 002" },
  { value: "loc_003", label: "Location 003" },
];

const YES_NO_UPPER_OPTIONS = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

// LC PO master - date / PO details fill on selection
const LC_PO_OPTIONS = [
  {
    value: "lcpo_001",
    label: "LC001",
    lcPoDate: "2026-11-16",
    poNo: "PO-1001",
    poDate: "2026-11-10",
  },
  {
    value: "lcpo_002",
    label: "LC002",
    lcPoDate: "2026-11-16",
    poNo: "PO-1002",
    poDate: "2026-11-11",
  },
  {
    value: "lcpo_003",
    label: "LC003",
    lcPoDate: "2026-11-15",
    poNo: "PO-1003",
    poDate: "2026-11-12",
  },
];

const TAX_CODE_OPTIONS = [
  { value: "tax_001", label: "Tax Code 001" },
  { value: "tax_002", label: "Tax Code 002" },
  { value: "tax_003", label: "Tax Code 003" },
];

const TAX_TYPE_OPTIONS = [
  { value: "gst", label: "GST" },
  { value: "igst", label: "IGST" },
  { value: "exempt", label: "Exempt" },
];

const UNIT_OPTIONS = [
  { value: "nos", label: "Nos" },
  { value: "kg", label: "KG" },
  { value: "gms", label: "GMS" },
  { value: "ltr", label: "LTR" },
  { value: "mtr", label: "MTR" },
];

const PKG_TYPE_OPTIONS = [
  { value: "box", label: "Box" },
  { value: "bag", label: "Bag" },
  { value: "carton", label: "Carton" },
  { value: "pallet", label: "Pallet" },
];

const OUTGOING_ITEM_OPTIONS = [
  {
    value: "out_001",
    label: "OUT001",
    description: "Housing Cover - Coated",
    customerPartNo: "CP-001",
    hsn: "8516",
    taxType: "gst",
    taxPercent: "18",
    unit: "nos",
    rate: "118.00",
    availableQty: "500",
  },
  {
    value: "out_002",
    label: "OUT002",
    description: "Bracket Assembly - Plated",
    customerPartNo: "CP-002",
    hsn: "7326",
    taxType: "gst",
    taxPercent: "18",
    unit: "nos",
    rate: "59.00",
    availableQty: "1200",
  },
  {
    value: "out_003",
    label: "OUT003",
    description: "Base Plate - Treated",
    customerPartNo: "CP-003",
    hsn: "7308",
    taxType: "gst",
    taxPercent: "12",
    unit: "nos",
    rate: "70.80",
    availableQty: "300",
  },
];

const RM_ITEM_OPTIONS = [
  {
    value: "rm_001",
    label: "RM001",
    description: "Steel Sheet 1.2mm",
    itemType: "Raw Material",
    unit: "kg",
  },
  {
    value: "rm_002",
    label: "RM002",
    description: "Aluminium Strip",
    itemType: "Raw Material",
    unit: "kg",
  },
  {
    value: "rm_003",
    label: "RM003",
    description: "Powder Coat - Grey",
    itemType: "Consumable",
    unit: "kg",
  },
];

const PARTICULARS_OPTIONS = [
  { value: "freight", label: "Freight" },
  { value: "insurance", label: "Insurance" },
  { value: "packing", label: "Packing" },
  { value: "handling", label: "Handling" },
  { value: "other", label: "Other" },
];

const GL_ACCOUNT_OPTIONS = [
  { value: "gl_001", label: "GL Account 001" },
  { value: "gl_002", label: "GL Account 002" },
  { value: "gl_003", label: "GL Account 003" },
];

const TRANSPORT_MODE_OPTIONS = [
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
  { value: "air", label: "Air" },
  { value: "sea", label: "Sea" },
];

const emptyLcRow = () => ({
  id: Date.now() + Math.random(),
  outgoingItemCode: "",
  outgoingItemDescription: "",
  customerPartNo: "",
  hsnSacCode: "",
  taxType: "",
  taxPercent: "",
  unit: "",
  rate: "",
  availableQty: "",
  qty: "",
  noOfPkg: "",
  pkgType: "",
  amount: "0.00",
  sgstRate: "0.00",
  sgstAmount: "0.00",
  cgstRate: "0.00",
  cgstAmount: "0.00",
  igstRate: "0.00",
  igstAmount: "0.00",
});

const emptyRmRow = () => ({
  id: Date.now() + Math.random(),
  rmItemCode: "",
  rmItemDescription: "",
  itemType: "",
  unit: "",
  consumedQty: "",
});

const emptyTaxRow = () => ({
  id: Date.now() + Math.random(),
  particulars: "",
  amount: "",
  glAccountName: "",
});

// Amount = Qty x Rate; tax split follows Is IGST Appl
const recalcRow = (row, isIgst) => {
  const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.rate) || 0);
  const pct = parseFloat(row.taxPercent) || 0;
  const sgstRate = isIgst ? 0 : pct / 2;
  const cgstRate = isIgst ? 0 : pct / 2;
  const igstRate = isIgst ? pct : 0;
  return {
    ...row,
    amount: amount.toFixed(2),
    sgstRate: sgstRate.toFixed(2),
    cgstRate: cgstRate.toFixed(2),
    igstRate: igstRate.toFixed(2),
    sgstAmount: ((amount * sgstRate) / 100).toFixed(2),
    cgstAmount: ((amount * cgstRate) / 100).toFixed(2),
    igstAmount: ((amount * igstRate) / 100).toFixed(2),
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
  { key: "lcDetails", label: "LC Details" },
  { key: "consumedRm", label: "Consumed RM Details" },
  { key: "taxDetails", label: "Tax Details" },
  { key: "lcSummary", label: "LC Summary" },
];

const LCInvoiceForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("lcDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    invoiceNo: data?.invoiceNo || "",
    belongsTo: data?.belongsTo || "",
    invoiceDate: data?.invoiceDate || "",
    department: data?.department || "",
    customerId: data?.customerId || "",
    customerName: data?.customerName || "",
    indentNo: data?.indentNo || "",
    cstNo: data?.cstNo || "",
    tinNo: data?.tinNo || "",
    scheduleNo: data?.scheduleNo || "",
    scheduleDate: data?.scheduleDate || "",
    locationId: data?.locationId || "",
    stockPosting: data?.stockPosting || "YES",
    lcPoNo: data?.lcPoNo || "",
    lcPoDate: data?.lcPoDate || "",
    partyGstState: data?.partyGstState || "",
    taxCode: data?.taxCode || "",
    poDate: data?.poDate || "",
    isIgstAppl: data?.isIgstAppl || "no",
    pdiNo: data?.pdiNo || "",
    poNo: data?.poNo || "",
    gstnNo: data?.gstnNo || "",
    timeOfIssue: data?.timeOfIssue || "",
    timeOfRemoval: data?.timeOfRemoval || "",
    freight: data?.freight || "",
    paymentTerms: data?.paymentTerms || "",
    modeOfTransport: data?.modeOfTransport || "",
    packageType: data?.packageType || "",
  });

  const [lcRows, setLcRows] = useState([emptyLcRow()]);
  const [rmRows, setRmRows] = useState([emptyRmRow()]);
  const [taxRows, setTaxRows] = useState([emptyTaxRow()]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Customer selection fills name / CST / TIN / GSTN / GST state
      if (name === "customerId") {
        const cust = CUSTOMER_OPTIONS.find((c) => c.value === value);
        next.customerName = cust?.name || "";
        next.cstNo = cust?.cstNo || "";
        next.tinNo = cust?.tinNo || "";
        next.gstnNo = cust?.gstnNo || "";
        next.partyGstState = cust?.gstState || "";
      }

      // LC PO selection fills LC PO date / PO no / PO date
      if (name === "lcPoNo") {
        const po = LC_PO_OPTIONS.find((p) => p.value === value);
        next.lcPoDate = po?.lcPoDate || "";
        next.poNo = po?.poNo || "";
        next.poDate = po?.poDate || "";
      }

      return next;
    });

    // IGST toggle re-splits tax on every LC row
    if (name === "isIgstAppl") {
      setLcRows((rows) => rows.map((r) => recalcRow(r, value === "yes")));
    }
  };

  const isIgst = form.isIgstAppl === "yes";

  // LC rows
  const handleLcRowChange = (index, field, value) => {
    const updatedRows = [...lcRows];
    let row = { ...updatedRows[index], [field]: value };

    if (field === "outgoingItemCode") {
      const item = OUTGOING_ITEM_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        outgoingItemDescription: item?.description || "",
        customerPartNo: item?.customerPartNo || "",
        hsnSacCode: item?.hsn || "",
        taxType: item?.taxType || "",
        taxPercent: item?.taxPercent || "",
        unit: item?.unit || "",
        rate: item?.rate || "",
        availableQty: item?.availableQty || "",
      };
    }

    if (["outgoingItemCode", "qty", "rate", "taxPercent"].includes(field)) {
      row = recalcRow(row, isIgst);
    }

    updatedRows[index] = row;
    setLcRows(updatedRows);
  };

  const handleAddLcRow = () => setLcRows([...lcRows, emptyLcRow()]);
  const handleRemoveLcRow = (index) => {
    if (lcRows.length > 1) setLcRows(lcRows.filter((_, i) => i !== index));
  };

  const getAvailableOutgoingItems = (currentIndex) => {
    const selected = lcRows
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.outgoingItemCode);
    return OUTGOING_ITEM_OPTIONS.filter(
      (item) => !selected.includes(item.value),
    );
  };

  // RM rows
  const handleRmRowChange = (index, field, value) => {
    const updatedRows = [...rmRows];
    let row = { ...updatedRows[index], [field]: value };

    if (field === "rmItemCode") {
      const item = RM_ITEM_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        rmItemDescription: item?.description || "",
        itemType: item?.itemType || "",
        unit: item?.unit || "",
      };
    }

    updatedRows[index] = row;
    setRmRows(updatedRows);
  };

  const handleAddRmRow = () => setRmRows([...rmRows, emptyRmRow()]);
  const handleRemoveRmRow = (index) => {
    if (rmRows.length > 1) setRmRows(rmRows.filter((_, i) => i !== index));
  };

  const getAvailableRmItems = (currentIndex) => {
    const selected = rmRows
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.rmItemCode);
    return RM_ITEM_OPTIONS.filter((item) => !selected.includes(item.value));
  };

  // Tax rows
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
    if (!form.department) errors.department = "Department is required";
    if (!form.customerId) errors.customerId = "Customer ID is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Totals
  const lcAmountTotal = lcRows.reduce(
    (s, r) => s + (parseFloat(r.amount) || 0),
    0,
  );
  const lcGstTotal = lcRows.reduce(
    (s, r) =>
      s +
      (parseFloat(r.sgstAmount) || 0) +
      (parseFloat(r.cgstAmount) || 0) +
      (parseFloat(r.igstAmount) || 0),
    0,
  );
  const otherTaxTotal = taxRows.reduce(
    (s, r) => s + (parseFloat(r.amount) || 0),
    0,
  );
  const freight = parseFloat(form.freight) || 0;
  const grandTotal = lcAmountTotal + lcGstTotal + otherTaxTotal + freight;

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      lcRows,
      rmRows,
      taxRows,
      totalAmount: grandTotal.toFixed(2),
      amountInWords: amountToWords(grandTotal),
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "LC Invoice Updated Successfully!"
          : "LC Invoice Saved Successfully!",
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
          {data
            ? "Edit LC Invoice - Tax Invoice"
            : "Add LC Invoice - Tax Invoice"}
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
            label="LC Invoice No"
            name="invoiceNo"
            value={form.invoiceNo || "Auto"}
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
            label="Invoice Date"
            name="invoiceDate"
            value={form.invoiceDate}
            onChange={handleChange}
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
            label="Indent No."
            name="indentNo"
            value={form.indentNo}
            onChange={handleChange}
            options={INDENT_OPTIONS}
          />

          <Field
            label="CST No"
            name="cstNo"
            value={form.cstNo}
            onChange={handleChange}
            disabled
          />
          <Field
            label="TIN No."
            name="tinNo"
            value={form.tinNo}
            onChange={handleChange}
            disabled
          />
          <Field
            label="Schedule No."
            name="scheduleNo"
            value={form.scheduleNo}
            onChange={handleChange}
            placeholder="Enter Schedule No."
          />
          <Field
            type="date"
            label="Schedule Date"
            name="scheduleDate"
            value={form.scheduleDate}
            onChange={handleChange}
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
            type="select"
            label="Stock Posting?"
            name="stockPosting"
            value={form.stockPosting}
            onChange={handleChange}
            options={YES_NO_UPPER_OPTIONS}
          />
          <Field
            type="select"
            label="LC PO No."
            name="lcPoNo"
            value={form.lcPoNo}
            onChange={handleChange}
            options={LC_PO_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <Field
            type="date"
            label="LC PO Date."
            name="lcPoDate"
            value={form.lcPoDate}
            onChange={handleChange}
          />

          <Field
            label="PartyGSTState"
            name="partyGstState"
            value={form.partyGstState}
            onChange={handleChange}
            disabled
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
            type="date"
            label="PO Date"
            name="poDate"
            value={form.poDate}
            onChange={handleChange}
          />
          <Field
            type="select"
            label="IsIGSTAppl"
            name="isIgstAppl"
            value={form.isIgstAppl}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />

          <Field
            label="PDI No"
            name="pdiNo"
            value={form.pdiNo}
            onChange={handleChange}
            placeholder="Enter PDI No"
          />
          <Field
            label="PO No."
            name="poNo"
            value={form.poNo}
            onChange={handleChange}
            placeholder="Enter PO No."
          />
          <Field
            label="GSTNNo"
            name="gstnNo"
            value={form.gstnNo}
            onChange={handleChange}
            disabled
          />
          <Field
            type="datetime-local"
            label="Time of Issue"
            name="timeOfIssue"
            value={form.timeOfIssue}
            onChange={handleChange}
          />

          <Field
            type="datetime-local"
            label="Time of Removal"
            name="timeOfRemoval"
            value={form.timeOfRemoval}
            onChange={handleChange}
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

        {/* LC Details */}
        {activeTab === "lcDetails" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>LC Details</h3>
              <button
                type="button"
                onClick={handleAddLcRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[2200px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[130px]`}>
                      Outgoing Item Code *
                    </th>
                    <th className={`${th} min-w-[180px]`}>
                      Outgoing Item Description
                    </th>
                    <th className={`${th} min-w-[120px]`}>
                      Customer Part Number
                    </th>
                    <th className={`${th} min-w-[100px]`}>HSN_SAC_Code</th>
                    <th className={`${th} min-w-[100px]`}>Tax Type</th>
                    <th className={`${th} min-w-[90px]`}>Tax (%)</th>
                    <th className={`${th} min-w-[90px]`}>Unit</th>
                    <th className={`${th} min-w-[100px]`}>Rate</th>
                    <th className={`${th} min-w-[100px]`}>Available Qty</th>
                    <th className={`${th} min-w-[100px]`}>Qty *</th>
                    <th className={`${th} min-w-[100px]`}>No. Of Pkg.</th>
                    <th className={`${th} min-w-[110px]`}>Pkg Type</th>
                    <th className={`${th} min-w-[100px]`}>Amount</th>
                    <th className={`${th} min-w-[80px]`}>SGSTRate</th>
                    <th className={`${th} min-w-[100px]`}>SGST Amount</th>
                    <th className={`${th} min-w-[80px]`}>CGST Rate</th>
                    <th className={`${th} min-w-[100px]`}>CGST Amount</th>
                    <th className={`${th} min-w-[80px]`}>IGST Rate</th>
                    <th className={`${th} min-w-[100px]`}>IGST Amount</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lcRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.outgoingItemCode}
                          onChange={(e) =>
                            handleLcRowChange(
                              index,
                              "outgoingItemCode",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                        >
                          <option value="">Select</option>
                          {getAvailableOutgoingItems(index).map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.outgoingItemDescription}
                          className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.customerPartNo}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.hsnSacCode}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.taxType}
                          onChange={(e) =>
                            handleLcRowChange(index, "taxType", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                        >
                          <option value="">Select</option>
                          {TAX_TYPE_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.taxPercent}
                          onChange={(e) =>
                            handleLcRowChange(
                              index,
                              "taxPercent",
                              e.target.value,
                            )
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.unit}
                          onChange={(e) =>
                            handleLcRowChange(index, "unit", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[80px]`}
                        >
                          <option value="">Select</option>
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={(e) =>
                            handleLcRowChange(index, "rate", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.availableQty}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            handleLcRowChange(index, "qty", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.noOfPkg}
                          onChange={(e) =>
                            handleLcRowChange(index, "noOfPkg", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.pkgType}
                          onChange={(e) =>
                            handleLcRowChange(index, "pkgType", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                        >
                          <option value="">Select</option>
                          {PKG_TYPE_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`${readOnlyCell} font-medium`}>
                        {row.amount}
                      </td>
                      <td className={readOnlyCell}>{row.sgstRate}</td>
                      <td className={readOnlyCell}>{row.sgstAmount}</td>
                      <td className={readOnlyCell}>{row.cgstRate}</td>
                      <td className={readOnlyCell}>{row.cgstAmount}</td>
                      <td className={readOnlyCell}>{row.igstRate}</td>
                      <td className={readOnlyCell}>{row.igstAmount}</td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLcRow(index)}
                          disabled={lcRows.length <= 1}
                          className={removeBtnClass(lcRows.length <= 1)}
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

        {/* Consumed RM Details */}
        {activeTab === "consumedRm" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Consumed RM Details</h3>
              <button
                type="button"
                onClick={handleAddRmRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[800px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.No
                    </th>
                    <th className={`${th} min-w-[130px]`}>RM Item Code *</th>
                    <th className={`${th} min-w-[200px]`}>
                      RM Item Description
                    </th>
                    <th className={`${th} min-w-[130px]`}>Item Type</th>
                    <th className={`${th} min-w-[90px]`}>Unit</th>
                    <th className={`${th} min-w-[110px]`}>Consumed Qty</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rmRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.rmItemCode}
                          onChange={(e) =>
                            handleRmRowChange(
                              index,
                              "rmItemCode",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                        >
                          <option value="">Select</option>
                          {getAvailableRmItems(index).map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.rmItemDescription}
                          className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.itemType}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.unit ? row.unit.toUpperCase() : ""}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.consumedQty}
                          onChange={(e) =>
                            handleRmRowChange(
                              index,
                              "consumedQty",
                              e.target.value,
                            )
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRmRow(index)}
                          disabled={rmRows.length <= 1}
                          className={removeBtnClass(rmRows.length <= 1)}
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

        {/* Tax Details */}
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
              <table className="w-full text-xs min-w-[650px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.No
                    </th>
                    <th className={`${th} min-w-[180px]`}>Particulars</th>
                    <th className={`${th} min-w-[120px]`}>Amount</th>
                    <th className={`${th} min-w-[180px]`}>GL Account Name</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {taxRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
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
                          className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
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
                          className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.glAccountName}
                          onChange={(e) =>
                            handleTaxRowChange(
                              index,
                              "glAccountName",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
                        >
                          <option value="">-- Select --</option>
                          {GL_ACCOUNT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
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

        {/* LC Summary */}
        {activeTab === "lcSummary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Freight"
                name="freight"
                type="number"
                step="0.01"
                value={form.freight}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Payment ~Terms"
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                placeholder="Enter Payment Terms"
              />
              <Field
                type="select"
                label="Mode Of Transport"
                name="modeOfTransport"
                value={form.modeOfTransport}
                onChange={handleChange}
                options={TRANSPORT_MODE_OPTIONS}
              />
              <Field
                type="select"
                label="Package Type"
                name="packageType"
                value={form.packageType}
                onChange={handleChange}
                options={PKG_TYPE_OPTIONS}
              />
              <Field
                label="Total Amount"
                name="totalAmount"
                value={grandTotal.toFixed(2)}
                onChange={handleChange}
                disabled
              />
              <Field
                label="Amount In Words"
                name="amountInWords"
                value={amountToWords(grandTotal)}
                onChange={handleChange}
                disabled
                className="md:col-span-2"
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

export default LCInvoiceForm;
