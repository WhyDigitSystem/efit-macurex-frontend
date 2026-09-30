import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import transferOrderAPI from "../../../api/PPC/transferOrderAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
import purchaseContractAPI from "../../../api/Purchase/purchaseContractAPI";
import purchaseOrderAPI from "../../../api/Purchase/purchaseOrderAPI";
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
          className={`p-1 whitespace-nowrap ${i === 0
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
        className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
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

const InputCell = ({ value, onChange, type = "text", step, readOnly }) => (
  <td
    className={`p-1 align-top ${type === "date"
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
      readOnly={readOnly}
      className={readOnly ? cellReadOnlyClasses : cellInputClasses}
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
                readOnly={col.readOnly}
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

const generateTransId = () =>
  `TRN${dayjs().format("YYYYMMDDHHmmss")}${Math.floor(Math.random() * 100)}`;

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  orderType: "",
  documentNo: "",
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

/* ---------------------------------------------------------------------------- */

const TransferOrderForm = ({ data, onBack, onSave }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");
  const [generatingDocId, setGeneratingDocId] = useState(false);

  /* ---------------- Lookup options ---------------- */
  const [orderTypeOptions, setOrderTypeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [supplierMap, setSupplierMap] = useState({});
  const [contractOptions, setContractOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...emptyHeader(),
    ...data?.header,
    date: fmtDate(data?.header?.date) || dayjs().format("YYYY-MM-DD"),
    documentNo: data?.header?.documentNo || "",
  }));

  const [transferRows, setTransferRows] = useState(() =>
    data?.transferDetails?.length
      ? data.transferDetails.map((d) => ({
        ...emptyTransferRow(),
        ...d,
        orderDate: fmtDate(d.orderDate),
        scheduleDate: fmtDate(d.scheduleDate),
      }))
      : [emptyTransferRow()]
  );

  /* ---------------- Doc No generation ---------------- */
  const loadDocId = useCallback(async () => {
    if (data?.id || !orgId) return;
    setGeneratingDocId(true);
    try {
      const financialYear = new Date().getFullYear().toString();
      const docId = await transferOrderAPI.getTransferOrderDocId(
        orgId,
        financialYear
      );
      if (docId) {
        setHeader((p) => ({ ...p, documentNo: docId }));
      }
    } catch (err) {
      console.error("Failed to generate Document No:", err);
      addToast("Failed to generate Document No", "error");
    } finally {
      setGeneratingDocId(false);
    }
  }, [orgId, data?.id, addToast]);

  /* ---------------- Load by id for edit ---------------- */
  const loadTransferOrderById = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const vo = await transferOrderAPI.getById(id);
        if (!vo) {
          addToast("Failed to load Transfer Order", "error");
          return;
        }

        // Header
        setHeader((p) => ({
          ...p,
          orderType: vo.orderType?.id || "",
          documentNo: vo.docId || p.documentNo || "",
          date: vo.docDate || p.date,
        }));

        // Transfer detail rows
        const rows = vo.transferOrderDetailResponseDTO || [];
        if (rows.length) {
          setTransferRows(
            rows.map((r) => ({
              ...emptyTransferRow(),
              id: r.id,
              orderDate: fmtDate(r.orderDate),
              itemCode: r.itemCode?.id || "",
              itemDescription:
                r.itemDescription || r.itemCode?.itemDescription || "",
              scheduleDate: fmtDate(r.scheduleDate),
              qty: r.qty ?? "",
              unit: r.unit || "",
              purchaseQty: r.purQty ?? "",
              purchaseUnit: r.purUnit ?? "",
              supplierId: r.supplierId?.id || "",
              supplierName: r.supplierName || r.supplierId?.customerName || "",
              type: r.type || "",
              combineWith: r.combineWith || "",
              transId: r.transId || "",
              contractNo: r.contractNo || "",
            }))
          );
        } else {
          setTransferRows([emptyTransferRow()]);
        }
      } catch (err) {
        console.error("Error loading transfer order by id:", err);
        addToast("Failed to load Transfer Order", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  /* ---------------- Lookup loading ---------------- */
  useEffect(() => {
    if (!orgId) return;

    const loadOrderTypes = async () => {
      try {
        const res = await listOfValuesAPI.getListValuesGroup(
          "ORDER TYPE",
          orgId
        );
        setOrderTypeOptions(
          (res || []).map((item) => ({
            value: item.id || item.value,
            label: item.valuesDescription || item.label || item.name,
          }))
        );
      } catch {
        setOrderTypeOptions([]);
      }
    };

    const loadItems = async () => {
      try {
        const res = await transferOrderAPI.getTransferOrderItemDropdown(orgId);
        const map = {};
        const opts = (res || []).map((it) => {
          const id = it.id;
          map[id] = it;
          return {
            value: id,
            label: `${it.name || ""} - ${it.description || ""}`,
          };
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
            value: u.id?.toString() || "",
            label: u.unitId || u.id?.toString() || "",
          }))
        );
      } catch {
        setUnitOptions([]);
      }
    };

    const loadSuppliers = async () => {
      try {
        const res = await purchaseOrderAPI.getSupplierDetails(orgId, branch);
        const rawArray = Array.isArray(res)
          ? res
          : res?.paramObjectsMap?.mapp || [];
        const map = {};
        const opts = rawArray.map((p) => {
          const id = p.supplierId;
          map[id] = p.supplierName;
          return {
            value: id,
            label: `${p.supplierCode || ""} - ${p.supplierName || ""}`,
          };
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

    Promise.all([
      loadOrderTypes(),
      loadItems(),
      loadUnits(),
      loadSuppliers(),
      loadContracts(),
    ]);
  }, [orgId, branch]);

  /* ---------------- Type options based on selected Order Type ---------------- */
  useEffect(() => {
    const loadTypes = async () => {
      if (!header.orderType) {
        setTypeOptions([]);
        return;
      }

      const selected = orderTypeOptions.find(
        (o) => String(o.value) === String(header.orderType)
      );
      const orderTypeLabel = selected?.label || "";

      if (!orderTypeLabel) {
        setTypeOptions([]);
        return;
      }

      try {
        const list = await transferOrderAPI.getTypeDropdownByOrderType(
          orderTypeLabel,
          orgId
        );
        setTypeOptions(
          (list || []).map((t) => ({
            value: t.name ?? t.id,
            label: t.name ?? t.id,
          }))
        );
      } catch (err) {
        console.error("Failed to load Type list:", err);
        setTypeOptions([]);
      }
    };

    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.orderType, orderTypeOptions]);

  /* Doc No generation on mount for new records */
  useEffect(() => {
    loadDocId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Load by id on edit */
  useEffect(() => {
    if (data?.id) {
      loadTransferOrderById(data.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Order Type change: clear Type in all rows (options will reload)
    if (name === "orderType") {
      setHeader((prev) => ({ ...prev, orderType: value }));
      setTransferRows((prev) => prev.map((row) => ({ ...row, type: "" })));
      return;
    }

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
          if (item) {
            next.itemDescription = item.description || "";
            next.unit = item.unitCode || "";
          }
        }

        if (key === "supplierId") {
          next.supplierName = supplierMap[value] || "";
        }

        return next;
      })
    );
  };

  const handleAddRow = () =>
    setTransferRows((prev) => [...prev, emptyTransferRow()]);

  const handleRemoveRow = (idx) =>
    setTransferRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.orderType?.toString().trim())
      errors.orderType = "Order Type is required";
    if (!header.documentNo?.trim())
      errors.documentNo = "Document No is required";
    if (!header.date) errors.date = "Date is required";

    setFieldErrors(errors);

    const validRows = transferRows.every(
      (r) =>
        r.orderDate &&
        r.itemCode?.toString().trim() &&
        r.itemDescription?.trim() &&
        r.scheduleDate &&
        r.qty !== "" &&
        Number(r.qty) > 0
    );

    if (!validRows)
      setTableError(
        "Complete all mandatory columns in the Transfer Details grid"
      );
    else setTableError("");

    return Object.keys(errors).length === 0 && validRows;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fix validation errors before saving", "error");
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      active: data?.active ?? true,
      cancel: false,
      cancelRemarks: "",
      createdBy: isUpdate ? data?.createdBy || usersId : usersId || "SYSTEM",
      docDate: header.date || dayjs().format("YYYY-MM-DD"),
      docId: header.documentNo || "",
      financialYear: new Date().getFullYear().toString(),
      orderType: parseInt(header.orderType) || 0,
      orgId,
      transferOrderDetailDTO: transferRows
        .filter((r) => r.itemCode?.toString().trim())
        .map((r) => ({
          combineWith: r.combineWith || "",
          contractNo: r.contractNo || "",
          id: r.id ? parseInt(r.id) : 0,
          itemCode: parseInt(r.itemCode) || 0,
          itemDescription: r.itemDescription || "",
          orderDate: r.orderDate || "",
          purQty: parseFloat(r.purchaseQty) || 0,
          purUnit: r.purchaseUnit || "",
          qty: parseFloat(r.qty) || 0,
          scheduleDate: r.scheduleDate || "",
          supplierId: parseInt(r.supplierId) || 0,
          supplierName: r.supplierName || "",
          transId: r.transId || generateTransId(),
          type: r.type || "",
          unit: r.unit || "",
        })),
      updatedBy: isUpdate ? usersId || "SYSTEM" : "",
    };

    if (isUpdate) {
      payload.id = parseInt(data.id);
    }

    console.log("📤 Saving Transfer Order Payload:", payload);

    try {
      const response = await transferOrderAPI.createUpdate(payload);

      const status =
        response?.status === true ||
        response?.success === true ||
        response?.statusFlag === "Ok" ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Transfer Order updated successfully!"
            : "Transfer Order created successfully!"),
          "success"
        );
        if (onSave) onSave(payload);
        else onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Transfer Order.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save Transfer Order Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.statusMessage ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong.";
      addToast(msg, "error");
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
    { key: "unit", label: "Unit" },
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
    { key: "type", label: "Type", type: "select", options: typeOptions },
    { key: "combineWith", label: "Combine With" },
    { key: "transId", label: "Trans ID" },
    {
      key: "contractNo",
      label: "Contract No",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading transfer order…
        </div>
      </div>
    );
  }

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
              options={orderTypeOptions}
              required
            />
            <Field
              label="Document No"
              name="documentNo"
              value={header.documentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.documentNo}
              placeholder={generatingDocId ? "Generating..." : "Auto"}
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