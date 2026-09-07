import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { subContractingGrnAPI } from "../../../api/Inventory/subContractingGrnAPI";
import itemAPI from "../../../api/itemAPI";

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
  "w-full min-w-[110px] h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full min-w-[110px] h-[30px] px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const cellErrClasses = " border-red-500 dark:border-red-500";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-3 items-start";

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
  rows = 3,
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
            <option key={opt} value={opt}>
              {opt}
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
          rows={rows}
          className={
            "w-full px-2 rounded border text-xs transition-colors " +
            (rows === 1
              ? "h-[30px] py-0 leading-none resize-y "
              : "py-1.5 leading-snug resize-none ") +
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
          className={`p-3 whitespace-nowrap ${
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
    <td className="p-3 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-3 text-center">
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

/* File upload cell: drag-and-drop or click-to-upload, shown inline inside
   a table row (matches the upload format used across the app). */
const UploadCell = ({ file, onFileChange }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const displayName =
    file instanceof File
      ? file.name
      : file?.name || "Click or drop a file";

  return (
    <td className="p-3 align-top">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFileChange(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-2 rounded-md border-2 border-dashed px-3 py-2 cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
      >
        <UploadCloud className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
        <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
          {displayName}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileChange(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </td>
  );
};

/* Generic dynamic table body. Supports text / select / date / number / readonly
   / upload columns. Pass `lookup` to auto-fill sibling columns when a given
   column changes. Pass `errorRowIndexes` to highlight the mandatory cells of
   invalid rows with a red border (shown only after a failed submit). */
const DynamicTable = ({
  columns,
  rows,
  onCellChange,
  onRemoveRow,
  errorRowIndexes = [],
}) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, idx) => {
        const isError = errorRowIndexes.includes(idx);

        return (
          <TableRow
            key={idx}
            index={idx}
            onRemove={() => onRemoveRow(idx)}
            disabled={rows.length <= 1}
          >
            {columns.map((col) =>
              col.type === "upload" ? (
                <UploadCell
                  key={col.key}
                  file={row[col.key]}
                  onFileChange={(f) => onCellChange(idx, col.key, f)}
                />
              ) : (
                <td className="p-3 align-top" key={col.key}>
                  {col.type === "select" ? (
                    <select
                      value={row[col.key]}
                      onChange={(e) =>
                        onCellChange(idx, col.key, e.target.value)
                      }
                      className={`${cellInputClasses} ${
                        isError ? cellErrClasses : ""
                      }`}
                    >
                      <option value="">-- Select --</option>
                      {(col.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={
                        ["date", "number", "time"].includes(col.type)
                          ? col.type
                          : "text"
                      }
                      value={row[col.key]}
                      readOnly={col.readOnly}
                      onChange={(e) =>
                        onCellChange(idx, col.key, e.target.value)
                      }
                      className={
                        col.readOnly
                          ? cellReadOnlyClasses
                          : `${cellInputClasses} ${
                              isError ? cellErrClasses : ""
                            }`
                      }
                    />
                  )}
                </td>
              ),
            )}
          </TableRow>
        );
      })}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Item master lookups (swap for real API-driven catalogs)                     */

const INCOMING_ITEM_MASTER = {
  "RM-001": {
    stk: "STK-1001",
    incomingItemDesc: "Raw Material - Steel Sheet",
    tolerance: "2",
    primaryUnit: "KG",
  },
  "RM-002": {
    stk: "STK-1002",
    incomingItemDesc: "Raw Material - Aluminium Rod",
    tolerance: "1.5",
    primaryUnit: "KG",
  },
  "COMP-001": {
    stk: "STK-1003",
    incomingItemDesc: "Component - Bracket Assembly",
    tolerance: "0",
    primaryUnit: "NOS",
  },
};
const INCOMING_ITEM_CODES = Object.keys(INCOMING_ITEM_MASTER);

const OUTGOING_ITEM_MASTER = {
  "FG-001": {
    bflag: "Y",
    gcontrol1: "GC-01",
    outgoingItemDesc: "Finished Good - Assembled Unit",
    unit: "NOS",
    itemType: "Finished Good",
    bomQty: "1",
    availableStock: "500",
    bomScrap: "2",
    rate: "150.00",
  },
  "SF-001": {
    bflag: "N",
    gcontrol1: "GC-02",
    outgoingItemDesc: "Semi-Finished - Machined Part",
    unit: "NOS",
    itemType: "Semi-Finished",
    bomQty: "1",
    availableStock: "1200",
    bomScrap: "1",
    rate: "80.00",
  },
};
const OUTGOING_ITEM_CODES = Object.keys(OUTGOING_ITEM_MASTER);

/* ---------------------------------------------------------------------------- */
/* Options (swap for real API-driven lists)                                    */

const PLANT_IDS = ["BANGALORE", "CHENNAI", "PUNE", "DELHI"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const DEPARTMENTS = ["Purchase", "Stores", "Quality", "Production", "Finance"];
const GATE_PASS_NOS = ["GP-1001", "GP-1002", "GP-1003", "GP-1004"];
const SCHEDULE_NOS = ["SCH-2026-001", "SCH-2026-002", "SCH-2026-003"];
const JOB_ORDER_NOS = ["JO-2026-001", "JO-2026-002", "JO-2026-003"];
const YES_NO = ["YES", "NO"];
const VENDOR_LOCATIONS = ["Local", "Inter-State", "SEZ", "Overseas"];
const GST_TYPES = ["Registered", "Unregistered"];
const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const TAX_PARTICULARS = [
  "JOB WORK",
  "SERVICE CHARGES",
  "SCRAP VALUE",
  "OTHER",
];

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                     */

const toNum = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const round2 = (value) => Math.round(value * 100) / 100;

const pad2 = (value) => String(value).padStart(2, "0");

const nowTime = () => {
  const date = new Date();
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
    date.getSeconds(),
  )}`;
};

const nowDate = () => new Date().toISOString().slice(0, 10);

const generateScGrnNo = () => {
  const date = new Date();
  const stamp = `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(
    date.getDate(),
  )}-${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(
    date.getSeconds(),
  )}`;
  return `SCGRN-${stamp}`;
};

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyGeneralInfo = () => ({
  plantId: "",
  belongsTo: "",
  department: "",
  vendorId: "",
  vendorLocation: "",
  vendorName: "",
  gatePassNo: "",
  scheduleNo: "",
  rework: "",
  date: "",
  schStartDate: "",
  schEndDate: "",
  contractNo: "",
  supplierDcNo: "",
  supplierDcDate: "",
  grnClearTime: "",
  scGrnNo: "",
  gstState: "",
  gstnNo: "",
  gstType: "",
  isIgstAppl: "",
  serviceName: "",
  sacCode: "",
  taxType: "",
  taxPercent: "",
  taxCode: "",
});

const emptyGrnDetailRow = () => ({
  incomingItemCode: "",
  stk: "",
  incomingItemDesc: "",
  tolerance: "",
  primaryUnit: "",
  stock: "NO",
  jobOrderNo: "",
  jobOrderQty: "",
  joRate: "",
  gatePassQty: "",
  inspectionable: "NO",
  pendingQty: "",
  receivedQty: "",
  excessQty: "",
});

const emptyTaxDetailRow = () => ({
  particulars: "",
  grossAmount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const emptySummary = () => ({
  basicAmount: "",
  totalAmount: "",
  totalTax: "",
  remarks: "",
});

const emptyAttachmentRow = () => ({
  invoiceCopy: null,
});

const emptyConsumptionScrapRow = () => ({
  outgoingItemCode: "",
  bflag: "",
  gcontrol1: "",
  outgoingItemDesc: "",
  unit: "",
  itemType: "",
  bomQty: "",
  availableStock: "",
  consumedQty: "",
  scrapItem: "",
  bomScrap: "",
  scrapQty: "",
  rate: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "grnDetail", label: "GRN Detail", kind: "table" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
  { key: "invoiceCopy", label: "Attached Invoice Copy", kind: "attachment" },
];

const SubContractingGrnForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("grnDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const [vendorData, setVendorData] = useState([]);
  const [vendorLookup, setVendorLookup] = useState({});

  const [general, setGeneral] = useState({
    ...emptyGeneralInfo(),
    ...data?.general,
  });

  const [grnDetailRows, setGrnDetailRows] = useState(
    data?.grnDetail?.length ? data.grnDetail : [emptyGrnDetailRow()],
  );
  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });
  const [attachmentRows, setAttachmentRows] = useState(
    data?.invoiceCopy?.length ? data.invoiceCopy : [emptyAttachmentRow()],
  );
  const [consumptionScrapRows, setConsumptionScrapRows] = useState(
    data?.consumptionScrap?.length
      ? data.consumptionScrap
      : [emptyConsumptionScrapRow()],
  );

  /* --------------------------------------------------------------------------
     AUTO-CAPTURE S.C GRN No + GRN Clear Time for a new record
  -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!data?.general) {
      setGeneral((prev) => ({
        ...prev,
        scGrnNo: prev.scGrnNo || generateScGrnNo(),
        grnClearTime: prev.grnClearTime || nowTime(),
        date: prev.date || nowDate(),
      }));
    }
  }, [data?.general]);

  /* --------------------------------------------------------------------------
     LOAD VENDORS (Vendor ID dropdown)
     API = itemAPI.getSuppliers(orgId, branch)
  -------------------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadVendors = async () => {
      try {
        const suppliers = await itemAPI.getSuppliers(orgId, branch);
        if (!mounted) return;

        const options = (suppliers || []).map((supplier) => ({
          label: supplier.label,
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
        }));

        const lookup = Object.fromEntries(
          options.map((opt) => [opt.label, opt]),
        );

        setVendorData(options.map((opt) => opt.label));
        setVendorLookup(lookup);
      } catch (error) {
        if (mounted) {
          setVendorData([]);
          setVendorLookup({});
        }
      }
    };

    if (orgId && branch) {
      loadVendors();
    }

    return () => {
      mounted = false;
    };
  }, [orgId, branch]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "vendorId") {
      const vendor = vendorLookup[value];
      setGeneral((prev) => ({
        ...prev,
        vendorId: value,
        vendorName: vendor?.supplierName ?? prev.vendorName,
      }));
      return;
    }

    setGeneral((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* --------------------------------------------------------------------------
     GRN DETAIL (item-code driven)
  -------------------------------------------------------------------------- */
  const handleGrnDetailCellChange = (idx, key, value) => {
    setGrnDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        if (key === "incomingItemCode") {
          const master = INCOMING_ITEM_MASTER[value] || {};
          return { ...row, incomingItemCode: value, ...master };
        }
        return { ...row, [key]: value };
      }),
    );
  };

  const handleAddGrnDetailRow = () =>
    setGrnDetailRows((prev) => [...prev, emptyGrnDetailRow()]);

  const handleRemoveGrnDetailRow = (idx) =>
    setGrnDetailRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );

  /* --------------------------------------------------------------------------
     TAX DETAILS (auto-calculates SGST/CGST/IGST amounts)
  -------------------------------------------------------------------------- */
  const handleTaxCellChange = (idx, key, value) => {
    setTaxDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        const next = { ...row, [key]: value };

        const gross = toNum(next.grossAmount);
        const sgstRate = toNum(next.sgstRate);
        const cgstRate = toNum(next.cgstRate);
        const igstRate = toNum(next.igstRate);

        next.sgstAmount = round2((gross * sgstRate) / 100);
        next.cgstAmount = round2((gross * cgstRate) / 100);
        next.igstAmount = round2((gross * igstRate) / 100);

        return next;
      }),
    );
  };

  const handleAddTaxRow = () =>
    setTaxDetailRows((prev) => [...prev, emptyTaxDetailRow()]);

  const handleRemoveTaxRow = (idx) =>
    setTaxDetailRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );

  /* --------------------------------------------------------------------------
     AUTO-CALCULATED SUMMARY
     Basic Amount      = sum(Received Qty x JO Rate) over valid GRN Detail rows
     Total Tax         = sum of SGST + CGST + IGST amounts over Tax Detail rows
     Total Amount      = Basic Amount + Total Tax
  -------------------------------------------------------------------------- */
  const basicAmount = grnDetailRows
    .filter((row) => row.incomingItemCode)
    .reduce(
      (sum, row) => sum + toNum(row.receivedQty) * toNum(row.joRate),
      0,
    );

  const totalTax = taxDetailRows
    .filter((row) => row.particulars)
    .reduce(
      (sum, row) =>
        sum + toNum(row.sgstAmount) + toNum(row.cgstAmount) + toNum(row.igstAmount),
      0,
    );

  const totalAmount = round2(basicAmount + totalTax);

  /* --------------------------------------------------------------------------
     CONSUMPTION / SCRAP (auto-calculates Amount = (Consumed + Scrap) x Rate)
  -------------------------------------------------------------------------- */
  const handleScrapCellChange = (idx, key, value) => {
    setConsumptionScrapRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next;
        if (key === "outgoingItemCode") {
          const master = OUTGOING_ITEM_MASTER[value] || {};
          next = { ...row, outgoingItemCode: value, ...master };
        } else {
          next = { ...row, [key]: value };
        }

        next.amount = round2(
          (toNum(next.consumedQty) + toNum(next.scrapQty)) * toNum(next.rate),
        );

        return next;
      }),
    );
  };

  const handleAddScrapRow = () =>
    setConsumptionScrapRows((prev) => [...prev, emptyConsumptionScrapRow()]);

  const handleRemoveScrapRow = (idx) =>
    setConsumptionScrapRows((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev,
    );

  /* --------------------------------------------------------------------------
     ATTACHMENTS
  -------------------------------------------------------------------------- */
  const handleAttachmentCellChange = (idx, key, file) => {
    setAttachmentRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: file } : row)),
    );
  };

  const handleRemoveAttachmentRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  /* --------------------------------------------------------------------------
     VALIDATION
  -------------------------------------------------------------------------- */

  const hasContentInGrnRow = (row) =>
    row.incomingItemCode ||
    row.incomingItemDesc ||
    row.jobOrderNo ||
    row.gatePassQty ||
    row.receivedQty;

  const hasContentInTaxRow = (row) =>
    row.grossAmount || row.sgstRate || row.cgstRate || row.igstRate;

  const validate = () => {
    const errors = {};

    if (!general.plantId) errors.plantId = "Plant ID is required";
    if (!general.department) errors.department = "Department is required";
    if (!general.vendorId) errors.vendorId = "Vendor ID is required";
    if (!general.vendorLocation)
      errors.vendorLocation = "Vendor Location is required";
    if (!general.vendorName?.trim())
      errors.vendorName = "Vendor Name is required";
    if (!general.gatePassNo?.trim())
      errors.gatePassNo = "Gate Pass No is required";
    if (!general.scheduleNo?.trim())
      errors.scheduleNo = "Schedule No is required";
    if (!general.date) errors.date = "Date is required";
    if (!general.schStartDate)
      errors.schStartDate = "Schedule Start Date is required";
    if (!general.schEndDate)
      errors.schEndDate = "Schedule End Date is required";
    if (!general.contractNo?.trim())
      errors.contractNo = "Contract No is required";
    if (!general.supplierDcNo?.trim())
      errors.supplierDcNo = "Supplier DC No is required";
    if (!general.supplierDcDate)
      errors.supplierDcDate = "Supplier DC Date is required";
    if (!general.scGrnNo?.trim()) errors.scGrnNo = "S.C GRN No is required";
    if (!general.gstState?.trim()) errors.gstState = "GST State is required";
    if (!general.gstnNo?.trim()) errors.gstnNo = "GSTIN No is required";
    if (!general.gstType) errors.gstType = "GST Type is required";
    if (!general.isIgstAppl)
      errors.isIgstAppl = "Is IGST Applicable is required";
    if (!general.serviceName?.trim())
      errors.serviceName = "Service Name is required";
    if (!general.sacCode) errors.sacCode = "SAC Code is required";
    if (!general.taxType) errors.taxType = "Tax Type is required";
    if (general.taxPercent === "" || toNum(general.taxPercent) <= 0)
      errors.taxPercent = "Tax (%) is required";
    if (!general.taxCode) errors.taxCode = "Tax Code is required";

    if (
      general.schStartDate &&
      general.schEndDate &&
      general.schEndDate < general.schStartDate
    )
      errors.schEndDate = "Schedule End Date cannot be before Start Date";

    /* --- GRN Detail grid --- */
    const grnMissing = [];
    grnDetailRows.forEach((row, index) => {
      if (hasContentInGrnRow(row)) {
        if (!row.incomingItemCode) grnMissing.push(index);
      }
    });

    if (grnMissing.length) {
      errors.grnMissing = grnMissing;
    }

    const hasValidItemRow = grnDetailRows.some(
      (row) =>
        row.incomingItemCode && toNum(row.gatePassQty) > 0 && toNum(row.receivedQty) > 0,
    );

    if (!hasValidItemRow) {
      errors.grnDetail =
        "Add at least one incoming item with Gate Pass Qty and Received Qty greater than 0";
    }

    /* --- Tax Details grid --- */
    const taxMissing = [];
    taxDetailRows.forEach((row, index) => {
      if (hasContentInTaxRow(row) && !row.particulars) taxMissing.push(index);
    });

    if (taxMissing.length) {
      errors.taxMissing = taxMissing;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* --------------------------------------------------------------------------
     SAVE
  -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) {
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId: Number(orgId),
      ...general,
      taxPercent: toNum(general.taxPercent),
      grnDetail: grnDetailRows.filter((row) => row.incomingItemCode?.trim()),
      taxDetails: taxDetailRows
        .filter((row) => row.particulars?.trim())
        .map((row) => ({
          ...row,
          grossAmount: toNum(row.grossAmount),
          sgstRate: toNum(row.sgstRate),
          sgstAmount: toNum(row.sgstAmount),
          cgstRate: toNum(row.cgstRate),
          cgstAmount: toNum(row.cgstAmount),
          igstRate: toNum(row.igstRate),
          igstAmount: toNum(row.igstAmount),
        })),
      summary: {
        ...summary,
        basicAmount: round2(basicAmount),
        totalAmount: totalAmount,
        totalTax: round2(totalTax),
      },
      invoiceCopy: attachmentRows
        .filter((row) => row.invoiceCopy)
        .map((row) => ({ fileName: row.invoiceCopy?.name })),
      consumptionScrap: consumptionScrapRows
        .filter((row) => row.outgoingItemCode?.trim())
        .map((row) => ({
          ...row,
          bomQty: toNum(row.bomQty),
          availableStock: toNum(row.availableStock),
          consumedQty: toNum(row.consumedQty),
          bomScrap: toNum(row.bomScrap),
          scrapQty: toNum(row.scrapQty),
          rate: toNum(row.rate),
          amount: toNum(row.amount),
        })),
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response = await subContractingGrnAPI.createUpdateGrn(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Sub Contracting GRN updated successfully!"
              : "Sub Contracting GRN created successfully!"),
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Sub Contracting GRN.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Sub Contracting GRN Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
          "error",
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  const grnDetailErrorRows =
    showErrors && fieldErrors.grnMissing ? fieldErrors.grnMissing : [];

  const taxErrorRows =
    showErrors && fieldErrors.taxMissing ? fieldErrors.taxMissing : [];

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
          {data ? "Edit Sub Contracting GRN" : "Add Sub Contracting GRN"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Section ---------------- */}
        <div>
          <SectionHeader>Header Section</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={general.plantId}
              onChange={handleGeneralChange}
              error={fieldErrors.plantId}
              options={PLANT_IDS}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={general.belongsTo}
              onChange={handleGeneralChange}
              options={BELONGS_TO}
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={general.department}
              onChange={handleGeneralChange}
              error={fieldErrors.department}
              options={DEPARTMENTS}
              required
            />
            <Field
              type="select"
              label="Vendor ID"
              name="vendorId"
              value={general.vendorId}
              onChange={handleGeneralChange}
              error={fieldErrors.vendorId}
              options={vendorData}
              required
              disabled={!orgId || !branch}
            />
            <Field
              type="select"
              label="Vendor Location"
              name="vendorLocation"
              value={general.vendorLocation}
              onChange={handleGeneralChange}
              error={fieldErrors.vendorLocation}
              options={VENDOR_LOCATIONS}
              required
            />
            <Field
              label="Vendor Name"
              name="vendorName"
              value={general.vendorName}
              onChange={handleGeneralChange}
              error={fieldErrors.vendorName}
              required
            />
            <Field
              type="select"
              label="Gate Pass No"
              name="gatePassNo"
              value={general.gatePassNo}
              onChange={handleGeneralChange}
              error={fieldErrors.gatePassNo}
              options={GATE_PASS_NOS}
              required
            />
            <Field
              type="select"
              label="Schedule No"
              name="scheduleNo"
              value={general.scheduleNo}
              onChange={handleGeneralChange}
              error={fieldErrors.scheduleNo}
              options={SCHEDULE_NOS}
              required
            />
            <Field
              label="Rework No"
              name="rework"
              value={general.rework}
              onChange={handleGeneralChange}
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={general.date}
              onChange={handleGeneralChange}
              error={fieldErrors.date}
              required
            />
            <Field
              type="date"
              label="Schedule Start Date"
              name="schStartDate"
              value={general.schStartDate}
              onChange={handleGeneralChange}
              error={fieldErrors.schStartDate}
              required
            />
            <Field
              type="date"
              label="Schedule End Date"
              name="schEndDate"
              value={general.schEndDate}
              onChange={handleGeneralChange}
              error={fieldErrors.schEndDate}
              required
            />
            <Field
              label="Contract No"
              name="contractNo"
              value={general.contractNo}
              onChange={handleGeneralChange}
              error={fieldErrors.contractNo}
              required
            />
            <Field
              label="Supplier DC No"
              name="supplierDcNo"
              value={general.supplierDcNo}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierDcNo}
              required
            />
            <Field
              type="date"
              label="Supplier DC Date"
              name="supplierDcDate"
              value={general.supplierDcDate}
              onChange={handleGeneralChange}
              error={fieldErrors.supplierDcDate}
              required
            />
            <Field
              type="time"
              label="GRN Clear Time"
              name="grnClearTime"
              value={general.grnClearTime}
              onChange={handleGeneralChange}
              disabled
            />
            <Field
              label="S.C GRN No"
              name="scGrnNo"
              value={general.scGrnNo}
              onChange={handleGeneralChange}
              error={fieldErrors.scGrnNo}
              disabled
              required
            />
            <Field
              label="GST State"
              name="gstState"
              value={general.gstState}
              onChange={handleGeneralChange}
              error={fieldErrors.gstState}
              required
            />
            <Field
              label="GSTIN No"
              name="gstnNo"
              value={general.gstnNo}
              onChange={handleGeneralChange}
              error={fieldErrors.gstnNo}
              required
            />
            <Field
              type="select"
              label="GST Type"
              name="gstType"
              value={general.gstType}
              onChange={handleGeneralChange}
              error={fieldErrors.gstType}
              options={GST_TYPES}
              required
            />
            <Field
              type="select"
              label="Is IGST Applicable"
              name="isIgstAppl"
              value={general.isIgstAppl}
              onChange={handleGeneralChange}
              error={fieldErrors.isIgstAppl}
              options={YES_NO}
              required
            />
            <Field
              label="Service Name"
              name="serviceName"
              value={general.serviceName}
              onChange={handleGeneralChange}
              error={fieldErrors.serviceName}
              required
            />
            <Field
              label="SAC Code"
              name="sacCode"
              value={general.sacCode}
              onChange={handleGeneralChange}
              error={fieldErrors.sacCode}
              required
            />
            <Field
              label="Tax Type"
              name="taxType"
              value={general.taxType}
              onChange={handleGeneralChange}
              error={fieldErrors.taxType}
              required
            />
            <Field
              type="number"
              label="Tax (%)"
              name="taxPercent"
              value={general.taxPercent}
              onChange={handleGeneralChange}
              error={fieldErrors.taxPercent}
              required
            />
            <Field
              type="select"
              label="Tax Code"
              name="taxCode"
              value={general.taxCode}
              onChange={handleGeneralChange}
              error={fieldErrors.taxCode}
              options={TAX_CODES}
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

            {(activeTabMeta.kind === "table" ||
              activeTabMeta.kind === "attachment") && (
              <button
                type="button"
                onClick={() => {
                  if (activeChildTab === "grnDetail") {
                    handleAddGrnDetailRow();
                  } else if (activeChildTab === "taxDetails") {
                    handleAddTaxRow();
                  } else {
                    setAttachmentRows((prev) => [
                      ...prev,
                      emptyAttachmentRow(),
                    ]);
                  }
                }}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Active tab content */}
          {activeChildTab === "grnDetail" && (
            <div className="pt-4">
              <DynamicTable
                columns={[
                  {
                    key: "incomingItemCode",
                    label: "Incoming Item Code",
                    type: "select",
                    options: INCOMING_ITEM_CODES,
                  },
                  {
                    key: "incomingItemDesc",
                    label: "Incoming Item Description",
                    readOnly: true,
                  },
                  {
                    key: "stock",
                    label: "Stock",
                    type: "select",
                    options: YES_NO,
                  },
                  { key: "tolerance", label: "Tolerance", type: "number", readOnly: true },
                  {
                    key: "primaryUnit",
                    label: "Primary Unit",
                    readOnly: true,
                  },
                  {
                    key: "jobOrderNo",
                    label: "Job Order No",
                    type: "select",
                    options: JOB_ORDER_NOS,
                  },
                  { key: "jobOrderQty", label: "Job Order Qty", type: "number" },
                  { key: "joRate", label: "Job Order Rate", type: "number" },
                  { key: "gatePassQty", label: "Gate Pass Qty", type: "number" },
                  {
                    key: "inspectionable",
                    label: "Inspectionable",
                    type: "select",
                    options: YES_NO,
                  },
                  { key: "pendingQty", label: "Pending Qty", type: "number" },
                  { key: "receivedQty", label: "Received Qty", type: "number" },
                  { key: "excessQty", label: "Excess Qty", type: "number" },
                ]}
                rows={grnDetailRows}
                onCellChange={handleGrnDetailCellChange}
                onRemoveRow={handleRemoveGrnDetailRow}
                errorRowIndexes={grnDetailErrorRows}
              />
              {showErrors && fieldErrors.grnDetail && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.grnDetail}
                </p>
              )}
            </div>
          )}

          {activeChildTab === "taxDetails" && (
            <div className="pt-4">
              <DynamicTable
                columns={[
                  {
                    key: "particulars",
                    label: "Particulars",
                    type: "select",
                    options: TAX_PARTICULARS,
                  },
                  {
                    key: "grossAmount",
                    label: "Gross Amount",
                    type: "number",
                    readOnly: true,
                  },
                  { key: "sgstRate", label: "SGST Rate", type: "number" },
                  {
                    key: "sgstAmount",
                    label: "SGST Amount",
                    type: "number",
                    readOnly: true,
                  },
                  { key: "cgstRate", label: "CGST Rate", type: "number" },
                  {
                    key: "cgstAmount",
                    label: "CGST Amount",
                    type: "number",
                    readOnly: true,
                  },
                  { key: "igstRate", label: "IGST Rate", type: "number" },
                  {
                    key: "igstAmount",
                    label: "IGST Amount",
                    type: "number",
                    readOnly: true,
                  },
                ]}
                rows={taxDetailRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
                errorRowIndexes={taxErrorRows}
              />
              {showErrors && fieldErrors.taxMissing?.length > 0 && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  Particulars is required for the highlighted row(s)
                </p>
              )}
            </div>
          )}

{activeChildTab === "summary" && (
            <div className="pt-4">
              <div className={fieldGrid}>
                <Field
                  label="Basic Amount"
                  name="basicAmount"
                  value={String(round2(basicAmount))}
                  disabled
                />
                <Field
                  label="Total Amount"
                  name="totalAmount"
                  value={String(totalAmount)}
                  disabled
                />
                <Field
                  label="Total Tax"
                  name="totalTax"
                  value={String(round2(totalTax))}
                  disabled
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
                  onChange={handleSummaryChange}
                  rows={1}
                />
              </div>
            </div>
          )}

          {activeChildTab === "invoiceCopy" && (
            <div className="pt-4">
              <DynamicTable
                columns={[
                  {
                    key: "invoiceCopy",
                    label: "Invoice Copy",
                    type: "upload",
                  },
                ]}
                rows={attachmentRows}
                onCellChange={handleAttachmentCellChange}
                onRemoveRow={handleRemoveAttachmentRow}
              />
            </div>
          )}
        </section>

        {/* ---------------- Consumption / Scrap Section ---------------- */}
        <div>
          <SectionHeader>Consumption/Scrap Section</SectionHeader>
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={handleAddScrapRow}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Plus size={12} />
              Add Row
            </button>
          </div>
          <DynamicTable
            columns={[
              {
                key: "outgoingItemCode",
                label: "Outgoing Item Code",
                type: "select",
                options: OUTGOING_ITEM_CODES,
              },
              {
                key: "outgoingItemDesc",
                label: "Outgoing Item Description",
                readOnly: true,
              },
              {
                key: "unit",
                label: "Unit",
                type: "select",
                options: ["KG", "NOS", "LTR", "MTR"],
                readOnly: true,
              },
              {
                key: "itemType",
                label: "Item Type",
                readOnly: true,
              },
              { key: "bomQty", label: "BOM Qty", type: "number", readOnly: true },
              {
                key: "availableStock",
                label: "Available Stock",
                type: "number",
                readOnly: true,
              },
              { key: "consumedQty", label: "Consumed Qty", type: "number" },
              { key: "scrapItem", label: "Scrap Item" },
              { key: "bomScrap", label: "BOM Scrap", type: "number", readOnly: true },
              { key: "scrapQty", label: "Scrap Qty", type: "number" },
              { key: "rate", label: "Rate", type: "number" },
              {
                key: "amount",
                label: "Amount",
                type: "number",
                readOnly: true,
              },
            ]}
            rows={consumptionScrapRows}
            onCellChange={handleScrapCellChange}
            onRemoveRow={handleRemoveScrapRow}
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

export default SubContractingGrnForm;