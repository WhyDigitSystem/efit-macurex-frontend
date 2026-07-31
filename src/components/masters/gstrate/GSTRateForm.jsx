import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import unitMasterAPI from "../../../api/unitAPI";
import hsnSacAPI from "../../../api/hsnSacAPI";
import gstRateApi from "../../../api/gatRateAPI";

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

// SelectField Component
const SelectField = ({ control, name, label, options, required, errors, disabled = false }) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <select {...field} className={controlClasses} disabled={disabled}>
          <option value="">Select</option>
          {options.map((opt) => {
            if (typeof opt === "object" && opt !== null) {
              const value = opt.id ?? "";
              const label =
                opt.hsn ||                 // <-- Add this
                opt.valueDescription ||
                opt.valuesDescription ||
                opt.description ||
                opt.name ||
                opt.label ||
                "";

              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            }

            return (
              <option key={opt} value={opt}>
                {opt}
              </option>
            );
          })}
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

const GSTRateForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [hsnCodeOptions, setHsnCodeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const taxableOptions = ["Yes", "No"];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const rate = watch("rate");
  const selectedHsnCode = watch("hsnCode");

  // Load category options
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const category = await listOfValuesAPI.getListValuesGroup('HSN/SAC', orgId);
        console.log("Loaded categories:", category);
        setCategoryOptions(category);
      } catch (error) {
        console.error("Failed to load category:", error);
      }
    };
    loadCategory();
  }, [orgId]);

  // Load HSN/SAC code options
  useEffect(() => {
    const loadHsnCode = async () => {
      try {
        const hsnCode = await hsnSacAPI.getAll(orgId, branch);
        console.log("Loaded HSN/SAC codes:", hsnCode);
        setHsnCodeOptions(
          hsnCode.map(item => ({
            id: item.id,
            hsn: item.hsn,              // <-- use hsn instead of hsnCode/label
            description: item.description,
          }))
        );
      } catch (error) {
        console.error("Failed to load HSN/SAC codes:", error);
      }
    };
    loadHsnCode();
  }, [orgId, branch]);

  // Auto-populate description when HSN code is selected
  useEffect(() => {
    if (selectedHsnCode) {
      const selectedHsn = hsnCodeOptions.find(
        opt => String(opt.id) === String(selectedHsnCode)
      );
      if (selectedHsn) {
        setValue("description", selectedHsn.description || selectedHsn.hsn || "");
        console.log("Auto-populated description:", selectedHsn.description);
      }
    }
  }, [selectedHsnCode, hsnCodeOptions, setValue]);

  // Fetch data when editing
  useEffect(() => {
    const fetchData = async () => {
      const idToFetch = data?.id;

      if (idToFetch) {
        setIsLoading(true);
        try {
          const response = await gstRateApi.getGSTRateById(idToFetch);
          console.log("Fetched GST Rate data:", response);

          if (response) {
            // Extract values from the response
            const categoryId = response.category?.id || "";
            const categoryValue = response.category?.valueDescription || "";

            const hsnId = response.hsnSacCode?.id || "";
            const hsnValue = response.hsnSacCode?.hsn || "";

            // Find matching options
            const categoryOption = categoryOptions.find(
              opt => String(opt.id) === String(categoryId)
            );

            const hsnOption = hsnCodeOptions.find(
              opt => String(opt.id) === String(hsnId)
            );

            // Reset form with values
            reset({
              category: categoryOption?.id || categoryId || "",
              hsnCode: hsnOption?.id || hsnId || "",
              description: response.description || "",
              WEF: response.wef || "",
              taxable: response.taxable === true ? "Yes" : "No",
              rate: response.rate || 0,
              igstRate: response.igst || 0,
              sgstRate: response.sgst || 0,
              cgstRate: response.cgst || 0,
            });

            console.log("Form reset with values:", {
              category: categoryOption?.id || categoryId,
              hsnCode: hsnOption?.id || hsnId,
              description: response.description,
              WEF: response.wef,
              taxable: response.taxable === true ? "Yes" : "No",
              rate: response.rate,
            });
          }
        } catch (error) {
          console.error("Error fetching GST Rate data:", error);
          setToastMessage({
            type: "error",
            message: "Failed to load GST Rate data"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [data, reset, categoryOptions, hsnCodeOptions]);

  // Auto-calculate GST rates when rate changes
  const calculateGSTRates = (rateValue) => {
    const rateNum = parseFloat(rateValue) || 0;

    if (rateNum === 0 || isNaN(rateNum)) {
      setValue("igstRate", 0);
      setValue("sgstRate", 0);
      setValue("cgstRate", 0);
      return;
    }

    const igst = rateNum;
    const halfRate = rateNum / 2;

    setValue("igstRate", igst);
    setValue("sgstRate", halfRate);
    setValue("cgstRate", halfRate);
  };

  useEffect(() => {
    if (rate !== undefined && rate !== null && rate !== "") {
      calculateGSTRates(rate);
    }
  }, [rate]);

  const onSubmit = async (formData) => {
    try {
      console.log("Form Data:", formData);

      const selectedCategory = categoryOptions.find(
        opt => String(opt.id) === String(formData.category)
      );

      const selectedHsn = hsnCodeOptions.find(
        opt => String(opt.id) === String(formData.hsnCode)
      );

      const payload = {
        orgId: Number(orgId),
        branch: Number(branch),
        category: selectedCategory?.id || parseInt(formData.category) || 0,
        hsnSacCode: selectedHsn?.id || parseInt(formData.hsnCode) || 0,
        description: formData.description || "",
        wef: formData.WEF || "",
        taxable: formData.taxable === "Yes" ? true : false,
        rate: parseFloat(formData.rate) || 0,
        igst: parseFloat(formData.igstRate) || 0,
        sgst: parseFloat(formData.sgstRate) || 0,
        cgst: parseFloat(formData.cgstRate) || 0,
        active: true,
        createdBy: localStorage.getItem("userName") || "System",
        cancelRemarks: "",
        duplicateCheck: true,
        financialYear: localStorage.getItem("finYear") || "",
      };

      if (data?.id) {
        payload.id = data.id;
      }

      console.log("Saving payload:", payload);

      const response = await gstRateApi.createUpdateGSTRate(payload);
      console.log("Save response:", response);

      if (response?.status === true) {
        setToastMessage({
          type: "success",
          message: data?.id ? "GST Rate Updated Successfully!" : "GST Rate Saved Successfully!"
        });

        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        throw new Error(response?.message || "Failed to save GST Rate");
      }

    } catch (error) {
      console.error("Error saving GST Rate:", error);
      setToastMessage({
        type: "error",
        message: error.message || "Failed to save GST Rate"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 max-w-7xl">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Loading GST Rate...
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading GST Rate data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {toastMessage && (
        <div className={`mb-3 p-3 rounded-lg ${toastMessage.type === "success"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}>
          {toastMessage.message}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Edit GST Rate" : "Add GST Rate"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <SelectField
              control={control}
              name="category"
              label="Category"
              options={categoryOptions}
              required
              errors={errors}
            />

            <SelectField
              control={control}
              name="hsnCode"
              label="HSN/SAC Code"
              options={hsnCodeOptions}
              required
              errors={errors}
            />

            <InputField
              control={control}
              name="description"
              label="Description"
              placeholder="Auto-populated from HSN selection"
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
              label="Taxable"
              options={taxableOptions}
              required
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
              {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GSTRateForm;