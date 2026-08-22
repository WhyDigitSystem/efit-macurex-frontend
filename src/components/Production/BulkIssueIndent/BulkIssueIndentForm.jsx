import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to other Inventory forms                   */

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

/* Config-driven field grid - array of {name,label,type,options,...} descriptors
   rendered against a values/onChange pair. */
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

const blankRowFromColumns = (columns) =>
  columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const DEPARTMENTS = ["PURCHASE", "PRODUCTION", "QUALITY", "STORES", "ADMIN"];
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const ITEM_CODES = ["FG-001", "FG-002", "SFG-001", "RM-001"];
const UNITS = ["NOS", "KG", "LTR", "BOX", "MTR"];
const LOCATIONS = ["MAIN STORE", "WIP LOCATION", "FG STORE", "WAREHOUSE 1"];
const YES_NO = ["No", "Yes"];

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

/* ---------------------------------------------------------------------------- */
/* Header fields                                                               */

const HEADER_FIELDS = [
  {
    name: "plant",
    label: "Plant",
    type: "select",
    options: PLANT_IDS,
    required: true,
  },
  { name: "docId", label: "DocId", auto: true },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: DEPARTMENTS,
  },
  {
    name: "docDate",
    label: "DocDate",
    type: "date",
    default: todayISO(),
    required: true,
  },
  {
    name: "belongsTo",
    label: "Belongs To",
    type: "select",
    options: BELONGS_TO,
  },
  { name: "fgDescription", label: "FG Description" },
  {
    name: "fgSfgItemId",
    label: "FG/SFG Itemid",
    type: "select",
    options: ITEM_CODES,
  },
  { name: "bomId", label: "Bom Id" },
  {
    name: "timeOfIndent",
    label: "Time Of Indent",
    type: "time",
    default: nowTime(),
  },
  {
    name: "fromLocation",
    label: "From Location",
    type: "select",
    options: LOCATIONS,
  },
];

/* ---------------------------------------------------------------------------- */
/* Child 1 - Indent Detail (table)                                             */

const INDENT_DETAIL_COLUMNS = [
  { key: "itemCodeDescription", label: "Item Code / Description" },
  { key: "reqQty", label: "Req Qty", type: "number" },
  { key: "unit", label: "Unit", type: "select", options: UNITS },
  { key: "requiredDate", label: "Required Date", type: "date" },
  { key: "purpose", label: "Purpose" },
];

/* ---------------------------------------------------------------------------- */
/* Child 2 - Indent Summary (fields)                                           */

const INDENT_SUMMARY_FIELDS = [
  {
    name: "approvedByPM",
    label: "Approved By PM",
    type: "select",
    options: YES_NO,
    default: "No",
  },
  { name: "preparedBy", label: "Prepared By" },
  { name: "authorisedBy", label: "Authorised By" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

const CHILD_TABS = [
  { key: "indentDetail", label: "1-Indent Detail", type: "table" },
  { key: "indentSummary", label: "2-Indent Summary", type: "fields" },
];

/* ---------------------------------------------------------------------------- */

const BulkIssueIndentForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeChildTab, setActiveChildTab] = useState("indentDetail");

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  const [indentDetailRows, setIndentDetailRows] = useState(
    editData?.indentDetails?.length
      ? editData.indentDetails
      : [blankRowFromColumns(INDENT_DETAIL_COLUMNS)],
  );

  const [indentSummary, setIndentSummary] = useState({
    ...blankFromFields(INDENT_SUMMARY_FIELDS),
    ...editData?.indentSummary,
  });

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setIndentSummary((prev) => ({ ...prev, [name]: value }));
  };

  const makeTableHandlers = (setter, columns) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, blankRowFromColumns(columns)]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const indentDetailHandlers = makeTableHandlers(
    setIndentDetailRows,
    INDENT_DETAIL_COLUMNS,
  );

  const childTabConfig = {
    indentDetail: {
      type: "table",
      rows: indentDetailRows,
      handlers: indentDetailHandlers,
      columns: INDENT_DETAIL_COLUMNS,
    },
    indentSummary: { type: "fields" },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant is required";
    if (!header.docDate) errors.docDate = "DocDate is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(editData?.id && { id: editData.id }),
      header,
      indentDetails: indentDetailRows,
      indentSummary,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Bulk Issue Indent Payload:", payload);

    try {
      const response =
        await bulkIssueIndentAPI.updateCreateBulkIssueIndent(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save bulk issue indent";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Bulk Issue Indent.");
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
          {editData ? "Edit Bulk Issue Indent" : "Bulk Issue Indent"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Bulk Issue Indent Details</SectionHeader>
          <FieldsGrid
            fields={HEADER_FIELDS}
            values={header}
            onChange={handleHeaderChange}
            errors={fieldErrors}
          />
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
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

          {activeTabConfig.type === "table" ? (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          ) : (
            <div className="pt-3">
              <FieldsGrid
                fields={INDENT_SUMMARY_FIELDS}
                values={indentSummary}
                onChange={handleSummaryChange}
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

export default BulkIssueIndentForm;
