import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
// import { masterAPI } from "../../../api/employeeAPI";

const UPPERCASE_FIELDS = ["employeeId"];


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
  options = [],
  className = "",
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select name={name} value={value} onChange={onChange} className={controlClasses}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }

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

const EmployeeMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));

  const [form, setForm] = useState({
    // Basic Details
    employeeId: data?.employeeId || "",
    salutation: data?.salutation || "Mr.",
    firstName: data?.firstName || "",
    lastName: data?.lastName || "",
    employeeName: data?.employeeName || "",

    // Personal Details
    aadharNo: data?.aadharNo || "",
    fatherName: data?.fatherName || "",
    dateOfBirth: data?.dateOfBirth || "",
    gender: data?.gender || "Male",
    maritalStatus: data?.maritalStatus || "Single",
    bloodGroup: data?.bloodGroup || "",

    // Employment Details
    employeeType: data?.employeeType || "Permanent",
    dateOfJoining: data?.dateOfJoining || "",
    department: data?.department || "",
    designation: data?.designation || "",
    payCategory: data?.payCategory || "Monthly",
    minimumWageCategory: data?.minimumWageCategory || "",
    dateOfLeaving: data?.dateOfLeaving || "",

    // Location Details
    country: data?.country || "India",
    ptState: data?.ptState || "",
    jobLocation: data?.jobLocation || "",

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

      // Keep employeeName in sync whenever first/last name changes
      if (name === "firstName" || name === "lastName") {
        updated.employeeName = `${
          name === "firstName" ? value : prev.firstName
        } ${name === "lastName" ? value : prev.lastName}`.trim();
      }

      return updated;
    });
  };

  const validate = () => {
    const errors = {};

    if (!form.employeeId.trim())
      errors.employeeId = "Employee ID is required";

    if (!form.firstName.trim())
      errors.firstName = "First Name is required";

    if (!form.lastName.trim())
      errors.lastName = "Last Name is required";

    if (form.aadharNo && !/^\d{12}$/.test(form.aadharNo.trim()))
      errors.aadharNo = "Aadhar No must be 12 digits";

    if (!form.dateOfJoining)
      errors.dateOfJoining = "Date of Joining is required";

    if (
      form.dateOfLeaving &&
      form.dateOfJoining &&
      new Date(form.dateOfLeaving) < new Date(form.dateOfJoining)
    )
      errors.dateOfLeaving = "Date of Leaving must be after Date of Joining";

    if (!form.department.trim())
      errors.department = "Department is required";

    if (!form.designation.trim())
      errors.designation = "Designation is required";

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
      // await masterAPI.saveEmployee(payload);

      alert(
        data
          ? "Employee Updated Successfully!"
          : "Employee Saved Successfully!"
      );

      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Employee.");
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
          {data ? "Edit Employee" : "Add Employee"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

        {/* Basic Details */}
        <div>
          <SectionHeader>Basic Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Employee ID"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              error={fieldErrors.employeeId}
              required
            />

            <Field
              type="select"
              label="Salutation"
              name="salutation"
              value={form.salutation}
              onChange={handleChange}
              options={[
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Ms.", label: "Ms." },
                { value: "Dr.", label: "Dr." },
              ]}
            />

            <Field
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              error={fieldErrors.firstName}
              required
            />

            <Field
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              error={fieldErrors.lastName}
              required
            />

            <Field
              label="Employee Name"
              name="employeeName"
              value={form.employeeName}
              onChange={handleChange}
              error={fieldErrors.employeeName}
              className="col-span-2"
            />
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <SectionHeader>Personal Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Aadhar No"
              name="aadharNo"
              value={form.aadharNo}
              onChange={handleChange}
              error={fieldErrors.aadharNo}
            />

            <Field
              label="Father Name"
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              error={fieldErrors.fatherName}
            />

            <Field
              type="date"
              label="Date of Birth"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              error={fieldErrors.dateOfBirth}
            />

            <Field
              type="select"
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />

            <Field
              type="select"
              label="Marital Status"
              name="maritalStatus"
              value={form.maritalStatus}
              onChange={handleChange}
              options={[
                { value: "Single", label: "Single" },
                { value: "Married", label: "Married" },
              ]}
            />

            <Field
              label="Blood Group"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              error={fieldErrors.bloodGroup}
            />
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <SectionHeader>Employment Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Employee Type"
              name="employeeType"
              value={form.employeeType}
              onChange={handleChange}
              options={[
                { value: "Permanent", label: "Permanent" },
                { value: "Contract", label: "Contract" },
                { value: "Probation", label: "Probation" },
                { value: "Intern", label: "Intern" },
              ]}
            />

            <Field
              type="date"
              label="Date of Joining"
              name="dateOfJoining"
              value={form.dateOfJoining}
              onChange={handleChange}
              error={fieldErrors.dateOfJoining}
              required
            />

            <Field
              type="date"
              label="Date of Leaving"
              name="dateOfLeaving"
              value={form.dateOfLeaving}
              onChange={handleChange}
              error={fieldErrors.dateOfLeaving}
            />

            <Field
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              error={fieldErrors.department}
              required
            />

            <Field
              label="Designation"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              error={fieldErrors.designation}
              required
            />

            <Field
              type="select"
              label="Pay Category"
              name="payCategory"
              value={form.payCategory}
              onChange={handleChange}
              options={[
                { value: "Monthly", label: "Monthly" },
                { value: "Daily", label: "Daily" },
                { value: "Weekly", label: "Weekly" },
              ]}
            />

            <Field
              label="Minimum Wage Category"
              name="minimumWageCategory"
              value={form.minimumWageCategory}
              onChange={handleChange}
              error={fieldErrors.minimumWageCategory}
            />
          </div>
        </div>

        {/* Location Details */}
        <div>
          <SectionHeader>Location Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              error={fieldErrors.country}
            />

            <Field
              label="PT State"
              name="ptState"
              value={form.ptState}
              onChange={handleChange}
              error={fieldErrors.ptState}
            />

            <Field
              label="Job Location"
              name="jobLocation"
              value={form.jobLocation}
              onChange={handleChange}
              error={fieldErrors.jobLocation}
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

export default EmployeeMasterForm;