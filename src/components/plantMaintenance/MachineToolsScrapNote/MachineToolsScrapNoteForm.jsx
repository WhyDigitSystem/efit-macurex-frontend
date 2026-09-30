import { ArrowLeft, Save, X, Plus, Trash2, UploadCloud } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import machineToolsScrapNoteAPI from "../../../api/plantMaintenance/machineToolsScrapNoteAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import employeeAPI from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                         */

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
/* Shared building blocks                                                       */

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
          className={controlClasses}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => {
            const optValue =
              typeof opt === "object" ? opt.value : opt;
            const optLabel =
              typeof opt === "object" ? opt.label : opt;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
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

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top">
    <select value={value} onChange={onChange} className={cellInputClasses}>
      <option value="">-- Select --</option>
      {(options || []).map((opt) => {
        const optValue = typeof opt === "object" ? opt.value : opt;
        const optLabel = typeof opt === "object" ? opt.label : opt;
        return (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        );
      })}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", readOnly }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
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
          {columns.map((col) =>
            col.type === "select" ? (
              <SelectCell
                key={col.key}
                value={row[col.key]}
                onChange={(e) =>
                  onCellChange(idx, col.key, e.target.value, col)
                }
                options={col.options || []}
              />
            ) : (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={col.type === "number" ? "number" : "text"}
                readOnly={col.readOnly}
                onChange={(e) =>
                  onCellChange(idx, col.key, e.target.value, col)
                }
              />
            )
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

/* ---------------------------------------------------------------------------- */
/* Single-image upload block (Child 3 - Scrap Summary)                          */

const ImageUploadField = ({ image, onFileChange, onRemove }) => (
  <div className="pt-3 max-w-sm">
    <label className={labelClasses}>Image</label>

    {image?.previewUrl ? (
      <div className="space-y-2">
        <img
          src={image.previewUrl}
          alt={image.fileName || "Scrap note attachment"}
          className="w-full max-h-56 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {image.fileName}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline flex-shrink-0"
          >
            <Trash2 size={11} />
            Remove
          </button>
        </div>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-1 h-28 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors">
        <UploadCloud size={18} />
        Drop image here or click to upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </label>
    )}
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Static options                                                               */

const YES_NO = [
  { value: "No", label: "No" },
  { value: "Yes", label: "Yes" },
];

const APPROVAL_OPTIONS = [
  { value: "Approved", label: "Approved" },
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
// Returns "HH:MM:SS"
const nowTime = () => new Date().toTimeString().slice(0, 8);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

// Convert "HH:MM" or "HH:MM:SS" → "HH:MM:SS"
const toTimeString = (value) => {
  if (!value) return "";
  const parts = String(value).split(":");
  const hh = String(parts[0] || "00").padStart(2, "0");
  const mm = String(parts[1] || "00").padStart(2, "0");
  const ss = String(parts[2] || "00").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

/* ---------------------------------------------------------------------------- */
/* Header field descriptors (options injected at runtime)                       */

const HEADER_FIELDS = [
  {
    name: "plant",
    label: "Plant ID",
    type: "select",
    options: [],
    required: true,
  },
  { name: "msnNo", label: "MSN No", auto: true, disabled: true },
  {
    name: "belongsTo",
    label: "Belongs To",
    type: "select",
    options: [],
  },
  {
    name: "msnDate",
    label: "MSN Date",
    type: "date",
    default: todayISO(),
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: [],
  },
  {
    name: "time",
    label: "Time",
    type: "time",
    step: "1",
    default: nowTime(),
  },
  {
    name: "fromLocation",
    label: "From Location",
    type: "select",
    options: [],
  },
  {
    name: "toLocation",
    label: "To Location",
    type: "select",
    options: [],
  },
];

/* ---------------------------------------------------------------------------- */
/* Child 1 - Machine Tools Attach Image (table)                                 */

const MACHINE_TOOLS_COLUMNS = [
  { key: "itemCode", label: "Item Code", type: "select", options: [] },
  {
    key: "itemDescription",
    label: "Item Description",
    type: "text",
    readOnly: true,
  },
  { key: "stock", label: "Stock", type: "number" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "rate", label: "Rate", type: "number" },
  { key: "value", label: "Value", type: "number" },
];

/* ---------------------------------------------------------------------------- */
/* Child 2 - Scrap Details (fields)                                             */

const SCRAP_DETAILS_FIELDS = [
  {
    name: "preparedBy",
    label: "Prepared By",
    type: "select",
    options: [],
  },
  {
    name: "authoriseBy",
    label: "Authorise By",
    type: "select",
    options: [],
  },
  {
    name: "productionApproval",
    label: "Production Approval",
    type: "select",
    options: APPROVAL_OPTIONS,
    default: "Pending",
  },
  {
    name: "qualityApproval",
    label: "Quality Approval",
    type: "select",
    options: APPROVAL_OPTIONS,
    default: "Pending",
  },
  {
    name: "storeApproval",
    label: "Store Approval",
    type: "select",
    options: APPROVAL_OPTIONS,
    default: "Pending",
  },
  {
    name: "narration",
    label: "Narration",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

const CHILD_TABS = [
  { key: "machineTools", label: "Machine Tools Attach Image", type: "table" },
  { key: "scrapDetails", label: "Scrap Details", type: "fields" },
  { key: "scrapSummary", label: "Scrap Summary", type: "upload" },
];

/* ---------------------------------------------------------------------------- */

const MachineToolsScrapNoteForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH_ID = parseInt(localStorage.getItem("branchId"));

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeChildTab, setActiveChildTab] = useState("machineTools");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  const [machineToolsRows, setMachineToolsRows] = useState(
    editData?.machineTools?.length
      ? editData.machineTools
      : [blankRowFromColumns(MACHINE_TOOLS_COLUMNS)]
  );

  const [scrapDetails, setScrapDetails] = useState({
    ...blankFromFields(SCRAP_DETAILS_FIELDS),
    ...editData?.scrapDetails,
  });

  const [scrapImage, setScrapImage] = useState(editData?.scrapImage || null);

  /* -------- option lists -------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [belongToOptions, setBelongToOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  /* ---------------------------------------------------------------- */
  /* Loaders                                                          */

  const loadPlants = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await branchAPI.getBranchByOrgId(ORG_ID);
      const mapped = (list || []).map((p) => ({
        value: p.id,
        label: p.branchName,
      }));
      setPlantOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load plants:", err);
      addToast("Failed to load Plant list", "error");
      setPlantOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  const loadBelongTo = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await listOfValuesAPI.getListValuesGroup(
        "SDS BELONGS TO",
        ORG_ID
      );
      const mapped = (list || []).map((item) => ({
        value: item.id || item.value,
        label: item.valuesDescription || item.label || item.name,
      }));
      setBelongToOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load Belong To:", err);
      addToast("Failed to load Belong To list", "error");
      setBelongToOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  const loadDepartments = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const res = await departmentAPI.getAllDepartments(ORG_ID);
      const rawArray = Array.isArray(res)
        ? res
        : res?.paramObjectsMap?.departmentVO ||
        res?.paramObjectsMap?.departmentList ||
        res?.paramObjectsMap?.departments ||
        [];
      const mapped = rawArray.map((d) => ({
        value: d.id,
        label: d.departmentName || d.departmentCode,
      }));
      setDepartmentOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load departments:", err);
      addToast("Failed to load Department list", "error");
      setDepartmentOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  const loadLocations = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return [];
    try {
      const list = await locationMasterAPI.getLocationMasterByOrgId(
        ORG_ID,
        BRANCH_ID
      );
      const mapped = (list || []).map((l) => ({
        value: l.id,
        label: l.locationName || l.locationCode || l.description,
      }));
      setLocationOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load locations:", err);
      addToast("Failed to load Location list", "error");
      setLocationOptions([]);
      return [];
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  const loadItems = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return [];
    try {
      const list = await itemAPI.getItems(ORG_ID, BRANCH_ID);
      const mapped = (list || []).map((it) => ({
        value: it.id,
        label: `${it.itemCode} - ${it.itemDescription}`,
        itemCode: it.itemCode,
        itemDescription: it.itemDescription,
        stock: it.stock || 0,
      }));
      setItemOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load items:", err);
      addToast("Failed to load Item list", "error");
      setItemOptions([]);
      return [];
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  const loadEmployees = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await employeeAPI.getEmployeeByOrgId(ORG_ID);
      const rawArray = Array.isArray(list)
        ? list
        : list?.paramObjectsMap?.employeeMasterVO || [];
      const mapped = rawArray.map((e) => ({
        value: e.id,
        label: e.employeeName || e.name || e.employeeCode,
      }));
      setEmployeeOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load employees:", err);
      addToast("Failed to load Employee list", "error");
      setEmployeeOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  /* ---------------------------------------------------------------- */
  /* Doc No (MSN No) generation                                       */
  const loadDocId = useCallback(async () => {
    if (editData?.id) return;
    if (!ORG_ID) return;
    try {
      const financialYear = new Date().getFullYear().toString();
      const docId =
        await machineToolsScrapNoteAPI.getMachineToolsScrapNoteDocId(
          ORG_ID,
          financialYear
        );
      if (docId) {
        setHeader((p) => ({ ...p, msnNo: docId }));
      }
    } catch (err) {
      console.error("Failed to generate MSN No:", err);
      addToast("Failed to generate MSN No", "error");
    }
  }, [ORG_ID, editData?.id, addToast]);

  /* ---------------------------------------------------------------- */
  /* Load by id for edit                                             */
  const loadScrapNoteById = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const data =
          await machineToolsScrapNoteAPI.getMachineToolsScrapNoteById(id);
        if (!data) {
          addToast("Failed to load Machine Tools Scrap Note", "error");
          return;
        }

        // Header
        setHeader((p) => ({
          ...p,
          plant: data.branch?.id || "",
          msnNo: data.docId || p.msnNo || "",
          belongsTo: data.belongsTo?.id || "",
          msnDate: data.docDate || p.msnDate || todayISO(),
          department:
            data.departement?.id || data.department?.id || "",
          time: data.time || "",
          fromLocation: data.fromLocation?.id || "",
          toLocation: data.toLocation?.id || "",
        }));

        // Machine tools rows
        const rows =
          data.machineToolsScrapNoteDetailsResponseDTO || [];
        if (rows.length) {
          setMachineToolsRows(
            rows.map((r) => ({
              itemCode: r.item?.id || "",
              itemDescription: r.item?.itemDescription || "",
              stock: r.stock ?? "",
              quantity: r.quantity ?? "",
              rate: r.rate ?? "",
              value: r.value ?? "",
            }))
          );
        } else {
          setMachineToolsRows([blankRowFromColumns(MACHINE_TOOLS_COLUMNS)]);
        }

        // Scrap details
        setScrapDetails((p) => ({
          ...p,
          preparedBy: data.preparedBy?.id || "",
          authoriseBy: data.authorizedBy?.id || "",
          productionApproval: data.productionApproval || "Pending",
          qualityApproval: data.qualityApproval || "Pending",
          storeApproval: data.storeApproval || "Pending",
          narration: data.narration || "",
        }));

        // Image (first attachment)
        const att = (data.machineToolsScrapNoteAttachmentResponseDTO || [])[0];
        if (att) {
          setScrapImage({
            file: null,
            fileName: att.name || att.fileName || "Attachment",
            previewUrl: att.filePath || "",
            existing: true,
            id: att.id,
          });
        } else {
          setScrapImage(null);
        }
      } catch (err) {
        console.error("Error loading scrap note by id:", err);
        addToast("Failed to load Machine Tools Scrap Note", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  /* ---------------------------------------------------------------- */
  /* Initial load of option lists                                     */
  useEffect(() => {
    const init = async () => {
      setLoadingOptions(true);
      await Promise.all([
        loadPlants(),
        loadBelongTo(),
        loadDepartments(),
        loadLocations(),
        loadItems(),
        loadEmployees(),
      ]);
      setLoadingOptions(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, BRANCH_ID]);

  /* Doc No generation */
  useEffect(() => {
    loadDocId();
  }, [loadDocId]);

  /* Load by id — only when editing */
  useEffect(() => {
    if (editData?.id) {
      loadScrapNoteById(editData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  /* ---------------------------------------------------------------- */
  /* Header/scrap handlers                                            */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrapDetailsChange = (e) => {
    const { name, value } = e.target;
    setScrapDetails((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------- */
  /* Table handlers                                                   */

  const makeTableHandlers = (setter, columns) => ({
    onCellChange: (idx, key, value, col) =>
      setter((prev) =>
        prev.map((row, i) => {
          if (i !== idx) return row;

          if (col?.key === "itemCode") {
            const found = itemOptions.find(
              (o) => String(o.value) === String(value)
            );
            return {
              ...row,
              itemCode: value,
              itemDescription: found?.itemDescription || "",
              stock: found?.stock ?? row.stock ?? 0,
            };
          }

          if (col?.key === "quantity" || col?.key === "rate") {
            const next = { ...row, [key]: value };
            const qty = Number(
              col.key === "quantity" ? value : next.quantity
            );
            const rate = Number(col.key === "rate" ? value : next.rate);
            next.value =
              Number.isFinite(qty) && Number.isFinite(rate)
                ? (qty * rate).toFixed(2)
                : "";
            return next;
          }

          return { ...row, [key]: value };
        })
      ),
    onAddRow: () => setter((prev) => [...prev, blankRowFromColumns(columns)]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const machineToolsHandlers = makeTableHandlers(
    setMachineToolsRows,
    MACHINE_TOOLS_COLUMNS
  );

  /* ---------------------------------------------------------------- */
  /* Image handling                                                   */

  const handleImageChange = (file) => {
    if (!file) return;
    setScrapImage({
      file,
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
    });
  };
  const handleImageRemove = () => setScrapImage(null);

  /* ---------------------------------------------------------------- */
  /* Build runtime fields/columns with loaded options                 */

  const runtimeHeaderFields = useMemo(
    () =>
      HEADER_FIELDS.map((f) => {
        if (f.name === "plant") return { ...f, options: plantOptions };
        if (f.name === "belongsTo") return { ...f, options: belongToOptions };
        if (f.name === "department")
          return { ...f, options: departmentOptions };
        if (f.name === "fromLocation" || f.name === "toLocation")
          return { ...f, options: locationOptions };
        return f;
      }),
    [
      plantOptions,
      belongToOptions,
      departmentOptions,
      locationOptions,
    ]
  );

  const runtimeScrapFields = useMemo(
    () =>
      SCRAP_DETAILS_FIELDS.map((f) => {
        if (f.name === "preparedBy" || f.name === "authoriseBy")
          return { ...f, options: employeeOptions };
        return f;
      }),
    [employeeOptions]
  );

  const runtimeItemColumns = useMemo(
    () =>
      MACHINE_TOOLS_COLUMNS.map((c) =>
        c.key === "itemCode" ? { ...c, options: itemOptions } : c
      ),
    [itemOptions]
  );

  const childTabConfig = {
    machineTools: {
      type: "table",
      rows: machineToolsRows,
      handlers: machineToolsHandlers,
      columns: runtimeItemColumns,
    },
    scrapDetails: { type: "fields" },
    scrapSummary: { type: "upload" },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  /* ---------------------------------------------------------------- */
  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant ID is required";
    if (!header.msnDate) errors.msnDate = "MSN Date is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------------------------------------------------------- */
  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fix validation errors before saving", "error");
      return;
    }

    setIsSubmitting(true);

    const vo = {
      active:
        editData?.active === "Active" ||
        editData?.active === true ||
        true,
      authorizedBy: parseInt(scrapDetails.authoriseBy) || 0,
      belongsTo: parseInt(header.belongsTo) || 0,
      branch: parseInt(header.plant) || BRANCH_ID || 0,
      cancelRemarks: "",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      departement: parseInt(header.department) || 0, // backend spelling
      financialYear: new Date().getFullYear().toString(),
      fromLocation: parseInt(header.fromLocation) || 0,
      machineToolsScrapNoteDetailsDTO: machineToolsRows
        .filter((r) => r.itemCode)
        .map((r) => ({
          item: parseInt(r.itemCode) || 0,
          quantity: parseFloat(r.quantity) || 0,
          rate: parseFloat(r.rate) || 0,
          stock: parseFloat(r.stock) || 0,
          value: parseFloat(r.value) || 0,
        })),
      narration: scrapDetails.narration || "",
      orgId: ORG_ID,
      preparedBy: parseInt(scrapDetails.preparedBy) || 0,
      productionApproval: scrapDetails.productionApproval || "Pending",
      qualityApproval: scrapDetails.qualityApproval || "Pending",
      storeApproval: scrapDetails.storeApproval || "Pending",
      time: toTimeString(header.time),
      toLocation: parseInt(header.toLocation) || 0,
    };

    if (editData?.id) {
      vo.id = parseInt(editData.id);
    }

    console.log("📤 Saving Machine Tools Scrap Note VO:", vo);

    const formData = new FormData();
    formData.append(
      "machineToolsScrapNoteDTO",
      new Blob([JSON.stringify(vo)], { type: "application/json" }),
      "machineToolsScrapNoteDTO.json"
    );

    if (scrapImage?.file instanceof File) {
      formData.append("files", scrapImage.file, scrapImage.file.name);
    }

    try {
      const response =
        await machineToolsScrapNoteAPI.updateCreateMachineToolsScrapNote(
          formData
        );
      console.log("📥 Response:", response);

      const status =
        response?.status === true ||
        response?.success === true ||
        response?.statusFlag === "Ok" ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (status) {
        addToast(
          editData?.id
            ? "Machine Tools Scrap Note updated successfully"
            : "Machine Tools Scrap Note created successfully",
          "success"
        );
        if (onSave) onSave(vo);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          response?.errorMessage ||
          response?.error ||
          "Something went wrong";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save Machine Tools Scrap Note.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading scrap note…
        </div>
      </div>
    );
  }

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
            ? "Edit Machine Tools Scrap Note"
            : "Machine Tools Scrap Note"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>
            Scrap Note Details
            {loadingOptions && (
              <span className="ml-2 text-blue-500 normal-case font-normal">
                Loading options…
              </span>
            )}
          </SectionHeader>
          <FieldsGrid
            fields={runtimeHeaderFields}
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

          {activeTabConfig.type === "table" && (
            <DynamicTable
              columns={activeTabConfig.columns}
              rows={activeTabConfig.rows}
              onCellChange={activeTabConfig.handlers.onCellChange}
              onRemoveRow={activeTabConfig.handlers.onRemoveRow}
            />
          )}

          {activeTabConfig.type === "fields" && (
            <div className="pt-3">
              <FieldsGrid
                fields={runtimeScrapFields}
                values={scrapDetails}
                onChange={handleScrapDetailsChange}
              />
            </div>
          )}

          {activeTabConfig.type === "upload" && (
            <ImageUploadField
              image={scrapImage}
              onFileChange={handleImageChange}
              onRemove={handleImageRemove}
            />
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

export default MachineToolsScrapNoteForm;