import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { FloatingInput } from "../../../utils/InputFields";
// import { masterAPI } from "../../../api/locationAPI";

const LocationMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));

  const [form, setForm] = useState({
    locationCode: data?.locationCode || "",
    locationName: data?.locationName || "",
    branch: data?.branch || "",
    company: data?.company || "",
    startDate: data?.startDate || "",
    endDate: data?.endDate || "",
    id: data?.id || "",
    active: data?.active ?? true,
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

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["locationCode", "locationName", "branch", "company"].includes(name)
          ? value.toUpperCase()
          : value,
    }));
  };

  const validate = () => {
    const errors = {};

    if (!form.locationCode.trim())
      errors.locationCode = "Location Code is required";

    if (!form.locationName.trim())
      errors.locationName = "Location Name is required";

    if (!form.branch.trim())
      errors.branch = "Branch is required";

    if (!form.company.trim())
      errors.company = "Company is required";

    if (!form.startDate)
      errors.startDate = "Start Date is required";

    if (
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      errors.endDate = "End Date must be greater than Start Date";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      orgId,
      locationCode: form.locationCode,
      locationName: form.locationName,
      branch: form.branch,
      company: form.company,
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active,
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload);

    try {
      // await masterAPI.saveLocation(payload);

      alert(
        data
          ? "Location Updated Successfully!"
          : "Location Saved Successfully!"
      );

      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl ">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
  <button
    onClick={onBack}
    className="
      p-1 rounded-md
      text-gray-600 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-700
      hover:text-gray-900 dark:hover:text-white
      transition-colors
    "
  >
    <ArrowLeft className="h-4 w-4" />
  </button>

  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
    {data ? "Edit Location" : "Add Location"}
  </h2>
</div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

          <FloatingInput
            label="Location Code *"
            name="locationCode"
            value={form.locationCode}
            onChange={handleChange}
            error={fieldErrors.locationCode}
          />

          <FloatingInput
            label="Location Name *"
            name="locationName"
            value={form.locationName}
            onChange={handleChange}
            error={fieldErrors.locationName}
          />

          <FloatingInput
            label="Branch *"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            error={fieldErrors.branch}
          />

          <FloatingInput
            label="Company *"
            name="company"
            value={form.company}
            onChange={handleChange}
            error={fieldErrors.company}
          />

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Start Date *
            </label>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {fieldErrors.startDate && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {fieldErrors.endDate && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.endDate}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span className="text-sm">Active</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">

          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 border rounded text-sm"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            <Save className="h-3 w-3" />
            {isSubmitting
              ? "Saving..."
              : data
              ? "Update"
              : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default LocationMasterForm;