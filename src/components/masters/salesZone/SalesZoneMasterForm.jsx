import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import salesZoneAPI from "../../../api/salesZoneAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const SalesZoneMasterForm = ({ onBack, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: editData?.id || 0,
    zoneId: editData?.zoneId || "",
    zoneDescription: editData?.zonedescription || editData?.zoneDescription || "",
    active: editData?.active === "Active" || editData?.active === true,
    cancelRemarks: editData?.cancelRemarks || "",
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
    branch: Number(localStorage.getItem("branchId")||1000000001),
  });

  // Field labels for toast messages
  const fieldLabels = {
    zoneId: "Zone Id",
    zoneDescription: "Zone Description",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "active") {
      setForm((prev) => ({ ...prev, active: e.target.checked }));
      return;
    }

    const alphanumericRegex = /^[A-Za-z0-9]*$/;
    const nameRegex = /^[A-Za-z0-9 .,&'-]*$/;

    switch (name) {
      case "zoneId":
        if (!alphanumericRegex.test(value)) {
          setFieldErrors((prev) => ({
            ...prev,
            zoneId: "Only alphanumeric characters are allowed",
          }));
          return;
        }
        if (value.length > 10) {
          setFieldErrors((prev) => ({
            ...prev,
            zoneId: "Zone Id must be maximum 10 characters",
          }));
          return;
        }
        break;

      case "zoneDescription":
        if (!nameRegex.test(value)) {
          setFieldErrors((prev) => ({
            ...prev,
            zoneDescription:
              "Special characters other than . , & ' - are not allowed",
          }));
          return;
        }
        if (value.length > 100) {
          setFieldErrors((prev) => ({
            ...prev,
            zoneDescription: "Zone Description must be maximum 100 characters",
          }));
          return;
        }
        break;

      case "cancelRemarks":
        if (value.length > 250) {
          setFieldErrors((prev) => ({
            ...prev,
            cancelRemarks: "Remarks must be maximum 250 characters",
          }));
          return;
        }
        break;

      default:
        break;
    }

    const updatedValue = name === "zoneId" ? value.toUpperCase() : value;

    setForm((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.zoneId.trim()) errors.zoneId = "Zone Id is required";
    if (!form.zoneDescription.trim())
      errors.zoneDescription = "Zone Description is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const fieldLabel = fieldLabels[firstErrorField] || firstErrorField;
      const errorMessage = errors[firstErrorField];

      addToast(`${fieldLabel}: ${errorMessage}`, "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      zoneId: form.zoneId,
      zonedescription: form.zoneDescription,
      active: Boolean(form.active),
      cancelRemarks: form.cancelRemarks,
      createdBy: form.createdBy,
      orgId: form.orgId,
      branch: form.branch,
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
    }

    console.log("📤 Saving Sales Zone Payload:", payload);

    try {
      const response = await salesZoneAPI.updateCreateSalesZone(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        addToast(
          form.id && form.id > 0
            ? "Sales Zone updated successfully!"
            : "Sales Zone created successfully!",
          "success"
        );
        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save sales zone";

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

  return (
    <div className="p-2 max-w-7xl ">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Sales Zone" : "Add Sales Zone"}
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Zone Id */}
          <div>
            <label className={labelClasses}>
              Zone Id <span className="text-red-500">*</span>
            </label>

            <input
              name="zoneId"
              value={form.zoneId}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.zoneId ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.zoneId && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.zoneId}
              </p>
            )}
          </div>

          {/* Zone Description */}
          <div>
            <label className={labelClasses}>
              Zone Description <span className="text-red-500">*</span>
            </label>

            <input
              name="zoneDescription"
              value={form.zoneDescription}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.zoneDescription ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.zoneDescription && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.zoneDescription}
              </p>
            )}
          </div>

          {/* Active */}
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

          {/* Cancel Remarks - only relevant when marking inactive */}
          {!form.active && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClasses}>Cancel Remarks</label>

              <input
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleChange}
                className={`${controlClasses} ${
                  fieldErrors.cancelRemarks ? "border-red-500" : ""
                }`}
              />

              {fieldErrors.cancelRemarks && (
                <p className="text-red-500 text-[11px] mt-1">
                  {fieldErrors.cancelRemarks}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
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
            {isSubmitting ? "Saving..." : editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesZoneMasterForm;
