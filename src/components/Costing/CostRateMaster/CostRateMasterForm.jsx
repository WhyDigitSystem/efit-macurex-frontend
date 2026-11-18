import React, { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

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
  className = "",
  placeholder = "",
  disabled = false,
  step,
  min,
}) => (
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
      min={min}
    />
    {error && (
      <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
        {error}
      </p>
    )}
  </div>
);

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

// All numeric rate fields, rendered in this order
const RATE_FIELDS = [
  { name: "adminOverHead", label: "Admin Over Head" },
  { name: "buildingDepreciationRate", label: "Building Depreciation Rate" },
  { name: "commissionPercentage", label: "Commission Percentage" },
  { name: "costOfEnergyPerHour", label: "Cost of Energy/Hour" },
  {
    name: "directSpecialManufacturingCost",
    label: "Direct Special Manufacturing Cost",
  },
  { name: "consumablesCost", label: "Consumables Cost" },
  { name: "distributionOverHead", label: "Distribution Over Head" },
  { name: "handlingCharges", label: "Handling Charges" },
  { name: "imputedInterest", label: "Imputed Interest" },
  { name: "imputedMaintenanceCost", label: "Imputed Maintenance Cost" },
  { name: "imputedSurcharge", label: "Imputed Surcharge" },
  { name: "indirectProductionCost", label: "Indirect Production Cost" },
  { name: "insuranceRate", label: "Insurance Rate" },
];

const CostRateMasterForm = ({ data, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    costDescription: data?.costDescription || "",
    docId: data?.docId || "",
    date: data?.date || "",
    ...Object.fromEntries(
      RATE_FIELDS.map((f) => [f.name, data?.[f.name] || ""]),
    ),
  });

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

  const validate = () => {
    const errors = {};
    if (!form.costDescription.trim())
      errors.costDescription = "Cost Description is required";
    RATE_FIELDS.forEach((f) => {
      if (form[f.name] !== "" && parseFloat(form[f.name]) < 0) {
        errors[f.name] = "Value cannot be negative";
      }
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = { ...form };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "Cost Rate Master Updated Successfully!"
          : "Cost Rate Master Saved Successfully!",
      );
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
          {data ? "Edit Cost Rate Master" : "Add Cost Rate Master"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Form Fields */}
        <div className={fieldGrid}>
          <Field
            label="Cost Description"
            name="costDescription"
            value={form.costDescription}
            onChange={handleChange}
            error={fieldErrors.costDescription}
            required
            placeholder="Enter Cost Description"
          />
          <Field
            label="DocId"
            name="docId"
            value={form.docId || "Auto"}
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

          {RATE_FIELDS.map((f) => (
            <Field
              key={f.name}
              type="number"
              label={f.label}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              error={fieldErrors[f.name]}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          ))}
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

export default CostRateMasterForm;
