import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import salesOrderShortCloseAPI from "../../../api/Sales/salesOrderShortCloseAPI";
import itemAPI from "../../../api/itemAPI";

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

// Spacious grid used inside the detail/summary sections so fields breathe more.
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
/* Options                                                                      */

const CHILD_TABS = [
  { key: "shortCloseDetails", label: "Short Close Details", kind: "table" },
  { key: "shortCloseSummary", label: "Short Close Summary", kind: "fields" },
];

const emptyDetailRow = () => ({
  itemId: "",
  itemCode: "",
  itemDescription: "",
  orderId: "",
  orderQty: "",
  suppliedQty: "",
  pendingQty: "0.00",
  requiredQty: "",
  shortCloseQty: "0.00",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateShortCloseNo = () =>
  `SC-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const SalesOrderShortCloseForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");
  const finYear = localStorage.getItem("finYear") || "";

  const [activeChildTab, setActiveChildTab] = useState("shortCloseDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [customerOptions, setCustomerOptions] = useState([]);
  const [agreementOptions, setAgreementOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});

  const [header, setHeader] = useState(() => {
    const base = {
      customerId: data?.customerId?.id ?? data?.customerId ?? "",
      customerName:
        data?.customerId?.customerName ?? data?.customerName ?? "",
      salesAgreementNo: data?.docId ?? data?.salesAgreementNo ?? "",
      shortCloseNo:
        data?.shortCloseNo || (data ? "" : generateShortCloseNo()),
      date: data?.docDate ?? data?.date ?? dayjs().format("YYYY-MM-DD"),
      active: data?.active !== false,
    };
    base.date = fmtDate(base.date);
    return base;
  });

  const [detailRows, setDetailRows] = useState(
    data?.salesOrderShortCloseDetailsResponseDTO?.length
      ? data.salesOrderShortCloseDetailsResponseDTO.map((d) => ({
          itemId: d.item?.id ?? "",
          itemCode: d.item?.itemCode ?? "",
          itemDescription: d.item?.itemDescription ?? "",
          orderQty: d.orderQty ?? "",
          suppliedQty: d.suppliedQty ?? "",
          pendingQty: d.pendingQty ?? "0.00",
          requiredQty: d.requiredQty ?? "",
          shortCloseQty: d.shortCloseQty ?? "0.00",
        }))
      : [emptyDetailRow()],
  );

  const [summary, setSummary] = useState({
    referenceForSc: data?.cancelRemarks ?? data?.shortCloseSummary?.referenceForSc ?? "",
  });

  /* ---------------- Lookup loading ---------------- */

  const loadCustomers = useCallback(async () => {
    try {
      const res = await salesOrderShortCloseAPI.getCustomerDetails(branch, orgId);
      setCustomerOptions(
        (res || []).map((c) => ({
          value: c.customerId,
          label: `${c.customerCode} - ${c.customerName}`,
          customerName: c.customerName,
          customerCode: c.customerCode,
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);
      setCustomerOptions([]);
    }
  }, [orgId, branch]);

  // Sales Agreement No dropdown is populated from Order Acceptance docs for
  // the selected customer. Response items: [{ orderAccptanceId, docId, docDate }]
  const loadAgreements = useCallback(
    async (customer) => {
      if (!customer) {
        setAgreementOptions([]);
        return;
      }
      try {
        const items = await salesOrderShortCloseAPI.getOrderAcceptanceDocIdDetails(
          customer,
        );
        setAgreementOptions(
          (items || []).map((it) => ({
            value: it.docId,
            label: it.docId,
            orderAcceptanceId: it.orderAccptanceId,
            docDate: it.docDate,
          })),
        );
      } catch (error) {
        console.error("Failed to load sales agreement options:", error);
        setAgreementOptions([]);
      }
    },
    [],
  );

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

  // Loads the short-close detail grid rows.
  // - If a Sales Agreement No is selected, use its Order Acceptance items.
  // - If none selected, fall back to all items via the item master.
  const loadDetailItems = useCallback(
    async (docId) => {
      if (docId) {
        try {
          const items = await salesOrderShortCloseAPI.getOrderAcceptanceItemDetailsDetails(
            docId,
          );
          setDetailRows(
            (items || []).map((it) => ({
              itemId: it.itemId || "",
              itemCode: it.itemCode,
              itemDescription: it.itemDescitpion || "",
              orderId: it.orderId || "",
              orderQty: it.quantity ?? "",
              suppliedQty: "",
              pendingQty: "0.00",
              requiredQty: "",
              shortCloseQty: "0.00",
            })),
          );
        } catch (error) {
          console.error("Failed to load agreement items:", error);
          setDetailRows([emptyDetailRow()]);
        }
      } else {
        const res = await itemAPI.getItems(orgId, branch);
        setDetailRows(
          (res || []).map((it) => ({
            itemId: it.id || "",
            itemCode: it.itemCode,
            itemDescription: it.itemDescription || "",
            orderQty: "",
            suppliedQty: "",
            pendingQty: "0.00",
            requiredQty: "",
            shortCloseQty: "0.00",
          })),
        );
      }
    },
    [orgId, branch],
  );

  useEffect(() => {
    if (orgId && branch) {
      loadCustomers();
      loadItems();
    }
  }, [orgId, branch, loadCustomers, loadItems]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "customerId") {
        const customer = customerOptions.find(
          (c) => String(c.value) === String(value),
        );
        next.customerName = customer?.customerName || "";
        next.salesAgreementNo = "";
        loadAgreements(value);
        loadDetailItems("");
      }
      if (name === "salesAgreementNo") {
        loadDetailItems(value);
      }
      return next;
    });
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          const item = itemMasterMap[value];
          next.itemDescription = item?.itemDescription || "";
        }

        // Pending Qty = Order Qty - Supplied Qty, defaults to 0.00
        if (["orderQty", "suppliedQty"].includes(key)) {
          const orderQty = parseFloat(next.orderQty) || 0;
          const suppliedQty = parseFloat(next.suppliedQty) || 0;
          const pendingQty = orderQty - suppliedQty;
          next.pendingQty = pendingQty ? pendingQty.toFixed(2) : "0.00";
        }

        // Short Close Qty = Pending Qty - Required Qty
        if (["orderQty", "suppliedQty", "requiredQty"].includes(key)) {
          const pendingQty = parseFloat(next.pendingQty) || 0;
          const requiredQty = parseFloat(next.requiredQty) || 0;
          const shortCloseQty = pendingQty - requiredQty;
          next.shortCloseQty = shortCloseQty ? shortCloseQty.toFixed(2) : "0.00";
        }

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);
  const handleRemoveRow = (idx) =>
    setDetailRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.customerId) errors.customerId = "Customer ID is required";
    if (!header.salesAgreementNo)
      errors.salesAgreementNo = "Sales Agreement No is required";
    if (!header.shortCloseNo?.trim())
      errors.shortCloseNo = "Short Close No is required";
    if (!header.date) errors.date = "Date is required";

    const hasValidRow = detailRows.some(
      (r) => r.itemCode && Number(r.shortCloseQty) >= 0,
    );
    if (!hasValidRow)
      errors.shortCloseDetails =
        "Add at least one item with Item Code and Short Close Qty";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const saleOrderNo =
      agreementOptions.find((ag) => ag.value === header.salesAgreementNo)
        ?.orderAcceptanceId || 0;

    // Single-transaction payload matching the backend DTO
    // createUpdateSalesOrderShort. Header + details saved together; the backend
    // maintains complete short-close history for audit purposes.
    const payload = {
      active: header.active !== false,
      branch,
      cancelRemarks: summary.referenceForSc || "",
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      customer: Number(header.customerId) || 0,
      docId: header.salesAgreementNo || "",
      financialYear: data?.financialYear || finYear,
      orgId,
      saleOrderNo,
      salesOrderShortCloseDetailsDTO: detailRows
        .filter((r) => r.itemCode?.trim())
        .map((r) => ({
          item: Number(r.itemId) || 0,
          orderQty: Number(r.orderQty) || 0,
          requiredQty: Number(r.requiredQty) || 0,
          suppliedQty: Number(r.suppliedQty) || 0,
        })),
    };

    // Create -> no id; Update -> with id.
    if (isUpdate) payload.id = data.id;

    try {
      const response =
        await salesOrderShortCloseAPI.createUpdateSalesOrderShortClose(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Sales Order Short-Close updated successfully!"
              : "Sales Order Short-Close created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Sales Order Short-Close.",
        );
      }
    } catch (err) {
      console.error("Save Sales Order Short-Close Error:", err);
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
            ? "Edit Sales Order Short-Close"
            : "Add Sales Order Short-Close"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Short Close Header ---------------- */}
        <div>
          <SectionHeader>Short Close Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Customer ID"
              name="customerId"
              value={header.customerId}
              onChange={handleHeaderChange}
              error={fieldErrors.customerId}
              options={customerOptions}
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
              label="Sales Agreement No"
              name="salesAgreementNo"
              value={header.salesAgreementNo}
              onChange={handleHeaderChange}
              error={fieldErrors.salesAgreementNo}
              options={agreementOptions}
              required
            />
            <Field
              label="Short Close No"
              name="shortCloseNo"
              value={header.shortCloseNo}
              onChange={handleHeaderChange}
              error={fieldErrors.shortCloseNo}
              required
              // disabled={!data}
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

          {/* Tab 1: Short Close Details */}
          {activeChildTab === "shortCloseDetails" && (
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
                  { key: "orderQty", label: "Order Qty", type: "number" },
                  { key: "suppliedQty", label: "Supplied Qty", type: "number" },
                  {
                    key: "pendingQty",
                    label: "Pending Qty",
                    readOnly: true,
                  },
                  { key: "requiredQty", label: "Required Qty", type: "number" },
                  {
                    key: "shortCloseQty",
                    label: "Short Close Qty",
                    readOnly: true,
                  },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.shortCloseDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.shortCloseDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Short Close Summary */}
          {activeChildTab === "shortCloseSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Reference for SC"
                  name="referenceForSc"
                  value={summary.referenceForSc}
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

export default SalesOrderShortCloseForm;
