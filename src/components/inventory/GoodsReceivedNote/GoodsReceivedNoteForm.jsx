import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  FileUp,
  FileText,
} from "lucide-react";
import { useState } from "react";
import goodsReceivedNoteAPI from "../../../api/Inventory/goodsReceivedNoteAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to PurchaseContractForm / PartyMasterForm  */

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
/* Shared building blocks - identical to PurchaseContractForm / PartyMasterForm */

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
/* Table helpers - identical to PurchaseContractForm / PartyMasterForm         */

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

const InputCell = ({ value, onChange, type = "text", disabled }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${cellInputClasses} ${
        disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
      }`}
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
                disabled={col.readOnly}
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
/* Attachment tab - drag/drop upload zone, same pattern as PurchaseContractForm */

const AttachmentDropCell = ({ rowId, file, onFileChange }) => (
  <td className="p-2 align-top">
    <label
      htmlFor={`invoice-file-${rowId}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onFileChange(dropped);
      }}
      className="flex flex-col items-center justify-center gap-1 h-24 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors text-center px-2"
    >
      {file ? (
        <>
          <FileText className="h-5 w-5 text-blue-500" />
          <span className="text-[11px] text-gray-700 dark:text-gray-200 truncate max-w-[220px]">
            {file.name}
          </span>
        </>
      ) : (
        <>
          <FileUp className="h-5 w-5 text-gray-400" />
          <span className="text-[11px] text-gray-400">
            Drop files here or click to upload
          </span>
        </>
      )}
    </label>
    <input
      id={`invoice-file-${rowId}`}
      type="file"
      accept="application/pdf,image/*"
      className="hidden"
      onChange={(e) => {
        const selected = e.target.files?.[0];
        if (selected) onFileChange(selected);
        e.target.value = "";
      }}
    />
  </td>
);

const AttachmentTable = ({ rows, onFileChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["S.No", "Invoice Copy", "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <tr
          key={row.rowId}
          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td className="p-1 text-center font-medium dark:text-white align-top pt-3">
            {idx + 1}
          </td>
          <AttachmentDropCell
            rowId={row.rowId}
            file={row.file}
            onFileChange={(file) => onFileChange(idx, file)}
          />
          <td className="p-1 text-center align-top pt-3">
            <button
              type="button"
              onClick={() => onRemoveRow(idx)}
              disabled={rows.length <= 1}
              className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                rows.length <= 1
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
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const YES_NO = ["YES", "NO"];
const LOCATIONS = ["MAIN STORE", "WIP STORE", "FG STORE", "QC HOLD"];
const GST_STATES = [
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Delhi",
  "Gujarat",
];
const DEALER_TYPES = ["MANUFACTURER", "TRADER", "IMPORTER", "SERVICE PROVIDER"];
const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "UAE",
  "Singapore",
];
const CURRENCIES = ["RS", "USD", "EUR", "GBP"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];
const ITEM_TAX_TYPES = ["Taxable", "Exempt", "Nil Rated"];

/* ---------------------------------------------------------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyHeader = () => ({
  plantId: "",
  grnNo: "",
  belongsTo: "",
  grnDate: todayISO(),
  location: "",
  supplierName: "",
  gstState: "",
  supplierCode: "",
  address: "",
  isIgstAppl: "",
  gatePassNo: "",
  gstnNo: "",
  poNo: "",
  dealerType: "",
  scheduleNo: "",
  country: "",
  isReverseChrg: "",
  scheduleDate: "",
  schStartDate: "",
  currency: "RS",
  schEndDate: "",
  exchangeRate: "",
  grnClearTime: "",
  grossAmt: "",
  modvatCopyReceived: "",
  totalQtyInKg: "",
  partyDcNoInvNo: "",
  discountPct: "",
  supplierDcDate: "",
  taxCode: "",
  eSugamNo: "",
  eSugamNoYesNo: "",
  // attchk / ncchk - unlabeled checkbox-like fields from the spec, best-guess
  // read as "Attachment Check" and "No Challan Check" - see chat notes
  attachmentCheck: false,
  noChallanCheck: false,
});

const emptySummary = () => ({
  netAmount: "",
  totAmtTax: "",
  basicAmount: "",
  invoiceSentOn: "",
  remarks: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  taxType: "",
  taxPct: "",
  primaryUnit: "",
  stock: "",
  purchaseTolerance: "",
  inspectionable: "",
  manufacturedDate: "",
  poRate: "",
  poQty: "",
  poUnit: "",
  challanQty: "",
  storeStock: "",
  pendingQty: "",
  receivedQty: "",
  receivedUnit: "",
  conversionFactor: "",
  recQtyInPrimaryUnit: "",
  acceptQty: "",
  accQtyInPrimaryUnit: "",
  accUnit: "",
  rejectQty: "",
  rejQtyInPrimaryUnit: "",
  excessQty: "",
  itemMaxQty: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  apportionedCost: "",
  insurance: "",
  // handchrg / lcost - best-guess read as "Handling Charges" and "Landing
  // Cost" (distinct from the later "Landed Cost Rate") - see chat notes
  handlingCharges: "",
  landingCost: "",
  landedCostRate: "",
  landedValue: "",
});

const emptyTaxDetailRow = () => ({
  particulars: "",
  taxPct: "",
  // taxval1 - best-guess read as "Taxable Value" - see chat notes
  taxableValue: "",
  taxAmount: "",
});

let attachmentRowIdCounter = 1;
const emptyAttachmentRow = () => ({
  rowId: `att-${attachmentRowIdCounter++}`,
  file: null,
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Purchase Detail / Tax Details are tables, Summary is a field   */
/* grid, Attached Invoice Copy is the drag/drop upload table                   */

const CHILD_TABS = [
  { key: "purchaseDetail", label: "1-Purchase Detail", type: "table" },
  { key: "taxDetails", label: "2-Tax Details", type: "table" },
  { key: "summary", label: "3-Summary", type: "fields" },
  { key: "invoiceCopy", label: "4-Attached Invoice Copy", type: "attachment" },
];

const GoodsReceivedNoteForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("purchaseDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState({
    ...emptyHeader(),
    ...editData?.header,
  });

  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...editData?.summary,
  });

  const [itemRows, setItemRows] = useState(
    editData?.purchaseDetails?.length
      ? editData.purchaseDetails
      : [emptyItemRow()],
  );
  const [taxDetailRows, setTaxDetailRows] = useState(
    editData?.taxDetails?.length ? editData.taxDetails : [emptyTaxDetailRow()],
  );
  const [attachmentRows, setAttachmentRows] = useState(
    editData?.invoiceCopies?.length
      ? editData.invoiceCopies.map((a) => ({
          rowId: `att-${attachmentRowIdCounter++}`,
          file: a.file || null,
        }))
      : [emptyAttachmentRow()],
  );

  const handleHeaderChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const itemHandlers = makeTableHandlers(setItemRows, emptyItemRow);
  const taxDetailHandlers = makeTableHandlers(
    setTaxDetailRows,
    emptyTaxDetailRow,
  );

  const handleAttachmentFileChange = (idx, file) => {
    setAttachmentRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, file } : row)),
    );
  };
  const handleAttachmentAddRow = () =>
    setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);
  const handleAttachmentRemoveRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  // Config-driven lookup, same pattern as PurchaseContractForm's childTabConfig
  const childTabConfig = {
    purchaseDetail: {
      type: "table",
      rows: itemRows,
      handlers: itemHandlers,
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
          options: ITEM_TAX_TYPES,
        },
        { key: "taxPct", label: "Tax (%)", type: "number" },
        {
          key: "primaryUnit",
          label: "Primary Unit",
          type: "select",
          options: UNITS,
        },
        { key: "stock", label: "Stock?", type: "select", options: YES_NO },
        {
          key: "purchaseTolerance",
          label: "Purchase Tolerance",
          type: "number",
        },
        {
          key: "inspectionable",
          label: "Inspectionable?",
          type: "select",
          options: YES_NO,
        },
        { key: "manufacturedDate", label: "Manufactured Date", type: "date" },
        { key: "poRate", label: "P.O./P.C. Rate", type: "number" },
        { key: "poQty", label: "P.O. Qty", type: "number", readOnly: true },
        { key: "poUnit", label: "PO Unit", type: "select", options: UNITS },
        { key: "challanQty", label: "Challan Qty", type: "number" },
        {
          key: "storeStock",
          label: "Store Stock",
          type: "number",
          readOnly: true,
        },
        {
          key: "pendingQty",
          label: "Pending Qty",
          type: "number",
          readOnly: true,
        },
        { key: "receivedQty", label: "Received Qty", type: "number" },
        {
          key: "receivedUnit",
          label: "Received Unit",
          type: "select",
          options: UNITS,
        },
        { key: "conversionFactor", label: "Conversion Factor", type: "number" },
        {
          key: "recQtyInPrimaryUnit",
          label: "Rec Qty In Primary Unit",
          type: "number",
        },
        { key: "acceptQty", label: "Accept Qty.", type: "number" },
        {
          key: "accQtyInPrimaryUnit",
          label: "Acc Qty In Primary Unit",
          type: "number",
        },
        { key: "accUnit", label: "Acc. Unit", type: "select", options: UNITS },
        { key: "rejectQty", label: "Reject Qty", type: "number" },
        {
          key: "rejQtyInPrimaryUnit",
          label: "Rej Qty In Primary Unit",
          type: "number",
        },
        { key: "excessQty", label: "Excess Qty", type: "number" },
        {
          key: "itemMaxQty",
          label: "Item Max Qty",
          type: "number",
          readOnly: true,
        },
        { key: "amount", label: "Amount", type: "number" },
        { key: "sgstRate", label: "SGST Rate", type: "number" },
        { key: "sgstAmount", label: "SGST Amount", type: "number" },
        { key: "cgstRate", label: "CGST Rate", type: "number" },
        { key: "cgstAmount", label: "CGST Amount", type: "number" },
        { key: "igstRate", label: "IGST Rate", type: "number" },
        { key: "igstAmount", label: "IGST Amount", type: "number" },
        { key: "apportionedCost", label: "Apportioned Cost", type: "number" },
        { key: "insurance", label: "Insurance", type: "number" },
        { key: "handlingCharges", label: "Handling Charges", type: "number" },
        { key: "landingCost", label: "Landing Cost", type: "number" },
        { key: "landedCostRate", label: "Landed Cost Rate", type: "number" },
        { key: "landedValue", label: "Landed Value", type: "number" },
      ],
    },
    taxDetails: {
      type: "table",
      rows: taxDetailRows,
      handlers: taxDetailHandlers,
      columns: [
        { key: "particulars", label: "Particulars" },
        { key: "taxPct", label: "Tax%", type: "number" },
        { key: "taxableValue", label: "Taxable Value", type: "number" },
        { key: "taxAmount", label: "Tax Amount", type: "number" },
      ],
    },
    summary: {
      type: "fields",
    },
    invoiceCopy: {
      type: "attachment",
      rows: attachmentRows,
    },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    } else if (activeTabConfig.type === "attachment") {
      handleAttachmentAddRow();
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.grnDate) errors.grnDate = "GRN Date is required";
    if (!header.location) errors.location = "Location is required";
    if (!header.supplierName.trim())
      errors.supplierName = "Supplier Name is required";
    if (!header.supplierCode.trim())
      errors.supplierCode = "Supplier Code is required";
    if (!header.isIgstAppl) errors.isIgstAppl = "This field is required";
    if (!header.poNo.trim()) errors.poNo = "PO No/ PC No is required";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(editData?.id && { id: editData.id }),
      header,
      summary,
      purchaseDetails: itemRows,
      taxDetails: taxDetailRows,
      // Files aren't JSON-serializable - actual upload happens via
      // goodsReceivedNoteAPI.uploadInvoiceCopy per row, this just carries names.
      invoiceCopies: attachmentRows
        .filter((row) => row.file)
        .map((row) => ({ fileName: row.file.name })),
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving GRN Payload:", payload);

    try {
      const response = await goodsReceivedNoteAPI.updateCreateGrn(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const savedId = response?.paramObjectsMap?.id || editData?.id;

        const filesToUpload = attachmentRows.filter((row) => row.file);
        for (const row of filesToUpload) {
          try {
            await goodsReceivedNoteAPI.uploadInvoiceCopy(savedId, row.file);
          } catch (uploadError) {
            console.error("Invoice copy upload failed:", uploadError);
          }
        }

        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save GRN";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Goods Received Note.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {editData ? "Edit Goods Received Note" : "Goods Received Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>GRN Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={PLANT_IDS}
              required
            />
            <Field
              label="GRN No"
              name="grnNo"
              value={header.grnNo || "Auto"}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Belongs to"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO}
            />
            <Field
              type="date"
              label="GRN Date"
              name="grnDate"
              value={header.grnDate}
              onChange={handleHeaderChange}
              error={fieldErrors.grnDate}
              required
            />
            <Field
              type="select"
              label="Location"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
              error={fieldErrors.location}
              options={LOCATIONS}
              required
            />
            <Field
              label="Supplier Name"
              name="supplierName"
              value={header.supplierName}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierName}
              required
            />
            <Field
              type="select"
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
              options={GST_STATES}
            />
            <Field
              label="Supplier Code"
              name="supplierCode"
              value={header.supplierCode}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierCode}
              required
            />
            <Field
              label="Address"
              name="address"
              value={header.address}
              onChange={handleHeaderChange}
              className="col-span-2"
            />
            <Field
              type="select"
              label="IsIGSTAppl"
              name="isIgstAppl"
              value={header.isIgstAppl}
              onChange={handleHeaderChange}
              error={fieldErrors.isIgstAppl}
              options={YES_NO}
              required
            />
            <Field
              label="Gate Pass No"
              name="gatePassNo"
              value={header.gatePassNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="GSTNNo"
              name="gstnNo"
              value={header.gstnNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="PO No/ PC No"
              name="poNo"
              value={header.poNo}
              onChange={handleHeaderChange}
              error={fieldErrors.poNo}
              required
            />
            <Field
              type="select"
              label="Dealer Type"
              name="dealerType"
              value={header.dealerType}
              onChange={handleHeaderChange}
              options={DEALER_TYPES}
            />
            <Field
              label="Schedule No."
              name="scheduleNo"
              value={header.scheduleNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Country"
              name="country"
              value={header.country}
              onChange={handleHeaderChange}
              options={COUNTRIES}
            />
            <Field
              type="select"
              label="Is Reverse Chrg"
              name="isReverseChrg"
              value={header.isReverseChrg}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              type="date"
              label="Schedule Date"
              name="scheduleDate"
              value={header.scheduleDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={header.schStartDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Currency"
              name="currency"
              value={header.currency}
              onChange={handleHeaderChange}
              options={CURRENCIES}
            />
            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={header.schEndDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Exchange Rate"
              name="exchangeRate"
              value={header.exchangeRate}
              onChange={handleHeaderChange}
            />
            <Field
              type="time"
              label="GRN Clear Time"
              name="grnClearTime"
              value={header.grnClearTime}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Gross Amt"
              name="grossAmt"
              value={header.grossAmt}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Modvat Copy Received"
              name="modvatCopyReceived"
              value={header.modvatCopyReceived}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              type="number"
              label="Total Qty In Kg"
              name="totalQtyInKg"
              value={header.totalQtyInKg}
              onChange={handleHeaderChange}
            />
            <Field
              label="Party Dc No./Inv. No."
              name="partyDcNoInvNo"
              value={header.partyDcNoInvNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Discount%"
              name="discountPct"
              value={header.discountPct}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Supplier DC Date"
              name="supplierDcDate"
              value={header.supplierDcDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="Tax Code"
              name="taxCode"
              value={header.taxCode}
              onChange={handleHeaderChange}
            />
            <Field
              label="e-Sugam No."
              name="eSugamNo"
              value={header.eSugamNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="e-Sugam No. Yes/No ?"
              name="eSugamNoYesNo"
              value={header.eSugamNoYesNo}
              onChange={handleHeaderChange}
              options={YES_NO}
            />

            {/* attchk / ncchk - best-guess checkboxes, see chat notes */}
            <div>
              <label className={labelClasses}>Attachment Check</label>
              <div className="h-[30px] flex items-center">
                <input
                  type="checkbox"
                  name="attachmentCheck"
                  checked={header.attachmentCheck}
                  onChange={handleHeaderChange}
                  className="h-4 w-4"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>No Challan Check</label>
              <div className="h-[30px] flex items-center">
                <input
                  type="checkbox"
                  name="noChallanCheck"
                  checked={header.noChallanCheck}
                  onChange={handleHeaderChange}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
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

            {(activeTabConfig.type === "table" ||
              activeTabConfig.type === "attachment") && (
              <button
                type="button"
                onClick={handleAddChildRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Active tab's content */}
          {activeTabConfig.type === "table" && (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          )}

          {activeTabConfig.type === "attachment" && (
            <AttachmentTable
              rows={activeTabConfig.rows}
              onFileChange={handleAttachmentFileChange}
              onRemoveRow={handleAttachmentRemoveRow}
            />
          )}

          {activeTabConfig.type === "fields" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Net Amount"
                  name="netAmount"
                  value={summary.netAmount}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Tot Amt Tax"
                  name="totAmtTax"
                  value={summary.totAmtTax}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Basic Amount"
                  name="basicAmount"
                  value={summary.basicAmount}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="date"
                  label="Invoice Sent On"
                  name="invoiceSentOn"
                  value={summary.invoiceSentOn}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
              </div>
            </div>
          )}
        </section>

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

export default GoodsReceivedNoteForm;
