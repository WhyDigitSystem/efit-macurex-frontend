import { ArrowLeft, Save, X, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import subContractingDCAPI from "../../../api/SubContract/subContractingDCAPI";
import subContractSupplyScheduleAPI from "../../../api/SubContract/subContractSupplyScheduleAPI";

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

/* Generic dynamic table. Supports text / number / date / select / readonly
   columns. Options may be plain strings or { value, label } objects. */
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
                    value={row[col.key] || ""}
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

            return (
              <td className="p-2 align-top" key={col.key}>
                <input
                  type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                  value={row[col.key] || ""}
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
/* Constants                                                                    */

const CHILD_TABS = [
  { key: "scheduleItemDetails", label: "Schedule Item Details", kind: "table" },
  { key: "subSupplySummary", label: "Sub Supply Summary", kind: "fields" },
];

const emptyItemRow = () => ({
  itemCode: "",  // Keep as empty string initially, but will be converted to number on save
  itemDescription: "",
  primaryUnit: "",
  primaryUnitId: "",
  stock: "",
  qty: "",
  rate: "",
  scheduleRows: [],
});

const emptySummary = () => ({
  preparedBy: "",
  authorizedBy: "",
  remarks: "",
});

const emptyScheduleRow = () => ({
  planDate: "",
  scheduleQty: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* ---------------------------------------------------------------------------- */

const SubContractSupplyScheduleForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("scheduleItemDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [tempScheduleRows, setTempScheduleRows] = useState([]);
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [partyMap, setPartyMap] = useState({});
  const [contractOptions, setContractOptions] = useState([]);
  const [contractMap, setContractMap] = useState({});
  const [jobOrderOptions, setJobOrderOptions] = useState([]);
  const [jobOrderMap, setJobOrderMap] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // New state for LOV
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    docNo: data?.docNo || "",
    docDate: data?.docDate || todayStr(),
    belongsTo: data?.belongsTo || "",
    department: data?.department || "",
    schStartDate: data?.schStartDate || "",
    schEndDate: data?.schEndDate || "",
    partyId: data?.partyId || "",
    partyName: data?.partyName || "",
    contractNo: data?.contractNo || "",
    contractDate: data?.contractDate || "",
    jobOrderNo: data?.jobOrderNo || "",
    date: data?.date || "",
    active: data?.active !== false,
  }));

  const [itemRows, setItemRows] = useState(
    data?.scheduleItemDetails?.length
      ? data.scheduleItemDetails
      : [emptyItemRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });
  const [scheduleRows, setScheduleRows] = useState(
    data?.schedule?.length ? data.schedule : [emptyScheduleRow()],
  );

  // Transform API response data to form structure when editing
  const transformApiDataToForm = useCallback((apiData) => {
    if (!apiData) return;

    // Set header fields
    setHeader({
      plantId: apiData.branch?.id || apiData.plantId || "",
      docNo: apiData.docId || apiData.docNo || "",
      docDate: apiData.docDate || todayStr(),
      belongsTo: apiData.belongsTo || "",
      department: apiData.department?.id || apiData.department || "",
      schStartDate: apiData.schStartDate || "",
      schEndDate: apiData.schEndDate || "",
      partyId: apiData.customer?.customerId || apiData.partyId || "",
      partyName: apiData.customer?.customerName || apiData.partyName || "",
      contractNo: apiData.contractNo || "",
      contractDate: apiData.contractDate || "",
      jobOrderNo: apiData.jobOrderNo || "",
      date: apiData.date || "",
      active: apiData.active !== "Inactive",
    });

    // Set summary fields
    setSummary({
      preparedBy: apiData.preparedBy?.id || apiData.preparedBy || "",
      authorizedBy: apiData.authorisedBy?.id || apiData.authorisedBy || "",
      remarks: apiData.remarks || "",
    });

    // Set item rows
    if (apiData.itemDetails && apiData.itemDetails.length > 0) {
      const items = apiData.itemDetails.map((item) => ({
        id: item.id,
        itemCode: item.itemCode?.id || item.item || "", // This will be the ID number
        itemDescription: item.itemCode?.itemDescription || "",
        primaryUnit: item.itemCode?.unit?.unitId || item.unit || "",
        primaryUnitId: item.itemCode?.unit?.id || item.unit || "",
        stock: item.stock || "",
        qty: item.qty || "",
        rate: item.rate || "",
        scheduleRows: item.scheduleDetails?.map((schedule) => ({
          id: schedule.id,
          planDate: schedule.planDate || "",
          scheduleQty: schedule.scheduleQty || "",
        })) || [],
      }));
      setItemRows(items);
    }

    // Set schedule rows (if there's a separate schedule section)
    if (apiData.schedule && apiData.schedule.length > 0) {
      setScheduleRows(apiData.schedule);
    }
  }, []);

  /* ---------------- Generate Document ID ---------------- */

  const generateDocId = useCallback(async () => {
    // Don't generate if editing
    if (data?.id) return;

    setGeneratingDocId(true);
    setHeader((prev) => ({ ...prev, docNo: "" }));

    try {
      const financialYear = new Date().getFullYear().toString();
      const response = await subContractSupplyScheduleAPI.getSubContractSupplyScheduleDocId(
        financialYear,
        orgId
      );
      console.log("Document ID Response:", response);

      const docId = response?.paramObjectsMap?.subContractSupplyScheduleDocId || "";
      if (docId) {
        setHeader((prev) => ({ ...prev, docNo: docId }));
      } else {
        addToast("Failed to generate Document ID", "error");
        // Fallback to auto-generated ID
        const fallbackId = `SCSS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
        setHeader((prev) => ({ ...prev, docNo: fallbackId }));
      }
    } catch (error) {
      console.error("Error generating document ID:", error);
      // Fallback to auto-generated ID
      const fallbackId = `SCSS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
      setHeader((prev) => ({ ...prev, docNo: fallbackId }));
      addToast("Failed to generate Document ID, using fallback", "error");
    } finally {
      setGeneratingDocId(false);
    }
  }, [data, orgId, addToast]);

  // Load edit data when data prop changes
  useEffect(() => {
    if (data?.id) {
      transformApiDataToForm(data);
    }
  }, [data, transformApiDataToForm]);

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

  // Load Vendors/Customers from the new API
  const loadParties = useCallback(async () => {
    try {
      const res = await subContractingDCAPI.getCustomersForSupplierRateContract(branch, orgId);
      console.log("Party Response:", res);

      const customerList = res?.paramObjectsMap?.customerList || [];
      const map = {};
      const options = customerList.map((c) => {
        map[c.customerId] = {
          customerId: c.customerId,
          customerName: c.customerName,
          customerCode: c.customerCode,
          address: c.address,
          gstNo: c.gstNo,
          gstState: c.gstState,
          gstType: c.gstType,
          igstApplicable: c.igstApplicable,
        };
        return {
          value: c.customerId,
          label: `${c.customerCode} - ${c.customerName}`,
        };
      });
      setPartyOptions(options);
      setPartyMap(map);
    } catch (error) {
      console.error("Failed to load party options:", error);
      setPartyOptions([]);
      setPartyMap({});
    }
  }, [orgId, branch]);

  // Load Contracts based on selected Party
  const loadContracts = useCallback(async (partyId) => {
    if (!partyId) {
      setContractOptions([]);
      setContractMap({});
      return;
    }

    try {
      const res = await subContractSupplyScheduleAPI.getSupplierRateContractforJobOrder(
        branch,
        partyId,
        orgId
      );
      console.log("Contract Response:", res);

      const contractList = res?.paramObjectsMap?.supplierRateContractDropdown || [];
      const map = {};
      const options = contractList.map((c) => {
        map[c.docId] = {
          docId: c.docId,
          docDate: c.docDate,
          jobOrderFor: c.jobOrderFor,
          taxPercentage: c.taxPercentage,
          cgstRate: c.cgstRate,
          sgstRate: c.sgstRate,
          igstRate: c.igstRate,
          serviceName: c.serviceName,
          hsnSacCode: c.hsnSacCode,
        };
        return {
          value: c.docId,
          label: c.docId,
        };
      });
      setContractOptions(options);
      setContractMap(map);
    } catch (error) {
      console.error("Failed to load contract options:", error);
      setContractOptions([]);
      setContractMap({});
    }
  }, [orgId, branch]);

  // Load Job Orders based on selected Contract
  const loadJobOrders = useCallback(async (contractNo) => {
    if (!contractNo) {
      setJobOrderOptions([]);
      setJobOrderMap({});
      return;
    }

    try {
      const res = await subContractSupplyScheduleAPI.getJobOrderNoAndDateForSubContractSupplySch(
        branch,
        contractNo,
        orgId
      );
      console.log("Job Order Response:", res);

      const jobOrderList = res?.paramObjectsMap?.jobOrderList || [];
      const map = {};
      const options = jobOrderList.map((jo) => {
        map[jo.jobOrderNo] = {
          id: jo.id,
          jobOrderNo: jo.jobOrderNo,
          jobOrderDate: jo.jobOrderDate,
        };
        return {
          value: jo.jobOrderNo,
          label: jo.jobOrderNo,
        };
      });
      setJobOrderOptions(options);
      setJobOrderMap(map);
    } catch (error) {
      console.error("Failed to load job order options:", error);
      setJobOrderOptions([]);
      setJobOrderMap({});
    }
  }, [orgId, branch]);

  // Load Items based on selected Contract
  const loadItems = useCallback(async (contractNo) => {
    if (!contractNo) {
      setItemOptions([]);
      setItemMasterMap({});
      return;
    }

    try {
      const res = await subContractSupplyScheduleAPI.getSupplierRateContractItemDetailsForJobOrder(
        branch,
        contractNo,
        orgId
      );
      console.log("Item Details Response:", res);

      const itemDetails = res?.paramObjectsMap?.supplierRateContractItemDetails || [];
      const map = {};
      const options = itemDetails.map((item) => {
        map[item.incomingItemId] = {
          id: item.id,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          unit: item.unit,
          unitId: item.unitId,
          unitDescription: item.unitDescription,
          rate: item.rate,
          incomingItemId: item.incomingItemId,
        };
        return {
          value: item.incomingItemId,
          label: item.itemCode,
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

  // Load List of Values for Belongs To
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
      console.error("Failed to load Belongs To options:", error);
      setBelongsToOptions([]);
    }
  }, [orgId]);

  // Load Departments from Department API
  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId);
      const deptList = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        deptList.map((d) => ({
          value: d.id,
          label: d.departmentCode || d.departmentName || d.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      loadPlants();
      loadBelongsTo();
      loadDepartments();
      loadParties();
      loadUnits();
    }
  }, [orgId, loadPlants, loadBelongsTo, loadDepartments, loadParties, loadUnits]);

  // Load contracts when party changes
  useEffect(() => {
    if (header.partyId) {
      loadContracts(header.partyId);
    } else {
      setContractOptions([]);
      setContractMap({});
    }
  }, [header.partyId, loadContracts]);

  // Load job orders when contract changes
  useEffect(() => {
    if (header.contractNo) {
      loadJobOrders(header.contractNo);
    } else {
      setJobOrderOptions([]);
      setJobOrderMap({});
    }
  }, [header.contractNo, loadJobOrders]);

  // Load items when contract changes
  useEffect(() => {
    if (header.contractNo) {
      loadItems(header.contractNo);
    } else {
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [header.contractNo, loadItems]);

  useEffect(() => {
    if (orgId) loadEmployees();
  }, [orgId, loadEmployees]);

  // Generate document ID on mount (only for new records)
  useEffect(() => {
    if (!data?.id && orgId) {
      generateDocId();
    }
  }, [data, orgId, generateDocId]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "partyId") {
        const party = partyMap[value];
        if (party) {
          next.partyName = party.customerName || "";
        } else {
          next.partyName = "";
        }
        // Clear contract, job order and items when party changes
        next.contractNo = "";
        next.jobOrderNo = "";
        setContractOptions([]);
        setContractMap({});
        setJobOrderOptions([]);
        setJobOrderMap({});
        setItemOptions([]);
        setItemMasterMap({});
      }

      if (name === "contractNo") {
        const contract = contractMap[value];
        if (contract) {
          next.contractDate = contract.docDate || "";
        } else {
          next.contractDate = "";
        }
        // Clear job order and items when contract changes
        next.jobOrderNo = "";
        setJobOrderOptions([]);
        setJobOrderMap({});
        setItemOptions([]);
        setItemMasterMap({});
      }

      if (name === "jobOrderNo") {
        const jobOrder = jobOrderMap[value];
        if (jobOrder) {
          console.log("Selected Job Order:", jobOrder);
        }
      }

      return next;
    });
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemCellChange = (idx, key, value) => {
    setItemRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, [key]: value };
        if (key === "itemCode") {
          const item = itemMasterMap[value];
          return {
            ...next,
            itemDescription: item?.itemDescription || "",
            primaryUnit: item?.unit || row.primaryUnit || "",
            primaryUnitId: item?.unitId || row.primaryUnitId || "",
            rate: item?.rate || row.rate || "",
            stock: row.stock || "",
          };
        }
        return next;
      }),
    );
  };

  const handleScheduleCellChange = (idx, key, value) => {
    setScheduleRows((prev) =>
      prev.map((row, i) => {
        if (i === idx) {
          const updatedRow = { ...row, [key]: value };
          const updatedRows = prev.map((r, j) => j === idx ? updatedRow : r);
          const totalScheduleQty = updatedRows.reduce((sum, r) => sum + (Number(r.scheduleQty) || 0), 0);
          const item = itemRows[currentItemIndex] || {};
          const itemQty = Number(item.qty) || 0;

          if (key === "scheduleQty" && totalScheduleQty > itemQty && itemQty > 0) {
            addToast(`Total Schedule Qty (${totalScheduleQty}) cannot exceed Item Qty (${itemQty})`, "error");
            return row;
          }
          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handleTempScheduleCellChange = (idx, key, value) => {
    const updatedRows = tempScheduleRows.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    );
    const totalScheduleQty = updatedRows.reduce((sum, r) => sum + (Number(r.scheduleQty) || 0), 0);
    const item = itemRows[currentItemIndex] || {};
    const itemQty = Number(item.qty) || 0;

    if (key === "scheduleQty" && totalScheduleQty > itemQty && itemQty > 0) {
      addToast(`Total Schedule Qty (${totalScheduleQty}) cannot exceed Item Qty (${itemQty})`, "error");
      return;
    }

    setTempScheduleRows(updatedRows);
  };

  const handleAddItemRow = () =>
    setItemRows((prev) => [...prev, emptyItemRow()]);
  const handleRemoveItemRow = (idx) =>
    setItemRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleAddScheduleRow = () =>
    setScheduleRows((prev) => [...prev, emptyScheduleRow()]);

  const handleAddTempScheduleRow = () =>
    setTempScheduleRows((prev) => [...prev, emptyScheduleRow()]);

  const handleRemoveScheduleRow = (idx) =>
    setScheduleRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const handleRemoveTempScheduleRow = (idx) =>
    setTempScheduleRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );

  const openSchedulePopup = (idx) => {
    setCurrentItemIndex(idx);
    const item = itemRows[idx];
    if (item.scheduleRows && item.scheduleRows.length > 0) {
      setTempScheduleRows([...item.scheduleRows]);
    } else {
      setTempScheduleRows([emptyScheduleRow()]);
    }
    setShowSchedulePopup(true);
  };

  const handleScheduleSubmit = () => {
    const item = itemRows[currentItemIndex] || {};
    const itemQty = Number(item.qty) || 0;

    const validRows = tempScheduleRows.filter(
      (s) => s.planDate && Number(s.scheduleQty) > 0
    );

    if (validRows.length === 0) {
      addToast("Please add at least one valid schedule entry", "error");
      return;
    }

    const totalScheduleQty = validRows.reduce((sum, r) => sum + (Number(r.scheduleQty) || 0), 0);

    if (totalScheduleQty > itemQty && itemQty > 0) {
      addToast(`Total Schedule Qty (${totalScheduleQty}) cannot exceed Item Qty (${itemQty})`, "error");
      return;
    }

    setItemRows((prev) =>
      prev.map((row, i) => {
        if (i === currentItemIndex) {
          return { ...row, scheduleRows: validRows };
        }
        return row;
      })
    );
    setShowSchedulePopup(false);
    setTempScheduleRows([]);
    addToast("Schedule added successfully!", "success");
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.schStartDate) errors.schStartDate = "Sch. Start Date is required";
    if (!header.schEndDate) errors.schEndDate = "Sch. End Date is required";
    if (!header.partyId) errors.partyId = "Party Id is required";
    if (!header.contractNo) errors.contractNo = "Contract No is required";

    if (
      header.schStartDate &&
      header.schEndDate &&
      header.schEndDate < header.schStartDate
    )
      errors.schEndDate = "Sch. End Date cannot be before Sch. Start Date";

    const hasValidItem = itemRows.some(
      (r) => r.itemCode && Number(r.qty) > 0 && Number(r.rate) > 0,
    );
    if (!hasValidItem)
      errors.scheduleItemDetails =
        "Add at least one item with an Item Code, Qty and Rate greater than 0";

    if (!summary.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!summary.authorizedBy)
      errors.authorizedBy = "Authorized By is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const usersId = localStorage.getItem("usersId") || "SYSTEM";

    // Prepare payload according to API schema
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      active: true,
      authorisedBy: Number(summary.authorizedBy) || 0,
      belongsTo: header.belongsTo || "",
      branch: Number(header.plantId) || 0,
      cancelRemarks: "",
      contractDate: header.contractDate || header.docDate || todayStr(),
      contractNo: header.contractNo || "",
      createdBy: isUpdate
        ? data?.createdBy || usersId
        : usersId,
      customer: Number(header.partyId) || 0,
      financialYear: new Date().getFullYear().toString(),
      itemDetails: itemRows
        .filter((r) => r.itemCode && Number(r.itemCode) > 0) // Check if itemCode exists and is a valid number
        .map((r) => ({
          item: Number(r.itemCode) || 0,
          qty: Number(r.qty) || 0,
          rate: Number(r.rate) || 0,
          stock: Number(r.stock) || 0,
          unit: Number(r.primaryUnitId) || 0,
          scheduleDetails: (r.scheduleRows || [])
            .filter((s) => s.planDate && Number(s.scheduleQty) > 0)
            .map((s) => ({
              planDate: s.planDate || "",
              scheduleQty: Number(s.scheduleQty) || 0,
            })),
        })),
      jobOrderNo: header.jobOrderNo || "",
      orgId: orgId,
      preparedBy: Number(summary.preparedBy) || 0,
      remarks: summary.remarks || "",
      schEndDate: header.schEndDate || "",
      schStartDate: header.schStartDate || "",
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    console.log("Saving Payload:", payload);

    try {
      const response =
        await subContractSupplyScheduleAPI.createUpdateSubContractSupplySchedule(
          payload,
        );

      console.log("API Response:", response);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Sub Contract Supply Schedule updated successfully!"
            : "Sub Contract Supply Schedule created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        const errorMessage =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Sub Contract Supply Schedule.";
        addToast(errorMessage, "error");
      }
    } catch (err) {
      console.error("Save Sub Contract Supply Schedule Error:", err);
      if (err.response?.data) {
        const errorMsg = err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
        addToast(errorMsg, "error");
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  // Custom table with Eye button
  const renderItemTableWithEye = (columns, rows, onCellChange, onRemoveRow) => (
    <TableWrapper>
      <TableHead headers={["#", ...columns.map((c) => c.label), "Schedule", "Action"]} />
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="p-2 text-center font-medium dark:text-white">{idx + 1}</td>
            {columns.map((col) => {
              if (col.type === "select") {
                return (
                  <td className="p-2 align-top" key={col.key}>
                    <select
                      value={row[col.key] || ""}
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

              if (col.key === "primaryUnit") {
                return (
                  <td className="p-2 align-top" key={col.key}>
                    <input
                      type="text"
                      value={row[col.key] || ""}
                      readOnly={true}
                      className={cellReadOnlyClasses}
                    />
                  </td>
                );
              }

              if (col.key === "stock" || col.key === "qty" || col.key === "rate") {
                return (
                  <td className="p-2 align-top" key={col.key}>
                    <input
                      type="number"
                      value={row[col.key] ?? ""}
                      readOnly={col.readOnly}
                      onChange={(e) =>
                        onCellChange(idx, col.key, e.target.value)
                      }
                      className={
                        col.readOnly
                          ? cellReadOnlyClasses
                          : cellInputClasses
                      }
                      step="any"
                      min="0"
                    />
                  </td>
                );
              }

              return (
                <td className="p-2 align-top" key={col.key}>
                  <input
                    type={col.type === "number" ? "number" : "text"}
                    value={row[col.key] || ""}
                    readOnly={col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      col.readOnly ? cellReadOnlyClasses : cellInputClasses
                    }
                  />
                </td>
              );
            })}
            <td className="p-2 text-center">
              <button
                type="button"
                onClick={() => openSchedulePopup(idx)}
                className="h-6 w-6 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                title="Add Schedule"
              >
                <Eye size={12} />
              </button>
              {row.scheduleRows && row.scheduleRows.length > 0 && (
                <span className="ml-1 text-xs text-green-600">✓</span>
              )}
            </td>
            <td className="p-2 text-center">
              <button
                type="button"
                onClick={() => onRemoveRow(idx)}
                disabled={rows.length <= 1}
                className={`h-6 w-6 rounded text-white flex items-center justify-center ${rows.length <= 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                <Trash2 size={12} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );

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
          {data?.id
            ? "Edit Sub Contract Supply Schedule"
            : "Add Sub Contract Supply Schedule"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Sub Contract Supply Schedule</SectionHeader>
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
              label="Doc No"
              name="docNo"
              value={header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
              required
              disabled={!!data?.id || generatingDocId}
              placeholder={generatingDocId ? "Generating..." : ""}
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
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
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={header.schStartDate}
              onChange={handleHeaderChange}
              error={fieldErrors.schStartDate}
              required
            />
            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={header.schEndDate}
              onChange={handleHeaderChange}
              error={fieldErrors.schEndDate}
              required
            />
            <Field
              type="select"
              label="Party Id"
              name="partyId"
              value={header.partyId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyId}
              options={partyOptions}
              required
            />
            <Field
              label="Party Name"
              name="partyName"
              value={header.partyName}
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
              label="Contract Date"
              name="contractDate"
              value={header.contractDate}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Job Order No"
              name="jobOrderNo"
              value={header.jobOrderNo}
              onChange={handleHeaderChange}
              options={jobOrderOptions}
            />
            <Field
              type="date"
              label="Date"
              name="date"
              value={header.date}
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
                onClick={handleAddItemRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Schedule Item Details tab */}
          {activeChildTab === "scheduleItemDetails" && (
            <div className="pt-3">
              {renderItemTableWithEye(
                [
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
                  {
                    key: "primaryUnit",
                    label: "Primary Unit",
                    readOnly: true,
                  },
                  {
                    key: "stock",
                    label: "Stock",
                    type: "number",
                  },
                  {
                    key: "qty",
                    label: "Qty",
                    type: "number",
                  },
                  {
                    key: "rate",
                    label: "Rate",
                    type: "number",
                    readOnly: true,
                  },
                ],
                itemRows,
                handleItemCellChange,
                handleRemoveItemRow
              )}
              {fieldErrors.scheduleItemDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.scheduleItemDetails}
                </p>
              )}
            </div>
          )}

          {/* Sub Supply Summary tab */}
          {activeChildTab === "subSupplySummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={summary.preparedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.preparedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="select"
                  label="Authorized By"
                  name="authorizedBy"
                  value={summary.authorizedBy}
                  onChange={handleSummaryChange}
                  error={fieldErrors.authorizedBy}
                  options={employeeOptions}
                  required
                />
                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={summary.remarks}
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
          saveLabel={data?.id ? "Update" : "Save"}
        />
      </div>

      {/* Schedule Popup Modal */}
      {showSchedulePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Schedule Section
              </h3>
              <button
                onClick={() => setShowSchedulePopup(false)}
                className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Add Schedule Entries
                </span>
                <button
                  type="button"
                  onClick={handleAddTempScheduleRow}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-max text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 w-8 text-center dark:text-white">#</th>
                      <th className="p-2 text-left dark:text-white">Plan Date</th>
                      <th className="p-2 text-left dark:text-white">Schedule Qty</th>
                      <th className="p-2 w-20 text-center dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempScheduleRows.map((row, idx) => (
                      <tr key={idx} className="border-t dark:border-gray-700">
                        <td className="p-2 text-center font-medium dark:text-white">{idx + 1}</td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={row.planDate || ""}
                            onChange={(e) => handleTempScheduleCellChange(idx, "planDate", e.target.value)}
                            className={cellInputClasses}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.scheduleQty || ""}
                            onChange={(e) => handleTempScheduleCellChange(idx, "scheduleQty", e.target.value)}
                            className={cellInputClasses}
                            step="any"
                            min="0"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTempScheduleRow(idx)}
                            disabled={tempScheduleRows.length <= 1}
                            className={`h-6 w-6 rounded text-white flex items-center justify-center ${tempScheduleRows.length <= 1
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                              }`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSchedulePopup(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <Save className="h-3 w-3" />
                Submit Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubContractSupplyScheduleForm;