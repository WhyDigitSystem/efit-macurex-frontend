import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { rejectionInvoiceAPI } from "../../../api/Sales/rejectionInvoiceAPI";
import { useToast } from "../../Toast/ToastContext";

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
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

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
  className = "",
  disabled = false,
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
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
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
            `${error ? controlErrClasses : "border-gray-300 dark:border-gray-600"} ` +
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
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

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
/* Table helpers                                                               */

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

/* Generic dynamic table body. Supports text / select / date / readonly columns. */
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
          {columns.map((col) => (
            <td className="p-1 align-top" key={col.key}>
              {col.type === "select" ? (
                <select
                  value={row[col.key]}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={cellInputClasses}
                >
                  <option value="">-- Select --</option>
                  {(col.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={col.type === "date" ? "date" : "text"}
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
                />
              )}
            </td>
          ))}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Item master lookup (swap for real API-driven catalog)                       */

const ITEM_MASTER = {
  "RM-001": {
    itemDescription: "Raw Material - Steel Sheet",
    hsnSacCode: "7208",
    unit: "KG",
    tariffNo: "72085190",
    stock: "1200",
  },
  "RM-002": {
    itemDescription: "Raw Material - Aluminium Rod",
    hsnSacCode: "7604",
    unit: "KG",
    tariffNo: "76042990",
    stock: "800",
  },
  "FG-001": {
    itemDescription: "Finished Good - Assembled Unit",
    hsnSacCode: "8479",
    unit: "NOS",
    tariffNo: "84798999",
    stock: "500",
  },
};
const ITEM_CODES = Object.keys(ITEM_MASTER);

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const LOCATION_IDS = [
  "Main Store",
  "WIP Store",
  "Finished Goods Store",
  "QC Hold",
];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const DOC_TYPES = ["REJECTION", "Scrap"];
const YES_NO = ["YES", "NO"];
const INVOICE_TYPES = ["Domestic", "Export", "SEZ", "Deemed Export"];
const GST_STATES = [
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Delhi",
  "Gujarat",
];
const CURRENCIES = ["RS", "USD", "EUR", "GBP", "JPY"];
const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const TAX_TYPES = ["GST", "IGST", "Exempt", "Nil Rated"];
const PACKAGE_TYPES = ["Carton", "Pallet", "Crate", "Loose"];
const DR_CR = ["Dr", "Cr"];
const MODE_OF_TRANSPORT = ["Road", "Rail", "Air", "Sea", "Courier"];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyGeneralInfo = () => ({
  plantId: "",
  locationId: "",
  rejectionInvoiceNo: "",
  belongsTo: "",
  vehicle: "",
  docType: "",
  isIgstAppl: "",
  gstnNo: "",
  customerName: "",
  timeOfIssue: "",
  invoiceDate: "",
  customerCode: "",
  dateField2: "", // unlabeled date field in the source scrape - confirm real label
  invoiceType: "",
  partyGstState: "",
  currency: "RS",
  schNo: "",
  diNo: "",
  timeOfRemoval: "",
  schDate: "",
  diDate: "",
  dateField3: "", // unlabeled date field in the source scrape - confirm real label
  exchangeRate: "",
  monthYear: "",
  kanbanCardNo: "",
  refNo: "",
  excisable: "NO",
  taxCode: "",
  refDate: "",
  stockPosting: "YES",
  supplierInvNo: "",
});

const emptyItemDetailRow = () => ({
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
});

const emptyTaxDetailRow = () => ({
  particulars: "",
  acceptedQtyAmount: "",
  revisedAmount: "",
  glAccountName: "",
  dbcr: "",
  dbamt: "",
  cramt: "",
});

const emptyTermsConditions = () => ({
  totalInsurance: "",
  totalFreight: "",
  totalAssVal: "",
  modeOfTransport: "",
  netAmount: "",
  amountInWords: "",
  deliveryTo: "",
  paymentTerms: "",
  po: "",
  poDate: "",
  narration: "",
});

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "itemDetails", label: "Item Details", kind: "table" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "termsConditions", label: "Terms And Conditions", kind: "fields" },
];

const RejectionInvoiceForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("itemDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [general, setGeneral] = useState({
    ...emptyGeneralInfo(),
    ...data?.general,
  });

  const [itemDetailRows, setItemDetailRows] = useState(
    data?.itemDetails?.length ? data.itemDetails : [emptyItemDetailRow()],
  );
  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );
  const [termsConditions, setTermsConditions] = useState({
    ...emptyTermsConditions(),
    ...data?.termsConditions,
  });

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneral((prev) => ({ ...prev, [name]: value }));
  };

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    setTermsConditions((prev) => ({ ...prev, [name]: value }));
  };

  /* -- generic handler for plain dynamic-table tabs -- */
  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  /* -- handler for the Item Details table, which auto-fills sibling columns
        when Item Code is selected -- */
  const itemDetailHandlers = {
    onCellChange: (idx, key, value) =>
      setItemDetailRows((prev) =>
        prev.map((row, i) => {
          if (i !== idx) return row;
          if (key === "itemCode") {
            const master = ITEM_MASTER[value] || {};
            return { ...row, itemCode: value, ...master };
          }
          return { ...row, [key]: value };
        }),
      ),
    onAddRow: () =>
      setItemDetailRows((prev) => [...prev, emptyItemDetailRow()]),
    onRemoveRow: (idx) =>
      setItemDetailRows((prev) => prev.filter((_, i) => i !== idx)),
  };

  const taxDetailHandlers = makeTableHandlers(
    setTaxDetailRows,
    emptyTaxDetailRow,
  );

  const childTabConfig = {
    itemDetails: {
      rows: itemDetailRows,
      handlers: itemDetailHandlers,
      columns: [
        {
          key: "itemCode",
          label: "Item Code",
          type: "select",
          options: ITEM_CODES,
        },
        { key: "itemDescription", label: "Item Description", readOnly: true },
        { key: "hsnSacCode", label: "HSN/SAC Code", readOnly: true },
        {
          key: "taxType",
          label: "Tax Type",
          type: "select",
          options: TAX_TYPES,
        },
        { key: "taxPercent", label: "Tax (%)" },
        { key: "customerPartNo", label: "Customer Part No." },
        { key: "unit", label: "Unit", readOnly: true },
        { key: "lastInvoicedDate", label: "Last Invoiced Date", type: "date" },
        { key: "tariffNo", label: "Tariff No.", readOnly: true },
        { key: "stock", label: "Stock", readOnly: true },
        { key: "soContractNo", label: "S.O. Contract No." },
        { key: "despQty", label: "Desp. Qty" },
        { key: "noOfPackages", label: "No. Of Packages" },
        {
          key: "packageType",
          label: "Package Type",
          type: "select",
          options: PACKAGE_TYPES,
        },
        { key: "rateInSelectedCurr", label: "Rate In Selected Curr." },
        { key: "amtInSelectedCurrency", label: "Amt. In Selected Currency" },
        { key: "amountInRs", label: "Amount In Rs." },
        { key: "edPercent", label: "Ed%" },
        { key: "sgstRate", label: "SGST Rate" },
        { key: "sgstAmount", label: "SGST Amount" },
        { key: "cgstRate", label: "CGST Rate" },
        { key: "cgstAmount", label: "CGST Amount" },
        { key: "igstRate", label: "IGST Rate" },
        { key: "igstAmount", label: "IGST Amount" },
      ],
    },
    taxDetails: {
      rows: taxDetailRows,
      handlers: taxDetailHandlers,
      columns: [
        { key: "particulars", label: "Particulars" },
        { key: "acceptedQtyAmount", label: "Accepted Qty Amount" },
        { key: "revisedAmount", label: "Revised Amount" },
        { key: "glAccountName", label: "GL Account Name" },
        { key: "dbcr", label: "Dr/Cr", type: "select", options: DR_CR },
        { key: "dbamt", label: "Db Amt" },
        { key: "cramt", label: "Cr Amt" },
      ],
    },
  };

  const validate = () => {
    const errors = {};

    if (!general.plantId) errors.plantId = "Plant Id is required";
    if (!general.locationId) errors.locationId = "Location ID is required";
    if (!general.rejectionInvoiceNo?.trim())
      errors.rejectionInvoiceNo = "Rejection Invoice No is required";
    if (!general.belongsTo) errors.belongsTo = "Belongs to is required";
    if (!general.docType) errors.docType = "Doc Type is required";
    if (!general.isIgstAppl) errors.isIgstAppl = "This field is required";
    if (!general.gstnNo?.trim()) errors.gstnNo = "GSTN No is required";
    if (!general.customerName?.trim())
      errors.customerName = "Customer Name is required";
    if (!general.invoiceDate) errors.invoiceDate = "Invoice Date is required";
    if (!general.customerCode?.trim())
      errors.customerCode = "Customer Code is required";
    if (!general.invoiceType) errors.invoiceType = "Invoice Type is required";
    if (!general.partyGstState)
      errors.partyGstState = "Party GST State is required";
    if (!general.currency) errors.currency = "Currency is required";

    const hasValidItemRow = itemDetailRows.some(
      (r) => r.itemCode && Number(r.despQty) > 0,
    );
    if (!hasValidItemRow)
      errors.itemDetails =
        "Add at least one item with a Desp. Qty greater than 0";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId: Number(orgId),
      ...general,
      itemDetails: itemDetailRows.filter((r) => r.itemCode?.trim()),
      taxDetails: taxDetailRows.filter((r) => r.particulars?.trim()),
      termsConditions,
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response = await rejectionInvoiceAPI.createUpdateInvoice(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Rejection Invoice updated successfully!"
              : "Rejection Invoice created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Rejection Invoice.",
        );
      }
    } catch (err) {
      console.error("Save Rejection Invoice Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
        );
      } else {
        addToast("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

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
          {data ? "Edit Rejection Invoice" : "Add Rejection Invoice"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- General Info ---------------- */}
        <div>
          <SectionHeader>Rejection Invoice</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant Id"
              name="plantId"
              value={general.plantId}
              onChange={handleGeneralChange}
              error={fieldErrors.plantId}
              options={PLANT_IDS}
              required
            />
            <Field
              type="select"
              label="Location ID"
              name="locationId"
              value={general.locationId}
              onChange={handleGeneralChange}
              error={fieldErrors.locationId}
              options={LOCATION_IDS}
              required
            />
            <Field
              label="Rejection Invoice No"
              name="rejectionInvoiceNo"
              value={general.rejectionInvoiceNo}
              onChange={handleGeneralChange}
              error={fieldErrors.rejectionInvoiceNo}
              required
            />
            <Field
              type="select"
              label="Belongs to"
              name="belongsTo"
              value={general.belongsTo}
              onChange={handleGeneralChange}
              error={fieldErrors.belongsTo}
              options={BELONGS_TO}
              required
            />
            <Field
              label="Vehicle"
              name="vehicle"
              value={general.vehicle}
              onChange={handleGeneralChange}
            />
            <Field
              type="select"
              label="Doc Type"
              name="docType"
              value={general.docType}
              onChange={handleGeneralChange}
              error={fieldErrors.docType}
              options={DOC_TYPES}
              required
            />
            <Field
              type="select"
              label="Is IGST Appl"
              name="isIgstAppl"
              value={general.isIgstAppl}
              onChange={handleGeneralChange}
              error={fieldErrors.isIgstAppl}
              options={YES_NO}
              required
            />
            <Field
              label="GSTN No"
              name="gstnNo"
              value={general.gstnNo}
              onChange={handleGeneralChange}
              error={fieldErrors.gstnNo}
              required
            />
            <Field
              label="Customer Name"
              name="customerName"
              value={general.customerName}
              onChange={handleGeneralChange}
              error={fieldErrors.customerName}
              required
            />
            <Field
              type="time"
              label="Time Of Issue"
              name="timeOfIssue"
              value={general.timeOfIssue}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Invoice Date"
              name="invoiceDate"
              value={general.invoiceDate}
              onChange={handleGeneralChange}
              error={fieldErrors.invoiceDate}
              required
            />
            <Field
              label="Customer Code"
              name="customerCode"
              value={general.customerCode}
              onChange={handleGeneralChange}
              error={fieldErrors.customerCode}
              required
            />
            <Field
              type="date"
              label="Date"
              name="dateField2"
              value={general.dateField2}
              onChange={handleGeneralChange}
            />
            <Field
              type="select"
              label="Invoice Type"
              name="invoiceType"
              value={general.invoiceType}
              onChange={handleGeneralChange}
              error={fieldErrors.invoiceType}
              options={INVOICE_TYPES}
              required
            />
            <Field
              type="select"
              label="Party GST State"
              name="partyGstState"
              value={general.partyGstState}
              onChange={handleGeneralChange}
              error={fieldErrors.partyGstState}
              options={GST_STATES}
              required
            />
            <Field
              type="select"
              label="Currency"
              name="currency"
              value={general.currency}
              onChange={handleGeneralChange}
              error={fieldErrors.currency}
              options={CURRENCIES}
              required
            />
            <Field
              label="Sch. No."
              name="schNo"
              value={general.schNo}
              onChange={handleGeneralChange}
            />
            <Field
              label="DI.No"
              name="diNo"
              value={general.diNo}
              onChange={handleGeneralChange}
            />
            <Field
              type="time"
              label="Time Of Removal"
              name="timeOfRemoval"
              value={general.timeOfRemoval}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Sch. Date"
              name="schDate"
              value={general.schDate}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="DI.Date"
              name="diDate"
              value={general.diDate}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Date"
              name="dateField3"
              value={general.dateField3}
              onChange={handleGeneralChange}
            />
            <Field
              label="Exchange Rate"
              name="exchangeRate"
              value={general.exchangeRate}
              onChange={handleGeneralChange}
            />
            <Field
              type="month"
              label="Month Year"
              name="monthYear"
              value={general.monthYear}
              onChange={handleGeneralChange}
            />
            <Field
              label="Kanban Card No"
              name="kanbanCardNo"
              value={general.kanbanCardNo}
              onChange={handleGeneralChange}
            />
            <Field
              label="Ref No"
              name="refNo"
              value={general.refNo}
              onChange={handleGeneralChange}
            />
            <Field
              type="select"
              label="Excisable ?"
              name="excisable"
              value={general.excisable}
              onChange={handleGeneralChange}
              options={YES_NO}
            />
            <Field
              type="select"
              label="Tax Code"
              name="taxCode"
              value={general.taxCode}
              onChange={handleGeneralChange}
              options={TAX_CODES}
            />
            <Field
              type="date"
              label="Ref Date"
              name="refDate"
              value={general.refDate}
              onChange={handleGeneralChange}
            />
            <Field
              type="select"
              label="Stock Posting?"
              name="stockPosting"
              value={general.stockPosting}
              onChange={handleGeneralChange}
              options={YES_NO}
            />
            <Field
              label="Supplier_Inv_No"
              name="supplierInvNo"
              value={general.supplierInvNo}
              onChange={handleGeneralChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={() =>
                  childTabConfig[activeChildTab].handlers.onAddRow()
                }
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Active tab content */}
          {activeTabMeta.kind === "table" && (
            <div>
              <DynamicTable
                columns={childTabConfig[activeChildTab].columns}
                rows={childTabConfig[activeChildTab].rows}
                onCellChange={
                  childTabConfig[activeChildTab].handlers.onCellChange
                }
                onRemoveRow={
                  childTabConfig[activeChildTab].handlers.onRemoveRow
                }
              />
              {activeChildTab === "itemDetails" && fieldErrors.itemDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.itemDetails}
                </p>
              )}
            </div>
          )}

          {activeTabMeta.kind === "fields" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  label="Total Insurance"
                  name="totalInsurance"
                  value={termsConditions.totalInsurance}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Total Freight"
                  name="totalFreight"
                  value={termsConditions.totalFreight}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Total Ass. VaL"
                  name="totalAssVal"
                  value={termsConditions.totalAssVal}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Mode Of Transport"
                  name="modeOfTransport"
                  value={termsConditions.modeOfTransport}
                  onChange={handleTermsChange}
                  options={MODE_OF_TRANSPORT}
                />
                <Field
                  label="Net Amount"
                  name="netAmount"
                  value={termsConditions.netAmount}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Amount In Words"
                  name="amountInWords"
                  value={termsConditions.amountInWords}
                  onChange={handleTermsChange}
                  className="col-span-2"
                />
                <Field
                  label="Delivery To"
                  name="deliveryTo"
                  value={termsConditions.deliveryTo}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Payment Terms"
                  name="paymentTerms"
                  value={termsConditions.paymentTerms}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Po"
                  name="po"
                  value={termsConditions.po}
                  onChange={handleTermsChange}
                />
                <Field
                  type="date"
                  label="Po Date"
                  name="poDate"
                  value={termsConditions.poDate}
                  onChange={handleTermsChange}
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={termsConditions.narration}
                  onChange={handleTermsChange}
                  className="col-span-2 xl:col-span-3"
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default RejectionInvoiceForm;
