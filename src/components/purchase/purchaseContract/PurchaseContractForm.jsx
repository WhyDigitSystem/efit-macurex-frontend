import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import { purchaseContractAPI } from "../../../api/Purchase/purchaseContractAPI";
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
          <option value="">Select {label}</option>
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
      className={cellInputClasses}
    />
  </td>
);

/* Generic dynamic table body for plain data-entry tabs */
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
                type={col.type === "date" ? "date" : "text"}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Quotation Attachment tab: dropzone + file table                             */

const AttachmentTable = ({ rows, onCellChange, onRemoveRow, onAddFiles }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) onAddFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-4 text-xs cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <UploadCloud className="h-5 w-5 text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400">
          Drop files here or click to upload
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <TableWrapper>
        <TableHead headers={["#", "File Name", "Attachment", "Action"]} />
        <tbody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              index={idx}
              onRemove={() => onRemoveRow(idx)}
              disabled={rows.length <= 1}
            >
              <td className="p-1 align-top">
                <input
                  type="text"
                  value={row.fileName}
                  onChange={(e) =>
                    onCellChange(idx, "fileName", e.target.value)
                  }
                  className={cellInputClasses}
                />
              </td>
              <td className="p-1 align-top text-gray-600 dark:text-gray-300">
                {row.attachment?.name || (
                  <span className="text-gray-400">No file selected</span>
                )}
              </td>
            </TableRow>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const DEPARTMENTS = ["Purchase", "Stores", "Quality", "Production", "Finance"];
const GST_STATES = [
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Delhi",
  "Gujarat",
];
const YES_NO = ["YES", "NO"];
const PO_TYPES = ["Domestic", "Import", "Service", "Capital Goods"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "MTR", "LTR", "BOX", "SET"];
const TAX_TYPES = ["GST", "IGST", "Exempt", "Nil Rated"];
const MODE_OF_DESPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];
const FREIGHT_TYPES = ["Prepaid", "To Pay", "FOB", "CIF"];
const PACKING_TYPES = ["Standard", "Export Worthy", "Custom", "None"];
const BANK_ACCOUNTS = ["HDFC - 0012345", "ICICI - 0067890", "SBI - 0011223"];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyGeneralInfo = () => ({
  plantId: "",
  belongsTo: "",
  contractNo: "",
  department: "",
  date: "",
  supplierCode: "",
  supplierName: "",
  supplierRefNo: "",
  refDate: "",
  gstState: "",
  validFrom: "",
  validTo: "",
  isIgstAppl: "",
  poType: "",
  gstnNo: "",
  currency: "",
  taxDescription: "",
});

const emptyItemDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  taxType: "",
  taxPercent: "",
  unit: "",
  rate: "",
  inCurrency: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  validFrom: "",
  validTo: "",
});

const emptyTaxDetailRow = () => ({
  particular: "",
  taxPercent: "",
  amount: "",
});

const emptyChargesSummary = () => ({
  modeOfDespatch: "",
  paymentTerms: "",
  delivery: "",
  freightType: "",
  packingType: "",
  insuranceAmount: "",
  bankAccounts: "",
  swiftCode: "",
  checkedBy: "",
  preparedBy: "",
  authorisedBy: "",
  freightForwarder: "",
  notes: "",
  termsConditions: "",
});

const emptyAttachmentRow = () => ({
  fileName: "",
  attachment: null,
});

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "itemDetails", label: "Item Details", kind: "table" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "chargesSummary", label: "Charges Summary", kind: "fields" },
  {
    key: "quotationAttachment",
    label: "Quotation Attachment",
    kind: "attachment",
  },
];

const PurchaseContractForm = ({ data, onBack }) => {
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
  const [chargesSummary, setChargesSummary] = useState({
    ...emptyChargesSummary(),
    ...data?.chargesSummary,
  });
  const [attachmentRows, setAttachmentRows] = useState(
    data?.attachments?.length ? data.attachments : [emptyAttachmentRow()],
  );

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneral((prev) => ({ ...prev, [name]: value }));
  };

  const handleChargesSummaryChange = (e) => {
    const { name, value } = e.target;
    setChargesSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* -- generic handlers for dynamic-table tabs -- */
  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const itemDetailHandlers = makeTableHandlers(
    setItemDetailRows,
    emptyItemDetailRow,
  );
  const taxDetailHandlers = makeTableHandlers(
    setTaxDetailRows,
    emptyTaxDetailRow,
  );
  const attachmentHandlers = makeTableHandlers(
    setAttachmentRows,
    emptyAttachmentRow,
  );

  const handleAddAttachmentFiles = (fileList) => {
    const newRows = Array.from(fileList).map((file) => ({
      fileName: file.name,
      attachment: file,
    }));
    setAttachmentRows((prev) => {
      // drop a single lingering empty row before appending real uploads
      const withoutBlank = prev.filter((r) => r.fileName?.trim());
      return [...withoutBlank, ...newRows];
    });
  };

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
        { key: "itemDescription", label: "Item Description" },
        { key: "hsnSacCode", label: "HSN/SAC Code" },
        {
          key: "taxType",
          label: "Tax Type",
          type: "select",
          options: TAX_TYPES,
        },
        { key: "taxPercent", label: "Tax (%)" },
        { key: "unit", label: "Unit", type: "select", options: UNITS },
        { key: "rate", label: "Rate" },
        {
          key: "inCurrency",
          label: "In Currency",
          type: "select",
          options: CURRENCIES,
        },
        { key: "sgstRate", label: "SGST Rate" },
        { key: "sgstAmount", label: "SGST Amount" },
        { key: "cgstRate", label: "CGST Rate" },
        { key: "cgstAmount", label: "CGST Amount" },
        { key: "igstRate", label: "IGST Rate" },
        { key: "igstAmount", label: "IGST Amount" },
        { key: "validFrom", label: "Valid From", type: "date" },
        { key: "validTo", label: "Valid To", type: "date" },
      ],
    },
    taxDetails: {
      rows: taxDetailRows,
      handlers: taxDetailHandlers,
      columns: [
        { key: "particular", label: "Particular" },
        { key: "taxPercent", label: "Tax (%)" },
        { key: "amount", label: "Amount" },
      ],
    },
  };

  const validate = () => {
    const errors = {};

    if (!general.plantId) errors.plantId = "Plant ID is required";
    if (!general.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!general.contractNo?.trim())
      errors.contractNo = "Contract No is required";
    if (!general.department) errors.department = "Department is required";
    if (!general.date) errors.date = "Date is required";
    if (!general.supplierCode?.trim())
      errors.supplierCode = "Supplier Code is required";
    if (!general.supplierName?.trim())
      errors.supplierName = "Supplier Name is required";
    if (!general.gstState) errors.gstState = "GST State is required";
    if (!general.validFrom) errors.validFrom = "Valid From is required";
    if (!general.validTo) errors.validTo = "Valid To is required";
    if (
      general.validFrom &&
      general.validTo &&
      general.validTo < general.validFrom
    )
      errors.validTo = "Valid To cannot be before Valid From";
    if (!general.isIgstAppl) errors.isIgstAppl = "This field is required";
    if (!general.poType) errors.poType = "P.O Type is required";
    if (!general.gstnNo?.trim()) errors.gstnNo = "GSTN No is required";
    if (!general.currency) errors.currency = "Currency is required";

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
      taxDetails: taxDetailRows.filter((r) => r.particular?.trim()),
      chargesSummary,
      // NOTE: attachment files need multipart/FormData handling on the API
      // layer once the upload endpoint is confirmed — sending file names only.
      attachments: attachmentRows
        .filter((r) => r.fileName?.trim())
        .map((r) => ({ fileName: r.fileName })),
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response = await purchaseContractAPI.createUpdateContract(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Purchase Contract updated successfully!"
              : "Purchase Contract created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Purchase Contract.",
        );
      }
    } catch (err) {
      console.error("Save Purchase Contract Error:", err);
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
          {data
            ? "Edit Purchase Contract (Open)"
            : "Add Purchase Contract (Open)"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- General Info ---------------- */}
        <div>
          <SectionHeader>Purchase Contract (Open) Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={general.plantId}
              onChange={handleGeneralChange}
              error={fieldErrors.plantId}
              options={PLANT_IDS}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={general.belongsTo}
              onChange={handleGeneralChange}
              error={fieldErrors.belongsTo}
              options={BELONGS_TO}
              required
            />
            <Field
              label="Contract No"
              name="contractNo"
              value={general.contractNo}
              onChange={handleGeneralChange}
              error={fieldErrors.contractNo}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={general.department}
              onChange={handleGeneralChange}
              error={fieldErrors.department}
              options={DEPARTMENTS}
              required
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={general.date}
              onChange={handleGeneralChange}
              error={fieldErrors.date}
              required
            />
            <Field
              label="Supplier Code"
              name="supplierCode"
              value={general.supplierCode}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierCode}
              required
            />
            <Field
              label="Supplier Name"
              name="supplierName"
              value={general.supplierName}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierName}
              required
            />
            <Field
              label="Supplier Ref. No."
              name="supplierRefNo"
              value={general.supplierRefNo}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={general.refDate}
              onChange={handleGeneralChange}
            />
            <Field
              type="select"
              label="GST State"
              name="gstState"
              value={general.gstState}
              onChange={handleGeneralChange}
              error={fieldErrors.gstState}
              options={GST_STATES}
              required
            />
            <Field
              type="date"
              label="Valid From"
              name="validFrom"
              value={general.validFrom}
              onChange={handleGeneralChange}
              error={fieldErrors.validFrom}
              required
            />
            <Field
              type="date"
              label="Valid To"
              name="validTo"
              value={general.validTo}
              onChange={handleGeneralChange}
              error={fieldErrors.validTo}
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
              type="select"
              label="P.O Type"
              name="poType"
              value={general.poType}
              onChange={handleGeneralChange}
              error={fieldErrors.poType}
              options={PO_TYPES}
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
              label="Tax Description"
              name="taxDescription"
              value={general.taxDescription}
              onChange={handleGeneralChange}
              className="col-span-2"
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

            {(activeTabMeta.kind === "table" ||
              activeTabMeta.kind === "attachment") && (
              <button
                type="button"
                onClick={() =>
                  activeTabMeta.kind === "attachment"
                    ? attachmentHandlers.onAddRow()
                    : childTabConfig[activeChildTab].handlers.onAddRow()
                }
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Active tab content */}
          {activeTabMeta.kind === "table" && (
            <DynamicTable
              columns={childTabConfig[activeChildTab].columns}
              rows={childTabConfig[activeChildTab].rows}
              onCellChange={
                childTabConfig[activeChildTab].handlers.onCellChange
              }
              onRemoveRow={childTabConfig[activeChildTab].handlers.onRemoveRow}
            />
          )}

          {activeTabMeta.kind === "attachment" && (
            <div className="pt-3">
              <AttachmentTable
                rows={attachmentRows}
                onCellChange={attachmentHandlers.onCellChange}
                onRemoveRow={attachmentHandlers.onRemoveRow}
                onAddFiles={handleAddAttachmentFiles}
              />
            </div>
          )}

          {activeTabMeta.kind === "fields" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Mode Of Despatch"
                  name="modeOfDespatch"
                  value={chargesSummary.modeOfDespatch}
                  onChange={handleChargesSummaryChange}
                  options={MODE_OF_DESPATCH}
                />
                <Field
                  label="Payment Terms"
                  name="paymentTerms"
                  value={chargesSummary.paymentTerms}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  label="Delivery"
                  name="delivery"
                  value={chargesSummary.delivery}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  type="select"
                  label="Freight Type"
                  name="freightType"
                  value={chargesSummary.freightType}
                  onChange={handleChargesSummaryChange}
                  options={FREIGHT_TYPES}
                />
                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={chargesSummary.packingType}
                  onChange={handleChargesSummaryChange}
                  options={PACKING_TYPES}
                />
                <Field
                  label="Insurance Amount"
                  name="insuranceAmount"
                  value={chargesSummary.insuranceAmount}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  type="select"
                  label="Bank Accounts"
                  name="bankAccounts"
                  value={chargesSummary.bankAccounts}
                  onChange={handleChargesSummaryChange}
                  options={BANK_ACCOUNTS}
                />
                <Field
                  label="Swift Code"
                  name="swiftCode"
                  value={chargesSummary.swiftCode}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  label="Checked By"
                  name="checkedBy"
                  value={chargesSummary.checkedBy}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  label="Prepared By"
                  name="preparedBy"
                  value={chargesSummary.preparedBy}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  label="Authorised By"
                  name="authorisedBy"
                  value={chargesSummary.authorisedBy}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  label="Freight Forwarder"
                  name="freightForwarder"
                  value={chargesSummary.freightForwarder}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Notes"
                  name="notes"
                  value={chargesSummary.notes}
                  onChange={handleChargesSummaryChange}
                  className="col-span-2 xl:col-span-3"
                />
                <Field
                  type="textarea"
                  label="Terms &amp; Conditions"
                  name="termsConditions"
                  value={chargesSummary.termsConditions}
                  onChange={handleChargesSummaryChange}
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

export default PurchaseContractForm;
