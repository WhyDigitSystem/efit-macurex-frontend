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
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
  step,
  min,
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
        min={min}
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

const LOCATION_OPTIONS = [
  { value: "loc_001", label: "Location 001" },
  { value: "loc_002", label: "Location 002" },
  { value: "loc_003", label: "Location 003" },
  { value: "loc_004", label: "Location 004" },
];

const APPROVED_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const num = (v) => parseFloat(v) || 0;

const LocationCostMasterForm = ({ data, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    locationCostId: data?.locationCostId || "",
    date: data?.date || "",
    location: data?.location || "",
    totalBuildingCost: data?.totalBuildingCost || "",
    depreciationRate: data?.depreciationRate || "",
    totalBuildingArea: data?.totalBuildingArea || "",
    totalAreaForLocation: data?.totalAreaForLocation || "",
    noOfMachines: data?.noOfMachines || "",
    approved: data?.approved || "",
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

  // Derived values
  // Depreciation for the whole building per annum = building cost x rate %
  const depreciationForBuilding =
    (num(form.totalBuildingCost) * num(form.depreciationRate)) / 100;
  // Location share = building depreciation spread over the building area, for this location's area
  const buildingArea = num(form.totalBuildingArea);
  const totalDepreciationForLocation =
    buildingArea > 0
      ? (depreciationForBuilding / buildingArea) *
        num(form.totalAreaForLocation)
      : 0;

  const validate = () => {
    const errors = {};
    if (!form.plantId) errors.plantId = "Plant Id is required";
    if (!form.location) errors.location = "Location is required";
    if (!form.totalAreaForLocation)
      errors.totalAreaForLocation = "Total Area is required";
    else if (
      buildingArea > 0 &&
      num(form.totalAreaForLocation) > buildingArea
    ) {
      errors.totalAreaForLocation = "Cannot exceed Total Building Area";
    }
    if (form.depreciationRate !== "" && num(form.depreciationRate) > 100) {
      errors.depreciationRate = "Rate cannot exceed 100%";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      depreciationForBuilding: depreciationForBuilding.toFixed(2),
      totalDepreciationForLocation: totalDepreciationForLocation.toFixed(2),
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "Location Cost Master Updated Successfully!"
          : "Location Cost Master Saved Successfully!",
      );
      setIsSubmitting(false);
      onBack();
    }, 1000);
  };

  const noop = () => {};

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
          {data ? "Edit Location Cost Master" : "Add Location Cost Master"}
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
            label="Location Cost Id"
            name="locationCostId"
            value={form.locationCostId || "Auto"}
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
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            error={fieldErrors.location}
            required
            options={LOCATION_OPTIONS}
          />

          <Field
            label="Total Building Cost"
            name="totalBuildingCost"
            type="number"
            step="0.01"
            min="0"
            value={form.totalBuildingCost}
            onChange={handleChange}
            placeholder="0.00"
          />
          <Field
            label="Depreciation Rate%"
            name="depreciationRate"
            type="number"
            step="0.01"
            min="0"
            value={form.depreciationRate}
            onChange={handleChange}
            error={fieldErrors.depreciationRate}
            placeholder="0.00"
          />
          <Field
            label="Depreciation For Total Building/Annum"
            name="depreciationForBuilding"
            value={depreciationForBuilding.toFixed(2)}
            onChange={noop}
            disabled
          />
          <Field
            label="Total Building Area"
            name="totalBuildingArea"
            type="number"
            step="0.01"
            min="0"
            value={form.totalBuildingArea}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Field
            label="Total Area For Location (Sq/Ft)"
            name="totalAreaForLocation"
            type="number"
            step="0.01"
            min="0"
            value={form.totalAreaForLocation}
            onChange={handleChange}
            error={fieldErrors.totalAreaForLocation}
            required
            placeholder="0.00"
          />
          <Field
            label="Total Depreciation For Location/Annum"
            name="totalDepreciationForLocation"
            value={totalDepreciationForLocation.toFixed(2)}
            onChange={noop}
            disabled
          />
          <Field
            label="No.of Machine In Location"
            name="noOfMachines"
            type="number"
            step="1"
            min="0"
            value={form.noOfMachines}
            onChange={handleChange}
            placeholder="0"
          />
          <Field
            type="select"
            label="Approved"
            name="approved"
            value={form.approved}
            onChange={handleChange}
            options={APPROVED_OPTIONS}
          />
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

export default LocationCostMasterForm;
