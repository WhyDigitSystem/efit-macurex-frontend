import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import currencyAPI from "../../../api/currencyAPI";
import countryAPI from "../../../api/countryAPI";
import { toast } from "../../../utils/toast";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultValues = (editData) => ({
  id: editData?.id || 0,
  // If editData has country object with id, use that
  // Otherwise check for countryId
  country: editData?.country?.id
    ? Number(editData.country.id)
    : editData?.countryId
      ? Number(editData.countryId)
      : "",
  mainCurrency: editData?.mainCurrency || "",
  currency: editData?.currency || "",
  subCurrency: editData?.subCurrency || "",
  mainCurrencySymbol: editData?.mainCurrencySymbol || "",
  subSymbol: editData?.subSymbol || "",
  currencyRepresentation: editData?.currencyRepresentation || "",
  currencyInteger: editData?.currencyInteger || "",
  currencyDecimal: editData?.currencyDecimal || "",
  currencyDescription: editData?.currencyDescription || "",
  active: editData?.active ?? true,
});

// Normalizes plain strings ("USD") and {value,label} objects alike into a
// single { value, label } shape, so SelectField never has to guess the
// caller's option format.
const toOptionShape = (opt) => {
  if (opt && typeof opt === "object") {
    return { value: opt.value, label: opt.label };
  }
  return { value: opt, label: opt };
};

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
  disabled,
}) => {
  const normalizedOptions = (options || []).map(toOptionShape);

  return (
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
            onChange={(e) =>
              field.onChange(
                name === "country" ? Number(e.target.value) : e.target.value,
              )
            }
            disabled={disabled}
            className={controlClasses}
          >
            <option value="">Select</option>
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />
      {errors?.[name] && (
        <p className="text-red-500 text-[10px] mt-0.5">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

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

const ToggleButton = ({ control, name }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${field.value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
      >
        <span
          className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${field.value ? "translate-x-6" : "translate-x-0.5"
            }`}
        />
      </button>
    )}
  />
);

const CurrencyForm = ({ data, onBack, onSave }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")));

  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);

  // Sample options for dropdowns not yet backed by a real API
  const currencySymbolOptions = ["$", "€", "£", "₹", "A$", "C$", "¥", "Fr"];
  const currencyRepresentationOptions = ["Symbol", "Code", "Name"];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(data),
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setCountryLoading(true);
      const response = await countryAPI.getCountries(orgId);
      const sortedCountries = (response || []).sort((a, b) =>
        (a.countryName || "").localeCompare(b.countryName || ""),
      );
      setCountries(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setCountryLoading(false);
    }
  };

  // Country options carry both an id (submitted value) and a display name -
  // SelectField normalizes this the same way it normalizes plain strings.
  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: c.countryName,
  }));

  const onSubmit = async (formData) => {
    const payload = {
      id: data?.id ?? 0, // include for update
      countryId: Number(formData.country),
      mainCurrency: formData.mainCurrency,
      currency: formData.currency,
      subCurrency: formData.subCurrency,
      mainCurrencySymbol: formData.mainCurrencySymbol,
      subSymbol: formData.subSymbol,
      currencyRepresentation: formData.currencyRepresentation,
      currencyInteger: formData.currencyInteger,
      currencyDecimal: formData.currencyDecimal,
      currencyDescription: formData.currencyDescription || "",
      active: Boolean(formData.active),
      cancelRemarks: "",
      orgId,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    if (!(payload.id && payload.id > 0)) {
      delete payload.id;
    }

    console.log("📤 Saving Currency Payload:", payload);

    try {
      const response = await currencyAPI.createUpdateCurrency(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (data
            ? "Currency updated successfully!"
            : "Currency created successfully!");

        toast.success(successMessage);

        if (onSave) {
          onSave(payload);
        } else {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save currency";

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      toast.error(errorMessage);
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
          {data ? "Edit Currency" : "Add Currency"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* All fields in one row - 5 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Required Fields */}
            <SelectField
              control={control}
              name="country"
              label="Country"
              options={countryOptions}
              required
              errors={errors}
              disabled={countryLoading}
            />

            <InputField
              control={control}
              name="mainCurrency"
              label="Main Currency"
              required
              placeholder="Enter main currency"
              errors={errors}
            />

            <InputField
              control={control}
              name="currency"
              label="Currency"
              placeholder="Enter currency"
              errors={errors}
            />

            <InputField
              control={control}
              name="subCurrency"
              label="Sub Currency"
              placeholder="Enter currency"
              errors={errors}
            />

            {/* Dropdown Fields */}
            <SelectField
              control={control}
              name="mainCurrencySymbol"
              label="Main Currency Symbol"
              options={currencySymbolOptions}
              errors={errors}
            />

            <SelectField
              control={control}
              name="subSymbol"
              label="Sub Symbol"
              options={currencySymbolOptions}
              errors={errors}
            />

            <SelectField
              control={control}
              name="currencyRepresentation"
              label="Currency Representation"
              options={currencyRepresentationOptions}
              errors={errors}
            />

            <InputField
              control={control}
              name="currencyInteger"
              label="Currency Integer"
              placeholder="Enter integer"
              errors={errors}
            />

            <InputField
              control={control}
              name="currencyDecimal"
              label="Currency Decimal"
              placeholder="Enter decimal"
              errors={errors}
            />

            <InputField
              control={control}
              name="menetaryUnit"
              label="Monetary Unit"
              placeholder="Enter monetary unit"
              errors={errors}
            />

            {/* Active toggle */}
            <div>
              <label className={labelClasses}>Active</label>
              <div className="h-[30px] flex items-center">
                <ToggleButton control={control} name="active" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
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

export default CurrencyForm;
