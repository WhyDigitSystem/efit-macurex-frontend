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
import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to OtherSalesInvoiceForm / PartyMasterForm */

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
/* Shared building blocks - identical to OtherSalesInvoiceForm / PartyMasterForm */

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
/* Table helpers - identical to OtherSalesInvoiceForm / PartyMasterForm        */

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
/* Attachment tab - a drag/drop upload zone per row, instead of text/select    */

const AttachmentDropCell = ({ rowId, file, onFileChange }) => (
  <td className="p-2 align-top">
    <label
      htmlFor={`attachment-file-${rowId}`}
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
      id={`attachment-file-${rowId}`}
      type="file"
      accept="application/pdf"
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
    <TableHead headers={["S.No", "File", "Action"]} />
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
const DEPARTMENTS = ["PURCHASE", "PRODUCTION", "QUALITY", "STORES", "ADMIN"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];

/* ---------------------------------------------------------------------------- */

const emptyHeader = () => ({
  plant: "",
  indentNo: "",
  belongsTo: "",
  indentDate: "",
  department: "",
  preparedBy: "",
  byWhom: "",
  approved: "NO",
});

const emptyIndentSummary = () => ({
  remarks: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  primaryUnit: "",
  purchaseUnit: "",
  qtyInPrimaryUnit: "",
  conversionFactor: "",
  qtyInPurchaseUnit: "",
  requiredDate: "",
  purpose: "",
});

let attachmentRowIdCounter = 1;
const emptyAttachmentRow = () => ({
  rowId: `att-${attachmentRowIdCounter++}`,
  file: null,
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Item Details is a table, Indent Summary is a field grid,       */
/* Pdf Attachment is the drag/drop upload table                                */

const CHILD_TABS = [
  { key: "item", label: "1-Item Details", type: "table" },
  { key: "summary", label: "2-Indent Summary", type: "fields" },
  { key: "attachment", label: "3-Pdf Attachment", type: "attachment" },
];

const PurchaseIndentForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("item");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState({
    ...emptyHeader(),
    ...editData?.header,
  });

  const [summary, setSummary] = useState({
    ...emptyIndentSummary(),
    ...editData?.summary,
  });

  const [itemRows, setItemRows] = useState(
    editData?.itemDetails?.length ? editData.itemDetails : [emptyItemRow()],
  );
  const [attachmentRows, setAttachmentRows] = useState(
    editData?.attachments?.length
      ? editData.attachments.map((a) => ({
          rowId: `att-${attachmentRowIdCounter++}`,
          file: a.file || null,
          existingFileName: a.fileName || "",
        }))
      : [emptyAttachmentRow()],
  );

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
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

  const handleAttachmentFileChange = (idx, file) => {
    setAttachmentRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, file } : row)),
    );
  };
  const handleAttachmentAddRow = () =>
    setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);
  const handleAttachmentRemoveRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  // Config-driven lookup, same pattern as OtherSalesInvoiceForm's childTabConfig
  const childTabConfig = {
    item: {
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
        {
          key: "primaryUnit",
          label: "Primary Unit",
          type: "select",
          options: UNITS,
        },
        {
          key: "purchaseUnit",
          label: "Purchase Unit",
          type: "select",
          options: UNITS,
        },
        {
          key: "qtyInPrimaryUnit",
          label: "Qty in Primary Unit",
          type: "number",
        },
        { key: "conversionFactor", label: "Conversion Factor", type: "number" },
        {
          key: "qtyInPurchaseUnit",
          label: "Qty In Purchase Unit",
          type: "number",
        },
        { key: "requiredDate", label: "Required Date", type: "date" },
        { key: "purpose", label: "Purpose" },
      ],
    },
    summary: {
      type: "fields",
    },
    attachment: {
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

    if (!header.plant) errors.plant = "Plant is required";
    if (!header.indentNo.trim()) errors.indentNo = "Indent No is required";
    if (!header.indentDate) errors.indentDate = "Indent Date is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.preparedBy.trim())
      errors.preparedBy = "Prepared By is required";

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
      itemDetails: itemRows,
      // Files aren't JSON-serializable - actual upload happens via
      // purchaseIndentAPI.uploadAttachment per row, this just carries names.
      attachments: attachmentRows
        .filter((row) => row.file)
        .map((row) => ({ fileName: row.file.name })),
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Purchase Indent Payload:", payload);

    try {
      const response =
        await purchaseIndentAPI.updateCreatePurchaseIndent(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const savedId = response?.paramObjectsMap?.id || editData?.id;

        // Upload any newly attached files against the saved indent
        const filesToUpload = attachmentRows.filter((row) => row.file);
        for (const row of filesToUpload) {
          try {
            await purchaseIndentAPI.uploadAttachment(savedId, row.file);
          } catch (uploadError) {
            console.error("Attachment upload failed:", uploadError);
          }
        }

        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save purchase indent";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Purchase Indent.");
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
          {editData ? "Edit Purchase Indent" : "Purchase Indent"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Indent Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plant"
              value={header.plant}
              onChange={handleHeaderChange}
              error={fieldErrors.plant}
              options={PLANT_IDS}
              required
            />
            <Field
              label="Indent No"
              name="indentNo"
              value={header.indentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.indentNo}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO}
            />
            <Field
              type="date"
              label="Indent Date"
              name="indentDate"
              value={header.indentDate}
              onChange={handleHeaderChange}
              error={fieldErrors.indentDate}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={DEPARTMENTS}
              required
            />
            <Field
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              required
            />
            <Field
              label="By Whom"
              name="byWhom"
              value={header.byWhom}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Approved"
              name="approved"
              value={header.approved}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs: Item Details / Indent Summary / Pdf Attachment ---------------- */}
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

export default PurchaseIndentForm;
