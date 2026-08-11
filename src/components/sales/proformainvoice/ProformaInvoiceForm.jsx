import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import proformaInvoiceAPI from "../../../api/Sales/proformaInvoiceAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { stateAPI } from "../../../api/stateAPI";
import bankAPI from "../../../api/bankAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

const subTabFieldGrid =
  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-4 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const InputField = ({ label, required, error, children }) => (
  <div>
    {label && (
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
    )}
    {children}
    {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
  </div>
);

const ToggleSwitch = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
);

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-2 whitespace-nowrap ${
            i === 0
              ? "w-8 text-center"
              : i === headers.length - 1
                ? "w-20 text-left"
                : "text-left"
          } text-gray-700 dark:text-gray-200`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-2 text-center">
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ type, value, onChange, options, placeholder }) => (
  <td className="p-2 align-top">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={controlClasses}
    >
      <option value="">{placeholder || "-- Select --"}</option>
      {(options || []).map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </td>
);

const getDefaultSalesRow = () => ({
  itemCode: "",
  customerPartNo: "",
  itemDescription: "",
  hsCode: "",
  taxType: "",
  taxRs: "",
  unit: "",
  qty: "",
  quotRate: "",
  orderRate: "",
  discountPercent: "",
  effectiveFrom: "",
  effectiveTo: "",
  discountAmount: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  currencyName: "",
});

const getDefaultTaxRow = () => ({
  particulars: "",
  amount: "",
  postFin: "",
});

const getDefaultValues = () => ({
  plant: "",
  invoiceNo: "",
  invoiceDate: dayjs().format("YYYY-MM-DD"),
  customerId: "",
  customerName: "",
  belongsTo: "",
  customerCode: "",
  poNo: "",
  partyGSTState: "",
  refNo: "",
  poDate: "",
  isIGSTAppli: "",
  refDate: "",
  locationId: "",
  gstnNo: "",
  kindAttention: "",
  designation: "",
  timeOfIssue: dayjs().format("HH:mm:ss"),
  taxCode: "",
  bankName: "",
  date: dayjs().format("YYYY-MM-DD"),
  timeOfRemoval: dayjs().format("HH:mm:ss"),

  salesContractDetails: [getDefaultSalesRow()],
  taxDetails: [getDefaultTaxRow()],

  termsAndConditions: {
    insurance: "",
    freight: "",
    noOfPkg: "",
    pkgType: "",
    modeOfTransport: "",
    rateOfDuty: "",
    tariffNo: "",
    basicValue: "",
    grossAmount: "",
    amountInWords: "",
    deliveryTo: "",
    paymentTerms: "",
    paymentPercentage: "",
    narration: "",
  },
});

const BELONGS_TO = ["Appliances", "Electricals", "Packaging", "Raw Material"];
const YES_NO = ["Yes", "No"];
const TAX_TYPE = ["CGST+SGST", "IGST", "UTGST", "GST"];
const CURRENCY = ["INR", "USD", "EUR", "GBP"];
const PARTICULAR = ["Freight", "Insurance", "Packing Charges", "Handling Charges", "Other"];
const POST_FIN = ["Yes", "No"];
const PKG_TYPE = ["Box", "Pallet", "Crate", "Bag", "Drum", "Container"];
const TRANSPORT = ["Road", "Rail", "Air", "Sea", "Courier"];
const KIND_ATTENTION = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const twoDigits = (n) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : ""));
  const threeDigits = (n) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (hundred ? ones[hundred] + " Hundred" + (rest ? " " : "") : "") + (rest ? twoDigits(rest) : "");
  };
  let words = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = Math.floor(num % 1000);
  if (crore) words += threeDigits(crore) + " Crore ";
  if (lakh) words += twoDigits(lakh) + " Lakh ";
  if (thousand) words += twoDigits(thousand) + " Thousand ";
  if (rest) words += threeDigits(rest);
  return (words || "Zero").trim() + " Only";
};

const ProformaInvoiceForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeTab, setActiveTab] = useState("salesContract");

  const defaults = useCallback(() => {
    const base = getDefaultValues();
    if (data) {
      base.plant = data.plant?.id ?? data.plant ?? "";
      base.invoiceNo = data.invoiceNo || "";
      base.invoiceDate = fmtDate(data.invoiceDate || data.date);
      base.customerId = data.customerId?.id ?? data.customerId ?? "";
      base.customerName = data.customerName || "";
      base.belongsTo = data.belongsTo || "";
      base.customerCode = data.customerCode || "";
      base.poNo = data.poNo || "";
      base.partyGSTState = data.partyGSTState || "";
      base.refNo = data.refNo || "";
      base.poDate = fmtDate(data.poDate);
      base.isIGSTAppli = data.isIGSTAppli || "";
      base.refDate = fmtDate(data.refDate);
      base.locationId = data.locationId?.id ?? data.locationId ?? "";
      base.gstnNo = data.gstnNo || "";
      base.kindAttention = data.kindAttention || "";
      base.designation = data.designation || "";
      base.timeOfIssue = data.timeOfIssue || "";
      base.taxCode = data.taxCode || "";
      base.bankName = data.bankName || "";
      base.date = fmtDate(data.date);
      base.timeOfRemoval = data.timeOfRemoval || "";
      base.salesContractDetails = data.salesContractDetails?.length
        ? data.salesContractDetails
        : [getDefaultSalesRow()];
      base.taxDetails = data.taxDetails?.length
        ? data.taxDetails
        : [getDefaultTaxRow()];
      base.termsAndConditions = {
        ...base.termsAndConditions,
        ...(data.termsAndConditions || {}),
      };
    }
    return base;
  }, [data]);

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: defaults(),
  });

  useEffect(() => {
    reset(defaults());
  }, [data, defaults, reset]);

  const salesContractArray = useFieldArray({
    control,
    name: "salesContractDetails",
  });
  const taxDetailsArray = useFieldArray({
    control,
    name: "taxDetails",
  });

  const watchSalesRows = watch("salesContractDetails");
  const grossAmount = watch("termsAndConditions.grossAmount");

  /* ---------------- Lookup loading ---------------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          customerName: c.customerName || "",
          customerCode: c.customerCode || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branch]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode };
      });
      setItemOptions(options);
      setItemMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMap({});
    }
  }, [orgId, branch]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branch, orgId);
      setUnitOptions(
        (res || []).map((u) => ({
          value: u.id,
          label: u.unitId,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);
      setUnitOptions([]);
    }
  }, [orgId, branch]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.id,
          label: l.locationName || l.locationCode || l.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
    }
  }, [orgId, branch]);

  const loadStates = useCallback(async () => {
    try {
      const res = await stateAPI.getStates(orgId);
      setStateOptions(
        (res || []).map((s) => ({
          value: s.id,
          label: s.stateName || s.stateCode || s.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load state options:", error);
      setStateOptions([]);
    }
  }, [orgId]);

  const loadBanks = useCallback(async () => {
    try {
      const res = await bankAPI.getAll(orgId);
      setBankOptions(
        (res || []).map((b) => ({
          value: b.id,
          label: b.bankName || b.bankCode || b.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load bank options:", error);
      setBankOptions([]);
    }
  }, [orgId]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadCustomers();
      loadItems();
      loadUnits();
      loadLocations();
      loadStates();
      loadBanks();
      loadEmployees();
    }
  }, [
    orgId,
    loadPlants,
    loadCustomers,
    loadItems,
    loadUnits,
    loadLocations,
    loadStates,
    loadBanks,
    loadEmployees,
  ]);

  /* ---------------- Handlers ---------------- */

  const handleCustomerChange = (id) => {
    const customer = customerOptions.find((c) => String(c.value) === String(id));
    setValue("customerId", id, { shouldDirty: true });
    setValue("customerName", customer?.customerName || "", { shouldDirty: true });
    setValue("customerCode", customer?.customerCode || "", { shouldDirty: true });
  };

  const handleItemChange = (idx, field, value) => {
    setValue(`salesContractDetails.${idx}.${field}`, value, {
      shouldDirty: true,
    });
    if (field === "itemCode") {
      const item = itemMap[value];
      setValue(`salesContractDetails.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });
      setValue(`salesContractDetails.${idx}.hsCode`, item?.hsnCode || item?.hsnSacCode || "", { shouldDirty: true });
      setValue(`salesContractDetails.${idx}.unit`, item?.primaryUnits?.id || "", { shouldDirty: true });
    }
  };

  // Recompute row amount = qty x orderRate minus discount.
  const recalcRow = (idx) => {
    const row = watchSalesRows?.[idx];
    if (!row) return;
    const qty = parseFloat(row.qty) || 0;
    const rate = parseFloat(row.orderRate) || 0;
    const disc = parseFloat(row.discountPercent) || 0;
    const amount = qty * rate * (1 - (disc / 100));
    setValue(`salesContractDetails.${idx}.amount`, amount ? amount.toFixed(2) : "", { shouldDirty: true });
  };

  useEffect(() => {
    if (!watchSalesRows?.length) return;
    const total = watchSalesRows.reduce((sum, r) => {
      const amount = parseFloat(r.amount) || 0;
      const tax =
        (parseFloat(r.sgstAmount) || 0) +
        (parseFloat(r.cgstAmount) || 0) +
        (parseFloat(r.igstAmount) || 0);
      return sum + amount + tax;
    }, 0);
    const taxRowsTotal = (watch("taxDetails") || []).reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0,
    );
    const grand = total + taxRowsTotal;
    setValue("termsAndConditions.grossAmount", grand ? grand.toFixed(2) : "", { shouldDirty: true });
    setValue("termsAndConditions.amountInWords", grand ? numberToWords(grand) : "", { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSalesRows, grossAmount, watch("taxDetails")]);

  const handleAddItem = () => {
    const idx = salesContractArray.fields.length;
    salesContractArray.append(getDefaultSalesRow());
    setValue(`salesContractDetails.${idx}.effectiveFrom`, dayjs().format("YYYY-MM-DD"), { shouldDirty: true });
  };

  const handleRemoveItem = (index) => {
    if (salesContractArray.fields.length > 1) salesContractArray.remove(index);
  };

  const handleAddTax = () => taxDetailsArray.append(getDefaultTaxRow());
  const handleRemoveTax = (index) => {
    if (taxDetailsArray.fields.length > 1) taxDetailsArray.remove(index);
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const fundErrors = [];
    if (!defaults().invoiceNo && !watch("invoiceNo")) {
      // invoice no auto generated; nothing to validate
    }
    if (!watch("plant")) fundErrors.push("Plant");
    if (!watch("customerId")) fundErrors.push("Customer");
    if (!watch("invoiceDate")) fundErrors.push("Invoice Date");
    if (fundErrors.length)
      addToast(`Missing mandatory fields: ${fundErrors.join(", ")}`, "error");
    return fundErrors.length === 0;
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...formData,
      invoiceNo: formData.invoiceNo || `PI-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      salesContractDetails: (formData.salesContractDetails || []).filter(
        (r) => r.itemCode?.trim(),
      ),
      taxDetails: (formData.taxDetails || []).filter(
        (r) => r.particulars?.trim() || parseFloat(r.amount) > 0,
      ),
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await proformaInvoiceAPI.createUpdateProformaInvoice(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Proforma Invoice updated successfully!"
              : "Proforma Invoice created successfully!"),
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Proforma Invoice.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Proforma Invoice Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
          "error",
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    }
  };

  const renderHeader = () => (
    <div className={fieldGrid}>
      <InputField label="Plant" required error={errors.plant?.message}>
        <Controller
          control={control}
          name="plant"
          rules={{ required: "Plant is required" }}
          render={({ field }) => (
            <select {...field} className={`${controlClasses} ${errors.plant ? "border-red-500" : ""}`}>
              <option value="">-- Select --</option>
              {plantOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Invoice No">
        <input
          {...register("invoiceNo")}
          placeholder="Auto"
          disabled={!data}
          className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
        />
      </InputField>

      <InputField label="Invoice Date" required error={errors.invoiceDate?.message}>
        <input
          type="date"
          {...register("invoiceDate", { required: "Invoice Date is required" })}
          className={`${controlClasses} ${errors.invoiceDate ? "border-red-500" : ""}`}
        />
      </InputField>

      <InputField label="Customer ID" required error={errors.customerId?.message}>
        <Controller
          control={control}
          name="customerId"
          rules={{ required: "Customer is required" }}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className={`${controlClasses} ${errors.customerId ? "border-red-500" : ""}`}
            >
              <option value="">-- Select --</option>
              {customerOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Customer Name">
        <input {...register("customerName")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>

      <InputField label="Belongs To">
        <Controller
          control={control}
          name="belongsTo"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {BELONGS_TO.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Customer Code">
        <input {...register("customerCode")} disabled className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
      </InputField>

      <InputField label="PO No.">
        <input {...register("poNo")} className={controlClasses} placeholder="PO No." />
      </InputField>

      <InputField label="Party GST State">
        <Controller
          control={control}
          name="partyGSTState"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {stateOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Ref.No.">
        <input {...register("refNo")} className={controlClasses} placeholder="Ref.No." />
      </InputField>

      <InputField label="PO Date">
        <input type="date" {...register("poDate")} className={controlClasses} />
      </InputField>

      <InputField label="Is IGST Appli?">
        <Controller
          control={control}
          name="isIGSTAppli"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {YES_NO.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Ref.Date.">
        <input type="date" {...register("refDate")} className={controlClasses} />
      </InputField>

      <InputField label="Location ID">
        <Controller
          control={control}
          name="locationId"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {locationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="GSTN No.">
        <input {...register("gstnNo")} className={controlClasses} placeholder="GSTN No." />
      </InputField>

      <InputField label="Kind Attention">
        <Controller
          control={control}
          name="kindAttention"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {KIND_ATTENTION.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Designation">
        <Controller
          control={control}
          name="designation"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {employeeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Time Of Issue">
        <input type="time" {...register("timeOfIssue")} className={controlClasses} />
      </InputField>

      <InputField label="Tax Code">
        <Controller
          control={control}
          name="taxCode"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {TAX_TYPE.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Bank Name">
        <Controller
          control={control}
          name="bankName"
          render={({ field }) => (
            <select {...field} className={controlClasses}>
              <option value="">-- Select --</option>
              {bankOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
      </InputField>

      <InputField label="Date">
        <input type="date" {...register("date")} className={controlClasses} />
      </InputField>

      <InputField label="Time Of Removal">
        <input type="time" {...register("timeOfRemoval")} className={controlClasses} />
      </InputField>
    </div>
  );

  const renderSalesTab = () => (
    <div className="pt-2 space-y-2">
      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span>Add products to the proforma invoice</span>
        <button
          type="button"
          onClick={handleAddItem}
          className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>

      <TableWrapper>
        <TableHead
          headers={[
            "S.No",
            "Item Code *",
            "Customer Part No",
            "Item Description",
            "HSN/SAC Code",
            "Tax Type",
            "Tax (%)",
            "Unit",
            "Qty",
            "Quot. Rate",
            "Order Rate",
            "Discount %",
            "Effective From",
            "Effective To",
            "Discount Amount",
            "Amount",
            "SGST Rate",
            "SGST Amount",
            "CGST Rate",
            "CGST Amount",
            "IGST Rate",
            "IGST Amount",
            "Currency",
            "Action",
          ]}
        />
        <tbody>
          {salesContractArray.fields.map((field, index) => (
            <TableRow
              key={field.id}
              index={index}
              onRemove={() => handleRemoveItem(index)}
              disabled={salesContractArray.fields.length <= 1}
            >
              <SelectCell
                value={watchSalesRows?.[index]?.itemCode}
                onChange={(v) => handleItemChange(index, "itemCode", v)}
                options={itemOptions}
              />
              <td className="p-2 align-top">
                <input
                  value={watchSalesRows?.[index]?.customerPartNo}
                  onChange={(e) => handleItemChange(index, "customerPartNo", e.target.value)}
                  className={controlClasses}
                  placeholder="Part No"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  value={watchSalesRows?.[index]?.itemDescription}
                  onChange={(e) => handleItemChange(index, "itemDescription", e.target.value)}
                  className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
                  placeholder="Description"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  value={watchSalesRows?.[index]?.hsCode}
                  onChange={(e) => handleItemChange(index, "hsCode", e.target.value)}
                  className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
                  placeholder="HS Code"
                />
              </td>
              <td className="p-2 align-top">
                <select
                  value={watchSalesRows?.[index]?.taxType}
                  onChange={(e) => handleItemChange(index, "taxType", e.target.value)}
                  className={controlClasses}
                >
                  <option value="">-- Select --</option>
                  {TAX_TYPE.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watchSalesRows?.[index]?.taxRs}
                  onChange={(e) => handleItemChange(index, "taxRs", e.target.value)}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <select
                  value={watchSalesRows?.[index]?.unit}
                  onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                  className={controlClasses}
                >
                  <option value="">-- Select --</option>
                  {unitOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.001"
                  value={watchSalesRows?.[index]?.qty}
                  onChange={(e) => {
                    handleItemChange(index, "qty", e.target.value);
                    recalcRow(index);
                  }}
                  className={controlClasses}
                  placeholder="0.000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watchSalesRows?.[index]?.quotRate}
                  onChange={(e) => handleItemChange(index, "quotRate", e.target.value)}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.001"
                  value={watchSalesRows?.[index]?.orderRate}
                  onChange={(e) => {
                    handleItemChange(index, "orderRate", e.target.value);
                    recalcRow(index);
                  }}
                  className={controlClasses}
                  placeholder="0.000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watchSalesRows?.[index]?.discountPercent}
                  onChange={(e) => {
                    handleItemChange(index, "discountPercent", e.target.value);
                    recalcRow(index);
                  }}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="date"
                  value={watchSalesRows?.[index]?.effectiveFrom}
                  onChange={(e) => handleItemChange(index, "effectiveFrom", e.target.value)}
                  className={controlClasses}
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="date"
                  value={watchSalesRows?.[index]?.effectiveTo}
                  onChange={(e) => handleItemChange(index, "effectiveTo", e.target.value)}
                  className={controlClasses}
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.001"
                  value={watchSalesRows?.[index]?.discountAmount}
                  onChange={(e) => handleItemChange(index, "discountAmount", e.target.value)}
                  className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
                  placeholder="0.000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.001"
                  value={watchSalesRows?.[index]?.amount}
                  className={`${controlClasses} bg-gray-50 dark:bg-gray-800`}
                  readOnly
                  placeholder="0.000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.0001"
                  value={watchSalesRows?.[index]?.sgstRate}
                  onChange={(e) => handleItemChange(index, "sgstRate", e.target.value)}
                  className={controlClasses}
                  placeholder="0.0000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watchSalesRows?.[index]?.sgstAmount}
                  onChange={(e) => handleItemChange(index, "sgstAmount", e.target.value)}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.0001"
                  value={watchSalesRows?.[index]?.cgstRate}
                  onChange={(e) => handleItemChange(index, "cgstRate", e.target.value)}
                  className={controlClasses}
                  placeholder="0.0000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watchSalesRows?.[index]?.cgstAmount}
                  onChange={(e) => handleItemChange(index, "cgstAmount", e.target.value)}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.0001"
                  value={watchSalesRows?.[index]?.igstRate}
                  onChange={(e) => handleItemChange(index, "igstRate", e.target.value)}
                  className={controlClasses}
                  placeholder="0.0000"
                />
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watchSalesRows?.[index]?.igstAmount}
                  onChange={(e) => handleItemChange(index, "igstAmount", e.target.value)}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <select
                  value={watchSalesRows?.[index]?.currencyName}
                  onChange={(e) => handleItemChange(index, "currencyName", e.target.value)}
                  className={controlClasses}
                >
                  <option value="">-- Select --</option>
                  {CURRENCY.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </td>
            </TableRow>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );

  const renderTaxTab = () => (
    <div className="pt-2 space-y-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleAddTax}
          className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>

      <TableWrapper>
        <TableHead headers={["S.No", "Particulars", "Amount", "Post Fin", "Action"]} />
        <tbody>
          {taxDetailsArray.fields.map((field, index) => (
            <TableRow
              key={field.id}
              index={index}
              onRemove={() => handleRemoveTax(index)}
              disabled={taxDetailsArray.fields.length <= 1}
            >
              <td className="p-2 align-top">
                <select
                  value={watch(`taxDetails.${index}.particulars`)}
                  onChange={(e) => setValue(`taxDetails.${index}.particulars`, e.target.value, { shouldDirty: true })}
                  className={controlClasses}
                >
                  <option value="">-- Select --</option>
                  {PARTICULAR.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 align-top">
                <input
                  type="number"
                  step="0.01"
                  value={watch(`taxDetails.${index}.amount`)}
                  onChange={(e) => setValue(`taxDetails.${index}.amount`, e.target.value, { shouldDirty: true })}
                  className={controlClasses}
                  placeholder="0.00"
                />
              </td>
              <td className="p-2 align-top">
                <select
                  value={watch(`taxDetails.${index}.postFin`)}
                  onChange={(e) => setValue(`taxDetails.${index}.postFin`, e.target.value, { shouldDirty: true })}
                  className={controlClasses}
                >
                  <option value="">-- Select --</option>
                  {POST_FIN.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </td>
            </TableRow>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );

  const renderTermsTab = () => (
    <div className="pt-2">
      <div className={subTabFieldGrid}>
        <InputField label="Insurance">
          <Controller
            control={control}
            name="termsAndConditions.insurance"
            render={({ field }) => (
              <select {...field} className={controlClasses}>
                <option value="">-- Select --</option>
                {YES_NO.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          />
        </InputField>

        <InputField label="Freight">
          <Controller
            control={control}
            name="termsAndConditions.freight"
            render={({ field }) => (
              <select {...field} className={controlClasses}>
                <option value="">-- Select --</option>
                {YES_NO.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          />
        </InputField>

        <InputField label="No. Of Pkg">
          <input
            type="number"
            {...register("termsAndConditions.noOfPkg")}
            className={controlClasses}
            placeholder="No. of packages"
          />
        </InputField>

        <InputField label="Pkg Type">
          <Controller
            control={control}
            name="termsAndConditions.pkgType"
            render={({ field }) => (
              <select {...field} className={controlClasses}>
                <option value="">-- Select --</option>
                {PKG_TYPE.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          />
        </InputField>

        <InputField label="Mode Of Transport">
          <Controller
            control={control}
            name="termsAndConditions.modeOfTransport"
            render={({ field }) => (
              <select {...field} className={controlClasses}>
                <option value="">-- Select --</option>
                {TRANSPORT.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          />
        </InputField>

        <InputField label="Rate Of Duty">
          <input
            type="number"
            step="0.01"
            {...register("termsAndConditions.rateOfDuty")}
            className={controlClasses}
            placeholder="0.00"
          />
        </InputField>

        <InputField label="Tariff No.">
          <input {...register("termsAndConditions.tariffNo")} className={controlClasses} placeholder="Tariff No." />
        </InputField>

        <InputField label="Basic Value">
          <input
            type="number"
            step="0.01"
            {...register("termsAndConditions.basicValue")}
            className={controlClasses}
            placeholder="0.00"
          />
        </InputField>

        <InputField label="Gross Amount">
          <input {...register("termsAndConditions.grossAmount")} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
        </InputField>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField label="Amount In Words">
            <input {...register("termsAndConditions.amountInWords")} readOnly className={`${controlClasses} bg-gray-50 dark:bg-gray-800`} />
          </InputField>
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField label="Delivery To">
            <input {...register("termsAndConditions.deliveryTo")} className={controlClasses} placeholder="Delivery address" />
          </InputField>
        </div>

        <InputField label="Payment Terms">
          <input {...register("termsAndConditions.paymentTerms")} className={controlClasses} placeholder="Payment terms" />
        </InputField>

        <InputField label="Payment %">
          <input
            type="number"
            step="0.01"
            {...register("termsAndConditions.paymentPercentage")}
            className={controlClasses}
            placeholder="0.00"
          />
        </InputField>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField label="Narration">
            <textarea
              rows={2}
              {...register("termsAndConditions.narration")}
              className={`${controlClasses} h-auto min-h-[60px] resize-y`}
              placeholder="Enter narration..."
            />
          </InputField>
        </div>
      </div>
    </div>
  );

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
          {data ? "Edit Proforma Invoice" : "Add Proforma Invoice"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Proforma Invoice</SectionHeader>
          {renderHeader()}
        </div>

        {/* ---------------- Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
            <button
              type="button"
              onClick={() => setActiveTab("salesContract")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${
                activeTab === "salesContract"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Product Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("taxDetails")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${
                activeTab === "taxDetails"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Tax Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("termsAndConditions")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${
                activeTab === "termsAndConditions"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              Terms And Conditions
            </button>
          </div>

          {activeTab === "salesContract" && renderSalesTab()}
          {activeTab === "taxDetails" && renderTaxTab()}
          {activeTab === "termsAndConditions" && renderTermsTab()}
        </section>

        {/* ---------------- Buttons ---------------- */}
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
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProformaInvoiceForm;