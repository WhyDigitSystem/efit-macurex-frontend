import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import transferOrderAPI from "../../../api/PPC/transferOrderAPI";
import { itemAPI } from "../../../api/itemAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import { purchaseContractAPI } from "../../../api/Purchase/purchaseContractAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

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
        X
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top min-w-[120px]">
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
        ? "min-w-[140px]"
        : type === "number"
          ? "min-w-[100px]"
          : "min-w-[120px]"
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
  <td className="p-1 align-top min-w-[140px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
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

const generateDocNo = () => `TRO${dayjs().format("YYYYMMDDHHmmss")}`;

const generateTransId = () => `TRN${dayjs().format("YYYYMMDDHHmmss")}${Math.floor(
  Math.random() * 100,
)}`;

const ORDER_TYPE_OPTIONS = [
  { value: "INTER_BRANCH", label: "Inter Branch" },
  { value: "INTER_PLANT", label: "Inter Plant" },
  { value: "INTERNAL", label: "Internal Transfer" },
  { value: "EDP", label: "EDP" },
];

const TYPE_OPTIONS = [
  { value: "FULL", label: "Full" },
  { value: "PARTIAL", label: "Partial" },
];

const COMBINE_WITH_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "DP", label: "DP" },
  { value: "STO", label: "STO" },
  { value: "GRN", label: "GRN" },
];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  orderType: "",
  documentNo: generateDocNo(),
  date: dayjs().format("YYYY-MM-DD"),
});

const emptyTransferRow = () => ({
  orderDate: dayjs().format("YYYY-MM-DD"),
  itemCode: "",
  itemDescription: "",
  scheduleDate: dayjs().format("YYYY-MM-DD"),
  qty: "",
  unit: "",
  purchaseQty: "",
  purchaseUnit: "",
  supplierId: "",
  supplierName: "",
  type: "",
  combineWith: "",
  transId: "",
  contractNo: "",
});

const TransferOrderForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");

  /* ---------------- Lookup options ---------------- */
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [supplierMap, setSupplierMap] = useState({});
  const [contractOptions, setContractOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...emptyHeader(),
    ...data?.header,
    date: fmtDate(data?.header?.date),
  }));

  const [transferRows, setTransferRows] = useState(() =>
    data?.transferDetails?.length
      ? data.transferDetails.map((d) => ({
          ...emptyTransferRow(),
          ...d,
          orderDate: fmtDate(d.orderDate),
          scheduleDate: fmtDate(d.scheduleDate),
        }))
      : [emptyTransferRow()],
  );

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

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

    const loadContracts = async () => {
      try {
        const res = await purchaseContractAPI.getContractByOrgId(orgId);
        const opts = (Array.isArray(res) ? res : []).map((c) => {
          const no = c.contractNo || c.header?.contractNo || c.id;
          return { value: no, label: no };
        });
        setContractOptions(opts);
      } catch {
        setContractOptions([]);
      }
    };

    Promise.all([loadItems(), loadUnits(), loadSuppliers(), loadContracts()]);
  }, [orgId, branch]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Transfer Detail row handlers ---------------- */

  const handleCellChange = (idx, key, value) => {
    setTransferRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        if (key === "itemCode") {
          const item = itemMap[value];
          next.itemDescription = item?.itemDescription || "";
          if (item?.primaryUnits?.primaryUnit) {
            next.unit = item.primaryUnits.primaryUnit;
            next.purchaseUnit = item.primaryUnits.primaryUnit;
          }
        }
        if (key === "supplierId") {
          next.supplierName = supplierMap[value] || "";
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setTransferRows((prev) => [...prev, emptyTransferRow()]);
  const handleRemoveRow = (idx) =>
    setTransferRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.orderType?.trim()) errors.orderType = "Order Type is required";
    if (!header.documentNo?.trim())
      errors.documentNo = "Document No is required";
    if (!header.date) errors.date = "Date is required";

    setFieldErrors(errors);

    const validRows = transferRows.every(
      (r) =>
        r.orderDate &&
        r.itemCode?.trim() &&
        r.itemDescription?.trim() &&
        r.scheduleDate &&
        r.qty !== "" &&
        Number(r.qty) > 0,
    );

    if (!validRows)
      setTableError(
        "Complete all mandatory columns in the Transfer Details grid",
      );
    else setTableError("");

    return Object.keys(errors).length === 0 && validRows;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + transfer details.
    // The transfer details are linked to the supplier/contract and the backend
    // keeps the complete transfer order history (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      header: {
        ...header,
        documentNo: header.documentNo || generateDocNo(),
      },
      transferDetails: transferRows
        .filter((r) => r.itemCode?.trim())
        .map((r, i) => ({
          ...r,
          transId: r.transId || generateTransId(),
          sno: i + 1,
        })),
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await transferOrderAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Transfer Order updated successfully!"
              : "Transfer Order created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Transfer Order.",
        );
      }
    } catch (err) {
      console.error("Save Transfer Order Error:", err);
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

  const columns = [
    { key: "orderDate", label: "Order Date *", type: "date" },
    {
      key: "itemCode",
      label: "Item Code *",
      type: "select",
      options: itemOptions,
    },
    { key: "itemDescription", label: "Item Description *", readOnly: true },
    { key: "scheduleDate", label: "Schedule Date *", type: "date" },
    { key: "qty", label: "Qty *", type: "number", step: "0.01" },
    { key: "unit", label: "Unit", type: "select", options: unitOptions },
    { key: "purchaseQty", label: "Purchase Qty", type: "number", step: "0.01" },
    {
      key: "purchaseUnit",
      label: "Purchase Unit",
      type: "select",
      options: unitOptions,
    },
    {
      key: "supplierId",
      label: "Supplier ID",
      type: "select",
      options: supplierOptions,
    },
    { key: "supplierName", label: "Supplier Name", readOnly: true },
    { key: "type", label: "Type", type: "select", options: TYPE_OPTIONS },
    {
      key: "combineWith",
      label: "Combine With",
      type: "select",
      options: COMBINE_WITH_OPTIONS,
    },
    { key: "transId", label: "Trans ID", readOnly: true },
    {
      key: "contractNo",
      label: "Contract No",
      type: "select",
      options: contractOptions,
    },
  ];

  return (
    <div className="p-2 max-w-[1700px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Transfer Order" : "Add Transfer Order"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Section ---------------- */}
        <div>
          <SectionHeader>Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Order Type"
              name="orderType"
              value={header.orderType}
              onChange={handleHeaderChange}
              error={fieldErrors.orderType}
              options={ORDER_TYPE_OPTIONS}
              required
            />
            <Field
              label="Document No"
              name="documentNo"
              value={header.documentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.documentNo}
              disabled
              required
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
          </div>
        </div>

        {/* ---------------- Transfer Details Section ---------------- */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Transfer Details</SectionHeader>
            <button
              type="button"
              onClick={handleAddRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Plus size={12} />
            </button>
          </div>

          {tableError && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
              {tableError}
            </p>
          )}

          <DynamicTable
            columns={columns}
            rows={transferRows}
            onCellChange={handleCellChange}
            onRemoveRow={handleRemoveRow}
          />
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

export default TransferOrderForm;