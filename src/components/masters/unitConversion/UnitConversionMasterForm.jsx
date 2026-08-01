import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import unitConversionAPI from "../../../api/unitConversionAPI";
import unitMasterAPI from "../../../api/unitAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
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
            if (typeof opt === 'object') {
              return (
                <option key={opt.id} value={opt.id}>
                  {opt.unitId || opt.unitName || opt.valuesDescription || opt.name || opt.label || String(opt)}
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
  validation = {},
}) => (
  <div>
    <label className={labelClasses}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} is required` : false,
        ...validation,
      }}
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

const UnitConversionMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const [unitOptions, setUnitOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [form, setForm] = useState({
    fromUnit: "",
    toUnit: "",
    multiplicationFactor: "",
    id: 0,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load unit options from unit master API
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const units = await unitMasterAPI.getUnits(branch, orgId);
        console.log("Loaded units:", units);
        setUnitOptions(units);
      } catch (error) {
        console.error("Failed to load units:", error);
      }
    };
    loadUnits();
  }, [orgId, branch]);

  // Fetch unit conversion data by ID when editing
  useEffect(() => {
    const fetchUnitConversionData = async () => {
      console.log("=== FORM DEBUGGING ===");
      console.log("Data prop received:", data);
      console.log("Data type:", typeof data);
      console.log("Data keys:", data ? Object.keys(data) : "No data");
      console.log("======================");

      // Get the ID from data prop - check multiple possible sources
      const idToFetch = data?.id || data?.conversionId || data?.uomConversionId || data?.uomId;

      console.log("ID to fetch:", idToFetch);

      if (idToFetch) {
        setIsLoading(true);
        try {
          // Fetch the conversion data by ID
          const response = await unitConversionAPI.getUnitConversionById(idToFetch);
          console.log("API Response:", response);

          // Extract the conversion data from response
          const conversionData = response?.paramObjectsMap?.uomConversionVO || response;

          console.log("Extracted conversion data:", conversionData);

          if (conversionData && conversionData.id) {
            // Extract unit IDs from nested objects
            let fromUnitId = "";
            let toUnitId = "";

            // Check if fromUnit is an object with id property
            if (conversionData.fromUnit && typeof conversionData.fromUnit === 'object') {
              fromUnitId = conversionData.fromUnit.id || conversionData.fromUnit.unitId || "";
              console.log("FromUnit is object with ID:", fromUnitId);
            } else {
              fromUnitId = conversionData.fromUnit || "";
              console.log("FromUnit is direct value:", fromUnitId);
            }

            // Check if toUnit is an object with id property
            if (conversionData.toUnit && typeof conversionData.toUnit === 'object') {
              toUnitId = conversionData.toUnit.id || conversionData.toUnit.unitId || "";
              console.log("ToUnit is object with ID:", toUnitId);
            } else {
              toUnitId = conversionData.toUnit || "";
              console.log("ToUnit is direct value:", toUnitId);
            }

            console.log("Setting form with:", {
              id: conversionData.id,
              fromUnitId: fromUnitId,
              toUnitId: toUnitId,
              multiplicationFactor: conversionData.multiplicationFactor
            });

            setForm({
              id: conversionData.id || 0,
              fromUnit: fromUnitId,
              toUnit: toUnitId,
              multiplicationFactor: conversionData.multiplicationFactor || conversionData.conversionFactor || "",
            });
          } else if (data) {
            // Fallback to passed data
            console.log("Using fallback data:", data);
            // Handle both nested object and direct value cases
            let fromUnitId = "";
            let toUnitId = "";

            if (data.fromUnit && typeof data.fromUnit === 'object') {
              fromUnitId = data.fromUnit.id || data.fromUnit.unitId || "";
            } else {
              fromUnitId = data.fromUnit || "";
            }

            if (data.toUnit && typeof data.toUnit === 'object') {
              toUnitId = data.toUnit.id || data.toUnit.unitId || "";
            } else {
              toUnitId = data.toUnit || "";
            }

            setForm({
              id: data.id || 0,
              fromUnit: fromUnitId,
              toUnit: toUnitId,
              multiplicationFactor: data.multiplicationFactor || data.conversionFactor || "",
            });
          } else {
            console.log("No data to load, this is a new entry");
          }
        } catch (error) {
          console.error("Error fetching unit conversion data:", error);
          setToastMessage({
            type: "error",
            message: "Failed to load unit conversion data"
          });
        } finally {
          setIsLoading(false);
        }
      } else if (data) {
        // If data is passed directly (not through API)
        console.log("No ID found, using data directly:", data);
        // Handle both nested object and direct value cases
        let fromUnitId = "";
        let toUnitId = "";

        if (data.fromUnit && typeof data.fromUnit === 'object') {
          fromUnitId = data.fromUnit.id || data.fromUnit.unitId || "";
        } else {
          fromUnitId = data.fromUnit || "";
        }

        if (data.toUnit && typeof data.toUnit === 'object') {
          toUnitId = data.toUnit.id || data.toUnit.unitId || "";
        } else {
          toUnitId = data.toUnit || "";
        }

        setForm({
          id: data.id || 0,
          fromUnit: fromUnitId,
          toUnit: toUnitId,
          multiplicationFactor: data.multiplicationFactor || data.conversionFactor || "",
        });
      } else {
        console.log("No data provided, this is a new entry");
        // Reset form for new entry
        setForm({
          fromUnit: "",
          toUnit: "",
          multiplicationFactor: "",
          id: 0,
        });
      }
    };

    fetchUnitConversionData();
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear errors for this field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // If changing fromUnit, check if toUnit is the same
    if (name === 'fromUnit' && value === form.toUnit) {
      setFieldErrors((prev) => ({
        ...prev,
        toUnit: "From Unit and To Unit cannot be the same"
      }));
    }

    // If changing toUnit, check if it matches fromUnit
    if (name === 'toUnit' && value === form.fromUnit) {
      setFieldErrors((prev) => ({
        ...prev,
        toUnit: "From Unit and To Unit cannot be the same"
      }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Get filtered options for To Unit (exclude selected From Unit)
  const getToUnitOptions = () => {
    if (!form.fromUnit) return unitOptions;
    return unitOptions.filter(opt => {
      const optId = typeof opt === 'object' ? opt.id : opt;
      return String(optId) !== String(form.fromUnit);
    });
  };

  // Get filtered options for From Unit (exclude selected To Unit)
  const getFromUnitOptions = () => {
    if (!form.toUnit) return unitOptions;
    return unitOptions.filter(opt => {
      const optId = typeof opt === 'object' ? opt.id : opt;
      return String(optId) !== String(form.toUnit);
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.fromUnit) errors.fromUnit = "From Unit is required";
    if (!form.toUnit) errors.toUnit = "To Unit is required";
    if (form.fromUnit === form.toUnit) {
      errors.toUnit = "From Unit and To Unit cannot be the same";
    }
    if (!form.multiplicationFactor) errors.multiplicationFactor = "Multiplication Factor is required";
    if (form.multiplicationFactor && parseFloat(form.multiplicationFactor) <= 0) {
      errors.multiplicationFactor = "Multiplication Factor must be greater than 0";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setToastMessage(null);

    try {
      // Find the selected unit objects to get the unit IDs
      const selectedFromUnit = unitOptions.find(opt => String(opt.id) === String(form.fromUnit));
      const selectedToUnit = unitOptions.find(opt => String(opt.id) === String(form.toUnit));

      // Get the actual unit IDs (using the unit ID from the unit master)
      const fromUnitId = selectedFromUnit?.id || parseInt(form.fromUnit);
      const toUnitId = selectedToUnit?.id || parseInt(form.toUnit);

      const payload = {
        ...(form.id && form.id !== 0 ? { id: form.id } : {}),
        active: true,
        orgId: Number(orgId),
        branch: Number(branch),
        cancelRemarks: "",
        description: "",
        // Send the unit IDs as the fromUnit and toUnit values
        fromUnit: fromUnitId,
        toUnit: toUnitId,
        multiplicationFactor: parseFloat(form.multiplicationFactor),
        createdBy: localStorage.getItem("userName") || "System",
      };

      console.log("Saving payload:", payload);

      const response = await unitConversionAPI.saveUnitConversion(payload);
      console.log("Save response:", response);

      if (response?.status === true) {
        // Success
        setToastMessage({
          type: "success",
          message: form.id ? "Unit Conversion Updated Successfully!" : "Unit Conversion Saved Successfully!"
        });

        // Close the form after short delay
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        console.error("Failed to save unit conversion:", response);
        setToastMessage({
          type: "error",
          message: response?.message || "Failed to save unit conversion"
        });
      }
    } catch (error) {
      console.error("Error saving unit conversion:", error);
      setToastMessage({
        type: "error",
        message: error.message || "Error saving unit conversion"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
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
            Loading Unit Conversion...
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading Unit Conversion data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-3 p-3 rounded-lg ${toastMessage.type === "success"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {form.id && form.id !== 0 ? "Edit Unit Conversion" : "Add Unit Conversion"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* All fields in one row - 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* From Unit */}
            <div>
              <label className={labelClasses}>
                From Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="fromUnit"
                value={form.fromUnit}
                onChange={handleChange}
                className={controlClasses + (fieldErrors.fromUnit ? " border-red-500" : "")}
              >
                <option value="">Select From Unit</option>
                {getFromUnitOptions().map((opt) => {
                  const optId = typeof opt === 'object' ? opt.id : opt;
                  const optLabel = typeof opt === 'object'
                    ? (opt.unitId || opt.unitName || opt.valuesDescription || opt.name || opt.label || String(opt))
                    : opt;
                  return (
                    <option key={optId} value={optId}>
                      {optLabel}
                    </option>
                  );
                })}
              </select>
              {fieldErrors.fromUnit && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.fromUnit}</p>
              )}
            </div>

            {/* To Unit */}
            <div>
              <label className={labelClasses}>
                To Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="toUnit"
                value={form.toUnit}
                onChange={handleChange}
                className={controlClasses + (fieldErrors.toUnit ? " border-red-500" : "")}
                disabled={!form.fromUnit}
              >
                <option value="">Select To Unit</option>
                {getToUnitOptions().map((opt) => {
                  const optId = typeof opt === 'object' ? opt.id : opt;
                  const optLabel = typeof opt === 'object'
                    ? (opt.unitId || opt.unitName || opt.valuesDescription || opt.name || opt.label || String(opt))
                    : opt;
                  return (
                    <option key={optId} value={optId}>
                      {optLabel}
                    </option>
                  );
                })}
              </select>
              {!form.fromUnit && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Please select From Unit first
                </p>
              )}
              {fieldErrors.toUnit && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.toUnit}</p>
              )}
            </div>

            {/* Multiplication Factor */}
            <div>
              <label className={labelClasses}>
                Multiplication Factor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="multiplicationFactor"
                value={form.multiplicationFactor}
                onChange={handleChange}
                placeholder="Enter multiplication factor"
                step="0.0001"
                min="0.0001"
                className={controlClasses + (fieldErrors.multiplicationFactor ? " border-red-500" : "")}
              />
              {fieldErrors.multiplicationFactor && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.multiplicationFactor}</p>
              )}
            </div>
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
              {isSubmitting ? "Saving..." : form.id && form.id !== 0 ? "Update" : "Save"}
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
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
            {options && options.map((opt) => {
              if (typeof opt === 'object') {
                const value = opt.id || opt.value || '';
                const label = opt.unitId || opt.unitName || opt.valuesDescription || opt.name || opt.label || String(opt);
                return (
                  <option key={value || Math.random()} value={value}>
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

export default UnitConversionMasterForm;