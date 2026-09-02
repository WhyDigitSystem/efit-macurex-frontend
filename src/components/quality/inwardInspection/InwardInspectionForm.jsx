import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Paperclip,
  UploadCloud,
  Eye,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import inwardInspectionAPI from "../../../api/quality/inwardInspectionAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import unitMasterAPI from "../../../api/unitAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import { employeeAPI } from "../../../api/employeeAPI";
import { PARAMETER_TYPES } from "../../../api/quality/parameterMasterAPI";

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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

// Spacious grid used inside the child tabs so fields breathe more.
const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

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

// Select field for Approved (Yes/No)
const ApprovedSelectField = ({
  label,
  name,
  value,
  onChange,
  required,
  error,
  disabled,
  className = "",
}) => {
  const options = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

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
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
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
};

// File upload with drag-and-drop or click-to-upload.
const FileField = ({
  label,
  name,
  value,
  onChange,
  required,
  error,
  className = "",
  onViewFile,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    onChange({ target: { name, value: file || "" } });
  };

  // Check if value is an existing file object
  const isExistingFile = value && typeof value === 'object' && value.filePath;

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {isExistingFile ? (
        // Show existing file with view button
        <div className="flex items-center gap-2 h-[30px] px-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
          <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="truncate text-gray-700 dark:text-gray-300 flex-1">
            {value.fileName || value.name || value.filePath?.split('/').pop() || 'File'}
          </span>
          <button
            type="button"
            onClick={() => onViewFile && onViewFile(value)}
            className="h-6 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 transition-colors"
          >
            <Eye size={12} />
            View
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={[
            "flex items-center gap-2 h-[30px] px-2 rounded border text-xs cursor-pointer transition-colors",
            "bg-white dark:bg-gray-900",
            dragOver
              ? "border-blue-500 ring-1 ring-blue-500"
              : error
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-500",
          ].join(" ")}
        >
          <UploadCloud className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="truncate text-gray-500 dark:text-gray-400">
            {value && typeof value === 'object' && value.name
              ? value.name
              : value || "Click or drop supplier report..."}
          </span>
          <input
            type="file"
            name={name}
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}

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
        <th
          key={i}
          className={`p-2 whitespace-nowrap ${i === 0
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

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow, onViewMeasurements }) => (
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

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    value={row[col.key]}
                    rows={1}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      "w-40 h-8 px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
                      "bg-white dark:bg-gray-900 " +
                      "border-gray-300 dark:border-gray-600 " +
                      "text-gray-900 dark:text-gray-100 " +
                      "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
                      "dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    }
                  />
                </td>
              );
            }

            if (col.type === "measurementsView") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <button
                    type="button"
                    onClick={() => onViewMeasurements && onViewMeasurements(idx)}
                    className="h-6 px-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 transition-colors"
                    title="View Measurements"
                  >
                    <Eye size={14} />
                  </button>
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
                  value={row[col.key]}
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

/* ---------------------------------------------------------------------------- */
/* Measurements Popup Component                                                  */

const MeasurementsPopup = ({
  isOpen,
  onClose,
  measurementRows,
  onMeasurementCellChange,
  onAddMeasurementRow,
  onRemoveMeasurementRow,
  unitOptions,
}) => {
  if (!isOpen) return null;

  const columns = [
    { key: "parameter", label: "Parameters" },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: PARAMETER_TYPES,
    },
    { key: "specification", label: "Specification" },
    { key: "acceptanceCriteria", label: "Acceptance Criteria" },
    {
      key: "uom",
      label: "UOM",
    },
    { key: "mv1", label: "Value 1", type: "number" },
    { key: "mv2", label: "Value 2", type: "number" },
    { key: "mv3", label: "Value 3", type: "number" },
    { key: "mv4", label: "Value 4", type: "number" },
    { key: "mv5", label: "Value 5", type: "number" },
    { key: "mv6", label: "Value 6", type: "number" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Confirming", "Non-Confirming"],
    },
    { key: "remarks", label: "Remarks", type: "textarea" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Measurements
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Manage measurements for this inspection
            </div>
            <button
              type="button"
              onClick={onAddMeasurementRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          <DynamicTable
            columns={columns}
            rows={measurementRows}
            onCellChange={onMeasurementCellChange}
            onRemoveRow={onRemoveMeasurementRow}
          />
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs text-white bg-green-600 hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const INWARD_TYPES = ["BROUGHT OUT", "SUB CONTRACTED"];
const PPAP_SAMPLE = ["No/Regular", "Yes"];
const RESULT_OPTIONS = ["Accepted", "Rejected", "Rework", "Pending"];

const CHILD_TABS = [
  { key: "inspectionDetails", label: "Inspection Details", kind: "table" },
  { key: "summary", label: "Summary", kind: "fields" },
  { key: "supplierReport", label: "Attached Supplier Report", kind: "table" },
];

const emptyInspectionRow = () => ({
  itemCode: "",
  itemDescription: "",
  drawingNo: "",
  orderQty: "",
  purchaseUnit: "",
  primaryUnit: "",
  receivedQty: "",
  receivedUnit: "",
  acceptedQty: "",
  acceptedUnit: "",
  receivedLocation: "",
  batchNo: "",
  qtyAcceptedOnDeviation: "",
  acceptedAfterSegregation: "",
  reworkQty: "",
  reworkLocation: "",
  totalAcceptedQty: "",
  conversionFactor: "",
  toatlAccQty: "",
  reworkUnit: "",
  rejectedQty: "",
  rejectedLocation: "",
  reasonForRejection: "",
  rejectUnit: "",
  rate: "",
  amount: "",
  toatlReceivedQty: "",
  inspection: "", // Add this field
});

const emptyMeasurementRow = () => ({
  parameter: "",
  type: "",
  specification: "",
  acceptanceCriteria: "",
  uom: "",
  mv1: "",
  mv2: "",
  mv3: "",
  mv4: "",
  mv5: "",
  mv6: "",
  status: "",
  remarks: "",
});

const emptyReportRow = () => ({
  fileName: null,
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */

const InwardInspectionForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId") || localStorage.getItem("userName") || "SYSTEM";

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("inspectionDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingDocId, setLoadingDocId] = useState(false);
  const [loadingGrn, setLoadingGrn] = useState(false);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showMeasurementsPopup, setShowMeasurementsPopup] = useState(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Initialize GRN options with existing data for editing
  const [grnOptions, setGrnOptions] = useState(() => {
    if (data?.id && data?.mrinGrnNo) {
      return [{ value: data.mrinGrnNo, label: data.mrinGrnNo }];
    }
    return [];
  });

  const [grnDetailsMap, setGrnDetailsMap] = useState(() => {
    if (data?.id && data?.mrinGrnNo) {
      const map = {};
      map[data.mrinGrnNo] = {
        grnNo: data.mrinGrnNo,
        grnDate: data.mrinGrnDate,
        grnTime: data.grnTime,
        poNo: data.poPcJoNo,
        scheduleNo: data.scheduleNo,
      };
      return map;
    }
    return {};
  });

  const [grnItemOptions, setGrnItemOptions] = useState(() => {
    if (data?.inwardInspectionDetailsResponseDTO?.[0]?.item) {
      const item = data.inwardInspectionDetailsResponseDTO[0];
      const label = item.itemDescription
        ? `${item.item} - ${item.itemDescription}`
        : item.item;
      return [{ value: item.item, label: label }];
    }
    return [];
  });

  const [grnItemDetailsMap, setGrnItemDetailsMap] = useState(() => {
    if (data?.inwardInspectionDetailsResponseDTO?.[0]?.item) {
      const item = data.inwardInspectionDetailsResponseDTO[0];
      const map = {};
      map[item.item] = {
        itemCode: item.item,
        itemDescription: item.itemDescription || "",
        drawingNo: item.drawingNo || "",
        poQty: item.orderQty || "",
        receivedQty: item.receivedQty || "",
        purchaseUnitDescription: item.purchaseUnit || "",
        primaryUnitDescription: item.primaryUnit || "",
        acceptQty: item.acceptQty || "",
        inspectionDescription: item.inspection || "",
      };
      return map;
    }
    return {};
  });

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      docNo: data?.docNo || (data ? "" : ""),
      inwardType: data?.inwardType || "",
      docDate: data?.docDate || dayjs().format("YYYY-MM-DD"),
      supplierCode: data?.supplierCode?.id ?? data?.supplierCode ?? "",
      supplierName: data?.supplierName || "",
      mrnNo: data?.mrnNo || data?.mrinGrnNo || "",
      approved: data?.approved || "No",
      mrnDate: data?.mrnDate || data?.mrinGrnDate || "",
      timeOfInspection: data?.timeOfInspection || dayjs().format("HH:mm:ss"),
      mrnGrnTime: data?.mrnGrnTime || data?.grnTime || "",
      isoExpiryDate: data?.isoExpiryDate || data?.isoExpiaryDate || "",
      poPcJoNo: data?.poPcJoNo || "",
      ppapSample: data?.ppapSample || "",
      scheduleNo: data?.scheduleNo || "",
      supplierInvoiceNo: data?.supplierInvoiceNo || data?.supInvNo || "",
      supplierInvoiceDate: data?.supplierInvoiceDate || data?.supInvDt || "",
      active: data?.active !== false,
    };
    base.docDate = fmtDate(base.docDate);
    base.mrnDate = fmtDate(base.mrnDate);
    base.isoExpiryDate = fmtDate(base.isoExpiryDate);
    base.supplierInvoiceDate = fmtDate(base.supplierInvoiceDate);
    return base;
  });

  const [inspectionRows, setInspectionRows] = useState(() => {
    // Check if we have data from props (editing)
    if (data?.inwardInspectionDetailsResponseDTO?.length) {
      return data.inwardInspectionDetailsResponseDTO.map((d) => ({
        itemCode: d.item || "",
        itemDescription: d.itemDescription || "",
        drawingNo: d.drawingNo || "",
        orderQty: d.orderQty || "",
        purchaseUnit: d.purchaseUnit || "",
        primaryUnit: d.primaryUnit || "",
        receivedQty: d.receivedQty || "",
        receivedUnit: d.receivedUnit || "",
        acceptedQty: d.acceptQty || "",
        acceptedUnit: d.acceptUnit?.id || "",
        receivedLocation: d.receivedLocation?.id || "",
        batchNo: d.batchNo || "",
        qtyAcceptedOnDeviation: d.qtyAccOnDevtn || "",
        acceptedAfterSegregation: d.accQtyAfterSegn || "",
        reworkQty: d.reworkQty || "",
        reworkLocation: d.reworkLocation?.id || "",
        totalAcceptedQty: d.totAccQty || "",
        conversionFactor: d.conversionFactor || "",
        toatlAccQty: d.totalAccQtyInPrimaryUnit || "",
        reworkUnit: d.reworkUnit?.id || "",
        rejectedQty: d.rejectQty || "",
        rejectedLocation: d.rejectedLocation?.id || "",
        reasonForRejection: d.reason || "",
        rejectUnit: d.rejectUnit?.id || "",
        rate: d.rate || "",
        amount: d.amount || "",
        toatlReceivedQty: d.totalReceivedQty || "",
        stk: d.stk || "",
        inspection: d.inspection || "",
      }));
    }
    // Check if we have data from inspectionDetails (another format)
    if (data?.inspectionDetails?.length) {
      return data.inspectionDetails;
    }
    // Default empty row
    return [emptyInspectionRow()];
  });

  const [measurementRows, setMeasurementRows] = useState(
    data?.measurements?.length ? data.measurements : [emptyMeasurementRow()],
  );

  const [summary, setSummary] = useState({
    considerations:
      data?.summary?.considerations || data?.inwardSummary?.considerations || data?.considerations || "",
    disposalAction:
      data?.summary?.disposalAction || data?.inwardSummary?.disposalAction || data?.disposalAction || "",
    checkedBy:
      data?.summary?.checkedBy?.id ??
      data?.summary?.checkedBy ??
      data?.inwardSummary?.checkedBy?.id ??
      data?.inwardSummary?.checkedBy ??
      data?.checkedBy?.id ??
      "",
    approvedBy:
      data?.summary?.approvedBy?.id ??
      data?.summary?.approvedBy ??
      data?.inwardSummary?.approvedBy?.id ??
      data?.inwardSummary?.approvedBy ??
      data?.approvedBy?.id ??
      "",
    result:
      data?.summary?.result ??
      data?.inwardSummary?.result ??
      data?.result ??
      "",
    notes:
      data?.summary?.notes ??
      data?.inwardSummary?.notes ??
      data?.notes ??
      "",
  });

  const [reportRows, setReportRows] = useState(
    data?.supplierReports?.length ? data.supplierReports : data?.inwardInspectionFileUploadDetailsResponseDTO?.length ? data.inwardInspectionFileUploadDetailsResponseDTO.map((f) => ({ fileName: f })) : [emptyReportRow()],
  );

  // Ref to track if data has been loaded
  const dataLoadedRef = useRef(false);

  // Load data by ID when editing
  const loadInspectionData = useCallback(async (inspectionId) => {
    if (!inspectionId) return;

    setLoadingData(true);
    try {
      const response = await inwardInspectionAPI.getInwardInspectionById(inspectionId);
      console.log("Get By ID Response:", response);

      if (response) {
        const inspection = response;

        // Set header data
        setHeader({
          plantId: inspection.branch?.id || "",
          docNo: inspection.docId || "",
          inwardType: inspection.inwardType || "",
          docDate: fmtDate(inspection.docDate) || dayjs().format("YYYY-MM-DD"),
          supplierCode: inspection.supplierCode?.id || "",
          supplierName: inspection.supplierCode?.supplierName || "",
          mrnNo: inspection.mrinGrnNo || "",
          approved: inspection.approved ? "Yes" : "No",
          mrnDate: fmtDate(inspection.mrinGrnDate) || "",
          timeOfInspection: inspection.timeOfInspection || dayjs().format("HH:mm:ss"),
          mrnGrnTime: inspection.grnTime || "",
          isoExpiryDate: fmtDate(inspection.isoExpiaryDate) || "",
          poPcJoNo: inspection.poPcJoNo || "",
          ppapSample: inspection.ppapSample || "",
          scheduleNo: inspection.scheduleNo || "",
          supplierInvoiceNo: inspection.supInvNo || "",
          supplierInvoiceDate: fmtDate(inspection.supInvDt) || "",
          active: inspection.active === "Active" || inspection.active === true,
        });

        // Set MRN options to include the existing MRN
        if (inspection.mrinGrnNo) {
          setGrnOptions([
            {
              value: inspection.mrinGrnNo,
              label: inspection.mrinGrnNo,
            }
          ]);
          setGrnDetailsMap({
            [inspection.mrinGrnNo]: {
              grnNo: inspection.mrinGrnNo,
              grnDate: inspection.mrinGrnDate,
              grnTime: inspection.grnTime,
              poNo: inspection.poPcJoNo,
              scheduleNo: inspection.scheduleNo,
            }
          });
        }

        // ---- FIX: Call GRN Item Details API to get item details ----
        if (inspection.mrinGrnNo && inspection.supplierCode?.id && inspection.poPcJoNo) {
          try {
            setLoadingItemDetails(true);
            const grnItemResponse = await inwardInspectionAPI.getGrnItemDetails(
              branch,
              orgId,
              inspection.poPcJoNo,
              inspection.supplierCode.id
            );
            console.log("GRN Item Details Response:", grnItemResponse);

            if (grnItemResponse?.paramObjectsMap?.grnDetails) {
              const itemList = grnItemResponse.paramObjectsMap.grnDetails;
              const map = {};
              const options = itemList.map((item) => {
                map[item.itemCode] = item;
                return {
                  value: item.itemCode,
                  label: `${item.itemCode} - ${item.itemDescription || ''}`,
                };
              });

              // Merge with existing options to keep the selected one
              const existingItem = inspection.inwardInspectionDetailsResponseDTO?.[0];
              if (existingItem && existingItem.item) {
                // Add existing item if not in the list
                const exists = options.some(opt => String(opt.value) === String(existingItem.item));
                if (!exists) {
                  options.unshift({
                    value: existingItem.item,
                    label: `${existingItem.item} - ${existingItem.itemDescription || ''}`,
                  });
                }
              }

              setGrnItemOptions(options);
              setGrnItemDetailsMap(map);
            }
          } catch (error) {
            console.error("Error fetching GRN item details:", error);
          } finally {
            setLoadingItemDetails(false);
          }
        }

        // Set summary
        setSummary({
          considerations: inspection.considerations || "",
          disposalAction: inspection.disposalAction || "",
          checkedBy: inspection.checkedBy?.id || "",
          approvedBy: inspection.approvedBy?.id || "",
          result: inspection.result || "",
          notes: inspection.notes || "",
        });

        // Set inspection details
        // Set inspection details
        if (inspection.inwardInspectionDetailsResponseDTO?.length) {
          const details = inspection.inwardInspectionDetailsResponseDTO.map((d) => ({
            itemCode: d.item || "", // This should be the numeric ID like 1000000006
            itemDescription: d.itemDescription || "",
            drawingNo: d.drawingNo || "",
            orderQty: d.orderQty || "",
            purchaseUnit: d.purchaseUnit || "",
            primaryUnit: d.primaryUnit || "",
            receivedQty: d.receivedQty || "",
            receivedUnit: d.receivedUnit || "",
            acceptedQty: d.acceptQty || "",
            acceptedUnit: d.acceptUnit?.id || "",
            receivedLocation: d.receivedLocation?.id || "",
            batchNo: d.batchNo || "",
            qtyAcceptedOnDeviation: d.qtyAccOnDevtn || "",
            acceptedAfterSegregation: d.accQtyAfterSegn || "",
            reworkQty: d.reworkQty || "",
            reworkLocation: d.reworkLocation?.id || "",
            totalAcceptedQty: d.totAccQty || "",
            conversionFactor: d.conversionFactor || "",
            toatlAccQty: d.totalAccQtyInPrimaryUnit || "",
            reworkUnit: d.reworkUnit?.id || "",
            rejectedQty: d.rejectQty || "",
            rejectedLocation: d.rejectedLocation?.id || "",
            reasonForRejection: d.reason || "",
            rejectUnit: d.rejectUnit?.id || "",
            rate: d.rate || "",
            amount: d.amount || "",
            toatlReceivedQty: d.totalReceivedQty || "",
            stk: d.stk || "",
            inspection: d.inspection || "",
          }));
          setInspectionRows(details);

          console.log("Inspection Details from API:", details);

          // Update the first row with GRN item details if available
          const existingDetail = inspection.inwardInspectionDetailsResponseDTO[0];
          if (existingDetail && existingDetail.item) {
            // Get the GRN item details from the map
            const grnItem = grnItemDetailsMap[existingDetail.item];
            console.log("GRN Item for existing detail:", grnItem);

            setInspectionRows(prev => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[0] = {
                  ...updated[0],
                  itemCode: existingDetail.item, // Set the numeric ID
                  itemDescription: grnItem?.itemDescription || existingDetail.itemDescription || "",
                  drawingNo: grnItem?.drawingNo || existingDetail.drawingNo || "",
                  orderQty: grnItem?.poQty || existingDetail.orderQty || "",
                  receivedQty: grnItem?.receivedQty || existingDetail.receivedQty || "",
                  purchaseUnit: grnItem?.purchaseUnitDescription || existingDetail.purchaseUnit || "",
                  primaryUnit: grnItem?.primaryUnitDescription || existingDetail.primaryUnit || "",
                  acceptedQty: grnItem?.acceptQty || existingDetail.acceptQty || "",
                  inspection: grnItem?.inspectionDescription || existingDetail.inspection || "",
                  toatlReceivedQty: grnItem?.receivedQty || existingDetail.receivedQty || "",
                };
              }
              console.log("Updated inspection rows:", updated);
              return updated;
            });
          }
        }

        // Set measurements
        if (inspection.inwardInspectionDetailsResponseDTO?.[0]?.inwardInspectionMeasurementsResponseDTO?.length) {
          const measurements = inspection.inwardInspectionDetailsResponseDTO[0]
            .inwardInspectionMeasurementsResponseDTO.map((m) => ({
              parameter: m.parameters || "",
              type: m.type || "",
              specification: m.spec || "",
              acceptanceCriteria: m.accCriteria || "",
              uom: m.uom || "",
              mv1: m.test1 || "",
              mv2: m.test2 || "",
              mv3: m.test3 || "",
              mv4: m.test4 || "",
              mv5: m.test5 || "",
              mv6: m.test6 || "",
              status: m.status || "",
              remarks: m.remarks || "",
            }));
          setMeasurementRows(measurements);
        }

        // Set file attachments
        if (inspection.inwardInspectionFileUploadDetailsResponseDTO?.length) {
          const files = inspection.inwardInspectionFileUploadDetailsResponseDTO.map((f) => ({
            fileName: f,
          }));
          setReportRows(files);
        }

        dataLoadedRef.current = true;
      }
    } catch (error) {
      console.error("Error loading inspection data:", error);
      addToast("Failed to load inspection data", "error");
    } finally {
      setLoadingData(false);
    }
  }, [addToast, branch, orgId]);

  // Load data when editing - only once
  useEffect(() => {
    if (data?.id && !dataLoadedRef.current) {
      loadInspectionData(data.id);
    }
  }, [data?.id, loadInspectionData]);

  // Reset the loaded flag when data ID changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [data?.id]);

  /* ---------------- Generate Doc ID ---------------- */
  const generateDocId = useCallback(async () => {
    if (data?.docNo) return;

    setLoadingDocId(true);
    try {
      const currentYear = dayjs().year();
      const response = await inwardInspectionAPI.getInwardInspectionDocId(
        currentYear,
        orgId
      );

      if (response?.paramObjectsMap?.docId) {
        setHeader((prev) => ({ ...prev, docNo: response.paramObjectsMap.docId }));
      }
    } catch (error) {
      console.error("Error generating Doc ID:", error);
      const fallbackDocNo = `BLR/II/${dayjs().year()}-${dayjs().year() + 1}/00001`;
      setHeader((prev) => ({ ...prev, docNo: fallbackDocNo }));
    } finally {
      setLoadingDocId(false);
    }
  }, [orgId, data?.docNo]);

  /* ---------------- Load Location Options ---------------- */
  const loadLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const response = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      console.log("Location Response:", response);

      if (response && Array.isArray(response)) {
        const options = response.map((loc) => ({
          value: loc.id,
          label: loc.locationName || loc.locationId || loc.id,
        }));
        setLocationOptions(options);
      } else {
        setLocationOptions([]);
      }
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationOptions([]);
      addToast("Failed to load locations", "error");
    } finally {
      setLoadingLocations(false);
    }
  }, [orgId, branch, addToast]);

  /* ---------------- Load GRN Details ---------------- */
  const loadGrnDetails = useCallback(async (supplierCode) => {
    if (!supplierCode) {
      setGrnOptions([]);
      setGrnDetailsMap({});
      return;
    }

    setLoadingGrn(true);
    try {
      const response = await inwardInspectionAPI.getGrnNoDetails(
        branch,
        orgId,
        supplierCode
      );

      if (response?.paramObjectsMap?.grnDetails) {
        const grnList = response.paramObjectsMap.grnDetails;
        const map = {};
        const options = grnList.map((grn) => {
          map[grn.grnNo] = grn;
          return {
            value: grn.grnNo,
            label: grn.grnNo,
          };
        });
        setGrnOptions(options);
        setGrnDetailsMap(map);
      } else {
        setGrnOptions([]);
        setGrnDetailsMap({});
      }
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      setGrnOptions([]);
      setGrnDetailsMap({});
      addToast("Failed to load GRN details", "error");
    } finally {
      setLoadingGrn(false);
    }
  }, [branch, orgId, addToast]);

  /* ---------------- Load GRN Item Details ---------------- */
  const loadGrnItemDetails = useCallback(async (purchaseOrderNo, supplierCode) => {
    if (!purchaseOrderNo || !supplierCode) {
      setGrnItemDetailsMap({});
      setGrnItemOptions([]);
      return;
    }

    setLoadingItemDetails(true);
    try {
      const response = await inwardInspectionAPI.getGrnItemDetails(
        branch,
        orgId,
        purchaseOrderNo,
        supplierCode
      );

      console.log("GRN Item Details Response:", response);

      if (response?.paramObjectsMap?.grnDetails) {
        const itemList = response.paramObjectsMap.grnDetails;
        const map = {};
        const options = itemList.map((item) => {
          // Store item details with numeric item ID as key
          const itemId = item.item; // This is the numeric ID like 1000000006
          map[itemId] = {
            itemCode: itemId, // Store the numeric ID
            itemDescription: item.itemDescription || "",
            drawingNo: item.drawingNo || "",
            poQty: item.poQty || "",
            receivedQty: item.receivedQty || "",
            purchaseUnitDescription: item.purchaseUnitDescription || "",
            primaryUnitDescription: item.primaryUnitDescription || "",
            acceptQty: item.acceptQty || "",
            inspectionDescription: item.inspectionDescription || "",
          };
          return {
            value: itemId, // Use numeric ID as the value
            label: `${item.itemCode} - ${item.itemDescription || ''}`,
          };
        });
        setGrnItemDetailsMap(map);
        setGrnItemOptions(options);

        console.log("GRN Item Options:", options);
        console.log("GRN Item Details Map:", map);
      } else {
        setGrnItemDetailsMap({});
        setGrnItemOptions([]);
      }
    } catch (error) {
      console.error("Failed to load GRN item details:", error);
      setGrnItemDetailsMap({});
      setGrnItemOptions([]);
      addToast("Failed to load GRN item details", "error");
    } finally {
      setLoadingItemDetails(false);
    }
  }, [branch, orgId, addToast]);

  /* ---------------- Load Supplier Details ---------------- */
  const loadSuppliers = useCallback(async () => {
    try {
      const response = await inwardInspectionAPI.getSupplierDetailsShortClose(
        branch,
        orgId
      );

      if (response?.paramObjectsMap?.mapp) {
        const supplierList = response.paramObjectsMap.mapp;
        setSupplierOptions(
          supplierList.map((s) => ({
            value: s.supplierId,
            label: `${s.supplierCode} - ${s.supplierName}`,
            supplierName: s.supplierName,
            supplierCode: s.supplierCode,
          }))
        );
      } else {
        setSupplierOptions([]);
      }
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSupplierOptions([]);
      addToast("Failed to load suppliers", "error");
    }
  }, [branch, orgId, addToast]);

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadUnits = useCallback(async () => {
    try {
      const res = await unitMasterAPI.getUnits(branch, orgId);
      setUnitOptions(
        (res || []).map((u) => ({
          value: u.id,
          label: u.unitId,
        })),
      );
    } catch (error) {
      console.error("Failed to load unit options:", error);
      setUnitOptions([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.name || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadUnits();
      loadSuppliers();
      loadEmployees();
      loadLocations();
    }
  }, [
    orgId,
    branch,
    loadUnits,
    loadSuppliers,
    loadEmployees,
    loadLocations,
  ]);

  // Generate Doc ID on mount (only for new records)
  useEffect(() => {
    if (!data?.id && !data?.docNo) {
      generateDocId();
    }
  }, [generateDocId, data]);

  // Load GRN details when supplier changes (only for new records)
  useEffect(() => {
    if (header.supplierCode && !data?.id) {
      loadGrnDetails(header.supplierCode);
    } else {
      // Don't reset grnOptions if we're editing and have data
      if (!data?.id) {
        setGrnOptions([]);
        setGrnDetailsMap({});
      }
    }
  }, [header.supplierCode, loadGrnDetails, data?.id]);

  // Load GRN item details when MRN is selected (only for new records)
  useEffect(() => {
    if (header.mrnNo && header.supplierCode && !data?.id) {
      const grnDetail = grnDetailsMap[header.mrnNo];
      if (grnDetail?.poNo) {
        loadGrnItemDetails(grnDetail.poNo, header.supplierCode);
      }
    }
  }, [header.mrnNo, header.supplierCode, grnDetailsMap, loadGrnItemDetails, data?.id]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "supplierCode") {
        const supplier = supplierOptions.find(
          (s) => String(s.value) === String(value),
        );
        next.supplierName = supplier?.supplierName || "";
        // Reset MRN when supplier changes
        next.mrnNo = "";
      }
      // Auto-fill GRN details when MRN is selected
      if (name === "mrnNo") {
        const grnDetail = grnDetailsMap[value];
        if (grnDetail) {
          next.mrnDate = fmtDate(grnDetail.grnDate) || next.mrnDate;
          next.mrnGrnTime = grnDetail.grnTime || next.mrnGrnTime;
          next.poPcJoNo = grnDetail.poNo || next.poPcJoNo;
          next.scheduleNo = grnDetail.scheduleNo || next.scheduleNo;
        }
      }
      return next;
    });
  };

  const handleInspectionCellChange = (idx, key, value) => {
    setInspectionRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          // value is the numeric item ID from the dropdown
          const grnItem = grnItemDetailsMap[value];
          console.log("Selected item value:", value);
          console.log("GRN Item details:", grnItem);

          if (grnItem) {
            next.itemCode = value; // Store the numeric ID
            next.itemDescription = grnItem.itemDescription || "";
            next.drawingNo = grnItem.drawingNo || "";
            next.orderQty = grnItem.poQty || "";
            next.receivedQty = grnItem.receivedQty || "";
            next.purchaseUnit = grnItem.purchaseUnitDescription || "";
            next.primaryUnit = grnItem.primaryUnitDescription || "";
            next.acceptedQty = grnItem.acceptQty || "";
            next.inspection = grnItem.inspectionDescription || "";
            next.toatlReceivedQty = grnItem.receivedQty || "";
          } else {
            // If no GRN item found, keep existing values
            next.itemDescription = row.itemDescription || "";
            next.drawingNo = row.drawingNo || "";
            next.orderQty = row.orderQty || "";
            next.receivedQty = row.receivedQty || "";
            next.purchaseUnit = row.purchaseUnit || "";
            next.primaryUnit = row.primaryUnit || "";
            next.acceptedQty = row.acceptedQty || "";
            next.inspection = row.inspection || "";
            next.toatlReceivedQty = row.toatlReceivedQty || "";
          }
        }

        const qtyKeys = [
          "acceptedQty",
          "qtyAcceptedOnDeviation",
          "acceptedAfterSegregation",
          "reworkQty",
        ];
        if (qtyKeys.includes(key)) {
          const accepted = parseFloat(next.acceptedQty) || 0;
          const deviation = parseFloat(next.qtyAcceptedOnDeviation) || 0;
          const segregation = parseFloat(next.acceptedAfterSegregation) || 0;
          const rework = parseFloat(next.reworkQty) || 0;
          const total = accepted + deviation + segregation + rework;
          next.totalAcceptedQty = total ? total.toFixed(2) : "";
        }

        if (key === "rate" || key === "totalAcceptedQty") {
          const total = parseFloat(next.totalAcceptedQty) || 0;
          const rate = parseFloat(next.rate) || 0;
          const amount = total * rate;
          next.amount = amount ? amount.toFixed(2) : "";
        }

        return next;
      }),
    );
  };

  const handleAddInspectionRow = () =>
    setInspectionRows((prev) => [...prev, emptyInspectionRow()]);
  const handleRemoveInspectionRow = (idx) =>
    setInspectionRows((prev) => prev.filter((_, i) => i !== idx));

  const handleMeasurementCellChange = (idx, key, value) => {
    setMeasurementRows((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddMeasurementRow = () =>
    setMeasurementRows((prev) => [...prev, emptyMeasurementRow()]);
  const handleRemoveMeasurementRow = (idx) =>
    setMeasurementRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportCellChange = (idx, key, value) => {
    setReportRows((prev) =>
      prev.map((row, i) => (i !== idx ? row : { ...row, [key]: value })),
    );
  };

  const handleAddReportRow = () =>
    setReportRows((prev) => [...prev, emptyReportRow()]);
  const handleRemoveReportRow = (idx) =>
    setReportRows((prev) => prev.filter((_, i) => i !== idx));

  const handleViewMeasurements = () => {
    setShowMeasurementsPopup(true);
  };

  const handleViewFile = (file) => {
    if (file?.filePath) {
      window.open(file.filePath, '_blank');
    } else {
      addToast("File path not available", "warning");
    }
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.inwardType) errors.inwardType = "Inward Type is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.supplierCode) errors.supplierCode = "Supplier Code is required";
    if (!header.mrnNo) errors.mrnNo = "MRN/SC GRN No is required";
    if (!header.approved) errors.approved = "Approved is required";

    const validInspection = inspectionRows.filter((r) => r.itemCode?.trim());
    if (!validInspection.length)
      errors.inspectionDetails =
        "Add at least one item with Item Code in Inspection Details";
    validInspection.forEach((r, i) => {
      if (!r.itemCode)
        errors[`inspection.${i}.itemCode`] = "Item Code is required";
      if (!r.acceptedQty && Number(r.acceptedQty) !== 0)
        errors[`inspection.${i}.acceptedQty`] = "Accepted Qty is required";
      if (!r.acceptedUnit) errors[`inspection.${i}.acceptedUnit`] = "Accepted Unit is required";
    });

    const validMeasurements = measurementRows.filter(
      (r) => r.parameter?.trim(),
    );
    if (!validMeasurements.length)
      errors.measurements =
        "Add at least one measurement row with a Parameter";
    validMeasurements.forEach((r, i) => {
      if (!r.parameter?.trim()) errors[`measurement.${i}.parameter`] = "Parameter is required";
      if (!r.status) errors[`measurement.${i}.status`] = "Status is required";
    });

    if (!summary.checkedBy) errors.checkedBy = "Checked By is required";
    if (!summary.approvedBy) errors.approvedBy = "Approved By is required";
    if (!summary.result) errors.result = "Result is required";

    // ---- FIX: Check for valid reports (File objects or strings) ----
    const validReports = reportRows.filter((r) => {
      if (!r.fileName) return false;
      // Check if it's a File object, a string, or an object with filePath
      if (r.fileName instanceof File) return true;
      if (typeof r.fileName === 'string' && r.fileName.trim()) return true;
      if (typeof r.fileName === 'object' && r.fileName.filePath) return true;
      return false;
    });

    if (!validReports.length)
      errors.supplierReports = "Attach at least one Supplier Report";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Save with File Upload ---------------- */
  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const isUpdate = Boolean(data?.id);

      // Build the payload
      const payload = {
        ...(isUpdate ? { id: data.id } : {}),
        active: true,
        branch: branch,
        docId: header.docNo,
        docDate: header.docDate,
        inwardType: header.inwardType,
        supplierCode: Number(header.supplierCode),
        mrinGrnNo: header.mrnNo,
        approved: header.approved === "Yes" ? true : false,
        mrinGrnDate: header.mrnDate || "",
        timeOfInspection: header.timeOfInspection || dayjs().format("HH:mm:ss"),
        mrnGrnTime: header.mrnGrnTime || "",
        isoExpiaryDate: header.isoExpiryDate || "",
        poPcJoNo: header.poPcJoNo || "",
        ppapSample: header.ppapSample || "",
        scheduleNo: header.scheduleNo || "",
        supInvNo: header.supplierInvoiceNo || "",
        supInvDt: header.supplierInvoiceDate || "",
        orgId: orgId,
        createdBy: usersId,
        financialYear: dayjs().year().toString(),
        considerations: summary.considerations || "",
        disposalAction: summary.disposalAction || "",
        checkedBy: summary.checkedBy ? Number(summary.checkedBy) : 0,
        approvedBy: summary.approvedBy ? Number(summary.approvedBy) : 0,
        result: summary.result || "",
        notes: summary.notes || "",
        inwardInspectionDetailsDTO: inspectionRows
          .filter((r) => r.itemCode && String(r.itemCode).trim())
          .map((r) => {
            const itemId = Number(r.itemCode); // This should be the numeric ID
            console.log("Saving item ID:", itemId, "from itemCode:", r.itemCode);

            return {
              item: itemId || 0, // Use the numeric ID
              itemDescription: r.itemDescription || "",
              drawingNo: r.drawingNo || "",
              orderQty: Number(r.orderQty) || 0,
              purchaseUnit: Number(r.purchaseUnit) || 0,
              primaryUnit: Number(r.primaryUnit) || 0,
              receivedQty: Number(r.receivedQty) || 0,
              receivedUnit: Number(r.receivedUnit) || 0,
              acceptQty: Number(r.acceptedQty) || 0,
              acceptUnit: Number(r.acceptedUnit) || 0,
              receivedLocation: Number(r.receivedLocation) || 0,
              batchNo: r.batchNo || "",
              qtyAccOnDevtn: Number(r.qtyAcceptedOnDeviation) || 0,
              accQtyAfterSegn: Number(r.acceptedAfterSegregation) || 0,
              reworkQty: Number(r.reworkQty) || 0,
              reworkLocation: Number(r.reworkLocation) || 0,
              totAccQty: Number(r.totalAcceptedQty) || 0,
              conversionFactor: Number(r.conversionFactor) || 0,
              totalAccQtyInPrimaryUnit: Number(r.toatlAccQty) || 0,
              reworkUnit: Number(r.reworkUnit) || 0,
              rejectQty: Number(r.rejectedQty) || 0,
              rejectedLocation: Number(r.rejectedLocation) || 0,
              reason: r.reasonForRejection || "",
              rejectUnit: Number(r.rejectUnit) || 0,
              rate: Number(r.rate) || 0,
              amount: Number(r.amount) || 0,
              totalReceivedQty: Number(r.toatlReceivedQty) || 0,
              stk: r.stk || "",
              inspection: r.inspection || "",
              sampleSize: 0,
              tcReceived: "Yes",
              inspectionReportReceived: "Yes",
              inwardInspectionMeasurementsDTO: measurementRows
                .filter((m) => m.parameter?.trim())
                .map((m) => ({
                  parameters: m.parameter || "",
                  type: m.type || "",
                  spec: m.specification || "",
                  accCriteria: m.acceptanceCriteria || "",
                  uom: m.uom || "",
                  test1: m.mv1 || "",
                  test2: m.mv2 || "",
                  test3: m.mv3 || "",
                  test4: m.mv4 || "",
                  test5: m.mv5 || "",
                  test6: m.mv6 || "",
                  status: m.status || "",
                  remarks: m.remarks || "",
                })),
            };
          }),
      };

      console.log("Saving Payload:", payload);

      // Create FormData for file upload
      const formData = new FormData();

      // Add payload as JSON
      const payloadBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formData.append("inwardInspection", payloadBlob, "inwardInspection.json");

      // Add report files (only new files, not existing ones)
      const validReports = reportRows.filter((r) => {
        if (!r.fileName) return false;
        return r.fileName instanceof File;
      });

      if (validReports.length > 0) {
        validReports.forEach((report) => {
          formData.append("files", report.fileName);
        });
      }

      const response = await inwardInspectionAPI.createUpdateInwardInspection(formData);

      console.log("Response:", response);

      const isSuccess = response?.status === true || response?.statusFlag === "Ok";

      if (isSuccess) {
        addToast(
          isUpdate
            ? "Inward Inspection updated successfully!"
            : "Inward Inspection created successfully!",
          "success"
        );
        onBack();
      } else {
        const errorMessage = response?.paramObjectsMap?.message || response?.message || "Failed to save";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading inspection data...</div>
      </div>
    );
  }

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  const canAddRow =
    activeTabMeta.kind === "table" &&
    ["inspectionDetails", "supplierReport"].includes(activeChildTab);

  const handleAddRow = () => {
    if (activeChildTab === "inspectionDetails") handleAddInspectionRow();
    else if (activeChildTab === "supplierReport") handleAddReportRow();
  };

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Inward Inspection" : "Add Inward Inspection"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Inward Inspection</SectionHeader>
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
              label="Doc No"
              name="docNo"
              value={header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
              required
              disabled={true}
            />
            <Field
              type="select"
              label="Inward Type"
              name="inwardType"
              value={header.inwardType}
              onChange={handleHeaderChange}
              error={fieldErrors.inwardType}
              options={INWARD_TYPES}
              required
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              required
            />
            <Field
              type="select"
              label="Supplier Code"
              name="supplierCode"
              value={header.supplierCode}
              onChange={handleHeaderChange}
              error={fieldErrors.supplierCode}
              options={supplierOptions}
              required
            />
            <Field
              label="Supplier Name"
              name="supplierName"
              value={header.supplierName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="MRN/SC GRN No"
              name="mrnNo"
              value={header.mrnNo}
              onChange={handleHeaderChange}
              error={fieldErrors.mrnNo}
              options={grnOptions}
              required
              disabled={!header.supplierCode || loadingGrn}
            />
            <ApprovedSelectField
              label="Approved"
              name="approved"
              value={header.approved}
              onChange={handleHeaderChange}
              error={fieldErrors.approved}
              required
            />
            <Field
              type="date"
              label="MRN Date"
              name="mrnDate"
              value={header.mrnDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="Time of Inspection"
              name="timeOfInspection"
              value={header.timeOfInspection}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="MRN/GRN Time"
              name="mrnGrnTime"
              value={header.mrnGrnTime}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="ISO Expiry Date"
              name="isoExpiryDate"
              value={header.isoExpiryDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="PO No / PC No / JO No"
              name="poPcJoNo"
              value={header.poPcJoNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="PPAP Sample"
              name="ppapSample"
              value={header.ppapSample}
              onChange={handleHeaderChange}
              options={PPAP_SAMPLE}
            />
            <Field
              label="Schedule No"
              name="scheduleNo"
              value={header.scheduleNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="Supplier Invoice No"
              name="supplierInvoiceNo"
              value={header.supplierInvoiceNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="date"
              label="Supplier Invoice Date"
              name="supplierInvoiceDate"
              value={header.supplierInvoiceDate}
              onChange={handleHeaderChange}
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {canAddRow && (
              <button
                type="button"
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Inspection Details */}
          {activeChildTab === "inspectionDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "itemCode",
                    label: "Item Code",
                    type: "select",
                    options: grnItemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  {
                    key: "inspection",
                    label: "Inspection"
                  },
                  { key: "stk", label: "STK" },
                  { key: "drawingNo", label: "Drawing No" },
                  { key: "orderQty", label: "Order Qty", type: "number" },
                  {
                    key: "purchaseUnit",
                    label: "Purchase Unit",
                  },
                  {
                    key: "primaryUnit",
                    label: "Primary Unit",
                  },
                  { key: "receivedQty", label: "Received Qty", type: "number" },
                  {
                    key: "receivedUnit",
                    label: "Received Unit",
                  },
                  { key: "acceptedQty", label: "Accepted Qty", type: "number" },
                  {
                    key: "acceptedUnit",
                    label: "Accepted Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  {
                    key: "receivedLocation",
                    label: "Received Location",
                    type: "select",
                    options: locationOptions,
                  },
                  { key: "batchNo", label: "Batch No" },
                  {
                    key: "qtyAcceptedOnDeviation",
                    label: "Qty Accepted on Deviation",
                    type: "number",
                  },
                  {
                    key: "acceptedAfterSegregation",
                    label: "Accepted After Segregation",
                    type: "number",
                  },
                  { key: "reworkQty", label: "Rework Qty", type: "number" },
                  {
                    key: "reworkLocation",
                    label: "Rework Location",
                    type: "select",
                    options: locationOptions,
                  },
                  {
                    key: "totalAcceptedQty",
                    label: "Total Accepted Qty",
                    type: "number",
                    readOnly: true,
                  },
                  {
                    key: "conversionFactor",
                    label: "Conversion Factor",
                    type: "number",
                  },
                  {
                    key: "toatlAccQty",
                    label: "Total Acc Qty (Primary Unit)",
                    type: "number",
                  },
                  {
                    key: "reworkUnit",
                    label: "Rework Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  {
                    key: "rejectedQty",
                    label: "Rejected Qty",
                    type: "number",
                  },
                  {
                    key: "rejectedLocation",
                    label: "Rejected Location",
                    type: "select",
                    options: locationOptions,
                  },
                  {
                    key: "reasonForRejection",
                    label: "Reason for Rejection",
                    type: "textarea",
                  },
                  {
                    key: "rejectUnit",
                    label: "Reject Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "rate", label: "Rate", type: "number" },
                  {
                    key: "amount",
                    label: "Amount",
                    type: "number",
                    readOnly: true,
                  },
                  {
                    key: "toatlReceivedQty",
                    label: "Total Received Qty",
                    type: "number",
                    readOnly: true,
                  },
                  {
                    key: "measurementsView",
                    label: "",
                    type: "measurementsView",
                  },
                ]}
                rows={inspectionRows}
                onCellChange={handleInspectionCellChange}
                onRemoveRow={handleRemoveInspectionRow}
                onViewMeasurements={handleViewMeasurements}
              />
              {fieldErrors.inspectionDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.inspectionDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className="space-y-2">
                <div>
                  <SectionHeader>Considerations</SectionHeader>
                  <Field
                    type="textarea"
                    label="Considerations"
                    name="considerations"
                    value={summary.considerations}
                    onChange={handleSummaryChange}
                  />
                  <Field
                    type="textarea"
                    label="Disposal Action"
                    name="disposalAction"
                    value={summary.disposalAction}
                    onChange={handleSummaryChange}
                  />
                </div>

                <div>
                  <SectionHeader>Disposal Action</SectionHeader>
                  <div className={subTabFieldGrid}>
                    <Field
                      type="select"
                      label="Checked By"
                      name="checkedBy"
                      value={summary.checkedBy}
                      onChange={handleSummaryChange}
                      error={fieldErrors.checkedBy}
                      options={employeeOptions}
                      required
                    />
                    <Field
                      type="select"
                      label="Approved By"
                      name="approvedBy"
                      value={summary.approvedBy}
                      onChange={handleSummaryChange}
                      error={fieldErrors.approvedBy}
                      options={employeeOptions}
                      required
                    />
                    <Field
                      type="select"
                      label="Result"
                      name="result"
                      value={summary.result}
                      onChange={handleSummaryChange}
                      error={fieldErrors.result}
                      options={RESULT_OPTIONS}
                      required
                    />
                    <Field
                      type="textarea"
                      label="Notes"
                      name="notes"
                      value={summary.notes}
                      onChange={handleSummaryChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Attached Supplier Report */}
          {activeChildTab === "supplierReport" && (
            <div className="pt-3">
              <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-max text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 w-8 text-center dark:text-white">#</th>
                      <th className="p-2 text-left dark:text-white">
                        Supplier Report
                      </th>
                      <th className="p-2 w-20 text-left dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-2 text-center font-medium dark:text-white">
                          {idx + 1}
                        </td>
                        <td className="p-2 align-top">
                          <FileField
                            label=""
                            name="fileName"
                            value={row.fileName}
                            onChange={(e) =>
                              handleReportCellChange(
                                idx,
                                "fileName",
                                e.target.value,
                              )
                            }
                            required
                            error={
                              fieldErrors[`report.${idx}.fileName`]
                                ? "Required"
                                : ""
                            }
                            onViewFile={handleViewFile}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveReportRow(idx)}
                            disabled={reportRows.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center ${reportRows.length <= 1
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
                </table>
              </div>
              {fieldErrors.supplierReports && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.supplierReports}
                </p>
              )}
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

      {/* Measurements Popup */}
      <MeasurementsPopup
        isOpen={showMeasurementsPopup}
        onClose={() => setShowMeasurementsPopup(false)}
        measurementRows={measurementRows}
        onMeasurementCellChange={handleMeasurementCellChange}
        onAddMeasurementRow={handleAddMeasurementRow}
        onRemoveMeasurementRow={handleRemoveMeasurementRow}
        unitOptions={unitOptions}
      />
    </div>
  );
};

export default InwardInspectionForm;