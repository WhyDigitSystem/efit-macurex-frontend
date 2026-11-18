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

  if (type === "radio") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <div className="flex items-center gap-4 h-[30px]">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1 cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={onChange}
                disabled={disabled}
                className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
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

const DEPARTMENT_OPTIONS = [
  { value: "purchase", label: "Purchase" },
  { value: "production", label: "Production" },
  { value: "finance", label: "Finance" },
  { value: "stores", label: "Stores" },
];

const BELONGS_TO_OPTIONS = [
  { value: "appliances", label: "APPLIANCES" },
  { value: "bosch", label: "BOSCH" },
];

// Customer master - GSTN / state / name fill automatically on selection
const CUSTOMER_OPTIONS = [
  {
    value: "cust_001",
    label: "CUST001",
    name: "ABC Appliances",
    gstn: "29ABCDE1234F1Z5",
    gstState: "Karnataka",
  },
  {
    value: "cust_002",
    label: "CUST002",
    name: "Bosch Ltd",
    gstn: "33BOSCH5678K1Z2",
    gstState: "Tamil Nadu",
  },
  {
    value: "cust_003",
    label: "CUST003",
    name: "XYZ Industries",
    gstn: "27XYZIN4321L1Z9",
    gstState: "Maharashtra",
  },
];

const FG_PART_OPTIONS = [
  { value: "fg_001", label: "FG001", partName: "Housing Cover" },
  { value: "fg_002", label: "FG002", partName: "Bracket Assembly" },
  { value: "fg_003", label: "FG003", partName: "Base Plate" },
];

const BOM_ID_OPTIONS = [
  { value: "bom_001", label: "BOM001" },
  { value: "bom_002", label: "BOM002" },
  { value: "bom_003", label: "BOM003" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const YES_NO_UPPER_OPTIONS = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

const TAX_TYPE_OPTIONS = [
  { value: "gst", label: "GST" },
  { value: "igst", label: "IGST" },
  { value: "exempt", label: "Exempt" },
];

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ value: m.toLowerCase(), label: m }));

const TAX_CODE_OPTIONS = [
  { value: "tax_001", label: "Tax Code 001" },
  { value: "tax_002", label: "Tax Code 002" },
  { value: "tax_003", label: "Tax Code 003" },
];

const ITEM_CODE_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Steel Sheet 1.2mm",
    unit: "kg",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Aluminium Strip",
    unit: "kg",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Copper Wire",
    unit: "mtr",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Fastener Set",
    unit: "nos",
  },
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

const emptyDetailRow = () => ({
  id: Date.now() + Math.random(),
  incomingItemCode: "",
  incomingItemDescription: "",
  bomQty: "",
  requiredQty: "",
  unit: "",
  scrapQty: "",
  scrapUnit: "",
});

const emptyTaxRow = () => ({
  id: Date.now() + Math.random(),
  particulars: "",
  amount: "",
});

// Recalculate SGST / CGST / IGST rates and amounts from Outgoing Qty x Rate and Tax (%)
const recalcTax = (f) => {
  const base = (parseFloat(f.outgoingQty) || 0) * (parseFloat(f.rate) || 0);
  const pct = parseFloat(f.taxPercent) || 0;
  const isIgst = f.isIgstAppl === "yes";

  const sgstRate = isIgst ? 0 : pct / 2;
  const cgstRate = isIgst ? 0 : pct / 2;
  const igstRate = isIgst ? pct : 0;

  return {
    ...f,
    sgstRate: sgstRate.toFixed(2),
    cgstRate: cgstRate.toFixed(2),
    igstRate: igstRate.toFixed(2),
    sgstAmount: ((base * sgstRate) / 100).toFixed(2),
    cgstAmount: ((base * cgstRate) / 100).toFixed(2),
    igstAmount: ((base * igstRate) / 100).toFixed(2),
  };
};

const TABS = [
  { key: "lcPurchaseDetail", label: "1-LC Purchase Detail" },
  { key: "taxDetails", label: "2-Tax Details" },
  { key: "lcPurchaseSummary", label: "3-LC Purchase Summary" },
];

const LCPurchaseOrderForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("lcPurchaseDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    workNumber: data?.workNumber || "",
    department: data?.department || "",
    workDate: data?.workDate || "",
    belongsTo: data?.belongsTo || "",
    customerId: data?.customerId || "",
    customerName: data?.customerName || "",
    customerPoNo: data?.customerPoNo || "",
    gstnNo: data?.gstnNo || "",
    gstState: data?.gstState || "",
    isIgstAppl: data?.isIgstAppl || "no",
    customerPoDate: data?.customerPoDate || "",
    partName: data?.partName || "",
    fgPartNo: data?.fgPartNo || "",
    bomDate: data?.bomDate || "",
    bomId: data?.bomId || "",
    serviceName: data?.serviceName || "",
    outgoingQty: data?.outgoingQty || "",
    hsnSacCode: data?.hsnSacCode || "",
    rate: data?.rate || "",
    taxType: data?.taxType || "",
    month: data?.month || "",
    taxPercent: data?.taxPercent || "",
    monYear: data?.monYear || "",
    sgstRate: data?.sgstRate || "0.00",
    sgstAmount: data?.sgstAmount || "0.00",
    approval: data?.approval || "YES",
    cgstRate: data?.cgstRate || "0.00",
    cgstAmount: data?.cgstAmount || "0.00",
    taxCode: data?.taxCode || "",
    igstRate: data?.igstRate || "0.00",
    igstAmount: data?.igstAmount || "0.00",
    paymentTerms: data?.paymentTerms || "",
    shortClosed: data?.shortClosed || "NO",
    remarks: data?.remarks || "",
  });

  const [detailRows, setDetailRows] = useState([emptyDetailRow()]);
  const [taxRows, setTaxRows] = useState([emptyTaxRow()]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      let next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Customer selection fills name / GSTN / state
      if (name === "customerId") {
        const cust = CUSTOMER_OPTIONS.find((c) => c.value === value);
        next.customerName = cust?.name || "";
        next.gstnNo = cust?.gstn || "";
        next.gstState = cust?.gstState || "";
      }

      // FG part selection fills part name
      if (name === "fgPartNo") {
        const part = FG_PART_OPTIONS.find((p) => p.value === value);
        next.partName = part?.partName || "";
      }

      // Recalculate taxes when any driver changes
      if (["outgoingQty", "rate", "taxPercent", "isIgstAppl"].includes(name)) {
        next = recalcTax(next);
      }

      return next;
    });
  };

  const handleDetailRowChange = (index, field, value) => {
    const updatedRows = [...detailRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    // Item selection fills description and unit
    if (field === "incomingItemCode") {
      const item = ITEM_CODE_OPTIONS.find((i) => i.value === value);
      updatedRows[index].incomingItemDescription = item?.description || "";
      updatedRows[index].unit = item?.unit || "";
    }

    setDetailRows(updatedRows);
  };

  const handleTaxRowChange = (index, field, value) => {
    const updatedRows = [...taxRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setTaxRows(updatedRows);
  };

  const handleAddDetailRow = () =>
    setDetailRows([...detailRows, emptyDetailRow()]);

  const handleRemoveDetailRow = (index) => {
    if (detailRows.length > 1) {
      setDetailRows(detailRows.filter((_, i) => i !== index));
    }
  };

  const handleAddTaxRow = () => setTaxRows([...taxRows, emptyTaxRow()]);

  const handleRemoveTaxRow = (index) => {
    if (taxRows.length > 1) {
      setTaxRows(taxRows.filter((_, i) => i !== index));
    }
  };

  const getAvailableItems = (currentIndex) => {
    const selectedItems = detailRows
      .filter((_, index) => index !== currentIndex)
      .map((row) => row.incomingItemCode);
    return ITEM_CODE_OPTIONS.filter(
      (item) => !selectedItems.includes(item.value),
    );
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
  const baseAmount =
    (parseFloat(form.outgoingQty) || 0) * (parseFloat(form.rate) || 0);
  const gstAmount =
    (parseFloat(form.sgstAmount) || 0) +
    (parseFloat(form.cgstAmount) || 0) +
    (parseFloat(form.igstAmount) || 0);
  const otherTaxTotal = taxRows.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0,
  );
  const grandTotal = baseAmount + gstAmount + otherTaxTotal;

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      detailRows,
      taxRows,
      totalAmount: grandTotal.toFixed(2),
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "LC Purchase Order Updated Successfully!"
          : "LC Purchase Order Saved Successfully!",
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
          {data ? "Edit LC Purchase Order" : "Add LC Purchase Order"}
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
            label="Work Number"
            name="workNumber"
            value={form.workNumber || "Auto"}
            onChange={handleChange}
            disabled
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
            type="date"
            label="Work Date"
            name="workDate"
            value={form.workDate}
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
            label="Customer PO No"
            name="customerPoNo"
            value={form.customerPoNo}
            onChange={handleChange}
            placeholder="Enter Customer PO No"
          />

          <Field
            label="GSTN No"
            name="gstnNo"
            value={form.gstnNo}
            onChange={handleChange}
            disabled
          />
          <Field
            label="GST State"
            name="gstState"
            value={form.gstState}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Is IGST Appl"
            name="isIgstAppl"
            value={form.isIgstAppl}
            onChange={handleChange}
            options={YES_NO_OPTIONS}
          />
          <Field
            type="date"
            label="Customer PO Date"
            name="customerPoDate"
            value={form.customerPoDate}
            onChange={handleChange}
          />

          <Field
            label="Part Name"
            name="partName"
            value={form.partName}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="FG Part No."
            name="fgPartNo"
            value={form.fgPartNo}
            onChange={handleChange}
            options={FG_PART_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <Field
            type="date"
            label="Bom Date"
            name="bomDate"
            value={form.bomDate}
            onChange={handleChange}
          />
          <Field
            type="select"
            label="Bom ID"
            name="bomId"
            value={form.bomId}
            onChange={handleChange}
            options={BOM_ID_OPTIONS}
          />

          <Field
            label="Service Name"
            name="serviceName"
            value={form.serviceName}
            onChange={handleChange}
            placeholder="Enter Service Name"
          />
          <Field
            label="OutGoing Qty"
            name="outgoingQty"
            type="number"
            step="0.01"
            value={form.outgoingQty}
            onChange={handleChange}
            placeholder="0.00"
          />
          <Field
            label="HSN/SAC Code"
            name="hsnSacCode"
            value={form.hsnSacCode}
            onChange={handleChange}
            placeholder="Enter HSN/SAC Code"
          />
          <Field
            label="Rate"
            name="rate"
            type="number"
            step="0.01"
            value={form.rate}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Field
            type="select"
            label="Tax Type"
            name="taxType"
            value={form.taxType}
            onChange={handleChange}
            options={TAX_TYPE_OPTIONS}
          />
          <Field
            type="select"
            label="Month"
            name="month"
            value={form.month}
            onChange={handleChange}
            options={MONTH_OPTIONS}
          />
          <Field
            label="Tax (%)"
            name="taxPercent"
            type="number"
            step="0.01"
            value={form.taxPercent}
            onChange={handleChange}
            placeholder="0.00"
          />
          <Field
            label="Mon--Year"
            name="monYear"
            type="month"
            value={form.monYear}
            onChange={handleChange}
          />

          <Field
            label="SGST Rate"
            name="sgstRate"
            value={form.sgstRate}
            onChange={handleChange}
            disabled
          />
          <Field
            label="SGST Amount"
            name="sgstAmount"
            value={form.sgstAmount}
            onChange={handleChange}
            disabled
          />
          <Field
            type="radio"
            label="Approval"
            name="approval"
            value={form.approval}
            onChange={handleChange}
            options={YES_NO_UPPER_OPTIONS}
          />
          <Field
            label="CGST Rate"
            name="cgstRate"
            value={form.cgstRate}
            onChange={handleChange}
            disabled
          />

          <Field
            label="CGST Amount"
            name="cgstAmount"
            value={form.cgstAmount}
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
            label="IGST Rate"
            name="igstRate"
            value={form.igstRate}
            onChange={handleChange}
            disabled
          />
          <Field
            label="IGST Amount"
            name="igstAmount"
            value={form.igstAmount}
            onChange={handleChange}
            disabled
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

        {/* 1 - LC Purchase Detail */}
        {activeTab === "lcPurchaseDetail" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                LC Purchase Detail
              </h3>
              <button
                type="button"
                onClick={handleAddDetailRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[1000px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className="p-1 text-left min-w-[130px] dark:text-gray-200">
                      Incoming Item Code *
                    </th>
                    <th className="p-1 text-left min-w-[180px] dark:text-gray-200">
                      Incoming Item Description
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Bom Qty
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Required Qty
                    </th>
                    <th className="p-1 text-left min-w-[90px] dark:text-gray-200">
                      Unit
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Scrap Qty
                    </th>
                    <th className="p-1 text-left min-w-[90px] dark:text-gray-200">
                      Scrap Unit
                    </th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detailRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.incomingItemCode}
                          onChange={(e) =>
                            handleDetailRowChange(
                              index,
                              "incomingItemCode",
                              e.target.value,
                            )
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
                          value={row.incomingItemDescription}
                          onChange={(e) =>
                            handleDetailRowChange(
                              index,
                              "incomingItemDescription",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
                          placeholder="Description"
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.bomQty}
                          onChange={(e) =>
                            handleDetailRowChange(
                              index,
                              "bomQty",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.requiredQty}
                          onChange={(e) =>
                            handleDetailRowChange(
                              index,
                              "requiredQty",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.unit}
                          onChange={(e) =>
                            handleDetailRowChange(index, "unit", e.target.value)
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
                          value={row.scrapQty}
                          onChange={(e) =>
                            handleDetailRowChange(
                              index,
                              "scrapQty",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.scrapUnit}
                          onChange={(e) =>
                            handleDetailRowChange(
                              index,
                              "scrapUnit",
                              e.target.value,
                            )
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
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveDetailRow(index)}
                          disabled={detailRows.length <= 1}
                          className={removeBtnClass(detailRows.length <= 1)}
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
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tax Details
              </h3>
              <button
                type="button"
                onClick={handleAddTaxRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
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
                    <th className="p-1 text-left min-w-[200px] dark:text-gray-200">
                      Particulars
                    </th>
                    <th className="p-1 text-left min-w-[140px] dark:text-gray-200">
                      Amount
                    </th>
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

        {/* 3 - LC Purchase Summary */}
        {activeTab === "lcPurchaseSummary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Total Amount"
                name="totalAmount"
                value={grandTotal.toFixed(2)}
                onChange={handleChange}
                disabled
              />
              <Field
                label="Payment Terms"
                name="paymentTerms"
                value={form.paymentTerms}
                onChange={handleChange}
                placeholder="Enter Payment Terms"
              />
              <Field
                type="select"
                label="Short Closed ?"
                name="shortClosed"
                value={form.shortClosed}
                onChange={handleChange}
                options={YES_NO_UPPER_OPTIONS}
              />
              <Field
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter Remarks"
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

export default LCPurchaseOrderForm;
