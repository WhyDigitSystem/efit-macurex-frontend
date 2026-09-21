import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import processValidationEntryAPI from "../../../api/Production/processValidationEntryAPI";
import branchAPI from "../../../api/branchAPI";

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

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

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
  disabled,
  className = "",
}) => {
  if (type === "select") {
    const safeValue = value === null || value === undefined ? "" : value;
    const inOptions = (options || []).some(
      (opt) => String(opt.value ?? opt) === String(safeValue),
    );
    const showGhost = safeValue !== "" && !inOptions;

    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select
          name={name}
          value={safeValue}
          onChange={onChange}
          disabled={disabled}
          className={controlClasses}
        >
          <option value="">-- Select --</option>
          {showGhost && (
            <option value={safeValue}>{String(safeValue)}</option>
          )}
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
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
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
        className={controlClasses}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const FieldsGrid = ({
  fields,
  values,
  onChange,
  errors,
  gridClassName = fieldGrid,
}) => (
  <div className={gridClassName}>
    {fields.map((f) => (
      <Field
        key={f.name}
        type={f.type || "text"}
        label={f.label}
        name={f.name}
        value={f.auto ? values[f.name] || "Auto" : values[f.name]}
        onChange={onChange}
        options={f.options}
        disabled={f.disabled || f.auto}
        required={f.required}
        error={errors?.[f.name]}
        className={f.className}
      />
    ))}
  </div>
);

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
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const InputCell = ({ value, onChange, type = "text" }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`${cellInputClasses} ${type === "number" ? "min-w-[90px]" : "min-w-[110px]"
        }`}
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
          {columns.map((col) => (
            <InputCell
              key={col.key}
              value={row[col.key]}
              type={col.type === "number" ? "number" : "text"}
              onChange={(e) => onCellChange(idx, col.key, e.target.value)}
            />
          ))}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

const blankRowFromColumns = (columns) =>
  columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const YES_NO = ["NO", "YES"];

const VALIDATION_REASONS = [
  "Existing Process",
  "New Fixture Introduced In The process",
  "Others If Any",
  "Modification In Existing Process",
  "Change Of Location",
];

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------------------- */
/* Header fields — options injected at render time                             */

const buildHeaderFields = ({
  plantOptions,
  itemOptions,
  partyOptions,
  processSheetOptions,
  operationOptions,
  controlPlanOptions,
}) => [
    {
      name: "plant",
      label: "Plant Id",
      type: "select",
      options: plantOptions,
      required: true,
    },
    { name: "docNo", label: "Doc No.", auto: true },
    {
      name: "itemCode",
      label: "Item Code",
      type: "select",
      options: itemOptions,
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      default: todayISO(),
      required: true,
    },
    { name: "itemDescription", label: "Item Description", disabled: true },
    {
      name: "partyId",
      label: "Party Id",
      type: "select",
      options: partyOptions,
    },
    { name: "partyName", label: "Party Name", disabled: true },
    {
      name: "processSheetNo",
      label: "Process Sheet No",
      type: "select",
      options: processSheetOptions,
    },
    {
      name: "operationNo",
      label: "Operation No.",
      type: "select",
      options: operationOptions,
    },
    { name: "operationName", label: "Operation Name", disabled: true },
    {
      name: "controlPlan",
      label: "Control Plan",
      type: "select",
      options: controlPlanOptions,
    },
    {
      name: "validationReason",
      label: "Validation Reason",
      type: "select",
      options: VALIDATION_REASONS,
    },
    {
      name: "detailsOfChanges",
      label: "Details Of Changes",
      type: "textarea",
      className: "col-span-2 md:col-span-4 xl:col-span-3",
    },
    {
      name: "characteristicsToBeMeasured",
      label: "Characteristics To Be Measured",
      type: "textarea",
      className: "col-span-2 md:col-span-4 xl:col-span-3",
    },
    {
      name: "specification",
      label: "Specification",
      type: "textarea",
      className: "col-span-2 md:col-span-4 xl:col-span-6",
    },
  ];

/* ---------------------------------------------------------------------------- */
/* Child 1 - Process Vad Detail                                                */

const PROCESS_VAD_DETAIL_COLUMNS = [
  { key: "parameter1", label: "Parameter 1" },
  { key: "parameter2", label: "Parameter 2" },
  { key: "parameter3", label: "Parameter 3" },
  { key: "parameter4", label: "Parameter 4" },
  { key: "parameter5", label: "Parameter 5" },
  { key: "parameter6", label: "Parameter 6" },
  { key: "parameter7", label: "Parameter 7" },
];

/* ---------------------------------------------------------------------------- */
/* Child 2 - Process Vad Summary                                               */

const PROCESS_VAD_SUMMARY_FIELDS = [
  { name: "dateImplemented", label: "Date Implemented", type: "date" },
  {
    name: "recommendedForProduction",
    label: "Recommended For Production",
    type: "select",
    options: YES_NO,
  },
  {
    name: "dateOfNextValidation",
    label: "Date of Next Validation",
    type: "date",
  },
  {
    name: "resultsRemarks",
    label: "Results/Remarks",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

const CHILD_TABS = [
  { key: "processVadDetail", label: "Process Vad Detail", type: "table" },
  { key: "processVadSummary", label: "Process Vad Summary", type: "fields" },
];

/* ---------------------------------------------------------------------------- */

const ProcessValidationEntryForm = ({ onBack, onSave, editData }) => {
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const isEditMode = Boolean(editData?.id);
  const docIdLoadedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeChildTab, setActiveChildTab] = useState("processVadDetail");

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [processSheetOptions, setProcessSheetOptions] = useState([]);
  const [operationOptions, setOperationOptions] = useState([]);
  const [controlPlanOptions, setControlPlanOptions] = useState([]);

  /* ---------------- Lookup maps for auto-fill ---------------- */
  const itemMapRef = useRef({});       // itemId -> item object
  const partyMapRef = useRef({});      // customerId -> customer object
  const operationMapRef = useRef({});  // operationId -> operation object

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...blankFromFields(buildHeaderFields({})),
    ...(editData?.header || {}),
  }));

  const [processVadDetailRows, setProcessVadDetailRows] = useState(
    editData?.processVadDetails?.length
      ? editData.processVadDetails
      : [blankRowFromColumns(PROCESS_VAD_DETAIL_COLUMNS)],
  );

  const [processVadSummary, setProcessVadSummary] = useState({
    ...blankFromFields(PROCESS_VAD_SUMMARY_FIELDS),
    ...(editData?.processVadSummary || {}),
  });

  /* ---------------- Re-sync when editData prop changes ---------------- */
  useEffect(() => {
    if (!editData) return;

    setHeader({
      ...blankFromFields(buildHeaderFields({})),
      ...(editData.header || {}),
    });

    setProcessVadDetailRows(
      editData.processVadDetails?.length
        ? editData.processVadDetails
        : [blankRowFromColumns(PROCESS_VAD_DETAIL_COLUMNS)],
    );

    setProcessVadSummary({
      ...blankFromFields(PROCESS_VAD_SUMMARY_FIELDS),
      ...(editData.processVadSummary || {}),
    });
  }, [editData]);

  /* ---------------- Load master data ---------------- */

  useEffect(() => {
    if (!ORG_ID) return;

    // Plants
    (async () => {
      try {
        const list = await branchAPI.getBranchByOrgId(ORG_ID);
        setPlantOptions(
          (list || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || String(b.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load plants:", err);
        setPlantOptions([]);
      }
    })();

    // Items — option value = itemId (numeric), label = itemCode
    (async () => {
      try {
        const list = await processValidationEntryAPI.getItemDetails({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });

        const map = {};
        setItemOptions(
          (list || []).map((it) => {
            const value = it.itemId;
            map[value] = it;
            return {
              value,
              label: it.itemCode || String(it.itemId),
            };
          }),
        );
        itemMapRef.current = map;
      } catch (err) {
        console.error("Failed to load items:", err);
        setItemOptions([]);
      }
    })();

    // Parties (customers)
    (async () => {
      try {
        const list = await processValidationEntryAPI.getCustomerDetails({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });
        const map = {};
        setPartyOptions(
          (list || []).map((c) => {
            const value = c.customerId ?? c.customerCode;
            map[value] = c;
            return {
              value,
              label: c.customerName || c.customerCode || String(c.customerId),
            };
          }),
        );
        partyMapRef.current = map;
      } catch (err) {
        console.error("Failed to load parties:", err);
        setPartyOptions([]);
      }
    })();

    // Process Sheet Routing — process sheet options + flattened operations
    (async () => {
      try {
        const list = await processValidationEntryAPI.getProcessSheetRouting({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });

        setProcessSheetOptions(
          (list || []).map((r) => ({
            value: r.id,
            label:
              r.processSheetNo ||
              r.docId ||
              r.bomId ||
              String(r.id),
          })),
        );

        const opMap = {};
        const opOpts = [];
        (list || []).forEach((r) => {
          (r?.processSheetCompRoutingDetailResponseDTO || []).forEach((d) => {
            const opId = d?.operation?.id ?? d?.operation?.operationId;
            if (!opId) return;
            const opLabel =
              d?.operation?.operationId ||
              d?.operation?.description ||
              String(opId);
            if (!opMap[opId]) {
              opMap[opId] = d.operation;
              opOpts.push({ value: opId, label: opLabel });
            }
          });
        });
        operationMapRef.current = opMap;
        setOperationOptions(opOpts);
      } catch (err) {
        console.error("Failed to load process sheet routing:", err);
        setProcessSheetOptions([]);
        setOperationOptions([]);
      }
    })();

    // Control Plans
    (async () => {
      try {
        const list = await processValidationEntryAPI.getControlPlans({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });
        setControlPlanOptions(
          (list || []).map((cp) => ({
            value: cp.id,
            label: cp.planNo || String(cp.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load control plans:", err);
        setControlPlanOptions([]);
      }
    })();
  }, [ORG_ID, BRANCH_ID]);

  /* ---------------- Doc No auto-generation (Add mode) ---------------- */

  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!ORG_ID) return;

    let cancelled = false;

    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await processValidationEntryAPI.getDocId({
          financialYear,
          orgId: ORG_ID,
        });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, docNo: docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Doc No:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, ORG_ID]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "itemCode") {
        const it = itemMapRef.current[value];
        if (it) {
          next.itemDescription = it.itemDescription || "";
        }
      }

      if (name === "partyId") {
        const c = partyMapRef.current[value];
        if (c) {
          next.partyName = c.customerName || "";
        }
      }

      if (name === "operationNo") {
        const op = operationMapRef.current[value];
        if (op) {
          next.operationName = op.description || op.operationId || "";
        }
      }

      return next;
    });
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setProcessVadSummary((prev) => ({ ...prev, [name]: value }));
  };

  const makeTableHandlers = (setter, columns) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, blankRowFromColumns(columns)]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const processVadDetailHandlers = makeTableHandlers(
    setProcessVadDetailRows,
    PROCESS_VAD_DETAIL_COLUMNS,
  );

  const childTabConfig = {
    processVadDetail: {
      type: "table",
      rows: processVadDetailRows,
      handlers: processVadDetailHandlers,
      columns: PROCESS_VAD_DETAIL_COLUMNS,
    },
    processVadSummary: { type: "fields" },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant Id is required";
    if (!header.date) errors.date = "Date is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(editData?.id);
    const financialYear = String(new Date().getFullYear());

    const payload = {
      ...(isUpdate ? { id: editData.id } : {}),

      active: editData?.active ?? true,
      orgId: ORG_ID,
      branch: Number(header.plant) || BRANCH_ID || 0,
      financialYear,

      cancelRemarks: "",
      createdBy: isUpdate ? editData?.createdBy ?? CREATED_BY : CREATED_BY,

      date: header.date || todayISO(),
      item: Number(header.itemCode) || 0,
      customer: Number(header.partyId) || 0,
      processSheetNo: Number(header.processSheetNo) || 0,
      controlPlan: Number(header.controlPlan) || 0,

      validationReason: header.validationReason || "",
      detailsOfChanges: header.detailsOfChanges || "",
      characteristicsToBeMeasured: header.characteristicsToBeMeasured || "",
      specification: header.specification || "",

      dateImplemented: processVadSummary.dateImplemented || "",
      dateOfNextValidation: processVadSummary.dateOfNextValidation || "",
      recommendedForProduction:
        processVadSummary.recommendedForProduction || "",
      resultsRemarks: processVadSummary.resultsRemarks || "",

      details: (processVadDetailRows || []).map((r) => ({
        parameter1: r.parameter1 || "",
        parameter2: r.parameter2 || "",
        parameter3: r.parameter3 || "",
        parameter4: r.parameter4 || "",
        parameter5: r.parameter5 || "",
        parameter6: r.parameter6 || "",
        parameter7: r.parameter7 || "",
      })),
    };

    console.log("📤 Saving Process Validation Entry Payload:", payload);

    try {
      const response =
        await processValidationEntryAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Process Validation Entry updated successfully!"
            : "Process Validation Entry created successfully!"),
          "success",
        );

        if (onSave) {
          onSave({
            ...payload,
            id:
              response?.paramObjectsMap?.processValidationEntry?.id ||
              payload.id,
          });
        } else {
          onBack();
        }
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save Process Validation Entry",
          "error",
        );
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Failed to save Process Validation Entry.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Header fields (built with live options) ---------------- */

  const headerFields = buildHeaderFields({
    plantOptions,
    itemOptions,
    partyOptions,
    processSheetOptions,
    operationOptions,
    controlPlanOptions,
  });

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData
            ? "Edit Process Validation Entry"
            : "Process Validation Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Process Validation Details</SectionHeader>
          <FieldsGrid
            fields={headerFields}
            values={header}
            onChange={handleHeaderChange}
            errors={fieldErrors}
          />
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabConfig.type === "table" && (
              <button
                type="button"
                onClick={handleAddChildRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeTabConfig.type === "table" ? (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          ) : (
            <div className="pt-3">
              <FieldsGrid
                fields={PROCESS_VAD_SUMMARY_FIELDS}
                values={processVadSummary}
                onChange={handleSummaryChange}
              />
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default ProcessValidationEntryForm;