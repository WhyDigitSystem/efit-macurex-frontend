import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import itemGradeAPI from "../../../api/itemGradeAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

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

const ItemGradeMasterForm = ({ editData, onBack }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH = Number(localStorage.getItem("branchId")) || 1000000001;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";
  const { addToast } = useToast();

  const [form, setForm] = useState({
    id: 0,
    gradeCode: "",
    gradeDescription: "",
    remarks: "",
    active: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        id: editData.id || 0,
        gradeCode: editData.gradeCode || "",
        gradeDescription: editData.gradeDescription || "",
        remarks: editData.remarks || "",
        active: editData.active === "Active" || editData.active === true,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.gradeCode.trim()) {
      errors.gradeCode = "Grade Code is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...(form.id ? { id: form.id } : {}),
        orgId: ORG_ID,
        branch: BRANCH,
        gradeCode: form.gradeCode.trim(),
        gradeDescription: form.gradeDescription.trim(),
        description: form.gradeDescription.trim(),
        remarks: form.remarks.trim(),
        active: form.active,
        createdBy: CREATED_BY,
        cancelRemarks: "",
      };
      await itemGradeAPI.save(payload);
      addToast(
        form.id ? "Item Grade updated successfully" : "Item Grade created successfully",
        "success"
      );
      onBack();
    } catch (error) {
      const msg = error?.message || "Failed to save Item Grade";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {form.id ? "Edit Item Grade" : "Add Item Grade"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div className={fieldGrid}>
          <div>
            <label className={labelClasses}>
              Grade Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gradeCode"
              value={form.gradeCode}
              onChange={handleChange}
              placeholder="Enter Grade Code"
              className={`${controlClasses} ${fieldErrors.gradeCode ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {fieldErrors.gradeCode && (
              <p className="text-red-500 text-[10px] mt-0.5">{fieldErrors.gradeCode}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Grade Description</label>
            <input
              type="text"
              name="gradeDescription"
              value={form.gradeDescription}
              onChange={handleChange}
              placeholder="Enter Grade Description"
              className={controlClasses}
            />
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

        <div>
          <label className={labelClasses}>Remarks</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={2}
            placeholder="Optional notes"
            className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : form.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemGradeMasterForm;
