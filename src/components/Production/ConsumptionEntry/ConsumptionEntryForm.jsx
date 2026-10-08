import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import consumptionEntryAPI from "../../../api/Production/consumptionEntryAPI";
import { toast } from "../../../utils/toast";

/* ---------------------------------------------------------------------------- */
/* Design tokens - identical to DirectPurchaseForm                              */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

const tabClasses = (active) =>
  `px-4 py-1.5 text-xs font-semibold rounded-t transition-colors ${
    active
      ? "bg-blue-600 text-white"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
  }`;

const rowClasses =
  "border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors";

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const round = (n, d = 3) => Number(n.toFixed(d));

const todayISO = () => new Date().toISOString().slice(0, 10);

const toInputDate = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) {
    const [y, m, d] = value;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
};

// Same financial-year convention as the doc-id API (2026 for Oct 2026)
const getFinancialYear = () => {
  const stored = localStorage.getItem("finYear");
  if (stored) return stored;
  const now = new Date();
  return String(
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1,
  );
};

let rowSeq = 0;
const nextKey = () => `r${Date.now()}_${rowSeq++}`;

const blankSfgRow = () => ({
  key: nextKey(),
  itemId: "",
  itemCode: "",
  itemDescription: "",
  unitId: "",
  unit: "",
  consumedQty: "",
});

// RM row maths mirrors createUpdateConsumptionEntryVOByDTO on the backend:
//   actual = bomQty * fgConsumedQty
//   total  = scrap + wastage + actual
//   amount = rate * total
const calcRm = (row) => {
  const actual = num(row.bomQty) * num(row.fgQty);
  const total = num(row.scrapQty) + num(row.wastageQty) + actual;
  const amount = num(row.rate) * total;
  return {
    actual: round(actual),
    total: round(total),
    amount: round(amount, 2),
  };
};

/* ---------------------------------------------------------------------------- */
/* Field (same as DirectPurchaseForm)                                           */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
}) => {
  const lbl = (
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
  const err = error && (
    <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>
  );

  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        {lbl}
        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {err}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {lbl}
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {err}
    </div>
  );
};

const RemoveButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`h-5 w-5 rounded text-white flex items-center justify-center transition-colors mx-auto ${
      disabled
        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
    }`}
  >
    <Trash2 size={10} />
  </button>
);

const AddButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
  >
    <Plus size={12} />
  </button>
);

const TabTitle = ({ children, onAdd }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </h3>
    {onAdd && <AddButton onClick={onAdd} />}
  </div>
);

/* ---------------------------------------------------------------------------- */

const ConsumptionEntryForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = Number(localStorage.getItem("orgId"));
  const FIN_YEAR = getFinancialYear();
  const isEdit = Boolean(editData?.id);

  const [activeTab, setActiveTab] = useState("sfgFg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---- dropdown data ---- */
  const currentBranch = useMemo(
    () => consumptionEntryAPI.getCurrentBranch(),
    [],
  );
  const [branches, setBranches] = useState([]);
  const [editBranch, setEditBranch] = useState(null);
  const [locations, setLocations] = useState([]);
  const [entryTypes, setEntryTypes] = useState([]);
  const [fgItems, setFgItems] = useState([]);
  const [rmItemOptions, setRmItemOptions] = useState([]);

  /* ---- form data ---- */
  // type        -> free entry (string)
  // consumption -> free entry (string)
  // entryType   -> list-of-values id (getListValuesGroup TYPE) - the 2nd "Type"
  const [header, setHeader] = useState({
    branch: currentBranch.id ? String(currentBranch.id) : "",
    docId: "",
    type: "",
    docDate: todayISO(),
    fromDate: "",
    toDate: "",
    consumption: "",
    location: "",
    entryType: "",
  });
  const [sfgRows, setSfgRows] = useState([blankSfgRow()]);
  const [rmRows, setRmRows] = useState([]);
  const [narration, setNarration] = useState("");
  const [meta, setMeta] = useState({ active: true, cancelRemarks: "" });

  /* ---------------------------------------------------------------------- */
  /* Dropdown options                                                       */

  const branchOptions = useMemo(() => {
    const opts = branches.map((b) => ({
      value: String(b.id),
      label: b.branchName || b.branchCode || String(b.id),
    }));
    if (editBranch && !opts.some((o) => o.value === String(editBranch.id))) {
      opts.push({
        value: String(editBranch.id),
        label:
          editBranch.branchName ||
          editBranch.branchCode ||
          String(editBranch.id),
      });
    }
    return opts;
  }, [branches, editBranch]);

  const locationOptions = useMemo(() => {
    const opts = locations.map((l) => ({
      value: String(l.id),
      label: l.locationName || String(l.id),
    }));
    return opts;
  }, [locations]);

  const entryTypeOptions = useMemo(
    () =>
      entryTypes.map((t) => ({
        value: String(t.id),
        label: t.valuesDescription,
      })),
    [entryTypes],
  );

  /* ---------------------------------------------------------------------- */
  /* Initial loads                                                          */

  useEffect(() => {
    consumptionEntryAPI
      .getBranches(ORG_ID)
      .then(setBranches)
      .catch(() => setBranches([]));

    consumptionEntryAPI
      .getListValuesGroup("TYPE", ORG_ID)
      .then(setEntryTypes)
      .catch(() => setEntryTypes([]));

    if (!isEdit) {
      consumptionEntryAPI
        .getConsumptionEntryDocId(FIN_YEAR, ORG_ID)
        .then((docId) => setHeader((p) => ({ ...p, docId })))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Branch-dependent data (locations + FG/SFG items)
  useEffect(() => {
    if (!header.branch) {
      setFgItems([]);
      setLocations([]);
      return;
    }
    let cancelled = false;

    consumptionEntryAPI
      .getFgAndSfgItemDetails(Number(header.branch), ORG_ID)
      .then((list) => !cancelled && setFgItems(list))
      .catch(() => !cancelled && setFgItems([]));

    consumptionEntryAPI
      .getLocations(Number(header.branch), ORG_ID)
      .then((list) => !cancelled && setLocations(list))
      .catch(() => !cancelled && setLocations([]));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.branch]);

  /* ---------------------------------------------------------------------- */
  /* EDIT - load everything by id                                           */

  const applyResponse = (r) => {
    if (r.branch?.id) setEditBranch(r.branch);

    setHeader({
      branch: r.branch?.id ? String(r.branch.id) : "",
      docId: r.docId || "",
      type: r.type || "",
      docDate: toInputDate(r.docDate) || todayISO(),
      fromDate: toInputDate(r.fromDate),
      toDate: toInputDate(r.toDate),
      consumption: r.consumption || "",
      location: r.location?.id ? String(r.location.id) : "",
      entryType: r.entryType?.id ? String(r.entryType.id) : "",
    });

    const sfg = (r.consumptionEntryDetailsResponseDTO || []).map((d) => ({
      key: nextKey(),
      itemId: d.item?.id ? String(d.item.id) : "",
      itemCode: d.item?.itemCode || "",
      itemDescription: d.item?.itemDescription || "",
      unitId: d.unit?.id ? String(d.unit.id) : "",
      unit: d.unit?.unitId || "",
      consumedQty: d.consumedQty ?? "",
    }));
    setSfgRows(sfg.length ? sfg : [blankSfgRow()]);

    const rm = (r.rmConsumptionEntryDetailsResponseDTO || []).map((d) => {
      const bom = num(d.consumptionAsPerBomQty);
      return {
        key: nextKey(),
        fgItem: null, // link to FG row is not stored by the backend
        itemId: d.item?.id ? String(d.item.id) : "",
        itemCode: d.item?.itemCode || "",
        itemDescription: d.item?.itemDescription || "",
        unitId: d.unit?.id ? String(d.unit.id) : "",
        unit: d.unit?.unitId || "",
        bomQty: bom,
        availableStock: d.availableStock ?? "",
        // backend: actual = bom * consumedQty  =>  consumedQty = actual / bom
        fgQty: bom > 0 ? round(num(d.actualConsumedQty) / bom, 6) : 0,
        wastageQty: d.wastageQty ?? "",
        scrapQty: d.scrapQty ?? "",
        rate: d.rate ?? "",
      };
    });
    setRmRows(rm);
    setRmItemOptions(
      rm.map((d) => ({
        itemId: d.itemId,
        itemCode: d.itemCode,
        itemDescription: d.itemDescription,
        unitId: d.unitId,
        unitDescription: d.unit,
        bomQty: d.bomQty,
        scrapQty: d.scrapQty,
      })),
    );

    setNarration(r.narration || "");
    setMeta({
      // backend returns "Active"/"Inactive" (string) - the save DTO needs a boolean
      active: r.active === true || r.active === "Active",
      cancelRemarks: r.cancelRemarks || "",
    });
  };

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    if (editData?.docId) {
      setHeader((p) => ({ ...p, docId: editData.docId }));
    }

    (async () => {
      try {
        setLoadingEdit(true);
        const r = await consumptionEntryAPI.getConsumptionEntryById(
          editData.id,
        );
        if (!cancelled && r) applyResponse(r);
      } catch (e) {
        console.error(e);
        if (!cancelled)
          toast.error(e?.message || "Failed to load Consumption Entry");
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  /* ---------------------------------------------------------------------- */
  /* Header handlers                                                        */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    setHeader((p) => ({ ...p, [name]: value }));
  };

  // User changed the plant: item lists are plant specific, so reset rows
  const handleBranchChange = (e) => {
    const { value } = e.target;
    if (fieldErrors.branch) setFieldErrors((p) => ({ ...p, branch: "" }));
    setHeader((p) => ({ ...p, branch: value, location: "" }));
    setSfgRows([blankSfgRow()]);
    setRmRows([]);
    setRmItemOptions([]);
  };

  /* ---------------------------------------------------------------------- */
  /* SFG / FG rows                                                          */

  const fetchRmFor = async (fgItemId, fgQty) => {
    try {
      const list = await consumptionEntryAPI.getRawMaterialConsumptionEntry(
        Number(header.branch),
        Number(fgItemId),
        ORG_ID,
      );

      const mapped = list.map((m) => ({
        key: nextKey(),
        fgItem: String(fgItemId),
        itemId: String(m.itemId),
        itemCode: m.itemCode || "",
        itemDescription: m.itemDescription || "",
        unitId: String(m.unitId ?? ""),
        unit: m.unitDescription || "",
        bomQty: num(m.bomQty),
        availableStock: "",
        fgQty: num(fgQty),
        wastageQty: "",
        scrapQty: m.scrapQty ?? "",
        rate: "",
      }));

      setRmItemOptions((previous) => {
        const merged = [...previous];
        mapped.forEach((m) => {
          const index = merged.findIndex(
            (x) => String(x.itemId) === String(m.itemId),
          );
          const option = {
            itemId: m.itemId,
            itemCode: m.itemCode,
            itemDescription: m.itemDescription,
            unitId: m.unitId,
            unitDescription: m.unit,
            bomQty: m.bomQty,
            scrapQty: m.scrapQty,
          };
          if (index >= 0) merged[index] = option;
          else merged.push(option);
        });
        return merged;
      });

      return mapped;
    } catch (e) {
      toast.error("Failed to load raw materials for the selected item");
      return [];
    }
  };

  const handleSfgItemChange = async (idx, itemId) => {
    const prevItemId = sfgRows[idx]?.itemId;
    const item = fgItems.find((i) => String(i.itemId) === String(itemId));
    const qty = sfgRows[idx]?.consumedQty;

    setSfgRows((rows) =>
      rows.map((r, i) =>
        i === idx
          ? {
              ...r,
              itemId,
              itemCode: item?.itemCode || "",
              itemDescription: item?.itemDescription || "",
              unitId: item ? String(item.unitId) : "",
              unit: item?.unitDescription || "",
            }
          : r,
      ),
    );

    // drop RM rows that belonged to the previous item of this row
    setRmRows((rows) =>
      prevItemId ? rows.filter((r) => r.fgItem !== String(prevItemId)) : rows,
    );

    if (itemId) {
      const rmList = await fetchRmFor(itemId, qty);
      setRmRows((rows) => [
        ...rows.filter((r) => r.fgItem !== String(itemId)),
        ...rmList,
      ]);
    }
  };

  const handleSfgQtyChange = (idx, value) => {
    const itemId = sfgRows[idx]?.itemId;
    setSfgRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, consumedQty: value } : r)),
    );
    if (itemId) {
      setRmRows((rows) =>
        rows.map((r) =>
          r.fgItem === String(itemId) ? { ...r, fgQty: num(value) } : r,
        ),
      );
    }
  };

  const handleAddSfgRow = () => setSfgRows((rows) => [...rows, blankSfgRow()]);

  const handleRemoveSfgRow = (idx) => {
    const itemId = sfgRows[idx]?.itemId;
    setSfgRows((rows) => rows.filter((_, i) => i !== idx));
    if (itemId) {
      setRmRows((rows) => rows.filter((r) => r.fgItem !== String(itemId)));
    }
  };

  /* ---------------------------------------------------------------------- */
  /* RM rows                                                                */

  const handleRmItemChange = (key, itemId) => {
    const item = rmItemOptions.find(
      (option) => String(option.itemId) === String(itemId),
    );

    setRmRows((rows) =>
      rows.map((row) => {
        if (row.key !== key) return row;

        if (!itemId || !item) {
          return {
            ...row,
            itemId: "",
            itemCode: "",
            itemDescription: "",
            unitId: "",
            unit: "",
            bomQty: 0,
            scrapQty: "",
          };
        }

        return {
          ...row,
          itemId: String(item.itemId),
          itemCode: item.itemCode || "",
          itemDescription: item.itemDescription || "",
          unitId: String(item.unitId ?? ""),
          unit: item.unitDescription || "",
          bomQty: num(item.bomQty),
          scrapQty: item.scrapQty ?? row.scrapQty ?? "",
        };
      }),
    );
  };

  const handleAddRmRow = () =>
    setRmRows((rows) => [
      ...rows,
      {
        key: nextKey(),
        fgItem: null,
        itemId: "",
        itemCode: "",
        itemDescription: "",
        unitId: "",
        unit: "",
        bomQty: 0,
        availableStock: "",
        fgQty: 0,
        wastageQty: "",
        scrapQty: "",
        rate: "",
      },
    ]);

  const handleRmChange = (key, field, value) =>
    setRmRows((rows) =>
      rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );

  const handleRemoveRmRow = (key) =>
    setRmRows((rows) => rows.filter((r) => r.key !== key));

  const rmTotals = useMemo(
    () =>
      rmRows.reduce(
        (acc, r) => {
          const c = calcRm(r);
          return { total: acc.total + c.total, amount: acc.amount + c.amount };
        },
        { total: 0, amount: 0 },
      ),
    [rmRows],
  );

  /* ---------------------------------------------------------------------- */
  /* Validate + save                                                        */

  const validate = () => {
    const errors = {};
    if (!header.branch) errors.branch = "Plant is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";

    const filled = sfgRows.filter((r) => r.itemId);
    let sfgError = "";
    if (filled.length === 0) {
      sfgError = "Add at least one SFG/FG item";
    } else if (filled.some((r) => num(r.consumedQty) <= 0)) {
      sfgError = "Consumed Qty must be greater than 0 for every item";
    }

    setFieldErrors(errors);
    if (sfgError) {
      setActiveTab("sfgFg");
      toast.error(sfgError);
    }
    return Object.keys(errors).length === 0 && !sfgError;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...(isEdit && { id: editData.id }),
      active: meta.active,
      branch: Number(header.branch),
      cancelRemarks: meta.cancelRemarks || "",
      consumption: header.consumption,
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      entryType: header.entryType ? Number(header.entryType) : null,
      financialYear: FIN_YEAR,
      fromDate: header.fromDate || null,
      toDate: header.toDate || null,
      location: header.location ? Number(header.location) : null,
      narration: narration || "",
      orgId: ORG_ID,
      type: header.type,
      consumptionEntryDetailsDTO: sfgRows
        .filter((r) => r.itemId)
        .map((r) => ({
          consumedQty: num(r.consumedQty),
          item: Number(r.itemId),
          unit: r.unitId ? Number(r.unitId) : null,
        })),
      // Backend computes actual / total / amount from these - it needs every
      // number below to be non-null, so default to 0.
      rmConsumptionEntryDetailsDTO: rmRows
        .filter((r) => r.itemId)
        .map((r) => ({
          item: Number(r.itemId),
          unit: r.unitId ? Number(r.unitId) : null,
          consumptionAsPerBomQty: num(r.bomQty),
          availableStock: num(r.availableStock),
          consumedQty: num(r.fgQty),
          wastageQty: num(r.wastageQty),
          scrapQty: num(r.scrapQty),
          rate: num(r.rate),
        })),
    };

    try {
      const response =
        await consumptionEntryAPI.updateCreateConsumptionEntry(payload);
      const ok = response?.status === true || response?.statusFlag === "Ok";

      if (ok) {
        toast.success(
          response?.paramObjectsMap?.message ||
            (isEdit
              ? "Consumption Entry Updated Successfully"
              : "Consumption Entry Created Successfully"),
        );
        if (onSave) onSave(response?.paramObjectsMap?.consumptionEntryVO);
      } else {
        toast.error(
          response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            "Failed to save Consumption Entry",
        );
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save Consumption Entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */

  const selectedItemIds = sfgRows.map((r) => String(r.itemId)).filter(Boolean);

  return (
    <div className="p-2 max-w-7xl relative">
      {loadingEdit && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 rounded-lg">
          <span className="text-xs text-gray-700 dark:text-gray-200">
            Loading Consumption Entry...
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Consumption Entry" : "Add Consumption Entry"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Form Fields */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Plant"
            name="branch"
            value={header.branch}
            onChange={handleBranchChange}
            options={branchOptions}
            disabled={isEdit}
            required
            error={fieldErrors.branch}
          />
          <Field
            label="Doc Id"
            name="docId"
            value={header.docId || "Auto"}
            onChange={() => {}}
            disabled
          />
          <Field
            label="Type"
            name="type"
            value={header.type}
            onChange={handleHeaderChange}
          />
          <Field
            type="date"
            label="Doc Date"
            name="docDate"
            value={header.docDate}
            onChange={handleHeaderChange}
            disabled
            required
            error={fieldErrors.docDate}
          />
          <Field
            type="date"
            label="From Date"
            name="fromDate"
            value={header.fromDate}
            onChange={handleHeaderChange}
          />
          <Field
            type="date"
            label="To Date"
            name="toDate"
            value={header.toDate}
            onChange={handleHeaderChange}
          />
          <Field
            label="Consumption ?"
            name="consumption"
            value={header.consumption}
            onChange={handleHeaderChange}
          />
          <Field
            type="select"
            label="Location"
            name="location"
            value={header.location}
            onChange={handleHeaderChange}
            options={locationOptions}
          />
          <Field
            type="select"
            label="Type"
            name="entryType"
            value={header.entryType}
            onChange={handleHeaderChange}
            options={entryTypeOptions}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("sfgFg")}
            className={tabClasses(activeTab === "sfgFg")}
          >
            1-SFG / FG Consumption
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rm")}
            className={tabClasses(activeTab === "rm")}
          >
            2-RM Consumption
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={tabClasses(activeTab === "summary")}
          >
            3-Summary
          </button>
        </div>

        {/* ---------------- 1 - SFG / FG Consumption ---------------- */}
        {activeTab === "sfgFg" && (
          <div className="mt-2">
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs min-w-[700px]">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      S.no
                    </th>
                    <th className="p-1 text-left min-w-[150px] dark:text-gray-200">
                      SFG/FG Item Code *
                    </th>
                    <th className="p-1 text-left min-w-[200px] dark:text-gray-200">
                      Item Description
                    </th>
                    <th className="p-1 text-left min-w-[80px] dark:text-gray-200">
                      Unit
                    </th>
                    <th className="p-1 text-left min-w-[110px] dark:text-gray-200">
                      Consumed Qty *
                    </th>
                    <th className="p-1 text-center w-10 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sfgRows.map((row, idx) => {
                    // API list (minus items picked in other rows) + this row's own
                    // saved item, so edit mode always shows it
                    const options = fgItems
                      .filter(
                        (i) =>
                          String(i.itemId) === String(row.itemId) ||
                          !selectedItemIds.includes(String(i.itemId)),
                      )
                      .map((i) => ({
                        value: String(i.itemId),
                        label: i.itemCode,
                      }));
                    if (
                      row.itemId &&
                      !options.some((o) => o.value === String(row.itemId))
                    ) {
                      options.unshift({
                        value: String(row.itemId),
                        label: row.itemCode || String(row.itemId),
                      });
                    }

                    return (
                      <tr key={row.key} className={rowClasses}>
                        <td className="p-1 text-center font-medium dark:text-gray-300">
                          {idx + 1}
                        </td>
                        <td className="p-1">
                          <select
                            value={row.itemId}
                            onChange={(e) =>
                              handleSfgItemChange(idx, e.target.value)
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[140px]`}
                          >
                            <option value="">Select</option>
                            {options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.itemDescription}
                            disabled
                            placeholder="Description"
                            className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.unit}
                            disabled
                            className={`${controlClasses} h-8 text-xs w-full min-w-[70px]`}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.consumedQty}
                            onChange={(e) =>
                              handleSfgQtyChange(idx, e.target.value)
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <RemoveButton
                            onClick={() => handleRemoveSfgRow(idx)}
                            disabled={sfgRows.length <= 1}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 2 - RM Consumption ---------------- */}
        {activeTab === "rm" && (
          <div className="mt-2">
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 whitespace-nowrap w-10 text-center dark:text-white">
                      S.no
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[140px] dark:text-white">
                      Item Code
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[190px] dark:text-white">
                      Item Description
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[80px] dark:text-white">
                      Unit
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[130px] dark:text-white">
                      Consumption As Per Bom Qty
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[110px] dark:text-white">
                      Available Stock
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[120px] dark:text-white">
                      Actual Consumed Qty
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[100px] dark:text-white">
                      Wastage Qty
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[100px] dark:text-white">
                      Scrap Qty
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[120px] dark:text-white">
                      Total Consumed Qty
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[100px] dark:text-white">
                      Rate
                    </th>
                    <th className="p-2 whitespace-nowrap text-left min-w-[110px] dark:text-white">
                      Amount
                    </th>
                    <th className="p-2 whitespace-nowrap w-10 text-center dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rmRows.length === 0 && (
                    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td
                        colSpan={13}
                        className="p-2 text-center text-gray-500 dark:text-gray-400"
                      >
                        Select SFG/FG Item Code in tab 1 to load raw materials.
                        You can also add a row using + and select an Item Code.
                      </td>
                    </tr>
                  )}

                  {rmRows.map((row, idx) => {
                    const c = calcRm(row);
                    const selectedRmIds = rmRows
                      .filter((r) => r.key !== row.key && r.itemId)
                      .map((r) => String(r.itemId));

                    const options = rmItemOptions
                      .filter(
                        (item) =>
                          String(item.itemId) === String(row.itemId) ||
                          !selectedRmIds.includes(String(item.itemId)),
                      )
                      .map((item) => ({
                        value: String(item.itemId),
                        label: item.itemCode || String(item.itemId),
                      }));

                    if (
                      row.itemId &&
                      !options.some((o) => o.value === String(row.itemId))
                    ) {
                      options.unshift({
                        value: String(row.itemId),
                        label: row.itemCode || String(row.itemId),
                      });
                    }

                    return (
                      <tr
                        key={row.key}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-2 text-center font-medium dark:text-white">
                          {idx + 1}
                        </td>

                        <td className="p-2 align-top">
                          <select
                            value={row.itemId || ""}
                            onChange={(e) =>
                              handleRmItemChange(row.key, e.target.value)
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[140px]`}
                          >
                            <option value="">-- Select --</option>
                            {options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="text"
                            value={row.itemDescription || ""}
                            disabled
                            placeholder="Description"
                            className={`${controlClasses} h-8 text-xs w-full min-w-[190px]`}
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="text"
                            value={row.unit || ""}
                            disabled
                            className={`${controlClasses} h-8 text-xs w-full min-w-[80px]`}
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            value={row.bomQty ?? ""}
                            disabled
                            className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.availableStock ?? ""}
                            onChange={(e) =>
                              handleRmChange(
                                row.key,
                                "availableStock",
                                e.target.value,
                              )
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            value={c.actual.toFixed(2)}
                            disabled
                            className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.wastageQty ?? ""}
                            onChange={(e) =>
                              handleRmChange(
                                row.key,
                                "wastageQty",
                                e.target.value,
                              )
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.scrapQty ?? ""}
                            onChange={(e) =>
                              handleRmChange(
                                row.key,
                                "scrapQty",
                                e.target.value,
                              )
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            value={c.total.toFixed(2)}
                            disabled
                            className={`${controlClasses} h-8 text-xs w-full min-w-[110px]`}
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.rate ?? ""}
                            onChange={(e) =>
                              handleRmChange(row.key, "rate", e.target.value)
                            }
                            className={`${controlClasses} h-8 text-xs w-full min-w-[90px]`}
                            placeholder="0.00"
                          />
                        </td>

                        <td className="p-2 align-top">
                          <input
                            type="number"
                            value={c.amount.toFixed(2)}
                            disabled
                            className={`${controlClasses} h-8 text-xs w-full min-w-[100px]`}
                          />
                        </td>

                        <td className="p-2 text-center align-top">
                          <RemoveButton
                            onClick={() => handleRemoveRmRow(row.key)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 3 - Summary ---------------- */}
        {activeTab === "summary" && (
          <div className="mt-2 space-y-3">
            <div className={fieldGrid}>
              <Field
                label="Narration"
                name="narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter Narration"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || loadingEdit}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionEntryForm;
