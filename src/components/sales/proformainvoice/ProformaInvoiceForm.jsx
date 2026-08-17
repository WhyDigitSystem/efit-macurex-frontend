import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  File,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
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
import listOfValuesAPI from "../../../api/listOfValuesAPI";

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

// ===================== Reusable Components =====================

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

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
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

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
          className={`p-2 whitespace-nowrap ${i === 0
            ? "w-8 text-center"
            : i === headers.length - 1
              ? "w-20 text-left"
              : "text-left"
            } text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
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
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
            }`}
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
    <td className="p-2 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
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
            <option value="">-- Select --</option>
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
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
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
  readOnly,
  onChange,
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
            className={`${controlClasses} ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
              } ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e);
              }
            }}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

// ===================== Constants =====================

const BELONGS_TO = ["Appliances", "Bosch"];
const YES_NO = ["Yes", "No"];
const TAX_TYPE = ["SGST", "IGST"];
const CURRENCY = ["INR", "USD", "EUR", "GBP"];
const POST_FIN = ["Yes", "No"];
const PKG_TYPE = ["Box", "Pallet", "Crate", "Bag", "Drum", "Container"];
const TRANSPORT = ["Road", "Rail", "Air", "Sea", "Courier"];

// ===================== Utility Functions =====================

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

// ===================== Default Values =====================

const getDefaultSalesRow = () => ({
  itemCode: "",
  customerPartNo: "",
  itemDescription: "",
  hsCode: "",
  taxType: "",
  taxPercentage: "",
  dispatchQty: "",
  unit: "",
  orderRate: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const getDefaultTaxRow = () => ({
  particulars: "",
  amount: "",
  postFin: "",
  isSystemRow: false,
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
  isIGSTApplicable: "",
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

// ===================== Main Component =====================

const ProformaInvoiceForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const usersId = localStorage.getItem("usersId");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeTab, setActiveTab] = useState("salesContract");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isUpdatingRef = useRef(false);
  const dataLoadedRef = useRef(false);

  // Lookup data states
  const [plantOptions, setPlantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});

  const LIST_OF_VALUES_GROUPS = {
    PARTICULARS: "Particulars",
  };

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
      base.isIGSTApplicable =
        data.isIGSTApplicable === true ? "Yes" :
          data.isIGSTApplicable === false ? "No" : data.isIGSTApplicable || "No";
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
    getValues,
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
  const isIGSTApplicable = watch("isIGSTApplicable");

  // ===================== Load Data for Edit =====================

  const loadProformaInvoiceData = useCallback(async (invoiceId) => {
    if (!invoiceId) return;

    setLoading(true);
    try {
      const response = await proformaInvoiceAPI.getProformaInvoiceById(invoiceId);
      console.log("Proforma Invoice Data:", response);

      if (response) {
        const invoice = response;

        // Map the response data to form fields
        setValue("plant", invoice.branch?.id || "");
        setValue("invoiceNo", invoice.docId || "");
        setValue("invoiceDate", invoice.docDate || "");
        setValue("customerId", invoice.customer?.id || "");
        setValue("customerName", invoice.customer?.customerName || "");
        setValue("belongsTo", invoice.belongsTo || "");
        setValue("customerCode", invoice.customer?.customerCode || "");
        setValue("poNo", invoice.purchaseOrderNo || "");
        setValue("partyGSTState", invoice.customer?.state || "");
        setValue("refNo", invoice.refNo || "");
        setValue("poDate", invoice.purchaseOrderDate || "");
        setValue("isIGSTApplicable", invoice.customer.gstApproval || "No");
        setValue("refDate", invoice.refDate || "");
        setValue("locationId", invoice.location?.id || "");
        setValue("gstnNo", invoice.customer?.customerGstNo || "");
        setValue("kindAttention", invoice.kindAttention || "");
        setValue("designation", invoice.designation || "");
        setValue("timeOfIssue", invoice.timeOfIssue || "");
        setValue("bankName", invoice.bankName?.id || "");
        setValue("date", invoice.docDate || "");
        setValue("timeOfRemoval", invoice.timeOfRemoval || "");

        // Terms and Conditions
        setValue("termsAndConditions.insurance", invoice.insurance === 1 ? "Yes" : "No");
        setValue("termsAndConditions.freight", invoice.freight === 1 ? "Yes" : "No");
        setValue("termsAndConditions.noOfPkg", invoice.noOfPkg || "");
        setValue("termsAndConditions.pkgType", invoice.pkgType || "");
        setValue("termsAndConditions.modeOfTransport", invoice.modeOfTransport || "");
        setValue("termsAndConditions.rateOfDuty", invoice.rateOfDuty || "");
        setValue("termsAndConditions.tariffNo", invoice.tariffNo || "");
        setValue("termsAndConditions.basicValue", invoice.basicValue || "");
        setValue("termsAndConditions.grossAmount", invoice.grossAmount || "");
        setValue("termsAndConditions.amountInWords", invoice.amountInWords || "");
        setValue("termsAndConditions.deliveryTo", invoice.deliveryTo || "");
        setValue("termsAndConditions.paymentTerms", invoice.paymentTerms || "");
        setValue("termsAndConditions.paymentPercentage", invoice.paymentPercentage || "");
        setValue("termsAndConditions.narration", invoice.narration || "");

        // Product Details
        if (invoice.proformaInvoiceDetailsResponseDTO?.length > 0) {
          const details = invoice.proformaInvoiceDetailsResponseDTO.map(item => ({
            // IMPORTANT: select value must be item.id, not itemCode
            itemCode: item.item?.id || "",

            customerPartNo: item.item?.customerPoNo || "",

            itemDescription: item.item?.itemDescription || "",

            hsCode: item.hsnCode || "",

            taxType: item.taxType || "",

            taxPercentage: item.taxPercentage || "",

            dispatchQty: item.despatchQty || "",

            unit: item.item?.unit?.id || "",

            orderRate: item.orderRate || "",

            amount: item.amount || "",

            sgstRate: item.sgstRate || "",
            sgstAmount: item.sgstAmount || "",

            cgstRate: item.cgstRate || "",
            cgstAmount: item.cgstAmount || "",

            igstRate: item.igstRate || "",
            igstAmount: item.igstAmount || "",
          }));
          salesContractArray.replace(details);
        }

        // Tax Details
        if (invoice.proformaInvoiceTaxDetailsResponseDTO?.length > 0) {
          const taxDetails = invoice.proformaInvoiceTaxDetailsResponseDTO.map(item => ({
            particulars: item.particulars || "",
            amount: item.amount || 0,
            isSystemRow: ['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(item.particulars || ""),
            postFin: "",
          }));
          taxDetailsArray.replace(taxDetails);
        }

        addToast("Proforma Invoice loaded successfully", "success");
      } else {
        addToast("Failed to load Proforma Invoice data", "error");
      }
    } catch (error) {
      console.error("Error loading proforma invoice:", error);
      addToast("Failed to load Proforma Invoice data", "error");
    } finally {
      setLoading(false);
    }
  }, [setValue, salesContractArray, taxDetailsArray, addToast]);

  useEffect(() => {
    const invoiceId = data?.id;

    if (!invoiceId) return;

    // Prevent multiple API calls for the same invoice
    if (dataLoadedRef.current === invoiceId) {
      return;
    }

    dataLoadedRef.current = invoiceId;

    loadProformaInvoiceData(invoiceId);
  }, [data?.id, loadProformaInvoiceData]);

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

  const loadLocation = useCallback(async () => {
    try {
      const response = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      console.log("Loaded Locations:", response);
      const options = (response || []).map(location => ({
        value: location.id,
        label: location.locationName,
      }));
      console.log("Normalized Location Options:", options);
      setLocationData(options);
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationData([]);
    }
  }, [orgId]);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      console.log("Loaded Customers:", res);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          customerName: c.customerName || "",
          customerCode: c.customerCode || "",
          partyGSTState: c.gstState?.stateName || "",
          isIGSTApplicable: c.gstApplicable || false,
          gstnNo: c.gstNo || "",
        }))
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
        }))
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
        }))
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
        }))
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
          label: b.bank,
        }))
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
        }))
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadListOfValuesData = useCallback(async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(group, orgId);

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

            result[key] = items.map(item => ({
              value: item.id || item.value,
              label: item.valuesDescription || item.label || item.name,
              ...item,
            }));

          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        })
      );

      setListOfValuesData(result);
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadLocation();
      loadCustomers();
      loadItems();
      loadUnits();
      loadLocations();
      loadStates();
      loadBanks();
      loadEmployees();
      loadListOfValuesData();
    }
  }, [
    orgId,
    loadPlants,
    loadLocation,
    loadCustomers,
    loadItems,
    loadUnits,
    loadLocations,
    loadStates,
    loadBanks,
    loadEmployees,
    loadListOfValuesData,
  ]);

  // ===================== API Calls =====================

  const fetchTaxValue = useCallback(async (hsnCode) => {
    if (!hsnCode || !orgId) return null;

    try {
      const response = await proformaInvoiceAPI.getTaxValue(hsnCode, orgId);
      console.log("Tax API Response:", response);

      if (response?.status && response?.paramObjectsMap?.mapp?.length > 0) {
        const taxData = response.paramObjectsMap.mapp[0];
        return {
          taxPercentage: taxData.taxPercentage || 0,
          sgst: taxData.sgst || 0,
          cgst: taxData.cgst || 0,
          igst: taxData.igst || 0,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch tax value:", error);
      return null;
    }
  }, [orgId]);

  // ===================== Handlers =====================

  const handleCustomerChange = (id) => {
    const customer = customerOptions.find((c) => String(c.value) === String(id));
    console.log("Selected Customer:", customer);
    setValue("customerId", id, { shouldDirty: true });
    setValue("customerName", customer?.customerName || "", { shouldDirty: true });
    setValue("customerCode", customer?.customerCode || "", { shouldDirty: true });
    setValue("partyGSTState", customer?.partyGSTState || "", { shouldDirty: true });
    const igstValue = customer?.isIGSTApplicable === true ? "Yes" : "No";
    setValue("isIGSTApplicable", igstValue, { shouldDirty: true });
    setValue("gstnNo", customer?.gstnNo || "", { shouldDirty: true });

    // Update tax type for all rows based on IGST applicability
    salesContractArray.fields.forEach((_, index) => {
      const taxType = igstValue === "Yes" ? "IGST" : "SGST";
      setValue(`salesContractDetails.${index}.taxType`, taxType);
    });
  };

  const handleItemChange = (idx, field, value) => {
    setValue(`salesContractDetails.${idx}.${field}`, value, {
      shouldDirty: true,
    });

    if (field === "itemCode") {
      const item = itemMap[value];
      setValue(`salesContractDetails.${idx}.itemDescription`, item?.itemDescription || "", { shouldDirty: true });

      // Get HSN code from item
      const hsnCode = item?.itemHsn?.hsnCode || "";
      setValue(`salesContractDetails.${idx}.hsCode`, hsnCode, { shouldDirty: true });
      setValue(`salesContractDetails.${idx}.unit`, item?.primaryUnits?.id || "", { shouldDirty: true });

      // Set tax type based on IGST applicability
      const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";
      setValue(`salesContractDetails.${idx}.taxType`, taxType, { shouldDirty: true });

      // Fetch tax values if HSN code exists
      if (hsnCode) {
        fetchTaxValue(hsnCode).then(taxData => {
          if (taxData) {
            setValue(`salesContractDetails.${idx}.taxPercentage`, taxData.taxPercentage, { shouldDirty: true });
            setValue(`salesContractDetails.${idx}.sgstRate`, taxData.sgst, { shouldDirty: true });
            setValue(`salesContractDetails.${idx}.cgstRate`, taxData.cgst, { shouldDirty: true });
            setValue(`salesContractDetails.${idx}.igstRate`, taxData.igst, { shouldDirty: true });

            // Recalculate amounts with new tax rates
            recalcRow(idx);
          }
        });
      }
    }
  };

  const handleHSNChange = async (idx, hsnCode) => {
    setValue(`salesContractDetails.${idx}.hsCode`, hsnCode, { shouldDirty: true });

    if (hsnCode) {
      const taxData = await fetchTaxValue(hsnCode);
      if (taxData) {
        setValue(`salesContractDetails.${idx}.taxPercentage`, taxData.taxPercentage, { shouldDirty: true });
        setValue(`salesContractDetails.${idx}.sgstRate`, taxData.sgst, { shouldDirty: true });
        setValue(`salesContractDetails.${idx}.cgstRate`, taxData.cgst, { shouldDirty: true });
        setValue(`salesContractDetails.${idx}.igstRate`, taxData.igst, { shouldDirty: true });

        // Recalculate amounts with new tax rates
        recalcRow(idx);
      }
    }
  };

  const recalcRow = (idx) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const row = watchSalesRows?.[idx];
      if (!row) return;

      const dispatchQty = parseFloat(row.dispatchQty) || 0;
      const orderRate = parseFloat(row.orderRate) || 0;

      // Calculate amount (Dispatch Qty * Order Rate)
      const amount = dispatchQty * orderRate;
      setValue(`salesContractDetails.${idx}.amount`, amount ? amount.toFixed(2) : "", { shouldDirty: true });

      // Calculate tax amounts based on tax type
      const taxType = row.taxType || (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

      if (taxType === "IGST") {
        const igstRate = parseFloat(row.igstRate) || 0;
        const igstAmount = (amount * igstRate) / 100;
        setValue(`salesContractDetails.${idx}.igstAmount`, igstAmount ? igstAmount.toFixed(2) : "", { shouldDirty: true });
        // Clear SGST/CGST amounts
        setValue(`salesContractDetails.${idx}.sgstAmount`, "", { shouldDirty: true });
        setValue(`salesContractDetails.${idx}.cgstAmount`, "", { shouldDirty: true });
      } else {
        const sgstRate = parseFloat(row.sgstRate) || 0;
        const cgstRate = parseFloat(row.cgstRate) || 0;
        const sgstAmount = (amount * sgstRate) / 100;
        const cgstAmount = (amount * cgstRate) / 100;
        setValue(`salesContractDetails.${idx}.sgstAmount`, sgstAmount ? sgstAmount.toFixed(2) : "", { shouldDirty: true });
        setValue(`salesContractDetails.${idx}.cgstAmount`, cgstAmount ? cgstAmount.toFixed(2) : "", { shouldDirty: true });
        // Clear IGST amount
        setValue(`salesContractDetails.${idx}.igstAmount`, "", { shouldDirty: true });
      }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const calculateTaxDetails = useCallback(() => {
    if (!watchSalesRows?.length) return;

    const contractDetails = watchSalesRows || [];
    const totalAmount = contractDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

    let sgstTotal = 0, cgstTotal = 0, igstTotal = 0;

    contractDetails.forEach(item => {
      sgstTotal += Number(item.sgstAmount) || 0;
      cgstTotal += Number(item.cgstAmount) || 0;
      igstTotal += Number(item.igstAmount) || 0;
    });

    const existingTaxDetails = getValues('taxDetails') || [];
    const userAddedRows = existingTaxDetails.filter(item => !item.isSystemRow);

    const systemRows = [];

    systemRows.push({
      particulars: "Gross Amount",
      amount: totalAmount,
      isSystemRow: true,
      postFin: ""
    });

    if (taxType === "IGST") {
      systemRows.push({
        particulars: "IGST",
        amount: igstTotal,
        isSystemRow: true,
        postFin: ""
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        amount: sgstTotal,
        isSystemRow: true,
        postFin: ""
      });
      systemRows.push({
        particulars: "CGST",
        amount: cgstTotal,
        isSystemRow: true,
        postFin: ""
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];

    const currentRows = getValues("taxDetails") || [];

    const hasChanged =
      JSON.stringify(currentRows) !== JSON.stringify(allTaxEntries);

    if (hasChanged) {
      taxDetailsArray.replace(allTaxEntries);
    }

    // Set Basic Value as total of all amounts
    setValue("termsAndConditions.basicValue", totalAmount ? totalAmount.toFixed(2) : "", { shouldDirty: true });

    const grand = totalAmount + sgstTotal + cgstTotal + igstTotal;
    setValue("termsAndConditions.grossAmount", grand ? grand.toFixed(2) : "", { shouldDirty: true });
    setValue("termsAndConditions.amountInWords", grand ? numberToWords(grand) : "", { shouldDirty: true });
  }, [watchSalesRows, getValues, isIGSTApplicable, taxDetailsArray, setValue]);

  useEffect(() => {
    calculateTaxDetails();
  }, [watchSalesRows, calculateTaxDetails]);

  const handleAddItem = () => {
    const idx = salesContractArray.fields.length;
    const newRow = getDefaultSalesRow();
    // Set tax type based on IGST applicability
    newRow.taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";
    salesContractArray.append(newRow);
  };

  const handleRemoveItem = (index) => {
    if (salesContractArray.fields.length > 1) salesContractArray.remove(index);
  };

  const handleAddTax = () => {
    const newItem = {
      particulars: "",
      amount: 0.0,
      postFin: "",
      isSystemRow: false
    };
    taxDetailsArray.append(newItem);
  };

  const handleRemoveTax = (index) => {
    const currentTaxDetails = getValues('taxDetails') || [];
    const isSystemRow = currentTaxDetails[index]?.isSystemRow;

    if (isSystemRow) {
      addToast('Cannot delete system calculated rows', 'error');
      return;
    }

    if (taxDetailsArray.fields.length > 1) {
      taxDetailsArray.remove(index);
      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    }
  };

  // ===================== Validation & Save =====================

  // ===================== Validation & Save =====================

  const validate = () => {
    const fundErrors = [];
    if (!watch("plant")) fundErrors.push("Plant");
    if (!watch("customerId")) fundErrors.push("Customer");
    if (!watch("invoiceDate")) fundErrors.push("Invoice Date");
    if (fundErrors.length)
      addToast(`Missing mandatory fields: ${fundErrors.join(", ")}`, "error");
    return fundErrors.length === 0;
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;

    setSaving(true);
    const isUpdate = Boolean(data?.id);

    // Format date for API
    const formatDateForAPI = (dateString) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (e) {
        return null;
      }
    };

    // Build the payload according to the API structure
    const payload = {
      active: true,
      bankName: formData.bankName ? parseInt(formData.bankName) : 0,
      belongsTo: formData.belongsTo || "",
      branch: branch,
      cancelRemarks: "",
      createdBy: usersId || "admin",
      customer: formData.customerId ? parseInt(formData.customerId) : 0,
      deliveryTo: formData.termsAndConditions?.deliveryTo || "",
      designation: formData.designation || "",
      financialYear: new Date().getFullYear().toString(),
      freight: formData.termsAndConditions?.freight === "Yes" ? 1 : 0,
      id: isUpdate ? parseInt(data.id) : 0,
      insurance: formData.termsAndConditions?.insurance === "Yes" ? 1 : 0,
      isIgstApplicable: formData.isIGSTApplicable || "No",
      kindAttention: formData.kindAttention || "",
      location: formData.locationId ? parseInt(formData.locationId) : 0,
      modeOfTransport: formData.termsAndConditions?.modeOfTransport || "",
      narration: formData.termsAndConditions?.narration || "",
      noOfPkg: parseInt(formData.termsAndConditions?.noOfPkg) || 0,
      orgId: orgId,
      paymentPercentage: formData.termsAndConditions?.paymentPercentage || "",
      paymentTerms: formData.termsAndConditions?.paymentTerms || "",
      pkgType: formData.termsAndConditions?.pkgType || "",
      purchaseOrderDate: formatDateForAPI(formData.poDate) || "",
      purchaseOrderNo: formData.poNo || "",
      rateOfDuty: parseFloat(formData.termsAndConditions?.rateOfDuty) || 0,
      refDate: formatDateForAPI(formData.refDate) || "",
      refNo: formData.refNo || "",
      tariffNo: formData.termsAndConditions?.tariffNo || "",
      // Proforma Invoice Details (Product Details)
      proformaInvoiceDetailsDTO: (formData.salesContractDetails || [])
        .filter((r) => r.itemCode?.trim())
        .map((item) => ({
          despatchQty: parseFloat(item.dispatchQty) || 0,
          hsnCode: item.hsCode || "",
          item: itemMap[item.itemCode]?.id ? parseInt(itemMap[item.itemCode].id) : 0,
          orderRate: parseFloat(item.orderRate) || 0,
          taxPercentage: parseFloat(item.taxPercentage) || 0,
          taxType: item.taxType || "SGST",
        })),
      // Proforma Invoice Tax Details
      proformaInvoiceTaxDetailsDTO: (formData.taxDetails || [])
        .filter((r) => r.particulars?.trim() || parseFloat(r.amount) > 0)
        .map((item) => ({
          amount: parseFloat(item.amount) || 0,
          particulars: item.particulars || "",
        })),
    };

    // If updating, keep the id, otherwise remove it
    if (!isUpdate) {
      delete payload.id;
    }

    console.log("Saving Proforma Invoice Payload:", payload);

    try {
      const response = await proformaInvoiceAPI.createUpdateProformaInvoice(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Proforma Invoice updated successfully!"
            : "Proforma Invoice created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Proforma Invoice.",
          "error"
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
        name="plant"
        label="Plant"
        options={plantOptions}
        required
        errors={errors}
        placeholder="-- Select --"
      />

      <InputField
        control={control}
        name="invoiceNo"
        label="Invoice No"
        placeholder="Auto"
        readOnly={!data}
        errors={errors}
      />

      <InputField
        control={control}
        name="invoiceDate"
        label="Invoice Date"
        type="date"
        required
        errors={errors}
      />

      <SelectField
        control={control}
        name="customerId"
        label="Customer ID"
        options={customerOptions}
        required
        errors={errors}
        onChange={handleCustomerChange}
        placeholder="-- Select --"
      />

      <InputField
        control={control}
        name="customerName"
        label="Customer Name"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="belongsTo"
        label="Belongs To"
        options={BELONGS_TO}
        errors={errors}
        placeholder="-- Select --"
      />

      <InputField
        control={control}
        name="poNo"
        label="PO No."
        placeholder="PO No."
        errors={errors}
      />

      <InputField
        control={control}
        name="poDate"
        label="PO Date"
        type="date"
        errors={errors}
      />

      <InputField
        control={control}
        name="partyGSTState"
        disabled
        label="Party GST State"
        errors={errors}
        placeholder="Party GST State"
      />

      <InputField
        control={control}
        name="isIGSTApplicable"
        label="Is IGST Applicable?"
        disabled
        errors={errors}
      />

      <InputField
        control={control}
        name="refNo"
        label="Ref.No."
        placeholder="Ref.No."
        errors={errors}
      />

      <InputField
        control={control}
        name="refDate"
        label="Ref.Date."
        type="date"
        errors={errors}
      />

      <SelectField
        control={control}
        name="locationId"
        label="Location ID"
        options={locationData}
        errors={errors}
        placeholder="Location ID"
      />

      <InputField
        control={control}
        name="gstnNo"
        label="GSTN No."
        placeholder="GSTN No."
        disabled
        errors={errors}
      />

      <InputField
        control={control}
        name="kindAttention"
        label="Kind Attention"
        errors={errors}
        placeholder="Kind Attention"
      />

      <InputField
        control={control}
        name="designation"
        label="Designation"
        errors={errors}
        placeholder="Designation"
      />

      <InputField
        control={control}
        name="timeOfIssue"
        label="Time Of Issue"
        type="time"
        errors={errors}
      />

      <SelectField
        control={control}
        name="bankName"
        label="Bank Name"
        options={bankOptions}
        errors={errors}
        placeholder="-- Select --"
      />

      <InputField
        control={control}
        name="date"
        label="Date"
        type="date"
        errors={errors}
      />

      <InputField
        control={control}
        name="timeOfRemoval"
        label="Time Of Removal"
        type="time"
        errors={errors}
      />
    </div>
  );

  const renderSalesTab = () => {
    // Determine if we should show SGST/CGST or IGST columns
    const showSGST = isIGSTApplicable === "No";
    const showIGST = isIGSTApplicable === "Yes";

    // Build headers based on tax type
    const baseHeaders = [
      "S.No",
      "Item Code *",
      "Customer Part No",
      "Item Description",
      "HSN/SAC Code",
      "Tax Type",
      "Tax %",
      "Despatch Qty",
      "Unit",
      "Order Rate",
      "Amount",
    ];

    const sgstHeaders = ["SGST Rate", "SGST Amount", "CGST Rate", "CGST Amount"];
    const igstHeaders = ["IGST Rate", "IGST Amount"];

    let taxHeaders = [];
    if (showSGST) {
      taxHeaders = sgstHeaders;
    } else if (showIGST) {
      taxHeaders = igstHeaders;
    }

    const headers = [...baseHeaders, ...taxHeaders, "Action"];

    return (
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
          <TableHead headers={headers} />
          <tbody>
            {salesContractArray.fields.map((field, index) => (
              <TableRow
                key={field.id}
                index={index}
                onRemove={() => handleRemoveItem(index)}
                disabled={salesContractArray.fields.length <= 1}
              >
                <SelectCell
                  control={control}
                  name={`salesContractDetails.${index}.itemCode`}
                  options={itemOptions}
                  errors={errors}
                  onChange={(v) => handleItemChange(index, "itemCode", v)}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.customerPartNo`}
                  placeholder="Part No"
                  errors={errors}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.itemDescription`}
                  readOnly
                  placeholder="Description"
                  errors={errors}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.hsCode`}
                  placeholder="HS Code"
                  errors={errors}
                  onChange={(e) => handleHSNChange(index, e.target.value)}
                />
                <SelectCell
                  control={control}
                  name={`salesContractDetails.${index}.taxType`}
                  options={TAX_TYPE}
                  errors={errors}
                  disabled={true}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.taxPercentage`}
                  type="number"
                  disabled
                  step="0.01"
                  placeholder="0.00"
                  errors={errors}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.dispatchQty`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  errors={errors}
                  onChange={() => recalcRow(index)}
                />
                <SelectCell
                  control={control}
                  name={`salesContractDetails.${index}.unit`}
                  options={unitOptions}
                  errors={errors}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.orderRate`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  errors={errors}
                  onChange={() => recalcRow(index)}
                />
                <InputCell
                  control={control}
                  name={`salesContractDetails.${index}.amount`}
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  readOnly
                  errors={errors}
                />

                {/* Conditionally render SGST/CGST or IGST columns */}
                {showSGST && (
                  <>
                    <InputCell
                      control={control}
                      name={`salesContractDetails.${index}.sgstRate`}
                      type="number"
                      step="0.0001"
                      placeholder="0.0000"
                      errors={errors}
                      readOnly
                    />
                    <InputCell
                      control={control}
                      name={`salesContractDetails.${index}.sgstAmount`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`salesContractDetails.${index}.cgstRate`}
                      type="number"
                      step="0.0001"
                      placeholder="0.0000"
                      errors={errors}
                      readOnly
                    />
                    <InputCell
                      control={control}
                      name={`salesContractDetails.${index}.cgstAmount`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly
                      errors={errors}
                    />
                  </>
                )}

                {showIGST && (
                  <>
                    <InputCell
                      control={control}
                      name={`salesContractDetails.${index}.igstRate`}
                      type="number"
                      step="0.0001"
                      placeholder="0.0000"
                      errors={errors}
                      readOnly
                    />
                    <InputCell
                      control={control}
                      name={`salesContractDetails.${index}.igstAmount`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      readOnly
                      errors={errors}
                    />
                  </>
                )}
              </TableRow>
            ))}
          </tbody>
        </TableWrapper>
      </div>
    );
  };

  const renderTaxTab = () => {
    // Get all available options from listOfValuesData
    const allOptions = listOfValuesData.PARTICULARS || [];

    // Get system option labels
    const systemOptionLabels = ['Gross Amount', 'IGST', 'CGST', 'SGST'];

    return (
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
          <TableHead headers={["S.No", "Particulars", "Amount", "Action"]} />
          <tbody>
            {taxDetailsArray.fields.map((field, index) => {
              const isSystemRow = getValues(`taxDetails.${index}.isSystemRow`);
              const particulars = getValues(`taxDetails.${index}.particulars`);
              const isReadOnly = isSystemRow || systemOptionLabels.includes(particulars);

              // For system rows, only show their specific value
              // For user rows, show all options except system ones
              let availableOptions = [];
              if (isSystemRow) {
                availableOptions = [{ label: particulars, value: particulars }];
              } else {
                // Filter out system options for user rows
                availableOptions = allOptions.filter(option =>
                  !systemOptionLabels.includes(option.label)
                );
              }

              return (
                <TableRow
                  key={field.id}
                  index={index}
                  onRemove={() => handleRemoveTax(index)}
                  disabled={taxDetailsArray.fields.length <= 1}
                >
                  <td className="p-2 align-top">
                    <Controller
                      name={`taxDetails.${index}.particulars`}
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`${controlClasses} ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                          disabled={isReadOnly}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          value={field.value || ""}
                        >
                          <option value="">Select Particulars</option>
                          {availableOptions.map((option) => (
                            <option key={option.value || option.label} value={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </td>
                  <td className="p-2 align-top">
                    <Controller
                      name={`taxDetails.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className={`${controlClasses} text-right ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                          disabled={isReadOnly}
                          value={field.value || 0}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                          }}
                        />
                      )}
                    />
                  </td>
                </TableRow>
              );
            })}
          </tbody>
        </TableWrapper>
      </div>
    );
  };

  const renderTermsTab = () => (
    <div className="pt-2">
      <div className={subTabFieldGrid}>
        <InputField
          control={control}
          name="termsAndConditions.insurance"
          label="Insurance"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.freight"
          label="Freight"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.noOfPkg"
          label="No. Of Pkg"
          type="number"
          placeholder="No. of packages"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.pkgType"
          label="Pkg Type"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.modeOfTransport"
          label="Mode Of Transport"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.rateOfDuty"
          label="Rate Of Duty"
          type="number"
          step="0.01"
          placeholder="0.00"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.tariffNo"
          label="Tariff No."
          placeholder="Tariff No."
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.basicValue"
          label="Basic Value"
          readOnly
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.grossAmount"
          label="Gross Amount"
          readOnly
          errors={errors}
        />

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="termsAndConditions.amountInWords"
            label="Amount In Words"
            readOnly
            errors={errors}
          />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="termsAndConditions.deliveryTo"
            label="Delivery To"
            placeholder="Delivery address"
            errors={errors}
          />
        </div>

        <InputField
          control={control}
          name="termsAndConditions.paymentTerms"
          label="Payment Terms"
          placeholder="Payment terms"
          errors={errors}
        />

        <InputField
          control={control}
          name="termsAndConditions.paymentPercentage"
          label="Payment %"
          type="number"
          step="0.01"
          placeholder="0.00"
          errors={errors}
        />

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="termsAndConditions.narration"
            label="Narration"
            placeholder="Enter narration..."
            errors={errors}
          />
        </div>
      </div>
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
          {data ? "Edit Proforma Invoice" : "Add Proforma Invoice"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Info */}
        <div>
          <SectionHeader>Proforma Invoice</SectionHeader>
          {renderHeader()}
        </div>

        {/* Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
            <button
              type="button"
              onClick={() => setActiveTab("salesContract")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "salesContract"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
                }`}
            >
              Product Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("taxDetails")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "taxDetails"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
                }`}
            >
              Tax Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("termsAndConditions")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "termsAndConditions"
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

export default ProformaInvoiceForm;