import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { financialYearAPI } from "../../../api/financialYearAPI";
import { useToast } from "../../Toast/ToastContext";

const UPPERCASE_FIELDS = ["financialYearCode"];

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

/**
 * Field
 * A single component for every input type used in this form.
 * type: "text" | "date" | "checkbox"
 */
const Field = ({
  label,
  name,
  value,
  checked,
  onChange,
  error,
  required,
  type = "text",
  className = "",
}) => {
  if (type === "checkbox") {
    return (
      <div className={`w-full ${className}`}>
        <label className={`${labelClasses} select-none opacity-0`}>-</label>

        <label
          className={`${controlClasses} flex items-center gap-1.5 cursor-pointer`}
        >
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-200">{label}</span>
        </label>
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

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const FinancialYearMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [selectedFY] = useState(data?.id || "");

  const [form, setForm] = useState({
    financialYearCode: data?.financialYearCode || "",
    // Convert financialYear to string to avoid trim() errors
    financialYear: data?.finYear ? String(data.finYear) : "",
    finYearId: data?.finYearId || "",
    fromDate: data?.startDate || "",
    toDate: data?.endDate || "",
    isCurrent: data?.isCurrent ?? false,
    // Convert active to boolean
    active: data?.active === true || data?.active === "true" || data?.active === "Active" ? true : false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : UPPERCASE_FIELDS.includes(name)
              ? value.toUpperCase()
              : value,
      };

      // Auto-fill the "YYYY-YYYY" label whenever fromDate/toDate change
      if (name === "fromDate" || name === "toDate") {
        const from = name === "fromDate" ? value : prev.fromDate;
        const to = name === "toDate" ? value : prev.toDate;
        const fromYear = from ? new Date(from).getFullYear() : "";
        const toYear = to ? new Date(to).getFullYear() : "";
        if (fromYear && toYear) {
          updated.financialYear = `${fromYear}-${toYear}`;
        }
      }

      return updated;
    });
  };

  const validate = () => {
    const errors = {};

    // FIX: Convert to string before using trim()
    if (!form.financialYear || String(form.financialYear).trim() === "")
      errors.financialYear = "Financial Year is required";

    if (!form.finYearId)
      errors.finYearId = "Financial Year ID is required";

    if (form.finYearId && form.finYearId.length > 10)
      errors.finYearId = "Financial Year ID must be maximum 10 characters";

    if (!form.fromDate) errors.fromDate = "From Date is required";

    if (!form.toDate) errors.toDate = "To Date is required";

    if (
      form.fromDate &&
      form.toDate &&
      new Date(form.toDate) <= new Date(form.fromDate)
    )
      errors.toDate = "To Date must be after From Date";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(selectedFY);
    const fromYear = form.fromDate ? new Date(form.fromDate).getFullYear() : 0;

    // Ensure active is sent as boolean
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      finYearId: String(form.finYearId),
      // CRITICAL FIX: Ensure active is strictly boolean
      active: form.active === true, // This will be true or false
      cancelRemarks: "",
      createdBy: localStorage.getItem("usersId") || "admin",
      endDate: form.toDate,
      finYear: new Date(form.fromDate).getFullYear(),
      orgId: Number(orgId),
      startDate: form.fromDate,
    };

    console.log("📤 Saving Financial Year Payload:", payload);
    console.log("Active value type:", typeof payload.active, "Value:", payload.active);

    try {
      const response =
        await financialYearAPI.createUpdateFinancialYear(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Financial Year updated successfully!"
            : "Financial Year created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Financial Year.",
        );
      }
    } catch (err) {
      console.error("Save Financial Year Error:", err);
      addToast(
        err.response?.data?.message ||
        err.response?.data?.statusMessage ||
        "Something went wrong.",
      );
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
          className="
            p-1 rounded-md
            text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            transition-colors
          "
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Financial Year" : "Add Financial Year"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Financial Year Details */}
        <div>
          <SectionHeader>Financial Year Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Financial Year"
              name="financialYear"
              value={form.financialYear}
              onChange={handleChange}
              error={fieldErrors.financialYear}
              required
            />

            <Field
              label="Financial Year ID"
              name="finYearId"
              value={form.finYearId}
              onChange={handleChange}
              error={fieldErrors.finYearId}
              required
            />

            <Field
              type="date"
              label="From Date"
              name="fromDate"
              value={form.fromDate}
              onChange={handleChange}
              error={fieldErrors.fromDate}
              required
            />

            <Field
              type="date"
              label="To Date"
              name="toDate"
              value={form.toDate}
              onChange={handleChange}
              error={fieldErrors.toDate}
              required
            />

            <Field
              type="checkbox"
              label="Active"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded text-xs
              border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-200
              bg-white dark:bg-gray-800
              hover:bg-gray-50 dark:hover:bg-gray-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-600 dark:hover:bg-blue-500
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialYearMasterForm;