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

const MACHINE_OPTIONS = [
  { value: "mc_001", label: "CNC Lathe 01" },
  { value: "mc_002", label: "Press 100T" },
  { value: "mc_003", label: "VMC 02" },
  { value: "mc_004", label: "Powder Coating Line" },
];

const LOCATION_OPTIONS = [
  { value: "loc_001", label: "Location 001" },
  { value: "loc_002", label: "Location 002" },
  { value: "loc_003", label: "Location 003" },
];

const APPROVED_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const num = (v) => parseFloat(v) || 0;
const fmt = (v) => v.toFixed(2);

// All calculated values live here so the formulas are easy to adjust.
const calculate = (f) => {
  const operatingHoursPerAnnum =
    num(f.operatingHoursPerDay) * num(f.noOfWorkingDays);
  const life = num(f.assetLife);

  // Depreciation: replacement cost spread over the asset life
  const imputedDepreciation = life > 0 ? num(f.replacementCost) / life : 0;
  // Interest, insurance and maintenance: percentage of the machine's purchase cost, per annum
  const imputedInterestAmount =
    (num(f.costOfPurchase) * num(f.imputedInterestPct)) / 100;
  const insuranceCost = (num(f.costOfPurchase) * num(f.insuranceRatePct)) / 100;
  const imputedMaintenanceCostPerAnnum =
    (num(f.costOfPurchase) * num(f.imputedMaintenancePct)) / 100;

  // Energy: power consumption (KW/H) x cost of energy per hour = cost per operating hour
  const imputedEnergyCostPerHour =
    num(f.powerConsumption) * num(f.costOfEnergyPerHour);
  const imputedEnergyCostPerAnnum =
    imputedEnergyCostPerHour * operatingHoursPerAnnum;

  const machineCostPerAnnum =
    imputedDepreciation +
    imputedInterestAmount +
    insuranceCost +
    imputedMaintenanceCostPerAnnum +
    imputedEnergyCostPerAnnum +
    num(f.imputedCostOfRoom);

  const machineHourRate =
    operatingHoursPerAnnum > 0
      ? machineCostPerAnnum / operatingHoursPerAnnum
      : 0;
  const imputedSurchargeRate =
    (machineHourRate * num(f.imputedSurchargePct)) / 100;
  const machineHourRateWithSurcharge = machineHourRate + imputedSurchargeRate;

  return {
    operatingHoursPerAnnum,
    imputedDepreciation,
    imputedInterestAmount,
    insuranceCost,
    imputedMaintenanceCostPerAnnum,
    imputedEnergyCostPerHour,
    imputedEnergyCostPerAnnum,
    machineCostPerAnnum,
    machineHourRate,
    imputedSurchargeRate,
    machineHourRateWithSurcharge,
  };
};

const MachineHourRateMasterForm = ({ data, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    plantId: data?.plantId || "",
    mcCostId: data?.mcCostId || "",
    machineName: data?.machineName || "",
    date: data?.date || "",
    machineLocation: data?.machineLocation || "",
    costOfPurchase: data?.costOfPurchase || "",
    assetLife: data?.assetLife || "",
    replacementCost: data?.replacementCost || "",
    imputedInterestPct: data?.imputedInterestPct || "",
    powerConsumption: data?.powerConsumption || "",
    imputedCostOfRoom: data?.imputedCostOfRoom || "",
    operatingHoursPerDay: data?.operatingHoursPerDay || "",
    noOfWorkingDays: data?.noOfWorkingDays || "",
    imputedMaintenancePct: data?.imputedMaintenancePct || "",
    costOfEnergyPerHour: data?.costOfEnergyPerHour || "",
    insuranceRatePct: data?.insuranceRatePct || "",
    machineOccupiedArea: data?.machineOccupiedArea || "",
    costOfGeneralMc: data?.costOfGeneralMc || "",
    imputedSurchargePct: data?.imputedSurchargePct || "",
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

  const calc = calculate(form);

  const validate = () => {
    const errors = {};
    if (!form.plantId) errors.plantId = "Plant Id is required";
    if (!form.machineName) errors.machineName = "Machine Name is required";
    if (num(form.operatingHoursPerDay) > 24)
      errors.operatingHoursPerDay = "Cannot exceed 24 hours";
    if (form.assetLife !== "" && num(form.assetLife) <= 0)
      errors.assetLife = "Must be greater than 0";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...form,
      ...Object.fromEntries(Object.entries(calc).map(([k, v]) => [k, fmt(v)])),
    };
    console.log("Saving payload:", payload);

    setTimeout(() => {
      alert(
        data
          ? "Machine Hour Rate Master Updated Successfully!"
          : "Machine Hour Rate Master Saved Successfully!",
      );
      setIsSubmitting(false);
      onBack();
    }, 1000);
  };

  const noop = () => {};

  // Helpers to keep the grid readable
  const input = (label, name, extra = {}) => (
    <Field
      label={label}
      name={name}
      type="number"
      step="0.01"
      min="0"
      value={form[name]}
      onChange={handleChange}
      error={fieldErrors[name]}
      placeholder="0.00"
      {...extra}
    />
  );
  const derived = (label, value) => (
    <Field
      label={label}
      name={label}
      value={fmt(value)}
      onChange={noop}
      disabled
    />
  );

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
            ? "Edit Machine Hour Rate Master"
            : "Add Machine Hour Rate Master"}
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
            label="M/C Cost Id"
            name="mcCostId"
            value={form.mcCostId || "Auto"}
            onChange={handleChange}
            disabled
          />
          <Field
            type="select"
            label="Machine Name"
            name="machineName"
            value={form.machineName}
            onChange={handleChange}
            error={fieldErrors.machineName}
            required
            options={MACHINE_OPTIONS}
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
            label="Machine Location"
            name="machineLocation"
            value={form.machineLocation}
            onChange={handleChange}
            options={LOCATION_OPTIONS}
          />
          {input("Machine Occupied Area(Sq/Ft)", "machineOccupiedArea")}
          {input("Cost of Purchase for Machine", "costOfPurchase")}
          {input("Replacement Cost For Machine", "replacementCost")}

          {input("Asset Depreciation Range In Year(Life Cycle)", "assetLife", {
            step: "1",
          })}
          {input("Imputed Interest%", "imputedInterestPct")}
          {input("Insurance Rate%", "insuranceRatePct")}
          {input("Imputed Maintenance Cost %", "imputedMaintenancePct")}

          {input("Imputed Cost of Room/Depreciation For", "imputedCostOfRoom")}
          {input("Cost of General M/C", "costOfGeneralMc")}
          {input("Operating Hours/Day", "operatingHoursPerDay")}
          {input("No. of Working Days", "noOfWorkingDays", { step: "1" })}

          {derived(
            "Assuming Operating Hours/Annum",
            calc.operatingHoursPerAnnum,
          )}
          {input("Power Consumption(KW/H)", "powerConsumption")}
          {input("Cost of Energy Per Hour", "costOfEnergyPerHour")}
          {derived("Imputed Energy Costs/Hour", calc.imputedEnergyCostPerHour)}

          {derived("Imputed Depreciation", calc.imputedDepreciation)}
          {derived("Imputed Interest Amount", calc.imputedInterestAmount)}
          {derived("Insurance Cost", calc.insuranceCost)}
          {derived(
            "Imputed Maintenance Cost Per Annum",
            calc.imputedMaintenanceCostPerAnnum,
          )}

          {derived(
            "Imputed Energy Cost Per Annum",
            calc.imputedEnergyCostPerAnnum,
          )}
          {derived("Machine Cost Per Annum", calc.machineCostPerAnnum)}
          {derived("Machine Hour Rate", calc.machineHourRate)}
          {input("Imputed Surcharge %", "imputedSurchargePct")}

          {derived("Imputed Surcharge Rate", calc.imputedSurchargeRate)}
          {derived(
            "Machine Hour Rate Including Surcharge",
            calc.machineHourRateWithSurcharge,
          )}
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

export default MachineHourRateMasterForm;
