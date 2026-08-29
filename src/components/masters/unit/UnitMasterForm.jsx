import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import unitAPI from "../../../api/unitAPI";

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
  unitCode: "",
  description: "",
  active: true,
});

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
          value={field.value || ""}
        />
      )}
    />
    {errors?.[name] && (
      <p className="text-red-500 text-[10px] mt-0.5">{errors[name].message}</p>
    )}
  </div>
);

const UnitMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [numericId, setNumericId] = useState(null);
  const hasLoadedRef = useRef(false);

  console.log("=== FORM COMPONENT MOUNTED ===");
  console.log("Data prop received:", data);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const loadUnit = async () => {
      // Extract the numeric ID from the data prop
      let id = null;

      if (data) {
        // Priority: numericId > id > unitId
        id = data.numericId || data.id || null;

        // If no numeric ID found, log error
        if (!id) {
          console.warn("No numeric ID found in data:", data);
          console.warn("Available keys:", Object.keys(data));
        }
      }

      console.log("=== USEFFECT TRIGGERED ===");
      console.log("Extracted numeric ID:", id);
      console.log("Original data:", data);

      if (!id) {
        console.log("No numeric ID - Add mode");
        setIsEditMode(false);
        setNumericId(null);
        reset(getDefaultValues());
        return;
      }

      // Prevent double loading
      if (hasLoadedRef.current && isEditMode && numericId === id) {
        console.log("Already loaded, skipping...");
        return;
      }

      setIsEditMode(true);
      setNumericId(id);
      setLoading(true);
      setLoadError("");

      console.log("=== EDIT MODE: Fetching unit data ===");
      console.log(`Calling API with numeric ID: ${id}`);

      try {
        // Call API with the numeric ID
        console.log(`Making API call: /api/commonmaster/getUnitMasterById?id=${id}`);
        const unit = await unitAPI.getUnitById(id);
        console.log("API call completed. Unit data:", unit);

        if (unit) {
          const formValues = {
            unitCode: unit.unitId || unit.unitCode || "",
            description: unit.description || "",
            active: unit.active === "Active" || unit.active === true,
          };

          console.log("Resetting form with values:", formValues);
          reset(formValues);
          hasLoadedRef.current = true;
          console.log("Form reset complete!");
        } else {
          console.error("No unit data returned from API");
          setLoadError("Unit data not found");
        }
      } catch (error) {
        console.error("Error loading unit:", error);
        setLoadError(`Failed to load unit details: ${error.message || "Please try again."}`);
      } finally {
        setLoading(false);
      }
    };

    loadUnit();
  }, [data, reset]); // Watch the entire data prop

  const onSubmit = async (formData) => {
    setSubmitError("");

    try {
      const payload = {
        id: numericId, // Include the numeric ID for update
        unitId: formData.unitCode,
        description: formData.description,
        orgId: Number(orgId),
        createdBy: localStorage.getItem("userName") || "SYSTEM",
        active: formData.active !== undefined ? formData.active : true,
        cancelRemarks: "",
      };

      console.log("=== SUBMITTING FORM ===");
      console.log("Form Data:", formData);
      console.log("Payload:", payload);
      console.log("Numeric ID being used:", numericId);

      await unitAPI.saveUnit(payload);
      console.log("Save successful!");
      onBack();
    } catch (error) {
      console.error("Error saving unit:", error);
      setSubmitError(error.message || "Failed to save unit. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-2 max-w-7xl relative">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Loading Unit Details...
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

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
          {isEditMode ? "Edit Unit" : "Add Unit"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {loadError && (
          <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-red-500 text-xs">{loadError}</p>
            <button
              onClick={() => {
                setLoadError("");
                hasLoadedRef.current = false;
                if (numericId) {
                  const loadUnit = async () => {
                    try {
                      setLoading(true);
                      const unit = await unitAPI.getUnitById(numericId);
                      if (unit) {
                        reset({
                          unitCode: unit.unitId || unit.unitCode || "",
                          description: unit.description || "",
                          active: unit.active === "Active" || unit.active === true,
                        });
                        hasLoadedRef.current = true;
                      }
                    } catch (error) {
                      console.error("Error reloading unit:", error);
                      setLoadError("Failed to reload unit details.");
                    } finally {
                      setLoading(false);
                    }
                  };
                  loadUnit();
                }
              }}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Retry
            </button>
          </div>
        )}

        {submitError && (
          <p className="text-red-500 text-xs mb-2">{submitError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <InputField
              control={control}
              name="unitCode"
              label="Unit Code"
              required
              placeholder="Enter unit code"
              errors={errors}
            />

            <InputField
              control={control}
              name="description"
              label="Description"
              required
              placeholder="Enter description"
              errors={errors}
            />
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
              disabled={isSubmitting || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-3 w-3" />{" "}
              {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitMasterForm;