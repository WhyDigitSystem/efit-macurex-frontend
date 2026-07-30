import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  File,
  Copy,
  ClipboardPaste,
  TableProperties,
} from "lucide-react";
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
  // Header Fields
  plantId: "",
  custContactNo: "",
  belongsTo: "",
  date: "",
  contactType: "",
  withQuotation: "",
  invoiceType: "",
  customerName: "",
  customerId: "",
  quotDate: "",
  quotNo: "",
  address: "",
  customerPONo: "",
  customerPODate: "",
  effectiveFrom: "",
  isESTApplicable: "",
  effectiveTo: "",
  gstNo: "",
  postRate: "",
  taxCode: "",
  customerType: "",
 

  // Sales Contract Details Table
  salesContractDetails: [
    {
      sno: 1,
      itemCode: "",
      customerPartNo: "",
      itemDescription: "",
      hsCode: "",
      taxType: "",
      taxRs: 0,
      unit: "",
      qty: 0,
      quotRate: 0,
      orderRate: 0,
      discountPercent: 0,
      effectiveFrom: "",
      effectiveTo: "",
      discountAmount: 0,
      amount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      cgstRate: 0,
      cgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      currencyName: "",
    },
  ],

  // Tax Details Table
  taxDetails: [
    {
      id: 1,
      particulars: "",
      amount: 0.0,
    },
  ],

  // Charges Summary (NEW for 3rd Tab)
  chargesSummary: {
    totalAmount: 100.0,
    amountInWords: "Rupees One Hundred Only",
    paymentTerms: "30 days",
    priceTerms: "",
    terms: "",
    note: "",
  },

  // Attached PO Copy
  attachedPOCopy: [
    {
      sno: "",
      pdfAttached: null,
      fileName: "",
    },
  ],
});

const SELECT_OPTIONS = {
  plantId: ["Plant A", "Plant B", "Plant C"],
  contactType: ["Primary", "Secondary", "Billing", "Shipping"],
  withQuotation: ["Yes", "No"],
  invoiceType: ["Tax Invoice", "Proforma Invoice", "Commercial Invoice"],
  customerId: ["CUST001", "CUST002", "CUST003"],
  isESTApplicable: ["Yes", "No"],
  postRate: ["Yes", "No"],
  taxCode: ["TC001", "TC002", "TC003"],
  customerType: ["Individual", "Business", "Government", "International"],
  unit: ["Pcs", "Kg", "Meter", "Liter", "Box", "NOS"],
  taxType: ["CGST+SGST", "IGST", "UTGST", "GST"],
  particulars: [
    "Freight",
    "Insurance",
    "Packing Charges",
    "Handling Charges",
    "Other",
  ],
  modeOfTransport: ["Road", "Rail", "Air", "Sea", "Courier"],
  yesNo: ["Yes", "No"],
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
          className={`p-1 ${i === 0 ? "w-8 text-center" : "text-left"} dark:text-white whitespace-nowrap`}
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
  align = "left",
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
            className={`${controlClasses} h-8 text-xs ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
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

const FileUploadCell = ({ control, name, errors }) => {
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
  const [fileName, setFileName] = useState("");

  return (
    <td className="p-1 align-top">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="relative">
            <div
              className={`border-2 border-dashed rounded-md p-2 text-center cursor-pointer transition-colors ${
                errorMessage
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-900/20",
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-900/20",
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-blue-500",
                  "bg-blue-50",
                  "dark:bg-blue-900/20",
                );
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  onChange(files[0]);
                  setFileName(files[0].name);
                }
              }}
              onClick={() =>
                document.getElementById(`file-input-${name}`)?.click()
              }
            >
              <input
                id={`file-input-${name}`}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onChange(e.target.files[0]);
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
              {value ? (
                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <File className="h-4 w-4" />
                  <span className="text-xs truncate max-w-[150px]">
                    {value.name || fileName}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    Drop files here or click to upload
                  </span>
                  <span className="text-[8px] text-gray-400 dark:text-gray-500">
                    PDF, DOC, XLS, PNG, JPG (Max 5MB)
                  </span>
                </div>
              )}
            </div>
            {errorMessage && (
              <div className="text-red-500 text-[10px] mt-0.5">
                {errorMessage}
              </div>
            )}
          </div>
        )}
      />
    </td>
  );
};

// Main Component
const SalesContractForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeTab, setActiveTab] = useState("salesContract");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: data || getDefaultValues(),
  });

  const salesContractArray = useFieldArray({
    control,
    name: "salesContractDetails",
  });
  const taxDetailsArray = useFieldArray({ control, name: "taxDetails" });
  const attachedPOCopyArray = useFieldArray({
    control,
    name: "attachedPOCopy",
  });

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "salesContract") {
      const newItem = defaultValues.salesContractDetails[0] || {};
      salesContractArray.append(newItem);
    } else if (arrayName === "taxDetails") {
      const newItem = defaultValues.taxDetails[0] || {};
      taxDetailsArray.append(newItem);
    } else if (arrayName === "attachedPOCopy") {
      const newItem = defaultValues.attachedPOCopy[0] || {};
      attachedPOCopyArray.append(newItem);
    }
  };

  const handleRemoveItem = (arrayName, index) => {
    if (arrayName === "salesContract") {
      if (salesContractArray.fields.length > 1) {
        salesContractArray.remove(index);
      }
    } else if (arrayName === "taxDetails") {
      if (taxDetailsArray.fields.length > 1) {
        taxDetailsArray.remove(index);
      }
    } else if (arrayName === "attachedPOCopy") {
      if (attachedPOCopyArray.fields.length > 1) {
        attachedPOCopyArray.remove(index);
      }
    }
  };

  const onSubmit = async (formData) => {
    try {
      console.log("Sales Contract Data:", formData, "Org Id:", orgId);
      alert("Sales contract saved successfully!");
    } catch (error) {
      console.error("Error saving sales contract:", error);
      alert("Error saving sales contract");
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
          {data ? "Edit Sales Contract" : "Add Sales Contract"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField
            control={control}
            name="plantId"
            label="Plant ID"
            options={SELECT_OPTIONS.plantId}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="custContactNo"
            label="Cust. Contact No."
            placeholder="Enter contact number"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="belongsTo"
            label="Belongs To"
            options={SELECT_OPTIONS.contactType}
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="date"
            label="Date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="contactType"
            label="Contact Type"
            options={SELECT_OPTIONS.contactType}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="withQuotation"
            label="With Quotation"
            options={SELECT_OPTIONS.withQuotation}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="invoiceType"
            label="Invoice Type"
            options={SELECT_OPTIONS.invoiceType}
            errors={errors}
          />
          <InputField
            control={control}
            name="customerName"
            label="Customer Name"
            placeholder="Enter customer name"
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerId"
            label="Customer ID"
            options={SELECT_OPTIONS.customerId}
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="quotDate"
            label="Quot. Date"
            errors={errors}
          />
          <SelectField
            control={control}
            name="quotNo"
            label="Quot. No."
            options={SELECT_OPTIONS.contactType}
            errors={errors}
          />
          <InputField
            control={control}
            name="address"
            label="Address"
            placeholder="Enter address"
            errors={errors}
          />
          <InputField
            control={control}
            name="customerPONo"
            label="Customer PO No."
            placeholder="Enter PO number"
            required
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="customerPODate"
            label="Customer PO Date"
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="effectiveFrom"
            label="Effective From"
            errors={errors}
          />
          <SelectField
            control={control}
            name="isESTApplicable"
            label="Is IGST Applicable"
            options={SELECT_OPTIONS.isESTApplicable}
            required
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="effectiveTo"
            label="Effective To"
            errors={errors}
          />
          <InputField
            control={control}
            name="gstNo"
            label="GSTN No."
            errors={errors}
          />
          <SelectField
            control={control}
            name="postRate"
            label="Post Rate"
            options={SELECT_OPTIONS.postRate}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerType"
            label="Customer Type"
            options={SELECT_OPTIONS.customerType}
            errors={errors}
          />
          <SelectField
            control={control}
            name="taxCode"
            label="Tax Code"
            options={SELECT_OPTIONS.taxCode}
            required
            errors={errors}
          />
        
        </div>

        {/* Tabs Section */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("salesContract")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "salesContract"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Contract Detail
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("taxDetails")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "taxDetails"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Tax Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chargesSummary")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "chargesSummary"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Charges Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attachedPOCopy")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "attachedPOCopy"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Attached PO Copy
            </button>
          </div>

          {/* Tab 1: Sales Contract Detail */}
          {activeTab === "salesContract" && (
            <div className="space-y-1">
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("salesContract")}
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
                    Item Code
                      <span className="text-red-500">*</span>
                    </> ,                 
                    "Customer Part No",
                    "Item Description",
                    
                     <>
                     HSN/SAC Code
                      <span className="text-red-500">*</span>
                    </> ,
                     <>
                     Tax Type
                      <span className="text-red-500">*</span>
                    </> ,
                    "Tax (%)",
                     <>
                      Unit
                      <span className="text-red-500">*</span>
                    </> ,
                   
                    "Qty",
                    "Quot. Rate",
                      <>
                      Order Rate,
                      <span className="text-red-500">*</span>
                    </> ,
                    "Discount %",
                    "Effective From",
                    "Effective To",
                    "Discount Amount",
                    "Amount",
                    "SGST Rate",
                    "SGST Amount",
                    "CGST Rate",
                    "CGST Amount",
                    "IGST Rate",
                    "IGST Amount",
                    "Currency Name",
                    "Action",
                  ]}
                />
                <tbody>
                  {salesContractArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemoveItem("salesContract", index)}
                      disabled={salesContractArray.fields.length <= 1}
                    >
                      <SelectCell
                        control={control}
                        name={`salesContractDetails.${index}.itemCode`}
                        options={SELECT_OPTIONS.contactType}
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.customerPartNo`}
                        placeholder="Part No"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.itemDescription`}
                        placeholder="Description"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.hsCode`}
                        placeholder="HS Code"
                        required
                        errors={errors}
                      />
                      <SelectCell
                        control={control}
                        name={`salesContractDetails.${index}.taxType`}
                        options={SELECT_OPTIONS.taxType}
                        errors={errors}
                        required
                        
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.taxRs`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <SelectCell
                        control={control}
                        name={`salesContractDetails.${index}.unit`}
                        options={SELECT_OPTIONS.unit}
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.qty`}
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.quotRate`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.orderRate`}
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.discountPercent`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.effectiveFrom`}
                        type="date"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.effectiveTo`}
                        type="date"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.discountAmount`}
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.amount`}
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.sgstRate`}
                        type="number"
                        step="0.0001"
                        placeholder="0.0000"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.sgstAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.cgstRate`}
                        type="number"
                        step="0.0001"
                        placeholder="0.0000"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.cgstAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.igstRate`}
                        type="number"
                        step="0.0001"
                        placeholder="0.0000"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.igstAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`salesContractDetails.${index}.currencyName`}
                        placeholder="Currency"
                        errors={errors}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Tab 2: Tax Details */}
          {activeTab === "taxDetails" && (
            <div className="space-y-1">
              <TableWrapper>
                <TableHead headers={["S.No", "Particulars", "Amount"]} />
                <tbody>
                  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-1 text-center font-medium dark:text-white">
                      1
                    </td>
                    <td className="p-1 align-top">
                      <Controller
                        name="taxDetails.0.particulars"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`${controlClasses} h-8 text-xs`}
                            placeholder="Enter particulars"
                          />
                        )}
                      />
                    </td>
                    <td className="p-1 align-top">
                      <Controller
                        name="taxDetails.0.amount"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={`${controlClasses} h-8 text-xs text-right`}
                          />
                        )}
                      />
                    </td>
                  </tr>
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Tab 3: Charges Summary (NEW) */}
          {/* Tab 3: Charges Summary - CORRECT 1 ROW 5 COL DESIGN */}
          {activeTab === "chargesSummary" && (
            <div className="p-2 grid grid-cols-5 gap-x-6 gap-y-4">
              {/* 1. Total Amount */}
              <div className="col-span-1">
                <label className={labelClasses}>Total Amount</label>
                <Controller
                  name="chargesSummary.totalAmount"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      className={`${controlClasses} text-right`}
                    />
                  )}
                />
              </div>

              {/* 2. Amount In Words (Span remaining columns to align with full width like image) */}
              <div className="col-span-4">
                <label className={labelClasses}>Amount In Words</label>
                <Controller
                  name="chargesSummary.amountInWords"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`${controlClasses}`}
                      placeholder="Enter amount in words"
                    />
                  )}
                />
              </div>

              {/* 3. Payment Terms */}
              <div className="col-span-1">
                <label className={labelClasses}>
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="chargesSummary.paymentTerms"
                  control={control}
                  rules={{ required: "Payment Terms is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`${controlClasses} ${errors?.chargesSummary?.paymentTerms ? "border-red-500 focus:border-red-500" : ""}`}
                      placeholder="Enter payment terms"
                    />
                  )}
                />
                {errors?.chargesSummary?.paymentTerms && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.chargesSummary.paymentTerms.message}
                  </p>
                )}
              </div>

              {/* 4. Price Terms (Span 2 cols to match the wide input in your image) */}
              <div className="col-span-2">
                <label className={labelClasses}>Price Terms</label>
                <Controller
                  name="chargesSummary.priceTerms"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`${controlClasses}`}
                      placeholder="Enter price terms"
                    />
                  )}
                />
              </div>

              {/* 5. Terms (Grey Background) (Span 2 cols to match the wide input in your image) */}
              <div className="col-span-2">
                <label className={labelClasses}>Terms</label>
                <Controller
                  name="chargesSummary.terms"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter terms"
                    />
                  )}
                />
              </div>

              {/* 6. Note (Spans full width of the next row) */}
              <div className="col-span-5 mt-2">
                <label className={labelClasses}>Note</label>
                <Controller
                  name="chargesSummary.note"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className={`${controlClasses} h-auto min-h-[100px] resize-y`}
                      placeholder="Enter notes..."
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Attached PO Copy */}
          {activeTab === "attachedPOCopy" && (
            <div className="space-y-1">
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("attachedPOCopy")}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <TableWrapper>
                <TableHead headers={["S.No", "PDF Attached", "Action"]} />
                <tbody>
                  {attachedPOCopyArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemoveItem("attachedPOCopy", index)}
                      disabled={attachedPOCopyArray.fields.length <= 1}
                    >
                      <FileUploadCell
                        control={control}
                        name={`attachedPOCopy.${index}.pdfAttached`}
                        errors={errors}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
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

export default SalesContractForm;
