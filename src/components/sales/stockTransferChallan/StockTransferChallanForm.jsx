import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  Upload,
  File,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { stateAPI } from "../../../api/stateAPI";
import bankAPI from "../../../api/bankAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import stockTransferChallanAPI from "../../../api/Sales/stockTranferChallanAPI";

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

const ToggleSwitch = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-0.5"
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
    <td className="p-2 align-top min-w-[120px]">
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
    <td className="p-2 align-top min-w-[100px]">
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

const STOCK_POSTING_OPTIONS = ["Yes", "No"];
const IMPORT_LOCAL_OPTIONS = ["Import", "Local"];
const TAX_TYPE_OPTIONS = ["SGST", "IGST"];
const TRANSPORT_OPTIONS = ["Road", "Rail", "Air", "Sea", "Courier"];
const YES_NO = ["Yes", "No"];

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

const getDefaultItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  taxType: "",
  taxPerc: "",
  unit: "",
  stock: "",
  qty: "",
  rate: "",
  totalAssessableValue: "",
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
  acceptedQtyAmount: "",
  revisedAmount: "",
  isSystemRow: false,
});

const getDefaultValues = () => ({
  plantId: "",
  docId: "",
  type: "",
  transferDate: dayjs().format("YYYY-MM-DD"),
  customerId: "",
  customerName: "",
  locationId: "",
  timeOfTransfer: dayjs().format("HH:mm"),
  stockPosting: "",
  noOfPackages: "",
  partyGstState: "",
  otherPackages: "",
  isIgstApplicable: "",
  importLocal: "",
  gstinNo: "",
  taxCode: "",
  active: true,
  itemDetails: [getDefaultItemRow()],
  taxDetails: [getDefaultTaxRow()],
  totalInsurance: "",
  totalFreight: "",
  totalAssessableValueHeader: "",
  modeOfTransport: "",
  salesTax: "",
  grossAmount: "",
  amountInWords: "",
  deliveryTo: "",
  paymentTerms: "",
  narration: "",
});

// ===================== Main Component =====================

const StockTransferChallanForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const usersId = localStorage.getItem("usersId");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeTab, setActiveTab] = useState("itemDetails");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isUpdatingRef = useRef(false);
  const loadedChallanIdRef = useRef(null);
  // const dataLoadedRef = useRef(false);

  const LIST_OF_VALUES_GROUPS = {
    TYPE: "Stock Transfer Challan Type",
    PARTICULARS: "Particulars",
  };

  // Lookup data states
  const [plantOptions, setPlantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});

  const defaults = useCallback(() => {
    const base = getDefaultValues();
    if (data) {
      const record = data;
      base.plantId = record.branch?.id ?? record.plantId ?? "";
      base.docId = record.docId || `STCH${String(Date.now()).slice(-6)}`;

      // IMPORTANT: Type should be the ID from types object
      base.type = record.types?.id ?? record.type ?? "";

      base.transferDate = fmtDate(record.docDate || record.transferDate);
      base.customerId = record.customer?.customerId ?? record.customerId ?? "";
      base.customerName = record.customer?.customerName || record.customerName || "";
      base.locationId = record.location?.id ?? record.locationId ?? "";
      base.timeOfTransfer = record.timeOfTranfer || record.timeOfTransfer || dayjs().format("HH:mm");

      // IMPORTANT: Stock Posting
      base.stockPosting = record.stockPosting || "";

      base.noOfPackages = record.noOfPackages || "";
      base.partyGstState = record.customer?.gstState || record.partyGstState || "";
      base.otherPackages = record.otherPackages || "";
      base.isIgstApplicable = record.customer?.igstApplicable === true ? "Yes" : "No";

      // IMPORTANT: Import Local
      base.importLocal = record.importLocal || "";

      base.gstinNo = record.customer?.gstNo || record.gstinNo || "";
      base.taxCode = record.taxCode || "";
      base.active = record.active === "Active" || record.active !== false;

      // Item Details with all fields properly mapped
      base.itemDetails = record.stockTransferChallanDetailsResponseDTO?.length
        ? record.stockTransferChallanDetailsResponseDTO.map(item => {
          const amount = item.totalAssessableValue || (item.quantity * item.rate) || 0;
          return {
            itemCode: item.item?.id != null ? String(item.item.id) : "",
            itemDescription: item.item?.itemDescription || "",
            hsnSacCode: item.hsnCode || "",
            taxType: item.taxType || "SGST",
            taxPerc: item.taxPercentage || "",
            unit: item.item?.unit?.id || item.unit || "",
            stock: item.stock || "",
            qty: item.quantity || "",
            rate: item.rate || "",
            totalAssessableValue: amount,
            amount: amount,
            sgstRate: item.sgstRate || "",
            sgstAmount: item.sgstAmount || "",
            cgstRate: item.cgstRate || "",
            cgstAmount: item.cgstAmount || "",
            igstRate: item.igstRate || "",
            igstAmount: item.igstAmount || "",
          };
        })
        : [getDefaultItemRow()];

      // Tax Details
      base.taxDetails = record.stockTransferChallanTaxDetailsResponseDTO?.length
        ? record.stockTransferChallanTaxDetailsResponseDTO.map(item => ({
          particulars: item.particularsDesc || item.particulars || "",
          acceptedQtyAmount: item.acceptQtyAmount || "",
          revisedAmount: item.revisedAmoount || "",
          isSystemRow: ['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(
            item.particularsDesc || item.particulars || ""
          ),
        }))
        : [getDefaultTaxRow()];

      // Terms
      base.totalInsurance = record.totalInsurance || "";
      base.totalFreight = record.totalFreight || "";
      base.totalAssessableValueHeader = record.totalAssVal || "";
      base.modeOfTransport = record.modeOfTransport || "";
      base.salesTax = record.salesTax || "";
      base.grossAmount = record.grossAmount || "";
      base.amountInWords = record.amountInWords || "";
      base.deliveryTo = record.deliverTo || "";
      base.paymentTerms = record.paymentTerms || "";
      base.narration = record.narration || "";
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

  const itemDetailsArray = useFieldArray({
    control,
    name: "itemDetails",
  });

  const taxDetailsArray = useFieldArray({
    control,
    name: "taxDetails",
  });

  const watchItems = watch("itemDetails");
  const watchTaxDetails = watch("taxDetails");
  const isIgstApplicable = watch("isIgstApplicable");

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
      const res = await stockTransferChallanAPI.getCustomerByOrgId(orgId, branch);

      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode,
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
      const res = await stockTransferChallanAPI.getItemDetails(
        orgId,
        branch
      );

      const map = {};

      const options = (res || []).map((it) => {
        map[String(it.id)] = it;

        return {
          value: String(it.id),
          label: it.itemCode,
        };
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
      loadCustomers();
      loadItems();
      loadUnits();
      loadLocations();
      loadStates();
      loadBanks();
      loadListOfValuesData();
    }
  }, [
    orgId,
    loadPlants,
    loadCustomers,
    loadItems,
    loadUnits,
    loadLocations,
    loadStates,
    loadListOfValuesData,
  ]);

  // ===================== Load Data for Edit =====================

  const loadChallanData = useCallback(async (challanId) => {
    if (!challanId) return;

    // Prevent the same ID from being requested multiple times
    if (loadedChallanIdRef.current === challanId) {
      return;
    }

    loadedChallanIdRef.current = challanId;
    setLoading(true);

    try {
      const response = await stockTransferChallanAPI.getStockTransferChallanById(challanId);
      console.log("Stock Transfer Challan Data:", response);

      if (response) {
        const challan = response;

        // =========================
        // Header fields
        // =========================

        setValue("plantId", challan.branch?.id || challan.plantId || "");
        setValue("docId", challan.docId || "");
        setValue("type", challan.types?.id || challan.type || "");
        setValue("transferDate", challan.docDate || challan.date || "");
        setValue("customerId", challan.customer?.customerId || challan.customerId || "");
        setValue("customerName", challan.customer?.customerName || challan.customerName || "");
        setValue("partyGstState", challan.customer?.gstState || challan.partyGstState || "");
        setValue("gstinNo", challan.customer?.gstNo || challan.gstinNo || "");
        setValue("isIgstApplicable", challan.customer?.igstApplicable === true ? "Yes" : "No");
        setValue("locationId", challan.location?.id || challan.locationId || "");
        setValue("timeOfTransfer", challan.timeOfTranfer || challan.timeOfTransfer || "");
        setValue("stockPosting", challan.stockPosting || "");
        setValue("noOfPackages", challan.noOfPackages || "");
        setValue("otherPackages", challan.otherPackages || "");
        setValue("importLocal", challan.importLocal || "");
        setValue("active", challan.active === "Active" || challan.active !== false);

        // =========================
        // Terms and Conditions
        // =========================

        setValue("totalInsurance", challan.totalInsurance || "");
        setValue("totalFreight", challan.totalFreight || "");
        setValue("totalAssessableValueHeader", challan.totalAssVal || "");
        setValue("modeOfTransport", challan.modeOfTransport || "");
        setValue("salesTax", challan.salesTax || "");
        setValue("grossAmount", challan.grossAmount || "");
        setValue("amountInWords", challan.amountInWords || "");
        setValue("deliveryTo", challan.deliverTo || "");
        setValue("paymentTerms", challan.paymentTerms || "");
        setValue("narration", challan.narration || "");

        // =========================
        // Item Details - FIXED
        // =========================
        if (challan.stockTransferChallanDetailsResponseDTO?.length > 0) {
          const details = challan.stockTransferChallanDetailsResponseDTO.map((item) => {
            // Get the itemCode from the nested item object
            const itemCode =
              item.item?.id != null
                ? String(item.item.id)
                : "";
            // Calculate amount from quantity * rate if totalAssessableValue is not available
            const amount = item.totalAssessableValue || (item.quantity * item.rate) || 0;

            return {
              itemCode: itemCode,
              itemDescription: item.item?.itemDescription || "",
              hsnSacCode: item.hsnCode || "",
              taxType: item.taxType || "SGST",
              taxPerc: item.taxPercentage || "",
              unit: item.item?.unit?.id || item.unit || "",
              stock: item.stock || "",
              qty: item.quantity || "",
              rate: item.rate || "",
              // IMPORTANT: Set amount from totalAssessableValue or calculate it
              totalAssessableValue: amount,
              amount: amount,
              sgstRate: item.sgstRate || "",
              sgstAmount: item.sgstAmount || "",
              cgstRate: item.cgstRate || "",
              cgstAmount: item.cgstAmount || "",
              igstRate: item.igstRate || "",
              igstAmount: item.igstAmount || "",
            };
          });
          itemDetailsArray.replace(details);
        }

        // =========================
        // Tax Details
        // =========================

        if (challan.stockTransferChallanTaxDetailsResponseDTO?.length > 0) {
          const taxDetails = challan.stockTransferChallanTaxDetailsResponseDTO.map((item) => ({
            particulars: item.particularsDesc || item.particulars || "",
            acceptedQtyAmount: item.acceptQtyAmount || "",
            revisedAmount: item.revisedAmoount || "",
            isSystemRow: ["Gross Amount", "IGST", "CGST", "SGST"].includes(
              item.particularsDesc || item.particulars || ""
            ),
          }));
          taxDetailsArray.replace(taxDetails);
        }

        addToast("Stock Transfer Challan loaded successfully", "success");
      } else {
        loadedChallanIdRef.current = null;
        addToast("Failed to load Stock Transfer Challan data", "error");
      }
    } catch (error) {
      loadedChallanIdRef.current = null;
      console.error("Error loading challan:", error);
      addToast("Failed to load Stock Transfer Challan data", "error");
    } finally {
      setLoading(false);
    }
  }, [setValue, itemDetailsArray, taxDetailsArray, addToast]);

  useEffect(() => {
    if (!data?.id) return;

    loadChallanData(data.id);
  }, [data?.id, loadChallanData]);

  // ===================== Handlers =====================

  const handleItemChange = (idx, field, value, row) => {
    setValue(`itemDetails.${idx}.${field}`, value, { shouldDirty: true });

    if (field === "itemCode") {
      const item = itemMap[String(value)];

      console.log("Selected Item:", item);

      if (item) {
        setValue(
          `itemDetails.${idx}.itemDescription`,
          item.itemDescription || "",
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.hsnSacCode`,
          item.hsn || "",
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.unit`,
          item.unitmasterId || item.unit || "",
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.taxPerc`,
          item.rate || "",
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.sgstRate`,
          item.sgst || 0,
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.cgstRate`,
          item.cgst || 0,
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.igstRate`,
          item.igst || 0,
          { shouldDirty: true }
        );

        setValue(
          `itemDetails.${idx}.taxPerc`,
          item.rate || 0,
          { shouldDirty: true }
        );

        const taxType =
          isIgstApplicable === "Yes"
            ? "IGST"
            : "SGST";

        setValue(
          `itemDetails.${idx}.taxType`,
          taxType,
          { shouldDirty: true }
        );

        recalcRow(idx);
      }

      return;
    }

    recalcRow(idx);
  };

  const recalcRow = (idx) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const row = watchItems?.[idx];
      if (!row) return;

      const qty = parseFloat(row.qty) || 0;
      const rate = parseFloat(row.rate) || 0;
      const sgstR = parseFloat(row.sgstRate) || 0;
      const cgstR = parseFloat(row.cgstRate) || 0;
      const igstR = parseFloat(row.igstRate) || 0;

      const assessable = qty * rate;
      setValue(`itemDetails.${idx}.totalAssessableValue`, assessable || "", { shouldDirty: true });
      setValue(`itemDetails.${idx}.amount`, assessable || "", { shouldDirty: true });

      // Calculate tax amounts based on tax type
      const taxType = row.taxType || (isIgstApplicable === "Yes" ? "IGST" : "SGST");

      if (taxType === "IGST") {
        const igstAmount = (assessable * igstR) / 100;
        setValue(`itemDetails.${idx}.igstAmount`, igstAmount || "", { shouldDirty: true });
        setValue(`itemDetails.${idx}.sgstAmount`, "", { shouldDirty: true });
        setValue(`itemDetails.${idx}.cgstAmount`, "", { shouldDirty: true });
      } else {
        const sgstAmount = (assessable * sgstR) / 100;
        const cgstAmount = (assessable * cgstR) / 100;
        setValue(`itemDetails.${idx}.sgstAmount`, sgstAmount || "", { shouldDirty: true });
        setValue(`itemDetails.${idx}.cgstAmount`, cgstAmount || "", { shouldDirty: true });
        setValue(`itemDetails.${idx}.igstAmount`, "", { shouldDirty: true });
      }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  // Calculate Tax Details - similar to ProformaInvoice
  const calculateTaxDetails = useCallback(() => {
    if (!watchItems?.length) return;

    const contractDetails = watchItems || [];
    const totalAmount = contractDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const taxType = isIgstApplicable === "Yes" ? "IGST" : "SGST";

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
      acceptedQtyAmount: totalAmount,
      revisedAmount: totalAmount,
      isSystemRow: true
    });

    if (taxType === "IGST") {
      systemRows.push({
        particulars: "IGST",
        acceptedQtyAmount: igstTotal,
        revisedAmount: igstTotal,
        isSystemRow: true
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        acceptedQtyAmount: sgstTotal,
        revisedAmount: sgstTotal,
        isSystemRow: true
      });
      systemRows.push({
        particulars: "CGST",
        acceptedQtyAmount: cgstTotal,
        revisedAmount: cgstTotal,
        isSystemRow: true
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];

    const currentRows = getValues("taxDetails") || [];

    const hasChanged =
      JSON.stringify(currentRows) !== JSON.stringify(allTaxEntries);

    if (hasChanged) {
      taxDetailsArray.replace(allTaxEntries);
    }

    // Update header totals
    const grand = totalAmount + sgstTotal + cgstTotal + igstTotal;
    setValue("totalAssessableValueHeader", totalAmount || "", { shouldDirty: true });
    setValue("grossAmount", grand || "", { shouldDirty: true });
    setValue("amountInWords", grand ? numberToWords(grand) : "", { shouldDirty: true });
  }, [watchItems, getValues, isIgstApplicable, taxDetailsArray, setValue]);

  useEffect(() => {
    calculateTaxDetails();
  }, [watchItems, calculateTaxDetails]);

  const handleAddItem = () => {
    itemDetailsArray.append(getDefaultItemRow());
  };

  const handleRemoveItem = (index) => {
    if (itemDetailsArray.fields.length > 1) itemDetailsArray.remove(index);
  };

  const handleCopyItem = (idx) => {
    const row = watchItems?.[idx];
    if (row) itemDetailsArray.append({ ...getDefaultItemRow(), ...row });
  };

  const handleAddTax = () => {
    const newItem = {
      particulars: "",
      acceptedQtyAmount: "",
      revisedAmount: "",
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

  const validate = () => {
    const fundErrors = [];
    if (!watch("plantId")) fundErrors.push("Plant ID");
    if (!watch("docId")) fundErrors.push("Doc ID");
    if (!watch("transferDate")) fundErrors.push("Transfer Date");
    if (!watch("customerId")) fundErrors.push("Customer");
    if (!watch("partyGstState")) fundErrors.push("Party GST State");

    // Validate item details
    const items = watch("itemDetails") || [];
    items.forEach((item, index) => {
      if (!item.itemCode) fundErrors.push(`Item ${index + 1}: Item Code`);
      if (!item.hsnSacCode) fundErrors.push(`Item ${index + 1}: HSN/SAC Code`);
      if (!item.taxType) fundErrors.push(`Item ${index + 1}: Tax Type`);
      if (!item.qty || Number(item.qty) <= 0) fundErrors.push(`Item ${index + 1}: Qty`);
      if (!item.rate || Number(item.rate) <= 0) fundErrors.push(`Item ${index + 1}: Rate`);
    });

    if (fundErrors.length) {
      addToast(`Missing mandatory fields: ${fundErrors.join(", ")}`, "error");
      return false;
    }
    return true;
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;

    setSaving(true);
    const isUpdate = Boolean(data?.id);

    // Calculate totals
    const items = formData.itemDetails || [];
    const totalAssessable = items.reduce((sum, r) => sum + (parseFloat(r.totalAssessableValue) || 0), 0);
    const gross = items.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const sgstTotal = items.reduce((sum, r) => sum + (parseFloat(r.sgstAmount) || 0), 0);
    const cgstTotal = items.reduce((sum, r) => sum + (parseFloat(r.cgstAmount) || 0), 0);
    const igstTotal = items.reduce((sum, r) => sum + (parseFloat(r.igstAmount) || 0), 0);

    // Get particulars ID from listOfValuesData
    const getParticularId = (label) => {
      if (!label) return 0;
      const allOptions = listOfValuesData.PARTICULARS || [];
      const found = allOptions.find(option => option.label === label);
      return found ? found.value : 0;
    };

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId: orgId,
      branch: branch,
      active: formData.active !== false,
      amountInWords: numberToWords(gross + sgstTotal + cgstTotal + igstTotal) || "",
      cancelRemarks: "",
      createdBy: usersId || "admin",
      customer: formData.customerId ? parseInt(formData.customerId) : 0,
      date: formData.transferDate || "",
      deliverTo: formData.deliveryTo || "",
      financialYear: new Date().getFullYear().toString(),
      grossAmount: gross + sgstTotal + cgstTotal + igstTotal || 0,
      importLocal: formData.importLocal || "",
      location: formData.locationId ? parseInt(formData.locationId) : 0,
      modeOfTransport: formData.modeOfTransport || "",
      narration: formData.narration || "",
      noOfPackages: parseInt(formData.noOfPackages) || 0,
      otherPackages: parseInt(formData.otherPackages) || 0,
      paymentTerms: formData.paymentTerms || "",
      salesTax: formData.salesTax || "",
      isIgstApplicable: formData.isIgstApplicable,
      stockPosting: formData.stockPosting || "",
      timeOfTranfer: formData.timeOfTransfer || "",
      totalAssVal: totalAssessable || 0,
      totalFreight: parseFloat(formData.totalFreight) || 0,
      totalInsurance: parseFloat(formData.totalInsurance) || 0,
      types: formData.type ? parseInt(formData.type) : 0,

      // Stock Transfer Challan Details (Item Details)
      stockTransferChallanDetailsDTO: (formData.itemDetails || [])
        .filter((r) => r.itemCode?.trim())
        .map((item) => {
          // Determine tax type
          const taxType = item.taxType || (formData.isIgstApplicable === "Yes" ? "IGST" : "SGST");
          const isIGST = taxType === "IGST";

          return {
            // For IGST, send cgstRate and sgstRate as 0
            cgstRate: isIGST ? 0 : (parseFloat(item.cgstRate) || 0),
            hsnCode: item.hsnSacCode || "",
            // For IGST, send igstRate value; for SGST, send 0
            igstRate: isIGST ? (parseFloat(item.igstRate) || 0) : 0,
            item: itemMap[item.itemCode]?.id ? parseInt(itemMap[item.itemCode].id) : 0,
            quantity: parseFloat(item.qty) || 0,
            rate: parseFloat(item.rate) || 0,
            // For IGST, send sgstRate as 0; for SGST, send the actual value
            sgstRate: isIGST ? 0 : (parseFloat(item.sgstRate) || 0),
            stock: item.stock || "",
            taxPercentage: item.taxPerc ? String(item.taxPerc) : "0",
            taxType: taxType,
            unit: item.unit ? parseInt(item.unit) : 0,
          };
        }),

      // Stock Transfer Challan Tax Details
      stockTransferChallanTaxDetailsDTO: (formData.taxDetails || [])
        .filter((r) => r.particulars?.trim() || parseFloat(r.acceptedQtyAmount) > 0 || parseFloat(r.revisedAmount) > 0)
        .map((item) => ({
          acceptQtyAmount: parseFloat(item.acceptedQtyAmount) || 0,
          particulars: item.particulars || "",
          particularsId: Number(getParticularId(item.particulars)) || 0,
          revisedAmoount: parseFloat(item.revisedAmount) || 0,
        })),
    };

    // If updating, keep the id, otherwise remove it
    if (!isUpdate) {
      delete payload.id;
    }

    console.log("Saving Stock Transfer Challan Payload:", payload);

    try {
      const response = await stockTransferChallanAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Stock Transfer Challan updated successfully!"
            : "Stock Transfer Challan created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Stock Transfer Challan.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save Stock Transfer Challan Error:", err);
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
        label={isMacurex ? "Plant ID" : "Branch"}
        options={plantOptions}
        required
        errors={errors}
        placeholder={isMacurex ? "Select Plant" : "Select Branch"}
      />

      <InputField
        control={control}
        name="docId"
        label="Doc ID"
        required
        errors={errors}
      />

      <SelectField
        control={control}
        name="type"
        label="Type"
        options={listOfValuesData.TYPE || []}
        errors={errors}
        placeholder="Select"
      />

      <InputField
        control={control}
        name="transferDate"
        label="Transfer Date"
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
        onChange={(value) => {
          const customer = customerOptions.find((c) => String(c.value) === String(value));
          console.log("Selected Customer:", customer);
          setValue("customerName", customer?.customerName || "", { shouldDirty: true });
          setValue("partyGstState", customer?.partyGSTState || "", { shouldDirty: true });
          setValue("gstinNo", customer?.gstnNo || "", { shouldDirty: true });
          const igstValue = customer?.isIGSTApplicable === true ? "Yes" : "No";
          setValue("isIgstApplicable", igstValue, { shouldDirty: true });

          // Update tax type for all existing rows based on IGST applicability
          itemDetailsArray.fields.forEach((_, index) => {
            const taxType = igstValue === "Yes" ? "IGST" : "SGST";
            setValue(`itemDetails.${index}.taxType`, taxType, { shouldDirty: true });
          });
        }}
        placeholder="Select"
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
        name="locationId"
        label="Location ID"
        options={locationOptions}
        errors={errors}
        placeholder="Select"
      />

      <InputField
        control={control}
        name="timeOfTransfer"
        label="Time of Transfer"
        type="time"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="stockPosting"
        label="Stock Posting?"
        options={STOCK_POSTING_OPTIONS}
        errors={errors}
        placeholder="Select"
      />

      <InputField
        control={control}
        name="noOfPackages"
        label="No of Packages"
        type="number"
        step="1"
        errors={errors}
      />

      <InputField
        control={control}
        name="partyGstState"
        label="Party GST State"
        required
        errors={errors}
        placeholder="Enter GST State"
      />

      <InputField
        control={control}
        name="otherPackages"
        label="Other Packages"
        type="number"
        step="1"
        errors={errors}
      />

      <InputField
        control={control}
        name="isIgstApplicable"
        label="Is IGST Applicable"
        readOnly
        errors={errors}
      />

      <SelectField
        control={control}
        name="importLocal"
        label="Import / Local"
        options={IMPORT_LOCAL_OPTIONS}
        errors={errors}
        placeholder="Select"
      />

      <InputField
        control={control}
        name="gstinNo"
        label="GSTIN No"
        placeholder="Enter GSTIN"
        errors={errors}
      />
    </div>
  );

  const renderItemDetailsTab = () => {
    // Determine if we should show SGST/CGST or IGST columns
    const showSGST = isIgstApplicable === "No";
    const showIGST = isIgstApplicable === "Yes";

    // Build headers based on tax type
    const baseHeaders = [
      "S.No",
      "Item Code *",
      "Item Description",
      "HSN/SAC Code *",
      "Tax Type",
      "Tax %",
      "Unit",
      "Stock",
      "Qty *",
      "Rate *",
      "Total Assessable Value",
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
        <div className="flex items-center justify-between">
          <SectionHeader>Item Details</SectionHeader>
          <button
            type="button"
            onClick={handleAddItem}
            className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>

        <TableWrapper>
          <TableHead headers={headers} />
          <tbody>
            {itemDetailsArray.fields.map((field, index) => {
              const row = watchItems?.[index] || {};
              return (
                <TableRow
                  key={field.id}
                  index={index}
                  onRemove={() => handleRemoveItem(index)}
                  disabled={itemDetailsArray.fields.length <= 1}
                >
                  <SelectCell
                    control={control}
                    name={`itemDetails.${index}.itemCode`}
                    options={itemOptions}
                    errors={errors}
                    onChange={(v) => handleItemChange(index, "itemCode", v, row)}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.itemDescription`}
                    readOnly
                    placeholder="Description"
                    errors={errors}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.hsnSacCode`}
                    readOnly
                    placeholder="HSN/SAC"
                    errors={errors}
                  />
                  <SelectCell
                    control={control}
                    name={`itemDetails.${index}.taxType`}
                    options={TAX_TYPE_OPTIONS}
                    errors={errors}
                    disabled={true}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.taxPerc`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    readOnly
                    errors={errors}
                  />
                  <SelectCell
                    control={control}
                    name={`itemDetails.${index}.unit`}
                    options={unitOptions}
                    readOnly
                    errors={errors}
                    onChange={(v) => handleItemChange(index, "unit", v, row)}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.stock`}
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    errors={errors}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.qty`}
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    required
                    errors={errors}
                    onChange={(e) => handleItemChange(index, "qty", e.target.value, row)}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.rate`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    errors={errors}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value, row)}
                  />
                  <InputCell
                    control={control}
                    name={`itemDetails.${index}.totalAssessableValue`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    readOnly
                    errors={errors}
                  />

                  {/* Conditionally render SGST/CGST or IGST columns */}
                  {showSGST && (
                    <>
                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.sgstRate`}
                        type="number"
                        step="0.0001"
                        placeholder="0.0000"
                        errors={errors}
                        readOnly
                      />
                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.sgstAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        readOnly
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.cgstRate`}
                        type="number"
                        step="0.0001"
                        placeholder="0.0000"
                        errors={errors}
                        readOnly
                      />
                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.cgstAmount`}
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
                        name={`itemDetails.${index}.igstRate`}
                        type="number"
                        step="0.0001"
                        placeholder="0.0000"
                        errors={errors}
                        readOnly
                      />
                      <InputCell
                        control={control}
                        name={`itemDetails.${index}.igstAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        readOnly
                        errors={errors}
                      />
                    </>
                  )}
                </TableRow>
              );
            })}
          </tbody>
        </TableWrapper>
      </div>
    );
  };

  const renderTaxDetailsTab = () => {
    // Get all available options from listOfValuesData
    const allOptions = listOfValuesData.PARTICULARS || [];

    // Get system option labels
    const systemOptionLabels = ['Gross Amount', 'IGST', 'CGST', 'SGST'];

    const headers = [
      "S.No",
      "Particulars",
      "Accepted Qty Amount",
      "Revised Amount",
      "Action",
    ];

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
          <TableHead headers={headers} />
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
                  <td className="p-2 align-top min-w-[150px]">
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
                  <td className="p-2 align-top min-w-[150px]">
                    <Controller
                      name={`taxDetails.${index}.acceptedQtyAmount`}
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
                  <td className="p-2 align-top min-w-[150px]">
                    <Controller
                      name={`taxDetails.${index}.revisedAmount`}
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
          name="totalInsurance"
          label="Total Insurance"
          type="number"
          step="0.01"
          placeholder="0.00"
          errors={errors}
        />

        <InputField
          control={control}
          name="totalFreight"
          label="Total Freight"
          type="number"
          step="0.01"
          placeholder="0.00"
          errors={errors}
        />

        <InputField
          control={control}
          name="totalAssessableValueHeader"
          label="Total Assessable Value"
          type="number"
          step="0.01"
          placeholder="0.00"
          readOnly
          errors={errors}
        />

        <SelectField
          control={control}
          name="modeOfTransport"
          label="Mode of Transport"
          options={TRANSPORT_OPTIONS}
          errors={errors}
          placeholder="Select"
        />

        <InputField
          control={control}
          name="salesTax"
          label="Sales Tax"
          type="number"
          step="0.01"
          placeholder="0.00"
          errors={errors}
        />

        <InputField
          control={control}
          name="grossAmount"
          label="Gross Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          readOnly
          errors={errors}
        />

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="amountInWords"
            label="Amount in Words"
            readOnly
            errors={errors}
          />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="deliveryTo"
            label="Delivery To"
            placeholder="Delivery address"
            errors={errors}
          />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="paymentTerms"
            label="Payment Terms"
            placeholder="Payment terms"
            errors={errors}
          />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <InputField
            control={control}
            name="narration"
            label="Narration"
            placeholder="Enter narration..."
            errors={errors}
          />
        </div>
      </div>
    </div>
  );

  // ===================== Main Render =====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading Stock Transfer Challan...</div>
      </div>
    );
  }

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
          {data ? "Edit Stock Transfer Challan" : "Add Stock Transfer Challan"}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <ToggleSwitch value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Info */}
        <div>
          <SectionHeader>Challan Header</SectionHeader>
          {renderHeader()}
        </div>

        {/* Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
            <button
              type="button"
              onClick={() => setActiveTab("itemDetails")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "itemDetails"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
                }`}
            >
              Item Details
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
              onClick={() => setActiveTab("terms")}
              className={`px-4 py-1 text-xs font-semibold rounded-t ${activeTab === "terms"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
                }`}
            >
              Terms And Conditions
            </button>
          </div>

          {activeTab === "itemDetails" && renderItemDetailsTab()}
          {activeTab === "taxDetails" && renderTaxDetailsTab()}
          {activeTab === "terms" && renderTermsTab()}
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

export default StockTransferChallanForm;