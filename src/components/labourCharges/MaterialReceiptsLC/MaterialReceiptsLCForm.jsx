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
  { value: "stores", label: "Stores" },
  { value: "purchase", label: "Purchase" },
  { value: "production", label: "Production" },
  { value: "quality", label: "Quality" },
];

const GATE_PASS_OPTIONS = [
  { value: "gp_001", label: "GP001" },
  { value: "gp_002", label: "GP002" },
  { value: "gp_003", label: "GP003" },
];

const LOCATION_OPTIONS = [
  { value: "loc_001", label: "Location 001" },
  { value: "loc_002", label: "Location 002" },
  { value: "loc_003", label: "Location 003" },
];

// Customer master - name fills automatically on selection
const CUSTOMER_OPTIONS = [
  { value: "cust_001", label: "CUST001", name: "ABC Appliances" },
  { value: "cust_002", label: "CUST002", name: "Bosch Ltd" },
  { value: "cust_003", label: "CUST003", name: "XYZ Industries" },
];

const ITEM_CODE_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Steel Sheet 1.2mm",
    hsn: "7209",
    primaryUnit: "kg",
    unit: "kg",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Aluminium Strip",
    hsn: "7606",
    primaryUnit: "kg",
    unit: "kg",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Copper Wire",
    hsn: "7408",
    primaryUnit: "mtr",
    unit: "mtr",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Fastener Set",
    hsn: "7318",
    primaryUnit: "nos",
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

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  incomingItemCode: "",
  incomingItemDescription: "",
  hsnSacCode: "",
  tolerance: "",
  primaryUnit: "",
  unit: "",
  orderQty: "",
  gatePassQty: "",
  receivedQty: "",
});

const TABS = [
  { key: "materialDetails", label: "1-Material Details" },
  { key: "materialSummary", label: "2-Material Summary" },
];

const MaterialReceiptsLCForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("materialDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    lcGrnNo: data?.lcGrnNo || "",
    belongsTo: data?.belongsTo || "",
    lcGrnDate: data?.lcGrnDate || "",
    department: data?.department || "",
    time: data?.time || "",
    gatePassNo: data?.gatePassNo || "",
    scheduleNo: data?.scheduleNo || "",
    locationId: data?.locationId || "",
    customerName: data?.customerName || "",
    customerId: data?.customerId || "",
    challanNo: data?.challanNo || "",
    challanDate: data?.challanDate || "",
    remarks: data?.remarks || "",
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
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    // Item selection fills description, HSN/SAC and units
    if (field === "incomingItemCode") {
      const item = ITEM_CODE_OPTIONS.find((i) => i.value === value);
      updatedRows[index].incomingItemDescription = item?.description || "";
      updatedRows[index].hsnSacCode = item?.hsn || "";
      updatedRows[index].primaryUnit = item?.primaryUnit || "";
      updatedRows[index].unit = item?.unit || "";
    }

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

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = { ...form, rows };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "Material Receipt - LC Updated Successfully!"
          : "Material Receipt - LC Saved Successfully!",
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
          {data ? "Edit Material Receipts - LC" : "Add Material Receipts - LC"}
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
            label="LC GRN No"
            name="lcGrnNo"
            value={form.lcGrnNo || "Auto"}
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
            label="LC GRN Date"
            name="lcGrnDate"
            value={form.lcGrnDate}
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
            type="time"
            label="Time"
            name="time"
            value={form.time}
            onChange={handleChange}
          />
          <Field
            type="select"
            label="Gate Pass No"
            name="gatePassNo"
            value={form.gatePassNo}
            onChange={handleChange}
            options={GATE_PASS_OPTIONS}
          />
          <Field
            label="Schedule No."
            name="scheduleNo"
            value={form.scheduleNo}
            onChange={handleChange}
            placeholder="Enter Schedule No."
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
            label="Challan No"
            name="challanNo"
            value={form.challanNo}
            onChange={handleChange}
            placeholder="Enter Challan No"
          />

          <Field
            type="date"
            label="Challan Date"
            name="challanDate"
            value={form.challanDate}
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

        {/* 1 - Material Details */}
        {activeTab === "materialDetails" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Material Details
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
                      HSN/SAC CODE
                    </th>
                    <th className="p-1 text-left min-w-[90px] dark:text-gray-200">
                      Tolerance
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Primary Unit
                    </th>
                    <th className="p-1 text-left min-w-[90px] dark:text-gray-200">
                      Unit
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Order Qty
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Gate Pass Qty
                    </th>
                    <th className="p-1 text-left min-w-[100px] dark:text-gray-200">
                      Received Qty *
                    </th>
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
                          value={row.incomingItemCode}
                          onChange={(e) =>
                            handleRowChange(
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
                          className={`${controlClasses} h-8 text-xs w-full min-w-[170px]`}
                          placeholder="Description"
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
                        <input
                          type="number"
                          value={row.tolerance}
                          onChange={(e) =>
                            handleRowChange(index, "tolerance", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={
                            row.primaryUnit ? row.primaryUnit.toUpperCase() : ""
                          }
                          className={cellInput}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.unit}
                          onChange={(e) =>
                            handleRowChange(index, "unit", e.target.value)
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
                          value={row.orderQty}
                          onChange={(e) =>
                            handleRowChange(index, "orderQty", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.gatePassQty}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "gatePassQty",
                              e.target.value,
                            )
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.receivedQty}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "receivedQty",
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

        {/* 2 - Material Summary */}
        {activeTab === "materialSummary" && (
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

export default MaterialReceiptsLCForm;
