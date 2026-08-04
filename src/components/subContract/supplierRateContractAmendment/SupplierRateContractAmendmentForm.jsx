import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import supplierRateContractAmendmentAPI from "../../../api/supplierRateContractAmendmentAPI";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
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
const FREIGHT_TYPES = ["Prepaid", "To Pay", "FOB", "CIF"];
const PACKING_TYPES = ["Standard", "Export Worthy", "Custom", "None"];
const MODE_OF_DESPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];
const TAX_DESCRIPTION = ["Manufacturer", "Trader", "Exporter", "Service Provider"];
const APPROVAL_STATUS = ["Pending", "Approved", "Rejected"];

const CHILD_TABS = [
  { key: "supplierRateDetails", label: "Supplier Rate Details", kind: "mixed" },
  { key: "supplierRateSummary", label: "Supplier Rate Summary", kind: "fields" },
];

const emptyRateRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  oldRate: "",
  newRate: "",
});

const emptyDetails = () => ({
  freightType: "",
  packingType: "",
  insuranceAmount: "",
  modeOfDespatch: "",
  taxDescription: "",
  preparedBy: "",
  authorizedBy: "",
  remarks: "",
});

const emptySummary = () => ({
  summaryNotes: "",
  approvalStatus: "",
  additionalComments: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoAmendmentNo = () =>
  `SRCA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const SupplierRateContractAmendmentForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("supplierRateDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [contractMap, setContractMap] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    belongsTo: data?.belongsTo || "",
    partyId: data?.partyId || "",
    partyName: data?.partyName || "",
    contractNo: data?.contractNo || "",
    contractDate: data?.contractDate || "",
    validFrom: data?.validFrom || "",
    validTo: data?.validTo || "",
    newValidFrom: data?.newValidFrom || "",
    newValidTo: data?.newValidTo || "",
    amendmentNo: data?.amendmentNo || (data ? "" : autoAmendmentNo()),
    amendmentDate: data?.amendmentDate || todayStr(),
    revisionNo: data?.revisionNo ?? 1,
    active: data?.active !== false,
  }));

  const [rateRows, setRateRows] = useState(
    data?.supplierRateDetails?.length
      ? data.supplierRateDetails
      : [emptyRateRow()],
  );
  const [details, setDetails] = useState({
    ...emptyDetails(),
    ...data?.details,
  });
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
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
      const map = {};
      const options = (res || []).map((c) => {
        map[c.contractNo] = c;
        return { value: c.contractNo, label: c.contractNo };
      });
      setContractOptions(options);
      setContractMap(map);
    } catch (error) {
      console.error("Failed to load contract options:", error);
      setContractOptions([]);
      setContractMap({});
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
      loadItems();
      loadUnits();
    }
  }, [orgId, branch, loadParties, loadContracts, loadItems, loadUnits]);

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

      if (name === "contractNo") {
        const contract = contractMap[value];
        if (contract) {
          next.contractDate = contract.contractDate || "";
          next.validFrom = contract.validFrom || "";
          next.validTo = contract.validTo || "";
          next.newValidFrom = contract.validFrom || "";
          next.newValidTo = contract.validTo || "";
          const latestRevision =
            Number(contract.revisionNo || contract.amendmentRevision || 0) || 0;
          next.revisionNo =
            latestRevision > 0 ? latestRevision + 1 : prev.revisionNo || 1;

          const rows = contract.itemDetails || [];
          setRateRows(
            rows.length
              ? rows.map((r) => ({
                  itemCode: r.itemCode || "",
                  itemDescription:
                    r.itemDescription ||
                    itemMasterMap[r.itemCode]?.itemDescription ||
                    "",
                  unit: r.unit || r.purchaseUnit || "",
                  oldRate: r.rate ?? "",
                  newRate: r.rate ?? "",
                }))
              : [emptyRateRow()],
          );
        }
      }

      return next;
    });
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setRateRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "itemCode") {
          const item = itemMasterMap[value];
          return {
            ...next,
            itemDescription: item?.itemDescription || "",
            unit: item?.primaryUnits?.id || row.unit || "",
          };
        }
        return next;
      }),
    );
  };

  const handleAddRow = () => setRateRows((prev) => [...prev, emptyRateRow()]);
  const handleRemoveRow = (idx) =>
    setRateRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.partyId) errors.partyId = "Party Id is required";
    if (!header.partyName?.trim()) errors.partyName = "Party Name is required";
    if (!header.contractNo) errors.contractNo = "Contract No is required";
    if (!header.contractDate) errors.contractDate = "Contract Date is required";
    if (!header.validFrom) errors.validFrom = "Valid From is required";
    if (!header.validTo) errors.validTo = "Valid To is required";
    if (!header.newValidFrom) errors.newValidFrom = "New Valid From is required";
    if (!header.newValidTo) errors.newValidTo = "New Valid To is required";
    if (!header.amendmentNo?.trim())
      errors.amendmentNo = "Amendment No is required";
    if (!header.amendmentDate)
      errors.amendmentDate = "Amendment Date is required";

    if (
      header.newValidTo &&
      header.newValidFrom &&
      header.newValidTo < header.newValidFrom
    )
      errors.newValidTo = "New Valid To cannot be before New Valid From";

    const hasValidRow = rateRows.some(
      (r) => r.itemCode && r.unit && Number(r.newRate) > 0,
    );
    if (!hasValidRow)
      errors.supplierRateDetails =
        "Add at least one item with an Item Code, Unit and New Rate greater than 0";

    if (!details.modeOfDespatch)
      errors.modeOfDespatch = "Mode of Despatch is required";
    if (!details.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!details.authorizedBy) errors.authorizedBy = "Authorized By is required";

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
      supplierRateDetails: rateRows.filter((r) => r.itemCode?.trim()),
      details,
      summary,
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response =
        await supplierRateContractAmendmentAPI.createUpdateSupplierRateContractAmendment(
          payload,
        );

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Supplier Rate Contract Amendment updated successfully!"
              : "Supplier Rate Contract Amendment created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Supplier Rate Contract Amendment.",
        );
      }
    } catch (err) {
      console.error("Save Supplier Rate Contract Amendment Error:", err);
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
            ? "Edit Supplier Rate Contract Amendment"
            : "Add Supplier Rate Contract Amendment"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Supplier Rate Contract Amendment</SectionHeader>
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
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              error={fieldErrors.contractNo}
              options={contractOptions}
              required
            />
            <Field
              type="date"
              label="Contract Date"
              name="contractDate"
              value={header.contractDate}
              onChange={handleHeaderChange}
              error={fieldErrors.contractDate}
              required
              disabled
            />
            <Field
              type="date"
              label="Valid From"
              name="validFrom"
              value={header.validFrom}
              onChange={handleHeaderChange}
              error={fieldErrors.validFrom}
              required
              disabled
            />
            <Field
              type="date"
              label="Valid To"
              name="validTo"
              value={header.validTo}
              onChange={handleHeaderChange}
              error={fieldErrors.validTo}
              required
              disabled
            />
            <Field
              type="date"
              label="New Valid From"
              name="newValidFrom"
              value={header.newValidFrom}
              onChange={handleHeaderChange}
              error={fieldErrors.newValidFrom}
              required
            />
            <Field
              type="date"
              label="New Valid To"
              name="newValidTo"
              value={header.newValidTo}
              onChange={handleHeaderChange}
              error={fieldErrors.newValidTo}
              required
            />
            <Field
              label="Amendment No"
              name="amendmentNo"
              value={header.amendmentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.amendmentNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Amendment Date"
              name="amendmentDate"
              value={header.amendmentDate}
              onChange={handleHeaderChange}
              error={fieldErrors.amendmentDate}
              required
              disabled
            />
            <Field
              type="number"
              label="Revision No"
              name="revisionNo"
              value={header.revisionNo}
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

            {activeTabMeta.kind === "mixed" && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Supplier Rate Details tab */}
          {activeChildTab === "supplierRateDetails" && (
            <div className="pt-3 space-y-4">
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
                  { key: "oldRate", label: "Old Rate", readOnly: true },
                  { key: "newRate", label: "New Rate", type: "number" },
                ]}
                rows={rateRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.supplierRateDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.supplierRateDetails}
                </p>
              )}

              <SectionHeader>Additional Details</SectionHeader>
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Freight Type"
                  name="freightType"
                  value={details.freightType}
                  onChange={handleDetailsChange}
                  options={FREIGHT_TYPES}
                />
                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={details.packingType}
                  onChange={handleDetailsChange}
                  options={PACKING_TYPES}
                />
                <Field
                  type="number"
                  label="Insurance Amount"
                  name="insuranceAmount"
                  value={details.insuranceAmount}
                  onChange={handleDetailsChange}
                />
                <Field
                  type="select"
                  label="Mode of Despatch"
                  name="modeOfDespatch"
                  value={details.modeOfDespatch}
                  onChange={handleDetailsChange}
                  error={fieldErrors.modeOfDespatch}
                  options={MODE_OF_DESPATCH}
                  required
                />
                <Field
                  type="select"
                  label="Tax Description"
                  name="taxDescription"
                  value={details.taxDescription}
                  onChange={handleDetailsChange}
                  options={TAX_DESCRIPTION}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={details.preparedBy}
                  onChange={handleDetailsChange}
                  error={fieldErrors.preparedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Authorized By"
                  name="authorizedBy"
                  value={details.authorizedBy}
                  onChange={handleDetailsChange}
                  error={fieldErrors.authorizedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={details.remarks}
                  onChange={handleDetailsChange}
                />
              </div>
            </div>
          )}

          {/* Supplier Rate Summary tab */}
          {activeChildTab === "supplierRateSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Summary Notes"
                  name="summaryNotes"
                  value={summary.summaryNotes}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Approval Status"
                  name="approvalStatus"
                  value={summary.approvalStatus}
                  onChange={handleSummaryChange}
                  options={APPROVAL_STATUS}
                />
                <Field
                  type="textarea"
                  label="Additional Comments"
                  name="additionalComments"
                  value={summary.additionalComments}
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

export default SupplierRateContractAmendmentForm;