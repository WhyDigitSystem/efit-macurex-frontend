import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to PurchaseOrderForm / InternalIndentForm  */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  disabled,
  className = "",
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={controlClasses}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={controlClasses}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

/* Config-driven field grid - renders a list of {name,label,type,options,...}
   descriptors against a values/onChange pair. Cuts down repetition across the
   three large, mostly-similar header field sets below. */
const FieldsGrid = ({
  fields,
  values,
  onChange,
  errors,
  gridClassName = fieldGrid,
}) => (
  <div className={gridClassName}>
    {fields.map((f) => (
      <Field
        key={f.name}
        type={f.type || "text"}
        label={f.label}
        name={f.name}
        value={f.auto ? values[f.name] || "Auto" : values[f.name]}
        onChange={onChange}
        options={f.options}
        disabled={f.disabled || f.auto}
        required={f.required}
        error={errors?.[f.name]}
        className={f.className}
      />
    ))}
  </div>
);

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers                                                                */

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-1 whitespace-nowrap ${
            i === 0
              ? "w-8 text-center"
              : i === headers.length - 1
                ? "w-20 text-left"
                : "text-left"
          } dark:text-white`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-1 text-center">
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

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top">
    <select value={value} onChange={onChange} className={cellInputClasses}>
      <option value="">-- Select --</option>
      {(options || []).map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text" }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`${cellInputClasses} ${type === "number" ? "min-w-[90px]" : "min-w-[110px]"}`}
    />
  </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) =>
            col.type === "select" ? (
              <SelectCell
                key={col.key}
                value={row[col.key]}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                options={col.options}
              />
            ) : (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={
                  col.type === "number"
                    ? "number"
                    : col.type === "date"
                      ? "date"
                      : "text"
                }
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* Builds an empty row object (all "") from a columns config - keeps the
   per-section emptyXRow() functions a one-liner. */
const blankRowFromColumns = (columns) =>
  columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

/* Builds an empty fields object (all "") from a fields config. */
const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const LOCATION_IDS = [
  "MAIN STORE",
  "WAREHOUSE 1",
  "WAREHOUSE 2",
  "PLANT STORE",
];
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const YES_NO = ["YES", "NO"];
const ITEM_CODES = ["FG-001", "FG-002", "FG-003", "SVC-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];
const TAX_TYPES = ["SGST+CGST", "IGST", "EXEMPT", "NIL RATED"];
const TAX_CODES = ["GST0", "GST5", "GST12", "GST18", "GST28"];
const GST_STATES = ["KARNATAKA", "TAMIL NADU", "MAHARASHTRA", "DELHI"];
const INVOICE_TYPES = ["REGULAR", "EXPORT", "SEZ", "DEEMED EXPORT"];
const CUSTOMER_TYPES = ["DOMESTIC", "EXPORT", "SEZ"];
const CUSTOMER_CODES = ["CUST-001", "CUST-002", "CUST-003"];
const PACKAGE_TYPES = ["CARTON", "PALLET", "CRATE", "BAG"];
const MODE_OF_TRANSPORT = ["ROAD", "RAIL", "AIR", "SEA", "COURIER"];
const DEBIT_CREDIT = ["DEBIT", "CREDIT"];

const DOC_TYPE_OPTIONS = ["Invoice", "Rejection", "Other Sales Invoice"];
const DOC_TYPE_INVOICE = "Invoice";
const DOC_TYPE_REJECTION = "Rejection";
const DOC_TYPE_OTHER_SALES = "Other Sales Invoice";

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ============================================================================ */
/* D.C. Cum Invoice (default) - header, item, tax, terms, shipping configs      */
/* ============================================================================ */

const INVOICE_HEADER_FIELDS = [
  {
    name: "locationId",
    label: "Location ID",
    type: "select",
    options: LOCATION_IDS,
  },
  { name: "salesInvoiceNo", label: "Sales Invoice No", auto: true },
  {
    name: "belongsTo",
    label: "Belongs to",
    type: "select",
    options: BELONGS_TO,
  },
  { name: "vehicle", label: "Vehicle" },
  {
    name: "subDocType",
    label: "Doc Type",
    type: "select",
    options: ["INVOICE", "REJECTION"],
  },
  {
    name: "isIGSTAppl",
    label: "Is IGST Appl",
    type: "select",
    options: YES_NO,
  },
  { name: "gstnNo", label: "GSTN No" },
  {
    name: "customerId",
    label: "Customer ID",
    type: "select",
    options: CUSTOMER_CODES,
  },
  { name: "timeOfIssue", label: "Time Of Issue", type: "time" },
  {
    name: "invoiceDate",
    label: "Invoice Date",
    type: "date",
    default: todayISO(),
  },
  { name: "customerName", label: "Customer Name" },
  {
    name: "invoiceType",
    label: "Invoice Type",
    type: "select",
    options: INVOICE_TYPES,
  },
  { name: "customerCode", label: "Customer Code" },
  { name: "currency", label: "Currency", default: "RS" },
  { name: "schNo", label: "Sch. No." },
  { name: "diNo", label: "DI.No" },
  { name: "timeOfRemoval", label: "Time Of Removal", type: "time" },
  { name: "schDate", label: "Sch. Date", type: "date" },
  { name: "diDate", label: "DI.Date", type: "date" },
  { name: "exchangeRate", label: "Exchange Rate", type: "number" },
  { name: "monthYear", label: "Month Year", type: "month" },
  { name: "kanbanCardNo", label: "Kanban Card No" },
  {
    name: "customerType",
    label: "Customer Type",
    type: "select",
    options: CUSTOMER_TYPES,
  },
  {
    name: "excisable",
    label: "Excisable ?",
    type: "select",
    options: YES_NO,
    default: "NO",
  },
  { name: "taxCode", label: "Tax Code", type: "select", options: TAX_CODES },
  {
    name: "stockPosting",
    label: "Stock Posting?",
    type: "select",
    options: YES_NO,
    default: "YES",
  },
  {
    name: "partyGstState",
    label: "Party GST State",
    type: "select",
    options: GST_STATES,
  },
  { name: "pdiNo", label: "PDI No" },
];

const INVOICE_ITEM_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
  { key: "itemDescription", label: "Item Description" },
  { key: "hsnSacCode", label: "HSN/SAC Code" },
  { key: "taxType", label: "Tax Type", type: "select", options: TAX_TYPES },
  { key: "taxPercent", label: "Tax (%)", type: "number" },
  { key: "customerPartNo", label: "Customer Part No." },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "lastInvoicedDate", label: "Last Invoiced Date", type: "date" },
  { key: "tariffNo", label: "Tariff No." },
  { key: "stock", label: "Stock", type: "number" },
  { key: "soContractNo", label: "S.O. Contract No." },
  { key: "despQty", label: "Desp. Qty", type: "number" },
  { key: "noOfPackages", label: "No. Of Packages", type: "number" },
  {
    key: "packageType",
    label: "Package Type",
    type: "select",
    options: PACKAGE_TYPES,
  },
  {
    key: "rateInSelectedCurr",
    label: "Rate In Selected Curr.",
    type: "number",
  },
  {
    key: "amtInSelectedCurrency",
    label: "Amt. In Selected Currency",
    type: "number",
  },
  { key: "amountInRs", label: "Amount In Rs.", type: "number" },
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

const INVOICE_TERMS_FIELDS = [
  { name: "totalInsurance", label: "Total Insurance", type: "number" },
  { name: "totalFreight", label: "Total Freight", type: "number" },
  { name: "totalAssVal", label: "Total Ass. VaL", type: "number" },
  {
    name: "modeOfTransport",
    label: "Mode Of Transport",
    type: "select",
    options: MODE_OF_TRANSPORT,
  },
  { name: "netAmount", label: "Net Amount", type: "number" },
  { name: "deliveryTo", label: "Delivery To" },
  { name: "tcsAmount", label: "TCS Amount", type: "number" },
  { name: "netWeight", label: "Net Weight", type: "number" },
  { name: "grossWeight", label: "Gross Weight", type: "number" },
  { name: "po", label: "Po" },
  { name: "poDate", label: "Po Date", type: "date" },
  { name: "paymentTerms", label: "Payment Terms" },
  {
    name: "amountInWords",
    label: "Amount In Words",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "narration",
    label: "Narration",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
];

const INVOICE_SHIPPING_FIELDS = [
  {
    name: "customerId",
    label: "Customer Id",
    type: "select",
    options: CUSTOMER_CODES,
  },
  { name: "customerName", label: "Customer Name" },
  { name: "customerCode", label: "Customer Code" },
  { name: "gstNo", label: "GST No" },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
  {
    name: "partyGstState",
    label: "Party Gst State",
    type: "select",
    options: GST_STATES,
  },
  { name: "pincode", label: "Pincode" },
];

/* ============================================================================ */
/* Other Sales Invoice - header, item, tax, terms configs                      */
/* ============================================================================ */

const OTHER_SALES_HEADER_FIELDS = [
  { name: "monthYear", label: "Month Year", type: "month" },
  {
    name: "belongsTo",
    label: "Belongs to",
    type: "select",
    options: BELONGS_TO,
  },
  {
    name: "excisable",
    label: "Excisable ?",
    type: "select",
    options: YES_NO,
    default: "NO",
  },
  { name: "taxCode", label: "Tax Code", type: "select", options: TAX_CODES },
  {
    name: "subDocType",
    label: "Doc Type",
    type: "select",
    options: ["INVOICE", "REJECTION"],
  },
  {
    name: "locationId",
    label: "Location ID",
    type: "select",
    options: LOCATION_IDS,
  },
  { name: "salesInvoiceNo", label: "Sales Invoice No", auto: true },
  {
    name: "customerId",
    label: "Customer ID",
    type: "select",
    options: CUSTOMER_CODES,
  },
  { name: "vehicle", label: "Vehicle" },
  { name: "customerName", label: "Customer Name" },
  { name: "timeOfIssue", label: "Time Of Issue", type: "time" },
  {
    name: "invoiceDate",
    label: "Invoice Date",
    type: "date",
    default: todayISO(),
  },
  { name: "customerCode", label: "Customer Code" },
  {
    name: "invoiceType",
    label: "Invoice Type",
    type: "select",
    options: INVOICE_TYPES,
  },
  {
    name: "isIGSTAppl",
    label: "Is IGST Applicable",
    type: "select",
    options: YES_NO,
  },
  { name: "currency", label: "Currency", default: "RS" },
  { name: "schNo", label: "Sch. No." },
  { name: "gstnNo", label: "GSTN No." },
  { name: "timeOfRemoval", label: "Time Of Removal", type: "time" },
  { name: "schDate", label: "Sch. Date", type: "date" },
  { name: "diNo", label: "DI.No" },
  { name: "diDate", label: "DI.Date", type: "date" },
  { name: "exchangeRate", label: "Exchange Rate", type: "number" },
  { name: "kanbanCardNo", label: "Kanban Card No" },
  {
    name: "stockPosting",
    label: "Stock Posting?",
    type: "select",
    options: YES_NO,
    default: "YES",
  },
];

const OTHER_SALES_ITEM_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
  { key: "hsnSacCode", label: "HSN_SAC_Code" },
  { key: "taxType", label: "Tax Type", type: "select", options: TAX_TYPES },
  { key: "taxPercent", label: "Tax (%)", type: "number" },
  { key: "itemDescription", label: "Item Description" },
  { key: "customerPartNo", label: "Customer Part No." },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "lastInvoicedDate", label: "Last Invoiced Date", type: "date" },
  { key: "tariffNo", label: "Tariff No." },
  { key: "stock", label: "Stock", type: "number" },
  { key: "soContractNo", label: "S.O. Contract No." },
  { key: "despQty", label: "Desp. Qty", type: "number" },
  { key: "noOfPackages", label: "No. Of Packages", type: "number" },
  {
    key: "packageType",
    label: "Package Type",
    type: "select",
    options: PACKAGE_TYPES,
  },
  {
    key: "rateInSelectedCurr",
    label: "Rate In Selected Curr.",
    type: "number",
  },
  {
    key: "amtInSelectedCurrency",
    label: "Amt. In Selected Currency",
    type: "number",
  },
  { key: "amountInRs", label: "Amount In Rs.", type: "number" },
  { key: "sgstRate", label: "SGST Rate", type: "number" },
  { key: "sgstAmount", label: "SGST Amount", type: "number" },
  { key: "cgstRate", label: "CGST Rate", type: "number" },
  { key: "cgstAmount", label: "CGST Amount", type: "number" },
  { key: "igstRate", label: "IGST Rate", type: "number" },
  { key: "igstAmount", label: "IGST Amtount", type: "number" },
];

const OTHER_SALES_TAX_COLUMNS = [
  { key: "particulars", label: "Particulars" },
  { key: "acceptedQtyAmount", label: "Accepted Qty Amount", type: "number" },
  { key: "revisedAmount", label: "Revised Amount", type: "number" },
  { key: "glAccountName", label: "GL Account Name" },
];

const OTHER_SALES_TERMS_FIELDS = [
  { name: "totalInsurance", label: "Total Insurance", type: "number" },
  { name: "totalFreight", label: "Total Freight", type: "number" },
  { name: "totalAssVal", label: "Total Ass. VaL", type: "number" },
  {
    name: "modeOfTransport",
    label: "Mode Of Transport",
    type: "select",
    options: MODE_OF_TRANSPORT,
  },
  { name: "netAmount", label: "Net Amount", type: "number" },
  { name: "deliveryTo", label: "Delivery To" },
  { name: "paymentTerms", label: "Payment Terms" },
  { name: "po", label: "Po" },
  { name: "poDate", label: "Po Date", type: "date" },
  {
    name: "amountInWords",
    label: "Amount In Words",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "narration",
    label: "Narration",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
];

/* ============================================================================ */
/* Rejection Invoice - header, item, tax, terms configs                        */
/* ============================================================================ */

const REJECTION_HEADER_FIELDS = [
  {
    name: "locationId",
    label: "Location ID",
    type: "select",
    options: LOCATION_IDS,
  },
  { name: "rejectionInvoiceNo", label: "Rejection Invoice No", auto: true },
  {
    name: "belongsTo",
    label: "Belongs to",
    type: "select",
    options: BELONGS_TO,
  },
  { name: "vehicle", label: "Vehicle" },
  {
    name: "subDocType",
    label: "Doc Type",
    type: "select",
    options: ["REJECTION", "SCRAP"],
  },
  {
    name: "isIGSTAppl",
    label: "Is IGST Appl",
    type: "select",
    options: YES_NO,
  },
  { name: "gstnNo", label: "GSTN No" },
  { name: "customerName", label: "Customer Name" },
  { name: "timeOfIssue", label: "Time Of Issue", type: "time" },
  {
    name: "invoiceDate",
    label: "Invoice Date",
    type: "date",
    default: todayISO(),
  },
  { name: "customerCode", label: "Customer Code" },
  {
    name: "invoiceType",
    label: "Invoice Type",
    type: "select",
    options: INVOICE_TYPES,
  },
  {
    name: "partyGstState",
    label: "Party GST State",
    type: "select",
    options: GST_STATES,
  },
  { name: "currency", label: "Currency", default: "RS" },
  { name: "schNo", label: "Sch. No." },
  { name: "diNo", label: "DI.No" },
  { name: "timeOfRemoval", label: "Time Of Removal", type: "time" },
  { name: "schDate", label: "Sch. Date", type: "date" },
  { name: "diDate", label: "DI.Date", type: "date" },
  { name: "exchangeRate", label: "Exchange Rate", type: "number" },
  { name: "monthYear", label: "Month Year", type: "month" },
  { name: "kanbanCardNo", label: "Kanban Card No" },
  { name: "refNo", label: "Ref No" },
  {
    name: "excisable",
    label: "Excisable ?",
    type: "select",
    options: YES_NO,
    default: "NO",
  },
  { name: "taxCode", label: "Tax Code", type: "select", options: TAX_CODES },
  { name: "refDate", label: "Ref Date", type: "date" },
  {
    name: "stockPosting",
    label: "Stock Posting?",
    type: "select",
    options: YES_NO,
    default: "YES",
  },
  { name: "supplierInvNo", label: "Supplier_Inv_No" },
];

const REJECTION_ITEM_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
  { key: "itemDescription", label: "Item Description" },
  { key: "hsnSacCode", label: "HSN/SAC Code" },
  { key: "taxType", label: "Tax Type", type: "select", options: TAX_TYPES },
  { key: "taxPercent", label: "Tax (%)", type: "number" },
  { key: "customerPartNo", label: "Customer Part No." },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "lastInvoicedDate", label: "Last Invoiced Date", type: "date" },
  { key: "tariffNo", label: "Tariff No." },
  { key: "stock", label: "Stock", type: "number" },
  { key: "soContractNo", label: "S.O. Contract No." },
  { key: "despQty", label: "Desp. Qty", type: "number" },
  { key: "noOfPackages", label: "No. Of Packages", type: "number" },
  {
    key: "packageType",
    label: "Package Type",
    type: "select",
    options: PACKAGE_TYPES,
  },
  {
    key: "rateInSelectedCurr",
    label: "Rate In Selected Curr.",
    type: "number",
  },
  {
    key: "amtInSelectedCurrency",
    label: "Amt. In Selected Currency",
    type: "number",
  },
  { key: "amountInRs", label: "Amount In Rs.", type: "number" },
  { key: "edPercent", label: "Ed%", type: "number" },
  { key: "sgstRate", label: "SGST Rate", type: "number" },
  { key: "sgstAmount", label: "SGST Amount", type: "number" },
  { key: "cgstRate", label: "CGST Rate", type: "number" },
  { key: "cgstAmount", label: "CGST Amount", type: "number" },
  { key: "igstRate", label: "IGST Rate", type: "number" },
  { key: "igstAmount", label: "IGST Amount", type: "number" },
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

const REJECTION_TERMS_FIELDS = OTHER_SALES_TERMS_FIELDS;

/* ---------------------------------------------------------------------------- */
/* Reusable "fields tab" renderer (Terms And Conditions / Shipping Details)     */

const FieldsTab = ({ fields, values, onChange }) => (
  <div className="pt-3">
    <FieldsGrid fields={fields} values={values} onChange={onChange} />
  </div>
);

/* ---------------------------------------------------------------------------- */

const SalesInvoiceForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* Common fields - always visible, drives which section renders below */
  const [commonHeader, setCommonHeader] = useState({
    plant: "",
    docType: DOC_TYPE_INVOICE,
    ...editData?.commonHeader,
  });

  /* D.C. Cum Invoice state */
  const [invoiceHeader, setInvoiceHeader] = useState({
    ...blankFromFields(INVOICE_HEADER_FIELDS),
    ...editData?.invoiceHeader,
  });
  const [invoiceItemRows, setInvoiceItemRows] = useState(
    editData?.invoiceItems?.length
      ? editData.invoiceItems
      : [blankRowFromColumns(INVOICE_ITEM_COLUMNS)],
  );
  const [invoiceTaxRows, setInvoiceTaxRows] = useState(
    editData?.invoiceTaxDetails?.length
      ? editData.invoiceTaxDetails
      : [blankRowFromColumns(INVOICE_TAX_COLUMNS)],
  );
  const [invoiceTerms, setInvoiceTerms] = useState({
    ...blankFromFields(INVOICE_TERMS_FIELDS),
    ...editData?.invoiceTerms,
  });
  const [invoiceShipping, setInvoiceShipping] = useState({
    ...blankFromFields(INVOICE_SHIPPING_FIELDS),
    ...editData?.invoiceShipping,
  });
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("itemDetails");

  /* Other Sales Invoice state */
  const [otherSalesHeader, setOtherSalesHeader] = useState({
    ...blankFromFields(OTHER_SALES_HEADER_FIELDS),
    ...editData?.otherSalesHeader,
  });
  const [otherSalesItemRows, setOtherSalesItemRows] = useState(
    editData?.otherSalesItems?.length
      ? editData.otherSalesItems
      : [blankRowFromColumns(OTHER_SALES_ITEM_COLUMNS)],
  );
  const [otherSalesTaxRows, setOtherSalesTaxRows] = useState(
    editData?.otherSalesTaxDetails?.length
      ? editData.otherSalesTaxDetails
      : [blankRowFromColumns(OTHER_SALES_TAX_COLUMNS)],
  );
  const [otherSalesTerms, setOtherSalesTerms] = useState({
    ...blankFromFields(OTHER_SALES_TERMS_FIELDS),
    ...editData?.otherSalesTerms,
  });
  const [activeOtherSalesTab, setActiveOtherSalesTab] = useState("itemDetails");

  /* Rejection Invoice state */
  const [rejectionHeader, setRejectionHeader] = useState({
    ...blankFromFields(REJECTION_HEADER_FIELDS),
    ...editData?.rejectionHeader,
  });
  const [rejectionItemRows, setRejectionItemRows] = useState(
    editData?.rejectionItems?.length
      ? editData.rejectionItems
      : [blankRowFromColumns(REJECTION_ITEM_COLUMNS)],
  );
  const [rejectionTaxRows, setRejectionTaxRows] = useState(
    editData?.rejectionTaxDetails?.length
      ? editData.rejectionTaxDetails
      : [blankRowFromColumns(REJECTION_TAX_COLUMNS)],
  );
  const [rejectionTerms, setRejectionTerms] = useState({
    ...blankFromFields(REJECTION_TERMS_FIELDS),
    ...editData?.rejectionTerms,
  });
  const [activeRejectionTab, setActiveRejectionTab] = useState("itemDetails");

  /* ---------------- handlers ---------------- */

  const handleCommonHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setCommonHeader((prev) => ({ ...prev, [name]: value }));
  };

  const makeHeaderHandler = (setter) => (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setter((prev) => ({ ...prev, [name]: value }));
  };
  const handleInvoiceHeaderChange = makeHeaderHandler(setInvoiceHeader);
  const handleOtherSalesHeaderChange = makeHeaderHandler(setOtherSalesHeader);
  const handleRejectionHeaderChange = makeHeaderHandler(setRejectionHeader);

  const makeFieldsHandler = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };
  const handleInvoiceTermsChange = makeFieldsHandler(setInvoiceTerms);
  const handleInvoiceShippingChange = makeFieldsHandler(setInvoiceShipping);
  const handleOtherSalesTermsChange = makeFieldsHandler(setOtherSalesTerms);
  const handleRejectionTermsChange = makeFieldsHandler(setRejectionTerms);

  const makeTableHandlers = (setter, columns) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, blankRowFromColumns(columns)]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const invoiceItemHandlers = makeTableHandlers(
    setInvoiceItemRows,
    INVOICE_ITEM_COLUMNS,
  );
  const invoiceTaxHandlers = makeTableHandlers(
    setInvoiceTaxRows,
    INVOICE_TAX_COLUMNS,
  );
  const otherSalesItemHandlers = makeTableHandlers(
    setOtherSalesItemRows,
    OTHER_SALES_ITEM_COLUMNS,
  );
  const otherSalesTaxHandlers = makeTableHandlers(
    setOtherSalesTaxRows,
    OTHER_SALES_TAX_COLUMNS,
  );
  const rejectionItemHandlers = makeTableHandlers(
    setRejectionItemRows,
    REJECTION_ITEM_COLUMNS,
  );
  const rejectionTaxHandlers = makeTableHandlers(
    setRejectionTaxRows,
    REJECTION_TAX_COLUMNS,
  );

  /* ---------------- child tab configs per doc type ---------------- */

  const INVOICE_CHILD_TABS = [
    { key: "itemDetails", label: "1-Item Details", type: "table" },
    { key: "taxDetails", label: "2-Tax Details", type: "table" },
    { key: "termsConditions", label: "3-Terms And Conditions", type: "fields" },
    { key: "shippingDetails", label: "4-Shipping Details", type: "fields" },
  ];
  const invoiceChildTabConfig = {
    itemDetails: {
      type: "table",
      rows: invoiceItemRows,
      handlers: invoiceItemHandlers,
      columns: INVOICE_ITEM_COLUMNS,
    },
    taxDetails: {
      type: "table",
      rows: invoiceTaxRows,
      handlers: invoiceTaxHandlers,
      columns: INVOICE_TAX_COLUMNS,
    },
    termsConditions: {
      type: "fields",
      fields: INVOICE_TERMS_FIELDS,
      values: invoiceTerms,
      onChange: handleInvoiceTermsChange,
    },
    shippingDetails: {
      type: "fields",
      fields: INVOICE_SHIPPING_FIELDS,
      values: invoiceShipping,
      onChange: handleInvoiceShippingChange,
    },
  };

  const OTHER_SALES_CHILD_TABS = [
    { key: "itemDetails", label: "1-Item Details", type: "table" },
    { key: "taxDetails", label: "2-Tax Details", type: "table" },
    { key: "termsConditions", label: "3-Terms And Conditions", type: "fields" },
  ];
  const otherSalesChildTabConfig = {
    itemDetails: {
      type: "table",
      rows: otherSalesItemRows,
      handlers: otherSalesItemHandlers,
      columns: OTHER_SALES_ITEM_COLUMNS,
    },
    taxDetails: {
      type: "table",
      rows: otherSalesTaxRows,
      handlers: otherSalesTaxHandlers,
      columns: OTHER_SALES_TAX_COLUMNS,
    },
    termsConditions: {
      type: "fields",
      fields: OTHER_SALES_TERMS_FIELDS,
      values: otherSalesTerms,
      onChange: handleOtherSalesTermsChange,
    },
  };

  const REJECTION_CHILD_TABS = [
    { key: "itemDetails", label: "1-Item Details", type: "table" },
    { key: "taxDetails", label: "2-Tax Details", type: "table" },
    { key: "termsConditions", label: "3-Terms And Conditions", type: "fields" },
  ];
  const rejectionChildTabConfig = {
    itemDetails: {
      type: "table",
      rows: rejectionItemRows,
      handlers: rejectionItemHandlers,
      columns: REJECTION_ITEM_COLUMNS,
    },
    taxDetails: {
      type: "table",
      rows: rejectionTaxRows,
      handlers: rejectionTaxHandlers,
      columns: REJECTION_TAX_COLUMNS,
    },
    termsConditions: {
      type: "fields",
      fields: REJECTION_TERMS_FIELDS,
      values: rejectionTerms,
      onChange: handleRejectionTermsChange,
    },
  };

  const activeInvoiceTabConfig = invoiceChildTabConfig[activeInvoiceTab];
  const activeOtherSalesTabConfig =
    otherSalesChildTabConfig[activeOtherSalesTab];
  const activeRejectionTabConfig = rejectionChildTabConfig[activeRejectionTab];

  const handleAddChildRow = () => {
    if (
      commonHeader.docType === DOC_TYPE_INVOICE &&
      activeInvoiceTabConfig?.type === "table"
    ) {
      activeInvoiceTabConfig.handlers.onAddRow();
    } else if (
      commonHeader.docType === DOC_TYPE_OTHER_SALES &&
      activeOtherSalesTabConfig?.type === "table"
    ) {
      activeOtherSalesTabConfig.handlers.onAddRow();
    } else if (
      commonHeader.docType === DOC_TYPE_REJECTION &&
      activeRejectionTabConfig?.type === "table"
    ) {
      activeRejectionTabConfig.handlers.onAddRow();
    }
  };

  /* ---------------- validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!commonHeader.plant) errors.plant = "Plant Id is required";
    if (!commonHeader.docType) errors.docType = "Doc Type is required";

    if (
      commonHeader.docType === DOC_TYPE_INVOICE &&
      !invoiceHeader.invoiceDate
    ) {
      errors.invoiceDate = "Invoice Date is required";
    }
    if (
      commonHeader.docType === DOC_TYPE_OTHER_SALES &&
      !otherSalesHeader.invoiceDate
    ) {
      errors.invoiceDate = "Invoice Date is required";
    }
    if (
      commonHeader.docType === DOC_TYPE_REJECTION &&
      !rejectionHeader.invoiceDate
    ) {
      errors.invoiceDate = "Invoice Date is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const docType = commonHeader.docType;

    const payload = {
      ...(editData?.id && { id: editData.id }),
      commonHeader,
      ...(docType === DOC_TYPE_INVOICE && {
        invoiceHeader,
        invoiceItems: invoiceItemRows,
        invoiceTaxDetails: invoiceTaxRows,
        invoiceTerms,
        invoiceShipping,
      }),
      ...(docType === DOC_TYPE_OTHER_SALES && {
        otherSalesHeader,
        otherSalesItems: otherSalesItemRows,
        otherSalesTaxDetails: otherSalesTaxRows,
        otherSalesTerms,
      }),
      ...(docType === DOC_TYPE_REJECTION && {
        rejectionHeader,
        rejectionItems: rejectionItemRows,
        rejectionTaxDetails: rejectionTaxRows,
        rejectionTerms,
      }),
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Sales Invoice Payload:", payload);

    try {
      const response = await salesInvoiceAPI.updateCreateSalesInvoice(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save sales invoice";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Sales Invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- child tabs section renderer (shared shape) ---------------- */

  const renderChildTabs = (tabs, activeTab, setActiveTab, activeTabConfig) => (
    <section className="mt-0 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTabConfig?.type === "table" && (
          <button
            type="button"
            onClick={handleAddChildRow}
            className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {activeTabConfig?.type === "table" && (
        <DynamicTable
          columns={activeTabConfig.columns}
          rows={activeTabConfig.rows}
          onCellChange={activeTabConfig.handlers.onCellChange}
          onRemoveRow={activeTabConfig.handlers.onRemoveRow}
        />
      )}

      {activeTabConfig?.type === "fields" && (
        <FieldsTab
          fields={activeTabConfig.fields}
          values={activeTabConfig.values}
          onChange={activeTabConfig.onChange}
        />
      )}
    </section>
  );

  /* ---------------- render ---------------- */

  return (
    <div className="p-2 max-w-7xl">
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
        {/* ---------------- Common Fields ---------------- */}
        <div>
          <SectionHeader>Sales Invoice Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant Id"
              name="plant"
              value={commonHeader.plant}
              onChange={handleCommonHeaderChange}
              error={fieldErrors.plant}
              options={PLANT_IDS}
              required
            />
            <Field
              type="select"
              label="Doc Type"
              name="docType"
              value={commonHeader.docType}
              onChange={handleCommonHeaderChange}
              error={fieldErrors.docType}
              options={DOC_TYPE_OPTIONS}
              required
            />
          </div>
        </div>

        {/* ---------------- Doc Type dependent sections ---------------- */}

        {commonHeader.docType === DOC_TYPE_INVOICE && (
          <>
            <div>
              <SectionHeader>D.C. Cum Invoice</SectionHeader>
              <FieldsGrid
                fields={INVOICE_HEADER_FIELDS}
                values={invoiceHeader}
                onChange={handleInvoiceHeaderChange}
                errors={fieldErrors}
              />
            </div>
            {renderChildTabs(
              INVOICE_CHILD_TABS,
              activeInvoiceTab,
              setActiveInvoiceTab,
              activeInvoiceTabConfig,
            )}
          </>
        )}

        {commonHeader.docType === DOC_TYPE_OTHER_SALES && (
          <>
            <div>
              <SectionHeader>Other Sales Invoice</SectionHeader>
              <FieldsGrid
                fields={OTHER_SALES_HEADER_FIELDS}
                values={otherSalesHeader}
                onChange={handleOtherSalesHeaderChange}
                errors={fieldErrors}
              />
            </div>
            {renderChildTabs(
              OTHER_SALES_CHILD_TABS,
              activeOtherSalesTab,
              setActiveOtherSalesTab,
              activeOtherSalesTabConfig,
            )}
          </>
        )}

        {commonHeader.docType === DOC_TYPE_REJECTION && (
          <>
            <div>
              <SectionHeader>Rejection Invoice</SectionHeader>
              <FieldsGrid
                fields={REJECTION_HEADER_FIELDS}
                values={rejectionHeader}
                onChange={handleRejectionHeaderChange}
                errors={fieldErrors}
              />
            </div>
            {renderChildTabs(
              REJECTION_CHILD_TABS,
              activeRejectionTab,
              setActiveRejectionTab,
              activeRejectionTabConfig,
            )}
          </>
        )}

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default SalesInvoiceForm;
