import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
// import { masterAPI } from "../../../api/partyAPI";

const UPPERCASE_FIELDS = [
  "partyCode",
  "shortName",
  "gstNo",
  "panNo",
  "tanNo",
  "ifscCode",
  "swift",
  "stateCode",
];


const controlClasses =
  "w-full h-[38px] px-3 rounded-md border text-sm transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-xs text-gray-500 dark:text-gray-400 mb-1";

/**
 * Field
 * A single component for every input type used in this form.
 * type: "text" | "number" | "email" | "select" | "checkbox"
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

        <div className="h-4">
          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={`w-full ${className}`}>
        <label className={`${labelClasses} select-none opacity-0`}>-</label>

        <label className={`${controlClasses} flex items-center gap-2 cursor-pointer`}>
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 accent-blue-600 dark:accent-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-200">{label}</span>
        </label>

        <div className="h-4" />
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

      <div className="h-4">
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
    {children}
  </h3>
);

const fieldGrid = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-1 items-start";

/* ---------------------------------------------------------------------------- */

const PartyMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));

  const [form, setForm] = useState({
    // Basic Details
    partyCode: data?.partyCode || "",
    partyName: data?.partyName || "",
    shortName: data?.shortName || "",
    gstPartyName: data?.gstPartyName || "",
    partyType: data?.partyType || "Customer",
    customerType: data?.customerType || "",
    accountType: data?.accountType || "",
    businessType: data?.businessType || "",
    businessCategory: data?.businessCategory || "",

    // Assignment / Handling
    agentName: data?.agentName || "",
    carrierCode: data?.carrierCode || "",
    supplierType: data?.supplierType || "",
    salesPerson: data?.salesPerson || "",
    customerCoordinator: data?.customerCoordinator || "",
    accountName: data?.accountName || "",
    controllingOffice: data?.controllingOffice || "",

    // GST & Tax
    gstRegistered: data?.gstRegistered ?? false,
    gstNo: data?.gstNo || "",
    panNo: data?.panNo || "",
    panName: data?.panName || "",
    tanNo: data?.tanNo || "",
    compoundingScheme: data?.compoundingScheme || "No",
    psuGovtOrganization: data?.psuGovtOrganization || "No",

    // Credit & Other Codes
    creditLimit: data?.creditLimit ?? "",
    creditDays: data?.creditDays ?? "",
    currency: data?.currency || "INR",
    airWayBillCode: data?.airWayBillCode || "",
    airlineCode: data?.airlineCode || "",
    caf: data?.caf || "",

    // Bank Details
    bankName: data?.bankName || "",
    branch: data?.branch || "",
    bankAddress: data?.bankAddress || "",
    accountNo: data?.accountNo || "",
    accountTypeBank: data?.accountTypeBank || "Current",
    ifscCode: data?.ifscCode || "",
    swift: data?.swift || "",

    // Contact Details
    contactPerson: data?.contactPerson || "",
    mobile: data?.mobile || "",
    contactEmail: data?.contactEmail || "",

    // Address
    city: data?.city || "",
    state: data?.state || "",
    stateCode: data?.stateCode || "",
    stateNo: data?.stateNo ?? "",
    country: data?.country || "India",

    remarks: data?.remarks || "",
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

    if (!form.partyCode.trim())
      errors.partyCode = "Party Code is required";

    if (!form.partyName.trim())
      errors.partyName = "Party Name is required";

    if (!form.accountType.trim())
      errors.accountType = "Account Type is required";

    if (form.gstRegistered && !form.gstNo.trim())
      errors.gstNo = "GST No is required when GST Registered";

    if (form.gstNo && form.gstNo.trim().length !== 15)
      errors.gstNo = "GSTIN must be 15 characters";

    if (form.panNo && form.panNo.trim().length !== 10)
      errors.panNo = "PAN No must be 10 characters";

    if (form.mobile && !/^\d{10}$/.test(form.mobile.trim()))
      errors.mobile = "Mobile must be a valid 10 digit number";

    if (
      form.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())
    )
      errors.contactEmail = "Enter a valid email address";

    if (form.creditLimit !== "" && Number(form.creditLimit) < 0)
      errors.creditLimit = "Credit Limit cannot be negative";

    if (form.creditDays !== "" && Number(form.creditDays) < 0)
      errors.creditDays = "Credit Days cannot be negative";

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
      creditLimit: form.creditLimit === "" ? 0 : Number(form.creditLimit),
      creditDays: form.creditDays === "" ? 0 : Number(form.creditDays),
      stateNo: form.stateNo === "" ? null : Number(form.stateNo),
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload);

    try {
      // await masterAPI.saveParty(payload);

      alert(
        data ? "Party Updated Successfully!" : "Party Saved Successfully!"
      );

      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Party.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
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

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Party" : "Add Party"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-6">

        {/* Basic Details */}
        <div>
          <SectionHeader>Basic Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Party Code"
              name="partyCode"
              value={form.partyCode}
              onChange={handleChange}
              error={fieldErrors.partyCode}
              required
            />

            <Field
              label="Party Name"
              name="partyName"
              value={form.partyName}
              onChange={handleChange}
              error={fieldErrors.partyName}
              required
            />

            <Field
              label="Short Name"
              name="shortName"
              value={form.shortName}
              onChange={handleChange}
              error={fieldErrors.shortName}
            />

            <Field
              label="GST Party Name"
              name="gstPartyName"
              value={form.gstPartyName}
              onChange={handleChange}
              error={fieldErrors.gstPartyName}
            />

            <Field
              type="select"
              label="Party Type"
              name="partyType"
              value={form.partyType}
              onChange={handleChange}
              required
              options={[
                { value: "Customer", label: "Customer" },
                { value: "Vendor", label: "Vendor" },
              ]}
            />

            <Field
              label="Customer Type"
              name="customerType"
              value={form.customerType}
              onChange={handleChange}
              error={fieldErrors.customerType}
            />

            <Field
              type="select"
              label="Account Type"
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              error={fieldErrors.accountType}
              required
              options={[
                { value: "", label: "Select" },
                { value: "Sundry Debtor", label: "Sundry Debtor" },
                { value: "Sundry Creditor", label: "Sundry Creditor" },
              ]}
            />

            <Field
              label="Business Type"
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              error={fieldErrors.businessType}
            />

            <Field
              label="Business Category"
              name="businessCategory"
              value={form.businessCategory}
              onChange={handleChange}
              error={fieldErrors.businessCategory}
            />
          </div>
        </div>

        {/* Assignment Details */}
        <div>
          <SectionHeader>Assignment Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Agent Name"
              name="agentName"
              value={form.agentName}
              onChange={handleChange}
              error={fieldErrors.agentName}
            />

            <Field
              label="Carrier Code"
              name="carrierCode"
              value={form.carrierCode}
              onChange={handleChange}
              error={fieldErrors.carrierCode}
            />

            <Field
              label="Supplier Type"
              name="supplierType"
              value={form.supplierType}
              onChange={handleChange}
              error={fieldErrors.supplierType}
            />

            <Field
              label="Sales Person"
              name="salesPerson"
              value={form.salesPerson}
              onChange={handleChange}
              error={fieldErrors.salesPerson}
            />

            <Field
              label="Customer Coordinator"
              name="customerCoordinator"
              value={form.customerCoordinator}
              onChange={handleChange}
              error={fieldErrors.customerCoordinator}
            />

            <Field
              label="Account Name"
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              error={fieldErrors.accountName}
            />

            <Field
              label="Controlling Office"
              name="controllingOffice"
              value={form.controllingOffice}
              onChange={handleChange}
              error={fieldErrors.controllingOffice}
            />
          </div>
        </div>

        {/* GST & Tax */}
        <div>
          <SectionHeader>GST &amp; Tax Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="checkbox"
              label="GST Registered"
              name="gstRegistered"
              checked={form.gstRegistered}
              onChange={handleChange}
            />

            <Field
              label="GSTIN"
              name="gstNo"
              value={form.gstNo}
              onChange={handleChange}
              error={fieldErrors.gstNo}
              required={form.gstRegistered}
            />

            <Field
              label="PAN No"
              name="panNo"
              value={form.panNo}
              onChange={handleChange}
              error={fieldErrors.panNo}
            />

            <Field
              label="PAN Name"
              name="panName"
              value={form.panName}
              onChange={handleChange}
              error={fieldErrors.panName}
            />

            <Field
              label="TAN No"
              name="tanNo"
              value={form.tanNo}
              onChange={handleChange}
              error={fieldErrors.tanNo}
            />

            <Field
              type="select"
              label="Compounding Scheme"
              name="compoundingScheme"
              value={form.compoundingScheme}
              onChange={handleChange}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
            />

            <Field
              type="select"
              label="PSU / Govt Organization"
              name="psuGovtOrganization"
              value={form.psuGovtOrganization}
              onChange={handleChange}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
            />
          </div>
        </div>

        {/* Credit & Other Details */}
        <div>
          <SectionHeader>Credit &amp; Other Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="number"
              label="Credit Limit"
              name="creditLimit"
              value={form.creditLimit}
              onChange={handleChange}
              error={fieldErrors.creditLimit}
            />

            <Field
              type="number"
              label="Credit Days"
              name="creditDays"
              value={form.creditDays}
              onChange={handleChange}
              error={fieldErrors.creditDays}
            />

            <Field
              label="Currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              error={fieldErrors.currency}
            />

            <Field
              label="Air Way Bill Code"
              name="airWayBillCode"
              value={form.airWayBillCode}
              onChange={handleChange}
              error={fieldErrors.airWayBillCode}
            />

            <Field
              label="Airline Code"
              name="airlineCode"
              value={form.airlineCode}
              onChange={handleChange}
              error={fieldErrors.airlineCode}
            />

            <Field
              label="CAF"
              name="caf"
              value={form.caf}
              onChange={handleChange}
              error={fieldErrors.caf}
            />
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <SectionHeader>Bank Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Bank Name"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              error={fieldErrors.bankName}
            />

            <Field
              label="Branch"
              name="branch"
              value={form.branch}
              onChange={handleChange}
              error={fieldErrors.branch}
            />

            <Field
              label="Bank Address"
              name="bankAddress"
              value={form.bankAddress}
              onChange={handleChange}
              error={fieldErrors.bankAddress}
            />

            <Field
              label="Account No"
              name="accountNo"
              value={form.accountNo}
              onChange={handleChange}
              error={fieldErrors.accountNo}
            />

            <Field
              type="select"
              label="Account Type"
              name="accountTypeBank"
              value={form.accountTypeBank}
              onChange={handleChange}
              options={[
                { value: "Current", label: "Current" },
                { value: "Savings", label: "Savings" },
              ]}
            />

            <Field
              label="IFSC Code"
              name="ifscCode"
              value={form.ifscCode}
              onChange={handleChange}
              error={fieldErrors.ifscCode}
            />

            <Field
              label="SWIFT"
              name="swift"
              value={form.swift}
              onChange={handleChange}
              error={fieldErrors.swift}
            />
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <SectionHeader>Contact Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              error={fieldErrors.contactPerson}
            />

            <Field
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              error={fieldErrors.mobile}
            />

            <Field
              type="email"
              label="Email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              error={fieldErrors.contactEmail}
            />
          </div>
        </div>

        {/* Address Details */}
        <div>
          <SectionHeader>Address Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              error={fieldErrors.city}
            />

            <Field
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              error={fieldErrors.state}
            />

            <Field
              label="State Code"
              name="stateCode"
              value={form.stateCode}
              onChange={handleChange}
              error={fieldErrors.stateCode}
            />

            <Field
              type="number"
              label="State No"
              name="stateNo"
              value={form.stateNo}
              onChange={handleChange}
              error={fieldErrors.stateNo}
            />

            <Field
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              error={fieldErrors.country}
            />
          </div>
        </div>

        {/* Remarks & Status */}
        <div>
          <SectionHeader>Remarks &amp; Status</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              error={fieldErrors.remarks}
              className="xl:col-span-3"
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
        <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="
              flex items-center gap-1 px-4 py-2 rounded text-sm
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
              flex items-center gap-1 px-4 py-2 rounded text-sm text-white
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

export default PartyMasterForm;