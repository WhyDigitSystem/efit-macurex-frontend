import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import supplierResponseAPI from "../../../api/quality/supplierResponseAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-start";

const cellInputClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full px-2 py-1 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
  "border-gray-300 dark:border-gray-600 cursor-default";

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
  placeholder = "",
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
          value={value ?? ""}
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
          value={value ?? ""}
          onChange={onChange}
          rows={2}
          placeholder={placeholder}
          className={
            "w-full px-2 py-1.5 rounded border text-xs transition-colors resize-none scrollbar-hide " +
            "bg-white dark:bg-gray-900 " +
            `${
              error ? controlErrClasses : "border-gray-300 dark:border-gray-600"
            } ` +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
        value={value ?? ""}
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
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

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

const DynamicTable = ({
  columns,
  rows,
  onCellChange,
  onRemoveRow,
  fieldErrors,
}) => (
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
            const error = fieldErrors?.[`detail.${idx}.${col.key}`];

            if (col.type === "select") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <select
                    value={row[col.key] ?? ""}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={`${cellInputClasses} ${
                      error ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">-- Select --</option>
                    {(col.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <p className="text-[10px] text-red-500 mt-0.5">{error}</p>
                  )}
                </td>
              );
            }

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    rows={2}
                    value={row[col.key] ?? ""}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-full min-w-[180px] px-2 py-1 rounded border text-xs " +
                      "bg-white dark:bg-gray-900 " +
                      `${
                        error
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } ` +
                      "text-gray-900 dark:text-gray-100 " +
                      "focus:outline-none focus:ring-1 focus:ring-blue-500"
                    }
                  />
                  {error && (
                    <p className="text-[10px] text-red-500 mt-0.5">{error}</p>
                  )}
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={
                    col.type === "number"
                      ? "number"
                      : col.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={row[col.key] ?? ""}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly
                      ? cellReadOnlyClasses
                      : `${cellInputClasses} ${error ? "border-red-500" : ""}`
                  }
                />
                {error && (
                  <p className="text-[10px] text-red-500 mt-0.5">{error}</p>
                )}
              </td>
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

const CHILD_TABS = [
  {
    key: "responseDetails",
    label: "Response Details",
    kind: "table",
  },
  {
    key: "summary",
    label: "Summary",
    kind: "fields",
  },
];

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const emptyDetailRow = () => ({
  item: "",
  itemDescription: "",
  qty: "",
  responseQty: "",
  reason: "",
});

const SupplierResponseForm = ({ data, onBack }) => {
  const { addToast } = useToast();

  const orgId = Number(localStorage.getItem("orgId")) || 0;

  const resolveBranch = () => {
    const branchRaw = localStorage.getItem("branch");
    if (branchRaw) {
      return Number(branchRaw);
    }

    try {
      const userDataRaw = localStorage.getItem("userData");
      const parsedUserData = userDataRaw ? JSON.parse(userDataRaw) : null;
      const branches = parsedUserData?.branches || [];

      if (branches.length) {
        const fallbackBranch = Number(branches[0].id);
        localStorage.setItem("branch", String(fallbackBranch));
        return fallbackBranch;
      }
    } catch (error) {
      return null;
    }

    return null;
  };

  const branch = resolveBranch();

  const usersId =
    localStorage.getItem("userName") || localStorage.getItem("usersId");

  const isEditMode = Boolean(data?.id);

  const [activeChildTab, setActiveChildTab] = useState("responseDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [header, setHeader] = useState(() => ({
    docNo: "",
    complaintNo: data?.complaintNo || "",
    complaintDate: data?.complaintDate ? fmtDate(data.complaintDate) : "",
    productNo: data?.productNo || "",
    productName: data?.productName || "",
    supplierNo: data?.supplierNo || "",
    supplierName: data?.supplierName || "",
    financialYear: data?.financialYear || String(new Date().getFullYear()),
  }));

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.supplierResponseEntryDetailsResponseDTO?.length
      ? data.supplierResponseEntryDetailsResponseDTO
      : [];

    if (raw.length) {
      return raw.map((item) => ({
        item:
          typeof item.item === "object"
            ? item.item?.id || ""
            : (item.item ?? item.itemId ?? ""),
        itemDescription:
          item.itemDescription ||
          item.itemName ||
          (typeof item.item === "object"
            ? item.item?.itemDescription || ""
            : ""),
        qty: item.qty ?? "",
        responseQty: item.responseQty ?? "",
        reason: item.reason || "",
      }));
    }

    return [emptyDetailRow()];
  });

  const [summary, setSummary] = useState({
    remarks: data?.remarks || "",
    cancelRemarks: data?.cancelRemarks || "",
  });

  const [complaintOptions, setComplaintOptions] = useState([]);
  const [complaintRecords, setComplaintRecords] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const loadComplaints = useCallback(async () => {
    if (!orgId) {
      return;
    }

    try {
      const res = await supplierResponseAPI.getComplaintNoDropdown(orgId);
      const records = Array.isArray(res) ? res : [];

      setComplaintRecords(records);
      setComplaintOptions(
        records
          .filter((c) => c?.docId)
          .map((c) => ({
            value: c.docId,
            label: c.docId,
          })),
      );
    } catch (error) {
      setComplaintRecords([]);
      setComplaintOptions([]);
    }
  }, [orgId]);

  const loadItemsBySupplier = useCallback(
    async (supplierId) => {
      if (!supplierId) {
        setItemOptions([]);
        return;
      }

      if (!branch) {
        setItemOptions([]);
        return;
      }

      if (!orgId) {
        setItemOptions([]);
        return;
      }

      setLoadingItems(true);

      try {
        const items =
          await supplierResponseAPI.getItemDropDownForSupplierResponseEntry(
            branch,
            orgId,
            supplierId,
          );

        const mappedItems = (Array.isArray(items) ? items : []).map((item) => ({
          value: String(item.id),
          label: item.itemCode || "",
          itemDescription: item.itemDescription || "",
        }));

        setItemOptions(mappedItems);

        setDetailRows((previousRows) =>
          previousRows.map((row) => {
            if (!row.item) {
              return row;
            }

            const selected = mappedItems.find(
              (item) => String(item.value) === String(row.item),
            );

            if (!selected) {
              return row;
            }

            return {
              ...row,
              itemDescription: selected.itemDescription,
            };
          }),
        );
      } catch (error) {
        setItemOptions([]);
      } finally {
        setLoadingItems(false);
      }
    },
    [branch, orgId],
  );

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  useEffect(() => {
    if (!isEditMode || !data?.complaintNo) {
      return;
    }

    if (!complaintRecords.length) {
      return;
    }

    const complaint = complaintRecords.find(
      (record) => String(record.docId) === String(data.complaintNo),
    );

    if (complaint?.supplierId) {
      loadItemsBySupplier(complaint.supplierId);
    }
  }, [isEditMode, data?.complaintNo, complaintRecords, loadItemsBySupplier]);

  useEffect(() => {
    if (isEditMode || !orgId) {
      return;
    }

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await supplierResponseAPI.getSupplierResponseEntryDocId(
          header.financialYear,
          orgId,
        );

        if (!cancelled) {
          setHeader((prev) => ({
            ...prev,
            docNo: docId || "",
          }));
        }
      } catch (error) {
        // no-op
      } finally {
        if (!cancelled) {
          setGeneratingDocId(false);
        }
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, orgId]);

  const handleHeaderChange = async (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "complaintNo") {
      const complaint = complaintRecords.find(
        (c) => String(c.docId) === String(value),
      );

      if (!complaint) {
        setItemOptions([]);
        return;
      }

      const supplierId = complaint.supplierId;

      setHeader((prev) => ({
        ...prev,
        complaintNo: complaint.docId || "",
        complaintDate: complaint.docDate ? fmtDate(complaint.docDate) : "",
        productNo: complaint.productNo || "",
        productName: complaint.productName || "",
        supplierNo: complaint.supplierNo || "",
        supplierName: complaint.supplierName || "",
      }));

      setDetailRows([emptyDetailRow()]);

      if (supplierId) {
        await loadItemsBySupplier(supplierId);
      } else {
        setItemOptions([]);
      }

      return;
    }

    setHeader((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCellChange = (idx, key, value) => {
    setDetailRows((previous) =>
      previous.map((row, i) => {
        if (i !== idx) {
          return row;
        }

        const next = {
          ...row,
          [key]: value,
        };

        if (key === "item") {
          const selectedItem = itemOptions.find(
            (item) => String(item.value) === String(value),
          );

          next.itemDescription = selectedItem?.itemDescription || "";
        }

        return next;
      }),
    );

    const errorKey = `detail.${idx}.${key}`;

    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }

    if (fieldErrors.responseDetails) {
      setFieldErrors((prev) => ({
        ...prev,
        responseDetails: "",
      }));
    }
  };

  const handleAddRow = () => {
    setDetailRows((prev) => [...prev, emptyDetailRow()]);
  };

  const handleRemoveRow = (idx) => {
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;

    setSummary((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};

    if (!header.complaintNo) {
      errors.complaintNo = "Complaint No is required";
    }

    if (!header.complaintDate) {
      errors.complaintDate = "Complaint Date is required";
    }

    if (!header.supplierNo?.trim()) {
      errors.supplierNo = "Supplier No is required";
    }

    if (!header.supplierName?.trim()) {
      errors.supplierName = "Supplier Name is required";
    }

    const validRows = detailRows.filter(
      (r) => r.item && r.qty !== "" && r.responseQty !== "",
    );

    if (!validRows.length) {
      errors.responseDetails = "Add at least one response detail";
    }

    detailRows.forEach((r, i) => {
      if (!r.item) {
        errors[`detail.${i}.item`] = "Part No is required";
      }

      if (r.qty === "" || r.qty === null || r.qty === undefined) {
        errors[`detail.${i}.qty`] = "Qty is required";
      }

      if (
        r.responseQty === "" ||
        r.responseQty === null ||
        r.responseQty === undefined
      ) {
        errors[`detail.${i}.responseQty`] = "Response Qty is required";
      }

      if (!r.reason?.trim()) {
        errors[`detail.${i}.reason`] = "Reason is required";
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const supplierResponseEntryDetailsDTO = detailRows
      .filter((r) => r.item)
      .map((r) => ({
        item: Number(r.item),
        qty: Number(r.qty) || 0,
        responseQty: Number(r.responseQty) || 0,
        reason: r.reason || "",
      }));

    const payload = {
      ...(isEditMode
        ? {
            id: data.id,
          }
        : {}),
      active: isEditMode ? data?.active !== false : true,
      cancelRemarks: summary.cancelRemarks || "",
      complaintDate: header.complaintDate,
      complaintNo: header.complaintNo,
      createdBy: (isEditMode ? data?.createdBy : usersId) || "SYSTEM",
      financialYear: header.financialYear,
      orgId,
      productName: header.productName,
      productNo: header.productNo,
      remarks: summary.remarks || "",
      supplierName: header.supplierName,
      supplierNo: header.supplierNo,
      supplierResponseEntryDetailsDTO,
    };

    try {
      const response =
        await supplierResponseAPI.createUpdateSupplierResponse(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isEditMode
              ? "Supplier Response updated successfully!"
              : "Supplier Response created successfully!"),
        );

        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Supplier Response.",
        );
      }
    } catch (error) {
      const backendData = error?.response?.data || error;

      addToast(
        backendData?.message ||
          backendData?.error ||
          backendData?.errors?.[0]?.shortMessage ||
          "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((tab) => tab.key === activeChildTab);

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Supplier Response" : "Add Supplier Response"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Response Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              label="Doc No"
              name="docNo"
              value={generatingDocId ? "Generating..." : header.docNo}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="Complaint No"
              name="complaintNo"
              value={header.complaintNo}
              onChange={handleHeaderChange}
              error={fieldErrors.complaintNo}
              options={complaintOptions}
              required
            />

            <Field
              type="date"
              label="Complaint Date"
              name="complaintDate"
              value={header.complaintDate}
              onChange={handleHeaderChange}
              error={fieldErrors.complaintDate}
              required
            />

            <Field
              label="Product No"
              name="productNo"
              value={header.productNo}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              label="Product Name"
              name="productName"
              value={header.productName}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              label="Supplier No"
              name="supplierNo"
              value={header.supplierNo}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierNo}
              disabled
            />

            <Field
              label="Supplier Name"
              name="supplierName"
              value={header.supplierName}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierName}
              disabled
            />

            <Field
              label="Financial Year"
              name="financialYear"
              value={header.financialYear}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        <section className="mt-0">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t ${
                    activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta?.kind === "table" && (
              <button
                type="button"
                onClick={handleAddRow}
                disabled={!header.complaintNo || loadingItems}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeChildTab === "responseDetails" && (
            <div className="pt-3">
              {loadingItems && (
                <p className="text-[11px] text-blue-500 mb-2">
                  Loading items...
                </p>
              )}

              {!header.complaintNo && (
                <p className="text-[11px] text-gray-500 mb-2">
                  Select Complaint No to load Part No.
                </p>
              )}

              {header.complaintNo &&
                !loadingItems &&
                itemOptions.length === 0 && (
                  <p className="text-[11px] text-gray-500 mb-2">
                    No items found for selected supplier.
                  </p>
                )}

              <DynamicTable
                columns={[
                  {
                    key: "item",
                    label: "Part No",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Part Name",
                    type: "text",
                    readOnly: true,
                  },
                  {
                    key: "qty",
                    label: "Qty",
                    type: "number",
                  },
                  {
                    key: "responseQty",
                    label: "Response Qty",
                    type: "number",
                  },
                  {
                    key: "reason",
                    label: "Reason",
                    type: "textarea",
                  },
                ]}
                rows={detailRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
                fieldErrors={fieldErrors}
              />

              {fieldErrors.responseDetails && (
                <p className="text-[11px] text-red-500 mt-1">
                  {fieldErrors.responseDetails}
                </p>
              )}
            </div>
          )}

          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                  className="col-span-full"
                />

                <Field
                  type="textarea"
                  label="Cancel Remarks"
                  name="cancelRemarks"
                  value={summary.cancelRemarks}
                  onChange={handleSummaryChange}
                  className="col-span-full"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <FormButtons
        onCancel={onBack}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        saveLabel={isEditMode ? "Update" : "Save"}
      />
    </div>
  );
};

export default SupplierResponseForm;
