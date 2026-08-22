import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { purchaseDeliveryScheduleAPI } from "../../../api/Purchase/purchaseDeliveryScheduleAPI";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Form Components                                                              */

const SelectField = ({ control, name, label, options, required, errors, onChange, disabled, placeholder }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
  disabled,
  step,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && {
            required: `${label} is required`,
          }),
        }}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const SelectCell = ({ control, name, options, required, errors, onChange, disabled }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div className="p-0.5 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-7 text-[10px] ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={typeof opt === "object" ? opt.value : opt} value={typeof opt === "object" ? opt.value : opt}>
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[9px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
  align = "left",
  disabled,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div className="p-0.5 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} h-7 text-[10px] ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[9px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "MTR", "LTR", "BOX", "SET"];

/* ---------------------------------------------------------------------------- */
/* Default Values                                                               */

const getDefaultValues = () => ({
  // General Info
  plantId: "",
  belongsTo: "",
  docNo: "",
  schStartDate: "",
  docDate: "",
  schEndDate: "",
  supplierCode: "",
  supplierName: "",
  poNo: "",
  poDate: "",

  // Schedule Details Table
  scheduleDetails: [
    {
      itemCode: "",
      primaryUnit: "",
      purchaseUnit: "",
      demandQty: "",
      availableStockQty: "",
      tentativeQty: "",
      tentativeQtyNextMonth: "",
      rate: "",
      preparedBy: "",
      note: "",
    },
  ],

  // Summary Table
  summary: [
    {
      itemCode: "",
      totalDemandQty: "",
      totalAvailableStock: "",
      totalTentativeQty: "",
      totalTentativeQtyNextMonth: "",
      totalScheduleQty: "",
    },
  ],

  // Schedule Table
  schedule: [
    {
      planDate: "",
      weekNo: "",
      scheduleQty: "",
    },
  ],
});

const CHILD_TABS = [
  { key: "scheduleDetails", label: "Schedule Details" },
  { key: "summary", label: "Summary" },
  { key: "schedule", label: "Schedule" },
];

/* ---------------------------------------------------------------------------- */
/* Main Component                                                               */

const PurchaseDeliveryScheduleForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("scheduleDetails");
  const [plantOptions, setPlantOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [saving, setSaving] = useState(false);
  const dataLoadedRef = useRef(false);
  const branchesLoadedRef = useRef(false);
  const suppliersLoadedRef = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: data || getDefaultValues(),
  });

  const scheduleDetailsArray = useFieldArray({
    control,
    name: "scheduleDetails",
  });

  const summaryArray = useFieldArray({
    control,
    name: "summary",
  });

  const scheduleArray = useFieldArray({
    control,
    name: "schedule",
  });

  // Watch supplierCode to auto-fill supplierName
  const supplierCode = watch("supplierCode");

  /* -------------------------------------------------------------------------- */
  /* API Calls                                                                  */

  const loadBranches = useCallback(async () => {
    if (branchesLoadedRef.current) return;

    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.branchName || branch.branchCode || branch.id,
      }));
      setPlantOptions(options);
      branchesLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantOptions([]);
    }
  }, [orgId]);

  const loadSuppliers = useCallback(async () => {
    if (suppliersLoadedRef.current) return;

    setLoadingSuppliers(true);
    try {
      const response = await purchaseDeliveryScheduleAPI.getSupplierDropdownForPurchaseDeliverySchedule(
        branchId,
        orgId
      );

      if (response?.status && response?.paramObjectsMap?.supplierList) {
        const options = response.paramObjectsMap.supplierList.map(supplier => ({
          value: supplier.supplierCode || supplier.id,
          label: `${supplier.supplierCode} - ${supplier.supplierName}`,
          supplierName: supplier.supplierName,
          id: supplier.id,
          gstNo: supplier.gstNo,
          gstApproval: supplier.gstApproval,
          gstState: supplier.gstState,
          address: supplier.address,
        }));
        setSupplierOptions(options);
        suppliersLoadedRef.current = true;
      } else {
        setSupplierOptions([]);
      }
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSupplierOptions([]);
      addToast("Failed to load suppliers", "error");
    } finally {
      setLoadingSuppliers(false);
    }
  }, [branchId, orgId, addToast]);

  /* -------------------------------------------------------------------------- */
  /* Data Population                                                            */

  const populateFormData = useCallback((formData) => {
    if (!formData) return;

    try {
      // General Info
      setValue("plantId", formData.plantId || "");
      setValue("belongsTo", formData.belongsTo || "");
      setValue("docNo", formData.docNo || "");
      setValue("schStartDate", formData.schStartDate || "");
      setValue("docDate", formData.docDate || "");
      setValue("schEndDate", formData.schEndDate || "");
      setValue("supplierCode", formData.supplierCode || "");
      setValue("supplierName", formData.supplierName || "");
      setValue("poNo", formData.poNo || "");
      setValue("poDate", formData.poDate || "");

      // Schedule Details
      if (formData.scheduleDetails && formData.scheduleDetails.length > 0) {
        const details = formData.scheduleDetails.map((item) => ({
          itemCode: item.itemCode || "",
          primaryUnit: item.primaryUnit || "",
          purchaseUnit: item.purchaseUnit || "",
          demandQty: item.demandQty || "",
          availableStockQty: item.availableStockQty || "",
          tentativeQty: item.tentativeQty || "",
          tentativeQtyNextMonth: item.tentativeQtyNextMonth || "",
          rate: item.rate || "",
          preparedBy: item.preparedBy || "",
          note: item.note || "",
        }));
        scheduleDetailsArray.replace(details);
      }

      // Summary
      if (formData.summary && formData.summary.length > 0) {
        const summaryData = formData.summary.map((item) => ({
          itemCode: item.itemCode || "",
          totalDemandQty: item.totalDemandQty || "",
          totalAvailableStock: item.totalAvailableStock || "",
          totalTentativeQty: item.totalTentativeQty || "",
          totalTentativeQtyNextMonth: item.totalTentativeQtyNextMonth || "",
          totalScheduleQty: item.totalScheduleQty || "",
        }));
        summaryArray.replace(summaryData);
      }

      // Schedule
      if (formData.schedule && formData.schedule.length > 0) {
        const scheduleData = formData.schedule.map((item) => ({
          planDate: item.planDate || "",
          weekNo: item.weekNo || "",
          scheduleQty: item.scheduleQty || "",
        }));
        scheduleArray.replace(scheduleData);
      }

      dataLoadedRef.current = true;
    } catch (error) {
      console.error("Error populating form data:", error);
    }
  }, [setValue, scheduleDetailsArray, summaryArray, scheduleArray]);

  /* -------------------------------------------------------------------------- */
  /* Effects                                                                    */

  // Load branches only once when component mounts
  useEffect(() => {
    if (orgId && !branchesLoadedRef.current) {
      loadBranches();
    }
  }, [orgId, loadBranches]);

  // Load suppliers only once when component mounts
  useEffect(() => {
    if (orgId && branchId && !suppliersLoadedRef.current) {
      loadSuppliers();
    }
  }, [orgId, branchId, loadSuppliers]);

  // Auto-fill supplier name when supplier code changes
  useEffect(() => {
    if (supplierCode && supplierOptions.length > 0) {
      const selectedSupplier = supplierOptions.find(
        (opt) => String(opt.value) === String(supplierCode)
      );
      if (selectedSupplier) {
        setValue("supplierName", selectedSupplier.supplierName || "");
      }
    } else if (!supplierCode) {
      setValue("supplierName", "");
    }
  }, [supplierCode, supplierOptions, setValue]);

  // Populate form data when data changes (edit mode)
  useEffect(() => {
    if (data && !dataLoadedRef.current) {
      populateFormData(data);
    }
  }, [data, populateFormData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dataLoadedRef.current = false;
      branchesLoadedRef.current = false;
      suppliersLoadedRef.current = false;
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Handlers                                                                   */

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "scheduleDetails") {
      scheduleDetailsArray.append(defaultValues.scheduleDetails[0]);
    } else if (arrayName === "summary") {
      summaryArray.append(defaultValues.summary[0]);
    } else if (arrayName === "schedule") {
      scheduleArray.append(defaultValues.schedule[0]);
    }
  };

  const handleRemoveItem = (arrayName, index) => {
    if (arrayName === "scheduleDetails") {
      if (scheduleDetailsArray.fields.length > 1) {
        scheduleDetailsArray.remove(index);
      }
    } else if (arrayName === "summary") {
      if (summaryArray.fields.length > 1) {
        summaryArray.remove(index);
      }
    } else if (arrayName === "schedule") {
      if (scheduleArray.fields.length > 1) {
        scheduleArray.remove(index);
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Submit                                                                     */

  const onSubmit = async (formData) => {
    setSaving(true);

    try {
      const isUpdate = Boolean(data?.id);

      const payload = {
        ...(isUpdate ? { id: data.id } : {}),
        orgId: Number(orgId),
        branchId: Number(branchId),
        plantId: formData.plantId,
        belongsTo: formData.belongsTo,
        docNo: formData.docNo,
        schStartDate: formData.schStartDate,
        docDate: formData.docDate,
        schEndDate: formData.schEndDate,
        supplierCode: formData.supplierCode,
        supplierName: formData.supplierName,
        poNo: formData.poNo,
        poDate: formData.poDate,
        scheduleDetails: (formData.scheduleDetails || [])
          .filter((r) => r.itemCode?.trim())
          .map((item) => ({
            itemCode: item.itemCode,
            primaryUnit: item.primaryUnit,
            purchaseUnit: item.purchaseUnit,
            demandQty: item.demandQty,
            availableStockQty: item.availableStockQty,
            tentativeQty: item.tentativeQty,
            tentativeQtyNextMonth: item.tentativeQtyNextMonth,
            rate: item.rate,
            preparedBy: item.preparedBy,
            note: item.note,
          })),
        summary: (formData.summary || [])
          .filter((r) => r.itemCode?.trim())
          .map((item) => ({
            itemCode: item.itemCode,
            totalDemandQty: item.totalDemandQty,
            totalAvailableStock: item.totalAvailableStock,
            totalTentativeQty: item.totalTentativeQty,
            totalTentativeQtyNextMonth: item.totalTentativeQtyNextMonth,
            totalScheduleQty: item.totalScheduleQty,
          })),
        schedule: (formData.schedule || [])
          .filter((r) => r.planDate || r.weekNo || r.scheduleQty)
          .map((item) => ({
            planDate: item.planDate,
            weekNo: item.weekNo,
            scheduleQty: item.scheduleQty,
          })),
        createdBy: isUpdate
          ? data?.createdBy || localStorage.getItem("usersId")
          : localStorage.getItem("usersId"),
        ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
      };

      const response = await purchaseDeliveryScheduleAPI.createUpdateSchedule(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Purchase Delivery Schedule updated successfully!"
            : "Purchase Delivery Schedule created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Purchase Delivery Schedule.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save Purchase Delivery Schedule Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data),
          "error"
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */

  // Get the appropriate array based on active tab
  const getActiveArray = () => {
    switch (activeChildTab) {
      case "scheduleDetails":
        return { fields: scheduleDetailsArray.fields, name: "scheduleDetails" };
      case "summary":
        return { fields: summaryArray.fields, name: "summary" };
      case "schedule":
        return { fields: scheduleArray.fields, name: "schedule" };
      default:
        return { fields: scheduleDetailsArray.fields, name: "scheduleDetails" };
    }
  };

  // Get column configuration based on active tab
  const getColumnConfig = () => {
    switch (activeChildTab) {
      case "scheduleDetails":
        return [
          { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
          { key: "primaryUnit", label: "Primary Unit", type: "select", options: UNITS },
          { key: "purchaseUnit", label: "Purchase Unit", type: "select", options: UNITS },
          { key: "demandQty", label: "Demand Qty", type: "text" },
          { key: "availableStockQty", label: "Available Stock Qty", type: "text" },
          { key: "tentativeQty", label: "Tentative Qty", type: "text" },
          { key: "tentativeQtyNextMonth", label: "Tentative Qty Next Month", type: "text" },
          { key: "rate", label: "Rate", type: "text" },
          { key: "preparedBy", label: "Prepared By", type: "text" },
          { key: "note", label: "Note", type: "text" },
        ];
      case "summary":
        return [
          { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
          { key: "totalDemandQty", label: "Total Demand Qty", type: "text" },
          { key: "totalAvailableStock", label: "Total Available Stock", type: "text" },
          { key: "totalTentativeQty", label: "Total Tentative Qty", type: "text" },
          { key: "totalTentativeQtyNextMonth", label: "Total Tentative Qty Next Month", type: "text" },
          { key: "totalScheduleQty", label: "Total Schedule Qty", type: "text" },
        ];
      case "schedule":
        return [
          { key: "planDate", label: "Plan Date", type: "date" },
          { key: "weekNo", label: "Week No.", type: "text" },
          { key: "scheduleQty", label: "Schedule Qty", type: "text" },
        ];
      default:
        return [];
    }
  };

  const activeFields = getActiveArray();
  const columns = getColumnConfig();

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Purchase Delivery Schedule" : "Add Purchase Delivery Schedule"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* General Info */}
        <div>
          <SectionHeader>Purchase Delivery Schedule Details</SectionHeader>
          <div className={fieldGrid}>
            <SelectField
              control={control}
              name="plantId"
              label="Plant ID"
              options={plantOptions.length > 0 ? plantOptions : []}
              required
              errors={errors}
            />
            <SelectField
              control={control}
              name="belongsTo"
              label="Belongs To"
              options={BELONGS_TO}
              required
              errors={errors}
            />
            <InputField
              control={control}
              name="docNo"
              label="Doc No"
              placeholder="Enter document number"
              required
              errors={errors}
            />
            <InputField
              control={control}
              type="date"
              name="docDate"
              label="Doc Date"
              required
              errors={errors}
            />
            <InputField
              control={control}
              type="date"
              name="schStartDate"
              label="Sch. Start Date"
              required
              errors={errors}
            />
            <InputField
              control={control}
              type="date"
              name="schEndDate"
              label="Sch. End Date"
              required
              errors={errors}
            />
            <SelectField
              control={control}
              name="supplierCode"
              label="Supplier Code"
              options={supplierOptions}
              required
              errors={errors}
              disabled={loadingSuppliers}
              placeholder={loadingSuppliers ? "Loading suppliers..." : "Select Supplier"}
            />
            <InputField
              control={control}
              name="supplierName"
              label="Supplier Name"
              placeholder="Auto-filled from selection"
              required
              errors={errors}
              disabled={true}
            />
            <InputField
              control={control}
              name="poNo"
              label="PO No."
              placeholder="Enter PO number"
              required
              errors={errors}
            />
            <InputField
              control={control}
              type="date"
              name="poDate"
              label="PO Date"
              required
              errors={errors}
            />
          </div>
        </div>

        {/* Child Tables (tab bar + dynamic table) */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddItem(activeChildTab)}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Active tab's table */}
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs min-w-max">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-1 text-center dark:text-white whitespace-nowrap text-[10px] font-medium sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                    S.No
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="p-1 text-left dark:text-white whitespace-nowrap text-[10px] font-medium"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="p-1 text-center dark:text-white whitespace-nowrap text-[10px] font-medium sticky right-0 bg-gray-100 dark:bg-gray-700 z-10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeFields.fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-1 text-center font-medium dark:text-white text-[10px] sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {index + 1}
                    </td>

                    {columns.map((col) => {
                      const fieldName = `${activeFields.name}.${index}.${col.key}`;

                      if (col.type === "select") {
                        return (
                          <td key={col.key} className="p-0.5 align-top">
                            <SelectCell
                              control={control}
                              name={fieldName}
                              options={col.options || []}
                              errors={errors}
                            />
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="p-0.5 align-top">
                          <InputCell
                            control={control}
                            name={fieldName}
                            type={col.type === "date" ? "date" : "text"}
                            placeholder={col.label}
                            errors={errors}
                          />
                        </td>
                      );
                    })}

                    <td className="p-1 text-center sticky right-0 bg-white dark:bg-gray-800 z-10">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(activeChildTab, index)}
                        disabled={activeFields.fields.length <= 1}
                        className={`h-5 w-5 rounded text-white flex items-center justify-center ${activeFields.fields.length <= 1
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
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
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving || isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDeliveryScheduleForm;