import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import supplierRateContractAPI from "../../../api/supplierRateContractAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import transportAPI from "../../../api/transportAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import subContractingDCAPI from "../../../api/SubContract/subContractingDCAPI";

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

            if (col.type === "textarea") {
              return (
                <td className="p-2 align-top" key={col.key}>
                  <textarea
                    value={row[col.key] || ""}
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

const YES_NO = ["YES", "NO"];
const BOM_IDS = ["BOM-001", "BOM-002", "BOM-003"];
const APPROVAL_STATUS = ["Pending", "Approved", "Rejected"];

const CHILD_TABS = [
  { key: "outGoingItem", label: "Out Going Item", kind: "table" },
  { key: "contractingSummary", label: "Contracting Summary", kind: "fields" },
];

const emptyOutGoingItemRow = () => ({
  jobOrderFor: "",
  contractNo: "",
  outgoingItemCode: "",
  outgoingItemDescription: "",
  stock: "",
  unit: "",
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

const nowTimeStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* ---------------------------------------------------------------------------- */

const SubContractingDcForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("outGoingItem");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [vendorMap, setVendorMap] = useState({});
  const [jobOrderOptions, setJobOrderOptions] = useState([]);
  const [jobOrderMap, setJobOrderMap] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [partyLocationOptions, setPartyLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [outgoingItemOptions, setOutgoingItemOptions] = useState([]);
  const [outgoingItemMap, setOutgoingItemMap] = useState({});
  const [fromLocationOptions, setFromLocationOptions] = useState([]);

  // New state for LOV and Department
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [dcTypeOptions, setDcTypeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    scDcNo: data?.scDcNo || "",
    scDcDate: data?.scDcDate || todayStr(),
    belongsTo: data?.belongsTo || "",
    department: data?.department || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    vendorAddress: data?.vendorAddress || "",
    vendorGstNo: data?.vendorGstNo || "",
    vendorGstState: data?.vendorGstState || "",
    vendorGstType: data?.vendorGstType || "",
    vendorCode: data?.vendorCode || "",
    jobOrderNo: data?.jobOrderNo || "",
    jobOrderDate: data?.jobOrderDate || "",
    partyLocation: data?.partyLocation || "",
    incomingPartNo: data?.incomingPartNo || "",
    partName: data?.partName || "",
    qty: data?.qty ?? "",
    transportName: data?.transportName || "",
    vehicleNo: data?.vehicleNo || "",
    city: data?.city || "",
    sfgBom: data?.sfgBom || "",
    timeOfIssue: data?.timeOfIssue || nowTimeStr(),
    dcType: data?.dcType || "",
    approvalByStores: data?.approvalByStores || "",
    preparedBy: data?.preparedBy || "",
    approvedBy: data?.approvedBy || "",
    remarks: data?.remarks || "",
    active: data?.active !== false,
  }));

  const [outGoingItemRows, setOutGoingItemRows] = useState(
    data?.outGoingItems?.length ? data.outGoingItems : [emptyOutGoingItemRow()],
  );
  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...data?.summary,
  });

  /* ---------------- Generate Document ID ---------------- */

  const generateDocId = useCallback(async () => {
    // Don't generate if editing
    if (data?.id) return;

    setGeneratingDocId(true);
    setHeader((prev) => ({ ...prev, scDcNo: "" }));

    try {
      const financialYear = new Date().getFullYear().toString();
      const response = await subContractingDCAPI.getDeliveryChallanSubcontractingDocId(
        financialYear,
        orgId
      );
      console.log("Document ID Response:", response);

      const docId = response?.paramObjectsMap?.docId || "";
      if (docId) {
        setHeader((prev) => ({ ...prev, scDcNo: docId }));
      } else {
        addToast("Failed to generate Document ID", "error");
        // Fallback to auto-generated ID
        const fallbackId = `SCDC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
        setHeader((prev) => ({ ...prev, scDcNo: fallbackId }));
      }
    } catch (error) {
      console.error("Error generating document ID:", error);
      // Fallback to auto-generated ID
      const fallbackId = `SCDC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
      setHeader((prev) => ({ ...prev, scDcNo: fallbackId }));
      addToast("Failed to generate Document ID, using fallback", "error");
    } finally {
      setGeneratingDocId(false);
    }
  }, [data, orgId, addToast]);

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
  const loadVendors = useCallback(async () => {
    try {
      const res = await subContractingDCAPI.getCustomersForSupplierRateContract(branch, orgId);
      console.log("Vendor Response:", res);

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
      setVendorOptions(options);
      setVendorMap(map);
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
      setVendorMap({});
    }
  }, [orgId, branch]);

  // Load Job Orders based on selected Vendor
  const loadJobOrders = useCallback(async (vendorId) => {
    if (!vendorId) {
      setJobOrderOptions([]);
      setJobOrderMap({});
      return;
    }

    try {
      const res = await subContractingDCAPI.getJobOrderNoAndDateForJobOrderAmd(
        branch,
        vendorId,
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

  // Load Party Location
  const loadPartyLocations = useCallback(async () => {
    try {
      const res = await subContractingDCAPI.getLocationForDeliverChallanSubContract(
        branch,
        orgId
      );
      console.log("Party Location Response:", res);

      const locationList = res?.paramObjectsMap?.locationList || [];
      const options = locationList.map((loc) => ({
        value: loc.id,
        label: loc.locationName || loc.locationId || loc.id,
      }));
      setPartyLocationOptions(options);
    } catch (error) {
      console.error("Failed to load party locations:", error);
      setPartyLocationOptions([]);
    }
  }, [orgId, branch]);

  // Load From Location from Location Master
  const loadFromLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      console.log("From Location Response:", res);

      const options = (res || []).map((loc) => ({
        value: loc.id,
        label: loc.locationName || loc.locationId || loc.id,
      }));
      setFromLocationOptions(options);
    } catch (error) {
      console.error("Failed to load from locations:", error);
      setFromLocationOptions([]);
    }
  }, [orgId, branch]);

  // Load Incoming Part No and Outgoing Item details based on Job Order
  const loadItemDetails = useCallback(async (jobOrderNo) => {
    if (!jobOrderNo || !header.vendorId) {
      setItemOptions([]);
      setItemMasterMap({});
      setOutgoingItemOptions([]);
      setOutgoingItemMap({});
      return;
    }

    try {
      const res = await subContractingDCAPI.getItemDetailsforDeliveryChallanSubContract(
        branch,
        jobOrderNo,
        orgId,
        header.vendorId
      );
      console.log("Item Details Response:", res);

      const itemDetails = res?.paramObjectsMap?.itemDetails || [];

      // Map for Incoming Part No - Store the outgoingItem ID
      const itemMap = {};
      const itemOpts = itemDetails.map((item) => {
        itemMap[item.outgoingItem] = {
          id: item.id,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          unit: item.unit,
          unitDescription: item.unitDescription,
          rate: item.rate,
          contractNo: item.contractNo,
          jobOrderFor: item.jobOrderFor,
          outgoingItem: item.outgoingItem,
        };
        return {
          value: item.outgoingItem, // Use outgoingItem as value
          label: item.itemCode,
        };
      });
      setItemOptions(itemOpts);
      setItemMasterMap(itemMap);

      // Map for Outgoing Item Code - Store the outgoingItem ID
      const outMap = {};
      const outOpts = itemDetails.map((item) => {
        outMap[item.outgoingItem] = {
          id: item.id,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          unit: item.unit,
          unitDescription: item.unitDescription,
          rate: item.rate,
          contractNo: item.contractNo,
          jobOrderFor: item.jobOrderFor,
          outgoingItem: item.outgoingItem,
        };
        return {
          value: item.outgoingItem, // Use outgoingItem as value
          label: item.itemCode,
        };
      });
      setOutgoingItemOptions(outOpts);
      setOutgoingItemMap(outMap);

    } catch (error) {
      console.error("Failed to load item details:", error);
      setItemOptions([]);
      setItemMasterMap({});
      setOutgoingItemOptions([]);
      setOutgoingItemMap({});
    }
  }, [orgId, branch, header.vendorId]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(orgId, branch);
      setLocationOptions(
        (res || []).map((l) => ({
          value: l.locationName || l.id,
          label: l.locationName || l.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load location options:", error);
      setLocationOptions([]);
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

  const loadTransports = useCallback(async () => {
    try {
      const res = await transportAPI.getTransportByOrgId(branch, orgId);
      console.log("Transport Response:", res);

      const options = (res || []).map((t) => ({
        value: t.id,
        label: t.transportName || t.id,
        transportName: t.transportName || "",
      }));
      setTransportOptions(options);
    } catch (error) {
      console.error("Failed to load transport options:", error);
      setTransportOptions([]);
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

  // Load List of Values for D.C Type
  const loadDcTypes = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("DC_TYPE", orgId);
      setDcTypeOptions(
        (res || []).map((item) => ({
          value: item.id,
          label: item.valuesDescription || item.valueDescription || item.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load D.C Type options:", error);
      setDcTypeOptions([]);
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
      loadDcTypes();
      loadDepartments();
      loadVendors();
      loadPartyLocations();
      loadFromLocations();
      loadTransports();
    }
  }, [orgId, loadPlants, loadBelongsTo, loadDcTypes, loadDepartments, loadVendors, loadPartyLocations, loadFromLocations, loadTransports]);

  // Load job orders when vendor changes
  useEffect(() => {
    if (header.vendorId) {
      loadJobOrders(header.vendorId);
    } else {
      setJobOrderOptions([]);
      setJobOrderMap({});
    }
  }, [header.vendorId, loadJobOrders]);

  // Load item details when job order changes
  useEffect(() => {
    if (header.jobOrderNo && header.vendorId) {
      loadItemDetails(header.jobOrderNo);
    } else {
      setItemOptions([]);
      setItemMasterMap({});
      setOutgoingItemOptions([]);
      setOutgoingItemMap({});
    }
  }, [header.jobOrderNo, header.vendorId, loadItemDetails]);

  useEffect(() => {
    if (orgId && branch) {
      loadLocations();
      loadUnits();
    }
  }, [
    orgId,
    branch,
    loadLocations,
    loadUnits,
  ]);

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

      if (name === "vendorId") {
        const vendor = vendorMap[value];
        if (vendor) {
          next.vendorName = vendor.customerName || "";
          next.vendorAddress = vendor.address || "";
          next.vendorGstNo = vendor.gstNo || "";
          next.vendorGstState = vendor.gstState || "";
          next.vendorGstType = vendor.gstType || "";
          next.vendorCode = vendor.customerCode || "";
        } else {
          next.vendorName = "";
          next.vendorAddress = "";
          next.vendorGstNo = "";
          next.vendorGstState = "";
          next.vendorGstType = "";
          next.vendorCode = "";
        }
        // Clear job order when vendor changes
        next.jobOrderNo = "";
        next.jobOrderDate = "";
        next.incomingPartNo = "";
        next.partName = "";
      }

      if (name === "jobOrderNo") {
        const jobOrder = jobOrderMap[value];
        if (jobOrder) {
          next.jobOrderDate = jobOrder.jobOrderDate || "";
        } else {
          next.jobOrderDate = "";
        }
        // Clear item details when job order changes
        next.incomingPartNo = "";
        next.partName = "";
      }

      if (name === "incomingPartNo") {
        const item = itemMasterMap[value];
        if (item) {
          next.partName = item.itemDescription || "";
        } else {
          next.partName = "";
        }
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
          const item = outgoingItemMap[value];
          if (item) {
            next = {
              ...next,
              outgoingItemDescription: item.itemDescription || "",
              unit: item.unit || row.unit || "",
              unitRate: item.rate || row.unitRate || "",
              contractNo: item.contractNo || row.contractNo || "",
              jobOrderFor: item.jobOrderFor || row.jobOrderFor || "",
            };
          }
        }

        if (key === "fromLocation") {
          // You can add logic to fetch stock based on location if needed
        }

        if (key === "issueQty" || key === "unitRate") {
          const qty = Number(next.issueQty) || 0;
          const rate = Number(next.unitRate) || 0;
          next.amount = (qty * rate).toFixed(2);
        }

        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setOutGoingItemRows((prev) => [...prev, emptyOutGoingItemRow()]);
  const handleRemoveRow = (idx) =>
    setOutGoingItemRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant is required";
    if (!header.scDcNo?.trim()) errors.scDcNo = "SC DC No is required";
    if (!header.scDcDate) errors.scDcDate = "SC DC Date is required";
    if (!header.belongsTo) errors.belongsTo = "Belongs To is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.vendorName?.trim())
      errors.vendorName = "Vendor Name is required";
    if (!header.jobOrderNo) errors.jobOrderNo = "Job Order No is required";
    if (!header.partyLocation)
      errors.partyLocation = "Party Location is required";
    if (!header.incomingPartNo)
      errors.incomingPartNo = "Incoming Part No is required";
    if (!header.dcType) errors.dcType = "D.C Type is required";
    if (!header.approvalByStores)
      errors.approvalByStores = "Approval By Stores is required";
    if (!header.preparedBy) errors.preparedBy = "Prepared By is required";
    if (!header.approvedBy) errors.approvedBy = "Approved By is required";

    const hasValidRow = outGoingItemRows.some(
      (r) =>
        r.jobOrderFor &&
        r.contractNo &&
        r.outgoingItemCode &&
        r.unit &&
        r.fromLocation &&
        Number(r.issueQty) > 0 &&
        Number(r.unitRate) > 0,
    );
    if (!hasValidRow)
      errors.outGoingItems =
        "Add at least one item with Job Order For, Contract No, Outgoing Item Code, Unit, From Location, an Issue Qty and Unit Rate greater than 0";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Prepare the payload according to the API schema
    const payload = {
      active: true,
      approvalByStores: header.approvalByStores || "",
      approvedBy: Number(header.approvedBy) || 0,
      belongsTo: header.belongsTo || "",
      branch: Number(header.plantId) || 0,
      cancelRemarks: "",
      createdBy: isUpdate
        ? data?.createdBy || localStorage.getItem("usersId") || "SYSTEM"
        : localStorage.getItem("usersId") || "SYSTEM",
      dcType: header.dcType || "",
      department: Number(header.department) || 0,
      details: outGoingItemRows
        .filter((r) => r.outgoingItemCode && r.outgoingItemCode.trim() !== "")
        .map((r) => ({
          availableStock: Number(r.availableStock) || 0,
          contractNo: r.contractNo || "",
          fromLocation: Number(r.fromLocation) || 0,
          issueQty: Number(r.issueQty) || 0,
          jobOrderFor: r.jobOrderFor || "",
          outgoingItem: Number(r.outgoingItemCode) || 0,
          remarks: r.remarks || "",
          stock: Number(r.stock) || 0,
          unit: Number(r.unit) || 0,
          unitRate: Number(r.unitRate) || 0,
        })),
      financialYear: new Date().getFullYear().toString(),
      incomingItem: Number(header.incomingPartNo) || 0, // This sends the outgoingItem ID
      jobOrderNo: header.jobOrderNo || "",
      orgId: orgId,
      partyLocation: Number(header.partyLocation) || 0,
      preparedBy: Number(header.preparedBy) || 0,
      qty: Number(header.qty) || 0,
      remarks: header.remarks || "",
      sfgBom: header.sfgBom || "",
      timeOfIssue: header.timeOfIssue || nowTimeStr(),
      transportName: header.transportName || "",
      vehicleNo: header.vehicleNo || "",
      vendor: Number(header.vendorId) || 0,
    };

    // Add ID only if updating
    if (isUpdate) {
      payload.id = data.id;
    }

    console.log("Saving Payload:", payload);

    try {
      const response =
        await subContractingDCAPI.createUpdateDeliveryChallanSubcontracting(payload);

      console.log("API Response:", response);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Sub Contracting DC updated successfully!"
            : "Sub Contracting DC created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        const errorMessage =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Sub Contracting DC.";
        addToast(errorMessage, "error");
      }
    } catch (err) {
      console.error("Save Sub Contracting DC Error:", err);
      if (err.response?.data) {
        const errorMsg = err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data);
        addToast(errorMsg, "error");
      } else {
        addToast("Something went wrong. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  // If data is provided (edit mode), populate the form
  useEffect(() => {
    if (data?.id) {
      // Populate header fields
      setHeader({
        plantId: data.plantId || data.branch || "",
        scDcNo: data.scDcNo || data.docId || "",
        scDcDate: data.scDcDate || data.docDate || todayStr(),
        belongsTo: data.belongsTo || "",
        department: data.department || "",
        vendorId: data.vendorId || data.vendor || "",
        vendorName: data.vendorName || "",
        vendorAddress: data.vendorAddress || "",
        vendorGstNo: data.vendorGstNo || "",
        vendorGstState: data.vendorGstState || "",
        vendorGstType: data.vendorGstType || "",
        vendorCode: data.vendorCode || "",
        jobOrderNo: data.jobOrderNo || "",
        jobOrderDate: data.jobOrderDate || "",
        partyLocation: data.partyLocation || "",
        incomingPartNo: data.incomingPartNo || data.incomingItem || "",
        partName: data.partName || "",
        qty: data.qty || "",
        transportName: data.transportName || "",
        vehicleNo: data.vehicleNo || "",
        city: data.city || "",
        sfgBom: data.sfgBom || "",
        timeOfIssue: data.timeOfIssue || nowTimeStr(),
        dcType: data.dcType || "",
        approvalByStores: data.approvalByStores || "",
        preparedBy: data.preparedBy || "",
        approvedBy: data.approvedBy || "",
        remarks: data.remarks || "",
        active: data.active !== false,
      });

      // Populate outgoing items
      if (data.details && data.details.length > 0) {
        const items = data.details.map((detail) => ({
          jobOrderFor: detail.jobOrderFor || "",
          contractNo: detail.contractNo || "",
          outgoingItemCode: detail.outgoingItem || "",
          outgoingItemDescription: detail.outgoingItemDescription || "",
          stock: detail.stock || "",
          unit: detail.unit || "",
          fromLocation: detail.fromLocation || "",
          availableStock: detail.availableStock || "",
          issueQty: detail.issueQty || "",
          unitRate: detail.unitRate || "",
          amount: detail.amount || "",
          remarks: detail.remarks || "",
        }));
        setOutGoingItemRows(items);
      }

      // Populate summary
      if (data.summary) {
        setSummary({
          summaryNotes: data.summary.summaryNotes || "",
          approvalStatus: data.summary.approvalStatus || "",
          additionalComments: data.summary.additionalComments || "",
        });
      }
    }
  }, [data]);

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
          {data?.id ? "Edit Sub Contracting DC" : "Add Sub Contracting DC"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>D.C For Sub Contracting</SectionHeader>
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
              label="SC DC No"
              name="scDcNo"
              value={header.scDcNo}
              onChange={handleHeaderChange}
              error={fieldErrors.scDcNo}
              required
              disabled={!!data?.id || generatingDocId}
              placeholder={generatingDocId ? "Generating..." : ""}
            />
            <Field
              type="date"
              label="SC DC Date"
              name="scDcDate"
              value={header.scDcDate}
              onChange={handleHeaderChange}
              error={fieldErrors.scDcDate}
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
              type="select"
              label="Job Order No"
              name="jobOrderNo"
              value={header.jobOrderNo}
              onChange={handleHeaderChange}
              error={fieldErrors.jobOrderNo}
              options={jobOrderOptions}
              required
            />
            <Field
              type="select"
              label="Party Location"
              name="partyLocation"
              value={header.partyLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.partyLocation}
              options={partyLocationOptions}
              required
            />
            <Field
              type="select"
              label="Incoming Part No"
              name="incomingPartNo"
              value={header.incomingPartNo}
              onChange={handleHeaderChange}
              error={fieldErrors.incomingPartNo}
              options={itemOptions}
              required
            />
            <Field
              label="Part Name"
              name="partName"
              value={header.partName}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Transport Name"
              name="transportName"
              value={header.transportName}
              onChange={handleHeaderChange}
              options={transportOptions}
            />
            <Field
              type="number"
              label="Qty"
              name="qty"
              value={header.qty}
              onChange={handleHeaderChange}
            />
            <Field
              label="Vehicle No"
              name="vehicleNo"
              value={header.vehicleNo}
              onChange={handleHeaderChange}
            />
            <Field
              label="SFG Bom"
              name="sfgBom"
              value={header.sfgBom}
              onChange={handleHeaderChange}
            />
            <Field
              label="Time Of Issue"
              name="timeOfIssue"
              value={header.timeOfIssue}
              onChange={handleHeaderChange}
              disabled
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
                    options: outgoingItemOptions,
                  },
                  {
                    key: "outgoingItemDescription",
                    label: "Outgoing Item Description",
                    readOnly: true,
                  },
                  {
                    key: "jobOrderFor",
                    label: "Job Order For",
                  },
                  {
                    key: "contractNo",
                    label: "Contract No",
                  },
                  { key: "stock", label: "Stock", type: "number" },
                  {
                    key: "unit",
                    label: "Unit",
                  },
                  {
                    key: "fromLocation",
                    label: "From Location",
                    type: "select",
                    options: fromLocationOptions,
                  },
                  {
                    key: "availableStock",
                    label: "Available Stock",
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
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data?.id ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default SubContractingDcForm;