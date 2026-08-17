import { Save, X, UploadCloud, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { superAdminAPI } from "../../../api/superAdminApi";
import { companySetupAPI } from "../../../api/companySetupApi";
import { useToast } from "../../Toast/ToastContext";
import countryAPI from "../../../api/countryAPI";
import stateAPI from "../../../api/stateAPI";
import cityAPI from "../../../api/cityAPI";

const normalizeLocationRef = (val, nameKey) => {
  if (val && typeof val === "object") {
    return { id: val.id ?? "", name: val[nameKey] || "" };
  }
  return { id: val ?? "", name: "" };
};

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const WEBSITE_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/; // 6-digit Indian pincode
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const CIN_REGEX = /^[LUu]{1}[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;

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
/* Company tab                                                                 */

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
  countryName: "",

  state: "",
  stateName: "",

  city: "",
  cityName: "",
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

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const [form, setForm] = useState(emptyCompanyForm());
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryData = await countryAPI.getCountries(orgId);
        setCountries(countryData);
      } catch (error) {
        console.error("Country loading error", error);
      }
    };

    if (orgId) {
      fetchCountries();
    }
  }, [orgId]);

  const handleCountryChange = async (e) => {
    const countryId = e.target.value;

    const selectedCountry = countries.find(
      (c) => String(c.id) === String(countryId),
    );

    setForm((prev) => ({
      ...prev,

      country: countryId,
      countryName: selectedCountry?.countryName || "",

      state: "",
      stateName: "",

      city: "",
      cityName: "",
    }));

    setCities([]);
    setStates([]);

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

    setForm((prev) => ({
      ...prev,

      state: stateId,
      stateName: selectedState?.stateName || "",

      city: "",
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

    setForm((prev) => ({
      ...prev,

      city: cityId,
      cityName: selectedCity?.cityName || "",
    }));
  };

  // Populates the form from a company record, and pre-loads the State/City
  // dropdown options that belong to the company's existing Country/State so
  // the selects aren't stuck showing just one injected option.
  const populateForm = async (company) => {
    if (!company) return;

    const countryRef = normalizeLocationRef(company.country, "countryName");
    const stateRef = normalizeLocationRef(company.state, "stateName");
    const cityRef = normalizeLocationRef(company.city, "cityName");

    setForm({
      ...emptyCompanyForm(),
      id: company.id || "",
      companyName: company.companyName || "",
      companyCode: company.companyCode || "",
      companyEmail: company.email || "",
      phoneNo: company.phoneNo || "",
      ceo: company.ceo || "",
      companySize: company.companySize || "",
      industryType: company.industryType || "",
      officialWebsite: company.officialWebsite || "",
      address: company.address || company.registeredAddress || "",

      country: countryRef.id,
      countryName: countryRef.name,

      state: stateRef.id,
      stateName: stateRef.name,

      city: cityRef.id,
      cityName: cityRef.name,

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

    if (company.companyLogo) {
      const logo = company.companyLogo;
      setLogoPreview(
        logo.startsWith("http") || logo.startsWith("data:")
          ? logo
          : `data:image/png;base64,${logo}`,
      );
    } else {
      setLogoPreview(null);
    }

    // Pre-load state/city option lists so the dropdowns are actually usable
    // (not just showing the single injected "current value" option).
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
    } else {
      setStates([]);
    }

    if (stateRef.id) {
      try {
        const cityData = await cityAPI.getCitiesByState(orgId, stateRef.id);
        setCities(cityData);
      } catch (error) {
        console.error("City loading error", error);
      }
    } else {
      setCities([]);
    }
  };

  // Load the company to edit. Prefer the record already passed in from the
  // list screen (`data`) — no need to re-fetch it. Only hit the API as a
  // fallback, and always by the actual company id, never by the user id.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (data) {
        await populateForm(data);
        return;
      }

      const idToFetch = companyId || orgId;
      if (!idToFetch) return;

      setIsLoading(true);
      try {
        const company = await companySetupAPI.getCompanyById(idToFetch);
        if (!cancelled) await populateForm(company);
      } catch (error) {
        console.error(error);
        if (!cancelled) addToast("Failed to load company details");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, companyId, orgId]);

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
    if (!String(form.country || "").trim())
      errors.country = "Country is required";

    if (!String(form.state || "").trim()) errors.state = "State is required";

    if (!String(form.city || "").trim()) errors.city = "City is required";

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
      countryId: Number(form.country),
      stateId: Number(form.state),
      cityId: Number(form.city),
      orgId: Number(orgId),
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
      // If a new logo was picked, upload it first and fold the response into the payload.
      // Use form.id (falls back to companyId prop) so the upload always targets the
      // right company, even if the form was populated only from the `data` prop.
      if (logoFile) {
        const logoTargetId = form.id || companyId || data?.id;

        if (!logoTargetId) {
          addToast("Could not determine which company to attach the logo to.");
          setIsSubmitting(false);
          return;
        }

        try {
          const logoRes = await companySetupAPI.uploadCompanyLogo(
            logoTargetId,
            logoFile,
          );

          // NOTE: confirm the actual response shape/key from your upload endpoint
          const uploadedLogoUrl =
            logoRes?.paramObjectsMap?.logoUrl ||
            logoRes?.logoUrl ||
            logoRes?.data?.logoUrl ||
            logoRes?.url ||
            null;

          if (uploadedLogoUrl) {
            payload.logoUrl = uploadedLogoUrl;
          } else {
            console.warn(
              "Logo uploaded but no URL found in response:",
              logoRes,
            );
          }
        } catch (uploadError) {
          console.error("Error uploading logo:", uploadError);
          addToast("Failed to upload logo. Company details were not saved.");
          setIsSubmitting(false);
          return; // stop here — don't proceed to updateCompany if logo upload fails
        }
      }

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
          Edit Company
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-6">
        {/* Company Details */}
        <div>
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

            <Field
              type="select"
              label="Country"
              name="country"
              value={form.country}
              onChange={handleCountryChange}
              error={fieldErrors.country}
              required
              options={[
                ...(form.country &&
                !countries.some((c) => String(c.id) === String(form.country))
                  ? [{ id: form.country, countryName: form.countryName }]
                  : []),
                ...countries,
              ].map((c) => ({ value: c.id, label: c.countryName }))}
            />

            <Field
              type="select"
              label="State"
              name="state"
              value={form.state}
              onChange={handleStateChange}
              error={fieldErrors.state}
              required
              disabled={!form.country}
              options={[
                ...(form.state &&
                !states.some((s) => String(s.id) === String(form.state))
                  ? [{ id: form.state, stateName: form.stateName }]
                  : []),
                ...states,
              ].map((s) => ({ value: s.id, label: s.stateName }))}
            />

            <Field
              type="select"
              label="City"
              name="city"
              value={form.city}
              onChange={handleCityChange}
              error={fieldErrors.city}
              required
              disabled={!form.state}
              options={[
                ...(form.city &&
                !cities.some((c) => String(c.id) === String(form.city))
                  ? [{ id: form.city, cityName: form.cityName }]
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

        {/* logo */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoSelect}
            className="hidden"
          />

          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
        h-9 w-44 px-2 rounded border text-xs
        border-blue-300 dark:border-blue-700
        text-blue-600 dark:text-blue-400
        hover:bg-blue-50 dark:hover:bg-blue-900/30
        flex items-center justify-center gap-1.5
        transition-colors
      "
            >
              <UploadCloud className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {logoFile ? logoFile.name : "Upload Logo"}
              </span>
            </button>

            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-9 w-9 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
              />
            )}
          </div>
        </div>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel="Update"
        />
      </div>
    </div>
  );
};

export default CompanyMasterForm;
 