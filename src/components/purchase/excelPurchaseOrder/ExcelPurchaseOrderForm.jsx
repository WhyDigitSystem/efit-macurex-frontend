import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import excelPurchaseOrderAPI from "../../../api/Purchase/excelPurchaseOrderAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import hsnSacAPI from "../../../api/hsnSacAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { branchAPI } from "../../../api/branchAPI";
import { taxDefinitionAPI } from "../../../api/taxDefinitionAPI";
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

const generatePoNo = () => `EPO${dayjs().format("YYYYMMDDHHmmss")}`;

const round2 = (n) => Number(Number(n || 0).toFixed(2));

const recalcItemRow = (row, isIgstApplicable) => {
  const qty = Number(row.qty) || 0;
  const rate = Number(row.rate) || 0;
  const tax = Number(row.taxPercent) || 0;
  const amount = qty * rate;

  const sgstRate = isIgstApplicable ? 0 : tax / 2;
  const cgstRate = isIgstApplicable ? 0 : tax / 2;
  const igstRate = isIgstApplicable ? tax : 0;

  return {
    ...row,
    amount: amount ? round2(amount) : "",
    sgstRate: sgstRate ? round2(sgstRate) : "",
    sgstAmount: amount && sgstRate ? round2((amount * sgstRate) / 100) : "",
    cgstRate: cgstRate ? round2(cgstRate) : "",
    cgstAmount: amount && cgstRate ? round2((amount * cgstRate) / 100) : "",
    igstRate: igstRate ? round2(igstRate) : "",
    igstAmount: amount && igstRate ? round2((amount * igstRate) / 100) : "",
  };
};

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  plantId: "",
  department: "",
  belongsTo: "",
  supplierCode: "",
  supplierName: "",
  taxCode: "",
  gstState: "",
  isIgstApplicable: false,
  gstnNo: "",
  refNo: "",
  refDate: "",
  poNo: generatePoNo(),
  poDate: dayjs().format("YYYY-MM-DD"),
  address: "",
});

const emptyItemRow = () => ({
  itemDescription: "",
  hsnSacCode: "",
  taxType: "",
  taxPercent: "",
  qty: "",
  purchaseUnit: "",
  rate: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const emptyTaxDetailRow = () => ({
  particulars: "",
  taxPercent: "",
  taxAmount: "",
});

const emptyTerms = () => ({
  discount: "",
  paymentTerms: "",
  totalAmount: "",
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

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "itemDetails", label: "Item Details", type: "table" },
  { key: "taxDetails", label: "Tax Details", type: "table" },
  { key: "terms", label: "Terms and Conditions", type: "fields" },
];

const ExcelPurchaseOrderForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const [activeTab, setActiveTab] = useState("itemDetails");
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

  const [unitOptions, setUnitOptions] = useState([]);
  const [hsnOptions, setHsnOptions] = useState([]);
  const [taxTypeOptions, setTaxTypeOptions] = useState([]);
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([]);
  const [modeOfDespatchOptions, setModeOfDespatchOptions] = useState([]);
  const [freightTypeOptions, setFreightTypeOptions] = useState([]);
  const [packingTypeOptions, setPackingTypeOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const base = { ...emptyHeader(), ...data?.header };
    base.poDate = fmtDate(base.poDate);
    base.refDate = fmtDate(base.refDate);
    return base;
  });

  const [itemRows, setItemRows] = useState(() =>
    data?.itemDetails?.length
      ? data.itemDetails.map((d) => ({ ...emptyItemRow(), ...d }))
      : [emptyItemRow()],
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
        const res = await departmentAPI.getAllDepartments(orgId);
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

    const loadHsn = async () => {
      try {
        const res = await hsnSacAPI.getAll(orgId, branch);
        const list = Array.isArray(res) ? res : [];
        setHsnOptions(
          list.map((h) => ({
            value: h.hsnCode || h.code || h.id,
            label: h.hsnCode || h.code || h.id,
          })),
        );
      } catch {
        setHsnOptions([]);
      }
    };

    Promise.all([
      loadPlants(),
      loadDepartments(),
      loadSuppliers(),
      loadTaxCodes(),
      loadEmployees(),
      loadUnits(),
      loadHsn(),
      loadLov("TAX", setTaxTypeOptions),
      loadLov("Payment Terms", setPaymentTermsOptions),
      loadLov("Mode Of Despatch", setModeOfDespatchOptions),
      loadLov("Freight Type", setFreightTypeOptions),
      loadLov("Packing Type", setPackingTypeOptions),
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

  /* ---------------- Item Detail row handlers ---------------- */

  const handleItemCellChange = (idx, key, value) => {
    setItemRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddItemRow = () =>
    setItemRows((prev) => [...prev, emptyItemRow()]);
  const handleRemoveItemRow = (idx) =>
    setItemRows((prev) => prev.filter((_, i) => i !== idx));

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

  const computedItemRows = itemRows.map((row) =>
    recalcItemRow(row, header.isIgstApplicable),
  );

  const itemSubTotal = computedItemRows.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );

  const computedTaxRows = taxRows.map((row) => ({
    ...row,
    taxAmount:
      row.taxPercent !== "" && itemSubTotal
        ? Number(((itemSubTotal * (Number(row.taxPercent) || 0)) / 100).toFixed(2))
        : "",
  }));

  const taxTotal = computedTaxRows.reduce(
    (sum, row) => sum + (Number(row.taxAmount) || 0),
    0,
  );

  const freight = Number(terms.freight) || 0;
  const inlandCharge = Number(terms.inlandCharge) || 0;
  const discount = Number(terms.discount) || 0;
  const totalAmount = itemSubTotal + taxTotal + freight + inlandCharge - discount;

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.belongsTo?.trim()) errors.belongsTo = "Belongs To is required";
    if (!header.supplierCode?.trim())
      errors.supplierCode = "Supplier ID is required";
    if (!header.supplierName?.trim())
      errors.supplierName = "Supplier Name is required";
    if (!header.taxCode) errors.taxCode = "Tax Code is required";
    if (!header.poNo?.trim()) errors.poNo = "P.O. No is required";
    if (!header.poDate) errors.poDate = "P.O. Date is required";

    setFieldErrors(errors);

    const validItems = computedItemRows.every(
      (r) =>
        r.hsnSacCode?.trim() && r.taxType?.trim() && r.purchaseUnit?.trim(),
    );

    const validTax = computedTaxRows.every((r) => r.particulars?.trim());

    if (!validItems)
      setTableError("Complete all mandatory columns in the Item Details tab");
    else if (!validTax)
      setTableError("Complete all mandatory columns in the Tax Details tab");
    else if (!terms.paymentTerms?.trim())
      setTableError("Payment Terms is required in the Terms and Conditions tab");
    else if (!terms.modeOfDespatch?.trim())
      setTableError("Mode of Despatch is required in the Terms and Conditions tab");
    else if (!terms.preparedBy)
      setTableError("Prepared By is required in the Terms and Conditions tab");
    else if (!terms.authorizedBy)
      setTableError("Authorized By is required in the Terms and Conditions tab");
    else setTableError("");

    return (
      Object.keys(errors).length === 0 &&
      validItems &&
      validTax &&
      terms.paymentTerms?.trim() &&
      terms.modeOfDespatch?.trim() &&
      terms.preparedBy &&
      terms.authorizedBy
    );
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + item details + tax details + terms.
    // The backend persists the record linked to the supplier and keeps the
    // complete PO history for audit purposes (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId: Number(orgId),
      header: {
        ...header,
        poNo: header.poNo || generatePoNo(),
      },
      itemDetails: computedItemRows.filter((r) => r.hsnSacCode?.trim()),
      taxDetails: computedTaxRows.filter((r) => r.particulars?.trim()),
      terms: {
        ...terms,
        totalAmount: totalAmount ? Number(totalAmount.toFixed(2)) : 0,
      },
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await excelPurchaseOrderAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Excel Purchase Order updated successfully!"
              : "Excel Purchase Order created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Excel Purchase Order.",
        );
      }
    } catch (err) {
      console.error("Save Excel Purchase Order Error:", err);
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
    itemDetails: {
      type: "table",
      rows: computedItemRows,
      columns: [
        { key: "itemDescription", label: "Item Description" },
        {
          key: "hsnSacCode",
          label: "HSN/SAC Code *",
          type: "select",
          options: hsnOptions,
        },
        {
          key: "taxType",
          label: "Tax Type *",
          type: "select",
          options: taxTypeOptions,
        },
        {
          key: "taxPercent",
          label: "Tax %",
          type: "number",
          step: "0.01",
        },
        { key: "qty", label: "Qty", type: "number", step: "0.01" },
        {
          key: "purchaseUnit",
          label: "Purchase Unit *",
          type: "select",
          options: unitOptions,
        },
        { key: "rate", label: "Rate", type: "number", step: "0.01" },
        { key: "amount", label: "Amount", readOnly: true },
        { key: "sgstRate", label: "SGST Rate", readOnly: true },
        { key: "sgstAmount", label: "SGST Amount", readOnly: true },
        { key: "cgstRate", label: "CGST Rate", readOnly: true },
        { key: "cgstAmount", label: "CGST Amount", readOnly: true },
        { key: "igstRate", label: "IGST Rate", readOnly: true },
        { key: "igstAmount", label: "IGST Amount", readOnly: true },
      ],
      handlers: {
        onCellChange: handleItemCellChange,
        onAddRow: handleAddItemRow,
        onRemoveRow: handleRemoveItemRow,
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
        { key: "taxAmount", label: "Tax Amount", readOnly: true },
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
          {data ? "Edit Excel Purchase Order" : "Add Excel Purchase Order"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Excel Purchase Order Details</SectionHeader>
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
              options={departmentOptions}
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
              label="Supplier ID"
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
              label="Tax Code"
              name="taxCode"
              value={header.taxCode}
              onChange={handleHeaderChange}
              error={fieldErrors.taxCode}
              options={taxCodeOptions}
              required
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
            />
            <ToggleField
              label="Is IGST Applicable"
              value={header.isIgstApplicable}
              onChange={(v) =>
                setHeader((prev) => ({ ...prev, isIgstApplicable: v }))
              }
            />
            <Field
              label="GSTN No"
              name="gstnNo"
              value={header.gstnNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Ref No"
              name="refNo"
              value={header.refNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Ref Date"
              name="refDate"
              value={header.refDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="PO No"
              name="poNo"
              value={header.poNo}
              onChange={handleHeaderChange}
              disabled
              required
            />
            <Field
              type="date"
              label="PO Date"
              name="poDate"
              value={header.poDate}
              onChange={handleHeaderChange}
              error={fieldErrors.poDate}
              required
            />
            <Field
              type="textarea"
              label="Address"
              name="address"
              value={header.address}
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
                  label="Discount"
                  name="discount"
                  value={terms.discount}
                  onChange={handleTermsChange}
                  step="0.01"
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
                  type="number"
                  label="Total Amount"
                  name="totalAmount"
                  value={totalAmount ? Number(totalAmount.toFixed(2)) : ""}
                  onChange={() => {}}
                  disabled
                />
                <Field
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
                  step="0.01"
                />
                <Field
                  type="select"
                  label="Freight Type"
                  name="freightType"
                  value={terms.freightType}
                  onChange={handleTermsChange}
                  options={freightTypeOptions}
                />
                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={terms.packingType}
                  onChange={handleTermsChange}
                  options={packingTypeOptions}
                />
                <Field
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
                  options={modeOfDespatchOptions}
                  required
                />
                <Field
                  type="number"
                  label="Inland Charge"
                  name="inlandCharge"
                  value={terms.inlandCharge}
                  onChange={handleTermsChange}
                  step="0.01"
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
                  label="Authorized By"
                  name="authorizedBy"
                  value={terms.authorizedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={terms.narration}
                  onChange={handleTermsChange}
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

export default ExcelPurchaseOrderForm;