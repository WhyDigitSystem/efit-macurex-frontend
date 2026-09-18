import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import jobOrderShortCloseAPI from "../../../api/jobOrderShortCloseAPI";
import { useToast } from "../../Toast/ToastContext";

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

const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

/* ==========================================================================
   FIELD
========================================================================== */

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
            "w-full h-[30px] px-2 rounded border text-xs leading-none " +
            "transition-colors resize-none pt-1 scrollbar-hide " +
            "bg-white dark:bg-gray-900 " +
            `${
              error ? controlErrClasses : "border-gray-300 dark:border-gray-600"
            } ` +
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

/* ==========================================================================
   SECTION HEADER
========================================================================== */

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

/* ==========================================================================
   FORM BUTTONS
========================================================================== */

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

/* ==========================================================================
   TABLE
========================================================================== */

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

/* ==========================================================================
   EMPTY DETAIL ROW

   IMPORTANT:
   No id is required for a new detail row.
   If editing an existing row, the existing id is populated from API data.
========================================================================== */

const emptyDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  orderQty: "",
  suppliedQty: "",
  pendingQty: "",
  requiredQty: "",
  shortCloseQty: "",
});

/* ==========================================================================
   HELPERS
========================================================================== */

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toNum = (n) => (Number.isNaN(Number(n)) ? 0 : Number(n));

const toInt = (n) => {
  const parsed = parseInt(n, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

/* ==========================================================================
   MAIN COMPONENT
========================================================================== */

const JobOrderShortCloseForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);

  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);

  const { addToast } = useToast();

  const financialYear = String(new Date().getFullYear());

  /*
   * TRUE only when Edit button supplied an existing record.
   *
   * Create:
   *   data = undefined/null
   *   isEditMode = false
   *
   * Edit:
   *   data.id = existing database id
   *   isEditMode = true
   */
  const isEditMode = Boolean(data?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [customerOptions, setCustomerOptions] = useState([]);

  const [jobOrderOptions, setJobOrderOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  const [itemMasterMap, setItemMasterMap] = useState({});

  /* ==========================================================================
     HEADER
  ========================================================================== */

  const [header, setHeader] = useState(() => ({
    customerId: data?.customerId ?? data?.customer?.customerId ?? "",

    customerName: data?.customerName ?? data?.customer?.customerName ?? "",

    jobOrderNo: data?.jobOrderNo || "",

    grnNo: data?.grnNo ?? data?.customer?.gstNo ?? "",

    shortCloseNo: data?.shortCloseNo ?? data?.docId ?? "",

    date: data?.date ?? data?.docDate ?? todayStr(),

    referenceForSc: data?.referenceForSc ?? data?.referenceForSC ?? "",

    cancelRemarks: data?.cancelRemarks || "",

    active: data?.active !== false,
  }));

  /* ==========================================================================
     DETAIL ROWS

     Existing detail:
       id is retained.

     New detail:
       no id property is created.
  ========================================================================== */

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.jobOrderShortCloseDetails || data?.shortCloseDetails;

    if (!raw?.length) {
      return [emptyDetailRow()];
    }

    return raw.map((d) => {
      const row = {
        itemCode: d.item?.id ?? d.item ?? "",

        itemDescription: d.item?.itemDescription ?? d.itemDescription ?? "",

        orderQty: d.orderQty ?? "",
        suppliedQty: d.suppliedQty ?? "",
        pendingQty: d.pendingQty ?? "",
        requiredQty: d.requiredQty ?? "",
        shortCloseQty: d.shortCloseQty ?? "",
      };

      /*
       * Only add id when the backend supplied an existing detail id.
       */
      if (d.id) {
        row.id = d.id;
      }

      return row;
    });
  });

  /* ==========================================================================
     LOAD CUSTOMERS
  ========================================================================== */

  const loadCustomers = useCallback(async () => {
    try {
      const list =
        await jobOrderShortCloseAPI.getCustomerForSupplierRateContract(
          branch,
          orgId,
        );

      setCustomerOptions(
        (list || []).map((c) => ({
          value: c.customerId,
          label: c.customerCode || String(c.customerId),
          customerName: c.customerName || "",
          gstNo: c.gstNo || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load customer options:", error);

      setCustomerOptions([]);
    }
  }, [orgId, branch]);

  /* ==========================================================================
     LOAD JOB ORDERS

     Backend response:
       paramObjectsMap.jobOrderList
  ========================================================================== */

  const loadJobOrders = useCallback(
    async (customerId) => {
      if (!customerId) {
        setJobOrderOptions([]);
        return;
      }

      try {
        const list =
          await jobOrderShortCloseAPI.getJobOrderNoAndDateForJobOrderAmd(
            branch,
            customerId,
            orgId,
          );

        console.log("Job Order list:", list);

        setJobOrderOptions(
          (list || []).map((jo) => ({
            value: jo.jobOrderNo,
            label: jo.jobOrderNo,
          })),
        );
      } catch (error) {
        console.error("Failed to load job order options:", error);

        setJobOrderOptions([]);
      }
    },
    [orgId, branch],
  );

  /* ==========================================================================
     LOAD ITEMS
  ========================================================================== */

  const loadItems = useCallback(
    async (customerId, jobOrderNo) => {
      if (!customerId || !jobOrderNo) {
        setItemOptions([]);
        setItemMasterMap({});
        return;
      }

      try {
        const list =
          await jobOrderShortCloseAPI.getJobOrderItemDetailsForJobOrderAmd(
            branch,
            customerId,
            jobOrderNo,
            orgId,
          );

        const map = {};

        const options = (list || []).map((it) => {
          map[it.item] = it;

          return {
            value: it.item,
            label: it.itemCode,
          };
        });

        setItemOptions(options);
        setItemMasterMap(map);
      } catch (error) {
        console.error("Failed to load item options:", error);

        setItemOptions([]);
        setItemMasterMap({});
      }
    },
    [orgId, branch],
  );

  /* ==========================================================================
     INITIAL CUSTOMER LOAD
  ========================================================================== */

  useEffect(() => {
    if (orgId && branch) {
      loadCustomers();
    }
  }, [orgId, branch, loadCustomers]);

  /* ==========================================================================
     RELOAD JOB ORDERS WHEN CUSTOMER CHANGES

     This also handles Edit mode because header.customerId
     is initialized from the existing record.
  ========================================================================== */

  useEffect(() => {
    if (header.customerId) {
      loadJobOrders(header.customerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.customerId]);

  /* ==========================================================================
     RELOAD ITEMS
  ========================================================================== */

  useEffect(() => {
    if (header.customerId && header.jobOrderNo) {
      loadItems(header.customerId, header.jobOrderNo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.customerId, header.jobOrderNo]);

  /* ==========================================================================
     AUTO-GENERATE SHORT CLOSE NO

     IMPORTANT:
     This happens ONLY during CREATE.

     Edit mode:
       No new document number is generated.
       Existing document number stays as it is.
  ========================================================================== */

  useEffect(() => {
    if (isEditMode || !orgId) {
      return;
    }

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await jobOrderShortCloseAPI.getJobOrderShortCloseDocId(
          financialYear,
          orgId,
        );

        if (!cancelled) {
          setHeader((prev) => ({
            ...prev,
            shortCloseNo: docId || "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating Short Close No:", error);

          addToast("Failed to generate Short Close No", "error");
        }
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

  /* ==========================================================================
     HEADER CHANGE
  ========================================================================== */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setHeader((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      /* Customer changed */
      if (name === "customerId") {
        const customer = customerOptions.find(
          (c) => String(c.value) === String(value),
        );

        next.customerName = customer?.customerName || "";

        next.grnNo = customer?.gstNo || "";

        next.jobOrderNo = "";

        setDetailRows([emptyDetailRow()]);
      }

      /* Job Order changed */
      if (name === "jobOrderNo") {
        setDetailRows([emptyDetailRow()]);
      }

      return next;
    });
  };

  /* ==========================================================================
     COMPUTE PENDING QTY
  ========================================================================== */

  const computeRows = (current) =>
    current.map((row) => {
      const orderQty = toNum(row.orderQty);

      const suppliedQty = toNum(row.suppliedQty);

      return {
        ...row,
        pendingQty: (orderQty - suppliedQty).toFixed(2),
      };
    });

  /* ==========================================================================
     DETAIL CELL CHANGE
  ========================================================================== */

  const handleCellChange = async (idx, key, value) => {
    let next = detailRows.map((row, i) =>
      i === idx
        ? {
            ...row,
            [key]: value,
          }
        : row,
    );

    if (key === "itemCode") {
      const item = itemMasterMap[value];

      next = next.map((row, i) =>
        i === idx
          ? {
              ...row,
              itemDescription: item?.itemDescription || "",
            }
          : row,
      );
    }

    next = computeRows(next);

    setDetailRows(next);

    /* Fetch supplied qty */
    if (key === "itemCode" && value && header.jobOrderNo) {
      try {
        const issueQty =
          await jobOrderShortCloseAPI.getTotalSuppliedQtyforJobOrderClose(
            branch,
            value,
            header.jobOrderNo,
            orgId,
          );

        setDetailRows((prev) =>
          computeRows(
            prev.map((row, i) =>
              i === idx
                ? {
                    ...row,
                    suppliedQty: issueQty,
                  }
                : row,
            ),
          ),
        );
      } catch (error) {
        console.error("Failed to fetch supplied qty:", error);
      }
    }
  };

  /* ==========================================================================
     ADD / REMOVE ROW
  ========================================================================== */

  const handleAddRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);

  const handleRemoveRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ==========================================================================
     VALIDATION
  ========================================================================== */

  const validate = () => {
    const errors = {};

    if (!header.customerId) {
      errors.customerId = "Customer Id is required";
    }

    if (!header.jobOrderNo) {
      errors.jobOrderNo = "Job Order No is required";
    }

    if (!header.shortCloseNo?.trim()) {
      errors.shortCloseNo = "Short Close No is required";
    }

    if (!header.date) {
      errors.date = "Date is required";
    }

    const hasValidRow = detailRows.some(
      (r) => r.itemCode && toNum(r.shortCloseQty) > 0,
    );

    if (!hasValidRow) {
      errors.shortCloseDetails =
        "Add at least one item with an Item Code and a Short Close Qty greater than 0";
    }

    if (!header.referenceForSc?.trim()) {
      errors.referenceForSc = "Reference For SC is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ==========================================================================
     SAVE

     IMPORTANT ID RULE:

     CREATE:
       No top-level id
       No detail id

     EDIT:
       Top-level existing id
       Existing detail ids

     Newly added detail during EDIT:
       No id
  ========================================================================== */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      /*
       * CREATE:
       *   id is completely omitted.
       *
       * EDIT:
       *   existing database id is sent.
       */
      ...(isUpdate
        ? {
            id: data.id,
          }
        : {}),

      active: header.active,

      branch: toInt(branch),

      cancelRemarks: header.cancelRemarks || "",

      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),

      customer: toInt(header.customerId),

      financialYear,

      jobOrderNo: header.jobOrderNo || "",

      jobOrderShortCloseDetails: detailRows
        .filter((r) => r.itemCode)
        .map((r) => ({
          /*
           * Existing detail:
           *   send id
           *
           * New detail:
           *   don't send id
           */
          ...(r.id
            ? {
                id: r.id,
              }
            : {}),

          item: toInt(r.itemCode),

          orderQty: toNum(r.orderQty),

          pendingQty: toNum(r.pendingQty),

          requiredQty: toNum(r.requiredQty),

          shortCloseQty: toNum(r.shortCloseQty),

          suppliedQty: toNum(r.suppliedQty),
        })),

      orgId: toInt(orgId),

      referenceForSc: header.referenceForSc || "",
    };

    /*
     * Useful for checking exactly what is being sent.
     */
    console.log(
      "Job Order Short Close Save Mode:",
      isUpdate ? "EDIT" : "CREATE",
    );

    console.log(
      "Job Order Short Close Payload:",
      JSON.stringify(payload, null, 2),
    );

    try {
      const response =
        await jobOrderShortCloseAPI.createUpdateJobOrderShortClose(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Job Order Short Close updated successfully!"
              : "Job Order Short Close created successfully!"),
        );

        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Job Order Short Close.",
        );
      }
    } catch (err) {
      console.error("Save Job Order Short Close Error:", err);

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

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Job Order Short Close" : "Add Job Order Short Close"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ==================================================================
            HEADER
        ================================================================== */}

        <div>
          <SectionHeader>Job Order Short Close</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Customer Id"
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
              label="Job Order No"
              name="jobOrderNo"
              value={header.jobOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderNo}
              options={jobOrderOptions}
              disabled={!header.customerId}
              required
            />

            <Field
              label="GRN No"
              name="grnNo"
              value={header.grnNo}
              onChange={handleHeaderChange}
              disabled
            />

            <Field
              label="Short Close No"
              name="shortCloseNo"
              value={generatingDocId ? "Generating..." : header.shortCloseNo}
              onChange={() => {}}
              error={fieldErrors.shortCloseNo}
              required
              disabled
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

        {/* ==================================================================
            DETAIL
        ================================================================== */}

        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Short Close Detail</SectionHeader>

            <button
              type="button"
              onClick={handleAddRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

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
                key: "orderQty",
                label: "Order Qty",
                type: "number",
              },

              {
                key: "suppliedQty",
                label: "Supplied Qty",
                readOnly: true,
              },

              {
                key: "pendingQty",
                label: "Pending Qty",
                readOnly: true,
              },

              {
                key: "requiredQty",
                label: "Required Qty",
                type: "number",
              },

              {
                key: "shortCloseQty",
                label: "Short Close Qty",
                type: "number",
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

        {/* ==================================================================
            SUMMARY
        ================================================================== */}

        <div>
          <SectionHeader>Short Close Summary</SectionHeader>

          <div className={subTabFieldGrid}>
            <Field
              type="textarea"
              label="Reference For SC"
              name="referenceForSc"
              value={header.referenceForSc}
              onChange={handleHeaderChange}
              error={fieldErrors.referenceForSc}
              required
            />
          </div>
        </div>

        {/* ==================================================================
            BUTTONS
        ================================================================== */}

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

export default JobOrderShortCloseForm;
