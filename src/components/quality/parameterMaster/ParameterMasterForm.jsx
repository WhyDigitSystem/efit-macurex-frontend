import { ArrowLeft, FilePlus2, Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import parameterMasterAPI from "../../../api/quality/parameterMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ToggleButton = ({ value, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!value)}
    disabled={disabled}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
);

const getDefaultForm = (orgId, createdBy) => ({
  id: 0,

  parameterCode: "",

  parameterType: "",

  parameterDescription: "",

  screenCode: "",

  screenName: "",

  active: true,

  cancel: false,

  cancelRemarks: "",

  orgId,

  createdBy,

  updatedBy: createdBy,
});

/* ============================================================================= */
/* Normalize parameterType coming back from the backend.                        */
/*                                                                                 */
/* It has been observed in EITHER shape:                                        */
/*   - a plain id (number/string)                                               */
/*   - a full object { id, code, description }                                  */
/*                                                                                 */
/* The form's <select> needs a plain scalar id as its `value`, so this always   */
/* extracts just the id.                                                        */
/* ============================================================================= */

const normalizeParameterType = (rawType) => {
  if (rawType === null || rawType === undefined) {
    return "";
  }

  if (typeof rawType === "object") {
    return rawType.id ?? "";
  }

  return rawType;
};

const ParameterMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const CURRENT_USER = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const isEditMode = Boolean(editId || editData?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [typeOptions, setTypeOptions] = useState([]);

  const fieldLabels = {
    parameterCode: "Parameter Code",
    parameterType: "Parameter Type",
  };

  const [form, setForm] = useState(() => getDefaultForm(ORG_ID, CURRENT_USER));

  /* ========================================================================= */
  /* PARAMETER TYPE DROPDOWN                                                   */
  /* ========================================================================= */

  const loadTypeOptions = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const options = await parameterMasterAPI.getParameterTypeOptions(ORG_ID);

      setTypeOptions(options);
    } catch (error) {
      console.error("Failed to load parameter type options:", error);

      setTypeOptions([]);
    }
  }, [ORG_ID]);

  useEffect(() => {
    loadTypeOptions();
  }, [loadTypeOptions]);

  /* ========================================================================= */
  /* INITIALIZE FORM (create / edit-by-data / edit-by-id)                     */
  /* ========================================================================= */

  const populateFormFromRecord = (data) => {
    setForm({
      id: data.id || 0,

      parameterCode: data.parameterCode || "",

      parameterType: normalizeParameterType(data.parameterType),

      parameterDescription: data.parameterDescription || "",

      screenCode: data.screenCode || "",

      screenName: data.screenName || "",

      active: data.active !== false,

      cancel: data.cancel === true,

      cancelRemarks: data.cancelRemarks || "",

      orgId: data.orgId || ORG_ID,

      createdBy: data.createdBy || CURRENT_USER,

      updatedBy: CURRENT_USER,
    });
  };

  const loadParameterData = useCallback(
    async (id) => {
      try {
        setLoading(true);

        const record = await parameterMasterAPI.getParameterMasterById(id);

        if (record) {
          populateFormFromRecord(record);
        }
      } catch (error) {
        console.error("Error loading parameter master:", error);

        addToast("Failed to load parameter data", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  useEffect(() => {
    const initializeForm = async () => {
      if (editId && editId > 0) {
        await loadParameterData(editId);
      } else if (editData) {
        populateFormFromRecord(editData);
      } else {
        setForm(getDefaultForm(ORG_ID, CURRENT_USER));
      }
    };

    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, editData]);

  /* ========================================================================= */
  /* FIELD CHANGE                                                              */
  /* ========================================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setForm(getDefaultForm(ORG_ID, CURRENT_USER));

    setFieldErrors({});
  };

  /* ========================================================================= */
  /* VALIDATION                                                               */
  /* ========================================================================= */

  const validateForm = () => {
    const errors = {};

    if (!form.parameterCode.trim()) {
      errors.parameterCode = "Parameter Code is required";
    }

    if (form.parameterType === "" || form.parameterType === null) {
      errors.parameterType = "Parameter Type is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];

      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;

      addToast(`${fieldLabel}: ${errors[firstErrorField]}`, "error");

      return false;
    }

    return true;
  };

  /* ========================================================================= */
  /* SAVE                                                                      */
  /* ========================================================================= */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      active: form.active !== false,

      cancel: form.cancel === true,

      cancelRemarks: "",

      createdBy: form.createdBy || CURRENT_USER,

      ...(form.id && form.id > 0 && { id: form.id }),

      orgId: form.orgId || ORG_ID,

      parameterCode: form.parameterCode,

      parameterDescription: form.parameterDescription || "",

      parameterType: Number(form.parameterType),

      screenCode: form.screenCode || "",

      screenName: form.screenName || "",

      updatedBy: CURRENT_USER,
    };

    console.log("Submitting Parameter Master Payload:", payload);

    try {
      const response =
        await parameterMasterAPI.createUpdateParameterMaster(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (isEditMode
            ? "Parameter updated successfully!"
            : "Parameter created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          onSave(payload);
        } else {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save parameter";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);

      const errorMessage =
        error?.response?.data?.paramObjectsMap?.errorMessage ||
        error?.response?.data?.paramObjectsMap?.message ||
        error?.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Parameter" : "Add Parameter"}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <ToggleButton
            value={form.active}
            onChange={(v) => setForm((p) => ({ ...p, active: v }))}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Parameter Code */}
          <div>
            <label className={labelClasses}>
              Parameter Code <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="parameterCode"
              value={form.parameterCode}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.parameterCode ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.parameterCode && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.parameterCode}
              </p>
            )}
          </div>

          {/* Parameter Type (dropdown, mandatory) */}
          <div>
            <label className={labelClasses}>
              Parameter Type <span className="text-red-500">*</span>
            </label>

            <select
              name="parameterType"
              value={form.parameterType}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.parameterType ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Select Parameter Type --</option>
              {typeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {fieldErrors.parameterType && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.parameterType}
              </p>
            )}
          </div>

          {/* Screen Code */}
          {/* <div>
            <label className={labelClasses}>Screen Code</label>

            <input
              name="screenCode"
              value={form.screenCode}
              onChange={handleChange}
              placeholder="e.g. PO"
              className={controlClasses}
            />
          </div> */}

          {/* Screen Name */}
          {/* <div>
            <label className={labelClasses}>Screen Name</label>

            <input
              name="screenName"
              value={form.screenName}
              onChange={handleChange}
              placeholder="e.g. Purchase Order"
              className={controlClasses}
            />
          </div> */}

          {/* Cancel toggle (only meaningful in edit mode) */}
          {isEditMode && (
            <div>
              <label className={labelClasses}>Cancel</label>

              <ToggleButton
                value={form.cancel}
                onChange={(v) => setForm((p) => ({ ...p, cancel: v }))}
              />
            </div>
          )}
        </div>

        {/* Parameter Description (optional, multiline) */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label className={labelClasses}>Parameter Description</label>

            <textarea
              name="parameterDescription"
              value={form.parameterDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Enter parameter description (optional)"
              className={
                "w-full px-2 py-1.5 rounded border text-xs leading-relaxed transition-colors " +
                "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
                "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
                "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                "dark:focus:ring-blue-400 dark:focus:border-blue-400"
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleNew}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <FilePlus2 className="h-3 w-3" />
            New
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParameterMasterForm;
