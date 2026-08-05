import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import bomCorrectionRequestAPI from "../../../api/PPC/bomCorrectionRequestAPI";
import { itemAPI } from "../../../api/itemAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import { branchAPI } from "../../../api/branchAPI";
import { employeeAPI } from "../../../api/employeeAPI";
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
        X
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top min-w-[140px]">
    <select value={value} onChange={onChange} className={cellInputClasses}>
      <option value="">-- Select --</option>
      {(options || []).map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </td>
);

const ToggleCell = ({ value, onChange }) => (
  <td className="p-1 align-top min-w-[100px]">
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative flex items-center w-9 h-5 rounded-full transition-colors ${
        value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${
          value ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
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
                className={`p-1 align-top ${
                  col.type === "date" ? "min-w-[140px]" : "min-w-[120px]"
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

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top min-w-[140px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
  </td>
);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  plantId: "",
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
  bomOnly: false,
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

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "changeDetails", label: "Details of Change Required", type: "table" },
  { key: "approval", label: "Correction Approved By", type: "fields" },
];

const BomCorrectionRequestForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const [activeTab, setActiveTab] = useState("changeDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...emptyHeader(),
    ...data?.header,
    date: fmtDate(data?.header?.date),
  }));

  const [changeRows, setChangeRows] = useState(() =>
    data?.changeDetails?.length
      ? data.changeDetails.map((d) => ({ ...emptyChangeRow(), ...d }))
      : [emptyChangeRow()],
  );

  const [approval, setApproval] = useState(() => ({
    ...emptyApproval(),
    ...data?.approval,
  }));

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

    const loadPlants = async () => {
      try {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchcode || b.id,
          })),
        );
      } catch {
        setPlantOptions([]);
      }
    };

    const loadEmployees = async () => {
      try {
        const res = await employeeAPI.getEmployeeByOrgId(orgId);
        setEmployeeOptions(
          (res || []).map((e) => ({
            value: e.id,
            label: e.employeeName || e.name || e.id,
          })),
        );
      } catch {
        setEmployeeOptions([]);
      }
    };

    const loadItems = async () => {
      try {
        const res = await itemAPI.getItems(orgId, branch);
        const map = {};
        const opts = (res || []).map((it) => {
          const code = it.itemCode || it.code || it.id?.toString() || "";
          map[code] = it;
          return { value: code, label: code };
        });
        setItemOptions(opts);
        setItemMap(map);
      } catch {
        setItemOptions([]);
        setItemMap({});
      }
    };

    const loadUnits = async () => {
      try {
        const res = await unitMasterAPI.getUnits(branch, orgId);
        setUnitOptions(
          (res || []).map((u) => ({
            value: u.unitCode || u.code || u.id?.toString() || "",
            label:
              u.unitName || u.name || u.unitCode || u.code || u.id?.toString() || "",
          })),
        );
      } catch {
        setUnitOptions([]);
      }
    };

    Promise.all([loadPlants(), loadEmployees(), loadItems(), loadUnits()]);
  }, [orgId, branch]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));

    if (name === "fgPartNo") {
      const item = itemMap[value];
      setHeader((prev) => ({
        ...prev,
        fgPartNo: value,
        productName: item?.itemDescription || prev.productName,
      }));
    }
  };

  /* ---------------- Change detail row handlers ---------------- */

  const handleCellChange = (idx, key, value) => {
    setChangeRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "partNo") {
          const item = itemMap[value];
          next.partDescription = item?.itemDescription || "";
          if (item?.primaryUnits?.primaryUnit) {
            next.unit = item.primaryUnits.primaryUnit;
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
    if (!header.fgPartNo?.trim()) errors.fgPartNo = "FG Part No is required";
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
      setTableError("Complete all mandatory columns in the Details of Change Required tab");
    else if (!validApproval)
      setTableError("Complete all mandatory managers in the Correction Approved By tab");
    else setTableError("");

    return (
      Object.keys(errors).length === 0 &&
      validRows &&
      validApproval
    );
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + change details + approval records.
    // Linked to FG part & customer and keeps complete correction history with
    // approval tracking (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      header,
      changeDetails: changeRows
        .filter((r) => r.partNo?.trim())
        .map((r, i) => ({ ...r, sno: i + 1 })),
      approval,
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await bomCorrectionRequestAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "BOM Correction Request updated successfully!"
              : "BOM Correction Request created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save BOM Correction Request.",
        );
      }
    } catch (err) {
      console.error("Save BOM Correction Request Error:", err);
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

  const changeColumns = [
    {
      key: "partNo",
      label: "Part No *",
      type: "select",
      options: itemOptions,
    },
    { key: "partDescription", label: "Part Description", readOnly: true },
    { key: "unit", label: "Unit", type: "select", options: unitOptions },
    { key: "bomOnly", label: "BOM Only", type: "toggle" },
    {
      key: "addedRemoved",
      label: "Added/Removed *",
      type: "select",
      options: ADDED_REMOVED_OPTIONS,
    },
  ];

  return (
    <div className="p-2 max-w-[1600px]">
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
            ? "Edit BOM Correction Request/Note"
            : "Add BOM Correction Request/Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
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
              type="select"
              label="Correction Requested By"
              name="correctionRequestedBy"
              value={header.correctionRequestedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.correctionRequestedBy}
              options={employeeOptions}
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
              label="Correction Request Approved By"
              name="correctionRequestApprovedBy"
              value={header.correctionRequestApprovedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.correctionRequestApprovedBy}
              options={employeeOptions}
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

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
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

          {/* Active tab's content */}
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
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Manager (Quality)"
                  name="managerQuality"
                  value={approval.managerQuality}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerQuality}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Manager (TD/CI)"
                  name="managerTdCi"
                  value={approval.managerTdCi}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerTdCi}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Manager (Purchase)"
                  name="managerPurchase"
                  value={approval.managerPurchase}
                  onChange={handleApprovalChange}
                  error={fieldErrors.managerPurchase}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Authorised Signatory (Director – Marketing)"
                  name="authorisedSignatory"
                  value={approval.authorisedSignatory}
                  onChange={handleApprovalChange}
                  error={fieldErrors.authorisedSignatory}
                  options={employeeOptions}
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