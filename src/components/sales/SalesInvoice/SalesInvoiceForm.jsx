import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useToast } from "../../Toast/ToastContext";
import salesInvoiceAPI from "../../../api/Sales/salesInvoiceAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  onChange,
  disabled,
  auto = false,
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
        {auto && <span className="text-gray-400 text-[10px] ml-1">(Auto)</span>}
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
            disabled={disabled || auto}
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
        <p className="text-red-500 text-[11px] mt-0.5">{errorMessage}</p>
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
  auto = false,
  step,
  readOnly = false,
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
        {auto && <span className="text-gray-400 text-[10px] ml-1">(Auto)</span>}
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
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled || auto}
            readOnly={readOnly}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-0.5">{errorMessage}</p>
      )}
    </div>
  );
};

const TextareaField = ({
  control,
  name,
  label,
  required,
  placeholder,
  errors,
  disabled,
  rows = 3,
  className = "",
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
    <div className={className}>
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
          <textarea
            {...field}
            rows={rows}
            className={`w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-0.5">{errorMessage}</p>
      )}
    </div>
  );
};

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs border-separate border-spacing-x-2 border-spacing-y-1">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-3 whitespace-nowrap ${i === 0 ? "w-12 text-center" : "text-left"} dark:text-white text-[10px] font-medium`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const SelectCell = ({
  control,
  name,
  options,
  required,
  errors,
  onChange,
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
    <td className="p-2 align-top min-w-[120px]">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`w-full h-9 px-3 rounded border text-[10px] leading-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
            value={field.value || ""}
          >
            <option value="">-- Select --</option>
            {options && options.length > 0 ? (
              options.map((opt) => (
                <option
                  key={typeof opt === "object" ? opt.value : opt}
                  value={typeof opt === "object" ? opt.value : opt}
                >
                  {typeof opt === "object" ? opt.label : opt}
                </option>
              ))
            ) : (
              <option value="" disabled>No options available</option>
            )}
          </select>
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[9px] mt-1">{errorMessage}</div>
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
  disabled,
  readOnly = false,
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
    <td className="p-2 align-top min-w-[120px]">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`w-full h-9 px-3 rounded border text-[10px] leading-none transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
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
        <div className="text-red-500 text-[9px] mt-1">{errorMessage}</div>
      )}
    </td>
  );
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const currentTime = () => new Date().toTimeString().slice(0, 5);

const getDefaultValues = () => ({
  // Common fields
  plant: "",
  docType: "Invoice",

  // D.C. Cum Invoice
  invoiceHeader: {
    locationId: "",
    salesInvoiceNo: "",
    belongsTo: "",
    vehicle: "",
    subDocType: "INVOICE",
    isIGSTAppl: "NO",
    gstnNo: "",
    customerId: "",
    timeOfIssue: currentTime(),
    invoiceDate: todayISO(),
    customerName: "",
    invoiceType: "",
    customerCode: "",
    currency: "RS",
    schNo: "",
    diNo: "",
    timeOfRemoval: currentTime(),
    schDate: "",
    diDate: "",
    exchangeRate: "",
    monthYear: "",
    kanbanCardNo: "",
    customerType: "",
    excisable: "NO",
    taxCode: "",
    stockPosting: "YES",
    partyGstState: "",
    pdiNo: "",
    dateOfIssue: todayISO(),
    dateOfRemoval: todayISO(),
  },
  invoiceItems: [
    {
      itemCode: "",
      itemDescription: "",
      hsnSacCode: "",
      taxType: "",
      taxPercent: "",
      customerPartNo: "",
      unit: "",
      lastInvoicedDate: "",
      tariffNo: "",
      stock: "",
      soContractNo: "",
      despQty: "",
      noOfPackages: "",
      packageType: "",
      rateInSelectedCurr: "",
      amtInSelectedCurrency: "",
      amountInRs: "",
      sgstRate: "",
      sgstAmount: "",
      cgstRate: "",
      cgstAmount: "",
      igstRate: "",
      igstAmount: "",
    },
  ],
  invoiceTaxDetails: [
    {
      particulars: "",
      amount: "",
      glAccountName: "",
    },
  ],
  invoiceTerms: {
    totalInsurance: "",
    totalFreight: "",
    totalAssVal: "",
    modeOfTransport: "",
    netAmount: "",
    deliveryTo: "",
    tcsAmount: "",
    netWeight: "",
    grossWeight: "",
    po: "",
    poDate: "",
    paymentTerms: "",
    amountInWords: "",
    narration: "",
  },
  invoiceShipping: {
    customerId: "",
    customerName: "",
    customerCode: "",
    gstNo: "",
    address: "",
    city: "",
    partyGstState: "",
    pincode: "",
  },

  // Other Sales Invoice
  otherSalesHeader: {
    monthYear: "",
    belongsTo: "",
    excisable: "NO",
    taxCode: "",
    subDocType: "INVOICE",
    locationId: "",
    salesInvoiceNo: "",
    customerId: "",
    vehicle: "",
    customerName: "",
    timeOfIssue: "",
    invoiceDate: todayISO(),
    customerCode: "",
    invoiceType: "",
    isIGSTAppl: "NO",
    currency: "RS",
    currencyId: 0,
    schNo: "",
    gstnNo: "",
    timeOfRemoval: "",
    schDate: "",
    diNo: "",
    diDate: "",
    exchangeRate: "",
    kanbanCardNo: "",
    stockPosting: "YES",
  },
  otherSalesItems: [
    {
      itemCode: "",
      hsnSacCode: "",
      taxType: "",
      taxPercent: "",
      itemDescription: "",
      customerPartNo: "",
      unit: "",
      lastInvoicedDate: "",
      tariffNo: "",
      stock: "",
      soContractNo: "",
      despQty: "",
      noOfPackages: "",
      packageType: "",
      rateInSelectedCurr: "",
      amtInSelectedCurrency: "",
      amountInRs: "",
      sgstRate: "",
      sgstAmount: "",
      cgstRate: "",
      cgstAmount: "",
      igstRate: "",
      igstAmount: "",
    },
  ],
  otherSalesTaxDetails: [
    {
      particulars: "",
      acceptedQtyAmount: "",
      revisedAmount: "",
      glAccountName: "",
    },
  ],
  otherSalesTerms: {
    totalInsurance: "",
    totalFreight: "",
    totalAssVal: "",
    modeOfTransport: "",
    netAmount: "",
    deliveryTo: "",
    paymentTerms: "",
    po: "",
    poDate: "",
    amountInWords: "",
    narration: "",
  },

  // Rejection Invoice
  rejectionHeader: {
    locationId: "",
    rejectionInvoiceNo: "",
    belongsTo: "",
    vehicle: "",
    subDocType: "REJECTION",
    isIGSTAppl: "NO",
    gstnNo: "",
    customerName: "",
    timeOfIssue: "",
    invoiceDate: todayISO(),
    customerCode: "",
    invoiceType: "",
    partyGstState: "",
    currency: "RS",
    schNo: "",
    diNo: "",
    timeOfRemoval: "",
    schDate: "",
    diDate: "",
    exchangeRate: "",
    monthYear: "",
    kanbanCardNo: "",
    refNo: "",
    excisable: "NO",
    taxCode: "",
    refDate: "",
    stockPosting: "YES",
    supplierInvNo: "",
  },
  rejectionItems: [
    {
      itemCode: "",
      itemDescription: "",
      hsnSacCode: "",
      taxType: "",
      taxPercent: "",
      customerPartNo: "",
      unit: "",
      lastInvoicedDate: "",
      tariffNo: "",
      stock: "",
      soContractNo: "",
      despQty: "",
      noOfPackages: "",
      packageType: "",
      rateInSelectedCurr: "",
      amtInSelectedCurrency: "",
      amountInRs: "",
      edPercent: "",
      sgstRate: "",
      sgstAmount: "",
      cgstRate: "",
      cgstAmount: "",
      igstRate: "",
      igstAmount: "",
    },
  ],
  rejectionTaxDetails: [
    {
      particulars: "",
      acceptedQtyAmount: "",
      revisedAmount: "",
      glAccountName: "",
      dbcr: "",
      dbamt: "",
      cramt: "",
    },
  ],
  rejectionTerms: {
    totalInsurance: "",
    totalFreight: "",
    totalAssVal: "",
    modeOfTransport: "",
    netAmount: "",
    deliveryTo: "",
    paymentTerms: "",
    po: "",
    poDate: "",
    amountInWords: "",
    narration: "",
  },
});

const LOCATION_IDS = ["MAIN STORE", "WAREHOUSE 1", "WAREHOUSE 2", "PLANT STORE"];
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const YES_NO = ["YES", "NO"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];
const TAX_TYPES = ["SGST+CGST", "IGST", "EXEMPT", "NIL RATED"];
const TAX_CODES = ["GST0", "GST5", "GST12", "GST18", "GST28"];
const GST_STATES = ["KARNATAKA", "TAMIL NADU", "MAHARASHTRA", "DELHI"];
const CUSTOMER_TYPES = ["DOMESTIC", "EXPORT", "SEZ"];
const CUSTOMER_CODES = ["CUST-001", "CUST-002", "CUST-003"];
const PACKAGE_TYPES = ["CARTON", "PALLET", "CRATE", "BAG"];
const MODE_OF_TRANSPORT = ["ROAD", "RAIL", "AIR", "SEA", "COURIER"];
const DEBIT_CREDIT = ["DEBIT", "CREDIT"];
const DOC_TYPE_OPTIONS = ["Invoice", "Rejection", "Other Sales Invoice"];

const DOC_TYPE_INVOICE = "Invoice";
const DOC_TYPE_REJECTION = "Rejection";
const DOC_TYPE_OTHER_SALES = "Other Sales Invoice";

const DISPATCH_NO_OPTIONS = [];

const LIST_OF_VALUES_GROUPS = {
  PARTICULARS: "Particulars",
};

const INVOICE_HEADER_FIELDS = [
  { name: "locationId", label: "Location ID", type: "select", options: LOCATION_IDS },
  { name: "salesInvoiceNo", label: "Sales Invoice No", auto: true },
  { name: "belongsTo", label: "Belongs to", type: "select", options: BELONGS_TO },
  { name: "vehicle", label: "Vehicle" },
  { name: "customerId", label: "Customer ID", type: "select", options: CUSTOMER_CODES },
  { name: "customerName", label: "Customer Name" },
  { name: "isIGSTAppl", label: "Is IGST Appl", type: "select", options: YES_NO },
  { name: "gstnNo", label: "GSTN No" },
  { name: "timeOfIssue", label: "Time Of Issue", type: "time", readOnly: true },
  { name: "invoiceDate", label: "Invoice Date", type: "date" },
  { name: "invoiceType", label: "Invoice Type" },
  { name: "currency", label: "Currency", default: "RS", readOnly: true },
  { name: "currencyId", label: "Currency ID", type: "number", readOnly: true, hidden: true },
  { name: "diNo", label: "DI.No", type: "select", options: [] },
  { name: "diDate", label: "DI.Date", type: "date" },
  { name: "schNo", label: "Sch. No." },
  { name: "schDate", label: "Sch. Date", type: "date" },
  { name: "timeOfRemoval", label: "Time Of Removal", type: "time", readOnly: true },
  { name: "dateOfIssue", label: "Date Of Issue", type: "date", readOnly: true },
  { name: "dateOfRemoval", label: "Date Of Removal", type: "date", readOnly: true },
  { name: "exchangeRate", label: "Exchange Rate", type: "number", readOnly: true },
  { name: "monthYear", label: "Month Year", type: "month", readOnly: true },
  { name: "kanbanCardNo", label: "Kanban Card No" },
  { name: "excisable", label: "Excisable ?", type: "select", options: YES_NO },
  { name: "stockPosting", label: "Stock Posting?", type: "select", options: YES_NO },
  { name: "partyGstState", label: "Party GST State" },
  { name: "pdiNo", label: "PDI No" },
];

const OTHER_SALES_HEADER_FIELDS = [
  { name: "locationId", label: "Location ID", type: "select", options: LOCATION_IDS },
  { name: "salesInvoiceNo", label: "Sales Invoice No", auto: true },
  { name: "belongsTo", label: "Belongs to", type: "select", options: BELONGS_TO },
  { name: "vehicle", label: "Vehicle" },
  { name: "customerId", label: "Customer Code", type: "select", options: CUSTOMER_CODES },
  { name: "customerName", label: "Customer Name" },
  { name: "isIGSTAppl", label: "Is IGST Applicable", type: "select", options: YES_NO },
  { name: "gstnNo", label: "GSTN No." },
  { name: "timeOfIssue", label: "Time Of Issue", type: "time" },
  { name: "invoiceDate", label: "Invoice Date", type: "date" },
  { name: "invoiceType", label: "Invoice Type" },
  { name: "currency", label: "Currency", default: "RS", readOnly: true },
  { name: "diNo", label: "DI.No", type: "select", options: [] },
  { name: "diDate", label: "DI.Date", type: "date" },
  { name: "schNo", label: "Sch. No." },
  { name: "schDate", label: "Sch. Date", type: "date" },
  { name: "timeOfRemoval", label: "Time Of Removal", type: "time" },
  { name: "exchangeRate", label: "Exchange Rate", type: "number", readOnly: true },
  { name: "monthYear", label: "Month Year", type: "month" },
  { name: "kanbanCardNo", label: "Kanban Card No" },
  { name: "excisable", label: "Excisable ?", type: "select", options: YES_NO },
  { name: "subDocType", label: "Doc Type", type: "select", options: ["INVOICE", "REJECTION"] },
  { name: "stockPosting", label: "Stock Posting?", type: "select", options: YES_NO },
];

const REJECTION_HEADER_FIELDS = [
  { name: "locationId", label: "Location ID", type: "select", options: LOCATION_IDS },
  { name: "rejectionInvoiceNo", label: "Rejection Invoice No", auto: true },
  { name: "belongsTo", label: "Belongs to", type: "select", options: BELONGS_TO },
  { name: "vehicle", label: "Vehicle" },
  { name: "customerId", label: "Customer Code", type: "select", options: CUSTOMER_CODES },
  { name: "customerName", label: "Customer Name" },
  { name: "isIGSTAppl", label: "Is IGST Appl", type: "select", options: YES_NO },
  { name: "gstnNo", label: "GSTN No" },
  { name: "timeOfIssue", label: "Time Of Issue", type: "time" },
  { name: "invoiceDate", label: "Invoice Date", type: "date" },
  { name: "invoiceType", label: "Invoice Type" },
  { name: "currency", label: "Currency", default: "RS", readOnly: true },
  { name: "diNo", label: "DI.No", type: "select", options: [] },
  { name: "diDate", label: "DI.Date", type: "date" },
  { name: "schNo", label: "Sch. No." },
  { name: "schDate", label: "Sch. Date", type: "date" },
  { name: "timeOfRemoval", label: "Time Of Removal", type: "time" },
  { name: "exchangeRate", label: "Exchange Rate", type: "number", readOnly: true },
  { name: "monthYear", label: "Month Year", type: "month", readOnly: true },
  { name: "kanbanCardNo", label: "Kanban Card No" },
  { name: "refNo", label: "Ref No" },
  { name: "refDate", label: "Ref Date", type: "date" },
  { name: "excisable", label: "Excisable ?", type: "select", options: YES_NO },
  { name: "stockPosting", label: "Stock Posting?", type: "select", options: YES_NO },
  { name: "supplierInvNo", label: "Supplier_Inv_No" },
];

const INVOICE_ITEM_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: [] },
  { key: "itemDescription", label: "Item Description" },
  { key: "hsnSacCode", label: "HSN/SAC Code" },
  { key: "taxType", label: "Tax Type", type: "select", options: TAX_TYPES },
  { key: "taxPercent", label: "Tax (%)", type: "number" },
  { key: "customerPartNo", label: "Customer Part No." },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "stock", label: "Stock", type: "number" },
  { key: "soContractNo", label: "S.O. Contract No." },
  { key: "despQty", label: "Desp. Qty", type: "number" },
  { key: "rateInSelectedCurr", label: "Rate In Selected Curr.", type: "number" },
  { key: "sgstRate", label: "SGST Rate", type: "number" },
  { key: "sgstAmount", label: "SGST Amount", type: "number" },
  { key: "cgstRate", label: "CGST Rate", type: "number" },
  { key: "cgstAmount", label: "CGST Amount", type: "number" },
  { key: "igstRate", label: "IGST Rate", type: "number" },
  { key: "igstAmount", label: "IGST Amount", type: "number" },
];

const OTHER_SALES_ITEM_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: [] },
  { key: "hsnSacCode", label: "HSN_SAC_Code" },
  { key: "taxType", label: "Tax Type", type: "select", options: TAX_TYPES },
  { key: "taxPercent", label: "Tax (%)", type: "number" },
  { key: "itemDescription", label: "Item Description" },
  { key: "customerPartNo", label: "Customer Part No." },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "stock", label: "Stock", type: "number" },
  { key: "soContractNo", label: "S.O. Contract No." },
  { key: "despQty", label: "Desp. Qty", type: "number" },
  { key: "rateInSelectedCurr", label: "Rate In Selected Curr.", type: "number" },
  { key: "sgstRate", label: "SGST Rate", type: "number" },
  { key: "sgstAmount", label: "SGST Amount", type: "number" },
  { key: "cgstRate", label: "CGST Rate", type: "number" },
  { key: "cgstAmount", label: "CGST Amount", type: "number" },
  { key: "igstRate", label: "IGST Rate", type: "number" },
  { key: "igstAmount", label: "IGST Amtount", type: "number" },
];

const REJECTION_ITEM_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: [] },
  { key: "itemDescription", label: "Item Description" },
  { key: "hsnSacCode", label: "HSN/SAC Code" },
  { key: "taxType", label: "Tax Type", type: "select", options: TAX_TYPES },
  { key: "taxPercent", label: "Tax (%)", type: "number" },
  { key: "customerPartNo", label: "Customer Part No." },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "stock", label: "Stock", type: "number" },
  { key: "soContractNo", label: "S.O. Contract No." },
  { key: "despQty", label: "Desp. Qty", type: "number" },
  { key: "rateInSelectedCurr", label: "Rate In Selected Curr.", type: "number" },
  { key: "edPercent", label: "Ed%", type: "number" },
  { key: "sgstRate", label: "SGST Rate", type: "number" },
  { key: "sgstAmount", label: "SGST Amount", type: "number" },
  { key: "cgstRate", label: "CGST Rate", type: "number" },
  { key: "cgstAmount", label: "CGST Amount", type: "number" },
  { key: "igstRate", label: "IGST Rate", type: "number" },
  { key: "igstAmount", label: "IGST Amount", type: "number" },
];

const INVOICE_TAX_COLUMNS = [
  { key: "particulars", label: "Particulars" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "glAccountName", label: "GL Account Name" },
];

const OTHER_SALES_TAX_COLUMNS = [
  { key: "particulars", label: "Particulars" },
  { key: "acceptedQtyAmount", label: "Accepted Qty Amount", type: "number" },
  { key: "revisedAmount", label: "Revised Amount", type: "number" },
  { key: "glAccountName", label: "GL Account Name" },
];

const REJECTION_TAX_COLUMNS = [
  { key: "particulars", label: "Particulars" },
  { key: "acceptedQtyAmount", label: "Accepted Qty Amount", type: "number" },
  { key: "revisedAmount", label: "Revised Amount", type: "number" },
  { key: "glAccountName", label: "GL Account Name" },
  { key: "dbcr", label: "Db/Cr", type: "select", options: DEBIT_CREDIT },
  { key: "dbamt", label: "Db Amt", type: "number" },
  { key: "cramt", label: "Cr Amt", type: "number" },
];

const INVOICE_TERMS_FIELDS = [
  { name: "totalInsurance", label: "Total Insurance", type: "number" },
  { name: "totalFreight", label: "Total Freight", type: "number" },
  { name: "totalAssVal", label: "Total Ass. VaL", type: "number" },
  { name: "modeOfTransport", label: "Mode Of Transport", type: "select", options: MODE_OF_TRANSPORT },
  { name: "netAmount", label: "Net Amount", type: "number" },
  { name: "deliveryTo", label: "Delivery To" },
  { name: "tcsAmount", label: "TCS Amount", type: "number" },
  { name: "netWeight", label: "Net Weight", type: "number" },
  { name: "grossWeight", label: "Gross Weight", type: "number" },
  { name: "po", label: "Po" },
  { name: "poDate", label: "Po Date", type: "date" },
  { name: "paymentTerms", label: "Payment Terms" },
  { name: "amountInWords", label: "Amount In Words", type: "textarea", className: "col-span-2 md:col-span-4 xl:col-span-3" },
  { name: "narration", label: "Narration", type: "textarea", className: "col-span-2 md:col-span-4 xl:col-span-3" },
];

const OTHER_SALES_TERMS_FIELDS = [
  { name: "totalInsurance", label: "Total Insurance", type: "number" },
  { name: "totalFreight", label: "Total Freight", type: "number" },
  { name: "totalAssVal", label: "Total Ass. VaL", type: "number" },
  { name: "modeOfTransport", label: "Mode Of Transport", type: "select", options: MODE_OF_TRANSPORT },
  { name: "netAmount", label: "Net Amount", type: "number" },
  { name: "deliveryTo", label: "Delivery To" },
  { name: "paymentTerms", label: "Payment Terms" },
  { name: "po", label: "Po" },
  { name: "poDate", label: "Po Date", type: "date" },
  { name: "amountInWords", label: "Amount In Words", type: "textarea", className: "col-span-2 md:col-span-4 xl:col-span-3" },
  { name: "narration", label: "Narration", type: "textarea", className: "col-span-2 md:col-span-4 xl:col-span-3" },
];

const REJECTION_TERMS_FIELDS = OTHER_SALES_TERMS_FIELDS;

const INVOICE_SHIPPING_FIELDS = [
  { name: "customerId", label: "Customer Id", type: "select", options: CUSTOMER_CODES },
  { name: "customerName", label: "Customer Name" },
  { name: "customerCode", label: "Customer Code" },
  { name: "gstNo", label: "GST No" },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
  { name: "partyGstState", label: "Party Gst State", type: "select", options: GST_STATES },
  { name: "pincode", label: "Pincode" },
];

/* ---------------------------------------------------------------------------- */
/* Main Component                                                               */
/* ---------------------------------------------------------------------------- */

const SalesInvoiceForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH_ID = parseInt(localStorage.getItem("branchId"));
  const [saving, setSaving] = useState(false);
  const [plantData, setPlantData] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [dispatchNoDetails, setDispatchNoDetails] = useState([]);
  const [dispatchOptions, setDispatchOptions] = useState([]);
  const [loadingDispatch, setLoadingDispatch] = useState(false);
  const [isGeneratingDocId, setIsGeneratingDocId] = useState(false);
  const [loadingMonthYear, setLoadingMonthYear] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemDataMap, setItemDataMap] = useState({});
  const [itemCodeOptions, setItemCodeOptions] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});
  const [generalItemsLoaded, setGeneralItemsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Refs to prevent duplicate API calls
  const isFetchingCustomerRef = useRef(false);
  const lastSelectedCustomerRef = useRef(null);
  const lastGeneratedDocTypeRef = useRef(null);
  const lastFetchedCustomerRef = useRef(null);
  const lastFetchedSchNoRef = useRef(null);
  const lastFetchedDINoRef = useRef(null);
  const isDataLoadedRef = useRef(false);
  const lastFetchedDocTypeRef = useRef(null);

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
    defaultValues: editData || getDefaultValues(),
  });

  // Watch docType to conditionally render sections
  const docType = watch("docType");

  const isIGSTAppl = watch("invoiceHeader.isIGSTAppl") ||
    watch("otherSalesHeader.isIGSTAppl") ||
    watch("rejectionHeader.isIGSTAppl") || "NO";

  // Field arrays
  const invoiceItemsArray = useFieldArray({ control, name: "invoiceItems" });
  const invoiceTaxArray = useFieldArray({ control, name: "invoiceTaxDetails" });
  const otherSalesItemsArray = useFieldArray({ control, name: "otherSalesItems" });
  const otherSalesTaxArray = useFieldArray({ control, name: "otherSalesTaxDetails" });
  const rejectionItemsArray = useFieldArray({ control, name: "rejectionItems" });
  const rejectionTaxArray = useFieldArray({ control, name: "rejectionTaxDetails" });

  // Active tabs
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("itemDetails");
  const [activeOtherSalesTab, setActiveOtherSalesTab] = useState("itemDetails");
  const [activeRejectionTab, setActiveRejectionTab] = useState("itemDetails");

  const calculateTaxDetails = useCallback(() => {
    // Determine which items to use based on docType
    let items = [];
    let taxArrayName = "";
    let taxArray;

    if (docType === DOC_TYPE_INVOICE) {
      items = getValues("invoiceItems") || [];
      taxArrayName = "invoiceTaxDetails";
      taxArray = invoiceTaxArray;
    } else if (docType === DOC_TYPE_OTHER_SALES) {
      items = getValues("otherSalesItems") || [];
      taxArrayName = "otherSalesTaxDetails";
      taxArray = otherSalesTaxArray;
    } else if (docType === DOC_TYPE_REJECTION) {
      items = getValues("rejectionItems") || [];
      taxArrayName = "rejectionTaxDetails";
      taxArray = rejectionTaxArray;
    } else {
      return;
    }

    if (!items.length) {
      return;
    }

    const isIGST = isIGSTAppl === "YES";

    // Calculate totals
    let totalAmount = 0;
    let totalSGST = 0;
    let totalCGST = 0;
    let totalIGST = 0;

    items.forEach(item => {
      totalAmount += parseFloat(item.amountInRs) || 0;
      totalSGST += parseFloat(item.sgstAmount) || 0;
      totalCGST += parseFloat(item.cgstAmount) || 0;
      totalIGST += parseFloat(item.igstAmount) || 0;
    });

    // Get existing tax details
    const existingTaxDetails = getValues(taxArrayName) || [];
    const userAddedRows = existingTaxDetails.filter(item => !item.isSystemRow);

    // Build system rows
    const systemRows = [];

    systemRows.push({
      particulars: "Gross Amount",
      amount: totalAmount,
      isSystemRow: true,
      glAccountName: "",
      ...(taxArrayName === "rejectionTaxDetails" ? { acceptedQtyAmount: 0, revisedAmount: 0, dbcr: "", dbamt: 0, cramt: 0 } : {})
    });

    if (isIGST) {
      systemRows.push({
        particulars: "IGST",
        amount: totalIGST,
        isSystemRow: true,
        glAccountName: "",
        ...(taxArrayName === "rejectionTaxDetails" ? { acceptedQtyAmount: 0, revisedAmount: 0, dbcr: "", dbamt: 0, cramt: 0 } : {})
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        amount: totalSGST,
        isSystemRow: true,
        glAccountName: "",
        ...(taxArrayName === "rejectionTaxDetails" ? { acceptedQtyAmount: 0, revisedAmount: 0, dbcr: "", dbamt: 0, cramt: 0 } : {})
      });
      systemRows.push({
        particulars: "CGST",
        amount: totalCGST,
        isSystemRow: true,
        glAccountName: "",
        ...(taxArrayName === "rejectionTaxDetails" ? { acceptedQtyAmount: 0, revisedAmount: 0, dbcr: "", dbamt: 0, cramt: 0 } : {})
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];

    // Check if changed
    const currentRows = getValues(taxArrayName) || [];
    const hasChanged = JSON.stringify(currentRows) !== JSON.stringify(allTaxEntries);

    if (hasChanged) {
      taxArray.replace(allTaxEntries);
    }

    // Update terms
    if (docType === DOC_TYPE_INVOICE) {
      const grandTotal = totalAmount + totalSGST + totalCGST + totalIGST;
      setValue("invoiceTerms.netAmount", grandTotal.toFixed(2) || "");
      setValue("invoiceTerms.totalAssVal", totalAmount.toFixed(2) || "");
    } else if (docType === DOC_TYPE_OTHER_SALES) {
      const grandTotal = totalAmount + totalSGST + totalCGST + totalIGST;
      setValue("otherSalesTerms.netAmount", grandTotal.toFixed(2) || "");
      setValue("otherSalesTerms.totalAssVal", totalAmount.toFixed(2) || "");
    } else if (docType === DOC_TYPE_REJECTION) {
      const grandTotal = totalAmount + totalSGST + totalCGST + totalIGST;
      setValue("rejectionTerms.netAmount", grandTotal.toFixed(2) || "");
      setValue("rejectionTerms.totalAssVal", totalAmount.toFixed(2) || "");
    }
  }, [docType, getValues, setValue, isIGSTAppl, invoiceTaxArray, otherSalesTaxArray, rejectionTaxArray]);
  /* -------------------------------------------------------------------------- */
  /* List of Values Loading                                                     */
  /* -------------------------------------------------------------------------- */

  const loadListOfValuesData = useCallback(async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(group, ORG_ID);

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
  }, [ORG_ID]);

  /* -------------------------------------------------------------------------- */
  /* API Calls                                                                  */
  /* -------------------------------------------------------------------------- */

  const generateDocId = useCallback(async (docTypeValue) => {
    // Check for both editData.id AND editId
    if (editData?.id || editId) {
      return;
    }

    if (isGeneratingDocId) return;
    if (lastGeneratedDocTypeRef.current === docTypeValue) return;

    if (!docTypeValue) return;

    let apiDocType = "";
    if (docTypeValue === DOC_TYPE_INVOICE) {
      apiDocType = "Invoice";
    } else if (docTypeValue === DOC_TYPE_REJECTION) {
      apiDocType = "Rejection";
    } else if (docTypeValue === DOC_TYPE_OTHER_SALES) {
      apiDocType = "Other Sales Invoice";
    } else {
      return;
    }

    setIsGeneratingDocId(true);
    lastGeneratedDocTypeRef.current = docTypeValue;

    try {
      const financialYear = new Date().getFullYear().toString();
      const response = await salesInvoiceAPI.getSalesRejectionInvoiceDocId(
        ORG_ID,
        apiDocType,
        financialYear
      );

      if (response?.status && response?.paramObjectsMap?.invoiceDocId) {
        const docId = response.paramObjectsMap.invoiceDocId;

        if (docTypeValue === DOC_TYPE_INVOICE) {
          setValue("invoiceHeader.salesInvoiceNo", docId);
        } else if (docTypeValue === DOC_TYPE_REJECTION) {
          setValue("rejectionHeader.rejectionInvoiceNo", docId);
        } else if (docTypeValue === DOC_TYPE_OTHER_SALES) {
          setValue("otherSalesHeader.salesInvoiceNo", docId);
        }

        addToast(`Document ID generated: ${docId}`, "success");
      } else {
        const errorMsg = response?.paramObjectsMap?.message || "Failed to generate document ID";
        addToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("❌ Error generating document ID:", error);
    } finally {
      setIsGeneratingDocId(false);
    }
  }, [ORG_ID, editData, editId, setValue, addToast, isGeneratingDocId]);

  const fetchDespatchInstructions = useCallback(async (customerId) => {
    if (!customerId || !docType) {
      setDispatchOptions([]);
      setDispatchNoDetails([]);
      return;
    }

    if (loadingDispatch) return;
    if (lastFetchedCustomerRef.current === customerId && docType === lastFetchedDocTypeRef.current) return;

    setLoadingDispatch(true);
    lastFetchedCustomerRef.current = customerId;
    lastFetchedDocTypeRef.current = docType;

    try {
      let apiDocType = "";
      if (docType === DOC_TYPE_INVOICE) {
        apiDocType = "Invoice";
      } else if (docType === DOC_TYPE_REJECTION) {
        apiDocType = "Rejection";
      } else if (docType === DOC_TYPE_OTHER_SALES) {
        apiDocType = "Other Sales Invoice";
      } else {
        return;
      }

      const response = await salesInvoiceAPI.getDespatchInstructionDetails(
        ORG_ID,
        BRANCH_ID,
        customerId,
        apiDocType
      );

      if (response?.status && response?.paramObjectsMap?.despatchInstructions) {
        const instructions = response.paramObjectsMap.despatchInstructions;
        setDispatchNoDetails(instructions);

        const options = instructions.map((item, index) => ({
          value: item.despatchInstructionNo || item.id || index,
          label: item.despatchInstructionNo || "Unknown",
          data: item,
        }));
        setDispatchOptions(options);

        addToast(`Loaded ${options.length} despatch instruction(s)`, "success");
      } else {
        setDispatchOptions([]);
        setDispatchNoDetails([]);
        const errorMsg = response?.paramObjectsMap?.message || "No despatch instructions found";
        addToast(errorMsg, "info");
      }
    } catch (error) {
      console.error("❌ Error fetching despatch instructions:", error);
      setDispatchOptions([]);
      setDispatchNoDetails([]);
    } finally {
      setLoadingDispatch(false);
    }
  }, [ORG_ID, BRANCH_ID, docType, addToast, loadingDispatch]);

  const loadBranches = useCallback(async () => {
    setLoadingPlants(true);
    try {
      const response = await branchAPI.getBranchByOrgId(ORG_ID);
      const options = (response || []).map((branch) => ({
        value: branch.id,
        label: branch.branchName,
      }));
      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
      addToast("Failed to load plant data", "error");
    } finally {
      setLoadingPlants(false);
    }
  }, [ORG_ID, addToast]);

  const loadLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const response = await locationMasterAPI.getLocationMasterByOrgId(ORG_ID, BRANCH_ID);
      const options = (response || []).map((location) => ({
        value: location.id,
        label: location.locationName || location.locationCode || location.id,
      }));
      setLocationOptions(options);
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationOptions([]);
      addToast("Failed to load location data", "error");
    } finally {
      setLoadingLocations(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  const loadCustomers = useCallback(async () => {
    if (loadingCustomers) return;

    setLoadingCustomers(true);
    try {
      const response = await salesInvoiceAPI.getCustomerDetails(ORG_ID, BRANCH_ID);

      if (response?.status && response?.paramObjectsMap?.customerDetails) {
        const customers = response.paramObjectsMap.customerDetails;
        const options = customers.map((c) => ({
          value: c.customerId,
          label: `${c.customerCode} - ${c.customerName}`,
          customerName: c.customerName,
          customerCode: c.customerCode,
          gstNo: c.gstNo,
          partyGstState: c.gstState,
          isIGSTApplicable: c.igstApplicable ? "YES" : "NO",
          customerType: c.gstType,
          address: c.shippingAddress,
          city: c.shippingCity,
          pincode: c.shippingPincode,
        }));
        setCustomerOptions(options);
      } else {
        setCustomerOptions([]);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomerOptions([]);
      addToast("Failed to load customer data", "error");
    } finally {
      setLoadingCustomers(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast, loadingCustomers]);

  const loadItems = useCallback(async () => {
    if (generalItemsLoaded) return;
    if (loadingItems) return;

    setLoadingItems(true);
    try {
      const response = await salesInvoiceAPI.getItemMasterDetails(ORG_ID, BRANCH_ID);
      console.log("📦 General Items Response:", response);

      if (response?.status && response?.paramObjectsMap?.itemMasterVO) {
        const items = response.paramObjectsMap.itemMasterVO;

        const itemMap = {};
        const options = items.map((item) => {
          const code = item.id;
          itemMap[code] = item;
          return {
            value: code,
            label: item.itemCode || item.itemDescription || "Unknown"
          };
        });

        setItemCodeOptions(options);
        setItemDataMap(itemMap);
        setGeneralItemsLoaded(true);

        console.log("✅ General Items loaded:", options);
      } else {
        const errorMsg = response?.paramObjectsMap?.message || "Failed to load items";
        addToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("❌ Error loading items:", error);
      addToast("Failed to load items", "error");
    } finally {
      setLoadingItems(false);
    }
  }, [ORG_ID, BRANCH_ID, addToast, loadingItems, generalItemsLoaded]);

  const fetchMonthYear = useCallback(async (schNo) => {
    if (!schNo || !docType) {
      return;
    }

    if (loadingMonthYear) return;
    if (lastFetchedSchNoRef.current === schNo) return;

    setLoadingMonthYear(true);
    lastFetchedSchNoRef.current = schNo;

    try {
      if (docType !== DOC_TYPE_INVOICE && docType !== DOC_TYPE_REJECTION) {
        setLoadingMonthYear(false);
        return;
      }

      const response = await salesInvoiceAPI.getMonthYearForSalesRejectionInv(
        ORG_ID,
        BRANCH_ID,
        schNo
      );

      if (response?.status && response?.paramObjectsMap?.monthYearDetails) {
        const monthYearDetails = response.paramObjectsMap.monthYearDetails;

        if (monthYearDetails.length > 0) {
          let monthYear = monthYearDetails[0].monthYear || "";

          if (monthYear && monthYear.includes('-')) {
            const parts = monthYear.split('-');
            if (parts.length === 2) {
              const month = parts[0].padStart(2, '0');
              const year = parts[1];
              monthYear = `${year}-${month}`;
            }
          }

          const headerNames = ["invoiceHeader", "rejectionHeader"];
          headerNames.forEach((headerName) => {
            setValue(`${headerName}.monthYear`, monthYear);
          });

          addToast(`Month/Year loaded: ${monthYear}`, "success");
        } else {
          addToast("No month/year data found", "info");
        }
      } else {
        const errorMsg = response?.paramObjectsMap?.message || "Failed to fetch month/year";
        addToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("❌ Error fetching month/year:", error);
    } finally {
      setLoadingMonthYear(false);
    }
  }, [ORG_ID, BRANCH_ID, docType, setValue, addToast, loadingMonthYear]);

  const fetchItemDetails = useCallback(async (diNo) => {
    if (!diNo || !docType) {
      // If no DI.No, load general items
      await loadItems();
      return;
    }

    if (loadingItems) return;
    if (lastFetchedDINoRef.current === diNo) return;

    setLoadingItems(true);
    lastFetchedDINoRef.current = diNo;

    try {
      const response = await salesInvoiceAPI.getItemDetailsForSalesRejectionInvoice(
        ORG_ID,
        BRANCH_ID,
        diNo
      );

      console.log("📦 DI Item Details Response:", response);

      if (response?.status && response?.paramObjectsMap?.itemDetails) {
        const items = response.paramObjectsMap.itemDetails;

        const itemMap = {};
        const options = items.map((item) => {
          const code = item.itemCode || item.itemId;
          itemMap[code] = item;
          return {
            value: code,
            label: item.itemCode || item.itemDescription || "Unknown"
          };
        });

        setItemCodeOptions(options);
        setItemDataMap(itemMap);
        setGeneralItemsLoaded(false); // Reset flag since we're using DI-specific items

        if (items.length > 0) {
          let itemsArrayName;
          if (docType === DOC_TYPE_INVOICE) {
            itemsArrayName = "invoiceItems";
          } else if (docType === DOC_TYPE_OTHER_SALES) {
            itemsArrayName = "otherSalesItems";
          } else if (docType === DOC_TYPE_REJECTION) {
            itemsArrayName = "rejectionItems";
          } else {
            return;
          }

          const isIGST = isIGSTAppl === "YES";

          const mappedItems = items.map((item) => {
            const qty = parseFloat(item.despatchQty) || 0;
            const rate = parseFloat(item.newRate) || 0;
            const amount = qty * rate;

            let sgstRate = 0, cgstRate = 0, igstRate = 0;
            let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;

            if (isIGST) {
              igstRate = parseFloat(item.igst) || 0;
              igstAmount = (amount * igstRate) / 100;
            } else {
              sgstRate = parseFloat(item.sgst) || 0;
              cgstRate = parseFloat(item.cgst) || 0;
              sgstAmount = (amount * sgstRate) / 100;
              cgstAmount = (amount * cgstRate) / 100;
            }

            return {
              itemCode: item.itemCode || "",
              itemDescription: item.itemDescription || "",
              hsnSacCode: item.hsn || "",
              taxType: isIGST ? "IGST" : "SGST+CGST",
              taxPercent: isIGST ? igstRate : sgstRate,
              customerPartNo: item.customerPartNo || "",
              unit: item.unitId || item.unitMasterId || "",
              lastInvoicedDate: "",
              tariffNo: "",
              stock: "",
              soContractNo: item.salesOrderContractNo || "",
              despQty: item.despatchQty || "",
              noOfPackages: "",
              packageType: "",
              rateInSelectedCurr: item.newRate || "",
              amtInSelectedCurrency: amount || "",
              amountInRs: amount || "",
              sgstRate: sgstRate,
              sgstAmount: sgstAmount,
              cgstRate: cgstRate,
              cgstAmount: cgstAmount,
              igstRate: igstRate,
              igstAmount: igstAmount,
              edPercent: "",
            };
          });

          setValue(itemsArrayName, mappedItems);

          setTimeout(() => {
            calculateTaxDetails();
          }, 100);

          addToast(`Loaded ${mappedItems.length} item(s) for DI: ${diNo}`, "success");
        } else {
          let itemsArrayName;
          if (docType === DOC_TYPE_INVOICE) {
            itemsArrayName = "invoiceItems";
          } else if (docType === DOC_TYPE_OTHER_SALES) {
            itemsArrayName = "otherSalesItems";
          } else if (docType === DOC_TYPE_REJECTION) {
            itemsArrayName = "rejectionItems";
          } else {
            return;
          }
          setValue(itemsArrayName, []);
          setItemCodeOptions([]);
          setItemDataMap({});
          addToast("No items found for this dispatch instruction", "info");

          // Fallback to general items if DI items not found
          await loadItems();
        }
      } else {
        const errorMsg = response?.paramObjectsMap?.message || "Failed to fetch item details";
        addToast(errorMsg, "error");
        // Fallback to general items on error
        await loadItems();
      }
    } catch (error) {
      console.error("❌ Error fetching item details:", error);
      // Fallback to general items on error
      await loadItems();
    } finally {
      setLoadingItems(false);
    }
  }, [ORG_ID, BRANCH_ID, docType, setValue, addToast, loadingItems, isIGSTAppl, loadItems]);

  // Add this after your API call functions

  const loadEditData = useCallback(async () => {
    if (!editId) return;
    if (isDataLoadedRef.current) return;

    setLoading(true);
    try {
      const response = await salesInvoiceAPI.getSalesInvoiceById(editId);

      console.log("📥 Edit Data Response:", response);

      if (response?.status && response?.paramObjectsMap?.salesRejectionInvoice) {
        const data = response.paramObjectsMap.salesRejectionInvoice;

        // Map the API response to form structure
        const mappedData = mapApiDataToForm(data);

        // Reset the form with mapped data
        reset(mappedData);
        isDataLoadedRef.current = true;

        addToast("Invoice data loaded successfully", "success");

        // If there are items, populate the item data map
        const items = getItemsFromData(data);
        if (items.length > 0) {
          const map = {};
          const options = items.map((item) => {
            const code = item.item?.itemCode || item.itemCode;
            map[code] = {
              itemId: item.item?.id || item.itemId,
              itemCode: code,
              itemDescription: item.item?.itemDescription || item.itemDescription,
              hsn: item.hsnSacCode,
              unitId: item.unit?.unitId || item.unitId,
              unitMasterId: item.unit?.id || item.unitId,
              despatchQty: item.despatchQty,
              newRate: item.newRate,
              igst: item.igstRate,
              sgst: item.sgstRate,
              cgst: item.cgstRate,
              salesOrderContractNo: item.salesOrderContractNo,
            };
            return {
              value: code,
              label: code || item.itemDescription || "Unknown"
            };
          });
          setItemCodeOptions(options);
          setItemDataMap(map);
          setGeneralItemsLoaded(true);
        }

        // Set customer details if available
        if (data.customer) {
          const customer = {
            value: data.customer.customerId,
            customerName: data.customer.customerName,
            customerCode: data.customer.customerCode,
            gstNo: data.customer.gstNo,
            partyGstState: data.customer.gstState,
            isIGSTApplicable: data.igstAppl ? "YES" : "NO",
            customerType: data.customer.gstType,
            address: data.customer.shippingAddress,
            city: data.customer.shippingCity,
            pincode: data.customer.shippingPincode,
          };
          setCustomerDetails(customer);

          // Fetch dispatch instructions for this customer
          if (data.customer.customerId) {
            await fetchDespatchInstructions(data.customer.customerId);
          }
        }

        // Set dispatch options if dispatch instruction exists
        if (data.dispatchInstructionNo) {
          const dispatchOpt = {
            value: data.dispatchInstructionNo,
            label: data.dispatchInstructionNo,
            data: {
              despatchInstructionNo: data.dispatchInstructionNo,
              despatchInstructionDate: data.dispatchInstructionDate,
              scheduleNo: data.scheduleNo,
              scheduleDate: data.scheduleDate,
            }
          };
          setDispatchOptions([dispatchOpt]);
        }

        // Calculate tax details after data is loaded
        setTimeout(() => {
          calculateTaxDetails();
        }, 300);

      } else {
        const errorMsg = response?.paramObjectsMap?.message || "Failed to load invoice data";
        addToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("❌ Error loading edit data:", error);
      addToast("Failed to load invoice data", "error");
    } finally {
      setLoading(false);
    }
  }, [editId, reset, addToast, fetchDespatchInstructions, calculateTaxDetails]);

  /* -------------------------------------------------------------------------- */
  /* Customer Selection Handler                                                 */
  /* -------------------------------------------------------------------------- */

  const handleCustomerChange = useCallback(async (customerId) => {
    if (isFetchingCustomerRef.current) return;
    if (lastSelectedCustomerRef.current === customerId) return;

    if (!customerId) {
      setCustomerDetails(null);
      setGeneralItemsLoaded(false);
      lastSelectedCustomerRef.current = null;
      const headerNames = ["invoiceHeader", "otherSalesHeader", "rejectionHeader"];
      headerNames.forEach((headerName) => {
        setValue(`${headerName}.customerId`, "");
        setValue(`${headerName}.customerName`, "");
        setValue(`${headerName}.customerCode`, "");
        setValue(`${headerName}.gstnNo`, "");
        setValue(`${headerName}.partyGstState`, "");
        setValue(`${headerName}.isIGSTAppl`, "NO");
        setValue(`${headerName}.customerType`, "");
        setValue(`${headerName}.currency`, "");
        setValue(`${headerName}.currencyId`, ""); // Clear currency ID
        setValue(`${headerName}.exchangeRate`, "");
        setValue(`${headerName}.diNo`, "");
        setValue(`${headerName}.diDate`, "");
        setValue(`${headerName}.schNo`, "");
        setValue(`${headerName}.schDate`, "");
        if (docType === DOC_TYPE_INVOICE || docType === DOC_TYPE_REJECTION || docType === DOC_TYPE_OTHER_SALES) {
          setValue(`${headerName}.monthYear`, "");
        }
      });
      setValue("invoiceShipping.customerId", "");
      setValue("invoiceShipping.customerName", "");
      setValue("invoiceShipping.customerCode", "");
      setValue("invoiceShipping.gstNo", "");
      setValue("invoiceShipping.address", "");
      setValue("invoiceShipping.city", "");
      setValue("invoiceShipping.partyGstState", "");
      setValue("invoiceShipping.pincode", "");
      setDispatchOptions([]);
      setDispatchNoDetails([]);
      setItemCodeOptions([]);
      setItemDataMap({});
      if (docType === DOC_TYPE_INVOICE) {
        invoiceItemsArray.replace([]);
      } else if (docType === DOC_TYPE_OTHER_SALES) {
        otherSalesItemsArray.replace([]);
      } else if (docType === DOC_TYPE_REJECTION) {
        rejectionItemsArray.replace([]);
      }
      return;
    }

    isFetchingCustomerRef.current = true;
    lastSelectedCustomerRef.current = customerId;

    try {
      const selectedCustomer = customerOptions.find(
        (c) => String(c.value) === String(customerId)
      );

      if (selectedCustomer) {
        setCustomerDetails(selectedCustomer);

        const headerNames = ["invoiceHeader", "otherSalesHeader", "rejectionHeader"];
        headerNames.forEach((headerName) => {
          setValue(`${headerName}.customerId`, selectedCustomer.value);
          setValue(`${headerName}.customerName`, selectedCustomer.customerName || "");
          setValue(`${headerName}.customerCode`, selectedCustomer.customerCode || "");
          setValue(`${headerName}.gstnNo`, selectedCustomer.gstNo || "");
          setValue(`${headerName}.partyGstState`, selectedCustomer.partyGstState || "");
          setValue(`${headerName}.isIGSTAppl`, selectedCustomer.isIGSTApplicable || "NO");
          setValue(`${headerName}.customerType`, selectedCustomer.customerType || "");
        });

        setValue("invoiceShipping.customerId", selectedCustomer.value);
        setValue("invoiceShipping.customerName", selectedCustomer.customerName || "");
        setValue("invoiceShipping.customerCode", selectedCustomer.customerCode || "");
        setValue("invoiceShipping.gstNo", selectedCustomer.gstNo || "");
        setValue("invoiceShipping.address", selectedCustomer.address || "");
        setValue("invoiceShipping.city", selectedCustomer.city || "");
        setValue("invoiceShipping.partyGstState", selectedCustomer.partyGstState || "");
        setValue("invoiceShipping.pincode", selectedCustomer.pincode || "");

        try {
          const currencyResponse = await salesInvoiceAPI.getCurrencyDetails(ORG_ID, BRANCH_ID, customerId);
          console.log("Currency Details Response:", currencyResponse);

          if (currencyResponse?.status && currencyResponse?.paramObjectsMap?.currencyDetails) {
            const currencyData = currencyResponse.paramObjectsMap.currencyDetails[0];
            headerNames.forEach((headerName) => {
              // Store both the currency code and the currency ID
              setValue(`${headerName}.currency`, currencyData.currency || "RS");
              setValue(`${headerName}.currencyId`, currencyData.currencyId || 0); // Store the ID
              setValue(`${headerName}.exchangeRate`, currencyData.exchangeRate || "");
            });
            addToast("Currency details loaded successfully", "success");
          }
        } catch (currencyError) {
          console.error("Error fetching currency details:", currencyError);
        }

        await fetchDespatchInstructions(customerId);

        addToast("Customer details loaded successfully", "success");
      } else {
        addToast("Customer not found", "error");
      }
    } catch (error) {
      console.error("Error selecting customer:", error);
      addToast("Failed to load customer details", "error");
    } finally {
      isFetchingCustomerRef.current = false;
    }
  }, [customerOptions, setValue, addToast, ORG_ID, BRANCH_ID, fetchDespatchInstructions, docType]);

  const handleDispatchChange = useCallback((selectedValue) => {
    if (!selectedValue) {
      const headerNames = ["invoiceHeader", "otherSalesHeader", "rejectionHeader"];
      headerNames.forEach((headerName) => {
        setValue(`${headerName}.diNo`, "");
        setValue(`${headerName}.diDate`, "");
        setValue(`${headerName}.schNo`, "");
        setValue(`${headerName}.schDate`, "");
        if (docType === DOC_TYPE_INVOICE || docType === DOC_TYPE_REJECTION) {
          setValue(`${headerName}.monthYear`, "");
        }
      });
      // Load general items when DI is cleared
      loadItems();
      return;
    }

    const selected = dispatchOptions.find(opt => String(opt.value) === String(selectedValue));
    if (selected && selected.data) {
      const data = selected.data;

      const headerNames = ["invoiceHeader", "otherSalesHeader", "rejectionHeader"];
      headerNames.forEach((headerName) => {
        setValue(`${headerName}.diNo`, data.despatchInstructionNo || "");
        setValue(`${headerName}.diDate`, data.despatchInstructionDate || "");
        setValue(`${headerName}.schNo`, data.scheduleNo || "");
        setValue(`${headerName}.schDate`, data.scheduleDate || "");
      });

      if (data.scheduleNo) {
        fetchMonthYear(data.scheduleNo);
      }

      // Fetch DI-specific items if DI.No exists
      if (data.despatchInstructionNo) {
        fetchItemDetails(data.despatchInstructionNo);
      } else {
        // Otherwise load general items
        loadItems();
      }

      addToast(`Loaded despatch instruction: ${data.despatchInstructionNo}`, "success");
    }
  }, [dispatchOptions, setValue, addToast, docType, fetchMonthYear, fetchItemDetails, loadItems]);

  const handleItemCodeChange = useCallback((selectedValue, rowIndex, fieldPath) => {
    if (!selectedValue) {
      return;
    }

    const itemData = itemDataMap[selectedValue];
    if (!itemData) {
      console.log("No item data found for:", selectedValue);
      return;
    }

    let arrayName = "";
    if (fieldPath.includes("invoiceItems")) {
      arrayName = "invoiceItems";
    } else if (fieldPath.includes("otherSalesItems")) {
      arrayName = "otherSalesItems";
    } else if (fieldPath.includes("rejectionItems")) {
      arrayName = "rejectionItems";
    }

    if (!arrayName) {
      return;
    }

    const isIGST = isIGSTAppl === "YES";

    // Auto-fill fields
    setValue(`${arrayName}.${rowIndex}.itemDescription`, itemData.itemDescription || "");
    setValue(`${arrayName}.${rowIndex}.hsnSacCode`, itemData.hsn || "");
    setValue(`${arrayName}.${rowIndex}.unit`, itemData.unitId || "");
    setValue(`${arrayName}.${rowIndex}.soContractNo`, itemData.salesOrderContractNo || "");
    setValue(`${arrayName}.${rowIndex}.despQty`, itemData.despatchQty || "");
    setValue(`${arrayName}.${rowIndex}.rateInSelectedCurr`, itemData.newRate || "");

    // Calculate amounts
    const qty = parseFloat(itemData.despatchQty) || 0;
    const rate = parseFloat(itemData.newRate) || 0;
    const amount = qty * rate;
    setValue(`${arrayName}.${rowIndex}.amtInSelectedCurrency`, amount || "");
    setValue(`${arrayName}.${rowIndex}.amountInRs`, amount || "");

    // Set tax rates based on IGST applicability
    if (isIGST) {
      const igstRate = parseFloat(itemData.igst) || 0;
      const igstAmount = (amount * igstRate) / 100;
      setValue(`${arrayName}.${rowIndex}.igstRate`, igstRate);
      setValue(`${arrayName}.${rowIndex}.igstAmount`, igstAmount || "");
      setValue(`${arrayName}.${rowIndex}.sgstRate`, "");
      setValue(`${arrayName}.${rowIndex}.sgstAmount`, "");
      setValue(`${arrayName}.${rowIndex}.cgstRate`, "");
      setValue(`${arrayName}.${rowIndex}.cgstAmount`, "");
    } else {
      const sgstRate = parseFloat(itemData.sgst) || 0;
      const cgstRate = parseFloat(itemData.cgst) || 0;
      const sgstAmount = (amount * sgstRate) / 100;
      const cgstAmount = (amount * cgstRate) / 100;
      setValue(`${arrayName}.${rowIndex}.sgstRate`, sgstRate);
      setValue(`${arrayName}.${rowIndex}.sgstAmount`, sgstAmount || "");
      setValue(`${arrayName}.${rowIndex}.cgstRate`, cgstRate);
      setValue(`${arrayName}.${rowIndex}.cgstAmount`, cgstAmount || "");
      setValue(`${arrayName}.${rowIndex}.igstRate`, "");
      setValue(`${arrayName}.${rowIndex}.igstAmount`, "");
    }

    // Determine tax type
    let taxType = "";
    let taxPercent = 0;
    if (isIGST) {
      taxType = "IGST";
      taxPercent = parseFloat(itemData.igst) || 0;
    } else if (itemData.sgst > 0 && itemData.cgst > 0) {
      taxType = "SGST+CGST";
      taxPercent = parseFloat(itemData.sgst) || 0;
    }
    setValue(`${arrayName}.${rowIndex}.taxType`, taxType);
    setValue(`${arrayName}.${rowIndex}.taxPercent`, taxPercent);

    // Recalculate tax details
    setTimeout(() => {
      calculateTaxDetails();
    }, 100);

    addToast(`Item details loaded for: ${itemData.itemCode}`, "success");
  }, [itemDataMap, setValue, addToast, isIGSTAppl]);

  /* -------------------------------------------------------------------------- */
  /* Tax Details Calculation                                                    */
  /* -------------------------------------------------------------------------- */

  // Recalculate tax details when items change
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && (name.includes("Items") || name.includes("igstAmount") || name.includes("sgstAmount") || name.includes("cgstAmount"))) {
        setTimeout(() => {
          calculateTaxDetails();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, calculateTaxDetails]);

  /* -------------------------------------------------------------------------- */
  /* Helper Functions                                                           */
  /* -------------------------------------------------------------------------- */

  // Add this after your existing helper functions

  // Helper to extract items from API response
  const getItemsFromData = (data) => {
    return data.salesRejectionInvoiceDetails || [];
  };

  // Helper to map API response to form structure
  const mapApiDataToForm = (data) => {
    const baseForm = getDefaultValues();

    // Common fields
    baseForm.plant = data.branch?.id || "";
    baseForm.docType = data.docType || "Invoice";

    // Determine document type
    const isInvoice = data.docType === DOC_TYPE_INVOICE;
    const isRejection = data.docType === DOC_TYPE_REJECTION;
    const isOtherSales = data.docType === DOC_TYPE_OTHER_SALES;

    // Common header mapping
    const headerMapping = {
      locationId: data.location?.id || "",
      belongsTo: data.belongsTo || "",
      vehicle: data.vehicle || "",
      customerId: data.customer?.customerId || "",
      customerName: data.customer?.customerName || "",
      customerCode: data.customer?.customerCode || "",
      gstnNo: data.customer?.gstNo || "",
      partyGstState: data.customer?.gstState || "",
      isIGSTAppl: data.igstAppl ? "YES" : "NO",
      timeOfIssue: data.timeOfIssue || "",
      invoiceDate: data.docDate || "",
      dateOfIssue: data.dateOfIssue || "",
      dateOfRemoval: data.dateOfRemoval || "",
      timeOfRemoval: data.timeOfRemoval || "",
      currency: data.currency?.currencyName || "RS",
      currencyId: data.currency?.id || 0,
      exchangeRate: data.exchangeRate || "",
      monthYear: data.monthYear || "",
      kanbanCardNo: data.kanbanCardNo || "",
      excisable: data.excisable ? "YES" : "NO",
      stockPosting: data.stockPosting ? "YES" : "NO",
      diNo: data.dispatchInstructionNo || "",
      diDate: data.dispatchInstructionDate || "",
      schNo: data.scheduleNo || "",
      schDate: data.scheduleDate || "",
      refNo: data.refNo || "",
      refDate: data.refDate || "",
      supplierInvNo: data.supplierInvoiceNo || "",
    };

    // Map header based on document type
    if (isInvoice) {
      baseForm.invoiceHeader = {
        ...baseForm.invoiceHeader,
        ...headerMapping,
        salesInvoiceNo: data.docId || "",
        invoiceType: data.docType || "",
        subDocType: "INVOICE",
        pdiNo: data.pdiNo || "",
      };
    } else if (isRejection) {
      baseForm.rejectionHeader = {
        ...baseForm.rejectionHeader,
        ...headerMapping,
        rejectionInvoiceNo: data.docId || "",
        invoiceType: data.docType || "",
        subDocType: "REJECTION",
      };
    } else if (isOtherSales) {
      baseForm.otherSalesHeader = {
        ...baseForm.otherSalesHeader,
        ...headerMapping,
        salesInvoiceNo: data.docId || "",
        invoiceType: data.docType || "",
        subDocType: "INVOICE",
      };
    }

    // Map items
    const items = data.salesRejectionInvoiceDetails || [];
    const mappedItems = items.map((item) => {
      const isIGST = data.igstAppl;

      return {
        itemCode: item.item?.itemCode || item.itemCode || "",
        itemDescription: item.item?.itemDescription || item.itemDescription || "",
        hsnSacCode: item.hsnSacCode || "",
        taxType: item.taxType || (isIGST ? "IGST" : "SGST+CGST"),
        taxPercent: item.taxPercentage || 0,
        customerPartNo: item.customerPartNo || "",
        unit: item.unit?.unitId || item.unitId || "",
        stock: item.stock || "",
        soContractNo: item.salesOrderContractNo || "",
        despQty: item.despatchQty || "",
        noOfPackages: item.noOfPackages || "",
        packageType: item.packageType || "",
        rateInSelectedCurr: item.newRate || "",
        amtInSelectedCurrency: item.amountInSelectedCurrency || "",
        amountInRs: item.amountInRs || "",
        sgstRate: item.sgstRate || 0,
        sgstAmount: item.sgstAmount || 0,
        cgstRate: item.cgstRate || 0,
        cgstAmount: item.cgstAmount || 0,
        igstRate: item.igstRate || 0,
        igstAmount: item.igstAmount || 0,
        edPercent: item.edPercent || "",
      };
    });

    // Assign items to the correct array
    if (isInvoice) {
      baseForm.invoiceItems = mappedItems.length > 0 ? mappedItems : baseForm.invoiceItems;
    } else if (isRejection) {
      baseForm.rejectionItems = mappedItems.length > 0 ? mappedItems : baseForm.rejectionItems;
    } else if (isOtherSales) {
      baseForm.otherSalesItems = mappedItems.length > 0 ? mappedItems : baseForm.otherSalesItems;
    }

    // Map tax details
    const taxDetails = data.salesRejectionInvoiceTaxDetails || [];
    const mappedTaxDetails = taxDetails.map((tax) => ({
      particulars: tax.particulars?.description || tax.particulars || "",
      amount: tax.amount || 0,
      acceptedQtyAmount: tax.acceptedQtyAmount || 0,
      revisedAmount: tax.revisedAmount || 0,
      glAccountName: tax.glAccountName || "",
      dbcr: tax.dbcr || "",
      dbamt: tax.dbamt || 0,
      cramt: tax.cramt || 0,
      isSystemRow: true,
    }));

    // Assign tax details to the correct array
    if (isInvoice) {
      baseForm.invoiceTaxDetails = mappedTaxDetails.length > 0 ? mappedTaxDetails : baseForm.invoiceTaxDetails;
    } else if (isRejection) {
      baseForm.rejectionTaxDetails = mappedTaxDetails.length > 0 ? mappedTaxDetails : baseForm.rejectionTaxDetails;
    } else if (isOtherSales) {
      baseForm.otherSalesTaxDetails = mappedTaxDetails.length > 0 ? mappedTaxDetails : baseForm.otherSalesTaxDetails;
    }

    // Map terms
    const termsMapping = {
      totalInsurance: data.totalInsurance || "",
      totalFreight: data.totalFreight || "",
      totalAssVal: data.totalAssVal || "",
      modeOfTransport: data.modeOfTransport || "",
      netAmount: data.netAmount || "",
      deliveryTo: data.deliveryTo || "",
      paymentTerms: data.paymentTerms || "",
      po: data.purchaseOrder || "",
      poDate: data.purchaseOrderDate || "",
      amountInWords: data.amountInWords || "",
      narration: data.narration || "",
      tcsAmount: data.tcsAmount || "",
      netWeight: data.netWeight || "",
      grossWeight: data.grossWeight || "",
    };

    if (isInvoice) {
      baseForm.invoiceTerms = { ...baseForm.invoiceTerms, ...termsMapping };
    } else if (isRejection) {
      baseForm.rejectionTerms = { ...baseForm.rejectionTerms, ...termsMapping };
    } else if (isOtherSales) {
      baseForm.otherSalesTerms = { ...baseForm.otherSalesTerms, ...termsMapping };
    }

    // Map shipping details (only for Invoice)
    if (isInvoice && data.customer) {
      baseForm.invoiceShipping = {
        customerId: data.customer.customerId || "",
        customerName: data.customer.customerName || "",
        customerCode: data.customer.customerCode || "",
        gstNo: data.customer.gstNo || "",
        address: data.customer.shippingAddress || "",
        city: data.customer.shippingCity || "",
        partyGstState: data.customer.gstState || "",
        pincode: data.customer.shippingPincode || "",
      };
    }

    return baseForm;
  };

  const getActiveTabConfig = () => {
    if (docType === DOC_TYPE_INVOICE) {
      return {
        tabs: [
          { key: "itemDetails", label: "Item Details" },
          { key: "taxDetails", label: "Tax Details" },
          { key: "termsConditions", label: "Terms And Conditions" },
          { key: "shippingDetails", label: "Shipping Details" },
        ],
        activeTab: activeInvoiceTab,
        setActiveTab: setActiveInvoiceTab,
        itemsArray: invoiceItemsArray,
        itemsArrayName: "invoiceItems",
        taxArray: invoiceTaxArray,
        taxArrayName: "invoiceTaxDetails",
        itemColumns: INVOICE_ITEM_COLUMNS,
        taxColumns: INVOICE_TAX_COLUMNS,
        termsFields: INVOICE_TERMS_FIELDS,
        termsName: "invoiceTerms",
        shippingFields: INVOICE_SHIPPING_FIELDS,
        shippingName: "invoiceShipping",
        hasShipping: true,
      };
    } else if (docType === DOC_TYPE_OTHER_SALES) {
      return {
        tabs: [
          { key: "itemDetails", label: "1-Item Details" },
          { key: "taxDetails", label: "2-Tax Details" },
          { key: "termsConditions", label: "3-Terms And Conditions" },
        ],
        activeTab: activeOtherSalesTab,
        setActiveTab: setActiveOtherSalesTab,
        itemsArray: otherSalesItemsArray,
        itemsArrayName: "otherSalesItems",
        taxArray: otherSalesTaxArray,
        taxArrayName: "otherSalesTaxDetails",
        itemColumns: OTHER_SALES_ITEM_COLUMNS,
        taxColumns: OTHER_SALES_TAX_COLUMNS,
        termsFields: OTHER_SALES_TERMS_FIELDS,
        termsName: "otherSalesTerms",
        shippingFields: null,
        shippingName: null,
        hasShipping: false,
      };
    } else if (docType === DOC_TYPE_REJECTION) {
      return {
        tabs: [
          { key: "itemDetails", label: "1-Item Details" },
          { key: "taxDetails", label: "2-Tax Details" },
          { key: "termsConditions", label: "3-Terms And Conditions" },
        ],
        activeTab: activeRejectionTab,
        setActiveTab: setActiveRejectionTab,
        itemsArray: rejectionItemsArray,
        itemsArrayName: "rejectionItems",
        taxArray: rejectionTaxArray,
        taxArrayName: "rejectionTaxDetails",
        itemColumns: REJECTION_ITEM_COLUMNS,
        taxColumns: REJECTION_TAX_COLUMNS,
        termsFields: REJECTION_TERMS_FIELDS,
        termsName: "rejectionTerms",
        shippingFields: null,
        shippingName: null,
        hasShipping: false,
      };
    }
    return null;
  };

  const getHeaderFields = () => {
    if (docType === DOC_TYPE_INVOICE) {
      return { fields: INVOICE_HEADER_FIELDS, name: "invoiceHeader" };
    } else if (docType === DOC_TYPE_OTHER_SALES) {
      return { fields: OTHER_SALES_HEADER_FIELDS, name: "otherSalesHeader" };
    } else if (docType === DOC_TYPE_REJECTION) {
      return { fields: REJECTION_HEADER_FIELDS, name: "rejectionHeader" };
    }
    return { fields: [], name: "" };
  };

  const blankRowFromColumns = (columns) =>
    columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

  const getSectionName = () => {
    if (docType === DOC_TYPE_INVOICE) return "D.C. Cum Invoice";
    if (docType === DOC_TYPE_OTHER_SALES) return "Other Sales Invoice";
    if (docType === DOC_TYPE_REJECTION) return "Rejection Invoice";
    return "";
  };

  /* -------------------------------------------------------------------------- */
  /* Handlers                                                                   */
  /* -------------------------------------------------------------------------- */

  const handleAddRow = (arrayName) => {
    const config = getActiveTabConfig();
    if (!config) return;

    if (arrayName === "items") {
      const newItem = blankRowFromColumns(config.itemColumns);
      config.itemsArray.append(newItem);
    } else if (arrayName === "tax") {
      const newItem = blankRowFromColumns(config.taxColumns);
      config.taxArray.append(newItem);
    }
  };

  const handleRemoveRow = (arrayName, index) => {
    const config = getActiveTabConfig();
    if (!config) return;

    if (arrayName === "items") {
      if (config.itemsArray.fields.length > 1) {
        config.itemsArray.remove(index);
        setTimeout(() => {
          calculateTaxDetails();
        }, 100);
      }
    } else if (arrayName === "tax") {
      if (config.taxArray.fields.length > 1) {
        config.taxArray.remove(index);
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Validation                                                                 */
  /* -------------------------------------------------------------------------- */

  const validate = (data) => {
    const errors = {};

    if (!data.plant) errors.plant = "Plant Id is required";
    if (!data.docType) errors.docType = "Doc Type is required";

    const header = data.invoiceHeader || data.otherSalesHeader || data.rejectionHeader;
    if (!header?.invoiceDate) {
      errors.invoiceDate = "Invoice Date is required";
    }

    return errors;
  };

  /* -------------------------------------------------------------------------- */
  /* Submit                                                                     */
  /* -------------------------------------------------------------------------- */

  const onSubmit = async (formData) => {
    setSaving(true);

    try {
      // Helper function to format date
      const formatDateForAPI = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch (e) {
          return "";
        }
      };

      // Helper to parse boolean values
      const parseBoolean = (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toUpperCase() === 'YES' || value === 'true';
        }
        return false;
      };

      // Get the appropriate header based on docType
      let header = {};
      let items = [];
      let taxDetails = [];
      let terms = {};
      let shipping = {};

      if (formData.docType === DOC_TYPE_INVOICE) {
        header = formData.invoiceHeader || {};
        items = formData.invoiceItems || [];
        taxDetails = formData.invoiceTaxDetails || [];
        terms = formData.invoiceTerms || {};
        shipping = formData.invoiceShipping || {};
      } else if (formData.docType === DOC_TYPE_OTHER_SALES) {
        header = formData.otherSalesHeader || {};
        items = formData.otherSalesItems || [];
        taxDetails = formData.otherSalesTaxDetails || [];
        terms = formData.otherSalesTerms || {};
      } else if (formData.docType === DOC_TYPE_REJECTION) {
        header = formData.rejectionHeader || {};
        items = formData.rejectionItems || [];
        taxDetails = formData.rejectionTaxDetails || [];
        terms = formData.rejectionTerms || {};
      }

      // ============================================================
      // STEM 1 & 2: Map items to the API format with item ID and unit ID
      // ============================================================
      const mappedItems = items
        .filter(item => item.itemCode && item.itemCode.trim())
        .map(item => {
          const isIGST = header.isIGSTAppl === "YES";

          // STEM 3: Get the actual item ID from the itemDataMap
          const itemData = itemDataMap[item.itemCode];
          const itemId = itemData?.itemId || itemData?.id || 0;

          // STEM 4: Get the actual unit ID from the itemDataMap
          const unitId = itemData?.unitMasterId || 0;

          return {
            cgstRate: isIGST ? 0 : (parseFloat(item.cgstRate) || 0),
            customerPartNo: item.customerPartNo || "",
            despatchQty: parseFloat(item.despQty) || 0,
            hsnSacCode: item.hsnSacCode || "",
            igstRate: isIGST ? (parseFloat(item.igstRate) || 0) : 0,
            // STEM 3: Use the actual item ID here
            item: itemId,
            newRate: parseFloat(item.rateInSelectedCurr) || 0,
            salesOrderContractNo: item.soContractNo || "",
            sgstRate: isIGST ? 0 : (parseFloat(item.sgstRate) || 0),
            stock: item.stock || "",
            taxPercentage: parseFloat(item.taxPercent) || 0,
            taxType: item.taxType || "",
            // STEM 4: Use the actual unit ID here
            unit: Number(unitId),
          };
        });

      // ============================================================
      // STEM 5: Map tax details with particulars ID from List of Values
      // ============================================================
      const mappedTaxDetails = taxDetails
        .filter(tax => tax.particulars && tax.particulars.trim())
        .map(tax => {
          // Find the particulars ID from the List of Values data
          const particularsOptions = listOfValuesData.PARTICULARS || [];
          const found = particularsOptions.find(opt => opt.label === tax.particulars);
          const particularsId = found?.value || 0;

          return {
            acceptedQtyAmount: parseFloat(tax.acceptedQtyAmount) || 0,
            amount: parseFloat(tax.amount) || 0,
            glAccountName: tax.glAccountName || "",
            // STEM 5: Use the particulars ID here
            particulars: Number(particularsId),
            revisedAmount: parseFloat(tax.revisedAmount) || 0,
          };
        });

      // Build the payload
      const payload = {
        active: true,
        amountInWords: terms.amountInWords || "",
        belongsTo: header.belongsTo ? parseInt(header.belongsTo) : 0,
        branch: BRANCH_ID,
        cancelRemarks: "",
        createdBy: localStorage.getItem("userName") || "SYSTEM",
        currency: header.currencyId ? parseInt(header.currencyId) : 0,
        customer: header.customerId ? parseInt(header.customerId) : 0,
        dateOfIssue: header.dateOfIssue || "",
        dateOfRemoval: header.dateOfRemoval || "",
        deliveryTo: terms.deliveryTo || "",
        dispatchInstructionDate: header.diDate || "",
        dispatchInstructionNo: header.diNo || "",
        docType: formData.docType || "",
        exchangeRate: String(header.exchangeRate) || "",
        excisable: parseBoolean(header.excisable),
        financialYear: new Date().getFullYear().toString(),
        grossWeight: parseFloat(terms.grossWeight) || 0,
        igstApplicable: header.isIGSTAppl === "YES",
        kanbanCardNo: header.kanbanCardNo || "",
        location: header.locationId ? parseInt(header.locationId) : 0,
        modeOfTransport: terms.modeOfTransport || "",
        monthYear: header.monthYear || "",
        narration: terms.narration || "",
        netAmount: parseFloat(terms.netAmount) || 0,
        netWeight: parseFloat(terms.netWeight) || 0,
        orgId: ORG_ID,
        paymentTerms: terms.paymentTerms || "",
        purchaseOrder: terms.po || "",
        purchaseOrderDate: formatDateForAPI(terms.poDate),
        refDate: header.refDate || "",
        refNo: header.refNo || "",
        scheduleDate: header.schDate || "",
        scheduleNo: header.schNo || "",
        stockPosting: parseBoolean(header.stockPosting),
        supplierInvoiceNo: header.supplierInvNo || "",
        tcsAmount: parseFloat(terms.tcsAmount) || 0,
        timeOfIssue: header.timeOfIssue || "",
        timeOfRemoval: header.timeOfRemoval || "",
        totalAssVal: parseFloat(terms.totalAssVal) || 0,
        totalFreight: parseFloat(terms.totalFreight) || 0,
        totalInsurance: parseFloat(terms.totalInsurance) || 0,
        vehicle: header.vehicle || "",
        salesRejectionInvoiceDetailsDTO: mappedItems,
        salesRejectionInvoiceTaxDetailsDTO: mappedTaxDetails,
      };

      // In the onSubmit function, add the ID if editing
      if (editId) {
        payload.id = parseInt(editId);
      } else if (editData?.id) {
        payload.id = editData.id;
      }

      // Remove empty or default fields to clean up the payload
      Object.keys(payload).forEach(key => {
        if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
        if (Array.isArray(payload[key]) && payload[key].length === 0) {
          delete payload[key];
        }
      });

      console.log("📤 Saving Sales Invoice Payload:", payload);

      const response = await salesInvoiceAPI.createUpdateSalesInvoice(payload);

      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        addToast(
          editData ? "Sales invoice updated successfully" : "Sales invoice created successfully",
          "success"
        );
        if (onSave) onSave(payload);
        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save sales invoice";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      let errorMessage = "Failed to save Sales Invoice.";
      if (error.response?.data) {
        errorMessage = error.response.data.message ||
          error.response.data.statusMessage ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      addToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Effects                                                                    */
  /* -------------------------------------------------------------------------- */

  // Load edit data if editId is provided
  useEffect(() => {
    if (editId) {
      loadEditData();
    } else if (editData) {
      reset(editData);
    }
  }, [editId, editData, loadEditData, reset]);

  useEffect(() => {
    if (!editData?.id && !editId && docType) {
      generateDocId(docType);
    }
  }, [docType, editData?.id, editId, generateDocId]);

  useEffect(() => {
    loadBranches();
    loadLocations();
    loadCustomers();
    loadListOfValuesData();
    if (!editId) {
      loadItems();
    }
  }, []);

  useEffect(() => {
    if (!editData?.id && docType) {
      generateDocId(docType);
    }
  }, [docType, editData?.id, generateDocId]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.includes('schNo')) {
        const schNo = value.invoiceHeader?.schNo ||
          value.otherSalesHeader?.schNo ||
          value.rejectionHeader?.schNo;

        if (schNo && (docType === DOC_TYPE_INVOICE || docType === DOC_TYPE_REJECTION || docType === DOC_TYPE_OTHER_SALES)) {
          fetchMonthYear(schNo);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, docType, fetchMonthYear]);

  // Auto-populate date/time fields
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10);
    const currentTimeStr = now.toTimeString().slice(0, 5);

    const headerNames = ["invoiceHeader", "otherSalesHeader", "rejectionHeader"];
    headerNames.forEach((headerName) => {
      const currentValues = getValues(headerName);
      if (currentValues) {
        if (!currentValues.timeOfIssue) {
          setValue(`${headerName}.timeOfIssue`, currentTimeStr);
        }
        if (!currentValues.timeOfRemoval) {
          setValue(`${headerName}.timeOfRemoval`, currentTimeStr);
        }
        if (currentValues.dateOfIssue !== undefined && !currentValues.dateOfIssue) {
          setValue(`${headerName}.dateOfIssue`, currentDate);
        }
        if (currentValues.dateOfRemoval !== undefined && !currentValues.dateOfRemoval) {
          setValue(`${headerName}.dateOfRemoval`, currentDate);
        }
      }
    });
  }, [docType, setValue, getValues]);

  /* -------------------------------------------------------------------------- */
  /* Render Helpers                                                             */
  /* -------------------------------------------------------------------------- */

  const renderFieldsGrid = (fields, sectionName) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start">
        {fields.map((field) => {
          if (field.hidden) {
            return null;
          }

          const fieldPath = `${sectionName}.${field.name}`;
          const isAuto = field.auto || false;

          if (field.name === "customerId") {
            return (
              <SelectField
                key={field.name}
                control={control}
                name={fieldPath}
                label={field.label}
                options={customerOptions}
                required={field.required}
                errors={errors}
                auto={isAuto}
                disabled={loadingCustomers}
                onChange={handleCustomerChange}
                placeholder="-- Select Customer --"
              />
            );
          }

          if (field.name === "diNo" && field.type === "select") {
            return (
              <SelectField
                key={field.name}
                control={control}
                name={fieldPath}
                label={field.label}
                options={dispatchOptions}
                required={field.required}
                errors={errors}
                disabled={loadingDispatch || !customerDetails}
                onChange={handleDispatchChange}
                placeholder={loadingDispatch ? "Loading..." : "Select DI.No"}
              />
            );
          }

          if (field.name === "locationId") {
            return (
              <SelectField
                key={field.name}
                control={control}
                name={fieldPath}
                label={field.label}
                options={locationOptions}
                required={field.required}
                errors={errors}
                auto={isAuto}
                disabled={loadingLocations}
                placeholder="-- Select Location --"
              />
            );
          }

          const autoFillFields = ["diDate", "schNo", "schDate"];
          const isAutoFill = autoFillFields.includes(field.name);

          if (isAuto) {
            return (
              <InputField
                key={field.name}
                control={control}
                name={fieldPath}
                label={field.label}
                type={field.type || "text"}
                required={field.required}
                errors={errors}
                auto={isAuto}
                disabled={isGeneratingDocId}
                readOnly={true}
                placeholder={isGeneratingDocId ? "Generating..." : "Auto"}
              />
            );
          }

          if (field.type === "textarea") {
            return (
              <TextareaField
                key={field.name}
                control={control}
                name={fieldPath}
                label={field.label}
                required={field.required}
                errors={errors}
                className={field.className || "col-span-2 md:col-span-4 xl:col-span-3"}
                rows={3}
              />
            );
          }

          if (field.type === "select") {
            return (
              <SelectField
                key={field.name}
                control={control}
                name={fieldPath}
                label={field.label}
                options={field.options || []}
                required={field.required}
                errors={errors}
                auto={isAuto}
              />
            );
          }

          const readOnlyFields = ["customerName", "customerCode", "gstnNo", "partyGstState", "isIGSTAppl", "customerType", "currency", "exchangeRate", "monthYear", "timeOfIssue", "timeOfRemoval", "dateOfIssue", "dateOfRemoval"];
          const isReadOnly = readOnlyFields.includes(field.name) || field.readOnly || isAutoFill;

          return (
            <InputField
              key={field.name}
              control={control}
              name={fieldPath}
              label={field.label}
              type={field.type || "text"}
              required={field.required}
              errors={errors}
              auto={isAuto}
              readOnly={isReadOnly}
            />
          );
        })}
      </div>
    );
  };

  const renderTable = (columns, rowsArray, arrayName, isTax = false) => {
    let dynamicColumns = columns.map((col) => {
      if (col.key === "itemCode") {
        return { ...col, options: itemCodeOptions };
      }
      return col;
    });

    // Conditionally filter tax columns based on IGST applicability
    if ((docType === DOC_TYPE_INVOICE || docType === DOC_TYPE_REJECTION) && !isTax) {
      const isIGST = isIGSTAppl === "YES";
      const sgstColumns = ["sgstRate", "sgstAmount", "cgstRate", "cgstAmount"];
      const igstColumns = ["igstRate", "igstAmount"];

      if (isIGST) {
        dynamicColumns = dynamicColumns.filter(col => !sgstColumns.includes(col.key));
      } else {
        dynamicColumns = dynamicColumns.filter(col => !igstColumns.includes(col.key));
      }
    }

    const headers = ["#", ...dynamicColumns.map((c) => c.label), "Action"];

    return (
      <TableWrapper>
        <TableHead headers={headers} />
        <tbody>
          {rowsArray.fields.map((field, index) => {
            const fieldPath = `${arrayName}.${index}`;

            return (
              <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3 text-center font-medium dark:text-white text-[10px] w-12">
                  {index + 1}
                </td>
                {dynamicColumns.map((col) => {
                  const fullFieldPath = `${fieldPath}.${col.key}`;
                  if (col.type === "select") {
                    return (
                      <SelectCell
                        key={col.key}
                        control={control}
                        name={fullFieldPath}
                        options={col.options || []}
                        required={col.required}
                        errors={errors}
                        onChange={(value) => {
                          if (col.key === "itemCode") {
                            handleItemCodeChange(value, index, fullFieldPath);
                          }
                        }}
                      />
                    );
                  }
                  return (
                    <InputCell
                      key={col.key}
                      control={control}
                      name={fullFieldPath}
                      type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                      step={col.type === "number" ? "0.01" : undefined}
                      placeholder={col.label}
                      required={col.required}
                      errors={errors}
                    />
                  );
                })}
                <td className="p-3 text-center w-16">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(isTax ? "tax" : "items", index)}
                    disabled={rowsArray.fields.length <= 1}
                    className={`h-7 w-7 rounded text-white flex items-center justify-center ${rowsArray.fields.length <= 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                      }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrapper>
    );
  };

  // Tax Details render with List of Values for particulars
  const renderTaxDetailsTable = (columns, rowsArray, arrayName, isTax = true) => {
    // Get options for particulars from List of Values
    const particularsOptions = listOfValuesData.PARTICULARS || [];

    // Get system option labels
    const systemOptionLabels = ['Gross Amount', 'IGST', 'CGST', 'SGST'];

    const dynamicColumns = columns.map((col) => {
      if (col.key === "particulars") {
        return { ...col, options: particularsOptions };
      }
      return col;
    });

    const headers = ["#", ...dynamicColumns.map((c) => c.label), "Action"];

    return (
      <TableWrapper>
        <TableHead headers={headers} />
        <tbody>
          {rowsArray.fields.map((field, index) => {
            const fieldPath = `${arrayName}.${index}`;
            const isSystemRow = getValues(`${arrayName}.${index}.isSystemRow`);
            const particulars = getValues(`${arrayName}.${index}.particulars`);
            const isReadOnly = isSystemRow || systemOptionLabels.includes(particulars);

            // For system rows, only show their specific value
            let availableOptions = [];
            if (isSystemRow) {
              availableOptions = [{ label: particulars, value: particulars }];
            } else {
              availableOptions = particularsOptions.filter(option =>
                !systemOptionLabels.includes(option.label)
              );
            }

            return (
              <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3 text-center font-medium dark:text-white text-[10px] w-12">
                  {index + 1}
                </td>
                {dynamicColumns.map((col) => {
                  const fullFieldPath = `${fieldPath}.${col.key}`;
                  if (col.key === "particulars") {
                    return (
                      <td key={col.key} className="p-2 align-top min-w-[150px]">
                        <Controller
                          name={fullFieldPath}
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
                    );
                  }
                  return (
                    <InputCell
                      key={col.key}
                      control={control}
                      name={fullFieldPath}
                      type={col.type === "number" ? "number" : "text"}
                      step={col.type === "number" ? "0.01" : undefined}
                      placeholder={col.label}
                      required={col.required}
                      errors={errors}
                      readOnly={isReadOnly || col.key === "isSystemRow"}
                    />
                  );
                })}
                <td className="p-3 text-center w-16">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow("tax", index)}
                    disabled={rowsArray.fields.length <= 1 || isSystemRow}
                    className={`h-7 w-7 rounded text-white flex items-center justify-center ${rowsArray.fields.length <= 1 || isSystemRow
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                      }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableWrapper>
    );
  };

  const renderChildTabs = () => {
    const config = getActiveTabConfig();
    if (!config) return null;

    const {
      tabs,
      activeTab,
      setActiveTab,
      itemsArray,
      itemsArrayName,
      taxArray,
      taxArrayName,
      itemColumns,
      taxColumns,
      termsFields,
      termsName,
      shippingFields,
      shippingName,
      hasShipping
    } = config;

    const showItemDetails = activeTab === "itemDetails";
    const showTaxDetails = activeTab === "taxDetails";
    const showTerms = activeTab === "termsConditions";
    const showShipping = activeTab === "shippingDetails";

    return (
      <section className="mt-2 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-3">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors ${activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(showItemDetails || showTaxDetails) && (
            <button
              type="button"
              onClick={() => handleAddRow(showItemDetails ? "items" : "tax")}
              className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="mt-3">
          {showItemDetails && (
            <>
              {loadingItems ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">Loading items...</div>
                </div>
              ) : (
                renderTable(itemColumns, itemsArray, itemsArrayName, false)
              )}
            </>
          )}
          {showTaxDetails && renderTaxDetailsTable(taxColumns, taxArray, taxArrayName, true)}
        </div>

        {showTerms && (
          <div className="pt-4">
            {renderFieldsGrid(termsFields, termsName)}
          </div>
        )}

        {showShipping && hasShipping && shippingFields && (
          <div className="pt-4">
            {renderFieldsGrid(shippingFields, shippingName)}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="p-2 max-w-7xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading invoice data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={onBack}
              className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit Sales Invoice" : "Sales Invoice"}
            </h2>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
            {/* Common Fields */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Sales Invoice Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start">
                <SelectField
                  control={control}
                  name="plant"
                  label="Plant Id"
                  options={plantData}
                  required
                  errors={errors}
                  disabled={loadingPlants}
                  placeholder="-- Select Plant --"
                />
                <SelectField
                  control={control}
                  name="docType"
                  label="Doc Type"
                  options={DOC_TYPE_OPTIONS}
                  required
                  errors={errors}
                  disabled={!!editId || loading}  // ← ADD THIS LINE
                  placeholder="-- Select Doc Type --"
                />
              </div>
            </div>

            {/* Doc Type Specific Header Fields */}
            {docType && (
              <>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    {getSectionName()}
                  </h3>
                  {renderFieldsGrid(getHeaderFields().fields, getHeaderFields().name)}
                </div>

                {/* Child Tabs */}
                {renderChildTabs()}
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onBack}
                disabled={isSubmitting || saving}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || saving || loading}  // ← ADD loading TO THE DISABLED CONDITION
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-3 w-3" />
                {isSubmitting || saving ? "Saving..." : editId ? "Update" : editData ? "Update" : "Save"}  {/* ← UPDATE THIS LINE */}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesInvoiceForm;