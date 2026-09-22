import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../Toast/ToastContext";
import bulkIssueIndentAPI from "../../../api/Production/bulkIssueIndentAPI";
import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import employeeAPI from "../../../api/employeeAPI";

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
          rows={4}
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
  onFieldChangeOverride = {},
}) => (
  <div className={gridClassName}>
    {fields.map((f) => (
      <Field
        key={f.name}
        type={f.type || "text"}
        label={f.label}
        name={f.name}
        value={f.auto ? values[f.name] || "Auto" : values[f.name]}
        onChange={onFieldChangeOverride[f.name] || onChange}
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

const SelectCell = ({ value, onChange, options }) => {
  const safeValue = value === null || value === undefined ? "" : value;
  const inOptions = (options || []).some(
    (opt) => String(opt.value ?? opt) === String(safeValue),
  );
  const showGhost = safeValue !== "" && !inOptions;

  return (
    <td className="p-1 align-top min-w-[220px]">
      <select value={safeValue} onChange={onChange} className={cellInputClasses}>
        <option value="">-- Select --</option>
        {showGhost && <option value={safeValue}>{String(safeValue)}</option>}
        {(options || []).map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </td>
  );
};

const InputCell = ({ value, onChange, type = "text", readOnly }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`${cellInputClasses} ${readOnly ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : ""
        } ${type === "number" ? "min-w-[90px]" : "min-w-[110px]"}`}
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
          {columns.map((col) =>
            col.type === "select" ? (
              <SelectCell
                key={col.key}
                value={row[col.key]}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                options={col.options}
              />
            ) : (
              <InputCell
                key={col.key}
                value={row[col.key]}
                readOnly={col.readOnly}
                type={
                  col.type === "number"
                    ? "number"
                    : col.type === "date"
                      ? "date"
                      : "text"
                }
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

const blankRowFromColumns = (columns) =>
  columns.reduce((acc, col) => ({ ...acc, [col.key]: "" }), {});

const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

/* ---------------------------------------------------------------------------- */
/* Static option lists                                                         */

const BELONGS_TO = ["APPLIANCES", "BOSCH"];
const YES_NO = ["No", "Yes"];

/* ---------------------------------------------------------------------------- */
/* Header fields — options injected at render time                             */

const buildHeaderFields = ({
  plantOptions,
  departmentOptions,
  fgItemOptions,
  bomOptions,
  locationOptions,
}) => [
    {
      name: "plant",
      label: "Plant",
      type: "select",
      options: plantOptions,
      required: true,
    },
    { name: "docId", label: "DocId", auto: true },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: departmentOptions,
    },
    {
      name: "docDate",
      label: "DocDate",
      type: "date",
      default: todayISO(),
      required: true,
    },
    {
      name: "belongsTo",
      label: "Belongs To",
      type: "select",
      options: BELONGS_TO,
    },
    { name: "fgDescription", label: "FG Description", disabled: true },
    {
      name: "fgSfgItemId",
      label: "FG/SFG Itemid",
      type: "select",
      options: fgItemOptions,
    },
    {
      name: "bomId",
      label: "Bom Id",
      type: "select",
      options: bomOptions,
    },
    {
      name: "timeOfIndent",
      label: "Time Of Indent",
      type: "time",
      default: nowTime(),
    },
    {
      name: "fromLocation",
      label: "From Location",
      type: "select",
      options: locationOptions,
    },
  ];

/* ---------------------------------------------------------------------------- */
/* Child 1 - Indent Detail                                                     */

const buildIndentDetailColumns = ({ unitOptions, bomItemOptions }) => [
  {
    key: "item",
    label: "Item Code / Description",
    type: "select",
    options: bomItemOptions,
  },
  { key: "reqQty", label: "Req Qty", type: "number" },
  { key: "unitDisplay", label: "Unit", readOnly: true },
  { key: "requiredDate", label: "Required Date", type: "date" },
  { key: "purpose", label: "Purpose" },
];

/* ---------------------------------------------------------------------------- */
/* Child 2 - Indent Summary                                                    */

const buildIndentSummaryFields = ({ employeeOptions }) => [
  {
    name: "approvedByPM",
    label: "Approved By PM",
    type: "select",
    options: YES_NO,
    default: "No",
  },
  {
    name: "preparedBy",
    label: "Prepared By",
    type: "select",
    options: employeeOptions,
  },
  {
    name: "authorisedBy",
    label: "Authorised By",
    type: "select",
    options: employeeOptions,
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

const CHILD_TABS = [
  { key: "indentDetail", label: "Indent Detail", type: "table" },
  { key: "indentSummary", label: "Indent Summary", type: "fields" },
];

/* ---------------------------------------------------------------------------- */

const BulkIssueIndentForm = ({ onBack, onSave, editData }) => {
  const { addToast } = useToast();
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const BRANCH_ID = Number(localStorage.getItem("branchId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const isEditMode = Boolean(editData?.id);
  const docIdLoadedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeChildTab, setActiveChildTab] = useState("indentDetail");

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [fgItemOptions, setFgItemOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  /* BOM line items fetched on BOM select, used as the row dropdown */
  const [bomItemOptions, setBomItemOptions] = useState([]);
  const bomItemMapRef = useRef({}); // itemId -> BOM line object

  /* ---------------- Lookup maps ---------------- */
  const fgItemMapRef = useRef({});       // itemId -> item object
  const locationMapRef = useRef({});     // locationId -> location object

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...blankFromFields(
      buildHeaderFields({
        plantOptions: [],
        departmentOptions: [],
        fgItemOptions: [],
        bomOptions: [],
        locationOptions: [],
      }),
    ),
    ...(editData?.header || {}),
  }));

  const [indentDetailRows, setIndentDetailRows] = useState(
    editData?.indentDetails?.length
      ? editData.indentDetails
      : [
        blankRowFromColumns(
          buildIndentDetailColumns({ unitOptions: [], bomItemOptions: [] }),
        ),
      ],
  );

  const [indentSummary, setIndentSummary] = useState({
    ...blankFromFields(buildIndentSummaryFields({ employeeOptions: [] })),
    ...(editData?.indentSummary || {}),
  });

  /* ---------------- Re-sync when editData prop changes ---------------- */
  useEffect(() => {
    if (!editData) return;

    setHeader({
      ...blankFromFields(
        buildHeaderFields({
          plantOptions: [],
          departmentOptions: [],
          fgItemOptions: [],
          bomOptions: [],
          locationOptions: [],
        }),
      ),
      ...(editData.header || {}),
    });

    setIndentDetailRows(
      editData.indentDetails?.length
        ? editData.indentDetails
        : [
          blankRowFromColumns(
            buildIndentDetailColumns({ unitOptions: [], bomItemOptions: [] }),
          ),
        ],
    );

    setIndentSummary({
      ...blankFromFields(buildIndentSummaryFields({ employeeOptions: [] })),
      ...(editData.indentSummary || {}),
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

    // Departments
    (async () => {
      try {
        const res = await departmentAPI.getAllDepartments(ORG_ID);
        const list = res?.paramObjectsMap?.departmentVO || [];
        setDepartmentOptions(
          (list || []).map((d) => ({
            value: d.id ?? d.departmentName,
            label: d.departmentName || String(d.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartmentOptions([]);
      }
    })();

    // FG / SFG items
    (async () => {
      try {
        const list = await bulkIssueIndentAPI.getFGAndSFGItems({
          branch: BRANCH_ID,
          orgId: ORG_ID,
        });
        const map = {};
        setFgItemOptions(
          (list || []).map((it) => {
            const value = it.itemId;
            map[value] = it;
            return {
              value,
              label: it.itemCode || String(it.itemId),
            };
          }),
        );
        fgItemMapRef.current = map;
      } catch (err) {
        console.error("Failed to load FG/SFG items:", err);
        setFgItemOptions([]);
      }
    })();

    // Locations
    (async () => {
      try {
        const list = await locationMasterAPI.getLocationMasterByOrgId(
          ORG_ID,
          BRANCH_ID,
        );
        const map = {};
        setLocationOptions(
          (list || []).map((loc) => {
            const value = loc.id;
            map[value] = loc;
            return {
              value,
              label: loc.locationName || loc.locationId || String(loc.id),
            };
          }),
        );
        locationMapRef.current = map;
      } catch (err) {
        console.error("Failed to load locations:", err);
        setLocationOptions([]);
      }
    })();

    // Employees
    (async () => {
      try {
        const list = await employeeAPI.getEmployeeByOrgId(ORG_ID);
        setEmployeeOptions(
          (list || []).map((e) => ({
            value: e.id,
            label: e.employeeName || e.employeeId || String(e.id),
          })),
        );
      } catch (err) {
        console.error("Failed to load employees:", err);
        setEmployeeOptions([]);
      }
    })();
  }, [ORG_ID, BRANCH_ID]);

  /* ---------------- Load BOM dropdown options when FG/SFG item changes ---------------- */

  useEffect(() => {
    const itemId = header.fgSfgItemId;
    if (!itemId) {
      setBomOptions([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const list = await bulkIssueIndentAPI.getBomItemDetails({
          branch: BRANCH_ID,
          itemId,
          orgId: ORG_ID,
        });

        const opts = (list || []).map((b) => ({
          value: b.bomId,
          label: b.BomDocId || String(b.bomId),
          bom: b,
        }));

        if (!cancelled) setBomOptions(opts);
      } catch (err) {
        console.error("Failed to load BOM items:", err);
        if (!cancelled) setBomOptions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.fgSfgItemId, ORG_ID, BRANCH_ID]);

  /* ---------------- Preload BOM line items in edit mode ---------------- */

  useEffect(() => {
    if (!isEditMode) return;
    if (!header.fgSfgItemId || !header.bomId) return;
    if (bomItemOptions.length) return; // already loaded

    let cancelled = false;

    (async () => {
      try {
        const list = await bulkIssueIndentAPI.getBomItemDetails({
          branch: BRANCH_ID,
          itemId: header.fgSfgItemId,
          orgId: ORG_ID,
        });

        const map = {};
        const options = (list || []).map((b) => {
          map[b.itemId] = b;
          return {
            value: b.itemId,
            label: `${b.itemCode} — ${b.itemDescription}`,
          };
        });

        if (!cancelled) {
          bomItemMapRef.current = map;
          setBomItemOptions(options);
        }
      } catch (err) {
        console.error("Failed to preload BOM item details:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, header.fgSfgItemId, header.bomId]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */

  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!ORG_ID) return;

    let cancelled = false;

    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await bulkIssueIndentAPI.getDocId({
          financialYear,
          orgId: ORG_ID,
        });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Doc Id:", err);
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

      if (name === "fgSfgItemId") {
        const it = fgItemMapRef.current[value];
        next.fgDescription = it?.itemDescription || "";
        next.bomId = "";
        setBomItemOptions([]);
      }

      return next;
    });
  };

  /* BOM selection → fetch BOM line items and populate the row dropdown */
  const handleBomChange = async (e) => {
    const value = e.target.value;
    setHeader((prev) => ({ ...prev, bomId: value }));

    if (!value) {
      setBomItemOptions([]);
      setIndentDetailRows([
        blankRowFromColumns(
          buildIndentDetailColumns({ unitOptions: [], bomItemOptions: [] }),
        ),
      ]);
      return;
    }

    try {
      const list = await bulkIssueIndentAPI.getBomItemDetails({
        branch: BRANCH_ID,
        itemId: header.fgSfgItemId,
        orgId: ORG_ID,
      });

      const map = {};
      const options = (list || []).map((b) => {
        map[b.itemId] = b;
        return {
          value: b.itemId,
          label: `${b.itemCode} — ${b.itemDescription}`,
        };
      });

      bomItemMapRef.current = map;
      setBomItemOptions(options);

      if (options.length) {
        const first = map[options[0].value];
        setIndentDetailRows([
          {
            item: first.itemId,
            reqQty: first.bomQty ?? "",
            unit: first.unitId ?? "",
            unitDisplay: first.unitCode ?? "",
            requiredDate: todayISO(),
            purpose: "",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load BOM item details:", err);
      setBomItemOptions([]);
    }
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setIndentSummary((prev) => ({ ...prev, [name]: value }));
  };

  const makeTableHandlers = (setter, columns) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, blankRowFromColumns(columns)]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  /* Row change handler — auto-fills reqQty and unit when an item is chosen */
  const handleIndentCellChange = (idx, key, value) => {
    setIndentDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        const next = { ...row, [key]: value };

        if (key === "item") {
          const b = bomItemMapRef.current[value];
          if (b) {
            next.reqQty = b.bomQty ?? "";
            next.unit = b.unitId ?? "";
            next.unitDisplay = b.unitCode ?? "";
          }
        }

        return next;
      }),
    );
  };

  const indentDetailColumns = buildIndentDetailColumns({
    unitOptions: [],
    bomItemOptions,
  });

  const indentDetailHandlers = makeTableHandlers(
    setIndentDetailRows,
    indentDetailColumns,
  );

  const indentSummaryFields = buildIndentSummaryFields({ employeeOptions });

  const childTabConfig = {
    indentDetail: {
      type: "table",
      rows: indentDetailRows,
      handlers: indentDetailHandlers,
      columns: indentDetailColumns,
    },
    indentSummary: { type: "fields" },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      setIndentDetailRows((prev) => [
        ...prev,
        blankRowFromColumns(indentDetailColumns),
      ]);
    }
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant is required";
    if (!header.docDate) errors.docDate = "DocDate is required";

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

      belongsTo: header.belongsTo || "",
      department: Number(header.department) || 0,

      fgSfgItem: Number(header.fgSfgItemId) || 0,
      bom: Number(header.bomId) || 0,

      fromLocation: Number(header.fromLocation) || 0,
      timeOfIndent: header.timeOfIndent || nowTime(),

      approvedByPM: indentSummary.approvedByPM || "",
      preparedBy: Number(indentSummary.preparedBy) || 0,
      authorisedBy: Number(indentSummary.authorisedBy) || 0,
      remarks: indentSummary.remarks || "",

      details: (indentDetailRows || [])
        .filter((r) => r.item)
        .map((r) => ({
          item: Number(r.item) || 0,
          reqQty: Number(r.reqQty || 0),
          unit: Number(r.unit) || 0,
          requiredDate: r.requiredDate || "",
          purpose: r.purpose || "",
        })),
    };

    console.log("📤 Saving Bulk Issue Indent Payload:", payload);

    try {
      const response = await bulkIssueIndentAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Bulk Issue Indent updated successfully!"
            : "Bulk Issue Indent created successfully!"),
          "success",
        );

        if (onSave) {
          onSave({
            ...payload,
            id: response?.paramObjectsMap?.bulkIssueIndent?.id || payload.id,
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
          "Failed to save Bulk Issue Indent",
          "error",
        );
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Failed to save Bulk Issue Indent.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Header fields (built with live options) ---------------- */

  const headerFields = buildHeaderFields({
    plantOptions,
    departmentOptions,
    fgItemOptions,
    bomOptions,
    locationOptions,
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
          {editData ? "Edit Bulk Issue Indent" : "Bulk Issue Indent"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Bulk Issue Indent Details</SectionHeader>
          <FieldsGrid
            fields={headerFields}
            values={header}
            onChange={handleHeaderChange}
            errors={fieldErrors}
            onFieldChangeOverride={{ bomId: handleBomChange }}
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
              onCellChange={handleIndentCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          ) : (
            <div className="pt-3">
              <FieldsGrid
                fields={indentSummaryFields}
                values={indentSummary}
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

export default BulkIssueIndentForm;