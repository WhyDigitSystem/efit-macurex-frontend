import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";

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
  divNo: "Auto",
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
      itemDescription: "",
      unit: "",
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
  plantId: ["Plant A", "Plant B", "Plant C"],
  belongsTo: ["Option 1", "Option 2", "Option 3"],
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
  customerId: ["CUST-001", "CUST-002", "CUST-003"],
  invoiceType: ["Tax Invoice", "Commercial Invoice", "Proforma Invoice"],
  unit: ["Nos", "Box", "Kg", "Meter", "Litre", "Pcs"],
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

// Helper Components
const SelectField = ({ control, name, label, options, required, errors }) => {
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
          >
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
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
          className={`h-5 w-5 rounded text-white flex items-center justify-center ${
            disabled
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

const SelectCell = ({ control, name, options, required, errors }) => {
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
          >
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
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
    <td className="p-1 align-top">
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
          />
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

// Main Component
const SalesDeliveryForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("scheduleDetails");

  const {
    control,
    handleSubmit,
    watch,
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

  const onSubmit = async (formData) => {
    try {
      console.log("Form Data:", formData, "Org Id:", orgId);
      // API call here
    } catch (error) {
      console.error(error);
    }
  };

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
          {data
            ? "Edit Sales Delivery Schedule"
            : "Add Sales Delivery Schedule"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields - Updated as per images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Row 1 */}
          <InputField
            control={control}
            name="divNo"
            label="Div. No."
            value="Auto"
            disabled
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
            options={SELECT_OPTIONS.plantId}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="belongsTo"
            label="Belongs To"
            options={SELECT_OPTIONS.belongsTo}
            errors={errors}
          />

          {/* Row 2 */}
          <SelectField
            control={control}
            name="monthOfSchedule"
            label="Month Of Schedule"
            options={SELECT_OPTIONS.monthOfSchedule}
            required
            errors={errors}
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
            options={SELECT_OPTIONS.customerId}
            required
            errors={errors}
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
          {/* Tabs - Updated as per images */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["scheduleDetails", "deliverySchedule", "summary"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveChildTab(tab)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                    activeChildTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab === "scheduleDetails"
                    ? "Schedule Details"
                    : tab === "deliverySchedule"
                      ? "Delivery Schedule"
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

          {/* Tab Content - Schedule Details */}
          {activeChildTab === "scheduleDetails" && (
            <TableWrapper>
             
              <TableHead
  headers={[
    "S.No",
    <>
      S.O. No. Contract No. <span className="text-red-500">*</span>
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
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.soNo`}
                      placeholder="S.O. No."
                      required
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`scheduleDetails.${index}.invoiceType`}
                      options={SELECT_OPTIONS.invoiceType}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.itemCode`}
                      placeholder="Item Code"
                      required
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      required
                      name={`scheduleDetails.${index}.itemDescription`}
                      placeholder="Item Description"
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      required
                      name={`scheduleDetails.${index}.unit`}
                      options={SELECT_OPTIONS.unit}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.orderQty`}
                      type="number"
                      //   step="0.01"
                      placeholder="0"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.pendingQty`}
                      type="number"
                      //   step="0.01"
                      placeholder="0"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`scheduleDetails.${index}.actualPlannedQty`}
                      type="number"
                      //   step="0.01"
                      required
                      placeholder="0"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {/* Tab Content - Delivery Schedule */}
          {activeChildTab === "deliverySchedule" && (
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
                    onRemove={() => handleRemove("deliverySchedule", index)}
                    disabled={deliveryScheduleArray.fields.length <= 1}
                  >
                    <InputCell
                      control={control}
                      name={`deliverySchedule.${index}.dayNo`}
                      type="number"
                      placeholder="Day No."
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`deliverySchedule.${index}.deliveryDate`}
                      type="date"
                      placeholder="Delivery Date"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`deliverySchedule.${index}.weekNo`}
                      type="number"
                      placeholder="Week No."
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`deliverySchedule.${index}.day`}
                      options={SELECT_OPTIONS.day}
                      errors={errors}
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
          )}

          {/* Tab Content - Summary */}
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
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesDeliveryForm;
