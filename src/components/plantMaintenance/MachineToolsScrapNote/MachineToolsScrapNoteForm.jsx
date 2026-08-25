import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
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
                type={col.type === "number" ? "number" : "text"}
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
/* Single-image upload block (Child 3 - Scrap Summary)                         */

const ImageUploadField = ({ image, onFileChange, onRemove }) => (
  <div className="pt-3 max-w-sm">
    <label className={labelClasses}>Image</label>

    {image?.previewUrl ? (
      <div className="space-y-2">
        <img
          src={image.previewUrl}
          alt={image.fileName || "Scrap note attachment"}
          className="w-full max-h-56 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {image.fileName}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline flex-shrink-0"
          >
            <Trash2 size={11} />
            Remove
          </button>
        </div>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-1 h-28 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors">
        <UploadCloud size={18} />
        Drop image here or click to upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </label>
    )}
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const DEPARTMENTS = [
  "PURCHASE",
  "PRODUCTION",
  "QUALITY",
  "STORES",
  "MAINTENANCE",
];
const LOCATIONS = ["MAIN STORE", "WIP LOCATION", "SCRAP YARD", "WAREHOUSE 1"];
const ITEM_CODES = ["MC-001", "MC-002", "TOOL-001", "TOOL-002"];
const YES_NO = ["No", "Yes"];

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

/* ---------------------------------------------------------------------------- */
/* Header fields                                                               */

const HEADER_FIELDS = [
  {
    name: "plant",
    label: "Plant ID",
    type: "select",
    options: PLANT_IDS,
    required: true,
  },
  { name: "msnNo", label: "MSN No", auto: true },
  {
    name: "belongsTo",
    label: "Belongs To",
    type: "select",
    options: BELONGS_TO,
  },
  {
    name: "msnDate",
    label: "MSN Date",
    type: "date",
    default: todayISO(),
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: DEPARTMENTS,
  },
  { name: "time", label: "Time", type: "time", default: nowTime() },
  {
    name: "fromLocation",
    label: "From Location",
    type: "select",
    options: LOCATIONS,
  },
  {
    name: "toLocation",
    label: "To Location",
    type: "select",
    options: LOCATIONS,
  },
];

/* ---------------------------------------------------------------------------- */
/* Child 1 - Machine Tools Attach Image (table)                                */

const MACHINE_TOOLS_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: ITEM_CODES },
  { key: "itemDescription", label: "Item Description" },
  { key: "stock", label: "Stock", type: "number" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "rate", label: "Rate", type: "number" },
  { key: "value", label: "Value", type: "number" },
];

/* ---------------------------------------------------------------------------- */
/* Child 2 - Scrap Details (fields)                                            */

const SCRAP_DETAILS_FIELDS = [
  { name: "preparedBy", label: "Prepared By" },
  { name: "authoriseBy", label: "Authorise By" },
  {
    name: "productionApproval",
    label: "Production Approval",
    type: "select",
    options: YES_NO,
    default: "No",
  },
  {
    name: "qualityApproval",
    label: "Quality Approval",
    type: "select",
    options: YES_NO,
    default: "No",
  },
  {
    name: "storeApproval",
    label: "Store Approval",
    type: "select",
    options: YES_NO,
    default: "No",
  },
  {
    name: "narration",
    label: "Narration",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

const CHILD_TABS = [
  { key: "machineTools", label: "1-Machine Tools Attach Image", type: "table" },
  { key: "scrapDetails", label: "2-Scrap Details", type: "fields" },
  { key: "scrapSummary", label: "3-Scrap Summary", type: "upload" },
];

/* ---------------------------------------------------------------------------- */

const MachineToolsScrapNoteForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeChildTab, setActiveChildTab] = useState("machineTools");

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  const [machineToolsRows, setMachineToolsRows] = useState(
    editData?.machineTools?.length
      ? editData.machineTools
      : [blankRowFromColumns(MACHINE_TOOLS_COLUMNS)],
  );

  const [scrapDetails, setScrapDetails] = useState({
    ...blankFromFields(SCRAP_DETAILS_FIELDS),
    ...editData?.scrapDetails,
  });

  const [scrapImage, setScrapImage] = useState(editData?.scrapImage || null);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrapDetailsChange = (e) => {
    const { name, value } = e.target;
    setScrapDetails((prev) => ({ ...prev, [name]: value }));
  };

  const makeTableHandlers = (setter, columns) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, blankRowFromColumns(columns)]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const machineToolsHandlers = makeTableHandlers(
    setMachineToolsRows,
    MACHINE_TOOLS_COLUMNS,
  );

  const handleImageChange = (file) => {
    if (!file) return;
    setScrapImage({
      file,
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
    });
  };
  const handleImageRemove = () => setScrapImage(null);

  const childTabConfig = {
    machineTools: {
      type: "table",
      rows: machineToolsRows,
      handlers: machineToolsHandlers,
      columns: MACHINE_TOOLS_COLUMNS,
    },
    scrapDetails: { type: "fields" },
    scrapSummary: { type: "upload" },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant ID is required";
    if (!header.msnDate) errors.msnDate = "MSN Date is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(editData?.id && { id: editData.id }),
      header,
      machineTools: machineToolsRows,
      scrapDetails,
      scrapImage: scrapImage ? { fileName: scrapImage.fileName } : null,
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
    };

    console.log("📤 Saving Machine Tools Scrap Note Payload:", payload);

    try {
      const response =
        await machineToolsScrapNoteAPI.updateCreateMachineToolsScrapNote(
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
          "Failed to save machine tools scrap note";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Machine Tools Scrap Note.");
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
            ? "Edit Machine Tools Scrap Note"
            : "Machine Tools Scrap Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Scrap Note Details</SectionHeader>
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

          {activeTabConfig.type === "table" && (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          )}

          {activeTabConfig.type === "fields" && (
            <div className="pt-3">
              <FieldsGrid
                fields={SCRAP_DETAILS_FIELDS}
                values={scrapDetails}
                onChange={handleScrapDetailsChange}
              />
            </div>
          )}

          {activeTabConfig.type === "upload" && (
            <ImageUploadField
              image={scrapImage}
              onFileChange={handleImageChange}
              onRemove={handleImageRemove}
            />
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

export default MachineToolsScrapNoteForm;
