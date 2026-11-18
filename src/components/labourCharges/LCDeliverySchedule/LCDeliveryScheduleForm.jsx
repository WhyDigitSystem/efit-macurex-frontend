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

const MONTH_NAMES = [
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
];
const MONTH_OPTIONS = MONTH_NAMES.map((m) => ({
  value: m.toLowerCase(),
  label: m,
}));

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Customer master - name fills automatically on selection
const CUSTOMER_OPTIONS = [
  { value: "cust_001", label: "CUST001", name: "ABC Appliances" },
  { value: "cust_002", label: "CUST002", name: "Bosch Ltd" },
  { value: "cust_003", label: "CUST003", name: "XYZ Industries" },
];

const LC_PO_OPTIONS = [
  { value: "lcpo_001", label: "LC001" },
  { value: "lcpo_002", label: "LC002" },
  { value: "lcpo_003", label: "LC003" },
];

const ITEM_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Housing Cover - Coated",
    unit: "nos",
    poQty: "500",
    pendingQty: "320",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Bracket Assembly - Plated",
    unit: "nos",
    poQty: "1200",
    pendingQty: "900",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Base Plate - Treated",
    unit: "nos",
    poQty: "300",
    pendingQty: "300",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Steel Sheet 1.2mm",
    unit: "kg",
    poQty: "800",
    pendingQty: "450",
  },
];

const BOM_ITEM_OPTIONS = [
  {
    value: "bom_001",
    label: "BOMITEM001",
    description: "Steel Sheet 1.2mm",
    unit: "kg",
  },
  {
    value: "bom_002",
    label: "BOMITEM002",
    description: "Aluminium Strip",
    unit: "kg",
  },
  {
    value: "bom_003",
    label: "BOMITEM003",
    description: "Powder Coat - Grey",
    unit: "kg",
  },
];

const UNIT_LABELS = {
  nos: "NOS",
  kg: "KG",
  gms: "GMS",
  ltr: "LTR",
  mtr: "MTR",
};

const emptyScheduleRow = () => ({
  id: Date.now() + Math.random(),
  lcPoNo: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  poQty: "",
  pendingQty: "",
  plannedQty: "",
});

const emptyBomRow = () => ({
  id: Date.now() + Math.random(),
  itemCode: "",
  itemDescription: "",
  unit: "",
});

const emptyDeliveryRow = () => ({
  id: Date.now() + Math.random(),
  dayNo: "",
  deliveryDate: "",
  weekNo: "",
  day: "",
  deliveryQty: "",
});

// Derive Day No. (day of month), Week No. (week of month) and Day (weekday name) from a yyyy-mm-dd date
const deriveFromDate = (dateStr) => {
  if (!dateStr) return { dayNo: "", weekNo: "", day: "" };
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    dayNo: String(d),
    weekNo: String(Math.ceil(d / 7)),
    day: DAY_NAMES[date.getDay()],
  };
};

const TABS = [
  { key: "scheduleDetails", label: "1.1-Schedule Details" },
  { key: "bomDetails", label: "1.2-Bom Details" },
  { key: "lcSummary", label: "1.3-LC Summary" },
];

const LCDeliveryScheduleForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("scheduleDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    docNo: data?.docNo || "",
    monthOfSchedule: data?.monthOfSchedule || "",
    docDate: data?.docDate || "",
    customerId: data?.customerId || "",
    monthYear: data?.monthYear || "",
    customerName: data?.customerName || "",
    remarks: data?.remarks || "",
  });

  const [scheduleRows, setScheduleRows] = useState([emptyScheduleRow()]);
  const [bomRows, setBomRows] = useState([emptyBomRow()]);
  const [deliveryRows, setDeliveryRows] = useState([emptyDeliveryRow()]);

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

      // Month-Year picker keeps Month Of Schedule in step
      if (name === "monthYear" && value) {
        const monthIndex = parseInt(value.split("-")[1], 10) - 1;
        next.monthOfSchedule =
          MONTH_NAMES[monthIndex]?.toLowerCase() || prev.monthOfSchedule;
      }

      return next;
    });
  };

  // Schedule rows
  const handleScheduleRowChange = (index, field, value) => {
    const updatedRows = [...scheduleRows];
    let row = { ...updatedRows[index], [field]: value };

    if (field === "itemCode") {
      const item = ITEM_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        itemDescription: item?.description || "",
        unit: item?.unit || "",
        poQty: item?.poQty || "",
        pendingQty: item?.pendingQty || "",
      };
    }

    updatedRows[index] = row;
    setScheduleRows(updatedRows);
  };

  const handleAddScheduleRow = () =>
    setScheduleRows([...scheduleRows, emptyScheduleRow()]);
  const handleRemoveScheduleRow = (index) => {
    if (scheduleRows.length > 1)
      setScheduleRows(scheduleRows.filter((_, i) => i !== index));
  };

  // Bom rows
  const handleBomRowChange = (index, field, value) => {
    const updatedRows = [...bomRows];
    let row = { ...updatedRows[index], [field]: value };

    if (field === "itemCode") {
      const item = BOM_ITEM_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        itemDescription: item?.description || "",
        unit: item?.unit || "",
      };
    }

    updatedRows[index] = row;
    setBomRows(updatedRows);
  };

  const handleAddBomRow = () => setBomRows([...bomRows, emptyBomRow()]);
  const handleRemoveBomRow = (index) => {
    if (bomRows.length > 1) setBomRows(bomRows.filter((_, i) => i !== index));
  };

  const getAvailableBomItems = (currentIndex) => {
    const selected = bomRows
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.itemCode);
    return BOM_ITEM_OPTIONS.filter((item) => !selected.includes(item.value));
  };

  // Delivery rows
  const handleDeliveryRowChange = (index, field, value) => {
    const updatedRows = [...deliveryRows];
    let row = { ...updatedRows[index], [field]: value };

    if (field === "deliveryDate") {
      row = { ...row, ...deriveFromDate(value) };
    }

    updatedRows[index] = row;
    setDeliveryRows(updatedRows);
  };

  const handleAddDeliveryRow = () =>
    setDeliveryRows([...deliveryRows, emptyDeliveryRow()]);
  const handleRemoveDeliveryRow = (index) => {
    if (deliveryRows.length > 1)
      setDeliveryRows(deliveryRows.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};
    if (!form.plantId) errors.plantId = "Plant ID is required";
    if (!form.customerId) errors.customerId = "Customer ID is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Totals
  const totalPlannedQty = scheduleRows.reduce(
    (s, r) => s + (parseFloat(r.plannedQty) || 0),
    0,
  );
  const totalDeliveryQty = deliveryRows.reduce(
    (s, r) => s + (parseFloat(r.deliveryQty) || 0),
    0,
  );

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = { ...form, scheduleRows, bomRows, deliveryRows };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "LC Delivery Schedule Updated Successfully!"
          : "LC Delivery Schedule Saved Successfully!",
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
          {data ? "Edit LC Delivery Schedule" : "Add LC Delivery Schedule"}
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
            label="Doc. No."
            name="docNo"
            value={form.docNo || "Auto"}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Month Of Schedule"
            name="monthOfSchedule"
            value={form.monthOfSchedule}
            onChange={handleChange}
            options={MONTH_OPTIONS}
          />
          <Field
            type="date"
            label="Doc. Date"
            name="docDate"
            value={form.docDate}
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
            type="month"
            label="Month-Year"
            name="monthYear"
            value={form.monthYear}
            onChange={handleChange}
          />
          <Field
            label="Customer Name"
            name="customerName"
            value={form.customerName}
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

        {/* 1.1 Schedule Details */}
        {activeTab === "scheduleDetails" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Schedule Details</h3>
              <button
                type="button"
                onClick={handleAddScheduleRow}
                className={addBtnClass}
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
                    <th className={`${th} min-w-[120px]`}>LC PO No.</th>
                    <th className={`${th} min-w-[130px]`}>Item Code *</th>
                    <th className={`${th} min-w-[200px]`}>Item Description</th>
                    <th className={`${th} min-w-[80px]`}>Unit</th>
                    <th className={`${th} min-w-[100px]`}>PO Qty</th>
                    <th className={`${th} min-w-[100px]`}>Pending Qty</th>
                    <th className={`${th} min-w-[100px]`}>Planned Qty</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.lcPoNo}
                          onChange={(e) =>
                            handleScheduleRowChange(
                              index,
                              "lcPoNo",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                        >
                          <option value="">Select</option>
                          {LC_PO_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <select
                          value={row.itemCode}
                          onChange={(e) =>
                            handleScheduleRowChange(
                              index,
                              "itemCode",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                        >
                          <option value="">Select</option>
                          {ITEM_OPTIONS.map((item) => (
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
                          value={row.poQty}
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
                          value={row.plannedQty}
                          onChange={(e) =>
                            handleScheduleRowChange(
                              index,
                              "plannedQty",
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
                          onClick={() => handleRemoveScheduleRow(index)}
                          disabled={scheduleRows.length <= 1}
                          className={removeBtnClass(scheduleRows.length <= 1)}
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

        {/* 1.2 Bom Details */}
        {activeTab === "bomDetails" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>Bom Details</h3>
              <button
                type="button"
                onClick={handleAddBomRow}
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
                    <th className={`${th} min-w-[140px]`}>Item Code *</th>
                    <th className={`${th} min-w-[220px]`}>Item Description</th>
                    <th className={`${th} min-w-[90px]`}>Unit</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bomRows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <select
                          value={row.itemCode}
                          onChange={(e) =>
                            handleBomRowChange(
                              index,
                              "itemCode",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[130px]`}
                        >
                          <option value="">Select</option>
                          {getAvailableBomItems(index).map((item) => (
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
                          className={`${controlClasses} h-8 text-xs w-full min-w-[210px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={UNIT_LABELS[row.unit] || ""}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveBomRow(index)}
                          disabled={bomRows.length <= 1}
                          className={removeBtnClass(bomRows.length <= 1)}
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

        {/* 1.3 LC Summary */}
        {activeTab === "lcSummary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
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

        {/* 2.1 Delivery Schedule - always visible in its own row below the tabs */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className={sectionTitle}>2.1-Delivery Schedule</h3>
              <button
                type="button"
                onClick={handleAddDeliveryRow}
                className={addBtnClass}
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[750px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[90px]`}>Day No.</th>
                    <th className={`${th} min-w-[150px]`}>Delivery Date</th>
                    <th className={`${th} min-w-[90px]`}>Week No.</th>
                    <th className={`${th} min-w-[120px]`}>Day</th>
                    <th className={`${th} min-w-[120px]`}>Delivery Qty.</th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryRows.map((row, index) => (
                    <tr key={row.id} className={rowClass}>
                      <td className="p-1 text-center font-medium dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.dayNo}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="date"
                          value={row.deliveryDate}
                          onChange={(e) =>
                            handleDeliveryRowChange(
                              index,
                              "deliveryDate",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[140px]`}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.weekNo}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.day}
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.deliveryQty}
                          onChange={(e) =>
                            handleDeliveryRowChange(
                              index,
                              "deliveryQty",
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
                          onClick={() => handleRemoveDeliveryRow(index)}
                          disabled={deliveryRows.length <= 1}
                          className={removeBtnClass(deliveryRows.length <= 1)}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td
                      colSpan={5}
                      className="p-1 text-right font-semibold dark:text-gray-200"
                    >
                      Total Delivery Qty
                    </td>
                    <td className="p-1 pl-2 font-semibold dark:text-gray-200">
                      {totalDeliveryQty.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td
                      colSpan={5}
                      className="p-1 text-right text-gray-500 dark:text-gray-400"
                    >
                      Total Planned Qty (Schedule Details)
                    </td>
                    <td className="p-1 pl-2 text-gray-500 dark:text-gray-400">
                      {totalPlannedQty.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
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

export default LCDeliveryScheduleForm;
