import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import scBillAPI from "../../../api/scBillAPI";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import subContractingGrnAPI from "../../../api/Inventory/subContractingGrnAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import partyAccountMappingAPI from "../../../api/partyAccountMappingAPI";
import { numberToWords } from "../../../utils/numberToWords";
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

const DEPARTMENTS = ["Purchase", "Stores", "Quality", "Production", "Finance"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const YES_NO = ["YES", "NO"];
const SERVICE_NAMES = ["Amortization", "Machining", "Plating", "Assembly"];
const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const TAX_TYPES = ["SGST", "CGST", "IGST", "GST", "Exempt", "Nil Rated"];
const PARTICULARS = ["Basic", "Freight", "Packing", "Insurance", "Discount"];

const CHILD_TABS = [
  { key: "itemDetails", label: "Item Details", kind: "table" },
  { key: "taxGrid", label: "Tax Grid", kind: "table" },
  { key: "chargesSummary", label: "Charges Summary", kind: "fields" },
];

const emptyItemRow = () => ({
  scGrnNo: "",
  incomingItemCode: "",
  incomingItemDescription: "",
  unit: "",
  challanQty: "",
  receivedQty: "",
  shortageQty: "",
  grnAcceptedQty: "",
  rejectedQty: "",
  rate: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  supplierDcNo: "",
  supplierDcDate: "",
});

const emptyTaxRow = () => ({
  particulars: "",
  glAccountName: "",
  acceptedQtyAmount: "",
  revisedAmount: "",
});

const emptySummary = () => ({
  freight: "",
  totalAmount: "",
  totalBasic: "",
  tdsApplicable: "",
  tdsPct: "",
  acceptedValue: "",
  rejectedValue: "",
  tdsAmount: "",
  amountInWords: "",
  remarks: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const autoScBillNo = () =>
  `SCB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

const toNum = (n) => (Number.isNaN(Number(n)) ? 0 : Number(n));

/* ---------------------------------------------------------------------------- */

const ScBillForm = ({ data, onBack }) => {
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
  const [grnOptions, setGrnOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    scBillNo: data?.scBillNo || (data ? "" : autoScBillNo()),
    scBillDate: data?.scBillDate || todayStr(),
    department: data?.department || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    vendorInvoiceNo: data?.vendorInvoiceNo || "",
    vendorInvoiceDate: data?.vendorInvoiceDate || "",
    vendorDcNo: data?.vendorDcNo || "",
    grnNo: data?.grnNo || "",
    contractNo: data?.contractNo || "",
    taxCode: data?.taxCode || "",
    belongsTo: data?.belongsTo || "",
    gstState: data?.gstState || "",
    isIgstApplicable: data?.isIgstApplicable || "",
    gstinNo: data?.gstinNo || "",
    serviceName: data?.serviceName || "",
    hsnSacCode: data?.hsnSacCode || "",
    taxType: data?.taxType || "SGST",
    taxPct: data?.taxPct ?? "",
    active: data?.active !== false,
  }));

  const [itemRows, setItemRows] = useState(
    data?.itemDetails?.length ? data.itemDetails : [emptyItemRow()],
  );
  const [taxRows, setTaxRows] = useState(
    data?.taxGrid?.length ? data.taxGrid : [emptyTaxRow()],
  );
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

  const loadGrns = useCallback(async () => {
    try {
      const res = await subContractingGrnAPI.getGrnByOrgId(orgId);
      setGrnOptions(
        (res || []).map((g) => ({
          value: g.scGrnNo,
          label: g.scGrnNo,
        })),
      );
    } catch (error) {
      console.error("Failed to load GRN options:", error);
      setGrnOptions([]);
    }
  }, [orgId]);

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

  const loadAccounts = useCallback(async () => {
    try {
      const res = await partyAccountMappingAPI.getAccounts(orgId);
      setAccountOptions(
        (res || []).map((a) => {
          const name = a.accountName || a.name || a.accountId || a.id;
          return { value: name, label: name };
        }),
      );
    } catch (error) {
      console.error("Failed to load account options:", error);
      setAccountOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadVendors();
      loadGrns();
      loadContracts();
      loadItems();
      loadUnits();
    }
  }, [orgId, branch, loadVendors, loadGrns, loadContracts, loadItems, loadUnits]);

  useEffect(() => {
    if (orgId) loadAccounts();
  }, [orgId, loadAccounts]);

  /* ---------------- Computation ---------------- */

  // Recompute affected row values for one row of the Item Details grid.
  const computeRows = (current) =>
    current.map((row) => {
      const { rate, receivedQty, grnAcceptedQty, sgstRate, cgstRate, igstRate } =
        row;
      const billedQty = toNum(grnAcceptedQty) || toNum(receivedQty) || 0;
      const amount = toNum(rate) * billedQty;
      return {
        ...row,
        amount: amount.toFixed(2),
        sgstAmount: (amount * (toNum(sgstRate) / 100)).toFixed(2),
        cgstAmount: (amount * (toNum(cgstRate) / 100)).toFixed(2),
        igstAmount: (amount * (toNum(igstRate) / 100)).toFixed(2),
      };
    });

  // Recompute the Charges Summary totals from item rows + freight + TDS.
  const computeSummary = (rows, current) => {
    const totalBasic = rows.reduce((sum, r) => sum + toNum(r.amount), 0);
    const sgstTotal = rows.reduce((sum, r) => sum + toNum(r.sgstAmount), 0);
    const cgstTotal = rows.reduce((sum, r) => sum + toNum(r.cgstAmount), 0);
    const igstTotal = rows.reduce((sum, r) => sum + toNum(r.igstAmount), 0);
    const freight = toNum(current.freight);
    const grossTotal = totalBasic + freight + sgstTotal + cgstTotal + igstTotal;
    const tdsPct = toNum(current.tdsPct);
    const tdsAmount =
      current.tdsApplicable === "YES" ? grossTotal * (tdsPct / 100) : 0;
    const totalAmount = grossTotal - tdsAmount;
    const acceptedValue = rows.reduce(
      (sum, r) => sum + toNum(r.grnAcceptedQty) * toNum(r.rate),
      0,
    );
    const rejectedValue = rows.reduce(
      (sum, r) => sum + toNum(r.rejectedQty) * toNum(r.rate),
      0,
    );
    return {
      ...current,
      totalBasic: totalBasic.toFixed(2),
      acceptedValue: acceptedValue.toFixed(2),
      rejectedValue: rejectedValue.toFixed(2),
      tdsAmount: tdsAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      amountInWords: numberToWords(totalAmount) || "Rupees Only",
    };
  };

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

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) =>
      computeSummary(itemRows, { ...prev, [name]: value }),
    );
  };

  const handleItemCellChange = (idx, key, value) => {
    let next = itemRows.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row,
    );

    if (key === "incomingItemCode") {
      const item = itemMasterMap[value];
      next = next.map((row, i) =>
        i === idx
          ? {
              ...row,
              incomingItemDescription: item?.itemDescription || "",
              unit: item?.primaryUnits?.id || row.unit || "",
            }
          : row,
      );
    }

    next = computeRows(next);
    setItemRows(next);
    setSummary((cur) => computeSummary(next, cur));
  };

  const handleTaxCellChange = (idx, key, value) => {
    setTaxRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddItemRow = () =>
    setItemRows((prev) => [...prev, emptyItemRow()]);
  const handleRemoveItemRow = (idx) =>
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleAddTaxRow = () => setTaxRows((prev) => [...prev, emptyTaxRow()]);
  const handleRemoveTaxRow = (idx) =>
    setTaxRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.scBillNo?.trim()) errors.scBillNo = "SC Bill No is required";
    if (!header.scBillDate) errors.scBillDate = "SC Bill Date is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.vendorName?.trim())
      errors.vendorName = "Vendor Name is required";
    if (!header.vendorInvoiceNo?.trim())
      errors.vendorInvoiceNo = "Vendor Invoice No is required";
    if (!header.vendorInvoiceDate)
      errors.vendorInvoiceDate = "Vendor Invoice Date is required";
    if (!header.taxCode) errors.taxCode = "Tax Code is required";
    if (!header.isIgstApplicable)
      errors.isIgstApplicable = "Is IGST Applicable is required";
    if (!header.taxType) errors.taxType = "Tax Type is required";

    const hasValidItem = itemRows.some((r) => r.incomingItemCode && toNum(r.rate) > 0);
    if (!hasValidItem)
      errors.itemDetails =
        "Add at least one item with an Incoming Item Code and a Rate greater than 0";

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
      itemDetails: itemRows.filter((r) => r.incomingItemCode?.trim()),
      taxGrid: taxRows,
      summary,
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response = await scBillAPI.createUpdateScBill(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "S.C. Bill updated successfully!"
              : "S.C. Bill created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save S.C. Bill.",
        );
      }
    } catch (err) {
      console.error("Save S.C. Bill Error:", err);
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
          {data ? "Edit S.C. Bill" : "Add S.C. Bill"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>S.C. Bill</SectionHeader>
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
              label="SC Bill No"
              name="scBillNo"
              value={header.scBillNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scBillNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="SC Bill Date"
              name="scBillDate"
              value={header.scBillDate}
              onChange={handleHeaderChange}
              error={fieldErrors.scBillDate}
              required
              disabled
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
              label="Vendor Invoice No"
              name="vendorInvoiceNo"
              value={header.vendorInvoiceNo}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorInvoiceNo}
              required
            />
            <Field
              type="date"
              label="Vendor Invoice Date"
              name="vendorInvoiceDate"
              value={header.vendorInvoiceDate}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorInvoiceDate}
              required
            />
            <Field
              label="Vendor DC No"
              name="vendorDcNo"
              value={header.vendorDcNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="GRN No"
              name="grnNo"
              value={header.grnNo}
              onChange={handleHeaderChange}
              options={grnOptions}
            />
            <Field
              type="select"
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              options={contractOptions}
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
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO}
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
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
                onClick={
                  activeChildTab === "itemDetails"
                    ? handleAddItemRow
                    : handleAddTaxRow
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
                    key: "scGrnNo",
                    label: "SC GRN No",
                    type: "select",
                    options: grnOptions,
                  },
                  {
                    key: "incomingItemCode",
                    label: "Incoming Item Code",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "incomingItemDescription",
                    label: "Incoming Item Description",
                    readOnly: true,
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "challanQty", label: "Challan Qty", type: "number" },
                  { key: "receivedQty", label: "Received Qty", type: "number" },
                  { key: "shortageQty", label: "Shortage Qty", type: "number" },
                  {
                    key: "grnAcceptedQty",
                    label: "GRN Accepted Qty",
                    type: "number",
                  },
                  { key: "rejectedQty", label: "Rejected Qty", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "amount", label: "Amount", readOnly: true },
                  { key: "sgstRate", label: "SGST Rate", type: "number" },
                  { key: "sgstAmount", label: "SGST Amount", readOnly: true },
                  { key: "cgstRate", label: "CGST Rate", type: "number" },
                  { key: "cgstAmount", label: "CGST Amount", readOnly: true },
                  { key: "igstRate", label: "IGST Rate", type: "number" },
                  { key: "igstAmount", label: "IGST Amount", readOnly: true },
                  { key: "supplierDcNo", label: "Supplier DC No" },
                  { key: "supplierDcDate", label: "Supplier DC Date", type: "date" },
                ]}
                rows={itemRows}
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

          {/* Tax Grid tab */}
          {activeChildTab === "taxGrid" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "particulars",
                    label: "Particulars",
                    type: "select",
                    options: PARTICULARS,
                  },
                  {
                    key: "glAccountName",
                    label: "GL Account Name",
                    type: "select",
                    options: accountOptions,
                  },
                  {
                    key: "acceptedQtyAmount",
                    label: "Accepted Qty Amount",
                    type: "number",
                  },
                  {
                    key: "revisedAmount",
                    label: "Revised Amount",
                    type: "number",
                  },
                ]}
                rows={taxRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
              />
            </div>
          )}

          {/* Charges Summary tab */}
          {activeChildTab === "chargesSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Freight"
                  name="freight"
                  value={summary.freight}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Total Amount"
                  name="totalAmount"
                  value={summary.totalAmount}
                  onChange={handleSummaryChange}
                  disabled
                />
                <Field
                  type="number"
                  label="Total Basic"
                  name="totalBasic"
                  value={summary.totalBasic}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="TDS Applicable"
                  name="tdsApplicable"
                  value={summary.tdsApplicable}
                  onChange={handleSummaryChange}
                  options={YES_NO}
                />
                <Field
                  type="number"
                  label="TDS %"
                  name="tdsPct"
                  value={summary.tdsPct}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Accepted Value"
                  name="acceptedValue"
                  value={summary.acceptedValue}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="Rejected Value"
                  name="rejectedValue"
                  value={summary.rejectedValue}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="number"
                  label="TDS Amount"
                  name="tdsAmount"
                  value={summary.tdsAmount}
                  onChange={handleSummaryChange}
                  disabled
                />
                <Field
                  label="Amount in Words"
                  name="amountInWords"
                  value={summary.amountInWords}
                  onChange={handleSummaryChange}
                  disabled
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

export default ScBillForm;