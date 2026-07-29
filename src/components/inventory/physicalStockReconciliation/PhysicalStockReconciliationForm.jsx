import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to IssueForm / PartyMasterForm             */

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
/* Shared building blocks - identical to IssueForm / PartyMasterForm           */

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
/* Table helpers - identical to IssueForm / PartyMasterForm                    */

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
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const YES_NO = ["YES", "NO"];
const LOCATION_TYPES = ["STORE", "WIP", "FINISHED GOODS", "QC HOLD"];
const LOCATIONS = ["MAIN STORE", "WIP STORE", "FG STORE", "QC HOLD"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];
const REASON_CODES = [
  "COUNTING ERROR",
  "DAMAGE",
  "THEFT/LOSS",
  "SYSTEM ERROR",
  "UNRECORDED TRANSACTION",
];

/* ---------------------------------------------------------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

const emptyHeader = () => ({
  locationType: "",
  docNo: "",
  plantId: "",
  docDate: todayISO(),
  location: "",
  time: nowTime(),
  refNo: "",
  refDate: todayISO(),
  belongsTo: "",
  preparedBy: "",
});

const emptySummary = () => ({
  narration: "",
  approvedByPM: "NO",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  bookStock: "",
  actualQty: "",
  difference: "",
  lcRate: "",
  rate: "",
  reasonCode: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Physical Stock Detail is a table, Summary is a field grid      */

const CHILD_TABS = [
  {
    key: "physicalStockDetail",
    label: "1-Physical Stock Detail",
    type: "table",
  },
  { key: "summary", label: "2-Summary", type: "fields" },
];

const PhysicalStockReconciliationForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("physicalStockDetail");
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
    editData?.physicalStockDetails?.length
      ? editData.physicalStockDetails
      : [emptyItemRow()],
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

  // Config-driven lookup, same pattern as IssueForm's childTabConfig
  const childTabConfig = {
    physicalStockDetail: {
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
          key: "bookStock",
          label: "Book Stock",
          type: "number",
          readOnly: true,
        },
        { key: "actualQty", label: "Actual Qty", type: "number" },
        {
          key: "difference",
          label: "Difference",
          type: "number",
          readOnly: true,
        },
        { key: "lcRate", label: "LC Rate", type: "number" },
        { key: "rate", label: "Rate", type: "number" },
        {
          key: "reasonCode",
          label: "Reason Code",
          type: "select",
          options: REASON_CODES,
        },
        { key: "amount", label: "Amount", type: "number" },
      ],
    },
    summary: {
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
    if (!header.docDate) errors.docDate = "Doc. Date is required";
    if (!header.location) errors.location = "Location is required";
    if (!header.locationType) errors.locationType = "Location Type is required";

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
      physicalStockDetails: itemRows,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Physical Stock Reconciliation Payload:", payload);

    try {
      const response =
        await physicalStockReconciliationAPI.updateCreateReconciliation(
          payload,
        );
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save physical stock reconciliation";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Physical Stock Reconciliation.");
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
          {editData
            ? "Edit Physical Stock Re-Conciliation"
            : "Physical Stock Re-Conciliation"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Reconciliation Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Location Type"
              name="locationType"
              value={header.locationType}
              onChange={handleHeaderChange}
              error={fieldErrors.locationType}
              options={LOCATION_TYPES}
              required
            />
            <Field
              label="Doc No."
              name="docNo"
              value={header.docNo || "Auto"}
              onChange={handleHeaderChange}
              disabled
            />
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
              type="date"
              label="Doc. Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
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
              type="time"
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
            />
            <Field
              label="Ref. No"
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
              label="Belongs to"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO}
            />
            <Field
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs: Physical Stock Detail / Summary ---------------- */}
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
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
                  onChange={handleSummaryChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
                <Field
                  type="select"
                  label="Approved By PM"
                  name="approvedByPM"
                  value={summary.approvedByPM}
                  onChange={handleSummaryChange}
                  options={YES_NO}
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

export default PhysicalStockReconciliationForm;
