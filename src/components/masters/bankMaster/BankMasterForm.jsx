import React, { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import bankAPI from "../../../api/bankAPI";
import { useToast } from "../../../components/Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
);

const BankMasterForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;

  const [form, setForm] = useState({
    beneficiary: data?.beneficiary || "",
    bank: data?.bank || "",
    acno: data?.acno || "",
    branch: data?.branch || "",
    ifscCode: data?.ifscCode || "",
    active: data?.active === "Active" || data?.active === true,
    id: data?.id || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const finalValue = name === "ifscCode" ? value.toUpperCase() : value;

    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const validate = () => {
    const errors = {};

    if (!form.beneficiary.trim()) errors.beneficiary = "Beneficiary is required";
    if (!form.bank.trim()) errors.bank = "Bank Name is required";
    if (!form.acno.trim()) errors.acno = "AC No is required";
    if (!form.branch.trim()) errors.branch = "Branch is required";
    if (!form.ifscCode.trim()) errors.ifscCode = "IFSC Code is required";
    else if (form.ifscCode.length < 11) errors.ifscCode = "IFSC Code must be at least 11 characters";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...(form.id ? { id: form.id } : {}),
      orgId,
      beneficiary: form.beneficiary.trim(),
      bank: form.bank.trim(),
      acno: form.acno.trim(),
      branch: form.branch.trim(),
      ifscCode: form.ifscCode.trim(),
      active: form.active,
      cancelRemarks: "",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    try {
      await bankAPI.createUpdate(payload);
      addToast(
        data ? "Bank Updated Successfully!" : "Bank Saved Successfully!",
        "success"
      );
      onBack();
    } catch (error) {
      console.error("Failed to save Bank:", error);
      addToast("Failed to save Bank.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Bank" : "Add Bank"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div className={fieldGrid}>
          <div>
            <label className={labelClasses}>
              Beneficiary Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="beneficiary"
              value={form.beneficiary}
              onChange={handleChange}
              placeholder="Enter Beneficiary Name"
              className={controlClasses + (fieldErrors.beneficiary ? " border-red-500" : "")}
            />
            {fieldErrors.beneficiary && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.beneficiary}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bank"
              value={form.bank}
              onChange={handleChange}
              placeholder="Enter Bank Name"
              className={controlClasses + (fieldErrors.bank ? " border-red-500" : "")}
            />
            {fieldErrors.bank && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.bank}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              AC No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="acno"
              value={form.acno}
              onChange={handleChange}
              placeholder="Enter Account Number"
              className={controlClasses + (fieldErrors.acno ? " border-red-500" : "")}
            />
            {fieldErrors.acno && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.acno}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="branch"
              value={form.branch}
              onChange={handleChange}
              placeholder="Enter Branch"
              className={controlClasses + (fieldErrors.branch ? " border-red-500" : "")}
            />
            {fieldErrors.branch && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.branch}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ifscCode"
              value={form.ifscCode}
              onChange={handleChange}
              placeholder="Enter IFSC Code"
              className={controlClasses + (fieldErrors.ifscCode ? " border-red-500" : "")}
            />
            {fieldErrors.ifscCode && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.ifscCode}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Active</label>
            <div className="pt-1">
              <ToggleButton
                value={form.active}
                onChange={(v) => setForm((p) => ({ ...p, active: v }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankMasterForm;
