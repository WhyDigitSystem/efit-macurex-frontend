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
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";

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

const PURCHASE_INDENT_SCREEN_CODE = "PIN";

/* -------------------------------------------------------------------------- */
/* Main Form */
/* -------------------------------------------------------------------------- */

const PurchaseIndentForm = ({ onBack, onSave, data }) => {
  /*
   * EXACTLY LIKE YOUR ENQUIRY FORM:
   *
   * Enquiry:
   *   <EnquiryForm data={editData} />
   *
   * Purchase Indent:
   *   <PurchaseIndentForm data={editData} />
   *
   * Therefore editId is taken from data.
   */
  const editId = data?.id;

  const ORG_ID = parseInt(localStorage.getItem("orgId"));

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

  const [loadingItemRow, setLoadingItemRow] = useState(null);

  const loadPlants = useCallback(async () => {
    try {
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

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(ORG_ID, BRANCH_ID);

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
  }, [ORG_ID, BRANCH_ID]);

  const loadEmployees = useCallback(async () => {
    try {
      const response = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      setEmployeeList(response || []);
    } catch (error) {
      console.error("Failed to load employees:", error);

      setEmployeeList([]);
    }
  }, [ORG_ID]);

  const loadItems = useCallback(async () => {
    try {
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

  useEffect(() => {
    loadPlants();
    loadDepartments();
    loadEmployees();
    loadItems();
  }, [loadPlants, loadDepartments, loadEmployees, loadItems]);

  const preparedByOptions = employeeList.map((employee) => ({
    id: employee.id,
    label: employee.employeeName,
  }));

  const byWhomOptions = preparedByOptions;

  /* ---------------------------------------------------------------------- */
  /* Generate indent number */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    /*
     * IMPORTANT:
     * Don't generate a new number during edit.
     */
    if (isEditMode) {
      return;
    }

    if (!BRANCH_ID) {
      console.warn("No branchId found in localStorage");

      return;
    }

    const generateIndentNo = async () => {
      setGeneratingDocId(true);
      setIndentNo("");

      try {
        const mappingList =
          await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            ORG_ID,
            BRANCH_ID,
          );

        const record = mappingList?.[0];

        const pinDetail = record?.documentTypeMappingDetails?.find(
          (detail) => detail.screenCode === PURCHASE_INDENT_SCREEN_CODE,
        );

        if (!pinDetail) {
          console.warn(
            `No document mapping found for ${PURCHASE_INDENT_SCREEN_CODE}`,
          );

          return;
        }

        const docId = await purchaseIndentAPI.getPurchaseIndentDocId({
          financialYear: pinDetail.finYear,

          orgId: pinDetail.orgId,

          screenCode: pinDetail.screenCode,
        });

        if (docId) {
          setIndentNo(docId);
        }
      } catch (error) {
        console.error("Failed to generate indent number:", error);
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateIndentNo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  /* ---------------------------------------------------------------------- */
  /* Load edit record */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    /*
     * EXACT SAME CONCEPT AS ENQUIRY:
     *
     * Enquiry:
     *   if (data?.id) {
     *      loadEnquiryData(data.id);
     *   }
     *
     * Purchase Indent:
     *   if (data?.id) {
     *      loadPurchaseIndentData(data.id);
     *   }
     */

    if (!data?.id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadPurchaseIndentData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        console.log("Loading Purchase Indent ID:", data.id);

        const response = await purchaseIndentAPI.getPurchaseIndentById(data.id);

        console.log("Purchase Indent edit API response:", response);

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

        console.log("Purchase Indent record used for edit:", purchaseIndent);

        setRecordId(purchaseIndent.id ?? data.id);

        /*
         * Keep the existing indent number.
         */
        setIndentNo(purchaseIndent.indentNo ?? data.indentNo ?? "");

        setHeader({
          active: purchaseIndent.active ?? true,

          approved: purchaseIndent.approved ?? false,

          belongsTo: purchaseIndent.belongsTo ?? data.belongsTo ?? "",

          branch: asId(purchaseIndent.branch ?? data.branch),

          indentDate: purchaseIndent.indentDate ?? data.indentDate ?? "",

          department: asId(purchaseIndent.department ?? data.department),

          preparedBy: asId(purchaseIndent.preparedBy ?? data.preparedBy),

          byWhom: asId(purchaseIndent.byWhom ?? data.byWhom),

          cancelRemarks:
            purchaseIndent.cancelRemarks ?? data.cancelRemarks ?? "",

          remarks: purchaseIndent.remarks ?? data.remarks ?? "",
        });

        /* -------------------------------------------------------------- */
        /* Details */
        /* -------------------------------------------------------------- */

        const detailsList = pickArray(purchaseIndent, [
          "details",
          "purchaseIndentDetails",
          "purchaseIndentDetailVOList",
          "detailsVOList",
        ]);

        const finalDetails = detailsList.length
          ? detailsList
          : findDetailRows(purchaseIndent);

        console.log("Purchase Indent detail rows:", finalDetails);

        if (finalDetails.length) {
          setDetailRows(
            finalDetails.map((detail) => ({
              item: asId(detail.item),

              itemDescription:
                detail.itemDescription ?? detail.item?.itemDescription ?? "",

              primaryUnit: asId(detail.primaryUnit),

              primaryUnitLabel:
                detail.primaryUnitLabel ??
                detail.primaryUnit?.primaryUnit ??
                "",

              purchaseUnit: asId(detail.purchaseUnit),

              purchaseUnitLabel:
                detail.purchaseUnitLabel ??
                detail.purchaseUnit?.primaryUnit ??
                "",

              qtyInPrimaryUnit: detail.qtyInPrimaryUnit ?? "",

              conversionFactor: detail.conversionFactor ?? "",

              qtyInPurchaseUnit: detail.qtyInPurchaseUnit ?? "",

              requiredDate: detail.requiredDate ?? "",

              purpose: detail.purpose ?? "",
            })),
          );
        } else {
          setDetailRows([emptyDetailRow()]);
        }

        /* -------------------------------------------------------------- */
        /* Attachments */
        /* -------------------------------------------------------------- */

        const attachments = pickArray(purchaseIndent, [
          "attachments",
          "attachmentVOList",
          "purchaseIndentAttachmentVO",
          "purchaseIndentAttachmentDTO",
        ]);

        setExistingAttachments(attachments);

        console.log("Purchase Indent attachments:", attachments);
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

  const withComputedQty = (row) => {
    const qty = parseFloat(row.qtyInPrimaryUnit);

    const factor = parseFloat(row.conversionFactor);

    return {
      ...row,

      qtyInPurchaseUnit:
        !Number.isNaN(qty) && !Number.isNaN(factor)
          ? Number((qty * factor).toFixed(4))
          : "",
    };
  };

  const handleItemSelect = async (index, itemId) => {
    setDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...emptyDetailRow(),

              item: itemId,

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

      setDetailRows((previous) =>
        previous.map((row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,

                itemDescription:
                  itemDetail.itemDescription ?? itemDetail.description ?? "",

                primaryUnit: itemDetail.primaryUnits?.id ?? "",

                primaryUnitLabel: itemDetail.primaryUnits?.primaryUnit ?? "",

                purchaseUnit: itemDetail.purchaseUnit?.id ?? "",

                purchaseUnitLabel: itemDetail.purchaseUnit?.primaryUnit ?? "",
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
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const updated = {
          ...row,
          [key]: value,
        };

        if (key === "qtyInPrimaryUnit" || key === "conversionFactor") {
          return withComputedQty(updated);
        }

        return updated;
      }),
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
        /*
         * THIS IS IMPORTANT FOR UPDATE.
         *
         * If edit:
         *   id will be sent.
         *
         * If add:
         *   id will not be sent.
         */
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

          primaryUnit: Number(row.primaryUnit),

          purchaseUnit: Number(row.purchaseUnit),

          qtyInPrimaryUnit: Number(row.qtyInPrimaryUnit) || 0,

          conversionFactor: Number(row.conversionFactor) || 0,

          qtyInPurchaseUnit: Number(row.qtyInPurchaseUnit) || 0,

          requiredDate: row.requiredDate,

          purpose: row.purpose,
        })),
      };

      console.log(
        isEditMode ? "Updating Purchase Indent:" : "Creating Purchase Indent:",
        payload,
      );

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

      console.log("Save/Update response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        /*
         * Return to list after successful save/update.
         */
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

            <Field
              label="Indent No"
              name="indentNo"
              value={generatingDocId ? "Generating..." : indentNo}
              onChange={() => {}}
              disabled
            />

            <Field
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
            />

            <Field
              type="date"
              label="Indent Date"
              name="indentDate"
              value={header.indentDate}
              onChange={handleHeaderChange}
              error={fieldErrors.indentDate}
              required
            />

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

            <Field
              type="select"
              label="By Whom"
              name="byWhom"
              value={header.byWhom}
              onChange={handleHeaderChange}
              options={byWhomOptions}
            />

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

                    <td className="p-1 align-top">
                      <input
                        value={row.primaryUnitLabel}
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

                    <td className="p-1 align-top">
                      <input
                        value={row.purchaseUnitLabel}
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

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

                    <td className="p-1 align-top">
                      <input
                        type="number"
                        value={row.conversionFactor}
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

                    <td className="p-1 align-top">
                      <input
                        type="number"
                        value={row.qtyInPurchaseUnit}
                        readOnly
                        className={`${cellInputClasses} bg-gray-100 dark:bg-gray-800`}
                      />
                    </td>

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
