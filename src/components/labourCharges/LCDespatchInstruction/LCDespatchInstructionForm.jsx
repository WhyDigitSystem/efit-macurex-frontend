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

// Party master - name fills automatically on selection
const PARTY_OPTIONS = [
  { value: "party_001", label: "PARTY001", name: "ABC Appliances" },
  { value: "party_002", label: "PARTY002", name: "Bosch Ltd" },
  { value: "party_003", label: "PARTY003", name: "XYZ Industries" },
];

// Schedule master - schedule date fills automatically on selection
const SCHEDULE_OPTIONS = [
  { value: "sch_001", label: "SCH001", date: "2026-11-01" },
  { value: "sch_002", label: "SCH002", date: "2026-11-05" },
  { value: "sch_003", label: "SCH003", date: "2026-11-10" },
];

const ITEM_OPTIONS = [
  {
    value: "item_001",
    label: "ITEM001",
    description: "Housing Cover - Coated",
    unit: "nos",
    plannedQty: "500",
    pendingQty: "320",
    availableQty: "400",
  },
  {
    value: "item_002",
    label: "ITEM002",
    description: "Bracket Assembly - Plated",
    unit: "nos",
    plannedQty: "1200",
    pendingQty: "900",
    availableQty: "1000",
  },
  {
    value: "item_003",
    label: "ITEM003",
    description: "Base Plate - Treated",
    unit: "nos",
    plannedQty: "300",
    pendingQty: "300",
    availableQty: "150",
  },
  {
    value: "item_004",
    label: "ITEM004",
    description: "Steel Sheet 1.2mm",
    unit: "kg",
    plannedQty: "800",
    pendingQty: "450",
    availableQty: "600",
  },
];

const LC_PO_OPTIONS = [
  { value: "lcpo_001", label: "LC001" },
  { value: "lcpo_002", label: "LC002" },
  { value: "lcpo_003", label: "LC003" },
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

const LOCATION_OPTIONS = [
  { value: "loc_001", label: "Location 001" },
  { value: "loc_002", label: "Location 002" },
  { value: "loc_003", label: "Location 003" },
];

const PACKAGE_TYPE_OPTIONS = [
  { value: "box", label: "Box" },
  { value: "bag", label: "Bag" },
  { value: "carton", label: "Carton" },
  { value: "pallet", label: "Pallet" },
];

const TRANSPORT_MODE_OPTIONS = [
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
  { value: "air", label: "Air" },
  { value: "sea", label: "Sea" },
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
  pdiNo: "",
  lcPoNo: "",
  rowDate: "",
  scheduleMonth: "",
  plannedQty: "",
  pendingQty: "",
  fromLocation: "",
  availableQty: "",
  despQty: "",
  noOfPackage: "",
  packageType: "",
});

const TABS = [
  { key: "despatchDetails", label: "1-LC Despatch details" },
  { key: "despatchBasic", label: "2-Despatch Basic" },
];

const LCDespatchInstructionForm = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState("despatchDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    diNo: data?.diNo || "",
    date: data?.date || "",
    partyId: data?.partyId || "",
    partyName: data?.partyName || "",
    scheduleNo: data?.scheduleNo || "",
    schDate: data?.schDate || "",
    paymentTerms: data?.paymentTerms || "",
    modeOfTransport: data?.modeOfTransport || "",
    deliveryInstructions: data?.deliveryInstructions || "",
    freight: data?.freight || "",
    insurance: data?.insurance || "",
    consignee: data?.consignee || "",
  });

  const [rows, setRows] = useState([emptyRow()]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Party selection fills name
      if (name === "partyId") {
        const party = PARTY_OPTIONS.find((p) => p.value === value);
        next.partyName = party?.name || "";
      }

      // Schedule selection fills schedule date
      if (name === "scheduleNo") {
        const sch = SCHEDULE_OPTIONS.find((s) => s.value === value);
        next.schDate = sch?.date || "";
      }

      return next;
    });
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    let row = { ...updatedRows[index], [field]: value };

    // Item selection fills description, unit and quantities
    if (field === "itemCode") {
      const item = ITEM_OPTIONS.find((i) => i.value === value);
      row = {
        ...row,
        itemDescription: item?.description || "",
        unit: item?.unit || "",
        plannedQty: item?.plannedQty || "",
        pendingQty: item?.pendingQty || "",
        availableQty: item?.availableQty || "",
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
    if (!form.plantId) errors.plantId = "Plant ID is required";
    if (!form.partyId) errors.partyId = "Party ID is required";
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
          ? "LC Despatch Instruction Updated Successfully!"
          : "LC Despatch Instruction Saved Successfully!",
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
            ? "Edit LC Despatch Instruction"
            : "Add LC Despatch Instruction"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Form Fields */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Plant Id"
            name="plantId"
            value={form.plantId}
            onChange={handleChange}
            error={fieldErrors.plantId}
            required
            options={PLANT_OPTIONS}
          />
          <Field
            label="DI No."
            name="diNo"
            value={form.diNo || "Auto"}
            onChange={handleChange}
            disabled
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
            label="Party Id"
            name="partyId"
            value={form.partyId}
            onChange={handleChange}
            error={fieldErrors.partyId}
            required
            options={PARTY_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />

          <Field
            label="Party Name"
            name="partyName"
            value={form.partyName}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Schdule No."
            name="scheduleNo"
            value={form.scheduleNo}
            onChange={handleChange}
            options={SCHEDULE_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <Field
            type="date"
            label="Sch. Date"
            name="schDate"
            value={form.schDate}
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

        {/* 1 - LC Despatch details */}
        {activeTab === "despatchDetails" && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                LC Despatch Details
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
              <table className="w-full text-xs min-w-[1900px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className={`${th} min-w-[130px]`}>Item Code *</th>
                    <th className={`${th} min-w-[200px]`}>Item Description</th>
                    <th className={`${th} min-w-[80px]`}>Unit</th>
                    <th className={`${th} min-w-[100px]`}>PDI No</th>
                    <th className={`${th} min-w-[110px]`}>LCPO No.</th>
                    <th className={`${th} min-w-[140px]`}>Date</th>
                    <th className={`${th} min-w-[120px]`}>Schedule Month</th>
                    <th className={`${th} min-w-[100px]`}>Planned Qty.</th>
                    <th className={`${th} min-w-[100px]`}>Pending Qty</th>
                    <th className={`${th} min-w-[130px]`}>From Location</th>
                    <th className={`${th} min-w-[100px]`}>Available Qty</th>
                    <th className={`${th} min-w-[100px]`}>Desp. Qty. *</th>
                    <th className={`${th} min-w-[110px]`}>NO.Of Package</th>
                    <th className={`${th} min-w-[120px]`}>Package Type</th>
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
                          type="text"
                          value={UNIT_LABELS[row.unit] || ""}
                          className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                          disabled
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={row.pdiNo}
                          onChange={(e) =>
                            handleRowChange(index, "pdiNo", e.target.value)
                          }
                          className={cellInput}
                          placeholder="PDI No"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.lcPoNo}
                          onChange={(e) =>
                            handleRowChange(index, "lcPoNo", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
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
                        <input
                          type="date"
                          value={row.rowDate}
                          onChange={(e) =>
                            handleRowChange(index, "rowDate", e.target.value)
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[130px]`}
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.scheduleMonth}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "scheduleMonth",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                        >
                          <option value="">Select</option>
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.plannedQty}
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
                        <select
                          value={row.fromLocation}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "fromLocation",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[120px]`}
                        >
                          <option value="">Select</option>
                          {LOCATION_OPTIONS.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.label}
                            </option>
                          ))}
                        </select>
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
                          value={row.despQty}
                          onChange={(e) =>
                            handleRowChange(index, "despQty", e.target.value)
                          }
                          className={cellInput}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={row.noOfPackage}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "noOfPackage",
                              e.target.value,
                            )
                          }
                          className={cellInput}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={row.packageType}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "packageType",
                              e.target.value,
                            )
                          }
                          className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                        >
                          <option value="">Select</option>
                          {PACKAGE_TYPE_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
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

        {/* 2 - Despatch Basic */}
        {activeTab === "despatchBasic" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Payment Terms"
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
                label="Delivery Instructions"
                name="deliveryInstructions"
                value={form.deliveryInstructions}
                onChange={handleChange}
                placeholder="Enter Delivery Instructions"
              />
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
                label="Insurance"
                name="insurance"
                type="number"
                step="0.01"
                value={form.insurance}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Field
                label="Consignee"
                name="consignee"
                value={form.consignee}
                onChange={handleChange}
                placeholder="Enter Consignee"
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

export default LCDespatchInstructionForm;
