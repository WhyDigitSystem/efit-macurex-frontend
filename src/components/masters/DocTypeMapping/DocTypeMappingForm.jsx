import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
import branchAPI from "../../../api/branchAPI";
import { financialYearAPI } from "../../../api/financialYearAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const DocTypeMappingForm = ({ onBack, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [financialYears, setFinancialYears] = useState([]);
  const [fyLoading, setFyLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const defaultDetail = {
    id: 0,
    screenName: "",
    screenCode: "",
    docCode: "",
    prefix: "",
    active: true,
  };

  const [form, setForm] = useState({
    id: editData?.id || 0,
    description: editData?.description || "",
    branch: editData?.branch?.id ? String(editData.branch.id) : "",
    financialYear: editData?.financialYear?.id ? String(editData.financialYear.id) : "",
    active: editData?.active === "Active" || editData?.active === true,
    cancelRemarks: editData?.cancelRemarks || "",
    orgId: ORG_ID,
    createdBy: localStorage.getItem("userName") || "SYSTEM",
  });

  const [details, setDetails] = useState(() => {
    if (editData?.details?.length > 0) {
      return editData.details.map((d) => ({
        id: d.id || 0,
        screenName: d.screenName || "",
        screenCode: d.screenCode || "",
        docCode: d.docCode || "",
        prefix: d.prefix || "",
        active: d.active === "Active" || d.active === true,
      }));
    }
    return [{ ...defaultDetail }];
  });

  // Field labels for toast messages
  const fieldLabels = {
    description: "Description",
    branch: "Branch",
    financialYear: "Financial Year",
  };

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setBranchLoading(true);
        const res = await branchAPI.getBranchByOrgId(ORG_ID);
        setBranches(res || []);
      } catch (err) {
        console.error("Failed to load branches", err);
      } finally {
        setBranchLoading(false);
      }
    };
    const loadFy = async () => {
      try {
        setFyLoading(true);
        const res = await financialYearAPI.getAllFinancialYearByOrgId(ORG_ID);
        setFinancialYears(res || []);
      } catch (err) {
        console.error("Failed to load financial years", err);
      } finally {
        setFyLoading(false);
      }
    };
    loadBranches();
    loadFy();
  }, [ORG_ID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "active") {
      setForm((prev) => ({ ...prev, active: e.target.checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, field, value) => {
    setDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addDetailRow = () => {
    setDetails((prev) => [...prev, { ...defaultDetail }]);
  };

  const removeDetailRow = (index) => {
    if (details.length <= 1) return;
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const errors = {};

    if (!form.branch) errors.branch = "Branch is required";
    if (!form.financialYear) errors.financialYear = "Financial Year is required";

    const validDetails = details.filter((d) => d.screenName.trim() || d.screenCode.trim() || d.docCode.trim() || d.prefix.trim());
    if (validDetails.length === 0) {
      addToast("At least one detail row with data is required", "error");
      return;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const first = Object.keys(errors)[0];
      addToast(`${fieldLabels[first] || first}: ${errors[first]}`, "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      description: form.description,
      branch: Number(form.branch),
      financialYear: Number(form.financialYear),
      active: Boolean(form.active),
      cancelRemarks: form.cancelRemarks,
      createdBy: form.createdBy,
      orgId: form.orgId,
      details: validDetails.map((d) => ({
        screenName: d.screenName,
        screenCode: d.screenCode,
        docCode: d.docCode,
        prefix: d.prefix,
        active: Boolean(d.active),
      })),
    };

    if (form.id && form.id > 0) {
      payload.id = form.id;
      payload.details = payload.details.map((d, i) => ({
        ...d,
        id: validDetails[i]?.id || 0,
      }));
    }

    console.log("📤 Saving Doc Type Mapping Payload:", payload);

    try {
      const response =
        await docTypeMappingAPI.updateCreateDocumentTypeMapping(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const msg =
          response?.paramObjectsMap?.message ||
          (form.id && form.id > 0
            ? "Doc Type Mapping updated successfully!"
            : "Doc Type Mapping created successfully!");
        addToast(msg, "success");
        if (onBack) onBack();
      } else {
        addToast(
          response?.paramObjectsMap?.message ||
            response?.paramObjectsMap?.errorMessage ||
            response?.message ||
            "Failed to save",
          "error",
        );
      }
    } catch (error) {
      const msg =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {editData ? "Edit Doc Type Mapping" : "Add Doc Type Mapping"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {/* Description */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className={controlClasses}
            />
          </div>

          {/* Branch */}
          <div>
            <label className={labelClasses}>
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              disabled={branchLoading}
              className={`${controlClasses} ${fieldErrors.branch ? "border-red-500" : ""}`}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.branchName} ({b.branchCode})
                </option>
              ))}
            </select>
            {fieldErrors.branch && (
              <p className="text-red-500 text-[11px] mt-1">{fieldErrors.branch}</p>
            )}
          </div>

          {/* Financial Year */}
          <div>
            <label className={labelClasses}>
              Financial Year <span className="text-red-500">*</span>
            </label>
            <select
              name="financialYear"
              value={form.financialYear}
              onChange={handleChange}
              disabled={fyLoading}
              className={`${controlClasses} ${fieldErrors.financialYear ? "border-red-500" : ""}`}
            >
              <option value="">Select Financial Year</option>
              {financialYears.map((fy) => (
                <option key={fy.id} value={String(fy.id)}>
                  {fy.finYear || fy.financialYear || fy.id}
                </option>
              ))}
            </select>
            {fieldErrors.financialYear && (
              <p className="text-red-500 text-[11px] mt-1">{fieldErrors.financialYear}</p>
            )}
          </div>

          {/* Active */}
          <div>
            <label className={labelClasses}>Active</label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
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

          {/* Cancel Remarks */}
          {!form.active && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClasses}>Cancel Remarks</label>
              <input
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleChange}
                className={controlClasses}
              />
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Document Type Details
            </h3>
            <button
              type="button"
              onClick={addDetailRow}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 border border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-3 w-3" /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center w-8">#</th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">Screen Name</th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">Screen Code</th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">Doc Code</th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-left">Prefix</th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center w-16">Active</th>
                  <th className="px-2 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {details.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-2 py-1 text-xs text-gray-500 text-center">{index + 1}</td>
                    <td className="px-2 py-1">
                      <input
                        value={row.screenName}
                        onChange={(e) => handleDetailChange(index, "screenName", e.target.value)}
                        className={controlClasses}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.screenCode}
                        onChange={(e) => handleDetailChange(index, "screenCode", e.target.value.toUpperCase())}
                        className={controlClasses}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.docCode}
                        onChange={(e) => handleDetailChange(index, "docCode", e.target.value.toUpperCase())}
                        className={controlClasses}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={row.prefix}
                        onChange={(e) => handleDetailChange(index, "prefix", e.target.value.toUpperCase())}
                        className={controlClasses}
                      />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDetailChange(index, "active", !row.active)}
                        className={`relative inline-flex items-center w-8 h-4 rounded-full transition-colors ${
                          row.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`absolute h-3 w-3 bg-white rounded-full shadow transition-transform ${
                            row.active ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeDetailRow(index)}
                        disabled={details.length <= 1}
                        className="p-0.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default DocTypeMappingForm;