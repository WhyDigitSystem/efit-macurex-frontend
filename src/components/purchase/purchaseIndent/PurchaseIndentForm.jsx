import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  FileUp,
  FileText,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";
import branchAPI from "../../../api/branchAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import itemAPI from "../../../api/itemAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

/* -------------------------------------------------------------------------- */
/* Shared styles */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const pickArray = (source, keys) => {
  if (Array.isArray(source)) return source;

  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, k) => (acc ? acc[k] : undefined), source);

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const pickObject = (source, keys) => {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((acc, k) => (acc ? acc[k] : undefined), source);

    if (Array.isArray(value)) {
      if (value.length) return value[0];
      continue;
    }

    if (value && typeof value === "object") {
      return value;
    }
  }

  return null;
};

const findIndentRecord = (node, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 6) {
    return null;
  }

  if (!Array.isArray(node)) {
    const hasId = node.id !== undefined && node.id !== null;

    const looksLikeIndent =
      "branch" in node ||
      "department" in node ||
      "preparedBy" in node ||
      "indentDate" in node ||
      "indentNo" in node;

    if (hasId && looksLikeIndent) {
      return node;
    }
  }

  const children = Array.isArray(node) ? node : Object.values(node);

  for (const child of children) {
    if (child && typeof child === "object") {
      const found = findIndentRecord(child, depth + 1);

      if (found) {
        return found;
      }
    }
  }

  return null;
};

const findDetailRows = (node, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 6) {
    return [];
  }

  if (Array.isArray(node)) {
    const first = node[0];

    if (
      first &&
      typeof first === "object" &&
      ("qtyInPrimaryUnit" in first ||
        "qtyInPurchaseUnit" in first ||
        ("item" in first && "purchaseUnit" in first))
    ) {
      return node;
    }

    for (const item of node) {
      const found = findDetailRows(item, depth + 1);

      if (found.length) {
        return found;
      }
    }

    return [];
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      const found = findDetailRows(value, depth + 1);

      if (found.length) {
        return found;
      }
    }
  }

  return [];
};

const asId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return value.id ?? "";
  }

  return value;
};

/* Unit label: API returns units as { id, unitId: "KG", unitDescription } */
const unitLabel = (unit) => {
  if (!unit) return "";
  if (typeof unit !== "object") return String(unit);

  return (
    unit.primaryUnit ??
    unit.unitId ??
    unit.unitName ??
    unit.unitDescription ??
    ""
  );
};

/*
 * Conversion factor dropdown entry from API:
 *   { id: 1000000004, multiplicationFactor: 10.0 }
 * value = id (sent to backend), label = multiplicationFactor (shown to user)
 */
const normalizeConversionOptions = (response) => {
  const list = pickArray(response, [
    "paramObjectsMap.conversionFactorDropdown",
    "conversionFactorDropdown",
  ]);

  const seen = new Set();

  return list
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const id = entry.id;

      const factor =
        entry.multiplicationFactor ??
        entry.conversionFactor ??
        entry.factor ??
        entry.value;

      if (
        id === null ||
        id === undefined ||
        factor === null ||
        factor === undefined ||
        factor === ""
      ) {
        return null;
      }

      if (seen.has(String(id))) return null;
      seen.add(String(id));

      return { id, value: String(id), label: String(factor) };
    })
    .filter(Boolean);
};

/*
 * Read the saved conversion factor from a detail row of the edit response.
 * Handles: an object { id, multiplicationFactor }, a plain id, or
 * alternative field names. Returns { value, option } where option is a
 * ready-to-display dropdown entry (so it shows even if the dropdown
 * API returns nothing).
 */
const extractSavedConversion = (detail) => {
  const raw =
    detail.conversionFactor ??
    detail.conversionFactorId ??
    detail.conversionFactorVO ??
    null;

  let id = "";
  let label = null;

  if (raw && typeof raw === "object") {
    id = raw.id ?? "";
    label =
      raw.multiplicationFactor ?? raw.conversionFactor ?? raw.factor ?? null;
  } else if (raw !== null && raw !== undefined && raw !== "") {
    id = raw;
    label = detail.multiplicationFactor ?? null;
  }

  if (id === "" || id === null || id === undefined) {
    return { value: "", option: null };
  }

  return {
    value: String(id),
    option: {
      id,
      value: String(id),
      label: label !== null && label !== undefined ? String(label) : String(id),
    },
  };
};

/* Fetch conversion factor options for a primary -> purchase unit pair */
const fetchConversionOptions = async ({ branch, fromUnit, toUnit, orgId }) => {
  if (!branch || !fromUnit || !toUnit || !orgId) {
    return [];
  }

  try {
    const response =
      await purchaseIndentAPI.getPurchaseIndentConversionFactorDropdown({
        branch,
        fromUnit,
        toUnit,
        orgId,
      });

    return normalizeConversionOptions(response);
  } catch (error) {
    console.error("Failed to load conversion factors:", error);
    return [];
  }
};

/* -------------------------------------------------------------------------- */
/* Field */
/* -------------------------------------------------------------------------- */

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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={controlClasses}
        >
          <option value="">-- Select --</option>

          {(options || []).map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
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
          rows={4}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
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

/* -------------------------------------------------------------------------- */
/* Section Header */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

/* -------------------------------------------------------------------------- */
/* Form Buttons */
/* -------------------------------------------------------------------------- */

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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />

      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Table */
/* -------------------------------------------------------------------------- */

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((header, index) => (
        <th
          key={index}
          className={`p-1 whitespace-nowrap ${
            index === 0
              ? "w-8 text-center"
              : index === headers.length - 1
                ? "w-20 text-left"
                : "text-left"
          } dark:text-white`}
        >
          {header}
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

/* -------------------------------------------------------------------------- */
/* Attachments */
/* -------------------------------------------------------------------------- */

const ExistingAttachmentRow = ({ attachment, onRemove }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 align-top">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-500 shrink-0" />

        <div className="min-w-0">
          <a
            href={attachment.filePath}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline truncate block"
          >
            {attachment.name || attachment.fileName}
          </a>

          {attachment.uploadOn && (
            <span className="text-[10px] text-gray-400">
              {new Date(attachment.uploadOn).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </td>

    <td className="p-1 text-center">
      <button
        type="button"
        onClick={onRemove}
        className="h-5 w-5 rounded text-white flex items-center justify-center bg-red-600 hover:bg-red-700"
      >
        <Trash2 size={10} />
      </button>
    </td>
  </tr>
);

const NewAttachmentDropCell = ({ rowId, file, onFileChange }) => (
  <td className="p-2 align-top">
    <label
      htmlFor={`attachment-file-${rowId}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();

        const dropped = e.dataTransfer.files?.[0];

        if (dropped) {
          onFileChange(dropped);
        }
      }}
      className="flex flex-col items-center justify-center gap-1 h-20 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-400 transition-colors text-center px-2"
    >
      {file ? (
        <>
          <FileText className="h-5 w-5 text-blue-500" />

          <span className="text-[11px] text-gray-700 dark:text-gray-200 truncate max-w-[220px]">
            {file.name}
          </span>
        </>
      ) : (
        <>
          <FileUp className="h-5 w-5 text-gray-400" />

          <span className="text-[11px] text-gray-400">
            Drop a file here or click to upload
          </span>
        </>
      )}
    </label>

    <input
      id={`attachment-file-${rowId}`}
      type="file"
      accept="application/pdf"
      className="hidden"
      onChange={(e) => {
        const selected = e.target.files?.[0];

        if (selected) {
          onFileChange(selected);
        }

        e.target.value = "";
      }}
    />
  </td>
);

const AttachmentTable = ({
  existingAttachments,
  onRemoveExisting,
  newRows,
  onNewFileChange,
  onRemoveNewRow,
}) => {
  const totalRows = existingAttachments.length + newRows.length;

  return (
    <TableWrapper>
      <TableHead headers={["File", "Action"]} />

      <tbody>
        {existingAttachments.map((attachment, index) => (
          <ExistingAttachmentRow
            key={`existing-${index}`}
            attachment={attachment}
            onRemove={() => onRemoveExisting(index)}
          />
        ))}

        {newRows.map((row, index) => (
          <tr key={row.rowId} className="border-t dark:border-gray-700">
            <NewAttachmentDropCell
              rowId={row.rowId}
              file={row.file}
              onFileChange={(file) => onNewFileChange(index, file)}
            />

            <td className="p-1 text-center align-top pt-3">
              <button
                type="button"
                onClick={() => onRemoveNewRow(index)}
                disabled={totalRows <= 1}
                className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                  totalRows <= 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 size={10} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

/* -------------------------------------------------------------------------- */
/* Defaults */
/* -------------------------------------------------------------------------- */

const emptyHeader = () => ({
  active: true,
  approved: false,
  belongsTo: "",
  branch: "",
  indentDate: "",
  department: "",
  preparedBy: "",
  byWhom: "",
  cancelRemarks: "",
  remarks: "",
});

const emptyDetailRow = () => ({
  item: "",
  itemDescription: "",
  primaryUnit: "",
  primaryUnitLabel: "",
  purchaseUnit: "",
  purchaseUnitLabel: "",
  qtyInPrimaryUnit: "",
  conversionFactor: "",
  conversionOptions: [],
  qtyInPurchaseUnit: "",
  requiredDate: "",
  purpose: "",
});

let newAttachmentRowIdCounter = 1;

const emptyNewAttachmentRow = () => ({
  rowId: `new-att-${newAttachmentRowIdCounter++}`,
  file: null,
});

const CHILD_TABS = [
  {
    key: "item",
    label: "1-Item Details",
  },
  {
    key: "summary",
    label: "2-Indent Summary",
  },
  {
    key: "attachment",
    label: "3-Pdf Attachment",
  },
];

/* -------------------------------------------------------------------------- */
/* Main Form */
/* -------------------------------------------------------------------------- */

const PurchaseIndentForm = ({ onBack, onSave, data }) => {
  const editId = data?.id;

  const ORG_ID = parseInt(localStorage.getItem("orgId"), 10);

  const BRANCH_ID = localStorage.getItem("branchId");

  const isEditMode = Boolean(editId);

  const [activeChildTab, setActiveChildTab] = useState("item");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(isEditMode);

  const [loadError, setLoadError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [recordId, setRecordId] = useState(editId || null);

  const [header, setHeader] = useState(emptyHeader());

  const [indentNo, setIndentNo] = useState("");

  const [detailRows, setDetailRows] = useState([emptyDetailRow()]);

  const [existingAttachments, setExistingAttachments] = useState([]);

  const [newAttachmentRows, setNewAttachmentRows] = useState([
    emptyNewAttachmentRow(),
  ]);

  /* ---------------------------------------------------------------------- */
  /* Master data */
  /* ---------------------------------------------------------------------- */

  const [plantData, setPlantData] = useState([]);

  const [departmentData, setDepartmentData] = useState([]);

  const [employeeList, setEmployeeList] = useState([]);

  const [itemList, setItemList] = useState([]);

  const [belongsToOptions, setBelongsToOptions] = useState([]);

  const [loadingItemRow, setLoadingItemRow] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* Load Plants */
  /* ---------------------------------------------------------------------- */

  const loadPlants = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setPlantData([]);
        return;
      }

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      setPlantData(
        (response || []).map((branch) => ({
          id: branch.id,
          label: branch.branchName,
        })),
      );
    } catch (error) {
      console.error("Failed to load plants:", error);

      setPlantData([]);
    }
  }, [ORG_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load Departments */
  /* ---------------------------------------------------------------------- */

  const loadDepartments = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setDepartmentData([]);
        return;
      }

      const response = await departmentAPI.getAllDepartments(ORG_ID);

      const list = pickArray(response, [
        "paramObjectsMap.departmentVO",
        "paramObjectsMap.departmentMasterVO",
        "paramObjectsMap.departmentList",
        "paramObjectsMap.department",
        "data.paramObjectsMap.departmentVO",
      ]);

      setDepartmentData(
        list.map((department) => ({
          id: department.id,
          label: department.departmentName ?? department.name,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);

      setDepartmentData([]);
    }
  }, [ORG_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load Employees */
  /* ---------------------------------------------------------------------- */

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setEmployeeList([]);
        return;
      }

      const response = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      setEmployeeList(response || []);
    } catch (error) {
      console.error("Failed to load employees:", error);

      setEmployeeList([]);
    }
  }, [ORG_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load Items */
  /* ---------------------------------------------------------------------- */

  const loadItems = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setItemList([]);
        return;
      }

      const response = await itemAPI.getItems(ORG_ID, BRANCH_ID);

      setItemList(
        (response || []).map((item) => ({
          id: item.id,
          label: item.itemCode ?? item.code ?? item.itemName,
        })),
      );
    } catch (error) {
      console.error("Failed to load items:", error);

      setItemList([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load Belongs To */
  /* ---------------------------------------------------------------------- */

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setBelongsToOptions([]);
        return;
      }

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      const list = Array.isArray(response) ? response : [];

      const options = list
        .map((item) => {
          const description =
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            item.valuesDesc ||
            item.valueDesc ||
            "";

          return {
            id: description,
            value: description,
            label: description,
          };
        })
        .filter((item) => item.id);

      setBelongsToOptions(options);
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);

      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load all master data */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    loadPlants();
    loadDepartments();
    loadEmployees();
    loadItems();
    loadBelongsTo();
  }, [loadPlants, loadDepartments, loadEmployees, loadItems, loadBelongsTo]);

  /* ---------------------------------------------------------------------- */
  /* Employee options */
  /* ---------------------------------------------------------------------- */

  const preparedByOptions = employeeList.map((employee) => ({
    id: employee.id,
    label: employee.employeeName,
  }));

  const byWhomOptions = preparedByOptions;

  /* ---------------------------------------------------------------------- */
  /* Generate Purchase Indent Number */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    if (!ORG_ID) {
      return;
    }

    const generateIndentNo = async () => {
      setGeneratingDocId(true);
      setIndentNo("");

      try {
        const financialYear = localStorage.getItem("finYear");

        if (!financialYear) {
          console.error("finYear not found in localStorage");
          return;
        }

        const docId = await purchaseIndentAPI.getPurchaseIndentDocId({
          financialYear,
          orgId: ORG_ID,
        });

        if (docId) {
          setIndentNo(docId);
        }
      } catch (error) {
        console.error("Failed to generate Purchase Indent number:", error);
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateIndentNo();
  }, [isEditMode, ORG_ID]);

  /* ---------------------------------------------------------------------- */
  /* Load edit record */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!data?.id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadPurchaseIndentData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await purchaseIndentAPI.getPurchaseIndentById(data.id);

        if (cancelled) {
          return;
        }

        const purchaseIndent =
          pickObject(response, [
            "paramObjectsMap.purchaseIndentVO",
            "paramObjectsMap.purchaseIndent",
            "paramObjectsMap.purchaseIndentResponseVO",
            "paramObjectsMap",
          ]) ||
          findIndentRecord(response) ||
          data;

        if (!purchaseIndent) {
          throw new Error("Purchase Indent record not found");
        }

        setRecordId(purchaseIndent.id ?? data.id);

        /* Existing Indent No */
        setIndentNo(
          purchaseIndent.indentNo ??
            purchaseIndent.docId ??
            data.indentNo ??
            "",
        );

        /* Header */
        setHeader({
          active: purchaseIndent.active ?? true,

          approved: purchaseIndent.approved ?? false,

          belongsTo: purchaseIndent.belongsTo ?? data.belongsTo ?? "",

          branch: asId(purchaseIndent.branch ?? data.branch),

          indentDate:
            purchaseIndent.indentDate ??
            purchaseIndent.docDate ??
            data.indentDate ??
            "",

          department: asId(purchaseIndent.department ?? data.department),

          preparedBy: asId(purchaseIndent.preparedBy ?? data.preparedBy),

          byWhom: asId(purchaseIndent.byWhom ?? data.byWhom),

          cancelRemarks:
            purchaseIndent.cancelRemarks ?? data.cancelRemarks ?? "",

          remarks: purchaseIndent.remarks ?? data.remarks ?? "",
        });

        /* Details */
        const detailsList = pickArray(purchaseIndent, [
          "details",
          "purchaseIndentDetails",
          "purchaseIndentDetailVOList",
          "detailsVOList",
        ]);

        const finalDetails = detailsList.length
          ? detailsList
          : findDetailRows(purchaseIndent);

        if (finalDetails.length) {
          setDetailRows(
            finalDetails.map((detail) => {
              const itemObj =
                detail.item && typeof detail.item === "object"
                  ? detail.item
                  : null;

              // Units are nested inside the item in the API response
              const primaryUnitObj = detail.primaryUnit ?? itemObj?.primaryUnit;
              const purchaseUnitObj =
                detail.purchaseUnit ?? itemObj?.purchaseUnit;

              return {
                item: asId(detail.item),

                itemDescription:
                  detail.itemDescription ?? itemObj?.itemDescription ?? "",

                primaryUnit: asId(primaryUnitObj),

                primaryUnitLabel:
                  detail.primaryUnitLabel ?? unitLabel(primaryUnitObj),

                purchaseUnit: asId(purchaseUnitObj),

                purchaseUnitLabel:
                  detail.purchaseUnitLabel ?? unitLabel(purchaseUnitObj),

                qtyInPrimaryUnit: detail.qtyInPrimaryUnit ?? "",

                conversionFactor: extractSavedConversion(detail).value,

                conversionOptions: extractSavedConversion(detail).option
                  ? [extractSavedConversion(detail).option]
                  : [],

                qtyInPurchaseUnit: detail.qtyInPurchaseUnit ?? "",

                requiredDate: detail.requiredDate ?? "",

                purpose: detail.purpose ?? "",
              };
            }),
          );

          /* Load conversion factor options for each saved row */
          const editBranch = asId(purchaseIndent.branch ?? data.branch);

          finalDetails.forEach(async (detail, rowIndex) => {
            const itemObj =
              detail.item && typeof detail.item === "object"
                ? detail.item
                : null;

            const fromUnit = asId(detail.primaryUnit ?? itemObj?.primaryUnit);
            const toUnit = asId(detail.purchaseUnit ?? itemObj?.purchaseUnit);

            const options = await fetchConversionOptions({
              branch: editBranch,
              fromUnit,
              toUnit,
              orgId: ORG_ID,
            });

            if (cancelled || !options.length) return;

            setDetailRows((previous) =>
              previous.map((row, i) => {
                if (i !== rowIndex) return row;

                /* keep the saved option if the API list doesn't include it */
                const saved = row.conversionOptions || [];
                const merged = [...options];

                saved.forEach((option) => {
                  if (!merged.some((o) => o.value === option.value)) {
                    merged.unshift(option);
                  }
                });

                return { ...row, conversionOptions: merged };
              }),
            );
          });
        } else {
          setDetailRows([emptyDetailRow()]);
        }

        /* Attachments */
        const attachments = pickArray(purchaseIndent, [
          "attachments",
          "attachmentVOList",
          "purchaseIndentAttachmentVO",
          "purchaseIndentAttachmentDTO",
        ]);

        setExistingAttachments(attachments);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load purchase indent:", error);

          setLoadError(
            "Failed to load purchase indent. Please go back and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPurchaseIndentData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ---------------------------------------------------------------------- */
  /* Header change */
  /* ---------------------------------------------------------------------- */

  const handleHeaderChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    setHeader((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* Detail */
  /* ---------------------------------------------------------------------- */

  const handleItemSelect = async (index, itemId) => {
    // Reset item-driven fields but keep user-entered values
    setDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...emptyDetailRow(),
              item: itemId,
              qtyInPrimaryUnit: row.qtyInPrimaryUnit,
              qtyInPurchaseUnit: row.qtyInPurchaseUnit,
              requiredDate: row.requiredDate,
              purpose: row.purpose,
            }
          : row,
      ),
    );

    if (!itemId) {
      return;
    }

    setLoadingItemRow(index);

    try {
      const itemDetail = await itemAPI.getItemById(itemId);

      if (!itemDetail) {
        return;
      }

      const primaryUnitObj = itemDetail.primaryUnits ?? itemDetail.primaryUnit;
      const purchaseUnitObj = itemDetail.purchaseUnit;

      /* primaryUnits.id -> fromUnit, purchaseUnit.id -> toUnit */
      const conversionOptions = await fetchConversionOptions({
        branch: header.branch || BRANCH_ID,
        fromUnit: asId(primaryUnitObj),
        toUnit: asId(purchaseUnitObj),
        orgId: ORG_ID,
      });

      setDetailRows((previous) =>
        previous.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,

                itemDescription:
                  itemDetail.itemDescription ?? itemDetail.description ?? "",

                primaryUnit: asId(primaryUnitObj),

                primaryUnitLabel: unitLabel(primaryUnitObj),

                purchaseUnit: asId(purchaseUnitObj),

                purchaseUnitLabel: unitLabel(purchaseUnitObj),

                conversionOptions,

                /* auto-select when there is exactly one factor */
                conversionFactor:
                  conversionOptions.length === 1
                    ? conversionOptions[0].value
                    : "",
              }
            : row,
        ),
      );
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoadingItemRow(null);
    }
  };

  const handleDetailCellChange = (index, key, value) => {
    if (key === "item") {
      handleItemSelect(index, value);
      return;
    }

    setDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const handleAddDetailRow = () => {
    setDetailRows((previous) => [...previous, emptyDetailRow()]);
  };

  const handleRemoveDetailRow = (index) => {
    setDetailRows((previous) =>
      previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Attachments */
  /* ---------------------------------------------------------------------- */

  const handleRemoveExistingAttachment = (index) => {
    setExistingAttachments((previous) =>
      previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const handleNewAttachmentFileChange = (index, file) => {
    setNewAttachmentRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              file,
            }
          : row,
      ),
    );
  };

  const handleAddNewAttachmentRow = () => {
    setNewAttachmentRows((previous) => [...previous, emptyNewAttachmentRow()]);
  };

  const handleRemoveNewAttachmentRow = (index) => {
    setNewAttachmentRows((previous) =>
      previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const handleAddChildRow = () => {
    if (activeChildTab === "item") {
      handleAddDetailRow();
    } else if (activeChildTab === "attachment") {
      handleAddNewAttachmentRow();
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Validation */
  /* ---------------------------------------------------------------------- */

  const validate = () => {
    const errors = {};

    if (!header.branch) {
      errors.branch = "Plant is required";
    }

    if (!header.department) {
      errors.department = "Department is required";
    }

    if (!header.preparedBy) {
      errors.preparedBy = "Prepared By is required";
    }

    if (!header.indentDate) {
      errors.indentDate = "Indent Date is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ---------------------------------------------------------------------- */
  /* Save / Update */
  /* ---------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const filesToUpload = newAttachmentRows
        .map((row) => row.file)
        .filter(Boolean);

      const payload = {
        ...(isEditMode && recordId
          ? {
              id: recordId,
            }
          : {}),

        active: header.active,

        approved: header.approved,

        belongsTo: header.belongsTo,

        branch: Number(header.branch),

        indentNo,

        indentDate: header.indentDate,

        byWhom: header.byWhom ? Number(header.byWhom) : null,

        cancelRemarks: header.cancelRemarks,

        createdBy: localStorage.getItem("userName") || "SYSTEM",

        department: Number(header.department),

        preparedBy: Number(header.preparedBy),

        orgId: ORG_ID,

        remarks: header.remarks,

        attachments: existingAttachments,

        details: detailRows.map((row) => ({
          item: Number(row.item),

          primaryUnit: row.primaryUnit ? Number(row.primaryUnit) : null,

          purchaseUnit: row.purchaseUnit ? Number(row.purchaseUnit) : null,

          qtyInPrimaryUnit: Number(row.qtyInPrimaryUnit) || 0,

          conversionFactor: Number(row.conversionFactor) || 0,

          qtyInPurchaseUnit: Number(row.qtyInPurchaseUnit) || 0,

          requiredDate: row.requiredDate || null,

          purpose: row.purpose,
        })),
      };

      const formData = new FormData();

      formData.append(
        "purchaseIndent",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        }),
      );

      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const response =
        await purchaseIndentAPI.updateCreatePurchaseIndent(formData);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) {
          onSave(response?.paramObjectsMap ?? payload);
        }

        if (onBack) {
          onBack();
        }

        return;
      }

      const errorMessage =
        response?.paramObjectsMap?.message ||
        response?.paramObjectsMap?.errorMessage ||
        response?.message ||
        "Failed to save Purchase Indent";

      alert(errorMessage);
    } catch (error) {
      console.error("Purchase Indent Save Error:", error);

      alert("Failed to save Purchase Indent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Loading */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading purchase indent...
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* UI */
  /* ---------------------------------------------------------------------- */

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
          {isEditMode ? "Edit Purchase Indent" : "Purchase Indent"}
        </h2>
      </div>

      {loadError && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-2">
          {loadError}
        </p>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Details */}

        <div>
          <SectionHeader>Indent Details</SectionHeader>

          <div className={fieldGrid}>
            {/* Plant */}

            <Field
              type="select"
              label="Plant"
              name="branch"
              value={header.branch}
              onChange={handleHeaderChange}
              error={fieldErrors.branch}
              options={plantData}
              required
            />

            {/* Indent No */}

            <Field
              label="Indent No"
              name="indentNo"
              value={generatingDocId ? "Generating..." : indentNo}
              onChange={() => {}}
              disabled
            />

            {/* Belongs To */}

            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={belongsToOptions}
            />

            {/* Indent Date */}

            <Field
              type="date"
              label="Indent Date"
              name="indentDate"
              value={header.indentDate}
              onChange={handleHeaderChange}
              error={fieldErrors.indentDate}
              required
            />

            {/* Department */}

            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={departmentData}
              required
            />

            {/* Prepared By */}

            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={preparedByOptions}
              required
            />

            {/* By Whom */}

            <Field
              type="select"
              label="By Whom"
              name="byWhom"
              value={header.byWhom}
              onChange={handleHeaderChange}
              options={byWhomOptions}
            />

            {/* Approved */}

            <div className="w-full">
              <label className={labelClasses}>Approved</label>

              <label className="flex items-center gap-2 h-[30px]">
                <input
                  type="checkbox"
                  name="approved"
                  checked={header.approved}
                  onChange={handleHeaderChange}
                  className="h-4 w-4"
                />

                <span className="text-xs text-gray-700 dark:text-gray-200">
                  {header.approved ? "Yes" : "No"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Child Tabs */}

        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
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

            {(activeChildTab === "item" || activeChildTab === "attachment") && (
              <button
                type="button"
                onClick={handleAddChildRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Item Details */}

          {activeChildTab === "item" && (
            <TableWrapper>
              <TableHead
                headers={[
                  "#",
                  "Item Code",
                  "Item Description",
                  "Primary Unit",
                  "Purchase Unit",
                  "Qty in Primary Unit",
                  "Conversion Factor",
                  "Qty In Purchase Unit",
                  "Required Date",
                  "Purpose",
                  "Action",
                ]}
              />

              <tbody>
                {detailRows.map((row, index) => (
                  <TableRow
                    key={index}
                    index={index}
                    onRemove={() => handleRemoveDetailRow(index)}
                    disabled={detailRows.length <= 1}
                  >
                    {/* Item Code */}

                    <td className="p-1 align-top">
                      <select
                        value={row.item}
                        onChange={(event) =>
                          handleDetailCellChange(
                            index,
                            "item",
                            event.target.value,
                          )
                        }
                        className={cellInputClasses}
                      >
                        <option value="">-- Select --</option>

                        {itemList.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Item Description */}

                    <td className="p-1 align-top">
                      <input
                        value={
                          loadingItemRow === index
                            ? "Loading..."
                            : row.itemDescription
                        }
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

                    {/* Primary Unit */}

                    <td className="p-1 align-top">
                      <input
                        value={row.primaryUnitLabel}
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

                    {/* Purchase Unit */}

                    <td className="p-1 align-top">
                      <input
                        value={row.purchaseUnitLabel}
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

                    {/* Qty Primary */}

                    <td className="p-1 align-top">
                      <input
                        type="number"
                        value={row.qtyInPrimaryUnit}
                        onChange={(event) =>
                          handleDetailCellChange(
                            index,
                            "qtyInPrimaryUnit",
                            event.target.value,
                          )
                        }
                        className={cellInputClasses}
                      />
                    </td>

                    {/* Conversion Factor (saves ID, shows multiplicationFactor) */}

                    <td className="p-1 align-top">
                      <input
                        type="text"
                        value={row.conversionOptions?.[0]?.label ?? ""}
                        readOnly
                        className={cellInputClasses}
                      />
                    </td>

                    {/* Qty In Purchase Unit (user entry) */}

                    <td className="p-1 align-top">
                      <input
                        type="number"
                        value={row.qtyInPurchaseUnit}
                        onChange={(event) =>
                          handleDetailCellChange(
                            index,
                            "qtyInPurchaseUnit",
                            event.target.value,
                          )
                        }
                        className={cellInputClasses}
                      />
                    </td>

                    {/* Required Date */}

                    <td className="p-1 align-top">
                      <input
                        type="date"
                        value={row.requiredDate}
                        onChange={(event) =>
                          handleDetailCellChange(
                            index,
                            "requiredDate",
                            event.target.value,
                          )
                        }
                        className={cellInputClasses}
                      />
                    </td>

                    {/* Purpose */}

                    <td className="p-1 align-top">
                      <input
                        value={row.purpose}
                        onChange={(event) =>
                          handleDetailCellChange(
                            index,
                            "purpose",
                            event.target.value,
                          )
                        }
                        className={cellInputClasses}
                      />
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {/* Attachment */}

          {activeChildTab === "attachment" && (
            <AttachmentTable
              existingAttachments={existingAttachments}
              onRemoveExisting={handleRemoveExistingAttachment}
              newRows={newAttachmentRows}
              onNewFileChange={handleNewAttachmentFileChange}
              onRemoveNewRow={handleRemoveNewAttachmentRow}
            />
          )}

          {/* Summary */}

          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={header.remarks}
                  onChange={handleHeaderChange}
                  className="col-span-2 md:col-span-3 xl:col-span-4"
                />

                <Field
                  type="textarea"
                  label="Cancel Remarks"
                  name="cancelRemarks"
                  value={header.cancelRemarks}
                  onChange={handleHeaderChange}
                  className="col-span-2 md:col-span-3 xl:col-span-4"
                />
              </div>
            </div>
          )}
        </section>

        {/* Buttons */}

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={isEditMode ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default PurchaseIndentForm;
