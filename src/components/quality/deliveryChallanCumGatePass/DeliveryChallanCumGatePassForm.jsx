import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import deliveryChallanCumGatePassAPI from "../../../api/quality/deliveryChallanCumGatePassAPI";
import branchAPI from "../../../api/branchAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
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

const CHILD_TABS = [
  { key: "gatePassDetails", label: "Gate Pass Details", kind: "table" },
  { key: "gatePassSummary", label: "Gate Pass Summary", kind: "fields" },
];

const emptyGatePassRow = () => ({
  itemCode: "",
  itemDescription: "",
  hsnSacCode: "",
  unit: "",
  stock: "",
  availableQty: "",
  qty: "",
  dueDate: "",
  previousQty: "",
  lcRate: "",
  rate: "",
  amount: "",
});

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */

const DeliveryChallanCumGatePassForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId")) || 0;
  const branch = Number(localStorage.getItem("branchId")) || 0;
  const usersId = localStorage.getItem("usersId");
  const username = localStorage.getItem("employeeName");
  const financialYear = localStorage.getItem("finYear") || "";  

  

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (
    userData?.companyVO?.companyName ||
    userData?.orgName ||
    ""
  ).trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("gatePassDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [motOptions, setMotOptions] = useState([]);
  const [workOrderOptions, setWorkOrderOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [partyMap, setPartyMap] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

   const [docNoGenerated, setDocNoGenerated] = useState(false);

  const generateDocNo = useCallback(async () => {
    if (docNoGenerated) return;
    try {
      const docId = await deliveryChallanCumGatePassAPI.getDeliveryChallanCumGatePassDocId(
        financialYear,
        orgId,
      );
      if (docId) {
        setHeader((prev) => ({ ...prev, docNo: docId }));
        setDocNoGenerated(true);
      }
    } catch (error) {
      console.error("Failed to generate Doc No:", error);
    }
  }, [financialYear, orgId, docNoGenerated]);

  const [header, setHeader] = useState(() => {
    const base = {
      plantId: data?.plantId?.id ?? data?.plantId ?? "",
      belongsTo: data?.belongsTo || "",
      type: data?.type || "",
      department: parseInt(data?.department?.id ?? data?.department ?? 0) || 0,
      partyPlantId: data?.partyPlantId?.id ?? data?.partyPlantId ?? 0,
      partyPlantName: data?.partyPlantName || "",
      refNo: data?.refNo || "",
      refDate: fmtDate(data?.refDate),
      fromLocation: parseInt(data?.fromLocation?.id ?? data?.fromLocation ?? 0) || 0  ,
      modeOfTransport: data?.modeOfTransport || "",
      vehicleNo: data?.vehicleNo || "",
      workOrderNo: data?.workOrderNo || "",
      docNo: data?.docNo || "",
      docDate: data?.docDate || dayjs().format("YYYY-MM-DD"),
      isIgstApplicable: data?.isIgstApplicable || "",
      gstinNo: data?.gstinNo || "",
      preparedBy: parseInt(data?.preparedBy?.id ?? data?.preparedBy ?? 0) || 0,
      remarks: data?.remarks || "",
      active: data?.active !== false,
    };
    base.refDate = fmtDate(base.refDate);
    base.docDate = fmtDate(base.docDate);
    return base;
  });

  const [gatePassRows, setGatePassRows] = useState(
    data?.gatePassDetails?.length ? data.gatePassDetails : [emptyGatePassRow()],
  );

  const [summary, setSummary] = useState({
    totalQty: data?.gatePassSummary?.totalQty ?? "",
    summaryNotes: data?.gatePassSummary?.summaryNotes || "",
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
            label: b.branchName || b.branchCode || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  // From Location: Location Master GetAll API
  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.id,
          label: l.locationName || l.locationId || l.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
    }
  }, [orgId, branch]);

  // Belongs To: getListValuesGroup("Delivery Challan Cum Gate Pass")
  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getListValuesGroup(
        "Delivery Challan Cum Gate Pass",
        orgId,
      );
      setBelongsToOptions(
        (res || []).map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load belongs to options:", error);
      setBelongsToOptions([]);
    }
  }, [orgId]);

  // Type: getListValuesGroup("Delivery Challan Cum Gate Pass Part/branch")
  const loadTypes = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getListValuesGroup(
        "Delivery Challan Cum Gate Pass Part/branch",
        orgId,
      );
      setTypeOptions(
        (res || []).map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load type options:", error);
      setTypeOptions([]);
    }
  }, [orgId]);

  // Mode of Transport: getListValuesGroup("Delivery Challan Cum Gate Pass MOT")
  const loadMot = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getListValuesGroup(
        "Delivery Challan Cum Gate Pass MOT",
        orgId,
      );
      setMotOptions(
        (res || []).map((v) => ({
          value: v.valuesDescription,
          label: v.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load mode of transport options:", error);
      setMotOptions([]);
    }
  }, [orgId]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId);
      const departments = res?.paramObjectsMap?.departmentVO || [];
      if (departments.length) {
        setDepartmentOptions(
          departments.map((d) => ({ value: d.id, label: d.departmentName })),
        );
      } else {
        setDepartmentOptions([
         ""
        ]);
      }
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([
       ""
      ]);
    }
  }, [orgId, branch]);

  const loadParties = useCallback(async () => {
    try {
      const map = {};
      let options = [];
      if (header.type === "PARTY") {
        const res = await partyMasterAPI.getCustomerDetails(branch, orgId);
        options = (res || []).map((c) => {
          const label = c.customerName || c.customerCode || c.customerId;
          map[String(c.customerId)] = {
            label,
            gstNo: c.gstNo,
            isGstApplicable: c.isGstApplicable,
          };
          return { value: c.customerId, label };
        });
      } else if (header.type === "PLANT") {
        const res = await branchAPI.getBranchByOrgId(orgId);
        options = (res || []).map((b) => {
          const label = b.branchName || b.branchCode || b.id;
          map[String(b.id)] = { label, gstNo: b.gstinNo };
          return { value: b.id, label };
        });
      }
      setPartyOptions(options);
      setPartyMap(map);
    } catch (error) {
      console.error("Failed to load party/plant options:", error);
      setPartyOptions([]);
      setPartyMap({});
    }
  }, [orgId, branch, header.type]);

  const loadWorkOrders = useCallback(async () => {
    try {
      if (!header.partyPlantId) {
        setWorkOrderOptions([]);
        return;
      }
      console.log("[DCGP] loadWorkOrders running. header.type:", header.type, "| partyPlantId:", header.partyPlantId, "| branch:", branch, "| orgId:", orgId);
      const res = await deliveryChallanCumGatePassAPI.getJobOrderNo(
        branch,
        header.partyPlantId,
        orgId,
      );
      const mapped = (res || []).map((j) => ({
        value: j.jobOrderNo,
        label: j.jobOrderNo,
      }));
      console.log("[DCGP] loadWorkOrders -> mapped options count:", mapped.length, mapped.slice(0, 5));
      setWorkOrderOptions(mapped);
    } catch (error) {
      console.error("Failed to load work order options:", error);
      setWorkOrderOptions([]);
    }
  }, [orgId, branch, header.type, header.partyPlantId]);

  const loadDcgpDetailsRows = useCallback(async () => {
    console.log(
      "[DCGP] loadDcgpDetailsRows CALLED. type:",
      header.type,
      "| partyPlantId:",
      header.partyPlantId,
      "| workOrderNo:",
      header.workOrderNo,
    );
    try {
      if (!header.partyPlantId || !header.workOrderNo) {
        console.warn(
          "[DCGP] loadDcgpDetailsRows guard-blocked (only party+workOrder required). partyPlantId:",
          header.partyPlantId,
          "| workOrderNo:",
          header.workOrderNo,
        );
        return;
      }
      const res = await deliveryChallanCumGatePassAPI.getDcgpDetailsRows(
        branch,
        header.partyPlantId,
        header.workOrderNo,
        orgId,
      );
      if (!res || res.length === 0) {
        setGatePassRows([emptyGatePassRow()]);
        return;
      }
      setGatePassRows(
        res.map((v) => ({
          ...emptyGatePassRow(),
          itemCode: v.itemCode || "",
          itemDescription: v.itemDescription || "",
          hsnSacCode: v.hsnSacCode || "",
          unit: String(v.unit ?? ""),
          unitDescription: v.unitDescription || "",
          qty: v.qty ?? "",
          rate: v.rate ?? "",
          amount: v.rate && v.qty ? (parseFloat(v.rate) * parseFloat(v.qty)).toFixed(2) : "",
        })),
      );
    } catch (error) {
      console.error("Failed to load dcgp detail rows:", error);
      setGatePassRows([emptyGatePassRow()]);
    }
  }, [orgId, branch, header.type, header.partyPlantId, header.workOrderNo]);

  const loadItems = useCallback(async () => {
    try {
      const res = await deliveryChallanCumGatePassAPI.getItemDetailsForSalesReturn(
        branch,
        orgId,
      );
      const map = {};
      const options = (res || []).map((it) => {
        map[String(it.itemCode)] = it;
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
      const res = await unitMasterAPI.getUnits(orgId);
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
      loadDepartments();
      loadLocations();
      loadItems();
      loadUnits();
      loadEmployees();
      loadBelongsTo();
      loadTypes();
      loadMot();
    }
  }, [
    orgId,
    branch,
    loadDepartments,
    loadLocations,
    loadItems,
    loadUnits,
    loadEmployees,
    loadBelongsTo,
    loadTypes,
    loadMot,
  ]);

  useEffect(() => {
    if (header.type) loadParties();
  }, [header.type, loadParties]);

  useEffect(() => {
    if (header.partyPlantId) {
      loadWorkOrders();
    } else {
      setWorkOrderOptions([]);
    }
  }, [header.partyPlantId, loadWorkOrders]);

  useEffect(() => {
    if (header.workOrderNo && !data) {
      loadDcgpDetailsRows();
    } else if (!header.workOrderNo) {
      setGatePassRows([emptyGatePassRow()]);
    }
  }, [header.workOrderNo, loadDcgpDetailsRows, data]);

  // Generate Doc No on mount for new records only
  useEffect(() => {
    if (!data && !docNoGenerated) {
      generateDocNo();
    }
  }, [data, generateDocNo, docNoGenerated]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "type") {
        next.partyPlantId = "";
        next.partyPlantName = "";
      }
      if (name === "partyPlantId") {
        const record = partyMap[String(value)];
        next.partyPlantName = record?.label || "";
        next.gstinNo = record?.gstNo || "";
        next.isIgstApplicable =
          record && typeof record.isGstApplicable === "boolean"
            ? record.isGstApplicable
              ? "Yes"
              : "No"
            : "";
      }
      return next;
    });
  };

  const handleToggle = (name, value) => {
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleGatePassCellChange = (idx, key, value) => {
    setGatePassRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          const item = itemMasterMap[value] || itemMasterMap[String(value)];
          next.itemDescription = item?.itemDescription || "";
          next.hsnSacCode = item?.hsnSacCode || item?.hsnSacCode || "";
          next.unit = item?.id || item?.primaryUnits?.id || "";
          next.rate = item?.rate ?? "";
        }

        if (["qty", "rate", "lcRate"].includes(key)) {
          const qty = parseFloat(next.qty) || 0;
          const rate = parseFloat(next.rate) || 0;
          const amount = qty * rate;
          next.amount = amount ? amount.toFixed(2) : "";
        }

        return next;
      }),
    );
  };

  const handleAddGatePassRow = () =>
    setGatePassRows((prev) => [...prev, emptyGatePassRow()]);
  const handleRemoveGatePassRow = (idx) =>
    setGatePassRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  // Recompute the summary total from the detail rows whenever they change.
  const computedTotalQty = gatePassRows.reduce((sum, r) => {
    const qty = parseFloat(r.qty) || 0;
    return sum + qty;
  }, 0);

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.type) errors.type = "Type is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.partyPlantId)
      errors.partyPlantId = "Party/Plant ID is required";
    if (!header.fromLocation)
      errors.fromLocation = "From Location is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";

    const hasValidRow = gatePassRows.some(
      (r) => r.itemCode && r.unit && Number(r.qty) > 0 && Number(r.rate) > 0,
    );
    if (!hasValidRow)
      errors.gatePassDetails =
        "Add at least one item with Item Code, Unit, Qty and Rate";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + gate pass detail items + summary.
    // The backend keeps the complete gate pass history for audit purposes
    // (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      branch,
      active: header.active !== false,
      createdBy: String(username || ""),
      belongsTo: header.belongsTo || "",
      type: header.type || "",
      workOrderNo: header.workOrderNo || "",
      modeOfTransport: header.modeOfTransport || "",
      vehicleNo: header.vehicleNo || "",
      remarks: header.remarks || "",
      cancelRemarks: header.cancelRemarks || "",
      gstnNo: header.gstinNo || "",
      igstappl: header.isIgstApplicable === "Yes",
      financialYear: header.financialYear || financialYear || localStorage.getItem("finYear") || "",
      department: Number(header.department) || 0,
      fromLocation: Number(header.fromLocation) || 0,
      partyPlantId: Number(header.partyPlantId) || 0,
      preparedBy: Number(header.preparedBy || 0) || 0,
      totalQty: computedTotalQty ? Number(computedTotalQty) : 0,
      deliveryChallanCumGatePassDetailsDTO: gatePassRows
        .filter((r) => r.itemCode?.trim())
        .map((r) => {
          const item = itemMasterMap[String(r.itemCode)] || {};
          return {
            item: Number(item.itemId ?? r.itemId ?? 0),
            unit: Number(r.id || item.unitId || 0),
            hsnSacCode: Number(item.hsnId ?? r.hsnSacId ?? 0),
            dueDate: r.dueDate || "",
            qty: r.qty === "" ? 0 : Number(r.qty),
            rate: r.rate === "" ? 0 : Number(r.rate),
            lcRate: r.lcRate === "" ? 0 : Number(r.lcRate),
            previousQty: r.previousQty === "" ? 0 : Number(r.previousQty),
            availableQty: r.availableQty === "" ? 0 : Number(r.availableQty),
            stock: r.stock === "" ? 0 : Number(r.stock),
          };
        }),
    };

    try {
      const response =
        await deliveryChallanCumGatePassAPI.createUpdateDcgp(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Delivery Challan Cum Gate Pass updated successfully!"
              : "Delivery Challan Cum Gate Pass created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Delivery Challan Cum Gate Pass.",
        );
      }
    } catch (err) {
      console.error("Save Delivery Challan Cum Gate Pass Error:", err);
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
            ? "Edit Delivery Challan Cum Gate Pass"
            : "Add Delivery Challan Cum Gate Pass"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Delivery Challan Cum Gate Pass</SectionHeader>
          <div className={fieldGrid}>
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
              label="Type"
              name="type"
              value={header.type}
              onChange={handleHeaderChange}
              error={fieldErrors.type}
              options={typeOptions}
              required
            />
            <Field
              type="select"
              label="Party/Plant ID"
              name="partyPlantId"
              value={header.partyPlantId}
              onChange={handleHeaderChange}
              error={fieldErrors.partyPlantId}
              options={partyOptions}
              required
            />
            <Field
              label="Party/Plant Name"
              name="partyPlantName"
              value={header.partyPlantName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="Mode of Transport"
              name="modeOfTransport"
              value={header.modeOfTransport}
              onChange={handleHeaderChange}
              options={motOptions}
            />
            <Field
              label="Vehicle No"
              name="vehicleNo"
              value={header.vehicleNo}
              onChange={handleHeaderChange}
            />
            {header.type === "PARTY" && (
              <Field
                type="select"
                label="Work Order No"
                name="workOrderNo"
                value={header.workOrderNo}
                onChange={handleHeaderChange}
                options={workOrderOptions}
              />
            )}
            
            <div>
              <ToggleField
                label="Is IGST Applicable"
                name="isIgstApplicable"
                value={header.isIgstApplicable}
                onChange={handleToggle}
                options={YES_NO}
              />
            </div>
            <Field
              label="GSTIN No"
              name="gstinNo"
              value={header.gstinNo}
              onChange={handleHeaderChange}
              error={fieldErrors.gstinNo}
              required={header.isIgstApplicable === "Yes"}
              disabled={header.isIgstApplicable !== "Yes"}
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
                onClick={handleAddGatePassRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Gate Pass Details */}
          {activeChildTab === "gatePassDetails" && (
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
                  { key: "hsnSacCode", label: "HSN/SAC Code" },
                  {
                    key: "unit",
                    label: "Unit",
                    type: "select",
                    options: unitOptions,
                  },
                  { key: "stock", label: "Stock", type: "number" },
                  {
                    key: "availableQty",
                    label: "Available Qty",
                    readOnly: true,
                  },
                  { key: "qty", label: "Qty", type: "number" },
                  { key: "dueDate", label: "Due Date", type: "date" },
                  { key: "previousQty", label: "Previous Qty", type: "number" },
                  { key: "lcRate", label: "LC Rate", type: "number" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "amount", label: "Amount" },
                ]}
                rows={gatePassRows}
                onCellChange={handleGatePassCellChange}
                onRemoveRow={handleRemoveGatePassRow}
              />
              {fieldErrors.gatePassDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.gatePassDetails}
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Gate Pass Summary */}
          {activeChildTab === "gatePassSummary" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Total Qty"
                  name="totalQty"
                  value={computedTotalQty ? computedTotalQty.toFixed(2) : ""}
                  onChange={handleSummaryChange}
                  disabled
                />
                 <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={header.preparedBy}
                  onChange={handleHeaderChange}
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

export default DeliveryChallanCumGatePassForm;
