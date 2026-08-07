import {
  ArrowLeft,
  Save,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import drawingAttachmentAPI from "../../../api/PPC/drawingAttachmentAPI";
import { itemAPI } from "../../../api/itemAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "application/zip",
  "application/x-rar-compressed",
  "text/plain",
];

const SUPPORTED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "zip",
  "rar",
  "txt",
];

const isSupportedFile = (file) => {
  if (!file) return false;
  if (SUPPORTED_FILE_TYPES.includes(file.type)) return true;
  const ext = file.name?.split(".")?.pop()?.toLowerCase();
  return SUPPORTED_FILE_EXTENSIONS.includes(ext);
};

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
  placeholder,
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
          <option value="">Select {label}</option>
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
        placeholder={placeholder}
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
/* Table helpers + drag-and-drop file cell                                      */

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
          className={`p-1 whitespace-nowrap ${
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

const FileUploadCell = ({ file, existingFileName, error, onFileChange }) => {
  const [dragOver, setDragOver] = useState(false);

  const pickFile = (selected) => {
    if (!selected) return;
    if (!isSupportedFile(selected)) {
      onFileChange({ file: null, valid: false });
      return;
    }
    onFileChange({ file: selected, valid: true });
  };

  return (
    <td className="p-1 align-top min-w-[320px]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0] || null);
        }}
        onClick={() => document.getElementById("drawing-file-input")?.click()}
        className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-3 py-2 cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
      >
        <Upload className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          Drag & drop or click to upload
        </span>

        <input
          id="drawing-file-input"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
      </div>

      {(file?.name || existingFileName) && (
        <span
          title={file?.name || existingFileName}
          className="inline-block truncate min-w-0 max-w-[280px] text-xs text-gray-700 dark:text-gray-200 mt-1"
        >
          {file?.name || existingFileName}
        </span>
      )}

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
    </td>
  );
};

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  typeOfItem: "",
  fgPartNo: "",
  fgPartDescription: "",
});

const emptyAttachmentRow = () => ({
  file: null,
  existingFileName: "",
});

/* ---------------------------------------------------------------------------- */

const DrawingAttachmentForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  /* ---------------- Lookup options ---------------- */
  const [typeOfItemOptions, setTypeOfItemOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => ({
    ...emptyHeader(),
    ...data?.header,
  }));

  const [attachmentRows, setAttachmentRows] = useState(() =>
    data?.attachments?.length
      ? data.attachments.map((d) => ({
          ...emptyAttachmentRow(),
          existingFileName: d.fileName || d.attachDrawingCopy || "",
        }))
      : [emptyAttachmentRow()],
  );

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

    const loadItemTypes = async () => {
      try {
        const res = await listOfValuesAPI.getListValuesGroup("ITEM TYPE", orgId);
        if (Array.isArray(res) && res.length) {
          setTypeOfItemOptions(
            res.map((v) => ({
              value: v.id,
              label: v.valuesDescription || v.valueDescription || "",
            })),
          );
        }
      } catch {
        setTypeOfItemOptions([]);
      }
    };

    const loadItems = async () => {
      try {
        const res = await itemAPI.getItems(orgId, branch);
        const map = {};
        const opts = (res || []).map((it) => {
          const code = it.itemCode || it.code || it.id?.toString() || "";
          map[code] = it;
          return { value: code, label: code };
        });
        setItemOptions(opts);
        setItemMap(map);
      } catch {
        setItemOptions([]);
        setItemMap({});
      }
    };

    Promise.all([loadItemTypes(), loadItems()]);
  }, [orgId, branch]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));

    if (name === "fgPartNo") {
      const item = itemMap[value];
      setHeader((prev) => ({
        ...prev,
        fgPartNo: value,
        fgPartDescription: item?.itemDescription || prev.fgPartDescription,
      }));
    }
  };

  /* ---------------- Attachment row handlers ---------------- */

  const handleFileChange = (idx, { file, valid }) => {
    setTableError("");
    setAttachmentRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        if (!valid) {
          return { ...row, file, error: "Unsupported file type" };
        }
        return { ...row, file, existingFileName: "", error: "" };
      }),
    );
  };

  const handleAddRow = () => {
    setAttachmentRows((prev) => [...prev, emptyAttachmentRow()]);
    setTableError("");
  };
  const handleRemoveRow = (idx) =>
    setAttachmentRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.typeOfItem) errors.typeOfItem = "Type of Item is required";
    if (!header.fgPartNo?.trim()) errors.fgPartNo = "FG Part No is required";

    setFieldErrors(errors);

    const validRows = attachmentRows.every(
      (r) => r.file || r.existingFileName,
    );

    if (!validRows)
      setTableError(
        "Attach a drawing copy for every row in the Attached Drawing section",
      );
    else setTableError("");

    return Object.keys(errors).length === 0 && validRows;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + attachment records.
    // The backend stores each drawing copy, links them to the FG part and keeps
    // the complete attachment history for audit (server-side validation).
    const attachments = attachmentRows
      .filter((r) => r.file || r.existingFileName)
      .map((r, i) => ({
        sno: i + 1,
        fileName: r.file?.name || r.existingFileName,
        fileType: r.file?.type || "",
        fileSize: r.file?.size || 0,
      }));

    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      header,
      attachments,
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await drawingAttachmentAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Drawing Attachment updated successfully!"
              : "Drawing Attachment created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Drawing Attachment.",
        );
      }
    } catch (err) {
      console.error("Save Drawing Attachment Error:", err);
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
          {data ? "Edit Drawing Attachment" : "Add Drawing Attachment"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Drawing Attachment Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Type of Item"
              name="typeOfItem"
              value={header.typeOfItem}
              onChange={handleHeaderChange}
              error={fieldErrors.typeOfItem}
              options={typeOfItemOptions}
              required
            />
            <Field
              type="select"
              label="FG Part No"
              name="fgPartNo"
              value={header.fgPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.fgPartNo}
              options={itemOptions}
              required
            />
            <Field
              label="FG Part Description"
              name="fgPartDescription"
              value={header.fgPartDescription}
              onChange={handleHeaderChange}
              disabled
            />
          </div>
        </div>

        {/* ---------------- Collapsible Attachment Section ---------------- */}
        <section className="bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5">
            <button
              type="button"
              onClick={() => setPanelOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200"
            >
              {panelOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              Attached Drawing
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Plus size={12} />
            </button>
          </div>

          {panelOpen && (
            <div className="pt-2">
              {tableError && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
                  {tableError}
                </p>
              )}

              <TableWrapper>
                <TableHead headers={["#", "Attach Drawing Copy *", "Action"]} />
                <tbody>
                  {attachmentRows.map((row, idx) => (
                    <TableRow
                      key={idx}
                      index={idx}
                      onRemove={() => handleRemoveRow(idx)}
                      disabled={attachmentRows.length <= 1}
                    >
                      <FileUploadCell
                        file={row.file}
                        existingFileName={row.existingFileName}
                        error={row.error}
                        onFileChange={(val) => handleFileChange(idx, val)}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>

              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, PNG, JPG,
                GIF, WEBP, BMP, SVG, ZIP, RAR, TXT
              </p>
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

export default DrawingAttachmentForm;