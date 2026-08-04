import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import purchaseOrderAmendmentAPI from "../../../api/Purchase/purchaseOrderAmendmentAPI";
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
  placeholder,
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
          rows={1}
          className={
            "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
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
        placeholder={placeholder}
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

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
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

const InputCell = ({ value, onChange, type = "text", step }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={onChange}
      className={cellInputClasses}
    />
  </td>
);

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
  </td>
);

/* Generic dynamic table. Supports text / number / date / select / readonly. */
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
          {columns.map((col) => {
            if (col.type === "select") {
              return (
                <SelectCell
                  key={col.key}
                  value={row[col.key]}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  options={col.options}
                />
              );
            }
            if (col.readOnly) {
              return <ReadOnlyCell key={col.key} value={row[col.key]} />;
            }
            return (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={
                  col.type === "date"
                    ? "date"
                    : col.type === "number"
                      ? "number"
                      : "text"
                }
                step={col.step}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const PLANT_IDS = ["Plant 1", "Plant 2", "Plant 3"];
const BELONGS_TO = ["Domestic", "Import", "Export"];
const FREIGHT_TYPES = ["CIF", "FOB", "CFR", "EXW", "DDP"];
const PACKING_TYPES = ["Standard", "Export", "Waterproof", "Pallet"];
const MODE_OF_DISPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  plantId: "",
  belongsTo: "",
  amendmentNo: "",
  amendmentDate: dayjs().format("YYYY-MM-DD"),
  partyCode: "",
  partyName: "",
  poNo: "",
  poDate: "",
  currency: "",
  exchangeRate: 0,
  refNo: "",
  refDate: "",
  revisionNo: 1,
  active: true,
  freightType: "",
  packingType: "",
  insuranceAmount: 0,
  modeOfDispatch: "",
  taxDescription: "",
  remarks: "",
});

const emptyPoDetailRow = () => ({
  id: Date.now() + 1,
  slNo: 1,
  itemCode: "",
  itemName: "",
  originalQty: 0,
  amendmentQty: 0,
  originalRate: 0,
  amendmentRate: 0,
  originalDeliveryDate: "",
  amendmentDeliveryDate: "",
});

const fmtDate = (value) =>
  value ? dayjs(value).format("YYYY-MM-DD") : "";

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "poDetail", label: "PO Detail" },
  { key: "summary", label: "Summary" },
  { key: "attachment", label: "Attachment" },
];

const PO_DETAIL_COLUMNS = [
  { key: "itemCode", label: "Item Code", readOnly: true },
  { key: "itemName", label: "Item Name", readOnly: true },
  { key: "originalQty", label: "Original Qty", readOnly: true },
  {
    key: "amendmentQty",
    label: "Amendment Qty",
    type: "number",
    step: "0.001",
  },
  { key: "originalRate", label: "Original Rate", readOnly: true },
  {
    key: "amendmentRate",
    label: "Amendment Rate",
    type: "number",
    step: "0.01",
  },
  {
    key: "originalDeliveryDate",
    label: "Original Delivery Date",
    type: "date",
    readOnly: true,
  },
  { key: "amendmentDeliveryDate", label: "Amendment Delivery Date", type: "date" },
];

const PurchaseOrderAmendmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";

  const [activeTab, setActiveTab] = useState("poDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPo, setLoadingPo] = useState(false);
  const [poDetailError, setPoDetailError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState(() => {
    const base = { ...emptyHeader(), ...data };
    base.amendmentDate = base.amendmentDate
      ? dayjs(base.amendmentDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    base.poDate = fmtDate(base.poDate);
    base.refDate = fmtDate(base.refDate);
    return base;
  });

  const [poDetailRows, setPoDetailRows] = useState(
    data?.poDetails?.length
      ? data.poDetails.map((d) => ({
          ...d,
          originalDeliveryDate: fmtDate(d.originalDeliveryDate),
          amendmentDeliveryDate: fmtDate(d.amendmentDeliveryDate),
        }))
      : [emptyPoDetailRow()],
  );

  const [attachmentFiles, setAttachmentFiles] = useState(() => [
    { id: Date.now(), file: null },
  ]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Lookups ---------------- */

  const loadPartyName = useCallback(
    async (code) => {
      if (!code || !orgId) return;
      try {
        const party = await purchaseOrderAmendmentAPI.getPartyByCode(code, orgId);
        setHeader((prev) => ({
          ...prev,
          partyName: party?.partyName || party?.name || "",
        }));
      } catch {
        setHeader((prev) => ({ ...prev, partyName: "" }));
      }
    },
    [orgId],
  );

  useEffect(() => {
    if (header.partyCode) {
      const timer = setTimeout(() => loadPartyName(header.partyCode), 500);
      return () => clearTimeout(timer);
    }
  }, [header.partyCode, loadPartyName]);

  const loadPoDetails = useCallback(
    async (poNum) => {
      if (!poNum || !orgId) return;
      setLoadingPo(true);
      try {
        const items = await purchaseOrderAmendmentAPI.getPoDetails(
          poNum,
          orgId,
          branch,
        );
        if (items && items.length > 0) {
          setHeader((prev) => ({
            ...prev,
            poDate: items[0].poDate
              ? dayjs(items[0].poDate).format("YYYY-MM-DD")
              : "",
            currency: items[0].currency || "",
          }));
          const mapped = items.map((item, idx) => ({
            id: item.id || Date.now() + idx,
            slNo: idx + 1,
            itemCode: item.itemCode || "",
            itemName: item.itemName || "",
            originalQty: item.quantity || item.qty || 0,
            amendmentQty: item.quantity || item.qty || 0,
            originalRate: item.rate || 0,
            amendmentRate: item.rate || 0,
            originalDeliveryDate: fmtDate(item.deliveryDate),
            amendmentDeliveryDate: fmtDate(item.deliveryDate),
          }));
          setPoDetailRows(mapped);
          setPoDetailError("");
        }
      } catch (error) {
        console.error("Failed to load PO details:", error);
      } finally {
        setLoadingPo(false);
      }
    },
    [orgId, branch],
  );

  useEffect(() => {
    if (header.poNo) {
      const timer = setTimeout(() => loadPoDetails(header.poNo), 500);
      return () => clearTimeout(timer);
    }
  }, [header.poNo, loadPoDetails]);

  /* ---------------- PO Detail row handlers ---------------- */

  const handleCellChange = (idx, key, value) => {
    setPoDetailRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddRow = () => {
    setPoDetailRows((prev) => [
      ...prev,
      { ...emptyPoDetailRow(), id: Date.now(), slNo: prev.length + 1 },
    ]);
    setPoDetailError("");
  };

  const handleRemoveRow = (idx) => {
    setPoDetailRows((prev) =>
      prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, slNo: i + 1 })),
    );
  };

  /* ---------------- Attachments ---------------- */

  const addAttachment = () => {
    setAttachmentFiles((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttachment = (index, file) => {
    setAttachmentFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file };
      return updated;
    });
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant Id is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.amendmentDate)
      errors.amendmentDate = "Amendment Date is required";
    if (!header.partyCode?.trim()) errors.partyCode = "Party Code is required";
    if (!header.poNo?.trim()) errors.poNo = "PO No is required";

    setFieldErrors(errors);

    const hasValidRow = poDetailRows.some((r) => r.itemCode?.trim());
    if (!hasValidRow) {
      setPoDetailError("At least one PO detail item is required");
      setActiveTab("poDetail");
    } else {
      setPoDetailError("");
    }

    return Object.keys(errors).length === 0 && hasValidRow;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      ...header,
      amendmentNo:
        header.amendmentNo || `AMD${dayjs().format("YYYYMMDDHHmmss")}`,
      revisionNo: isUpdate ? Number(header.revisionNo) || 1 : 1,
      orgId,
      branch,
      createdBy: loginUserName,
      poDetails: poDetailRows
        .filter((r) => r.itemCode?.trim())
        .map((d) => ({
          ...d,
          amendmentQty: Number(d.amendmentQty) || 0,
          amendmentRate: Number(d.amendmentRate) || 0,
        })),
    };

    try {
      const res = await purchaseOrderAmendmentAPI.createUpdate(payload);
      if (res?.status) {
        addToast(
          isUpdate
            ? "Amendment updated successfully"
            : "Amendment created successfully",
          "success",
        );
        onBack();
      } else {
        addToast(res?.message || "Failed to save amendment", "error");
      }
    } catch (error) {
      addToast(error?.message || "Failed to save amendment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) onBack();
  };

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {data
              ? "Edit Purchase Order Amendment"
              : "Add Purchase Order Amendment"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <label className={labelClasses}>Active</label>
          <ToggleButton
            value={header.active}
            onChange={(v) => setHeader((prev) => ({ ...prev, active: v }))}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Purchase Order Amendment Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant Id"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={PLANT_IDS}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={BELONGS_TO}
              required
            />
            <Field
              label="Amendment No"
              name="amendmentNo"
              value={header.amendmentNo}
              onChange={handleHeaderChange}
              disabled
              placeholder="Auto-generated"
            />
            <Field
              type="date"
              label="Amendment Date"
              name="amendmentDate"
              value={header.amendmentDate}
              onChange={handleHeaderChange}
              error={fieldErrors.amendmentDate}
              required
            />
            <Field
              label="Party Code"
              name="partyCode"
              value={header.partyCode}
              onChange={handleHeaderChange}
              error={fieldErrors.partyCode}
              required
            />
            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="PO No"
              name="poNo"
              value={header.poNo}
              onChange={handleHeaderChange}
              error={fieldErrors.poNo}
              required
            />
            <Field
              type="date"
              label="PO Date"
              name="poDate"
              value={header.poDate}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Currency"
              name="currency"
              value={header.currency}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="number"
              label="Exchange Rate"
              name="exchangeRate"
              value={header.exchangeRate}
              onChange={handleHeaderChange}
            />
            <Field
              label="Ref No"
              name="refNo"
              value={header.refNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Ref Date"
              name="refDate"
              value={header.refDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Revision No"
              name="revisionNo"
              value={header.revisionNo}
              onChange={handleHeaderChange}
              disabled
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "poDetail" && loadingPo && (
                <span className="text-xs text-gray-500">
                  Loading PO details...
                </span>
              )}
              {activeTab === "poDetail" && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              )}
              {activeTab === "attachment" && (
                <button
                  type="button"
                  onClick={addAttachment}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          </div>

          {/* PO Detail tab */}
          {activeTab === "poDetail" && (
            <div className="pt-3">
              <DynamicTable
                columns={PO_DETAIL_COLUMNS}
                rows={poDetailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {poDetailError && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {poDetailError}
                </p>
              )}
            </div>
          )}

          {/* Summary tab */}
          {activeTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Freight Type"
                  name="freightType"
                  value={header.freightType}
                  onChange={handleHeaderChange}
                  options={FREIGHT_TYPES}
                />
                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={header.packingType}
                  onChange={handleHeaderChange}
                  options={PACKING_TYPES}
                />
                <Field
                  type="number"
                  label="Insurance Amount"
                  name="insuranceAmount"
                  value={header.insuranceAmount}
                  onChange={handleHeaderChange}
                />
                <Field
                  type="select"
                  label="Mode of Dispatch"
                  name="modeOfDispatch"
                  value={header.modeOfDispatch}
                  onChange={handleHeaderChange}
                  options={MODE_OF_DISPATCH}
                />
                <Field
                  label="Tax Description"
                  name="taxDescription"
                  value={header.taxDescription}
                  onChange={handleHeaderChange}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={header.remarks}
                  onChange={handleHeaderChange}
                  className="col-span-2 md:col-span-2 xl:col-span-2"
                />
              </div>
            </div>
          )}

          {/* Attachment tab */}
          {activeTab === "attachment" && (
            <div className="pt-3 space-y-2">
              <TableWrapper>
                <TableHead headers={["#", "Document", "Action"]} />
                <tbody>
                  {attachmentFiles.map((att, index) => (
                    <tr
                      key={att.id}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-1 text-center font-medium dark:text-white">
                        {index + 1}
                      </td>
                      <td className="p-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              updateAttachment(
                                index,
                                e.target.files?.[0] || null,
                              )
                            }
                            className={`${controlClasses} h-8 text-xs file:mr-2 file:px-2 file:py-0.5 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                          />
                          {att.file && (
                            <span className="text-[10px] text-gray-500 truncate max-w-[160px]">
                              {att.file.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          disabled={attachmentFiles.length <= 1}
                          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                            attachmentFiles.length <= 1
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
              <p className="text-[10px] text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={handleCancel}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderAmendmentForm;
