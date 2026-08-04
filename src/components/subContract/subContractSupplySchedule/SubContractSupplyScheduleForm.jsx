import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import subContractSupplyScheduleAPI from "../../../api/subContractSupplyScheduleAPI";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import jobOrderAPI from "../../../api/jobOrderAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import employeeAPI from "../../../api/employeeAPI";
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
            "w-full h-[30px] px-2 py-[9px] rounded border text-xs leading-none transition-colors overflow-y-auto resize-none " +
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

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                  value={row[col.key] ?? ""}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
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

const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];

const CHILD_TABS = [
  { key: "scheduleItemDetails", label: "Schedule Item Details", kind: "table" },
  { key: "subSupplySummary", label: "Sub Supply Summary", kind: "fields" },
];

const emptyItemRow = () => ({
  itemCode: "",
  itemDescription: "",
  primaryUnit: "",
  stock: "",
  qty: "",
  rate: "",
});

const emptySummary = () => ({
  preparedBy: "",
  authorizedBy: "",
  remarks: "",
});

const emptyScheduleRow = () => ({
  planDate: "",
  scheduleQty: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoDocNo = () =>
  `SCSS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const SubContractSupplyScheduleForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("scheduleItemDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [jobOrderOptions, setJobOrderOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    docNo: data?.docNo || (data ? "" : autoDocNo()),
    docDate: data?.docDate || todayStr(),
    belongsTo: data?.belongsTo || "",
    schStartDate: data?.schStartDate || "",
    schEndDate: data?.schEndDate || "",
    partyId: data?.partyId || "",
    partyName: data?.partyName || "",
    contractNo: data?.contractNo || "",
    jobOrderNo: data?.jobOrderNo || "",
    date: data?.date || "",
    active: data?.active !== false,
  }));

  const [itemRows, setItemRows] = useState(
    data?.scheduleItemDetails?.length
      ? data.scheduleItemDetails
      : [emptyItemRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });
  const [scheduleRows, setScheduleRows] = useState(
    data?.schedule?.length ? data.schedule : [emptyScheduleRow()],
  );

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
            label: b.branchName || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

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

  const loadContracts = useCallback(async () => {
    try {
      const res = await supplierRateContractAPI.getSupplierRateContractByOrgId(
        orgId,
        branch,
      );
      setContractOptions(
        (res || []).map((c) => ({
          value: c.contractNo,
          label: c.contractNo,
        })),
      );
    } catch (error) {
      console.error("Failed to load contract options:", error);
      setContractOptions([]);
    }
  }, [orgId, branch]);

  const loadJobOrders = useCallback(async () => {
    try {
      const res = await jobOrderAPI.getJobOrderByOrgId(orgId, branch);
      setJobOrderOptions(
        (res || []).map((jo) => ({
          value: jo.jobOrderNo,
          label: jo.jobOrderNo,
        })),
      );
    } catch (error) {
      console.error("Failed to load job order options:", error);
      setJobOrderOptions([]);
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

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.employeeName || e.id,
          label: e.employeeName || e.id,
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
      loadParties();
      loadContracts();
      loadJobOrders();
      loadItems();
      loadUnits();
    }
  }, [orgId, branch, loadParties, loadContracts, loadJobOrders, loadItems, loadUnits]);

  useEffect(() => {
    if (orgId) loadEmployees();
  }, [orgId, loadEmployees]);

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
      return next;
    });
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemCellChange = (idx, key, value) => {
    setItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "itemCode") {
          const item = itemMasterMap[value];
          return {
            ...next,
            itemDescription: item?.itemDescription || "",
            primaryUnit: item?.primaryUnits?.id || row.primaryUnit || "",
          };
        }
        return next;
      }),
    );
  };

  const handleScheduleCellChange = (idx, key, value) => {
    setScheduleRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddItemRow = () =>
    setItemRows((prev) => [...prev, emptyItemRow()]);
  const handleRemoveItemRow = (idx) =>
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleAddScheduleRow = () =>
    setScheduleRows((prev) => [...prev, emptyScheduleRow()]);
  const handleRemoveScheduleRow = (idx) =>
    setScheduleRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.schStartDate) errors.schStartDate = "Sch. Start Date is required";
    if (!header.schEndDate) errors.schEndDate = "Sch. End Date is required";
    if (!header.partyId) errors.partyId = "Party Id is required";
    if (!header.contractNo) errors.contractNo = "Contract No is required";

    if (
      header.schStartDate &&
      header.schEndDate &&
      header.schEndDate < header.schStartDate
    )
      errors.schEndDate = "Sch. End Date cannot be before Sch. Start Date";

    const hasValidItem = itemRows.some(
      (r) => r.itemCode && Number(r.qty) > 0 && Number(r.rate) > 0,
    );
    if (!hasValidItem)
      errors.scheduleItemDetails =
        "Add at least one item with an Item Code, Qty and Rate greater than 0";

    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!summary.authorizedBy)
      errors.authorizedBy = "Authorized By is required";

    const hasValidSchedule = scheduleRows.some(
      (s) => s.planDate && Number(s.scheduleQty) > 0,
    );
    if (!hasValidSchedule)
      errors.schedule =
        "Add at least one schedule entry with a Plan Date and Schedule Qty greater than 0";

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
      scheduleItemDetails: itemRows.filter((r) => r.itemCode?.trim()),
      summary,
      schedule: scheduleRows,
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response =
        await subContractSupplyScheduleAPI.createUpdateSubContractSupplySchedule(
          payload,
        );

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Sub Contract Supply Schedule updated successfully!"
              : "Sub Contract Supply Schedule created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Sub Contract Supply Schedule.",
        );
      }
    } catch (err) {
      console.error("Save Sub Contract Supply Schedule Error:", err);
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
            ? "Edit Sub Contract Supply Schedule"
            : "Add Sub Contract Supply Schedule"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Sub Contract Supply Schedule</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              label="Doc No"
              name="docNo"
              value={header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
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
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={header.schStartDate}
              onChange={handleHeaderChange}
              error={fieldErrors.schStartDate}
              required
            />
            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={header.schEndDate}
              onChange={handleHeaderChange}
              error={fieldErrors.schEndDate}
              required
            />
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
              disabled
            />
            <Field
              type="select"
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              error={fieldErrors.contractNo}
              options={contractOptions}
              required
            />
            <Field
              type="select"
              label="Job Order No"
              name="jobOrderNo"
              value={header.jobOrderNo}
              onChange={handleHeaderChange}
              options={jobOrderOptions}
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
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
                onClick={handleAddItemRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Schedule Item Details tab */}
          {activeChildTab === "scheduleItemDetails" && (
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
                  { key: "qty", label: "Qty", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                ]}
                rows={itemRows}
                onCellChange={handleItemCellChange}
                onRemoveRow={handleRemoveItemRow}
              />
              {fieldErrors.scheduleItemDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.scheduleItemDetails}
                </p>
              )}
            </div>
          )}

          {/* Sub Supply Summary tab */}
          {activeChildTab === "subSupplySummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
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
                  label="Authorized By"
                  name="authorizedBy"
                  value={summary.authorizedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.authorizedBy}
                  options={employeeOptions}
                  required
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

        {/* ---------------- Schedule Section ---------------- */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Schedule Section</SectionHeader>
            <button
              type="button"
              onClick={handleAddScheduleRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <DynamicTable
            columns={[
              { key: "planDate", label: "Plan Date", type: "date" },
              { key: "scheduleQty", label: "Schedule Qty", type: "number" },
            ]}
            rows={scheduleRows}
            onCellChange={handleScheduleCellChange}
            onRemoveRow={handleRemoveScheduleRow}
          />
          {fieldErrors.schedule && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
              {fieldErrors.schedule}
            </p>
          )}
        </div>

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

export default SubContractSupplyScheduleForm;