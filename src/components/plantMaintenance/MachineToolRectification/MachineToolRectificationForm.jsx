import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to other Maintenance/Quality forms         */

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

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  disabled,
  className = "",
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
          disabled={disabled}
          className={controlClasses}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
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

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

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
        disabled={disabled}
        className={controlClasses}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

/* Config-driven field grid - array of {name,label,type,options,...} descriptors
   rendered against a values/onChange pair. */
const FieldsGrid = ({
  fields,
  values,
  onChange,
  errors,
  gridClassName = fieldGrid,
}) => (
  <div className={gridClassName}>
    {fields.map((f) => (
      <Field
        key={f.name}
        type={f.type || "text"}
        label={f.label}
        name={f.name}
        value={f.auto ? values[f.name] || "Auto" : values[f.name]}
        onChange={onChange}
        options={f.options}
        disabled={f.disabled || f.auto}
        required={f.required}
        error={errors?.[f.name]}
        className={f.className}
      />
    ))}
  </div>
);

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const DEPARTMENTS = [
  "PURCHASE",
  "PRODUCTION",
  "QUALITY",
  "STORES",
  "MAINTENANCE",
];
const MAINTENANCE_TYPES = [
  "PREVENTIVE",
  "BREAKDOWN",
  "PREDICTIVE",
  "CORRECTIVE",
];
const LOCATIONS = ["MAIN STORE", "WIP LOCATION", "FG STORE", "WAREHOUSE 1"];

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------------------- */
/* Header fields - this screen has no child tabs/tables, just the flat form    */

const HEADER_FIELDS = [
  {
    name: "plant",
    label: "Plant ID",
    type: "select",
    options: PLANT_IDS,
    required: true,
  },
  { name: "docNo", label: "Doc No." },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: DEPARTMENTS,
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    default: todayISO(),
    required: true,
  },
  { name: "breakdownNo", label: "Breakdown No." },
  { name: "breakdownDate", label: "Breakdown Date", type: "date" },
  { name: "attendBy", label: "Attend by" },
  { name: "time", label: "Time", type: "time" },
  { name: "rectifiedOn", label: "Rectified On", type: "date" },
  { name: "machineToolNo", label: "Machine No. / Tool No." },
  { name: "rectificationTime", label: "Rectification Time", type: "time" },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "cause",
    label: "Cause",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "maintenanceType",
    label: "Maintenance Type",
    type: "select",
    options: MAINTENANCE_TYPES,
  },
  {
    name: "actionTaken",
    label: "Action Taken",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "natureOfProblem",
    label: "Nature of Problem",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  { name: "carriedOutBy", label: "Carried Out By" },
  { name: "timeTakenForRectification", label: "Time Taken for Rectification" },
  { name: "sparesUsed", label: "Spares Used" },
  { name: "location", label: "Location", type: "select", options: LOCATIONS },
  { name: "preparedBy", label: "Prepared By" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  { name: "approvedBy", label: "Approved By" },
];

/* ---------------------------------------------------------------------------- */

const MachineToolRectificationForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant ID is required";
    if (!header.date) errors.date = "Date is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(editData?.id && { id: editData.id }),
      header,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Machine/Tool Rectification Payload:", payload);

    try {
      const response =
        await machineToolRectificationAPI.updateCreateMachineToolRectification(
          payload,
        );
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save machine/tool rectification";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Machine/Tool Rectification.");
    } finally {
      setIsSubmitting(false);
    }
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
          {editData
            ? "Edit Machine/Tool Rectification"
            : "Machine/Tool Rectification"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Rectification Details</SectionHeader>
          <FieldsGrid
            fields={HEADER_FIELDS}
            values={header}
            onChange={handleHeaderChange}
            errors={fieldErrors}
          />
        </div>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default MachineToolRectificationForm;
