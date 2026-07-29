import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import unitAPI from "../../../api/unitAPI"; // adjust the import path to match your project structure
import branchAPI from "../../../api/branchAPI"; // adjust the import path to match your project structure

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
  branchId: "",
  unitCode: "",
  description: "",
});

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
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

const UnitMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    defaultValues: getDefaultValues(),
  });

  // Load branches for the dropdown.
  useEffect(() => {
    const loadBranches = async () => {
      setBranchesLoading(true);
      try {
        const branches = await branchAPI.getBranchByOrgId(orgId);
        setBranchOptions(branches || []);
      } catch (error) {
        // Non-fatal: leave the dropdown empty and let the user retry via refresh.
        setBranchOptions([]);
      } finally {
        setBranchesLoading(false);
      }
    };

    if (orgId) loadBranches();
  }, [orgId]);

  // When editing, fetch the full record by unitId and populate the form.
  useEffect(() => {
    const loadUnit = async () => {
      if (!data?.unitId) return;
      setLoading(true);
      setLoadError("");
      try {
        const unit = await unitAPI.getUnitById(data.unitId);
        if (unit) {
          reset({
            branchId: unit.branchId || "",
            unitCode: unit.unitCode || "",
            description: unit.description || "",
          });
        }
      } catch (error) {
        setLoadError("Failed to load unit details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadUnit();
  }, [data?.unitId, reset]);

  const onSubmit = async (formData) => {
    setSubmitError("");

    try {
      const payload = {
        unitId: data?.unitId || formData.unitCode,
        description: formData.description,
        orgId: Number(orgId),
        branch: Number(formData.branchId), // <-- send selected branch
        createdBy: localStorage.getItem("userName") || "SYSTEM",
        active: true,
        cancelRemarks: "",
      };

      console.log("Form Data:", formData);
      console.log("Payload:", payload);

      await unitAPI.saveUnit(payload);
      onBack();
    } catch (error) {
      setSubmitError("Failed to save unit. Please try again.");
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
          {data ? "Edit Unit" : "Add Unit"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {loadError && <p className="text-red-500 text-xs mb-2">{loadError}</p>}
        {submitError && (
          <p className="text-red-500 text-xs mb-2">{submitError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* All fields in one row - 5 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Branch Dropdown */}
            <div>
              <label className={labelClasses}>
                Branch <span className="text-red-500">*</span>
              </label>
              <Controller
                name="branchId"
                control={control}
                rules={{ required: "Branch is required" }}
                render={({ field }) => (
                  <select {...field} className={controlClasses}>
                    <option value="">Select</option>

                    {branchOptions.map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id} // or branch.branchId if that's what your API returns
                      >
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors?.branchId && (
                <p className="text-red-500 text-[10px] mt-0.5">
                  {errors.branchId.message}
                </p>
              )}
            </div>

            {/* Required Fields */}
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
              {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

export default UnitMasterForm;
