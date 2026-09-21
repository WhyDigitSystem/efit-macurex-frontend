import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  UploadCloud,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import subContractingGrnAPI from "../../../api/Inventory/subContractingGrnAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import { useToast } from "../../Toast/ToastContext";

/* =============================================================================
   ASSUMPTIONS — flagged up front since these weren't in the field mapping you
   gave (no API named for them), but the DTO needs a value for each:

   Plant ID: branchAPI.getBranchByOrgId (same source used by every other form)
   Belongs To: listOfValuesAPI.getListValuesGroup("BELONGS TO", orgId)
   Department: departmentAPI.getAllDepartments
   Vendor Location: DTO wants a numeric location-master id, but
     getCustomerForSupplierRateContract's "address" is free text — so this is
     a real select from locationMasterAPI, not a read-only auto-fill.
   Tax Type: no source given; defaults to "GST", plain text entry.
   Tax Code: dropped entirely — it isn't part of the create/update DTO.
   Item Type / Available Stock / Rate (consumption row): not present in the
     BOM lookup's response, so these stay manual-entry fields.
   Invoice Copy: no upload API named — file is captured client-side and only
     the file name is sent in the payload, matching how attachments are
     handled elsewhere until a dedicated upload endpoint is wired in.
============================================================================= */

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
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th key={i} className="p-2 whitespace-nowrap text-left dark:text-white">
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

/* Generic flat table (Tax Details) */
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
          <tr
            key={idx}
            className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td className="p-2 text-center font-medium dark:text-white">
              {idx + 1}
            </td>
            {columns.map((col) => (
              <td className="p-2 align-top" key={col.key}>
                {col.type === "select" ? (
                  <select
                    value={row[col.key] ?? ""}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={`${cellInputClasses} ${isError ? cellErrClasses : ""}`}
                  >
                    <option value="">-- Select --</option>
                    {(col.options || []).map((opt) => (
                      <option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={col.type === "number" ? "number" : "text"}
                    value={row[col.key] ?? ""}
                    readOnly={col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      col.readOnly
                        ? cellReadOnlyClasses
                        : `${cellInputClasses} ${isError ? cellErrClasses : ""}`
                    }
                  />
                )}
              </td>
            ))}
            <td className="p-2 text-center">
              <button
                type="button"
                onClick={() => onRemoveRow(idx)}
                disabled={rows.length <= 1}
                className={`h-6 w-6 rounded text-white flex items-center justify-center ${
                  rows.length <= 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 size={12} />
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </TableWrapper>
);

/* File upload cell: drag-and-drop or click-to-upload, shown inline inside a
   table row (matches the upload format used across the app). */
const UploadCell = ({ file, onFileChange }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const displayName =
    file instanceof File ? file.name : file?.name || "Click or drop a file";

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

/* Attachment table (upload-only columns) */
const AttachmentTable = ({ rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", "Invoice Copy", "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <tr
          key={idx}
          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td className="p-3 text-center font-medium dark:text-white">
            {idx + 1}
          </td>
          <UploadCell
            file={row.invoiceCopy}
            onFileChange={(f) => onCellChange(idx, "invoiceCopy", f)}
          />
          <td className="p-3 text-center">
            <button
              type="button"
              onClick={() => onRemoveRow(idx)}
              className="h-5 w-5 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
            >
              <Trash2 size={10} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Static options that have no backend source                                  */

const YES_NO = ["Yes", "No"];
const ITEM_TYPES = [
  "RAW MATERIAL",
  "SEMI FINISHED",
  "FINISHED GOOD",
  "PACKING MATERIAL",
];

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyConsumptionRow = () => ({
  itemId: "",
  itemCode: "",
  itemDescription: "",
  unitId: "",
  unitCode: "",
  itemType: "",
  bomQty: "",
  availableStock: "",
  consumedQty: "",
  scrapItem: "No",
  bomScrap: "",
  scrapQty: "",
  rate: "",
  amount: "",
});

const emptyDetailRow = () => ({
  itemId: "",
  optionKey: "",
  itemCode: "",
  itemDescription: "",
  unitId: "",
  unitCode: "",
  jobOrderNo: "",
  jobOrderQty: "",
  jobOrderRate: "",
  stock: "",
  tolerance: "",
  gatePassQty: "",
  inspectionable: "No",
  pendingQty: "",
  receivedQty: "",
  excessQty: "",
  qtyInPrimaryUnit: "",
  location: "",
  acceptedQty: "",
  accQtyInPrimaryUnit: "",
  rejectedQty: "",
  rejQtyInPrimaryUnit: "",
  amount: "",
  sgstRate: "",
  cgstRate: "",
  igstRate: "",
  sgstAmount: "",
  cgstAmount: "",
  igstAmount: "",
  consumption: [],
});

const emptyTaxRow = () => ({ particulars: "", taxAmount: "" });

const emptyAttachmentRow = () => ({ invoiceCopy: null });

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const nowTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toNum = (n) => (Number.isNaN(Number(n)) ? 0 : Number(n));
const toInt = (n) => {
  const parsed = parseInt(n, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};
const round2 = (n) => Math.round((toNum(n) + Number.EPSILON) * 100) / 100;

/* When editing, the lookups (gate passes, schedules, items, BOM) only return
   currently available entries, so the saved value may not be in the list.
   This keeps the saved value visible in its dropdown. */
const withCurrent = (options, current, label) =>
  current && !options.some((o) => String(o.value) === String(current))
    ? [{ value: current, label: label ?? current }, ...options]
    : options;

/* ---------------------------------------------------------------------------- */
/* Calculations — from the formulas you gave:
   Pending Qty = Job Order Qty − Gate Pass Qty
   Excess Qty  = Received Qty − Gate Pass Qty (only if Received > Gate Pass)
   Amount      = Job Order Rate × Accepted Qty
   Consumed Qty (child) = BOM Qty × Job Order Qty (of the parent row)
   Amount (child)       = Consumed Qty × Rate                                */

const recomputeDetailRow = (row) => {
  const jobOrderQty = toNum(row.jobOrderQty);
  const gatePassQty = toNum(row.gatePassQty);
  const receivedQty = toNum(row.receivedQty);
  const acceptedQty = toNum(row.acceptedQty);
  const jobOrderRate = toNum(row.jobOrderRate);

  const pendingQty = jobOrderQty - gatePassQty;
  const excessQty = receivedQty > gatePassQty ? receivedQty - gatePassQty : 0;
  const amount = jobOrderRate * acceptedQty;

  const sgstAmount = round2((amount * toNum(row.sgstRate)) / 100);
  const cgstAmount = round2((amount * toNum(row.cgstRate)) / 100);
  const igstAmount = round2((amount * toNum(row.igstRate)) / 100);

  const consumption = (row.consumption || []).map((c) => {
    const consumedQty = round2(toNum(c.bomQty) * jobOrderQty);
    return { ...c, consumedQty, amount: round2(consumedQty * toNum(c.rate)) };
  });

  return {
    ...row,
    pendingQty: round2(pendingQty),
    excessQty: round2(excessQty),
    amount: round2(amount),
    sgstAmount,
    cgstAmount,
    igstAmount,
    consumption,
  };
};

const buildConsumptionRowFromBom = (bom, jobOrderQty) => {
  const bomQty = toNum(bom.bomQty);
  const consumedQty = round2(bomQty * toNum(jobOrderQty));
  return {
    itemId: bom.itemId,
    itemCode: bom.itemCode || "",
    itemDescription: bom.itemDescription || "",
    unitId: bom.unitId || "",
    unitCode: bom.unitCode || "",
    itemType: "",
    bomQty,
    availableStock: "",
    consumedQty,
    scrapItem: bom.scrapItem || "No",
    bomScrap: toNum(bom.scrapQty),
    scrapQty: "",
    rate: "",
    amount: 0,
  };
};

/* ---------------------------------------------------------------------------- */

const CHILD_TABS = [
  { key: "grnDetail", label: "GRN Detail" },
  { key: "taxDetails", label: "Tax Details" },
  { key: "summary", label: "Summary" },
  { key: "invoiceCopy", label: "Attached Invoice Copy" },
];

const SubContractingGrnForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const financialYear = String(new Date().getFullYear());
  const isEditMode = Boolean(data?.id);

  const [activeChildTab, setActiveChildTab] = useState("grnDetail");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [gatePassOptions, setGatePassOptions] = useState([]);
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [bomOptionsByItem, setBomOptionsByItem] = useState({});

  // Header — accepts the raw GET-by-id shape directly (nested branch/vendor/
  // department/location/serviceName/sacCode objects) as well as a flat one.
  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId ?? data?.branch?.id ?? branch ?? "",
    scGrnNo: data?.scGrnNo ?? data?.docId ?? "",
    belongsTo: data?.belongsTo || "",
    date: data?.date ?? data?.docDate ?? todayStr(),
    department: data?.department?.id ?? data?.department ?? "",
    vendorId: data?.vendorId ?? data?.vendor?.customerId ?? "",
    vendorName: data?.vendorName ?? data?.vendor?.customerName ?? "",
    gstState: data?.gstState ?? data?.vendor?.gstState ?? "",
    vendorLocation: data?.vendorLocation?.id ?? data?.vendorLocation ?? "",
    isIGSTAppl: data?.isIGSTAppl ?? data?.vendor?.igstApplicable ?? false,
    gatePassNo: data?.gatePassNo || "",
    gstnNo: data?.gstnNo ?? data?.vendor?.gstNo ?? "",
    scheduleNo: data?.scheduleNo || "",
    gstType: data?.gstType ?? data?.vendor?.gstType ?? "",
    rework: data?.rework || "No",
    revsChrg: data?.revsChrg ?? false,
    serviceName: data?.serviceName?.id ?? data?.serviceName ?? "",
    schStartDate: data?.schStartDate || "",
    sacCode: data?.sacCode?.id ?? data?.sacCode ?? "",
    schEndDate: data?.schEndDate || "",
    taxType: data?.taxType || "GST",
    contractNo: data?.contractNo || "",
    taxPercentage: data?.taxPercentage ?? "",
    supplierDcNo: data?.supplierDcNo || "",
    supplierDcDate: data?.supplierDcDate || "",
    grnClearTime: data?.grnClearTime || (data ? "" : nowTime()),
    remarks: data?.remarks || "",
    cancelRemarks: data?.cancelRemarks || "",
    active: data?.active !== false,
  }));

  const [detailRows, setDetailRows] = useState(() => {
    const raw = data?.details;
    if (!raw?.length) return [emptyDetailRow()];
    return raw.map((d) =>
      recomputeDetailRow({
        ...emptyDetailRow(),
        itemId: d.incomingItem?.id ?? d.incomingItem ?? "",
        // saved key so the item dropdown shows the saved item on edit
        optionKey: d.incomingItem?.id ? `saved-${d.incomingItem.id}` : "",
        itemCode: d.incomingItem?.itemCode || "",
        itemDescription: d.incomingItem?.itemDescription || "",
        unitId: d.primaryUnit?.id ?? d.primaryUnit ?? "",
        unitCode: d.primaryUnit?.unitId || "",
        jobOrderNo: d.jobOrderNo || "",
        jobOrderQty: d.jobOrderQty ?? "",
        jobOrderRate: d.joRate ?? d.jobOrderRate ?? "",
        stock: d.stock ?? "",
        tolerance: d.tolerance ?? "",
        gatePassQty: d.gatePassQty ?? "",
        inspectionable: d.inspectionable || "No",
        receivedQty: d.receivedQty ?? "",
        qtyInPrimaryUnit: d.qtyInPrimaryUnit ?? "",
        location: d.location?.id ?? d.location ?? "",
        acceptedQty: d.acceptedQty ?? "",
        accQtyInPrimaryUnit: d.accQtyInPrimaryUnit ?? "",
        rejectedQty: d.rejectedQty ?? "",
        rejQtyInPrimaryUnit: d.rejQtyInPrimaryUnit ?? "",
        sgstRate: d.sgstRate ?? "",
        cgstRate: d.cgstRate ?? "",
        igstRate: d.igstRate ?? "",
        consumption: (d.consumption || []).map((c) => ({
          itemId: c.outgoingItem?.id ?? c.outgoingItem ?? "",
          itemCode: c.outgoingItem?.itemCode || "",
          itemDescription: c.outgoingItem?.itemDescription || "",
          unitId: c.unit?.id ?? c.unit ?? "",
          unitCode: c.unit?.unitId || "",
          itemType: c.itemType || "",
          bomQty: c.bomQty ?? "",
          availableStock: c.availableStock ?? "",
          consumedQty: c.consumedQty ?? "",
          scrapItem: c.scrapItem || "No",
          bomScrap: c.bomScrap ?? "",
          scrapQty: c.scrapQty ?? "",
          rate: c.rate ?? "",
          amount: c.amount ?? "",
        })),
      }),
    );
  });

  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length
      ? data.taxDetails.map((t) => ({
          particulars: t.particulars || "",
          taxAmount: t.taxAmount ?? "",
        }))
      : [emptyTaxRow()],
  );

  const [attachmentRows, setAttachmentRows] = useState(
    data?.invoiceCopy?.length ? data.invoiceCopy : [emptyAttachmentRow()],
  );

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      const res = await branchAPI.getBranchByOrgId(orgId);
      setPlantOptions(
        (res || []).map((b) => ({
          value: b.id,
          label: b.branchName || `Branch ${b.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("BELONGS TO", orgId);
      const list = Array.isArray(res) ? res : res?.listValues || [];
      setBelongsToOptions(
        list.map((item) => ({
          value:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",
          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",
        })),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);
      setBelongsToOptions([]);
    }
  }, [orgId]);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(orgId);
      const list =
        response?.paramObjectsMap?.departmentVO ||
        response?.paramObjectsMap?.departmentMasterVO ||
        response?.paramObjectsMap?.departments ||
        (Array.isArray(response) ? response : []);
      setDepartmentOptions(
        list.map((d) => ({
          value: d.id,
          label: d.departmentName || d.name || `Dept ${d.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
    }
  }, [orgId]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(
        orgId,
        branch,
      );
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.id,
          label: l.locationName || `Location ${l.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
    }
  }, [orgId, branch]);

  const loadVendors = useCallback(async () => {
    try {
      const list =
        await subContractingGrnAPI.getCustomerForSupplierRateContract(
          branch,
          orgId,
        );
      setVendorOptions(
        (list || []).map((v) => ({
          value: v.customerId,
          label: v.customerCode || String(v.customerId),
          customerName: v.customerName || "",
          address: v.address || "",
          gstState: v.gstState || "",
          gstNo: v.gstNo || "",
          gstType: v.gstType || "",
          igstApplicable: Boolean(v.igstApplicable),
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
    }
  }, [orgId, branch]);

  const loadGatePasses = useCallback(
    async (vendorId) => {
      if (!vendorId) return setGatePassOptions([]);
      try {
        const list = await subContractingGrnAPI.getGateInwardEntry(
          branch,
          vendorId,
          orgId,
        );
        setGatePassOptions(
          (list || []).map((g) => ({
            value: g.GatePassNo,
            label: g.GatePassNo,
            supplierDcNo: g.supplierDCNumber || "",
            supplierDcDate: g.supplierDcDate || "",
          })),
        );
      } catch (error) {
        console.error("Failed to load gate pass options:", error);
        setGatePassOptions([]);
      }
    },
    [orgId, branch],
  );

  const loadSchedules = useCallback(
    async (vendorId) => {
      if (!vendorId) return setScheduleOptions([]);
      try {
        const list = await subContractingGrnAPI.getSubcontractSupplySchedule(
          branch,
          vendorId,
          orgId,
        );
        setScheduleOptions(
          (list || []).map((s) => ({
            value: s.scheduleNo,
            label: s.scheduleNo,
            contractNo: s.contractNo || "",
            schStartDate: s.schStartDate || "",
            schEndDate: s.schEndDate || "",
            serviceId: s.serviceId,
            serviceName: s.serviceName || "",
            hsnId: s.hsnId,
            hsnCode: s.hsnCode || "",
            gstRate: s.gstRate ?? "",
            cgstRate: s.cgstRate ?? "",
            sgstRate: s.sgstRate ?? "",
            igstRate: s.igstRate ?? "",
          })),
        );
      } catch (error) {
        console.error("Failed to load schedule options:", error);
        setScheduleOptions([]);
      }
    },
    [orgId, branch],
  );

  const loadItems = useCallback(
    async (vendorId, scheduleNo) => {
      if (!vendorId || !scheduleNo) {
        setItemOptions([]);
        setItemMasterMap({});
        return;
      }
      try {
        const list = await subContractingGrnAPI.getItemDetailsForGrn(
          branch,
          vendorId,
          orgId,
          scheduleNo,
        );
        const map = {};
        const options = (list || []).map((it, idx) => {
          const optionKey = `${it.itemId}-${it.jobOrderNo}-${idx}`;
          map[optionKey] = it;
          return {
            value: optionKey,
            label: `${it.itemCode} (${it.jobOrderNo})`,
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

  const loadBomForItem = useCallback(
    async (itemId) => {
      if (bomOptionsByItem[itemId]) return bomOptionsByItem[itemId];
      try {
        const list = await subContractingGrnAPI.getBomItemDetails(
          branch,
          itemId,
          orgId,
        );
        setBomOptionsByItem((prev) => ({ ...prev, [itemId]: list || [] }));
        return list || [];
      } catch (error) {
        console.error("Failed to load BOM item details:", error);
        setBomOptionsByItem((prev) => ({ ...prev, [itemId]: [] }));
        return [];
      }
    },
    [orgId, branch, bomOptionsByItem],
  );

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadBelongsTo();
      loadDepartments();
    }
  }, [orgId, loadPlants, loadBelongsTo, loadDepartments]);

  useEffect(() => {
    if (orgId && branch) {
      loadVendors();
      loadLocations();
    }
  }, [orgId, branch, loadVendors, loadLocations]);

  useEffect(() => {
    if (header.vendorId) {
      loadGatePasses(header.vendorId);
      loadSchedules(header.vendorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.vendorId]);

  useEffect(() => {
    if (header.vendorId && header.scheduleNo) {
      loadItems(header.vendorId, header.scheduleNo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.vendorId, header.scheduleNo]);

  /* ---------------- Auto-generated S.C GRN No ---------------- */

  useEffect(() => {
    if (isEditMode || !orgId) return;
    let cancelled = false;
    const generateDocId = async () => {
      setGeneratingDocId(true);
      try {
        const docId = await subContractingGrnAPI.getGrnDocId(
          financialYear,
          orgId,
        );
        if (!cancelled)
          setHeader((prev) => ({ ...prev, scGrnNo: docId || "" }));
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating S.C GRN No:", error);
          addToast("Failed to generate S.C GRN No", "error");
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };
    generateDocId();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, orgId]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "vendorId") {
        const vendor = vendorOptions.find(
          (v) => String(v.value) === String(value),
        );
        next.vendorName = vendor?.customerName || "";
        next.gstState = vendor?.gstState || "";
        next.gstnNo = vendor?.gstNo || "";
        next.gstType = vendor?.gstType || "";
        next.isIGSTAppl = vendor?.igstApplicable || false;
        next.gatePassNo = "";
        next.supplierDcNo = "";
        next.supplierDcDate = "";
        next.scheduleNo = "";
        next.contractNo = "";
        next.schStartDate = "";
        next.schEndDate = "";
        next.serviceName = "";
        next.sacCode = "";
        next.taxPercentage = "";
        setDetailRows([emptyDetailRow()]);
      }

      if (name === "gatePassNo") {
        const gp = gatePassOptions.find(
          (g) => String(g.value) === String(value),
        );
        next.supplierDcNo = gp?.supplierDcNo || "";
        next.supplierDcDate = gp?.supplierDcDate || "";
      }

      if (name === "scheduleNo") {
        const sch = scheduleOptions.find(
          (s) => String(s.value) === String(value),
        );
        next.contractNo = sch?.contractNo || "";
        next.schStartDate = sch?.schStartDate || "";
        next.schEndDate = sch?.schEndDate || "";
        next.serviceName = sch?.serviceId ?? "";
        next.sacCode = sch?.hsnId ?? "";
        next.taxPercentage = sch?.gstRate ?? "";
        setDetailRows([emptyDetailRow()]);
      }

      if (name === "isIGSTAppl" || name === "revsChrg") {
        next[name] = value === "Yes" || value === true;
      }

      return next;
    });
  };

  /* ---------------- GRN Detail row handlers ---------------- */

  const handleDetailCellChange = async (idx, key, value) => {
    let row = { ...detailRows[idx], [key]: value };

    if (key === "incomingItemCode") {
      const item = itemMasterMap[value];
      row.optionKey = value;
      if (item) {
        row.itemId = item.itemId;
        row.itemCode = item.itemCode || "";
        row.itemDescription = item.itemDescription || "";
        row.unitId = item.unitId || "";
        row.unitCode = item.unitCode || "";
        row.jobOrderNo = item.jobOrderNo || "";
        row.jobOrderQty = item.jobOrderQty ?? "";
        row.jobOrderRate = item.jobOrderRate ?? "";
      }
    }

    row = recomputeDetailRow(row);
    setDetailRows((prev) => prev.map((r, i) => (i === idx ? row : r)));

    if (key === "incomingItemCode" && row.itemId) {
      const bomList = await loadBomForItem(row.itemId);
      setDetailRows((prev) =>
        prev.map((r, i) =>
          i === idx
            ? recomputeDetailRow({
                ...r,
                consumption: bomList.map((b) =>
                  buildConsumptionRowFromBom(b, r.jobOrderQty),
                ),
              })
            : r,
        ),
      );
      setExpandedRow(idx);
    }
  };

  const handleAddDetailRow = () =>
    setDetailRows((prev) => [...prev, emptyDetailRow()]);
  const handleRemoveDetailRow = (idx) =>
    setDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------- Consumption/Scrap row handlers (nested per detail row) --- */

  const handleConsumptionCellChange = (rowIdx, consIdx, key, value) => {
    setDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIdx) return row;
        let consumption = row.consumption.map((c, ci) => {
          if (ci !== consIdx) return c;
          let next = { ...c, [key]: value };
          if (key === "itemId") {
            const bom = (bomOptionsByItem[row.itemId] || []).find(
              (b) => String(b.itemId) === String(value),
            );
            if (bom)
              next = {
                ...buildConsumptionRowFromBom(bom, row.jobOrderQty),
                rate: next.rate,
              };
          }
          return next;
        });
        return recomputeDetailRow({ ...row, consumption });
      }),
    );
  };

  const handleAddConsumptionRow = (rowIdx) => {
    setDetailRows((prev) =>
      prev.map((row, i) =>
        i === rowIdx
          ? { ...row, consumption: [...row.consumption, emptyConsumptionRow()] }
          : row,
      ),
    );
    // make sure the BOM list for this item is loaded so the select has options
    const itemId = detailRows[rowIdx]?.itemId;
    if (itemId) loadBomForItem(itemId);
  };

  const handleRemoveConsumptionRow = (rowIdx, consIdx) => {
    setDetailRows((prev) =>
      prev.map((row, i) =>
        i === rowIdx
          ? recomputeDetailRow({
              ...row,
              consumption: row.consumption.filter((_, ci) => ci !== consIdx),
            })
          : row,
      ),
    );
  };

  /* ---------------- Tax Details ---------------- */

  const handleTaxCellChange = (idx, key, value) =>
    setTaxDetailRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    );
  const handleAddTaxRow = () =>
    setTaxDetailRows((prev) => [...prev, emptyTaxRow()]);
  const handleRemoveTaxRow = (idx) =>
    setTaxDetailRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ---------------- Attachments ---------------- */

  const handleAttachmentCellChange = (idx, key, file) =>
    setAttachmentRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: file } : row)),
    );
  const handleAddAttachmentRow = () =>
    setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);
  const handleRemoveAttachmentRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Totals ---------------- */

  const basicAmount = detailRows
    .filter((r) => r.itemId)
    .reduce((sum, r) => sum + toNum(r.amount), 0);
  const totalTax = taxDetailRows
    .filter((t) => t.particulars)
    .reduce((sum, t) => sum + toNum(t.taxAmount), 0);
  const totalAmount = round2(basicAmount + totalTax);

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};
    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.gatePassNo) errors.gatePassNo = "Gate Pass No is required";
    if (!header.scheduleNo) errors.scheduleNo = "Schedule No is required";
    if (!header.date) errors.date = "Date is required";
    // On edit, the saved record may have no doc id — don't block the update
    if (!isEditMode && !header.scGrnNo?.trim())
      errors.scGrnNo = "S.C GRN No is required";

    const hasValidRow = detailRows.some(
      (r) => r.itemId && toNum(r.gatePassQty) > 0 && toNum(r.receivedQty) > 0,
    );
    if (!hasValidRow)
      errors.grnDetail =
        "Add at least one incoming item with a Gate Pass Qty and Received Qty greater than 0";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) {
      setActiveChildTab("grnDetail");
      return;
    }
    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Matches PUT /api/subContract/createUpdateSubContractingGRN exactly.
    // id is included only when editing an existing record — never sent on create.
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      active: header.active,
      basicAmount: round2(basicAmount),
      belongsTo: header.belongsTo || "",
      branch: toInt(branch),
      cancelRemarks: header.cancelRemarks || "",
      contractNo: header.contractNo || "",
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
      department: toInt(header.department),
      details: detailRows
        .filter((r) => r.itemId)
        .map((r) => ({
          accQtyInPrimaryUnit: toNum(r.accQtyInPrimaryUnit),
          acceptedQty: toNum(r.acceptedQty),
          cgstRate: toNum(r.cgstRate),
          consumption: r.consumption
            .filter((c) => c.itemId)
            .map((c) => ({
              amount: toNum(c.amount),
              availableStock: toNum(c.availableStock),
              bomQty: toNum(c.bomQty),
              bomScrap: toNum(c.bomScrap),
              itemType: c.itemType || "",
              outgoingItem: toInt(c.itemId),
              rate: toNum(c.rate),
              scrapItem: c.scrapItem || "",
              scrapQty: toNum(c.scrapQty),
              unit: toInt(c.unitId),
            })),
          gatePassQty: toNum(r.gatePassQty),
          igstRate: toNum(r.igstRate),
          incomingItem: toInt(r.itemId),
          inspectionable: r.inspectionable || "",
          jobOrderNo: r.jobOrderNo || "",
          jobOrderQty: toNum(r.jobOrderQty),
          jobOrderRate: toNum(r.jobOrderRate),
          location: toInt(r.location),
          primaryUnit: toInt(r.unitId),
          qtyInPrimaryUnit: toNum(r.qtyInPrimaryUnit),
          receivedQty: toNum(r.receivedQty),
          rejQtyInPrimaryUnit: toNum(r.rejQtyInPrimaryUnit),
          rejectedQty: toNum(r.rejectedQty),
          sgstRate: toNum(r.sgstRate),
          stock: toNum(r.stock),
          tolerance: toNum(r.tolerance),
        })),
      financialYear,
      gatePassNo: header.gatePassNo || "",
      grnClearTime: header.grnClearTime || "",
      gstState: header.gstState || "",
      gstType: header.gstType || "",
      gstnNo: header.gstnNo || "",
      isIGSTAppl: Boolean(header.isIGSTAppl),
      orgId: toInt(orgId),
      remarks: header.remarks || "",
      revsChrg: Boolean(header.revsChrg),
      rework: header.rework || "",
      sacCode: toInt(header.sacCode),
      schEndDate: header.schEndDate || "",
      schStartDate: header.schStartDate || "",
      scheduleNo: header.scheduleNo || "",
      serviceName: toInt(header.serviceName),
      supplierDcDate: header.supplierDcDate || "",
      supplierDcNo: header.supplierDcNo || "",
      taxDetails: taxDetailRows
        .filter((t) => t.particulars)
        .map((t) => ({
          particulars: t.particulars,
          taxAmount: toNum(t.taxAmount),
        })),
      taxPercentage: toNum(header.taxPercentage),
      taxType: header.taxType || "",
      totalAmount,
      totalTax: round2(totalTax),
      vendor: toInt(header.vendorId),
      vendorLocation: toInt(header.vendorLocation),
      invoiceCopy: attachmentRows
        .filter((row) => row.invoiceCopy)
        .map((row) => ({ fileName: row.invoiceCopy?.name })),
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
      // apiClient's interceptor throws error.response.data directly, so the
      // error itself may be the backend body (not an axios error object).
      const body = err?.response?.data || err;
      addToast(
        body?.errors?.[0]?.shortMessage ||
          body?.errors?.[0]?.longMessage ||
          body?.message ||
          body?.statusMessage ||
          body?.error ||
          "Something went wrong.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Column definitions ---------------- */

  const detailColumns = [
    { key: "incomingItemCode", label: "Incoming Item Code" },
    { key: "itemDescription", label: "Incoming Item Desc" },
    { key: "stock", label: "Stk" },
    { key: "tolerance", label: "Tolerance" },
    { key: "unitCode", label: "Primary Unit" },
    { key: "jobOrderNo", label: "Job Order No" },
    { key: "jobOrderQty", label: "Job Order Qty" },
    { key: "jobOrderRate", label: "JO Rate" },
    { key: "gatePassQty", label: "Gate Pass Qty" },
    { key: "inspectionable", label: "Inspectionable" },
    { key: "pendingQty", label: "Pending Qty" },
    { key: "receivedQty", label: "Received Qty" },
    { key: "excessQty", label: "Excess Qty" },
    { key: "qtyInPrimaryUnit", label: "Qty In Primary Unit" },
    { key: "location", label: "Location" },
    { key: "acceptedQty", label: "Accepted Qty" },
    { key: "accQtyInPrimaryUnit", label: "Acc Qty In Primary Unit" },
    { key: "rejectedQty", label: "Rejected Qty" },
    { key: "rejQtyInPrimaryUnit", label: "Rej Qty In Primary Unit" },
    { key: "amount", label: "Amount" },
    { key: "sgstRate", label: "SGST Rate" },
    { key: "sgstAmount", label: "SGST Amount" },
    { key: "cgstRate", label: "CGST Rate" },
    { key: "cgstAmount", label: "CGST Amount" },
    { key: "igstRate", label: "IGST Rate" },
    { key: "igstAmount", label: "IGST Amount" },
  ];

  const readOnlyDetailKeys = new Set([
    "itemDescription",
    "unitCode",
    "jobOrderNo",
    "jobOrderQty",
    "jobOrderRate",
    "pendingQty",
    "excessQty",
    "amount",
    "sgstAmount",
    "cgstAmount",
    "igstAmount",
  ]);

  const consumptionColumns = [
    { key: "itemCode", label: "OutGoing Item Code" },
    { key: "itemDescription", label: "OutGoing Item Desc", readOnly: true },
    { key: "unitCode", label: "Unit", readOnly: true },
    {
      key: "itemType",
      label: "Item Type",
      type: "select",
      options: ITEM_TYPES,
    },
    { key: "bomQty", label: "Bom Qty", readOnly: true },
    { key: "availableStock", label: "Available Stock", type: "number" },
    { key: "consumedQty", label: "Consumed Qty", readOnly: true },
    { key: "scrapItem", label: "Scrap Item", type: "select", options: YES_NO },
    { key: "bomScrap", label: "Bom Scrap", readOnly: true },
    { key: "scrapQty", label: "Scrap Qty", type: "number" },
    { key: "rate", label: "Rate", type: "number" },
    { key: "amount", label: "Amount", readOnly: true },
  ];

  const grnHasError = Boolean(fieldErrors.grnDetail);

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
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              label="S.C GRN No"
              name="scGrnNo"
              value={generatingDocId ? "Generating..." : header.scGrnNo}
              onChange={() => {}}
              error={fieldErrors.scGrnNo}
              required={!isEditMode}
              disabled
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={withCurrent(belongsToOptions, header.belongsTo)}
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
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              options={departmentOptions}
            />
            <Field
              type="select"
              label="Vendor Id"
              name="vendorId"
              value={header.vendorId}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorId}
              options={vendorOptions}
              required
            />
            <Field
              label="Vendor Name"
              name="vendorName"
              value={header.vendorName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Vendor Location"
              name="vendorLocation"
              value={header.vendorLocation}
              onChange={handleHeaderChange}
              options={locationOptions}
            />
            <Field
              type="select"
              label="Is IGST Appl"
              name="isIGSTAppl"
              value={header.isIGSTAppl ? "Yes" : "No"}
              onChange={handleHeaderChange}
              options={YES_NO}
              disabled
            />
            <Field
              type="select"
              label="Gate Pass No"
              name="gatePassNo"
              value={header.gatePassNo}
              onChange={handleHeaderChange}
              error={fieldErrors.gatePassNo}
              options={withCurrent(gatePassOptions, header.gatePassNo)}
              disabled={!header.vendorId}
              required
            />
            <Field
              label="GSTN No"
              name="gstnNo"
              value={header.gstnNo}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Schedule No"
              name="scheduleNo"
              value={header.scheduleNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scheduleNo}
              options={withCurrent(scheduleOptions, header.scheduleNo)}
              disabled={!header.vendorId}
              required
            />
            <Field
              label="GST Type"
              name="gstType"
              value={header.gstType}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Rework"
              name="rework"
              value={header.rework}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              type="select"
              label="Is Revs Chrg"
              name="revsChrg"
              value={header.revsChrg ? "Yes" : "No"}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              label="Service Name"
              name="serviceNameLabel"
              value={
                scheduleOptions.find(
                  (s) => String(s.serviceId) === String(header.serviceName),
                )?.serviceName ||
                data?.serviceName?.serviceName ||
                ""
              }
              onChange={() => {}}
              disabled
            />
            <Field
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={header.schStartDate}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="SAC Code"
              name="sacCodeLabel"
              value={
                scheduleOptions.find(
                  (s) => String(s.hsnId) === String(header.sacCode),
                )?.hsnCode ||
                data?.sacCode?.hsn ||
                ""
              }
              onChange={() => {}}
              disabled
            />
            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={header.schEndDate}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Tax Type"
              name="taxType"
              value={header.taxType}
              onChange={handleHeaderChange}
            />
            <Field
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="number"
              label="Tax (%)"
              name="taxPercentage"
              value={header.taxPercentage}
              onChange={handleHeaderChange}
            />
            <Field
              label="Supplier DC No"
              name="supplierDcNo"
              value={header.supplierDcNo}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="date"
              label="Supplier DC Date"
              name="supplierDcDate"
              value={header.supplierDcDate}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="time"
              label="GRN Clear Time"
              name="grnClearTime"
              value={header.grnClearTime}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
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
                  {tab.key === "grnDetail" && grnHasError && (
                    <span className="ml-1 text-red-300">•</span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeChildTab === "grnDetail") handleAddDetailRow();
                else if (activeChildTab === "taxDetails") handleAddTaxRow();
                else if (activeChildTab === "invoiceCopy")
                  handleAddAttachmentRow();
              }}
              className={`h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors ${
                activeChildTab === "summary" ? "invisible" : ""
              }`}
            >
              <Plus size={12} />
            </button>
          </div>

          {/* GRN Detail (with nested Consumption/Scrap) */}
          {activeChildTab === "grnDetail" && (
            <div className="pt-4">
              <TableWrapper>
                <TableHead
                  headers={[
                    "#",
                    "",
                    ...detailColumns.map((c) => c.label),
                    "Action",
                  ]}
                />
                <tbody>
                  {detailRows.map((row, idx) => (
                    <Fragment key={idx}>
                      <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 text-center font-medium dark:text-white">
                          {idx + 1}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const opening = expandedRow !== idx;
                              setExpandedRow(opening ? idx : null);
                              // load BOM options so consumption selects work
                              if (opening && row.itemId)
                                loadBomForItem(row.itemId);
                            }}
                            className="text-gray-500 dark:text-gray-300"
                          >
                            {expandedRow === idx ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </button>
                        </td>
                        {detailColumns.map((col) => (
                          <td className="p-2 align-top" key={col.key}>
                            {col.key === "incomingItemCode" ? (
                              <select
                                value={row.optionKey}
                                onChange={(e) =>
                                  handleDetailCellChange(
                                    idx,
                                    "incomingItemCode",
                                    e.target.value,
                                  )
                                }
                                className={cellInputClasses}
                              >
                                <option value="">-- Select --</option>
                                {itemOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                                {/* keeps the saved item visible when editing */}
                                {row.optionKey &&
                                  !itemOptions.some(
                                    (o) => o.value === row.optionKey,
                                  ) && (
                                    <option value={row.optionKey}>
                                      {row.itemCode} ({row.jobOrderNo})
                                    </option>
                                  )}
                              </select>
                            ) : col.key === "inspectionable" ? (
                              <select
                                value={row.inspectionable}
                                onChange={(e) =>
                                  handleDetailCellChange(
                                    idx,
                                    "inspectionable",
                                    e.target.value,
                                  )
                                }
                                className={cellInputClasses}
                              >
                                {YES_NO.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : col.key === "location" ? (
                              <select
                                value={row.location}
                                onChange={(e) =>
                                  handleDetailCellChange(
                                    idx,
                                    "location",
                                    e.target.value,
                                  )
                                }
                                className={cellInputClasses}
                              >
                                <option value="">-- Select --</option>
                                {locationOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={row[col.key] ?? ""}
                                readOnly={readOnlyDetailKeys.has(col.key)}
                                onChange={(e) =>
                                  handleDetailCellChange(
                                    idx,
                                    col.key,
                                    e.target.value,
                                  )
                                }
                                className={
                                  readOnlyDetailKeys.has(col.key)
                                    ? cellReadOnlyClasses
                                    : cellInputClasses
                                }
                              />
                            )}
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDetailRow(idx)}
                            disabled={detailRows.length <= 1}
                            className={`h-6 w-6 rounded text-white flex items-center justify-center ${
                              detailRows.length <= 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>

                      {expandedRow === idx && (
                        <tr>
                          <td
                            colSpan={detailColumns.length + 3}
                            className="p-3 bg-gray-50 dark:bg-gray-900"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Consumption / Scrap —{" "}
                                {row.itemCode ||
                                  "select an incoming item first"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddConsumptionRow(idx)}
                                className="h-5 w-5 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                            <TableWrapper>
                              <TableHead
                                headers={[
                                  "#",
                                  ...consumptionColumns.map((c) => c.label),
                                  "Action",
                                ]}
                              />
                              <tbody>
                                {row.consumption.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={consumptionColumns.length + 2}
                                      className="p-2 text-center text-[11px] text-gray-400"
                                    >
                                      No consumption/scrap rows yet.
                                    </td>
                                  </tr>
                                ) : (
                                  row.consumption.map((c, ci) => (
                                    <tr
                                      key={ci}
                                      className="border-t dark:border-gray-700"
                                    >
                                      <td className="p-2 text-center dark:text-white">
                                        {ci + 1}
                                      </td>
                                      {consumptionColumns.map((col) => (
                                        <td
                                          className="p-2 align-top"
                                          key={col.key}
                                        >
                                          {col.key === "itemCode" ? (
                                            <select
                                              value={c.itemId}
                                              onChange={(e) =>
                                                handleConsumptionCellChange(
                                                  idx,
                                                  ci,
                                                  "itemId",
                                                  e.target.value,
                                                )
                                              }
                                              className={cellInputClasses}
                                            >
                                              <option value="">
                                                -- Select --
                                              </option>
                                              {(
                                                bomOptionsByItem[row.itemId] ||
                                                []
                                              ).map((b) => (
                                                <option
                                                  key={b.itemId}
                                                  value={b.itemId}
                                                >
                                                  {b.itemCode}
                                                </option>
                                              ))}
                                              {/* keeps the saved outgoing item visible when editing */}
                                              {c.itemId &&
                                                !(
                                                  bomOptionsByItem[
                                                    row.itemId
                                                  ] || []
                                                ).some(
                                                  (b) =>
                                                    String(b.itemId) ===
                                                    String(c.itemId),
                                                ) && (
                                                  <option value={c.itemId}>
                                                    {c.itemCode}
                                                  </option>
                                                )}
                                            </select>
                                          ) : col.type === "select" ? (
                                            <select
                                              value={c[col.key] ?? ""}
                                              onChange={(e) =>
                                                handleConsumptionCellChange(
                                                  idx,
                                                  ci,
                                                  col.key,
                                                  e.target.value,
                                                )
                                              }
                                              className={cellInputClasses}
                                            >
                                              <option value="">
                                                -- Select --
                                              </option>
                                              {col.options.map((opt) => (
                                                <option key={opt} value={opt}>
                                                  {opt}
                                                </option>
                                              ))}
                                            </select>
                                          ) : (
                                            <input
                                              type={
                                                col.type === "number"
                                                  ? "number"
                                                  : "text"
                                              }
                                              value={c[col.key] ?? ""}
                                              readOnly={col.readOnly}
                                              onChange={(e) =>
                                                handleConsumptionCellChange(
                                                  idx,
                                                  ci,
                                                  col.key,
                                                  e.target.value,
                                                )
                                              }
                                              className={
                                                col.readOnly
                                                  ? cellReadOnlyClasses
                                                  : cellInputClasses
                                              }
                                            />
                                          )}
                                        </td>
                                      ))}
                                      <td className="p-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveConsumptionRow(idx, ci)
                                          }
                                          className="h-5 w-5 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </TableWrapper>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </TableWrapper>

              {fieldErrors.grnDetail && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.grnDetail}
                </p>
              )}
            </div>
          )}

          {/* Tax Details */}
          {activeChildTab === "taxDetails" && (
            <div className="pt-4">
              <DynamicTable
                columns={[
                  { key: "particulars", label: "Particulars" },
                  { key: "taxAmount", label: "Tax Amount", type: "number" },
                ]}
                rows={taxDetailRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
              />
            </div>
          )}

          {/* Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-4">
              <div className={fieldGrid}>
                <Field
                  label="Basic Amount"
                  name="basicAmountDisplay"
                  value={round2(basicAmount).toFixed(2)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Total Amount"
                  name="totalAmountDisplay"
                  value={totalAmount.toFixed(2)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="Total Tax"
                  name="totalTaxDisplay"
                  value={round2(totalTax).toFixed(2)}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={header.remarks}
                  onChange={handleHeaderChange}
                  rows={1}
                />
              </div>
            </div>
          )}

          {/* Attached Invoice Copy */}
          {activeChildTab === "invoiceCopy" && (
            <div className="pt-4">
              <AttachmentTable
                rows={attachmentRows}
                onCellChange={handleAttachmentCellChange}
                onRemoveRow={handleRemoveAttachmentRow}
              />
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

export default SubContractingGrnForm;
