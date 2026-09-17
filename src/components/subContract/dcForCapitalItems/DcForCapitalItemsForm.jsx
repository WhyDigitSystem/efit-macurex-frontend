import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
        className={`h-6 w-6 rounded text-white flex items-center justify-center ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <Trash2 size={12} />
      </button>
    </td>
  </tr>
);

/* Generic dynamic table. Supports text / number / textarea / select /
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
/* Static options (only ones that truly have no backend source)                */

const YES_NO = ["Yes", "No"];
const APPROVAL_STATUS = ["Pending", "Approved", "Rejected"];

const CHILD_TABS = [
  { key: "outGoingItem", label: "Out Going Item", kind: "table" },
  { key: "contractingSummary", label: "Contracting Summary", kind: "fields" },
];

const emptyOutGoingItemRow = () => ({
  outgoingItemCode: "", // holds the item's numeric id (select value); itemCode is shown as the label
  outgoingItemDescription: "",
  stock: "",
  unit: "", // display-only unit code text, e.g. "KG"
  unitId: "", // numeric unit id sent to the backend as "unit"
  fromLocation: "", // numeric location id
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

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    dcCiNo: data?.dcCiNo || "",
    scDcDate: data?.scDcDate || todayStr(),
    belongsTo: data?.belongsTo || "",
    department: data?.department || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    partyLocation: data?.partyLocation || "",
    indentNo: data?.indentNo || "",
    transportName: data?.transportName || "",
    vehicleNo: data?.vehicleNo || "",
    dcType: data?.dcType || "",
    approvalByStores: data?.approvalByStores || "Yes",
    preparedBy: data?.preparedBy || "",
    approvedBy: data?.approvedBy || "",
    remarks: data?.remarks || "",
    cancelRemarks: data?.cancelRemarks || "",
    active: data?.active !== false,
  }));

  const [outGoingItemRows, setOutGoingItemRows] = useState(
    data?.outGoingItems?.length ? data.outGoingItems : [emptyOutGoingItemRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });

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

  // Vendor Id shows customerCode; Vendor Name is auto-filled from customerName.
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

  // Indent No dropdown, using docId as the visible/selected value.
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

  // "customerLocation" (Party Location) and "fromLocation" in the item table
  // both need the numeric location id in the payload, so id is the value and
  // the location name is just the label shown to the user.
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

  // Outgoing Item Code / Description / Unit all come from this one API.
  // "outgoingItem" in the payload needs the numeric item id, so that's the
  // select value; itemCode is shown as the label.
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

  // "preparedBy" / "approvedBy" need the numeric employee id in the payload.
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

  /* ---------------- Auto-generated DC CI No ---------------- */

  useEffect(() => {
    if (isEditMode || !orgId) return;

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

  /* ---------------- Handlers ---------------- */

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

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) {
      errors.plantId = "Plant is required";
    }

    if (!header.dcCiNo?.trim()) {
      errors.dcCiNo = "DC CI No is required";
    }

    if (!header.scDcDate) {
      errors.scDcDate = "SC DC Date is required";
    }

    if (!header.belongsTo) {
      errors.belongsTo = "Belongs To is required";
    }

    if (!header.department) {
      errors.department = "Department is required";
    }

    if (!header.vendorId) {
      errors.vendorId = "Vendor Id is required";
    }

    if (!header.vendorName?.trim()) {
      errors.vendorName = "Vendor Name is required";
    }

    if (!header.partyLocation) {
      errors.partyLocation = "Party Location is required";
    }

    if (!header.indentNo) {
      errors.indentNo = "Indent No is required";
    }

    if (!header.dcType) {
      errors.dcType = "D.C Type is required";
    }

    if (!header.approvalByStores) {
      errors.approvalByStores = "Approval By Stores is required";
    }

    if (!header.preparedBy) {
      errors.preparedBy = "Prepared By is required";
    }

    if (!header.approvedBy) {
      errors.approvedBy = "Approved By is required";
    }

    // Validate item rows
    const hasValidRow = outGoingItemRows.some((r) => {
      return (
        r.outgoingItemCode &&
        r.unit &&
        r.fromLocation &&
        toNum(r.issueQty) > 0 &&
        toNum(r.unitRate) > 0
      );
    });

    if (!hasValidRow) {
      errors.outGoingItems =
        "Add at least one item with Item Code, From Location, Issue Qty and Unit Rate greater than 0";
    }

    setFieldErrors(errors);

    // IMPORTANT:
    // Show the validation error immediately instead of making it
    // look like Save is doing nothing.
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      addToast(firstError, "error");

      console.log("DC Capital Items Validation Errors:", errors);
      console.log("Current Header:", header);
      console.log("Current Item Rows:", outGoingItemRows);

      return false;
    }

    return true;
  };

  const handleSave = async () => {
    console.log("========== DC CAPITAL ITEMS SAVE CLICKED ==========");

    console.log("orgId:", orgId);
    console.log("branch:", branch);
    console.log("header:", header);
    console.log("outGoingItemRows:", outGoingItemRows);

    // Stop if validation fails
    const isValid = validate();

    console.log("Validation result:", isValid);

    if (!isValid) {
      console.log("SAVE STOPPED BECAUSE VALIDATION FAILED");
      return;
    }

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

    console.log("========== FINAL DC CAPITAL ITEMS PAYLOAD ==========");

    console.log(JSON.stringify(payload, null, 2));

    try {
      const response =
        await dcForCapitalItemsAPI.createUpdateDeliveryChallanCapitalItems(
          payload,
        );

      console.log("========== DC CAPITAL ITEMS API RESPONSE ==========");

      console.log(response);

      if (response?.status === true) {
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

      // Some APIs return status as a string
      if (String(response?.status).toLowerCase() === "true") {
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

      console.error("API returned unsuccessful response:", response);

      addToast(
        response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.statusMessage ||
          response?.message ||
          "Failed to save DC For Capital Items.",
        "error",
      );
    } catch (err) {
      console.error("========== DC CAPITAL ITEMS SAVE ERROR ==========");

      console.error(err);

      console.error("Response:", err?.response);
      console.error("Response data:", err?.response?.data);
      console.error("Response status:", err?.response?.status);

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
        {/* ---------------- Header Info ---------------- */}
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
              onChange={() => {}}
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
                onClick={handleAddRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Out Going Item tab */}
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

          {/* Contracting Summary tab */}
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
