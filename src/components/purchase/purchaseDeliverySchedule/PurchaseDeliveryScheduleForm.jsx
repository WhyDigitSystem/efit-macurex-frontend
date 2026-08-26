import { ArrowLeft, Save, X, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { purchaseDeliveryScheduleAPI } from "../../../api/Purchase/purchaseDeliveryScheduleAPI";
import { useToast } from "../../Toast/ToastContext";
import branchAPI from "../../../api/branchAPI";

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
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3";

/* ---------------------------------------------------------------------------- */
/* Form Components                                                              */

const SelectField = ({ control, name, label, options, required, errors, onChange, disabled, placeholder }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">{placeholder || `Select an option`}</option>
            {options.map((opt) => {
              if (typeof opt === 'object' && opt !== null) {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              );
            })}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
  disabled,
  step,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && {
            required: `${label} is required`,
          }),
        }}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px]">{errorMessage}</p>
      )}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

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
          className={`p-1 ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} dark:text-white text-[10px] font-medium whitespace-nowrap`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({
  children,
  index,
  onRemove,
  disabled,
  showDelete = true,
}) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    {showDelete && (
      <td className="p-1 text-center">
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
            }`}
        >
          <Trash2 size={10} />
        </button>
      </td>
    )}
  </tr>
);

const SelectCell = ({ control, name, options, required, errors, onChange, disabled }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }
    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-8 text-xs ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select</option>
            {options.map((opt) => {
              if (typeof opt === 'object' && opt !== null) {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              );
            })}
          </select>
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
  align = "left",
  disabled,
  onChange,
  onViewClick,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;

    for (const part of parts) {
      if (error && error[part]) {
        error = error[part];
      } else {
        return null;
      }
    }

    return error?.message;
  };

  const errorMessage = getError();

  return (
    <td className="p-1 align-top">
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <Controller
            name={name}
            control={control}
            rules={required ? { required: "This field is required" } : undefined}
            render={({ field }) => (
              <input
                {...field}
                type={type}
                step={step}
                className={`${controlClasses} h-8 text-xs ${align === "right" ? "text-right" : ""
                  } ${errorMessage
                    ? "border-red-500 focus:border-red-500"
                    : ""
                  }`}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => {
                  field.onChange(e);
                  if (onChange) {
                    onChange(e);
                  }
                }}
              />
            )}
          />
        </div>
        {onViewClick && (
          <button
            type="button"
            onClick={onViewClick}
            className="h-8 w-4 flex-shrink-0 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            title="View Schedule"
          >
            <Eye size={14} />
          </button>
        )}
      </div>
      {errorMessage && (
        <div className="text-red-500 text-[10px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </td>
  );
};

/* ---------------------------------------------------------------------------- */
/* Delivery Schedule Popup Component                                            */

const DeliverySchedulePopup = ({
  isOpen,
  onClose,
  control,
  errors,
  scheduleArray,
  setValue,
  onSave,
}) => {
  if (!isOpen) return null;

  // Helper function to get week number
  const getWeekNumber = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
    return weekNumber;
  };

  const handleDateChange = (e, index) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const weekNo = getWeekNumber(dateValue);
      setValue(`schedule.${index}.weekNo`, weekNo.toString());
    }
  };

  const handleAddRow = () => {
    const newItem = {
      planDate: "",
      weekNo: "",
      scheduleQty: "",
    };
    scheduleArray.append(newItem);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Schedule Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <TableWrapper>
            <TableHead
              headers={[
                "S.No",
                "Plan Date *",
                "Week No.",
                "Schedule Qty *",
                "Action",
              ]}
            />
            <tbody>
              {scheduleArray.fields.map((field, index) => (
                <TableRow
                  key={field.id}
                  index={index}
                  onRemove={() => {
                    if (scheduleArray.fields.length > 1) {
                      scheduleArray.remove(index);
                    }
                  }}
                  disabled={scheduleArray.fields.length <= 1}
                >
                  <InputCell
                    control={control}
                    name={`schedule.${index}.planDate`}
                    type="date"
                    placeholder="Plan Date"
                    required
                    errors={errors}
                    onChange={(e) => handleDateChange(e, index)}
                  />
                  <InputCell
                    control={control}
                    name={`schedule.${index}.weekNo`}
                    type="text"
                    placeholder="Week No."
                    errors={errors}
                    disabled={true}
                  />
                  <InputCell
                    control={control}
                    name={`schedule.${index}.scheduleQty`}
                    type="number"
                    step="0.00001"
                    placeholder="0"
                    required
                    errors={errors}
                  />
                </TableRow>
              ))}
            </tbody>
          </TableWrapper>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleAddRow}
            className="h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> Add Row
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded text-xs text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Save size={14} /> Submit
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const BELONGS_TO = ["APPLIANCES", "BOSCH"];

/* ---------------------------------------------------------------------------- */
/* Helper Functions                                                             */

// Get week number from date
const getWeekNumber = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
  return weekNumber;
};

// Get current financial year
const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 0 && month <= 2) {
    return `${year - 1}-${year}`;
  }
  return `${year}`;
};

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ---------------------------------------------------------------------------- */
/* Default Values                                                               */

const getDefaultValues = () => ({
  // General Info
  plantId: "",
  belongsTo: "",
  docNo: "",
  schStartDate: "",
  docDate: getCurrentDate(),
  schEndDate: "",
  supplierCode: "",
  supplierName: "",
  poNo: "",
  poDate: "",
  preparedBy: "",
  note: "",

  // Schedule Details Table
  scheduleDetails: [
    {
      itemCode: "",
      primaryUnit: "",
      purchaseUnit: "",
      demandQty: "",
      availableStockQty: "",
      qty: "",
      tentativeQty: "",
      tentativeQtyNextMonth: "",
      rate: "",
    },
  ],

  // Schedule Table (used in popup)
  schedule: [
    {
      planDate: "",
      weekNo: "",
      scheduleQty: "",
    },
  ],
});

const CHILD_TABS = [
  { key: "scheduleDetails", label: "Schedule Details" },
  { key: "summary", label: "Summary" },
];

/* ---------------------------------------------------------------------------- */
/* Main Component                                                               */

const PurchaseDeliveryScheduleForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("scheduleDetails");
  const [plantOptions, setPlantOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [poOptions, setPoOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [preparedByOptions, setPreparedByOptions] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingPO, setLoadingPO] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingPreparedBy, setLoadingPreparedBy] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const dataLoadedRef = useRef(false);
  const branchesLoadedRef = useRef(false);
  const suppliersLoadedRef = useRef(false);
  const poLoadedRef = useRef(false);
  const itemsLoadedRef = useRef(false);
  const preparedByLoadedRef = useRef(false);
  const docIdLoadedRef = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: data || getDefaultValues(),
  });

  const scheduleDetailsArray = useFieldArray({
    control,
    name: "scheduleDetails",
  });

  const scheduleArray = useFieldArray({
    control,
    name: "schedule",
  });

  // Watch values
  const supplierCode = watch("supplierCode");
  const docDate = watch("docDate");
  const poNo = watch("poNo");
  const scheduleDetails = watch("scheduleDetails");
  const schedule = watch("schedule");

  /* -------------------------------------------------------------------------- */
  /* API Calls                                                                  */

  const loadBranches = useCallback(async () => {
    if (branchesLoadedRef.current) return;

    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.branchName || branch.branchCode || branch.id,
      }));
      setPlantOptions(options);
      branchesLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantOptions([]);
    }
  }, [orgId]);

  const loadSuppliers = useCallback(async () => {
    if (suppliersLoadedRef.current) return;

    setLoadingSuppliers(true);
    try {
      const response = await purchaseDeliveryScheduleAPI.getSupplierDropdownForPurchaseDeliverySchedule(
        branchId,
        orgId
      );

      if (response?.status && response?.paramObjectsMap?.supplierList) {
        const options = response.paramObjectsMap.supplierList.map(supplier => ({
          value: supplier.supplierCode || supplier.id,
          label: `${supplier.supplierCode} - ${supplier.supplierName}`,
          supplierName: supplier.supplierName,
          id: supplier.id,
          gstNo: supplier.gstNo,
          gstApproval: supplier.gstApproval,
          gstState: supplier.gstState,
          address: supplier.address,
        }));
        setSupplierOptions(options);
        suppliersLoadedRef.current = true;
      } else {
        setSupplierOptions([]);
      }
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSupplierOptions([]);
      addToast("Failed to load suppliers", "error");
    } finally {
      setLoadingSuppliers(false);
    }
  }, [branchId, orgId, addToast]);

  // Load Doc ID for new form
  const loadDocId = useCallback(async () => {
    if (docIdLoadedRef.current || data?.id) return;

    setLoadingDocId(true);
    try {
      const financialYear = getFinancialYear();
      const response = await purchaseDeliveryScheduleAPI.getPurchaseDeliveryScheduleDocId(
        financialYear,
        orgId
      );

      console.log("Doc ID Response:", response);

      if (response?.status && response?.paramObjectsMap?.invoiceDocId) {
        const docId = response.paramObjectsMap.invoiceDocId;
        setValue("docNo", docId);
        docIdLoadedRef.current = true;
      } else {
        setValue("docNo", "Auto-generated");
      }
    } catch (error) {
      console.error("Failed to load Doc ID:", error);
      setValue("docNo", "Auto-generated");
      addToast("Failed to generate document number", "warning");
    } finally {
      setLoadingDocId(false);
    }
  }, [orgId, data?.id, setValue, addToast]);

  // Load PO options based on supplier and doc date
  const loadPOOptions = useCallback(async () => {
    if (!supplierCode || !docDate || !orgId || !branchId) {
      setPoOptions([]);
      return;
    }

    setLoadingPO(true);
    try {
      const selectedSupplier = supplierOptions.find(
        (opt) => String(opt.value) === String(supplierCode)
      );

      const supplierId = selectedSupplier?.id || supplierCode;

      const response = await purchaseDeliveryScheduleAPI.getPurchaseOrderNumberForPurchaseDeliverySchedule(
        branchId,
        supplierId,
        docDate,
        orgId
      );

      console.log("PO Response:", response);

      if (response?.purchaseContractList && response.purchaseContractList.length > 0) {
        const filteredOptions = response.purchaseContractList
          .filter(item => item.purchaseorderno && item.purchaseorderno.trim() !== "")
          .map(item => ({
            value: item.purchaseorderno,
            label: item.purchaseorderno,
            id: item.id,
            docDate: item.docDate,
            supplier: item.supplier,
          }));
        setPoOptions(filteredOptions);
        poLoadedRef.current = true;
      } else {
        setPoOptions([]);
      }
    } catch (error) {
      console.error("Failed to load PO options:", error);
      setPoOptions([]);
      addToast("Failed to load Purchase Orders", "error");
    } finally {
      setLoadingPO(false);
    }
  }, [supplierCode, docDate, orgId, branchId, supplierOptions, addToast]);

  // Load items based on PO selection
  const loadItems = useCallback(async () => {
    if (!poNo || !orgId || !branchId || !supplierCode) {
      setItemOptions([]);
      setItemData([]);
      return;
    }

    setLoadingItems(true);
    try {
      const selectedSupplier = supplierOptions.find(
        (opt) => String(opt.value) === String(supplierCode)
      );

      const supplierId = selectedSupplier?.id || supplierCode;

      const response = await purchaseDeliveryScheduleAPI.getItemsForPurchaseDeliverySchedule(
        branchId,
        supplierId,
        orgId,
        poNo
      );

      console.log("Items Response:", response);

      if (response?.itemList && response.itemList.length > 0) {
        const options = response.itemList.map(item => ({
          value: item.itemCode,
          label: `${item.itemCode} - ${item.itemDesc || ''}`,
          primaryUnit: item.primaryUnit || "",
          purchaseUnit: item.purchaseUnit || "",
          itemId: item.itemId,
          itemDesc: item.itemDesc,
        }));
        setItemOptions(options);
        setItemData(response.itemList);
        itemsLoadedRef.current = true;
      } else {
        setItemOptions([]);
        setItemData([]);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemOptions([]);
      setItemData([]);
      addToast("Failed to load Items", "error");
    } finally {
      setLoadingItems(false);
    }
  }, [poNo, orgId, branchId, supplierCode, supplierOptions, addToast]);

  // Load Prepared By options
  const loadPreparedBy = useCallback(async () => {
    if (preparedByLoadedRef.current) return;

    setLoadingPreparedBy(true);
    try {
      const response = await purchaseDeliveryScheduleAPI.getEmployeeDropdownPurchaseContract(
        branchId,
        orgId
      );

      console.log("Prepared By Response:", response);

      if (response?.status && response?.paramObjectsMap?.employeeList) {
        const options = response.paramObjectsMap.employeeList.map(employee => ({
          value: employee.employeeId,
          label: employee.employeeName || employee.employeeCode || `Employee ${employee.employeeId}`,
        }));
        setPreparedByOptions(options);
        preparedByLoadedRef.current = true;
      } else {
        setPreparedByOptions([]);
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
      setPreparedByOptions([]);
      addToast("Failed to load employees", "error");
    } finally {
      setLoadingPreparedBy(false);
    }
  }, [branchId, orgId, addToast]);

  // Load edit data when editing
  const loadEditData = useCallback(async () => {
    if (!data?.id) return;

    setLoadingData(true);
    try {
      const response = await purchaseDeliveryScheduleAPI.getPurchaseDeliveryScheduleById(data.id);

      console.log("Get By ID Response:", response);

      const scheduleData = response?.paramObjectsMap?.purchaseDeliveryScheduleVO;

      if (!scheduleData) {
        console.error("Purchase Delivery Schedule data not found");
        return;
      }

      // Get the first detail for preparedBy and note (since they are at header level)
      const firstDetail = scheduleData.scheduleDetails?.[0] || {};

      console.log("scheduleData", scheduleData)

      // Map the data to form fields
      const formData = {
        plantId: scheduleData.branch?.id?.toString() || "",
        belongsTo: scheduleData.belongsTo || "",
        docNo: scheduleData.docId || "",
        docDate: scheduleData.docDate || "",
        schStartDate: scheduleData.scheduleStartDate || "",
        schEndDate: scheduleData.scheduleEndDate || "",
        supplierCode: scheduleData.supplier?.supplierCode || "",
        supplierName: scheduleData.supplier?.supplierName || "",
        poNo: scheduleData.purchaseOrderNo || "",
        poDate: scheduleData.purchaseOrderDate || "",
        preparedBy: scheduleData.preparedBy?.id?.toString() || "",
        note: scheduleData.note || "",
        scheduleDetails: (scheduleData.scheduleDetails || []).map((detail) => ({
          itemCode: detail.item?.itemCode || "",
          primaryUnit: detail.primaryUnit?.unitId || "",
          purchaseUnit: detail.purchaseUnit?.unitId || "",
          demandQty: detail.demandQty || "",
          availableStockQty: detail.availableStock || "",
          qty: detail.qty || "",
          tentativeQty: detail.tentativeQty || "",
          tentativeQtyNextMonth: detail.tentativeQtyNextMonth || "",
          rate: detail.rate || "",
        })),
        schedule: (scheduleData.scheduleDetails?.[0]?.schedule || []).map((s) => ({
          planDate: s.planDate || "",
          weekNo: s.weekNo?.toString() || "",
          scheduleQty: s.scheduleQty || "",
        })),
      };

      console.log("Populated Form Data:", formData);

      // Set all values
      reset(formData);
      dataLoadedRef.current = true;

    } catch (error) {
      console.error("Failed to load edit data:", error);
      addToast("Failed to load Purchase Delivery Schedule data", "error");
    } finally {
      setLoadingData(false);
    }
  }, [data?.id, reset, addToast]);

  // Handle item selection - auto-fill primaryUnit and purchaseUnit
  const handleItemSelect = useCallback((index, selectedItemCode) => {
    if (!selectedItemCode) {
      setValue(`scheduleDetails.${index}.primaryUnit`, "");
      setValue(`scheduleDetails.${index}.purchaseUnit`, "");
      return;
    }

    const selectedItem = itemData.find(
      (item) => item.itemCode === selectedItemCode
    );

    if (selectedItem) {
      setValue(`scheduleDetails.${index}.primaryUnit`, selectedItem.primaryUnit || "");
      setValue(`scheduleDetails.${index}.purchaseUnit`, selectedItem.purchaseUnit || "");
    }
  }, [itemData, setValue]);

  // Handle View Schedule button click
  const handleViewSchedule = (index) => {
    setSelectedRowIndex(index);
    setShowPopup(true);
  };

  // Handle Schedule popup save
  const handleScheduleSave = () => {
    addToast("Schedule saved successfully!", "success");
  };

  /* -------------------------------------------------------------------------- */
  /* Effects                                                                    */

  // Load branches only once when component mounts
  useEffect(() => {
    if (orgId && !branchesLoadedRef.current) {
      loadBranches();
    }
  }, [orgId, loadBranches]);

  // Load suppliers only once when component mounts
  useEffect(() => {
    if (orgId && branchId && !suppliersLoadedRef.current) {
      loadSuppliers();
    }
  }, [orgId, branchId, loadSuppliers]);

  // Load Prepared By options only once when component mounts
  useEffect(() => {
    if (orgId && branchId && !preparedByLoadedRef.current) {
      loadPreparedBy();
    }
  }, [orgId, branchId, loadPreparedBy]);

  // Load Doc ID for new form (only if no data is passed)
  useEffect(() => {
    if (orgId && !data?.id && !docIdLoadedRef.current) {
      loadDocId();
    }
  }, [orgId, data?.id, loadDocId]);

  // Load edit data when data prop is provided
  useEffect(() => {
    if (data?.id && !dataLoadedRef.current) {
      loadEditData();
    }
  }, [data?.id, loadEditData]);

  // Load PO options when supplier or doc date changes
  useEffect(() => {
    if (supplierCode && docDate && orgId && branchId) {
      loadPOOptions();
    } else {
      setPoOptions([]);
    }
  }, [supplierCode, docDate, orgId, branchId, loadPOOptions]);

  // Load items when PO changes
  useEffect(() => {
    if (poNo && orgId && branchId && supplierCode) {
      loadItems();
    } else {
      setItemOptions([]);
      setItemData([]);
    }
  }, [poNo, orgId, branchId, supplierCode, loadItems]);

  // Auto-fill supplier name when supplier code changes
  useEffect(() => {
    if (supplierCode && supplierOptions.length > 0) {
      const selectedSupplier = supplierOptions.find(
        (opt) => String(opt.value) === String(supplierCode)
      );
      if (selectedSupplier) {
        setValue("supplierName", selectedSupplier.supplierName || "");
      }
    } else if (!supplierCode) {
      setValue("supplierName", "");
    }
  }, [supplierCode, supplierOptions, setValue]);

  // Auto-fill PO date when PO is selected
  useEffect(() => {
    if (poNo && poOptions.length > 0) {
      const selectedPO = poOptions.find(
        (opt) => String(opt.value) === String(poNo)
      );
      if (selectedPO) {
        setValue("poDate", selectedPO.docDate || "");
      }
    } else if (!poNo) {
      setValue("poDate", "");
    }
  }, [poNo, poOptions, setValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dataLoadedRef.current = false;
      branchesLoadedRef.current = false;
      suppliersLoadedRef.current = false;
      poLoadedRef.current = false;
      itemsLoadedRef.current = false;
      preparedByLoadedRef.current = false;
      docIdLoadedRef.current = false;
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Handlers                                                                   */

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "scheduleDetails") {
      scheduleDetailsArray.append(defaultValues.scheduleDetails[0]);
    }
  };

  const handleRemoveItem = (arrayName, index) => {
    if (arrayName === "scheduleDetails") {
      if (scheduleDetailsArray.fields.length > 1) {
        scheduleDetailsArray.remove(index);
      }
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Submit                                                                     */

  const onSubmit = async (formData) => {
    setSaving(true);

    try {
      const isUpdate = Boolean(data?.id);

      const selectedSupplier = supplierOptions.find(
        (opt) => String(opt.value) === String(formData.supplierCode)
      );
      const supplierId = selectedSupplier?.id || formData.supplierCode;

      const payload = {
        ...(isUpdate ? { id: data.id } : {}),
        active: true,
        belongsTo: formData.belongsTo || "",
        branch: Number(branchId),
        cancelRemarks: "",
        createdBy: localStorage.getItem("usersId") || "",
        financialYear: getFinancialYear(),
        orgId: Number(orgId),
        purchaseOrderDate: formData.poDate || "",
        purchaseOrderNo: formData.poNo || "",
        scheduleEndDate: formData.schEndDate || "",
        scheduleStartDate: formData.schStartDate || "",
        preparedBy: Number(formData.preparedBy),
        note: formData.note || "",
        supplier: Number(supplierId),
        scheduleDetails: (formData.scheduleDetails || [])
          .filter((r) => r.itemCode?.trim())
          .map((item) => {
            const selectedItem = itemData.find(
              (i) => i.itemCode === item.itemCode
            );

            return {
              availableStock: Number(item.availableStockQty) || 0,
              demandQty: Number(item.demandQty) || 0,
              item: Number(selectedItem?.itemId) || 0,
              primaryUnit: Number(item.primaryUnit) || 0,
              purchaseUnit: Number(item.purchaseUnit) || 0,
              qty: Number(item.qty) || 0,
              rate: Number(item.rate) || 0,
              tentativeQty: Number(item.tentativeQty) || 0,
              tentativeQtyNextMonth: Number(item.tentativeQtyNextMonth) || 0,
              schedule: (formData.schedule || [])
                .filter((s) => s.planDate || s.scheduleQty)
                .map((s) => ({
                  planDate: s.planDate || "",
                  scheduleQty: Number(s.scheduleQty) || 0,
                  weekNo: Number(s.weekNo) || 0,
                })),
            };
          }),
      };

      console.log("Submit Payload:", payload);

      const response = await purchaseDeliveryScheduleAPI.createUpdateSchedule(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Purchase Delivery Schedule updated successfully!"
            : "Purchase Delivery Schedule created successfully!"),
          "success"
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          "Failed to save Purchase Delivery Schedule.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save Purchase Delivery Schedule Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          JSON.stringify(err.response.data),
          "error"
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */

  // Get the appropriate array based on active tab
  const getActiveArray = () => {
    switch (activeChildTab) {
      case "scheduleDetails":
        return { fields: scheduleDetailsArray.fields, name: "scheduleDetails" };
      default:
        return { fields: scheduleDetailsArray.fields, name: "scheduleDetails" };
    }
  };

  // Get column configuration based on active tab
  const getColumnConfig = () => {
    switch (activeChildTab) {
      case "scheduleDetails":
        return [
          { key: "itemCode", label: "Item Code *", type: "select", options: itemOptions, required: true },
          { key: "primaryUnit", label: "Primary Unit", type: "text", disabled: true },
          { key: "purchaseUnit", label: "Purchase Unit", type: "text", disabled: true },
          { key: "demandQty", label: "Demand Qty", type: "text", step: "0.00001" },
          { key: "availableStockQty", label: "Available Stock", type: "text", step: "0.00001" },
          { key: "qty", label: "Qty", type: "text", step: "0.00001" },
          { key: "schedule", label: "", type: "schedule", hasViewButton: true },
          { key: "tentativeQty", label: "Tentative Qty", type: "text", step: "0.00001" },
          { key: "tentativeQtyNextMonth", label: "Tentative Qty Next Month", type: "text", step: "0.00001" },
          { key: "rate", label: "Rate", type: "text", step: "0.00001" },
        ];
      default:
        return [];
    }
  };

  const activeFields = getActiveArray();
  const columns = getColumnConfig();

  if (loadingData) {
    return (
      <div className="p-2 max-w-7xl relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {data ? "Edit Purchase Delivery Schedule" : "Add Purchase Delivery Schedule"}
          </h2>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* General Info */}
        <div>
          <SectionHeader>Purchase Delivery Schedule Details</SectionHeader>
          <div className={fieldGrid}>
            <SelectField
              control={control}
              name="plantId"
              label="Plant ID"
              options={plantOptions.length > 0 ? plantOptions : []}
              required
              errors={errors}
            />
            <SelectField
              control={control}
              name="belongsTo"
              label="Belongs To"
              options={BELONGS_TO}
              required
              errors={errors}
            />
            <InputField
              control={control}
              name="docNo"
              label="Doc No"
              placeholder={loadingDocId ? "Generating..." : "Auto"}
              required
              errors={errors}
              disabled={true}
            />
            <InputField
              control={control}
              type="date"
              name="docDate"
              label="Doc Date"
              required
              errors={errors}
            />
            <InputField
              control={control}
              type="date"
              name="schStartDate"
              label="Sch. Start Date"
              required
              errors={errors}
            />
            <InputField
              control={control}
              type="date"
              name="schEndDate"
              label="Sch. End Date"
              required
              errors={errors}
            />
            <SelectField
              control={control}
              name="supplierCode"
              label="Supplier Code"
              options={supplierOptions}
              required
              errors={errors}
              disabled={loadingSuppliers}
              placeholder={loadingSuppliers ? "Loading suppliers..." : "Select an option"}
            />
            <InputField
              control={control}
              name="supplierName"
              label="Supplier Name"
              placeholder="Supplier Name"
              required
              errors={errors}
              disabled={true}
            />
            <SelectField
              control={control}
              name="poNo"
              label="PO No."
              options={poOptions}
              required={false}
              errors={errors}
              disabled={loadingPO || !supplierCode || !docDate}
              placeholder={loadingPO ? "Loading PO numbers..." : poOptions.length === 0 && supplierCode && docDate ? "No PO available" : "Select an option"}
            />
            <InputField
              control={control}
              type="date"
              name="poDate"
              label="PO Date"
              errors={errors}
              disabled={true}
            />
          </div>
        </div>

        {/* Child Tables (tab bar + dynamic table) */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeChildTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeChildTab !== "summary" && (
              <button
                type="button"
                onClick={() => handleAddItem("scheduleDetails")}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Active tab content */}
          {activeChildTab === "summary" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
              <SelectField
                control={control}
                name="preparedBy"
                label="Prepared By"
                options={preparedByOptions}
                placeholder="Select an option"
                errors={errors}
                disabled={loadingPreparedBy}
              />
              <InputField
                control={control}
                name="note"
                label="Note"
                placeholder="Enter note"
                errors={errors}
              />
            </div>
          ) : (
            <TableWrapper>
              <TableHead headers={["S.No", ...columns.map(col => col.label), "Action"]} />
              <tbody>
                {activeFields.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemoveItem("scheduleDetails", index)}
                    disabled={activeFields.fields.length <= 1}
                  >
                    {columns.map((col) => {
                      const fieldName = `${activeFields.name}.${index}.${col.key}`;

                      if (col.type === "select") {
                        return (
                          <SelectCell
                            key={col.key}
                            control={control}
                            name={fieldName}
                            options={col.options || []}
                            required={col.required}
                            errors={errors}
                            onChange={(value) => {
                              if (col.key === "itemCode") {
                                handleItemSelect(index, value);
                              }
                            }}
                          />
                        );
                      }

                      if (col.type === "schedule") {
                        return (
                          <td key={col.key} className="p-1 align-top">
                            <button
                              type="button"
                              onClick={() => handleViewSchedule(index)}
                              className="h-8 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        );
                      }

                      return (
                        <InputCell
                          key={col.key}
                          control={control}
                          name={fieldName}
                          type={col.type === "date" ? "date" : "text"}
                          step={col.step}
                          placeholder={col.label}
                          required={col.required}
                          errors={errors}
                          disabled={col.disabled}
                        />
                      );
                    })}
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving || isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Schedule Popup */}
      <DeliverySchedulePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        control={control}
        errors={errors}
        scheduleArray={scheduleArray}
        setValue={setValue}
        onSave={handleScheduleSave}
      />
    </div>
  );
};

export default PurchaseDeliveryScheduleForm;