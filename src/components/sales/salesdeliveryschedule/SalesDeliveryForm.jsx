import { ArrowLeft, Save, X, Plus, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import salesDeliveryAPI from "../../../api/Sales/salesDelivery";
import { useToast } from "../../Toast/ToastContext";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const getDefaultValues = () => ({
  divNo: "",
  divDate: new Date().toISOString().split("T")[0],
  plantId: "",
  belongsTo: "",
  monthOfSchedule: "",
  monthYear: new Date().getFullYear().toString(),
  customerId: "",
  customerName: "",
  scheduleDetails: [
    {
      soNo: "",
      invoiceType: "",
      itemCode: "",
      itemId: 0,
      itemDescription: "",
      unit: "",
      unitId: 0,
      orderQty: 0,
      pendingQty: 0,
      actualPlannedQty: 0,
    },
  ],
  deliverySchedule: [
    {
      dayNo: "",
      deliveryDate: "",
      weekNo: "",
      day: "",
      deliveryQty: 0,
    },
  ],
  remarks: "",
});

const SELECT_OPTIONS = {
  monthOfSchedule: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  dayNo: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
  ],
  day: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Helper function to get day name
const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(date);
  return days[d.getDay()];
};

// Helper Components
const SelectField = ({ control, name, label, options, required, errors, onChange, disabled }) => {
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
            <option value="">Select an option</option>
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
  value,
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
            value={value || field.value}
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
          className={`p-1 ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} dark:text-white`}
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
            <option value="">Select an option</option>
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
  disabled,
  required,
  errors,
  value,
  onViewClick,
  onChange,
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
                value={value || field.value}
                className={`${controlClasses} h-8 text-xs ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
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
            className="h-8 w-8 flex-shrink-0 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            title="View Delivery Schedule"
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

const DeliverySchedulePopup = ({ isOpen, onClose, control, errors, deliveryScheduleArray, setValue, onSave }) => {
  if (!isOpen) return null;

  const handleDateChange = (e, index) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const weekNo = getWeekNumber(dateValue);
      const dayName = getDayName(dateValue);
      setValue(`deliverySchedule.${index}.weekNo`, weekNo);
      setValue(`deliverySchedule.${index}.day`, dayName);
    }
  };

  const handleAddRow = () => {
    const newItem = {
      dayNo: "",
      deliveryDate: "",
      weekNo: "",
      day: "",
      deliveryQty: 0,
    };
    deliveryScheduleArray.append(newItem);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Delivery Schedule Details
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
                "Day No.",
                "Delivery Date",
                "Week No.",
                "Day",
                "Delivery Qty.",
                "Action",
              ]}
            />
            <tbody>
              {deliveryScheduleArray.fields.map((field, index) => (
                <TableRow
                  key={field.id}
                  index={index}
                  onRemove={() => deliveryScheduleArray.remove(index)}
                  disabled={deliveryScheduleArray.fields.length <= 1}
                >
                  <SelectCell
                    control={control}
                    name={`deliverySchedule.${index}.dayNo`}
                    options={SELECT_OPTIONS.dayNo}
                    errors={errors}
                  />
                  <InputCell
                    control={control}
                    name={`deliverySchedule.${index}.deliveryDate`}
                    type="date"
                    placeholder="Delivery Date"
                    errors={errors}
                    onChange={(e) => handleDateChange(e, index)}
                  />
                  <InputCell
                    control={control}
                    name={`deliverySchedule.${index}.weekNo`}
                    type="number"
                    placeholder="Week No."
                    errors={errors}
                    disabled={true}
                  />
                  <InputCell
                    control={control}
                    name={`deliverySchedule.${index}.day`}
                    errors={errors}
                    disabled={true}
                  />
                  <InputCell
                    control={control}
                    name={`deliverySchedule.${index}.deliveryQty`}
                    type="number"
                    step="0.01"
                    placeholder="0"
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

// Main Component
const SalesDeliveryForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const [activeChildTab, setActiveChildTab] = useState("scheduleDetails");
  const [plantData, setPlantData] = useState([]);
  const [belongToData, setBelongsToData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const { addToast } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const scheduleDetailsArray = useFieldArray({
    control,
    name: "scheduleDetails",
  });
  const deliveryScheduleArray = useFieldArray({
    control,
    name: "deliverySchedule",
  });

  // Function to transform API data to form data
  const transformApiDataToForm = (apiData) => {
    if (!apiData) return getDefaultValues();

    // Get the first detail's delivery schedules
    const firstDetail = apiData.details?.[0] || {};
    const deliverySchedules = firstDetail.deliverySchedules || [];

    return {
      divNo: apiData.dlvNo || "",
      divDate: apiData.dlvDate || new Date().toISOString().split("T")[0],
      plantId: apiData.branch?.id?.toString() || "",
      belongsTo: apiData.belongsTo || "",
      monthOfSchedule: apiData.monthOfSchedule || "",
      monthYear: apiData.monthYear || new Date().getFullYear().toString(),
      customerId: apiData.customer?.customerId?.toString() || "",
      customerName: apiData.customer?.customerName || "",
      scheduleDetails: apiData.details?.map(detail => ({
        soNo: detail.soNocontractNo || "",
        invoiceType: detail.invoiceType || "",
        itemCode: detail.item?.itemCode || "",
        itemId: detail.item?.id || 0,
        itemDescription: detail.item?.itemDescription || "",
        unit: detail.item?.unit?.unitId || "",
        unitId: detail.item?.unit?.id || 0,
        orderQty: detail.orderQty || 0,
        pendingQty: detail.pendingQty || 0,
        actualPlannedQty: detail.actualPlannedQty || 0,
      })) || [{
        soNo: "",
        invoiceType: "",
        itemCode: "",
        itemId: 0,
        itemDescription: "",
        unit: "",
        unitId: 0,
        orderQty: 0,
        pendingQty: 0,
        actualPlannedQty: 0,
      }],
      deliverySchedule: deliverySchedules.map(schedule => ({
        dayNo: schedule.dayNo?.toString() || "",
        deliveryDate: schedule.deliveryDate || "",
        weekNo: schedule.weekNo?.toString() || "",
        day: schedule.dayName || "",
        deliveryQty: schedule.deliveryQty || 0,
      })) || [{
        dayNo: "",
        deliveryDate: "",
        weekNo: "",
        day: "",
        deliveryQty: 0,
      }],
      remarks: apiData.remarks || "",
    };
  };

  // Load edit data if ID is provided
  const loadEditData = useCallback(async () => {
    if (!data?.id) return;

    try {
      setLoading(true);
      const response = await salesDeliveryAPI.getSalesDeliveryById(data.id);
      console.log("Get By ID Response:", response);

      const salesData = response?.paramObjectsMap?.salesDeliverySchedule;
      if (salesData) {
        setEditData(salesData);
        const formData = transformApiDataToForm(salesData);
        reset(formData);
      }
    } catch (error) {
      console.error("Failed to load sales delivery data:", error);
      alert(error.message || "Failed to load sales delivery schedule data");
    } finally {
      setLoading(false);
    }
  }, [data?.id, reset]);

  const getFieldArray = (tab) => {
    switch (tab) {
      case "scheduleDetails":
        return scheduleDetailsArray;
      case "deliverySchedule":
        return deliveryScheduleArray;
      default:
        return scheduleDetailsArray;
    }
  };

  const handleAdd = (tab) => {
    const defaultValues = getDefaultValues();
    const newItem = defaultValues[tab]?.[0] || {};
    getFieldArray(tab).append(newItem);
  };

  const handleRemove = (tab, index) => {
    const { fields, remove } = getFieldArray(tab);
    if (fields.length > 1) remove(index);
  };

  const handleViewDeliverySchedule = (index) => {
    setSelectedRowIndex(index);
    setShowPopup(true);
  };

  const handleCustomerChange = (customerId) => {
    const selectedCustomer = customerData.find(
      c => String(c.value) === String(customerId)
    );

    if (selectedCustomer) {
      setValue("customerName", selectedCustomer.customerName || "");
    } else {
      setValue("customerName", "");
    }
  };

  const handleMonthChange = (month) => {
    if (!month) {
      setValue("monthYear", "");
      return;
    }

    const monthIndex = SELECT_OPTIONS.monthOfSchedule.indexOf(month);

    if (monthIndex === -1) {
      setValue("monthYear", "");
      return;
    }

    const monthNumber = String(monthIndex + 1).padStart(2, "0");
    const year = new Date().getFullYear();

    setValue(
      "monthYear",
      `${monthNumber}-${year}`
    );
  };

  const handleContractChange = async (contractNo, index) => {
    try {
      const selectedContract = contractData.find(
        (c) => String(c.value) === String(contractNo)
      );

      setValue(
        `scheduleDetails.${index}.invoiceType`,
        selectedContract?.invoiceType || ""
      );

      setValue(`scheduleDetails.${index}.itemCode`, "");
      setValue(`scheduleDetails.${index}.itemId`, 0);
      setValue(`scheduleDetails.${index}.itemDescription`, "");
      setValue(`scheduleDetails.${index}.unit`, "");
      setValue(`scheduleDetails.${index}.unitId`, 0);
      setValue(`scheduleDetails.${index}.orderQty`, 0);
      setValue(`scheduleDetails.${index}.pendingQty`, 0);

      if (!contractNo) {
        setItemData([]);
        return;
      }

      const response = await salesDeliveryAPI.getItemDetails(
        orgId,
        branchId,
        contractNo
      );

      const items = response?.paramObjectsMap?.itemList || [];

      const options = items.map((item) => ({
        value: item.itemCode,
        label: item.itemCode,
        itemId: item.itemId,
        itemDescription: item.itemDescription,
        unit: item.unit,
        unitId: item.unitId,
        orderQty: item.orderQty,
      }));

      setItemData(options);

    } catch (error) {
      console.error("Failed to load item details:", error);
      setItemData([]);
    }
  };

  const handleItemChange = (itemCode, index) => {
    const selectedItem = itemData.find(
      (item) => String(item.value) === String(itemCode)
    );

    if (selectedItem) {
      setValue(
        `scheduleDetails.${index}.itemDescription`,
        selectedItem.itemDescription || ""
      );

      setValue(
        `scheduleDetails.${index}.unit`,
        selectedItem.unit || ""
      );

      setValue(
        `scheduleDetails.${index}.orderQty`,
        selectedItem.orderQty || 0
      );

      setValue(
        `scheduleDetails.${index}.itemId`,
        selectedItem.itemId || 0
      );

      setValue(
        `scheduleDetails.${index}.unitId`,
        selectedItem.unitId || 0
      );

    } else {
      setValue(`scheduleDetails.${index}.itemDescription`, "");
      setValue(`scheduleDetails.${index}.unit`, "");
      setValue(`scheduleDetails.${index}.orderQty`, 0);
      setValue(`scheduleDetails.${index}.itemId`, 0);
      setValue(`scheduleDetails.${index}.unitId`, 0);
    }
  };

  useEffect(() => {
    loadBranches();
    loadBelongsTo();
    loadCustomerDetails();
    loadContractNoDetails();

    // Load edit data if editing
    if (data?.id) {
      loadEditData();
    }
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.branchName,
      }));
      setPlantData(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantData([]);
    }
  }, [orgId]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const response = await listOfValuesAPI.getListValuesGroup("SDS BELONGS TO", orgId);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.valuesDescription,
      }));
      setBelongsToData(options);
    } catch (error) {
      console.error("Failed to load belongs to options:", error);
      setBelongsToData([]);
    }
  }, [orgId]);

  const loadCustomerDetails = useCallback(async () => {
    try {
      const response = await salesDeliveryAPI.getCustomerDropdown(orgId, branchId);
      const res = response?.paramObjectsMap?.customerDetails;
      const options = (res || []).map(customer => ({
        value: customer.customerId,
        label: customer.customerCode,
        customerName: customer.customerName,
      }));
      setCustomerData(options);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomerData([]);
    }
  }, [orgId, branchId]);

  const loadContractNoDetails = useCallback(async () => {
    try {
      const response = await salesDeliveryAPI.getContractNoDetails(
        orgId,
        branchId
      );

      const res = response?.paramObjectsMap?.contractList || [];

      const options = res.map((contract) => ({
        value: contract.contractNo,
        label: contract.contractNo,
        invoiceType: contract.invoiceType,
      }));

      setContractData(options);
    } catch (error) {
      console.error("Failed to load contract numbers:", error);
      setContractData([]);
    }
  }, [branchId, orgId]);

  const transformFormData = (formData, orgId, branchId, isEditMode) => {
    const deliverySchedules = formData.deliverySchedule && formData.deliverySchedule.length > 0
      ? formData.deliverySchedule.map(schedule => ({
        dayName: schedule.day || "",
        dayNo: parseInt(schedule.dayNo) || 0,
        deliveryDate: schedule.deliveryDate || new Date().toISOString().split("T")[0],
        deliveryQty: parseFloat(schedule.deliveryQty) || 0,
        weekNo: parseInt(schedule.weekNo) || 0
      }))
      : [];

    const payload = {
      active: true,
      belongsTo: formData.belongsTo || "",
      branch: parseInt(branchId),
      cancelRemarks: "",
      createdBy: localStorage.getItem("userId") || "1",
      customer: parseInt(formData.customerId) || 0,
      details: formData.scheduleDetails.map(detail => {
        const itemId = detail.itemId || parseInt(detail.itemCode) || 0;
        const unitId = detail.unitId || 0;

        return {
          actualPlannedQty: parseFloat(detail.actualPlannedQty) || 0,
          deliverySchedules: deliverySchedules,
          invoiceType: detail.invoiceType || "",
          item: itemId,
          itemDescription: detail.itemDescription || "",
          orderQty: parseFloat(detail.orderQty) || 0,
          pendingQty: parseFloat(detail.pendingQty) || 0,
          soNoContractNo: detail.soNo || "",
          unit: unitId
        };
      }),
      financialYear: new Date().getFullYear().toString(),
      monthOfSchedule: formData.monthOfSchedule || "",
      monthYear: formData.monthYear || new Date().getFullYear().toString(),
      orgId: parseInt(orgId),
      remarks: formData.remarks || ""
    };

    if (isEditMode && data?.id) {
      payload.id = data.id;
    }

    return payload;
  };

  const onSubmit = async (formData) => {
    try {
      const isEditMode = !!data?.id;

      const apiPayload = transformFormData(formData, orgId, branchId, isEditMode);

      const response = await salesDeliveryAPI.createUpdateSalesDelivery(apiPayload);

      if (response?.status === true) {
        addToast(
          isEditMode ? "Sales Delivery Schedule Updated Successfully!" : "Sales Delivery Schedule Saved Successfully!",
          "success"
        );

        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        const errorMessage = response?.paramObjectsMap?.message || response?.message || "Failed to save sales delivery schedule";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving sales delivery:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error saving sales delivery schedule";
      addToast(errorMessage, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data?.id ? "Edit Sales Delivery Schedule" : "Add Sales Delivery Schedule"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputField
            control={control}
            name="divNo"
            label="Div. No."
            errors={errors}
          />
          <InputField
            control={control}
            name="divDate"
            label="Div. Date"
            type="date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="plantId"
            label="Plant ID"
            options={plantData}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="belongsTo"
            label="Belongs To"
            options={belongToData}
            errors={errors}
          />
          <SelectField
            control={control}
            name="monthOfSchedule"
            label="Month Of Schedule"
            options={SELECT_OPTIONS.monthOfSchedule}
            required
            errors={errors}
            onChange={handleMonthChange}
          />
          <InputField
            control={control}
            name="monthYear"
            label="Month-Year"
            disabled
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerId"
            label="Customer ID"
            options={customerData}
            required
            errors={errors}
            onChange={handleCustomerChange}
          />
          <InputField
            control={control}
            name="customerName"
            label="Customer Name"
            placeholder="Enter customer name"
            errors={errors}
          />
        </div>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["scheduleDetails", "summary"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveChildTab(tab)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeChildTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tab === "scheduleDetails"
                    ? "Schedule Details"
                    : "Summary"}
                </button>
              ))}
            </div>
            {activeChildTab !== "summary" && (
              <button
                type="button"
                onClick={() => handleAdd(activeChildTab)}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {activeChildTab === "scheduleDetails" && (
            <TableWrapper>
              <TableHead
                headers={[
                  "S.No",
                  <>
                    S.O.No.Contract No <span className="text-red-500">*</span>
                  </>,
                  "Invoice Type",
                  <>
                    Item Code <span className="text-red-500">*</span>
                  </>,
                  <>
                    Item Description <span className="text-red-500">*</span>
                  </>,
                  <>
                    Unit <span className="text-red-500">*</span>
                  </>,
                  "Order Qty",
                  "Pending Qty",
                  <>
                    Actual Planned Qty <span className="text-red-500">*</span>
                  </>,
                  "Action",
                ]}
              />
              <tbody>
                {scheduleDetailsArray.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemove("scheduleDetails", index)}
                    disabled={scheduleDetailsArray.fields.length <= 1}
                  >
                    <SelectCell
                      control={control}
                      name={`scheduleDetails.${index}.soNo`}
                      required
                      options={contractData}
                      errors={errors}
                      onChange={(value) => handleContractChange(value, index)}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.invoiceType`}
                      placeholder="Invoice Type"
                      disabled
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`scheduleDetails.${index}.itemCode`}
                      options={itemData}
                      required
                      errors={errors}
                      onChange={(value) => handleItemChange(value, index)}
                    />
                    <InputCell
                      control={control}
                      required
                      disabled
                      name={`scheduleDetails.${index}.itemDescription`}
                      placeholder="Item Description"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      disabled
                      name={`scheduleDetails.${index}.unit`}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.orderQty`}
                      type="number"
                      disabled
                      placeholder="0"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.pendingQty`}
                      type="number"
                      placeholder="0"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.actualPlannedQty`}
                      type="number"
                      required
                      placeholder="0"
                      errors={errors}
                      onViewClick={() => handleViewDeliverySchedule(index)}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "summary" && (
            <div className="grid grid-cols-1 gap-3 p-3">
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                placeholder="Enter remarks"
                errors={errors}
              />
            </div>
          )}
        </section>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Delivery Schedule Popup */}
      <DeliverySchedulePopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        control={control}
        errors={errors}
        deliveryScheduleArray={deliveryScheduleArray}
        setValue={setValue}
        onSave={() => {
          console.log("Delivery schedule saved:", deliveryScheduleArray.fields);
        }}
      />
    </div>
  );
};

export default SalesDeliveryForm;