import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
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
  // Invoice Header Fields - 22 fields matching the image
  plant: "",
  invoiceNo: "",
  invoiceDate: "2026-07-30",
  customerId: "",
  customerName: "",
  belongsTo: "",
  customerCode: "",
  poNo: "",
  partyGSTState: "",
  refNo: "",
  poDate: "",
  isIGSTAppli: "",
  refDate: "",
  locationId: "",
  gstnNo: "",
  kindAttention: "",
  designation: "",
  timeOfIssue: "12:40:35",
  taxCode: "",
  bankName: "",
  date: "2026-07-30",
  timeOfRemoval: "12:40:35",

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
      postFin: "",
    },
  ],

  // Terms and Conditions
  termsAndConditions: {
    insurance: "",
    freight: "",
    noOfPkg: "",
    pkgType: "",
    modeOfTransport: "",
    rateOfDuty: "",
    tariffNo: "",
    basicValue: "",
    grossAmount: "0.00",
    amountInWords: "Rupees Only",
    deliveryTo: "",
    paymentTerms: "",
    paymentPercentage: "",
    narration: "",
  },
});

const SELECT_OPTIONS = {
  plant: ["Plant A", "Plant B", "Plant C", "Plant D"],
  customerId: ["CUST001", "CUST002", "CUST003", "CUST004"],
  customerName: ["Customer A", "Customer B", "Customer C"],
  belongsTo: ["Sales", "Service", "Support", "Marketing"],
  customerCode: ["CC001", "CC002", "CC003", "CC004"],
  poNo: ["PO001", "PO002", "PO003", "PO004"],
  partyGSTState: ["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi"],
  refNo: ["REF001", "REF002", "REF003", "REF004"],
  isIGSTAppli: ["Yes", "No"],
  locationId: ["LOC001", "LOC002", "LOC003", "LOC004"],
  gstnNo: ["GSTN001", "GSTN002", "GSTN003", "GSTN004"],
  kindAttention: ["Mr.", "Ms.", "Dr.", "Prof.", "Mrs."],
  designation: ["Manager", "Director", "CEO", "Assistant", "Executive"],
  taxCode: ["TC001", "TC002", "TC003", "TC004"],
  bankName: ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank"],
  contactType: ["Primary", "Secondary", "Billing", "Shipping"],
  withQuotation: ["Yes", "No"],
  invoiceType: ["Tax Invoice", "Proforma Invoice", "Commercial Invoice"],
  isESTApplicable: ["Yes", "No"],
  postRate: ["Yes", "No"],
  customerType: ["Individual", "Business", "Government", "International"],
  unit: ["Pcs", "Kg", "Meter", "Liter", "Box", "NOS"],
  taxType: ["CGST+SGST", "IGST", "UTGST", "GST"],
  particulars: ["Freight", "Insurance", "Packing Charges", "Handling Charges", "Other"],
  modeOfTransport: ["Road", "Rail", "Air", "Sea", "Courier"],
  yesNo: ["Yes", "No"],
  postFin: ["Yes", "No"],
  insurance: ["Yes", "No"],
  freight: ["Yes", "No"],
  pkgType: ["Box", "Pallet", "Crate", "Bag", "Drum", "Container"],
};

// Helper Components
const SelectField = ({ control, name, label, options, required, errors, placeholder }) => {
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
            <option value="">{placeholder || "Select an option"}</option>
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
  defaultValue,
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
        defaultValue={defaultValue}
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

// Main Component
const ProformaInvoiceForm = ({ data, onBack }) => {
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
  const taxDetailsArray = useFieldArray({
    control,
    name: "taxDetails",
  });

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "salesContract") {
      const newItem = defaultValues.salesContractDetails[0] || {};
      salesContractArray.append(newItem);
    } else if (arrayName === "taxDetails") {
      const newItem = {
        id: taxDetailsArray.fields.length + 1,
        particulars: "",
        amount: 0.0,
        postFin: "",
      };
      taxDetailsArray.append(newItem);
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
    }
  };

  const onSubmit = async (formData) => {
    try {
      console.log("Invoice Data:", formData, "Org Id:", orgId);
      alert("Invoice saved successfully!");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Error saving invoice");
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
          {data ? "Edit Proforma Invoice" : "Add Proforma Invoice"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Invoice Header Fields - 4 columns matching the image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
          {/* Row 1 */}
          <SelectField
            control={control}
            name="plant"
            label="Plant"
            options={SELECT_OPTIONS.plant}
            errors={errors}
            placeholder="Select an option"
          />

          <InputField
            control={control}
            name="invoiceNo"
            label="Invoice No *"
            required
            placeholder="Auto"
            errors={errors}
          />

          <InputField
            control={control}
            type="date"
            name="invoiceDate"
            label="Invoice Date *"
            required
            errors={errors}
          />

          <SelectField
            control={control}
            name="customerId"
            label="Customer ID *"
            options={SELECT_OPTIONS.customerId}
            required
            errors={errors}
            placeholder="Select an option"
          />

          {/* Row 2 */}
          <InputField
            control={control}
            name="customerName"
            label="Customer Name"
            placeholder="Customer Name"
            errors={errors}
          />

          <SelectField
            control={control}
            name="belongsTo"
            label="Belongs To"
            options={SELECT_OPTIONS.belongsTo}
            errors={errors}
            placeholder="Select an option"
          />

          <SelectField
            control={control}
            name="customerCode"
            label="Customer Code"
            options={SELECT_OPTIONS.customerCode}
            errors={errors}
            placeholder="-- Select --"
          />

          <SelectField
            control={control}
            name="poNo"
            label="PO No."
            options={SELECT_OPTIONS.poNo}
            errors={errors}
            placeholder="Select an option"
          />

          {/* Row 3 */}
          <SelectField
            control={control}
            name="partyGSTState"
            label="Party GST State *"
            options={SELECT_OPTIONS.partyGSTState}
            required
            errors={errors}
            placeholder="Select an option"
          />

          <SelectField
            control={control}
            name="refNo"
            label="Ref.No."
            options={SELECT_OPTIONS.refNo}
            errors={errors}
            placeholder="Select an option"
          />

          <InputField
            control={control}
            type="date"
            name="poDate"
            label="PO Date"
            errors={errors}
          />

          <SelectField
            control={control}
            name="isIGSTAppli"
            label="Is IGST Appli *"
            options={SELECT_OPTIONS.isIGSTAppli}
            required
            errors={errors}
            placeholder="Select an option"
          />

          {/* Row 4 */}
          <InputField
            control={control}
            type="date"
            name="refDate"
            label="Ref.Date."
            errors={errors}
          />

          <SelectField
            control={control}
            name="locationId"
            label="Location ID"
            options={SELECT_OPTIONS.locationId}
            errors={errors}
            placeholder="Select an option"
          />

          <InputField
            control={control}
            name="gstnNo"
            label="GSTN No"
            placeholder="GSTN No"
            errors={errors}
          />

          <SelectField
            control={control}
            name="kindAttention"
            label="Kind Attention"
            options={SELECT_OPTIONS.kindAttention}
            errors={errors}
            placeholder="Select an option"
          />

          {/* Row 5 */}
          <SelectField
            control={control}
            name="designation"
            label="Designation"
            options={SELECT_OPTIONS.designation}
            errors={errors}
            placeholder="Select an option"
          />

          <InputField
            control={control}
            type="time"
            name="timeOfIssue"
            label="Time Of Issue"
            defaultValue="12:40:35"
            errors={errors}
          />

          <SelectField
            control={control}
            name="taxCode"
            label="Tax Code"
            options={SELECT_OPTIONS.taxCode}
            errors={errors}
            placeholder="Select an option"
          />

          <SelectField
            control={control}
            name="bankName"
            label="Bank Name"
            options={SELECT_OPTIONS.bankName}
            errors={errors}
            placeholder="Select an option"
          />

          {/* Row 6 */}
          <InputField
            control={control}
            type="date"
            name="date"
            label="Date"
            defaultValue="2026-07-30"
            errors={errors}
          />

          <InputField
            control={control}
            type="time"
            name="timeOfRemoval"
            label="Time Of Removal"
            defaultValue="12:40:35"
            errors={errors}
          />

          <div></div>
          <div></div>
        </div>

        {/* Tabs Section - 3 Tabs */}
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
              Product Details
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
              onClick={() => setActiveTab("termsAndConditions")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${
                activeTab === "termsAndConditions"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Terms And Conditions
            </button>
          </div>

          {/* Tab 1: Product Details */}
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
                      Item Code <span className="text-red-500">*</span>
                    </>,
                    "Customer Part No",
                    "Item Description",
                    <>
                      HSN/SAC Code <span className="text-red-500">*</span>
                    </>,
                    <>
                      Tax Type <span className="text-red-500">*</span>
                    </>,
                    "Tax (%)",
                    <>
                      Unit <span className="text-red-500">*</span>
                    </>,
                    "Qty",
                    "Quot. Rate",
                    <>
                      Order Rate <span className="text-red-500">*</span>
                    </>,
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
                        required
                        errors={errors}
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
                    "Amount",
                    "Post Fin",
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
                      <td className="p-1 align-top">
                        <Controller
                          name={`taxDetails.${index}.particulars`}
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
                          name={`taxDetails.${index}.amount`}
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
                      <td className="p-1 align-top">
                        <SelectField
                          control={control}
                          name={`taxDetails.${index}.postFin`}
                          label=""
                          options={SELECT_OPTIONS.postFin}
                          errors={errors}
                          placeholder="Select"
                        />
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Tab 3: Terms And Conditions */}
          {activeTab === "termsAndConditions" && (
            <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {/* Row 1 */}
              <SelectField
                control={control}
                name="termsAndConditions.insurance"
                label="Insurance"
                options={SELECT_OPTIONS.insurance}
                errors={errors}
                placeholder="Select"
              />

              <SelectField
                control={control}
                name="termsAndConditions.freight"
                label="Freight"
                options={SELECT_OPTIONS.freight}
                errors={errors}
                placeholder="Select"
              />

              <InputField
                control={control}
                name="termsAndConditions.noOfPkg"
                label="No. Of Pkg"
                type="number"
                placeholder="Enter number of packages"
                errors={errors}
              />

              {/* Row 2 */}
              <SelectField
                control={control}
                name="termsAndConditions.pkgType"
                label="Pkg Type"
                options={SELECT_OPTIONS.pkgType}
                errors={errors}
                placeholder="Select"
              />

              <SelectField
                control={control}
                name="termsAndConditions.modeOfTransport"
                label="Mode Of Transport"
                options={SELECT_OPTIONS.modeOfTransport}
                errors={errors}
                placeholder="Select"
              />

              <InputField
                control={control}
                name="termsAndConditions.rateOfDuty"
                label="Rate Of Duty"
                type="number"
                step="0.01"
                placeholder="0.00"
                errors={errors}
              />

              {/* Row 3 */}
              <InputField
                control={control}
                name="termsAndConditions.tariffNo"
                label="Tariff No."
                placeholder="Enter tariff number"
                errors={errors}
              />

              <InputField
                control={control}
                name="termsAndConditions.basicValue"
                label="Basic Value"
                type="number"
                step="0.01"
                placeholder="0.00"
                errors={errors}
              />

              <InputField
                control={control}
                name="termsAndConditions.grossAmount"
                label="Gross Amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue="0.00"
                errors={errors}
              />

              {/* Row 4 - Full width */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <InputField
                  control={control}
                  name="termsAndConditions.amountInWords"
                  label="Amount In Words"
                  placeholder="Rupees Only"
                  errors={errors}
                />
              </div>

              {/* Row 5 */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <InputField
                  control={control}
                  name="termsAndConditions.deliveryTo"
                  label="Delivery To"
                  placeholder="Enter delivery address"
                  errors={errors}
                />
              </div>

              {/* Row 6 */}
              <div className="col-span-1">
                <InputField
                  control={control}
                  name="termsAndConditions.paymentTerms"
                  label="Payment Terms"
                  placeholder="Enter payment terms"
                  errors={errors}
                />
              </div>

              <div className="col-span-1">
                <InputField
                  control={control}
                  name="termsAndConditions.paymentPercentage"
                  label="Payment %"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  errors={errors}
                />
              </div>

              {/* Row 7 - Full width */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <TextAreaField
                  control={control}
                  name="termsAndConditions.narration"
                  label="Narration"
                  placeholder="Enter narration..."
                  rows={3}
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

export default ProformaInvoiceForm;