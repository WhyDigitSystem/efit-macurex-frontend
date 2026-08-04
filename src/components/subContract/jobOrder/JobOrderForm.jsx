import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import jobOrderAPI from "../../../api/jobOrderAPI";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
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
            "w-full h-[30px] px-2 py-[9px] rounded border text-xs leading-none transition-colors overflow-y-auto resize-none " +
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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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

/* Generic dynamic table. Supports text / select / readonly columns.
   Options may be plain strings or { value, label } objects. */
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
            ) : (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "date" ? "date" : "text"}
                  value={row[col.key]}
                  readOnly={col.readOnly}
                  onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                  className={
                    col.readOnly ? cellReadOnlyClasses : cellInputClasses
                  }
                />
              </td>
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Quotation Attachment tab: dropzone + file table                              */

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"];

const ACCEPTED_FORMATS_LABEL = "PDF, DOCX, XLSX, PNG, JPG";

const AttachmentTable = ({ rows, onCellChange, onRemoveRow, onAddRow }) => {
  const fileInputRefs = useRef({});
  const [fileErrors, setFileErrors] = useState({});

  const validateFile = (file) => {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    return ACCEPTED_EXTENSIONS.includes(ext);
  };

  const handleFileSelect = (idx, file) => {
    if (!validateFile(file)) {
      setFileErrors((prev) => ({
        ...prev,
        [idx]: `Unsupported file type. Allowed formats: ${ACCEPTED_FORMATS_LABEL}`,
      }));
      return;
    }
    setFileErrors((prev) => ({ ...prev, [idx]: "" }));
    onCellChange(idx, "attachment", file);
    onCellChange(idx, "fileName", file.name);
  };

  const handleInputChange = (idx, e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(idx, file);
    e.target.value = "";
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          Supported formats: {ACCEPTED_FORMATS_LABEL}
        </span>
        <button
          type="button"
          onClick={onAddRow}
          className="flex items-center gap-1 px-3 h-8 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
        >
          <Plus size={12} />
          Add Attachment
        </button>
      </div>

      <TableWrapper>
        <TableHead headers={["#", "Attachment", "Action"]} />
        <tbody>
          {rows.map((row, idx) => (
            <TableRow
              key={idx}
              index={idx}
              onRemove={() => onRemoveRow(idx)}
              disabled={rows.length <= 1}
            >
              <td className="p-2 align-middle">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[idx] = el;
                    }}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    className="hidden"
                    onChange={(e) => handleInputChange(idx, e)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="flex items-center gap-1.5 px-3 h-8 rounded text-xs font-medium whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Choose File
                  </button>
                  <span
                    className={`flex-1 min-w-0 text-xs truncate ${
                      row.attachment
                        ? "text-gray-700 dark:text-gray-200"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {row.attachment?.name || "No file chosen"}
                  </span>
                </div>
                {fileErrors[idx] && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                    {fileErrors[idx]}
                  </p>
                )}
              </td>
            </TableRow>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const DEPARTMENTS = ["Purchase", "Stores", "Quality", "Production", "Finance"];
const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const JOB_ORDER_FOR = ["Sub Contract", "Job Work", "Rate Contract", "Repair"];
const YES_NO = ["YES", "NO"];
const GST_STATUS = ["Registered", "Unregistered", "Composition", "SEZ"];
const SERVICE_NAMES = ["Amortization", "Machining", "Plating", "Assembly"];
const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const TAX_TYPES = ["SGST", "CGST", "IGST", "GST", "Exempt", "Nil Rated"];
const BOM_IDS = ["BOM-001", "BOM-002", "BOM-003"];
const INCOMING_TYPES = ["Raw Material", "Semi-Finished", "Component", "Service"];
const PAYMENT_TERMS = [
  "Immediate",
  "15 Days",
  "30 Days",
  "45 Days",
  "60 Days",
  "Advance",
];
const PARTICULARS = ["Basic", "Freight", "Packing", "Insurance", "Discount"];

const CHILD_TABS = [
  { key: "orderDetails", label: "Order Details", kind: "table" },
  { key: "terms", label: "Terms and Conditions", kind: "fields" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "quotationAttachment", label: "Quotation Attachment", kind: "attachment" },
];

const emptyOrderDetailRow = () => ({
  incomingItem: "",
  itemDescription: "",
  bomId: "",
  unit: "",
  incomingType: "",
  orderQty: "",
  rate: "",
  amount: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
});

const emptyTerms = () => ({
  paymentTerms: "",
  deliveryDate: "",
  narration: "",
  notes: "",
});

const emptyTaxDetailRow = () => ({
  particular: "",
  amount: "",
});

const emptyAttachmentRow = () => ({
  fileName: "",
  attachment: null,
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const nowTimeStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const autoJobOrderNo = () =>
  `JO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;

/* ---------------------------------------------------------------------------- */

const JobOrderForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("orderDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    jobOrderNo: data?.jobOrderNo || (data ? "" : autoJobOrderNo()),
    date: data?.date || todayStr(),
    department: data?.department || "",
    belongsTo: data?.belongsTo || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    jobOrderFor: data?.jobOrderFor || "",
    gstState: data?.gstState || "",
    gstStatus: data?.gstStatus || "",
    contractNo: data?.contractNo || "",
    serviceName: data?.serviceName || "",
    isIgstApplicable: data?.isIgstApplicable || "",
    gstinNo: data?.gstinNo || "",
    indentTime: data?.indentTime || nowTimeStr(),
    hsnSacCode: data?.hsnSacCode || "",
    taxCode: data?.taxCode || "",
    taxType: data?.taxType || "SGST",
    taxPct: data?.taxPct ?? "",
    active: data?.active !== false,
  }));

  const [orderDetailRows, setOrderDetailRows] = useState(
    data?.orderDetails?.length ? data.orderDetails : [emptyOrderDetailRow()],
  );
  const [terms, setTerms] = useState({
    ...emptyTerms(),
    ...data?.terms,
  });
  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );
  const [attachmentRows, setAttachmentRows] = useState(
    data?.attachments?.length ? data.attachments : [emptyAttachmentRow()],
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
            label: b.branchName || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadVendors = useCallback(async () => {
    try {
      const res = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      setVendorOptions(
        (res || []).map((v) => ({
          value: v.id,
          label: v.customerName || v.docId || v.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
    }
  }, [orgId, branch]);

  const loadContracts = useCallback(async () => {
    try {
      const res = await supplierRateContractAPI.getSupplierRateContractByOrgId(
        orgId,
        branch,
      );
      setContractOptions(
        (res || []).map((c) => ({
          value: c.contractNo,
          label: c.contractNo,
        })),
      );
    } catch (error) {
      console.error("Failed to load contract options:", error);
      setContractOptions([]);
    }
  }, [orgId, branch]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.itemCode] = it;
        return { value: it.itemCode, label: it.itemCode };
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

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadVendors();
      loadContracts();
      loadItems();
      loadUnits();
    }
  }, [orgId, branch, loadVendors, loadContracts, loadItems, loadUnits]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "vendorId") {
        const vendor = vendorOptions.find((v) => v.value === value);
        next.vendorName = vendor?.label || "";
      }
      return next;
    });
  };

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setTerms((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderCellChange = (idx, key, value) => {
    setOrderDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "incomingItem") {
          const item = itemMasterMap[value];
          next = {
            ...next,
            itemDescription: item?.itemDescription || "",
            unit: item?.primaryUnits?.id || "",
          };
        }

        if (["orderQty", "rate", "sgstRate", "cgstRate", "igstRate"].includes(key)) {
          const qty = parseFloat(next.orderQty) || 0;
          const rate = parseFloat(next.rate) || 0;
          const amount = qty * rate;
          next.amount = amount ? amount.toFixed(2) : "";
          const base = amount || 0;
          next.sgstAmount =
            (parseFloat(next.sgstRate) || 0) && base
              ? (base * (parseFloat(next.sgstRate) || 0) / 100).toFixed(2)
              : "";
          next.cgstAmount =
            (parseFloat(next.cgstRate) || 0) && base
              ? (base * (parseFloat(next.cgstRate) || 0) / 100).toFixed(2)
              : "";
          next.igstAmount =
            (parseFloat(next.igstRate) || 0) && base
              ? (base * (parseFloat(next.igstRate) || 0) / 100).toFixed(2)
              : "";
        }

        return next;
      }),
    );
  };

  const handleTaxCellChange = (idx, key, value) => {
    setTaxDetailRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAttachmentCellChange = (idx, key, value) => {
    setAttachmentRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddOrderRow = () =>
    setOrderDetailRows((prev) => [...prev, emptyOrderDetailRow()]);
  const handleRemoveOrderRow = (idx) =>
    setOrderDetailRows((prev) => prev.filter((_, i) => i !== idx));
  const handleAddTaxRow = () =>
    setTaxDetailRows((prev) => [...prev, emptyTaxDetailRow()]);
  const handleRemoveTaxRow = (idx) =>
    setTaxDetailRows((prev) => prev.filter((_, i) => i !== idx));

  const handleAddAttachmentRow = () =>
    setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);
  const handleRemoveAttachmentRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.jobOrderNo?.trim())
      errors.jobOrderNo = "Job Order No is required";
    if (!header.date) errors.date = "Date is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.vendorName?.trim())
      errors.vendorName = "Vendor Name is required";
    if (!header.jobOrderFor) errors.jobOrderFor = "Job Order For is required";
    if (!header.gstState?.trim()) errors.gstState = "GST State is required";
    if (!header.gstStatus) errors.gstStatus = "GST Status is required";
    if (!header.contractNo) errors.contractNo = "Contract No is required";
    if (!header.taxCode) errors.taxCode = "Tax Code is required";
    if (!header.taxType) errors.taxType = "Tax Type is required";

    const hasValidOrderRow = orderDetailRows.some(
      (r) =>
        r.incomingItem &&
        r.unit &&
        Number(r.orderQty) > 0 &&
        Number(r.rate) > 0,
    );
    if (!hasValidOrderRow)
      errors.orderDetails =
        "Add at least one item with Incoming Item, Unit, Order Qty and Rate";

    if (!terms.paymentTerms) errors.paymentTerms = "Payment Terms is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      ...header,
      orderDetails: orderDetailRows.filter((r) => r.incomingItem?.trim()),
      terms,
      taxDetails: taxDetailRows.filter((r) => r.particular?.trim()),
      // NOTE: attachment files need multipart/FormData handling on the API
      // layer once the upload endpoint is confirmed — sending file names only.
      attachments: attachmentRows
        .filter((r) => r.fileName?.trim())
        .map((r) => ({ fileName: r.fileName })),
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId")
        : localStorage.getItem("usersId"),
      ...(isUpdate ? { updatedBy: localStorage.getItem("usersId") } : {}),
    };

    try {
      const response = await jobOrderAPI.createUpdateJobOrder(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Job Order updated successfully!"
              : "Job Order created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            "Failed to save Job Order.",
        );
      }
    } catch (err) {
      console.error("Save Job Order Error:", err);
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
          {data ? "Edit Job Order" : "Add Job Order"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Job Order</SectionHeader>
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
              label="Job Order No"
              name="jobOrderNo"
              value={header.jobOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
              onChange={handleHeaderChange}
              error={fieldErrors.date}
              required
              disabled
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={DEPARTMENTS}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={BELONGS_TO}
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
              error={fieldErrors.vendorName}
              required
              disabled
            />
            <Field
              type="select"
              label="Job Order For"
              name="jobOrderFor"
              value={header.jobOrderFor}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderFor}
              options={JOB_ORDER_FOR}
              required
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
              error={fieldErrors.gstState}
              required
            />
            <Field
              type="select"
              label="GST Status"
              name="gstStatus"
              value={header.gstStatus}
              onChange={handleHeaderChange}
              error={fieldErrors.gstStatus}
              options={GST_STATUS}
              required
            />
            <Field
              type="select"
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              error={fieldErrors.contractNo}
              options={contractOptions}
              required
            />
            <Field
              type="select"
              label="Service Name"
              name="serviceName"
              value={header.serviceName}
              onChange={handleHeaderChange}
              options={SERVICE_NAMES}
            />
            <Field
              type="select"
              label="Is IGST Applicable"
              name="isIgstApplicable"
              value={header.isIgstApplicable}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              label="GSTIN No"
              name="gstinNo"
              value={header.gstinNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="text"
              label="Indent Time"
              name="indentTime"
              value={header.indentTime}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="HSN/SAC Code"
              name="hsnSacCode"
              value={header.hsnSacCode}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Tax Code"
              name="taxCode"
              value={header.taxCode}
              onChange={handleHeaderChange}
              error={fieldErrors.taxCode}
              options={TAX_CODES}
              required
            />
            <Field
              type="select"
              label="Tax Type"
              name="taxType"
              value={header.taxType}
              onChange={handleHeaderChange}
              error={fieldErrors.taxType}
              options={TAX_TYPES}
              required
            />
            <Field
              type="number"
              label="Tax %"
              name="taxPct"
              value={header.taxPct}
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

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={() =>
                  activeChildTab === "orderDetails"
                    ? handleAddOrderRow()
                    : handleAddTaxRow()
                }
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Order Details tab */}
          {activeChildTab === "orderDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "incomingItem",
                    label: "Incoming Item",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  {
                    key: "bomId",
                    label: "BOM ID",
                    type: "select",
                    options: BOM_IDS,
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  {
                    key: "incomingType",
                    label: "Incoming Type",
                    type: "select",
                    options: INCOMING_TYPES,
                  },
                  { key: "orderQty", label: "Order Qty" },
                  { key: "rate", label: "Rate" },
                  { key: "amount", label: "Amount", readOnly: true },
                  { key: "sgstRate", label: "SGST Rate" },
                  {
                    key: "sgstAmount",
                    label: "SGST Amount",
                    readOnly: true,
                  },
                  { key: "cgstRate", label: "CGST Rate" },
                  {
                    key: "cgstAmount",
                    label: "CGST Amount",
                    readOnly: true,
                  },
                  { key: "igstRate", label: "IGST Rate" },
                  {
                    key: "igstAmount",
                    label: "IGST Amount",
                    readOnly: true,
                  },
                ]}
                rows={orderDetailRows}
                onCellChange={handleOrderCellChange}
                onRemoveRow={handleRemoveOrderRow}
              />
              {fieldErrors.orderDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.orderDetails}
                </p>
              )}
            </div>
          )}

          {/* Terms and Conditions tab */}
          {activeChildTab === "terms" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Payment Terms"
                  name="paymentTerms"
                  value={terms.paymentTerms}
                  onChange={handleTermsChange}
                  error={fieldErrors.paymentTerms}
                  options={PAYMENT_TERMS}
                  required
                />
                <Field
                  type="date"
                  label="Delivery Date"
                  name="deliveryDate"
                  value={terms.deliveryDate}
                  onChange={handleTermsChange}
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={terms.narration}
                  onChange={handleTermsChange}
                />
                <Field
                  type="textarea"
                  label="Notes"
                  name="notes"
                  value={terms.notes}
                  onChange={handleTermsChange}
                />
              </div>
            </div>
          )}

          {/* Tax Details tab */}
          {activeChildTab === "taxDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "particular",
                    label: "Particulars",
                    type: "select",
                    options: PARTICULARS,
                  },
                  { key: "amount", label: "Amount" },
                ]}
                rows={taxDetailRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
              />
            </div>
          )}

          {/* Quotation Attachment tab */}
          {activeChildTab === "quotationAttachment" && (
            <div className="pt-3">
              <AttachmentTable
                rows={attachmentRows}
                onCellChange={handleAttachmentCellChange}
                onRemoveRow={handleRemoveAttachmentRow}
                onAddRow={handleAddAttachmentRow}
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

export default JobOrderForm;
