import { ArrowLeft, Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import countryAPI from "../../../api/countryAPI";
import stateAPI from "../../../api/stateAPI";
import cityAPI from "../../../api/cityAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { designationAPI } from "../../../api/designationAPI";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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
  placeholder = "",
  disabled = false,
}) => {
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
          className={`${controlClasses} text-gray-900 dark:text-white`}
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="text-black dark:text-white"
            >
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
        className={`${controlClasses} appearance-none`}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
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
/* helpers                                                                      */

// Normalizes a nested API ref object (e.g. tempCountry / tempState / tempCitys)
// into a flat { id, name } shape, or falls back to a plain string value.
const normalizeRef = (val, nameKey) => {
  if (val && typeof val === "object") {
    return { id: val.id ?? "", name: val[nameKey] || "" };
  }
  return { id: "", name: val ?? "" };
};

// Unwraps a department/designation list response regardless of envelope shape.
// Handles: plain array, { paramObjectsMap: { departmentVO / designationVO } }, { data }.
const unwrapList = (res, ...keys) => {
  if (Array.isArray(res)) return res;
  for (const k of keys) {
    if (Array.isArray(res?.paramObjectsMap?.[k])) return res.paramObjectsMap[k];
  }
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const emptyForm = () => ({
  id: "",
  employeeId: "",
  surName: "",
  middleName: "",
  fatherHusbandName: "",
  salutation: "Mr.",
  accountHead: "",
  sex: "Male",
  dateOfBirth: "",

  // Temp Address (id + display name kept separately)
  tempAddressLine: "",
  tempCountry: "",
  tempCountryName: "",
  tempState: "",
  tempStateName: "",
  tempCity: "",
  tempCityName: "",
  tempPinCode: "",

  telephone: "",
  mobile: "",
  email: "",
  qualification: "",
  grade: "",
  passportNo: "",
  panNo: "",
  bloodGroup: "",
  nominee: "",

  // Permanent Address
  permanentAddressLine: "",
  permCountry: "",
  permCountryName: "",
  permState: "",
  permStateName: "",
  permCity: "",
  permCityName: "",
  permPincode: "",

  cardNo: "",
  pfNo: "",
  temporaryCardNo: "",
  esiNo: "",
  esiDispName: "",
  dateOfJoining: "",
  plantId: "",
  vpfPercent: "",
  department: "",
  departmentId: "",
  dateOfConfirmation: "",
  designation: "",
  designationId: "",
  branchId: "",
  active: true,
  natureOfEmployment: "",
  trainingStartDate: "",
  overtimeApplicable: "No",
  trainingEndDate: "",
  refBy: "",
  noticePeriod: "",
  okdBy: "",
  okdById: "",
  currentSalaryPeriodStart: "",
  modeOfPayment: "",
  currentSalaryPeriodEnd: "",
  bankAcNo: "",
  bankName: "",
});

/* ---------------------------------------------------------------------------- */

const EmployeeMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeTab, setActiveTab] = useState("official");
  const { addToast } = useToast();

  const [form, setForm] = useState(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Country/State/City lists — kept separate for Temp vs Permanent address
  const [countries, setCountries] = useState([]);
  const [tempStates, setTempStates] = useState([]);
  const [tempCities, setTempCities] = useState([]);
  const [permStates, setPermStates] = useState([]);
  const [permCities, setPermCities] = useState([]);

  // Department/Designation lists — scoped to the selected Plant (branch)
  const [plantData, setPlantData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  /* ---------------- load countries once ---------------- */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await countryAPI.getCountries(orgId);
        setCountries(res || []);
      } catch (error) {
        console.error("Country loading error", error);
      }
    };
    if (orgId) fetchCountries();
  }, [orgId]);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map((branch) => ({
        value: branch.id,
        label: branch.branchName,
      }));
      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
    }
  }, [orgId]);

  /* ---------------- load department/designation whenever Plant ID changes ---------------- */
  useEffect(() => {
    if (!orgId || !form.plantId) {
      setDepartments([]);
      setDesignations([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await departmentAPI.getAllDepartments(orgId, form.plantId);
        setDepartments(unwrapList(res, "departmentVO", "departmentList"));
      } catch (error) {
        console.error("Department loading error", error);
      }
      try {
        const res = await designationAPI.getAllDesignations(
          orgId,
          form.plantId,
        );
        setDesignations(unwrapList(res, "designationVO", "designationList"));
      } catch (error) {
        console.error("Designation loading error", error);
      }
    }, 350); // small debounce since Plant ID is a free-typed field

    return () => clearTimeout(timer);
  }, [orgId, form.plantId]);

  /* ---------------- populate form from API record ---------------- */
  const populateForm = async (emp) => {
    if (!emp) return;

    const tempCountryRef = normalizeRef(emp.tempCountry, "countryName");
    const tempStateRef = normalizeRef(emp.tempState, "stateName");
    const tempCityRef = normalizeRef(emp.tempCitys, "cityName");

    const permCountryRef = normalizeRef(emp.permanentCountry, "countryName");
    const permStateRef = normalizeRef(emp.permanentState, "stateName");
    const permCityRef = normalizeRef(emp.permanentCitys, "cityName");

    setForm({
      ...emptyForm(),
      id: emp.id || "",
      employeeId: emp.employeeId || "",
      surName: emp.surName || "",
      middleName: emp.middleName || "",
      fatherHusbandName: emp.fatherHusbandName || "",
      salutation: emp.title || "Mr.",
      accountHead: emp.accountHead || "",
      sex: emp.sex || "Male",
      dateOfBirth: emp.dateOfBirth || "",

      tempAddressLine: emp.tempAddressLine || "",
      tempCountry: tempCountryRef.id,
      tempCountryName: tempCountryRef.name,
      tempState: tempStateRef.id,
      tempStateName: tempStateRef.name,
      tempCity: tempCityRef.id,
      tempCityName: tempCityRef.name,
      tempPinCode: emp.tempPincode ?? "",

      telephone: emp.telephone ?? "",
      mobile: emp.mobile ?? "",
      email: emp.email || "",
      qualification: emp.qualification || "",
      grade: emp.grade || "",
      passportNo: emp.passportNo || "",
      panNo: emp.panNo || "",
      bloodGroup: emp.bloodGroup || "",
      nominee: emp.nominee || "",

      permanentAddressLine: emp.permanentAddressLine || "",
      permCountry: permCountryRef.id,
      permCountryName: permCountryRef.name,
      permState: permStateRef.id,
      permStateName: permStateRef.name,
      permCity: permCityRef.id,
      permCityName: permCityRef.name,
      permPincode: emp.permanentPincode ?? "",

      cardNo: emp.cardNo || "",
      pfNo: emp.pfNo || "",
      temporaryCardNo: emp.temporaryCardNo || "",
      esiNo: emp.esiNo || "",
      esiDispName: emp.esiDispName || "",
      dateOfJoining: emp.dateOfJoining || "",
      plantId: emp.plant?.id || "",
      vpfPercent: emp.vpfPercentage ?? "",

      department: emp.department?.departmentName || "",
      departmentId: emp.department?.id || "",

      dateOfConfirmation: emp.dateOfConfirmation || "",

      designation: emp.designation?.designationName || "",
      designationId: emp.designation?.id || "",

      branchId: emp.branch?.id || emp.plant?.id || "",
      active: emp.active ?? true,
      natureOfEmployment: emp.natureOfEmployment || "",
      trainingStartDate: emp.trainingStartDate || "",
      overtimeApplicable: emp.overTimeApplicable || "No",
      trainingEndDate: emp.trainingEndDate || "",
      refBy: emp.referenceBy || "",
      noticePeriod: emp.noticePeriod ?? "",
      okdBy: emp.okdBy?.employeeName || "",
      okdById: emp.okdBy?.id || "",
      currentSalaryPeriodStart: emp.currentSalaryPeriodStart || "",
      modeOfPayment: emp.modeOfPayment || "",
      currentSalaryPeriodEnd: emp.currentSalaryPeriodEnd || "",
      bankAcNo: emp.bankAccountNo || "",
      bankName: emp.bankName || "",
    });

    // Preload dependent dropdowns so edit shows correct chain
    if (tempCountryRef.id) {
      try {
        const st = await stateAPI.getStatesByCountry(tempCountryRef.id, orgId);
        setTempStates(st || []);
      } catch (e) {
        console.error("Temp state preload error", e);
      }
    }
    if (tempStateRef.id) {
      try {
        const ct = await cityAPI.getCitiesByState(orgId, tempStateRef.id);
        setTempCities(ct || []);
      } catch (e) {
        console.error("Temp city preload error", e);
      }
    }
    if (permCountryRef.id) {
      try {
        const st = await stateAPI.getStatesByCountry(permCountryRef.id, orgId);
        setPermStates(st || []);
      } catch (e) {
        console.error("Perm state preload error", e);
      }
    }
    if (permStateRef.id) {
      try {
        const ct = await cityAPI.getCitiesByState(orgId, permStateRef.id);
        setPermCities(ct || []);
      } catch (e) {
        console.error("Perm city preload error", e);
      }
    }
    // Department/Designation lists load automatically via the plantId effect above.
  };

  useEffect(() => {
    if (data) populateForm(data);
  }, [data]);

  /* ---------------- cascading handlers: TEMP address ---------------- */
  const handleTempCountryChange = async (e) => {
    const countryId = e.target.value;
    const selected = countries.find((c) => String(c.id) === String(countryId));

    setForm((prev) => ({
      ...prev,
      tempCountry: countryId,
      tempCountryName: selected?.countryName || "",
      tempState: "",
      tempStateName: "",
      tempCity: "",
      tempCityName: "",
    }));
    setTempCities([]);
    setTempStates([]);

    if (countryId) {
      try {
        const st = await stateAPI.getStatesByCountry(countryId, orgId);
        setTempStates(st || []);
      } catch (error) {
        console.error("Temp state loading error", error);
      }
    }
  };

  const handleTempStateChange = async (e) => {
    const stateId = e.target.value;
    const selected = tempStates.find((s) => String(s.id) === String(stateId));

    setForm((prev) => ({
      ...prev,
      tempState: stateId,
      tempStateName: selected?.stateName || "",
      tempCity: "",
      tempCityName: "",
    }));
    setTempCities([]);

    if (stateId) {
      try {
        const ct = await cityAPI.getCitiesByState(orgId, stateId);
        setTempCities(ct || []);
      } catch (error) {
        console.error("Temp city loading error", error);
      }
    }
  };

  const handleTempCityChange = (e) => {
    const cityId = e.target.value;
    const selected = tempCities.find((c) => String(c.id) === String(cityId));
    setForm((prev) => ({
      ...prev,
      tempCity: cityId,
      tempCityName: selected?.cityName || "",
    }));
  };

  /* ---------------- cascading handlers: PERMANENT address ---------------- */
  const handlePermCountryChange = async (e) => {
    const countryId = e.target.value;
    const selected = countries.find((c) => String(c.id) === String(countryId));

    setForm((prev) => ({
      ...prev,
      permCountry: countryId,
      permCountryName: selected?.countryName || "",
      permState: "",
      permStateName: "",
      permCity: "",
      permCityName: "",
    }));
    setPermCities([]);
    setPermStates([]);

    if (countryId) {
      try {
        const st = await stateAPI.getStatesByCountry(countryId, orgId);
        setPermStates(st || []);
      } catch (error) {
        console.error("Perm state loading error", error);
      }
    }
  };

  const handlePermStateChange = async (e) => {
    const stateId = e.target.value;
    const selected = permStates.find((s) => String(s.id) === String(stateId));

    setForm((prev) => ({
      ...prev,
      permState: stateId,
      permStateName: selected?.stateName || "",
      permCity: "",
      permCityName: "",
    }));
    setPermCities([]);

    if (stateId) {
      try {
        const ct = await cityAPI.getCitiesByState(orgId, stateId);
        setPermCities(ct || []);
      } catch (error) {
        console.error("Perm city loading error", error);
      }
    }
  };

  const handlePermCityChange = (e) => {
    const cityId = e.target.value;
    const selected = permCities.find((c) => String(c.id) === String(cityId));
    setForm((prev) => ({
      ...prev,
      permCity: cityId,
      permCityName: selected?.cityName || "",
    }));
  };

  /* ---------------- Department / Designation handlers ---------------- */
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const selected = departments.find((d) => String(d.id) === String(deptId));

    if (fieldErrors.department) {
      setFieldErrors((prev) => ({ ...prev, department: "" }));
    }

    setForm((prev) => ({
      ...prev,
      departmentId: deptId,
      department: selected?.departmentName || "",
    }));
  };

  const handleDesignationChange = (e) => {
    const desigId = e.target.value;
    const selected = designations.find((d) => String(d.id) === String(desigId));

    if (fieldErrors.designation) {
      setFieldErrors((prev) => ({ ...prev, designation: "" }));
    }

    setForm((prev) => ({
      ...prev,
      designationId: desigId,
      designation: selected?.designationName || "",
    }));
  };

  /* ---------------- generic change handler ---------------- */
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

  /* ---------------- validation ---------------- */
  const validate = () => {
    const errors = {};

    if (!form.surName.trim()) errors.surName = "Sur Name is required";
    if (!form.sex) errors.sex = "Sex is required";
    if (!form.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";

    if (!String(form.permCountry || "").trim())
      errors.permCountry = "Country is required";
    if (!String(form.permState || "").trim())
      errors.permState = "State is required";
    if (!String(form.permCity || "").trim())
      errors.permCity = "City is required";

    if (!form.dateOfJoining)
      errors.dateOfJoining = "Date of Joining is required";
    if (!String(form.departmentId || "").trim())
      errors.department = "Department is required";
    if (!String(form.designationId || "").trim())
      errors.designation = "Designation is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- save ---------------- */
  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    // Matches the updateCreateEmployeeMaster DTO shape
    const payload = {
      ...(form.id && { id: Number(form.id) }),
      employeeId: form.employeeId || null,
      surName: form.surName,
      middleName: form.middleName,
      fatherHusbandName: form.fatherHusbandName,
      title: form.salutation,
      accountHead: form.accountHead,
      sex: form.sex,
      dateOfBirth: form.dateOfBirth,

      tempAddressLine: form.tempAddressLine,
      tempCountryId: form.tempCountry ? Number(form.tempCountry) : null,
      tempStateId: form.tempState ? Number(form.tempState) : null,
      tempCityId: form.tempCity ? Number(form.tempCity) : null,
      tempPincode: form.tempPinCode ? Number(form.tempPinCode) : null,

      telephone: form.telephone ? Number(form.telephone) : null,
      mobile: form.mobile ? Number(form.mobile) : null,
      email: form.email,
      qualification: form.qualification,
      grade: form.grade,
      passportNo: form.passportNo,
      panNo: form.panNo,
      bloodGroup: form.bloodGroup,
      nominee: form.nominee,

      permanentAddressLine: form.permanentAddressLine,
      permanentCountryId: form.permCountry ? Number(form.permCountry) : null,
      permanentStateId: form.permState ? Number(form.permState) : null,
      permanentCity: form.permCity ? Number(form.permCity) : null,
      permanentPincode: form.permPincode ? Number(form.permPincode) : null,

      cardNo: form.cardNo,
      temporaryCardNo: form.temporaryCardNo,
      pfNo: form.pfNo,
      esiNo: form.esiNo,
      esiDispName: form.esiDispName,
      vpfPercentage: form.vpfPercent ? Number(form.vpfPercent) : null,

      dateOfJoining: form.dateOfJoining,
      plantId: form.plantId ? Number(form.plantId) : null,
      branchId: form.branchId ? Number(form.branchId) : null,

      departmentId: form.departmentId ? Number(form.departmentId) : null,
      designationId: form.designationId ? Number(form.designationId) : null,

      dateOfConfirmation: form.dateOfConfirmation,

      natureOfEmployment: form.natureOfEmployment,
      overTimeApplicable: form.overtimeApplicable,
      trainingStartDate: form.trainingStartDate,
      trainingEndDate: form.trainingEndDate,
      referenceBy: form.refBy,
      noticePeriod: form.noticePeriod ? Number(form.noticePeriod) : null,
      okdById: form.okdById ? Number(form.okdById) : null,

      currentSalaryPeriodStart: form.currentSalaryPeriodStart,
      currentSalaryPeriodEnd: form.currentSalaryPeriodEnd,
      modeOfPayment: form.modeOfPayment,
      bankAccountNo: form.bankAcNo,
      bankName: form.bankName,

      active: Boolean(form.active),

      cancelRemarks: "",
      screenName: "Employee Master",
      screenCode: "EMP001",
      orgId: Number(orgId),
      financialYear: new Date().getFullYear().toString(),
      createdBy: data ? undefined : "Admin",
      updatedBy: "Admin",
    };

    try {
      const response = await employeeAPI.updateCreateEmployee(payload);

      if (response?.status) {
        addToast(
          data
            ? "Employee updated successfully!"
            : "Employee saved successfully!",
        );
        onBack();
      } else {
        const msg =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          "Failed to save employee";
        addToast(msg);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      const serverMsg =
        error?.response?.data?.errors?.[0]?.longMessage ||
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      addToast(serverMsg);
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
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Employee" : "Add Employee"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
          <button
            type="button"
            onClick={() => setActiveTab("official")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t ${
              activeTab === "official"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            } transition-colors`}
          >
            Official Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t ${
              activeTab === "personal"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            } transition-colors`}
          >
            Personal Information
          </button>
        </div>

        {/* Tab 1: Official Information */}
        {activeTab === "official" && (
          <div className="space-y-3 pt-2">
            <div>
              <SectionHeader>Official Information</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="Employee ID"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="Enter Employee ID"
                />
                <Field
                  label="Sur Name"
                  name="surName"
                  value={form.surName}
                  onChange={handleChange}
                  error={fieldErrors.surName}
                  required
                  placeholder="Enter Sur Name"
                />
                <Field
                  label="Middle Name"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  placeholder="Enter Middle Name"
                />
                <Field
                  label="Father/ Husband Name"
                  name="fatherHusbandName"
                  value={form.fatherHusbandName}
                  onChange={handleChange}
                  placeholder="Enter Father/Husband Name"
                />
                <Field
                  type="select"
                  label="Mr./Ms./Mrs."
                  name="salutation"
                  value={form.salutation}
                  onChange={handleChange}
                  options={[
                    { value: "Mr.", label: "Mr." },
                    { value: "Ms.", label: "Ms." },
                    { value: "Mrs.", label: "Mrs." },
                    { value: "Dr.", label: "Dr." },
                  ]}
                />
                <Field
                  label="Account Head"
                  name="accountHead"
                  value={form.accountHead}
                  onChange={handleChange}
                  placeholder="Enter Account Head"
                />
                <Field
                  type="select"
                  label="Sex"
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                  error={fieldErrors.sex}
                  required
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                />
                <Field
                  type="date"
                  label="Date Of Birth"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  error={fieldErrors.dateOfBirth}
                  required
                />
              </div>
            </div>

            {/* Temporary Address */}
            <div>
              <SectionHeader>Temp. Address</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="Address Line"
                  name="tempAddressLine"
                  value={form.tempAddressLine}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className="col-span-2"
                />
                <Field
                  type="select"
                  label="Country"
                  name="tempCountry"
                  value={form.tempCountry}
                  onChange={handleTempCountryChange}
                  options={[
                    ...(form.tempCountry &&
                    !countries.some(
                      (c) => String(c.id) === String(form.tempCountry),
                    )
                      ? [
                          {
                            id: form.tempCountry,
                            countryName: form.tempCountryName,
                          },
                        ]
                      : []),
                    ...countries,
                  ].map((c) => ({ value: c.id, label: c.countryName }))}
                />
                <Field
                  type="select"
                  label="State"
                  name="tempState"
                  value={form.tempState}
                  onChange={handleTempStateChange}
                  disabled={!form.tempCountry}
                  options={[
                    ...(form.tempState &&
                    !tempStates.some(
                      (s) => String(s.id) === String(form.tempState),
                    )
                      ? [{ id: form.tempState, stateName: form.tempStateName }]
                      : []),
                    ...tempStates,
                  ].map((s) => ({ value: s.id, label: s.stateName }))}
                />
                <Field
                  type="select"
                  label="City"
                  name="tempCity"
                  value={form.tempCity}
                  onChange={handleTempCityChange}
                  disabled={!form.tempState}
                  options={[
                    ...(form.tempCity &&
                    !tempCities.some(
                      (c) => String(c.id) === String(form.tempCity),
                    )
                      ? [{ id: form.tempCity, cityName: form.tempCityName }]
                      : []),
                    ...tempCities,
                  ].map((c) => ({ value: c.id, label: c.cityName }))}
                />
                <Field
                  label="Pin Code"
                  name="tempPinCode"
                  value={form.tempPinCode}
                  onChange={handleChange}
                  placeholder="Enter Pin Code"
                />
              </div>
            </div>

            {/* Telephone */}
            <div>
              <SectionHeader>Telephone</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="Telephone"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="Enter Telephone"
                />
                <Field
                  label="Mobile"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter Mobile"
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                />
                <Field
                  label="Qualification"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="Enter Qualification"
                />
                <Field
                  label="Grade"
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  placeholder="Enter Grade"
                />
                <Field
                  label="Passport No."
                  name="passportNo"
                  value={form.passportNo}
                  onChange={handleChange}
                  placeholder="Enter Passport No"
                />
                <Field
                  label="PAN NO"
                  name="panNo"
                  value={form.panNo}
                  onChange={handleChange}
                  placeholder="Enter PAN NO"
                />
                <Field
                  label="Blood Group"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  placeholder="Enter Blood Group"
                />
                <Field
                  label="Nominee"
                  name="nominee"
                  value={form.nominee}
                  onChange={handleChange}
                  placeholder="Enter Nominee"
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <SectionHeader>Permanent Address</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="Address Line"
                  name="permanentAddressLine"
                  value={form.permanentAddressLine}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className="col-span-2"
                />
                <Field
                  type="select"
                  label="Country"
                  name="permCountry"
                  value={form.permCountry}
                  onChange={handlePermCountryChange}
                  error={fieldErrors.permCountry}
                  required
                  options={[
                    ...(form.permCountry &&
                    !countries.some(
                      (c) => String(c.id) === String(form.permCountry),
                    )
                      ? [
                          {
                            id: form.permCountry,
                            countryName: form.permCountryName,
                          },
                        ]
                      : []),
                    ...countries,
                  ].map((c) => ({ value: c.id, label: c.countryName }))}
                />
                <Field
                  type="select"
                  label="State"
                  name="permState"
                  value={form.permState}
                  onChange={handlePermStateChange}
                  error={fieldErrors.permState}
                  required
                  disabled={!form.permCountry}
                  options={[
                    ...(form.permState &&
                    !permStates.some(
                      (s) => String(s.id) === String(form.permState),
                    )
                      ? [{ id: form.permState, stateName: form.permStateName }]
                      : []),
                    ...permStates,
                  ].map((s) => ({ value: s.id, label: s.stateName }))}
                />
                <Field
                  type="select"
                  label="City"
                  name="permCity"
                  value={form.permCity}
                  onChange={handlePermCityChange}
                  error={fieldErrors.permCity}
                  required
                  disabled={!form.permState}
                  options={[
                    ...(form.permCity &&
                    !permCities.some(
                      (c) => String(c.id) === String(form.permCity),
                    )
                      ? [{ id: form.permCity, cityName: form.permCityName }]
                      : []),
                    ...permCities,
                  ].map((c) => ({ value: c.id, label: c.cityName }))}
                />
                <Field
                  label="Pincode"
                  name="permPincode"
                  value={form.permPincode}
                  onChange={handleChange}
                  placeholder="Enter Pincode"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Personal Information */}
        {activeTab === "personal" && (
          <div className="space-y-3 pt-2">
            <div>
              <SectionHeader>Personal Information</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="Card No."
                  name="cardNo"
                  value={form.cardNo}
                  onChange={handleChange}
                  placeholder="Enter Card No"
                />
                <Field
                  label="Temporary Card No."
                  name="temporaryCardNo"
                  value={form.temporaryCardNo}
                  onChange={handleChange}
                  placeholder="Enter Temporary Card No"
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
                  type="select"
                  label="Plant ID"
                  name="plantId"
                  value={form.plantId}
                  options={plantData}
                  onChange={handleChange}
                  placeholder="Enter Plant ID"
                />
                <Field
                  type="select"
                  label="Department"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleDepartmentChange}
                  error={fieldErrors.department}
                  required
                  disabled={!form.plantId}
                  options={[
                    ...(form.departmentId &&
                    !departments.some(
                      (d) => String(d.id) === String(form.departmentId),
                    )
                      ? [
                          {
                            id: form.departmentId,
                            departmentName: form.department,
                          },
                        ]
                      : []),
                    ...departments,
                  ].map((d) => ({ value: d.id, label: d.departmentName }))}
                />
                <Field
                  type="select"
                  label="Designation"
                  name="designationId"
                  value={form.designationId}
                  onChange={handleDesignationChange}
                  error={fieldErrors.designation}
                  required
                  disabled={!form.departmentId}
                  options={[
                    ...(form.designationId &&
                    !designations.some(
                      (d) => String(d.id) === String(form.designationId),
                    )
                      ? [
                          {
                            id: form.designationId,
                            designationName: form.designation,
                          },
                        ]
                      : []),
                    ...designations,
                  ].map((d) => ({
                    value: d.id,
                    label: d.designation,
                  }))}
                />
                <Field
                  label="Nature of Employment"
                  name="natureOfEmployment"
                  value={form.natureOfEmployment}
                  onChange={handleChange}
                  placeholder="Enter Nature of Employment"
                />
                <Field
                  type="select"
                  label="Over Time Applicable"
                  name="overtimeApplicable"
                  value={form.overtimeApplicable}
                  onChange={handleChange}
                  options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
                />
                <Field
                  label="Ref. By"
                  name="refBy"
                  value={form.refBy}
                  onChange={handleChange}
                  placeholder="Enter Ref. By"
                />
                <Field
                  label="OK'D By"
                  name="okdBy"
                  value={form.okdBy}
                  onChange={handleChange}
                  placeholder="Enter OK'D By"
                />
                <Field
                  type="select"
                  label="Mode Of Payment"
                  name="modeOfPayment"
                  value={form.modeOfPayment}
                  onChange={handleChange}
                  options={[
                    { value: "Bank Transfer", label: "Bank Transfer" },
                    { value: "Cash", label: "Cash" },
                    { value: "Cheque", label: "Cheque" },
                  ]}
                />
                <Field
                  label="Bank A/c No."
                  name="bankAcNo"
                  value={form.bankAcNo}
                  onChange={handleChange}
                  placeholder="Enter Bank A/c No"
                />
                <Field
                  label="Bank Name"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  placeholder="Enter Bank Name"
                />
                <Field
                  label="PF No."
                  name="pfNo"
                  value={form.pfNo}
                  onChange={handleChange}
                  placeholder="Enter PF No"
                />
                <Field
                  label="ESI No."
                  name="esiNo"
                  value={form.esiNo}
                  onChange={handleChange}
                  placeholder="Enter ESI No"
                />
                <Field
                  label="VPF %"
                  name="vpfPercent"
                  value={form.vpfPercent}
                  onChange={handleChange}
                  placeholder="Enter VPF %"
                />
                <Field
                  type="date"
                  label="Date Of Confirmation"
                  name="dateOfConfirmation"
                  value={form.dateOfConfirmation}
                  onChange={handleChange}
                />
                <Field
                  type="checkbox"
                  label="Active"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />
                <Field
                  type="date"
                  label="Training Start Date"
                  name="trainingStartDate"
                  value={form.trainingStartDate}
                  onChange={handleChange}
                />
                <Field
                  type="date"
                  label="Training End Date"
                  name="trainingEndDate"
                  value={form.trainingEndDate}
                  onChange={handleChange}
                />
                <Field
                  label="Notice Period"
                  name="noticePeriod"
                  value={form.noticePeriod}
                  onChange={handleChange}
                  placeholder="Enter Notice Period"
                />
                <Field
                  type="date"
                  label="Current Salary Period Start"
                  name="currentSalaryPeriodStart"
                  value={form.currentSalaryPeriodStart}
                  onChange={handleChange}
                />
                <Field
                  type="date"
                  label="Current Salary Period End"
                  name="currentSalaryPeriodEnd"
                  value={form.currentSalaryPeriodEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
