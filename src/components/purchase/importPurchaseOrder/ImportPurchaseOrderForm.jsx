import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import importPurchaseOrderAPI from "../../../api/Purchase/importPurchaseOrderAPI";
import { purchaseIndentAPI } from "../../../api/Purchase/purchaseIndentAPI";
import { itemAPI } from "../../../api/itemAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { branchAPI } from "../../../api/branchAPI";
import { taxDefinitionAPI } from "../../../api/taxDefinitionAPI";
import { currencyAPI } from "../../../api/currencyAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
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
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-8 gap-y-6 items-start";

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

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-12 h-6 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute h-5 w-5 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-6" : "translate-x-0.5"
      }`}
    />
  </button>
);

const ToggleField = ({ label, value, onChange, required }) => (
  <div className="w-full">
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <div className="flex items-center gap-2 pt-0.5">
      <ToggleButton value={value} onChange={onChange} />
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {value ? "Yes" : "No"}
      </span>
    </div>
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
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top min-w-[110px]">
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

const InputCell = ({ value, onChange, type = "text", step }) => (
  <td
    className={`p-1 align-top ${
      type === "date"
        ? "min-w-[120px]"
        : type === "number"
          ? "min-w-[90px]"
          : "min-w-[100px]"
    }`}
  >
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={onChange}
      className={cellInputClasses}
    />
  </td>
);

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top min-w-[80px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
  </td>
);

const TextareaCell = ({ value, onChange }) => (
  <td className="p-1 align-top min-w-[140px]">
    <textarea
      value={value ?? ""}
      onChange={onChange}
      rows={1}
      className={
        "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
        "bg-white dark:bg-gray-900 " +
        "border-gray-300 dark:border-gray-600 " +
        "text-gray-900 dark:text-gray-100 " +
        "placeholder-gray-400 dark:placeholder-gray-500 " +
        "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
        "dark:focus:ring-blue-400 dark:focus:border-blue-400"
      }
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
            if (col.type === "textarea") {
              return (
                <TextareaCell
                  key={col.key}
                  value={row[col.key]}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                />
              );
            }
            if (col.readOnly) {
              return <ReadOnlyCell key={col.key} value={row[col.key]} />;
            }
            return (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={
                  col.type === "date"
                    ? "date"
                    : col.type === "number"
                      ? "number"
                      : "text"
                }
                step={col.step}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generatePoNo = () => `IPO${dayjs().format("YYYYMMDDHHmmss")}`;

const numberToWords = (num) => {
  if (!num || isNaN(num)) return "";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const twoDigits = (n) => (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : ""));
  const threeDigits = (n) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (hundred ? a[hundred] + " Hundred" + (rest ? " " : "") : "") + (rest ? twoDigits(rest) : "");
  };
  let words = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = Math.floor(num % 1000);
  if (crore) words += threeDigits(crore) + " Crore ";
  if (lakh) words += twoDigits(lakh) + " Lakh ";
  if (thousand) words += twoDigits(thousand) + " Thousand ";
  if (rest) words += threeDigits(rest);
  return (words || "Zero").trim() + " Only";
};

const recalcPoRow = (row) => {
  const qty = Number(row.poQtyInPurchaseUnit) || 0;
  const rate = Number(row.rateInFc) || 0;
  const discountPct = Number(row.discountPercent) || 0;
  const gross = qty * rate;
  const discountAmountInFc = gross ? (gross * discountPct) / 100 : "";
  const amountInFc = gross ? gross - (Number(discountAmountInFc) || 0) : "";
  return {
    ...row,
    qtyInPrimaryUnit: qty ? Number(qty.toFixed(3)) : "",
    discountAmountInFc:
      discountAmountInFc === "" ? "" : Number(discountAmountInFc.toFixed(2)),
    amountInFc: amountInFc === "" ? "" : Number(amountInFc.toFixed(2)),
  };
};

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  plantId: "",
  poNo: generatePoNo(),
  poDate: dayjs().format("YYYY-MM-DD"),
  belongsTo: "",
  department: "",
  supplierCode: "",
  supplierName: "",
  poType: "",
  address: "",
  currency: "",
  exchangeRate: "",
  supplierRefNo: "",
  supplierRefDate: "",
  taxCode: "",
  indentRequired: true,
  currencyId: "",
});

const emptyPoDetailRow = () => ({
  indentNo: "",
  indentDate: "",
  itemCode: "",
  itemDescription: "",
  purchaseUnit: "",
  indentQty: "",
  pendingIndentQty: "",
  primaryUnit: "",
  poQtyInPurchaseUnit: "",
  qtyInPrimaryUnit: "",
  rateInFc: "",
  discountPercent: "",
  discountAmountInFc: "",
  amountInFc: "",
  deliveryDate: "",
});

const emptyTaxDetailRow = () => ({
  particulars: "",
  taxPercent: "",
  amount: "",
});

const emptyTerms = () => ({
  totalAmount: "",
  modeOfDespatch: "",
  paymentTerms: "",
  deliveryTerms: "",
  deliveryPort: "",
  amountInWords: "",
  remarks: "",
  notes: "",
  preparedBy: "",
  checkedBy: "",
  authorisedBy: "",
});

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "poDetail", label: "PO Detail", type: "table" },
  { key: "taxDetails", label: "Tax Details", type: "table" },
  { key: "terms", label: "Terms And Conditions", type: "fields" },
];

const ImportPurchaseOrderForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const [activeTab, setActiveTab] = useState("poDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [supplierMap, setSupplierMap] = useState({});
  const [taxCodeOptions, setTaxCodeOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [poTypeOptions, setPoTypeOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  const [indentOptions, setIndentOptions] = useState([]);
  const [indentList, setIndentList] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [taxTypeOptions, setTaxTypeOptions] = useState([]);
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([]);
  const [modeOfDespatchOptions, setModeOfDespatchOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const base = { ...emptyHeader(), ...data?.header };
    base.poDate = fmtDate(base.poDate);
    base.supplierRefDate = fmtDate(base.supplierRefDate);
    return base;
  });

  const [poRows, setPoRows] = useState(() =>
    data?.poDetails?.length
      ? data.poDetails.map((d) => ({
          ...emptyPoDetailRow(),
          ...d,
          indentDate: fmtDate(d.indentDate),
          deliveryDate: fmtDate(d.deliveryDate),
        }))
      : [emptyPoDetailRow()],
  );

  const [taxRows, setTaxRows] = useState(() =>
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );

  const [terms, setTerms] = useState(() => ({
    ...emptyTerms(),
    ...data?.terms,
  }));

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

    const loadLov = async (group, setter) => {
      try {
        const res = await listOfValuesAPI.getListValuesGroup(group, orgId);
        if (Array.isArray(res) && res.length) {
          setter(
            res.map((v) => ({
              value: v.id,
              label: v.valuesDescription || v.valueDescription || "",
            })),
          );
        }
      } catch {
        setter([]);
      }
    };

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

    const loadDepartments = async () => {
      try {
        const res = await departmentAPI.getAllDepartments(orgId, branch);
        const departments = res?.paramObjectsMap?.departmentVO || [];
        setDepartmentOptions(
          departments.map((d) => ({
            value: d.id,
            label: d.departmentName,
          })),
        );
      } catch {
        setDepartmentOptions([]);
      }
    };

    const loadSuppliers = async () => {
      try {
        const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
        const map = {};
        const opts = (res || []).map((p) => {
          const code = p.docId || p.customerCode || p.id;
          const name = p.customerName || p.name || "";
          map[code] = name;
          return { value: code, label: code };
        });
        setSupplierOptions(opts);
        setSupplierMap(map);
      } catch {
        setSupplierOptions([]);
        setSupplierMap({});
      }
    };

    const loadTaxCodes = async () => {
      try {
        const res = await taxDefinitionAPI.getTaxDefinitionByOrgId(branch, orgId);
        setTaxCodeOptions(
          (res || []).map((t) => ({
            value: t.id,
            label: t.taxDescription || t.taxNo || t.id,
          })),
        );
      } catch {
        setTaxCodeOptions([]);
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

    const loadCurrencies = async () => {
      try {
        const res = await currencyAPI.getCurrencies(orgId);
        setCurrencyOptions(
          (res || []).map((c) => ({
            value: c.currencyCode || c.currencyName || c.id,
            label: c.currencyName || c.currencySymbol || c.currencyCode || c.id,
          })),
        );
      } catch {
        setCurrencyOptions([]);
      }
    };

    const loadIndents = async () => {
      try {
        const res = await purchaseIndentAPI.getPurchaseIndentByOrgId(orgId);
        setIndentList(Array.isArray(res) ? res : []);
        setIndentOptions(
          (Array.isArray(res) ? res : []).map((ind) => {
            const no = ind.header?.indentNo || ind.indentNo;
            return { value: no, label: no };
          }),
        );
      } catch {
        setIndentList([]);
        setIndentOptions([]);
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

    Promise.all([
      loadPlants(),
      loadDepartments(),
      loadSuppliers(),
      loadTaxCodes(),
      loadEmployees(),
      loadCurrencies(),
      loadIndents(),
      loadItems(),
      loadUnits(),
      loadLov("TAX", setTaxTypeOptions),
      loadLov("Payment Terms", setPaymentTermsOptions),
      loadLov("Mode Of Despatch", setModeOfDespatchOptions),
      loadLov("PO Type", setPoTypeOptions),
    ]);
  }, [orgId, branch]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));

    if (name === "supplierCode") {
      setHeader((prev) => ({
        ...prev,
        supplierCode: value,
        supplierName: supplierMap[value] || "",
      }));
    }
  };

  /* ---------------- P.O. Detail row handlers ---------------- */

  const applyIndentToRow = (row, indentNoValue) => {
    const indent = indentList.find(
      (ind) =>
        String(ind.header?.indentNo || ind.indentNo) === String(indentNoValue),
    );
    if (!indent) return { ...row, indentNo: indentNoValue };
    const detail = indent.itemDetails?.[0] || {};
    return {
      ...row,
      indentNo: indentNoValue,
      indentDate:
        fmtDate(indent.header?.indentDate || indent.indentDate) || row.indentDate,
      itemCode: detail.itemCode || row.itemCode,
      itemDescription: detail.itemDescription || row.itemDescription,
      purchaseUnit: detail.purchaseUnit || row.purchaseUnit,
      primaryUnit: detail.primaryUnit || row.primaryUnit,
      indentQty: detail.qtyInPurchaseUnit ?? detail.qtyInPrimaryUnit ?? row.indentQty ?? "",
      pendingIndentQty:
        detail.qtyInPurchaseUnit ?? detail.qtyInPrimaryUnit ?? row.pendingIndentQty ?? "",
    };
  };

  const handlePoCellChange = (idx, key, value) => {
    setPoRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "itemCode") {
          const item = itemMap[value];
          next.itemDescription = item?.itemDescription || "";
          if (item?.primaryUnits?.primaryUnit) {
            next.purchaseUnit = item.primaryUnits.primaryUnit;
            next.primaryUnit = item.primaryUnits.primaryUnit;
          }
        }
        if (key === "indentNo") {
          next = applyIndentToRow(next, value);
        }
        return next;
      }),
    );
  };

  const handleAddPoRow = () => setPoRows((prev) => [...prev, emptyPoDetailRow()]);
  const handleRemovePoRow = (idx) =>
    setPoRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Tax Detail row handlers ---------------- */

  const handleTaxCellChange = (idx, key, value) => {
    setTaxRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddTaxRow = () =>
    setTaxRows((prev) => [...prev, emptyTaxDetailRow()]);
  const handleRemoveTaxRow = (idx) =>
    setTaxRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Terms handlers ---------------- */

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setTerms((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Derived calculations ---------------- */

  const computedPoRows = poRows.map(recalcPoRow);

  const poSubTotal = computedPoRows.reduce(
    (sum, row) => sum + (Number(row.amountInFc) || 0),
    0,
  );

  const computedTaxRows = taxRows.map((row) => ({
    ...row,
    amount:
      row.taxPercent !== "" && poSubTotal
        ? Number(
            ((poSubTotal * (Number(row.taxPercent) || 0)) / 100).toFixed(2),
          )
        : "",
  }));

  const taxTotal = computedTaxRows.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );

  const totalAmount = poSubTotal + taxTotal;
  const amountInWords = numberToWords(totalAmount);

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.poDate) errors.poDate = "P.O. Date is required";
    if (!header.belongsTo?.trim()) errors.belongsTo = "Belongs To is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.supplierCode?.trim())
      errors.supplierCode = "Supplier Code is required";
    if (!header.supplierName?.trim())
      errors.supplierName = "Supplier Name is required";
    if (!header.poType?.trim()) errors.poType = "PO Type is required";
    if (!header.currency?.trim()) errors.currency = "Currency is required";
    if (header.exchangeRate === "" || Number(header.exchangeRate) <= 0)
      errors.exchangeRate = "Exchange Rate is required";
    if (!header.taxCode) errors.taxCode = "Tax Code is required";

    setFieldErrors(errors);

    const validPo = computedPoRows.every(
      (r) =>
        r.itemCode?.trim() &&
        r.purchaseUnit?.trim() &&
        r.primaryUnit?.trim() &&
        r.poQtyInPurchaseUnit !== "" &&
        r.rateInFc !== "",
    );

    const validTax = computedTaxRows.every((r) => r.particulars?.trim());

    if (!validPo) setTableError("Complete all mandatory columns in the PO Detail tab");
    else if (!validTax) setTableError("Complete all mandatory columns in the Tax Details tab");
    else if (!terms.modeOfDespatch?.trim())
      setTableError("Mode Of Despatch is required in the Terms And Conditions tab");
    else if (!terms.paymentTerms?.trim())
      setTableError("Payment Terms is required in the Terms And Conditions tab");
    else if (!terms.preparedBy)
      setTableError("Prepared By is required in the Terms And Conditions tab");
    else if (!terms.checkedBy)
      setTableError("Checked By is required in the Terms And Conditions tab");
    else if (!terms.authorisedBy)
      setTableError("Authorised By is required in the Terms And Conditions tab");
    else setTableError("");

    return (
      Object.keys(errors).length === 0 &&
      validPo &&
      validTax &&
      terms.modeOfDespatch?.trim() &&
      terms.paymentTerms?.trim() &&
      terms.preparedBy &&
      terms.checkedBy &&
      terms.authorisedBy
    );
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + PO details + tax details + terms.
    // The backend links the record to the supplier/indent and keeps the
    // complete PO history for audit purposes (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId: Number(orgId),
      header: {
        ...header,
        poNo: header.poNo || generatePoNo(),
      },
      poDetails: computedPoRows.filter((r) => r.itemCode?.trim()),
      taxDetails: computedTaxRows.filter((r) => r.particulars?.trim()),
      terms: {
        ...terms,
        totalAmount: totalAmount ? Number(totalAmount.toFixed(2)) : 0,
        amountInWords,
      },
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await importPurchaseOrderAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Import Purchase Order updated successfully!"
              : "Import Purchase Order created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Import Purchase Order.",
        );
      }
    } catch (err) {
      console.error("Save Import Purchase Order Error:", err);
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

  /* ---------------- Tab config ---------------- */

  const activeTabConfig = {
    poDetail: {
      type: "table",
      rows: computedPoRows,
      columns: [
        {
          key: "indentNo",
          label: "Indent No",
          type: "select",
          options: indentOptions,
        },
        { key: "indentDate", label: "Indent Date", type: "date" },
        {
          key: "itemCode",
          label: "Item Code *",
          type: "select",
          options: itemOptions,
        },
        { key: "itemDescription", label: "Item Description", readOnly: true },
        {
          key: "purchaseUnit",
          label: "Purchase Unit *",
          type: "select",
          options: unitOptions,
        },
        { key: "indentQty", label: "Indent Qty", type: "number", step: "0.01" },
        {
          key: "pendingIndentQty",
          label: "Pending Indent Qty",
          readOnly: true,
        },
        {
          key: "primaryUnit",
          label: "Primary Unit *",
          type: "select",
          options: unitOptions,
        },
        {
          key: "poQtyInPurchaseUnit",
          label: "P.O. Qty in Purchase Unit *",
          type: "number",
          step: "0.01",
        },
        { key: "qtyInPrimaryUnit", label: "Qty in Primary Unit", readOnly: true },
        {
          key: "rateInFc",
          label: "Rate in FC *",
          type: "number",
          step: "0.01",
        },
        {
          key: "discountPercent",
          label: "Discount %",
          type: "number",
          step: "0.01",
        },
        {
          key: "discountAmountInFc",
          label: "Discount Amount in FC",
          readOnly: true,
        },
        { key: "amountInFc", label: "Amount in FC", readOnly: true },
        { key: "deliveryDate", label: "Delivery Date", type: "date" },
      ],
      handlers: {
        onCellChange: handlePoCellChange,
        onAddRow: handleAddPoRow,
        onRemoveRow: handleRemovePoRow,
      },
    },
    taxDetails: {
      type: "table",
      rows: computedTaxRows,
      columns: [
        {
          key: "particulars",
          label: "Particulars *",
          type: "select",
          options: taxTypeOptions,
        },
        {
          key: "taxPercent",
          label: "Tax %",
          type: "number",
          step: "0.01",
        },
        { key: "amount", label: "Amount", readOnly: true },
      ],
      handlers: {
        onCellChange: handleTaxCellChange,
        onAddRow: handleAddTaxRow,
        onRemoveRow: handleRemoveTaxRow,
      },
    },
    terms: {
      type: "fields",
    },
  };

  const activeTabType = activeTabConfig[activeTab].type;

  const handleAddChildRow = () => {
    if (activeTabType === "table") {
      activeTabConfig[activeTab].handlers.onAddRow();
    }
  };

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
          {data ? "Edit Import Purchase Order" : "Add Import Purchase Order"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Import Purchase Order Details</SectionHeader>
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
              label="P.O. No"
              name="poNo"
              value={header.poNo}
              onChange={handleHeaderChange}
              disabled
              required
            />
            <Field
              type="date"
              label="P.O. Date"
              name="poDate"
              value={header.poDate}
              onChange={handleHeaderChange}
              error={fieldErrors.poDate}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={[
                { value: "COMPANY", label: "Company" },
                { value: "INDIVIDUAL", label: "Individual" },
                { value: "OTHER", label: "Other" },
              ]}
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
              label="Supplier Code"
              name="supplierCode"
              value={header.supplierCode}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierCode}
              options={supplierOptions}
              required
            />
            <Field
              label="Supplier Name"
              name="supplierName"
              value={header.supplierName}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierName}
              disabled
              required
            />
            <Field
              type="select"
              label="PO Type"
              name="poType"
              value={header.poType}
              onChange={handleHeaderChange}
              error={fieldErrors.poType}
              options={poTypeOptions}
              required
            />
            <Field
              type="textarea"
              label="Address"
              name="address"
              value={header.address}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Currency"
              name="currency"
              value={header.currency}
              onChange={handleHeaderChange}
              error={fieldErrors.currency}
              options={currencyOptions}
              required
            />
            <Field
              type="number"
              label="Exchange Rate"
              name="exchangeRate"
              value={header.exchangeRate}
              onChange={handleHeaderChange}
              error={fieldErrors.exchangeRate}
              step="0.0001"
              required
            />
            <Field
              label="Supplier Ref No"
              name="supplierRefNo"
              value={header.supplierRefNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Supplier Ref Date"
              name="supplierRefDate"
              value={header.supplierRefDate}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Tax Code"
              name="taxCode"
              value={header.taxCode}
              onChange={handleHeaderChange}
              error={fieldErrors.taxCode}
              options={taxCodeOptions}
              required
            />
            <ToggleField
              label="Indent Required"
              value={header.indentRequired}
              onChange={(v) =>
                setHeader((prev) => ({ ...prev, indentRequired: v }))
              }
              required
            />
            <Field
              label="Currency ID"
              name="currencyId"
              value={header.currencyId}
              onChange={handleHeaderChange}
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

            {activeTabType === "table" && (
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
          <div className="pt-2">
            {tableError && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
                {tableError}
              </p>
            )}

            {activeTabType === "table" && (
              <DynamicTable
                columns={activeTabConfig[activeTab].columns}
                rows={activeTabConfig[activeTab].rows}
                onCellChange={activeTabConfig[activeTab].handlers.onCellChange}
                onRemoveRow={activeTabConfig[activeTab].handlers.onRemoveRow}
              />
            )}

            {activeTabType === "fields" && (
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Total Amount"
                  name="totalAmount"
                  value={totalAmount ? Number(totalAmount.toFixed(2)) : ""}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="select"
                  label="Mode Of Despatch"
                  name="modeOfDespatch"
                  value={terms.modeOfDespatch}
                  onChange={handleTermsChange}
                  options={modeOfDespatchOptions}
                  required
                />
                <Field
                  type="select"
                  label="Payment Terms"
                  name="paymentTerms"
                  value={terms.paymentTerms}
                  onChange={handleTermsChange}
                  options={paymentTermsOptions}
                  required
                />
                <Field
                  label="Delivery Terms"
                  name="deliveryTerms"
                  value={terms.deliveryTerms}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Delivery Port"
                  name="deliveryPort"
                  value={terms.deliveryPort}
                  onChange={handleTermsChange}
                />
                <Field
                  label="Amount In Words"
                  name="amountInWords"
                  value={amountInWords || "Rupees Only"}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={terms.remarks}
                  onChange={handleTermsChange}
                />
                <Field
                  type="textarea"
                  label="Notes"
                  name="notes"
                  value={terms.notes}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={terms.preparedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Checked By"
                  name="checkedBy"
                  value={terms.checkedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Authorised By"
                  name="authorisedBy"
                  value={terms.authorisedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                  required
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

export default ImportPurchaseOrderForm;