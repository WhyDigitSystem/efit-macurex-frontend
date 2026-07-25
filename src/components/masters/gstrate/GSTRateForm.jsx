import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react"; // Add useEffect import
import { useForm, Controller, useFieldArray } from "react-hook-form";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultValues = () => ({
  category: "",
  hsnCode: "",
  description: "",
  WEF: "",
  taxable: "",
  rate: 0,
  igstRate: 0,
  sgstRate: 0,
  cgstRate: 0,
});

const SelectField = ({ control, name, label, options, required, errors }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <select {...field} className={controlClasses}>
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
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
  min = 0,
  disabled = false,
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
          min={min}
          className={controlClasses}
          placeholder={placeholder}
          disabled={disabled}
          value={field.value ?? 0} 
          onChange={(e) => {
            const val = e.target.value;
            // If field is not disabled, update the value
            if (!disabled) {
              field.onChange(val);
            }
          }}
        />
      )}
    />
    {errors?.[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const ToggleButton = ({ control, name }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
          field.value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
            field.value ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    )}
  />
);

const GSTRateForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const countryOptions = ["Goods", "Services"];
  const taxableOptions = ["Goods", "Services"];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const rate = watch("rate");

  // Auto-calculate GST rates when rate changes
  const calculateGSTRates = (rateValue) => {
    const rateNum = parseFloat(rateValue) || 0;
    
    console.log("Calculating rates for:", rateNum); // Debug log
    
    
    if (rateNum === 0 || isNaN(rateNum)) {
      setValue("igstRate", 0);
      setValue("sgstRate", 0);
      setValue("cgstRate", 0);
      return;
    }

    // For IGST: entire rate as IGST (for inter-state transactions)
    const igst = rateNum;
    
    // For SGST and CGST: split the rate equally (for intra-state transactions)
    const halfRate = rateNum / 2;
    
    console.log("Setting values:", { igst, halfRate }); // Debug log
    
    setValue("igstRate", igst);
    setValue("sgstRate", halfRate);
    setValue("cgstRate", halfRate);
  };

  // Use useEffect to calculate rates whenever rate changes
  useEffect(() => {
    console.log("Rate changed to:", rate); // Debug log
    if (rate !== undefined && rate !== null && rate !== "") {
      calculateGSTRates(rate);
    }
  }, [rate]); // This will run whenever 'rate' changes

  const onSubmit = async (formData) => {
    try {
      console.log("Form Data:", formData, "Org Id:", orgId);
      // API call here
    } catch (error) {
      console.error(error);
    }
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
          {data ? "Edit Gst Rate" : "Add Gst Rate"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* All fields in one row - 5 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <SelectField
              control={control}
              name="category"
              label="Category"
              options={countryOptions}
              required
              errors={errors}
            />
            <SelectField
              control={control}
              name="hsnCode"
              label="HSN/SAC Code"
              options={countryOptions}
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="description"
              label="Description"
              placeholder="Enter description"
              errors={errors}
            />

            <InputField
              type="date"
              control={control}
              name="WEF"
              label="WEF"
              required
              placeholder="Enter Date"
              errors={errors}
            />
            <SelectField
              control={control}
              name="taxable"
              label="Taxable Y/N"
              options={taxableOptions}
              errors={errors}
            />
            <InputField
              type="number"
              control={control}
              name="rate"
              label="Rate"
              placeholder="Enter rate"
              errors={errors}
              required
            />
            <InputField
              type="number"
              control={control}
              name="igstRate"
              disabled={true}
              label="IGST Rate"
              placeholder="Auto-calculated"
              errors={errors}
            />
            <InputField
              type="number"
              control={control}
              name="sgstRate"
              disabled={true}
              label="SGST Rate"
              placeholder="Auto-calculated"
              errors={errors}
            />
            <InputField
              type="number"
              control={control}
              name="cgstRate"
              disabled={true}
              label="CGST Rate"
              placeholder="Auto-calculated"
              errors={errors}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-3 w-3" />{" "}
              {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// TABLE HELPER COMPONENTS
// ============================================================================
const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-1 ${i === 0 ? "w-8 text-center" : "text-left"} dark:text-white`}
        >
          {h.label}
          {h.required && <span className="text-red-500 ml-0.5">*</span>}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white align-middle">
      {index + 1}
    </td>
    {children}
    <td className="p-1 text-center align-middle">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ control, name, options, required, errors }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-8 text-xs w-full ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 text-left w-full">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} h-8 text-xs w-full ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
          />
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 text-left w-full">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

export default GSTRateForm;