import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import jobOrderAmendmentAPI from "../../../api/jobOrderAmendmentAPI";
import jobOrderAPI from "../../../api/jobOrderAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

// Spacious grid used inside the child tabs so fields breathe more.
const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

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
            "w-full h-[30px] px-2 py-1 rounded border text-xs leading-none transition-colors overflow-y-auto resize-none " +
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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
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
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={12} />
      </button>
    </td>
  </tr>
);

/* Generic dynamic table. Supports text / select / readonly columns.
   Options may be plain strings or { value, label } objects. */
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
            ) : (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "date" ? "date" : "text"}
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
                />
              </td>
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const CHILD_TABS = [
  { key: "jobOrderDetails", label: "Job Order Details", kind: "table" },
  { key: "jobOrderSummary", label: "Job Order Summary", kind: "fields" },
];

const emptyJobOrderDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  oldQty: "",
  newQty: "",
});

const emptySummary = () => ({
  oldDeliveryDate: "",
  newDeliveryDate: "",
  remarks: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoDocId = () =>
  `JOA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const JobOrderAmendmentForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("jobOrderDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [partyOptions, setPartyOptions] = useState([]);
  const [jobOrderOptions, setJobOrderOptions] = useState([]);
  const [jobOrderMap, setJobOrderMap] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    partyId: data?.partyId || "",
    partyName: data?.partyName || "",
    jobOrderNo: data?.jobOrderNo || "",
    jobOrderDate: data?.jobOrderDate || "",
    docId: data?.docId || (data ? "" : autoDocId()),
    docDate: data?.docDate || todayStr(),
    revisionNo: data?.revisionNo ?? 1,
    active: data?.active !== false,
  }));

  const [jobOrderDetailRows, setJobOrderDetailRows] = useState(
    data?.jobOrderDetails?.length
      ? data.jobOrderDetails
      : [emptyJobOrderDetailRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });

  /* ---------------- Lookup loading ---------------- */

  const loadParties = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setPartyOptions(
        (res || []).map((p) => ({
          value: p.id,
          label: p.customerName || p.docId || p.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
    }
  }, [orgId, branch]);

  const loadJobOrders = useCallback(async () => {
    try {
      const res = await jobOrderAPI.getJobOrderByOrgId(orgId, branch);
      const map = {};
      const options = (res || []).map((jo) => {
        map[jo.jobOrderNo] = jo;
        return { value: jo.jobOrderNo, label: jo.jobOrderNo };
      });
      setJobOrderOptions(options);
      setJobOrderMap(map);
    } catch (error) {
      console.error("Failed to load job order options:", error);
      setJobOrderOptions([]);
      setJobOrderMap({});
    }
  }, [orgId, branch]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.itemCode] = it;
        return { value: it.itemCode, label: it.itemCode };
      });
      setItemOptions(options);
      setItemMasterMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [orgId, branch]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branch, orgId);
      setUnitOptions(
        (res || []).map((u) => ({
          value: u.id,
          label: u.unitId,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);
      setUnitOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId && branch) {
      loadParties();
      loadJobOrders();
      loadItems();
      loadUnits();
    }
  }, [orgId, branch, loadParties, loadJobOrders, loadItems, loadUnits]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "partyId") {
        const party = partyOptions.find((p) => p.value === value);
        next.partyName = party?.label || "";
      }

      if (name === "jobOrderNo") {
        const job = jobOrderMap[value];
        if (job) {
          next.jobOrderDate = job.date || job.jobOrderDate || "";
          const latestRevision =
            Number(job.revisionNo || job.amendmentRevision || 0) || 0;
          next.revisionNo =
            latestRevision > 0 ? latestRevision + 1 : prev.revisionNo || 1;
          setSummary((s) => ({
            ...s,
            oldDeliveryDate:
              job.terms?.deliveryDate || job.deliveryDate || s.oldDeliveryDate,
          }));
          const details = job.orderDetails || [];
          setJobOrderDetailRows(
            details.length
              ? details.map((d) => {
                  const code = d.incomingItem || d.itemCode || "";
                  return {
                    itemCode: code,
                    itemDescription:
                      d.itemDescription ||
                      itemMasterMap[code]?.itemDescription ||
                      "",
                    unit: d.unit || itemMasterMap[code]?.primaryUnits?.id || "",
                    oldQty: d.orderQty ?? d.oldQty ?? "",
                    newQty: d.orderQty ?? d.newQty ?? "",
                  };
                })
              : [emptyJobOrderDetailRow()],
          );
        }
      }

      return next;
    });
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setJobOrderDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "itemCode") {
          const item = itemMasterMap[value];
          next = {
            ...next,
            itemDescription: item?.itemDescription || "",
            unit: item?.primaryUnits?.id || "",
          };
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setJobOrderDetailRows((prev) => [...prev, emptyJobOrderDetailRow()]);
  const handleRemoveRow = (idx) =>
    setJobOrderDetailRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.partyId) errors.partyId = "Party Id is required";
    if (!header.partyName?.trim()) errors.partyName = "Party Name is required";
    if (!header.jobOrderNo) errors.jobOrderNo = "Job Order No is required";
    if (!header.jobOrderDate)
      errors.jobOrderDate = "Job Order Date is required";
    if (!header.docId?.trim()) errors.docId = "Doc Id is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (header.revisionNo === "" || header.revisionNo === null)
      errors.revisionNo = "Revision No is required";

    const hasValidRow = jobOrderDetailRows.some(
      (r) => r.itemCode && Number(r.newQty) > 0,
    );
    if (!hasValidRow)
      errors.jobOrderDetails =
        "Add at least one item with an Item Code and a New Qty greater than 0";

    if (
      summary.oldDeliveryDate &&
      summary.newDeliveryDate &&
      summary.newDeliveryDate < summary.oldDeliveryDate
    )
      errors.newDeliveryDate =
        "New Delivery Date cannot be before Old Delivery Date";

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
      revisionNo: Number(header.revisionNo) || 0,
      jobOrderDetails: jobOrderDetailRows.filter((r) => r.itemCode?.trim()),
      summary,
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response =
        await jobOrderAmendmentAPI.createUpdateJobOrderAmendment(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Job Order Amendment updated successfully!"
              : "Job Order Amendment created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Job Order Amendment.",
        );
      }
    } catch (err) {
      console.error("Save Job Order Amendment Error:", err);
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
          {data ? "Edit Job Order Amendment" : "Add Job Order Amendment"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Job Order Amendment</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Party Id"
              name="partyId"
              value={header.partyId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyId}
              options={partyOptions}
              required
            />
            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
              onChange={handleHeaderChange}
              error={fieldErrors.partyName}
              required
              disabled
            />
            <Field
              type="select"
              label="Job Order No"
              name="jobOrderNo"
              value={header.jobOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderNo}
              options={jobOrderOptions}
              required
            />
            <Field
              type="date"
              label="Job Order Date"
              name="jobOrderDate"
              value={header.jobOrderDate}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderDate}
              required
            />
            <Field
              label="Doc Id"
              name="docId"
              value={header.docId}
              onChange={handleHeaderChange}
              error={fieldErrors.docId}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
              disabled
            />
            <Field
              type="number"
              label="Revision No"
              name="revisionNo"
              value={header.revisionNo}
              onChange={handleHeaderChange}
              error={fieldErrors.revisionNo}
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

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Job Order Details tab */}
          {activeChildTab === "jobOrderDetails" && (
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
                    readOnly: true,
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "oldQty", label: "Old Qty", readOnly: true },
                  { key: "newQty", label: "New Qty" },
                ]}
                rows={jobOrderDetailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.jobOrderDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.jobOrderDetails}
                </p>
              )}
            </div>
          )}

          {/* Job Order Summary tab */}
          {activeChildTab === "jobOrderSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="date"
                  label="Old Delivery Date"
                  name="oldDeliveryDate"
                  value={summary.oldDeliveryDate}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="date"
                  label="New Delivery Date"
                  name="newDeliveryDate"
                  value={summary.newDeliveryDate}
                  onChange={handleSummaryChange}
                  error={fieldErrors.newDeliveryDate}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                />
              </div>
            </div>
          )}
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

export default JobOrderAmendmentForm;
