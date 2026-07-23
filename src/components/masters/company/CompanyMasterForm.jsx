import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { superAdminAPI } from "../../../api/superAdminApi";
import { companySetupAPI } from "../../../api/companySetupApi";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

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

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Validation regexes / helpers (shared)                                       */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const WEBSITE_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/; // 6-digit Indian pincode
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const CIN_REGEX = /^[LUu]{1}[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const DUNS_REGEX = /^[0-9]{9}$/;
const ACCOUNT_NO_REGEX = /^[0-9]{6,18}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  checked,
  onChange,
  error,
  required,
  type = "text",
  options,
  className = "",
  disabled = false,
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
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">Select {label}</option>
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
            `${error ? controlErrClasses : "border-gray-300 dark:border-gray-600"} ` +
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
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
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

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
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
      onClick={onSave}
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
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Bank Details table (used by Company tab)                                    */

const BANK_COLUMNS = [
  { key: "beneficiaryName", label: "Beneficiary Name" },
  { key: "accountNo", label: "Account No" },
  { key: "bankName", label: "Bank Name" },
  { key: "accountCode", label: "Account Code" },
  { key: "branch", label: "Branch" },
  { key: "ifsc", label: "IFSC" },
  { key: "accountType", label: "Account Type" },
];

const emptyBankRow = () => ({
  id: 0,
  bankName: "",
  bankBranch: "",
  accountNo: "",
  ifscCode: "",
  primary: false,
});

/* ---------------------------------------------------------------------------- */
/* Company tab                                                                 */

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "UAE",
  "Singapore",
];
const STATES = ["Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Gujarat"];

const emptyCompanyForm = () => ({
  id: "",
  companyName: "",
  companyCode: "",
  companyEmail: "",
  phoneNo: "",
  ceo: "",
  companySize: "",
  industryType: "",
  officialWebsite: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  panNo: "",
  gst: "",
  cin: "",
  active: true,

  // Subscription
  plan: "",
  trialPeriodDays: "",
  maxUsers: "",
  storage: "",

  // Admin
  adminName: "",
  adminEmail: "",
  adminMobile: "",

  termsAndConditions: "",
});

const CompanyMasterForm = ({ data, companyId, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const userId = localStorage.getItem("usersId");

  const [form, setForm] = useState(emptyCompanyForm());
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const populateForm = (company) => {
    if (!company) return;
    setForm({
      ...emptyCompanyForm(),
      id: company.id || "",
      companyName: company.companyName || "",
      companyCode: company.companyCode || "",
      companyEmail: company.email || "",
      phoneNo: form.phoneNo || null,
      ceo: company.ceo || "",
      companySize: company.companySize || "",
      industryType: company.industryType || "",
      officialWebsite: company.officialWebsite || "",
      address: company.address || company.registeredAddress || "",
      country: company.country || "",
      state: company.state || "",
      city: company.city || "",
      pincode: company.pincode || "",
      panNo: company.panNo || "",
      gst: company.gst || "",
      cin: company.cin || "",
      active: company.active === "Active" || company.active === true,

      plan: company.selectPlan || "",
      trialPeriodDays: company.trialPeriod ?? "",
      maxUsers: company.maxUsers ?? "",
      storage: company.storageLimit || "",

      adminName: company.adminName || "",
      adminEmail: company.adminEmail || "",
      adminMobile: company.adminMobileNo || "",

      termsAndConditions: company.termsAndConditions || "",
    });
    setLogoPreview(company.logoUrl || null);
  };

  useEffect(() => {
    if (data) populateForm(data);
  }, [data]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const company = await companySetupAPI.getCompanyById(userId);
        if (!cancelled) populateForm(company);
      } catch (error) {
        console.error(error);
        if (!cancelled) addToast("Failed to load company details");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCompany();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
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

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errors = {};

    if (!form.companyName.trim())
      errors.companyName = "Company Name is required";
    else if (form.companyName.trim().length < 2)
      errors.companyName = "Company Name is too short";

    if (!form.companyCode.trim())
      errors.companyCode = "Company Code is required";
    else if (!/^[A-Z0-9-]{2,15}$/.test(form.companyCode.trim()))
      errors.companyCode =
        "Code must be 2-15 chars, letters/numbers/hyphen only";

    if (form.companyEmail && !EMAIL_REGEX.test(form.companyEmail.trim()))
      errors.companyEmail = "Enter a valid email address";

    if (form.phoneNo && !PHONE_REGEX.test(form.phoneNo.trim()))
      errors.phoneNo = "Enter a valid 10-digit phone number";

    if (form.ceo && !NAME_REGEX.test(form.ceo.trim()))
      errors.ceo = "Enter a valid name";

    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.country.trim()) errors.country = "Country is required";
    if (!form.state.trim()) errors.state = "State is required";

    if (!form.city.trim()) errors.city = "City is required";
    else if (!/^[A-Za-z .'-]+$/.test(form.city.trim()))
      errors.city = "Enter a valid city name";

    if (!form.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!PINCODE_REGEX.test(form.pincode.trim()))
      errors.pincode = "Enter a valid 6-digit pincode";

    if (form.panNo && !PAN_REGEX.test(form.panNo.trim().toUpperCase()))
      errors.panNo = "Enter a valid PAN (e.g. AAAAA1234A)";

    if (form.gst && !GST_REGEX.test(form.gst.trim().toUpperCase()))
      errors.gst = "Enter a valid 15-character GSTIN";

    if (form.cin && !CIN_REGEX.test(form.cin.trim().toUpperCase()))
      errors.cin = "Enter a valid 21-character CIN";

    if (
      form.officialWebsite &&
      !WEBSITE_REGEX.test(form.officialWebsite.trim())
    )
      errors.officialWebsite = "Enter a valid website URL";

    if (form.adminEmail && !EMAIL_REGEX.test(form.adminEmail.trim()))
      errors.adminEmail = "Enter a valid email address";

    if (form.adminMobile && !PHONE_REGEX.test(form.adminMobile.trim()))
      errors.adminMobile = "Enter a valid 10-digit mobile number";

    if (
      form.trialPeriodDays &&
      !/^[0-9]+$/.test(String(form.trialPeriodDays).trim())
    )
      errors.trialPeriodDays = "Enter a valid number of days";

    if (form.maxUsers && !/^[0-9]+$/.test(String(form.maxUsers).trim()))
      errors.maxUsers = "Enter a valid number";

    if (form.termsAndConditions && form.termsAndConditions.trim().length > 2000)
      errors.termsAndConditions =
        "Terms & Conditions is too long (max 2000 chars)";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    // NOTE: confirm these keys against your actual API DTO before relying on this payload
    const payload = {
      id: Number(form.id || 0),

      companyName: form.companyName,
      companyCode: form.companyCode,
      email: form.companyEmail,
      phoneNo: form.phoneNo,

      ceo: form.ceo,
      companySize: form.companySize,
      industryType: form.industryType,
      officialWebsite: form.officialWebsite,

      registeredAddress: form.address,
      countryId: 0,
      stateId: 0,
      cityId: 0,
      pincode: form.pincode,

      panNo: form.panNo,
      gst: form.gst,
      cin: form.cin,

      selectPlan: form.plan,
      trialPeriod: Number(form.trialPeriodDays || 0),
      maxUsers: String(form.maxUsers || ""),
      storageLimit: form.storage || null,

      adminName: form.adminName,
      adminEmail: form.adminEmail,
      adminMobileNo: form.adminMobile,

      termsAndConditions: form.termsAndConditions,

      active: form.active,
    };

    try {
      console.log("Update Payload:", payload);
      console.log(JSON.stringify(payload, null, 2));
      const response = await companySetupAPI.updateCompany(payload);

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
    } catch (error) {
      console.error("Error updating company:", error);
      console.error("Server response body:", error?.response?.data);

      const serverMsg =
        error?.response?.data?.errors?.[0]?.longMessage ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again.";

      addToast(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Loading company details...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-6">
      {/* Company Details */}
      <div>
        <SectionHeader>Company Details</SectionHeader>

        <div className={fieldGrid}>
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
            label="Company Code"
            name="companyCode"
            value={form.companyCode}
            onChange={handleChange}
            error={fieldErrors.companyCode}
            required
          />

          <Field
            type="email"
            label="Company Email"
            name="companyEmail"
            value={form.companyEmail}
            onChange={handleChange}
            error={fieldErrors.companyEmail}
          />

          <Field
            label="Phone No"
            name="phoneNo"
            value={form.phoneNo}
            onChange={handleChange}
            error={fieldErrors.phoneNo}
          />

          <Field
            label="CEO"
            name="ceo"
            value={form.ceo}
            onChange={handleChange}
            error={fieldErrors.ceo}
          />

          <Field
            label="Company Size"
            name="companySize"
            value={form.companySize}
            onChange={handleChange}
            error={fieldErrors.companySize}
          />

          <Field
            label="Industry Type"
            name="industryType"
            value={form.industryType}
            onChange={handleChange}
            error={fieldErrors.industryType}
          />

          <Field
            label="Official Website"
            name="officialWebsite"
            value={form.officialWebsite}
            onChange={handleChange}
            error={fieldErrors.officialWebsite}
          />

          <Field
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={fieldErrors.address}
            required
            className="col-span-2"
          />

          {/* Plain text fields now, not dropdowns — just show whatever value is present */}
          <Field
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            error={fieldErrors.country}
            required
          />

          <Field
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            error={fieldErrors.state}
            required
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
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            error={fieldErrors.pincode}
            required
          />

          <Field
            label="PAN No"
            name="panNo"
            value={form.panNo}
            onChange={handleChange}
            error={fieldErrors.panNo}
          />

          <Field
            label="GST"
            name="gst"
            value={form.gst}
            onChange={handleChange}
            error={fieldErrors.gst}
          />

          <Field
            label="CIN"
            name="cin"
            value={form.cin}
            onChange={handleChange}
            error={fieldErrors.cin}
          />

          {/* Logo upload */}
          <div className="w-full">
            <label className={labelClasses}>Company Logo</label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                w-full h-[30px] px-2 rounded border text-xs
                border-blue-300 dark:border-blue-700
                text-blue-600 dark:text-blue-400
                hover:bg-blue-50 dark:hover:bg-blue-900/30
                flex items-center justify-center gap-1.5
                transition-colors
              "
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {logoFile ? logoFile.name : "Upload Logo"}
            </button>
          </div>

          {logoPreview && (
            <div className="w-full">
              <label className={`${labelClasses} select-none opacity-0`}>
                -
              </label>
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-[30px] object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
              />
            </div>
          )}

          <div className="w-full">
            <label className={labelClasses}>Status</label>
            <p className="mt-1 mb-1 text-xs text-gray-500 dark:text-gray-400">
              {form.active ? "Active" : "Inactive"}
            </p>

            <button
              type="button"
              onClick={() =>
                handleChange({
                  target: {
                    name: "active",
                    checked: !form.active,
                    type: "checkbox",
                  },
                })
              }
              className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div>
        <SectionHeader>Subscription Details</SectionHeader>

        <div className={fieldGrid}>
          <Field
            label="Plan"
            name="plan"
            value={form.plan}
            onChange={handleChange}
            error={fieldErrors.plan}
          />

          <Field
            label="Trial Period (Days)"
            name="trialPeriodDays"
            value={form.trialPeriodDays}
            onChange={handleChange}
            error={fieldErrors.trialPeriodDays}
          />

          <Field
            label="Max Users"
            name="maxUsers"
            value={form.maxUsers}
            onChange={handleChange}
            error={fieldErrors.maxUsers}
          />

          <Field
            label="Storage"
            name="storage"
            value={form.storage}
            onChange={handleChange}
            error={fieldErrors.storage}
          />
        </div>
      </div>

      {/* Admin Details */}
      <div>
        <SectionHeader>Admin Details</SectionHeader>

        <div className={fieldGrid}>
          <Field
            label="Admin Name"
            name="adminName"
            value={form.adminName}
            onChange={handleChange}
            error={fieldErrors.adminName}
          />

          <Field
            type="email"
            label="Admin Email"
            name="adminEmail"
            value={form.adminEmail}
            onChange={handleChange}
            error={fieldErrors.adminEmail}
          />

          <Field
            label="Admin Mobile"
            name="adminMobile"
            value={form.adminMobile}
            onChange={handleChange}
            error={fieldErrors.adminMobile}
          />
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        <SectionHeader>Terms & Conditions</SectionHeader>

        <div className={fieldGrid}>
          <Field
            label="Terms And Conditions"
            name="termsAndConditions"
            value={form.termsAndConditions}
            onChange={handleChange}
            error={fieldErrors.termsAndConditions}
            className="col-span-2"
          />
        </div>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel="Update"
      />
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Branch tab                                                                  */

const emptyBranchForm = () => ({
  plantId: "",
  plantName: "",
  plantIncharge: "",
  phoneNumber: "",
  faxNumber: "",
  email: "",
  address: "",
  eccNo: "",
  range: "",
  rangeCode: "",
  division: "",
  divisionCode: "",
  city: "",
  pincode: "",
  state: "",
  gstinNo: "",
  panNo: "",
  cinNo: "",
  dunsNo: "",
  bankName: "",
  bankAccountNo: "",
  ifscSwiftCode: "",
});

const BranchMasterForm = ({
  data,
  companies = [],
  branches = [],
  onBack,
  onCompanyChange,
  onBranchSelect,
}) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [selectedCompany, setSelectedCompany] = useState(data?.companyId || "");
  const [selectedBranch, setSelectedBranch] = useState(data?.id || "");

  const [form, setForm] = useState({ ...emptyBranchForm(), ...data });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [bankRows, setBankRows] = useState(
    data?.bankDetails?.length ? data.bankDetails : [emptyBankRow()],
  );

  // Single effect: sync everything when `data` changes
  useEffect(() => {
    if (data) {
      setForm({ ...emptyBranchForm(), ...data });
      setSelectedCompany(data.companyId || "");
      setSelectedBranch(data.id || "");
      setBankRows(
        data.bankDetails?.length ? data.bankDetails : [emptyBankRow()],
      );
    }
  }, [data]);

  const handleBranchSelect = (e) => {
    const value = e.target.value;
    setSelectedBranch(value);
    onBranchSelect?.(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};

    if (!form.branchCode?.trim()) errors.branchCode = "Branch Code is required";
    else if (!/^[A-Za-z0-9-]{2,20}$/.test(form.branchCode.trim()))
      errors.branchCode = "Enter a valid Branch Code";

    if (!form.branchName?.trim()) errors.branchName = "Branch Name is required";

    if (form.branchIncharge && !NAME_REGEX.test(form.branchIncharge.trim()))
      errors.branchIncharge = "Enter a valid name";

    if (!form.phoneNo?.trim()) errors.phoneNo = "Phone Number is required";
    else if (!PHONE_REGEX.test(form.phoneNo.trim()))
      errors.phoneNo = "Enter a valid 10-digit phone number";

    if (!form.email?.trim()) errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email.trim()))
      errors.email = "Enter a valid email address";

    if (!form.eccNo?.trim()) errors.eccNo = "ECC No is required";

    if (!form.address?.trim()) errors.address = "Address is required";

    if (!form.division?.trim()) errors.division = "Division is required";

    if (form.cityId && !/^[0-9]+$/.test(String(form.cityId).trim()))
      errors.cityId = "City ID must be numeric";

    if (form.stateId && !/^[0-9]+$/.test(String(form.stateId).trim()))
      errors.stateId = "State ID must be numeric";

    if (!form.pincode?.trim()) errors.pincode = "Pincode is required";
    else if (!PINCODE_REGEX.test(form.pincode.trim()))
      errors.pincode = "Enter a valid 6-digit pincode";

    if (!form.gstinNo?.trim()) errors.gstinNo = "GSTIN is required";
    else if (!GST_REGEX.test(form.gstinNo.trim().toUpperCase()))
      errors.gstinNo = "Enter a valid 15-character GSTIN";

    if (form.panNo && !PAN_REGEX.test(form.panNo.trim().toUpperCase()))
      errors.panNo = "Enter a valid PAN (e.g. AAAAA1234A)";

    if (form.cinNo && !CIN_REGEX.test(form.cinNo.trim().toUpperCase()))
      errors.cinNo = "Enter a valid 21-character CIN";

    if (form.dunsNo && !DUNS_REGEX.test(form.dunsNo.trim()))
      errors.dunsNo = "Enter a valid 9-digit DUNS number";

    bankRows.forEach((row, idx) => {
      if (row.bankName && !row.accountNo?.toString().trim())
        errors[`bankAccountNo_${idx}`] =
          "Account No is required when Bank Name is given";
      if (row.accountNo && !ACCOUNT_NO_REGEX.test(String(row.accountNo).trim()))
        errors[`bankAccountNo_${idx}`] = "Enter a valid bank account number";
      if (row.ifscCode && !IFSC_REGEX.test(row.ifscCode.trim().toUpperCase()))
        errors[`bankIfsc_${idx}`] = "Enter a valid IFSC/SWIFT code";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBankCellChange = (idx, key, value) => {
    setBankRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddBankRow = () =>
    setBankRows((prev) => [...prev, emptyBankRow()]);

  const handleRemoveBankRow = (idx) =>
    setBankRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    console.log("Save clicked");
    const isValid = validate();
    console.log("Valid:", isValid);
    console.log("Errors:", fieldErrors);
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      orgId: Number(orgId),
      branchCode: form.branchCode.trim(),
      branchName: form.branchName.trim(),
      branchIncharge: form.branchIncharge?.trim() || "",
      phoneNo: form.phoneNo.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      division: form.division.trim(),
      cityId: Number(form.cityId || 0),
      stateId: Number(form.stateId || 0),
      pincode: form.pincode.trim(),
      gstinNo: form.gstinNo.trim().toUpperCase(),
      panNo: form.panNo?.trim().toUpperCase() || "",
      cinNo: form.cinNo?.trim().toUpperCase() || "",
      eccNo: form.eccNo.trim(),
      dunsNo: form.dunsNo?.trim() || "",
      active: true,
      cancelRemarks: "",
      createdBy: localStorage.getItem("usersId"),
      bankDetails: bankRows
        .filter((row) => row.bankName?.trim())
        .map((row) => ({
          bankName: row.bankName.trim(),
          bankBranch: row.bankBranch?.trim() || "",
          accountNo: Number(row.accountNo || 0),
          ifscCode: row.ifscCode?.trim().toUpperCase() || "",
        })),
    };

    try {
      const response = await companySetupAPI.createUpdateBranch(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (selectedBranch
              ? "Branch updated successfully!"
              : "Branch created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            "Failed to save branch.",
        );
      }
    } catch (err) {
      console.error(err);
      addToast("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
      {/* Branch Details */}
      <div>
        <SectionHeader>Branch Details</SectionHeader>

        <div className={fieldGrid}>
          <Field
            label="Branch Code"
            name="branchCode"
            value={form.branchCode}
            onChange={handleChange}
            error={fieldErrors.branchCode}
            required
          />

          <Field
            label="Branch Name"
            name="branchName"
            value={form.branchName}
            onChange={handleChange}
            error={fieldErrors.branchName}
            required
          />

          <Field
            label="Branch Incharge"
            name="branchIncharge"
            value={form.branchIncharge}
            onChange={handleChange}
            error={fieldErrors.branchIncharge}
          />

          <Field
            label="Phone Number"
            name="phoneNo"
            value={form.phoneNo}
            onChange={handleChange}
            error={fieldErrors.phoneNo}
            required
          />

          <Field
            type="email"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
          />

          <Field
            label="ECC No"
            name="eccNo"
            value={form.eccNo}
            onChange={handleChange}
            error={fieldErrors.eccNo}
          />

          <Field
            label="Division"
            name="division"
            value={form.division}
            onChange={handleChange}
            error={fieldErrors.division}
          />

          <Field
            label="City ID"
            name="cityId"
            value={form.cityId}
            onChange={handleChange}
            error={fieldErrors.cityId}
          />

          <Field
            label="State ID"
            name="stateId"
            value={form.stateId}
            onChange={handleChange}
            error={fieldErrors.stateId}
          />

          <Field
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            error={fieldErrors.pincode}
          />

          <Field
            label="GSTIN No"
            name="gstinNo"
            value={form.gstinNo}
            onChange={handleChange}
            error={fieldErrors.gstinNo}
          />

          <Field
            label="PAN No"
            name="panNo"
            value={form.panNo}
            onChange={handleChange}
            error={fieldErrors.panNo}
          />

          <Field
            label="CIN No"
            name="cinNo"
            value={form.cinNo}
            onChange={handleChange}
            error={fieldErrors.cinNo}
          />

          <Field
            label="DUNS No"
            name="dunsNo"
            value={form.dunsNo}
            onChange={handleChange}
            error={fieldErrors.dunsNo}
          />

          <Field
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={fieldErrors.address}
            className="col-span-2"
          />
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <SectionHeader>Bank Details</SectionHeader>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  Bank Name
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  Bank Branch
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  Account No
                </th>
                <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                  IFSC Code
                </th>
                <th className="w-12 px-2 py-2"></th>
              </tr>
            </thead>

            <tbody>
              {bankRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 dark:border-gray-700"
                >
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.bankName}
                      onChange={(e) =>
                        handleBankCellChange(idx, "bankName", e.target.value)
                      }
                      className={`${controlClasses} h-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600`}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.bankBranch}
                      onChange={(e) =>
                        handleBankCellChange(idx, "bankBranch", e.target.value)
                      }
                      className={`${controlClasses} h-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600`}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.accountNo}
                      onChange={(e) =>
                        handleBankCellChange(idx, "accountNo", e.target.value)
                      }
                      className={`${controlClasses} h-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600`}
                    />
                  </td>

                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={row.ifscCode}
                      onChange={(e) =>
                        handleBankCellChange(idx, "ifscCode", e.target.value)
                      }
                      className={`${controlClasses} h-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600`}
                    />
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveBankRow(idx)}
                      disabled={bankRows.length === 1}
                      className="h-8 w-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddBankRow}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <Plus className="h-4 w-4" />
          Add Bank Row
        </button>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={selectedBranch ? "Update" : "Save"}
      />
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Combined screen with top-left tab switcher                                  */

const TABS = [
  { key: "company", label: "Company" },
  { key: "branch", label: "Branch" },
];

const CompanyBranchMaster = ({
  companyData,
  companyId,
  branchData,
  companies,
  branches,
  onBack,
  onCompanyChange,
  onBranchSelect,
}) => {
  const [activeTab, setActiveTab] = useState("company");

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
          Company Setup
        </h2>
      </div>

      {/* Tabs - top left */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              "relative px-1 pb-2 text-sm font-medium transition-colors " +
              (activeTab === tab.key
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
            }
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {activeTab === "company" ? (
        <CompanyMasterForm
          data={companyData}
          companyId={companyId}
          onBack={onBack}
        />
      ) : (
        <BranchMasterForm
          data={branchData}
          companies={companies}
          branches={branches}
          onBack={onBack}
          onCompanyChange={onCompanyChange}
          onBranchSelect={onBranchSelect}
        />
      )}
    </div>
  );
};

export default CompanyBranchMaster;
