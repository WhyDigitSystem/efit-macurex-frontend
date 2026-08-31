import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import issueAPI from "../../../api/Inventory/issueAPI";
import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import itemAPI from "../../../api/itemAPI";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to InternalIndentForm / PartyMasterForm    */

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
/* Shared building blocks - identical to InternalIndentForm / PartyMasterForm  */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
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
            <option key={opt?.id ?? opt} value={opt?.id ?? opt}>
              {opt?.label ?? opt}
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
          rows={4}
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
/* Table helpers - identical to InternalIndentForm / PartyMasterForm           */

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
        <option key={opt?.id ?? opt} value={opt?.id ?? opt}>
          {opt?.itemCode ?? opt?.label ?? opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", disabled }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${cellInputClasses} ${
        disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
      }`}
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
                disabled={col.readOnly}
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
/* Helpers                                                                      */

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

const pickArray = (source, keys) => {
  if (Array.isArray(source)) return source;

  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, k) => (acc ? acc[k] : undefined), source);

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const asId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
};

const BELONGS_TO = ["INTERNAL", "EXTERNAL"];

const emptyHeader = () => ({
  branch: "",
  department: "",
  belongsTo: "",
  docDate: todayISO(),
  time: nowTime(),
  refNo: "",
  refDate: "",
  indentNo: "",
  issueFrom: "",
  issueTo: "",
  issNo: "",
});

const emptySummary = () => ({
  narration: "",
});

const emptyItemRow = () => ({
  item: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  qtyAvailable: "",
  indentQty: "",
  previouslyIssuedQty: "",
  pendingQty: "",
  qty: "",
  rate: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Issues Detail is a table, Summary is a field grid              */

const CHILD_TABS = [
  { key: "issuesDetail", label: "1-Issues Detail", type: "table" },
  { key: "summary", label: "2-Summary", type: "fields" },
];

const IssueForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = Number(localStorage.getItem("orgId"));
  const BRANCH_ID = Number(localStorage.getItem("branchId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("issuesDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingItemRow, setLoadingItemRow] = useState(null);

  const [branchOptions, setBranchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [issueFromOptions, setIssueFromOptions] = useState([]);
  const [issueToOptions, setIssueToOptions] = useState([]);
  const [indentNoOptions, setIndentNoOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const isEditMode = Boolean(editData?.id);
  const dataLoadedRef = useRef(false);

  const [header, setHeader] = useState(emptyHeader());
  const [summary, setSummary] = useState(emptySummary());
  const [itemRows, setItemRows] = useState([emptyItemRow()]);

  /* ---------------- Master data dropdowns ---------------- */

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(ORG_ID);
      setBranchOptions(
        (response || []).map((b) => ({ id: b.id, label: b.branchName })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(ORG_ID);
      const list = pickArray(response, [
        "paramObjectsMap.departmentVO",
        "paramObjectsMap.departmentMasterVO",
        "paramObjectsMap.departmentList",
        "paramObjectsMap.department",
        "data.paramObjectsMap.departmentVO",
      ]);
      setDepartmentOptions(
        list.map((d) => ({ id: d.id, label: d.departmentName ?? d.name })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
    }
  }, [ORG_ID]);

  const loadIssueFromLocations = useCallback(async () => {
    try {
      const response = await issueAPI.getIssueFromLocations(BRANCH_ID, ORG_ID);
      setIssueFromOptions(
        (response || []).map((l) => ({
          id: l.id,
          label: l.locationName ?? l.name,
        })),
      );
    } catch (error) {
      console.error("Failed to load Issue From locations:", error);
      setIssueFromOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadIssueToLocations = useCallback(
    async (issueFrom) => {
      if (!issueFrom) {
        setIssueToOptions([]);
        return;
      }

      try {
        const response = await issueAPI.getIssueToLocations(
          BRANCH_ID,
          issueFrom,
          ORG_ID,
        );
        setIssueToOptions(
          (response || []).map((l) => ({
            id: l.id,
            label: l.locationName ?? l.name,
          })),
        );
      } catch (error) {
        console.error("Failed to load Issue To locations:", error);
        setIssueToOptions([]);
      }
    },
    [ORG_ID, BRANCH_ID],
  );

  const loadItems = useCallback(
    async (indentNo) => {
      if (!indentNo) {
        setItemOptions([]);
        setItemRows([emptyItemRow()]);
        return;
      }

      try {
        const response = await issueAPI.getIssueItemCodes(
          BRANCH_ID,
          indentNo,
          ORG_ID,
        );
        setItemOptions(response || []);
      } catch (error) {
        console.error("Failed to load Item Codes:", error);
        setItemOptions([]);
      }
    },
    [ORG_ID, BRANCH_ID],
  );

  const loadIndentNos = useCallback(async () => {
    try {
      const response = await issueAPI.getIssueIndentNos(BRANCH_ID, ORG_ID);
      setIndentNoOptions(
        (response || []).map((item) => {
          const value =
            item?.indentNo ??
            item?.indentNumber ??
            item?.docId ??
            item?.indentId ??
            item?.id ??
            item;
          return { id: value, label: String(value) };
        }),
      );
    } catch (error) {
      console.error("Failed to load Indent Nos:", error);
      setIndentNoOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadBranches();
    loadDepartments();
    loadIssueFromLocations();
    loadIndentNos();
  }, [
    loadBranches,
    loadDepartments,
    loadIssueFromLocations,
    loadIndentNos,
  ]);

  useEffect(() => {
    loadIssueToLocations(header.issueFrom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.issueFrom]);

  useEffect(() => {
    loadItems(header.indentNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.indentNo]);

  /* ---------------- Edit data mapping ---------------- */

  useEffect(() => {
    if (!isEditMode || dataLoadedRef.current) return;

    const src = editData || {};
    const firstDetail = src.issuesDetails?.[0] || {};

    setHeader({
      branch: asId(src.branch),
      department: asId(src.department),
      belongsTo: src.belongsTo || "",
      docDate: src.docDate || todayISO(),
      time: src.time || nowTime(),
      refNo: src.refNo || "",
      refDate: src.refDate || "",
      indentNo: src.indentNo || "",
      issueFrom: asId(src.issueFrom),
      issueTo: asId(src.issueTo),
      issNo: src.docId || "",
    });

    setSummary({ narration: src.narration || "" });

    const details = (src.issuesDetails || []).map((d) => ({
      item: asId(d.item),
      itemCode: d.item?.itemCode || "",
      itemDescription: d.item?.itemDescription || "",
      unit: d.item?.unit?.unitId || "",
      qtyAvailable: d.qtyAvailable ?? "",
      indentQty: d.indentQty ?? "",
      previouslyIssuedQty: d.previouslyIssuedQty ?? "",
      pendingQty: d.pendingQty ?? "",
      qty: d.qty ?? "",
      rate: d.rate ?? "",
      amount: d.amount ?? "",
    }));

    setItemRows(details.length ? details : [emptyItemRow()]);
    dataLoadedRef.current = true;
  }, [isEditMode, editData]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "issueFrom" ? { issueTo: "" } : {}),
    }));
    if (name === "indentNo") {
      setItemRows([emptyItemRow()]);
    }
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemSelect = async (index, itemId) => {
    const item = itemOptions.find(
      (i) => String(i.id) === String(itemId),
    );

    setItemRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...emptyItemRow(),
              item: itemId,
              itemCode: item?.itemCode || row.itemCode || "",
            }
          : row,
      ),
    );

    if (!itemId) return;

    setLoadingItemRow(index);

    try {
      const detail = item
        ? item
        : await itemAPI.getItemById(itemId);

      if (!detail) return;

      setItemRows((prev) =>
        prev.map((row, rowIndex) => {
          if (rowIndex !== index) return row;
          if (String(row.item) !== String(itemId)) return row;

          const unitObject =
            detail.unit ?? detail.primaryUnits ?? detail.uom ?? null;

          return {
            ...prev[rowIndex],
            itemCode: detail.itemCode ?? "",
            itemDescription:
              detail.itemDescription ?? detail.description ?? "",
            unit:
              detail.unitId ??
              unitObject?.unitId ??
              unitObject?.name ??
              "",
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoadingItemRow((current) => (current === index ? null : current));
    }
  };

  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) => {
      if (key === "item") {
        handleItemSelect(idx, value);
        return;
      }
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      );
    },
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const itemHandlers = makeTableHandlers(setItemRows, emptyItemRow);

  // Config-driven lookup, same pattern as InternalIndentForm's childTabConfig
  const childTabConfig = {
    issuesDetail: {
      type: "table",
      rows: itemRows,
      handlers: itemHandlers,
      columns: [
        {
          key: "item",
          label: "Item Code",
          type: "select",
          options: itemOptions,
        },
        { key: "itemDescription", label: "Item Description", readOnly: true },
        { key: "unit", label: "Unit", readOnly: true },
        {
          key: "qtyAvailable",
          label: "Qty Available",
          type: "number",
        },
        {
          key: "indentQty",
          label: "Indent Qty",
          type: "number",
        },
        {
          key: "previouslyIssuedQty",
          label: "Prev. Issued Qty",
          type: "number",
        },
        {
          key: "pendingQty",
          label: "Pending Qty",
          type: "number",
        },
        { key: "qty", label: "Qty", type: "number" },
        { key: "rate", label: "Rate", type: "number" },
        { key: "amount", label: "Amount", type: "number" },
      ],
    },
    summary: {
      type: "fields",
    },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) errors.branch = "Branch is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.docDate) errors.docDate = "Iss. Date is required";
    if (!header.issueFrom) errors.issueFrom = "Issues From is required";
    if (!header.issueTo) errors.issueTo = "Issue To is required";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ---------------- Submit ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(isEditMode && { id: editData.id }),
      active: true,
      belongsTo: header.belongsTo || "INTERNAL",
      branch: Number(header.branch),
      cancelRemarks: editData?.cancelRemarks || "",
      createdBy: localStorage.getItem("usersId") || "SYSTEM",
      department: Number(header.department),
      docDate: header.docDate || "",
      financialYear: editData?.financialYear || "",
      indentNo: header.indentNo || "",
      issueFrom: Number(header.issueFrom),
      issueTo: Number(header.issueTo),
      narration: summary.narration || "",
      orgId: ORG_ID,
      refDate: header.refDate || "",
      refNo: header.refNo || "",
      time: header.time || "",
      issuesDetails: itemRows
        .filter((r) => r.item)
        .map((item) => ({
          item: Number(item.item),
          qtyAvailable: Number(item.qtyAvailable) || 0,
          indentQty: Number(item.indentQty) || 0,
          previouslyIssuedQty: Number(item.previouslyIssuedQty) || 0,
          pendingQty: Number(item.pendingQty) || 0,
          qty: Number(item.qty) || 0,
          rate: Number(item.rate) || 0,
        })),
    };

    try {
      const response = await issueAPI.updateCreateIssue(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        addToast(
          response?.paramObjectsMap?.message || "Issue saved successfully",
          "success",
        );
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save issue";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      addToast("Failed to save Issue.", "error");
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
          {editData?.id ? "Edit Issue" : "Issues"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Issue Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Branch"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
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
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO.map((v) => ({ id: v, label: v }))}
            />
            <Field
              type="date"
              label="Iss. Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />
            <Field
              type="time"
              label="Time"
              name="time"
              value={header.time}
              onChange={handleHeaderChange}
            />
            <Field
              label="Iss. No."
              name="issNo"
              value={header.issNo || "Auto"}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Issues From"
              name="issueFrom"
              value={header.issueFrom}
              onChange={handleHeaderChange}
              error={fieldErrors.issueFrom}
              options={issueFromOptions}
              required
            />
            <Field
              type="select"
              label="Issue To"
              name="issueTo"
              value={header.issueTo}
              onChange={handleHeaderChange}
              error={fieldErrors.issueTo}
              options={issueToOptions}
              required
            />
            <Field
              type="select"
              label="Indent No"
              name="indentNo"
              value={header.indentNo}
              onChange={handleHeaderChange}
              options={indentNoOptions}
            />
            <Field
              label="Ref. No."
              name="refNo"
              value={header.refNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={header.refDate}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs: Issues Detail / Summary ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
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

          {/* Active tab's content */}
          {loadingItemRow !== null && (
            <p className="text-[11px] text-blue-500 px-1 pt-1">
              Loading item details...
            </p>
          )}

          {activeTabConfig.type === "table" ? (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          ) : (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
                  onChange={handleSummaryChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData?.id ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default IssueForm;