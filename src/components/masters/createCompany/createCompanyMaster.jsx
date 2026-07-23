// CreateCompanyForm.jsx
import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Info, Lock, ChevronDown } from "lucide-react";
import { companyAPI } from "../../../api/newEntry";
import { encryptPassword } from "../../../utils/PasswordEnc";
import { useToast } from "../../Toast/ToastContext";

const INDUSTRY_OPTIONS = [
  "Information Technology",
  "Manufacturing",
  "Retail",
  "Healthcare",
  "Finance & Banking",
  "Education",
  "Construction",
  "Logistics",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const PLAN_OPTIONS = ["Free", "Starter", "Professional", "Enterprise"];

const CreateCompanyForm = ({ editData, onBack }) => {
  const [editingId, setEditingId] = useState(editData?.id || null);
  const [loading, setLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [loginUserName] = useState(localStorage.getItem("userName"));
  const { addToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Which of step 2 / step 3 is currently shown
  const [activeStep, setActiveStep] = useState(2);

  const [formData, setFormData] = useState({
    // Company Information
    companyName: "",
    companyCode: "",
    companyEmail: "",
    industryType: "",
    companySize: "",

    // Subscription Details
    selectPlan: "",
    trialPeriodDays: "30",
    maxUsers: "10",
    status: "Active",

    // Admin Account
    adminName: "",
    adminEmail: "",
    adminMobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData((prev) => ({
        ...prev,
        companyCode: editData.companyCode || "",
        companyName: editData.companyName || "",
        adminName: editData.employeeName || "",
        adminEmail: editData.email || "",
        status:
          editData.active === "Active" || editData.active === true
            ? "Active"
            : "Inactive",
      }));
    }
  }, [editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset city if state changes
      if (name === "state") next.city = "";
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const setStatus = (status) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  // Fields that belong to each step, used to decide which tab to jump to on error
  const step2Fields = ["selectPlan", "trialPeriodDays", "maxUsers"];
  const step3Fields = [
    "adminName",
    "adminEmail",
    "adminMobileNumber",
    "password",
    "confirmPassword",
  ];
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z ]*$/;

    if (!formData.companyName) {
      newErrors.companyName = "Company Name is required";
    } else if (formData.companyName.length < 3) {
      newErrors.companyName = "Minimum length is 3 characters";
    } else if (formData.companyName.length > 50) {
      newErrors.companyName = "Maximum length is 50 characters";
    }

    if (!formData.companyEmail) {
      newErrors.companyEmail = "Company Email is required";
    } else if (!emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = "Invalid email format";
    }

    if (!formData.industryType)
      newErrors.industryType = "Industry Type is required";
    if (!formData.companySize)
      newErrors.companySize = "Company Size is required";

    if (!formData.selectPlan) newErrors.selectPlan = "Please select a plan";

    if (!formData.adminName) {
      newErrors.adminName = "Admin Name is required";
    } else if (formData.adminName.length < 3) {
      newErrors.adminName = "Minimum length is 3 characters";
    } else if (!nameRegex.test(formData.adminName)) {
      newErrors.adminName = "Only alphabetic characters allowed";
    }

    if (!formData.adminEmail) {
      newErrors.adminEmail = "Admin Email is required";
    } else if (!emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }

    if (!formData.adminMobileNumber) {
      newErrors.adminMobileNumber = "Mobile Number is required";
    } else if (!/^[0-9]{10}$/.test(formData.adminMobileNumber)) {
      newErrors.adminMobileNumber = "Enter a valid 10-digit mobile number";
    }

    if (!editingId) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Minimum length is 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm the password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);

    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      if (step3Fields.includes(firstErrorKey)) setActiveStep(3);
      else if (step2Fields.includes(firstErrorKey)) setActiveStep(2);
    }

    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        ...(editingId && { id: editingId }),

        companyName: formData.companyName,
        companyCode: formData.companyCode,
        companyEmail: formData.companyEmail,
        industryType: formData.industryType,
        companySize: formData.companySize,

        selectPlan: formData.selectPlan,
        trialPeriod: Number(formData.trialPeriodDays),
        maxUsers: Number(formData.maxUsers),
        active: formData.status === "Active",

        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminMobileNo: formData.adminMobileNumber,

        password: encryptPassword(formData.password),
        conformPassword: encryptPassword(formData.confirmPassword),
      };

      const response = editingId
        ? await companyAPI.updateCompany(payload)
        : await companyAPI.createCompany(payload);

      if (response?.status) {
        addToast(
          editingId
            ? "Company updated successfully!"
            : "Company created successfully!",
        );
        onBack();
      } else {
        const msg =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          "Failed to save company";
        addToast(msg);
      }
    } catch (err) {
      console.error("Error saving company:", err);
      addToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => onBack();

  // ---------- shared field styles (uses your project's light/dark theme) ----------
  const label =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const req = <span className="text-red-500">*</span>;
  const inputBase =
    "w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white " +
    "placeholder-gray-400 dark:placeholder-gray-500 text-sm border focus:outline-none focus:ring-2 transition-colors";
  const inputOk = "border-gray-300 dark:border-gray-600 focus:ring-blue-500";
  const inputErr = "border-red-500 focus:ring-red-500";
  const errMsg = (key) =>
    errors[key] ? (
      <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
    ) : null;
  const cls = (key) => `${inputBase} ${errors[key] ? inputErr : inputOk}`;

  const SectionHeader = ({ num, title }) => (
    <div className="flex items-center gap-3 mb-6">
      <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white text-xs font-semibold">
        {num}
      </span>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
  );

  const Select = ({ name, value, onChange, options, placeholder }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${cls(name)} appearance-none pr-9 ${!value ? "text-gray-400 dark:text-gray-500" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt}
            value={opt}
            className="text-gray-900 dark:text-white"
          >
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  const stepErrorCount = (fields) => fields.filter((f) => errors[f]).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingId ? "Edit Company" : "Create Company"}
          </h2>
          <span className="text-xs text-orange-500 dark:text-orange-400">
            • {editingId ? "Editing" : "New Entry"}
          </span>
        </div>
        <button
          onClick={handleCancel}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Company Information */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <SectionHeader num={1} title="Company Information" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-1.5">
            {/* Company Name */}
            <div>
              <label className={`${label} mb-1 text-xs`}>
                Company Name {req}
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className={`${cls("companyName")} h-8 px-2 text-sm rounded-md`}
              />
              {errMsg("companyName")}
            </div>

            {/* Company Code */}
            <div>
              <label className={`${label} mb-1 text-xs`}>Company Code</label>
              <input
                type="text"
                name="companyCode"
                value={formData.companyCode}
                onChange={handleInputChange}
                placeholder="Enter company code"
                className={`${cls("companyName")} h-8 px-2 text-sm rounded-md`}
              />
            </div>

            {/* Company Email */}
            <div>
              <label className={`${label} mb-1 text-xs`}>
                Company Email {req}
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleInputChange}
                placeholder="Enter company email"
                className={`${cls("companyEmail")} h-8 px-2 text-sm rounded-md`}
              />
              {errMsg("companyEmail")}
            </div>

            {/* Industry Type */}
            <div>
              <label className={`${label} mb-1 text-xs`}>
                Industry Type {req}
              </label>
              <Select
                name="industryType"
                value={formData.industryType}
                onChange={handleInputChange}
                options={INDUSTRY_OPTIONS}
                placeholder="Select industry"
                className="h-8 text-sm"
              />
              {errMsg("industryType")}
            </div>

            {/* Company Size */}
            <div>
              <label className={`${label} mb-1 text-xs`}>
                Company Size {req}
              </label>
              <Select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                options={COMPANY_SIZE_OPTIONS}
                placeholder="Select company size"
                className="h-8 text-sm"
              />
              {errMsg("companySize")}
            </div>
          </div>
        </div>

        <div className="px-4 pt-2 flex items-center gap-6 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
              activeStep === 2
                ? "border-blue-600"
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold ${
                activeStep === 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-semibold ${
                activeStep === 2
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Subscription Details
            </span>
            {stepErrorCount(step2Fields) > 0 && (
              <span className="text-[11px] text-red-500">
                ({stepErrorCount(step2Fields)})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${
              activeStep === 3
                ? "border-blue-600"
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold ${
                activeStep === 3
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
              }`}
            >
              3
            </span>
            <span
              className={`text-xs font-semibold ${
                activeStep === 3
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Admin Account
            </span>
            {stepErrorCount(step3Fields) > 0 && (
              <span className="text-[11px] text-red-500">
                ({stepErrorCount(step3Fields)})
              </span>
            )}
          </button>
        </div>

        {/* Step 2 body: Subscription Details */}
        {activeStep === 2 && (
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Select Plan */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Select Plan {req}
                </label>
                <Select
                  name="selectPlan"
                  value={formData.selectPlan}
                  onChange={handleInputChange}
                  options={PLAN_OPTIONS}
                  placeholder="Select plan"
                  className="h-8 text-sm"
                />
                {errMsg("selectPlan")}
              </div>

              {/* Trial Period */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Trial Period (Days) {req}
                </label>
                <input
                  type="number"
                  min="0"
                  name="trialPeriodDays"
                  value={formData.trialPeriodDays}
                  onChange={handleInputChange}
                  className={`${cls("trialPeriodDays")} h-8 px-2 text-sm`}
                />
                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  Set 0 for no trial period
                </p>
              </div>

              {/* Max Users */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Max Users {req}
                </label>
                <input
                  type="number"
                  min="1"
                  name="maxUsers"
                  value={formData.maxUsers}
                  onChange={handleInputChange}
                  className={`${cls("maxUsers")} h-8 px-2 text-sm`}
                />
                <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  Maximum number of users
                </p>
              </div>

              {/* Status */}
              <div>
                <label className={`${label} mb-1 text-xs`}>Status {req}</label>

                <div className="flex h-8 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => setStatus("Active")}
                    className={`flex-1 text-[11px] font-medium transition-colors ${
                      formData.status === "Active"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    Active
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Inactive")}
                    className={`flex-1 text-[11px] font-medium transition-colors ${
                      formData.status === "Inactive"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-2 flex items-start gap-2 rounded-md border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                You can change subscription details later from company settings.
              </p>
            </div>

            {/* Next Button */}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-blue-700"
              >
                Next: Admin Account →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 body: Admin Account */}
        {activeStep === 3 && (
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Admin Name */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Admin Name {req}
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  placeholder="Enter admin full name"
                  className={`${cls("adminName")} h-8 px-2 text-sm`}
                />
                {errMsg("adminName")}
              </div>

              {/* Admin Email */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Admin Email {req}
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  placeholder="Enter admin email"
                  className={`${cls("adminEmail")} h-8 px-2 text-sm`}
                />
                {errMsg("adminEmail")}
              </div>

              {/* Mobile Number */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Mobile Number {req}
                </label>

                <input
                  type="tel"
                  name="adminMobileNumber"
                  value={formData.adminMobileNumber || ""}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setFormData((prev) => ({
                      ...prev,
                      adminMobileNumber: value,
                    }));
                  }}
                  placeholder="Enter mobile number"
                  maxLength={10}
                  className={`${cls("adminMobileNumber")} h-8 px-2 text-sm`}
                />

                {errMsg("adminMobileNumber")}
              </div>

              {/* Password */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Password {req}
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className={`${cls("password")} h-8 px-2 pr-8 text-sm`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errMsg("password")}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`${label} mb-1 text-xs`}>
                  Confirm Password {req}
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className={`${cls("confirmPassword")} h-8 px-2 pr-8 text-sm`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errMsg("confirmPassword")}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-2 flex items-start gap-2 rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-2">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-[11px] text-green-700 dark:text-green-300">
                A login credential will be created and shared with the admin on
                company creation.
              </p>
            </div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex justify-end gap-2.5 px-4 py-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={() => console.log("Button clicked")}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save & Invite Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyForm;
