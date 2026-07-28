import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import salesOrderAmendmentAPI from "../../../api/Sales/salesOrderAmendmentAPI";
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

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

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

const getDefaultValues = () => ({
  plantId: "",
  soAmndNo: "",
  soNo: "",
  date: dayjs().format("YYYY-MM-DD"),
  partyPOAmdNo: "",
  soDate: "",
  partyPOAmdDate: "",
  poNo: "",
  revisionNo: 1,
  poDate: "",
  active: true,
  remarks: "",
  details: [{
    id: Date.now() + 1,
    slNo: 1,
    itemCode: "",
    itemName: "",
    oldQty: 0,
    oldRate: 0,
    newQty: 0,
    newRate: 0,
    oldDlvyDate: "",
    newDlvyDate: "",
  }],
});

const SalesOrderAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [itemOptions, setItemOptions] = useState([]);
  const [rowErrors, setRowErrors] = useState({});

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: getDefaultValues() });

  const details = watch("details");
  const soNo = watch("soNo");

  useEffect(() => {
    if (data) {
      const vals = { ...getDefaultValues(), ...data };
      vals.date = vals.date ? dayjs(vals.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      vals.soDate = vals.soDate ? dayjs(vals.soDate).format("YYYY-MM-DD") : "";
      vals.partyPOAmdDate = vals.partyPOAmdDate ? dayjs(vals.partyPOAmdDate).format("YYYY-MM-DD") : "";
      vals.poDate = vals.poDate ? dayjs(vals.poDate).format("YYYY-MM-DD") : "";
      vals.details = vals.details || [];
      reset(vals);
    } else {
      reset(getDefaultValues());
    }
  }, [data, reset]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await salesOrderAmendmentAPI.getItems(orgId);
        setItemOptions(items);
      } catch { /* ignore */ }
    };
    if (orgId) loadItems();
  }, [orgId]);

  const loadOrderDetails = useCallback(async (soNum) => {
    if (!soNum || !orgId) return;
    setLoadingOrder(true);
    try {
      const items = await salesOrderAmendmentAPI.getOrderDetails(soNum, orgId, branch);
      if (items && items.length > 0) {
        setValue("soDate", items[0].soDate ? dayjs(items[0].soDate).format("YYYY-MM-DD") : "");
        const mapped = items.map((item, idx) => ({
          id: item.id || Date.now() + idx,
          slNo: idx + 1,
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          oldQty: item.quantity || item.qty || 0,
          oldRate: item.rate || 0,
          newQty: item.quantity || item.qty || 0,
          newRate: item.rate || 0,
          oldDlvyDate: item.deliveryDate || item.dlvyDate || "",
          newDlvyDate: item.deliveryDate || item.dlvyDate || "",
        }));
        setValue("details", mapped);
        setDetailError("");
      }
    } catch (error) {
      console.error("Failed to load order details:", error);
    } finally {
      setLoadingOrder(false);
    }
  }, [orgId, branch, setValue]);

  useEffect(() => {
    if (soNo) {
      const timer = setTimeout(() => loadOrderDetails(soNo), 500);
      return () => clearTimeout(timer);
    }
  }, [soNo, loadOrderDetails]);

  const validateDetails = () => {
    const errs = {};
    const rows = getValues("details") || [];
    rows.forEach((row, i) => {
      const rowErr = {};
      if (!row.itemCode) rowErr.itemCode = "Required";
      if (!row.newQty || Number(row.newQty) <= 0) rowErr.newQty = "Required";
      if (!row.newDlvyDate) rowErr.newDlvyDate = "Required";
      if (Object.keys(rowErr).length) errs[i] = rowErr;
    });
    setRowErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (formData) => {
    const headerValid = await handleSubmit(
      () => true,
      () => {
        addToast("Please fill all mandatory header fields", "error");
      }
    )();
    if (!headerValid) return;

    if (!formData.details || formData.details.length === 0) {
      setDetailError("At least one order detail item is required");
      setActiveTab("details");
      addToast("At least one order detail item is required", "error");
      return;
    }

    if (!validateDetails()) {
      setActiveTab("details");
      addToast("Please fill all mandatory fields in detail rows", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        soAmndNo: formData.soAmndNo || `SOA${dayjs().format("YYYYMMDDHHmmss")}`,
        revisionNo: data ? formData.revisionNo : 1,
        orgId,
        branch,
        createdBy: loginUserName,
        details: (formData.details || []).map((d) => ({
          ...d,
          newQty: Number(d.newQty) || 0,
          newRate: Number(d.newRate) || 0,
        })),
      };
      const res = await salesOrderAmendmentAPI.createUpdate(payload);
      if (res?.status) {
        addToast(
          data ? "Amendment updated successfully" : "Amendment created successfully",
          "success"
        );
        onBack();
      } else {
        addToast(res?.message || "Failed to save amendment", "error");
      }
    } catch (error) {
      addToast(error?.message || "Failed to save amendment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDetailRow = () => {
    const current = getValues("details") || [];
    setValue("details", [
      ...current,
      {
        id: Date.now(),
        slNo: current.length + 1,
        itemCode: "",
        itemName: "",
        oldQty: 0,
        oldRate: 0,
        newQty: 0,
        newRate: 0,
        oldDlvyDate: "",
        newDlvyDate: "",
      },
    ]);
    setDetailError("");
  };

  const removeDetailRow = (index) => {
    const current = getValues("details") || [];
    if (current.length <= 1) return;
    const updated = current.filter((_, i) => i !== index).map((d, i) => ({ ...d, slNo: i + 1 }));
    setValue("details", updated);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return Object.keys(next).reduce((acc, k) => {
        const ki = Number(k);
        acc[ki > index ? ki - 1 : ki] = next[k];
        return acc;
      }, {});
    });
  };

  const updateDetail = (index, field, value) => {
    const current = getValues("details") || [];
    current[index] = { ...current[index], [field]: value };
    if (field === "itemCode") {
      const item = itemOptions.find(
        (i) => (i.itemCode || i.code || i.id?.toString()) === value
      );
      if (item) {
        current[index].itemName = item.itemName || item.description || "";
      }
    }
    setValue("details", [...current]);
    if (rowErrors[index]) {
      const updated = { ...rowErrors };
      delete updated[index];
      setRowErrors(updated);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) onBack();
  };

  const renderField = (label, name, type = "text", options = {}) => {
    const { required, disabled, placeholder, options: selectOptions, step } = options;
    const error = errors[name]?.message;
    return (
      <div key={name}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {type === "select" ? (
          <select
            {...register(name, { required: required ? `${label} is required` : false })}
            disabled={disabled}
            className={`${controlClasses} ${error ? "border-red-500 focus:border-red-500" : ""}`}
          >
            <option value="">Select</option>
            {(selectOptions || []).map((opt) => {
              const val = typeof opt === "object" ? opt.value || opt.id : opt;
              const lbl = typeof opt === "object" ? opt.label || opt.name || opt.value || opt.id : opt;
              return <option key={val} value={val}>{lbl}</option>;
            })}
          </select>
        ) : type === "textarea" ? (
          <textarea
            {...register(name)}
            disabled={disabled}
            rows={2}
            className={`${controlClasses} h-auto min-h-[30px] resize-none pt-1 ${error ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            {...register(name)}
            type={type}
            step={step}
            disabled={disabled}
            className={`${controlClasses} ${error ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
          />
        )}
        {error && <div className="text-red-500 text-[10px] mt-0.5">{error}</div>}
      </div>
    );
  };

  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="animate-fadeIn px-3 py-3 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {data ? "Edit Sales Order Amendment" : "New Sales Order Amendment"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className={labelClasses}>Active</label>
            <Controller
              name="active"
              control={control}
              render={({ field }) => <ToggleButton value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        {/* Header Fields */}
        <div className={fieldGrid}>
          {renderField("Plant Id *", "plantId", "select", { required: true, selectOptions: ["Plant 1", "Plant 2", "Plant 3"] })}
          {renderField("S.O.Amnd No", "soAmndNo", "text", { disabled: true, placeholder: "Auto-generated" })}
          {renderField("S.O.No *", "soNo", "select", { required: true, selectOptions: [] })}
          {renderField("Date *", "date", "date", { required: true })}
          {renderField("Party P.O.Amnd No *", "partyPOAmdNo", "text", { required: true })}
          {renderField("S.O.Date", "soDate", "date")}
          {renderField("Party P.O.Amnd Date", "partyPOAmdDate", "date")}
          {renderField("P.O.No", "poNo", "text")}
          {renderField("Revision No", "revisionNo", "number", { disabled: true })}
          {renderField("P.O.Date", "poDate", "date")}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {[
              { key: "details", label: "Sales Order Details" },
              { key: "summary", label: "Summary" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader>Sales Order Items</SectionHeader>
              <div className="flex items-center gap-2">
                {loadingOrder && <span className="text-xs text-gray-500">Loading order details...</span>}
                <button
                  type="button"
                  onClick={addDetailRow}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            {detailError && (
              <div className="text-red-500 text-[10px]">{detailError}</div>
            )}
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 w-8 text-center dark:text-white">#</th>
                    <th className="p-1 text-left dark:text-white">Item Code *</th>
                    <th className="p-1 text-left dark:text-white">Item Description</th>
                    <th className="p-1 text-left dark:text-white">Old Qty</th>
                    <th className="p-1 text-left dark:text-white">Old Rate</th>
                    <th className="p-1 text-left dark:text-white">New Qty *</th>
                    <th className="p-1 text-left dark:text-white">New Rate</th>
                    <th className="p-1 text-left dark:text-white">Old Dlvy Date</th>
                    <th className="p-1 text-left dark:text-white">New Dlvy Date *</th>
                    <th className="p-1 w-20 text-left dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(details || []).map((item, index) => {
                    const rErr = rowErrors[index] || {};
                    return (
                      <tr key={item.id || index} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
                        <td className="p-1">
                          <select
                            value={item.itemCode || ""}
                            onChange={(e) => updateDetail(index, "itemCode", e.target.value)}
                            className={`${controlClasses} h-8 text-xs ${rErr.itemCode ? "border-red-500" : ""}`}
                          >
                            <option value="">Select</option>
                            {itemOptions.map((opt) => {
                              const val = opt.itemCode || opt.code || opt.id?.toString() || "";
                              const lbl = opt.itemCode || opt.code || "";
                              return <option key={val} value={val}>{lbl}</option>;
                            })}
                          </select>
                          {rErr.itemCode && <div className="text-red-500 text-[10px] mt-0.5">Required</div>}
                        </td>
                        <td className="p-1">
                          <input
                            value={item.itemName || ""}
                            disabled
                            className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={item.oldQty ?? 0}
                            disabled
                            className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800 text-center`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={item.oldRate ?? 0}
                            disabled
                            className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800 text-center`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            step="0.001"
                            value={item.newQty ?? 0}
                            onChange={(e) => updateDetail(index, "newQty", parseFloat(e.target.value) || 0)}
                            className={`${controlClasses} h-8 text-xs text-center ${rErr.newQty ? "border-red-500" : ""}`}
                          />
                          {rErr.newQty && <div className="text-red-500 text-[10px] mt-0.5">Required</div>}
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            step="0.01"
                            value={item.newRate ?? 0}
                            onChange={(e) => updateDetail(index, "newRate", parseFloat(e.target.value) || 0)}
                            className={`${controlClasses} h-8 text-xs text-center`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={item.oldDlvyDate || ""}
                            disabled
                            className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="date"
                            value={item.newDlvyDate || ""}
                            onChange={(e) => updateDetail(index, "newDlvyDate", e.target.value)}
                            className={`${controlClasses} h-8 text-xs ${rErr.newDlvyDate ? "border-red-500" : ""}`}
                          />
                          {rErr.newDlvyDate && <div className="text-red-500 text-[10px] mt-0.5">Required</div>}
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeDetailRow(index)}
                            disabled={details.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                              details.length <= 1 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="max-w-2xl">
            {renderField("Remarks", "remarks", "textarea")}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
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
            <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderAmendmentForm;
