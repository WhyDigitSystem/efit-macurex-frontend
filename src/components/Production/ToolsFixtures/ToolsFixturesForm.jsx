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

/* ---------------------------------------------------------------------------- */
/* Shared design tokens (kept identical to PartyMasterForm for visual parity)   */

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

/* ---------------------------------------------------------------------------- */
/* Shared building blocks (identical API to PartyMasterForm's Field component)  */

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
          value={value}
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
            <option key={opt.value} value={opt.value}>
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
          value={value}
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
        value={value}
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
/* Hardcoded options (for fields not in ListOfValues)                           */

const YES_NO = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

const MADE_IN_OPTIONS = [
  { value: "INDIA", label: "INDIA" },
  { value: "FRANCE", label: "FRANCE" },
  { value: "GERMANY", label: "GERMANY" },
  { value: "JAPAN", label: "JAPAN" },
  { value: "CHINA", label: "CHINA" },
];

const MODE_OF_PURCHASE_OPTIONS = [
  { value: "BY CHEQUE", label: "BY CHEQUE" },
  { value: "CASH", label: "CASH" },
  { value: "P.D.C.", label: "P.D.C." },
  { value: "RTGS", label: "RTGS" },
];

const OWNERSHIP_OPTIONS = [
  { value: "Owned", label: "Owned" },
  { value: "Leased", label: "Leased" },
  { value: "Rented", label: "Rented" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Under Maintenance", label: "Under Maintenance" },
  { value: "Scrapped", label: "Scrapped" },
  { value: "Inactive", label: "Inactive" },
];

/* ---------------------------------------------------------------------------- */
/* Empty state shapes                                                           */

const emptyBasicInfo = () => ({
  plantId: "",
  type: "",
  department: "",
  toolNo: "",
  toolDescription: "",
  toolCategory: "",
  status: "",
  active: "YES",
});

const emptyToolsInfo = () => ({
  productionWorkOrderNo: "",
  pmCheckListNo: "",
  locationName: "",
  toolIncharge: "",
  usedFor: "",
  ownership: "",
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
  purchasedFrom: "",
  modeOfPurchase: "",
  totalCost: "",
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

/* ---------------------------------------------------------------------------- */
/* Tab configuration                                                            */

const CHILD_TABS = [
  { key: "tools", label: "Tools" },
  { key: "technicalInfo", label: "Technical Info" },
  { key: "spareDetails", label: "Spare Details" },
  { key: "componentOutput", label: "Component Output Details" },
  { key: "machineHistory", label: "Machine History" },
  { key: "image", label: "Image" },
  { key: "attached", label: "Attached" },
];

/* ---------------------------------------------------------------------------- */

const ToolsFixturesForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branch] = useState(localStorage.getItem("branchId"));
  const [activeChildTab, setActiveChildTab] = useState("tools");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // API-loaded options
  const [listOfValuesData, setListOfValuesData] = useState({});
  const [plantData, setPlantData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);

  const toolTypeOptions = listOfValuesData.toolType || [];
  const toolCategoryOptions = listOfValuesData.toolCategory || [];
  const sectionOptions = listOfValuesData.section || [];

  const [basic, setBasic] = useState({ ...emptyBasicInfo(), ...data?.basic });
  const [toolsInfo, setToolsInfo] = useState({
    ...emptyToolsInfo(),
    ...data?.toolsInfo,
  });
  const [technicalInfo, setTechnicalInfo] = useState({
    ...emptyTechnicalInfo(),
    ...data?.technicalInfo,
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

  // Image tab
  const [imageInfo, setImageInfo] = useState({
    name: data?.image?.name || "",
    file: null,
    previewUrl: data?.image?.previewUrl || "",
  });

  // Attached tab (list of uploaded files)
  const [attachedRows, setAttachedRows] = useState(
    data?.attached?.length ? data.attached : [],
  );
  const [isDragging, setIsDragging] = useState(false);

  const LIST_OF_VALUES_GROUPS = {
    toolCategory: "Tool Category",
    toolType: "Tool Type",
    section: "Section",
  };

  useEffect(() => {
    loadListOfValuesData();
    loadBranches();
    loadDepartments();
    loadItems();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (data && data.id) {
      fetchToolData(data.id);
    }
  }, [data]);

  const fetchToolData = async (id) => {
    setIsLoading(true);
    try {
      const response = await toolsFixtureAPI.getToolById(id);
      const apiData = response?.paramObjectsMap?.toolFixture || response;

      if (apiData) {
        const formData = mapApiResponseToForm(apiData);
        setBasic(formData.basic);
        setToolsInfo(formData.toolsInfo);
        setTechnicalInfo(formData.technicalInfo);
        if (formData.spareDetails) setSpareRows(formData.spareDetails);
        if (formData.componentOutput)
          setComponentRows(formData.componentOutput);
        if (formData.machineHistory) setHistoryRows(formData.machineHistory);
        if (formData.image) setImageInfo(formData.image);
        if (formData.attached) setAttachedRows(formData.attached);
      } else {
        setToastMessage({
          type: "error",
          message: "Tool/Fixture data not found",
        });
      }
    } catch (error) {
      console.error("Error fetching tool/fixture data:", error);
      setToastMessage({
        type: "error",
        message: "Failed to load Tool/Fixture data for editing",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiResponseToForm = (apiData) => {
    const getId = (obj) => (obj?.id ? String(obj.id) : "");

    return {
      basic: {
        id: apiData.id || 0,
        plantId: getId(apiData.branch),
        type: apiData.type || "",
        department: getId(apiData.department),
        toolNo: apiData.toolNo || "",
        toolDescription: apiData.toolDescription || "",
        toolCategory: getId(apiData.toolCategory),
        status: apiData.status || "",
        active:
          apiData.active === "Active" || apiData.active === true ? "YES" : "NO",
      },
      toolsInfo: {
        productionWorkOrderNo: apiData.productionWorkOrderNo || "",
        pmCheckListNo: apiData.pmCheckListNo || "",
        locationName: apiData.locationName || "",
        toolIncharge: getId(apiData.toolIncharge),
        usedFor: apiData.usedFor || "",
        ownership: apiData.ownership || "",
        toolOwnerName: apiData.toolOwnerName || "",
        presentLocation: apiData.presentLocation || "",
        remarks: apiData.remarks || "",
      },
      technicalInfo: {
        drawingNo: apiData.drawingNo || "",
        serialNo: apiData.serialNo || "",
        manufacturedBy: apiData.manufacturedBy || "",
        section: getId(apiData.section),
        madeIn: apiData.madeIn || "",
        purchasedFrom: apiData.purchasedFrom || "",
        modeOfPurchase: apiData.modeOfPurchase || "",
        totalCost: apiData.totalToolCost?.toString() || "",
        cavityNumber: apiData.cavityNumber || "",
      },
      spareDetails: apiData.spareDetails?.length
        ? apiData.spareDetails.map((row) => ({
            sparePartId: row.sparePartId || "",
            sparePartDescription: row.sparePartDescription || "",
            modelNo: row.modelNo || "",
            serialNo: row.serialNo || "",
            manufacturer: row.manufacturer || "",
            warrantyTillDate: row.warrantyTillDate || "",
            calibrationReq: row.calibrationReq ? "YES" : "NO",
            lastCalibDate: row.lastCalibDate || "",
            nextCalibDate: row.nextCalibDate || "",
          }))
        : [emptySpareRow()],
      componentOutput: apiData.componentOutputDetails?.length
        ? apiData.componentOutputDetails.map((row) => ({
            itemCode: row.item?.id ? String(row.item.id) : "",
            itemDescription: row.item?.itemDescription || "",
            unit: row.item?.unit?.unitId || "",
          }))
        : [emptyComponentRow()],
      machineHistory: apiData.machineHistory?.length
        ? apiData.machineHistory.map((row) => ({
            date: row.date || "",
            description: row.description || "",
            changedDate: row.changedDate || "",
            cost: row.cost?.toString() || "",
            purpose: row.purpose || "",
            remarks: row.remarks || "",
          }))
        : [emptyHistoryRow()],
      image: {
        name: apiData.toolImageName || "",
        file: null,
        previewUrl: apiData.toolImageUrl || "",
      },
      attached: apiData.attachments?.length
        ? apiData.attachments.map((row) => ({
            fileName: row.fileName || "",
            fileUrl: row.fileUrl || "",
            file: null,
          }))
        : [],
    };
  };

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map((b) => ({
        value: b.id,
        label: b.branchName,
      }));
      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
    }
  }, [orgId]);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAllDepartments(orgId);
      const departments = response?.paramObjectsMap?.departmentVO || [];
      const options = departments.map((item) => ({
        value: item.id,
        label: item.departmentName,
      }));
      setDepartmentData(options);
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentData([]);
    }
  }, [orgId]);

  const loadItems = useCallback(async () => {
    try {
      const response = await itemAPI.getItems(orgId, branch);
      const options = (response || []).map((item) => ({
        value: item.id,
        label: item.itemCode,
        itemDescription: item.itemDescription,
        unit: item.primaryUnits?.primaryUnit,
      }));
      setItemData(options);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemData([]);
    }
  }, [orgId, branch]);

  const loadEmployees = useCallback(async () => {
    try {
      // TODO: point this at whatever employee/user list endpoint your app already uses
      const response = await employeeAPI.getEmployeesByOrgId(orgId, branch);
      const options = (response || []).map((item) => ({
        value: item.employeeId ?? item.id,
        label: item.employeeName ?? item.name,
      }));
      setEmployeeData(options);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeData([]);
    }
  }, [orgId, branch]);

  const loadListOfValuesData = async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(
              group,
              orgId,
            );
            result[key] = Array.isArray(response)
              ? response.map((item) => ({
                  value: item.id,
                  label: item.valuesDescription,
                  ...item,
                }))
              : [];
          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        }),
      );

      setListOfValuesData(result);
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  };

  const makeChangeHandler = (setter) => (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleBasicChange = makeChangeHandler(setBasic);
  const handleToolsInfoChange = makeChangeHandler(setToolsInfo);
  const handleTechnicalInfoChange = makeChangeHandler(setTechnicalInfo);

  const handleComponentItemChange = (index, value) => {
    const selectedItem = itemData.find(
      (item) => String(item.value) === String(value),
    );
    const newRows = [...componentRows];
    newRows[index] = {
      ...newRows[index],
      itemCode: value,
      itemDescription: selectedItem?.itemDescription || "",
      unit: selectedItem?.unit || "",
    };
    setComponentRows(newRows);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageInfo((prev) => ({
      ...prev,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const handleAttachedFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const newRows = files.map((file) => ({
      fileName: file.name,
      file,
      fileUrl: "",
    }));
    setAttachedRows((prev) => [...prev, ...newRows]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleAttachedFiles(e.dataTransfer.files);
  };

  const validate = () => {
    const errors = {};

    if (!basic.toolNo.trim())
      errors.toolNo = "Tool No./Fixture No. is required";
    if (!basic.toolDescription.trim())
      errors.toolDescription = "Tool/Fixture Description is required";
    if (!basic.plantId) errors.plantId = "Plant ID is required";
    if (!basic.department) errors.department = "Department is required";
    if (!basic.toolCategory)
      errors.toolCategory = "Tool/Fixture Category is required";
    if (!basic.status) errors.status = "Status is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      id: data?.id || 0,
      orgId: Number(orgId),
      branch: basic.plantId ? Number(basic.plantId) : 0,
      type: basic.type || "",
      department: basic.department ? Number(basic.department) : 0,
      toolNo: basic.toolNo || "",
      toolDescription: basic.toolDescription || "",
      toolCategory: basic.toolCategory ? Number(basic.toolCategory) : 0,
      status: basic.status || "",
      active: basic.active === "YES",

      productionWorkOrderNo: toolsInfo.productionWorkOrderNo || "",
      pmCheckListNo: toolsInfo.pmCheckListNo || "",
      locationName: toolsInfo.locationName || "",
      toolIncharge: toolsInfo.toolIncharge ? Number(toolsInfo.toolIncharge) : 0,
      usedFor: toolsInfo.usedFor || "",
      ownership: toolsInfo.ownership || "",
      toolOwnerName: toolsInfo.toolOwnerName || "",
      presentLocation: toolsInfo.presentLocation || "",
      remarks: toolsInfo.remarks || "",

      drawingNo: technicalInfo.drawingNo || "",
      serialNo: technicalInfo.serialNo || "",
      manufacturedBy: technicalInfo.manufacturedBy || "",
      section: technicalInfo.section ? Number(technicalInfo.section) : 0,
      madeIn: technicalInfo.madeIn || "",
      purchasedFrom: technicalInfo.purchasedFrom || "",
      modeOfPurchase: technicalInfo.modeOfPurchase || "",
      totalToolCost: technicalInfo.totalCost
        ? Number(technicalInfo.totalCost)
        : 0,
      cavityNumber: technicalInfo.cavityNumber || "",

      spareDetailsDTO: spareRows
        .filter((row) => row.sparePartId || row.sparePartDescription)
        .map((row) => ({
          sparePartId: row.sparePartId || "",
          sparePartDescription: row.sparePartDescription || "",
          modelNo: row.modelNo || "",
          serialNo: row.serialNo || "",
          manufacturer: row.manufacturer || "",
          warrantyTillDate: row.warrantyTillDate || "",
          calibrationReq: row.calibrationReq === "YES",
          lastCalibDate: row.lastCalibDate || "",
          nextCalibDate: row.nextCalibDate || "",
        })),

      componentOutputDetailsDTO: componentRows
        .filter((row) => row.itemCode)
        .map((row) => ({ itemId: Number(row.itemCode) })),

      machineHistoryDTO: historyRows
        .filter((row) => row.date || row.description)
        .map((row) => ({
          date: row.date || "",
          description: row.description || "",
          changedDate: row.changedDate || "",
          cost: row.cost ? Number(row.cost) : 0,
          purpose: row.purpose || "",
          remarks: row.remarks || "",
        })),

      toolImageName: imageInfo.name || "",
    };

    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === undefined ||
        payload[key] === null ||
        payload[key] === ""
      ) {
        if (key !== "id" && key !== "orgId" && key !== "branch") {
          delete payload[key];
        }
      }
    });

    if (payload.id === 0) delete payload.id;

    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const payload = buildPayload();
      const response = await toolsFixtureAPI.createUpdateTool(payload);
      const savedId = response?.paramObjectsMap?.id || response?.id || data?.id;

      // Fire off file uploads (image + attachments) once the record has an id
      if (savedId) {
        if (imageInfo.file) {
          await toolsFixtureAPI.uploadToolFile(
            savedId,
            imageInfo.file,
            "IMAGE",
          );
        }
        const pendingAttachments = attachedRows.filter((row) => row.file);
        await Promise.all(
          pendingAttachments.map((row) =>
            toolsFixtureAPI.uploadToolFile(savedId, row.file, "ATTACHMENT"),
          ),
        );
      }

      if (response?.status === true || response?.status === undefined) {
        setToastMessage({
          type: "success",
          message: data?.id
            ? "Tool/Fixture Updated Successfully!"
            : "Tool/Fixture Saved Successfully!",
        });
        setTimeout(() => onBack(), 1500);
      } else {
        setToastMessage({
          type: "error",
          message: response?.message || "Failed to save Tool/Fixture",
        });
      }
    } catch (error) {
      console.error("Error saving tool/fixture:", error);
      setToastMessage({
        type: "error",
        message: error.message || "Error saving Tool/Fixture",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 max-w-7xl relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading Tool/Fixture data...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* ---------------- Tool/Fixture Details (always visible) ---------------- */}
        <div>
          <SectionHeader>Tool/Fixture Details</SectionHeader>
          <div className={fieldGrid}>
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
              label="Type"
              name="type"
              value={basic.type}
              onChange={handleBasicChange}
              options={toolTypeOptions}
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
              label="Tool No./Fixture No."
              name="toolNo"
              value={basic.toolNo}
              onChange={handleBasicChange}
              error={fieldErrors.toolNo}
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
              type="select"
              label="Tool/Fixture Category"
              name="toolCategory"
              value={basic.toolCategory}
              onChange={handleBasicChange}
              error={fieldErrors.toolCategory}
              options={toolCategoryOptions}
              required
            />

            <Field
              type="select"
              label="Status"
              name="status"
              value={basic.status}
              onChange={handleBasicChange}
              error={fieldErrors.status}
              options={STATUS_OPTIONS}
              required
            />

            <Field
              type="select"
              label="Active"
              name="active"
              value={basic.active}
              onChange={handleBasicChange}
              options={YES_NO}
              required
            />
          </div>
        </div>

        {/* ---------------- Tabs Section ---------------- */}
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
            {/* ---------------- 1. Tools ---------------- */}
            {activeChildTab === "tools" && (
              <div className={fieldGrid}>
                <Field
                  label="Tool/Fixture Production Work Order No."
                  name="productionWorkOrderNo"
                  value={toolsInfo.productionWorkOrderNo}
                  onChange={handleToolsInfoChange}
                  className="col-span-2"
                />

                <Field
                  label="PM Check List No."
                  name="pmCheckListNo"
                  value={toolsInfo.pmCheckListNo}
                  onChange={handleToolsInfoChange}
                />

                <Field
                  label="Location Name"
                  name="locationName"
                  value={toolsInfo.locationName}
                  onChange={handleToolsInfoChange}
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
                  label="Tool/Fixtue Used For"
                  name="usedFor"
                  value={toolsInfo.usedFor}
                  onChange={handleToolsInfoChange}
                />

                <Field
                  type="select"
                  label="Tool/Fixture Ownership"
                  name="ownership"
                  value={toolsInfo.ownership}
                  onChange={handleToolsInfoChange}
                  options={OWNERSHIP_OPTIONS}
                />

                <Field
                  label="Tool Owner Name"
                  name="toolOwnerName"
                  value={toolsInfo.toolOwnerName}
                  onChange={handleToolsInfoChange}
                />

                <Field
                  label="Present Location"
                  name="presentLocation"
                  value={toolsInfo.presentLocation}
                  onChange={handleToolsInfoChange}
                />

                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={toolsInfo.remarks}
                  onChange={handleToolsInfoChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
              </div>
            )}

            {/* ---------------- 2. Technical Info ---------------- */}
            {activeChildTab === "technicalInfo" && (
              <div className={fieldGrid}>
                <Field
                  label="Drawing No"
                  name="drawingNo"
                  value={technicalInfo.drawingNo}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  label="Serial No"
                  name="serialNo"
                  value={technicalInfo.serialNo}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  label="Manufactured By"
                  name="manufacturedBy"
                  value={technicalInfo.manufacturedBy}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  type="select"
                  label="Section"
                  name="section"
                  value={technicalInfo.section}
                  onChange={handleTechnicalInfoChange}
                  options={sectionOptions}
                />

                <Field
                  type="select"
                  label="Made In"
                  name="madeIn"
                  value={technicalInfo.madeIn}
                  onChange={handleTechnicalInfoChange}
                  options={MADE_IN_OPTIONS}
                />

                <Field
                  label="Purchased From"
                  name="purchasedFrom"
                  value={technicalInfo.purchasedFrom}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  type="select"
                  label="Mode Of Purchase"
                  name="modeOfPurchase"
                  value={technicalInfo.modeOfPurchase}
                  onChange={handleTechnicalInfoChange}
                  options={MODE_OF_PURCHASE_OPTIONS}
                />

                <Field
                  type="number"
                  label="Total Tool/Fixture Cost"
                  name="totalCost"
                  value={technicalInfo.totalCost}
                  onChange={handleTechnicalInfoChange}
                />

                <Field
                  label="Cavity Number"
                  name="cavityNumber"
                  value={technicalInfo.cavityNumber}
                  onChange={handleTechnicalInfoChange}
                />
              </div>
            )}

            {/* ---------------- 3. Spare Details ---------------- */}
            {activeChildTab === "spareDetails" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setSpareRows((prev) => [...prev, emptySpareRow()])
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
                          {[
                            "sparePartId",
                            "sparePartDescription",
                            "modelNo",
                            "serialNo",
                            "manufacturer",
                          ].map((field) => (
                            <td className="p-1 align-top" key={field}>
                              <input
                                type="text"
                                value={row[field]}
                                onChange={(e) => {
                                  const newRows = [...spareRows];
                                  newRows[idx][field] = e.target.value;
                                  setSpareRows(newRows);
                                }}
                                className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          ))}
                          <td className="p-1 align-top">
                            <input
                              type="date"
                              value={row.warrantyTillDate}
                              onChange={(e) => {
                                const newRows = [...spareRows];
                                newRows[idx].warrantyTillDate = e.target.value;
                                setSpareRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <select
                              value={row.calibrationReq}
                              onChange={(e) => {
                                const newRows = [...spareRows];
                                newRows[idx].calibrationReq = e.target.value;
                                setSpareRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                value={row[field]}
                                onChange={(e) => {
                                  const newRows = [...spareRows];
                                  newRows[idx][field] = e.target.value;
                                  setSpareRows(newRows);
                                }}
                                className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          ))}
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (spareRows.length > 1) {
                                  setSpareRows(
                                    spareRows.filter((_, i) => i !== idx),
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

            {/* ---------------- 4. Component Output Details ---------------- */}
            {activeChildTab === "componentOutput" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setComponentRows((prev) => [...prev, emptyComponentRow()])
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
                              value={row.itemCode}
                              onChange={(e) =>
                                handleComponentItemChange(idx, e.target.value)
                              }
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                              value={row.itemDescription}
                              readOnly
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.unit}
                              readOnly
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (componentRows.length > 1) {
                                  setComponentRows(
                                    componentRows.filter((_, i) => i !== idx),
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

            {/* ---------------- 5. Machine History ---------------- */}
            {activeChildTab === "machineHistory" && (
              <div>
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setHistoryRows((prev) => [...prev, emptyHistoryRow()])
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
                              value={row.date}
                              onChange={(e) => {
                                const newRows = [...historyRows];
                                newRows[idx].date = e.target.value;
                                setHistoryRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => {
                                const newRows = [...historyRows];
                                newRows[idx].description = e.target.value;
                                setHistoryRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="date"
                              value={row.changedDate}
                              onChange={(e) => {
                                const newRows = [...historyRows];
                                newRows[idx].changedDate = e.target.value;
                                setHistoryRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="number"
                              value={row.cost}
                              onChange={(e) => {
                                const newRows = [...historyRows];
                                newRows[idx].cost = e.target.value;
                                setHistoryRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.purpose}
                              onChange={(e) => {
                                const newRows = [...historyRows];
                                newRows[idx].purpose = e.target.value;
                                setHistoryRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 align-top">
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(e) => {
                                const newRows = [...historyRows];
                                newRows[idx].remarks = e.target.value;
                                setHistoryRows(newRows);
                              }}
                              className="w-full h-8 px-2 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (historyRows.length > 1) {
                                  setHistoryRows(
                                    historyRows.filter((_, i) => i !== idx),
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

            {/* ---------------- 6. Image ---------------- */}
            {activeChildTab === "image" && (
              <div className={fieldGrid}>
                <Field
                  label="Tool/Fixtures Name"
                  name="name"
                  value={imageInfo.name}
                  onChange={(e) =>
                    setImageInfo((prev) => ({ ...prev, name: e.target.value }))
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

            {/* ---------------- 7. Attached ---------------- */}
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
                                  {row.fileName}
                                </a>
                              ) : (
                                <span>{row.fileName}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setAttachedRows(
                                  attachedRows.filter((_, i) => i !== idx),
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
