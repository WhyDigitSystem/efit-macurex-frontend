import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Paperclip,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import preDeliveryInspectionReportAPI from "../../../api/quality/preDeliveryInspectionReportAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { PARAMETER_TYPES } from "../../../api/quality/parameterMasterAPI";

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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

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

const FileField = ({ label, name, value, onChange, required }) => (
  <div className="w-full">
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>

    <label className="flex items-center gap-2 h-[30px] px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-500 transition-colors">
      <Paperclip className="h-3.5 w-3.5" />
      <span className="truncate">{value || "Choose file..."}</span>
      <input
        type="file"
        name={name}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          onChange({
            target: { name, value: file ? file.name : "" },
          });
        }}
      />
    </label>
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

/* Generic dynamic table. Supports text / number / date / select / readonly
   columns. Options may be plain strings or { value, label } objects. */
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
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
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
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const INSTRUMENT_NAMES = [
  "Vernier Caliper",
  "Micrometer",
  "Height Gauge",
  "CMM",
  "Surface Roughness Tester",
  "Hardness Tester",
  "Plug Gauge",
  "Ring Gauge",
  "Thread Gauge",
  "Dial Gauge",
];

const CHILD_TABS = [
  { key: "inspectionDetails", label: "Inspection Details", kind: "table" },
  { key: "preInspectionSummary", label: "Pre-Inspection Summary", kind: "fields" },
];

const emptyInspectionRow = () => ({
  parameter: "",
  parameterType: "",
  specification: "",
  instrumentName: "",
  unit: "",
  tol: "",
  method: "",
  obs1: "",
  obs2: "",
  obs3: "",
  obs4: "",
  obs5: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */

const PreDeliveryInspectionReportForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("inspectionDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      belongsTo: data?.belongsTo || "",
      transferSlipNo: data?.transferSlipNo || "",
      date: data?.date || dayjs().format("YYYY-MM-DD"),
      itemDescription:
        data?.itemDescription?.itemDescription ??
        data?.itemDescription ??
        "",
      itemCode: data?.itemCode?.id ?? data?.itemCode ?? "",
      itemDrawingNo: data?.itemDrawingNo || "",
      productionScheduleOrderNo: data?.productionScheduleOrderNo || "",
      producedQty: data?.producedQty ?? "",
      scheduleOrderDate: data?.scheduleOrderDate || "",
      scheduleQty: data?.scheduleQty ?? "",
      fromLocation: data?.fromLocation || "",
      customerName: data?.customerName || "",
      customerCode: data?.customerCode?.id ?? data?.customerCode ?? "",
      customerPartNo: data?.customerPartNo || "",
      stock: data?.stock ?? "",
      lcDeliveryScheduleNo: data?.lcDeliveryScheduleNo || "",
      purchaseOrderNo: data?.purchaseOrderNo || "",
      invoiceNo: data?.invoiceNo || "",
      invoiceDate: data?.invoiceDate || "",
      initialPlanNo: data?.initialPlanNo || "",
      attachmentPath: data?.attachmentPath || "",
      active: data?.active !== false,
    };
    base.date = fmtDate(base.date);
    base.scheduleOrderDate = fmtDate(base.scheduleOrderDate);
    base.invoiceDate = fmtDate(base.invoiceDate);
    return base;
  });

  const [inspectionRows, setInspectionRows] = useState(
    data?.inspectionDetails?.length
      ? data.inspectionDetails
      : [emptyInspectionRow()],
  );

  const [summary, setSummary] = useState({
    qtyPassed: data?.preInspectionSummary?.qtyPassed ?? "",
    toLocation:
      data?.preInspectionSummary?.toLocation?.id ??
      data?.preInspectionSummary?.toLocation ??
      "",
    rate: data?.preInspectionSummary?.rate ?? "",
    rejectedQty: data?.preInspectionSummary?.rejectedQty ?? "",
    rejectedLocation:
      data?.preInspectionSummary?.rejectedLocation?.id ??
      data?.preInspectionSummary?.rejectedLocation ??
      "",
    reasonForRejection: data?.preInspectionSummary?.reasonForRejection || "",
    scrapQty: data?.preInspectionSummary?.scrapQty ?? "",
    reworkQty: data?.preInspectionSummary?.reworkQty ?? "",
    reasonForRework: data?.preInspectionSummary?.reasonForRework || "",
    remarks: data?.preInspectionSummary?.remarks || "",
    inspectedBy:
      data?.preInspectionSummary?.inspectedBy?.id ??
      data?.preInspectionSummary?.inspectedBy ??
      "",
    checkedBy:
      data?.preInspectionSummary?.checkedBy?.id ??
      data?.preInspectionSummary?.checkedBy ??
      "",
  });

  /* ---------------- Lookup loading ---------------- */

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

  // From / To / Rejected Location reuse the same plant/branch list as Plant ID.
  useEffect(() => {
    setLocationOptions(plantOptions);
  }, [plantOptions]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode };
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

  const loadCustomers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          customerName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadItems();
      loadUnits();
      loadCustomers();
      loadEmployees();
    }
  }, [orgId, branch, loadItems, loadUnits, loadCustomers, loadEmployees]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "itemCode") {
        const item = itemMasterMap[value];
        next.itemDescription = item?.itemDescription || "";
      }
      if (name === "customerCode") {
        const customer = customerOptions.find(
          (c) => String(c.value) === String(value),
        );
        next.customerName = customer?.customerName || "";
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setInspectionRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        return { ...row, [key]: value };
      }),
    );
  };

  const handleAddRow = () =>
    setInspectionRows((prev) => [...prev, emptyInspectionRow()]);
  const handleRemoveRow = (idx) =>
    setInspectionRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.itemDescription?.trim())
      errors.itemDescription = "Item Description is required";
    if (!header.itemCode) errors.itemCode = "Item Code is required";
    if (!header.fromLocation)
      errors.fromLocation = "From Location is required";
    if (!header.customerCode) errors.customerCode = "Customer Code is required";

    const hasValidRow = inspectionRows.some(
      (r) => r.parameter?.trim() && r.parameterType,
    );
    if (!hasValidRow)
      errors.inspectionDetails =
        "Add at least one inspection row with Parameter and Parameter Type";

    if (!summary.qtyPassed)
      errors.qtyPassed = "Qty Passed is required";
    if (!summary.toLocation) errors.toLocation = "To Location is required";
    if (!summary.rate && Number(summary.rate) !== 0)
      errors.rate = "Rate is required";
    if (!summary.inspectedBy) errors.inspectedBy = "Inspected By is required";
    if (!summary.checkedBy) errors.checkedBy = "Checked By is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + inspection details + summary.
    // The backend maintains the complete inspection history with approval
    // tracking (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      inspectionDetails: inspectionRows.filter((r) => r.parameter?.trim()),
      preInspectionSummary: summary,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await preDeliveryInspectionReportAPI.createUpdatePreDeliveryInspectionReport(
          payload,
        );

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Pre-Delivery Inspection Report updated successfully!"
              : "Pre-Delivery Inspection Report created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Pre-Delivery Inspection Report.",
        );
      }
    } catch (err) {
      console.error("Save Pre-Delivery Inspection Report Error:", err);
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
          {data
            ? "Edit Pre-Delivery Inspection Report"
            : "Add Pre-Delivery Inspection Report"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Pre-Delivery Inspection Report</SectionHeader>
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
              options={BELONGS_TO}
              required
            />
            <Field
              label="Transfer Slip No"
              name="transferSlipNo"
              value={header.transferSlipNo}
              onChange={handleHeaderChange}
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
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleHeaderChange}
              error={fieldErrors.itemDescription}
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
              label="Item Drawing No"
              name="itemDrawingNo"
              value={header.itemDrawingNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Production Schedule Order No"
              name="productionScheduleOrderNo"
              value={header.productionScheduleOrderNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Produced Qty"
              name="producedQty"
              value={header.producedQty}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Schedule Order Date"
              name="scheduleOrderDate"
              value={header.scheduleOrderDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Schedule Qty"
              name="scheduleQty"
              value={header.scheduleQty}
              onChange={handleHeaderChange}
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
              label="Customer Name"
              name="customerName"
              value={header.customerName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Customer Code"
              name="customerCode"
              value={header.customerCode}
              onChange={handleHeaderChange}
              error={fieldErrors.customerCode}
              options={customerOptions}
              required
            />
            <Field
              label="Customer Part No"
              name="customerPartNo"
              value={header.customerPartNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="number"
              label="Stock"
              name="stock"
              value={header.stock}
              onChange={handleHeaderChange}
            />
            <Field
              label="LC Delivery Schedule No"
              name="lcDeliveryScheduleNo"
              value={header.lcDeliveryScheduleNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Purchase Order No"
              name="purchaseOrderNo"
              value={header.purchaseOrderNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Invoice No"
              name="invoiceNo"
              value={header.invoiceNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Invoice Date"
              name="invoiceDate"
              value={header.invoiceDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="Initial Plan No"
              name="initialPlanNo"
              value={header.initialPlanNo}
              onChange={handleHeaderChange}
            />
            <FileField
              label="Attachment Path"
              name="attachmentPath"
              value={header.attachmentPath}
              onChange={handleHeaderChange}
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

          {/* Tab 1: Inspection Details */}
          {activeChildTab === "inspectionDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  { key: "parameter", label: "Parameter" },
                  {
                    key: "parameterType",
                    label: "Parameter Type",
                    type: "select",
                    options: PARAMETER_TYPES,
                  },
                  { key: "specification", label: "Specification" },
                  {
                    key: "instrumentName",
                    label: "Instrument Name",
                    type: "select",
                    options: INSTRUMENT_NAMES,
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "tol", label: "TOL", type: "number" },
                  { key: "method", label: "Method" },
                  { key: "obs1", label: "Obs1" },
                  { key: "obs2", label: "Obs2" },
                  { key: "obs3", label: "Obs3" },
                  { key: "obs4", label: "Obs4" },
                  { key: "obs5", label: "Obs5" },
                ]}
                rows={inspectionRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.inspectionDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.inspectionDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Pre-Inspection Summary */}
          {activeChildTab === "preInspectionSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Qty Passed"
                  name="qtyPassed"
                  value={summary.qtyPassed}
                  onChange={handleSummaryChange}
                  error={fieldErrors.qtyPassed}
                  required
                />
                <Field
                  type="select"
                  label="To Location"
                  name="toLocation"
                  value={summary.toLocation}
                  onChange={handleSummaryChange}
                  error={fieldErrors.toLocation}
                  options={locationOptions}
                  required
                />
                <Field
                  type="number"
                  label="Rate"
                  name="rate"
                  value={summary.rate}
                  onChange={handleSummaryChange}
                  error={fieldErrors.rate}
                  required
                />
                <Field
                  type="number"
                  label="Rejected Qty"
                  name="rejectedQty"
                  value={summary.rejectedQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Rejected Location"
                  name="rejectedLocation"
                  value={summary.rejectedLocation}
                  onChange={handleSummaryChange}
                  options={locationOptions}
                />
                <Field
                  type="textarea"
                  label="Reason for Rejection"
                  name="reasonForRejection"
                  value={summary.reasonForRejection}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Scrap Qty"
                  name="scrapQty"
                  value={summary.scrapQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Rework Qty"
                  name="reworkQty"
                  value={summary.reworkQty}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Reason for Rework"
                  name="reasonForRework"
                  value={summary.reasonForRework}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Inspected By"
                  name="inspectedBy"
                  value={summary.inspectedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.inspectedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Checked By"
                  name="checkedBy"
                  value={summary.checkedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.checkedBy}
                  options={employeeOptions}
                  required
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

export default PreDeliveryInspectionReportForm;
