import { ArrowLeft, FilePlus2, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import categoryMasterAPI, {
  APPLICABLE_FOR_OPTIONS,
} from "../../../api/plantMaintenance/categoryMasterAPI";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 [color-scheme:light dark:color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4";

const CategoryMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const saveCounter = useRef(0);

  const fieldLabels = {
    applicableFor: "Applicable For",
    category: "Category",
  };

  const [form, setForm] = useState({
    id: 0,
    applicableFor: "",
    category: "",
    orgId: ORG_ID,
    createdBy: CREATED_BY,
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (editId && editId > 0) {
        await loadCategoryData(editId);
      } else if (editData) {
        populateFormFromEditData(editData);
      }
    };

    initializeForm();
  }, [editId, editData]);

  const populateFormFromEditData = (data) => {
    setForm({
      id: data.id || 0,
      applicableFor: data.applicableFor || "",
      category: data.category || "",
      orgId: data.orgId || ORG_ID,
      createdBy: data.createdBy || CREATED_BY,
    });
  };

  const loadCategoryData = async (categoryId) => {
    try {
      setLoading(true);
      const categoryData = await categoryMasterAPI.getCategoryById(categoryId);

      if (categoryData) {
        setForm({
          id: categoryData.id || 0,
          applicableFor: categoryData.applicableFor || "",
          category: categoryData.category || "",
          orgId: categoryData.orgId || ORG_ID,
          createdBy: categoryData.createdBy || CREATED_BY,
        });
      }
    } catch (error) {
      console.error("Error loading category data:", error);
      addToast("Failed to load category data", "error");
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
      applicableFor: "",
      category: "",
      orgId: ORG_ID,
      createdBy: CREATED_BY,
    });
    setFieldErrors({});
  };

  const validate = () => {
    const errors = {};

    if (!form.applicableFor.trim()) {
      errors.applicableFor = "Applicable For is required";
    }

    if (!form.category.trim()) {
      errors.category = "Category is required";
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
      applicableFor: form.applicableFor.trim(),
      category: form.category.trim().toUpperCase(),
      orgId: form.orgId,
      createdBy: form.createdBy,
      requestNo: `REQ-${Date.now()}-${saveCounter.current}`,
    };

    console.log("Submitting Category Payload:", payload);

    try {
      const response = await categoryMasterAPI.createUpdateCategory(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Category updated successfully!"
            : "Category created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          const savedData = {
            ...payload,
            id: response?.paramObjectsMap?.categoryVO?.id || payload.id,
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
          "Failed to save category";

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
          {editData || editId ? "Edit Category" : "Add Category"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className={fieldGrid}>
          {/* Applicable For (dropdown, mandatory) */}
          <div>
            <label className={labelClasses}>
              Applicable For <span className="text-red-500">*</span>
            </label>

            <select
              name="applicableFor"
              value={form.applicableFor}
              onChange={handleChange}
              className={`${controlClasses} ${
                fieldErrors.applicableFor ? "border-red-500" : ""
              }`}
            >
              <option value="">-- Select Applicable For --</option>
              {APPLICABLE_FOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {fieldErrors.applicableFor && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.applicableFor}
              </p>
            )}
          </div>

          {/* Category (text field, mandatory) */}
          <div>
            <label className={labelClasses}>
              Category <span className="text-red-500">*</span>
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Enter category"
              className={`${controlClasses} ${
                fieldErrors.category ? "border-red-500" : ""
              }`}
            />

            {fieldErrors.category && (
              <p className="text-red-500 text-[11px] mt-1">
                {fieldErrors.category}
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

export default CategoryMasterForm;
