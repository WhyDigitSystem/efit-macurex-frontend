import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { purchaseDeliveryScheduleAPI } from "../../../api/Purchase/purchaseDeliveryScheduleAPI";
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
/* Table helpers - mirrors PartyMasterForm's TableWrapper / TableHead / TableRow */

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
          className={`p-1 ${
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

/* Generic dynamic table body - header/Add-row live in the shared tab bar */
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
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const ITEM_CODES = ["RM-001", "RM-002", "PKG-001", "SVC-001"];
const UNITS = ["NOS", "KG", "MTR", "LTR", "BOX", "SET"];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyGeneralInfo = () => ({
  plantId: "",
  belongsTo: "",
  docNo: "",
  schStartDate: "",
  docDate: "",
  schEndDate: "",
  supplierCode: "",
  supplierName: "",
  poNo: "",
  poDate: "",
});

const emptyScheduleDetailRow = () => ({
  itemCode: "",
  primaryUnit: "",
  purchaseUnit: "",
  demandQty: "",
  availableStockQty: "",
  tentativeQty: "",
  tentativeQtyNextMonth: "",
  rate: "",
  preparedBy: "",
  note: "",
});

// NOTE: no field list was given for the Summary tab in the spec, so this is
// modeled as a per-item rollup. Adjust columns once the real requirement is
// confirmed.
const emptySummaryRow = () => ({
  itemCode: "",
  totalDemandQty: "",
  totalAvailableStock: "",
  totalTentativeQty: "",
  totalTentativeQtyNextMonth: "",
  totalScheduleQty: "",
});

const emptyScheduleRow = () => ({
  planDate: "",
  weekNo: "",
  scheduleQty: "",
});

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "scheduleDetails", label: "Schedule Details" },
  { key: "summary", label: "Summary" },
  { key: "schedule", label: "Schedule" },
];

const PurchaseDeliveryScheduleForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("scheduleDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [general, setGeneral] = useState({
    ...emptyGeneralInfo(),
    ...data?.general,
  });

  const [scheduleDetailRows, setScheduleDetailRows] = useState(
    data?.scheduleDetails?.length
      ? data.scheduleDetails
      : [emptyScheduleDetailRow()],
  );
  const [summaryRows, setSummaryRows] = useState(
    data?.summary?.length ? data.summary : [emptySummaryRow()],
  );
  const [scheduleRows, setScheduleRows] = useState(
    data?.schedule?.length ? data.schedule : [emptyScheduleRow()],
  );

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneral((prev) => ({ ...prev, [name]: value }));
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

  const scheduleDetailHandlers = makeTableHandlers(
    setScheduleDetailRows,
    emptyScheduleDetailRow,
  );
  const summaryHandlers = makeTableHandlers(setSummaryRows, emptySummaryRow);
  const scheduleHandlers = makeTableHandlers(setScheduleRows, emptyScheduleRow);

  const childTabConfig = {
    scheduleDetails: {
      rows: scheduleDetailRows,
      handlers: scheduleDetailHandlers,
      columns: [
        {
          key: "itemCode",
          label: "Item Code",
          type: "select",
          options: ITEM_CODES,
        },
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
        { key: "demandQty", label: "Demand Qty" },
        { key: "availableStockQty", label: "Available Stock Qty" },
        { key: "tentativeQty", label: "Tentative Qty" },
        {
          key: "tentativeQtyNextMonth",
          label: "Tentative Qty Next Month",
        },
        { key: "rate", label: "Rate" },
        { key: "preparedBy", label: "Prepared By" },
        { key: "note", label: "Note" },
      ],
    },
    summary: {
      rows: summaryRows,
      handlers: summaryHandlers,
      columns: [
        {
          key: "itemCode",
          label: "Item Code",
          type: "select",
          options: ITEM_CODES,
        },
        { key: "totalDemandQty", label: "Total Demand Qty" },
        { key: "totalAvailableStock", label: "Total Available Stock" },
        { key: "totalTentativeQty", label: "Total Tentative Qty" },
        {
          key: "totalTentativeQtyNextMonth",
          label: "Total Tentative Qty Next Month",
        },
        { key: "totalScheduleQty", label: "Total Schedule Qty" },
      ],
    },
    schedule: {
      rows: scheduleRows,
      handlers: scheduleHandlers,
      columns: [
        { key: "planDate", label: "Plan Date", type: "date" },
        { key: "weekNo", label: "Week No." },
        { key: "scheduleQty", label: "Schedule Qty" },
      ],
    },
  };

  const handleAddChildRow = () =>
    childTabConfig[activeChildTab].handlers.onAddRow();

  const validate = () => {
    const errors = {};

    if (!general.plantId) errors.plantId = "Plant ID is required";
    if (!general.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!general.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!general.docDate) errors.docDate = "Doc Date is required";
    if (!general.schStartDate)
      errors.schStartDate = "Sch. Start Date is required";
    if (!general.schEndDate) errors.schEndDate = "Sch. End Date is required";
    if (
      general.schStartDate &&
      general.schEndDate &&
      general.schEndDate < general.schStartDate
    )
      errors.schEndDate = "Sch. End Date cannot be before Sch. Start Date";
    if (!general.supplierCode?.trim())
      errors.supplierCode = "Supplier Code is required";
    if (!general.supplierName?.trim())
      errors.supplierName = "Supplier Name is required";
    if (!general.poNo?.trim()) errors.poNo = "PO No. is required";
    if (!general.poDate) errors.poDate = "PO Date is required";

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
      scheduleDetails: scheduleDetailRows.filter((r) => r.itemCode?.trim()),
      summary: summaryRows.filter((r) => r.itemCode?.trim()),
      schedule: scheduleRows.filter(
        (r) => r.planDate || r.weekNo || r.scheduleQty,
      ),
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response =
        await purchaseDeliveryScheduleAPI.createUpdateSchedule(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Purchase Delivery Schedule updated successfully!"
              : "Purchase Delivery Schedule created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Purchase Delivery Schedule.",
        );
      }
    } catch (err) {
      console.error("Save Purchase Delivery Schedule Error:", err);
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
            ? "Edit Purchase Delivery Schedule"
            : "Add Purchase Delivery Schedule"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- General Info ---------------- */}
        <div>
          <SectionHeader>Purchase Delivery Schedule Details</SectionHeader>
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
              label="Doc No"
              name="docNo"
              value={general.docNo}
              onChange={handleGeneralChange}
              error={fieldErrors.docNo}
              required
            />
            <Field
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={general.schStartDate}
              onChange={handleGeneralChange}
              error={fieldErrors.schStartDate}
              required
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={general.docDate}
              onChange={handleGeneralChange}
              error={fieldErrors.docDate}
              required
            />
            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={general.schEndDate}
              onChange={handleGeneralChange}
              error={fieldErrors.schEndDate}
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
              label="PO No."
              name="poNo"
              value={general.poNo}
              onChange={handleGeneralChange}
              error={fieldErrors.poNo}
              required
            />
            <Field
              type="date"
              label="PO Date"
              name="poDate"
              value={general.poDate}
              onChange={handleGeneralChange}
              error={fieldErrors.poDate}
              required
            />
          </div>
        </div>

        {/* ---------------- Child Tables (tab bar + dynamic table) ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
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
            <button
              type="button"
              onClick={handleAddChildRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Active tab's table */}
          <DynamicTable
            columns={childTabConfig[activeChildTab].columns}
            rows={childTabConfig[activeChildTab].rows}
            onCellChange={childTabConfig[activeChildTab].handlers.onCellChange}
            onRemoveRow={childTabConfig[activeChildTab].handlers.onRemoveRow}
          />
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

export default PurchaseDeliveryScheduleForm;
