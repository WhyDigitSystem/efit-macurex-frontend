import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

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
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
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
  productionWorkOrderNo: "",
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
  { key: "tools", label: "Tools" },
  { key: "technicalInfo", label: "Technical Info" },
  { key: "spareDetails", label: "Spare Details" },
  { key: "componentOutput", label: "Component Output Details" },
  { key: "machineHistory", label: "Machine History" },
  { key: "image", label: "Image" },
  { key: "attached", label: "Attached" },
];

/* ============================================================================
   HELPERS
============================================================================ */

const todayISO = () => new Date().toISOString().split("T")[0];

/*
 * Converts an empty/unselected dropdown value to null instead of 0.
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
        value.locationId ??
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
      value.category ||
      value.employeeName ||
      value.customerName ||
      value.partyName ||
      value.branchName ||
      value.departmentName ||
      value.itemDescription ||
      value.valuesDescription ||
      value.description ||
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

  const [showErrors, setShowErrors] = useState(false);

  const [gridErrors, setGridErrors] = useState({
    spareRows: [],
    componentRows: [],
    historyRows: [],
  });

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

  const [pmChecklistData, setPmChecklistData] = useState([]);

  /*
   * Always-current copy of itemData so the edit mapper can look up item
   * descriptions WITHOUT depending on itemData (which used to make
   * fetchToolData change every time items loaded, re-fetching the record
   * and wiping whatever the user had already typed).
   */
  const itemDataRef = useRef([]);

  /* ==========================================================================
     FORM STATE
  ========================================================================== */

  const [basic, setBasic] = useState(emptyBasicInfo());

  const [toolsInfo, setToolsInfo] = useState(emptyToolsInfo());

  const [technicalInfo, setTechnicalInfo] = useState(emptyTechnicalInfo());

  const [spareRows, setSpareRows] = useState([emptySpareRow()]);

  const [componentRows, setComponentRows] = useState([emptyComponentRow()]);

  const [historyRows, setHistoryRows] = useState([emptyHistoryRow()]);

  const [technicalDetailRows, setTechnicalDetailRows] = useState([]);

  /* ==========================================================================
     IMAGE
  ========================================================================== */

  const [imageInfo, setImageInfo] = useState({
    name: "",
    file: null,
    previewUrl: "",
  });

  /* ==========================================================================
     ATTACHMENTS
  ========================================================================== */

  const [attachedRows, setAttachedRows] = useState([]);

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
     LOAD ALL EMPLOYEES  (Tool/Fixture Incharge)
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
     LOAD ALL CUSTOMERS  (Tool/Fixture Ownership, Purchase From)
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
     LOAD PM CHECKLISTS

     PM Check List No (Tools tab):
     API = toolsFixtureAPI.getPMCheckListMasterByOrgId(branch, orgId)
     -> GET /api/vendorComplaintEntry/getPMCheckListMasterByOrgId

     Response: paramObjectsMap.pmCheckListMasterVO = [
       { id, pmCheckListNo, ... }
     ]

     Option value = id, label = pmCheckListNo.
     Scoped to the Plant ID selected on the form (basic.plantId).
  ========================================================================== */

  const loadPmChecklists = useCallback(async () => {
    if (!orgId || !basic.plantId) {
      setPmChecklistData([]);
      return;
    }

    try {
      const response = await toolsFixtureAPI.getPMCheckListMasterByOrgId(
        basic.plantId,
        orgId,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.pmCheckListMasterVO ||
          response?.paramObjectsMap?.pmCheckListMaster ||
          [];

      const options = (Array.isArray(list) ? list : [])
        .map((item) => {
          const checklistId = item.id ?? "";

          return {
            value: checklistId,
            label: item.pmCheckListNo || String(checklistId),
          };
        })
        .filter((item) => item.value !== "");

      setPmChecklistData(options);
    } catch (error) {
      setPmChecklistData([]);
    }
  }, [orgId, basic.plantId]);

  /* ==========================================================================
     LOAD PRESENT LOCATION OPTIONS (depends on selected Plant ID)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
     LOAD PLANT-DEPENDENT MASTERS (Present Location + PM Checklist)
  ========================================================================== */

  useEffect(() => {
    loadPresentLocationOptions();
  }, [loadPresentLocationOptions]);

  useEffect(() => {
    loadPmChecklists();
  }, [loadPmChecklists]);

  /* ==========================================================================
     KEEP itemDataRef IN SYNC + BACK-FILL DESCRIPTIONS

     When editing, the record can come back before the item master has
     finished loading. Once items arrive, fill in any blank
     description/unit for Component Output rows and Spare rows.
  ========================================================================== */

  useEffect(() => {
    itemDataRef.current = itemData;

    if (!itemData.length) {
      return;
    }

    const findItem = (id) =>
      itemData.find((item) => String(item.value) === String(id));

    setComponentRows((previous) =>
      previous.map((row) => {
        if (!row.itemCode) return row;

        const selected = findItem(row.itemCode);

        if (!selected) return row;

        return {
          ...row,
          itemDescription: row.itemDescription || selected.itemDescription,
          unit: row.unit || selected.unit,
        };
      }),
    );

    setSpareRows((previous) =>
      previous.map((row) => {
        if (!row.sparePartId || row.sparePartDescription) return row;

        const selected = findItem(row.sparePartId);

        if (!selected) return row;

        return {
          ...row,
          sparePartDescription: selected.itemDescription,
        };
      }),
    );
  }, [itemData]);

  /* ==========================================================================
     MAP getToolMasterById RESPONSE -> FORM STATE

     Stable callback (no dependency on itemData) so the record is only
     fetched once per tool id.
  ========================================================================== */

  const mapApiResponseToForm = useCallback((apiData) => {
    const currentItems = itemDataRef.current || [];

    /*
     * Technical detail values: use the nested array when the backend
     * sends one, otherwise fall back to the flat fields on the root
     * (that is the shape updateCreateToolMaster accepts, and getById
     * often mirrors it).
     */
    const normalizeTechnicalRow = (row) => ({
      ...row,

      completedLifeCycle: row.completedLifeCycle ?? 0,

      lifeOfTool: row.lifeOfTool ?? "",

      lifeType: getMasterId(row.lifeType),

      noOfStokesCompleted: row.noOfStokesCompleted ?? 0,

      reconditionFreq: row.reconditionFreq ?? 0,

      reconditionedDate: row.reconditionedDate || "",

      setUpTimeInMinutes: row.setUpTimeInMinutes ?? 0,

      strokesCompletedAfterReconditioning:
        row.strokesCompletedAfterReconditioning ?? 0,

      technicalSpecification: row.technicalSpecification || "",

      toolFixtureAmortizedRecovered: row.toolFixtureAmortizedRecovered ?? 0,

      toolFixtureCost: row.toolFixtureCost ?? 0,

      toolFixtureSize: row.toolFixtureSize || "",

      toolMadeOf: row.toolMadeOf || "",

      toolWeight: row.toolWeight ?? 0,

      unit: getMasterId(row.unit),
    });

    const technicalArray = Array.isArray(
      apiData.toolMasterTechnicalInfoDetailsDTO,
    )
      ? apiData.toolMasterTechnicalInfoDetailsDTO
      : [];

    const technicalSource = technicalArray.length ? technicalArray : [apiData];

    /*
     * Image: backend may send a string (file name/path) or an object.
     */
    const imageRaw = apiData.image;

    const imageName =
      imageRaw && typeof imageRaw === "object"
        ? imageRaw.fileName || imageRaw.name || ""
        : imageRaw || "";

    const imagePath =
      imageRaw && typeof imageRaw === "object"
        ? imageRaw.fileUrl || imageRaw.filePath || ""
        : imageRaw || "";

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
        /*
         * PM Checklist id (matches option value from
         * getPMCheckListMasterByOrgId).
         */
        pmCheckListNo: getMasterId(apiData.pmchecklistNo),

        productionWorkOrderNo: apiData.productionWorkOrderNo || "",

        location: getMasterId(apiData.location),

        toolIncharge: getMasterId(apiData.toolIncharge),

        toolUsedFor: apiData.toolUsedFor || "",

        toolOwnership: getMasterId(apiData.toolOwnership),

        toolOwnerName: apiData.toolOwnerName || "",

        presentLocation: getMasterId(apiData.presentLocation),

        remarks: apiData.remarks || "",
      },

      technicalInfo: {
        drawingNo: apiData.drawingNo || "",

        serialNo: apiData.serialNo || "",

        manufacturedBy: apiData.manufacturedBy || "",

        section: getMasterName(apiData.section),

        madeIn: getMasterId(apiData.madeIn),

        purchaseFrom: getMasterId(apiData.purchaseFrom),

        modeOfPurchase: getMasterId(apiData.modeOfPurchase),

        toolCost:
          apiData.toolCost !== null && apiData.toolCost !== undefined
            ? String(apiData.toolCost)
            : "",

        cavityNumber: apiData.cavityNumber || "",
      },

      technicalDetailRows: technicalSource.map(normalizeTechnicalRow),

      spareDetails: Array.isArray(apiData.toolMasterSpareDetailsDTO)
        ? apiData.toolMasterSpareDetailsDTO.map((row) => {
            const sparePartId =
              row.sparePartId !== null && row.sparePartId !== undefined
                ? getMasterId(row.sparePartId)
                : "";

            const sparePartObject =
              row.sparePartId && typeof row.sparePartId === "object"
                ? row.sparePartId
                : null;

            const selectedItem = currentItems.find(
              (item) => String(item.value) === String(sparePartId),
            );

            return {
              id: row.id || 0,

              sparePartId,

              sparePartDescription:
                row.sparePartDescription ||
                sparePartObject?.itemDescription ||
                selectedItem?.itemDescription ||
                "",

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
            };
          })
        : [],

      componentOutput: Array.isArray(
        apiData.toolMasterComponentOutPutDetailsDTO,
      )
        ? apiData.toolMasterComponentOutPutDetailsDTO.map((row) => {
            const itemId = getMasterId(row.item);

            const itemObject =
              row.item && typeof row.item === "object" ? row.item : null;

            const selectedItem = currentItems.find(
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

      machineHistory: Array.isArray(apiData.toolMasterMachineHistoryDetailsDTO)
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

      image: {
        name: imageName,

        file: null,

        previewUrl: imagePath ? toolsFixtureAPI.getViewFileUrl(imagePath) : "",
      },

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
  }, []);

  /* ==========================================================================
     FETCH TOOL MASTER (getToolMasterById)
  ========================================================================== */

  const fetchToolData = useCallback(
    async (id) => {
      setIsLoading(true);

      try {
        const response = await toolsFixtureAPI.getToolMasterById(id);

        const rawData =
          response?.paramObjectsMap?.toolMasterVO ||
          response?.paramObjectsMap?.toolMaster ||
          response?.paramObjectsMap?.toolFixture ||
          response?.paramObjectsMap?.toolMasterDetails ||
          response;

        /* backend may wrap the record in an array */
        const apiData = Array.isArray(rawData) ? rawData[0] : rawData;

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

        setBasic({ ...emptyBasicInfo(), ...formData.basic });

        setToolsInfo({ ...emptyToolsInfo(), ...formData.toolsInfo });

        setTechnicalInfo({
          ...emptyTechnicalInfo(),
          ...formData.technicalInfo,
        });

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
     Runs once per tool id (fetchToolData is stable now).
  ========================================================================== */

  useEffect(() => {
    if (data?.id) {
      fetchToolData(data.id);
    }
  }, [data?.id, fetchToolData]);

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

  const handleBasicChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    setBasic((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
     * Location, Present Location and PM Check List No are all scoped to
     * the selected plant, so clear them when the user switches plants
     * to avoid saving an id that belongs to another plant.
     */
    if (name === "plantId") {
      setToolsInfo((previous) => ({
        ...previous,
        location: "",
        presentLocation: "",
        pmCheckListNo: "",
      }));
    }
  };

  const handleToolsInfoChange = makeChangeHandler(setToolsInfo);

  const handleTechnicalInfoChange = makeChangeHandler(setTechnicalInfo);

  /* ==========================================================================
     TECHNICAL DETAIL CHANGE (Life Type, Unit, etc.)
  ========================================================================== */

  const handleTechnicalDetailChange = (field, value) => {
    setFieldErrors((previous) =>
      previous[field] ? { ...previous, [field]: "" } : previous,
    );

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

    if (value) {
      setGridErrors((previous) => ({
        ...previous,
        componentRows: previous.componentRows.filter((i) => i !== index),
      }));
    }

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
    if (field === "sparePartId" && value) {
      setGridErrors((previous) => ({
        ...previous,
        spareRows: previous.spareRows.filter((i) => i !== index),
      }));
    }

    setSpareRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const updated = { ...row, [field]: value };

        /* auto-fill description when a spare part is picked */
        if (field === "sparePartId") {
          const selected = itemData.find(
            (item) => String(item.value) === String(value),
          );

          updated.sparePartDescription = selected?.itemDescription || "";
        }

        return updated;
      }),
    );
  };

  /* ==========================================================================
     HISTORY CHANGE
  ========================================================================== */

  const handleHistoryChange = (index, field, value) => {
    if (field === "date" && value) {
      setGridErrors((previous) => ({
        ...previous,
        historyRows: previous.historyRows.filter((i) => i !== index),
      }));
    }

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

    if (!toolsInfo.location) {
      errors.location = "Location Name is required";
    }

    if (!technicalDetailRows[0]?.unit) {
      errors.unit = "Unit is required";
    }

    if (!technicalDetailRows[0]?.lifeType) {
      errors.lifeType = "Life Type is required";
    }

    const spareMissing = [];
    spareRows.forEach((row, index) => {
      const hasContent =
        row.sparePartId ||
        row.sparePartDescription ||
        row.modelNo ||
        row.serialNo ||
        row.manufacturer ||
        row.warrantyTillDate ||
        row.calibrationReq !== "NO" ||
        row.lastCalibDate ||
        row.nextCalibDate;

      if (hasContent && !row.sparePartId) {
        spareMissing.push(index);
      }
    });

    const componentMissing = [];
    componentRows.forEach((row, index) => {
      const hasContent = row.itemCode || row.itemDescription || row.unit;

      if (hasContent && !row.itemCode) {
        componentMissing.push(index);
      }
    });

    const historyMissing = [];
    historyRows.forEach((row, index) => {
      const hasContent =
        row.date ||
        row.description ||
        row.changedDate ||
        row.cost ||
        row.purpose ||
        row.remarks;

      if (hasContent && !row.date) {
        historyMissing.push(index);
      }
    });

    setGridErrors({
      spareRows: spareMissing,
      componentRows: componentMissing,
      historyRows: historyMissing,
    });

    const hasGridErrors =
      spareMissing.length || componentMissing.length || historyMissing.length;

    setFieldErrors(errors);

    return Object.keys(errors).length === 0 && !hasGridErrors;
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
    /*
     * Technical detail fields live directly on the ROOT ToolMasterDTO
     * for /api/toolmaster/updateCreateToolMaster, so the first
     * technical-detail row is flattened onto the payload root.
     */
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

      toolFixtureCost: Number(technicalDetail.toolFixtureCost || 0),

      toolFixtureSize: technicalDetail.toolFixtureSize || "",

      toolMadeOf: technicalDetail.toolMadeOf || "",

      toolWeight: Number(technicalDetail.toolWeight || 0),

      unit: toNullableNumber(technicalDetail.unit),
    };

    const payload = {
      ...technicalFlatFields,

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

      /*
       * PM Checklist: option value is the PM checklist master id
       * (from getPMCheckListMasterByOrgId).
       */
      pmchecklistNo: toNullableNumber(toolsInfo.pmCheckListNo),

      productionWorkOrderNo: toolsInfo.productionWorkOrderNo || "",

      presentLocation: toNullableNumber(toolsInfo.presentLocation),

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

      toolIncharge: toNullableNumber(toolsInfo.toolIncharge),

      toolName: basic.toolName || "",

      toolNo: basic.toolNo || "",

      toolOwnership: toNullableNumber(toolsInfo.toolOwnership),

      toolUsedFor: toolsInfo.toolUsedFor || "",

      toolOwnerName: toolsInfo.toolOwnerName || "",

      type: toNullableNumber(basic.type),

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
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const payload = buildPayload();

      const files = [];

      if (imageInfo?.file instanceof File) {
        files.push(imageInfo.file);
      }

      attachedRows.forEach((row) => {
        if (row?.file instanceof File) {
          files.push(row.file);
        }
      });

      const response = await toolsFixtureAPI.createUpdateToolMaster(
        payload,
        files,
      );

      /*
       * Backend returns { message, toolMasterVO } and NOT status=true.
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
        {/* TOOL / FIXTURE DETAILS */}

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

        {/* TABS */}

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
                  error={fieldErrors.location}
                  required
                />

                {/* PM CHECK LIST NO
                    API: toolsFixtureAPI.getPMCheckListMasterByOrgId(plantId, orgId)
                    Options refresh whenever the Plant ID changes. */}
                <Field
                  type="select"
                  label="PM Check List No"
                  name="pmCheckListNo"
                  value={toolsInfo.pmCheckListNo}
                  onChange={handleToolsInfoChange}
                  options={pmChecklistData}
                  disabled={!basic.plantId}
                />

                <Field
                  label="Tool/Fixture Production Work Order No"
                  name="productionWorkOrderNo"
                  value={toolsInfo.productionWorkOrderNo}
                  onChange={handleToolsInfoChange}
                />

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

                <Field
                  type="select"
                  label="Tool/Fixture Incharge"
                  name="toolIncharge"
                  value={toolsInfo.toolIncharge}
                  onChange={handleToolsInfoChange}
                  options={employeeData}
                />

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
                  label="Total Tool/Fixture Cost"
                  name="toolCost"
                  value={technicalInfo.toolCost}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  type="select"
                  label="Life Type"
                  name="lifeType"
                  value={technicalDetailRows[0]?.lifeType ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("lifeType", e.target.value)
                  }
                  options={lifeTypeOptions}
                  error={fieldErrors.lifeType}
                  required
                />

                <Field
                  type="select"
                  label="Unit"
                  name="unit"
                  value={technicalDetailRows[0]?.unit ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("unit", e.target.value)
                  }
                  options={unitData}
                  error={fieldErrors.unit}
                  required
                />

                <Field
                  type="number"
                  label="Tool/Fixture Weight"
                  name="toolWeight"
                  value={technicalDetailRows[0]?.toolWeight ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("toolWeight", e.target.value)
                  }
                />

                <Field
                  label="Tool/Fixture Size"
                  name="toolFixtureSize"
                  value={technicalDetailRows[0]?.toolFixtureSize ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "toolFixtureSize",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="number"
                  label="Life of Tool/Fixture"
                  name="lifeOfTool"
                  value={technicalDetailRows[0]?.lifeOfTool ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("lifeOfTool", e.target.value)
                  }
                />

                <Field
                  type="number"
                  label="Recondition Frequency"
                  name="reconditionFreq"
                  value={technicalDetailRows[0]?.reconditionFreq ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "reconditionFreq",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="number"
                  label="Setup Time (Minutes)"
                  name="setUpTimeInMinutes"
                  value={technicalDetailRows[0]?.setUpTimeInMinutes ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "setUpTimeInMinutes",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="number"
                  label="Completed Life Cycle"
                  name="completedLifeCycle"
                  value={technicalDetailRows[0]?.completedLifeCycle ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "completedLifeCycle",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="date"
                  label="Re-Conditioned Date"
                  name="reconditionedDate"
                  value={technicalDetailRows[0]?.reconditionedDate ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "reconditionedDate",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="number"
                  label="No. of Strokes Completed"
                  name="noOfStokesCompleted"
                  value={technicalDetailRows[0]?.noOfStokesCompleted ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "noOfStokesCompleted",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="number"
                  label="Strokes Completed After Reconditioning"
                  name="strokesCompletedAfterReconditioning"
                  value={
                    technicalDetailRows[0]
                      ?.strokesCompletedAfterReconditioning ?? ""
                  }
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "strokesCompletedAfterReconditioning",
                      e.target.value,
                    )
                  }
                />

                <Field
                  label="Tool/Fixture Made Of"
                  name="toolMadeOf"
                  value={technicalDetailRows[0]?.toolMadeOf ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange("toolMadeOf", e.target.value)
                  }
                />

                <Field
                  type="number"
                  label="Tool/Fixture Cost per Stroke"
                  name="toolFixtureCost"
                  value={technicalDetailRows[0]?.toolFixtureCost ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "toolFixtureCost",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="number"
                  label="Tool/Fixture Amortized Recovered"
                  name="toolFixtureAmortizedRecovered"
                  value={
                    technicalDetailRows[0]?.toolFixtureAmortizedRecovered ?? ""
                  }
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "toolFixtureAmortizedRecovered",
                      e.target.value,
                    )
                  }
                />

                <Field
                  type="textarea"
                  label="Technical Specifications"
                  name="technicalSpecification"
                  value={technicalDetailRows[0]?.technicalSpecification ?? ""}
                  onChange={(e) =>
                    handleTechnicalDetailChange(
                      "technicalSpecification",
                      e.target.value,
                    )
                  }
                  className="col-span-2 md:col-span-4 xl:col-span-6"
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
                              className={`${controlClasses} ${
                                showErrors && gridErrors.spareRows.includes(idx)
                                  ? " border-red-500 focus:border-red-500"
                                  : ""
                              }`}
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

                {showErrors && gridErrors.spareRows.length > 0 && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                    Spare Part Id is required for the highlighted row(s)
                  </p>
                )}
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
                              className={`${controlClasses} ${
                                showErrors &&
                                gridErrors.componentRows.includes(idx)
                                  ? " border-red-500 focus:border-red-500"
                                  : ""
                              }`}
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

                {showErrors && gridErrors.componentRows.length > 0 && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                    Item Code is required for the highlighted row(s)
                  </p>
                )}
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
                              className={`${controlClasses} ${
                                showErrors &&
                                gridErrors.historyRows.includes(idx)
                                  ? " border-red-500 focus:border-red-500"
                                  : ""
                              }`}
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

                {showErrors && gridErrors.historyRows.length > 0 && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                    Date is required for the highlighted row(s)
                  </p>
                )}
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
