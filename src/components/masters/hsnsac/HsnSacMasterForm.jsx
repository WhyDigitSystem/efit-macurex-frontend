import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import hsnSacAPI from "../../../api/hsnSacAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../../components/Toast/ToastContext";

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
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
  >
    <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"
      }`} />
  </button>
);

const HsnSacMasterForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = localStorage.getItem("branchId");
  const userName = localStorage.getItem("userName");

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    category: "",
    hsn: "",
    description: "",
    active: true,
    id: 0,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const list = await listOfValuesAPI.getListValuesGroup("HSN/SAC", orgId);
        setCategoryOptions(list);
      } catch (error) {
        console.error("Failed to load categories:", error);
        addToast("Failed to load categories", "error");
      }
    };
    loadCategories();
  }, [orgId, addToast]);

  // Fetch HSN/SAC data by ID when editing
  useEffect(() => {
    const fetchHsnData = async () => {
      // Check if we have an ID to fetch (from data prop)
      const idToFetch = data?.id;

      if (idToFetch) {
        setIsLoading(true);
        try {
          const response = await hsnSacAPI.getById(idToFetch);

          // Extract HSN data from response
          const hsnData = response?.paramObjectsMap?.hsnVO;

          if (hsnData) {
            // Handle category - it might be an object or a primitive
            let categoryValue = "";
            if (hsnData.category) {
              if (typeof hsnData.category === "object") {
                // If category is an object, get its id or valueDescription
                categoryValue = hsnData.category.id || hsnData.category.valueDescription || "";
              } else {
                categoryValue = String(hsnData.category);
              }
            }

            setForm({
              id: hsnData.id || 0,
              category: categoryValue,
              hsn: hsnData.hsn || "",
              description: hsnData.description || "",
              active: hsnData.active === "Active" || hsnData.active === true,
            });
          } else {
            addToast("Failed to load HSN/SAC data", "error");
          }
        } catch (error) {
          console.error("Error fetching HSN/SAC data:", error);
          addToast(error.message || "Error loading HSN/SAC data", "error");
        } finally {
          setIsLoading(false);
        }
      } else if (data) {
        // If data is passed directly (not by ID), use it
        setForm({
          id: data.id || 0,
          category: data.category || "",
          hsn: data.hsn || "",
          description: data.description || "",
          active: data.active ?? true,
        });
      }
    };

    fetchHsnData();
  }, [data, addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.category) errors.category = "Category is required";
    if (!form.hsn.trim()) errors.hsn = "HSN/SAC Code is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...(form.id && { id: form.id }),
      orgId,
      branch: parseInt(branch),
      category: parseInt(form.category),
      hsn: form.hsn.trim(),
      description: form.description.trim(),
      active: form.active,
      createdBy: userName,
    };

    try {
      await hsnSacAPI.createUpdate(payload);
      addToast(data?.id ? "HSN/SAC Updated Successfully!" : "HSN/SAC Saved Successfully!", "success");
      onBack();
    } catch (error) {
      console.error("Failed to save HSN/SAC:", error);
      addToast(error.message || "Failed to save HSN/SAC.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-2 max-w-7xl">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Loading HSN/SAC...
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading HSN/SAC data...
            </span>
          </div>
        </div>
      </div>
    );
  }

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
          {data?.id ? "Edit HSN/SAC" : "Add HSN/SAC"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div className={fieldGrid}>
          <div>
            <label className={labelClasses}>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={controlClasses + (fieldErrors.category ? " border-red-500" : "")}
            >
              <option value="">Select Category</option>
              {categoryOptions.map((opt, idx) => (
                <option key={idx} value={opt.id}>
                  {opt.valuesDescription}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.category}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>
              HSN/SAC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hsn"
              value={form.hsn}
              onChange={handleChange}
              placeholder="Enter HSN/SAC Code"
              className={controlClasses + (fieldErrors.hsn ? " border-red-500" : "")}
            />
            {fieldErrors.hsn && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.hsn}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={1}
              className={controlClasses + " resize-none pt-1"}
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
            {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HsnSacMasterForm;