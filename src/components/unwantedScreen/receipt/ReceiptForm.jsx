import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import receiptAPI from "../../../api/Inventory/receiptAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to PhysicalStockReconciliationForm         */

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
/* Shared building blocks - identical to PhysicalStockReconciliationForm       */

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
/* Table helpers - identical to PhysicalStockReconciliationForm                */

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
                type={col.type === "number" ? "number" : "text"}
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
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const DEPARTMENTS = ["PURCHASE", "PRODUCTION", "QUALITY", "STORES", "ADMIN"];
const LOCATIONS = ["MAIN STORE", "WIP STORE", "FG STORE", "QC HOLD"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];

/* ---------------------------------------------------------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyHeader = () => ({
  plantId: "",
  recNo: "",
  department: "",
  recDate: todayISO(),
  issueNo: "",
  issueDate: "",
  refNo: "",
  refDate: todayISO(),
  locationTo: "",
  receivedFrom: "",
});

const emptyChargesSummary = () => ({
  netAmount: "",
  narration: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  qtyAvailable: "",
  recdQty: "",
  rate: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Receipts Detail is a table, Charges Summary is a field grid    */

const CHILD_TABS = [
  { key: "receiptsDetail", label: "1-Receipts Detail", type: "table" },
  { key: "chargesSummary", label: "2-Charges Summary", type: "fields" },
];

const ReceiptForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("receiptsDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState({
    ...emptyHeader(),
    ...editData?.header,
  });

  const [chargesSummary, setChargesSummary] = useState({
    ...emptyChargesSummary(),
    ...editData?.chargesSummary,
  });

  const [itemRows, setItemRows] = useState(
    editData?.receiptsDetails?.length
      ? editData.receiptsDetails
      : [emptyItemRow()],
  );

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleChargesSummaryChange = (e) => {
    const { name, value } = e.target;
    setChargesSummary((prev) => ({ ...prev, [name]: value }));
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

  // Config-driven lookup, same pattern as PhysicalStockReconciliationForm's childTabConfig
  const childTabConfig = {
    receiptsDetail: {
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
        { key: "unit", label: "Unit", type: "select", options: UNITS },
        {
          key: "qtyAvailable",
          label: "Qty Available",
          type: "number",
          readOnly: true,
        },
        { key: "recdQty", label: "Recd. Qty", type: "number" },
        { key: "rate", label: "Rate", type: "number" },
        { key: "amount", label: "Amount", type: "number" },
      ],
    },
    chargesSummary: {
      type: "fields",
    },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.recDate) errors.recDate = "Rec. Date is required";
    if (!header.locationTo) errors.locationTo = "Location To is required";
    if (!header.receivedFrom) errors.receivedFrom = "Received From is required";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(editData?.id && { id: editData.id }),
      header,
      chargesSummary,
      receiptsDetails: itemRows,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Receipt Payload:", payload);

    try {
      const response = await receiptAPI.updateCreateReceipt(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save receipt";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Receipt.");
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
          {editData ? "Edit Receipt" : "Receipts"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Receipt Details</SectionHeader>
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
              label="Rec No"
              name="recNo"
              value={header.recNo || "Auto"}
              onChange={handleHeaderChange}
              disabled
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
              type="date"
              label="Rec. Date"
              name="recDate"
              value={header.recDate}
              onChange={handleHeaderChange}
              error={fieldErrors.recDate}
              required
            />
            <Field
              label="Issue No"
              name="issueNo"
              value={header.issueNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Issue Date"
              name="issueDate"
              value={header.issueDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="Ref. No."
              name="refNo"
              value={header.refNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={header.refDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Location To"
              name="locationTo"
              value={header.locationTo}
              onChange={handleHeaderChange}
              error={fieldErrors.locationTo}
              options={LOCATIONS}
              required
            />
            <Field
              type="select"
              label="Received From"
              name="receivedFrom"
              value={header.receivedFrom}
              onChange={handleHeaderChange}
              error={fieldErrors.receivedFrom}
              options={LOCATIONS}
              required
            />
          </div>
        </div>

        {/* ---------------- Child Tabs: Receipts Detail / Charges Summary ---------------- */}
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

            {activeTabConfig.type === "table" && (
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
          {activeTabConfig.type === "table" ? (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          ) : (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Net Amount"
                  name="netAmount"
                  value={chargesSummary.netAmount}
                  onChange={handleChargesSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={chargesSummary.narration}
                  onChange={handleChargesSummaryChange}
                  className="col-span-2 md:col-span-3 xl:col-span-5"
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

export default ReceiptForm;
