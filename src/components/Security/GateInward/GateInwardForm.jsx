import { ArrowLeft, Save, X, Calendar, Clock } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import gateInwardAPI from "../../../api/Security/gateInwardAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

// ===================== Constants =====================

const MODVAT_OPTIONS = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

// ===================== Utility Functions =====================

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

// ===================== Reusable Components =====================

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  onChange,
  disabled,
  placeholder = "-- Select --",
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
            value={field.value || ""}
          >
            <option value="">{placeholder}</option>
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
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
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
  readOnly,
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
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            value={field.value || ""}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const DateField = ({ control, name, label, required, errors, disabled }) => {
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
          <div className="relative">
            <input
              {...field}
              type="date"
              className={`${controlClasses} pr-7 ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${disabled ? "bg-gray-50 dark:bg-gray-800" : ""}`}
              disabled={disabled}
              value={field.value || ""}
            />
            <Calendar className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const TimeField = ({ control, name, label, required, errors, disabled }) => {
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
          <div className="relative">
            <input
              {...field}
              type="time"
              className={`${controlClasses} pr-7 ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${disabled ? "bg-gray-50 dark:bg-gray-800" : ""}`}
              disabled={disabled}
              value={field.value || ""}
            />
            <Clock className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

// ===================== Default Values =====================

const getDefaultValues = () => ({
  plantId: "",
  gatePassNo: "",
  date: dayjs().format("YYYY-MM-DD"),
  partyName: "",
  partyId: "",
  address: "",
  docType: "",
  modvatCopyReceived: "NO",
  supplierInvNo: "",
  invoiceNo: "",
  supplierInvDate: "",
  timeOfEntry: dayjs().format("HH:mm:ss"),
});

// ===================== Main Component =====================

const GateInwardForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const usersId = localStorage.getItem("usersId");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dataLoadedRef = useRef(false);

  // Lookup data states
  const [plantOptions, setPlantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerMap, setCustomerMap] = useState({});
  const [docTypeOptions, setDocTypeOptions] = useState([]);

  const LIST_OF_VALUES_GROUPS = {
    DOC_TYPE: "Gate Inward Doc Type",
  };

  const defaults = useCallback(() => {
    const base = getDefaultValues();
    if (data) {
      // Map API response fields to form fields
      base.plantId = data.branch?.id ?? data.plantId ?? "";
      base.gatePassNo = data.gatePassNo || data.docId || "";
      base.date = fmtDate(data.date || data.docDate);
      base.partyName = data.customer?.id ?? data.partyName ?? "";
      base.partyId = data.customer?.id ?? data.partyId ?? "";
      base.address = data.address || "";
      base.docType = data.docType || "";
      // Ensure modvatCopyReceived is properly formatted (uppercase)
      base.modvatCopyReceived = data.modvatCopyReceived ? data.modvatCopyReceived.toUpperCase() : "NO";
      base.supplierInvNo = data.supplierInvoiceNumber || data.supplierInvNo || "";
      base.invoiceNo = data.invoiceNumber || data.invoiceNo || "";
      base.supplierInvDate = fmtDate(data.supplierInvoiceDate || data.supplierInvDate);
      base.timeOfEntry = data.timeOfEntry || dayjs().format("HH:mm:ss");
    }
    return base;
  }, [data]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: defaults(),
  });

  // Watch supplierInvNo to generate invoice number
  const supplierInvNo = watch("supplierInvNo");
  const partyId = watch("partyId");
  const date = watch("date");

  useEffect(() => {
    reset(defaults());
  }, [data, defaults, reset]);

  // ===================== Generate Invoice Number =====================

  const generateInvoiceNumber = useCallback(() => {
    if (!supplierInvNo || !partyId) {
      setValue("invoiceNo", "", { shouldDirty: true });
      return;
    }

    // Format date as DDMMYYYY
    const formattedDate = date ? dayjs(date).format("DDMMYYYY") : dayjs().format("DDMMYYYY");

    // Get customer code from map
    const customer = customerMap[partyId];
    const customerCode = customer?.customerCode || partyId;

    // Generate invoice number: PartyID--SupplierINVNo--Date
    const invoiceNo = `${customerCode}--${supplierInvNo}--${formattedDate}`;
    setValue("invoiceNo", invoiceNo, { shouldDirty: true });
  }, [supplierInvNo, partyId, date, customerMap, setValue]);

  // Regenerate invoice number when supplierInvNo, partyId, or date changes
  useEffect(() => {
    generateInvoiceNumber();
  }, [supplierInvNo, partyId, date, generateInvoiceNumber]);

  // ===================== Load Data for Edit =====================

  const loadGateInwardData = useCallback(async (gateId) => {
    if (!gateId) return;

    setLoading(true);
    try {
      const response = await gateInwardAPI.getById(gateId);
      console.log("Gate Inward Data:", response);

      if (response) {
        const gate = response;

        // Map API response to form fields
        setValue("plantId", gate.branch?.id || "");
        setValue("gatePassNo", gate.gatePassNo || gate.docId || "");
        setValue("date", gate.date || gate.docDate || "");
        setValue("partyName", gate.customer?.id || "");
        setValue("partyId", gate.customer?.customerCode || "");
        setValue("address", gate.address || "");
        setValue("docType", gate.docType || "");
        // Ensure modvatCopyReceived is uppercase to match dropdown options
        setValue("modvatCopyReceived", gate.modvatCopyReceived ? gate.modvatCopyReceived.toUpperCase() : "NO");
        setValue("supplierInvNo", gate.supplierInvoiceNumber || gate.supplierInvNo || "");
        setValue("invoiceNo", gate.invoiceNumber || gate.invoiceNo || "");
        setValue("supplierInvDate", gate.supplierInvoiceDate || gate.supplierInvDate || "");
        setValue("timeOfEntry", gate.timeOfEntry || "");

        addToast("Gate Inward loaded successfully", "success");
      } else {
        addToast("Failed to load Gate Inward data", "error");
      }
    } catch (error) {
      console.error("Error loading gate inward:", error);
      addToast("Failed to load Gate Inward data", "error");
    } finally {
      setLoading(false);
    }
  }, [setValue, addToast]);

  useEffect(() => {
    const gateId = data?.id;

    if (!gateId) return;

    if (dataLoadedRef.current === gateId) {
      return;
    }

    dataLoadedRef.current = gateId;
    loadGateInwardData(gateId);
  }, [data?.id, loadGateInwardData]);

  // ===================== Data Loading =====================

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          }))
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await gateInwardAPI.getCustomerDropdown(orgId, branch);
      console.log("Customer Data:", res);

      const map = {};
      const options = (res || []).map((c) => {
        map[c.customerId] = {
          customerCode: c.customerCode,
          customerName: c.customerName,
          address: c.address || "",
        };
        return {
          value: c.customerId,
          label: c.customerName || c.customerCode || c.customerId,
        };
      });
      setCustomerOptions(options);
      setCustomerMap(map);
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
      setCustomerMap({});
    }
  }, [orgId, branch]);

  const loadDocTypes = useCallback(async () => {
    try {
      const response = await listOfValuesAPI.getListValuesGroup(
        LIST_OF_VALUES_GROUPS.DOC_TYPE,
        orgId
      );

      let items = [];
      if (response?.paramObjectsMap?.listValues) {
        items = response.paramObjectsMap.listValues;
      } else if (response?.data?.paramObjectsMap?.listValues) {
        items = response.data.paramObjectsMap.listValues;
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response?.listValues) {
        items = response.listValues;
      }

      const options = items.map((item) => ({
        value: item.id || item.value || item.valuesDescription,
        label: item.valuesDescription || item.label || item.name || item.value,
      }));

      setDocTypeOptions(options);
    } catch (error) {
      console.error("Failed to load doc type options:", error);
      setDocTypeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadCustomers();
      loadDocTypes();
    }
  }, [orgId, loadPlants, loadCustomers, loadDocTypes]);

  // ===================== Handlers =====================

  const applyCustomerSelection = (customerId) => {
    const customer = customerMap[customerId];
    if (customer) {
      setValue("partyName", customerId);
      setValue("partyId", customerId);
      setValue("address", customer.address || "");
    } else {
      setValue("partyName", customerId);
      setValue("partyId", customerId);
      setValue("address", "");
    }
  };

  // ===================== Validation & Save =====================

  const validate = () => {
    const fundErrors = [];
    if (!watch("plantId")) fundErrors.push("Plant");
    if (!watch("gatePassNo")) fundErrors.push("Gate Pass No");
    if (!watch("date")) fundErrors.push("Date");
    if (!watch("partyName")) fundErrors.push("Party Name");
    if (!watch("docType")) fundErrors.push("Doc Type");
    if (!watch("timeOfEntry")) fundErrors.push("Time of Entry");
    if (fundErrors.length)
      addToast(`Missing mandatory fields: ${fundErrors.join(", ")}`, "error");
    return fundErrors.length === 0;
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;

    setSaving(true);
    const isUpdate = Boolean(data?.id);

    const formatDateForAPI = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (e) {
        return dateString;
      }
    };

    // Build payload according to the API contract
    const payload = {
      active: true,
      address: formData.address || "",
      branch: branch,
      createdBy: usersId || "admin",
      customer: formData.partyId ? parseInt(formData.partyId) : 0,
      docType: formData.docType || "",
      invoiceNumber: formData.invoiceNo || "",
      modvatCopyReceived: formData.modvatCopyReceived || "NO",
      orgId: orgId,
      supplierInvoiceDate: formatDateForAPI(formData.supplierInvDate) || "",
      supplierInvoiceNumber: formData.supplierInvNo || "",
      timeOfEntry: formData.timeOfEntry || "",
    };

    // Only add id if updating (not creating)
    if (isUpdate) {
      payload.id = parseInt(data.id);
    }

    console.log("Saving Gate Inward Payload:", payload);

    try {
      const response = await gateInwardAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Gate Inward updated successfully!"
            : "Gate Inward created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Gate Inward.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save Gate Inward Error:", err);
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

  // ===================== Render Functions =====================

  const renderHeader = () => (
    <div className={fieldGrid}>
      <SelectField
        control={control}
        name="plantId"
        label="Plant ID"
        options={plantOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="gatePassNo"
        label="Gate Pass No"
        required
        placeholder="Enter gate pass no"
        errors={errors}
      />

      <DateField
        control={control}
        name="date"
        label="Date"
        required
        errors={errors}
      />

      <SelectField
        control={control}
        name="partyName"
        label="Party Name"
        options={customerOptions}
        required
        errors={errors}
        onChange={applyCustomerSelection}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="partyId"
        label="Party ID"
        disabled
        errors={errors}
      />

      <InputField
        control={control}
        name="address"
        label="Address"
        placeholder="Auto-filled from Party"
        errors={errors}
      />

      <SelectField
        control={control}
        name="docType"
        label="Doc Type"
        options={docTypeOptions}
        required
        errors={errors}
        placeholder="Select an option"
      />

      <SelectField
        control={control}
        name="modvatCopyReceived"
        label="Modvat Copy Received"
        options={MODVAT_OPTIONS}
        errors={errors}
        placeholder="Select an option"
      />

      <InputField
        control={control}
        name="supplierInvNo"
        label="Supplier INV. No."
        placeholder="Enter supplier invoice no"
        errors={errors}
      />

      <InputField
        control={control}
        name="invoiceNo"
        label="Invoice No."
        placeholder="Auto-generated"
        readOnly
        errors={errors}
      />

      <DateField
        control={control}
        name="supplierInvDate"
        label="Supplier INV. Date"
        errors={errors}
      />

      <TimeField
        control={control}
        name="timeOfEntry"
        label="Time of Entry"
        required
        errors={errors}
      />
    </div>
  );

  // ===================== Main Render =====================

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Gate Inward" : "Add Gate Inward"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Info */}
        <div>
          <SectionHeader>Gate Inward</SectionHeader>
          {renderHeader()}
        </div>

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

export default GateInwardForm;