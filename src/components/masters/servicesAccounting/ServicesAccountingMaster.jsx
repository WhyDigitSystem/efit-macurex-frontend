import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import servicesAccountingAPI from "../../../api/servicesAccountingAPI";
import hsnSacAPI from "../../../api/hsnSacAPI";
import { useToast } from "../../../components/Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const ServiceAccountingForm = ({ data, onBack, loading: parentLoading }) => {
  const { addToast } = useToast();
  const orgId = localStorage.getItem("orgId");
  const branchId = localStorage.getItem("branchId");

  const [formData, setFormData] = useState({
    id: 0,
    serviceName: "",
    serviceDescription: "",
    hsnId: "",
    active: true,
  });

  const [hsnOptions, setHsnOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load HSN options from hsnSacAPI
  useEffect(() => {
    const loadHsnOptions = async () => {
      try {
        const hsnData = await hsnSacAPI.getAll(orgId, branchId);
        console.log('Loaded HSN/SAC options:', hsnData);

        // Transform to match the select options
        const options = Array.isArray(hsnData) ? hsnData.map(item => ({
          id: item.id,
          label: `${item.hsnCode || item.hsn || ''} - ${item.description || ''}`,
          hsn: item.hsnCode || item.hsn,
          description: item.description
        })) : [];

        setHsnOptions(options);
      } catch (error) {
        console.error('Failed to load HSN options:', error);
        addToast('Failed to load HSN/SAC options', 'error');
      }
    };

    if (orgId && branchId) {
      loadHsnOptions();
    }
  }, [orgId, branchId, addToast]);

  // Populate form when data changes (from parent)
  useEffect(() => {
    if (data && data.id) {
      console.log('Populating form with data:', data);

      // Extract HSN ID from the nested itemHsn object
      let hsnId = "";
      if (data.itemHsn) {
        hsnId = data.itemHsn.id || data.itemHsn.hsnId || "";
      } else if (data.hsnId) {
        hsnId = data.hsnId;
      } else if (data.hsnCode) {
        hsnId = data.hsnCode;
      }

      setFormData({
        id: data.id || 0,
        serviceName: data.serviceName || "",
        serviceDescription: data.serviceDescription || "",
        hsnId: String(hsnId),
        active: data.active === "Active" || data.active === true,
      });
    }
  }, [data]);

  const validate = () => {
    const newErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = "Service Name is required";
    } else if (formData.serviceName.trim().length < 2) {
      newErrors.serviceName = "Service Name must be at least 2 characters";
    }

    if (!formData.hsnId) {
      newErrors.hsnId = "HSN/SAC Code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    // Build payload
    const payload = {
      orgId: Number(orgId),
      branchId: Number(branchId),
      serviceName: formData.serviceName.trim(),
      serviceDescription: formData.serviceDescription?.trim() || "",
      hsnId: Number(formData.hsnId),
      active: formData.active,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      cancelRemarks: "",
    };

    // Only add id if editing (data?.id exists)
    if (data?.id) {
      payload.id = data.id;
    }

    console.log('Submitting payload:', payload);

    try {
      const response = await servicesAccountingAPI.createUpdate(payload);
      console.log('Save response:', response);

      if (response?.status === true || response?.statusFlag === 'Ok') {
        addToast(
          data?.id ? 'Service updated successfully!' : 'Service created successfully!',
          'success'
        );
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        throw new Error(response?.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      addToast(error?.message || 'Failed to save service', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({ ...prev, active: e.target.checked }));
  };

  // Show loading state
  if (parentLoading || isLoading) {
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
            Loading Service...
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">
              Loading Service data...
            </span>
          </div>
        </div>
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
          {data?.id ? "Edit Service" : "Add Service"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Service Name */}
            <div>
              <label className={labelClasses}>
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.serviceName}
                onChange={(e) => handleChange('serviceName', e.target.value)}
                placeholder="Enter service name"
                className={`${controlClasses} ${errors.serviceName ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.serviceName && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                  {errors.serviceName}
                </p>
              )}
            </div>

            {/* Service Description */}
            <div>
              <label className={labelClasses}>
                Service Description
              </label>
              <input
                type="text"
                value={formData.serviceDescription}
                onChange={(e) => handleChange('serviceDescription', e.target.value)}
                placeholder="Enter service description"
                className={controlClasses}
                disabled={isSubmitting}
              />
            </div>

            {/* HSN/SAC Code */}
            <div>
              <label className={labelClasses}>
                HSN/SAC Code <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hsnId}
                onChange={(e) => handleChange('hsnId', e.target.value)}
                className={`${controlClasses} ${errors.hsnId ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select HSN/SAC Code</option>
                {hsnOptions.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.hsnId && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                  {errors.hsnId}
                </p>
              )}
            </div>

            {/* Active Checkbox */}
            <div>
              <label className={labelClasses}>Active</label>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {formData.active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-3 w-3" />{" "}
              {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceAccountingForm;