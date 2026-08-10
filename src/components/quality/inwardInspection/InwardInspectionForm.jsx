import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import inwardInspectionAPI from "../../../api/quality/inwardInspectionAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import itemAPI from "../../../api/itemAPI";
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

// Yes / No toggle for the Approved header field.
const ToggleField = ({ label, name, value, onChange, required, disabled }) => (
  <div className="w-full">
    <label className={labelClasses}>
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>

    <div className="flex h-[30px] items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange({ target: { name, value: !value } })}
        className={`relative inline-flex h-[22px] w-[40px] items-center rounded-full transition-colors ${
          value ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>

      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
        {value ? "Yes" : "No"}
      </span>
    </div>
  </div>
);

// File upload with drag-and-drop or click-to-upload.
const FileField = ({
  label,
  name,
  value,
  onChange,
  required,
  error,
  className = "",
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    onChange({ target: { name, value: file ? file.name : "" } });
  };

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

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
          {value || "Click or drop supplier report..."}
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

/* Generic dynamic table. Supports text / number / date / select / textarea /
   readonly columns. Options may be plain strings or { value, label } objects. */
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
/* Options                                                                      */

const INWARD_TYPES = ["MRN", "SC GRN", "IMPORT GRN", "SUB-CONTRACT GRN", "OTHER"];
const PPAP_SAMPLE = ["Regular", "Non-Regular"];
const MEASUREMENT_STATUS = ["Pass", "Fail", "N/A"];
const RESULT_OPTIONS = ["Accepted", "Rejected", "Rework", "Pending"];

const CHILD_TABS = [
  { key: "inspectionDetails", label: "Inspection Details", kind: "table" },
  { key: "measurements", label: "Measurements", kind: "table" },
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
  rejectedQty: "",
  rejectedLocation: "",
  reasonForRejection: "",
  rejectUnit: "",
  rate: "",
  amount: "",
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
  fileName: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const generateDocNo = () =>
  `IN-${dayjs().format("YYYYMMDD")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const InwardInspectionForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");

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

  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [mrnOptions, setMrnOptions] = useState([]);

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      docNo: data?.docNo || (data ? "" : generateDocNo()),
      inwardType: data?.inwardType || "",
      docDate: data?.docDate || dayjs().format("YYYY-MM-DD"),
      supplierCode: data?.supplierCode?.id ?? data?.supplierCode ?? "",
      supplierName: data?.supplierName || "",
      mrnNo: data?.mrnNo || "",
      approved: data?.approved !== false,
      mrnDate: data?.mrnDate || "",
      timeOfInspection: data?.timeOfInspection || dayjs().format("HH:mm:ss"),
      mrnGrnTime: data?.mrnGrnTime || "",
      isoExpiryDate: data?.isoExpiryDate || "",
      poPcJoNo: data?.poPcJoNo || "",
      ppapSample: data?.ppapSample || "",
      scheduleNo: data?.scheduleNo || "",
      supplierInvoiceNo: data?.supplierInvoiceNo || "",
      supplierInvoiceDate: data?.supplierInvoiceDate || "",
      active: data?.active !== false,
    };
    base.docDate = fmtDate(base.docDate);
    base.mrnDate = fmtDate(base.mrnDate);
    base.isoExpiryDate = fmtDate(base.isoExpiryDate);
    base.supplierInvoiceDate = fmtDate(base.supplierInvoiceDate);
    return base;
  });

  const [inspectionRows, setInspectionRows] = useState(
    data?.inspectionDetails?.length
      ? data.inspectionDetails
      : [emptyInspectionRow()],
  );

  const [measurementRows, setMeasurementRows] = useState(
    data?.measurements?.length ? data.measurements : [emptyMeasurementRow()],
  );

  const [summary, setSummary] = useState({
    considerations:
      data?.summary?.considerations || data?.inwardSummary?.considerations || "",
    checkedBy:
      data?.summary?.checkedBy?.id ??
      data?.summary?.checkedBy ??
      data?.inwardSummary?.checkedBy?.id ??
      data?.inwardSummary?.checkedBy ??
      "",
    approvedBy:
      data?.summary?.approvedBy?.id ??
      data?.summary?.approvedBy ??
      data?.inwardSummary?.approvedBy?.id ??
      data?.inwardSummary?.approvedBy ??
      "",
    result:
      data?.summary?.result ??
      data?.inwardSummary?.result ??
      "",
    notes:
      data?.summary?.notes ??
      data?.inwardSummary?.notes ??
      "",
  });

  const [reportRows, setReportRows] = useState(
    data?.supplierReports?.length ? data.supplierReports : [emptyReportRow()],
  );

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

  // Received / Rework / Rejected Location reuse the same plant/branch list.
  useEffect(() => {
    setLocationOptions(plantOptions);
  }, [plantOptions]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode };
      });
      setItemOptions(options);
      setItemMasterMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [orgId, branch]);

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

  const loadSuppliers = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setSupplierOptions(
        (res || []).map((c) => ({
          value: c.id,
          label: c.customerCode || c.docId || c.id,
          customerName: c.customerName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load supplier options:", error);
      setSupplierOptions([]);
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

  // MRN / SC GRN numbers loaded from the saved GRN records.
  const loadMrnOptions = useCallback(async () => {
    try {
      const res = await inwardInspectionAPI.getInwardInspectionByOrgId(
        orgId,
        branch,
      );
      const options = (res || [])
        .map((r) => r.mrnNo || r.mrnScGrnNo || "")
        .filter(Boolean);
      setMrnOptions([...new Set(options)]);
    } catch (error) {
      console.error("Failed to load MRN options:", error);
      setMrnOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadItems();
      loadUnits();
      loadSuppliers();
      loadEmployees();
      loadMrnOptions();
    }
  }, [
    orgId,
    branch,
    loadItems,
    loadUnits,
    loadSuppliers,
    loadEmployees,
    loadMrnOptions,
  ]);

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
        next.supplierName = supplier?.customerName || "";
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
          const item = itemMasterMap[value];
          next.itemDescription = item?.itemDescription || "";
          next.drawingNo = item?.drawingNo || item?.itemDrawingNo || "";
          next.purchaseUnit = item?.purchaseUnits?.id || "";
          next.primaryUnit = item?.primaryUnits?.id || "";
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

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.inwardType) errors.inwardType = "Inward Type is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.supplierCode) errors.supplierCode = "Supplier Code is required";
    if (!header.mrnNo) errors.mrnNo = "MRN/SC GRN No is required";

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

    const validReports = reportRows.filter((r) => r.fileName?.trim());
    if (!validReports.length)
      errors.supplierReports = "Attach at least one Supplier Report";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + inspection details + measurements
    // + summary + attached supplier reports. The backend maintains the complete
    // inspection history with approval tracking (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      inspectionDetails: inspectionRows.filter((r) => r.itemCode?.trim()),
      measurements: measurementRows.filter((r) => r.parameter?.trim()),
      summary,
      supplierReports: reportRows.filter((r) => r.fileName?.trim()),
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response =
        await inwardInspectionAPI.createUpdateInwardInspection(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Inward Inspection updated successfully!"
              : "Inward Inspection created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Inward Inspection.",
        );
      }
    } catch (err) {
      console.error("Save Inward Inspection Error:", err);
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

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  const canAddRow =
    activeTabMeta.kind === "table" &&
    ["inspectionDetails", "measurements", "supplierReport"].includes(
      activeChildTab,
    );

  const handleAddRow = () => {
    if (activeChildTab === "inspectionDetails") handleAddInspectionRow();
    else if (activeChildTab === "measurements") handleAddMeasurementRow();
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
              disabled={!data}
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
              options={mrnOptions}
              required
            />
            <ToggleField
              label="Approved"
              name="approved"
              value={header.approved}
              onChange={handleHeaderChange}
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
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  { key: "drawingNo", label: "Drawing No" },
                  { key: "orderQty", label: "Order Qty", type: "number" },
                  {
                    key: "purchaseUnit",
                    label: "Purchase Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  {
                    key: "primaryUnit",
                    label: "Primary Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "receivedQty", label: "Received Qty", type: "number" },
                  {
                    key: "receivedUnit",
                    label: "Received Unit",
                    type: "select",
                    options: unitOptions,
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
                ]}
                rows={inspectionRows}
                onCellChange={handleInspectionCellChange}
                onRemoveRow={handleRemoveInspectionRow}
              />
              {fieldErrors.inspectionDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.inspectionDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Measurements */}
          {activeChildTab === "measurements" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
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
                    type: "select",
                    options: unitOptions,
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
                    options: MEASUREMENT_STATUS,
                  },
                  { key: "remarks", label: "Remarks", type: "textarea" },
                ]}
                rows={measurementRows}
                onCellChange={handleMeasurementCellChange}
                onRemoveRow={handleRemoveMeasurementRow}
              />
              {fieldErrors.measurements && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.measurements}
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Summary */}
          {activeChildTab === "summary" && (
            <div className="pt-3">
              <div className="space-y-4">
                <div>
                  <SectionHeader>Considerations</SectionHeader>
                  <Field
                    type="textarea"
                    label="Considerations"
                    name="considerations"
                    value={summary.considerations}
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

          {/* Tab 4: Attached Supplier Report */}
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
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveReportRow(idx)}
                            disabled={reportRows.length <= 1}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                              reportRows.length <= 1
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
    </div>
  );
};

export default InwardInspectionForm;
