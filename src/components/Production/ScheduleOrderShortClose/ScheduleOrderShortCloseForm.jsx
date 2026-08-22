import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import productionScheduleOrderShortCloseAPI from "../../../api/Production/productionScheduleOrderShortCloseAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start";

const cellInputClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
  "border-gray-300 dark:border-gray-600 cursor-default";

/* ---------------------------------------------------------------------------- */
/* Building blocks                                                             */

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
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
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
      <X className="h-3 w-3" /> Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" /> {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers                                                               */

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-2 whitespace-nowrap ${
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
    <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-2 text-center">
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

/* Generic dynamic table. Supports text / number / date / select / textarea /
   readonly columns. Options may be plain strings or { value, label } objects. */
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
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={row[col.key]}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {(col.options || []).map((opt) => (
                      <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    value={row[col.key]}
                    rows={1}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={cellInputClasses}
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
                        : col.type === "time"
                          ? "time"
                          : "text"
                  }
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={col.readOnly ? cellReadOnlyClasses : cellInputClasses}
                />
              </td>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const CHILD_TABS = [
  { key: "productionOrderDetails", label: "Production Order Details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const toNum = (v) => Number(v) || 0;

const generateShortCloseNo = () =>
  `SC-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

const emptyDetailRow = () => ({
  scheduleOrderNo: "",
  scheduleDate: "",
  scheduleOrderQty: "",
  balanceQty: "",
  newRequiredQty: "",
  shortClosedQty: "",
  reason: "",
});

/* ---------------------------------------------------------------------------- */
/* Production Schedule Order Short Close Form                                   */

const ScheduleOrderShortCloseForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState(
    "productionOrderDetails",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      shortCloseNo: data?.shortCloseNo || data?.docNo || "",
      date: data?.date ? fmtDate(data.date) : fmtDate(dayjs()),
      itemCode: data?.itemCode?.id ?? data?.itemCode ?? "",
      itemDescription: data?.itemDescription || "",
      unit: data?.unit?.id ?? (typeof data?.unit === "object" ? data?.unit?.unitId : data?.unit) ?? "",
    };
    if (!base.shortCloseNo) base.shortCloseNo = generateShortCloseNo();
    return base;
  });

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.productionOrderDetails?.length
      ? data.productionOrderDetails
      : data?.details?.length
        ? data.details
        : [];
    if (raw.length) {
      return raw.map((item) => ({
        scheduleOrderNo:
          item.scheduleOrderNo?.id ?? item.scheduleOrderNo ?? "",
        scheduleDate: item.scheduleDate ? fmtDate(item.scheduleDate) : "",
        scheduleOrderQty: item.scheduleOrderQty ?? "",
        balanceQty: item.balanceQty ?? "",
        newRequiredQty: item.newRequiredQty ?? "",
        shortClosedQty: item.shortClosedQty ?? "",
        reason: item.reason || "",
      }));
    }
    return [emptyDetailRow()];
  });

  const [summary, setSummary] = useState({
    narration: data?.narration || data?.summary?.narration || "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      setItemOptions(
        (res || []).map((it) => ({
          value: it.id,
          label: it.itemCode || it.id,
          itemDescription: it.itemDescription || it.itemName || "",
          unit: it.primaryUnit || it.unit || it.uom || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
    }
  }, [orgId, branch]);

  const loadScheduleOrders = useCallback(async () => {
    try {
      const res = await productionScheduleOrderAPI.getByOrgId(orgId, branch);
      setScheduleOrderOptions(
        (res || [])
          .filter((o) => o.docId || o.subOrderNo || o.id)
          .map((o) => ({
            value: o.docId || o.subOrderNo || o.id,
            label: o.docId || o.subOrderNo || String(o.id),
            scheduleDate: fmtDate(o.date || o.docDate || ""),
            scheduleOrderQty: o.qty ?? o.orderQty ?? o.scheduleQty ?? "",
            balanceQty: o.balanceQty ?? "",
          })),
      );
    } catch (error) {
      console.error("Failed to load schedule order options:", error);
      setScheduleOrderOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadItems();
      loadScheduleOrders();
    }
  }, [orgId, loadPlants, loadItems, loadScheduleOrders]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "itemCode") {
        const item = itemOptions.find(
          (it) => String(it.value) === String(value),
        );
        next.itemDescription = item ? item.itemDescription || "" : "";
        next.unit = item ? item.unit || "" : "";
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "scheduleOrderNo") {
          const order = scheduleOrderOptions.find(
            (o) => String(o.value) === String(value),
          );
          next.scheduleDate = order ? order.scheduleDate || "" : "";
          next.scheduleOrderQty = order ? order.scheduleOrderQty ?? "" : "";
          next.balanceQty = order ? order.balanceQty ?? "" : "";
        }

        return next;
      }),
    );

    if (fieldErrors[`detail.${idx}.${key}`])
      setFieldErrors((prev) => ({ ...prev, [`detail.${idx}.${key}`]: "" }));
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.shortCloseNo?.trim())
      errors.shortCloseNo = "Short Close No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";

    const validRows = detailRows.some(
      (r) => r.scheduleOrderNo && r.shortClosedQty !== "" &&
        r.shortClosedQty !== null && r.reason?.trim(),
    );
    if (!validRows)
      errors.productionOrderDetails =
        "Add at least one Production Order Details row with Schedule Order No, Short Closed Qty and Reason";

    detailRows.forEach((r, i) => {
      if (!r.scheduleOrderNo)
        errors[`detail.${i}.scheduleOrderNo`] = "Schedule Order No is required";
      if (
        r.shortClosedQty === "" ||
        r.shortClosedQty === null ||
        r.shortClosedQty === undefined
      )
        errors[`detail.${i}.shortClosedQty`] = "Short Closed Qty is required";
      if (!r.reason?.trim()) errors[`detail.${i}.reason`] = "Reason is required";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      productionOrderDetails: detailRows.filter((r) => r.scheduleOrderNo),
      summary: {
        narration: summary.narration || "",
      },
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await productionScheduleOrderShortCloseAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Short Close updated successfully!"
              : "Short Close created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Short Close.",
        );
      }
    } catch (err) {
      console.error("Save Short Close Error:", err);
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

  /* ---------------------------------------------------------------------------- */

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  return (
    <div className="w-full p-2">
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
            ? "Edit Production Schedule Order Short-Closed"
            : "Add Production Schedule Order Short-Closed"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Short Close Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              label="Short Close No"
              name="shortCloseNo"
              value={header.shortCloseNo}
              onChange={handleHeaderChange}
              error={fieldErrors.shortCloseNo}
              required
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
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.itemCode}
              options={itemOptions}
              required
            />
            <Field
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Unit"
              name="unit"
              value={header.unit}
              onChange={handleHeaderChange}
              disabled
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${
                    activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta?.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Production Order Details */}
          {activeChildTab === "productionOrderDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "scheduleOrderNo",
                    label: "Schedule Order No",
                    type: "select",
                    options: scheduleOrderOptions,
                  },
                  { key: "scheduleDate", label: "Schedule Date", type: "date" },
                  {
                    key: "scheduleOrderQty",
                    label: "Schedule Order Qty",
                    type: "number",
                  },
                  { key: "balanceQty", label: "Balance Qty", type: "number" },
                  {
                    key: "newRequiredQty",
                    label: "New Required Qty",
                    type: "number",
                  },
                  {
                    key: "shortClosedQty",
                    label: "Short Closed Qty",
                    type: "number",
                  },
                  { key: "reason", label: "Reason", type: "textarea" },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.productionOrderDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.productionOrderDetails}
                </p>
              )}
              {detailRows.some(
                (r, i) => fieldErrors[`detail.${i}.scheduleOrderNo`],
              ) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Schedule Order No is required in every row
                </p>
              )}
              {detailRows.some(
                (r, i) => fieldErrors[`detail.${i}.shortClosedQty`],
              ) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Short Closed Qty is required in every row
                </p>
              )}
              {detailRows.some(
                (r, i) => fieldErrors[`detail.${i}.reason`],
              ) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Reason is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3 pb-1">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
                  onChange={handleSummaryChange}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={data ? "Update" : "Save"}
      />
    </div>
  );
};

export default ScheduleOrderShortCloseForm;