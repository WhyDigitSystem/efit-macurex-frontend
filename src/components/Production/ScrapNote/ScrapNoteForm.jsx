import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import scrapNoteAPI from "../../../api/Production/scrapNoteAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import productionScheduleOrderAPI from "../../../api/Production/productionScheduleOrderAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

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

/* Yes/No toggle matching the Field anatomy: label on top + h-[30px] control.
   Neutral styling in both states - only the switch indicator changes color. */
const ToggleField = ({ label, checked, onChange }) => (
  <div className="w-full">
    <label className={labelClasses}>{label}</label>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full h-[30px] px-2 rounded border text-xs leading-none flex items-center justify-between transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
    >
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
        {checked ? "Yes" : "No"}
      </span>

      <span
        className={
          "relative inline-flex h-[16px] w-[30px] shrink-0 items-center rounded-full transition-colors " +
          (checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600")
        }
      >
        <span
          className={
            "inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-[15px]" : "translate-x-[2px]")
          }
        />
      </span>
    </button>
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
  { key: "scrapDetails", label: "Scrap Details", kind: "table" },
  { key: "reasonDetails", label: "Reason Detail", kind: "table" },
  { key: "summary", label: "Scrap Summary", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const toNum = (v) => Number(v) || 0;

const generateScrapNoteNo = () =>
  `SN-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

const emptyScrapDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  primaryUnit: "",
  stock: "",
  quantity: "",
  weight: "",
  rate: "",
  value: "",
});

const emptyReasonDetailRow = () => ({
  reasonCode: "",
  reasonDescription: "",
  rejectedQty: 0,
});

/* ---------------------------------------------------------------------------- */
/* Scrap Note Form                                                              */

const ScrapNoteForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("scrapDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      belongsTo: data?.belongsTo?.id ?? data?.belongsTo ?? "",
      department: data?.department?.id ?? data?.department ?? "",
      fromLocation: data?.fromLocation?.id ?? data?.fromLocation ?? "",
      toLocation: data?.toLocation?.id ?? data?.toLocation ?? "",
      fgPartNo: data?.fgPartNo?.id ?? data?.fgPartNo ?? "",
      scheduleOrderNo:
        data?.scheduleOrderNo?.id ?? data?.scheduleOrderNo ?? "",
      bomId: data?.bomId?.id ?? data?.bomId ?? "",
      scrapPartNo: data?.scrapPartNo?.id ?? data?.scrapPartNo ?? "",
      scrapNoteNo: data?.scrapNoteNo || data?.docNo || "",
      scrapNoteDate: data?.scrapNoteDate
        ? fmtDate(data.scrapNoteDate)
        : fmtDate(dayjs()),
      time: data?.time || dayjs().format("HH:mm:ss"),
    };
    if (!base.scrapNoteNo) base.scrapNoteNo = generateScrapNoteNo();
    return base;
  });

  const [scrapDetailRows, setScrapDetailRows] = useState(() => {
    const raw = data?.scrapDetails;
    if (raw?.length) {
      return raw.map((item) => ({
        itemCode: item.itemCode?.id ?? item.itemCode ?? "",
        itemDescription: item.itemDescription || item.itemName || "",
        primaryUnit: item.primaryUnit?.id ?? item.primaryUnit ?? "",
        stock: item.stock ?? "",
        quantity: item.quantity ?? "",
        weight: item.weight ?? "",
        rate: item.rate ?? "",
        value: item.value ?? "",
      }));
    }
    return [emptyScrapDetailRow()];
  });

  const [reasonDetailRows, setReasonDetailRows] = useState(() => {
    const raw = data?.reasonDetails;
    if (raw?.length) {
      return raw.map((item) => ({
        reasonCode: item.reasonCode?.id ?? item.reasonCode ?? "",
        reasonDescription: item.reasonDescription || "",
        rejectedQty: item.rejectedQty ?? 0,
      }));
    }
    return [emptyReasonDetailRow()];
  });

  const [summary, setSummary] = useState({
    preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
    authorisedBy: data?.authorisedBy?.id ?? data?.authorisedBy ?? "",
    scrapId:
      data?.summary?.scrapId?.id ??
      data?.summary?.scrapId ??
      data?.scrapId?.id ??
      data?.scrapId ??
      "",
    pmApproval: data?.pmApproval ?? data?.summary?.pmApproval ?? false,
    qualityApproval:
      data?.qualityApproval ?? data?.summary?.qualityApproval ?? false,
    storeApproval:
      data?.storeApproval ?? data?.summary?.storeApproval ?? false,
    narration: data?.narration || data?.summary?.narration || "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [scheduleOrderOptions, setScheduleOrderOptions] = useState([]);
  const [reasonCodeOptions, setReasonCodeOptions] = useState([]);
  const [scrapIdOptions, setScrapIdOptions] = useState([]);

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

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.id,
          label: l.locationName || l.locationId || l.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
    }
  }, [orgId, branch]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId, branch);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        departments.map((d) => ({
          value: d.id,
          label: d.departmentName || d.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeCode || e.employeeName || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
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

  const loadBOMs = useCallback(async () => {
    try {
      const res = await scrapNoteAPI.getBOMs(orgId, branch);
      setBomOptions(
        (res || [])
          .filter((b) => b.id || b.bomId)
          .map((b) => ({
            value: b.id || b.bomId,
            label: b.bomName || b.bomId || String(b.id),
          })),
      );
    } catch (error) {
      console.error("Failed to load BOM options:", error);
      setBomOptions([]);
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
          })),
      );
    } catch (error) {
      console.error("Failed to load schedule order options:", error);
      setScheduleOrderOptions([]);
    }
  }, [orgId, branch]);

  const loadReasonCodes = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("REASON", orgId);
      setReasonCodeOptions(
        (res || []).map((r) => ({
          value: r.id,
          label: r.valuesDescription || r.id,
          description: r.valuesDescription || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load reason code options:", error);
      setReasonCodeOptions([]);
    }
  }, [orgId]);

  const loadScrapIds = useCallback(async () => {
    try {
      const res = await scrapNoteAPI.getScrapMasters(orgId, branch);
      setScrapIdOptions(
        (res || [])
          .filter((s) => s.id || s.scrapCode)
          .map((s) => ({
            value: s.id || s.scrapCode,
            label: s.scrapName || s.scrapCode || String(s.id),
          })),
      );
    } catch (error) {
      console.error("Failed to load scrap id options:", error);
      setScrapIdOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadLocations();
      loadDepartments();
      loadEmployees();
      loadItems();
      loadUnits();
      loadBOMs();
      loadScheduleOrders();
      loadReasonCodes();
      loadScrapIds();
    }
  }, [
    orgId,
    loadPlants,
    loadLocations,
    loadDepartments,
    loadEmployees,
    loadItems,
    loadUnits,
    loadBOMs,
    loadScheduleOrders,
    loadReasonCodes,
    loadScrapIds,
  ]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrapDetailCellChange = (idx, key, value) => {
    setScrapDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "itemCode") {
          const item = itemOptions.find(
            (it) => String(it.value) === String(value),
          );
          next.itemDescription = item ? item.itemDescription || "" : "";
        }

        if (key === "quantity" || key === "rate") {
          next.value = toNum(next.quantity) * toNum(next.rate);
        }

        return next;
      }),
    );

    if (fieldErrors[`detail.${idx}.${key}`])
      setFieldErrors((prev) => ({ ...prev, [`detail.${idx}.${key}`]: "" }));
  };

  const handleReasonDetailCellChange = (idx, key, value) => {
    setReasonDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "reasonCode") {
          const reason = reasonCodeOptions.find(
            (r) => String(r.value) === String(value),
          );
          next.reasonDescription = reason ? reason.description || "" : "";
        }

        return next;
      }),
    );

    if (fieldErrors[`reason.${idx}.${key}`])
      setFieldErrors((prev) => ({ ...prev, [`reason.${idx}.${key}`]: "" }));
  };

  const handleAddRow = () => {
    if (activeChildTab === "scrapDetails")
      setScrapDetailRows((prev) => [...prev, emptyScrapDetailRow()]);
    else if (activeChildTab === "reasonDetails")
      setReasonDetailRows((prev) => [...prev, emptyReasonDetailRow()]);
  };

  const handleRemoveRow = (idx) => {
    if (activeChildTab === "scrapDetails")
      setScrapDetailRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      );
    else if (activeChildTab === "reasonDetails")
      setReasonDetailRows((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
      );
  };

  const totalScrapValue = scrapDetailRows.reduce(
    (sum, r) => sum + toNum(r.value),
    0,
  );

  const handleSummaryToggle = (name) =>
    setSummary((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.fromLocation)
      errors.fromLocation = "From Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";
    if (!header.bomId) errors.bomId = "BOM ID is required";
    if (!header.scrapNoteNo?.trim())
      errors.scrapNoteNo = "Scrap Note No is required";
    if (!header.scrapNoteDate)
      errors.scrapNoteDate = "Scrap Note Date is required";

    const hasValidScrapRow = scrapDetailRows.some(
      (r) => r.itemCode && r.primaryUnit && toNum(r.quantity) > 0 && toNum(r.rate) > 0,
    );
    if (!hasValidScrapRow)
      errors.scrapDetails =
        "Add at least one Scrap Details row with Item Code, Primary Unit, Quantity and Rate";
    scrapDetailRows.forEach((r, i) => {
      if (!r.itemCode)
        errors[`detail.${i}.itemCode`] = "Item Code is required";
      if (!r.primaryUnit)
        errors[`detail.${i}.primaryUnit`] = "Primary Unit is required";
      if (r.quantity === "" || r.quantity === null || r.quantity === undefined)
        errors[`detail.${i}.quantity`] = "Quantity is required";
      if (r.rate === "" || r.rate === null || r.rate === undefined)
        errors[`detail.${i}.rate`] = "Rate is required";
    });

    const hasValidReasonRow = reasonDetailRows.some(
      (r) => r.reasonCode && r.reasonDescription?.trim(),
    );
    if (!hasValidReasonRow)
      errors.reasonDetails =
        "Add at least one Reason Detail row with Reason Code and Reason Description";
    reasonDetailRows.forEach((r, i) => {
      if (!r.reasonCode)
        errors[`reason.${i}.reasonCode`] = "Reason Code is required";
      if (!r.reasonDescription?.trim())
        errors[`reason.${i}.reasonDescription`] =
          "Reason Description is required";
    });

    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!summary.authorisedBy)
      errors.authorisedBy = "Authorised By is required";
    if (!summary.scrapId) errors.scrapId = "Scrap ID is required";

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
      totalScrapValue,
      scrapDetails: scrapDetailRows.filter((r) => r.itemCode),
      reasonDetails: reasonDetailRows.filter((r) => r.reasonCode),
      summary: {
        preparedBy: summary.preparedBy,
        authorisedBy: summary.authorisedBy,
        scrapId: summary.scrapId,
        pmApproval: summary.pmApproval,
        qualityApproval: summary.qualityApproval,
        storeApproval: summary.storeApproval,
        narration: summary.narration || "",
      },
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await scrapNoteAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Scrap Note updated successfully!"
              : "Scrap Note created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Scrap Note.",
        );
      }
    } catch (err) {
      console.error("Save Scrap Note Error:", err);
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
          {data ? "Edit Scrap Note" : "Add Scrap Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Scrap Note Header</SectionHeader>
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
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={departmentOptions}
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required
            />
            <Field
              type="select"
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="To Location"
              name="toLocation"
              value={header.toLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.toLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="FG Part No"
              name="fgPartNo"
              value={header.fgPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.fgPartNo}
              options={itemOptions}
            />
            <Field
              type="select"
              label="Schedule Order No"
              name="scheduleOrderNo"
              value={header.scheduleOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scheduleOrderNo}
              options={scheduleOrderOptions}
            />
            <Field
              type="select"
              label="BOM ID"
              name="bomId"
              value={header.bomId}
              onChange={handleHeaderChange}
              error={fieldErrors.bomId}
              options={bomOptions}
              required
            />
            <Field
              type="select"
              label="Scrap Part No"
              name="scrapPartNo"
              value={header.scrapPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapPartNo}
              options={itemOptions}
            />
            <Field
              label="Scrap Note No"
              name="scrapNoteNo"
              value={header.scrapNoteNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapNoteNo}
              required
            />
            <Field
              type="date"
              label="Scrap Note Date"
              name="scrapNoteDate"
              value={header.scrapNoteDate}
              onChange={handleHeaderChange}
              error={fieldErrors.scrapNoteDate}
              required
            />
            <Field
              label="Time"
              name="time"
              value={header.time}
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

          {/* Tab 1: Scrap Details */}
          {activeChildTab === "scrapDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "itemCode",
                    label: "Item Code",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    type: "text",
                    readOnly: true,
                  },
                  {
                    key: "primaryUnit",
                    label: "Primary Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "stock", label: "Stock", type: "number" },
                  { key: "quantity", label: "Quantity", type: "number" },
                  { key: "weight", label: "Weight", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "value", label: "Value", type: "number", readOnly: true },
                ]}
                rows={scrapDetailRows}
                onCellChange={handleScrapDetailCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.scrapDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.scrapDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Reason Detail */}
          {activeChildTab === "reasonDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "reasonCode",
                    label: "Reason Code",
                    type: "select",
                    options: reasonCodeOptions,
                  },
                  {
                    key: "reasonDescription",
                    label: "Reason Description",
                    type: "textarea",
                  },
                  {
                    key: "rejectedQty",
                    label: "Rejected Qty",
                    type: "number",
                  },
                ]}
                rows={reasonDetailRows}
                onCellChange={handleReasonDetailCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.reasonDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.reasonDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Scrap Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3 pb-1">
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.preparedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Authorised By"
                  name="authorisedBy"
                  value={summary.authorisedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.authorisedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Scrap ID"
                  name="scrapId"
                  value={summary.scrapId}
                  onChange={handleSummaryChange}
                  error={fieldErrors.scrapId}
                  options={scrapIdOptions}
                  required
                />
                <Field
                  type="number"
                  label="Total Scrap Value"
                  name="totalScrapValue"
                  value={totalScrapValue}
                  onChange={() => {}}
                  disabled
                />
                <ToggleField
                  label="PM Approval"
                  checked={summary.pmApproval}
                  onChange={() => handleSummaryToggle("pmApproval")}
                />
                <ToggleField
                  label="Quality Approval"
                  checked={summary.qualityApproval}
                  onChange={() => handleSummaryToggle("qualityApproval")}
                />
                <ToggleField
                  label="Store Approval"
                  checked={summary.storeApproval}
                  onChange={() => handleSummaryToggle("storeApproval")}
                />
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

export default ScrapNoteForm;