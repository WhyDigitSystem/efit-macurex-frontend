import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";

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
  placeholder = "",
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select name={name} value={value} onChange={onChange} className={controlClasses}>
          <option value="">Select</option>
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
        placeholder={placeholder}
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

// New grid layout for vertical/structured fields
const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const EmployeeMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeTab, setActiveTab] = useState("official");

  const [form, setForm] = useState({
    // Official Information (Tab 1)
    employeeId: data?.employeeId || "",
    surName: data?.surName || "",
    middleName: data?.middleName || "",
    fatherHusbandName: data?.fatherHusbandName || "",
    salutation: data?.salutation || "Mr.",
    accountHead: data?.accountHead || "",
    sex: data?.sex || "Male",
    dateOfBirth: data?.dateOfBirth || "",

    // Temp Address
    tempCity: data?.tempCity || "",
    tempState: data?.tempState || "",
    tempCountry: data?.tempCountry || "India",
    tempPinCode: data?.tempPinCode || "",

    // Telephone/Contact
    telephone: data?.telephone || "",
    mobile: data?.mobile || "",
    email: data?.email || "",
    qualification: data?.qualification || "",
    grade: data?.grade || "",
    passportNo: data?.passportNo || "",
    panNo: data?.panNo || "",
    bloodGroup: data?.bloodGroup || "",
    nominee: data?.nominee || "",

    // Permanent Address
    permCity: data?.permCity || "",
    permState: data?.permState || "",
    permCountry: data?.permCountry || "India",
    permPincode: data?.permPincode || "",

    // Personal Information (Tab 2)
    cardNo: data?.cardNo || "",
    pfNo: data?.pfNo || "",
    temporaryCardNo: data?.temporaryCardNo || "",
    esiNo: data?.esiNo || "",
    dateOfJoining: data?.dateOfJoining || "",
    plantId: data?.plantId || "",
    vpfPercent: data?.vpfPercent || "",
    department: data?.department || "",
    dateOfConfirmation: data?.dateOfConfirmation || "",
    designation: data?.designation || "",
    active: data?.active ?? true,
    natureOfEmployment: data?.natureOfEmployment || "",
    trainingStartDate: data?.trainingStartDate || "",
    overtimeApplicable: data?.overtimeApplicable || "No",
    trainingEndDate: data?.trainingEndDate || "",
    refBy: data?.refBy || "",
    noticePeriod: data?.noticePeriod || "",
    okdBy: data?.okdBy || "",
    currentSalaryPeriodStart: data?.currentSalaryPeriodStart || "",
    modeOfPayment: data?.modeOfPayment || "",
    currentSalaryPeriodEnd: data?.currentSalaryPeriodEnd || "",
    bankAcNo: data?.bankAcNo || "",
    bankName: data?.bankName || "",

    id: data?.id || "",
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

    if (!form.employeeId.trim())
      errors.employeeId = "Employee ID is required";
    if (!form.surName.trim())
      errors.surName = "Sur Name is required";
    if (!form.sex)
      errors.sex = "Sex is required";
    if (!form.dateOfBirth)
      errors.dateOfBirth = "Date of Birth is required";
    if (!form.permCity.trim())
      errors.permCity = "City is required";
    if (!form.permState.trim())
      errors.permState = "State is required";
    if (!form.dateOfJoining)
      errors.dateOfJoining = "Date of Joining is required";
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
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Employee" : "Add Employee"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
          <button
            type="button"
            onClick={() => setActiveTab("official")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t ${activeTab === "official"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              } transition-colors`}
          >
            Official Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t ${activeTab === "personal"
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
            {/* Official Information Section */}
            <div>
              <SectionHeader>Official Information</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="Employee ID"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  error={fieldErrors.employeeId}
                  required
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
                  label="City"
                  type="select"
                  name="tempCity"
                  value={form.tempCity}
                  onChange={handleChange}
                  placeholder="Enter City"
                  options={[
                    { value: "Bengaluru", label: "Bengaluru" },
                    { value: "Chennai", label: "Chennai" },
                  ]}
                />
                <Field
                  label="State"
                  type="select"
                  name="tempState"
                  value={form.tempState}
                  onChange={handleChange}
                  placeholder="Enter State"
                  options={[
                    { value: "Karnataka", label: "Karnataka" },
                    { value: "TamilNadu", label: "Tamil Nadu" },
                  ]}
                />
                <Field
                  label="Country"
                  type="select"
                  name="tempCountry"
                  value={form.tempCountry}
                  onChange={handleChange}
                  placeholder="Enter Country"
                  options={[
                    { value: "India", label: "India" },
                  ]}
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
                  label="City"
                  type="select"
                  name="permCity"
                  value={form.permCity}
                  onChange={handleChange}
                  error={fieldErrors.permCity}
                  required
                  placeholder="Enter City"
                   options={[
                    { value: "Bengaluru", label: "Bengaluru" },
                    { value: "Chennai", label: "Chennai" },
                  ]}
                />
                <Field
                  label="State"
                  type="select"
                  name="permState"
                  value={form.permState}
                  onChange={handleChange}
                  error={fieldErrors.permState}
                  required
                  placeholder="Enter State"
                  options={[
                    { value: "Karnataka", label: "Karnataka" },
                    { value: "TamilNadu", label: "Tamil Nadu" },
                  ]}
                />
                <Field
                  label="Country"
                  type="select"
                  name="permCountry"
                  value={form.permCountry}
                  onChange={handleChange}
                  placeholder="Enter Country"
                  options={[
                    { value: "India", label: "India" },
                  ]}
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
                  label="Plant ID"
                  name="plantId"
                  value={form.plantId}
                  onChange={handleChange}
                  placeholder="Enter Plant ID"
                />
                <Field
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  error={fieldErrors.department}
                  required
                  placeholder="Enter Department"
                />
                <Field
                  label="Designation"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  error={fieldErrors.designation}
                  required
                  placeholder="Enter Designation"
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
                  placeholder="Enter Date Of Confirmation"
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
                  placeholder="Enter Training Start Date"
                />
                <Field
                  type="date"
                  label="Training End Date"
                  name="trainingEndDate"
                  value={form.trainingEndDate}
                  onChange={handleChange}
                  placeholder="Enter Training End Date"
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
                  placeholder="Enter Current Salary Period Start"
                />
                <Field
                  type="date"
                  label="Current Salary Period End"
                  name="currentSalaryPeriodEnd"
                  value={form.currentSalaryPeriodEnd}
                  onChange={handleChange}
                  placeholder="Enter Current Salary Period End"
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