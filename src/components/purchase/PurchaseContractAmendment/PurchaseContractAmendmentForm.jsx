import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import purchaseContractAmendmentAPI from "../../../api/Purchase/purchaseContractAmendmentAPI";
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

const FREIGHT_TYPES = ["CIF", "FOB", "CFR", "EXW", "DDP"];
const PACKING_TYPES = ["Standard", "Export", "Waterproof", "Pallet"];
const MODE_OF_DISPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];
const YES_NO = ["Yes", "No"];

const getDefaultValues = () => ({
  plantId: "",
  belongsTo: "",
  partyId: "",
  partyName: "",
  contractNo: "",
  contractDate: "",
  amendmentNo: "",
  amendmentDate: dayjs().format("YYYY-MM-DD"),
  revisionNo: 1,
  refNo: "",
  refDate: "",
  active: true,
  freightType: "",
  packingType: "",
  insuranceAmount: 0,
  modeOfDispatch: "",
  taxDescription: "",
  preparedBy: "",
  authorisedBy: "",
  remarks: "",
  pcDetails: [{
    id: Date.now() + 1,
    slNo: 1,
    itemCode: "",
    itemName: "",
    unit: "",
    oldRate: 0,
    newRate: 0,
    validFrom: "",
    newValidFrom: "",
    validTo: "",
    newValidTo: "",
  }],
  attachments: [],
});

const PurchaseContractAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [activeTab, setActiveTab] = useState("pcDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  const [pcDetailError, setPcDetailError] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState(() => [{ id: Date.now(), file: null }]);
  const [itemOptions, setItemOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);

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

  const pcDetails = watch("pcDetails");
  const partyId = watch("partyId");
  const contractNo = watch("contractNo");

  useEffect(() => {
    if (data) {
      const vals = { ...getDefaultValues(), ...data };
      vals.amendmentDate = vals.amendmentDate
        ? dayjs(vals.amendmentDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      vals.contractDate = vals.contractDate
        ? dayjs(vals.contractDate).format("YYYY-MM-DD")
        : "";
      vals.refDate = vals.refDate
        ? dayjs(vals.refDate).format("YYYY-MM-DD")
        : "";
      vals.pcDetails = vals.pcDetails || [];
      vals.attachments = vals.attachments || [];
      reset(vals);
    } else {
      reset(getDefaultValues());
    }
  }, [data, reset]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await purchaseContractAmendmentAPI.getItems(orgId);
        setItemOptions(items);
      } catch { /* ignore */ }
    };
    const loadUnits = async () => {
      try {
        const units = await purchaseContractAmendmentAPI.getUnits(orgId);
        setUnitOptions(units);
      } catch { /* ignore */ }
    };
    loadItems();
    loadUnits();
  }, [orgId]);

  const loadPartyName = useCallback(async (pId) => {
    if (!pId || !orgId) return;
    try {
      const party = await purchaseContractAmendmentAPI.getPartyById(pId, orgId);
      setValue("partyName", party?.partyName || party?.name || "");
    } catch {
      setValue("partyName", "");
    }
  }, [orgId, setValue]);

  useEffect(() => {
    if (partyId) {
      const timer = setTimeout(() => loadPartyName(partyId), 500);
      return () => clearTimeout(timer);
    }
  }, [partyId, loadPartyName]);

  const loadContractDetails = useCallback(async (cNo) => {
    if (!cNo || !orgId) return;
    setLoadingContract(true);
    try {
      const items = await purchaseContractAmendmentAPI.getContractDetails(cNo, orgId, branch);
      if (items && items.length > 0) {
        setValue("contractDate", items[0].contractDate ? dayjs(items[0].contractDate).format("YYYY-MM-DD") : "");
        const mapped = items.map((item, idx) => ({
          id: item.id || Date.now() + idx,
          slNo: idx + 1,
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          unit: item.unit || "",
          oldRate: item.rate || 0,
          newRate: item.rate || 0,
          validFrom: item.validFrom || "",
          newValidFrom: item.validFrom || "",
          validTo: item.validTo || "",
          newValidTo: item.validTo || "",
        }));
        setValue("pcDetails", mapped);
        setPcDetailError("");
      }
    } catch (error) {
      console.error("Failed to load contract details:", error);
    } finally {
      setLoadingContract(false);
    }
  }, [orgId, branch, setValue]);

  useEffect(() => {
    if (contractNo) {
      const timer = setTimeout(() => loadContractDetails(contractNo), 500);
      return () => clearTimeout(timer);
    }
  }, [contractNo, loadContractDetails]);

  const onSubmit = async (formData) => {
    const isValid = await handleSubmit(
      () => true,
      () => {
        addToast("Please fill all mandatory fields", "error");
      }
    )();
    if (!isValid) return;

    if (!formData.pcDetails || formData.pcDetails.length === 0) {
      setPcDetailError("At least one contract detail item is required");
      setActiveTab("pcDetail");
      addToast("At least one contract detail item is required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amendmentNo: formData.amendmentNo || `AMC${dayjs().format("YYYYMMDDHHmmss")}`,
        revisionNo: data ? formData.revisionNo : 1,
        orgId,
        branch,
        createdBy: loginUserName,
        pcDetails: (formData.pcDetails || []).map((d) => ({
          ...d,
          newRate: Number(d.newRate) || 0,
        })),
      };
      const res = await purchaseContractAmendmentAPI.createUpdate(payload);
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

  const addPcDetailRow = () => {
    const current = getValues("pcDetails") || [];
    setValue("pcDetails", [
      ...current,
      {
        id: Date.now(),
        slNo: current.length + 1,
        itemCode: "",
        itemName: "",
        unit: "",
        oldRate: 0,
        newRate: 0,
        validFrom: "",
        newValidFrom: "",
        validTo: "",
        newValidTo: "",
      },
    ]);
    setPcDetailError("");
  };

  const removePcDetailRow = (index) => {
    const current = getValues("pcDetails") || [];
    if (current.length <= 1) return;
    const updated = current.filter((_, i) => i !== index).map((d, i) => ({ ...d, slNo: i + 1 }));
    setValue("pcDetails", updated);
  };

  const updatePcDetail = (index, field, value) => {
    const current = getValues("pcDetails") || [];
    current[index] = { ...current[index], [field]: value };
    if (field === "itemCode") {
      const item = itemOptions.find(
        (i) => (i.itemCode || i.code || i.id?.toString()) === value
      );
      if (item) {
        current[index].itemName = item.itemName || item.description || "";
      }
    }
    setValue("pcDetails", [...current]);
  };

  const addAttachment = () => {
    setAttachmentFiles((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttachment = (index, file) => {
    setAttachmentFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file };
      return updated;
    });
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
              {data ? "Edit Purchase Contract Amendment" : "New Purchase Contract Amendment"}
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
          {renderField("Belongs To *", "belongsTo", "select", { required: true, selectOptions: ["Domestic", "Import", "Export"] })}
          {renderField("Party ID *", "partyId", "select", { required: true, selectOptions: [] })}
          {renderField("Party Name", "partyName", "text", { disabled: true })}
          {renderField("Contract No *", "contractNo", "select", { required: true, selectOptions: [] })}
          {renderField("Contract Date", "contractDate", "date", { disabled: true })}
          {renderField("Amendment No", "amendmentNo", "text", { disabled: true, placeholder: "Auto-generated" })}
          {renderField("Amendment Date *", "amendmentDate", "date", { required: true })}
          {renderField("Revision No", "revisionNo", "number", { disabled: true })}
          {renderField("Ref No", "refNo", "text")}
          {renderField("Ref Date", "refDate", "date")}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {[
              { key: "pcDetail", label: "PC Detail" },
              { key: "summary", label: "Summary" },
              { key: "attachment", label: "Attached Price Revision Approval Copy" },
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
        {activeTab === "pcDetail" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader>Contract Items</SectionHeader>
              <div className="flex items-center gap-2">
                {loadingContract && <span className="text-xs text-gray-500">Loading contract details...</span>}
                <button
                  type="button"
                  onClick={addPcDetailRow}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            {pcDetailError && (
              <div className="text-red-500 text-[10px]">{pcDetailError}</div>
            )}
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 w-8 text-center dark:text-white">#</th>
                    <th className="p-1 text-left dark:text-white">Item Code</th>
                    <th className="p-1 text-left dark:text-white">Item Description</th>
                    <th className="p-1 text-left dark:text-white">Unit</th>
                    <th className="p-1 text-left dark:text-white">Old Rate</th>
                    <th className="p-1 text-left dark:text-white">New Rate</th>
                    <th className="p-1 text-left dark:text-white">Valid From</th>
                    <th className="p-1 text-left dark:text-white">New Valid From</th>
                    <th className="p-1 text-left dark:text-white">Valid To</th>
                    <th className="p-1 text-left dark:text-white">New Valid To</th>
                    <th className="p-1 w-20 text-left dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(pcDetails || []).map((item, index) => (
                    <tr key={item.id || index} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
                      <td className="p-1">
                        <select
                          value={item.itemCode || ""}
                          onChange={(e) => updatePcDetail(index, "itemCode", e.target.value)}
                          className={`${controlClasses} h-8 text-xs`}
                        >
                          <option value="">Select</option>
                          {itemOptions.map((opt) => {
                            const val = opt.itemCode || opt.code || opt.id?.toString() || "";
                            const lbl = opt.itemCode || opt.code || "";
                            return <option key={val} value={val}>{lbl}</option>;
                          })}
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          value={item.itemName || ""}
                          disabled
                          className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={item.unit || ""}
                          onChange={(e) => updatePcDetail(index, "unit", e.target.value)}
                          className={`${controlClasses} h-8 text-xs`}
                        >
                          <option value="">Select</option>
                          {unitOptions.map((opt) => {
                            const val = opt.unitCode || opt.code || opt.id?.toString() || "";
                            const lbl = opt.unitName || opt.name || opt.unitCode || opt.code || "";
                            return <option key={val} value={val}>{lbl}</option>;
                          })}
                        </select>
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
                          step="0.01"
                          value={item.newRate ?? 0}
                          onChange={(e) => updatePcDetail(index, "newRate", parseFloat(e.target.value) || 0)}
                          className={`${controlClasses} h-8 text-xs text-center`}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          value={item.validFrom || ""}
                          disabled
                          className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="date"
                          value={item.newValidFrom || ""}
                          onChange={(e) => updatePcDetail(index, "newValidFrom", e.target.value)}
                          className={`${controlClasses} h-8 text-xs`}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          value={item.validTo || ""}
                          disabled
                          className={`${controlClasses} h-8 text-xs bg-gray-50 dark:bg-gray-800`}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="date"
                          value={item.newValidTo || ""}
                          onChange={(e) => updatePcDetail(index, "newValidTo", e.target.value)}
                          className={`${controlClasses} h-8 text-xs`}
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removePcDetailRow(index)}
                          disabled={pcDetails.length <= 1}
                          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                            pcDetails.length <= 1 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-2 items-start">
            {renderField("Freight Type", "freightType", "select", { selectOptions: FREIGHT_TYPES })}
            {renderField("Packing Type", "packingType", "select", { selectOptions: PACKING_TYPES })}
            {renderField("Insurance Amount", "insuranceAmount", "number", { step: "0.01" })}
            {renderField("Mode of Dispatch", "modeOfDispatch", "select", { selectOptions: MODE_OF_DISPATCH })}
            {renderField("Tax Description", "taxDescription", "select", { selectOptions: [] })}
            {renderField("Prepared By", "preparedBy", "select", { selectOptions: [] })}
            {renderField("Authorised By", "authorisedBy", "select", { selectOptions: [] })}
            <div></div>
            <div className="col-span-1 md:col-span-2 xl:col-span-3">
              {renderField("Remarks", "remarks", "textarea")}
            </div>
          </div>
        )}

        {activeTab === "attachment" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionHeader>Price Revision Approval Documents</SectionHeader>
              <button
                type="button"
                onClick={addAttachment}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 w-8 text-center dark:text-white">#</th>
                    <th className="p-1 text-left dark:text-white">Price Revision Approval Copy</th>
                    <th className="p-1 w-20 text-left dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attachmentFiles.map((att, index) => (
                    <tr key={att.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
                      <td className="p-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => updateAttachment(index, e.target.files?.[0] || null)}
                            className={`${controlClasses} h-8 text-xs file:mr-2 file:px-2 file:py-0.5 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                          />
                          {att.file && (
                            <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{att.file.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          disabled={attachmentFiles.length <= 1}
                          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                            attachmentFiles.length <= 1 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          <Trash2 size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-400">Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
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

export default PurchaseContractAmendmentForm;
