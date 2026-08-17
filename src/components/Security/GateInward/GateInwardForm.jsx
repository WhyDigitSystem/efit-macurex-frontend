import { ArrowLeft, Save, X, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// Static sample options — no API involved. Swap for real master data later.
const plantOptions = [
  { value: "PLANT1", label: "Plant 1 - Head Office" },
  { value: "PLANT2", label: "Plant 2 - Unit A" },
  { value: "PLANT3", label: "Plant 3 - Unit B" },
];

const partyOptions = [
  { value: "P001", label: "ABC Traders" },
  { value: "P002", label: "Global Supplies Pvt Ltd" },
  { value: "P003", label: "Sunrise Industries" },
];

const partyAddressMap = {
  P001: "12 MG Road, Bengaluru",
  P002: "45 Industrial Area, Pune",
  P003: "8 Sector 5, Gurugram",
};

const docTypeOptions = [
  { value: "PO", label: "Purchase Order" },
  { value: "JOB_WORK", label: "Job Work" },
  { value: "SAMPLE", label: "Sample" },
  { value: "RETURN", label: "Return" },
  { value: "OTHERS", label: "Others" },
];

const modvatOptions = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

const getDefaultValues = (editData) => ({
  id: editData?.id || "",
  plantId: editData?.plantId || "",
  gatePassNo: editData?.gatePassNo || "",
  date: editData?.date || new Date().toISOString().slice(0, 10),

  partyName: editData?.partyId || "",
  partyId: editData?.partyId || "",
  address: editData?.address || "",

  docType: editData?.docType || "",
  modvatCopyReceived: editData?.modvatCopyReceived || "NO",

  supplierInvNo: editData?.supplierInvNo || "",
  invoiceNo: editData?.invoiceNo || "",
  supplierInvDate: editData?.supplierInvDate || "",
  timeOfEntry: editData?.timeOfEntry || "",
});

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  onValueChange,
}) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <select
          {...field}
          value={field.value}
          onChange={(e) => {
            field.onChange(e.target.value);
            onValueChange?.(e.target.value);
          }}
          className={controlClasses}
        >
          <option value="">Select</option>
          {(options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    />
    {errors?.[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
}) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <input
          {...field}
          type={type}
          className={controlClasses}
          placeholder={placeholder}
        />
      )}
    />
    {errors?.[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const DateField = ({ control, name, label, required, errors }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <div className="relative">
          <input {...field} type="date" className={`${controlClasses} pr-7`} />
          <Calendar className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>
      )}
    />
    {errors?.[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const TimeField = ({ control, name, label, required, errors }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <div className="relative">
          <input {...field} type="time" className={`${controlClasses} pr-7`} />
          <Clock className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>
      )}
    />
    {errors?.[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const GateInwardForm = ({ data, onBack, onSave }) => {
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(data),
  });

  // Keep Party Name / Party ID in sync and auto-fill Address — pure local
  // lookup against the static partyOptions/partyAddressMap above.
  const applyPartySelection = (partyValue) => {
    setValue("partyName", partyValue);
    setValue("partyId", partyValue);
    setValue("address", partyAddressMap[partyValue] || "");
  };

  const onSubmit = (formData) => {
    setSubmitting(true);

    const payload = {
      id: data?.id,
      plantId: formData.plantId,
      gatePassNo: formData.gatePassNo,
      date: formData.date,
      partyId: formData.partyId,
      address: formData.address,
      docType: formData.docType,
      modvatCopyReceived: formData.modvatCopyReceived,
      supplierInvNo: formData.supplierInvNo,
      invoiceNo: formData.invoiceNo,
      supplierInvDate: formData.supplierInvDate,
      timeOfEntry: formData.timeOfEntry,
    };

    onSave?.(payload);
    setSubmitting(false);
  };

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Gate Inward" : "Add Gate Inward"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <SelectField
              control={control}
              name="plantId"
              label="Plant ID"
              options={plantOptions}
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="gatePassNo"
              label="Gate Pass No"
              required
              placeholder="Enter gate pass no"
              errors={errors}
            />

            <DateField
              control={control}
              name="date"
              label="Date"
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="partyName"
              label="Party Name"
              options={partyOptions}
              required
              errors={errors}
              onValueChange={applyPartySelection}
            />

            <SelectField
              control={control}
              name="partyId"
              label="Party ID"
              options={partyOptions}
              required
              errors={errors}
              onValueChange={applyPartySelection}
            />

            <InputField
              control={control}
              name="address"
              label="Address"
              placeholder="Auto-filled from Party, editable"
              errors={errors}
            />

            <SelectField
              control={control}
              name="docType"
              label="Doc Type"
              options={docTypeOptions}
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="modvatCopyReceived"
              label="Modvat Copy Received"
              options={modvatOptions}
              errors={errors}
            />

            <InputField
              control={control}
              name="supplierInvNo"
              label="Supplier INV. No."
              placeholder="Enter supplier invoice no"
              errors={errors}
            />

            <InputField
              control={control}
              name="invoiceNo"
              label="Invoice No."
              placeholder="Enter invoice no"
              errors={errors}
            />

            <DateField
              control={control}
              name="supplierInvDate"
              label="Supplier INV. Date"
              errors={errors}
            />

            <TimeField
              control={control}
              name="timeOfEntry"
              label="Time of Entry"
              required
              errors={errors}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-3 w-3" />{" "}
              {submitting ? "Saving..." : data ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GateInwardForm;
