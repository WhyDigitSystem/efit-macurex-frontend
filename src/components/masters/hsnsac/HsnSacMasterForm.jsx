import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";

const CATEGORY_OPTIONS = ["Goods", "Services"];

const HsnSacMasterForm = ({ data, onBack }) => {
  const [form, setForm] = useState({
    category: data?.category || "",
    hsnSacCode: data?.hsnSacCode || "",
    description: data?.description || "",
    active: data?.active ?? true,
    id: data?.id || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setForm((prev) => ({ ...prev, active: e.target.checked }));
  };

  const validate = () => {
    const errors = {};
    if (!form.category) errors.category = "Category is required";
    if (!form.hsnSacCode.trim()) errors.hsnSacCode = "HSN/SAC Code is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      console.log("HSN/SAC Payload:", { ...form });
      alert(data ? "HSN/SAC Updated Successfully!" : "HSN/SAC Saved Successfully!");
      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save HSN/SAC.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data ? "Edit HSN/SAC" : "Add HSN/SAC"}</h1>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-4">
            HSN/SAC DETAILS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border text-sm transition-colors bg-white dark:bg-[#0F172A] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.category}</p>
              )}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                HSN/SAC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hsnSacCode"
                value={form.hsnSacCode}
                onChange={handleChange}
                placeholder="Enter HSN/SAC Code"
                className="w-full h-10 px-3 rounded-md border text-sm transition-colors bg-white dark:bg-[#0F172A] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
              {fieldErrors.hsnSacCode && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.hsnSacCode}</p>
              )}
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={1}
                className="w-full h-10 px-3 py-2 rounded-md border text-sm transition-colors resize-none bg-white dark:bg-[#0F172A] border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="lg:col-span-2 flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10" />

        <div className="flex justify-end gap-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-md text-sm font-medium border transition-colors bg-white dark:bg-transparent border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1.5">
              <X className="h-4 w-4" />
              Cancel
            </span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-md text-sm font-medium text-white transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HsnSacMasterForm;
