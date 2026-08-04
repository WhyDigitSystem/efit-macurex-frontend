import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
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

/* Generic dynamic table. Supports text / select / date / readonly columns.
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

const DEPARTMENTS = ["Purchase", "Stores", "Quality", "Production", "Finance"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const CONTRACT_FOR = ["Rate Contract", "Annual Rate Contract", "One Time"];
const YES_NO = ["YES", "NO"];
const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const SERVICE_NAMES = ["Amortization", "Machining", "Plating", "Assembly"];
const SCOPE_OPTIONS = ["Local", "Inter-State", "SEZ", "Overseas"];
const TAX_TYPES = ["SGST", "CGST", "IGST", "GST", "Exempt", "Nil Rated"];
const PARTICULARS = ["Basic", "Freight", "Packing", "Insurance", "Discount"];
const PAYMENT_TERMS = [
  "Immediate",
  "15 Days",
  "30 Days",
  "45 Days",
  "60 Days",
  "Advance",
];
const FREIGHT_TYPES = ["Prepaid", "To Pay", "FOB", "CIF"];
const PACKING_TYPES = ["Standard", "Export Worthy", "Custom", "None"];
const MODE_OF_DESPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];

const CHILD_TABS = [
  { key: "itemDetails", label: "Item Details", kind: "table" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "terms", label: "Terms And Conditions", kind: "fields" },
];

const emptyItemDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  purchaseUnit: "",
  platingType: "",
  thickness: "",
  rate: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  validFrom: "",
  validTo: "",
  totalAmortizationRate: "",
});

const emptyTaxDetailRow = () => ({
  particular: "",
  amount: "",
});

const emptyTerms = () => ({
  discountPct: "",
  paymentTerms: "",
  deliveryTerms: "",
  freight: "",
  freightType: "",
  packingType: "",
  insurance: "",
  modeOfDespatch: "",
  inlandCharge: "",
  preparedBy: "",
  authorizedBy: "",
  narration: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoContractNo = () =>
  `SRC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const SupplierRateContractForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("itemDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    department: data?.department || "",
    belongsTo: data?.belongsTo || "",
    contractNo: data?.contractNo || (data ? "" : autoContractNo()),
    contractDate: data?.contractDate || todayStr(),
    validFrom: data?.validFrom || "",
    validTo: data?.validTo || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    contractFor: data?.contractFor || "",
    deliveryDate: data?.deliveryDate || "",
    gstState: data?.gstState || "",
    isIgstApplicable: data?.isIgstApplicable || "",
    gstinNo: data?.gstinNo || "",
    taxCode: data?.taxCode || "",
    serviceName: data?.serviceName || "",
    hsnSacCode: data?.hsnSacCode || "",
    scope: data?.scope || "",
    scrap: data?.scrap || "",
    taxType: data?.taxType || "SGST",
    taxPct: data?.taxPct ?? "",
    active: data?.active !== false,
  }));

  const [itemDetailRows, setItemDetailRows] = useState(
    data?.itemDetails?.length ? data.itemDetails : [emptyItemDetailRow()],
  );
  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );
  const [terms, setTerms] = useState({
    ...emptyTerms(),
    ...data?.terms,
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

  const loadVendors = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setVendorOptions(
        (res || []).map((v) => ({
          value: v.id,
          label: v.customerName || v.docId || v.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
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
          value: e.id,
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
      loadVendors();
      loadItems();
      loadUnits();
    }
    if (orgId) loadEmployees();
  }, [orgId, branch, loadVendors, loadItems, loadUnits, loadEmployees]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "vendorId") {
        const vendor = vendorOptions.find((v) => v.value === value);
        next.vendorName = vendor?.label || "";
      }
      return next;
    });
  };

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setTerms((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemCellChange = (idx, key, value) => {
    setItemDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          const item = itemMasterMap[value];
          next = {
            ...next,
            itemDescription: item?.itemDescription || "",
            purchaseUnit: item?.primaryUnits?.id || "",
          };
        }

        if (["rate", "sgstRate", "cgstRate", "igstRate"].includes(key)) {
          const rate = parseFloat(next.rate) || 0;
          next.sgstAmount =
            (parseFloat(next.sgstRate) || 0) && rate
              ? (rate * (parseFloat(next.sgstRate) || 0) / 100).toFixed(2)
              : "";
          next.cgstAmount =
            (parseFloat(next.cgstRate) || 0) && rate
              ? (rate * (parseFloat(next.cgstRate) || 0) / 100).toFixed(2)
              : "";
          next.igstAmount =
            (parseFloat(next.igstRate) || 0) && rate
              ? (rate * (parseFloat(next.igstRate) || 0) / 100).toFixed(2)
              : "";
        }

        return next;
      }),
    );
  };

  const handleTaxCellChange = (idx, key, value) => {
    setTaxDetailRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddItemRow = () =>
    setItemDetailRows((prev) => [...prev, emptyItemDetailRow()]);
  const handleRemoveItemRow = (idx) =>
    setItemDetailRows((prev) => prev.filter((_, i) => i !== idx));
  const handleAddTaxRow = () =>
    setTaxDetailRows((prev) => [...prev, emptyTaxDetailRow()]);
  const handleRemoveTaxRow = (idx) =>
    setTaxDetailRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.contractNo?.trim()) errors.contractNo = "Contract No is required";
    if (!header.contractDate) errors.contractDate = "Contract Date is required";
    if (!header.validFrom) errors.validFrom = "Valid From is required";
    if (
      header.validFrom &&
      header.validTo &&
      header.validTo < header.validFrom
    )
      errors.validTo = "Valid To cannot be before Valid From";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.vendorName?.trim()) errors.vendorName = "Vendor Name is required";
    if (!header.contractFor) errors.contractFor = "Contract For is required";
    if (!header.gstState?.trim()) errors.gstState = "GST State is required";
    if (!header.isIgstApplicable)
      errors.isIgstApplicable = "Is IGST Applicable is required";
    if (!header.taxCode) errors.taxCode = "Tax Code is required";
    if (!header.taxType) errors.taxType = "Tax Type is required";

    const hasValidItemRow = itemDetailRows.some(
      (r) =>
        r.itemCode &&
        r.purchaseUnit &&
        Number(r.rate) > 0 &&
        r.validFrom &&
        r.validTo,
    );
    if (!hasValidItemRow)
      errors.itemDetails =
        "Add at least one item with Item Code, Purchase Unit, Rate, Valid From and Valid To";

    if (!terms.paymentTerms) errors.paymentTerms = "Payment Terms is required";
    if (!terms.modeOfDespatch)
      errors.modeOfDespatch = "Mode of Despatch is required";

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
      itemDetails: itemDetailRows.filter((r) => r.itemCode?.trim()),
      taxDetails: taxDetailRows.filter((r) => r.particular?.trim()),
      terms,
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response =
        await supplierRateContractAPI.createUpdateSupplierRateContract(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Supplier Rate Contract updated successfully!"
              : "Supplier Rate Contract created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Supplier Rate Contract.",
        );
      }
    } catch (err) {
      console.error("Save Supplier Rate Contract Error:", err);
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
            ? "Edit Supplier Rate Contract"
            : "Add Supplier Rate Contract"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Supplier Rate Contract</SectionHeader>
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
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={DEPARTMENTS}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO}
            />
            <Field
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              error={fieldErrors.contractNo}
              required
              disabled={!data}
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
            />
            <Field
              type="date"
              label="Valid To"
              name="validTo"
              value={header.validTo}
              onChange={handleHeaderChange}
              error={fieldErrors.validTo}
            />
            <Field
              type="select"
              label="Vendor Id"
              name="vendorId"
              value={header.vendorId}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorId}
              options={vendorOptions}
              required
            />
            <Field
              label="Vendor Name"
              name="vendorName"
              value={header.vendorName}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorName}
              required
              disabled
            />
            <Field
              type="select"
              label="Contract For"
              name="contractFor"
              value={header.contractFor}
              onChange={handleHeaderChange}
              error={fieldErrors.contractFor}
              options={CONTRACT_FOR}
              required
            />
            <Field
              type="date"
              label="Delivery Date"
              name="deliveryDate"
              value={header.deliveryDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
              error={fieldErrors.gstState}
              required
            />
            <Field
              type="select"
              label="Is IGST Applicable"
              name="isIgstApplicable"
              value={header.isIgstApplicable}
              onChange={handleHeaderChange}
              error={fieldErrors.isIgstApplicable}
              options={YES_NO}
              required
            />
            <Field
              label="GSTIN No"
              name="gstinNo"
              value={header.gstinNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Tax Code"
              name="taxCode"
              value={header.taxCode}
              onChange={handleHeaderChange}
              error={fieldErrors.taxCode}
              options={TAX_CODES}
              required
            />
            <Field
              type="select"
              label="Service Name"
              name="serviceName"
              value={header.serviceName}
              onChange={handleHeaderChange}
              options={SERVICE_NAMES}
            />
            <Field
              label="HSN/SAC Code"
              name="hsnSacCode"
              value={header.hsnSacCode}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Scope"
              name="scope"
              value={header.scope}
              onChange={handleHeaderChange}
              options={SCOPE_OPTIONS}
            />
            <Field
              type="select"
              label="Scrap"
              name="scrap"
              value={header.scrap}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              type="select"
              label="Tax Type"
              name="taxType"
              value={header.taxType}
              onChange={handleHeaderChange}
              error={fieldErrors.taxType}
              options={TAX_TYPES}
              required
            />
            <Field
              type="number"
              label="Tax %"
              name="taxPct"
              value={header.taxPct}
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
                onClick={() =>
                  activeChildTab === "itemDetails"
                    ? handleAddItemRow()
                    : handleAddTaxRow()
                }
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Item Details tab */}
          {activeChildTab === "itemDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "itemCode",
                    label: "Incoming Item Code",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Incoming Item Description",
                    readOnly: true,
                  },
                  {
                    key: "purchaseUnit",
                    label: "Purchase Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "platingType", label: "Plating Type" },
                  { key: "thickness", label: "Thickness" },
                  { key: "rate", label: "Rate" },
                  { key: "sgstRate", label: "SGST Rate" },
                  {
                    key: "sgstAmount",
                    label: "SGST Amount",
                    readOnly: true,
                  },
                  { key: "cgstRate", label: "CGST Rate" },
                  {
                    key: "cgstAmount",
                    label: "CGST Amount",
                    readOnly: true,
                  },
                  { key: "igstRate", label: "IGST Rate" },
                  {
                    key: "igstAmount",
                    label: "IGST Amount",
                    readOnly: true,
                  },
                  { key: "validFrom", label: "Valid From", type: "date" },
                  { key: "validTo", label: "Valid To", type: "date" },
                  {
                    key: "totalAmortizationRate",
                    label: "Total Amortization Rate",
                  },
                ]}
                rows={itemDetailRows}
                onCellChange={handleItemCellChange}
                onRemoveRow={handleRemoveItemRow}
              />
              {fieldErrors.itemDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.itemDetails}
                </p>
              )}
            </div>
          )}

          {/* Tax Details tab */}
          {activeChildTab === "taxDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "particular",
                    label: "Particulars",
                    type: "select",
                    options: PARTICULARS,
                  },
                  { key: "amount", label: "Amount" },
                ]}
                rows={taxDetailRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
              />
            </div>
          )}

          {/* Terms And Conditions tab */}
          {activeChildTab === "terms" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Discount %"
                  name="discountPct"
                  value={terms.discountPct}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Payment Terms"
                  name="paymentTerms"
                  value={terms.paymentTerms}
                  onChange={handleTermsChange}
                  error={fieldErrors.paymentTerms}
                  options={PAYMENT_TERMS}
                  required
                />
                <Field
                  type="textarea"
                  label="Delivery Terms"
                  name="deliveryTerms"
                  value={terms.deliveryTerms}
                  onChange={handleTermsChange}
                />
                <Field
                  type="number"
                  label="Freight"
                  name="freight"
                  value={terms.freight}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Freight Type"
                  name="freightType"
                  value={terms.freightType}
                  onChange={handleTermsChange}
                  options={FREIGHT_TYPES}
                />
                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={terms.packingType}
                  onChange={handleTermsChange}
                  options={PACKING_TYPES}
                />
                <Field
                  type="number"
                  label="Insurance"
                  name="insurance"
                  value={terms.insurance}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Mode of Despatch"
                  name="modeOfDespatch"
                  value={terms.modeOfDespatch}
                  onChange={handleTermsChange}
                  error={fieldErrors.modeOfDespatch}
                  options={MODE_OF_DESPATCH}
                  required
                />
                <Field
                  type="number"
                  label="Inland Charge"
                  name="inlandCharge"
                  value={terms.inlandCharge}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={terms.preparedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Authorized By"
                  name="authorizedBy"
                  value={terms.authorizedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={terms.narration}
                  onChange={handleTermsChange}
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

export default SupplierRateContractForm;
