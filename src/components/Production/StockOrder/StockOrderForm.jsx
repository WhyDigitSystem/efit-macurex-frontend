import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import stockOrderAPI from "../../../api/Production/stockOrderAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import { unitMasterAPI } from "../../../api/unitAPI";

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start";

const cellInputClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-500";

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
  { key: "stockDetails", label: "Stock Details", kind: "table" },
  { key: "chargesSummary", label: "Charges Summary", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const toNum = (v) => Number(v) || 0;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/* The by-id API returns relations as objects ({ id, ... }); selects need the id */
const idOf = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
};

// Indian financial year (Apr-Mar): Sep 2026 -> "2026"
const defaultFinYear = () => {
  const d = dayjs();
  return String(d.month() >= 3 ? d.year() : d.year() - 1);
};

const emptyStockDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  requiredQty: "",
  rate: "",
  amount: 0,
});

/* ---------------------------------------------------------------------------- */
/* Stock Order Form                                                             */

const StockOrderForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");
  const isUpdate = Boolean(data?.id);

  // Full record fetched with getStockOrderById (edit mode only)
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // Items / units that exist on the saved record but may be missing from the
  // master lists, so the selects can still show them on edit
  const [extraItemOptions, setExtraItemOptions] = useState([]);
  const [extraUnitOptions, setExtraUnitOptions] = useState([]);

  const financialYear =
    record?.financialYear ||
    data?.financialYear ||
    localStorage.getItem("finYear") ||
    defaultFinYear();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("stockDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ----------
     In edit mode the values are filled from the by-id API (see effect below),
     not from the row passed in by the list screen. */
  const [header, setHeader] = useState({
    plantId: "",
    branch: branch || "",
    stockOrderNo: "",
    date: fmtDate(dayjs()),
    itemCode: "",
  });

  const [stockDetailRows, setStockDetailRows] = useState([
    emptyStockDetailRow(),
  ]);

  const [summary, setSummary] = useState({
    remarks: "",
  });

  // Summary is always derived from the rows
  const totalAmount = round2(
    stockDetailRows.reduce((sum, r) => sum + toNum(r.amount), 0),
  );

  /* ---------- Load record by ID (edit mode) ---------- */
  useEffect(() => {
    if (!data?.id) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const res = await stockOrderAPI.getById(data.id);
        const so = Array.isArray(res) ? res[0] : res;

        if (cancelled) return;

        if (!so) {
          addToast("Failed to load Stock Order data");
          return;
        }

        setRecord(so);

        const branchId = idOf(so.branch);

        const rawDetails = so.details || so.stockDetails || [];

        // Header Item Code = item of the first detail row
        setHeader({
          plantId: branchId,
          branch: branchId || branch || "",
          stockOrderNo: so.docId || "",
          date: fmtDate(so.docDate),
          itemCode: idOf(rawDetails[0]?.item),
        });

        setExtraItemOptions(
          rawDetails
            .filter((d) => idOf(d.item) !== "")
            .map((d) => ({
              value: idOf(d.item),
              label: d.item?.itemCode || String(idOf(d.item)),
              itemDescription: d.item?.itemDescription || "",
            })),
        );

        setExtraUnitOptions(
          rawDetails
            .filter((d) => idOf(d.unit) !== "")
            .map((d) => ({
              value: idOf(d.unit),
              label: d.unit?.unitId || String(idOf(d.unit)),
            })),
        );

        setStockDetailRows(
          rawDetails.length
            ? rawDetails.map((d) => {
                const qty = d.requiredQty ?? "";
                const rate = d.rate ?? "";

                return {
                  itemCode: idOf(d.item),
                  itemDescription:
                    d.item?.itemDescription || d.itemDescription || "",
                  // row unit (not the item's default unit)
                  unit: idOf(d.unit),
                  requiredQty: qty,
                  rate,
                  amount: round2(toNum(qty) * toNum(rate)),
                };
              })
            : [emptyStockDetailRow()],
        );

        setSummary({ remarks: so.remarks || "" });
      } catch (error) {
        console.error("Failed to load Stock Order by ID:", error);
        if (!cancelled) addToast("Failed to load Stock Order data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

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

  const loadBranches = useCallback(async () => {
    try {
      const res = await branchAPI.getBranchByOrgId(orgId);
      setBranchOptions(
        (res || []).map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || b.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load branch options:", error);
      setBranchOptions([]);
    }
  }, [orgId]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      setItemOptions(
        (res || []).map((it) => ({
          value: it.id,
          label: it.itemCode || it.id,
          itemDescription: it.itemDescription || it.itemName || "",
          defaultUnit: it.unit?.id ?? it.unitId ?? "",
        })),
      );
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
    }
  }, [orgId, branch]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branch, orgId);
      setUnitOptions(
        (res || []).map((u) => ({
          value: u.id,
          label: u.unitId || u.unitName || u.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);
      setUnitOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadBranches();
      loadItems();
      loadUnits();
    }
  }, [orgId, loadPlants, loadBranches, loadItems, loadUnits]);

  /* ---------- Stock Order No from backend (new records only) ---------- */
  useEffect(() => {
    if (isUpdate || !orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const docId = await stockOrderAPI.getDocId(financialYear, orgId);
        if (!cancelled && docId)
          setHeader((prev) => ({ ...prev, stockOrderNo: docId }));
      } catch (error) {
        console.error("Failed to fetch Stock Order No:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isUpdate, orgId, financialYear]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  // Applies an item to a row: description + default unit
  const applyItemToRow = (row, itemValue) => {
    const item = itemOptions.find(
      (it) => String(it.value) === String(itemValue),
    );
    const next = {
      ...row,
      itemCode: itemValue,
      itemDescription: item?.itemDescription || "",
    };
    const unitMatch = unitOptions.find(
      (u) => String(u.value) === String(item?.defaultUnit),
    );
    if (unitMatch) next.unit = unitMatch.value;
    return next;
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));

    // Header Item Code pre-fills rows that have no item yet
    if (name === "itemCode" && value) {
      setStockDetailRows((prev) =>
        prev.map((row) => (row.itemCode ? row : applyItemToRow(row, value))),
      );
    }
  };

  const handleStockDetailCellChange = (idx, key, value) => {
    setStockDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        if (key === "itemCode") next = applyItemToRow(row, value);

        // Amount = Required Qty * Rate
        if (key === "requiredQty" || key === "rate") {
          next.amount = round2(toNum(next.requiredQty) * toNum(next.rate));
        }

        return next;
      }),
    );

    if (fieldErrors[`detail.${idx}.${key}`])
      setFieldErrors((prev) => ({ ...prev, [`detail.${idx}.${key}`]: "" }));
  };

  const handleAddRow = () =>
    setStockDetailRows((prev) => [
      ...prev,
      header.itemCode
        ? applyItemToRow(emptyStockDetailRow(), header.itemCode)
        : emptyStockDetailRow(),
    ]);

  const handleRemoveRow = (idx) =>
    setStockDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};
    const isBlank = (v) => v === "" || v === null || v === undefined;

    if (!header.stockOrderNo?.trim())
      errors.stockOrderNo = "Stock Order No is required";
    if (!header.date) errors.date = "Date is required";

    stockDetailRows.forEach((r, i) => {
      if (!r.itemCode) errors[`detail.${i}.itemCode`] = "Item Code is required";
      if (!r.unit) errors[`detail.${i}.unit`] = "Units is required";
      if (isBlank(r.requiredQty) || toNum(r.requiredQty) <= 0)
        errors[`detail.${i}.requiredQty`] = "Required Qty must be > 0";
      if (isBlank(r.rate) || toNum(r.rate) <= 0)
        errors[`detail.${i}.rate`] = "Rate must be > 0";
    });

    if (Object.keys(errors).some((k) => k.startsWith("detail.")))
      errors.stockDetails =
        "Each Stock Details row needs Item Code, Units, Required Qty and Rate";

    setFieldErrors(errors);
    if (errors.stockDetails) addToast(errors.stockDetails);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    // Matches stockOrderDTO (PUT /api/subContract/createUpdateStockOrder)
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      active: record?.active ?? data?.active ?? true,
      branch: Number(header.branch) || branch,
      orgId,
      financialYear: String(financialYear),
      remarks: summary.remarks || "",
      cancelRemarks: record?.cancelRemarks || data?.cancelRemarks || "",
      totalAmount,
      createdBy: isUpdate
        ? record?.createdBy || data?.createdBy || usersId
        : usersId,
      details: stockDetailRows.map((r) => ({
        item: Number(r.itemCode),
        unit: Number(r.unit),
        requiredQty: toNum(r.requiredQty),
        rate: toNum(r.rate),
      })),
    };

    try {
      const response = await stockOrderAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Stock Order updated successfully!"
              : "Stock Order created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            "Failed to save Stock Order.",
        );
      }
    } catch (err) {
      console.error("Save Stock Order Error:", err);
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

  // Master options + any saved value missing from them (no duplicates)
  const mergeOptions = (base, extras) => {
    const seen = new Set(base.map((o) => String(o.value)));
    const missing = extras.filter((o) => {
      const key = String(o.value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return missing.length ? [...base, ...missing] : base;
  };

  const itemSelectOptions = mergeOptions(itemOptions, extraItemOptions);
  const unitSelectOptions = mergeOptions(unitOptions, extraUnitOptions);

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
          {isUpdate ? "Edit Stock Order" : "Add Stock Order"}
        </h2>

        {loading && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Loading...
          </span>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Stock Order Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
            />

            <Field
              label="Stock Order No"
              name="stockOrderNo"
              value={header.stockOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.stockOrderNo}
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
              required
            />
            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.itemCode}
              options={itemSelectOptions}
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

          {/* Tab 1: Stock Details */}
          {activeChildTab === "stockDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "itemCode",
                    label: "Item Code",
                    type: "select",
                    options: itemSelectOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    type: "text",
                    readOnly: true,
                  },
                  {
                    key: "unit",
                    label: "Units",
                    type: "select",
                    options: unitSelectOptions,
                  },
                  { key: "requiredQty", label: "Required Qty", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  {
                    key: "amount",
                    label: "Amount",
                    type: "number",
                    readOnly: true,
                  },
                ]}
                rows={stockDetailRows}
                onCellChange={handleStockDetailCellChange}
                onRemoveRow={handleRemoveRow}
              />
            </div>
          )}

          {/* Tab 2: Charges Summary */}
          {activeChildTab === "chargesSummary" && (
            <div className="pt-3 pb-1">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Total Amount"
                  name="totalAmount"
                  value={totalAmount}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={(e) =>
                    setSummary((s) => ({ ...s, remarks: e.target.value }))
                  }
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
        saveLabel={isUpdate ? "Update" : "Save"}
      />
    </div>
  );
};

export default StockOrderForm;
