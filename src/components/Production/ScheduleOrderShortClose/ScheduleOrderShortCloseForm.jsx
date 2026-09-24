import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import productionScheduleOrderShortCloseAPI from "../../../api/Production/productionScheduleOrderShortCloseAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";

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
    const safeValue = value === null || value === undefined ? "" : value;
    const safeOptions = (options || []).map((opt) =>
      typeof opt === "object" ? opt : { value: opt, label: opt },
    );
    const inOptions = safeOptions.some(
      (o) => String(o.value) === String(safeValue),
    );
    const showGhost = safeValue !== "" && !inOptions;

    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <select
          name={name}
          value={safeValue}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
          {safeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
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
          className={`p-2 whitespace-nowrap ${i === 0
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
          }`}
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
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
          {columns.map((col) => {
            if (col.type === "select") {
              const safeValue =
                row[col.key] === null || row[col.key] === undefined
                  ? ""
                  : row[col.key];
              const opts = (col.options || []).map((opt) =>
                typeof opt === "object" ? opt : { value: opt, label: opt },
              );
              const inOptions = opts.some(
                (o) => String(o.value) === String(safeValue),
              );
              const showGhost = safeValue !== "" && !inOptions;

              return (
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={safeValue}
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
                    className={cellInputClasses}
                  >
                    <option value="">-- Select --</option>
                    {showGhost && (
                      <option value={safeValue}>{String(safeValue)}</option>
                    )}
                    {opts.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
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
                    onChange={(e) =>
                      onCellChange(idx, col.key, e.target.value)
                    }
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
                  onChange={(e) =>
                    onCellChange(idx, col.key, e.target.value)
                  }
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
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
  {
    key: "productionOrderDetails",
    label: "Production Order Details",
    kind: "table",
  },
  { key: "summary", label: "Summary", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");
const toNum = (v) => Number(v) || 0;

const emptyDetailRow = () => ({
  scheduleOrderNo: "",
  scheduleDate: "",
  scheduleOrderQty: "",
  balanceQty: "",
  newReqQty: "",
  shortClosedQty: "",
  reason: "",
});

/* ---------------------------------------------------------------------------- */

const ScheduleOrderShortCloseForm = ({ data, onBack, onSave }) => {
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

  const isEditMode = Boolean(data?.id);
  const docIdLoadedRef = useRef(false);

  const [activeChildTab, setActiveChildTab] = useState(
    "productionOrderDetails",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId?.id ?? data?.plantId ?? "",
    shortCloseNo: data?.docId ?? data?.shortCloseNo ?? "",
    date: data?.date ? fmtDate(data.date) : fmtDate(dayjs()),
    itemCode: data?.item?.id ?? data?.itemCode ?? "",
    itemDescription:
      data?.item?.itemDescription ?? data?.itemDescription ?? "",
    unit: data?.unit?.unitId ?? "",
    unitId: data?.unit?.id ?? "",
  }));

  const [detailRows, setDetailRows] = useState(() => {
    const raw =
      data?.productionOrderDetailsDTO ||
      data?.productionOrderDetails ||
      data?.details ||
      [];
    if (raw.length) {
      return raw.map((item) => ({
        scheduleOrderNo: item.scheduleOrderNo ?? "",
        scheduleDate: item.scheduleDate ? fmtDate(item.scheduleDate) : "",
        scheduleOrderQty: item.scheduleOrderQty ?? "",
        balanceQty: item.balanceQty ?? "",
        newReqQty: item.newReqQty ?? "",
        shortClosedQty: item.shortClosedQty ?? "",
        reason: item.reason ?? "",
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

  const itemMapRef = useRef({});       // itemId -> item object
  const scheduleMapRef = useRef({});   // docId  -> schedule object

  /* Plants */
  useEffect(() => {
    if (!orgId) return;
    (async () => {
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
      } catch (err) {
        console.error("Failed to load plants:", err);
      }
    })();
  }, [orgId, isMacurex]);

  /* Items */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const list = await productionScheduleOrderShortCloseAPI.getItems({
          branch,
          orgId,
        });
        const map = {};
        setItemOptions(
          (list || []).map((it) => {
            const value = it.itemId;
            map[value] = it;
            return {
              value,
              label: it.itemCode || String(it.itemId),
            };
          }),
        );
        itemMapRef.current = map;
      } catch (err) {
        console.error("Failed to load items:", err);
      }
    })();
  }, [orgId, branch]);

  /* Schedule Orders */
  useEffect(() => {
    if (!orgId || !branch) return;
    (async () => {
      try {
        const list =
          await productionScheduleOrderShortCloseAPI.getScheduleOrders({
            branch,
            orgId,
          });
        const map = {};
        setScheduleOrderOptions(
          (list || []).map((o) => {
            const value = o.docId;
            map[value] = o;
            return { value, label: o.docId };
          }),
        );
        scheduleMapRef.current = map;
      } catch (err) {
        console.error("Failed to load schedule orders:", err);
      }
    })();
  }, [orgId, branch]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */
  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!orgId) return;

    let cancelled = false;
    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId =
          await productionScheduleOrderShortCloseAPI.getDocId({
            financialYear,
            orgId,
          });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, shortCloseNo: docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Short Close Doc Id:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, orgId]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "itemCode") {
        const item = itemMapRef.current[value];

        if (item) {
          next.itemDescription = item.itemDescription || "";

          // Tolerant lookup — the backend may use any of these keys
          const unitDescription =
            item.unitMasterDescription ??
            item.unitMasterDescription ??
              item.unitDescription ??
              item.unitId ??
              item.unit ??
              "";

          const unitId =
            item.unitMasterId ??
            item.unitId ??
            item.unitMasterID ??
            "";

          next.unit = String(unitDescription || "");
          next.unitId = unitId || "";
        } else {
          next.itemDescription = "";
          next.unit = "";
          next.unitId = "";
        }
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
          const order = scheduleMapRef.current[value];
          if (order) {
            next.scheduleDate = fmtDate(order.docDate || "");
            next.scheduleOrderQty = order.scheduleOrderQty ?? "";
            next.balanceQty = order.scheduleOrderQty ?? "";
          }
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
      (r) =>
        r.scheduleOrderNo &&
        r.shortClosedQty !== "" &&
        r.shortClosedQty !== null &&
        r.reason?.trim(),
    );
    if (!validRows)
      errors.productionOrderDetails =
        "Add at least one Production Order Details row with Schedule Order No, Short Closed Qty and Reason";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const financialYear = String(new Date().getFullYear());

    const payload = {
      ...(isUpdate ? { id: Number(data.id) } : {}),

      active: true,
      cancel: false,
      cancelRemarks: "",
      orgId,
      branch,
      financialYear,

      createdBy: isUpdate ? data?.createdBy ?? usersId : usersId,

      item: Number(header.itemCode) || 0,
      unit: Number(header.unitId) || 0,      // ✅ numeric unitMasterId
      narration: summary.narration || "",

      productionOrderDetailsDTO: (detailRows || [])
        .filter((r) => r.scheduleOrderNo)
        .map((r) => ({
          scheduleOrderNo: r.scheduleOrderNo || "",
          scheduleDate: r.scheduleDate || "",
          scheduleOrderQty: toNum(r.scheduleOrderQty),
          balanceQty: toNum(r.balanceQty),
          newReqQty: toNum(r.newReqQty),
          shortClosedQty: toNum(r.shortClosedQty),
          reason: r.reason || "",
        })),
    };

    console.log("📤 Saving Production Schedule Order Short Close:", payload);

    try {
      const response =
        await productionScheduleOrderShortCloseAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Short Close updated successfully!"
            : "Short Close created successfully!"),
          "success",
        );
        if (onSave) onSave(payload);
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Short Close.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Short Close Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.statusMessage ||
        err.response?.data?.error ||
        "Something went wrong.";
      addToast(errorMessage, "error");
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
              disabled
              required
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              disabled
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
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap transition-colors ${activeChildTab === tab.key
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
                    key: "newReqQty",
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
            </div>
          )}

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