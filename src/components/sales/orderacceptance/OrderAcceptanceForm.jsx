import { ArrowLeft, Save, X, Plus, Trash2, Upload, File } from "lucide-react";
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
  orderNo: "",
  auto: "",
  billingTo: "",
  qty: "",
  qtyType: "",
  withQuantity: "",
  customerId: "",
  customerName: "",
  quantityDate: "",
  quantityNo: "",
  customerNo: "",
  customerDate: "",
  postSale: "",
  taxCode: "",
  gstApplicable: "",
  customerType: "",
  gstinNo: "",
  soType: "",
  withQuotation: "",
  quotationNo: "",
  enquiryDate: "",
  enquiryNo: "",
  custPONo: "",
  custPODate: "",
  invoiceType: "",
  firstRate: "",
  
  // Order Acceptance Details Table
  orderAcceptanceDetails: [
    {
      sno: "",
      itemCode: "",
      customerPartNo: "",
      itemDescription: "",
      hsCode: "",
      taxType: "",
      taxRs: 0,
      lastInvitedDate: "",
      unit: "",
      quantity: 0,
      unitRate: 0,
      otherRate: 0,
      dis: 0,
      amount: 0,
      gstRate1: 0,
      gstAmount1: 0,
      gstRate2: 0,
      gstAmount2: 0,
      gstRate3: 0,
      gstAmount3: 0,
      gstRate4: 0,
      gstAmount4: 0,
    },
  ],
  
  // Tax Details Table
  taxDetails: [
    {
      sno: "",
      particulars: "",
      acceptedAmount: 0,
      revisedAmount: 0,
    },
  ],
  
  // Terms and Conditions - Single Object (not array)
  termsConditions: {
    destination: "",
    freight: "",
    modeOfTransport: "",
    grossValue: 0,
    deliveryTerms: "",
    paymentTerms: "",
    specification: "",
    note: "",
  },
  
  // Attached PO Copy Table
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
  billingTo: ["Customer 1", "Customer 2", "Customer 3"],
  qtyType: ["Pcs", "Kg", "Meter", "Liter", "Box"],
  withQuantity: ["Yes", "No"],
  customerId: ["CUST001", "CUST002", "CUST003"],
  customerName: ["Customer A", "Customer B", "Customer C"],
  soType: ["Standard", "Express", "Bulk"],
  withQuotation: ["Yes", "No"],
  quotationNo: ["QTN001", "QTN002", "QTN003"],
  enquiryNo: ["ENQ001", "ENQ002", "ENQ003"],
  invoiceType: ["Tax Invoice", "Proforma Invoice", "Commercial Invoice"],
  taxCode: ["TC001", "TC002", "TC003"],
  gstApplicable: ["Yes", "No"],
  customerType: ["Individual", "Business", "Government", "International"],
  gstinNo: ["GSTIN001", "GSTIN002", "GSTIN003"],
  postSale: ["Yes", "No"],
  unit: ["Pcs", "Kg", "Meter", "Liter", "Box"],
  taxType: ["CGST+SGST", "IGST", "UTGST", "GST"],
  yesNo: ["Yes", "No"],
  particulars: ["GST", "CGST", "SGST", "IGST", "Cess", "Other"],
  modeOfTransport: ["Road", "Rail", "Air", "Sea", "Courier"],
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
                e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  onChange(files[0]);
                  setFileName(files[0].name);
                }
              }}
              onClick={() => document.getElementById(`file-input-${name}`)?.click()}
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
                  <span className="text-xs truncate max-w-[150px]">{value.name || fileName}</span>
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
const OrderAcceptanceForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeTab, setActiveTab] = useState("orderAcceptance");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: data || getDefaultValues(),
  });

  const orderAcceptanceArray = useFieldArray({ control, name: "orderAcceptanceDetails" });
  const taxDetailsArray = useFieldArray({ control, name: "taxDetails" });
  const attachedPOCopyArray = useFieldArray({ control, name: "attachedPOCopy" });

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "orderAcceptance") {
      const newItem = defaultValues.orderAcceptanceDetails[0] || {};
      orderAcceptanceArray.append(newItem);
    } else if (arrayName === "taxDetails") {
      const newItem = defaultValues.taxDetails[0] || {};
      taxDetailsArray.append(newItem);
    } else if (arrayName === "attachedPOCopy") {
      const newItem = defaultValues.attachedPOCopy[0] || {};
      attachedPOCopyArray.append(newItem);
    }
  };

  const handleRemoveItem = (arrayName, index) => {
    if (arrayName === "orderAcceptance") {
      if (orderAcceptanceArray.fields.length > 1) {
        orderAcceptanceArray.remove(index);
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
      console.log("Order Acceptance Data:", formData, "Org Id:", orgId);
      alert("Order acceptance saved successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Error saving order acceptance");
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
          {data ? "Edit Order Acceptance" : "Add Order Acceptance"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
            name="orderNo"
            label="Order No."
            placeholder="Enter order number"
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="auto"
            label="Auto"
            placeholder="Auto generated"
            disabled
            errors={errors}
          />
          <SelectField
            control={control}
            name="billingTo"
            label="Billing To"
            options={SELECT_OPTIONS.billingTo}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="qty"
            label="QTY"
            type="number"
            placeholder="Enter quantity"
            errors={errors}
          />
          <SelectField
            control={control}
            name="qtyType"
            label="QTY Type"
            options={SELECT_OPTIONS.qtyType}
            errors={errors}
          />
          <SelectField
            control={control}
            name="withQuantity"
            label="With Quantity"
            options={SELECT_OPTIONS.withQuantity}
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerId"
            label="Customer Id"
            options={SELECT_OPTIONS.customerId}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerName"
            label="Customer Name"
            options={SELECT_OPTIONS.customerName}
            required
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="quantityDate"
            label="Quantity Date"
            errors={errors}
          />
          <InputField
            control={control}
            name="quantityNo"
            label="Quantity No"
            placeholder="Enter quantity number"
            errors={errors}
          />
          <InputField
            control={control}
            name="customerNo"
            label="Customer No"
            placeholder="Enter customer number"
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="customerDate"
            label="Customer Date"
            errors={errors}
          />
          <SelectField
            control={control}
            name="postSale"
            label="Post Sale"
            options={SELECT_OPTIONS.postSale}
            errors={errors}
          />
          <SelectField
            control={control}
            name="taxCode"
            label="Tax Code"
            options={SELECT_OPTIONS.taxCode}
            errors={errors}
          />
          <SelectField
            control={control}
            name="gstApplicable"
            label="GST Applicable"
            options={SELECT_OPTIONS.gstApplicable}
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerType"
            label="Customer Type"
            options={SELECT_OPTIONS.customerType}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="gstinNo"
            label="GSTIN No"
            options={SELECT_OPTIONS.gstinNo}
            errors={errors}
          />
        </div>

        {/* Tabs Section */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("orderAcceptance")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "orderAcceptance"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Order Acceptance Detail
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
              onClick={() => setActiveTab("termsConditions")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "termsConditions"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Terms and Conditions
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

          {/* Tab 1: Order Acceptance Detail */}
          {activeTab === "orderAcceptance" && (
            <div className="space-y-1">
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("orderAcceptance")}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <TableWrapper>
                <TableHead
                  headers={[
                    "S.No",
                    "Item Code",
                    "Customer Part No",
                    "Item Description",
                    "HS Code",
                    "Tax Type",
                    "Tax (Rs)",
                    "Last Invited Date",
                    "Unit",
                    "Quantity",
                    "Unit Rate",
                    "Other Rate",
                    "Dis.",
                    "Amount",
                    "GST Rate",
                    "GST Amount",
                    "GST Rate",
                    "GST Amount",
                    "GST Rate",
                    "GST Amount",
                    "GST Rate",
                    "GST Amount",
                    "Action",
                  ]}
                />
                <tbody>
                  {orderAcceptanceArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemoveItem("orderAcceptance", index)}
                      disabled={orderAcceptanceArray.fields.length <= 1}
                    >
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.itemCode`}
                        placeholder="Item Code"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.customerPartNo`}
                        placeholder="Part No"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.itemDescription`}
                        placeholder="Description"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.hsCode`}
                        placeholder="HS Code"
                        errors={errors}
                      />
                      <SelectCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.taxType`}
                        options={SELECT_OPTIONS.taxType}
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.taxRs`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.lastInvitedDate`}
                        type="date"
                        errors={errors}
                      />
                      <SelectCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.unit`}
                        options={SELECT_OPTIONS.unit}
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.quantity`}
                        type="number"
                        step="1"
                        placeholder="0"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.unitRate`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.otherRate`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.dis`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.amount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstRate1`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstAmount1`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstRate2`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstAmount2`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstRate3`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstAmount3`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstRate4`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`orderAcceptanceDetails.${index}.gstAmount4`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("taxDetails")}
                  className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              <TableWrapper>
                <TableHead
                  headers={[
                    "S.No",
                    "Particulars",
                    "Accepted Amount",
                    "Revised Amount",
                    "Action",
                  ]}
                />
                <tbody>
                  {taxDetailsArray.fields.map((field, index) => (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemoveItem("taxDetails", index)}
                      disabled={taxDetailsArray.fields.length <= 1}
                    >
                      <SelectCell
                        control={control}
                        name={`taxDetails.${index}.particulars`}
                        options={SELECT_OPTIONS.particulars}
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`taxDetails.${index}.acceptedAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`taxDetails.${index}.revisedAmount`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        errors={errors}
                      />
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Tab 3: Terms and Conditions - Single Row without Add/Delete */}
          {activeTab === "termsConditions" && (
            <div className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <InputField
                  control={control}
                  name="termsConditions.destination"
                  label="Destination"
                  placeholder="Enter destination"
                  errors={errors}
                />
                <InputField
                  control={control}
                  name="termsConditions.freight"
                  label="Freight"
                  placeholder="Enter freight"
                  errors={errors}
                />
                <SelectField
                  control={control}
                  name="termsConditions.modeOfTransport"
                  label="Mode of Transport"
                  options={SELECT_OPTIONS.modeOfTransport}
                  required
                  errors={errors}
                />
                <InputField
                  control={control}
                  name="termsConditions.grossValue"
                  label="Gross Value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  errors={errors}
                />
                <InputField
                  control={control}
                  name="termsConditions.deliveryTerms"
                  label="Delivery Terms"
                  placeholder="Enter delivery terms"
                  errors={errors}
                />
                <InputField
                  control={control}
                  name="termsConditions.paymentTerms"
                  label="Payment Terms"
                  placeholder="Enter payment terms"
                  required
                  errors={errors}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <TextAreaField
                  control={control}
                  name="termsConditions.specification"
                  label="Specification"
                  placeholder="Enter specifications..."
                  rows={3}
                  errors={errors}
                />
                <TextAreaField
                  control={control}
                  name="termsConditions.note"
                  label="Note"
                  placeholder="Enter notes..."
                  rows={3}
                  errors={errors}
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
                <TableHead
                  headers={[
                    "S.No",
                    "PDF Attached",
                    "Action",
                  ]}
                />
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

export default OrderAcceptanceForm;