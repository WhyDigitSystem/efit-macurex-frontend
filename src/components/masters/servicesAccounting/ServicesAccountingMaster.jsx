import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import hsnSacAPI from "../../../api/hsnSacAPI";
import servicesAccountingAPI from "../../../api/servicesAccountingAPI";
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
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
      value ? "translate-x-6" : "translate-x-0.5"
    }`} />
  </button>
);

const ServicesAccountingMaster = () => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branch")) || 0;

  const [hsnOptions, setHsnOptions] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [active, setActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadHsnCodes = async () => {
      try {
        const data = await hsnSacAPI.getAll(orgId, branch);
        const activeRecords = Array.isArray(data)
          ? data.filter((r) => r.active === true || r.active === "Active" || r.active === "Yes")
          : [];
        setHsnOptions(activeRecords);
      } catch (error) {
        console.error("Failed to load HSN/SAC codes:", error);
      }
    };
    loadHsnCodes();
  }, [orgId, branch]);

  const validate = () => {
    const errors = {};

    const trimmed = serviceName.trim();
    if (!trimmed) {
      errors.serviceName = "Service Name is required";
    } else if (trimmed.length < 2) {
      errors.serviceName = "Service Name must be at least 2 characters";
    }

    if (!hsnCode) {
      errors.hsnCode = "HSN/SAC Code is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      orgId,
      serviceName: serviceName.trim(),
      description: description.trim(),
      hsnCode: String(hsnCode),
      hsnId: Number(hsnCode),
      active: active,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    try {
      await servicesAccountingAPI.createUpdate(payload);
      addToast("Service saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save Service:", error);
      const msg = error?.paramObjectsMap?.message || error?.message || "Failed to save Service.";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setServiceName("");
    setDescription("");
    setHsnCode("");
    setActive(true);
    setFieldErrors({});
  };

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => window.history.back()}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Services Accounting Master</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        <div className={fieldGrid}>
          <div>
            <label className={labelClasses}>
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => {
                setServiceName(e.target.value);
                if (fieldErrors.serviceName) setFieldErrors((p) => ({ ...p, serviceName: "" }));
              }}
              placeholder="Enter service name"
              className={controlClasses + (fieldErrors.serviceName ? " border-red-500" : "")}
            />
            {fieldErrors.serviceName && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.serviceName}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Service Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={1}
              className={controlClasses + " resize-none pt-1"}
            />
          </div>

          <div>
            <label className={labelClasses}>
              HSN/SAC Code <span className="text-red-500">*</span>
            </label>
            <select
              value={hsnCode}
              onChange={(e) => {
                setHsnCode(e.target.value);
                if (fieldErrors.hsnCode) setFieldErrors((p) => ({ ...p, hsnCode: "" }));
              }}
              className={controlClasses + (fieldErrors.hsnCode ? " border-red-500" : "")}
            >
              <option value="">Select HSN/SAC Code</option>
              {hsnOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.category === 1 ? "Goods" : "Services"} - {opt.hsn}{opt.description ? ` (${opt.description})` : ""}
                </option>
              ))}
            </select>
            {fieldErrors.hsnCode && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{fieldErrors.hsnCode}</p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Active</label>
            <div className="pt-1">
              <ToggleButton
                value={active}
                onChange={setActive}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleNew}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            New
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesAccountingMaster;
