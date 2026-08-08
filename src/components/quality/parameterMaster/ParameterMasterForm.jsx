import { ArrowLeft, FilePlus2, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import parameterMasterAPI, {
  PARAMETER_TYPES,
} from "../../../api/quality/parameterMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ParameterMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const saveCounter = useRef(0);

  const fieldLabels = {
    parameterId: "Parameter Id",
    parameterType: "Parameter Type",
    parameterDescription: "Parameter Description",
  };

  // Parameter Id is auto-generated when creating a new record.
  // Editing uses the existing id.
  const [form, setForm] = useState({
    id: 0,
    parameterId: "",
    parameterType: "",
    parameterDescription: "",
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (editId && editId > 0) {
        await loadParameterData(editId);
      } else if (editData) {
        populateFormFromEditData(editData);
      } else {
        setForm((prev) => ({ ...prev, parameterId: generateParameterId() }));
      }
    };

    initializeForm();
  }, [editId, editData]);

  const generateParameterId = () => {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");

    return `PARAM-${stamp}`;
  };

  const populateFormFromEditData = (data) => {
    setForm({
      id: data.id || 0,
      parameterId: data.parameterId || data.parameterNo || "",
      parameterType: data.parameterType || "",
      parameterDescription: data.parameterDescription || "",
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });
  };

  const loadParameterData = async (parameterId) => {
    try {
      setLoading(true);
      const parameterData = await parameterMasterAPI.getParameterById(
        parameterId
      );

      if (parameterData) {
        setForm({
          id: parameterData.id || 0,
          parameterId:
            parameterData.parameterId || parameterData.parameterNo || "",
          parameterType: parameterData.parameterType || "",
          parameterDescription: parameterData.parameterDescription || "",
          orgId: parameterData.orgId || ORG_ID,
          createdBy: parameterData.createdBy || CREATED_BY,
        });
      }
    } catch (error) {
      console.error("Error loading parameter data:", error);
      addToast("Failed to load parameter data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setForm({
      id: 0,
      parameterId: generateParameterId(),
      parameterType: "",
      parameterDescription: "",
      orgId: ORG_ID,
      createdBy: CREATED_BY,
    });
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!form.parameterId.trim())
      errors.parameterId = "Parameter Id is required";
    if (!form.parameterType.trim())
      errors.parameterType = "Parameter Type is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      addToast(`${fieldLabel}: ${errors[firstErrorField]}`, "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    saveCounter.current += 1;

    const payload = {
      ...(form.id && form.id > 0 && { id: form.id }),
      parameterId: form.parameterId,
      parameterType: form.parameterType.toUpperCase(),
      parameterDescription: form.parameterDescription,
      orgId: form.orgId,
      createdBy: form.createdBy,
      requestNo: `REQ-${Date.now()}-${saveCounter.current}`,
    };

    console.log("Submitting Parameter Payload:", payload);

    try {
      const response = await parameterMasterAPI.createUpdateParameter(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Parameter updated successfully!"
            : "Parameter created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.parameterVO?.id || payload.id,
          };
          onSave(savedData);
        } else {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save parameter";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
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
          {editData || editId ? "Edit Parameter" : "Add Parameter"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Parameter Id (auto-generated, read-only) */}
          <div>
            <label className={labelClasses}>
              Parameter Id <span className="text-red-500">*</span>
            </label>

            <input
              name="parameterId"
              value={form.parameterId}
              readOnly
              disabled
              className={`${controlClasses} bg-gray-100 dark:bg-gray-800 cursor-not-allowed ${
                fieldErrors.parameterId ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.parameterId && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.parameterId}
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
              {PARAMETER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {fieldErrors.parameterType && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.parameterType}
              </p>
            )}
          </div>
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
            {isSubmitting
              ? "Saving..."
              : editData || editId
                ? "Update"
                : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParameterMasterForm;
