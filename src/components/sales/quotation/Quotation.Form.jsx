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
  quotationNo: "Auto",
  date: new Date().toISOString().split('T')[0],
  withEnquiry: "NO",
  partyId: "",
  partyName: "",
  enquiryNo: "",
  enquiryDate: "",
  validTill: "",
  quotationSerialNo: "",
  kindAttention: "",
  customerEnquiryNo: "",
  taxCode: "",
  customerEnquiryDate: "",
  quotationItems: [
    {
      itemCode: "",
      itemDescription: "",
      unit: "",
      qtyOffered: 0,
      basicPrice: 0,
      discPercent: 0,
      discountAmount: 0,
      quotAmount: 0,
      qty: 0,
      currencyName: "",
      date: new Date().toISOString().split('T')[0],
    },
  ],
  taxDetails: [
    {
      particulars: "",
      amount: 0,
    },
  ],
  chargesSummary: {
    amount: 0,
    freight: 0,
    freightBy: "",
    totalAmount: 0,
    terms: "",
    remarks: "",
  },
  pdfAttachment: [{ attachment: null }],
});

const SELECT_OPTIONS = {
  plantId: ["Plant A", "Plant B", "Plant C"],
  withEnquiry: ["YES", "NO"],
  partyId: ["Party 1", "Party 2", "Party 3"],
  enquiryNo: ["ENQ-001", "ENQ-002", "ENQ-003"],
  validTill: ["30 Days", "60 Days", "90 Days"],
  kindAttention: ["Mr. John", "Ms. Smith", "Dr. Brown", "Mr. David"],
  taxCode: ["GST-18", "GST-12", "GST-5", "GST-28"],
  unit: ["Nos", "Box", "Kg", "Meter", "Litre", "Pcs"],
  currencyName: ["INR", "USD", "EUR", "GBP"],
  freightBy: ["Buyer", "Seller", "Third Party"],
  quotationSerialNo: ["2607", "2608", "2609", "2610"],
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

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white">
      {index + 1}
    </td>
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
const QuotationForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("quotationItems");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const quotationItemsArray = useFieldArray({ control, name: "quotationItems" });
  const taxDetailsArray = useFieldArray({ control, name: "taxDetails" });
  const pdfAttachmentArray = useFieldArray({ control, name: "pdfAttachment" });

  const getFieldArray = (tab) => {
    switch (tab) {
      case "quotationItems":
        return quotationItemsArray;
      case "taxDetails":
        return taxDetailsArray;
      case "pdfAttachment":
        return pdfAttachmentArray;
      default:
        return quotationItemsArray;
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

  // Watch values for calculations
  const watchQuotationItems = watch("quotationItems");

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
          {data ? "Edit Quotation" : "Add Quotation"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields - Updated as per image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Row 1 */}
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
            name="quotationNo"
            label="Quotation No"
            value="Auto"
            disabled
            errors={errors}
          />
          <InputField
            control={control}
            name="date"
            label="Date"
            type="date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="withEnquiry"
            label="With Enquiry"
            options={SELECT_OPTIONS.withEnquiry}
            required
            errors={errors}
          />

          {/* Row 2 */}
          <SelectField
            control={control}
            name="partyId"
            label="Party Id"
            options={SELECT_OPTIONS.partyId}
            errors={errors}
          />
          <InputField
            control={control}
            name="partyName"
            label="Party Name"
            placeholder="Enter party name"
            errors={errors}
          />
          <SelectField
            control={control}
            name="enquiryNo"
            label="Enquiry No"
            options={SELECT_OPTIONS.enquiryNo}
            errors={errors}
          />
          <InputField
            control={control}
            name="enquiryDate"
            label="Enquiry Date"
            type="date"
            errors={errors}
          />

          {/* Row 3 */}
          <SelectField
            control={control}
            name="validTill"
            label="Valid Till"
            options={SELECT_OPTIONS.validTill}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="quotationSerialNo"
            label="Quotation Serial No."
            options={SELECT_OPTIONS.quotationSerialNo}
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="kindAttention"
            label="Kind Attention"
            options={SELECT_OPTIONS.kindAttention}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="customerEnquiryNo"
            label="Customer Enquiry No."
            placeholder="Enter customer enquiry no"
            errors={errors}
          />

          {/* Row 4 */}
          <SelectField
            control={control}
            name="taxCode"
            label="Tax Code"
            options={SELECT_OPTIONS.taxCode}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="customerEnquiryDate"
            label="Customer Enquiry Date"
            type="date"
            errors={errors}
          />
        </div>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["quotationItems", "taxDetails", "chargesSummary", "pdfAttachment"].map((tab) => (
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
                  {tab === "pdfAttachment"
                    ? "PDF Attachment"
                    : tab.replace(/([A-Z])/g, " $1").trim()}
                </button>
              ))}
            </div>
            {activeChildTab !== "chargesSummary" && (
              <button
                type="button"
                onClick={() => handleAdd(activeChildTab)}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab Content - Quotation Items */}
          {activeChildTab === "quotationItems" && (
            <TableWrapper>
             
               <TableHead
      headers={[
        "S.No",
        <>
          Item Code <span className="text-red-500">*</span>
        </>,
        "Item Description",
        "Unit",
        <>
          Qty Offered <span className="text-red-500">*</span>
        </>,
        <>
          Basic Price <span className="text-red-500">*</span>
        </>,
        "Disc.%",
        "Discount Amount",
        "Quot. Amount",
        "Qty",
        "Currency Name",
        <>
          Date <span className="text-red-500">*</span>
        </>,
        "Action",
      ]}
    />
              <tbody>
                {quotationItemsArray.fields.map((field, index) => {
                  const qtyOffered = watchQuotationItems?.[index]?.qtyOffered || 0;
                  const basicPrice = watchQuotationItems?.[index]?.basicPrice || 0;
                  const discPercent = watchQuotationItems?.[index]?.discPercent || 0;
                  const discountAmount = (basicPrice * discPercent) / 100;
                  const quotAmount = basicPrice - discountAmount;

                  return (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemove("quotationItems", index)}
                      disabled={quotationItemsArray.fields.length <= 1}
                    >
                      <SelectCell
                        control={control}
                        name={`quotationItems.${index}.itemCode`}
                        options={SELECT_OPTIONS.enquiryNo}
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.itemDescription`}
                        placeholder="Item Description"
                        errors={errors}
                      />
                      <SelectCell
                        control={control}
                        name={`quotationItems.${index}.unit`}
                        options={SELECT_OPTIONS.unit}
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.qtyOffered`}
                        type="number"
                        // step="0.01"
                        placeholder="Qty Offered"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.basicPrice`}
                        type="number"
                        // step="0.01"
                        placeholder="Basic Price"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.discPercent`}
                        type="number"
                        step="0.01"
                        placeholder="Disc.%"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.discountAmount`}
                        type="number"
                        step="0.01"
                        value={discountAmount.toFixed(2)}
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.quotAmount`}
                        type="number"
                        step="0.01"
                        value={quotAmount.toFixed(2)}
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.qty`}
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        errors={errors}
                      />
                      <SelectCell
                        control={control}
                        name={`quotationItems.${index}.currencyName`}
                        options={SELECT_OPTIONS.currencyName}
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.date`}
                        type="date"
                        required
                        errors={errors}
                      />
                    </TableRow>
                  );
                })}
              </tbody>
            </TableWrapper>
          )}

          {/* Tab Content - Tax Details */}
          {activeChildTab === "taxDetails" && (
            <TableWrapper>
              <TableHead
                headers={["S.No", "Particulars", "Amount", "Action"]}
              />
              <tbody>
                {taxDetailsArray.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemove("taxDetails", index)}
                    disabled={taxDetailsArray.fields.length <= 1}
                  >
                    <SelectCell
                      control={control}
                      name={`taxDetails.${index}.particulars`}
                      options={["GST", "VAT", "Service Tax", "Cess", "Customs"]}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`taxDetails.${index}.amount`}
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {/* Tab Content - Charges Summary */}
          {activeChildTab === "chargesSummary" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
              <InputField
                control={control}
                name="chargesSummary.amount"
                label="Amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.freight"
                label="Freight"
                type="number"
                step="0.01"
                placeholder="Enter freight"
                errors={errors}
              />
              <SelectField
                control={control}
                name="chargesSummary.freightBy"
                label="Freight By"
                options={SELECT_OPTIONS.freightBy}
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.totalAmount"
                label="Total Amount"
                type="number"
                step="0.01"
                disabled
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.terms"
                label="Terms"
                placeholder="Enter terms and conditions"
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.remarks"
                label="Remarks"
                placeholder="Enter remarks"
                errors={errors}
              />
            </div>
          )}

          {/* Tab Content - PDF Attachment */}
          {activeChildTab === "pdfAttachment" && (
            <TableWrapper>
              <TableHead headers={["S.No", "Attach PDF Copy", "Action"]} />
              <tbody>
                {pdfAttachmentArray.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemove("pdfAttachment", index)}
                    disabled={pdfAttachmentArray.fields.length <= 1}
                  >
                    <td className="p-1">
                      <Controller
                        name={`pdfAttachment.${index}.attachment`}
                        control={control}
                        render={({ field: { onChange } }) => (
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept=".pdf"
                              className="w-full text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                              onChange={(e) =>
                                onChange(e.target.files?.[0] || null)
                              }
                            />
                            <p className="text-xs text-gray-500 mt-1">Drop files here or click to upload</p>
                          </div>
                        )}
                      />
                    </td>
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

export default QuotationForm;