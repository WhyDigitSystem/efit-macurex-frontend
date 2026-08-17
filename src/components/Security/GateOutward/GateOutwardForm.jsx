import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to PurchaseIndentForm                      */

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
/* Shared building blocks - identical to PurchaseIndentForm                    */

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
          disabled={disabled}
          rows={4}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
            "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
/* Table helpers - identical to PurchaseIndentForm                             */

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
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const YES_NO = ["YES", "NO"];
const MATERIAL_TYPES = [
  "RAW MATERIAL",
  "FINISHED GOODS",
  "SCRAP",
  "TOOLS/MACHINE",
  "OTHERS",
];
const UNITS = ["NOS", "KG", "LTR", "MTR", "SET"];
const CHARGE_TYPES = ["FREIGHT", "LOADING", "UNLOADING", "OTHERS"];

/* ---------------------------------------------------------------------------- */

const nowTimeLabel = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const emptyHeader = (nextSerialNo) => ({
  plant: "",
  serialNo: nextSerialNo || "Auto",
  breakDown: "NO",
  date: new Date().toISOString().slice(0, 10),
  breakDownNo: "",
  outwardTime: nowTimeLabel(),
  materialType: "",
  materialTakenOutBy: "",
  materialSentTo: "",
  challanNo: "",
  vehicleNo: "",
});

const emptyChargesSummary = () => ({
  remarks: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  toolMachineNo: "",
  toolMachineDesc: "",
  unit: "",
  quantity: "",
});

const emptyChargeRow = () => ({
  chargeType: "",
  description: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Gate Outward Details is a table, Charges Summary has a charges */
/* table plus remarks, matching PurchaseIndentForm's Item Details/Summary tabs */

const CHILD_TABS = [
  { key: "item", label: "1-Gate Outward Details", type: "table" },
  { key: "charges", label: "2-Charges Summary", type: "charges" },
];

const GateOutwardForm = ({ onBack, onSave, editData, nextSerialNo }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("item");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState({
    ...emptyHeader(nextSerialNo),
    ...editData?.header,
  });

  const [summary, setSummary] = useState({
    ...emptyChargesSummary(),
    ...editData?.summary,
  });

  const [itemRows, setItemRows] = useState(
    editData?.itemDetails?.length ? editData.itemDetails : [emptyItemRow()],
  );

  const [chargeRows, setChargeRows] = useState(
    editData?.charges?.length ? editData.charges : [emptyChargeRow()],
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
  const chargeHandlers = makeTableHandlers(setChargeRows, emptyChargeRow);

  const chargesTotal = chargeRows.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0,
  );

  // Config-driven lookup, same pattern as PurchaseIndentForm's childTabConfig
  const childTabConfig = {
    item: {
      type: "table",
      rows: itemRows,
      handlers: itemHandlers,
      columns: [
        { key: "itemCode", label: "Item Code" },
        { key: "itemDescription", label: "Item Description" },
        { key: "toolMachineNo", label: "Tool/Machine Instrument No" },
        {
          key: "toolMachineDesc",
          label: "Tool/Machine Instrument No. Desc.",
        },
        { key: "unit", label: "Unit", type: "select", options: UNITS },
        { key: "quantity", label: "Quantity", type: "number" },
      ],
    },
    charges: {
      type: "charges",
      rows: chargeRows,
      handlers: chargeHandlers,
      columns: [
        {
          key: "chargeType",
          label: "Charge Type",
          type: "select",
          options: CHARGE_TYPES,
        },
        { key: "description", label: "Description" },
        { key: "amount", label: "Amount", type: "number" },
      ],
    },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (
      activeTabConfig.type === "table" ||
      activeTabConfig.type === "charges"
    ) {
      activeTabConfig.handlers.onAddRow();
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant ID is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.materialType) errors.materialType = "Material Type is required";
    if (header.breakDown === "YES" && !header.breakDownNo.trim())
      errors.breakDownNo = "Break Down No is required";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(editData?.id && { id: editData.id }),
      header,
      summary,
      itemDetails: itemRows,
      charges: chargeRows,
      chargesTotal,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    // No API — hand the payload straight back to the parent to store locally.
    onSave?.(payload);
    setIsSubmitting(false);
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
          {editData ? "Edit Gate Outward" : "Gate Outward"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Outward Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plant"
              value={header.plant}
              onChange={handleHeaderChange}
              error={fieldErrors.plant}
              options={PLANT_IDS}
              required
            />
            <Field
              label="Serial No."
              name="serialNo"
              value={header.serialNo}
              disabled
            />
            <Field
              type="select"
              label="Break Down ?"
              name="breakDown"
              value={header.breakDown}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              required
            />
            <Field
              label="Break Down No."
              name="breakDownNo"
              value={header.breakDownNo}
              onChange={handleHeaderChange}
              error={fieldErrors.breakDownNo}
              disabled={header.breakDown !== "YES"}
            />
            <Field
              label="Outward Time"
              name="outwardTime"
              value={header.outwardTime}
              disabled
            />
            <Field
              type="select"
              label="Material Type"
              name="materialType"
              value={header.materialType}
              onChange={handleHeaderChange}
              error={fieldErrors.materialType}
              options={MATERIAL_TYPES}
              required
            />
            <Field
              label="Material Taken Out by"
              name="materialTakenOutBy"
              value={header.materialTakenOutBy}
              onChange={handleHeaderChange}
            />
            <Field
              label="Material Sent To"
              name="materialSentTo"
              value={header.materialSentTo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Challan No."
              name="challanNo"
              value={header.challanNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Vehicle No."
              name="vehicleNo"
              value={header.vehicleNo}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs: Gate Outward Details / Charges Summary ---------------- */}
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
              activeTabConfig.type === "charges") && (
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

          {activeTabConfig.type === "charges" && (
            <div className="space-y-2">
              <Field
                type="textarea"
                label="Remarks"
                name="remarks"
                value={summary.remarks}
                onChange={handleSummaryChange}
                className="col-span-2 md:col-span-4 xl:col-span-6"
              />
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

export default GateOutwardForm;
