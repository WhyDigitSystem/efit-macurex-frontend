import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import countryAPI from "../../../api/countryAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const normalizeActive = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "active" || normalized === "true" || normalized === "t") {
      return true;
    }

    if (
      normalized === "inactive" ||
      normalized === "false" ||
      normalized === "f"
    ) {
      return false;
    }
  }

  return Boolean(value);
};

const getActiveValue = (value) => {
  console.log("Country active value from API:", value, typeof value);

  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  if (typeof value === "string") {
    const status = value.trim().toLowerCase();

    if (
      status === "active" ||
      status === "true" ||
      status === "1" ||
      status === "t"
    ) {
      return true;
    }

    if (
      status === "inactive" ||
      status === "false" ||
      status === "0" ||
      status === "f"
    ) {
      return false;
    }
  }

  return false;
};

const CountryMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Field labels for toast messages
  const fieldLabels = {
    countryCode: "Country Code",
    countryName: "Country Name",
  };

  const [form, setForm] = useState({
    id: 0,
    countryNo: "",
    countryCode: "",
    countryName: "",
    active: true,
    cancel: false,
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  });

  // Load country data for editing
  useEffect(() => {
    const initializeForm = async () => {
      if (editId && editId > 0) {
        await loadCountryData(editId);
      } else if (editData) {
        populateFormFromEditData(editData);
      }
    };

    initializeForm();
  }, [editId, editData]);

  const populateFormFromEditData = (data) => {
    setForm({
      id: data.id || 0,
      countryNo: data.countryNo || "",
      countryCode: data.countryCode || "",
      countryName: data.countryName || "",
      active: getActiveValue(data.active),
      cancel: Boolean(data.cancel),
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });
  };

  const loadCountryData = async (countryId) => {
    try {
      setLoading(true);
      const countryData = await countryAPI.getCountryById(countryId);

      if (countryData) {
        setForm({
          id: countryData.id || 0,
          countryNo: countryData.countryNo || "",
          countryCode: countryData.countryCode || "",
          countryName: countryData.countryName || "",
          active: getActiveValue(countryData.active),
          cancel: Boolean(countryData.cancel),
          orgId: countryData.orgId || ORG_ID,
          createdBy: countryData.createdBy || CREATED_BY,
        });
      }
    } catch (error) {
      console.error("Error loading country data:", error);
      addToast("Failed to load country data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "countryNo") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.countryCode.trim())
      errors.countryCode = "Country Code is required";
    if (!form.countryName.trim())
      errors.countryName = "Country Name is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      addToast(`${fieldLabel}: ${errors[firstErrorField]}`, "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      // Only include id if we're editing (id exists and is greater than 0)
      ...(form.id && form.id > 0 && { id: form.id }),
      countryNo: form.countryNo,
      countryCode: form.countryCode.toUpperCase(),
      countryName: form.countryName.toUpperCase(),
      active: Boolean(form.active),
      cancel: Boolean(form.cancel),
      orgId: form.orgId,
      createdBy: form.createdBy,
    };

    console.log("📤 Saving Country Payload:", payload);

    try {
      const response = await countryAPI.createUpdateCountry(payload);
      console.log("📥 Save Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Country updated successfully!"
            : "Country created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.countryVO?.id || payload.id,
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
          "Failed to save country";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
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
          {editData || editId ? "Edit Country" : "Add Country"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className={labelClasses}>
              Country Code <span className="text-red-500">*</span>
            </label>

            <input
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
              className={`${controlClasses} ${fieldErrors.countryCode ? "border-red-500" : ""
                }`}
            />

            {fieldErrors.countryCode && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.countryCode}
              </p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              Country Name <span className="text-red-500">*</span>
            </label>

            <input
              name="countryName"
              value={form.countryName}
              onChange={handleChange}
              className={`${controlClasses} ${fieldErrors.countryName ? "border-red-500" : ""
                }`}
            />

            {fieldErrors.countryName && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.countryName}
              </p>
            )}
          </div>

          {/* Active */}
          <div className="flex items-center gap-2 mt-5">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={Boolean(form.active)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  active: e.target.checked,
                }))
              }
              className="h-4 w-4 accent-blue-600 dark:accent-blue-500 cursor-pointer"
            />

            <label
              htmlFor="active"
              className="text-xs text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              Active
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {isSubmitting
              ? "Saving..."
              : editData || editId
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryMasterForm;
