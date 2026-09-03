import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import listOfValuesAPI from "../../../api/listOfValuesAPI";
import branchAPI from "../../../api/branchAPI";
import itemAPI from "../../../api/itemAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import employeeAPI from "../../../api/employeeAPI";
import { partyMasterAPI } from "../../../api/partyMasterAPI";
import unitMasterAPI from "../../../api/unitAPI";

import toolsFixtureAPI from "../../../api/Production/toolsFixtureAPI";

/* ============================================================================ 
   SHARED DESIGN 
============================================================================ */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ============================================================================ 
   FIELD 
============================================================================ */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  multiple,
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
          multiple={multiple}
          disabled={disabled}
          className={
            multiple
              ? controlClasses.replace("h-[30px]", "h-[64px]")
              : controlClasses
          }
        >
          {!multiple && <option value="">-- Select --</option>}

          {(options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
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
          disabled={disabled}
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
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
        value={value ?? ""}
        disabled={disabled}
        onChange={onChange}
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

/* ============================================================================ 
   SECTION HEADER 
============================================================================ */

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

/* ============================================================================ 
   BUTTONS 
============================================================================ */

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      type="button"
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ============================================================================ 
   STATIC OPTIONS 
============================================================================ */

const YES_NO = [
  {
    value: "YES",
    label: "YES",
  },
  {
    value: "NO",
    label: "NO",
  },
];

/* ============================================================================ 
   EMPTY STATES 
============================================================================ */

const emptyBasicInfo = () => ({
  plantId: "",
  type: "",
  department: "",
  toolNo: "",
  toolName: "",
  toolDescription: "",
  toolCategory: "",
  status: "",
  active: "YES",
});

const emptyToolsInfo = () => ({
  pmCheckListNo: "",
  location: "",
  toolIncharge: "",
  toolUsedFor: "",
  toolOwnership: "",
  toolOwnerName: "",
  presentLocation: "",
  remarks: "",
});

const emptyTechnicalInfo = () => ({
  drawingNo: "",
  serialNo: "",
  manufacturedBy: "",
  section: "",
  madeIn: "",
  purchaseFrom: "",
  modeOfPurchase: "",
  toolCost: "",
  cavityNumber: "",
});

const emptySpareRow = () => ({
  sparePartId: "",
  sparePartDescription: "",
  modelNo: "",
  serialNo: "",
  manufacturer: "",
  warrantyTillDate: "",
  calibrationReq: "NO",
  lastCalibDate: "",
  nextCalibDate: "",
});

const emptyComponentRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
});

const emptyHistoryRow = () => ({
  date: "",
  description: "",
  changedDate: "",
  cost: "",
  purpose: "",
  remarks: "",
});

/* ============================================================================ 
   TABS 
============================================================================ */

const CHILD_TABS = [
  {
    key: "tools",
    label: "Tools",
  },
  {
    key: "technicalInfo",
    label: "Technical Info",
  },
  {
    key: "spareDetails",
    label: "Spare Details",
  },
  {
    key: "componentOutput",
    label: "Component Output Details",
  },
  {
    key: "machineHistory",
    label: "Machine History",
  },
  {
    key: "image",
    label: "Image",
  },
  {
    key: "attached",
    label: "Attached",
  },
];

/* ============================================================================ 
   HELPERS 
============================================================================ */

const todayISO = () => new Date().toISOString().split("T")[0];

/*
 * Converts an empty/unselected dropdown value to null instead of 0.
 * Foreign-key fields on the backend (branch, department, type, etc.)
 * are typically Long references — sending 0 for "not selected" is
 * usually treated as an invalid/non-existent id and can cause a 400,
 * where null is accepted as "no value".
 */
const toNullableNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value)) ||
    Number(value) === 0
  ) {
    return null;
  }

  return Number(value);
};

const getMasterId = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value.id ??
        value.branchId ??
        value.departmentId ??
        value.employeeId ??
        value.employeeMasterId ??
        value.customerId ??
        value.partyId ??
        value.itemId ??
        value.value ??
        "",
    );
  }

  return String(value);
};

const getMasterName = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.employeeName ||
      value.customerName ||
      value.partyName ||
      value.branchName ||
      value.departmentName ||
      value.itemDescription ||
      value.valuesDescription ||
      ""
    );
  }

  return String(value);
};

/* ============================================================================ 
   COMPONENT 
============================================================================ */

const ToolsFixturesForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId") || "");

  const [branch] = useState(localStorage.getItem("branchId") || "");

  const [activeChildTab, setActiveChildTab] = useState("tools");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [toastMessage, setToastMessage] = useState(null);

  /* ========================================================================== 
     MASTER DATA 
  ========================================================================== */

  const [listOfValuesData, setListOfValuesData] = useState({});

  const [plantData, setPlantData] = useState([]);

  const [departmentData, setDepartmentData] = useState([]);

  const [itemData, setItemData] = useState([]);

  const [employeeData, setEmployeeData] = useState([]);

  const [customerData, setCustomerData] = useState([]);

  const [presentLocationData, setPresentLocationData] = useState([]);

  const [unitData, setUnitData] = useState([]);

  /* ========================================================================== 
     FORM STATE 
  ========================================================================== */

  const [basic, setBasic] = useState({
    ...emptyBasicInfo(),
    ...(data?.basic || {}),
  });

  const [toolsInfo, setToolsInfo] = useState({
    ...emptyToolsInfo(),
    ...(data?.toolsInfo || {}),
  });

  const [technicalInfo, setTechnicalInfo] = useState({
    ...emptyTechnicalInfo(),
    ...(data?.technicalInfo || {}),
  });

  const [spareRows, setSpareRows] = useState(
    data?.spareDetails?.length ? data.spareDetails : [emptySpareRow()],
  );

  const [componentRows, setComponentRows] = useState(
    data?.componentOutput?.length
      ? data.componentOutput
      : [emptyComponentRow()],
  );

  const [historyRows, setHistoryRows] = useState(
    data?.machineHistory?.length ? data.machineHistory : [emptyHistoryRow()],
  );

  const [technicalDetailRows, setTechnicalDetailRows] = useState(
    data?.technicalDetailRows || [],
  );

  /* ========================================================================== 
     IMAGE 
  ========================================================================== */

  const [imageInfo, setImageInfo] = useState({
    name: data?.image?.name || "",
    file: null,
    previewUrl: data?.image?.previewUrl || "",
  });

  /* ========================================================================== 
     ATTACHMENTS 
  ========================================================================== */

  const [attachedRows, setAttachedRows] = useState(
    data?.attached?.length ? data.attached : [],
  );

  const [isDragging, setIsDragging] = useState(false);

  /* ========================================================================== 
     LOV OPTIONS 
  ========================================================================== */

  const toolTypeOptions = listOfValuesData.toolType || [];

  const madeInOptions = listOfValuesData.madeIn || [];

  const modeOfPurchaseOptions = listOfValuesData.modeOfPurchase || [];

  const lifeTypeOptions = listOfValuesData.lifeType || [];

  const LIST_OF_VALUES_GROUPS = {
    toolType: "TYPE",
    madeIn: "MADE IN",
    modeOfPurchase: "MODE OF PURCHASE",
    lifeType: "LIFE TYPE",
  };

  /* ========================================================================== 
     LOAD BRANCHES 
  ========================================================================== */

  const loadBranches = useCallback(async () => {
    if (!orgId) {
      setPlantData([]);
      return;
    }

    try {
      const response = await branchAPI.getBranchByOrgId(orgId);

      const branches = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branchVO ||
          response?.paramObjectsMap?.branches ||
          [];

      const options = Array.isArray(branches)
        ? branches
            .map((b) => ({
              value: b.id ?? b.branchId ?? "",
              label:
                b.branchName ||
                b.name ||
                b.branchCode ||
                String(b.id ?? b.branchId ?? ""),
            }))
            .filter((item) => item.value !== "")
        : [];

      setPlantData(options);
    } catch (error) {
      setPlantData([]);
    }
  }, [orgId]);

  /* ========================================================================== 
     LOAD DEPARTMENTS 
  ========================================================================== */

  const loadDepartments = useCallback(async () => {
    if (!orgId) {
      setDepartmentData([]);
      return;
    }

    try {
      const response = await departmentAPI.getAllDepartments(orgId);

      const departments = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.departmentVO ||
          response?.paramObjectsMap?.departments ||
          [];

      const options = Array.isArray(departments)
        ? departments
            .map((item) => ({
              value: item.id ?? item.departmentId ?? "",
              label:
                item.departmentName ||
                item.name ||
                item.departmentCode ||
                String(item.id ?? item.departmentId ?? ""),
            }))
            .filter((item) => item.value !== "")
        : [];

      setDepartmentData(options);
    } catch (error) {
      setDepartmentData([]);
    }
  }, [orgId]);

  /* ========================================================================== 
     LOAD ITEMS 
  ========================================================================== */

  const loadItems = useCallback(async () => {
    if (!orgId) {
      setItemData([]);
      return;
    }

    try {
      const response = await itemAPI.getItems(orgId, branch);

      const items = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.itemMasterVO ||
          response?.paramObjectsMap?.items ||
          [];

      const options = Array.isArray(items)
        ? items
            .map((item) => ({
              value: item.id ?? item.itemId ?? "",
              label:
                item.itemCode ||
                item.code ||
                String(item.id ?? item.itemId ?? ""),
              itemDescription: item.itemDescription || item.description || "",
              unit:
                item.primaryUnits?.primaryUnit ||
                item.purchaseUnit ||
                item.uom ||
                item.unit ||
                "",
            }))
            .filter((item) => item.value !== "")
        : [];

      setItemData(options);
    } catch (error) {
      setItemData([]);
    }
  }, [orgId, branch]);

  /* ========================================================================== 
     LOAD ALL EMPLOYEES 
 
     Tool/Fixture Incharge: 
     API = employeeAPI.getEmployeeByOrgId(orgId) 
  ========================================================================== */

  const loadEmployees = useCallback(async () => {
    if (!orgId) {
      setEmployeeData([]);
      return;
    }

    try {
      const response = await employeeAPI.getEmployeeByOrgId(orgId);

      const employees = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.employeeMasterVO ||
          response?.paramObjectsMap?.employees ||
          response?.paramObjectsMap?.employeeList ||
          [];

      const options = Array.isArray(employees)
        ? employees
            .map((item) => {
              const employeeId =
                item.id ?? item.employeeId ?? item.employeeMasterId ?? "";

              const employeeName =
                item.employeeName ||
                item.name ||
                item.employeeCode ||
                item.code ||
                String(employeeId);

              return {
                value: employeeId,
                label: employeeName,
              };
            })
            .filter((item) => item.value !== "")
        : [];

      setEmployeeData(options);
    } catch (error) {
      setEmployeeData([]);
    }
  }, [orgId]);

  /* ========================================================================== 
     LOAD ALL CUSTOMERS 
 
     Used for: 
 
     1. Tool/Fixture Ownership 
     2. Purchase From 
 
     API: 
     partyMasterAPI.getPartyByOrgId(orgId, branch) 
  ========================================================================== */

  const loadCustomers = useCallback(async () => {
    if (!orgId) {
      setCustomerData([]);
      return;
    }

    try {
      const response = await partyMasterAPI.getPartyByOrgId(orgId, branch);

      const customers = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.customerList ||
          response?.paramObjectsMap?.customerVO ||
          response?.paramObjectsMap?.customers ||
          response?.paramObjectsMap?.partyList ||
          [];

      const options = Array.isArray(customers)
        ? customers
            .map((item) => {
              const customerId =
                item.id ?? item.customerId ?? item.partyId ?? "";

              const customerName =
                item.customerName ||
                item.partyName ||
                item.name ||
                item.customerCode ||
                item.partyCode ||
                String(customerId);

              return {
                value: customerId,
                label: customerName,
              };
            })
            .filter((item) => item.value !== "")
        : [];

      setCustomerData(options);
    } catch (error) {
      setCustomerData([]);
    }
  }, [orgId, branch]);

  /* ========================================================================== 
     LOAD UNIT MASTER 
 
     Unit (Technical Detail): 
     API = unitMasterAPI.getUnits(orgId) 
     -> GET /api/commonmaster/getUnitMasterByOrgId?orgId=... 
 
     Option value is the unit's id; the label shown is unitId 
     (e.g. "KGS", "NOS"), not the longer description. 
  ========================================================================== */

  const loadUnitMaster = useCallback(async () => {
    if (!orgId) {
      setUnitData([]);
      return;
    }

    try {
      const units = await unitMasterAPI.getUnits(orgId);

      const options = Array.isArray(units)
        ? units
            .map((item) => ({
              value: item.id ?? "",
              label: item.unitId || item.description || String(item.id ?? ""),
            }))
            .filter((item) => item.value !== "")
        : [];

      setUnitData(options);
    } catch (error) {
      setUnitData([]);
    }
  }, [orgId]);

  /* ========================================================================== 
     LOAD PRESENT LOCATION OPTIONS 
 
     Present Location: 
     API = toolsFixtureAPI.getLocationForToolMaster(branch, orgId) 
 
     Scoped to the Plant ID currently selected on the form 
     (basic.plantId), since a tool's present location should follow 
     whichever plant/branch is chosen, not the logged-in user's branch. 
 
     The API now returns a real locationId alongside locationName, so 
     the option value is the locationId (used as-is for both the 
     "Location" and "Present Location" dropdowns). 
  ========================================================================== */

  const loadPresentLocationOptions = useCallback(async () => {
    if (!orgId || !basic.plantId) {
      setPresentLocationData([]);
      return;
    }

    try {
      const response = await toolsFixtureAPI.getLocationForToolMaster(
        basic.plantId,
        orgId,
      );

      const locations = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.locationList || [];

      const options = Array.isArray(locations)
        ? locations
            .map((item) => ({
              value: item.locationId ?? item.id ?? "",
              label: item.locationName || String(item.locationId ?? ""),
            }))
            .filter((item) => item.value !== "")
        : [];

      setPresentLocationData(options);
    } catch (error) {
      setPresentLocationData([]);
    }
  }, [orgId, basic.plantId]);

  /* ========================================================================== 
     LOAD LIST OF VALUES 
  ========================================================================== */

  const loadListOfValuesData = useCallback(async () => {
    if (!orgId) {
      setListOfValuesData({});
      return;
    }

    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(
              group,
              Number(orgId),
            );

            const values = Array.isArray(response)
              ? response
              : response?.paramObjectsMap?.listValues ||
                response?.paramObjectsMap?.listOfValues ||
                response?.paramObjectsMap?.listValueDetails ||
                [];

            result[key] = Array.isArray(values)
              ? values
                  .map((item) => ({
                    value: item.id ?? item.valueId ?? item.listValueId ?? "",
                    label:
                      item.valuesDescription ||
                      item.name ||
                      item.value ||
                      String(item.id ?? item.valueId ?? item.listValueId ?? ""),
                    ...item,
                  }))
                  .filter((item) => item.value !== "")
              : [];
          } catch (error) {
            result[key] = [];
          }
        }),
      );

      setListOfValuesData(result);
    } catch (error) {}
  }, [orgId]);

  /* ========================================================================== 
     LOAD MASTER DATA 
  ========================================================================== */

  useEffect(() => {
    loadListOfValuesData();
    loadBranches();
    loadDepartments();
    loadItems();
    loadEmployees();
    loadCustomers();
    loadUnitMaster();
  }, [
    loadListOfValuesData,
    loadBranches,
    loadDepartments,
    loadItems,
    loadEmployees,
    loadCustomers,
    loadUnitMaster,
  ]);

  /* ========================================================================== 
     LOAD PRESENT LOCATION (depends on selected Plant ID) 
  ========================================================================== */

  useEffect(() => {
    loadPresentLocationOptions();
  }, [loadPresentLocationOptions]);

  /* ========================================================================== 
     FETCH TOOL MASTER 
  ========================================================================== */

  const mapApiResponseToForm = useCallback(
    (apiData) => {
      return {
        basic: {
          id: apiData.id || 0,

          plantId: getMasterId(apiData.branch),

          type: getMasterId(apiData.type),

          department: getMasterId(apiData.department),

          toolNo: apiData.toolNo || "",

          toolName: apiData.toolName || "",

          toolDescription: apiData.toolDescription || "",

          toolCategory: getMasterName(apiData.toolCategory),

          status: apiData.status || "",

          active:
            apiData.active === true ||
            String(apiData.active).toLowerCase() === "true" ||
            String(apiData.active).toUpperCase() === "ACTIVE"
              ? "YES"
              : "NO",
        },

        toolsInfo: {
          pmCheckListNo: apiData.pmchecklistNo || "",

          location: getMasterId(apiData.location),

          /*
           * Employee ID
           */
          toolIncharge: getMasterId(apiData.toolIncharge),

          toolUsedFor: apiData.toolUsedFor || "",

          /*
           * Customer ID
           */
          toolOwnership: getMasterId(apiData.toolOwnership),

          toolOwnerName: apiData.toolOwnerName || "",

          /*
           * Present Location comes back from getToolMasterById as an
           * object ({ locationId, locationName }); use the locationId
           * so it matches the option values from
           * getLocationForToolMaster.
           */
          presentLocation:
            apiData.presentLocation &&
            typeof apiData.presentLocation === "object"
              ? String(
                  apiData.presentLocation.locationId ??
                    apiData.presentLocation.id ??
                    "",
                )
              : apiData.presentLocation || "",

          remarks: apiData.remarks || "",
        },

        technicalInfo: {
          drawingNo: apiData.drawingNo || "",

          serialNo: apiData.serialNo || "",

          manufacturedBy: apiData.manufacturedBy || "",

          section: apiData.section || "",

          madeIn: getMasterId(apiData.madeIn),

          /*
           * Customer ID
           */
          purchaseFrom: getMasterId(apiData.purchaseFrom),

          modeOfPurchase: getMasterId(apiData.modeOfPurchase),

          toolCost:
            apiData.toolCost !== null && apiData.toolCost !== undefined
              ? String(apiData.toolCost)
              : "",

          cavityNumber: apiData.cavityNumber || "",
        },

        /* ==================================================================== 
           TECHNICAL DETAILS 
        ==================================================================== */

        technicalDetailRows: Array.isArray(
          apiData.toolMasterTechnicalInfoDetailsDTO,
        )
          ? apiData.toolMasterTechnicalInfoDetailsDTO.map((row) => ({
              ...row,

              completedLifeCycle: row.completedLifeCycle ?? 0,

              lifeOfTool: row.lifeOfTool || "",

              lifeType: row.lifeType ?? 0,

              noOfStokesCompleted: row.noOfStokesCompleted ?? 0,

              reconditionFreq: row.reconditionFreq ?? 0,

              reconditionedDate: row.reconditionedDate || "",

              setUpTimeInMinutes: row.setUpTimeInMinutes ?? 0,

              strokesCompletedAfterReconditioning:
                row.strokesCompletedAfterReconditioning ?? 0,

              technicalSpecification: row.technicalSpecification || "",

              toolFixtureAmortizedRecovered:
                row.toolFixtureAmortizedRecovered ?? 0,

              toolFixtureCost: row.toolFixtureCost ?? 0,

              toolFixtureSize: row.toolFixtureSize || "",

              toolMadeOf: row.toolMadeOf || "",

              toolWeight: row.toolWeight ?? 0,

              unit: row.unit ?? 0,
            }))
          : [],

        /* ==================================================================== 
           SPARE DETAILS 
        ==================================================================== */

        spareDetails: Array.isArray(apiData.toolMasterSpareDetailsDTO)
          ? apiData.toolMasterSpareDetailsDTO.map((row) => ({
              id: row.id || 0,

              sparePartId:
                row.sparePartId !== null && row.sparePartId !== undefined
                  ? String(getMasterId(row.sparePartId))
                  : "",

              sparePartDescription: row.sparePartDescription || "",

              modelNo: row.modelNo || "",

              serialNo: row.serialNo || "",

              manufacturer: row.manufacturer || "",

              warrantyTillDate: row.warrantyTillDate || "",

              calibrationReq:
                row.calibrationReq === true ||
                String(row.calibrationReq).toUpperCase() === "YES" ||
                String(row.calibrationReq).toLowerCase() === "true"
                  ? "YES"
                  : "NO",

              lastCalibDate: row.lastCalibDate || "",

              nextCalibDate: row.nextCalibDate || "",
            }))
          : [],

        /* ==================================================================== 
           COMPONENT OUTPUT 
        ==================================================================== */

        componentOutput: Array.isArray(
          apiData.toolMasterComponentOutPutDetailsDTO,
        )
          ? apiData.toolMasterComponentOutPutDetailsDTO.map((row) => {
              const itemId = getMasterId(row.item);

              const itemObject = typeof row.item === "object" ? row.item : null;

              const selectedItem = itemData.find(
                (item) => String(item.value) === String(itemId),
              );

              return {
                id: row.id || 0,

                itemCode: itemId || "",

                itemDescription:
                  itemObject?.itemDescription ||
                  selectedItem?.itemDescription ||
                  "",

                unit:
                  itemObject?.primaryUnits?.primaryUnit ||
                  itemObject?.purchaseUnit ||
                  itemObject?.uom ||
                  itemObject?.unit ||
                  selectedItem?.unit ||
                  "",
              };
            })
          : [],

        /* ==================================================================== 
           MACHINE HISTORY 
        ==================================================================== */

        machineHistory: Array.isArray(
          apiData.toolMasterMachineHistoryDetailsDTO,
        )
          ? apiData.toolMasterMachineHistoryDetailsDTO.map((row) => ({
              id: row.id || 0,

              date: row.date || "",

              description: row.description || "",

              changedDate: row.changedDate || "",

              cost:
                row.cost !== null && row.cost !== undefined
                  ? String(row.cost)
                  : "",

              purpose: row.purpose || "",

              remarks: row.remarks || "",
            }))
          : [],

        /* ==================================================================== 
           IMAGE 
        ==================================================================== */

        image: {
          name:
            typeof apiData.image === "object"
              ? apiData.image?.fileName || apiData.image?.name || ""
              : apiData.image || "",

          file: null,

          previewUrl:
            typeof apiData.image === "object"
              ? apiData.image?.fileUrl || apiData.image?.filePath || ""
              : apiData.image || "",
        },

        /* ==================================================================== 
           ATTACHMENTS 
        ==================================================================== */

        attached: Array.isArray(apiData.toolMasterAttachementDTO)
          ? apiData.toolMasterAttachementDTO.map((row) => ({
              id: row.id || 0,

              fileName: row.fileName || row.name || "",

              name: row.name || row.fileName || "",

              fileUrl:
                row.fileUrl || row.filePath
                  ? toolsFixtureAPI.getViewFileUrl(row.fileUrl || row.filePath)
                  : "",

              file: null,
            }))
          : [],
      };
    },
    [itemData],
  );

  const fetchToolData = useCallback(
    async (id) => {
      setIsLoading(true);

      try {
        const response = await toolsFixtureAPI.getToolMasterById(id);

        const apiData =
          response?.paramObjectsMap?.toolMaster ||
          response?.paramObjectsMap?.toolFixture ||
          response?.paramObjectsMap?.toolMasterVO ||
          response?.paramObjectsMap?.toolMasterDetails ||
          response;

        if (!apiData || response?.status === false) {
          setToastMessage({
            type: "error",
            message:
              response?.paramObjectsMap?.errorMessage ||
              response?.paramObjectsMap?.message ||
              "Tool/Fixture data not found",
          });

          return;
        }

        const formData = mapApiResponseToForm(apiData);

        setBasic(formData.basic);

        setToolsInfo(formData.toolsInfo);

        setTechnicalInfo(formData.technicalInfo);

        setTechnicalDetailRows(formData.technicalDetailRows || []);

        setSpareRows(
          formData.spareDetails?.length
            ? formData.spareDetails
            : [emptySpareRow()],
        );

        setComponentRows(
          formData.componentOutput?.length
            ? formData.componentOutput
            : [emptyComponentRow()],
        );

        setHistoryRows(
          formData.machineHistory?.length
            ? formData.machineHistory
            : [emptyHistoryRow()],
        );

        setImageInfo(
          formData.image || {
            name: "",
            file: null,
            previewUrl: "",
          },
        );

        setAttachedRows(formData.attached || []);
      } catch (error) {
        const message =
          error?.paramObjectsMap?.errorMessage ||
          error?.paramObjectsMap?.message ||
          error?.response?.data?.paramObjectsMap?.errorMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load Tool/Fixture data for editing";

        setToastMessage({
          type: "error",
          message,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [mapApiResponseToForm],
  );

  /* ========================================================================== 
     EDIT DATA 
  ========================================================================== */

  useEffect(() => {
    if (data?.id) {
      fetchToolData(data.id);
    }
  }, [data, fetchToolData]);

  /* ========================================================================== 
     CHANGE HANDLERS 
  ========================================================================== */

  const makeChangeHandler = (setter) => (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    setter((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBasicChange = makeChangeHandler(setBasic);

  const handleToolsInfoChange = makeChangeHandler(setToolsInfo);

  const handleTechnicalInfoChange = makeChangeHandler(setTechnicalInfo);

  /* ========================================================================== 
     TECHNICAL DETAIL CHANGE (Life Type, Unit, etc.) 
 
     Only one technical-detail record is supported per tool (see the 
     note in buildPayload), so this always edits index 0, creating it 
     if it doesn't exist yet. 
  ========================================================================== */

  const handleTechnicalDetailChange = (field, value) => {
    setTechnicalDetailRows((previous) => {
      const rows = previous.length ? [...previous] : [{}];

      rows[0] = {
        ...rows[0],
        [field]: value,
      };

      return rows;
    });
  };

  /* ========================================================================== 
     COMPONENT ITEM CHANGE 
  ========================================================================== */

  const handleComponentItemChange = (index, value) => {
    const selectedItem = itemData.find(
      (item) => String(item.value) === String(value),
    );

    setComponentRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,

              itemCode: value,

              itemDescription: selectedItem?.itemDescription || "",

              unit: selectedItem?.unit || "",
            }
          : row,
      ),
    );
  };

  /* ========================================================================== 
     SPARE CHANGE 
  ========================================================================== */

  const handleSpareChange = (index, field, value) => {
    setSpareRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  /* ========================================================================== 
     HISTORY CHANGE 
  ========================================================================== */

  const handleHistoryChange = (index, field, value) => {
    setHistoryRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  /* ========================================================================== 
     IMAGE 
  ========================================================================== */

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImageInfo((previous) => ({
      ...previous,

      name: file.name,

      file,

      previewUrl: URL.createObjectURL(file),
    }));
  };

  /* ========================================================================== 
     ATTACHMENTS 
  ========================================================================== */

  const handleAttachedFiles = (fileList) => {
    const files = Array.from(fileList || []);

    if (!files.length) {
      return;
    }

    const newRows = files.map((file) => ({
      fileName: file.name,

      name: file.name,

      file,

      fileUrl: "",
    }));

    setAttachedRows((previous) => [...previous, ...newRows]);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    handleAttachedFiles(e.dataTransfer.files);
  };

  /* ========================================================================== 
     VALIDATION 
  ========================================================================== */

  const validate = () => {
    const errors = {};

    if (!basic.plantId) {
      errors.plantId = "Plant ID is required";
    }

    if (!basic.type) {
      errors.type = "Type is required";
    }

    if (!basic.department) {
      errors.department = "Department is required";
    }

    if (!basic.toolNo?.trim()) {
      errors.toolNo = "Tool No./Fixture No. is required";
    }

    if (!basic.toolDescription?.trim()) {
      errors.toolDescription = "Tool/Fixture Description is required";
    }

    if (!basic.toolCategory?.trim()) {
      errors.toolCategory = "Tool/Fixture Category is required";
    }

    if (!basic.status?.trim()) {
      errors.status = "Status is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* ========================================================================== 
     FINANCIAL YEAR 
  ========================================================================== */

  const getFinancialYear = () => {
    const stored =
      localStorage.getItem("finYear") || localStorage.getItem("financialYear");

    if (stored) {
      return stored;
    }

    const year = new Date().getFullYear();

    return `${year}-${String(year + 1).slice(-2)}`;
  };

  /* ========================================================================== 
     BUILD PAYLOAD 
  ========================================================================== */

  const buildPayload = () => {
    /* ======================================================================== 
       TECHNICAL DETAIL FIELDS 
 
       IMPORTANT: on /api/toolmaster/updateCreateToolMaster these fields 
       live directly on the ROOT ToolMasterDTO — there is no 
       "toolMasterTechnicalInfoDetailsDTO" array in that endpoint's 
       schema (confirm against swagger). Sending them nested caused the 
       backend to reject the whole request with a 400, since the flat 
       fields it actually expects (completedLifeCycle, lifeOfTool, 
       lifeType, toolFixtureCost, toolWeight, unit, etc.) were never 
       present at the root. We flatten a single technical-detail object 
       onto the payload root instead. 
 
       technicalDetailRows[0] is used as the source since the backend 
       only supports one set of these values per tool; the array is 
       kept in local state only in case a future screen needs to show 
       history of technical-detail edits. 
    ======================================================================== */

    const technicalDetail = technicalDetailRows[0] || {};

    const technicalFlatFields = {
      completedLifeCycle: Number(technicalDetail.completedLifeCycle || 0),

      lifeOfTool: technicalDetail.lifeOfTool || "",

      lifeType: toNullableNumber(technicalDetail.lifeType),

      noOfStokesCompleted: Number(technicalDetail.noOfStokesCompleted || 0),

      reconditionFreq: Number(technicalDetail.reconditionFreq || 0),

      reconditionedDate: technicalDetail.reconditionedDate || todayISO(),

      setUpTimeInMinutes: Number(technicalDetail.setUpTimeInMinutes || 0),

      strokesCompletedAfterReconditioning: Number(
        technicalDetail.strokesCompletedAfterReconditioning || 0,
      ),

      technicalSpecification: technicalDetail.technicalSpecification || "",

      toolFixtureAmortizedRecovered: Number(
        technicalDetail.toolFixtureAmortizedRecovered || 0,
      ),

      /*
       * Tool Cost on the Technical Info tab doubles as the backend's
       * "toolFixtureCost" unless a more specific stored value exists
       * for this row.
       */
      toolFixtureCost:
        technicalInfo.toolCost !== "" &&
        technicalInfo.toolCost !== null &&
        technicalInfo.toolCost !== undefined
          ? Number(technicalInfo.toolCost)
          : Number(technicalDetail.toolFixtureCost || 0),

      toolFixtureSize: technicalDetail.toolFixtureSize || "",

      toolMadeOf: technicalDetail.toolMadeOf || "",

      toolWeight: Number(technicalDetail.toolWeight || 0),

      unit: toNullableNumber(technicalDetail.unit),
    };

    const payload = {
      /* ====================================================================== 
         FLATTENED TECHNICAL DETAIL FIELDS (see note above) 
      ====================================================================== */

      ...technicalFlatFields,

      /* ====================================================================== 
         PARENT 
         (keys ordered to match the /updateCreateToolMaster payload shape) 
      ====================================================================== */

      active: basic.active === "YES",

      branch: toNullableNumber(basic.plantId),

      cancelRemarks: "",

      cavityNumber: technicalInfo.cavityNumber || "",

      ...(data?.id
        ? {
            id: Number(data.id),
          }
        : {}),

      createdBy:
        localStorage.getItem("userName") ||
        localStorage.getItem("username") ||
        localStorage.getItem("usersId") ||
        "",

      department: toNullableNumber(basic.department),

      drawingNo: technicalInfo.drawingNo || "",

      financialYear: getFinancialYear(),

      image: imageInfo.name || "",

      location: toNullableNumber(toolsInfo.location),

      madeIn: toNullableNumber(technicalInfo.madeIn),

      manufacturedBy: technicalInfo.manufacturedBy || "",

      modeOfPurchase: toNullableNumber(technicalInfo.modeOfPurchase),

      orgId: Number(orgId),

      pmchecklistNo: toolsInfo.pmCheckListNo || "",

      /* ====================================================================== 
         PRESENT LOCATION 
 
         Selected via getLocationForToolMaster; guarded so a 
         non-numeric option value (e.g. a location name, until the 
         backend returns a real id) doesn't send NaN. 
      ====================================================================== */

      presentLocation: toNullableNumber(toolsInfo.presentLocation),

      /* ====================================================================== 
         CUSTOMER ID 
 
         Purchase From 
      ====================================================================== */

      purchaseFrom: toNullableNumber(technicalInfo.purchaseFrom),

      remarks: toolsInfo.remarks || "",

      section: technicalInfo.section || "",

      serialNo: technicalInfo.serialNo || "",

      status: basic.status || "",

      toolCategory: basic.toolCategory || "",

      toolCost:
        technicalInfo.toolCost !== "" &&
        technicalInfo.toolCost !== null &&
        technicalInfo.toolCost !== undefined
          ? Number(technicalInfo.toolCost)
          : 0,

      toolDescription: basic.toolDescription || "",

      /* ====================================================================== 
         EMPLOYEE ID 
 
         Tool/Fixture Incharge 
      ====================================================================== */

      toolIncharge: toNullableNumber(toolsInfo.toolIncharge),

      toolName: basic.toolName || "",

      toolNo: basic.toolNo || "",

      /* ====================================================================== 
         CUSTOMER ID 
 
         Tool/Fixture Ownership 
      ====================================================================== */

      toolOwnership: toNullableNumber(toolsInfo.toolOwnership),

      toolUsedFor: toolsInfo.toolUsedFor || "",

      toolOwnerName: toolsInfo.toolOwnerName || "",

      type: toNullableNumber(basic.type),

      /* ====================================================================== 
         ATTACHMENTS 
      ====================================================================== */

      toolMasterAttachementDTO: attachedRows
        .filter((row) => row.id || row.fileName || row.name)
        .map((row) => ({
          ...(row.id
            ? {
                id: Number(row.id),
              }
            : {}),

          fileName: row.fileName || row.name || "",

          name: row.name || row.fileName || "",
        })),

      /* ====================================================================== 
         COMPONENT OUTPUT 
      ====================================================================== */

      toolMasterComponentOutPutDetailsDTO: componentRows
        .filter((row) => row.itemCode)
        .map((row) => ({
          ...(row.id
            ? {
                id: Number(row.id),
              }
            : {}),

          item: toNullableNumber(row.itemCode),
        })),

      /* ====================================================================== 
         MACHINE HISTORY 
      ====================================================================== */

      toolMasterMachineHistoryDetailsDTO: historyRows
        .filter(
          (row) =>
            row.date ||
            row.description ||
            row.changedDate ||
            row.cost ||
            row.purpose ||
            row.remarks,
        )
        .map((row) => ({
          ...(row.id
            ? {
                id: Number(row.id),
              }
            : {}),

          changedDate: row.changedDate || row.date || todayISO(),

          cost:
            row.cost !== "" && row.cost !== null && row.cost !== undefined
              ? Number(row.cost)
              : 0,

          date: row.date || todayISO(),

          description: row.description || "",

          purpose: row.purpose || "",

          remarks: row.remarks || "",
        })),

      /* ====================================================================== 
         SPARE DETAILS 
      ====================================================================== */

      toolMasterSpareDetailsDTO: spareRows
        .filter(
          (row) =>
            row.sparePartId ||
            row.sparePartDescription ||
            row.modelNo ||
            row.serialNo ||
            row.manufacturer,
        )
        .map((row) => ({
          ...(row.id
            ? {
                id: Number(row.id),
              }
            : {}),

          calibrationReq: row.calibrationReq === "YES" ? "YES" : "NO",

          lastCalibDate: row.lastCalibDate || "",

          manufacturer: row.manufacturer || "",

          modelNo: row.modelNo || "",

          nextCalibDate: row.nextCalibDate || "",

          serialNo: row.serialNo || "",

          sparePartId: toNullableNumber(row.sparePartId),

          warrantyTillDate: row.warrantyTillDate || "",
        })),
    };

    return payload;
  };

  /* ========================================================================== 
     SAVE 
  ========================================================================== */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const payload = buildPayload();

      /*
       * ============================================================
       * FILES
       * ============================================================
       */

      const files = [];

      // Main image
      if (imageInfo?.file instanceof File) {
        files.push(imageInfo.file);
      }

      // Attachments
      attachedRows.forEach((row) => {
        if (row?.file instanceof File) {
          files.push(row.file);
        }
      });

      /*
       * ============================================================
       * CREATE / UPDATE
       * ============================================================
       */

      const response = await toolsFixtureAPI.createUpdateToolMaster(
        payload,
        files,
      );

      /*
       * ============================================================
       * BACKEND RESPONSE
       *
       * Backend returns:
       *
       * {
       *   message: "...",
       *   toolMasterVO: {...}
       * }
       *
       * It does NOT return status=true.
       * ============================================================
       */

      const success =
        !!response &&
        (!!response?.toolMasterVO ||
          !!response?.message ||
          response?.status === true ||
          String(response?.statusFlag).toLowerCase() === "ok");

      if (success) {
        setToastMessage({
          type: "success",
          message:
            response?.message ||
            (data?.id
              ? "Tool/Fixture Updated Successfully!"
              : "Tool/Fixture Saved Successfully!"),
        });

        setTimeout(() => {
          onBack();
        }, 1500);

        return;
      }

      /*
       * ============================================================
       * NORMAL ERROR RESPONSE
       * ============================================================
       */

      setToastMessage({
        type: "error",
        message:
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.errorMessage ||
          response?.message ||
          "Failed to save Tool/Fixture",
      });
    } catch (error) {
      /*
       * ============================================================
       * SPRING VALIDATION ERRORS
       * ============================================================
       */

      const backendData = error?.response?.data;

      const backendErrors = backendData?.errors;

      const backendErrorText =
        Array.isArray(backendErrors) && backendErrors.length
          ? backendErrors
              .map(
                (e) =>
                  e?.longMessage ||
                  e?.shortMessage ||
                  e?.logMessage ||
                  e?.errorCode ||
                  "",
              )
              .filter(Boolean)
              .join("; ")
          : "";

      const message =
        backendErrorText ||
        backendData?.paramObjectsMap?.errorMessage ||
        backendData?.paramObjectsMap?.message ||
        backendData?.errorMessage ||
        backendData?.message ||
        error?.message ||
        "Error saving Tool/Fixture";

      setToastMessage({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================== 
     LOADING 
  ========================================================================== */

  if (isLoading) {
    return (
      <div className="p-2 max-w-7xl relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading Tool/Fixture data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================== 
     UI 
  ========================================================================== */

  return (
    <div className="p-2 max-w-7xl">
      {/* ====================================================================== 
         TOAST 
      ====================================================================== */}

      {toastMessage && (
        <div
          className={`mb-3 p-3 rounded-lg ${
            toastMessage.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          {toastMessage.message}
        </div>
      )}

      {/* ====================================================================== 
         HEADER 
      ====================================================================== */}

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Tool/Fixture" : "Add Tool/Fixture"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ==================================================================== 
           TOOL / FIXTURE DETAILS 
           (fields ordered to match the /updateCreateToolMaster payload) 
        ==================================================================== */}

        <div>
          <SectionHeader>Tool/Fixture Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Active"
              name="active"
              value={basic.active}
              onChange={handleBasicChange}
              options={YES_NO}
              required
            />

            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={basic.plantId}
              onChange={handleBasicChange}
              error={fieldErrors.plantId}
              options={plantData}
              required
            />

            <Field
              type="select"
              label="Department"
              name="department"
              value={basic.department}
              onChange={handleBasicChange}
              error={fieldErrors.department}
              options={departmentData}
              required
            />

            <Field
              label="Status"
              name="status"
              value={basic.status}
              onChange={handleBasicChange}
              error={fieldErrors.status}
              required
            />

            <Field
              label="Tool/Fixture Category"
              name="toolCategory"
              value={basic.toolCategory}
              onChange={handleBasicChange}
              error={fieldErrors.toolCategory}
              required
            />

            <Field
              label="Tool/Fixture Description"
              name="toolDescription"
              value={basic.toolDescription}
              onChange={handleBasicChange}
              error={fieldErrors.toolDescription}
              required
              className="col-span-2"
            />

            <Field
              label="Tool/Fixtures Name"
              name="toolName"
              value={basic.toolName}
              onChange={handleBasicChange}
            />

            <Field
              label="Tool No./Fixture No."
              name="toolNo"
              value={basic.toolNo}
              onChange={handleBasicChange}
              error={fieldErrors.toolNo}
              required
            />

            <Field
              type="select"
              label="Type"
              name="type"
              value={basic.type}
              onChange={handleBasicChange}
              error={fieldErrors.type}
              options={toolTypeOptions}
              required
            />
          </div>
        </div>

        {/* ==================================================================== 
           TABS 
        ==================================================================== */}

        <section className="mt-4 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap items-center border-b border-gray-200 dark:border-gray-700 mb-3">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeChildTab === tab.key
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            {/* ================================================================ 
               TOOLS 
               (fields ordered to match the payload: location, 
               pmchecklistNo, presentLocation, remarks, toolIncharge, 
               toolOwnership, toolUsedFor) 
            ================================================================ */}

            {activeChildTab === "tools" && (
              <div className={fieldGrid}>
                <Field
                  type="select"
                  label="Location"
                  name="location"
                  value={toolsInfo.location}
                  onChange={handleToolsInfoChange}
                  options={presentLocationData}
                  disabled={!basic.plantId}
                />

                <Field
                  label="PM Check List No."
                  name="pmCheckListNo"
                  value={toolsInfo.pmCheckListNo}
                  onChange={handleToolsInfoChange}
                />

                {/* ============================================================ 
                   PRESENT LOCATION 
 
                   API: 
                   toolsFixtureAPI.getLocationForToolMaster(branch, orgId) 
 
                   Options refresh whenever the Plant ID above changes. 
                ============================================================ */}

                <Field
                  type="select"
                  label="Present Location"
                  name="presentLocation"
                  value={toolsInfo.presentLocation}
                  onChange={handleToolsInfoChange}
                  options={presentLocationData}
                  disabled={!basic.plantId}
                />

                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={toolsInfo.remarks}
                  onChange={handleToolsInfoChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />

                {/* ============================================================ 
                   TOOL / FIXTURE INCHARGE 
 
                   ALL EMPLOYEES 
 
                   API: 
                   employeeAPI.getEmployeeByOrgId(orgId) 
                ============================================================ */}

                <Field
                  type="select"
                  label="Tool/Fixture Incharge"
                  name="toolIncharge"
                  value={toolsInfo.toolIncharge}
                  onChange={handleToolsInfoChange}
                  options={employeeData}
                />

                {/* ============================================================ 
                   TOOL / FIXTURE OWNERSHIP 
 
                   ALL CUSTOMERS 
 
                   API: 
                   partyMasterAPI.getPartyByOrgId(orgId, branch) 
                ============================================================ */}

                <Field
                  type="select"
                  label="Tool/Fixture Ownership"
                  name="toolOwnership"
                  value={toolsInfo.toolOwnership}
                  onChange={handleToolsInfoChange}
                  options={customerData}
                />

                <Field
                  label="Tool Owner Name"
                  name="toolOwnerName"
                  value={toolsInfo.toolOwnerName}
                  onChange={handleToolsInfoChange}
                />

                <Field
                  label="Tool/Fixture Used For"
                  name="toolUsedFor"
                  value={toolsInfo.toolUsedFor}
                  onChange={handleToolsInfoChange}
                />
              </div>
            )}

            {/* ================================================================ 
               TECHNICAL INFO 
               (fields ordered to match the payload: cavityNumber, 
               drawingNo, madeIn, manufacturedBy, modeOfPurchase, 
               purchaseFrom, section, serialNo, toolCost) 
            ================================================================ */}

            {activeChildTab === "technicalInfo" && (
              <div className={fieldGrid}>
                <Field
                  label="Cavity Number"
                  name="cavityNumber"
                  value={technicalInfo.cavityNumber}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  label="Drawing No"
                  name="drawingNo"
                  value={technicalInfo.drawingNo}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  type="select"
                  label="Made In"
                  name="madeIn"
                  value={technicalInfo.madeIn}
                  onChange={handleTechnicalInfoChange}
                  options={madeInOptions}
                />

                <Field
                  label="Manufactured By"
                  name="manufacturedBy"
                  value={technicalInfo.manufacturedBy}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  type="select"
                  label="Mode Of Purchase"
                  name="modeOfPurchase"
                  value={technicalInfo.modeOfPurchase}
                  onChange={handleTechnicalInfoChange}
                  options={modeOfPurchaseOptions}
                />

                {/* ============================================================ 
                   PURCHASE FROM 
 
                   ALL CUSTOMERS 
                ============================================================ */}

                <Field
                  type="select"
                  label="Purchase From"
                  name="purchaseFrom"
                  value={technicalInfo.purchaseFrom}
                  onChange={handleTechnicalInfoChange}
                  options={customerData}
                />

                <Field
                  label="Section"
                  name="section"
                  value={technicalInfo.section}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  label="Serial No"
                  name="serialNo"
                  value={technicalInfo.serialNo}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  type="number"
                  label="Tool Cost"
                  name="toolCost"
                  value={technicalInfo.toolCost}
                  onChange={handleTechnicalInfoChange}
                />

                {/* ============================================================ 
                   LIFE TYPE 
 
                   API: 
                   listOfValuesAPI.getListValuesGroup("LIFE TYPE", orgId) 
                ============================================================ */}

                <Field
                  type="select"
                  label="Life Type"
                  name="lifeType"
                  value={technicalDetailRows[0]?.lifeType ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("lifeType", e.target.value)
                  }
                  options={lifeTypeOptions}
                />

                {/* ============================================================ 
                   UNIT 
 
                   API: 
                   listOfValuesAPI.getUnitMasterByOrgId(orgId) 
 
                   Option value is the unit's id; label shown is unitId. 
                ============================================================ */}

                <Field
                  type="select"
                  label="Unit"
                  name="unit"
                  value={technicalDetailRows[0]?.unit ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("unit", e.target.value)
                  }
                  options={unitData}
                />
              </div>
            )}

            {/* ================================================================ 
               SPARE DETAILS 
            ================================================================ */}

            {activeChildTab === "spareDetails" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setSpareRows((previous) => [...previous, emptySpareRow()])
                    }
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">
                          #
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Spare Part Id
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Spare Part Description
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Model No
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Serial No
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Manufacturer
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Warranty Till Date
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Calibration Req?
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Last Calib. Date
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Next Calib. Date
                        </th>

                        <th className="p-1 w-16 text-center dark:text-white">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {spareRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-1 text-center font-medium dark:text-white">
                            {idx + 1}
                          </td>

                          <td className="p-1 align-top">
                            <select
                              value={row.sparePartId || ""}
                              onChange={(e) =>
                                handleSpareChange(
                                  idx,
                                  "sparePartId",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            >
                              <option value="">Select Item</option>

                              {itemData.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.sparePartDescription || ""}
                              onChange={(e) =>
                                handleSpareChange(
                                  idx,
                                  "sparePartDescription",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            />
                          </td>

                          {["modelNo", "serialNo", "manufacturer"].map(
                            (field) => (
                              <td className="p-1 align-top" key={field}>
                                <input
                                  type="text"
                                  value={row[field] || ""}
                                  onChange={(e) =>
                                    handleSpareChange(
                                      idx,
                                      field,
                                      e.target.value,
                                    )
                                  }
                                  className={controlClasses}
                                />
                              </td>
                            ),
                          )}

                          <td className="p-1 align-top">
                            <input
                              type="date"
                              value={row.warrantyTillDate || ""}
                              onChange={(e) =>
                                handleSpareChange(
                                  idx,
                                  "warrantyTillDate",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <select
                              value={row.calibrationReq || "NO"}
                              onChange={(e) =>
                                handleSpareChange(
                                  idx,
                                  "calibrationReq",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            >
                              {YES_NO.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {["lastCalibDate", "nextCalibDate"].map((field) => (
                            <td className="p-1 align-top" key={field}>
                              <input
                                type="date"
                                value={row[field] || ""}
                                onChange={(e) =>
                                  handleSpareChange(idx, field, e.target.value)
                                }
                                className={controlClasses}
                              />
                            </td>
                          ))}

                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (spareRows.length > 1) {
                                  setSpareRows((previous) =>
                                    previous.filter((_, i) => i !== idx),
                                  );
                                }
                              }}
                              disabled={spareRows.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                                spareRows.length <= 1
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
                  </table>
                </div>
              </div>
            )}

            {/* ================================================================ 
               COMPONENT OUTPUT 
            ================================================================ */}

            {activeChildTab === "componentOutput" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setComponentRows((previous) => [
                        ...previous,
                        emptyComponentRow(),
                      ])
                    }
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">
                          #
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Item Code
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Item Description
                        </th>

                        <th className="p-1 text-left dark:text-white">Unit</th>

                        <th className="p-1 w-20 text-center dark:text-white">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {componentRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-1 text-center font-medium dark:text-white">
                            {idx + 1}
                          </td>

                          <td className="p-1 align-top">
                            <select
                              value={row.itemCode || ""}
                              onChange={(e) =>
                                handleComponentItemChange(idx, e.target.value)
                              }
                              className={controlClasses}
                            >
                              <option value="">Select Item</option>

                              {itemData.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.itemDescription || ""}
                              readOnly
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.unit || ""}
                              readOnly
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (componentRows.length > 1) {
                                  setComponentRows((previous) =>
                                    previous.filter((_, i) => i !== idx),
                                  );
                                }
                              }}
                              disabled={componentRows.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                                componentRows.length <= 1
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
                  </table>
                </div>
              </div>
            )}

            {/* ================================================================ 
               MACHINE HISTORY 
            ================================================================ */}

            {activeChildTab === "machineHistory" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setHistoryRows((previous) => [
                        ...previous,
                        emptyHistoryRow(),
                      ])
                    }
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Plus size={12} />
                    Add Row
                  </button>
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">
                          #
                        </th>

                        <th className="p-1 text-left dark:text-white">Date</th>

                        <th className="p-1 text-left dark:text-white">
                          Description
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Changed Date
                        </th>

                        <th className="p-1 text-left dark:text-white">Cost</th>

                        <th className="p-1 text-left dark:text-white">
                          Purpose
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Remarks
                        </th>

                        <th className="p-1 w-16 text-center dark:text-white">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {historyRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-1 text-center font-medium dark:text-white">
                            {idx + 1}
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="date"
                              value={row.date || ""}
                              onChange={(e) =>
                                handleHistoryChange(idx, "date", e.target.value)
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.description || ""}
                              onChange={(e) =>
                                handleHistoryChange(
                                  idx,
                                  "description",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="date"
                              value={row.changedDate || ""}
                              onChange={(e) =>
                                handleHistoryChange(
                                  idx,
                                  "changedDate",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="number"
                              value={row.cost || ""}
                              onChange={(e) =>
                                handleHistoryChange(idx, "cost", e.target.value)
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.purpose || ""}
                              onChange={(e) =>
                                handleHistoryChange(
                                  idx,
                                  "purpose",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.remarks || ""}
                              onChange={(e) =>
                                handleHistoryChange(
                                  idx,
                                  "remarks",
                                  e.target.value,
                                )
                              }
                              className={controlClasses}
                            />
                          </td>

                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (historyRows.length > 1) {
                                  setHistoryRows((previous) =>
                                    previous.filter((_, i) => i !== idx),
                                  );
                                }
                              }}
                              disabled={historyRows.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                                historyRows.length <= 1
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
                  </table>
                </div>
              </div>
            )}

            {/* ================================================================ 
               IMAGE 
            ================================================================ */}

            {activeChildTab === "image" && (
              <div className={fieldGrid}>
                <Field
                  label="Tool/Fixtures Name"
                  name="name"
                  value={imageInfo.name}
                  onChange={(e) =>
                    setImageInfo((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }))
                  }
                  className="col-span-2"
                />

                <div className="w-full col-span-2">
                  <label className={labelClasses}>Tool/Fixtures Image</label>

                  <label
                    htmlFor="tool-image-upload"
                    className="flex flex-col items-center justify-center gap-1 h-24 rounded border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <UploadCloud size={16} />

                    <span>Click to upload an image</span>

                    <input
                      id="tool-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </label>
                </div>

                {imageInfo.previewUrl && (
                  <div className="w-full col-span-2">
                    <label className={labelClasses}>Preview</label>

                    <img
                      src={imageInfo.previewUrl}
                      alt={imageInfo.name || "Tool/Fixture"}
                      className="h-24 w-24 object-cover rounded border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ================================================================ 
               ATTACHED 
            ================================================================ */}

            {activeChildTab === "attached" && (
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-1 h-24 mb-3 rounded border border-dashed text-xs transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <UploadCloud size={16} />

                  <label
                    htmlFor="attached-files-upload"
                    className="cursor-pointer hover:text-blue-600"
                  >
                    Drop files here or click to upload
                  </label>

                  <input
                    id="attached-files-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleAttachedFiles(e.target.files)}
                  />
                </div>

                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="p-1 w-8 text-center dark:text-white">
                          #
                        </th>

                        <th className="p-1 text-left dark:text-white">
                          Attached Copy
                        </th>

                        <th className="p-1 w-16 text-center dark:text-white">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {attachedRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-3 text-center text-gray-400 dark:text-gray-500"
                          >
                            No files attached yet
                          </td>
                        </tr>
                      )}

                      {attachedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-1 text-center font-medium dark:text-white">
                            {idx + 1}
                          </td>

                          <td className="p-1 align-top">
                            <div className="flex items-center gap-1 dark:text-white">
                              <FileText size={12} />

                              {row.fileUrl ? (
                                <a
                                  href={row.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {row.fileName || row.name}
                                </a>
                              ) : (
                                <span>{row.fileName || row.name}</span>
                              )}
                            </div>
                          </td>

                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setAttachedRows((previous) =>
                                  previous.filter((_, i) => i !== idx),
                                )
                              }
                              className="h-5 w-5 rounded text-white flex items-center justify-center bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 size={10} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================== 
           BUTTONS 
        ==================================================================== */}

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

export default ToolsFixturesForm;
