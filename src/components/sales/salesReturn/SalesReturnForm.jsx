import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import salesReturnAPI from "../../../api/Sales/salesReturnAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { stateAPI } from "../../../api/stateAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";
import dailyExchangeRateAPI from "../../../api/dailyExchangeRateAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

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

const InputField = ({
  control, name, label, type = "text", required, placeholder, errors, disabled, step, readOnly,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) { if (error?.[part]) error = error[part]; else return null; }
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
          />
        )}
      />
      {errorMessage && <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>}
    </div>
  );
};

const SelectField = ({
  control, name, label, options, required, errors, onChange: onChangeProp, disabled, placeholder = "-- Select --",
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) { if (error?.[part]) error = error[part]; else return null; }
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
            disabled={disabled}
            onChange={(e) => { field.onChange(e); if (onChangeProp) onChangeProp(e); }}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={typeof opt === "object" ? opt.value : opt} value={typeof opt === "object" ? opt.value : opt}>
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>}
    </div>
  );
};

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
          className={`p-2 whitespace-nowrap ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white text-[10px]">{index + 1}</td>
    {children}
    {showDelete && (
      <td className="p-2 text-center">
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
        >
          <Trash2 size={10} />
        </button>
      </td>
    )}
  </tr>
);

const SelectCell = ({ control, name, options, required, errors, onChange, disabled }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) { if (error?.[part]) error = error[part]; else return null; }
    return error?.message;
  };
  const errorMessage = getError();
  return (
    <td className="p-2 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => { field.onChange(e); if (onChange) onChange(e.target.value); }}
            disabled={disabled}
          >
            <option value="">-- Select --</option>
            {options.map((opt) => (
              <option key={typeof opt === "object" ? opt.value : opt} value={typeof opt === "object" ? opt.value : opt}>
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>}
    </td>
  );
};

const InputCell = ({
  control, name, type = "text", step, placeholder, required, errors, align = "left", disabled, readOnly, onChange,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) { if (error?.[part]) error = error[part]; else return null; }
    return error?.message;
  };
  const errorMessage = getError();
  return (
    <td className="p-2 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => { field.onChange(e); if (onChange) onChange(e); }}
          />
        )}
      />
      {errorMessage && <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>}
    </td>
  );
};

// ===================== Constants =====================

const BELONGS_TO = ["Appliances", "Bosch"];
const YES_NO = ["Yes", "No"];
const INVOICE_REF_TYPES = ["With Our Invoice"," Without Our Invoice"];
const CURRENCY = [""];

const roundHalfUp = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

// ===================== Default Values =====================

const getDefaultItemRow = () => ({
  itemId: "",
  itemCode: "",
  itemDescription: "",
  hsnId: "",
  hsCode: "",
  taxType: "",
  taxPercentage: "",
  unit: "",
  unitDescription: "",
  stock: 0,
  qtySold: 0,
  receivedQty: 0,
  rate: 0,
  rateInCurrency: 0,
  amountInCurrency: 0,
  amount: 0,
  sgstRate: 0,
  cgstRate: 0,
  igstRate: 0,
});

const getDefaultTaxRow = () => ({
  particulars: "",
  amount: 0,
  glAccountName: "",
  sgstRate: 0,
  sgstAmount: 0,
  cgstRate: 0,
  cgstAmount: 0,
  igstRate: 0,
  igstAmount: 0,
});

const getDefaultValues = () => ({
  plantId: "",
  belongsTo: "",
  customerId: "",
  customerName: "",
  customerCode: "",
  locationId: "",
  refNo: "",
  refDate: dayjs().format("YYYY-MM-DD"),
  invoiceRefType: "",
  invoiceNo: "",
  invoiceDate: "",
  gatePassNo: "",
  returnType: "",
  currency: "",
  currencyId: "",
  exchangeRateId: "",
  exchangeRate: 0,
  docNo: "",
  customerInvoiceNo: "",
  customerInvoiceDate: "",
  date: dayjs().format("YYYY-MM-DD"),
  approvedByAccounts: "No",
  partyGSTState: "",
  isIGSTApplicable: "No",
  gstinNo: "",
  taxCode: "",
  items: [getDefaultItemRow()],
  taxDetails: [getDefaultTaxRow()],
  netAmount: 0,
  amountInWords: "",
  narration: "",
});

// ===================== Helpers =====================

const fmt = (n) =>
  (Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const twoD = (n) => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  const threeD = (n) => {
    const h = Math.floor(n / 100), r = n % 100;
    return (h ? ones[h] + " Hundred" + (r ? " " : "") : "") + (r ? twoD(r) : "");
  };
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = Math.floor(num % 1000);
  let words = "";
  if (crore) words += threeD(crore) + " Crore ";
  if (lakh) words += twoD(lakh) + " Lakh ";
  if (thousand) words += twoD(thousand) + " Thousand ";
  if (rest) words += threeD(rest);
  return (words || "Zero").trim() + " Rupees Only";
};

// ===================== Main Component =====================

const SalesReturnForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branchId] = useState(Number(localStorage.getItem("branchId")) || 0);
  const usersId = localStorage.getItem("usersId");

  const [activeTab, setActiveTab] = useState("returnDetails");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const dataLoadedRef = useRef(false);

  // Lookup states
  const [plantOptions, setPlantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [stateOptions, setStateOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [gatePassOptions, setGatePassOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [returnTypeOptions, setReturnTypeOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState(CURRENCY);
  const [buyingExRate, setBuyingExRate] = useState(0);
  const currencyMap = useRef({});
  const baseItemOptions = useRef([]);
  const baseItemMap = useRef({});
  const defaults = useCallback(() => {
    const base = getDefaultValues();
    if (data) {
      base.plantId = data.branch?.id ?? data.plantId ?? "";
      base.belongsTo = data.belongsTo || "";
      base.customerId = data.customer?.customerId ?? data.customer?.id ?? data.customerId ?? "";
      base.customerName = data.customer?.customerName || data.customerName || "";
      base.customerCode = data.customer?.customerCode || data.customerCode || "";
      base.locationId = data.location?.id ?? data.locationId ?? "";
      base.refNo = data.refNo || "";
      base.refDate = data.refDate || dayjs().format("YYYY-MM-DD");
      base.invoiceRefType = data.invoiceReferenceType || data.invoiceRefType || "";
      base.invoiceNo = data.invoiceNo || "";
      base.invoiceDate = data.invoiceDate || "";
      base.gatePassNo = data.gatePassNo || "";
      base.returnType = data.returnType || "";
      base.currency = data.currency?.currencyName || data.currency || "INR";
      base.currencyId = data.currencyId || data.currency?.id || "";
      base.exchangeRateId = data.exchangeRateId || "";
      base.exchangeRate = data.exchangeRate || 1;
      base.docNo = data.docId || data.docNo || data.salesReturnNo || "";
      base.customerInvoiceNo = data.customerInvoiceNo || "";
      base.customerInvoiceDate = data.customerInvoiceDate || "";
      base.date = data.date || data.docDate || data.salesReturnDate || dayjs().format("YYYY-MM-DD");
      base.approvedByAccounts = data.approvedByAccounts === "true" ? "Yes" : data.approvedByAccounts === false ? "No" : (data.approvedByAccounts || "No");
      base.partyGSTState = data.customer?.gstState || data.partyGSTState || "";
      const igst = data.igstApplicable === true || data.isIgstApplicable === true;
      base.isIGSTApplicable = igst ? "Yes" : "No";
      base.gstinNo = data.customer?.gstNo || data.gstinNo || "";
      base.taxCode = data.taxCode || "";
      base.narration = data.narration || "";

      if (data.salesReturnDetails?.length > 0 || data.items?.length > 0 || data.salesReturnItemDetailsDTO?.length > 0) {
        const src = data.salesReturnDetails || data.items || data.salesReturnItemDetailsDTO || [];
        base.items = src.map((it) => ({
          itemId: it.item ?? it.item?.id ?? it.itemId ?? "",
          itemCode: it.item ?? it.item?.id ?? it.itemId ?? "",
          itemDescription: it.item?.itemDescription || it.itemDescription || "",
          hsnId: it.hsnId ?? "",
          hsCode: (it.hsnSacCode ?? it.hsnCode ?? it.hsCode ?? it.hsnId) || "",
          taxType: it.taxType || "",
          taxPercentage: it.taxPercentage || "",
          unit: it.unit?.id ?? it.unitId ?? it.unit ?? "",
          unitDescription: it.unit?.unitDescription || it.unitDescription || "",
          stock: it.stock || 0,
          qtySold: it.qtySold || 0,
          receivedQty: it.receivedQty || it.qty || 0,
          rate: it.rate || 0,
          rateInCurrency: it.rateInSelectedCurrency || it.rateInCurrency || 0,
          amountInCurrency: it.amountInSelectedCurrency || it.amountInCurrency || 0,
          amount: it.amount || 0,
          sgstRate: it.sgstRate || 0,
          cgstRate: it.cgstRate || 0,
          igstRate: it.igstRate || 0,
        }));
      }

      if (data.salesReturnTaxDetails?.length > 0 || data.taxDetails?.length > 0 || data.salesReturnTaxDetailsDTO?.length > 0) {
        const src = data.salesReturnTaxDetails || data.taxDetails || data.salesReturnTaxDetailsDTO || [];
        base.taxDetails = src.map((t) => ({
          particulars: t.particulars || "",
          amount: t.amount ?? 0,
          glAccountName: t.glAccountName || "",
          sgstRate: t.sgstRate || 0,
          sgstAmount: t.sgstAmount || 0,
          cgstRate: t.cgstRate || 0,
          cgstAmount: t.cgstAmount || 0,
          igstRate: t.igstRate || 0,
          igstAmount: t.igstAmount || 0,
        }));
      }

      base.netAmount = data.netAmount || 0;
      base.amountInWords = data.amountInWords || "";
    }
    return base;
  }, [data]);

  const {
    control, handleSubmit, watch, setValue, reset, getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched", defaultValues: defaults() });

  useEffect(() => { reset(defaults()); }, [data, defaults, reset]);

  const itemsArray = useFieldArray({ control, name: "items" });
  const taxArray = useFieldArray({ control, name: "taxDetails" });

  const watchItems = watch("items");
  const watchIsIGST = watch("isIGSTApplicable");
  const watchCurrency = watch("currency");
  const watchExchangeRate = watch("exchangeRate");
  const watchCustomerId = watch("customerId");
  const watchInvoiceRefType = watch("invoiceRefType");
  const watchInvoiceNo = watch("invoiceNo");

  // ---- Auto-calculate amounts ----
  useEffect(() => {
    if (!watchItems?.length) return;
    let net = 0;
    watchItems.forEach((row, idx) => {
      const qty = Number(row.receivedQty) || 0;
      const rate = Number(row.rate) || 0;
      const amt = qty * rate;
      if (Number(row.amount) !== amt) {
        setValue(`items.${idx}.amount`, amt, { shouldDirty: true });
      }
      const exRate = Number(watchExchangeRate) || 0;
      let rateInCurr = 0;
      if (exRate !== 0 && row.rate != null) {
        rateInCurr = roundHalfUp(rate / exRate, 2);
        const amtInCurr = qty * rateInCurr;
        if (Number(row.rateInCurrency) !== rateInCurr) {
          setValue(`items.${idx}.rateInCurrency`, rateInCurr, { shouldDirty: true });
        }
        if (Number(row.amountInCurrency) !== amtInCurr) {
          setValue(`items.${idx}.amountInCurrency`, amtInCurr, { shouldDirty: true });
        }
      }
      net += amt;
    });
    if (Number(getValues("netAmount")) !== net) {
      setValue("netAmount", net, { shouldDirty: true });
    }
    setValue("amountInWords", net > 0 ? numberToWords(net) : "", { shouldDirty: true });
  }, [watchItems, watchExchangeRate, setValue, getValues]);

  // ---- Auto-calculate tax details ----
  useEffect(() => {
    if (!watchItems?.length) return;
    let sgstTotal = 0, cgstTotal = 0, igstTotal = 0;
    watchItems.forEach((row) => {
      const amt = Number(row.amount) || 0;
      const sgstR = Number(row.sgstRate || (row.taxType === "SGST" ? Number(row.taxPercentage) / 2 : 0));
      const cgstR = Number(row.cgstRate || (row.taxType === "SGST" ? Number(row.taxPercentage) / 2 : 0));
      const igstR = Number(row.igstRate || (row.taxType === "IGST" ? Number(row.taxPercentage) : 0));
      sgstTotal += (amt * sgstR) / 100;
      cgstTotal += (amt * cgstR) / 100;
      igstTotal += (amt * igstR) / 100;
    });
    const existing = getValues("taxDetails") || [];
    const first = existing[0] || getDefaultTaxRow();
    const taxTotal = sgstTotal + cgstTotal + igstTotal;
    const updated = {
      ...first,
      particulars: first.particulars || (watchIsIGST === "Yes" ? "IGST" : "CGST + SGST"),
      amount: first.amount ?? taxTotal,
      glAccountName: first.glAccountName || "",
      sgstRate: watchIsIGST === "Yes" ? 0 : (watchItems[0] ? (Number(watchItems[0].taxPercentage) || 0) / 2 : 0),
      sgstAmount: sgstTotal,
      cgstRate: watchIsIGST === "Yes" ? 0 : (watchItems[0] ? (Number(watchItems[0].taxPercentage) || 0) / 2 : 0),
      cgstAmount: cgstTotal,
      igstRate: watchIsIGST === "Yes" ? (watchItems[0] ? Number(watchItems[0].taxPercentage) || 0 : 0) : 0,
      igstAmount: igstTotal,
    };
    if (JSON.stringify(existing[0]) !== JSON.stringify(updated)) {
      taxArray.replace([updated]);
    }
  }, [watchItems, watchIsIGST, taxArray, getValues]);

  // ---- Set item CGST/SGST/IGST rates based on IGST applicability ----
  useEffect(() => {
    if (!watchItems?.length) return;
    watchItems.forEach((row, idx) => {
      const taxPct = Number(row.taxPercentage) || 0;
      if (watchIsIGST === "No") {
        const split = roundHalfUp(taxPct / 2, 2);
        if (Number(row.sgstRate) !== split) setValue(`items.${idx}.sgstRate`, split, { shouldDirty: true });
        if (Number(row.cgstRate) !== split) setValue(`items.${idx}.cgstRate`, split, { shouldDirty: true });
        if (Number(row.igstRate) !== 0) setValue(`items.${idx}.igstRate`, 0, { shouldDirty: true });
      } else if (watchIsIGST === "Yes") {
        if (Number(row.igstRate) !== taxPct) setValue(`items.${idx}.igstRate`, taxPct, { shouldDirty: true });
        if (Number(row.sgstRate) !== 0) setValue(`items.${idx}.sgstRate`, 0, { shouldDirty: true });
        if (Number(row.cgstRate) !== 0) setValue(`items.${idx}.cgstRate`, 0, { shouldDirty: true });
      }
    });
  }, [watchItems, watchIsIGST, setValue]);

  // ---- Data loading ----
  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadCustomers();
      loadLocations();
      loadStates();
      loadEmployees();
      loadInvoices();
      loadReturnTypes();
      loadInvoiceItems();
    }
  }, [orgId, branchId]);

  useEffect(() => {
    if (data?.id && !dataLoadedRef.current) {
      dataLoadedRef.current = data.id;
      loadSalesReturnData(data);
    }
  }, [data]);

  // ---- Auto-fetch Doc ID for new Sales Return ----
  useEffect(() => {
    if (data?.id) return;
    let active = true;
    const loadDocId = async () => {
      try {
        const financialYear = new Date().getFullYear().toString();
        const docId = await salesReturnAPI.getSalesReturnDocId(orgId, financialYear);
        if (active && docId) {
          setValue("docNo", docId, { shouldDirty: true });
        }
      } catch (error) {
        console.error("Error fetching Sales Return DocId:", error);
      }
    };
    if (orgId) loadDocId();
    return () => { active = false; };
  }, [orgId, data?.id, setValue]);

  const loadPlants = useCallback(async () => {
    try {
      const isMacurex = ["mecurex", "macurex"].includes(
        (JSON.parse(localStorage.getItem("userData") || "{}")?.companyVO?.companyName || "").toLowerCase(),
      );
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions((res || []).map((p) => ({ value: p.id, label: p.plantName || p.plantId || p.id })));
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions((res || []).map((b) => ({ value: b.id, label: b.branchName || b.branchCode || b.id })));
      }
    } catch { setPlantOptions([]); }
  }, [orgId]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await salesReturnAPI.getCustomerDetailsForSalesRejectionInvoice(orgId, branchId);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.customerId ?? c.id,
          label: c.customerCode || c.customerId,
          customerName: c.customerName || "",
          customerCode: c.customerCode || "",
          partyGSTState: c.gstState || "",
          isIGSTApplicable: c.igstApplicable === true,
          gstnNo: c.gstNo || "",
        })),
      );
    } catch { setCustomerOptions([]); }
  }, [orgId, branchId]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await salesReturnAPI.getLocationBySalesReturnOrgId(orgId, branchId);
      setLocationOptions((res || []).map((l) => ({ value: l.id, label: l.locationName || l.locationCode || l.locationId || l.id })));
    } catch { setLocationOptions([]); }
  }, [orgId, branchId]);

  const loadStates = useCallback(async () => {
    try {
      const res = await stateAPI.getStates(orgId);
      setStateOptions((res || []).map((s) => ({ value: s.id, label: s.stateName || s.stateCode || s.id })));
    } catch { setStateOptions([]); }
  }, [orgId]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions((res || []).map((e) => ({ value: e.id, label: e.employeeName || e.name || e.id })));
    } catch { setEmployeeOptions([]); }
  }, [orgId]);

  const loadGatePasses = useCallback(async (customer, invno, type) => {
    if (!customer || !invno || !type) {
      setGatePassOptions([]);
      return;
    }
    try {
      const res = await salesReturnAPI.getGateInwardForSalesReturn(
        orgId, branchId, customer, invno, type,
      );
      setGatePassOptions(
        (res || []).map((g) => ({
          value: g.gateInwardDocId || g.gateInwardId,
          label: g.gateInwardDocId || g.gateInwardId,
          gateInwardId: g.gateInwardId,
        })),
      );
    } catch { setGatePassOptions([]); }
  }, [orgId, branchId]);

  const loadInvoices = useCallback(async () => {
    try {
      const res = await salesReturnAPI.getSalesRejectionInvoiceForSalesReturn(orgId, branchId);
      setInvoiceOptions(
        (res || []).map((inv) => ({ value: inv.docId, label: inv.docId, docType: inv.docType, docDate: inv.docDate })),
      );
    } catch { setInvoiceOptions([]); }
  }, [orgId, branchId]);

  const loadInvoiceItems = useCallback(async () => {
    try {
      const res = await salesReturnAPI.getItemDetailsForSalesReturn(orgId, branchId);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.itemId] = it;
        return { value: it.itemId, label: it.itemCode };
      });
      baseItemOptions.current = options;
      baseItemMap.current = map;
      setItemOptions(options);
      setItemMap(map);
    } catch { setItemOptions([]); setItemMap({}); }
  }, [orgId, branchId]);

  const loadInvoiceSpecificItems = useCallback(async (invoiceNo, mode) => {
    if (!invoiceNo) {
      setItemOptions(baseItemOptions.current);
      setItemMap(baseItemMap.current);
      return;
    }
    let invoiceItems = [];
    try {
      invoiceItems = (await salesReturnAPI.getSalesRejectionInvoiceItemDetailsForSalesReturn(orgId, branchId, invoiceNo)) || [];
    } catch { invoiceItems = []; }

    if (mode === "without") {
      setItemOptions(baseItemOptions.current);
      setItemMap(baseItemMap.current);
      const currentItems = getValues("items") || [];
      const firstRow = currentItems[0];
      if ((!currentItems.length || !firstRow?.itemCode) && baseItemOptions.current.length > 0) {
        applySelectedItem(0, baseItemMap.current[baseItemOptions.current[0].value]);
      }
      return;
    }

    setItemOptions(baseItemOptions.current);
    setItemMap(baseItemMap.current);

    const firstInvoiceItem = invoiceItems.length > 0 ? invoiceItems[0] : null;
    const defaultItem = firstInvoiceItem || (baseItemOptions.current.length > 0 ? baseItemMap.current[baseItemOptions.current[0].value] : null);
    itemsArray.replace([getDefaultItemRow()]);
    if (defaultItem) {
      applySelectedItem(0, defaultItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, branchId]);

  const loadCurrencies = useCallback(async (customerId) => {
    if (!customerId) {
      setCurrencyOptions(CURRENCY);
      currencyMap.current = {};
      return;
    }
    try {
      const res = await salesReturnAPI.getCurrencyForSalesRejectionInvoice(orgId, branchId, customerId);
      const map = {};
      const options = (res || []).map((c) => {
        map[c.currency] = { currencyId: c.currencyId, exchangeRateId: c.exchangeRateId, exchangeRate: c.exchangeRate };
        return { value: c.currency, label: c.currency };
      });
      currencyMap.current = map;
      setCurrencyOptions(options);
    } catch {
      setCurrencyOptions([]);
      currencyMap.current = {};
    }
  }, [orgId, branchId]);

  const loadReturnTypes = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("SALSE RETURN", orgId);
      setReturnTypeOptions(
        (res || []).map((r) => ({ value: r.valuesDescription || r.id, label: r.valuesDescription || r.id })),
      );
    } catch { setReturnTypeOptions([]); }
  }, [orgId]);

  // ---- Load Gate Passes based on customer + invoice ref type + invoice ----
  useEffect(() => {
    if (watchCustomerId && watchInvoiceNo && watchInvoiceRefType) {
      loadGatePasses(watchCustomerId, watchInvoiceNo, watchInvoiceRefType.trim());
    } else {
      setGatePassOptions([]);
    }
  }, [watchCustomerId, watchInvoiceNo, watchInvoiceRefType, loadGatePasses]);

  // ---- Auto-set exchange rate when a currency is selected ----
  useEffect(() => {
    if (!watchCurrency) return;
    const entry = currencyMap.current[watchCurrency];
    if (entry) {
      if (Number(entry.exchangeRate) && Number(watchExchangeRate) !== Number(entry.exchangeRate)) {
        setValue("exchangeRate", Number(entry.exchangeRate), { shouldDirty: true });
      }
      if (String(getValues("currencyId")) !== String(entry.currencyId)) {
        setValue("currencyId", entry.currencyId, { shouldDirty: true });
      }
      if (String(getValues("exchangeRateId")) !== String(entry.exchangeRateId)) {
        setValue("exchangeRateId", entry.exchangeRateId, { shouldDirty: true });
      }
    }
  }, [watchCurrency, watchExchangeRate, setValue, getValues]);

  const loadSalesReturnData = async (raw) => {
    setLoading(true);
    try {
      const response = await salesReturnAPI.getSalesReturnById(raw.id);
      const sr = response?.paramObjectsMap?.salesReturn || response?.paramObjectsMap?.salesReturnResponseVO;
      if (!sr) { addToast("Failed to load data", "error"); return; }

      setValue("plantId", sr.branch?.id || sr.plantId || "");
      setValue("belongsTo", sr.belongsTo || "");
      setValue("customerId", sr.customer?.customerId ?? sr.customer?.id ?? sr.customerId ?? "");
      setValue("customerName", sr.customer?.customerName || sr.customerName || "");
      setValue("customerCode", sr.customer?.customerCode || sr.customerCode || "");
      setValue("locationId", sr.location?.id || sr.locationId || "");
      setValue("refNo", sr.refNo || "");
      setValue("refDate", sr.refDate || "");
      setValue("invoiceRefType", sr.invoiceReferenceType || sr.invoiceRefType || "");
      setValue("invoiceNo", sr.invoiceNo || "");
      setValue("invoiceDate", sr.invoiceDate || "");
      setValue("gatePassNo", sr.gatePassNo || "");
      setValue("returnType", sr.returnType || "");
      setValue("currency", sr.currency?.currencyName || sr.currency || "INR");
      setValue("currencyId", sr.currency?.id || sr.currencyId || "");
      setValue("exchangeRateId", sr.exchangeRateId || "");
      setValue("exchangeRate", sr.exchangeRate || 1);
      setValue("docNo", sr.docId || sr.docNo || sr.salesReturnNo || "");
      setValue("customerInvoiceNo", sr.customerInvoiceNo || "");
      setValue("customerInvoiceDate", sr.customerInvoiceDate || "");
      setValue("date", sr.date || sr.docDate || sr.salesReturnDate || "");
      setValue("approvedByAccounts", sr.approvedByAccounts === true ? "Yes" : sr.approvedByAccounts === false ? "No" : (sr.approvedByAccounts || "No"));
      setValue("partyGSTState", sr.customer?.gstState || sr.partyGSTState || "");
      const igst = sr.igstApplicable === true || sr.isIgstApplicable === true;
      setValue("isIGSTApplicable", igst ? "Yes" : "No");
      setValue("gstinNo", sr.customer?.gstNo || sr.gstinNo || "");
      setValue("taxCode", sr.taxCode || "");
      setValue("narration", sr.narration || "");

      if (sr.salesReturnDetails?.length > 0 || sr.salesReturnItemDetailsDTO?.length > 0) {
        const src = sr.salesReturnDetails || sr.salesReturnItemDetailsDTO || [];
        itemsArray.replace(src.map((it) => ({
          itemId: it.item ?? it.item?.id ?? it.itemId ?? "",
          itemCode: it.item ?? it.item?.id ?? it.itemId ?? "",
          itemDescription: it.item?.itemDescription || it.itemDescription || "",
          hsnId: it.hsnId ?? "",
          hsCode: it.hsnSacCode ?? it.hsnCode ?? it.hsCode ?? it.hsnId ?? "",
          taxType: it.taxType || "",
          taxPercentage: it.taxPercentage || "",
          unit: it.unit?.id ?? it.unitId ?? it.unit ?? "",
          unitDescription: it.unit?.unitDescription || it.unitDescription || "",
          stock: it.stock || 0,
          qtySold: it.qtySold || 0,
          receivedQty: it.receivedQty || it.qty || 0,
          rate: it.rate || 0,
          rateInCurrency: it.rateInSelectedCurrency || it.rateInCurrency || 0,
          amountInCurrency: it.amountInSelectedCurrency || it.amountInCurrency || 0,
          amount: it.amount || 0,
          sgstRate: it.sgstRate || 0,
          cgstRate: it.cgstRate || 0,
          igstRate: it.igstRate || 0,
        })));
      }

      if (sr.salesReturnTaxDetails?.length > 0 || sr.salesReturnTaxDetailsDTO?.length > 0) {
        const src = sr.salesReturnTaxDetails || sr.salesReturnTaxDetailsDTO || [];
        taxArray.replace(src.map((t) => ({
          particulars: t.particulars || "",
          amount: t.amount ?? 0,
          glAccountName: t.glAccountName || "",
          sgstRate: t.sgstRate || 0,
          sgstAmount: t.sgstAmount || 0,
          cgstRate: t.cgstRate || 0,
          cgstAmount: t.cgstAmount || 0,
          igstRate: t.igstRate || 0,
          igstAmount: t.igstAmount || 0,
        })));
      }

      addToast("Sales Return loaded", "success");
    } catch { addToast("Failed to load data", "error"); }
    finally { setLoading(false); }
  };

  // ---- Handlers ----
  const handleCustomerChange = (id) => {
    const cust = customerOptions.find((c) => String(c.value) === String(id));
    setValue("customerId", id, { shouldDirty: true });
    setValue("customerName", cust?.customerName || "", { shouldDirty: true });
    setValue("customerCode", cust?.customerCode || "", { shouldDirty: true });
    setValue("partyGSTState", cust?.partyGSTState || "", { shouldDirty: true });
    const igst = cust?.isIGSTApplicable === true ? "Yes" : "No";
    setValue("isIGSTApplicable", igst, { shouldDirty: true });
    setValue("gstinNo", cust?.gstnNo || "", { shouldDirty: true });
    setValue("currency", "", { shouldDirty: true });
    setValue("currencyId", "", { shouldDirty: true });
    setValue("exchangeRateId", "", { shouldDirty: true });
    setValue("exchangeRate", 1, { shouldDirty: true });
    loadCurrencies(id);
  };

  const clearItemFields = useCallback((idx) => {
    setValue(`items.${idx}.itemId`, "", { shouldDirty: true });
    setValue(`items.${idx}.itemCode`, "", { shouldDirty: true });
    setValue(`items.${idx}.itemDescription`, "", { shouldDirty: true });
    setValue(`items.${idx}.hsnId`, "", { shouldDirty: true });
    setValue(`items.${idx}.hsCode`, "", { shouldDirty: true });
    setValue(`items.${idx}.unit`, "", { shouldDirty: true });
    setValue(`items.${idx}.unitDescription`, "", { shouldDirty: true });
    setValue(`items.${idx}.qtySold`, 0, { shouldDirty: true });
    setValue(`items.${idx}.receivedQty`, 0, { shouldDirty: true });
    setValue(`items.${idx}.rate`, 0, { shouldDirty: true });
    setValue(`items.${idx}.stock`, 0, { shouldDirty: true });
    setValue(`items.${idx}.taxType`, "", { shouldDirty: true });
    setValue(`items.${idx}.taxPercentage`, 0, { shouldDirty: true });
    setValue(`items.${idx}.sgstRate`, 0, { shouldDirty: true });
    setValue(`items.${idx}.cgstRate`, 0, { shouldDirty: true });
    setValue(`items.${idx}.igstRate`, 0, { shouldDirty: true });
    setValue(`items.${idx}.rateInCurrency`, 0, { shouldDirty: true });
    setValue(`items.${idx}.amountInCurrency`, 0, { shouldDirty: true });
    setValue(`items.${idx}.amount`, 0, { shouldDirty: true });
  }, [setValue]);

  const applySelectedItem = useCallback((idx, item) => {
    if (!item) return;
    setValue(`items.${idx}.itemId`, item.itemId ?? item.itemCode ?? "", { shouldDirty: true });
    setValue(`items.${idx}.itemCode`, item.itemId ?? item.itemCode ?? "", { shouldDirty: true });
    setValue(`items.${idx}.itemDescription`, item.itemDescription || "", { shouldDirty: true });
    setValue(`items.${idx}.hsnId`, item.hsnId ?? "", { shouldDirty: true });
    setValue(`items.${idx}.hsCode`, item.hsnSacCode ?? item.hsnId ?? item.hsCode ?? "", { shouldDirty: true });
    setValue(`items.${idx}.unit`, item.unitId ?? item.unit ?? "", { shouldDirty: true });
    setValue(`items.${idx}.unitDescription`, item.unitDescription || item.unitCode || "", { shouldDirty: true });
    setValue(`items.${idx}.qtySold`, item.qtySold || 0, { shouldDirty: true });
    setValue(`items.${idx}.rate`, item.newRate ?? item.rate ?? 0, { shouldDirty: true });
    setValue(`items.${idx}.stock`, item.stock || 0, { shouldDirty: true });
    const igst = Number(item.igstRate) > 0;
    const taxType = igst ? "IGST" : "SGST";
    setValue(`items.${idx}.taxType`, taxType, { shouldDirty: true });
    setValue(`items.${idx}.taxPercentage`, item.igstRate || item.sgstRate || item.cgstRate || 0, { shouldDirty: true });
    setValue(`items.${idx}.sgstRate`, item.sgstRate || 0, { shouldDirty: true });
    setValue(`items.${idx}.cgstRate`, item.cgstRate || 0, { shouldDirty: true });
    setValue(`items.${idx}.igstRate`, item.igstRate || 0, { shouldDirty: true });
  }, [setValue]);

  const handleItemChange = (idx, field, value) => {
    setValue(`items.${idx}.${field}`, value, { shouldDirty: true });
    if (field === "itemCode") {
      if (!value) {
        clearItemFields(idx);
      } else {
        applySelectedItem(idx, itemMap[value]);
      }
    }
  };

  const handleAddItem = () => { itemsArray.append(getDefaultItemRow()); };
  const handleRemoveItem = (idx) => { if (itemsArray.fields.length > 1) itemsArray.remove(idx); };
  const handleAddTax = () => { taxArray.append(getDefaultTaxRow()); };
  const handleRemoveTax = (idx) => { if (taxArray.fields.length > 1) taxArray.remove(idx); };

  // ---- Load items: always base list; merge invoice items per invoice ref type ----
  useEffect(() => {
    const type = (watchInvoiceRefType || "").trim().toLowerCase();
    const isWith = type.includes("with");
    const isWithout = type.includes("without");
    if ((isWith || isWithout) && watchInvoiceNo) {
      loadInvoiceSpecificItems(watchInvoiceNo, isWith && !isWithout ? "with" : "without");
    } else {
      setItemOptions(baseItemOptions.current);
      setItemMap(baseItemMap.current);
    }
  }, [watchInvoiceRefType, watchInvoiceNo, loadInvoiceSpecificItems]);

  // ---- Validation ----
  const validate = () => {
    const missing = [];
    if (!watch("plantId")) missing.push("Plant ID");
    if (!watch("customerId")) missing.push("Customer ID");
    if (!watch("customerName")) missing.push("Customer Name");
    if (!watch("locationId")) missing.push("Location ID");
    if (!watch("date")) missing.push("Date");
    if (!watch("returnType")) missing.push("Return Type");
    if (!watch("currency")) missing.push("Currency");
    if (missing.length) addToast(`Missing mandatory fields: ${missing.join(", ")}`, "error");
    return missing.length === 0;
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch { return null; }
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;
    setSaving(true);
    const isUpdate = Boolean(data?.id);
    const financialYear = localStorage.getItem("finYear") || new Date().getFullYear().toString();

    const payload = {
      active: true,
      orgId,
      branch: Number(formData.plantId || branchId),
      belongsTo: formData.belongsTo || "",
      customer: Number(formData.customerId) || 0,
      customerInvoiceDate: formatDateForAPI(formData.customerInvoiceDate) || "",
      customerInvoiceNo: formData.customerInvoiceNo || "",
      exchangeRate: Number(formData.exchangeRateId) || 0,
      financialYear,
      gatePassNo: formData.gatePassNo || "",
      igstApplicable: formData.isIGSTApplicable === "Yes",
      invoiceDate: formatDateForAPI(formData.invoiceDate) || "",
      invoiceNo: formData.invoiceNo || "",
      invoiceReferenceType: formData.invoiceRefType || "",
      location: Number(formData.locationId) || 0,
      narration: formData.narration || "",
      netAmount: Number(formData.netAmount) || 0,
      returnType: formData.returnType || "",
      amountInWords: formData.amountInWords || "",
      approvedByAccounts: String(formData.approvedByAccounts || "No"),
      currency: Number(formData.currencyId) || 0,
      cancelRemarks: "",
      createdBy: usersId || "admin",
      updatedBy: usersId || "admin",
      salesReturnDetails: (formData.items || [])
        .filter((r) => r.itemCode)
        .map((item) => ({
          item: Number(item.itemId ?? item.itemCode) || 0,
          hsnSacCode: Number(item.hsnId ?? item.hsCode) || 0,
          taxType: item.taxType || "",
          taxPercentage: String(item.taxPercentage || ""),
          unit: Number(item.unit) || 0,
          stock: Number(item.stock) || 0,
          qtySold: Number(item.qtySold) || 0,
          receivedQty: Number(item.receivedQty) || 0,
          rate: Number(item.rate) || 0,
          rateInSelectedCurrency: Number(item.rateInCurrency) || 0,
          amountInSelectedCurrency: Number(item.amountInCurrency) || 0,
          sgstRate: Number(item.sgstRate) || 0,
          sgstAmount: 0,
          cgstRate: Number(item.cgstRate) || 0,
          cgstAmount: 0,
          igstRate: Number(item.igstRate) || 0,
          igstAmount: 0,
          amount: Number(item.amount) || 0,
        })),
      salesReturnTaxDetails: (formData.taxDetails || []).map((t) => ({
        particulars: t.particulars || "",
        amount: Number(t.amount ?? t.sgstAmount + t.cgstAmount + t.igstAmount) || 0,
        glAccountName: t.glAccountName || "",
      })),
    };

    if (isUpdate) payload.id = data.id;

    try {
      const response = await salesReturnAPI.createUpdateSalesReturn(payload);
      const isSuccess = response?.status === true || response?.success === true || response?.statusCode === 200;
      if (isSuccess) {
        addToast(isUpdate ? "Sales Return updated" : "Sales Return created", "success");
        reset(getDefaultValues());
        onBack();
      } else {
        addToast(response?.message || "Something went wrong", "error");
      }
    } catch (err) {
      addToast("Failed to save Sales Return", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading sales return data...</div>
      </div>
    );
  }

  // ---- Render header ----
  const renderHeader = () => (
    <div className={fieldGrid}>
      <SelectField control={control} name="plantId" label="Plant ID" options={plantOptions} required errors={errors} />
      <SelectField control={control} name="belongsTo" label="Belongs To" options={BELONGS_TO} errors={errors} placeholder="-- Select --" />
      <SelectField
        control={control} name="customerId" label="Customer ID" options={customerOptions} required errors={errors}
        onChange={(e) => handleCustomerChange(e.target.value)}
      />
      <InputField control={control} name="customerName" label="Customer Name" required errors={errors} readOnly />
      <SelectField control={control} name="locationId" label="Location ID" options={locationOptions} required errors={errors} />
      <SelectField control={control} name="invoiceRefType" label="Invoice Ref. Type" options={INVOICE_REF_TYPES} required errors={errors} />
      <SelectField control={control} name="invoiceNo" label="Invoice No" options={invoiceOptions} errors={errors} />
      <InputField control={control} name="invoiceDate" label="Invoice Date" type="date" errors={errors} readOnly />
      <SelectField control={control} name="gatePassNo" label="Gate Pass No" options={gatePassOptions} required errors={errors} />
      <SelectField control={control} name="returnType" label="Return Type" options={returnTypeOptions} required errors={errors} />
      <SelectField control={control} name="currency" label="Currency" options={currencyOptions} required errors={errors} disabled={Boolean(watchCustomerId) && currencyOptions.length === 0} />
      <InputField control={control} name="exchangeRate" label="Exchange Rate" type="number" step="0.01" errors={errors} />
      <InputField control={control} name="docNo" label="Doc No" required errors={errors} readOnly={!data} />
      <InputField control={control} name="customerInvoiceNo" label="Customer Invoice No" errors={errors} />
      <InputField control={control} name="customerInvoiceDate" label="Customer Invoice Date" type="date" errors={errors} />
      <InputField control={control} name="date" label="Date" type="date" required errors={errors} />
      <SelectField control={control} name="approvedByAccounts" label="Approved By Accounts" options={YES_NO} errors={errors} />
      <InputField control={control} name="partyGSTState" label="Party GST State" required errors={errors} readOnly />
      <SelectField control={control} name="isIGSTApplicable" label="Is IGST Applicable?" options={YES_NO} required errors={errors} />
      <InputField control={control} name="gstinNo" label="GSTIN No" errors={errors} readOnly />
    </div>
  );

  // ---- Tab 1: Return Items ----
  const renderReturnDetailsTab = () => {
    const showSGST = watchIsIGST !== "Yes";
    const showIGST = watchIsIGST === "Yes";
    const baseHeaders = ["S.No", "Item Code *", "Description", "HSN/SAC", "Tax %", "Unit *", "Stock", "Qty Sold", "Rec'd Qty *", "Rate", "Rate (currency)", "Amt (Currency)", "Amount"];
    let taxCols = [];
    if (showSGST) taxCols = ["SGST Rate", "SGST Amt", "CGST Rate", "CGST Amt"];
    else if (showIGST) taxCols = ["IGST Rate", "IGST Amt"];
    const headers = [...baseHeaders, ...taxCols, "Action"];

    return (
      <div className="pt-2 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <span>Add items to the sales return</span>
          <button type="button" onClick={handleAddItem} className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
            <Plus size={12} />
          </button>
        </div>
        <TableWrapper>
          <TableHead headers={headers} />
          <tbody>
            {itemsArray.fields.map((field, index) => (
              <TableRow key={field.id} index={index} onRemove={() => handleRemoveItem(index)} disabled={itemsArray.fields.length <= 1}>
                <SelectCell control={control} name={`items.${index}.itemCode`} options={itemOptions} errors={errors} onChange={(v) => handleItemChange(index, "itemCode", v)} />
                <InputCell control={control} name={`items.${index}.itemDescription`} readOnly errors={errors} />
                <InputCell control={control} name={`items.${index}.hsCode`} errors={errors} />
                <InputCell control={control} name={`items.${index}.taxPercentage`} type="number" step="0.01" placeholder="0.00" errors={errors} readOnly />
                <InputCell control={control} name={`items.${index}.unitDescription`} readOnly errors={errors} />
                <InputCell control={control} name={`items.${index}.stock`} type="number" step="0.001" errors={errors} />
                <InputCell control={control} name={`items.${index}.qtySold`} type="number" errors={errors} />
                <InputCell control={control} name={`items.${index}.receivedQty`} type="number" step="0.001" errors={errors} />
                <InputCell control={control} name={`items.${index}.rate`} type="number" step="0.01" errors={errors} />
                <InputCell control={control} name={`items.${index}.rateInCurrency`} type="number" step="0.01" readOnly errors={errors} />
                <InputCell control={control} name={`items.${index}.amountInCurrency`} type="number" step="0.01" readOnly errors={errors} />
                <InputCell control={control} name={`items.${index}.amount`} type="number" step="0.01" readOnly errors={errors} />
                {showSGST && (
                  <>
                    <InputCell control={control} name={`items.${index}.sgstRate`} type="number" step="0.0001" readOnly errors={errors} />
                    <InputCell control={control} name={`items.${index}.sgstAmount`} type="number" step="0.01" readOnly errors={errors} />
                    <InputCell control={control} name={`items.${index}.cgstRate`} type="number" step="0.0001" readOnly errors={errors} />
                    <InputCell control={control} name={`items.${index}.cgstAmount`} type="number" step="0.01" readOnly errors={errors} />
                  </>
                )}
                {showIGST && (
                  <>
                    <InputCell control={control} name={`items.${index}.igstRate`} type="number" step="0.0001" readOnly errors={errors} />
                    <InputCell control={control} name={`items.${index}.igstAmount`} type="number" step="0.01" readOnly errors={errors} />
                  </>
                )}
              </TableRow>
            ))}
          </tbody>
        </TableWrapper>
      </div>
    );
  };

  // ---- Tab 2: Tax Detail ----
  const renderTaxDetailTab = () => (
    <div className="pt-2 space-y-2">
      <div className="flex items-center justify-end">
        <button type="button" onClick={handleAddTax} className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
          <Plus size={12} />
        </button>
      </div>
        <TableWrapper>
        <TableHead headers={["S.No", "Particulars", "Amount", "GL Account", "SGST Rate", "SGST Amount", "CGST Rate", "CGST Amount", "IGST Rate", "IGST Amount", "Action"]} />
        <tbody>
          {taxArray.fields.map((field, index) => (
            <TableRow key={field.id} index={index} onRemove={() => handleRemoveTax(index)} disabled={taxArray.fields.length <= 1}>
              <InputCell control={control} name={`taxDetails.${index}.particulars`} errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.amount`} type="number" step="0.01" errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.glAccountName`} errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.sgstRate`} type="number" step="0.01" errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.sgstAmount`} type="number" step="0.01" readOnly errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.cgstRate`} type="number" step="0.01" errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.cgstAmount`} type="number" step="0.01" readOnly errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.igstRate`} type="number" step="0.01" errors={errors} />
              <InputCell control={control} name={`taxDetails.${index}.igstAmount`} type="number" step="0.01" readOnly errors={errors} />
            </TableRow>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );

  // ---- Tab 3: Charges Summary ----
  const renderChargesSummaryTab = () => (
    <div className="pt-2">
      <div className={subTabFieldGrid}>
        <InputField control={control} name="netAmount" label="Net Amount" readOnly errors={errors} />
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField control={control} name="amountInWords" label="Amount in Words" readOnly errors={errors} />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>Narration</label>
          <Controller
            name="narration"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                className="w-full px-2 py-1.5 rounded border text-xs leading-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 [color-scheme:light] dark:[color-scheme:dark]"
                placeholder="Enter narration..."
              />
            )}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Sales Return" : "Add Sales Return"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Sales Return</SectionHeader>
          {renderHeader()}
        </div>

        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
            {[
              { key: "returnDetails", label: "Sales Return Details" },
              { key: "taxDetail", label: "Tax Detail" },
              { key: "chargesSummary", label: "Charges Summary" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "returnDetails" && renderReturnDetailsTab()}
          {activeTab === "taxDetail" && renderTaxDetailTab()}
          {activeTab === "chargesSummary" && renderChargesSummaryTab()}
        </section>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onBack} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button onClick={handleSubmit(onSubmit)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            <Save className="h-3 w-3" /> {saving ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesReturnForm;
