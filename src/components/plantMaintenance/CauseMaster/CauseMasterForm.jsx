import { ArrowLeft, FilePlus2, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import causeMasterAPI, {
  MAINTENANCE_TYPES,
} from "../../../api/plantMaintenance/causeMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 [color-scheme:light dark:color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4";

const CauseMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH = localStorage.getItem("branch") || "";
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const saveCounter = useRef(0);

  const fieldLabels = {
    department: "Department",
    maintenanceType: "Maintenance Type",
    causeCode: "Cause Code",
    cause: "Cause",
  };

  const [form, setForm] = useState({
    id: 0,
    department: "",
    maintenanceType: "",
    causeCode: "",
    cause: "",
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  });

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(ORG_ID, BRANCH);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      if (departments.length) {
        setDepartmentOptions(
          departments.map((d) => ({
            value: d.departmentName,
            label: d.departmentName,
          })),
        );
      } else {
        setDepartmentOptions([
          { value: "Design", label: "Design" },
          { value: "Purchase", label: "Purchase" },
          { value: "Stores", label: "Stores" },
          { value: "Quality", label: "Quality" },
          { value: "Production", label: "Production" },
          { value: "Maintenance", label: "Maintenance" },
        ]);
      }
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([
        { value: "Design", label: "Design" },
        { value: "Purchase", label: "Purchase" },
        { value: "Stores", label: "Stores" },
        { value: "Quality", label: "Quality" },
        { value: "Production", label: "Production" },
        { value: "Maintenance", label: "Maintenance" },
      ]);
    }
  }, [ORG_ID, BRANCH]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    const initializeForm = async () => {
      if (editId && editId > 0) {
        await loadCauseData(editId);
      } else if (editData) {
        populateFormFromEditData(editData);
      }
    };

    initializeForm();
  }, [editId, editData]);

  const populateFormFromEditData = (data) => {
    setForm({
      id: data.id || 0,
      department: data.department || "",
      maintenanceType: data.maintenanceType || "",
      causeCode: data.causeCode || "",
      cause: data.cause || "",
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });
  };

  const loadCauseData = async (causeId) => {
    try {
      setLoading(true);
      const causeData = await causeMasterAPI.getCauseById(causeId);

      if (causeData) {
        setForm({
          id: causeData.id || 0,
          department: causeData.department || "",
          maintenanceType: causeData.maintenanceType || "",
          causeCode: causeData.causeCode || "",
          cause: causeData.cause || "",
          orgId: causeData.orgId || ORG_ID,
          createdBy: causeData.createdBy || CREATED_BY,
        });
      }
    } catch (error) {
      console.error("Error loading cause data:", error);
      addToast("Failed to load cause data", "error");
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
      department: "",
      maintenanceType: "",
      causeCode: "",
      cause: "",
      orgId: ORG_ID,
      createdBy: CREATED_BY,
    });
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};

    if (!form.department.trim()) {
      errors.department = "Department is required";
    }

    if (!form.maintenanceType.trim()) {
      errors.maintenanceType = "Maintenance Type is required";
    }

    if (!form.causeCode.trim()) {
      errors.causeCode = "Cause Code is required";
    }

    if (!form.cause.trim()) {
      errors.cause = "Cause is required";
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

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    saveCounter.current += 1;

    const payload = {
      ...(form.id && form.id > 0 && { id: form.id }),
      department: form.department.trim(),
      maintenanceType: form.maintenanceType.trim(),
      causeCode: form.causeCode.trim().toUpperCase(),
      cause: form.cause.trim(),
      orgId: form.orgId,
      createdBy: form.createdBy,
      requestNo: `REQ-${Date.now()}-${saveCounter.current}`,
    };

    console.log("Submitting Cause Payload:", payload);

    try {
      const response = await causeMasterAPI.createUpdateCause(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Cause updated successfully!"
            : "Cause created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.causeVO?.id || payload.id,
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
          "Failed to save cause";

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
          {editData || editId ? "Edit Cause" : "Add Cause"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className={fieldGrid}>
          {/* Department (dropdown, mandatory) */}
          <div>
            <label className={labelClasses}>
              Department <span className="text-red-500">*</span>
            </label>

            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.department ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Select Department --</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {fieldErrors.department && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.department}
              </p>
            )}
          </div>

          {/* Maintenance Type (dropdown, mandatory) */}
          <div>
            <label className={labelClasses}>
              Maintenance Type <span className="text-red-500">*</span>
            </label>

            <select
              name="maintenanceType"
              value={form.maintenanceType}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.maintenanceType ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Select Maintenance Type --</option>
              {MAINTENANCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {fieldErrors.maintenanceType && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.maintenanceType}
              </p>
            )}
          </div>

          {/* Cause Code (text field, mandatory) */}
          <div>
            <label className={labelClasses}>
              Cause Code <span className="text-red-500">*</span>
            </label>

            <input
              name="causeCode"
              value={form.causeCode}
              onChange={handleChange}
              placeholder="Enter cause code"
              className={`${controlClasses} ${
                fieldErrors.causeCode ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.causeCode && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.causeCode}
              </p>
            )}
          </div>
        </div>

        {/* Cause (text field, mandatory — full width on next row) */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 mt-4">
          <div>
            <label className={labelClasses}>
              Cause <span className="text-red-500">*</span>
            </label>

            <input
              name="cause"
              value={form.cause}
              onChange={handleChange}
              placeholder="Enter cause description"
              className={`${controlClasses} ${
                fieldErrors.cause ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.cause && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.cause}
              </p>
            )}
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
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-60"
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

export default CauseMasterForm;
