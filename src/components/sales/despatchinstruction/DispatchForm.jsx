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
  plantId: "",
  idNo: "",
  partyId: "",
  scheduleNo: "",
  schDate: "",
  fromLocation: "",
  dispatchDetails: "",
  paymentTerms: "",
  modeOfTransport: "",
  netWeight: "",
  grossWeight: "",
  deliveryInstructions: "",
  consignee: "",
  dispatchItems: [
    {
      sno: "",
      orderAcceptContractNo: "",
      date: "",
      itemCode: "",
      itemDescription: "",
      pdiDate: "",
      pdiNo: "",
      scheduleMonth: "",
      pendingQty: 0,
      availableQty: 0,
      depQty: 0,
      noOfPackage: 0,
      packageType: "",
      qty1: 0,
      qty2: 0,
    },
  ],
  termsConditions: {
    sno: "1",
    term: "",
    description: "",
    applicable: "",
    remarks: "",
  },
});

const SELECT_OPTIONS = {
  plantId: ["Plant A", "Plant B", "Plant C"],
  partyId: ["Party 1", "Party 2", "Party 3"],
  scheduleNo: ["SCH-001", "SCH-002", "SCH-003"],
  fromLocation: ["Warehouse A", "Warehouse B", "Plant A"],
  modeOfTransport: ["Road", "Rail", "Air", "Sea"],
  packageType: ["Box", "Pallet", "Crate", "Drum"],
  yesNo: ["Yes", "No"],
  applicable: ["Yes", "No", "N/A"],
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
          ...(type === "email" && {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
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

const TextAreaField = ({
  control,
  name,
  label,
  required,
  placeholder,
  errors,
  rows = 3,
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
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <textarea
            {...field}
            rows={rows}
            className={`${controlClasses} h-auto min-h-[60px] resize-y ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
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
          className={`p-1 ${i === 0 ? "w-8 text-center" : i === headers.length - 1 ? "w-20 text-left" : "text-left"} dark:text-white whitespace-nowrap`}
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
            <option value="">Select</option>
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
const DispatchForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeTab, setActiveTab] = useState("dispatchDetails");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: data || getDefaultValues(),
  });

  const dispatchItemsArray = useFieldArray({ control, name: "dispatchItems" });

  const handleAddItem = () => {
    const defaultValues = getDefaultValues();
    const newItem = defaultValues.dispatchItems[0] || {};
    dispatchItemsArray.append(newItem);
  };

  const handleRemoveItem = (index) => {
    if (dispatchItemsArray.fields.length > 1) {
      dispatchItemsArray.remove(index);
    }
  };

  const onSubmit = async (formData) => {
    try {
      console.log("Dispatch Form Data:", formData, "Org Id:", orgId);
      // API call here
      alert("Dispatch instruction saved successfully!");
    } catch (error) {
      console.error("Error saving dispatch:", error);
      alert("Error saving dispatch instruction");
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
          {data ? "Edit Dispatch Instruction" : "Add Dispatch Instruction"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Basic Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <SelectField
            control={control}
            name="plantId"
            label="Plant Id"
            options={SELECT_OPTIONS.plantId}
            required
            errors={errors}
          />

          <InputField
            control={control}
            name="idNo"
            label="ID No."
            placeholder="Enter ID No."
            errors={errors}
          />

          <SelectField
            control={control}
            name="partyId"
            label="Party Id"
            options={SELECT_OPTIONS.partyId}
            required
            errors={errors}
          />

          <SelectField
            control={control}
            name="scheduleNo"
            label="Schedule No."
            options={SELECT_OPTIONS.scheduleNo}
            required
            errors={errors}
          />

          <InputField
            control={control}
            type="date"
            name="schDate"
            label="Sch. Date"
            required
            errors={errors}
          />

          <SelectField
            control={control}
            name="fromLocation"
            label="From Location"
            options={SELECT_OPTIONS.fromLocation}
            required
            errors={errors}
          />

          <SelectField
            control={control}
            name="modeOfTransport"
            label="Mode of Transport"
            options={SELECT_OPTIONS.modeOfTransport}
            required
            errors={errors}
          />

          <InputField
            control={control}
            name="netWeight"
            label="Net Weight"
            type="number"
            step="0.01"
            placeholder="Enter net weight"
            errors={errors}
          />

          <InputField
            control={control}
            name="grossWeight"
            label="Gross Weight"
            type="number"
            step="0.01"
            placeholder="Enter gross weight"
            errors={errors}
          />

          <InputField
            control={control}
            name="consignee"
            label="Consignee"
            placeholder="Enter consignee name"
            errors={errors}
          />

          <InputField
            control={control}
            name="paymentTerms"
            label="Payment Terms"
            placeholder="Enter payment terms"
            errors={errors}
          />
          <InputField
            control={control}
            name="deliveryInstructions"
            label="Delivery Instructions"
            placeholder="Enter delivery instructions"
            errors={errors}
          />
        </div>

        {/* Tabs Section */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("dispatchDetails")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "dispatchDetails"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Dispatch Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("termsConditions")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "termsConditions"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Terms and Conditions
            </button>
          </div>

          {/* Tab Content - Dispatch Details */}
          {activeTab === "dispatchDetails" && (
            <div className="space-y-1">
              {/* Dispatch Items Table */}
              <div>
                <div className="flex items-center justify-end mb-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <TableWrapper>
                  <TableHead
                    headers={[
                      "S.No",
                      <>
                        Order Accept. Contract No
                        <span className="text-red-500">*</span>
                      </>,
                      <>
                        Date<span className="text-red-500">*</span>
                      </>,
                      <>
                        Item Code<span className="text-red-500">*</span>
                      </>,
                      "Item Description",
                      "PDI Date",
                      "PDI No",
                      <>
                        Schedule Month<span className="text-red-500">*</span>
                      </>,
                      "Pending Qty",
                      "Available Qty",
                      <>
                        Dep. Qty<span className="text-red-500">*</span>
                      </>,
                      <>
                        No. of Package<span className="text-red-500">*</span>
                      </>,
                      "Package Type",
                      "Action",
                    ]}
                  />
                  <tbody>
                    {dispatchItemsArray.fields.map((field, index) => (
                      <TableRow
                        key={field.id}
                        index={index}
                        onRemove={() => handleRemoveItem(index)}
                        disabled={dispatchItemsArray.fields.length <= 1}
                      >
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.orderAcceptContractNo`}
                          placeholder="Contract No"
                          required
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.date`}
                          type="date"
                          required
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.itemCode`}
                          placeholder="Item Code"
                          required
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.itemDescription`}
                          placeholder="Item Description"
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.pdiDate`}
                          type="date"
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.pdiNo`}
                          placeholder="PDI No"
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.scheduleMonth`}
                          type="month"
                          required
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.pendingQty`}
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.availableQty`}
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.depQty`}
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          required
                          errors={errors}
                        />
                        <InputCell
                          control={control}
                          name={`dispatchItems.${index}.noOfPackage`}
                          type="number"
                          placeholder="0"
                          required
                          errors={errors}
                        />
                        <SelectCell
                          control={control}
                          name={`dispatchItems.${index}.packageType`}
                          options={SELECT_OPTIONS.packageType}
                          errors={errors}
                        />
                      </TableRow>
                    ))}
                  </tbody>
                </TableWrapper>
              </div>
            </div>
          )}

          {/* Tab Content - Terms and Conditions (Single Row) */}
          {activeTab === "termsConditions" && (
            <div className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
               
                <InputField
                  control={control}
                  name="termsConditions.term"
                  label="Term"
                  placeholder="Enter term"
                  required
                  errors={errors}
                />
                <InputField
                  control={control}
                  name="termsConditions.description"
                  label="Description"
                  placeholder="Enter description"
                  errors={errors}
                />
                <SelectField
                  control={control}
                  name="termsConditions.applicable"
                  label="Applicable"
                  options={SELECT_OPTIONS.applicable}
                  errors={errors}
                />
                <InputField
                  control={control}
                  name="termsConditions.remarks"
                  label="Remarks"
                  placeholder="Enter remarks"
                  errors={errors}
                />
              </div>
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

export default DispatchForm;