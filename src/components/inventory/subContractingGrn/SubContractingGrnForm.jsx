import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { subContractingGrnAPI } from "../../../api/Inventory/subContractingGrnAPI";
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

/* Generic dynamic table body. Supports text / select / date / readonly columns.
   Pass `lookup` to auto-fill sibling columns when a given column changes
   (e.g. selecting Item Code fills Item Desc / Unit / etc. from a master map),
   mirroring the pattern used in Stock Transfer's Bin Transfer table. */
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
/* Attachment tab: dropzone + file table                                       */

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
        <TableHead headers={["#", "Invoice Copy", "Action"]} />
        <tbody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              index={idx}
              onRemove={() => onRemoveRow(idx)}
              disabled={rows.length <= 1}
            >
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
/* Item master lookups (swap for real API-driven catalogs)                     */
/* stk / bflag / gcontrol1 are internal identifiers auto-populated from the    */
/* selected item code - kept on the row but not rendered as columns.           */

const INCOMING_ITEM_MASTER = {
  "RM-001": {
    stk: "STK-1001",
    incomingItemDesc: "Raw Material - Steel Sheet",
    tolerance: "2",
    primaryUnit: "KG",
  },
  "RM-002": {
    stk: "STK-1002",
    incomingItemDesc: "Raw Material - Aluminium Rod",
    tolerance: "1.5",
    primaryUnit: "KG",
  },
  "COMP-001": {
    stk: "STK-1003",
    incomingItemDesc: "Component - Bracket Assembly",
    tolerance: "0",
    primaryUnit: "NOS",
  },
};
const INCOMING_ITEM_CODES = Object.keys(INCOMING_ITEM_MASTER);

const OUTGOING_ITEM_MASTER = {
  "FG-001": {
    bflag: "Y",
    gcontrol1: "GC-01",
    outgoingItemDesc: "Finished Good - Assembled Unit",
    unit: "NOS",
    itemType: "Finished Good",
    bomQty: "1",
    availableStock: "500",
    bomScrap: "2",
    rate: "150.00",
  },
  "SF-001": {
    bflag: "N",
    gcontrol1: "GC-02",
    outgoingItemDesc: "Semi-Finished - Machined Part",
    unit: "NOS",
    itemType: "Semi-Finished",
    bomQty: "1",
    availableStock: "1200",
    bomScrap: "1",
    rate: "80.00",
  },
};
const OUTGOING_ITEM_CODES = Object.keys(OUTGOING_ITEM_MASTER);

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
const VENDOR_LOCATIONS = ["Local", "Inter-State", "SEZ", "Overseas"];
const GST_TYPES = ["Registered", "Unregistered", "Composition"];
const TAX_TYPES = ["GST", "IGST", "Exempt", "Nil Rated"];
const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const LOCATIONS = [
  "Main Store",
  "WIP Store",
  "Finished Goods Store",
  "QC Hold",
];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyGeneralInfo = () => ({
  plantId: "",
  scGrnNo: "",
  belongsTo: "",
  date: "",
  department: "",
  vendorName: "",
  vendorId: "",
  gstState: "",
  vendorLocation: "",
  isIgstAppl: "",
  gatePassNo: "",
  gstnNo: "",
  scheduleNo: "",
  gstType: "",
  rework: "NO",
  isRevsChrg: "",
  rcmDate: "",
  serviceName: "",
  schStartDate: "",
  sacCode: "",
  schEndDate: "",
  taxType: "",
  contractNo: "",
  taxPercent: "",
  supplierDcNo: "",
  taxCode: "",
  supplierDcDate: "",
  grnClearTime: "",
});

const emptyGrnDetailRow = () => ({
  incomingItemCode: "",
  stk: "",
  incomingItemDesc: "",
  tolerance: "",
  primaryUnit: "",
  jobOrderNo: "",
  jobOrderQty: "",
  joRate: "",
  gatePassQty: "",
  inspectionable: "",
  pendingQty: "",
  receivedQty: "",
  excessQty: "",
  qtyInPrimaryUnit: "",
  location: "",
  acceptedQty: "",
  accQtyInPrimaryUnit: "",
  rejectedQty: "",
  rejQtyInPrimaryUnit: "",
  amount: "",
  joRmCostAmount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  ratePrimaryUnit: "",
});

const emptyTaxDetailRow = () => ({
  particulars: "",
  taxAmount: "",
});

const emptySummary = () => ({
  basicAmount: "",
  totalAmount: "",
  totalTax: "",
  remarks: "",
});

const emptyAttachmentRow = () => ({
  attachment: null,
});

const emptyConsumptionScrapRow = () => ({
  outgoingItemCode: "",
  bflag: "",
  gcontrol1: "",
  outgoingItemDesc: "",
  unit: "",
  itemType: "",
  bomQty: "",
  availableStock: "",
  consumedQty: "",
  scrapItem: "",
  bomScrap: "",
  scrapQty: "",
  rate: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "grnDetail", label: "GRN Detail", kind: "table" },
  { key: "taxDetails", label: "Tax details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
  { key: "invoiceCopy", label: "Attached Invoice Copy", kind: "attachment" },
  { key: "consumptionScrap", label: "Consumption/Scrap", kind: "table" },
];

const SubContractingGrnForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("grnDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [general, setGeneral] = useState({
    ...emptyGeneralInfo(),
    ...data?.general,
  });

  const [grnDetailRows, setGrnDetailRows] = useState(
    data?.grnDetail?.length ? data.grnDetail : [emptyGrnDetailRow()],
  );
  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });
  const [attachmentRows, setAttachmentRows] = useState(
    data?.invoiceCopy?.length ? data.invoiceCopy : [emptyAttachmentRow()],
  );
  const [consumptionScrapRows, setConsumptionScrapRows] = useState(
    data?.consumptionScrap?.length
      ? data.consumptionScrap
      : [emptyConsumptionScrapRow()],
  );

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneral((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* -- generic handler for plain dynamic-table tabs (no lookups) -- */
  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  /* -- handler for item-code driven tables that auto-fill sibling columns -- */
  const makeLookupTableHandlers = (setter, emptyRow, lookupKey, lookupMap) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => {
          if (i !== idx) return row;
          if (key === lookupKey) {
            const master = lookupMap[value] || {};
            return { ...row, [lookupKey]: value, ...master };
          }
          return { ...row, [key]: value };
        }),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const grnDetailHandlers = makeLookupTableHandlers(
    setGrnDetailRows,
    emptyGrnDetailRow,
    "incomingItemCode",
    INCOMING_ITEM_MASTER,
  );
  const taxDetailHandlers = makeTableHandlers(
    setTaxDetailRows,
    emptyTaxDetailRow,
  );
  const consumptionScrapHandlers = makeLookupTableHandlers(
    setConsumptionScrapRows,
    emptyConsumptionScrapRow,
    "outgoingItemCode",
    OUTGOING_ITEM_MASTER,
  );
  const attachmentHandlers = makeTableHandlers(
    setAttachmentRows,
    emptyAttachmentRow,
  );

  const handleAddAttachmentFiles = (fileList) => {
    const newRows = Array.from(fileList).map((file) => ({ attachment: file }));
    setAttachmentRows((prev) => {
      const withoutBlank = prev.filter((r) => r.attachment);
      return [...withoutBlank, ...newRows];
    });
  };

  const childTabConfig = {
    grnDetail: {
      rows: grnDetailRows,
      handlers: grnDetailHandlers,
      columns: [
        {
          key: "incomingItemCode",
          label: "Incoming Item Code",
          type: "select",
          options: INCOMING_ITEM_CODES,
        },
        {
          key: "incomingItemDesc",
          label: "Incoming Item Desc",
          readOnly: true,
        },
        { key: "tolerance", label: "Tolerance", readOnly: true },
        { key: "primaryUnit", label: "Primary Unit", readOnly: true },
        { key: "jobOrderNo", label: "Job Order No" },
        { key: "jobOrderQty", label: "Job Order Qty" },
        { key: "joRate", label: "JO Rate" },
        { key: "gatePassQty", label: "Gate Pass Qty" },
        {
          key: "inspectionable",
          label: "Inspectionable",
          type: "select",
          options: YES_NO,
        },
        { key: "pendingQty", label: "Pending Qty" },
        { key: "receivedQty", label: "Received Qty" },
        { key: "excessQty", label: "Excess Qty" },
        { key: "qtyInPrimaryUnit", label: "Qty In Primary Unit" },
        {
          key: "location",
          label: "Location",
          type: "select",
          options: LOCATIONS,
        },
        { key: "acceptedQty", label: "Accepted Qty" },
        { key: "accQtyInPrimaryUnit", label: "Acc Qty In Primary Unit" },
        { key: "rejectedQty", label: "Rejected Qty" },
        { key: "rejQtyInPrimaryUnit", label: "Rej Qty In Primary Unit" },
        { key: "amount", label: "Amount" },
        { key: "joRmCostAmount", label: "Jo+RM Cost Amount" },
        { key: "sgstRate", label: "SGST Rate" },
        { key: "sgstAmount", label: "SGST Amount" },
        { key: "cgstRate", label: "CGST Rate" },
        { key: "cgstAmount", label: "CGST Amount" },
        { key: "igstRate", label: "IGST Rate" },
        { key: "igstAmount", label: "IGST Amount" },
        { key: "ratePrimaryUnit", label: "Rate In Primary Unit" },
      ],
    },
    taxDetails: {
      rows: taxDetailRows,
      handlers: taxDetailHandlers,
      columns: [
        { key: "particulars", label: "Particulars" },
        { key: "taxAmount", label: "Tax Amount" },
      ],
    },
    consumptionScrap: {
      rows: consumptionScrapRows,
      handlers: consumptionScrapHandlers,
      columns: [
        {
          key: "outgoingItemCode",
          label: "OutGoing Item Code",
          type: "select",
          options: OUTGOING_ITEM_CODES,
        },
        {
          key: "outgoingItemDesc",
          label: "OutGoing Item Desc",
          readOnly: true,
        },
        { key: "unit", label: "Unit", readOnly: true },
        { key: "itemType", label: "Item Type", readOnly: true },
        { key: "bomQty", label: "Bom Qty", readOnly: true },
        { key: "availableStock", label: "Available Stock", readOnly: true },
        { key: "consumedQty", label: "Consumed Qty" },
        {
          key: "scrapItem",
          label: "Scrap Item",
          type: "select",
          options: YES_NO,
        },
        { key: "bomScrap", label: "Bom Scrap", readOnly: true },
        { key: "scrapQty", label: "Scrap Qty" },
        { key: "rate", label: "Rate", readOnly: true },
        { key: "amount", label: "Amount" },
      ],
    },
  };

  const validate = () => {
    const errors = {};

    if (!general.plantId) errors.plantId = "Plant ID is required";
    if (!general.scGrnNo?.trim()) errors.scGrnNo = "S.C GRN No. is required";
    if (!general.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!general.date) errors.date = "Date is required";
    if (!general.department) errors.department = "Department is required";
    if (!general.vendorName?.trim())
      errors.vendorName = "Vendor Name is required";
    if (!general.vendorId?.trim()) errors.vendorId = "Vendor Id is required";
    if (!general.gstState) errors.gstState = "GST State is required";
    if (!general.isIgstAppl) errors.isIgstAppl = "This field is required";
    if (!general.gatePassNo?.trim())
      errors.gatePassNo = "Gate Pass No. is required";
    if (!general.gstnNo?.trim()) errors.gstnNo = "GSTN No is required";
    if (!general.gstType) errors.gstType = "GST Type is required";
    if (!general.contractNo?.trim())
      errors.contractNo = "Contract No. is required";
    if (!general.supplierDcNo?.trim())
      errors.supplierDcNo = "Supplier DC No. is required";
    if (!general.supplierDcDate)
      errors.supplierDcDate = "Supplier DC Date is required";
    if (
      general.schStartDate &&
      general.schEndDate &&
      general.schEndDate < general.schStartDate
    )
      errors.schEndDate = "Sch. End Date cannot be before Sch. Start Date";

    const hasValidItemRow = grnDetailRows.some(
      (r) => r.incomingItemCode && Number(r.receivedQty) > 0,
    );
    if (!hasValidItemRow)
      errors.grnDetail =
        "Add at least one incoming item with a Received Qty greater than 0";

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
      grnDetail: grnDetailRows.filter((r) => r.incomingItemCode?.trim()),
      taxDetails: taxDetailRows.filter((r) => r.particulars?.trim()),
      summary,
      // NOTE: attachment files need multipart/FormData handling on the API
      // layer once the upload endpoint is confirmed.
      invoiceCopy: attachmentRows
        .filter((r) => r.attachment)
        .map((r) => ({ fileName: r.attachment?.name })),
      consumptionScrap: consumptionScrapRows.filter((r) =>
        r.outgoingItemCode?.trim(),
      ),
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response = await subContractingGrnAPI.createUpdateGrn(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Sub Contracting GRN updated successfully!"
              : "Sub Contracting GRN created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Sub Contracting GRN.",
        );
      }
    } catch (err) {
      console.error("Save Sub Contracting GRN Error:", err);
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
          {data ? "Edit Sub Contracting GRN" : "Add Sub Contracting GRN"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- General Info ---------------- */}
        <div>
          <SectionHeader>Sub Contracting GRN</SectionHeader>
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
              label="S.C GRN No."
              name="scGrnNo"
              value={general.scGrnNo}
              onChange={handleGeneralChange}
              error={fieldErrors.scGrnNo}
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
              type="date"
              label="Date"
              name="date"
              value={general.date}
              onChange={handleGeneralChange}
              error={fieldErrors.date}
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
              label="Vendor Name"
              name="vendorName"
              value={general.vendorName}
              onChange={handleGeneralChange}
              error={fieldErrors.vendorName}
              required
            />
            <Field
              label="Vendor Id"
              name="vendorId"
              value={general.vendorId}
              onChange={handleGeneralChange}
              error={fieldErrors.vendorId}
              required
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
              type="select"
              label="Vendor Location"
              name="vendorLocation"
              value={general.vendorLocation}
              onChange={handleGeneralChange}
              options={VENDOR_LOCATIONS}
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
              label="Gate Pass No."
              name="gatePassNo"
              value={general.gatePassNo}
              onChange={handleGeneralChange}
              error={fieldErrors.gatePassNo}
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
              label="Schedule No"
              name="scheduleNo"
              value={general.scheduleNo}
              onChange={handleGeneralChange}
            />
            <Field
              type="select"
              label="GST Type"
              name="gstType"
              value={general.gstType}
              onChange={handleGeneralChange}
              error={fieldErrors.gstType}
              options={GST_TYPES}
              required
            />
            <Field
              type="select"
              label="Rework"
              name="rework"
              value={general.rework}
              onChange={handleGeneralChange}
              options={YES_NO}
            />
            <Field
              type="select"
              label="Is Revs Chrg"
              name="isRevsChrg"
              value={general.isRevsChrg}
              onChange={handleGeneralChange}
              options={YES_NO}
            />
            <Field
              type="date"
              label="RCM Date"
              name="rcmDate"
              value={general.rcmDate}
              onChange={handleGeneralChange}
            />
            <Field
              label="Service Name"
              name="serviceName"
              value={general.serviceName}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={general.schStartDate}
              onChange={handleGeneralChange}
            />
            <Field
              label="SAC Code"
              name="sacCode"
              value={general.sacCode}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={general.schEndDate}
              onChange={handleGeneralChange}
              error={fieldErrors.schEndDate}
            />
            <Field
              type="select"
              label="Tax Type"
              name="taxType"
              value={general.taxType}
              onChange={handleGeneralChange}
              options={TAX_TYPES}
            />
            <Field
              label="Contract No."
              name="contractNo"
              value={general.contractNo}
              onChange={handleGeneralChange}
              error={fieldErrors.contractNo}
              required
            />
            <Field
              label="Tax (%)"
              name="taxPercent"
              value={general.taxPercent}
              onChange={handleGeneralChange}
            />
            <Field
              label="Supplier DC No."
              name="supplierDcNo"
              value={general.supplierDcNo}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierDcNo}
              required
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
              label="Supplier DC Date"
              name="supplierDcDate"
              value={general.supplierDcDate}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierDcDate}
              required
            />
            <Field
              type="time"
              label="GRN Clear Time"
              name="grnClearTime"
              value={general.grnClearTime}
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
              {activeChildTab === "grnDetail" && fieldErrors.grnDetail && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.grnDetail}
                </p>
              )}
            </div>
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
                  label="Basic Amount"
                  name="basicAmount"
                  value={summary.basicAmount}
                  onChange={handleSummaryChange}
                />
                <Field
                  label="Total Amount"
                  name="totalAmount"
                  value={summary.totalAmount}
                  onChange={handleSummaryChange}
                />
                <Field
                  label="Total Tax"
                  name="totalTax"
                  value={summary.totalTax}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
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

export default SubContractingGrnForm;
