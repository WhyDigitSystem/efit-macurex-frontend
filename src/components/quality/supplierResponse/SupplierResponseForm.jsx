import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import supplierResponseAPI from "../../../api/quality/supplierResponseAPI";
import vendorComplaintAPI from "../../../api/quality/vendorComplaintAPI";
import itemAPI from "../../../api/itemAPI";

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
  placeholder = "",
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
          rows={2}
          className={
            "w-full px-2 py-1.5 rounded border text-xs transition-colors resize-none scrollbar-hide " +
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
                    rows={2}
                    value={row[col.key] ?? ""}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-full min-w-[180px] px-2 py-1 rounded border text-xs transition-colors resize-y scrollbar-hide " +
                      "bg-white dark:bg-gray-900 " +
                      "border-gray-300 dark:border-gray-600 " +
                      "text-gray-900 dark:text-gray-100 " +
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                      "dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    }
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
                        : "text"
                  }
                  value={row[col.key] ?? ""}
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
  { key: "responseDetails", label: "Response Details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateDocNo = () =>
  `SR-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */
/* Supplier Response Form                                                        */

const SupplierResponseForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

  const [activeChildTab, setActiveChildTab] = useState("responseDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- Header state ---------- */
  const [header, setHeader] = useState(() => {
    const base = {
      complaintId: data?.complaintId?.id ?? data?.complaintId ?? "",
      docNo: data?.docNo || "",
      complaintDate: data?.complaintDate
        ? fmtDate(data.complaintDate)
        : "",
      docDate: data?.docDate ? fmtDate(data.docDate) : fmtDate(dayjs()),
      productNo: data?.productNo || "",
      productName: data?.productName || "",
      supplierNo: data?.supplierNo || "",
      supplierName: data?.supplierName || "",
    };
    if (!base.docNo) base.docNo = generateDocNo();
    return base;
  });

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.responseDetails?.length
      ? data.responseDetails
      : data?.details?.length
        ? data.details
        : [];
    if (raw.length) {
      return raw.map((item) => ({
        partNo: item.partNo?.id ?? item.partNo ?? "",
        partName: item.partName || "",
        qty: item.qty ?? "",
        responseQty: item.responseQty ?? "",
        reason: item.reason || "",
      }));
    }
    return [{ partNo: "", partName: "", qty: "", responseQty: "", reason: "" }];
  });

  const [summary, setSummary] = useState({
    remarks: data?.remarks || data?.summary?.remarks || "",
  });

  /* ---------- Lookup loading ---------- */

  const [complaintOptions, setComplaintOptions] = useState([]);
  const [complaintRecords, setComplaintRecords] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const loadComplaints = useCallback(async () => {
    try {
      const res = await vendorComplaintAPI.getVendorComplaintByOrgId(orgId, branch);
      setComplaintRecords(res || []);
      setComplaintOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.docNo || c.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load complaint options:", error);
      setComplaintOptions([]);
      setComplaintRecords([]);
    }
  }, [orgId, branch]);

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

  useEffect(() => {
    if (orgId) {
      loadComplaints();
      loadItems();
    }
  }, [orgId, loadComplaints, loadItems]);

  /* ---------------------------------------------------------------------------- */
  /* Handlers                                                                     */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "complaintId") {
        const complaint = complaintRecords.find(
          (c) => String(c.id) === String(value),
        );
        if (complaint) {
          next.complaintDate = complaint.docDate
            ? fmtDate(complaint.docDate)
            : "";
          next.productNo =
            complaint.fgItem?.itemCode ||
            (typeof complaint.fgItem === "object"
              ? complaint.fgItem.id
              : complaint.fgItem) ||
            "";
          next.productName = complaint.fgName || "";
          next.supplierNo =
            complaint.supplierId?.customerCode ||
            complaint.supplierNo ||
            "";
          next.supplierName = complaint.supplierName || "";
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
        if (key === "partNo") {
          const item = itemOptions.find((it) => String(it.value) === String(value));
          next.partName = item?.itemDescription || "";
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [
      ...prev,
      { partNo: "", partName: "", qty: "", responseQty: "", reason: "" },
    ]);

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------------------- */
  /* Validation & Save                                                            */

  const validate = () => {
    const errors = {};

    if (!header.complaintId) errors.complaintId = "Complaint No is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.complaintDate)
      errors.complaintDate = "Complaint Date is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.productName?.trim())
      errors.productName = "Product Name is required";
    if (!header.supplierNo?.trim())
      errors.supplierNo = "Supplier No is required";
    if (!header.supplierName?.trim())
      errors.supplierName = "Supplier Name is required";

    const validRows = detailRows.filter(
      (r) => r.partNo && r.qty !== "" && r.responseQty !== "",
    );
    if (!validRows.length)
      errors.responseDetails =
        "Add at least one Response Detail row with Part No, Qty and Response Qty";
    detailRows.forEach((r, i) => {
      if (!r.partNo) errors[`detail.${i}.partNo`] = "Part No is required";
      if (r.qty === "" || r.qty === null || r.qty === undefined)
        errors[`detail.${i}.qty`] = "Qty is required";
      if (r.responseQty === "" || r.responseQty === null || r.responseQty === undefined)
        errors[`detail.${i}.responseQty`] = "Response Qty is required";
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
      responseDetails: detailRows.filter((r) => r.partNo),
      summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await supplierResponseAPI.createUpdateSupplierResponse(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Supplier Response updated successfully!"
              : "Supplier Response created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Supplier Response.",
        );
      }
    } catch (err) {
      console.error("Save Supplier Response Error:", err);
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
          {data ? "Edit Supplier Response" : "Add Supplier Response"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Response Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Complaint No"
              name="complaintId"
              value={header.complaintId}
              onChange={handleHeaderChange}
              error={fieldErrors.complaintId}
              options={complaintOptions}
              required
            />
            <Field
              label="Doc No"
              name="docNo"
              value={header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
              required
            />
            <Field
              type="date"
              label="Complaint Date"
              name="complaintDate"
              value={header.complaintDate}
              onChange={handleHeaderChange}
              error={fieldErrors.complaintDate}
              required
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />
            <Field
              label="Product No"
              name="productNo"
              value={header.productNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Product Name"
              name="productName"
              value={header.productName}
              onChange={handleHeaderChange}
              error={fieldErrors.productName}
              required
            />
            <Field
              label="Supplier No"
              name="supplierNo"
              value={header.supplierNo}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierNo}
              required
            />
            <Field
              label="Supplier Name"
              name="supplierName"
              value={header.supplierName}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierName}
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

          {/* Tab 1: Response Details */}
          {activeChildTab === "responseDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "partNo",
                    label: "Part No",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "partName",
                    label: "Part Name",
                    type: "text",
                    readOnly: true,
                  },
                  { key: "qty", label: "Qty", type: "number" },
                  { key: "responseQty", label: "Response Qty", type: "number" },
                  { key: "reason", label: "Reason", type: "textarea" },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.responseDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.responseDetails}
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.partNo`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Part No is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.qty`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Qty is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.responseQty`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Response Qty is required in every row
                </p>
              )}
              {detailRows.some((r, i) => fieldErrors[`detail.${i}.reason`]) && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Reason is required in every row
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                  className="col-span-full"
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

export default SupplierResponseForm;