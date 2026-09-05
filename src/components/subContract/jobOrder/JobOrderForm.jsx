import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import jobOrderAPI from "../../../api/SubContract/jobOrderAPI";

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

/* Generic dynamic table. Supports text / select / readonly columns.
   Options may be plain strings or { value, label } objects. */
const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow, headerData = {} }) => {
  const { isIgstApplicable } = headerData;
  const taxType = isIgstApplicable === "YES" ? "IGST" : "SGST";

  // Filter columns based on tax type
  const visibleColumns = columns.filter((col) => {
    if (taxType === "IGST") {
      if (col.key === "sgstRate" || col.key === "sgstAmount" ||
        col.key === "cgstRate" || col.key === "cgstAmount") {
        return false;
      }
    }
    if (taxType === "SGST") {
      if (col.key === "igstRate" || col.key === "igstAmount") {
        return false;
      }
    }
    return true;
  });

  return (
    <TableWrapper>
      <TableHead headers={["#", ...visibleColumns.map((c) => c.label), "Action"]} />
      <tbody>
        {rows.map((row, idx) => (
          <TableRow
            key={idx}
            index={idx}
            onRemove={() => onRemoveRow(idx)}
            disabled={rows.length <= 1}
          >
            {visibleColumns.map((col) => {
              if (col.type === "select") {
                // Find the matching option for the current value
                const currentValue = row[col.key] || "";
                const matchedOption = (col.options || []).find(
                  (opt) => String(opt.value) === String(currentValue) ||
                    String(opt.itemCode) === String(currentValue) ||
                    String(opt.label) === String(currentValue)
                );
                const selectValue = matchedOption ? matchedOption.value : currentValue;

                return (
                  <td className="p-2 align-top" key={col.key}>
                    <select
                      value={selectValue}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        const selectedItem = (col.options || []).find((opt) => {
                          const optionValue =
                            typeof opt === "object"
                              ? opt.value
                              : opt;

                          const optionLabel =
                            typeof opt === "object"
                              ? opt.label ?? opt.valuesDescription ?? opt.value
                              : opt;

                          return (
                            String(optionValue) === String(selectedValue) ||
                            String(optionLabel) === String(selectedValue)
                          );
                        });

                        onCellChange(
                          idx,
                          col.key,
                          selectedValue,
                          selectedItem
                        );
                      }}
                      className={cellInputClasses}
                    >
                      <option value="">-- Select --</option>

                      {(col.options || []).map((opt) => {
                        const optionLabel =
                          typeof opt === "object"
                            ? opt.label ??
                            opt.valuesDescription ??
                            opt.value
                            : opt;

                        return (
                          <option
                            key={optionLabel}
                            value={typeof opt === "object" ? opt.value : opt}
                          >
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                );
              }

              // Check if this is a tax column that should be disabled based on tax type
              let isDisabled = col.readOnly || false;
              if (taxType === "IGST") {
                if (col.key === "sgstRate" || col.key === "sgstAmount" ||
                  col.key === "cgstRate" || col.key === "cgstAmount") {
                  isDisabled = true;
                }
              }
              if (taxType === "SGST") {
                if (col.key === "igstRate" || col.key === "igstAmount") {
                  isDisabled = true;
                }
              }

              return (
                <td className="p-2 align-top" key={col.key}>
                  <input
                    type={col.type === "date" ? "date" : "text"}
                    value={row[col.key] || ""}
                    readOnly={isDisabled || col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      isDisabled || col.readOnly ? cellReadOnlyClasses : cellInputClasses
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
};

/* ---------------------------------------------------------------------------- */
/* Quotation Attachment tab: dropzone + file table with view button            */

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"];

const ACCEPTED_FORMATS_LABEL = "PDF, DOCX, XLSX, PNG, JPG";

const AttachmentTable = ({ rows, onCellChange, onRemoveRow, onAddRow }) => {
  const fileInputRefs = useRef({});
  const [fileErrors, setFileErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleViewFile = (attachment) => {
    if (!attachment) return;

    // If it's a File object, create a URL
    if (attachment instanceof File) {
      const url = URL.createObjectURL(attachment);
      setPreviewImage(url);
      setShowPreview(true);
      return;
    }

    // If it's an object with filePath (existing file)
    if (attachment.filePath) {
      // Check if it's an image by extension
      const ext = attachment.filePath.split('.').pop()?.toLowerCase() || '';
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      if (imageExts.includes(ext)) {
        setPreviewImage(attachment.filePath);
        setShowPreview(true);
      } else {
        // Open in new tab for non-image files
        window.open(attachment.filePath, '_blank');
      }
      return;
    }

    // If it's a string (file path)
    if (typeof attachment === 'string') {
      const ext = attachment.split('.').pop()?.toLowerCase() || '';
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      if (imageExts.includes(ext)) {
        setPreviewImage(attachment);
        setShowPreview(true);
      } else {
        window.open(attachment, '_blank');
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  return (
    <div className="w-full space-y-3">
      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closePreview}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

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
          {rows.map((row, idx) => {
            const hasAttachment = row.attachment || row.filePath || row.fileName;
            const isImage = row.attachment?.type?.startsWith('image/') ||
              row.filePath?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ||
              row.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);

            return (
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
                      className={`flex-1 min-w-0 text-xs truncate ${row.attachment || row.filePath
                        ? "text-gray-700 dark:text-gray-200"
                        : "text-gray-400 dark:text-gray-500"
                        }`}
                    >
                      {row.attachment?.name || row.fileName || row.attachment?.fileName || "No file chosen"}
                    </span>
                    {hasAttachment && (
                      <button
                        type="button"
                        onClick={() => handleViewFile(row.attachment || row)}
                        className="flex items-center gap-1 px-2 h-7 rounded text-xs whitespace-nowrap text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-300 dark:border-blue-700 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    )}
                  </div>
                  {fileErrors[idx] && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                      {fileErrors[idx]}
                    </p>
                  )}
                </td>
              </TableRow>
            );
          })}
        </tbody>
      </TableWrapper>
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const BELONGS_TO = ["APPLIANCES", "ELECTRICALS", "PACKAGING", "RAW MATERIAL"];
const JOB_ORDER_FOR = ["Sub Contract", "Job Work", "Rate Contract", "Repair"];
const YES_NO = ["YES", "NO"];
const GST_STATUS = ["Registered", "Unregistered", "Composition", "SEZ"];
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
const SCOPE_OPTIONS = ["Local", "Inter-State", "SEZ", "Overseas"];
const FREIGHT_TYPES = ["Macurex", "Supplier"];
const PACKING_TYPES = ["Macurex", "Supplier"];
const MODE_OF_DESPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];

const CHILD_TABS = [
  { key: "orderDetails", label: "Order Details", kind: "table" },
  { key: "terms", label: "Terms and Conditions", kind: "fields" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "quotationAttachment", label: "Quotation Attachment", kind: "attachment" },
];

const emptyOrderDetailRow = () => ({
  incomingItem: "",
  incomingItemId: "",
  itemDescription: "",
  bomId: "",
  unit: "",
  unitId: "",
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
  amount: "",
  narration: "",
  notes: "",
});

const emptyTaxDetailRow = () => ({
  particular: "",
  amount: "",
  isSystemRow: false,
});

const emptyAttachmentRow = () => ({
  fileName: "",
  filePath: "",
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
/* ---------------------------------------------------------------------------- */

const JobOrderForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [finYear] = useState(Number(localStorage.getItem("finYear")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("orderDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isUpdatingRef = useRef(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [jobOrderForOptions, setJobOrderForOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [contractDetailsMap, setContractDetailsMap] = useState({});
  const [incomingItemOptions, setIncomingItemOptions] = useState([]);
  const [incomingItemMap, setIncomingItemMap] = useState({});
  const [incomingTypeOptions, setIncomingTypeOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    jobOrderNo: data?.jobOrderNo,
    date: data?.date || todayStr(),
    department: data?.department || "",
    belongsTo: data?.belongsTo || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    vendorGstNo: data?.vendorGstNo || "",
    vendorGstStateId: data?.vendorGstStateId || "",
    vendorGstState: data?.vendorGstState || "",
    vendorIgstApplicable: data?.vendorIgstApplicable || "",
    jobOrderFor: data?.jobOrderFor || "",
    gstState: data?.gstState || "",
    gstStateId: data?.gstStateId || "",
    gstStatus: data?.gstStatus || "",
    contractNo: data?.contractNo || "",
    serviceName: data?.serviceName || "",
    serviceId: data?.serviceId || "",
    isIgstApplicable: data?.isIgstApplicable || "",
    gstinNo: data?.gstinNo || "",
    indentTime: data?.indentTime || nowTimeStr(),
    hsnSacCode: data?.hsnSacCode || "",
    hsnId: data?.hsnId || "",
    taxCode: data?.taxCode || "",
    taxType: data?.taxType || "SGST",
    taxPct: data?.taxPct ?? "",
    scope: data?.scope || "",
    scrap: data?.scrap || "",
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

  // Track if initial data has been loaded
  const initialDataLoadedRef = useRef(false);

  /* ---------------- Transform Data for Form ---------------- */

  // Transform the nested API response to flat structure for the form
  const transformDataForForm = useCallback((apiData) => {
    if (!apiData) return null;

    return {
      id: apiData.id,
      plantId: apiData.branch?.id || "",
      department: apiData.department?.id || "",
      belongsTo: apiData.belongsTo || "",
      jobOrderNo: apiData.docId || "",
      date: apiData.docDate || "",
      // Fix: Use customerId from vendor object
      vendorId: apiData.vendor?.customerId || apiData.vendor?.id || "",
      vendorName: apiData.vendor?.customerName || "",
      vendorGstNo: apiData.vendor?.gstNo || "",
      vendorGstStateId: apiData.gstState?.id || "",
      vendorGstState: apiData.gstState?.gstState || "",
      vendorIgstApplicable: apiData.igstAppl ? "YES" : "NO",
      jobOrderFor: apiData.jobOrderFor || "",
      gstState: apiData.gstState?.gstState || "",
      gstStateId: apiData.gstState?.id || "",
      gstStatus: apiData.gstStatus || "",
      contractNo: apiData.contractNo || "",
      serviceName: apiData.serviceName?.id || "",
      serviceId: apiData.serviceName?.id || "",
      isIgstApplicable: apiData.igstAppl ? "YES" : "NO",
      gstinNo: apiData.vendor?.gstNo || "",
      indentTime: apiData.indentTime || nowTimeStr(),
      hsnSacCode: apiData.hsnSacCode?.hsn || "",
      hsnId: apiData.hsnSacCode?.id || "",
      taxCode: apiData.taxCode || "",
      taxType: apiData.taxType || "SGST",
      taxPct: apiData.taxPercentage || "",
      scope: apiData.scope || "",
      scrap: apiData.scrap ? "YES" : "NO",
      active: apiData.active === "Active",
      // Terms fields - these are at the root level in the API response
      paymentTerms: apiData.paymentTerms || "",
      deliveryDate: apiData.deliveryDate || "",
      amount: apiData.amount || "",
      narration: apiData.narration || "",
      notes: apiData.note || "",
      // Order details
      orderDetails: apiData.jobOrderDetails?.map((item) => ({
        incomingItem: item.incomingItem?.itemCode || "",
        incomingItemId: item.incomingItem?.id || "",
        itemDescription: item.incomingItem?.itemDescription || "",
        bomId: item.bom || "",
        unit: item.unit?.unitId || "",
        unitId: item.unit?.id || "",
        incomingType: item.incomingType || "",
        orderQty: item.orderQty || "",
        rate: item.rate || "",
        amount: item.amount || "",
        sgstRate: item.sgstRate || "",
        sgstAmount: item.sgstAmount || "",
        cgstRate: item.cgstRate || "",
        cgstAmount: item.cgstAmount || "",
        igstRate: item.igstRate || "",
        igstAmount: item.igstAmount || "",
        sentFor: item.sentFor || "",
      })) || [],
      // Tax details
      taxDetails: apiData.jobOrderTaxDetails?.map((tax) => ({
        particular: tax.particulars || "",
        amount: tax.amount || "",
        isSystemRow: ["Gross Amount", "IGST", "CGST", "SGST"].includes(tax.particulars || ""),
      })) || [],
      // Attachments
      attachments: apiData.attachments?.map((att) => ({
        fileName: att.name || att.fileName || "",
        filePath: att.filePath || "",
        attachment: att.filePath ? {
          name: att.name || att.fileName,
          filePath: att.filePath,
          id: att.id
        } : null,
      })) || [],
    };
  }, []);

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

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId);
      const deptList = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        deptList.map((d) => ({
          value: d.id,
          label: d.departmentName || d.departmentCode || d.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("SDS BELONGS TO", orgId);
      setBelongsToOptions(
        (res || []).map((item) => ({
          value: item.id,
          label: item.valuesDescription || item.valueDescription || item.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load belongs to options:", error);
      setBelongsToOptions([]);
    }
  }, [orgId]);

  const loadJobOrderFor = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("JOB_ORDER_FOR", orgId);
      setJobOrderForOptions(
        (res || []).map((item) => ({
          value: item.id,
          label: item.valuesDescription || item.valueDescription || item.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load job order for options:", error);
      setJobOrderForOptions([]);
    }
  }, [orgId]);

  const loadVendors = useCallback(async () => {
    try {
      const res = await jobOrderAPI.getCustomersForSupplierRateContract(branch, orgId);
      const customerList = res?.paramObjectsMap?.customerList || [];
      setVendorOptions(
        customerList.map((v) => ({
          value: v.customerId,
          label: `${v.customerCode} - ${v.customerName}`,
          customer: v,
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
    }
  }, [orgId, branch]);

  const loadContracts = useCallback(async (vendorId) => {
    try {
      if (!vendorId) {
        setContractOptions([]);
        setContractDetailsMap({});
        return;
      }

      const res = await jobOrderAPI.getSupplierRateContractForJobOrder(branch, vendorId, orgId);
      let data = [];
      if (res?.paramObjectsMap?.supplierRateContractDropdown) {
        data = res.paramObjectsMap.supplierRateContractDropdown;
      } else if (Array.isArray(res)) {
        data = res;
      }

      const detailsMap = {};
      const options = (data || []).map((c) => {
        detailsMap[c.docId] = c;
        return {
          value: c.docId || "",
          label: c.docId || "",
          contractData: c,
        };
      });
      setContractOptions(options);
      setContractDetailsMap(detailsMap);
    } catch (error) {
      console.error("Failed to load contract options:", error);
      setContractOptions([]);
      setContractDetailsMap({});
    }
  }, [orgId, branch]);

  const loadIncomingItems = useCallback(async (contractNo) => {
    try {
      if (!contractNo) {
        setIncomingItemOptions([]);
        setIncomingItemMap({});
        return;
      }

      const res = await jobOrderAPI.getSupplierRateContractItemDetailsForJobOrder(branch, contractNo, orgId);
      let data = [];
      if (res?.paramObjectsMap?.supplierRateContractItemDetails) {
        data = res.paramObjectsMap.supplierRateContractItemDetails;
      } else if (Array.isArray(res)) {
        data = res;
      }

      const map = {};
      const options = (data || []).map((item) => {
        map[item.itemCode] = item;
        return {
          value: item.itemCode,
          label: `${item.itemCode} - ${item.itemDescription || ''}`,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          unitId: item.unitId,
          unit: item.unit,
          rate: item.rate,
          incomingItemId: item.incomingItemId,
          id: item.id,
        };
      });
      setIncomingItemOptions(options);
      setIncomingItemMap(map);
    } catch (error) {
      console.error("Failed to load incoming items:", error);
      setIncomingItemOptions([]);
      setIncomingItemMap({});
    }
  }, [orgId, branch]);

  const loadIncomingType = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("INCOMING_TYPE", orgId);
      setIncomingTypeOptions(
        (res || []).map((item) => ({
          value: item.id,
          label: item.valuesDescription || item.valueDescription || item.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load incoming type options:", error);
      setIncomingTypeOptions([]);
    }
  }, [orgId]);

  const loadServices = useCallback(async () => {
    try {
      const res = await jobOrderAPI.getServicesForSupplierRateContract(branch, orgId);
      const serviceList = res?.paramObjectsMap?.serviceList || [];
      setServiceOptions(
        serviceList.map((s) => ({
          value: s.serviceId,
          label: `${s.serviceName} - ${s.serviceDescription || ''}`,
          service: s,
        })),
      );
    } catch (error) {
      console.error("Failed to load service options:", error);
      setServiceOptions([]);
    }
  }, [orgId, branch]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.itemCode] = it;
        return {
          value: it.itemCode,
          label: `${it.itemCode} - ${it.itemDescription || ''}`,
          itemCode: it.itemCode,
          itemDescription: it.itemDescription,
          unitId: it.primaryUnits?.id,
        };
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

  const loadListOfValuesData = useCallback(async () => {
    try {
      const groups = ["PARTICULARS"];
      const result = {};

      await Promise.all(
        groups.map(async (group) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(group, orgId);
            let items = [];
            if (response?.paramObjectsMap?.listValues) {
              items = response.paramObjectsMap.listValues;
            } else if (Array.isArray(response)) {
              items = response;
            }
            result[group] = items.map((item) => {
              const label = item.valuesDescription || item.label || item.name || item.value || "";
              return {
                ...item,
                value: label,
                label: label,
              };
            });
          } catch (err) {
            console.error(`${group} failed`, err);
            result[group] = [];
          }
        })
      );

      setListOfValuesData(result);
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  }, [orgId]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadDocId = useCallback(async () => {
    try {
      const currentYear = finYear;
      const res = await jobOrderAPI.getJobOrderDocId(currentYear, orgId);
      const docId = res?.paramObjectsMap?.jobOrderDocId || "";
      if (docId) {
        setHeader((prev) => ({
          ...prev,
          jobOrderNo: docId,
        }));
      }
    } catch (error) {
      console.error("Failed to load document ID:", error);
    }
  }, [orgId, data?.jobOrderNo, finYear]);

  // Load all data when component mounts
  useEffect(() => {
    if (!orgId) {
      console.warn("No orgId found, skipping data loading");
      return;
    }

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadPlants(),
          loadDepartments(),
          loadBelongsTo(),
          loadJobOrderFor(),
          loadDocId(),
          loadVendors(),
          loadIncomingType(),
          loadServices(),
          loadItems(),
          loadUnits(),
          loadEmployees(),
          loadListOfValuesData(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load contracts when vendorId changes
  useEffect(() => {
    if (header.vendorId) {
      loadContracts(header.vendorId);
    } else {
      setContractOptions([]);
      setContractDetailsMap({});
    }
  }, [header.vendorId, loadContracts]);

  // Load incoming items when contractNo changes
  useEffect(() => {
    if (header.contractNo) {
      loadIncomingItems(header.contractNo);
    } else {
      setIncomingItemOptions([]);
      setIncomingItemMap({});
    }
  }, [header.contractNo, loadIncomingItems]);

  // Populate form with data if provided - only once
  useEffect(() => {
    if (data && data.id && !initialDataLoadedRef.current) {
      const transformedData = transformDataForForm(data);
      if (transformedData) {
        setHeader({
          plantId: transformedData.plantId || "",
          department: transformedData.department || "",
          belongsTo: transformedData.belongsTo || "",
          jobOrderNo: transformedData.jobOrderNo || "",
          date: transformedData.date || todayStr(),
          vendorId: transformedData.vendorId || "",
          vendorName: transformedData.vendorName || "",
          vendorGstNo: transformedData.vendorGstNo || "",
          vendorGstStateId: transformedData.vendorGstStateId || "",
          vendorGstState: transformedData.vendorGstState || "",
          vendorIgstApplicable: transformedData.vendorIgstApplicable || "",
          jobOrderFor: transformedData.jobOrderFor || "",
          gstState: transformedData.gstState || "",
          gstStateId: transformedData.gstStateId || "",
          gstStatus: transformedData.gstStatus || "",
          contractNo: transformedData.contractNo || "",
          serviceName: transformedData.serviceName || "",
          serviceId: transformedData.serviceId || "",
          isIgstApplicable: transformedData.isIgstApplicable || "",
          gstinNo: transformedData.gstinNo || "",
          indentTime: transformedData.indentTime || nowTimeStr(),
          hsnSacCode: transformedData.hsnSacCode || "",
          hsnId: transformedData.hsnId || "",
          taxCode: transformedData.taxCode || "",
          taxType: transformedData.taxType || "SGST",
          taxPct: transformedData.taxPct || "",
          scope: transformedData.scope || "",
          scrap: transformedData.scrap || "",
          active: transformedData.active !== false,
        });

        // Set terms (Payment Terms, Delivery Date, Amount, Narration, Notes)
        setTerms({
          paymentTerms: transformedData.paymentTerms || "",
          deliveryDate: transformedData.deliveryDate || "",
          amount: transformedData.amount || "",
          narration: transformedData.narration || "",
          notes: transformedData.notes || "",
        });

        // Set order details with proper mapping
        if (transformedData.orderDetails?.length) {
          const mappedItems = transformedData.orderDetails.map((item) => {
            const matchedOpt = incomingItemOptions.find(
              (opt) => String(opt.value) === String(item.incomingItem) ||
                String(opt.itemCode) === String(item.incomingItem) ||
                String(opt.incomingItemId) === String(item.incomingItemId)
            );

            return {
              ...item,
              incomingItem: matchedOpt ? matchedOpt.value : item.incomingItem,
              incomingItemId: matchedOpt ? matchedOpt.incomingItemId : item.incomingItemId,
              unit: matchedOpt ? (matchedOpt.unit || item.unit) : item.unit,
              unitId: matchedOpt ? (matchedOpt.unitId || item.unitId) : item.unitId,
              rate: matchedOpt ? (matchedOpt.rate || item.rate) : item.rate,
            };
          });
          setOrderDetailRows(mappedItems);
        }

        // Set tax details
        if (transformedData.taxDetails?.length) {
          setTaxDetailRows(transformedData.taxDetails);
        }

        // Set attachments
        if (transformedData.attachments?.length) {
          setAttachmentRows(transformedData.attachments);
        }

        initialDataLoadedRef.current = true;
      }
    }
  }, [data, incomingItemOptions, transformDataForForm]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      // Handle Vendor ID selection
      if (name === "vendorId") {
        const vendor = vendorOptions.find((v) => String(v.value) === String(value));
        if (vendor?.customer) {
          const customer = vendor.customer;
          next.vendorName = customer.customerName || "";
          next.vendorGstNo = customer.gstNo || "";
          next.vendorGstStateId = customer.gstStateId || "";
          next.vendorGstState = customer.gstState || "";
          next.vendorIgstApplicable = customer.igstApplicable ? "YES" : "NO";

          if (customer.gstStateId) {
            next.gstStateId = customer.gstStateId;
            next.gstState = customer.gstState || "";
          }
          if (customer.igstApplicable !== undefined) {
            next.isIgstApplicable = customer.igstApplicable ? "YES" : "NO";
            next.taxType = customer.igstApplicable ? "IGST" : "SGST";
          }
          if (customer.gstNo) {
            next.gstinNo = customer.gstNo;
          }
        }
      }

      // Handle Contract No selection - Auto-populate from contract details
      if (name === "contractNo") {
        const contractDetails = contractDetailsMap[value];
        if (contractDetails) {
          // Set Job Order For
          if (contractDetails.jobOrderFor) {
            next.jobOrderFor = contractDetails.jobOrderFor;
          }

          // Set Service Name
          if (contractDetails.serviceName) {
            next.serviceName = contractDetails.serviceName.id || "";
            next.serviceId = contractDetails.serviceName.id || "";

            // Find and set the service in serviceOptions
            const service = serviceOptions.find(
              (s) => String(s.value) === String(contractDetails.serviceName.id)
            );
            if (service?.service) {
              const serviceData = service.service;
              next.hsnId = contractDetails.hsnSacCode?.id || "";
              next.hsnSacCode = contractDetails.hsnSacCode?.code || "";
              next.taxPct = contractDetails.taxPercentage || 0;

              // Set tax rates based on IGST/SGST
              if (contractDetails.igstRate && contractDetails.igstRate > 0) {
                next.isIgstApplicable = "YES";
                next.taxType = "IGST";
                setOrderDetailRows((prev) =>
                  prev.map((row) => ({
                    ...row,
                    igstRate: contractDetails.igstRate || 0,
                    sgstRate: 0,
                    cgstRate: 0,
                  }))
                );
              } else {
                next.isIgstApplicable = "NO";
                next.taxType = "SGST";
                setOrderDetailRows((prev) =>
                  prev.map((row) => ({
                    ...row,
                    sgstRate: contractDetails.sgstRate || 0,
                    cgstRate: contractDetails.cgstRate || 0,
                    igstRate: 0,
                  }))
                );
              }

              // Recalculate all rows
              setTimeout(() => {
                orderDetailRows.forEach((_, index) => {
                  calculateRowCalculation(index);
                });
              }, 100);
            }
          }
        }
      }

      // Handle Service Name selection
      if (name === "serviceName") {
        const service = serviceOptions.find((s) => String(s.value) === String(value));
        if (service?.service) {
          const serviceData = service.service;
          next.serviceId = serviceData.serviceId || "";
          next.hsnId = serviceData.hsnId || "";
          next.hsnSacCode = serviceData.hsn || "";
          next.taxPct = serviceData.rate || 0;

          if (serviceData.igstRate && serviceData.igstRate > 0) {
            next.isIgstApplicable = "YES";
            next.taxType = "IGST";
            setOrderDetailRows((prev) =>
              prev.map((row) => ({
                ...row,
                igstRate: serviceData.igstRate || 0,
                sgstRate: 0,
                cgstRate: 0,
              }))
            );
          } else {
            next.isIgstApplicable = "NO";
            next.taxType = "SGST";
            setOrderDetailRows((prev) =>
              prev.map((row) => ({
                ...row,
                sgstRate: serviceData.sgstRate || 0,
                cgstRate: serviceData.cgstRate || 0,
                igstRate: 0,
              }))
            );
          }

          // Recalculate all rows with new tax rates
          setTimeout(() => {
            orderDetailRows.forEach((_, index) => {
              calculateRowCalculation(index);
            });
          }, 100);
        }
      }

      // Handle Tax Type change
      if (name === "taxType") {
        const newTaxType = value;
        setHeader((prev) => ({
          ...prev,
          taxType: newTaxType,
          isIgstApplicable: newTaxType === "IGST" ? "YES" : "NO"
        }));
        // Recalculate all rows with new tax type
        setTimeout(() => {
          orderDetailRows.forEach((_, index) => {
            calculateRowCalculation(index);
          });
        }, 100);
      }

      return next;
    });
  };

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setTerms((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderCellChange = (idx, key, value, selectedItem = null) => {
    setOrderDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "incomingItem") {
          if (selectedItem) {
            const item = selectedItem;
            next = {
              ...next,
              incomingItem: item.value || item.itemCode || "",
              incomingItemId: item.incomingItemId || item.id || "",
              itemDescription: item.itemDescription || item.itemDesc || "",
              unit: item.unit || item.unitId || "",
              unitId: item.unitId || "",
              rate: item.rate || "",
            };
          } else {
            const foundItem = incomingItemOptions.find(
              (opt) => String(opt.value) === String(value) ||
                String(opt.itemCode) === String(value) ||
                String(opt.incomingItemId) === String(value)
            );
            if (foundItem) {
              next = {
                ...next,
                incomingItem: foundItem.value || foundItem.itemCode || "",
                incomingItemId: foundItem.incomingItemId || foundItem.id || "",
                itemDescription: foundItem.itemDescription || foundItem.itemDesc || "",
                unit: foundItem.unit || foundItem.unitId || "",
                unitId: foundItem.unitId || "",
                rate: foundItem.rate || "",
              };
            }
          }
        }

        if (key === "incomingType") {
          next.incomingType = value;
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

    setTimeout(() => {
      calculateTaxDetails();
    }, 100);
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
  const handleRemoveTaxRow = (idx) => {
    const row = taxDetailRows[idx];
    if (row?.isSystemRow) {
      addToast("Cannot delete system calculated rows", "error");
      return;
    }
    setTaxDetailRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddAttachmentRow = () =>
    setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);
  const handleRemoveAttachmentRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Calculations ---------------- */

  const calculateTaxDetails = useCallback(() => {
    if (isUpdatingRef.current) return;

    const totalAmount = orderDetailRows.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const taxType = header.isIgstApplicable === "YES" ? "IGST" : "SGST";

    let sgstTotal = 0,
      cgstTotal = 0,
      igstTotal = 0;

    orderDetailRows.forEach((item) => {
      sgstTotal += Number(item.sgstAmount) || 0;
      cgstTotal += Number(item.cgstAmount) || 0;
      igstTotal += Number(item.igstAmount) || 0;
    });

    const userAddedRows = taxDetailRows.filter(
      (item) => !item.isSystemRow,
    );

    const systemRows = [];

    systemRows.push({
      particular: "Gross Amount",
      amount: totalAmount,
      isSystemRow: true,
    });

    if (taxType === "IGST") {
      systemRows.push({
        particular: "IGST",
        amount: igstTotal,
        isSystemRow: true,
      });
    } else {
      systemRows.push({
        particular: "SGST",
        amount: sgstTotal,
        isSystemRow: true,
      });
      systemRows.push({
        particular: "CGST",
        amount: cgstTotal,
        isSystemRow: true,
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];
    setTaxDetailRows(allTaxEntries);
  }, [orderDetailRows, taxDetailRows, header.isIgstApplicable]);

  const calculateRowCalculation = useCallback((index) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const qty = Number(orderDetailRows[index]?.orderQty) || 0;
      const rate = Number(orderDetailRows[index]?.rate) || 0;
      const sgstRate = Number(orderDetailRows[index]?.sgstRate) || 0;
      const cgstRate = Number(orderDetailRows[index]?.cgstRate) || 0;
      const igstRate = Number(orderDetailRows[index]?.igstRate) || 0;
      const taxType = header.isIgstApplicable === "YES" ? "IGST" : "SGST";

      const amount = qty * rate;
      let sgstAmount = 0,
        cgstAmount = 0,
        igstAmount = 0;

      if (taxType === "IGST") {
        igstAmount = (amount * igstRate) / 100;
      } else {
        sgstAmount = (amount * sgstRate) / 100;
        cgstAmount = (amount * cgstRate) / 100;
      }

      setOrderDetailRows((prev) =>
        prev.map((row, i) => {
          if (i === index) {
            return {
              ...row,
              amount: amount ? amount.toFixed(2) : "",
              sgstAmount: taxType === "SGST" ? sgstAmount.toFixed(2) : "",
              cgstAmount: taxType === "SGST" ? cgstAmount.toFixed(2) : "",
              igstAmount: taxType === "IGST" ? igstAmount.toFixed(2) : "",
            };
          }
          return row;
        })
      );

      setTimeout(() => {
        calculateTaxDetails();
      }, 50);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [header.isIgstApplicable, calculateTaxDetails, orderDetailRows]);

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
    if (!header.gstStateId) errors.gstStateId = "GST State is required";
    if (!header.contractNo) errors.contractNo = "Contract No is required";
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
    if (!validate()) {
      const firstError = Object.values(fieldErrors)[0];
      addToast(firstError, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const isUpdate = Boolean(data?.id);

      const jobOrderData = {
        active: header.active !== false,
        amount: 0,
        belongsTo: Number(header.belongsTo) || 0,
        branch: Number(header.plantId),
        cancelRemarks: "",
        contractNo: header.contractNo || "",
        createdBy: localStorage.getItem("usersId") || "SYSTEM",
        deliveryDate: terms.deliveryDate || "",
        department: Number(header.department) || 0,
        financialYear: String(finYear) || new Date().getFullYear().toString(),
        gstState: Number(header.gstStateId) || 0,
        hsnSacCode: Number(header.hsnId) || Number(header.hsnSacCode) || 0,
        igstAppl: header.isIgstApplicable === "YES",
        indentTime: header.indentTime || nowTimeStr(),
        jobOrderFor: header.jobOrderFor || 0,
        narration: terms.narration || "",
        note: terms.notes || "",
        orgId: orgId,
        paymentTerms: terms.paymentTerms || "",
        serviceName: Number(header.serviceId) || Number(header.serviceName) || 0,
        taxPercentage: Number(header.taxPct) || 0,
        taxType: header.taxType || "SGST",
        vendor: Number(header.vendorId) || 0,
      };

      if (isUpdate) {
        jobOrderData.id = Number(data.id);
      }

      jobOrderData.jobOrderDetails = orderDetailRows
        .filter((row) => row.incomingItem && row.incomingItem.trim() !== "")
        .map((row) => {
          const selectedItem = incomingItemOptions.find(
            (opt) => opt.label === row.incomingItem || opt.value === row.incomingItem
          );

          return {
            incomingItem: Number(row.incomingItemId) || Number(selectedItem?.incomingItemId) || 0,
            bom: row.bomId || "",
            incomingType: row.incomingType || "",
            orderQty: Number(row.orderQty) || 0,
            rate: Number(row.rate) || 0,
            sgstRate: Number(row.sgstRate) || 0,
            cgstRate: Number(row.cgstRate) || 0,
            igstRate: Number(row.igstRate) || 0,
            unit: Number(row.unitId) || Number(selectedItem?.unitId) || 0,
            amount: Number(row.amount) || 0,
            sentFor: "",
          };
        });

      jobOrderData.jobOrderTaxDetails = taxDetailRows
        .filter((row) => row.particular && row.particular.trim() !== "")
        .map((row) => ({
          amount: Number(row.amount) || 0,
          particulars: row.particular || "",
        }));

      jobOrderData.attachments = attachmentRows
        .filter((row) => row.fileName?.trim())
        .map((row) => ({
          name: row.fileName || "",
        }));

      console.log("Job Order Data:", jobOrderData);

      const formData = new FormData();

      const jobOrderDataJSON = JSON.stringify(jobOrderData);
      const jobOrderDataBlob = new Blob([jobOrderDataJSON], {
        type: "application/json",
      });
      formData.append("jobOrderDTO", jobOrderDataBlob, "jobOrderDTO.json");

      const files = attachmentRows.filter((row) => row.attachment instanceof File);
      if (files.length > 0) {
        files.forEach((row) => {
          if (row.attachment) {
            formData.append("files", row.attachment, row.attachment.name);
          }
        });
      }

      const response = await jobOrderAPI.createUpdateJobOrder(formData);

      const isSuccess = response?.status === true || response?.status === "Ok" || response?.status === "SUCCESS";

      if (isSuccess) {
        addToast(
          isUpdate
            ? "Job Order updated successfully!"
            : "Job Order created successfully!",
          "success"
        );
        onBack?.();
      } else {
        const errorMessage = response?.paramObjectsMap?.message || response?.message || "Failed to save Job Order.";
        addToast(errorMessage, "error");
      }
    } catch (err) {
      console.error("Save Error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Something went wrong";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

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
          {data && data.id ? "Edit Job Order" : "Add Job Order"}
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
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={belongsToOptions}
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
              label="Vendor GST No"
              name="vendorGstNo"
              value={header.vendorGstNo}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Vendor GST State"
              name="vendorGstState"
              value={header.vendorGstState}
              onChange={handleHeaderChange}
              disabled
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
              label="Job Order For"
              name="jobOrderFor"
              value={header.jobOrderFor}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderFor}
              required
              disabled
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
              error={fieldErrors.gstStateId}
              required
              disabled
            />
            <Field
              type="select"
              label="Service Name"
              name="serviceName"
              value={header.serviceName}
              onChange={handleHeaderChange}
              options={serviceOptions}
            />
            <Field
              label="Is IGST Applicable"
              name="isIgstApplicable"
              value={header.isIgstApplicable}
              onChange={handleHeaderChange}
              error={fieldErrors.isIgstApplicable}
              required
              disabled
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
              disabled
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
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key
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
                    options: incomingItemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Item Description",
                    readOnly: true,
                  },
                  {
                    key: "bomId",
                    label: "BOM ID",
                  },
                  {
                    key: "unit",
                    label: "Unit",
                    readOnly: true,
                  },
                  {
                    key: "incomingType",
                    label: "Incoming Type",
                    type: "select",
                    options: incomingTypeOptions,
                  },
                  { key: "orderQty", label: "Order Qty", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "amount", label: "Amount", readOnly: true },
                  { key: "sgstRate", label: "SGST Rate", type: "number" },
                  {
                    key: "sgstAmount",
                    label: "SGST Amount",
                    readOnly: true,
                  },
                  { key: "cgstRate", label: "CGST Rate", type: "number" },
                  {
                    key: "cgstAmount",
                    label: "CGST Amount",
                    readOnly: true,
                  },
                  { key: "igstRate", label: "IGST Rate", type: "number" },
                  {
                    key: "igstAmount",
                    label: "IGST Amount",
                    readOnly: true,
                  },
                ]}
                rows={orderDetailRows}
                onCellChange={handleOrderCellChange}
                onRemoveRow={handleRemoveOrderRow}
                headerData={{ isIgstApplicable: header.isIgstApplicable }}
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
                  label="Payment Terms"
                  name="paymentTerms"
                  value={terms.paymentTerms}
                  onChange={handleTermsChange}
                  error={fieldErrors.paymentTerms}
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
                  label="Amount"
                  name="amount"
                  value={terms.amount}
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
                    options: listOfValuesData.PARTICULARS || [],
                  },
                  { key: "amount", label: "Amount", type: "number" },
                ]}
                rows={taxDetailRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
                headerData={{ isIgstApplicable: header.isIgstApplicable }}
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
          saveLabel={data && data.id ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default JobOrderForm;