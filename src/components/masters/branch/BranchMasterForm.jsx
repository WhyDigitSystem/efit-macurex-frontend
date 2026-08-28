import { Plus, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { companySetupAPI } from "../../../api/companySetupApi";
import { useToast } from "../../Toast/ToastContext";
import countryAPI from "../../../api/countryAPI";
import stateAPI from "../../../api/stateAPI";
import cityAPI from "../../../api/cityAPI";

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
/* Validation regexes / helpers                                                */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/; // 6-digit Indian pincode
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const CIN_REGEX = /^[LUu]{1}[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const DUNS_REGEX = /^[0-9]{9}$/;
const ACCOUNT_NO_REGEX = /^[0-9]{6,18}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;

/* ---------------------------------------------------------------------------- */
/* Location helpers                                                             */

// Normalizes a country/state/city field that might arrive either as a plain
// id (string/number) OR as a full nested object (e.g. { id, countryName, ... })
// depending on which API populated it.
const normalizeLocationRef = (val, nameKey) => {
  if (val && typeof val === "object") {
    return { id: val.id ?? "", name: val[nameKey] || "" };
  }
  return { id: val ?? "", name: "" };
};

const getActiveValue = (value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  if (typeof value === "string") {
    const status = value.trim().toLowerCase();

    if (
      status === "active" ||
      status === "true" ||
      status === "1" ||
      status === "t"
    ) {
      return true;
    }

    if (
      status === "inactive" ||
      status === "false" ||
      status === "0" ||
      status === "f"
    ) {
      return false;
    }
  }

  return false;
};

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
/* Bank Details helpers                                                        */

const emptyBankRow = () => ({
  id: 0,
  bankName: "",
  bankBranch: "",
  accountNo: "",
  ifscCode: "",
  primary: false,
});

/* ---------------------------------------------------------------------------- */
/* Branch tab                                                                  */

const emptyBranchForm = () => ({
  branchCode: "",
  branchName: "",
  branchIncharge: "",
  phoneNo: "",
  faxNumber: "",
  email: "",
  address: "",
  eccNo: "",
  range: "",
  rangeCode: "",
  division: "",
  divisionCode: "",

  countryId: "",
  countryName: "",

  stateId: "",
  stateName: "",

  cityId: "",
  cityName: "",

  pincode: "",
  gstinNo: "",
  panNo: "",
  cinNo: "",
  dunsNo: "",
  active: false,
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

  const [form, setForm] = useState({
    ...emptyBranchForm(),
    ...data,
    active: getActiveValue(data?.active),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [bankRows, setBankRows] = useState(
    data?.bankDetailsVO?.length ? data.bankDetailsVO : [emptyBankRow()],
  );

  // Country / State / City dropdown option lists
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch the country list once we know the org
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const result = await countryAPI.getCountries(orgId);
        setCountries(result);
      } catch (error) {
        console.error("Country loading error", error);
      }
    };

    if (orgId) {
      fetchCountries();
    }
  }, [orgId]);

  // Single effect: sync everything when `data` changes (e.g. pencil click -> fresh fetch,
  // or clearing back to "Add New"). Also preloads state/city option lists so a saved
  // branch shows its Country/State/City as names immediately, not blank.
  useEffect(() => {
    const syncFormWithData = async () => {
      if (data) {
        const countryRef = normalizeLocationRef(
          data.state?.country ?? data.country ?? data.countryId,
          "countryName"
        );

        const stateRef = normalizeLocationRef(
          data.state ?? data.stateId,
          "stateName"
        );

        const cityRef = normalizeLocationRef(
          data.city ?? data.cityId,
          "cityName"
        );

        setForm({
          ...emptyBranchForm(),
          ...data,

          countryId: countryRef.id,
          countryName: countryRef.name,

          stateId: stateRef.id,
          stateName: stateRef.name,

          cityId: cityRef.id,
          cityName: cityRef.name,

          active: getActiveValue(data.active),
        });

        setSelectedCompany(data.companyId || "");
        setSelectedBranch(data.id || "");

        setBankRows(
          data.bankDetailsVO?.length
            ? data.bankDetailsVO.map((b) => ({
              id: b.id || 0,
              bankName: b.bankName || "",
              bankBranch: b.bankBranch || "",
              accountNo: b.accountNo ?? "",
              ifscCode: b.ifscCode || "",
              primary: b.primary || false,
            }))
            : [emptyBankRow()],
        );

        // Preload state/city dropdown options for the saved country/state
        setStates([]);
        setCities([]);

        if (countryRef.id) {
          try {
            const stateData = await stateAPI.getStatesByCountry(
              countryRef.id,
              orgId,
            );
            setStates(stateData);
          } catch (error) {
            console.error("State loading error", error);
          }
        }

        if (stateRef.id) {
          try {
            const cityData = await cityAPI.getCitiesByState(orgId, stateRef.id);
            setCities(cityData);
          } catch (error) {
            console.error("City loading error", error);
          }
        }
      } else {
        // Add New: reset everything back to a blank form
        setForm(emptyBranchForm());
        setSelectedCompany("");
        setSelectedBranch("");
        setBankRows([emptyBankRow()]);
        setStates([]);
        setCities([]);
      }
    };

    syncFormWithData();
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

  const handleCountryChange = async (e) => {
    const countryId = e.target.value;

    const selectedCountry = countries.find(
      (c) => String(c.id) === String(countryId),
    );

    if (fieldErrors.countryId) {
      setFieldErrors((prev) => ({ ...prev, countryId: "" }));
    }

    setForm((prev) => ({
      ...prev,
      countryId,
      countryName: selectedCountry?.countryName || "",
      stateId: "",
      stateName: "",
      cityId: "",
      cityName: "",
    }));

    setStates([]);
    setCities([]);

    if (countryId) {
      try {
        const stateData = await stateAPI.getStatesByCountry(countryId, orgId);
        setStates(stateData);
      } catch (error) {
        console.error("State loading error", error);
      }
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    const selectedState = states.find((s) => String(s.id) === String(stateId));

    if (fieldErrors.stateId) {
      setFieldErrors((prev) => ({ ...prev, stateId: "" }));
    }

    setForm((prev) => ({
      ...prev,
      stateId,
      stateName: selectedState?.stateName || "",
      cityId: "",
      cityName: "",
    }));

    setCities([]);

    if (stateId) {
      try {
        const cityData = await cityAPI.getCitiesByState(orgId, stateId);
        setCities(cityData);
      } catch (error) {
        console.error("City loading error", error);
      }
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;

    const selectedCity = cities.find((c) => String(c.id) === String(cityId));

    if (fieldErrors.cityId) {
      setFieldErrors((prev) => ({ ...prev, cityId: "" }));
    }

    setForm((prev) => ({
      ...prev,
      cityId,
      cityName: selectedCity?.cityName || "",
    }));
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

    if (!form.countryId) errors.countryId = "Country is required";
    if (!form.stateId) errors.stateId = "State is required";
    if (!form.cityId) errors.cityId = "City is required";

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
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(selectedBranch);
    const base = isUpdate && data ? data : {};

    const payload = {
      //  Only include id when updating — never send it on create
      ...(isUpdate ? { id: base?.id || selectedBranch } : {}),

      orgId: Number(orgId),

      branchCode: form.branchCode.trim(),
      branchName: form.branchName.trim(),
      branchIncharge: form.branchIncharge?.trim() || "",

      phoneNo: form.phoneNo.trim(),
      email: form.email.trim(),

      address: form.address.trim(),
      division: form.division.trim(),

      countryId: form.countryId ? Number(form.countryId) : 0,
      stateId: form.stateId ? Number(form.stateId) : 0,
      cityId: form.cityId ? Number(form.cityId) : 0,

      pincode: form.pincode.trim(),

      gstinNo: form.gstinNo?.trim().toUpperCase() || "",
      panNo: form.panNo?.trim().toUpperCase() || "",
      cinNo: form.cinNo?.trim().toUpperCase() || "",
      eccNo: form.eccNo?.trim() || "",
      dunsNo: form.dunsNo?.trim() || "",

      active: Boolean(form.active),
      cancelRemarks: form.cancelRemarks?.trim() || false,

      // On create -> current user. On update -> keep original creator.
      createdBy: isUpdate
        ? base?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),

      // Only relevant on update
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),

      bankDetails: bankRows
        .filter((row) => row.bankName?.trim())
        .map((row) => ({
          // ✅ Only send bank-row id if it's an existing row on an update
          ...(isUpdate && row.id ? { id: row.id } : {}),
          bankName: row.bankName.trim(),
          bankBranch: row.bankBranch?.trim() || "",
          accountNo: Number(row.accountNo || 0),
          ifscCode: row.ifscCode?.trim().toUpperCase() || "",
        })),
    };

    console.log("========== BRANCH PAYLOAD ==========");
    console.log(JSON.stringify(payload, null, 2));

    try {
      const response = await companySetupAPI.createUpdateBranch(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Branch updated successfully!"
            : "Branch created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save branch.",
        );
      }
    } catch (err) {
      console.error("Save Branch Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data),
        );
      } else {
        addToast("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedBranch ? "Edit Branch" : "Add Branch"}
        </h2>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Branch Details */}
        <div>
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
              label="Phone No"
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
              type="select"
              label="Country"
              name="countryId"
              value={form.countryId}
              onChange={handleCountryChange}
              error={fieldErrors.countryId}
              required
              options={[
                ...(form.countryId &&
                  !countries.some((c) => String(c.id) === String(form.countryId))
                  ? [{ id: form.countryId, countryName: form.countryName }]
                  : []),
                ...countries,
              ].map((c) => ({ value: c.id, label: c.countryName }))}
            />

            <Field
              type="select"
              label="State"
              name="stateId"
              value={form.stateId}
              onChange={handleStateChange}
              error={fieldErrors.stateId}
              required
              disabled={!form.countryId}
              options={[
                ...(form.stateId &&
                  !states.some((s) => String(s.id) === String(form.stateId))
                  ? [{ id: form.stateId, stateName: form.stateName }]
                  : []),
                ...states,
              ].map((s) => ({ value: s.id, label: s.stateName }))}
            />

            <Field
              type="select"
              label="City"
              name="cityId"
              value={form.cityId}
              onChange={handleCityChange}
              error={fieldErrors.cityId}
              required
              disabled={!form.stateId}
              options={[
                ...(form.cityId &&
                  !cities.some((c) => String(c.id) === String(form.cityId))
                  ? [{ id: form.cityId, cityName: form.cityName }]
                  : []),
                ...cities,
              ].map((c) => ({ value: c.id, label: c.cityName }))}
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
              label="GSTIN No"
              name="gstinNo"
              value={form.gstinNo}
              onChange={handleChange}
              error={fieldErrors.gstinNo}
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
              required
              className="col-span-2"
            />

            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={Boolean(form.active)}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }));
                }}
                className="h-4 w-4 accent-blue-600 dark:accent-blue-500"
              />

              <label
                htmlFor="active"
                className="text-xs text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        {/* <div>
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
                          handleBankCellChange(
                            idx,
                            "bankBranch",
                            e.target.value,
                          )
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
                        className={`${controlClasses} h-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border ${fieldErrors[`bankAccountNo_${idx}`]
                            ? controlErrClasses
                            : "border-gray-300 dark:border-gray-600"
                          }`}
                      />
                      {fieldErrors[`bankAccountNo_${idx}`] && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                          {fieldErrors[`bankAccountNo_${idx}`]}
                        </p>
                      )}
                    </td>

                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.ifscCode}
                        onChange={(e) =>
                          handleBankCellChange(idx, "ifscCode", e.target.value)
                        }
                        className={`${controlClasses} h-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border ${fieldErrors[`bankIfsc_${idx}`]
                            ? controlErrClasses
                            : "border-gray-300 dark:border-gray-600"
                          }`}
                      />
                      {fieldErrors[`bankIfsc_${idx}`] && (
                        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                          {fieldErrors[`bankIfsc_${idx}`]}
                        </p>
                      )}
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
        </div> */}

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={selectedBranch ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default BranchMasterForm;
