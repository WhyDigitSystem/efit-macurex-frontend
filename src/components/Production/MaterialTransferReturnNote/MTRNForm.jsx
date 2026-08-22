import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import materialTransferReturnNoteAPI from "../../../api/Production/materialTransferReturnNoteAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
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

/* Yes/No toggle matching the Field anatomy: label on top + h-[30px] control,
   so it aligns perfectly with the neighbouring fields in the grid. */
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
  { key: "itemTransferDetails", label: "Item Transfer Details", kind: "table" },
  { key: "summary", label: "Transfer/Return Summary", kind: "fields" },
];

const TYPE_OPTIONS = [
  { value: "Transfer", label: "Transfer" },
  { value: "Return", label: "Return" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const toNum = (v) => Number(v) || 0;

const generateMTRNNo = () =>
  `MTRN-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

const emptyDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  availableQty: "",
  qty: "",
  rate: "",
  value: "",
  reason: "",
  supplierId: "",
  supplierName: "",
});

/* ---------------------------------------------------------------------------- */
/* Material Transfer/Return Note Form                                             */

const MTRNForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("itemTransferDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      belongsTo: data?.belongsTo?.id ?? data?.belongsTo ?? "",
      mtrnNo: data?.mtrnNo || data?.docNo || "",
      mtrnDate: data?.mtrnDate ? fmtDate(data.mtrnDate) : fmtDate(dayjs()),
      type: data?.type || "",
      fromLocation: data?.fromLocation?.id ?? data?.fromLocation ?? "",
      toLocation: data?.toLocation?.id ?? data?.toLocation ?? "",
      fgSfgPartNo: data?.fgSfgPartNo?.id ?? data?.fgSfgPartNo ?? "",
      subOrderNo: data?.subOrderNo?.id ?? data?.subOrderNo ?? "",
      time: data?.time || dayjs().format("HH:mm:ss"),
      preparedBy: data?.preparedBy?.id ?? data?.preparedBy ?? "",
    };
    if (!base.mtrnNo) base.mtrnNo = generateMTRNNo();
    return base;
  });

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.itemTransferDetails?.length
      ? data.itemTransferDetails
      : data?.details?.length
        ? data.details
        : [];
    if (raw.length) {
      return raw.map((item) => ({
        itemCode: item.itemCode?.id ?? item.itemCode ?? "",
        itemDescription: item.itemDescription || item.itemName || "",
        unit: item.unit?.id ?? item.unit ?? "",
        availableQty: item.availableQty ?? "",
        qty: item.qty ?? "",
        rate: item.rate ?? "",
        value: item.value ?? "",
        reason: item.reason || "",
        supplierId: item.supplierId?.id ?? item.supplierId ?? "",
        supplierName: item.supplierName || "",
      }));
    }
    return [emptyDetailRow()];
  });

  const [summary, setSummary] = useState({
    approvedByPM: data?.approvedByPM ?? data?.summary?.approvedByPM ?? false,
    approvedByQC: data?.approvedByQC ?? data?.summary?.approvedByQC ?? false,
    approvedByStores:
      data?.approvedByStores ?? data?.summary?.approvedByStores ?? false,
    narration: data?.narration || data?.summary?.narration || "",
  });

  /* ---------- Lookup loading ---------- */

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [subOrderOptions, setSubOrderOptions] = useState([]);

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

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setSupplierOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          supplierName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load supplier options:", error);
      setSupplierOptions([]);
    }
  }, [orgId, branch]);

  const loadSubOrders = useCallback(async () => {
    try {
      const res = await productionScheduleOrderAPI.getByOrgId(orgId, branch);
      setSubOrderOptions(
        (res || [])
          .filter((o) => o.docId || o.subOrderNo || o.id)
          .map((o) => ({
            value: o.docId || o.subOrderNo || o.id,
            label: o.docId || o.subOrderNo || String(o.id),
          })),
      );
    } catch (error) {
      console.error("Failed to load sub order options:", error);
      setSubOrderOptions([]);
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
      loadSuppliers();
      loadSubOrders();
    }
  }, [
    orgId,
    loadPlants,
    loadLocations,
    loadDepartments,
    loadEmployees,
    loadItems,
    loadUnits,
    loadSuppliers,
    loadSubOrders,
  ]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "itemCode") {
          const item = itemOptions.find(
            (it) => String(it.value) === String(value),
          );
          next.itemDescription = item ? item.itemDescription || "" : "";
        }

        if (key === "supplierId") {
          const supplier = supplierOptions.find(
            (s) => String(s.value) === String(value),
          );
          next.supplierName = supplier ? supplier.supplierName || "" : "";
        }

        if (key === "qty" || key === "rate") {
          next.value = toNum(next.qty) * toNum(next.rate);
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

  const totalValue = detailRows.reduce((sum, r) => sum + toNum(r.value), 0);

  const handleSummaryToggle = (name) =>
    setSummary((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors ok= {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.mtrnNo?.trim()) errors.mtrnNo = "MTRN No is required";
    if (!header.mtrnDate) errors.mtrnDate = "MTRN Date is required";
    if (!header.type) errors.type = "Type is required";
    if (!header.fromLocation)
      errors.fromLocation = "From Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";
    if (!header.fgSfgPartNo)
      errors.fgSfgPartNo = "FG/SFG Part No is required";
    if (!header.subOrderNo) errors.subOrderNo = "Sub Order No is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";

    const validRows = detailRows.some(
      (r) => r.itemCode && r.unit && toNum(r.qty) > 0 && r.reason?.trim(),
    );
    if (!validRows)
      errors.itemTransferDetails =
        "Add at least one Item Transfer Detail row with Item Code, Unit, Qty and Reason";

    detailRows.forEach((r, i) => {
      if (!r.itemCode)
        errors[`detail.${i}.itemCode`] = "Item Code is required";
      if (!r.unit) errors[`detail.${i}.unit`] = "Unit is required";
      if (r.qty === "" || r.qty === null || r.qty === undefined)
        errors[`detail.${i}.qty`] = "Qty is required";
      if (!r.reason?.trim())
        errors[`detail.${i}.reason`] = "Reason is required";
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
      totalValue,
      itemTransferDetails: detailRows.filter((r) => r.itemCode),
      summary: {
        approvedByPM: summary.approvedByPM,
        approvedByQC: summary.approvedByQC,
        approvedByStores: summary.approvedByStores,
        narration: summary.narration || "",
      },
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await materialTransferReturnNoteAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Material Transfer/Return Note updated successfully!"
              : "Material Transfer/Return Note created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Material Transfer/Return Note.",
        );
      }
    } catch (err) {
      console.error("Save MTRN Error:", err);
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
            ? "Edit Material Transfer/Return Note"
            : "Add Material Transfer/Return Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>MTRN Header</SectionHeader>
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
              required
            />
            <Field
              label="MTRN No"
              name="mtrnNo"
              value={header.mtrnNo}
              onChange={handleHeaderChange}
              error={fieldErrors.mtrnNo}
              required
            />
            <Field
              type="date"
              label="MTRN Date"
              name="mtrnDate"
              value={header.mtrnDate}
              onChange={handleHeaderChange}
              error={fieldErrors.mtrnDate}
              required
            />
            <Field
              type="select"
              label="Type"
              name="type"
              value={header.type}
              onChange={handleHeaderChange}
              error={fieldErrors.type}
              options={TYPE_OPTIONS}
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
              label="FG/SFG Part No"
              name="fgSfgPartNo"
              value={header.fgSfgPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.fgSfgPartNo}
              options={itemOptions}
              required
            />
            <Field
              type="select"
              label="Sub Order No"
              name="subOrderNo"
              value={header.subOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.subOrderNo}
              options={subOrderOptions}
              required
            />
            <Field
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={employeeOptions}
              required
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

          {/* Tab 1: Item Transfer Details */}
          {activeChildTab === "itemTransferDetails" && (
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
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "availableQty", label: "Available Qty", type: "number" },
                  { key: "qty", label: "Qty", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "value", label: "Value", type: "number", readOnly: true },
                  {
                    key: "reason",
                    label: "Reason for Rejection/Transfer",
                    type: "textarea",
                  },
                  {
                    key: "supplierId",
                    label: "Supplier ID",
                    type: "select",
                    options: supplierOptions,
                  },
                  {
                    key: "supplierName",
                    label: "Supplier Name",
                    type: "text",
                    readOnly: true,
                  },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.itemTransferDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.itemTransferDetails}
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.itemCode`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Item Code is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.unit`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Unit is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.qty`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Qty is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.reason`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Reason is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Transfer/Return Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3 pb-1">
              <div className={fieldGrid}>
                <Field
                  type="number"
                  label="Total Value"
                  name="totalValue"
                  value={totalValue}
                  onChange={() => {}}
                  disabled
                />
                <ToggleField
                  label="Approved By PM"
                  checked={summary.approvedByPM}
                  onChange={() => handleSummaryToggle("approvedByPM")}
                />
                <ToggleField
                  label="Approved By Q/C"
                  checked={summary.approvedByQC}
                  onChange={() => handleSummaryToggle("approvedByQC")}
                />
                <ToggleField
                  label="Approved By Stores"
                  checked={summary.approvedByStores}
                  onChange={() => handleSummaryToggle("approvedByStores")}
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

export default MTRNForm;