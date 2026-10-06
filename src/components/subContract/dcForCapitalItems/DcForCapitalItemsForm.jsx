import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import dcForCapitalItemsAPI from "../../../api/dcForCapitalItemsAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
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

const cellTextareaClasses =
  "w-full h-8 px-2 py-[10px] rounded border text-xs leading-none transition-colors overflow-y-auto resize-none scrollbar-hide " +
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
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
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
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
          }`}
      >
        <Trash2 size={12} />
      </button>
    </td>
  </tr>
);

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
                    readOnly={col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      col.readOnly ? cellReadOnlyClasses : cellTextareaClasses
                    }
                  />
                </td>
              );
            }

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : "text"}
                  value={row[col.key] ?? ""}
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
/* Static options                                                              */

const YES_NO = ["Yes", "No"];
const APPROVAL_STATUS = ["Pending", "Approved", "Rejected"];

const CHILD_TABS = [
  { key: "outGoingItem", label: "Out Going Item", kind: "table" },
  { key: "contractingSummary", label: "Contracting Summary", kind: "fields" },
];

const emptyOutGoingItemRow = () => ({
  outgoingItemCode: "",
  outgoingItemDescription: "",
  stock: "",
  unit: "",
  unitId: "",
  fromLocation: "",
  availableStock: "",
  issueQty: "",
  unitRate: "",
  amount: "",
  remarks: "",
});

const emptySummary = () => ({
  summaryNotes: "",
  approvalStatus: "",
  additionalComments: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toNum = (n) => (Number.isNaN(Number(n)) ? 0 : Number(n));
const toInt = (n) => {
  const parsed = parseInt(n, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Extract a numeric id from either a nested object or a primitive
const idOf = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return v.id ?? "";
  return v;
};

// Extract employeeId from either a nested object or a primitive
const empIdOf = (v) => {
  if (v == null) return "";
  if (typeof v === "object") return v.employeeId ?? v.id ?? "";
  return v;
};

/* ---------------------------------------------------------------------------- */

const DcForCapitalItemsForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const financialYear = String(new Date().getFullYear());
  const isEditMode = Boolean(data?.id);

  const [activeChildTab, setActiveChildTab] = useState("outGoingItem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  // Guard so docId is only fetched once per mount for new records
  const docIdFetchedRef = useRef(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [indentOptions, setIndentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [dcTypeOptions, setDcTypeOptions] = useState([]);

  /* ------------------------------------------------------------------
   * Header state — starts EMPTY.
   * Edit-mode values are filled by the useEffect([data]) below.
   * ---------------------------------------------------------------- */
  const [header, setHeader] = useState({
    plantId: "",
    dcCiNo: "",
    scDcDate: todayStr(),
    belongsTo: "",
    department: "",
    vendorId: "",
    vendorName: "",
    partyLocation: "",
    indentNo: "",
    transportName: "",
    vehicleNo: "",
    dcType: "",
    approvalByStores: "Yes",
    preparedBy: "",
    approvedBy: "",
    remarks: "",
    cancelRemarks: "",
    active: true,
  });

  const [outGoingItemRows, setOutGoingItemRows] = useState([
    emptyOutGoingItemRow(),
  ]);

  const [summary, setSummary] = useState(emptySummary());

  /* ===================================================================
   * Lookup loaders
   * =================================================================== */

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
      const list =
        await dcForCapitalItemsAPI.getCustomerForSupplierRateContract(
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
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
    }
  }, [orgId, branch]);

  const loadIndents = useCallback(async () => {
    try {
      const list = await dcForCapitalItemsAPI.getPurchaseIndentByOrgId(
        branch,
        orgId,
      );
      setIndentOptions(
        (list || []).map((pi) => {
          const no = pi.docId || String(pi.id);
          return { value: no, label: no };
        }),
      );
    } catch (error) {
      console.error("Failed to load indent options:", error);
      setIndentOptions([]);
    }
  }, [orgId, branch]);

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

  const loadItems = useCallback(async () => {
    try {
      const list = await dcForCapitalItemsAPI.getItemDetailsForSalesReturn(
        branch,
        orgId,
      );
      const map = {};
      const options = (list || []).map((it) => {
        map[it.itemId] = it;
        return { value: it.itemId, label: it.itemCode };
      });
      setItemOptions(options);
      setItemMasterMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || `Employee ${e.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const list = await dcForCapitalItemsAPI.getListValuesGroup(
        "BELONGS TO",
        orgId,
      );
      setBelongsToOptions(
        list.map((item) => {
          const v =
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "";
          return { value: v, label: v };
        }),
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
        list.map((department) => ({
          value: department.id,
          label:
            department.departmentName ||
            department.name ||
            `Dept ${department.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
    }
  }, [orgId]);

  const loadDcTypes = useCallback(async () => {
    try {
      const list = await dcForCapitalItemsAPI.getListValuesGroup(
        "D.C.TYPE",
        orgId,
      );
      setDcTypeOptions(
        list.map((item) => {
          const v =
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "";
          return { value: v, label: v };
        }),
      );
    } catch (error) {
      console.error("Failed to load D.C Type values:", error);
      setDcTypeOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadPlants();
  }, [orgId, loadPlants]);

  useEffect(() => {
    if (orgId && branch) {
      loadVendors();
      loadLocations();
      loadItems();
      loadIndents();
    }
  }, [orgId, branch, loadVendors, loadLocations, loadItems, loadIndents]);

  useEffect(() => {
    if (orgId) {
      loadEmployees();
      loadBelongsTo();
      loadDepartments();
      loadDcTypes();
    }
  }, [orgId, loadEmployees, loadBelongsTo, loadDepartments, loadDcTypes]);

  /* ===================================================================
   * Auto-generated DC CI No (create mode only)
   * =================================================================== */
  useEffect(() => {
    if (isEditMode || !orgId) return;
    if (docIdFetchedRef.current) return;

    docIdFetchedRef.current = true;
    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);
      try {
        const docId =
          await dcForCapitalItemsAPI.getDeliveryChallanCapitalItemsDocId(
            financialYear,
            orgId,
          );
        if (!cancelled) {
          setHeader((prev) => ({ ...prev, dcCiNo: docId || "" }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating DC CI No:", error);
          addToast("Failed to generate DC CI No", "error");
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

  /* ===================================================================
   * Populate the form when editing.
   * Handles BOTH raw API shape AND normalized list-row shape.
   * =================================================================== */
  useEffect(() => {
    if (!data?.id) return;

    /* ---------------- Header ---------------- */
    setHeader({
      // Plant — normalized `plantId` OR raw `branch.id`
      plantId: data.plantId ?? idOf(data.branch) ?? "",

      // Doc id / date — normalized OR raw
      dcCiNo: data.dcCiNo || data.docId || "",
      scDcDate: data.scDcDate || data.docDate || todayStr(),

      belongsTo: data.belongsTo || "",

      // Department — normalized `departmentId` OR raw `department.id`
      department: data.departmentId ?? idOf(data.department) ?? "",

      // Vendor — normalized `vendorId` OR raw `vendor.id`
      vendorId: data.vendorId ?? idOf(data.vendor) ?? "",
      vendorName: data.vendorName || data.vendor?.customerName || "",

      // Party location — normalized `partyLocation` OR raw `customerLocation.id`
      partyLocation: data.partyLocation ?? idOf(data.customerLocation) ?? "",

      indentNo: data.indentNo || "",
      transportName: data.transportName || "",
      vehicleNo: data.vehicleNo || "",
      dcType: data.dcType || "",
      approvalByStores: data.approvalByStores || "Yes",

      // Employees — normalized id OR raw `preparedBy.employeeId`
      preparedBy: empIdOf(data.preparedBy),
      approvedBy: empIdOf(data.approvedBy),

      remarks: data.remarks || "",
      cancelRemarks: data.cancelRemarks || "",
      active:
        data.active === true ||
        data.active === "Active" ||
        data.active === undefined,
    });

    /* ---------------- Item rows ---------------- */
    const detailsSrc = Array.isArray(data.details)
      ? data.details
      : Array.isArray(data.outGoingItems)
        ? data.outGoingItems
        : [];

    if (detailsSrc.length > 0) {
      setOutGoingItemRows(
        detailsSrc.map((d) => {
          const outgoing = d.outgoingItem || {};
          const unitObj = d.unit || outgoing.unit || {};

          return {
            // Select value → numeric item id
            outgoingItemCode: d.outgoingItemCode ?? idOf(outgoing) ?? "",
            outgoingItemDescription:
              d.outgoingItemDescription || outgoing.itemDescription || "",
            stock: d.stock ?? "",
            // Display string (e.g. "KG")
            unit:
              (typeof d.unit === "object" ? d.unit.unitId : d.unit) ||
              unitObj.unitId ||
              "",
            // Numeric id for the payload
            unitId: d.unitId ?? idOf(unitObj) ?? "",
            // Select value → numeric location id
            fromLocation: d.fromLocation ?? idOf(d.fromLocation) ?? "",
            availableStock: d.availableStock ?? "",
            issueQty: d.issueQty ?? "",
            unitRate: d.unitRate ?? "",
            amount: d.amount ?? "",
            remarks: d.remarks || "",
          };
        }),
      );
    } else {
      setOutGoingItemRows([emptyOutGoingItemRow()]);
    }

    /* ---------------- Summary ---------------- */
    if (data.summary) {
      setSummary({
        summaryNotes: data.summary.summaryNotes || "",
        approvalStatus: data.summary.approvalStatus || "",
        additionalComments: data.summary.additionalComments || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ===================================================================
   * Handlers
   * =================================================================== */

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
      }
      return next;
    });
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleCellChange = (idx, key, value) => {
    setOutGoingItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };

        if (key === "outgoingItemCode") {
          const item = itemMasterMap[value];
          next = {
            ...next,
            outgoingItemDescription: item?.itemDescription || "",
            unit: item?.unitCode || "",
            unitId: item?.unitId ?? "",
          };
        }

        if (key === "issueQty" || key === "unitRate") {
          const qty = toNum(next.issueQty);
          const rate = toNum(next.unitRate);
          next.amount = (qty * rate).toFixed(2);
        }

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setOutGoingItemRows((prev) => [...prev, emptyOutGoingItemRow()]);

  const handleRemoveRow = (idx) =>
    setOutGoingItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  /* ===================================================================
   * Validation & Save
   * =================================================================== */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.dcCiNo?.trim()) errors.dcCiNo = "DC CI No is required";
    if (!header.scDcDate) errors.scDcDate = "SC DC Date is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.vendorName?.trim())
      errors.vendorName = "Vendor Name is required";
    if (!header.partyLocation)
      errors.partyLocation = "Party Location is required";
    if (!header.indentNo) errors.indentNo = "Indent No is required";
    if (!header.dcType) errors.dcType = "D.C Type is required";
    if (!header.approvalByStores)
      errors.approvalByStores = "Approval By Stores is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!header.approvedBy) errors.approvedBy = "Approved By is required";

    const hasValidRow = outGoingItemRows.some(
      (r) =>
        r.outgoingItemCode &&
        r.unit &&
        r.fromLocation &&
        toNum(r.issueQty) > 0 &&
        toNum(r.unitRate) > 0,
    );

    if (!hasValidRow) {
      errors.outGoingItems =
        "Add at least one item with Item Code, From Location, Issue Qty and Unit Rate greater than 0";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast(Object.values(errors)[0], "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const isUpdate = Boolean(data?.id);

    const details = outGoingItemRows
      .filter((r) => r.outgoingItemCode)
      .map((r) => ({
        amount: toNum(r.amount),
        availableStock: toNum(r.availableStock),
        fromLocation: toInt(r.fromLocation),
        issueQty: toNum(r.issueQty),
        outgoingItem: toInt(r.outgoingItemCode),
        remarks: r.remarks || "",
        stock: toNum(r.stock),
        unit: toInt(r.unitId),
        unitRate: toNum(r.unitRate),
      }));

    const payload = {
      ...(isUpdate && data?.id ? { id: data.id } : {}),
      active: header.active,
      approvalByStores: header.approvalByStores || "",
      approvedBy: toInt(header.approvedBy),
      belongsTo: header.belongsTo || "",
      branch: toInt(branch),
      cancelRemarks: header.cancelRemarks || "",
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId") || "SYSTEM"
        : localStorage.getItem("usersId") || "SYSTEM",
      customerLocation: toInt(header.partyLocation),
      dcType: header.dcType || "",
      department: toInt(header.department),
      details,
      financialYear,
      indentNo: header.indentNo || "",
      orgId: toInt(orgId),
      preparedBy: toInt(header.preparedBy),
      remarks: header.remarks || "",
      transportName: header.transportName || "",
      vehicleNo: header.vehicleNo || "",
      vendor: toInt(header.vendorId),
    };

    console.log("Saving DC Capital Items Payload:", payload);

    try {
      const response =
        await dcForCapitalItemsAPI.createUpdateDeliveryChallanCapitalItems(
          payload,
        );

      const success =
        response?.status === true ||
        String(response?.status).toLowerCase() === "true";

      if (success) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "DC For Capital Items updated successfully!"
            : "DC For Capital Items created successfully!"),
          "success",
        );
        onBack?.();
        return;
      }

      addToast(
        response?.errors?.[0]?.shortMessage ||
        response?.errors?.[0]?.longMessage ||
        response?.statusMessage ||
        response?.message ||
        "Failed to save DC For Capital Items.",
        "error",
      );
    } catch (err) {
      console.error("Save DC Capital Items Error:", err);
      const errorData = err?.response?.data;
      addToast(
        errorData?.errors?.[0]?.shortMessage ||
        errorData?.errors?.[0]?.longMessage ||
        errorData?.message ||
        errorData?.statusMessage ||
        errorData?.error ||
        (typeof errorData === "string"
          ? errorData
          : "Something went wrong while saving DC For Capital Items."),
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  /* ===================================================================
   * Render
   * =================================================================== */
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
          {data ? "Edit DC For Capital Items" : "Add DC For Capital Items"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>DC For Capital Items</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              label="DC CI No"
              name="dcCiNo"
              value={generatingDocId ? "Generating..." : header.dcCiNo}
              onChange={() => { }}
              error={fieldErrors.dcCiNo}
              required
              disabled
            />
            <Field
              type="date"
              label="SC. DC Date"
              name="scDcDate"
              value={header.scDcDate}
              onChange={handleHeaderChange}
              error={fieldErrors.scDcDate}
              required
              disabled
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              error={fieldErrors.belongsTo}
              options={belongsToOptions}
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
              label="Party Location"
              name="partyLocation"
              value={header.partyLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.partyLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="Indent No"
              name="indentNo"
              value={header.indentNo}
              onChange={handleHeaderChange}
              error={fieldErrors.indentNo}
              options={indentOptions}
              required
            />
            <Field
              label="Transport Name"
              name="transportName"
              value={header.transportName}
              onChange={handleHeaderChange}
            />
            <Field
              label="Vehicle No"
              name="vehicleNo"
              value={header.vehicleNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="D.C Type"
              name="dcType"
              value={header.dcType}
              onChange={handleHeaderChange}
              error={fieldErrors.dcType}
              options={dcTypeOptions}
              required
            />
            <Field
              type="select"
              label="Approval By Stores"
              name="approvalByStores"
              value={header.approvalByStores}
              onChange={handleHeaderChange}
              error={fieldErrors.approvalByStores}
              options={YES_NO}
              required
            />
            <Field
              type="select"
              label="Prepared By"
              name="preparedBy"
              value={header.preparedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.preparedBy}
              options={employeeOptions}
              required
            />
            <Field
              type="select"
              label="Approved By"
              name="approvedBy"
              value={header.approvedBy}
              onChange={handleHeaderChange}
              error={fieldErrors.approvedBy}
              options={employeeOptions}
              required
            />
            <Field
              type="textarea"
              label="Remarks"
              name="remarks"
              value={header.remarks}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Child Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
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
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeChildTab === "outGoingItem" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "outgoingItemCode",
                    label: "Outgoing Item Code",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "outgoingItemDescription",
                    label: "Outgoing Item Description",
                    readOnly: true,
                  },
                  { key: "stock", label: "Stock", type: "number" },
                  {
                    key: "unit",
                    label: "Unit",
                    readOnly: true,
                  },
                  {
                    key: "fromLocation",
                    label: "From Location",
                    type: "select",
                    options: locationOptions,
                  },
                  {
                    key: "availableStock",
                    label: "Available Stock",
                    type: "number",
                  },
                  { key: "issueQty", label: "Issue Qty", type: "number" },
                  { key: "unitRate", label: "Unit Rate", type: "number" },
                  { key: "amount", label: "Amount", readOnly: true },
                  {
                    key: "remarks",
                    label: "Remarks",
                    type: "textarea",
                  },
                ]}
                rows={outGoingItemRows}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />
              {fieldErrors.outGoingItems && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.outGoingItems}
                </p>
              )}
            </div>
          )}

          {activeChildTab === "contractingSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="textarea"
                  label="Summary Notes"
                  name="summaryNotes"
                  value={summary.summaryNotes}
                  onChange={handleSummaryChange}
                />
                <Field
                  type="select"
                  label="Approval Status"
                  name="approvalStatus"
                  value={summary.approvalStatus}
                  onChange={handleSummaryChange}
                  options={APPROVAL_STATUS}
                />
                <Field
                  type="textarea"
                  label="Additional Comments"
                  name="additionalComments"
                  value={summary.additionalComments}
                  onChange={handleSummaryChange}
                />
              </div>
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

export default DcForCapitalItemsForm;