import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to InternalIndentForm / StockTransferForm  */

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
/* Shared building blocks - identical to InternalIndentForm                    */

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
          rows={4}
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
/* Table helpers - identical to InternalIndentForm                             */

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

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const YES_NO = ["YES", "NO"];
const DEPARTMENTS = ["PURCHASE", "PRODUCTION", "QUALITY", "STORES", "ADMIN"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];
const GST_STATES = ["KARNATAKA", "TAMIL NADU", "MAHARASHTRA", "DELHI"];
const TAX_CODES = ["GST0", "GST5", "GST12", "GST18", "GST28"];
const TAX_TYPES = ["SGST+CGST", "IGST", "EXEMPT", "NIL RATED"];
const ITEM_TYPES = ["REGULAR", "CONSUMABLES"];
const DEALER_TYPES = ["REGULAR", "COMPOSITE", "UNREGISTERED"];
const SUPPLIER_CODES = ["SUP-001", "SUP-002", "SUP-003"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY"];
const SHIP_MODES = ["AIR", "SEA", "ROAD", "COURIER"];
const INCOTERMS = ["FOB", "CIF", "CFR", "EXW", "DDP"];
const COUNTRIES = ["CHINA", "USA", "GERMANY", "JAPAN", "SOUTH KOREA"];
const PORTS_OF_LOADING = ["SHANGHAI", "SHENZHEN", "HAMBURG", "SINGAPORE"];
const PORTS_OF_DISCHARGE = ["CHENNAI-INDIA", "MUMBAI-INDIA", "KOLKATA-INDIA"];

const PTYPE_OPTIONS = ["Local", "Import"];
const PTYPE_LOCAL = "Local";
const PTYPE_IMPORT = "Import";

/* ---------------------------------------------------------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---- Common (always visible) header ---- */
const emptyCommonHeader = () => ({
  plant: "",
  ordPlcdDt: todayISO(),
  pType: PTYPE_LOCAL,
});

/* ---- Local Purchase Order header ---- */
const emptyLocalHeader = () => ({
  poNo: "",
  belongsTo: "",
  poDate: todayISO(),
  department: "",
  supplierCode: "",
  supplierName: "",
  gstState: "",
  supplierRefNo: "",
  address: "",
  isIGSTAppl: "NO",
  suppRefDt: todayISO(),
  gstnNo: "",
  taxCode: "",
  isReverseChrg: "NO",
  itemType: "",
  indentRequired: "YES",
  dealerType: "",
});

/* ---- Import Purchase Order header ---- */
const emptyImportHeader = () => ({
  poDate: todayISO(),
  belongsTo: "",
  poNo: "",
  supplierCode: "",
  address: "",
  supplierName: "",
  currency: "",
  shipMode: "AIR",
  exRate: "",
  paymentTerms: "",
  lmeRate: "",
  portOfLoading: "",
  incoterm: "",
  forecloseNo: "",
  countryOfOrigin: "",
  indentRequired: "NO",
  portOfDischarge: "CHENNAI-INDIA",
});

/* ---- Local: row / field templates ---- */
const emptyLocalPODetailRow = () => ({
  indentNo: "",
  indentDate: "",
  itemCode: "",
  itemDescription: "",
  customerPartNo: "",
  hsnSacCode: "",
  taxType: "",
  taxPercent: "",
  purchaseUnit: "",
  indentQty: "",
  pendingIndentQty: "",
  primaryUnit: "",
  poQtyInPurchaseUnit: "",
  qtyInPrimaryUnit: "",
  rateInINR: "",
  discountPercent: "",
  discountAmountINR: "",
  amountInINR: "",
  deliveryDate: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const emptyLocalTaxRow = () => ({
  particulars: "",
  taxPercent: "",
  amount: "",
});

const emptyLocalTerms = () => ({
  termsAndConditions: "",
  remarks: "",
});

/* ---- Import: row / field templates ---- */
const emptyImportItemRow = () => ({
  indentNo: "",
  indentDate: "",
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  uom: "",
  indentQty: "",
  poQty: "",
  fobRateFC: "",
  fobValueFC: "",
  fobRateINR: "",
  fobValueINR: "",
});

const emptyImportTerms = () => ({
  termsAndConditions: "",
  remarks: "",
});

const emptyImportCharges = () => ({
  totFobValueFC: "",
  totFobValueINR: "",
  freightFC: "",
  freightINR: "",
  insuranceFC: "",
  insuranceINR: "",
  otherChargesFC: "",
  otherChargesINR: "",
  totalPOValueFC: "",
  bankCharges: "",
  packingCharges: "",
  surCharges: "",
  totalPOValueINR: "",
  amountInWord: "",
  preparedBy: "",
  checkedBy: "",
  authorisedBy: "",
});

/* ---------------------------------------------------------------------------- */
/* Attachment table (Local -> Quotation Attachment tab)                        */

const AttachmentTable = ({ rows, onFileChange, onRemoveRow, onAddRow }) => (
  <div className="space-y-2 pt-2">
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
                readOnly
                placeholder="No file selected"
                className={cellInputClasses}
              />
            </td>
            <td className="p-1 align-top">
              <label className="flex items-center justify-center gap-1 h-8 px-2 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors">
                <UploadCloud size={12} />
                {row.fileName ? "Replace file" : "Drop file / click to upload"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => onFileChange(idx, e.target.files?.[0])}
                />
              </label>
            </td>
          </TableRow>
        ))}
      </tbody>
    </TableWrapper>

    <button
      type="button"
      onClick={onAddRow}
      className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
    >
      <Plus size={11} />
      Add attachment row
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Terms & Conditions block (shared shape for Local + Import)                  */

const TermsAndConditionsFields = ({ values, onChange }) => (
  <div className="pt-3">
    <div className={fieldGrid}>
      <Field
        type="textarea"
        label="Terms & Conditions"
        name="termsAndConditions"
        value={values.termsAndConditions}
        onChange={onChange}
        className="col-span-2 md:col-span-4 xl:col-span-3"
      />
      <Field
        type="textarea"
        label="Remarks"
        name="remarks"
        value={values.remarks}
        onChange={onChange}
        className="col-span-2 md:col-span-4 xl:col-span-3"
      />
    </div>
  </div>
);

/* ---------------------------------------------------------------------------- */

const PurchaseOrderForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* Common header - always visible, drives which section renders below */
  const [commonHeader, setCommonHeader] = useState({
    ...emptyCommonHeader(),
    ...editData?.commonHeader,
  });

  /* Local Purchase Order state */
  const [localHeader, setLocalHeader] = useState({
    ...emptyLocalHeader(),
    ...editData?.localHeader,
  });
  const [localPODetailRows, setLocalPODetailRows] = useState(
    editData?.localPODetails?.length
      ? editData.localPODetails
      : [emptyLocalPODetailRow()],
  );
  const [localTaxRows, setLocalTaxRows] = useState(
    editData?.localTaxDetails?.length
      ? editData.localTaxDetails
      : [emptyLocalTaxRow()],
  );
  const [localAttachmentRows, setLocalAttachmentRows] = useState(
    editData?.localAttachments?.length
      ? editData.localAttachments
      : [{ fileName: "", file: null }],
  );
  const [localTerms, setLocalTerms] = useState({
    ...emptyLocalTerms(),
    ...editData?.localTerms,
  });
  const [activeLocalTab, setActiveLocalTab] = useState("poDetail");

  /* Import Purchase Order state */
  const [importHeader, setImportHeader] = useState({
    ...emptyImportHeader(),
    ...editData?.importHeader,
  });
  const [importItemRows, setImportItemRows] = useState(
    editData?.importItemDetails?.length
      ? editData.importItemDetails
      : [emptyImportItemRow()],
  );
  const [importTerms, setImportTerms] = useState({
    ...emptyImportTerms(),
    ...editData?.importTerms,
  });
  const [importCharges, setImportCharges] = useState({
    ...emptyImportCharges(),
    ...editData?.importCharges,
  });
  const [activeImportTab, setActiveImportTab] = useState("itemDetail");

  /* ---------------- handlers ---------------- */

  const handleCommonHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setCommonHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setLocalHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setImportHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalTermsChange = (e) => {
    const { name, value } = e.target;
    setLocalTerms((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportTermsChange = (e) => {
    const { name, value } = e.target;
    setImportTerms((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportChargesChange = (e) => {
    const { name, value } = e.target;
    setImportCharges((prev) => ({ ...prev, [name]: value }));
  };

  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const localPODetailHandlers = makeTableHandlers(
    setLocalPODetailRows,
    emptyLocalPODetailRow,
  );
  const localTaxHandlers = makeTableHandlers(setLocalTaxRows, emptyLocalTaxRow);

  const handleAttachmentFileChange = (idx, file) => {
    if (!file) return;
    setLocalAttachmentRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, fileName: file.name, file } : row,
      ),
    );
  };
  const handleAddAttachmentRow = () =>
    setLocalAttachmentRows((prev) => [...prev, { fileName: "", file: null }]);
  const handleRemoveAttachmentRow = (idx) =>
    setLocalAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  const importItemHandlers = makeTableHandlers(
    setImportItemRows,
    emptyImportItemRow,
  );

  /* ---------------- Local child tabs config ---------------- */

  const LOCAL_CHILD_TABS = [
    { key: "poDetail", label: "1-PO Detail", type: "table" },
    { key: "taxDetails", label: "2-Tax Details", type: "table" },
    {
      key: "quotationAttachment",
      label: "3-Quotation Attachment",
      type: "attachment",
    },
    { key: "termsConditions", label: "4-Terms And Conditions", type: "fields" },
  ];

  const localChildTabConfig = {
    poDetail: {
      type: "table",
      rows: localPODetailRows,
      handlers: localPODetailHandlers,
      columns: [
        { key: "indentNo", label: "Indent No." },
        { key: "indentDate", label: "Indent Date", type: "date" },
        {
          key: "itemCode",
          label: "Item Code",
          type: "select",
          options: ITEM_CODES,
        },
        { key: "itemDescription", label: "Item Description" },
        { key: "customerPartNo", label: "Customer Part No" },
        { key: "hsnSacCode", label: "HSN/SAC Code" },
        {
          key: "taxType",
          label: "Tax Type",
          type: "select",
          options: TAX_TYPES,
        },
        { key: "taxPercent", label: "Tax (%)", type: "number" },
        {
          key: "purchaseUnit",
          label: "Purchase Unit",
          type: "select",
          options: UNITS,
        },
        { key: "indentQty", label: "Indent Qty.", type: "number" },
        {
          key: "pendingIndentQty",
          label: "Pending Indent Qty",
          type: "number",
        },
        {
          key: "primaryUnit",
          label: "Primary Unit",
          type: "select",
          options: UNITS,
        },
        {
          key: "poQtyInPurchaseUnit",
          label: "P.O. Qty In Purchase Unit",
          type: "number",
        },
        {
          key: "qtyInPrimaryUnit",
          label: "Qty In Primary Unit",
          type: "number",
        },
        { key: "rateInINR", label: "Rate In INR", type: "number" },
        { key: "discountPercent", label: "Discount %", type: "number" },
        {
          key: "discountAmountINR",
          label: "Discount Amount INR",
          type: "number",
        },
        { key: "amountInINR", label: "Amount In INR", type: "number" },
        { key: "deliveryDate", label: "Delivery Date", type: "date" },
        { key: "sgstRate", label: "SGST Rate", type: "number" },
        { key: "sgstAmount", label: "SGST Amount", type: "number" },
        { key: "cgstRate", label: "CGST Rate", type: "number" },
        { key: "cgstAmount", label: "CGST Amount", type: "number" },
        { key: "igstRate", label: "IGST Rate", type: "number" },
        { key: "igstAmount", label: "IGST Amount", type: "number" },
      ],
    },
    taxDetails: {
      type: "table",
      rows: localTaxRows,
      handlers: localTaxHandlers,
      columns: [
        { key: "particulars", label: "Particulars" },
        { key: "taxPercent", label: "Tax (%)", type: "number" },
        { key: "amount", label: "Amount", type: "number" },
      ],
    },
    quotationAttachment: { type: "attachment" },
    termsConditions: { type: "fields" },
  };

  /* ---------------- Import child tabs config ---------------- */

  const IMPORT_CHILD_TABS = [
    { key: "itemDetail", label: "1-Item Detail", type: "table" },
    { key: "termsConditions", label: "2-Terms And Conditions", type: "fields" },
    { key: "chargesSummary", label: "3-Charges Summary", type: "charges" },
  ];

  const importChildTabConfig = {
    itemDetail: {
      type: "table",
      rows: importItemRows,
      handlers: importItemHandlers,
      columns: [
        { key: "indentNo", label: "Indent No." },
        { key: "indentDate", label: "Indent Date", type: "date" },
        {
          key: "itemCode",
          label: "Item Code",
          type: "select",
          options: ITEM_CODES,
        },
        { key: "itemDescription", label: "Item Desc" },
        { key: "hsnSacCode", label: "HSN/SAC Code" },
        { key: "uom", label: "UOM", type: "select", options: UNITS },
        { key: "indentQty", label: "Indent Qty", type: "number" },
        { key: "poQty", label: "PO Qty.", type: "number" },
        { key: "fobRateFC", label: "FOB Rate(FC)", type: "number" },
        { key: "fobValueFC", label: "FOB Value(FC)", type: "number" },
        { key: "fobRateINR", label: "FOB Rate (INR)", type: "number" },
        { key: "fobValueINR", label: "FOB Value (INR)", type: "number" },
      ],
    },
    termsConditions: { type: "fields" },
    chargesSummary: { type: "charges" },
  };

  const activeLocalTabConfig = localChildTabConfig[activeLocalTab];
  const activeImportTabConfig = importChildTabConfig[activeImportTab];

  const handleAddChildRow = () => {
    if (
      commonHeader.pType === PTYPE_LOCAL &&
      activeLocalTabConfig?.type === "table"
    ) {
      activeLocalTabConfig.handlers.onAddRow();
    } else if (
      commonHeader.pType === PTYPE_IMPORT &&
      activeImportTabConfig?.type === "table"
    ) {
      activeImportTabConfig.handlers.onAddRow();
    }
  };

  /* ---------------- validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!commonHeader.plant) errors.plant = "Plant is required";
    if (!commonHeader.ordPlcdDt)
      errors.ordPlcdDt = "Order Placed Date is required";
    if (!commonHeader.pType) errors.pType = "PO.Type is required";

    if (commonHeader.pType === PTYPE_LOCAL) {
      if (!localHeader.department) errors.department = "Department is required";
      if (!localHeader.supplierCode)
        errors.supplierCode = "Supplier Code is required";
    }

    if (commonHeader.pType === PTYPE_IMPORT) {
      if (!importHeader.supplierCode)
        errors.supplierCode = "Supplier Code is required";
      if (!importHeader.currency) errors.currency = "Currency is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isLocal = commonHeader.pType === PTYPE_LOCAL;

    const payload = {
      ...(editData?.id && { id: editData.id }),
      commonHeader,
      ...(isLocal
        ? {
            localHeader,
            localPODetails: localPODetailRows,
            localTaxDetails: localTaxRows,
            localAttachments: localAttachmentRows.map(({ fileName }) => ({
              fileName,
            })),
            localTerms,
          }
        : {
            importHeader,
            importItemDetails: importItemRows,
            importTerms,
            importCharges,
          }),
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Purchase Order Payload:", payload);

    try {
      const response =
        await purchaseOrderAPI.updateCreatePurchaseOrder(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save purchase order";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Purchase Order.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {editData ? "Edit Purchase Order" : "Purchase Order"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Common Fields ---------------- */}
        <div>
          <SectionHeader>Purchase Order Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plant"
              value={commonHeader.plant}
              onChange={handleCommonHeaderChange}
              error={fieldErrors.plant}
              options={PLANT_IDS}
              required
            />
            <Field
              type="date"
              label="Ord Plcd Dt"
              name="ordPlcdDt"
              value={commonHeader.ordPlcdDt}
              onChange={handleCommonHeaderChange}
              error={fieldErrors.ordPlcdDt}
              required
            />
            <Field
              type="select"
              label="PO.Type"
              name="pType"
              value={commonHeader.pType}
              onChange={handleCommonHeaderChange}
              error={fieldErrors.pType}
              options={PTYPE_OPTIONS}
              required
            />
          </div>
        </div>

        {/* ---------------- PO.Type dependent sections ---------------- */}

        {!commonHeader.pType && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            Select a PO.Type above to continue with the purchase order.
          </p>
        )}

        {commonHeader.pType === PTYPE_LOCAL && (
          <>
            <div>
              <SectionHeader>Local</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  label="P.O.No"
                  name="poNo"
                  value={localHeader.poNo || "Auto"}
                  onChange={handleLocalHeaderChange}
                  disabled
                />
                <Field
                  type="select"
                  label="Belongs To"
                  name="belongsTo"
                  value={localHeader.belongsTo}
                  onChange={handleLocalHeaderChange}
                  options={BELONGS_TO}
                />
                <Field
                  type="date"
                  label="P.O.Date"
                  name="poDate"
                  value={localHeader.poDate}
                  onChange={handleLocalHeaderChange}
                />
                <Field
                  type="select"
                  label="Department"
                  name="department"
                  value={localHeader.department}
                  onChange={handleLocalHeaderChange}
                  error={fieldErrors.department}
                  options={DEPARTMENTS}
                  required
                />
                <Field
                  type="select"
                  label="Supplier Code"
                  name="supplierCode"
                  value={localHeader.supplierCode}
                  onChange={handleLocalHeaderChange}
                  error={fieldErrors.supplierCode}
                  options={SUPPLIER_CODES}
                  required
                />
                <Field
                  label="Supplier Name"
                  name="supplierName"
                  value={localHeader.supplierName}
                  onChange={handleLocalHeaderChange}
                />
                <Field
                  type="select"
                  label="GST State"
                  name="gstState"
                  value={localHeader.gstState}
                  onChange={handleLocalHeaderChange}
                  options={GST_STATES}
                />
                <Field
                  label="Supplier Ref No."
                  name="supplierRefNo"
                  value={localHeader.supplierRefNo}
                  onChange={handleLocalHeaderChange}
                />
                <Field
                  label="Address"
                  name="address"
                  value={localHeader.address}
                  onChange={handleLocalHeaderChange}
                />
                <Field
                  type="select"
                  label="Is IGST Appl"
                  name="isIGSTAppl"
                  value={localHeader.isIGSTAppl}
                  onChange={handleLocalHeaderChange}
                  options={YES_NO}
                />
                <Field
                  type="date"
                  label="Supp Ref Dt"
                  name="suppRefDt"
                  value={localHeader.suppRefDt}
                  onChange={handleLocalHeaderChange}
                />
                <Field
                  label="GSTN No"
                  name="gstnNo"
                  value={localHeader.gstnNo}
                  onChange={handleLocalHeaderChange}
                />
                <Field
                  type="select"
                  label="Tax Code"
                  name="taxCode"
                  value={localHeader.taxCode}
                  onChange={handleLocalHeaderChange}
                  options={TAX_CODES}
                />
                <Field
                  type="select"
                  label="Is Reverse Chrg"
                  name="isReverseChrg"
                  value={localHeader.isReverseChrg}
                  onChange={handleLocalHeaderChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Item Type"
                  name="itemType"
                  value={localHeader.itemType}
                  onChange={handleLocalHeaderChange}
                  options={ITEM_TYPES}
                />
                <Field
                  type="select"
                  label="Indent Required"
                  name="indentRequired"
                  value={localHeader.indentRequired}
                  onChange={handleLocalHeaderChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Dealer Type"
                  name="dealerType"
                  value={localHeader.dealerType}
                  onChange={handleLocalHeaderChange}
                  options={DEALER_TYPES}
                />
              </div>
            </div>

            {/* Local child tabs */}
            <section className="mt-0 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
                <div className="flex overflow-x-auto">
                  {LOCAL_CHILD_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveLocalTab(tab.key)}
                      className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                        activeLocalTab === tab.key
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeLocalTabConfig?.type === "table" && (
                  <button
                    type="button"
                    onClick={handleAddChildRow}
                    className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {activeLocalTabConfig?.type === "table" && (
                <DynamicTable
                  columns={activeLocalTabConfig.columns}
                  rows={activeLocalTabConfig.rows}
                  onCellChange={activeLocalTabConfig.handlers.onCellChange}
                  onRemoveRow={activeLocalTabConfig.handlers.onRemoveRow}
                />
              )}

              {activeLocalTabConfig?.type === "attachment" && (
                <AttachmentTable
                  rows={localAttachmentRows}
                  onFileChange={handleAttachmentFileChange}
                  onAddRow={handleAddAttachmentRow}
                  onRemoveRow={handleRemoveAttachmentRow}
                />
              )}

              {activeLocalTabConfig?.type === "fields" && (
                <TermsAndConditionsFields
                  values={localTerms}
                  onChange={handleLocalTermsChange}
                />
              )}
            </section>
          </>
        )}

        {commonHeader.pType === PTYPE_IMPORT && (
          <>
            <div>
              <SectionHeader>Import</SectionHeader>
              <div className={fieldGrid}>
                <Field
                  type="date"
                  label="PO Date"
                  name="poDate"
                  value={importHeader.poDate}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  type="select"
                  label="Belongs To"
                  name="belongsTo"
                  value={importHeader.belongsTo}
                  onChange={handleImportHeaderChange}
                  options={BELONGS_TO}
                />
                <Field
                  label="PO No."
                  name="poNo"
                  value={importHeader.poNo || "Auto"}
                  onChange={handleImportHeaderChange}
                  disabled
                />
                <Field
                  type="select"
                  label="Supp Code"
                  name="supplierCode"
                  value={importHeader.supplierCode}
                  onChange={handleImportHeaderChange}
                  error={fieldErrors.supplierCode}
                  options={SUPPLIER_CODES}
                  required
                />
                <Field
                  label="Address"
                  name="address"
                  value={importHeader.address}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  label="Supplier Name"
                  name="supplierName"
                  value={importHeader.supplierName}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  type="select"
                  label="Currency"
                  name="currency"
                  value={importHeader.currency}
                  onChange={handleImportHeaderChange}
                  error={fieldErrors.currency}
                  options={CURRENCIES}
                  required
                />
                <Field
                  type="select"
                  label="Ship. Mode"
                  name="shipMode"
                  value={importHeader.shipMode}
                  onChange={handleImportHeaderChange}
                  options={SHIP_MODES}
                />
                <Field
                  label="Ex. Rate"
                  name="exRate"
                  type="number"
                  value={importHeader.exRate}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  label="Payment Terms"
                  name="paymentTerms"
                  value={importHeader.paymentTerms}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  label="L.M.E Rate"
                  name="lmeRate"
                  type="number"
                  value={importHeader.lmeRate}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  type="select"
                  label="Port of Loading"
                  name="portOfLoading"
                  value={importHeader.portOfLoading}
                  onChange={handleImportHeaderChange}
                  options={PORTS_OF_LOADING}
                />
                <Field
                  type="select"
                  label="Incoterm"
                  name="incoterm"
                  value={importHeader.incoterm}
                  onChange={handleImportHeaderChange}
                  options={INCOTERMS}
                />
                <Field
                  label="ForeClose No"
                  name="forecloseNo"
                  value={importHeader.forecloseNo}
                  onChange={handleImportHeaderChange}
                />
                <Field
                  type="select"
                  label="Country of Origin"
                  name="countryOfOrigin"
                  value={importHeader.countryOfOrigin}
                  onChange={handleImportHeaderChange}
                  options={COUNTRIES}
                />
                <Field
                  type="select"
                  label="Indent Required"
                  name="indentRequired"
                  value={importHeader.indentRequired}
                  onChange={handleImportHeaderChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Port of Discharge"
                  name="portOfDischarge"
                  value={importHeader.portOfDischarge}
                  onChange={handleImportHeaderChange}
                  options={PORTS_OF_DISCHARGE}
                />
              </div>
            </div>

            {/* Import child tabs */}
            <section className="mt-0 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
                <div className="flex overflow-x-auto">
                  {IMPORT_CHILD_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveImportTab(tab.key)}
                      className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                        activeImportTab === tab.key
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeImportTabConfig?.type === "table" && (
                  <button
                    type="button"
                    onClick={handleAddChildRow}
                    className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {activeImportTabConfig?.type === "table" && (
                <DynamicTable
                  columns={activeImportTabConfig.columns}
                  rows={activeImportTabConfig.rows}
                  onCellChange={activeImportTabConfig.handlers.onCellChange}
                  onRemoveRow={activeImportTabConfig.handlers.onRemoveRow}
                />
              )}

              {activeImportTabConfig?.type === "fields" && (
                <TermsAndConditionsFields
                  values={importTerms}
                  onChange={handleImportTermsChange}
                />
              )}

              {activeImportTabConfig?.type === "charges" && (
                <div className="pt-3">
                  <div className={fieldGrid}>
                    <Field
                      label="Tot. FOB Value(FC)"
                      name="totFobValueFC"
                      type="number"
                      value={importCharges.totFobValueFC}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Tot. FOB Value (INR)"
                      name="totFobValueINR"
                      type="number"
                      value={importCharges.totFobValueINR}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Freight(FC)"
                      name="freightFC"
                      type="number"
                      value={importCharges.freightFC}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Freight (INR)"
                      name="freightINR"
                      type="number"
                      value={importCharges.freightINR}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Insurance(FC)"
                      name="insuranceFC"
                      type="number"
                      value={importCharges.insuranceFC}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Insurance (INR)"
                      name="insuranceINR"
                      type="number"
                      value={importCharges.insuranceINR}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Other Charges(FC)"
                      name="otherChargesFC"
                      type="number"
                      value={importCharges.otherChargesFC}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Other Charges (INR)"
                      name="otherChargesINR"
                      type="number"
                      value={importCharges.otherChargesINR}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Total PO Value(FC)"
                      name="totalPOValueFC"
                      type="number"
                      value={importCharges.totalPOValueFC}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Bank Charges"
                      name="bankCharges"
                      type="number"
                      value={importCharges.bankCharges}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Packing Charges"
                      name="packingCharges"
                      type="number"
                      value={importCharges.packingCharges}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Sur Charges"
                      name="surCharges"
                      type="number"
                      value={importCharges.surCharges}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Total PO Value (INR)"
                      name="totalPOValueINR"
                      type="number"
                      value={importCharges.totalPOValueINR}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Amount In Word"
                      name="amountInWord"
                      value={importCharges.amountInWord}
                      onChange={handleImportChargesChange}
                      className="col-span-2 md:col-span-4 xl:col-span-3"
                    />
                    <Field
                      label="Prepared By"
                      name="preparedBy"
                      value={importCharges.preparedBy}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Checked By"
                      name="checkedBy"
                      value={importCharges.checkedBy}
                      onChange={handleImportChargesChange}
                    />
                    <Field
                      label="Authorised By"
                      name="authorisedBy"
                      value={importCharges.authorisedBy}
                      onChange={handleImportChargesChange}
                    />
                  </div>
                </div>
              )}
            </section>
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

export default PurchaseOrderForm;
