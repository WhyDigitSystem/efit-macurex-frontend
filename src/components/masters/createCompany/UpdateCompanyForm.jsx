// UpdateCompanyForm.jsx
import React, { useState } from "react";
import { X, Info, ChevronDown } from "lucide-react";
import { superAdminAPI } from "../../../api/superAdminApi";
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

const UpdateCompanyForm = ({ editData, onBack }) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Prefill EVERY field the DTO supports, not just a subset
  const [formData, setFormData] = useState({
    id: editData?.id || "",
    companyName: editData?.companyName || "",
    companyCode: editData?.companyCode || "",
    email: editData?.email || "",
    phoneNo: editData?.phoneNo || "",
    industryType: editData?.industryType || "",
    companySize: editData?.companySize || "",

    selectPlan: editData?.selectPlan || "",
    trialPeriod: editData?.trialPeriod ?? 0,
    maxUsers: editData?.maxUsers || "",
    active:
      editData?.active === true || editData?.active === "Active"
        ? "Active"
        : "Inactive",

    adminName: editData?.adminName || "",
    adminEmail: editData?.adminEmail || "",
    adminMobileNo: editData?.adminMobileNo || "",

    gst: editData?.gst || "",
    panNo: editData?.panNo || "",
    cin: editData?.cin || "",
    ceo: editData?.ceo || "",
    officialWebsite: editData?.officialWebsite || "",
    pincode: editData?.pincode || "",
    registeredAddress: editData?.registeredAddress || "",
    storageLimit: editData?.storageLimit || "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setStatus = (active) => setFormData((prev) => ({ ...prev, active }));

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.companyName)
      newErrors.companyName = "Company Name is required";
    if (!formData.email) {
      newErrors.email = "Company Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.industryType)
      newErrors.industryType = "Industry Type is required";
    if (!formData.companySize)
      newErrors.companySize = "Company Size is required";
    if (!formData.selectPlan) newErrors.selectPlan = "Please select a plan";

    if (!formData.adminName) newErrors.adminName = "Admin Name is required";
    if (!formData.adminEmail) {
      newErrors.adminEmail = "Admin Email is required";
    } else if (!emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }
    if (!formData.adminMobileNo) {
      newErrors.adminMobileNo = "Mobile Number is required";
    } else if (!/^[0-9]{10}$/.test(formData.adminMobileNo)) {
      newErrors.adminMobileNo = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Keys here match the swagger DTO exactly — this is the part that was broken
      const payload = {
        id: Number(formData.id),

        // Company Details
        companyName: formData.companyName,
        companyCode: formData.companyCode,
        email: formData.email,
        phoneNo: formData.phoneNo || null,
        industryType: formData.industryType,
        companySize: formData.companySize,

        // Subscription
        selectPlan: formData.selectPlan,
        trialPeriod: Number(formData.trialPeriod),
        maxUsers: Number(formData.maxUsers),
        active: formData.active === "Active",

        // Admin Details
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminMobileNo: formData.adminMobileNo,

        // Additional Details
        gst: formData.gst || null,
        panNo: formData.panNo || null,
        cin: formData.cin || null,
        ceo: formData.ceo || null,
        officialWebsite: formData.officialWebsite || null,
        pincode: formData.pincode || null,
        registeredAddress: formData.registeredAddress || null,
        storageLimit: formData.storageLimit
          ? Number(formData.storageLimit)
          : null,

        // Address (use existing IDs if available)
        countryId: editData?.countryId ?? null,
        stateId: editData?.stateId ?? null,
        cityId: editData?.cityId ?? null,
      };
      console.log("Update Payload:", payload);
      const response = await superAdminAPI.updateCompany(payload);

      if (response?.status) {
        addToast("Company updated successfully!");
        onBack();
      } else {
        const msg =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          "Failed to update company";
        addToast(msg);
      }
    } catch (err) {
      console.error("Error updating company:", err);
      addToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const label =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
  const req = <span className="text-red-500">*</span>;
  const inputBase =
    "w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white " +
    "placeholder-gray-400 dark:placeholder-gray-500 text-sm border focus:outline-none focus:ring-2 transition-colors";
  const inputOk = "border-gray-300 dark:border-gray-600 focus:ring-blue-500";
  const inputErr = "border-red-500 focus:ring-red-500";
  const cls = (key) => `${inputBase} ${errors[key] ? inputErr : inputOk}`;
  const errMsg = (key) =>
    errors[key] ? (
      <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
    ) : null;

  const Select = ({ name, value, onChange, options, placeholder }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${cls(name)} appearance-none pr-9 h-8 text-sm ${!value ? "text-gray-400 dark:text-gray-500" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Update Company
        </h2>
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <label className={label}>Company Name {req}</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={`${cls("companyName")} h-8 px-2`}
            />
            {errMsg("companyName")}
          </div>
          <div>
            <label className={label}>Company Code</label>
            <input
              name="companyCode"
              value={formData.companyCode}
              onChange={handleInputChange}
              className={`${cls("companyCode")} h-8 px-2`}
            />
          </div>
          <div>
            <label className={label}>Company Email {req}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${cls("email")} h-8 px-2`}
            />
            {errMsg("email")}
          </div>
          <div>
            <label className={label}>Industry Type {req}</label>
            <Select
              name="industryType"
              value={formData.industryType}
              onChange={handleInputChange}
              options={INDUSTRY_OPTIONS}
              placeholder="Select industry"
            />
            {errMsg("industryType")}
          </div>
          <div>
            <label className={label}>Company Size {req}</label>
            <Select
              name="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
              options={COMPANY_SIZE_OPTIONS}
              placeholder="Select company size"
            />
            {errMsg("companySize")}
          </div>
          <div>
            <label className={label}>Select Plan {req}</label>
            <Select
              name="selectPlan"
              value={formData.selectPlan}
              onChange={handleInputChange}
              options={PLAN_OPTIONS}
              placeholder="Select plan"
            />
            {errMsg("selectPlan")}
          </div>
          <div>
            <label className={label}>Trial Period (Days)</label>
            <input
              type="number"
              min="0"
              name="trialPeriod"
              value={formData.trialPeriod}
              onChange={handleInputChange}
              className={`${cls("trialPeriod")} h-8 px-2`}
            />
          </div>
          <div>
            <label className={label}>Max Users</label>
            <input
              type="number"
              min="1"
              name="maxUsers"
              value={formData.maxUsers}
              onChange={handleInputChange}
              className={`${cls("maxUsers")} h-8 px-2`}
            />
          </div>
          <div>
            <label className={label}>Status {req}</label>
            <div className="flex h-8 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setStatus("Active")}
                className={`flex-1 text-[11px] font-medium ${formData.active === "Active" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("Inactive")}
                className={`flex-1 text-[11px] font-medium ${formData.active === "Inactive" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <label className={label}>Admin Name {req}</label>
            <input
              name="adminName"
              value={formData.adminName}
              onChange={handleInputChange}
              className={`${cls("adminName")} h-8 px-2`}
            />
            {errMsg("adminName")}
          </div>
          <div>
            <label className={label}>Admin Email {req}</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className={`${cls("adminEmail")} h-8 px-2`}
            />
            {errMsg("adminEmail")}
          </div>
          <div>
            <label className={label}>Admin Mobile {req}</label>
            <input
              name="adminMobileNo"
              value={formData.adminMobileNo}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData((prev) => ({ ...prev, adminMobileNo: value }));
              }}
              maxLength={10}
              className={`${cls("adminMobileNo")} h-8 px-2`}
            />
            {errMsg("adminMobileNo")}
          </div>
        </div>

        <div className="mx-3 my-2 flex items-start gap-2 rounded-md border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-[11px] text-blue-700 dark:text-blue-300">
            Password is not changed from this screen. Use "Reset Password"
            separately if needed.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Company"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCompanyForm;
