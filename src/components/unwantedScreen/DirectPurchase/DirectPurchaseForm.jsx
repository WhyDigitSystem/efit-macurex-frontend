import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  UploadCloud,
  Eye,
  File as FileIcon,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import directPurchaseAPI from "../../../api/Purchase/directPurchaseAPI";
import { useToast } from "../../Toast/ToastContext";

/* ========================================================================= */
/* DESIGN TOKENS                                                             */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = parseInt(value, 10);

  return Number.isFinite(number) ? number : fallback;
};

const round2 = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const money = (value) => round2(value).toFixed(2);

const todayISO = () => new Date().toISOString().slice(0, 10);

const isObj = (v) => v !== null && typeof v === "object";

const norm = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

const isNumericLike = (v) => /^\d+$/.test(String(v ?? "").trim());

/* First value that is not undefined / null / "" */
const pick = (...values) => {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
};

/* ID of a backend value that can be an object or a primitive */
const idOf = (v, ...keys) => {
  if (isObj(v)) {
    return pick(...keys.map((k) => v[k]), v.id);
  }
  return v ?? "";
};

const isYes = (v) =>
  v === true || ["true", "yes"].includes(String(v).toLowerCase());

/* ========================================================================= */
/* FIELD COMPONENT                                                           */
/* ========================================================================= */

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
  step,
  min,
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        >
          <option value="">-- Select --</option>

          {(options || []).map((opt) => (
            <option
              key={typeof opt === "object" ? opt.value : opt}
              value={typeof opt === "object" ? opt.value : opt}
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={3}
          disabled={disabled}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-y " +
            "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        step={step}
        min={min}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
      />

      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

/* ========================================================================= */
/* TABLE COMPONENTS                                                          */
/* ========================================================================= */

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs min-w-max">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((header, index) => (
        <th
          key={index}
          className={`p-1.5 whitespace-nowrap text-[10px] font-medium dark:text-white ${
            index === 0 ? "w-8 text-center" : "text-left"
          }`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, onCopy, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>

    {children}

    <td className="p-1 text-center">
      <div className="flex items-center justify-center gap-1">
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="h-5 w-5 rounded text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          >
            <Copy size={10} />
          </button>
        )}

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
      </div>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options, disabled = false }) => (
  <td className="p-0.5 align-top min-w-[110px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className={cellInputClasses}
    >
      <option value="">Select</option>

      {(options || []).map((opt) => (
        <option
          key={typeof opt === "object" ? opt.value : opt}
          value={typeof opt === "object" ? opt.value : opt}
        >
          {typeof opt === "object" ? opt.label : opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({
  value,
  onChange,
  type = "text",
  disabled,
  minWidth = "100px",
  min,
  step,
}) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      min={min}
      step={step}
      className={cellInputClasses}
    />
  </td>
);

const DisplayCell = ({ value, minWidth = "100px" }) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <div
      className={
        `${cellInputClasses} flex items-center bg-gray-100 ` +
        `dark:bg-gray-800 cursor-not-allowed whitespace-nowrap overflow-hidden`
      }
      title={value ?? ""}
    >
      {value ?? ""}
    </div>
  </td>
);

const ToggleButton = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative flex items-center w-10 h-5 rounded-full transition-colors ${
      value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`absolute h-4 w-4 bg-white rounded-full shadow transition-transform ${
        value ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </button>
);

const DynamicTable = ({
  columns,
  rows,
  onCellChange,
  onRemoveRow,
  onCopyRow,
}) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />

    <tbody>
      {rows.map((row, index) => (
        <TableRow
          key={row.id || index}
          index={index}
          onRemove={() => onRemoveRow(index)}
          onCopy={onCopyRow ? () => onCopyRow(index) : undefined}
          disabled={rows.length <= 1}
        >
          {columns.map((column) => {
            if (column.type === "display") {
              return (
                <DisplayCell
                  key={column.key}
                  value={row[column.key]}
                  minWidth={column.minWidth || "100px"}
                />
              );
            }

            if (column.type === "select") {
              return (
                <SelectCell
                  key={column.key}
                  value={row[column.key]}
                  disabled={
                    typeof column.disabled === "function"
                      ? column.disabled(row, index)
                      : column.disabled
                  }
                  onChange={(e) =>
                    onCellChange(index, column.key, e.target.value)
                  }
                  options={
                    typeof column.options === "function"
                      ? column.options(row, index)
                      : column.options
                  }
                />
              );
            }

            return (
              <InputCell
                key={column.key}
                value={row[column.key]}
                type={column.type === "number" ? "number" : "text"}
                disabled={
                  typeof column.disabled === "function"
                    ? column.disabled(row, index)
                    : column.disabled
                }
                min={column.type === "number" ? 0 : undefined}
                step={
                  column.type === "number" ? column.step || "0.01" : undefined
                }
                minWidth={column.minWidth || "100px"}
                onChange={(e) =>
                  onCellChange(index, column.key, e.target.value)
                }
              />
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* STATIC OPTIONS                                                            */
/* ========================================================================= */

const YES_NO = ["Yes", "No"];

const TAX_TYPE_OPTIONS = ["GST", "IGST", "Nil Rated", "Exempted", "Non-GST"];

const PARTICULARS_OPTIONS = ["SGST", "CGST", "IGST", "CESS", "SWS"];

const DEALER_TYPE_OPTIONS = ["Registered", "Unregistered", "Importer"];

const LEDGER_ACCOUNT_OPTIONS = [
  "Input CGST",
  "Input SGST",
  "Input IGST",
  "CENVAT",
  "VAT",
  "Service Tax",
];

const UNIT_OPTIONS = [
  { value: 1000000004, label: "NOS" },
  { value: 1000000005, label: "KG" },
];

/* ========================================================================= */
/* EMPTY ROWS                                                                */
/* ========================================================================= */

const emptyCashRow = () => ({
  id: 0,
  itemCode: "",
  itemDescription: "",
  hsnCode: "",
  taxType: "",
  tax: "",
  unit: "",
  dcQty: "",
  receivedQty: "",
  rate: "",
  amount: "",
  taxDescription: "",
  sgstPerc: "",
  cgstPerc: "",
  igstPerc: "",
});

const emptyTaxRow = () => ({
  id: 0,
  particulars: "",
  taxId: "",
  taxPerc: "",
  acceptedAmt: "",
  revisedAmt: "",
  ledgerAcName: "",
});

const emptyFileRow = () => ({
  name: "",
  file: null,
  filePath: "",
  isExisting: false,
});

/* ========================================================================= */
/* DEFAULT FORM                                                              */
/* ========================================================================= */

const getDefaultValues = (branchId, userName) => ({
  id: 0,
  active: true,

  branch: String(branchId || ""),
  invNo: "",
  invDate: todayISO(),
  belongsTo: "Domestic",
  suppType: "Local",

  supplierCode: "",
  supplierName: "",
  gstnNo: "",
  dealerType: "",
  issueTo: "",

  /* stores ITEM ID (e.g. itemCode 245 -> itemId 1000000011) */
  itemCategory: "",

  taxStructure: "",
  tariffHeading: "",
  creditAcName: "",
  subType: "",
  eccNoStNo: "",
  tallyRefNo: "",

  gstState: "",
  gstStateCode: "",

  financialYear:
    localStorage.getItem("finYear") || String(new Date().getFullYear()),

  isIgstApplicable: "No",
  reverseCharge: "No",

  discount: "",
  preparedBy: "",
  remarks: "",
  cancelRemarks: "",

  createdBy: userName,
});

/* ========================================================================= */
/* EDIT DATA: EXTRACT + MAP                                                  */
/* ========================================================================= */

/*
 * getDirectPurchaseById returns { status, paramObjectsMap: { <someVO>: {...} } }.
 * The key name is not fixed here, so look for a direct-purchase key first and
 * otherwise take the first object / array found in paramObjectsMap.
 */
const extractRecord = (response) => {
  const map = response?.paramObjectsMap || response?.data?.paramObjectsMap;

  if (!map) {
    return isObj(response) && response.id ? response : null;
  }

  let record =
    map.directPurchaseVO ??
    map.directPurchase ??
    map.directPurchaseDTO ??
    Object.values(map).find((v) => isObj(v));

  if (Array.isArray(record)) record = record[0];

  return isObj(record) ? record : null;
};

/* Find an array on the record by exact key first, then by key pattern */
const findArray = (d, exactKeys, regex) => {
  for (const key of exactKeys) {
    if (Array.isArray(d[key])) return d[key];
  }

  const found = Object.keys(d).find(
    (key) => regex.test(key) && Array.isArray(d[key]),
  );

  return found ? d[found] : [];
};

/* Unit can be an object, an ID, or a text like "KG" */
const resolveUnitId = (unit) => {
  if (isObj(unit)) {
    return String(pick(unit.unitId, unit.id));
  }

  if (isNumericLike(unit)) return String(unit);

  if (typeof unit === "string" && unit) {
    const match = UNIT_OPTIONS.find((o) => norm(o.label) === norm(unit));
    return match ? String(match.value) : "";
  }

  return "";
};

const mapEditData = (d, branchId, userName) => {
  const supplierObj = isObj(d.supplier) ? d.supplier : {};

  const formData = {
    ...getDefaultValues(branchId, userName),

    id: d.id || 0,

    active: d.active !== false && String(d.active).toLowerCase() !== "inactive",

    branch: String(pick(idOf(d.branch, "branchId"), d.branchId, branchId, "")),

    invNo: String(pick(d.invNo, d.docNo, d.docId)),

    invDate: String(pick(d.invDate, d.docDate, todayISO())),

    belongsTo: String(pick(d.belongsTo, "Domestic")),

    suppType: String(pick(d.suppType, "Local")),

    supplierCode: String(
      pick(
        typeof d.supplierCode === "string" || typeof d.supplierCode === "number"
          ? d.supplierCode
          : "",
        supplierObj.supplierCode,
        supplierObj.customerCode,
      ),
    ),

    supplierName: String(
      pick(d.supplierName, supplierObj.supplierName, supplierObj.customerName),
    ),

    gstnNo: String(pick(d.gstnNo, d.gstNo, supplierObj.gstNo)),

    dealerType: String(pick(d.dealerType)),

    issueTo: String(pick(d.issueTo)),

    /* ID, or a code/description that is resolved against options later */
    itemCategory: pick(idOf(d.itemCategory, "itemId"), d.itemCategoryId),

    taxStructure: d.taxStructure || "",
    tariffHeading: d.tariffHeading || "",
    creditAcName: d.creditAcName || "",
    subType: d.subType || "",

    eccNoStNo: String(pick(d.eccNoStNo, d.eccNo)),

    tallyRefNo: d.tallyRefNo || "",

    gstState: String(idOf(d.gstState, "stateId")),

    gstStateCode: String(
      pick(d.gstStateCode, isObj(d.gstState) ? d.gstState.stateCode : ""),
    ),

    financialYear: String(
      pick(
        d.financialYear,
        localStorage.getItem("finYear"),
        new Date().getFullYear(),
      ),
    ),

    isIgstApplicable: isYes(pick(d.isIgstApplicable, d.igstApplicable))
      ? "Yes"
      : "No",

    reverseCharge: isYes(pick(d.isReverseCharge, d.reverseCharge))
      ? "Yes"
      : "No",

    discount: d.discount ?? "",

    /* ID, or a name that is resolved against employees later */
    preparedBy: String(idOf(d.preparedBy, "employeeId")),

    remarks: d.remarks || "",

    cancelRemarks: d.cancelRemarks || "",

    createdBy: d.createdBy || userName,
  };

  /* ------------------------------ cash rows ------------------------------ */

  const rawCash = findArray(
    d,
    [
      "directPurchaseCashDetailsVO",
      "directPurchaseCashDetailsDTO",
      "cashItems",
      "cashDetails",
    ],
    /cash/i,
  );

  const cashRows = rawCash.length
    ? rawCash.map((row) => {
        const qty = toNumber(pick(row.receivedQty, row.dcQty, row.qty));
        const rate = toNumber(row.rate);

        return {
          ...emptyCashRow(),

          id: row.id ?? 0,

          itemCode: String(
            pick(isObj(row.itemCode) ? row.itemCode.itemCode : row.itemCode),
          ),

          itemDescription: String(
            pick(
              row.itemDescription,
              row.description,
              isObj(row.itemCode) ? row.itemCode.itemDescription : "",
            ),
          ),

          hsnCode: String(pick(row.hsnCode, row.hsn, row.hsnSacCode)),

          taxType: row.taxType || "",

          tax: pick(row.tax, row.taxPerc, row.taxPercentage),

          unit: resolveUnitId(row.unit),

          dcQty: pick(row.dcQty, row.qty),

          receivedQty: row.receivedQty ?? "",

          rate: row.rate ?? "",

          amount: pick(row.amount, qty && rate ? money(qty * rate) : ""),

          taxDescription: row.taxDescription || "",

          sgstPerc: row.sgstPerc ?? "",
          cgstPerc: row.cgstPerc ?? "",
          igstPerc: row.igstPerc ?? "",
        };
      })
    : [emptyCashRow()];

  /* ------------------------------ tax rows ------------------------------- */

  const rawTax = findArray(
    d,
    [
      "directPurchaseTaxDetailsVO",
      "directPurchaseTaxDetailsDTO",
      "taxDetails",
      "taxDetailsVO",
    ],
    /taxdetail/i,
  );

  const taxRows = rawTax.length
    ? rawTax.map((row) => ({
        ...emptyTaxRow(),

        id: row.id ?? 0,

        particulars: String(pick(row.particulars)),

        taxId: String(pick(row.taxId)),

        taxPerc: pick(row.taxPerc, row.tax),

        acceptedAmt: pick(row.acceptedAmt, row.acceptedQtyAmount),

        revisedAmt: pick(row.revisedAmt, row.revisedAmount),

        ledgerAcName: row.ledgerAcName || "",
      }))
    : [emptyTaxRow()];

  /* ----------------------------- attachments ----------------------------- */

  const rawFiles = findArray(
    d,
    ["attachments", "directPurchaseAttachmentVO", "files"],
    /attach|file/i,
  );

  const fileRows = rawFiles.length
    ? rawFiles.map((f) => ({
        id: f.id,
        name: String(pick(f.name, f.fileName, f.attachmentName)),
        file: null,
        filePath: String(pick(f.filePath, f.path, f.url)),
        isExisting: true,
      }))
    : [emptyFileRow()];

  return { formData, cashRows, taxRows, fileRows };
};

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const DirectPurchaseForm = ({ data: editData, onBack }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));

  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const USER_NAME =
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "SYSTEM";

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  /* ----------------------------------------------------------------------- */
  /* FORM STATE                                                              */
  /* ----------------------------------------------------------------------- */

  /*
   * Initial values come from the list row (fallback). In edit mode they are
   * replaced by the getDirectPurchaseById response as soon as it arrives.
   */
  const [mapped] = useState(() =>
    isEditMode ? mapEditData(editData, BRANCH_ID, USER_NAME) : null,
  );

  const [formData, setFormData] = useState(() =>
    mapped ? mapped.formData : getDefaultValues(BRANCH_ID, USER_NAME),
  );

  const effectiveBranchId = toInteger(formData.branch || BRANCH_ID);

  const [cashRows, setCashRows] = useState(
    mapped ? mapped.cashRows : [emptyCashRow()],
  );

  const [taxRows, setTaxRows] = useState(
    mapped ? mapped.taxRows : [emptyTaxRow()],
  );

  const [fileRows, setFileRows] = useState(
    mapped ? mapped.fileRows : [emptyFileRow()],
  );

  const [loadingData, setLoadingData] = useState(isEditMode);

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA                                                             */
  /* ----------------------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState("cashDetail");

  const [branchOptions, setBranchOptions] = useState([]);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [supplierOptions, setSupplierOptions] = useState([]);

  const [issueToOptions, setIssueToOptions] = useState([]);

  const [gstStateOptions, setGstStateOptions] = useState([]);

  const [belongsToOptions, setBelongsToOptions] = useState([]);

  /* Item Category options come from getItemType: value = itemId, label = code */
  const [itemTypeOptions, setItemTypeOptions] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generatingDocId, setGeneratingDocId] = useState(false);

  /* ========================================================================= */
  /* EDIT: LOAD BY ID                                                          */
  /* ========================================================================= */

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadById = async () => {
      setLoadingData(true);

      try {
        const response = await directPurchaseAPI.getDirectPurchaseById(
          editData.id,
        );

        console.log("Get Direct Purchase By ID Response:", response);

        const record = extractRecord(response);

        if (!record) {
          console.error("Direct purchase record not found in response");
          addToast("Direct Purchase data not found", "error");
          return;
        }

        console.log("Direct Purchase record:", record);

        const result = mapEditData(record, BRANCH_ID, USER_NAME);

        if (cancelled) return;

        console.log("Mapped Direct Purchase form data:", result);

        setFormData(result.formData);
        setCashRows(result.cashRows);
        setTaxRows(result.taxRows);
        setFileRows(result.fileRows);
      } catch (error) {
        console.error("Failed to load Direct Purchase by ID:", error);

        if (!cancelled) {
          addToast("Failed to load Direct Purchase data", "error");
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadById();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editData?.id]);

  /* ========================================================================= */
  /* MASTER DATA LOADERS                                                       */
  /* ========================================================================= */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((branch) => ({
          value: branch.id,

          label:
            branch.branchName ||
            branch.name ||
            branch.branchCode ||
            `Branch ${branch.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);

      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.employees ||
          response?.paramObjectsMap?.employeeVO ||
          [];

      setEmployeeOptions(
        list.map((employee) => ({
          value: employee.id,

          label:
            employee.employeeName || employee.name || `Employee ${employee.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);

      setEmployeeOptions([]);
    }
  }, [ORG_ID]);

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.listValues ||
          response?.paramObjectsMap?.values ||
          response?.paramObjectsMap?.listValueDetails ||
          [];

      setBelongsToOptions(
        list
          .map((item) => {
            const value =
              item?.valuesDescription ||
              item?.valueDescription ||
              item?.description ||
              item?.value ||
              "";

            return { value, label: value };
          })
          .filter((item) => item.value),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);

      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  const loadGstStates = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        setGstStateOptions([]);
        return;
      }

      const response = await directPurchaseAPI.getGSTStateMasterByOrgId(
        effectiveBranchId,
        ORG_ID,
      );

      const list = Array.isArray(response) ? response : [];

      setGstStateOptions(
        list.map((item) => ({
          value: item.id,
          label: item.stateName || "",
          code: item.stateCode || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load GST states:", error);

      setGstStateOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadSuppliers = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        setSupplierOptions([]);
        return;
      }

      const response = await directPurchaseAPI.getSupplierDetails(
        effectiveBranchId,
        ORG_ID,
      );

      const result = response?.data ?? response;

      const list =
        result?.paramObjectsMap?.mapp ||
        result?.paramObjectsMap?.supplierVO ||
        result?.paramObjectsMap?.suppliers ||
        (Array.isArray(result) ? result : []);

      setSupplierOptions(
        list.map((supplier) => ({
          value: supplier.supplierId || supplier.id,

          label: supplier.supplierCode || "",

          supplierCode: supplier.supplierCode || "",

          supplierName: supplier.supplierName || "",

          gstNo: supplier.gstNo || supplier.gstnNo || supplier.gstinNo || "",

          isRegistered:
            supplier.isRegistered === true ||
            String(supplier.isRegistered).toLowerCase() === "true",
        })),
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);

      setSupplierOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadIssueTo = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        setIssueToOptions([]);
        return;
      }

      const response = await directPurchaseAPI.getIssueTo(
        effectiveBranchId,
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.mapp ||
          response?.paramObjectsMap?.issueTo ||
          [];

      setIssueToOptions(
        list.map((item) => ({
          value: item.issueTo || item.id || "",

          label: item.issueTo || item.name || item.description || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load Issue To:", error);

      setIssueToOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadItemTypes = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        setItemTypeOptions([]);
        return;
      }

      const list = await directPurchaseAPI.getItemType(
        effectiveBranchId,
        ORG_ID,
      );

      setItemTypeOptions(
        (Array.isArray(list) ? list : [])
          .filter((item) => item?.itemId !== null && item?.itemId !== undefined)
          .map((item) => ({
            value: item.itemId,

            label: item.itemCode || "",

            itemDescription: item.itemDescription || "",
          })),
      );
    } catch (error) {
      console.error("Failed to load item types:", error);

      setItemTypeOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  /* ========================================================================= */
  /* MASTER DATA USE EFFECTS                                                   */
  /* ========================================================================= */

  useEffect(() => {
    loadBranches();
    loadEmployees();
    loadBelongsTo();
  }, [loadBranches, loadEmployees, loadBelongsTo]);

  useEffect(() => {
    loadSuppliers();
    loadIssueTo();
    loadGstStates();
    loadItemTypes();
  }, [loadSuppliers, loadIssueTo, loadGstStates, loadItemTypes]);

  /* GST State code follows the selected GST State */
  useEffect(() => {
    if (!formData.gstState) return;

    const selected = gstStateOptions.find(
      (option) => String(option.value) === String(formData.gstState),
    );

    if (selected?.code && selected.code !== formData.gstStateCode) {
      setFormData((previous) => ({
        ...previous,
        gstStateCode: selected.code,
      }));
    }
  }, [formData.gstState, formData.gstStateCode, gstStateOptions]);

  /* ========================================================================= */
  /* EDIT: RESOLVE SAVED VALUES AGAINST LOADED OPTIONS                         */
  /* ========================================================================= */

  /*
   * Item Category / Prepared By / GST State:
   * if the saved value is not an option value (for example the backend sent a
   * code or a name), match it by label and swap in the option value.
   *
   * Supplier: fills name / GSTN from the supplier list when they are empty.
   *
   * Only empty or unmatched values are touched, so user edits are kept.
   */
  useEffect(() => {
    if (!isEditMode || loadingData) return;

    setFormData((previous) => {
      let next = previous;

      const set = (field, value) => {
        if (next === previous) next = { ...previous };
        next[field] = value;
      };

      const resolve = (field, options, extraKeys = []) => {
        const current = previous[field];

        if (current === "" || current === null || current === undefined) return;
        if (!options.length) return;

        if (options.some((o) => String(o.value) === String(current))) return;

        const match = options.find((o) =>
          [o.label, ...extraKeys.map((k) => o[k])]
            .filter(Boolean)
            .some((text) => norm(text) === norm(current)),
        );

        if (match) set(field, match.value);
      };

      resolve("itemCategory", itemTypeOptions, ["itemDescription"]);
      resolve("preparedBy", employeeOptions);
      resolve("gstState", gstStateOptions, ["code"]);

      /* Supplier */
      if (supplierOptions.length && previous.supplierCode) {
        const supplier = supplierOptions.find(
          (o) =>
            norm(o.supplierCode) === norm(previous.supplierCode) ||
            String(o.value) === String(previous.supplierCode),
        );

        if (supplier) {
          if (norm(previous.supplierCode) !== norm(supplier.supplierCode)) {
            set("supplierCode", supplier.supplierCode);
          }

          if (!previous.supplierName && supplier.supplierName) {
            set("supplierName", supplier.supplierName);
          }

          if (!previous.gstnNo && supplier.gstNo) {
            set("gstnNo", supplier.gstNo);
          }
        }
      }

      return next;
    });
  }, [
    isEditMode,
    loadingData,
    itemTypeOptions,
    employeeOptions,
    gstStateOptions,
    supplierOptions,
  ]);

  /* ========================================================================= */
  /* DOC NUMBER                                                                */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    if (!ORG_ID || !formData.financialYear) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await directPurchaseAPI.getDirectPurchaseDocId(
          formData.financialYear,
          ORG_ID,
        );

        if (!cancelled) {
          setFormData((previous) => ({
            ...previous,
            invNo: docId || "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating Doc No:", error);

          addToast("Failed to generate document number", "error");
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
  }, [isEditMode, ORG_ID, formData.financialYear]);

  /* ========================================================================= */
  /* FIELD CHANGE                                                              */
  /* ========================================================================= */

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (name === "branch") {
      setFormData((previous) => ({
        ...previous,

        branch: value,

        supplierCode: "",
        supplierName: "",

        gstnNo: "",
        dealerType: "",

        issueTo: "",
        itemCategory: "",
      }));

      setSupplierOptions([]);
      setIssueToOptions([]);
      setItemTypeOptions([]);

      return;
    }

    /* `value` is the supplier id; the form stores the supplier CODE */
    if (name === "supplierCode") {
      const selected = supplierOptions.find(
        (option) => String(option.value) === String(value),
      );

      setFormData((previous) => ({
        ...previous,

        supplierCode: selected?.supplierCode || "",

        supplierName: selected?.supplierName || "",

        gstnNo: selected?.gstNo || "",

        dealerType: selected?.isRegistered ? "Registered" : "Unregistered",

        isIgstApplicable: selected?.isRegistered ? "Yes" : "No",
      }));

      return;
    }

    /* `value` is the itemId */
    if (name === "itemCategory") {
      setFormData((previous) => ({
        ...previous,
        itemCategory: value ? Number(value) : "",
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================================================= */
  /* CASH DETAIL                                                               */
  /* ========================================================================= */

  const handleCashCellChange = (index, key, value) => {
    setCashRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const updated = { ...row, [key]: value };

        if (key === "dcQty" || key === "receivedQty" || key === "rate") {
          const qty = toNumber(updated.receivedQty || updated.dcQty);

          updated.amount = money(qty * toNumber(updated.rate));
        }

        if (key === "taxType") {
          if (value === "GST") {
            updated.tax = "18";
            updated.sgstPerc = "9";
            updated.cgstPerc = "9";
            updated.igstPerc = "0";
            updated.taxDescription = "GST";
          } else if (value === "IGST") {
            updated.tax = "18";
            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "18";
            updated.taxDescription = "IGST";
          } else {
            updated.tax = "0";
            updated.sgstPerc = "0";
            updated.cgstPerc = "0";
            updated.igstPerc = "0";
            updated.taxDescription = value || "";
          }
        }

        return updated;
      }),
    );
  };

  const addCashRow = () =>
    setCashRows((previous) => [...previous, emptyCashRow()]);

  const removeCashRow = (index) => {
    setCashRows((previous) =>
      previous.length <= 1
        ? previous
        : previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const copyCashRow = (index) => {
    setCashRows((previous) => [...previous, { ...previous[index], id: 0 }]);
  };

  /* ========================================================================= */
  /* TOTALS                                                                    */
  /* ========================================================================= */

  const grossAmount = useMemo(
    () => round2(cashRows.reduce((sum, row) => sum + toNumber(row.amount), 0)),
    [cashRows],
  );

  const taxTotal = useMemo(
    () =>
      round2(taxRows.reduce((sum, row) => sum + toNumber(row.revisedAmt), 0)),
    [taxRows],
  );

  const discountAmount = toNumber(formData.discount);

  const afterDiscountTotal = round2(grossAmount - discountAmount);

  const finalTotal = round2(afterDiscountTotal + taxTotal);

  /* ========================================================================= */
  /* TAX DETAILS                                                               */
  /* ========================================================================= */

  const handleTaxCellChange = (index, key, value) => {
    setTaxRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const updated = { ...row, [key]: value };

        if (key === "taxPerc") {
          const tax = Math.max(0, toNumber(value));

          updated.acceptedAmt = money(grossAmount);

          updated.revisedAmt = money((grossAmount * tax) / 100);
        }

        return updated;
      }),
    );
  };

  /* Keep tax amounts in step with the gross amount */
  useEffect(() => {
    setTaxRows((previous) => {
      const next = previous.map((row) => {
        if (row.taxPerc === "" || row.taxPerc === null) return row;

        const accepted = money(grossAmount);

        const revised = money(
          (grossAmount * Math.max(0, toNumber(row.taxPerc))) / 100,
        );

        if (row.acceptedAmt === accepted && row.revisedAmt === revised) {
          return row;
        }

        return { ...row, acceptedAmt: accepted, revisedAmt: revised };
      });

      return next.some((row, index) => row !== previous[index])
        ? next
        : previous;
    });
  }, [grossAmount]);

  const addTaxRow = () =>
    setTaxRows((previous) => [...previous, emptyTaxRow()]);

  const removeTaxRow = (index) => {
    setTaxRows((previous) =>
      previous.length <= 1
        ? previous
        : previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  /* ========================================================================= */
  /* ATTACHMENTS                                                               */
  /* ========================================================================= */

  const handleFileSelect = (index, file) => {
    if (!file) return;

    setFileRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, file, name: file.name, filePath: "", isExisting: false }
          : row,
      ),
    );
  };

  const handleAddFileRow = () =>
    setFileRows((previous) => [...previous, emptyFileRow()]);

  const handleRemoveFileRow = (index) => {
    setFileRows((previous) =>
      previous.length <= 1
        ? previous
        : previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const handleViewFile = (row) => {
    if (row.file) {
      const url = URL.createObjectURL(row.file);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => URL.revokeObjectURL(url), 10000);

      return;
    }

    /* Saved attachment: open through the view-file endpoint */
    if (row.isExisting && row.filePath) {
      const url = /^https?:/i.test(row.filePath)
        ? row.filePath
        : directPurchaseAPI.getViewFileUrl(row.filePath);

      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!formData.branch) errors.branch = "Plant ID is required";

    if (!formData.invDate) errors.invDate = "Doc Date is required";

    if (!formData.supplierCode)
      errors.supplierCode = "Supplier Code is required";

    if (!formData.issueTo) errors.issueTo = "Issue To is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields correctly", "error");

      return false;
    }

    return true;
  };

  /* ========================================================================= */
  /* SAVE                                                                      */
  /* ========================================================================= */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const directPurchaseCashDetailsDTO = cashRows
        .filter((row) => String(row.itemCode || "").trim())
        .map((row) => ({
          itemCode: row.itemCode || "",

          itemDescription: row.itemDescription || "",

          dcQty: toNumber(row.dcQty),

          hsnCode: row.hsnCode || "",

          unit: toInteger(row.unit),

          receivedQty: toNumber(row.receivedQty),

          rate: toNumber(row.rate),

          tax: toNumber(row.tax),

          taxType: row.taxType || "",
        }));

      const directPurchaseTaxDetailsDTO = taxRows
        .filter((row) => String(row.particulars || "").trim())
        .map((row) => ({
          acceptedQtyAmount: toNumber(row.acceptedAmt),

          particulars: row.particulars || "",

          revisedAmount: toNumber(row.revisedAmt),

          tax: toNumber(row.taxPerc),

          taxId: row.taxId || row.particulars || "",
        }));

      const payload = {
        ...(isEditMode && { id: toInteger(formData.id) }),

        active: formData.active !== false,

        belongsTo: formData.belongsTo || "Domestic",

        branch: toInteger(formData.branch),

        cancelRemarks: formData.cancelRemarks || "",

        createdBy: formData.createdBy || USER_NAME,

        dealerType: formData.dealerType || "",

        directPurchaseCashDetailsDTO,

        directPurchaseTaxDetailsDTO,

        eccNoStNo: formData.eccNoStNo || "",

        financialYear:
          formData.financialYear || localStorage.getItem("finYear") || "",

        gstState: toInteger(formData.gstState),

        gstStateCode: formData.gstStateCode || "",

        gstnNo: formData.gstnNo || "",

        invDate: formData.invDate || "",

        invNo: formData.invNo || "",

        isIgstApplicable: formData.isIgstApplicable === "Yes" ? "Yes" : "No",

        isReverseCharge: formData.reverseCharge === "Yes" ? "Yes" : "No",

        issueTo: formData.issueTo || "",

        /* itemId returned by getItemType() */
        itemCategory: toInteger(formData.itemCategory),

        orgId: ORG_ID,

        preparedBy: toInteger(formData.preparedBy),

        remarks: formData.remarks || "",

        suppType: formData.suppType || "Local",

        supplierCode: formData.supplierCode || "",

        supplierName: formData.supplierName || "",

        taxStructure: formData.taxStructure || "",

        tariffHeading: formData.tariffHeading || "",

        creditAcName: formData.creditAcName || "",

        subType: formData.subType || "",

        tallyRefNo: formData.tallyRefNo || "",

        basicAmount: grossAmount,

        discount: discountAmount,

        afterDiscountTotal,

        totalAmount: finalTotal,
      };

      /* Only newly selected files are uploaded */
      const files = fileRows
        .filter((row) => row.file instanceof File)
        .map((row) => row.file);

      const response = await directPurchaseAPI.createUpdateDirectPurchase(
        payload,
        files,
      );

      const success =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (success) {
        addToast(
          isEditMode
            ? "Direct Purchase updated successfully"
            : "Direct Purchase created successfully",
          "success",
        );

        if (onBack) onBack();
      } else {
        addToast(
          response?.paramObjectsMap?.errorMessage ||
            response?.paramObjectsMap?.message ||
            response?.message ||
            "Failed to save Direct Purchase",
          "error",
        );
      }
    } catch (error) {
      console.error(
        "DIRECT PURCHASE SAVE ERROR:",
        error?.response?.data || error,
      );

      const backendData = error?.response?.data;

      addToast(
        backendData?.message ||
          backendData?.errorMessage ||
          backendData?.paramObjectsMap?.errorMessage ||
          (typeof backendData === "string" ? backendData : "") ||
          error?.message ||
          "Failed to save Direct Purchase",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* TABS & COLUMNS                                                            */
  /* ========================================================================= */

  const TABS = [
    { key: "cashDetail", label: "1-Cash Detail" },
    { key: "taxDetails", label: "2-Tax Details" },
    { key: "summary", label: "3-Summary" },
    { key: "attachments", label: "4-Attached Invoice Copy" },
  ];

  const cashColumns = [
    { key: "itemCode", label: "Item Code", type: "text" },

    {
      key: "itemDescription",
      label: "Item Description",
      type: "text",
      minWidth: "170px",
    },

    { key: "hsnCode", label: "HSN/SAC Code", type: "text" },

    {
      key: "taxType",
      label: "Tax Type",
      type: "select",
      options: TAX_TYPE_OPTIONS,
    },

    { key: "tax", label: "Tax %", type: "display", minWidth: "70px" },

    { key: "unit", label: "Unit", type: "select", options: UNIT_OPTIONS },

    { key: "dcQty", label: "DC Qty", type: "number", step: "1" },

    { key: "receivedQty", label: "Received Qty", type: "number", step: "1" },

    { key: "rate", label: "Rate", type: "number" },

    { key: "amount", label: "Amount", type: "display" },
  ];

  const taxColumns = [
    {
      key: "particulars",
      label: "Particulars",
      type: "select",
      options: PARTICULARS_OPTIONS,
    },

    { key: "taxId", label: "Tax ID", type: "text" },

    { key: "taxPerc", label: "Tax %", type: "number" },

    { key: "acceptedAmt", label: "Accepted Amount", type: "display" },

    { key: "revisedAmt", label: "Revised Amount", type: "display" },

    {
      key: "ledgerAcName",
      label: "Ledger Account",
      type: "select",
      options: LEDGER_ACCOUNT_OPTIONS,
      minWidth: "130px",
    },
  ];

  const supplierSelectValue =
    supplierOptions.find(
      (option) => String(option.supplierCode) === String(formData.supplierCode),
    )?.value || "";

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  if (loadingData) {
    return (
      <div className="p-2 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Direct Purchase" : "Add Direct Purchase"}
        </h2>

        <div className="ml-auto flex items-center gap-2">
          <span className={labelClasses + " mb-0"}>Active</span>

          <ToggleButton
            value={formData.active}
            onChange={(value) =>
              setFormData((previous) => ({ ...previous, active: value }))
            }
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* HEADER */}
        <div>
          <SectionHeader>Direct Purchase</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={formData.branch}
              onChange={handleFieldChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
            />

            <Field
              label="Doc No"
              name="invNo"
              value={generatingDocId ? "Generating..." : formData.invNo}
              onChange={() => {}}
              disabled
            />

            <Field
              type="date"
              label="Doc Date"
              name="invDate"
              value={formData.invDate}
              onChange={handleFieldChange}
              error={fieldErrors.invDate}
              required
            />

            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={formData.belongsTo}
              onChange={handleFieldChange}
              options={belongsToOptions}
            />

            <Field
              type="select"
              label="Supplier Code"
              name="supplierCode"
              value={supplierSelectValue}
              onChange={handleFieldChange}
              error={fieldErrors.supplierCode}
              options={supplierOptions}
              required
            />

            <Field
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleFieldChange}
              disabled
            />

            <Field
              label="GSTN No"
              name="gstnNo"
              value={formData.gstnNo}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="Dealer Type"
              name="dealerType"
              value={formData.dealerType}
              onChange={handleFieldChange}
              options={DEALER_TYPE_OPTIONS}
            />

            <Field
              type="select"
              label="Item Category"
              name="itemCategory"
              value={formData.itemCategory}
              onChange={handleFieldChange}
              options={itemTypeOptions}
            />

            <Field
              type="select"
              label="Issue To"
              name="issueTo"
              value={formData.issueTo}
              onChange={handleFieldChange}
              error={fieldErrors.issueTo}
              options={issueToOptions}
              required
            />

            <Field
              type="select"
              label="GST State"
              name="gstState"
              value={formData.gstState}
              onChange={handleFieldChange}
              options={gstStateOptions}
            />

            <Field
              label="GST State Code"
              name="gstStateCode"
              value={formData.gstStateCode}
              onChange={handleFieldChange}
              disabled
            />

            <Field
              label="ECC No./S.T. No"
              name="eccNoStNo"
              value={formData.eccNoStNo}
              onChange={handleFieldChange}
            />

            <Field
              label="Tally Ref No"
              name="tallyRefNo"
              value={formData.tallyRefNo}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="Is IGST Applicable"
              name="isIgstApplicable"
              value={formData.isIgstApplicable}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              type="select"
              label="Is Reverse Charge"
              name="reverseCharge"
              value={formData.reverseCharge}
              onChange={handleFieldChange}
              options={YES_NO}
            />
          </div>
        </div>

        {/* TABS */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "cashDetail" && (
              <button
                type="button"
                onClick={addCashRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

            {activeTab === "taxDetails" && (
              <button
                type="button"
                onClick={addTaxRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

            {activeTab === "attachments" && (
              <button
                type="button"
                onClick={handleAddFileRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* CASH DETAIL */}
          {activeTab === "cashDetail" && (
            <>
              <DynamicTable
                columns={cashColumns}
                rows={cashRows}
                onCellChange={handleCashCellChange}
                onRemoveRow={removeCashRow}
                onCopyRow={copyCashRow}
              />

              <div className="flex justify-end mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Gross Amount:
                <span className="font-semibold ml-1">{money(grossAmount)}</span>
              </div>
            </>
          )}

          {/* TAX DETAILS */}
          {activeTab === "taxDetails" && (
            <>
              <DynamicTable
                columns={taxColumns}
                rows={taxRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={removeTaxRow}
              />

              <div className="flex justify-end gap-4 px-1 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Gross:
                  <strong className="ml-1">{money(grossAmount)}</strong>
                </span>

                <span>
                  Tax:
                  <strong className="ml-1">{money(taxTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {/* SUMMARY */}
          {activeTab === "summary" && (
            <div className="pt-2 space-y-3">
              <div className={fieldGrid}>
                <Field
                  label="Basic Amount"
                  name="basicAmount"
                  value={money(grossAmount)}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  label="Discount"
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={handleFieldChange}
                />

                <Field
                  label="After Discount Total"
                  name="afterDiscountTotal"
                  value={money(afterDiscountTotal)}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  label="Total Amount"
                  name="totalAmount"
                  value={money(finalTotal)}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={handleFieldChange}
                  options={employeeOptions}
                />
              </div>

              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />

                <Field
                  type="textarea"
                  label="Cancel Remarks"
                  name="cancelRemarks"
                  value={formData.cancelRemarks}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />
              </div>
            </div>
          )}

          {/* ATTACHMENTS */}
          {activeTab === "attachments" && (
            <TableWrapper>
              <TableHead
                headers={["#", "File Name", "Attachment", "View", "Action"]}
              />

              <tbody>
                {fileRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-1 text-center font-medium dark:text-white text-[10px]">
                      {index + 1}
                    </td>

                    <td className="p-1 align-top">
                      <input
                        type="text"
                        value={row.name}
                        readOnly
                        placeholder="No file selected"
                        className={cellInputClasses}
                      />
                    </td>

                    <td className="p-1 align-top">
                      <label className="flex items-center justify-center gap-1 h-8 px-2 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors">
                        <UploadCloud size={12} />

                        {row.name ? "Replace file" : "Click to upload"}

                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            handleFileSelect(index, e.target.files?.[0])
                          }
                        />
                      </label>
                    </td>

                    <td className="p-1 text-center">
                      {(row.isExisting || row.file) && (
                        <button
                          type="button"
                          onClick={() => handleViewFile(row)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          {row.isExisting ? (
                            <Eye size={14} />
                          ) : (
                            <FileIcon size={14} />
                          )}
                        </button>
                      )}
                    </td>

                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFileRow(index)}
                        disabled={fileRows.length <= 1}
                        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                          fileRows.length <= 1
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
          )}
        </section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />

            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectPurchaseForm;
