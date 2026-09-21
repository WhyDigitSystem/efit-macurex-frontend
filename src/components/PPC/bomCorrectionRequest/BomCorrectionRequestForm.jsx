import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import bomCorrectionRequestAPI from "../../../api/PPC/bomCorrectionRequestAPI";
import branchAPI from "../../../api/branchAPI";
import { useToast } from "../../Toast/ToastContext";
import employeeAPI from "../../../api/employeeAPI";

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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-8 gap-y-6 items-start";

const ADDED_REMOVED_OPTIONS = [
  { value: "ADDED", label: "Added" },
  { value: "REMOVED", label: "Removed" },
  { value: "REPLACED", label: "Replaced" },
];

/* ---------------- Department mapping for approval managers ---------------- */

const APPROVAL_DEPARTMENTS = {
  managerProduction: "Production",
  managerQuality: "Quality",
  managerTdCi: "TDC",
  managerPurchase: "Purchase",
  authorisedSignatory: "DIRECTOR MARKETING",
};

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
    const safeValue = value === null || value === undefined ? "" : value;
    const inOptions = (options || []).some(
      (opt) => String(opt.value ?? opt) === String(safeValue),
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
          <option value="">Select {label}</option>
          {showGhost && (
            <option value={safeValue}>{String(safeValue)}</option>
          )}
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
            "border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
            "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
          className={`p-1 whitespace-nowrap ${i === 0
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
          }`}
      >
        X
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options }) => {
  const safeValue = value === null || value === undefined ? "" : value;
  const inOptions = (options || []).some(
    (opt) => String(opt.value ?? opt) === String(safeValue),
  );
  const showGhost = safeValue !== "" && !inOptions;

  return (
    <td className="p-1 align-top min-w-[140px]">
      <select
        value={safeValue}
        onChange={onChange}
        className={cellInputClasses}
      >
        <option value="">-- Select --</option>
        {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
        {(options || []).map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </td>
  );
};

const ToggleCell = ({ value, onChange }) => (
  <td className="p-1 align-top min-w-[100px]">
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative flex items-center w-9 h-5 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
    >
      <span
        className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
      />
    </button>
  </td>
);

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top min-w-[140px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
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
            if (col.type === "toggle") {
              return (
                <ToggleCell
                  key={col.key}
                  value={row[col.key]}
                  onChange={(v) => onCellChange(idx, col.key, v)}
                />
              );
            }
            if (col.readOnly) {
              return <ReadOnlyCell key={col.key} value={row[col.key]} />;
            }
            return (
              <td
                key={col.key}
                className={`p-1 align-top ${col.type === "date" ? "min-w-[140px]" : "min-w-[120px]"
                  }`}
              >
                <input
                  type={col.type || "text"}
                  value={row[col.key] ?? ""}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={cellInputClasses}
                />
              </td>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const emptyHeader = () => ({
  plantId: "",
  docId: "",
  correctionRequestedBy: "",
  date: dayjs().format("YYYY-MM-DD"),
  correctionRequestApprovedBy: "",
  fgPartNo: "",
  productName: "",
  customerPartNo: "",
  customerName: "",
  supplier: "",
  reasonForChange: "",
});

const emptyChangeRow = () => ({
  partNo: "",
  partDescription: "",
  unit: "",
  bomQty: "",
  addedRemoved: "",
});

const emptyApproval = () => ({
  managerProduction: "",
  managerQuality: "",
  managerTdCi: "",
  managerPurchase: "",
  authorisedSignatory: "",
  decision: "",
});

const CHILD_TABS = [
  { key: "changeDetails", label: "Details of Change Required", type: "table" },
  { key: "approval", label: "Correction Approved By", type: "fields" },
];

const BomCorrectionRequestForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const isEditMode = Boolean(data?.id);
  const docIdLoadedRef = useRef(false);
  const itemMapRef = useRef({});

  const [activeTab, setActiveTab] = useState("changeDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [fgItemOptions, setFgItemOptions] = useState([]);
  const [allEmployeeOptions, setAllEmployeeOptions] = useState([]);
  const [employeeOptionsByDept, setEmployeeOptionsByDept] = useState({});

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...emptyHeader(),
    ...(data?.header || {}),
    date:
      fmtDate(data?.header?.date) || dayjs().format("YYYY-MM-DD"),
  }));

  const [changeRows, setChangeRows] = useState(() =>
    data?.changeDetails?.length
      ? data.changeDetails.map((d) => ({ ...emptyChangeRow(), ...d }))
      : [emptyChangeRow()],
  );

  const [approval, setApproval] = useState(() => ({
    ...emptyApproval(),
    ...(data?.approval || {}),
  }));

  /* ---------------- Re-sync when data prop changes ---------------- */

  useEffect(() => {
    if (!data) return;

    setHeader({
      ...emptyHeader(),
      ...(data.header || {}),
      date:
        fmtDate(data.header?.date) || dayjs().format("YYYY-MM-DD"),
    });

    setChangeRows(
      data.changeDetails?.length
        ? data.changeDetails.map((d) => ({ ...emptyChangeRow(), ...d }))
        : [emptyChangeRow()],
    );

    setApproval({
      ...emptyApproval(),
      ...(data.approval || {}),
    });
  }, [data]);

  /* ---------------- Load master data ---------------- */

  useEffect(() => {
    if (!orgId || !branch) return;

    (async () => {
      try {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      } catch (err) {
        console.error("Failed to load branches:", err);
        setPlantOptions([]);
      }
    })();

    (async () => {
      try {
        const list = await employeeAPI.getEmployeeByOrgId(orgId);
        setAllEmployeeOptions(
          (list || []).map((e) => ({
            value: e.id,
            label: e.employeeName || e.employeeId || String(e.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load all employees:", err);
        setAllEmployeeOptions([]);
      }
    })();

    (async () => {
      try {
        const list = await bomCorrectionRequestAPI.getFGItems(branch, orgId);
        const map = { ...itemMapRef.current };
        const opts = (list || []).map((it) => {
          const code = it.itemCode ?? String(it.itemId ?? "");
          map[code] = it;
          return { value: code, label: code };
        });
        itemMapRef.current = map;
        setFgItemOptions(opts);
      } catch (err) {
        console.error("Failed to load FG items:", err);
        setFgItemOptions([]);
      }
    })();

    (async () => {
      try {
        const list = await bomCorrectionRequestAPI.getAllItemsNotFG(
          branch,
          orgId,
        );
        const map = { ...itemMapRef.current };
        const opts = (list || []).map((it) => {
          const code = it.itemCode ?? String(it.itemId ?? "");
          map[code] = it;
          return { value: code, label: code };
        });
        itemMapRef.current = map;
        setItemOptions(opts);
      } catch (err) {
        console.error("Failed to load non-FG items:", err);
        setItemOptions([]);
      }
    })();
  }, [orgId, branch]);

  /* ---------------- Load employees per approval department ---------------- */

  useEffect(() => {
    if (!orgId || !branch) return;

    const loadAll = async () => {
      const entries = Object.entries(APPROVAL_DEPARTMENTS);
      const result = {};

      await Promise.all(
        entries.map(async ([key, dept]) => {
          try {
            const list =
              await bomCorrectionRequestAPI.getEmployeesByDepartment({
                branch,
                department: dept,
                orgId,
              });
            result[key] = (list || []).map((e) => ({
              value: e.id ?? e.employeeId,
              label: e.employeeName || e.employeeId || String(e.id),
            }));
          } catch (err) {
            console.error(`Failed to load employees for ${dept}:`, err);
            result[key] = [];
          }
        }),
      );

      setEmployeeOptionsByDept(result);
    };

    loadAll();
  }, [orgId, branch]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */

  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await bomCorrectionRequestAPI.getDocId({
          financialYear,
          orgId,
        });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Doc Id:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, orgId]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "fgPartNo") {
        const item = itemMapRef.current[value];
        if (item) {
          next.customerName = item.itemDescription || next.customerName;
          next.customerPartNo = item.customerPartNo || next.customerPartNo;
        }
      }

      return next;
    });
  };

  /* ---------------- Change detail row handlers ---------------- */

  const handleCellChange = (idx, key, value) => {
    setChangeRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };

        if (key === "partNo") {
          const item = itemMapRef.current[value];
          if (item) {
            next.partDescription = item.itemDescription || "";
            next.unit = item.unitId || item.unitmasterId || "";
          } else {
            next.partDescription = "";
            next.unit = "";
          }
        }

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setChangeRows((prev) => [...prev, emptyChangeRow()]);

  const handleRemoveRow = (idx) =>
    setChangeRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Approval handlers ---------------- */

  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setApproval((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.correctionRequestedBy)
      errors.correctionRequestedBy = "Correction Requested By is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.correctionRequestApprovedBy)
      errors.correctionRequestApprovedBy =
        "Correction Request Approved By is required";
    if (!header.fgPartNo) errors.fgPartNo = "FG Part No is required";
    if (!header.reasonForChange?.trim())
      errors.reasonForChange = "Reason for Change is required";

    setFieldErrors(errors);

    const validRows = changeRows.every(
      (r) => r.partNo?.trim() && r.addedRemoved?.trim(),
    );

    const validApproval =
      approval.managerProduction &&
      approval.managerQuality &&
      approval.managerTdCi &&
      approval.managerPurchase &&
      approval.authorisedSignatory;

    if (!validRows)
      setTableError(
        "Complete all mandatory columns in the Details of Change Required tab",
      );
    else if (!validApproval)
      setTableError(
        "Complete all mandatory managers in the Correction Approved By tab",
      );
    else setTableError("");

    return Object.keys(errors).length === 0 && validRows && validApproval;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const financialYear = String(new Date().getFullYear());

    const resolveItemId = (code) => {
      const it = itemMapRef.current[code];
      return it?.itemId ?? 0;
    };

    const resolveUnitId = (unitVal) => {
      if (unitVal === null || unitVal === undefined || unitVal === "") {
        return 0;
      }

      if (typeof unitVal === "number") {
        return unitVal;
      }

      const found = Object.values(itemMapRef.current).find(
        (it) =>
          String(it.unitId) === String(unitVal) ||
          String(it.unitmasterId) === String(unitVal),
      );

      return Number(found?.unitmasterId ?? unitVal) || 0;
    };

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),

      active: data?.active ?? true,
      cancel: data?.cancel ?? false,
      cancelRemarks: data?.cancelRemarks ?? "",

      orgId: Number(orgId),
      branch: Number(header.plantId) || 0,
      financialYear,

      createdBy: isUpdate ? data?.createdBy ?? usersId ?? "" : usersId ?? "",

      correctionRequestedBy: Number(header.correctionRequestedBy) || 0,
      correctionRequestApprovedBy:
        Number(header.correctionRequestApprovedBy) || 0,

      fgPartNo: resolveItemId(header.fgPartNo),
      productName: header.productName || "",
      customerPartNo: header.customerPartNo || "",
      customerName: header.customerName || "",
      supplier: header.supplier || "",
      reasonForChange: header.reasonForChange || "",

      managerProduction: Number(approval.managerProduction) || 0,
      managerQuality: Number(approval.managerQuality) || 0,
      managerTdc: Number(approval.managerTdCi) || 0,
      managerPurchase: Number(approval.managerPurchase) || 0,
      authorisedSignator: Number(approval.authorisedSignatory) || 0,

      decision: approval.decision || "",

      details: changeRows
        .filter((r) => r.partNo?.trim())
        .map((r) => ({
          partNo: resolveItemId(r.partNo),
          unit: resolveUnitId(r.unit),
          bomQty: Number(r.bomQty || 0),
          addedRemoved: r.addedRemoved || "",
        })),
    };

    console.log("Saving BOM Correction Request payload:", payload);

    try {
      const response = await bomCorrectionRequestAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "BOM Correction Request updated successfully!"
            : "BOM Correction Request created successfully!"),
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save BOM Correction Request.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save BOM Correction Request Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          "Failed to save BOM Correction Request.",
          "error",
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeColumns = [
    {
      key: "partNo",
      label: "Part No *",
      type: "select",
      options: itemOptions,
    },
    { key: "partDescription", label: "Part Description", readOnly: true },
    { key: "unit", label: "Unit", readOnly: true },
    { key: "bomQty", label: "BOM Qty", type: "number" },
    {
      key: "addedRemoved",
      label: "Added/Removed",
    },
  ];

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data
            ? "Edit BOM Correction Request/Note"
            : "Add BOM Correction Request/Note"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>BOM Correction Request Details</SectionHeader>
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
              label="Doc Id"
              name="docId"
              value={header.docId}
              onChange={handleHeaderChange}
              error={fieldErrors.docId}
              disabled
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
              label="Correction Requested By"
              name="correctionRequestedBy"
              value={header.correctionRequestedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.correctionRequestedBy}
              options={allEmployeeOptions}
              required
            />
            <Field
              type="select"
              label="Correction Request Approved By"
              name="correctionRequestApprovedBy"
              value={header.correctionRequestApprovedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.correctionRequestApprovedBy}
              options={allEmployeeOptions}
              required
            />
            <Field
              type="select"
              label="FG Part No"
              name="fgPartNo"
              value={header.fgPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.fgPartNo}
              options={fgItemOptions}
              required
            />
            <Field
              label="Product Name"
              name="productName"
              value={header.productName}
              onChange={handleHeaderChange}
            />
            <Field
              label="Customer Part No"
              name="customerPartNo"
              value={header.customerPartNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Customer Name"
              name="customerName"
              value={header.customerName}
              onChange={handleHeaderChange}
            />
            <Field
              label="Supplier"
              name="supplier"
              value={header.supplier}
              onChange={handleHeaderChange}
            />
            <Field
              type="textarea"
              label="Reason for Change"
              name="reasonForChange"
              value={header.reasonForChange}
              onChange={handleHeaderChange}
              error={fieldErrors.reasonForChange}
              required
              className="col-span-2"
            />
          </div>
        </div>

        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    setTableError("");
                  }}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "changeDetails" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="pt-2">
            {tableError && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
                {tableError}
              </p>
            )}

            {activeTab === "changeDetails" && (
              <DynamicTable
                columns={changeColumns}
                rows={changeRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
            )}

            {activeTab === "approval" && (
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Manager (Production)"
                  name="managerProduction"
                  value={approval.managerProduction}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerProduction}
                  options={employeeOptionsByDept.managerProduction || []}
                  required
                />
                <Field
                  type="select"
                  label="Manager (Quality)"
                  name="managerQuality"
                  value={approval.managerQuality}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerQuality}
                  options={employeeOptionsByDept.managerQuality || []}
                  required
                />
                <Field
                  type="select"
                  label="Manager (TD/CI)"
                  name="managerTdCi"
                  value={approval.managerTdCi}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerTdCi}
                  options={employeeOptionsByDept.managerTdCi || []}
                  required
                />
                <Field
                  type="select"
                  label="Manager (Purchase)"
                  name="managerPurchase"
                  value={approval.managerPurchase}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerPurchase}
                  options={employeeOptionsByDept.managerPurchase || []}
                  required
                />
                <Field
                  type="select"
                  label="Authorised Signatory (Director – Marketing)"
                  name="authorisedSignatory"
                  value={approval.authorisedSignatory}
                  onChange={handleApprovalChange}
                  error={fieldErrors.authorisedSignatory}
                  options={employeeOptionsByDept.authorisedSignatory || []}
                  required
                />
                <Field
                  type="textarea"
                  label="Decision"
                  name="decision"
                  value={approval.decision}
                  onChange={handleApprovalChange}
                  className="col-span-2"
                />
              </div>
            )}
          </div>
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

export default BomCorrectionRequestForm;