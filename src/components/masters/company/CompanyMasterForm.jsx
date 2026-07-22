import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import { masterAPI } from "../../../api/companyAPI";

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
  checked,
  onChange,
  error,
  required,
  type = "text",
  options,
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
          className={controlClasses}
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
  beneficiaryName: "",
  accountNo: "",
  bankName: "",
  accountCode: "",
  branch: "",
  ifsc: "",
  accountType: "",
  primary: false,
});

const BankDetailsTable = ({
  rows,
  onCellChange,
  onAddRow,
  onRemoveRow,
  onSetPrimary,
}) => {
  const cellInputClasses =
    "w-full h-[28px] px-1.5 rounded border text-xs leading-none bg-transparent " +
    "border-transparent hover:border-gray-300 dark:hover:border-gray-600 " +
    "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
    "text-gray-900 dark:text-gray-100 transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionHeader>Bank Details</SectionHeader>

        <button
          type="button"
          onClick={onAddRow}
          className="
            flex items-center gap-1 px-2 py-1 rounded text-[11px]
            bg-blue-50 text-blue-700 hover:bg-blue-100
            dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50
            transition-colors
          "
        >
          <Plus className="h-3 w-3" />
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
  <table className="w-full text-xs border-collapse">
    <thead>
      <tr className="bg-gray-50 dark:bg-gray-900/60">
        <th className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 w-10">
          S.No
        </th>

        {BANK_COLUMNS.map((col) => (
          <th
            key={col.key}
            className="px-2 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
          >
            {col.label}
          </th>
        ))}

        <th className="px-2 py-2 text-center font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
          Primary Account
        </th>

        <th className="px-2 py-2 border-b border-gray-200 dark:border-gray-700 w-10"></th>
      </tr>
    </thead>

    <tbody>
      {rows.map((row, idx) => (
        <tr
          key={idx}
          className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900/40"
        >
          <td className="px-2 py-1 text-gray-500 dark:text-gray-400">
            {idx + 1}
          </td>

          {BANK_COLUMNS.map((col) => (
            <td key={col.key} className="px-2 py-1 min-w-[150px]">
              <input
                type="text"
                value={row[col.key]}
                onChange={(e) =>
                  onCellChange(idx, col.key, e.target.value)
                }
                className="
                  w-full
                  h-[30px]
                  px-2
                  rounded
                  border
                  border-gray-300
                  dark:border-gray-600
                  bg-white
                  dark:bg-gray-900
                  text-xs
                  text-gray-900
                  dark:text-gray-100
                  placeholder-gray-400
                  dark:placeholder-gray-500
                  transition-colors
                  focus:outline-none
                  focus:ring-1
                  focus:ring-blue-500
                  focus:border-blue-500
                  dark:focus:ring-blue-400
                  dark:focus:border-blue-400
                "
              />
            </td>
          ))}

          <td className="px-2 py-1 text-center">
            <input
              type="checkbox"
              checked={row.primary}
              onChange={() => onSetPrimary(idx)}
              className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500 cursor-pointer"
            />
          </td>

          <td className="px-2 py-1 text-center">
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveRow(idx)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
};

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

const CompanyMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    companyCode: data?.companyCode || "",
    companyName: data?.companyName || "",
    ceo: data?.ceo || "",
    address: data?.address || "",
    country: data?.country || "",
    state: data?.state || "",
    city: data?.city || "",
    pincode: data?.pincode || "",
    panNo: data?.panNo || "",
    gst: data?.gst || "",
    cin: data?.cin || "",
    officialWebsite: data?.officialWebsite || "",
    termsAndConditions: data?.termsAndConditions || "",

    id: data?.id || "",
    active: data?.active ?? true,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(data?.logoUrl || null);

  const [bankRows, setBankRows] = useState(
    data?.bankDetails?.length ? data.bankDetails : [emptyBankRow()],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const handleBankCellChange = (idx, key, value) => {
    setBankRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddBankRow = () =>
    setBankRows((prev) => [...prev, emptyBankRow()]);

  const handleRemoveBankRow = (idx) =>
    setBankRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSetPrimaryBank = (idx) =>
    setBankRows((prev) =>
      prev.map((row, i) => ({ ...row, primary: i === idx })),
    );

  const validate = () => {
    const errors = {};

    if (!form.companyCode.trim())
      errors.companyCode = "Company Code is required";
    if (!form.companyName.trim())
      errors.companyName = "Company Name is required";
    if (!form.city.trim()) errors.city = "City is required";

    if (
      form.officialWebsite &&
      !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(
        form.officialWebsite.trim(),
      )
    )
      errors.officialWebsite = "Enter a valid website URL";

    if (form.pincode && !/^\d{4,8}$/.test(form.pincode.trim()))
      errors.pincode = "Enter a valid pincode";

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
      bankDetails: bankRows,
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload, logoFile);

    try {
      // const fd = new FormData();
      // fd.append("payload", JSON.stringify(payload));
      // if (logoFile) fd.append("logo", logoFile);
      // await masterAPI.saveCompany(fd);

      alert(
        data ? "Company Updated Successfully!" : "Company Saved Successfully!",
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
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
            label="Code"
            name="companyCode"
            value={form.companyCode}
            onChange={handleChange}
            error={fieldErrors.companyCode}
            required
          />

          <Field
            label="CEO"
            name="ceo"
            value={form.ceo}
            onChange={handleChange}
            error={fieldErrors.ceo}
          />

          <Field
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={fieldErrors.address}
            className="col-span-2"
          />

          <Field
            type="select"
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            error={fieldErrors.country}
            options={COUNTRIES}
          />

          <Field
            type="select"
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            error={fieldErrors.state}
            options={STATES}
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
          />

          <Field
            label="Pan No"
            name="panNo"
            value={form.panNo}
            onChange={handleChange}
            error={fieldErrors.panNo}
          />

          <Field
            label="Gst"
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

          <Field
            label="Official Website"
            name="officialWebsite"
            value={form.officialWebsite}
            onChange={handleChange}
            error={fieldErrors.officialWebsite}
          />

          <Field
            label="Terms And Conditions"
            name="termsAndConditions"
            value={form.termsAndConditions}
            onChange={handleChange}
            error={fieldErrors.termsAndConditions}
            className="col-span-2 "
          />

          {/* Logo upload */}
          <div className="w-full">
            <label className={labelClasses}>Logo</label>

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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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

      {/* Bank Details */}
      <BankDetailsTable
        rows={bankRows}
        onCellChange={handleBankCellChange}
        onAddRow={handleAddBankRow}
        onRemoveRow={handleRemoveBankRow}
        onSetPrimary={handleSetPrimaryBank}
      />

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={data ? "Update" : "Save"}
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

  const [selectedCompany, setSelectedCompany] = useState(data?.companyId || "");
  const [selectedBranch, setSelectedBranch] = useState(data?.id || "");

  const [form, setForm] = useState({
    ...emptyBranchForm(),
    ...data,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (data) {
      setForm({ ...emptyBranchForm(), ...data });
      setSelectedCompany(data.companyId || "");
      setSelectedBranch(data.id || "");
    }
  }, [data]);

  const handleCompanySelect = (e) => {
    const value = e.target.value;
    setSelectedCompany(value);
    setSelectedBranch("");
    setForm(emptyBranchForm());
    onCompanyChange?.(value);
  };

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

    if (!selectedCompany) errors.company = "Please select a company";
    if (!form.plantId.trim()) errors.plantId = "Plant ID is required";
    if (!form.plantName.trim()) errors.plantName = "Plant Name is required";

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Enter a valid email address";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(selectedBranch && { id: selectedBranch }),
      orgId,
      companyId: selectedCompany,
      ...form,
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload);

    try {
      // await masterAPI.saveBranch(payload);

      alert(
        selectedBranch
          ? "Branch Updated Successfully!"
          : "Branch Saved Successfully!",
      );
      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Branch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
      {/* Company / Branch selector */}
      <div>
        <SectionHeader>Select Company &amp; Branch</SectionHeader>

        <div className={fieldGrid}>
          <Field
            type="select"
            label="Company"
            name="company"
            value={selectedCompany}
            onChange={handleCompanySelect}
            error={fieldErrors.company}
            options={companies.map((c) => c.companyName)}
            required
          />

          <Field
            type="select"
            label="Branch"
            name="branch"
            value={selectedBranch}
            onChange={handleBranchSelect}
            options={branches.map((b) => b.plantName)}
            className={!selectedCompany ? "opacity-60 pointer-events-none" : ""}
          />
        </div>
      </div>

      {/* Plant / Branch Details */}
      <div>
        <SectionHeader>Branch Details</SectionHeader>

        <div className={fieldGrid}>
          <Field
            label="Plant ID"
            name="plantId"
            value={form.plantId}
            onChange={handleChange}
            error={fieldErrors.plantId}
            required
          />

          <Field
            label="Plant Name"
            name="plantName"
            value={form.plantName}
            onChange={handleChange}
            error={fieldErrors.plantName}
            required
          />

          <Field
            label="Plant Incharge"
            name="plantIncharge"
            value={form.plantIncharge}
            onChange={handleChange}
            error={fieldErrors.plantIncharge}
          />

          <Field
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            error={fieldErrors.phoneNumber}
          />

          <Field
            type="email"
            label="E-Mail"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          <Field
            label="ECC NO."
            name="eccNo"
            value={form.eccNo}
            onChange={handleChange}
            error={fieldErrors.eccNo}
          />
          <Field
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={fieldErrors.address}
            className="col-span-2"
          />

          <Field
            label="Division"
            name="division"
            value={form.division}
            onChange={handleChange}
            error={fieldErrors.division}
          />

          <Field
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            error={fieldErrors.city}
          />

          <Field
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            error={fieldErrors.pincode}
          />

          <Field
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            error={fieldErrors.state}
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
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <SectionHeader>Bank Details</SectionHeader>

        <div className={fieldGrid}>
          <Field
            label="DUNS No"
            name="dunsNo"
            value={form.dunsNo}
            onChange={handleChange}
            error={fieldErrors.dunsNo}
          />

          <Field
            label="Bank Name"
            name="bankName"
            value={form.bankName}
            onChange={handleChange}
            error={fieldErrors.bankName}
          />

          <Field
            label="Bank Account No"
            name="bankAccountNo"
            value={form.bankAccountNo}
            onChange={handleChange}
            error={fieldErrors.bankAccountNo}
          />

          <Field
            label="IFSC/SWIFT Code"
            name="ifscSwiftCode"
            value={form.ifscSwiftCode}
            onChange={handleChange}
            error={fieldErrors.ifscSwiftCode}
          />
        </div>
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
        <CompanyMasterForm data={companyData} onBack={onBack} />
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
