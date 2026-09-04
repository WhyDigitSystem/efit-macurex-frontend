import { ArrowLeft, Save, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import jobOrderAmendmentAPI from "../../../api/SubContract/jobOrderAmendmentAPI";
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

/* ----------------------------------------------------------------------------
   Shared building blocks
---------------------------------------------------------------------------- */

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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
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
        value={value ?? ""}
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
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ----------------------------------------------------------------------------
   Line items table (read-only item/unit, editable qty)
---------------------------------------------------------------------------- */

const ItemDetailsTable = ({ rows, onQtyChange }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">
      <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th className="p-2 w-8 text-center dark:text-white">#</th>
          <th className="p-2 text-left dark:text-white">Item Code</th>
          <th className="p-2 text-left dark:text-white">Item Description</th>
          <th className="p-2 text-left dark:text-white">Unit</th>
          <th className="p-2 text-left dark:text-white">Old Qty</th>
          <th className="p-2 text-left dark:text-white">New Qty</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="p-3 text-center text-gray-400 dark:text-gray-500"
            >
              Select a Job Order No to load its line items
            </td>
          </tr>
        )}

        {rows.map((row, idx) => (
          <tr
            key={row.item ?? idx}
            className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td className="p-2 text-center font-medium dark:text-white">
              {idx + 1}
            </td>

            <td className="p-2 align-top">
              <input
                type="text"
                value={row.itemCode || ""}
                readOnly
                className={cellReadOnlyClasses}
              />
            </td>

            <td className="p-2 align-top">
              <input
                type="text"
                value={row.itemDescription || ""}
                readOnly
                className={cellReadOnlyClasses}
              />
            </td>

            <td className="p-2 align-top">
              <input
                type="text"
                value={row.unitDescription || ""}
                readOnly
                className={cellReadOnlyClasses}
              />
            </td>

            <td className="p-2 align-top">
              <input
                type="number"
                value={row.oldQty}
                onChange={(e) => onQtyChange(idx, "oldQty", e.target.value)}
                className={cellInputClasses}
              />
            </td>

            <td className="p-2 align-top">
              <input
                type="number"
                value={row.newQty}
                onChange={(e) => onQtyChange(idx, "newQty", e.target.value)}
                className={cellInputClasses}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ----------------------------------------------------------------------------
   Options / helpers
---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "jobOrderDetails", label: "Job Order Details" },
  { key: "jobOrderSummary", label: "Job Order Summary" },
];

const emptySummary = () => ({
  oldDeliveryDate: "",
  newDeliveryDate: "",
  remarks: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getFinancialYear = () => {
  const stored =
    localStorage.getItem("finYear") || localStorage.getItem("financialYear");

  if (stored) {
    return String(stored).trim();
  }

  return String(new Date().getFullYear());
};

const toNumberOrEmpty = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const num = Number(value);

  return Number.isNaN(num) ? "" : num;
};

/* ================================================================
   FIELD EXTRACTION HELPERS FOR THE EDIT-MODE GET RESPONSE

   getJobOrderAmendmentById's exact shape wasn't in the swagger doc
   shared (only the create/update DTO was), so — same as the Tool
   Master form — these handle both "customer"/"item"/"unit" coming
   back as a nested object (e.g. { id, customerName }) or as a flat
   numeric id, so the form doesn't break either way.
================================================================ */

const getEntityId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return value.id ?? value.customerId ?? value.itemId ?? value.unitId ?? "";
  }
  return value;
};

const getEntityField = (value, ...keys) => {
  if (value && typeof value === "object") {
    for (const key of keys) {
      if (value[key]) return value[key];
    }
  }
  return "";
};

/* ==============================================================================
   COMPONENT
============================================================================== */

const JobOrderAmendmentForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("jobOrderDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ==========================================================================
     MASTER DATA
  ========================================================================== */

  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerMap, setCustomerMap] = useState({});

  const [jobOrderOptions, setJobOrderOptions] = useState([]);
  const [jobOrderMap, setJobOrderMap] = useState({});

  /* ==========================================================================
     FORM STATE
  ========================================================================== */

  const [header, setHeader] = useState(() => ({
    partyId: "",
    partyName: "",
    jobOrderNo: "",
    jobOrderDate: "",
    docId: "",
    docDate: todayStr(),
    revisionNo: "",
    active: true,
  }));

  const [itemDetailRows, setItemDetailRows] = useState([]);

  const [summary, setSummary] = useState(emptySummary());

  /* ==========================================================================
     STEP 1 — LOAD CUSTOMERS (Party Id / Party Name)

     API: jobOrderAmendmentAPI.getCustomerForSupplierRateContract(branch, orgId)
  ========================================================================== */

  const loadCustomers = useCallback(async () => {
    if (!orgId || !branch) {
      setCustomerOptions([]);
      setCustomerMap({});
      return;
    }

    try {
      const customers =
        await jobOrderAmendmentAPI.getCustomerForSupplierRateContract(
          branch,
          orgId,
        );

      const map = {};

      const options = customers
        .map((c) => {
          const id = c.customerId ?? c.id ?? "";

          map[id] = c;

          return {
            value: id,
            label: c.customerName || c.customerCode || String(id),
          };
        })
        .filter((opt) => opt.value !== "");

      setCustomerOptions(options);
      setCustomerMap(map);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomerOptions([]);
      setCustomerMap({});
    }
  }, [orgId, branch]);

  /* ==========================================================================
     DOC ID (informational only — not part of the save payload)

     API: jobOrderAmendmentAPI.getJobOrderAmendmentDocId(financialYear, orgId)
  ========================================================================== */

  const loadDocId = useCallback(async () => {
    if (!orgId || data?.id) {
      // Skip for edit mode — the doc id already exists on the record.
      return;
    }

    try {
      const docId = await jobOrderAmendmentAPI.getJobOrderAmendmentDocId(
        getFinancialYear(),
        orgId,
      );

      setHeader((prev) => ({ ...prev, docId }));
    } catch (error) {
      console.error("Failed to load job order amendment doc id:", error);
    }
  }, [orgId, data?.id]);

  useEffect(() => {
    loadCustomers();
    loadDocId();
  }, [loadCustomers, loadDocId]);

  /* ==========================================================================
     STEP 2 — LOAD JOB ORDER NO / DATE FOR SELECTED CUSTOMER

     API: jobOrderAmendmentAPI.getJobOrderNoAndDateForJobOrderAmd(
            branch, customer, orgId)
  ========================================================================== */

  const loadJobOrdersForCustomer = useCallback(
    async (customerId) => {
      if (!orgId || !branch || !customerId) {
        setJobOrderOptions([]);
        setJobOrderMap({});
        return;
      }

      try {
        const jobOrders =
          await jobOrderAmendmentAPI.getJobOrderNoAndDateForJobOrderAmd(
            branch,
            customerId,
            orgId,
          );

        const map = {};

        const options = jobOrders
          .map((jo) => {
            map[jo.jobOrderNo] = jo;

            return {
              value: jo.jobOrderNo,
              label: jo.jobOrderNo,
            };
          })
          .filter((opt) => opt.value);

        setJobOrderOptions(options);
        setJobOrderMap(map);
      } catch (error) {
        console.error("Failed to load job orders for customer:", error);
        setJobOrderOptions([]);
        setJobOrderMap({});
      }
    },
    [orgId, branch],
  );

  /* ==========================================================================
     STEP 3 + 4 — REVISION NO & LINE ITEMS FOR SELECTED JOB ORDER

     APIs:
       jobOrderAmendmentAPI.getNextRevisionNoForJobOrderAmd(
         branch, jobOrderNo, orgId)
       jobOrderAmendmentAPI.getJobOrderItemDetailsForJobOrderAmd(
         branch, customer, jobOrderNo, orgId)
  ========================================================================== */

  const loadRevisionAndItems = useCallback(
    async (jobOrderNo, customerId) => {
      if (!orgId || !branch || !jobOrderNo || !customerId) {
        return;
      }

      try {
        const revisionNo =
          await jobOrderAmendmentAPI.getNextRevisionNoForJobOrderAmd(
            branch,
            jobOrderNo,
            orgId,
          );

        setHeader((prev) => ({ ...prev, revisionNo }));
      } catch (error) {
        console.error("Failed to load next revision no:", error);
      }

      try {
        const items =
          await jobOrderAmendmentAPI.getJobOrderItemDetailsForJobOrderAmd(
            branch,
            customerId,
            jobOrderNo,
            orgId,
          );

        const rows = items.map((row) => ({
          item: row.item,
          itemCode: row.itemCode || "",
          itemDescription: row.itemDescription || "",
          unit: row.unit,
          unitDescription: row.unitDescription || "",
          oldQty: toNumberOrEmpty(row.oldQty ?? row.qty ?? row.orderQty ?? ""),
          newQty: toNumberOrEmpty(row.oldQty ?? row.qty ?? row.orderQty ?? ""),
        }));

        setItemDetailRows(rows);

        // Old Delivery Date comes from the item-level deliveryDate;
        // all lines on one job order share the same delivery date.
        const deliveryDate = items[0]?.deliveryDate || "";

        setSummary((prev) => ({
          ...prev,
          oldDeliveryDate: deliveryDate,
        }));
      } catch (error) {
        console.error("Failed to load job order item details:", error);
        setItemDetailRows([]);
      }
    },
    [orgId, branch],
  );

  /* ==========================================================================
     EDIT MODE — FETCH FULL RECORD BY ID

     Master passes just { id } for edit; this loads the full DTO via
     getJobOrderAmendmentById, populates the form, then re-runs the
     Job Order dropdown load for that customer so the header stays
     interactive after loading.
  ========================================================================== */

  const fetchAmendmentData = useCallback(
    async (id) => {
      setIsLoading(true);

      try {
        const response =
          await jobOrderAmendmentAPI.getJobOrderAmendmentById(id);

        const apiData =
          response?.paramObjectsMap?.jobOrderAmendmentVO ||
          response?.paramObjectsMap?.jobOrderAmendment ||
          response?.paramObjectsMap ||
          response;

        if (!apiData || response?.status === false) {
          addToast("Job Order Amendment data not found");
          return;
        }

        const partyId = getEntityId(apiData.customer ?? apiData.partyId);

        setHeader({
          partyId,
          partyName:
            apiData.partyName ||
            getEntityField(apiData.customer, "customerName", "name"),
          jobOrderNo: apiData.jobOrderNo || "",
          jobOrderDate: apiData.jobOrderDate || "",
          docId: apiData.docId || "",
          docDate: apiData.docDate || todayStr(),
          revisionNo: apiData.revisionNo ?? "",
          active: apiData.active !== false,
        });

        const details = Array.isArray(apiData.jobOrderAmendmentDetails)
          ? apiData.jobOrderAmendmentDetails
          : [];

        setItemDetailRows(
          details.map((row) => ({
            item: getEntityId(row.item),
            itemCode: getEntityField(row.item, "itemCode"),
            itemDescription: getEntityField(row.item, "itemDescription"),
            unit: getEntityId(row.unit),
            unitDescription: getEntityField(
              row.unit,
              "unitDescription",
              "unitId",
            ),
            oldQty: toNumberOrEmpty(row.oldQty),
            newQty: toNumberOrEmpty(row.newQty),
          })),
        );

        setSummary({
          oldDeliveryDate: apiData.oldDeliveryDate || "",
          newDeliveryDate: apiData.newDeliveryDate || "",
          remarks: apiData.remarks || "",
        });

        // Repopulate the Job Order No dropdown for this customer so
        // the header select stays usable after loading existing data.
        if (partyId) {
          loadJobOrdersForCustomer(partyId);
        }
      } catch (error) {
        console.error("Error fetching job order amendment:", error);

        addToast(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load Job Order Amendment for editing",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, loadJobOrdersForCustomer],
  );

  useEffect(() => {
    if (data?.id) {
      fetchAmendmentData(data.id);
    }
  }, [data, fetchAmendmentData]);

  /* ==========================================================================
     CHANGE HANDLERS
  ========================================================================== */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "partyId") {
      const customer = customerMap[value];

      setHeader((prev) => ({
        ...prev,
        partyId: value,
        partyName: customer?.customerName || "",
        jobOrderNo: "",
        jobOrderDate: "",
        revisionNo: "",
      }));

      setItemDetailRows([]);
      setSummary(emptySummary());
      setJobOrderOptions([]);
      setJobOrderMap({});

      loadJobOrdersForCustomer(value);

      return;
    }

    if (name === "jobOrderNo") {
      const jobOrder = jobOrderMap[value];

      setHeader((prev) => ({
        ...prev,
        jobOrderNo: value,
        jobOrderDate: jobOrder?.jobOrderDate || "",
        revisionNo: "",
      }));

      setItemDetailRows([]);

      if (value) {
        loadRevisionAndItems(value, header.partyId);
      }

      return;
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleQtyChange = (idx, field, value) => {
    setItemDetailRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: toNumberOrEmpty(value) } : row,
      ),
    );
  };

  /* ==========================================================================
     VALIDATION
  ========================================================================== */

  const validate = () => {
    const errors = {};

    if (!header.partyId) errors.partyId = "Party Id is required";
    if (!header.jobOrderNo) errors.jobOrderNo = "Job Order No is required";
    if (!header.jobOrderDate)
      errors.jobOrderDate = "Job Order Date is required";
    if (header.revisionNo === "" || header.revisionNo === null)
      errors.revisionNo = "Revision No is required";

    const hasValidRow = itemDetailRows.some(
      (r) => r.item && Number(r.newQty) > 0,
    );

    if (!hasValidRow) {
      errors.itemDetails =
        "At least one line item must have a New Qty greater than 0";
    }

    if (
      summary.oldDeliveryDate &&
      summary.newDeliveryDate &&
      summary.newDeliveryDate < summary.oldDeliveryDate
    ) {
      errors.newDeliveryDate =
        "New Delivery Date cannot be before Old Delivery Date";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ==========================================================================
     BUILD PAYLOAD

     MATCHES SWAGGER: PUT /api/subContract/createUpdateJobOrderAmendment

     {
       active, branch, cancelRemarks, createdBy, customer,
       financialYear, id, jobOrderAmendmentDetails: [{ item, newQty,
       oldQty, unit }], jobOrderDate, jobOrderNo, newDeliveryDate,
       oldDeliveryDate, orgId, remarks, revisionNo
     }

     IMPORTANT: do not add docId, docDate, partyName, itemCode, etc.
     to this object — none of them exist in the schema above and
     sending extras (or omitting a required key) is what causes the
     backend to reject the request.
  ========================================================================== */

  const buildPayload = () => {
    const isUpdate = Boolean(data?.id);

    return {
      active: Boolean(header.active),

      branch,

      cancelRemarks: "",

      createdBy:
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("usersId") ||
        "",

      customer: Number(header.partyId),

      financialYear: getFinancialYear(),

      // Only send id on update — omit it entirely for create so the
      // backend doesn't mistake this for an update-of-record-0.
      ...(isUpdate ? { id: Number(data.id) } : {}),

      jobOrderAmendmentDetails: itemDetailRows
        .filter((row) => row.item)
        .map((row) => ({
          item: Number(row.item),
          newQty: Number(row.newQty) || 0,
          oldQty: Number(row.oldQty) || 0,
          unit: Number(row.unit),
        })),

      jobOrderDate: header.jobOrderDate,

      jobOrderNo: header.jobOrderNo,

      newDeliveryDate: summary.newDeliveryDate || null,

      oldDeliveryDate: summary.oldDeliveryDate || null,

      orgId,

      remarks: summary.remarks || "",

      revisionNo: String(header.revisionNo ?? ""),
    };
  };

  /* ==========================================================================
     SAVE
  ========================================================================== */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      console.log(
        "================ JOB ORDER AMENDMENT PAYLOAD ================",
      );
      console.log(JSON.stringify(payload, null, 2));
      console.log(
        "===============================================================",
      );

      const response =
        await jobOrderAmendmentAPI.createUpdateJobOrderAmendment(payload);

      const success =
        response?.status === true ||
        String(response?.statusFlag).toLowerCase() === "ok";

      if (success) {
        addToast(
          response?.paramObjectsMap?.message ||
            (data?.id
              ? "Job Order Amendment updated successfully!"
              : "Job Order Amendment created successfully!"),
        );

        onBack?.();

        return;
      }

      addToast(
        response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to save Job Order Amendment.",
      );
    } catch (error) {
      console.error("Save Job Order Amendment Error:", error);

      const backendErrors = error?.response?.data?.errors;

      const backendErrorText =
        Array.isArray(backendErrors) && backendErrors.length
          ? backendErrors
              .map(
                (e) =>
                  e?.longMessage ||
                  e?.shortMessage ||
                  e?.logMessage ||
                  e?.errorCode ||
                  "",
              )
              .filter(Boolean)
              .join("; ")
          : "";

      addToast(
        backendErrorText ||
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (isLoading) {
    return (
      <div className="w-full p-2 relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading Job Order Amendment data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full p-2">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Job Order Amendment" : "Add Job Order Amendment"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ==================================================================
           HEADER
        ================================================================== */}

        <div>
          <SectionHeader>Job Order Amendment</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Party Id"
              name="partyId"
              value={header.partyId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyId}
              options={customerOptions}
              required
            />

            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
              onChange={() => {}}
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
              disabled={!header.partyId}
              required
            />

            <Field
              type="date"
              label="Job Order Date"
              name="jobOrderDate"
              value={header.jobOrderDate}
              onChange={() => {}}
              error={fieldErrors.jobOrderDate}
              disabled
              required
            />

            <Field
              label="Doc Id"
              name="docId"
              value={header.docId}
              onChange={() => {}}
              disabled
            />

            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={() => {}}
              disabled
            />

            <Field
              label="Revision No"
              name="revisionNo"
              value={header.revisionNo}
              onChange={() => {}}
              error={fieldErrors.revisionNo}
              disabled
              required
            />
          </div>
        </div>

        {/* ==================================================================
           TABS
        ================================================================== */}

        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-0">
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
          </div>

          {activeChildTab === "jobOrderDetails" && (
            <div className="pt-3">
              <ItemDetailsTable
                rows={itemDetailRows}
                onQtyChange={handleQtyChange}
              />

              {fieldErrors.itemDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.itemDetails}
                </p>
              )}
            </div>
          )}

          {activeChildTab === "jobOrderSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="date"
                  label="Old Delivery Date"
                  name="oldDeliveryDate"
                  value={summary.oldDeliveryDate}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  type="date"
                  label="New Delivery Date"
                  name="newDeliveryDate"
                  value={summary.newDeliveryDate}
                  onChange={handleSummaryChange}
                  error={fieldErrors.newDeliveryDate}
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

export default JobOrderAmendmentForm;
