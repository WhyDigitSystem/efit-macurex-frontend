import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import qualityScrapNoteAPI from "../../../api/quality/qualityScrapNoteAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import { employeeAPI } from "../../../api/employeeAPI";

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
/* Options & helpers                                                            */

const QUALITY_APPROVAL = ["Approved", "Rejected", "Pending"];

const CHILD_TABS = [
  { key: "scrapDetails", label: "Scrap Details", kind: "table" },
  { key: "scrapSummary", label: "Scrap Summary", kind: "fields" },
];

const emptyScrapRow = () => ({
  itemCode: "",
  itemDescription: "",
  primaryUnit: "",
  stock: "",
  quantity: "",
  rate: "",
  value: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const pad = (n) => String(n ?? 0).padStart(2, "0");

// API returns time as {hour, minute, second, nano}; the form keeps "HH:mm:ss"
const timeToString = (t) =>
  t && typeof t === "object"
    ? `${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`
    : t || dayjs().format("HH:mm:ss");

// "HH:mm:ss" -> { hour, minute, second, nano } with NUMBERS (not "09" strings)
const stringToTime = (value) => {
  const [hour, minute, second] = String(value || "00:00:00")
    .split(":")
    .map((n) => Number(n) || 0);
  return { hour, minute, second, nano: 0 };
};

// Indian FY starts in April: Sep 2026 -> "2026", Feb 2027 -> "2026"
const getFinancialYear = () => {
  const now = dayjs();
  return String(now.month() >= 3 ? now.year() : now.year() - 1);
};

// Edit mode: API detail rows -> table rows
const mapDetailRows = (details) =>
  details?.length
    ? details.map((d) => ({
        itemCode: d.item?.itemCode || "",
        itemDescription: d.item?.itemDescription || "",
        primaryUnit: d.item?.unit?.id ?? "",
        stock: d.stock ?? "",
        quantity: d.quantity ?? "",
        rate: d.rate ?? "",
        value: d.value != null ? Number(d.value).toFixed(2) : "",
      }))
    : [emptyScrapRow()];

/* ---------------------------------------------------------------------------- */

const QualityScrapNoteForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId") || "";

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

  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? data?.branch?.id ?? "",
      belongsTo: data?.belongsTo?.id ?? "",
      department: data?.department?.id ?? "",
      fromLocation: data?.fromLocation?.id ?? "",
      toLocation: data?.toLocation?.id ?? "",
      preparedBy: data?.preparedBy?.id ?? "",
      snNo: data?.docId || data?.snNo || "",
      snDate: data?.snDate || dayjs().format("YYYY-MM-DD"),
      time: timeToString(data?.time),
      active: data?.active !== false,
    };
    base.snDate = fmtDate(base.snDate);
    return base;
  });

  const [scrapRows, setScrapRows] = useState(() =>
    mapDetailRows(data?.qualityScrapNoteDetailsResponseDTO),
  );

  const [summary, setSummary] = useState({
    authorisedBy: data?.authorizedBy?.id ?? "",
    totalScrapValue: data?.totalScrapValue ?? "",
    qualityApproval: data?.qualityApproval || "",
    narration: data?.narration || "",
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

  // Belongs To -> getListValuesGroup (BELONGS TO)
  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await qualityScrapNoteAPI.getBelongsTo(orgId);
      setBelongsToOptions(
        res.map((v) => ({ value: Number(v.id), label: v.valuesDescription })),
      );
    } catch {
      setBelongsToOptions([]);
    }
  }, [orgId]);

  // From Location / To Location -> getLocationByOrgId
  const loadLocations = useCallback(async () => {
    try {
      const res = await qualityScrapNoteAPI.getLocations(orgId, branch);
      setLocationOptions(
        res.map((l) => ({ value: l.id, label: l.locationName })),
      );
    } catch {
      setLocationOptions([]);
    }
  }, [orgId, branch]);

  // Department -> getAllDepartmentByOrgId (some names are null -> use code)
  const loadDepartments = useCallback(async () => {
    try {
      const res = await qualityScrapNoteAPI.getDepartments(orgId);
      setDepartmentOptions(
        res
          .filter((d) => d.active === "Active")
          .map((d) => ({
            value: d.id,
            label: d.departmentName || d.departmentCode || String(d.id),
          })),
      );
    } catch {
      setDepartmentOptions([]);
    }
  }, [orgId]);

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
      loadBelongsTo();
      loadLocations();
      loadDepartments();
      loadItems();
      loadUnits();
      loadEmployees();
    }
  }, [
    orgId,
    branch,
    loadBelongsTo,
    loadLocations,
    loadDepartments,
    loadItems,
    loadUnits,
    loadEmployees,
  ]);

  // SN No (new record) -> getQualityScrapNoteDocId
  useEffect(() => {
    if (data || !orgId) return;
    (async () => {
      try {
        const docId = await qualityScrapNoteAPI.getQualityScrapNoteDocId(
          getFinancialYear(),
          orgId,
        );
        setHeader((prev) => ({ ...prev, snNo: docId }));
      } catch (error) {
        console.error("Failed to load SN No:", error);
      }
    })();
  }, [data, orgId]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrapCellChange = (idx, key, value) => {
    setScrapRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        const next = { ...row, [key]: value };

        if (key === "itemCode") {
          const item = itemMasterMap[value];
          next.itemDescription = item?.itemDescription || "";
          next.primaryUnit = item?.primaryUnits?.id || "";
          next.stock = item?.stock ?? "";
        }

        // Quantity * Rate = Value
        if (key === "quantity" || key === "rate") {
          const qty = parseFloat(next.quantity) || 0;
          const rate = parseFloat(next.rate) || 0;
          const calc = qty * rate;
          next.value = calc ? calc.toFixed(2) : "";
        }

        return next;
      }),
    );
  };

  const handleAddScrapRow = () =>
    setScrapRows((prev) => [...prev, emptyScrapRow()]);
  const handleRemoveScrapRow = (idx) =>
    setScrapRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  // Total Scrap Value = sum of all row values (recomputed on every render)
  const computedTotalScrapValue = scrapRows.reduce(
    (sum, r) => sum + (parseFloat(r.value) || 0),
    0,
  );

  /* ---------------- Validation & Save ---------------- */

  // A row is sendable only if it has a known item id, quantity and rate
  const isValidRow = (r) =>
    r.itemCode &&
    itemMasterMap[r.itemCode]?.id &&
    Number(r.quantity) > 0 &&
    Number(r.rate) > 0;

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.fromLocation) errors.fromLocation = "From Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!header.snDate) errors.snDate = "SN Date is required";
    // SN No is generated by the backend, so it is not validated here

    const hasValidRow = scrapRows.some((r) => isValidRow(r) && r.primaryUnit);
    if (!hasValidRow)
      errors.scrapDetails =
        "Add at least one item with Item Code, Primary Unit, Quantity and Rate";

    if (!summary.authorisedBy)
      errors.authorisedBy = "Authorised By is required";
    if (!summary.qualityApproval)
      errors.qualityApproval = "Quality Approval is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Shape matches qualityScrapNoteDTO in swagger
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      financialYear: String(data?.financialYear || getFinancialYear()),
      active: isUpdate
        ? data.active === true || data.active === "Active"
        : true,
      belongsTo: Number(header.belongsTo),
      department: Number(header.department),
      fromLocation: Number(header.fromLocation),
      toLocation: Number(header.toLocation),
      preparedBy: Number(header.preparedBy),
      authorizedBy: Number(summary.authorisedBy),
      qualityApproval: summary.qualityApproval,
      narration: summary.narration || "",
      totalScrapValue: Number(computedTotalScrapValue.toFixed(2)),
      time: header.time,
      qualityScrapNoteDetailsDTO: scrapRows.filter(isValidRow).map((r) => ({
        item: Number(itemMasterMap[r.itemCode].id), // DTO needs the item id
        quantity: Number(r.quantity),
        rate: Number(r.rate),
        stock: Number(r.stock) || 0,
        value: Number(r.value) || 0,
      })),
      cancelRemarks: data?.cancelRemarks || "",
      createdBy: String(isUpdate ? data?.createdBy || usersId : usersId),
    };

    try {
      const response =
        await qualityScrapNoteAPI.createUpdateQualityScrapNote(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Quality Scrap Note updated successfully!"
              : "Quality Scrap Note created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Quality Scrap Note.",
        );
      }
    } catch (err) {
      // Log both sides so a 400 can be diagnosed from the console
      console.error("Payload sent:", JSON.stringify(payload, null, 2));
      console.error("Server response:", err.response?.data);
      console.error("Save Quality Scrap Note Error:", err);

      const body = err.response?.data;
      if (body) {
        addToast(
          body.errors?.[0]?.longMessage ||
            body.errors?.[0]?.shortMessage ||
            body.message ||
            body.statusMessage ||
            body.error ||
            JSON.stringify(body),
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
          {data ? "Edit Quality Scrap Note" : "Add Quality Scrap Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Quality Scrap Note</SectionHeader>
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
              options={belongsToOptions}
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
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={employeeOptions}
              required
            />
            <Field
              label="SN No"
              name="snNo"
              value={header.snNo}
              onChange={handleHeaderChange}
              error={fieldErrors.snNo}
              disabled
            />
            <Field
              type="date"
              label="SN Date"
              name="snDate"
              value={header.snDate}
              onChange={handleHeaderChange}
              error={fieldErrors.snDate}
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
                onClick={handleAddScrapRow}
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
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "value", label: "Value", readOnly: true },
                ]}
                rows={scrapRows}
                onCellChange={handleScrapCellChange}
                onRemoveRow={handleRemoveScrapRow}
              />
              {fieldErrors.scrapDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.scrapDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Scrap Summary */}
          {activeChildTab === "scrapSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
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
                  type="number"
                  label="Total Scrap Value"
                  name="totalScrapValue"
                  value={
                    computedTotalScrapValue
                      ? computedTotalScrapValue.toFixed(2)
                      : ""
                  }
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="select"
                  label="Quality Approval"
                  name="qualityApproval"
                  value={summary.qualityApproval}
                  onChange={handleSummaryChange}
                  error={fieldErrors.qualityApproval}
                  options={QUALITY_APPROVAL}
                  required
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

export default QualityScrapNoteForm;
