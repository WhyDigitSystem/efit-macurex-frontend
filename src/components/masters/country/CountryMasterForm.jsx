import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import countryAPI from "../../../api/countryAPI";
import { FloatingInput } from "../../../utils/InputFields";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const CountryMasterForm = ({ data, onBack }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "";

  const [form, setForm] = useState({
    countryNo: data?.countryNo || "",
    countryCode: data?.countryCode || "",
    countryName: data?.countryName || "",
    id: data?.id || 0,
    active: data?.active === true || data?.active === "Active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "countryNo") {
      setForm((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, ""),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.countryCode.trim()) {
      errors.countryCode = "Country Code is required";
    }

    if (!form.countryName.trim()) {
      errors.countryName = "Country Name is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    const payload = {
      orgId: ORG_ID,
      countryCode: form.countryCode.toUpperCase(),
      countryName: form.countryName.toUpperCase(),
      active: form.active,
      cancel: false,
      createdBy: CREATED_BY,
    };

    console.log("Saving Country Payload:", payload);

    try {
      const response = await countryAPI.createUpdateCountry(payload);

      console.log("Save Response:", response);

      alert(
        form.id
          ? "Country updated successfully!"
          : "Country saved successfully!",
      );

      onBack();
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save country.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {form.id ? "Edit Country" : "Add Country"}
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
              className={`${controlClasses} ${
                fieldErrors.countryCode ? "border-red-500" : ""
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
              className={`${controlClasses} ${
                fieldErrors.countryName ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.countryName && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.countryName}
              </p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Active</label>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  active: !prev.active,
                }))
              }
              className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
                form.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
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
            {isSubmitting ? "Saving..." : form.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryMasterForm;
