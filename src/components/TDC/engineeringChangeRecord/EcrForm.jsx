import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import engineeringChangeRecordAPI from "../../../api/TDC/engineeringChangeRecordAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import itemAPI from "../../../api/itemAPI";
import { employeeAPI } from "../../../api/employeeAPI";

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

const ToggleField = ({
  label,
  name,
  value,
  onChange,
  options = ["Yes", "No"],
}) => (
  <div>
    <label className={labelClasses}>{label}</label>
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(name, opt)}
          className={`h-[30px] px-3 rounded border text-xs transition-colors ${
            value === opt
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
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

const TableRow = ({
  children,
  index,
  onRemove,
  disabled,
  showDelete = true,
  showPreview = false,
  previewDisabled = false,
  onPreview,
}) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    {showPreview && (
      <td className="p-2 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={onPreview}
          disabled={previewDisabled}
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
            previewDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700"
          }`}
          title={previewDisabled ? "No file to preview" : "Preview"}
        >
          <Eye size={10} />
        </button>
      </td>
    )}
    {showDelete && (
      <td className="p-2 text-center whitespace-nowrap">
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
    )}
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
/* Options                                                                      */

const YES_NO = ["Yes", "No"];
const APPROVAL_STATUS = ["REQUIRED", "NOT REQUIRED"];
const DEPARTMENTS = ["Design", "Purchase", "Stores", "Quality", "Production"];

const CHILD_TABS = [
  { key: "productNo", label: "Product No", kind: "fields" },
  { key: "partDetail", label: "Part Detail", kind: "fields" },
  { key: "tdcDepartment", label: "For TDC Department", kind: "fields" },
  { key: "remarks", label: "Remarks", kind: "fields" },
  { key: "pdfAttachment", label: "Pdf Attachment", kind: "table" },
];

const emptyPartRow = () => ({
  partNo: "",
  partDescription: "",
});

const emptyPdfRow = () => ({
  rowId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  attachDrawingCopy: null,
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */

const EcrForm = ({ data, onBack }) => {
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

  const [activeChildTab, setActiveChildTab] = useState("productNo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [requestedByOptions, setRequestedByOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [productMap, setProductMap] = useState({});

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? data?.branch?.id ?? "",
      ecrNo: data?.ecrNo || data?.docId || "",
      ecrDate: data?.ecrDate || data?.docDate || dayjs().format("YYYY-MM-DD"),
      fromDepartment: data?.fromDepartment?.id ?? data?.fromDepartment ?? "",
      customerName: data?.customerName || "",
      requestedBy:
        data?.requestedBy?.id ??
        data?.requestedBy?.employeeId ??
        data?.requestedBy ?? "",
      reasonForChange: data?.reasonForChange || "",
      productDescription: data?.productDescription || "",
      engineeringDrawingChange: data?.engineeringDrawingChange || "",
      bomChange: data?.bomChange || "",
      customerApproval: data?.customerApproval || "",
      drawingWhichRequiredChange: data?.drawingWhichRequiredChange || "",
      documentsWhichRequireChange:
        data?.documentsWhichRequireChange ||
        data?.documentWhichRequiredChange ||
        "",
      active: data?.active !== false,
    };
    base.ecrDate = fmtDate(base.ecrDate);
    return base;
  });

  const [customerProductNo, setCustomerProductNo] = useState(
    data?.customerProductNo || data?.productNo || "",
  );

  const [companyProductNo, setCompanyProductNo] = useState(
    data?.companyProductNo || "",
  );

  const [partRows, setPartRows] = useState(() => {
    if (Array.isArray(data?.partDetails) && data.partDetails.length > 0) {
      return data.partDetails;
    }
    if (data?.partNo) {
      return [{ partNo: data.partNo, partDescription: data.partDescription || "" }];
    }
    return [emptyPartRow()];
  });

  const [tdc, setTdc] = useState({
    departmentNotes: data?.tdcDepartment?.departmentNotes || "",
    actionRequired: data?.tdcDepartment?.actionRequired || "",
  });

  const [remarks, setRemarks] = useState({
    accepted: data?.remarks?.accepted ?? data?.accepted ?? "",
    rejected: data?.remarks?.rejected ?? data?.rejected ?? "",
    approvedBy:
      data?.remarks?.approvedBy ??
      data?.approvedBy?.id ??
      data?.approvedBy?.employeeId ??
      data?.approvedBy?.employeeName ??
      data?.approvedBy ??
      "",
    approvalStatus:
      data?.remarks?.approvalStatus ?? data?.approved ?? data?.macurex ?? "",
    remarks: data?.remarks?.remarks || "",
  });

  const [pdfRows, setPdfRows] = useState(() => {
    const existing = data?.engineeringChangeRecordAttachmentDTO?.length
      ? data.engineeringChangeRecordAttachmentDTO
      : data?.pdfAttachments?.length
        ? data.pdfAttachments
        : [];
    if (existing.length) {
      return existing.map((p) => ({
        rowId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        attachDrawingCopy: {
          fileName: p.name || p.fileName || p.attachDrawingCopy || "",
          filePath: p.filePath || "",
        },
      }));
    }
    return [emptyPdfRow()];
  });

  const [preview, setPreview] = useState({
    url: "",
    name: "",
    isImage: false,
    loading: false,
    error: "",
  });
  const fileInputRefs = useRef({});

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

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      if (departments.length) {
        setDepartmentOptions(
          departments.map((d) => ({ value: d.id, label: d.departmentName })),
        );
      } else {
        setDepartmentOptions(DEPARTMENTS);
      }
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions(DEPARTMENTS);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setRequestedByOptions(
        (res || []).map((emp) => ({
          value: emp.id,
          label: emp.employeeName || emp.employeeId || emp.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setRequestedByOptions([]);
    }
  }, [orgId]);

  const loadItems = useCallback(async () => {
    try {
      const res = await itemAPI.getItems(orgId, branch);
      const map = {};
      const options = (res || []).map((it) => {
        map[it.id] = it;
        return { value: it.id, label: it.itemCode || it.id };
      });
      setProductOptions(options);
      setProductMap(map);
    } catch (error) {
      console.error("Failed to load product/part options:", error);
      setProductOptions([]);
    }
  }, [orgId, branch]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadDepartments();
      loadEmployees();
      loadItems();
    }
  }, [orgId, branch, loadDepartments, loadEmployees, loadItems]);

  // Generate the ECR No from the backend on Add
  useEffect(() => {
    if (data) return; // only generate on Add
    if (!orgId) return;
    let cancelled = false;
    engineeringChangeRecordAPI
      .getEcrDocId(orgId)
      .then((docId) => {
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, ecrNo: docId }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [data, orgId]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleTdcChange = (e) => {
    const { name, value } = e.target;
    setTdc((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemarksFieldChange = (e) => {
    const { name, value } = e.target;
    setRemarks((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemarksToggle = (name, value) => {
    setRemarks((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors.productNo)
      setFieldErrors((prev) => ({ ...prev, productNo: "" }));
    if (name === "companyProductNo") {
      setCompanyProductNo(value);
    } else {
      setCustomerProductNo(value);
      const item = productMap[value];
      if (item?.itemDescription) {
        setHeader((prev) => ({
          ...prev,
          productDescription: item.itemDescription,
        }));
      }
    }
  };

  const handlePartFieldChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors.partDetails)
      setFieldErrors((prev) => ({ ...prev, partDetails: "" }));
    setPartRows((prev) => {
      if (!prev.length) return [{ [name]: value, partNo: "", partDescription: "" }];
      return prev.map((row, i) => (i === 0 ? { ...row, [name]: value } : row));
    });
  };

  const handlePdfFileChange = (idx, file) => {
    setPdfRows((prev) =>
      prev.map((row, i) =>
        i !== idx ? row : { ...row, attachDrawingCopy: file },
      ),
    );
  };

  const handleAddPdfRow = () =>
    setPdfRows((prev) => [...prev, emptyPdfRow()]);
  const handleRemovePdfRow = (idx) =>
    setPdfRows((prev) => prev.filter((_, i) => i !== idx));

  const getAttachmentName = (file) => {
    if (!file) return "Attachment";
    if (file instanceof File) return file.name || "Attachment";
    if (typeof file === "string") return file.split("/").pop() || file;
    if (typeof file === "object") {
      return (
        file.name ||
        file.fileName ||
        (file.filePath || "").split("/").pop() ||
        "Attachment"
      );
    }
    return "Attachment";
  };

  const closePreview = () =>
    setPreview({ url: "", name: "", isImage: false, loading: false, error: "" });

  const handlePdfPreview = async (row, domFile) => {
    const file = row.attachDrawingCopy || domFile;
    const name = getAttachmentName(file);

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setPreview({
        url,
        name,
        isImage:
          file.type?.startsWith("image/") ||
          /\.(png|jpe?g|gif|bmp|webp)$/i.test(name),
        loading: false,
        error: "",
      });
      return;
    }

    const sourcePath =
      typeof file === "object"
        ? file.filePath || file.fileName || ""
        : typeof file === "string"
          ? file
          : "";

    if (!sourcePath) {
      addToast("No file available to preview", "warning");
      return;
    }

    setPreview({ url: "", name, isImage: false, loading: true, error: "" });

    try {
      const token =
        localStorage.getItem("user.token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/files/download?path=${encodeURIComponent(sourcePath)}`,
        {
          responseType: "blob",
          headers: token
            ? { Authorization: `Bearer ${token.replace("Bearer ", "")}` }
            : undefined,
        },
      );

      const blob = response.data;
      if (!blob || blob.size === 0) {
        setPreview({
          url: "",
          name,
          isImage: false,
          loading: false,
          error: "Unable to load file",
        });
        return;
      }
      const url = URL.createObjectURL(blob);
      setPreview({
        url,
        name,
        isImage:
          blob.type?.startsWith("image/") ||
          /\.(png|jpe?g|gif|bmp|webp)$/i.test(name),
        loading: false,
        error: "",
      });
    } catch (error) {
      setPreview({
        url: "",
        name,
        isImage: false,
        loading: false,
        error:
          error?.response?.status === 401 ? "Unauthorized" : "Failed to load file",
      });
    }
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.ecrNo?.trim()) errors.ecrNo = "ECR No is required";
    if (!header.ecrDate) errors.ecrDate = "Date is required";
    if (!header.fromDepartment)
      errors.fromDepartment = "From Department is required";
    if (!header.requestedBy) errors.requestedBy = "Requested By is required";
    if (!header.reasonForChange?.trim())
      errors.reasonForChange = "Reason For Change is required";
    if (!header.engineeringDrawingChange)
      errors.engineeringDrawingChange =
        "Engineering Drawing Change is required";
    if (!header.bomChange) errors.bomChange = "BOM Change is required";

    const hasValidPart = partRows.some((r) => r.partNo);
    if (!hasValidPart)
      errors.partDetails = "Add at least one Part with a Part No";

    const hasValidPdf = pdfRows.some(
      (r) => r.attachDrawingCopy instanceof File || r.attachDrawingCopy,
    );
    if (!hasValidPdf)
      errors.pdfAttachments =
        "Attach at least one drawing copy in the Pdf Attachment tab";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    const firstPart = partRows.find((r) => r.partNo?.trim()) || partRows[0] || {};

    const financialYear =
      localStorage.getItem("finYear") || String(new Date().getFullYear());

    // Build the Engineering Change Record payload matching the backend VO.
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      accepted: remarks.accepted || "",
      active: header.active !== false,
      approved: remarks.approvalStatus || "",
      approvedBy: Number(remarks.approvedBy) || 0,
      bomChange: header.bomChange || "",
      branch,
      cancelRemarks: data?.cancelRemarks || "",
      createdBy: usersId || "",
      customer: header.customerName || "",
      customerApproval: header.customerApproval || "",
      customerName: header.customerName || "",
      customerProductNo: customerProductNo || "",
      companyProductNo: companyProductNo || "",
      documentWhichRequiredChange: header.documentsWhichRequireChange || "",
      drawingWhichRequiredChange: header.drawingWhichRequiredChange || "",
      engineeringDrawingChange: header.engineeringDrawingChange || "",
      financialYear,
      fromDepartment: header.fromDepartment || "",
      macurex: data?.macurex || "",
      orgId,
      partDescription: firstPart.partDescription || "",
      partNo: firstPart.partNo || "",
      productDescription: header.productDescription || "",
      reasonForChange: header.reasonForChange || "",
      rejected: remarks.rejected || "",
      requestedBy: Number(header.requestedBy) || 0,
    };

    // Build multipart form data: JSON blob + attachment files
    const formData = new FormData();
    formData.append(
      "engineeringChangeRecordVO",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    pdfRows
      .filter((r) => r.attachDrawingCopy instanceof File)
      .forEach((r) => formData.append("files", r.attachDrawingCopy));

    try {
      const response = await engineeringChangeRecordAPI.createUpdateEcr(formData);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Engineering Change Record updated successfully!"
              : "Engineering Change Record created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Engineering Change Record.",
        );
      }
    } catch (err) {
      console.error("Save Engineering Change Record Error:", err);
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
          {data
            ? "Edit Engineering Change Record"
            : "Add Engineering Change Record"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Engineering Change Record</SectionHeader>
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
              label="ECR No"
              name="ecrNo"
              value={header.ecrNo}
              onChange={handleHeaderChange}
              error={fieldErrors.ecrNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Date"
              name="ecrDate"
              value={header.ecrDate}
              onChange={handleHeaderChange}
              error={fieldErrors.ecrDate}
              required
              disabled
            />
            <Field
              type="select"
              label="From Department"
              name="fromDepartment"
              value={header.fromDepartment}
              onChange={handleHeaderChange}
              error={fieldErrors.fromDepartment}
              options={departmentOptions}
              required
            />
            <Field
              label="Customer Name"
              name="customerName"
              value={header.customerName}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Requested By"
              name="requestedBy"
              value={header.requestedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.requestedBy}
              options={requestedByOptions}
              required
            />
            <Field
              type="textarea"
              label="Reason For Change"
              name="reasonForChange"
              value={header.reasonForChange}
              onChange={handleHeaderChange}
              error={fieldErrors.reasonForChange}
              required
            />
            



            <Field
              type="select"
              label="Engineering Drawing Change"
              name="engineeringDrawingChange"
              value={header.engineeringDrawingChange}
              onChange={handleHeaderChange}
              error={fieldErrors.engineeringDrawingChange}
              options={YES_NO}
              required
            />
            <Field
              type="select"
              label="BOM Change"
              name="bomChange"
              value={header.bomChange}
              onChange={handleHeaderChange}
              error={fieldErrors.bomChange}
              options={YES_NO}
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

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={handleAddPdfRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Product No tab */}
          {activeChildTab === "productNo" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="text"
                  label="Customer Product No"
                  name="customerProductNo"
                  value={customerProductNo}
                  onChange={handleProductChange}
                  options={productOptions}
                />

                <Field
                  type="text"
                  label="Company Product NO"
                  name="companyProductNo"
                  value={companyProductNo}
                  onChange={handleProductChange}
                />
              </div>
            </div>
          )}

          {/* Part Detail tab */}
          {activeChildTab === "partDetail" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="text"
                  label="Part No"
                  name="partNo"
                  value={partRows[0]?.partNo || ""}
                  onChange={handlePartFieldChange}
                />

                <Field
                  type="text"
                  label="Part Description"
                  name="partDescription"
                  value={partRows[0]?.partDescription || ""}
                  onChange={handlePartFieldChange}
                />
              </div>

              {fieldErrors.partDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.partDetails}
                </p>
              )}
            </div>
          )}

          {/* For TDC Department tab */}
          {activeChildTab === "tdcDepartment" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Customer Approval"
                  name="customerApproval"
                  value={header.customerApproval}
                  onChange={handleHeaderChange}
                  options={APPROVAL_STATUS}
                />
                <Field
                  label="Drawing Which Required Change"
                  name="drawingWhichRequiredChange"
                  value={header.drawingWhichRequiredChange}
                  onChange={handleHeaderChange}
                />
                <Field
                  label="Documents Which Require Change"
                  name="documentsWhichRequireChange"
                  value={header.documentsWhichRequireChange}
                  onChange={handleHeaderChange}
                />
               
              </div>
            </div>
          )}

          {/* Remarks tab */}
          {activeChildTab === "remarks" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Accepted"
                  name="accepted"
                  value={remarks.accepted}
                  onChange={handleRemarksFieldChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Rejected"
                  name="rejected"
                  value={remarks.rejected}
                  onChange={handleRemarksFieldChange}
                  options={YES_NO}
                />
                <Field
                  type="select"
                  label="Approved By"
                  name="approvedBy"
                  value={remarks.approvedBy}
                  onChange={handleRemarksFieldChange}
                  options={requestedByOptions}
                />
                <div>
                  <ToggleField
                    label="Approval Status"
                    name="approvalStatus"
                    value={remarks.approvalStatus}
                    onChange={handleRemarksToggle}
                    options={["Yes", "No"]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pdf Attachment tab */}
          {activeChildTab === "pdfAttachment" && (
            <div className="pt-3 space-y-2">
              <TableWrapper>
                <TableHead headers={["#", "Document", "Preview", "Action"]} />
                <tbody>
                  {pdfRows.map((row, idx) => (
                    <TableRow
                      key={row.rowId ?? idx}
                      index={idx}
                      onRemove={() => handleRemovePdfRow(idx)}
                      disabled={pdfRows.length <= 1}
                      showPreview
                      previewDisabled={
                        !row.attachDrawingCopy &&
                        !fileInputRefs.current[row.rowId]?.files?.[0]
                      }
                      onPreview={() => {
                        const domFile = fileInputRefs.current[row.rowId]?.files?.[0] || null;
                        handlePdfPreview(row, row.attachDrawingCopy || domFile);
                      }}
                    >
                      <td className="p-2 align-top">
                        <div className="relative w-full">
                          <input
                            ref={(el) => (fileInputRefs.current[row.rowId] = el)}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-9 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              handlePdfFileChange(
                                idx,
                                e.target.files?.[0] || null,
                              );
                            }}
                          />
                          <div
                            className={`${cellInputClasses} h-9 flex items-center gap-2 pr-1`}
                          >
                            <span className="inline-flex items-center px-2 h-6 rounded bg-blue-600 text-white text-[11px] whitespace-nowrap">
                              Browse
                            </span>
                            <span
                              className={`flex-1 truncate text-xs ${
                                row.attachDrawingCopy
                                  ? "text-gray-900 dark:text-gray-100"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              {row.attachDrawingCopy
                                ? getAttachmentName(row.attachDrawingCopy)
                                : "No file chosen"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
              <p className="text-[10px] text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
              {fieldErrors.pdfAttachments && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.pdfAttachments}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Preview popup */}
        {(preview.url || preview.loading || preview.error) && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6"
            onClick={closePreview}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium truncate dark:text-white">
                  {preview.name}
                </span>
                <button
                  type="button"
                  onClick={closePreview}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2">
                {preview.loading ? (
                  <p className="py-10 text-center text-xs text-gray-500 dark:text-gray-400">
                    Loading preview...
                  </p>
                ) : preview.error ? (
                  <p className="py-10 text-center text-xs font-medium text-red-600 dark:text-red-400">
                    {preview.error}
                  </p>
                ) : preview.isImage ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="mx-auto max-w-full"
                  />
                ) : (
                  <iframe
                    src={preview.url}
                    title={preview.name}
                    className="w-full h-[65vh] sm:h-[72vh] rounded border dark:border-gray-700"
                  />
                )}
              </div>
            </div>
          </div>
        )}

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

export default EcrForm;
