import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
// import { masterAPI } from "../../../api/companyAPI";

const UPPERCASE_FIELDS = ["companyCode"];


const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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

        <label className={`${controlClasses} flex items-center gap-1.5 cursor-pointer`}>
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

      {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const CompanyMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));

  const [form, setForm] = useState({
    companyCode: data?.companyCode || "",
    companyName: data?.companyName || "",
    contactPerson: data?.contactPerson || "",
    email: data?.email || "",
    phone: data?.phone || "",
    city: data?.city || "",

    id: data?.id || "",
    active: data?.active ?? true,
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

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : UPPERCASE_FIELDS.includes(name)
          ? value.toUpperCase()
          : value,
    }));
  };

  const validate = () => {
    const errors = {};

    if (!form.companyCode.trim())
      errors.companyCode = "Company Code is required";

    if (!form.companyName.trim())
      errors.companyName = "Company Name is required";

    if (!form.contactPerson.trim())
      errors.contactPerson = "Contact Person is required";

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    )
      errors.email = "Enter a valid email address";

    if (form.phone && !/^\d{10}$/.test(form.phone.trim()))
      errors.phone = "Phone must be a valid 10 digit number";

    if (!form.city.trim())
      errors.city = "City is required";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      orgId,
      ...form,
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload);

    try {
      // await masterAPI.saveCompany(payload);

      alert(
        data
          ? "Company Updated Successfully!"
          : "Company Saved Successfully!"
      );

      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl ">
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
          {data ? "Edit Company" : "Add Company"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

        {/* Company Details */}
        <div>
          <SectionHeader>Company Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Company Code"
              name="companyCode"
              value={form.companyCode}
              onChange={handleChange}
              error={fieldErrors.companyCode}
              required
            />

            <Field
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              error={fieldErrors.companyName}
              required
              className="col-span-2"
            />

            <Field
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              error={fieldErrors.contactPerson}
              required
            />

            <Field
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
            />

            <Field
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              error={fieldErrors.city}
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

export default CompanyMasterForm;