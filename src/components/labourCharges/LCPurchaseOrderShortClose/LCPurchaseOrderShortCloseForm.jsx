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
// Customer master - name fills automatically on selection
const CUSTOMER_OPTIONS = [
  { value: "cust_001", label: "CUST001", name: "ABC Appliances" },
  { value: "cust_002", label: "CUST002", name: "Bosch Ltd" },
  { value: "cust_003", label: "CUST003", name: "XYZ Industries" },
];

const SA_NO_OPTIONS = [
  { value: "sa_001", label: "SA001" },
  { value: "sa_002", label: "SA002" },
  { value: "sa_003", label: "SA003" },
];

const ITEM_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Housing Cover - Coated",
    orderQty: "500",
    suppliedQty: "180",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Bracket Assembly - Plated",
    orderQty: "1200",
    suppliedQty: "300",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Base Plate - Treated",
    orderQty: "300",
    suppliedQty: "0",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Steel Sheet 1.2mm",
    orderQty: "800",
    suppliedQty: "350",
  },
];

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  itemCode: "",
  itemDescription: "",
  orderQty: "",
  suppliedQty: "",
  pendingQty: "",
  qtyReqd: "",
  shortCloseQty: "",
});

const TABS = [
  { key: "preClosedDetail", label: "1-SO Pre Closed Detail" },
  { key: "preClosedSummary", label: "2-SO Pre Closed Summary" },
];

const LCPurchaseOrderShortCloseForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("preClosedDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    customerId: data?.customerId || "",
    shortCloseNo: data?.shortCloseNo || "",
    customerName: data?.customerName || "",
    date: data?.date || "",
    saNo: data?.saNo || "",
    referenceForShortClose: data?.referenceForShortClose || "",
  });

  const [rows, setRows] = useState([emptyRow()]);

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

      return next;
    });
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    let row = { ...updatedRows[index], [field]: value };

    // Item selection fills description, order / supplied qty and pending qty
    if (field === "itemCode") {
      const item = ITEM_OPTIONS.find((i) => i.value === value);
      const orderQty = parseFloat(item?.orderQty) || 0;
      const suppliedQty = parseFloat(item?.suppliedQty) || 0;
      row = {
        ...row,
        itemDescription: item?.description || "",
        orderQty: item?.orderQty || "",
        suppliedQty: item?.suppliedQty || "",
        pendingQty: item ? (orderQty - suppliedQty).toFixed(2) : "",
      };
    }

    updatedRows[index] = row;
    setRows(updatedRows);
  };

  const handleAddRow = () => setRows([...rows, emptyRow()]);

  const handleRemoveRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const getAvailableItems = (currentIndex) => {
    const selectedItems = rows
      .filter((_, index) => index !== currentIndex)
      .map((row) => row.itemCode);
    return ITEM_OPTIONS.filter((item) => !selectedItems.includes(item.value));
  };

  const validate = () => {
    const errors = {};
    if (!form.customerId) errors.customerId = "Customer ID is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = { ...form, rows };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "LC Purchase Order Short Close Updated Successfully!"
          : "LC Purchase Order Short Close Saved Successfully!",
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

  const cellInput = `${controlClasses} h-8 text-xs w-full min-w-[90px]`;
  const th = "p-1 text-left dark:text-gray-200";

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
            ? "Edit LC Purchase Order Short Close"
            : "Add LC Purchase Order Short Close"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Form Fields */}
        <div className={fieldGrid}>
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
            label="Short Close NO"
            name="shortCloseNo"
            value={form.shortCloseNo || "Auto"}
            onChange={handleChange}
            disabled
          />
          <Field
            label="Customer Name"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            disabled
          />
          <Field
            type="date"
            label="Date."
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <Field
            type="select"
            label="S.A.NO."
            name="saNo"
            value={form.saNo}
            onChange={handleChange}
            options={SA_NO_OPTIONS}
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

        {/* 1 - SO Pre Closed Detail */}
        {activeTab === "preClosedDetail" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                SO Pre Closed Detail
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
              <table className="w-full text-xs min-w-[1000px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[130px]`}>Item Code *</th>
                    <th className={`${th} min-w-[200px]`}>Item Description.</th>
                    <th className={`${th} min-w-[100px]`}>Order Qty</th>
                    <th className={`${th} min-w-[100px]`}>Supplied Qty</th>
                    <th className={`${th} min-w-[100px]`}>Pending Qty</th>
                    <th className={`${th} min-w-[100px]`}>Qty Reqd</th>
                    <th className={`${th} min-w-[110px]`}>Short Close Qty</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
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
                          type="number"
                          value={row.orderQty}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.suppliedQty}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.pendingQty}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.qtyReqd}
                          onChange={(e) =>
                            handleRowChange(index, "qtyReqd", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.shortCloseQty}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "shortCloseQty",
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

        {/* 2 - SO Pre Closed Summary */}
        {activeTab === "preClosedSummary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Reference for Short Close"
                name="referenceForShortClose"
                value={form.referenceForShortClose}
                onChange={handleChange}
                placeholder="Enter Reference for Short Close"
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

export default LCPurchaseOrderShortCloseForm;
