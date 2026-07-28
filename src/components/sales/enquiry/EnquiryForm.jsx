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
  enquiryNo: "",
  enquiryType: "",
  enquiryDate: "",
  partyId: "",
  partyName: "",
  partyRefNo: "",
  status: "",
  partyRefDate: "",
  enquiryDueDate: "",
  contactName: "",
  contactEmail: "",
  enquiryDetail: [
    {
      contactPartNo: "",
      itemDescription: "",
      annualQty: 0,
      dlryDate: "",
      needApproval: "",
      quoteDueDate: "",
      remarks: "",
    },
  ],
  terms: [
    {
      additionalInvestment: "",
      additionalManPower: "",
      timeFrame: "",
      expectedTime: "",
      pilotBatch: "",
      regularProduction: "",
      reviewComments: "",
      detailReview: "",
      statutory: "",
      followUp: "",
      conclusion: "",
      remarks: "",
    },
  ],
  attachement: [{ attchement: null }],
});

const SELECT_OPTIONS = {
  plantId: ["Plant A", "Plant B", "Plant C"],
  enquiryType: ["Type 1", "Type 2", "Type 3"],
  partyId: ["Party 1", "Party 2", "Party 3"],
  status: ["Pending", "Approved", "Rejected"],
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
const EnquiryForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [activeChildTab, setActiveChildTab] = useState("enquiryDetail");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const enquiryDetailArray = useFieldArray({ control, name: "enquiryDetail" });
  const termsArray = useFieldArray({ control, name: "terms" });
  const attachementArray = useFieldArray({ control, name: "attachement" });

  const getFieldArray = (tab) => {
    switch (tab) {
      case "enquiryDetail":
        return enquiryDetailArray;
      case "terms":
        return termsArray;
      case "attachement":
        return attachementArray;
      default:
        return enquiryDetailArray;
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
          {data ? "Edit Enquiry" : "Add Enquiry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Basic Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField
            control={control}
            name="plantId"
            label="Plant Id"
            options={SELECT_OPTIONS.plantId}
            errors={errors}
          />
          <InputField
            control={control}
            name="enquiryNo"
            label="Enquiry No"
            required
            disabled
            errors={errors}
          />
          <SelectField
            control={control}
            name="enquiryType"
            label="Enquiry Type"
            options={SELECT_OPTIONS.enquiryType}
            required
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="enquiryDate"
            label="Enquiry Date"
            required
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
          <InputField
            control={control}
            name="partyName"
            label="Party Name"
            errors={errors}
          />
          <InputField
            control={control}
            name="partyRefNo"
            label="Party Ref No"
            errors={errors}
          />
          <SelectField
            control={control}
            name="status"
            label="Status"
            options={SELECT_OPTIONS.status}
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="partyRefDate"
            label="Party Ref Date"
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="enquiryDueDate"
            label="Enquiry Due Date"
            errors={errors}
          />
          <InputField
            control={control}
            name="contactName"
            label="Contact Name"
            errors={errors}
          />
          <InputField
            control={control}
            name="contactEmail"
            label="Contact Email"
            errors={errors}
            type="email"
            placeholder="Enter your email"
          />
        </div>

        {/* Child Tables */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["enquiryDetail", "terms", "attachement"].map((tab) => (
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
                  {tab === "attachement"
                    ? "Attachment"
                    : tab.replace(/([A-Z])/g, " $1").trim()}
                </button>
              ))}
            </div>
            {activeChildTab !== "terms" && (
              <button
                type="button"
                onClick={() => handleAdd(activeChildTab)}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeChildTab === "enquiryDetail" && (
            <TableWrapper>
              <TableHead
                headers={[
                  "#",
                  "Contact Part No",
                  "Item Description",
                  "Annual Qty",
                  "Delivery Date",
                  "Need Approval",
                  "Quote Due Date",
                  "Remarks",
                  "Action",
                ]}
              />
              <tbody>
                {enquiryDetailArray.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemove("enquiryDetail", index)}
                    disabled={enquiryDetailArray.fields.length <= 1}
                  >
                    <InputCell
                      control={control}
                      name={`enquiryDetail.${index}.contactPartNo`}
                      placeholder="Contact Part No"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`enquiryDetail.${index}.itemDescription`}
                      placeholder="Item Description"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`enquiryDetail.${index}.annualQty`}
                      type="number"
                      placeholder="Annual Qty"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`enquiryDetail.${index}.dlryDate`}
                      type="date"
                      errors={errors}
                    />
                    <SelectCell
                      control={control}
                      name={`enquiryDetail.${index}.needApproval`}
                      options={SELECT_OPTIONS.yesNo}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`enquiryDetail.${index}.quoteDueDate`}
                      type="date"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`enquiryDetail.${index}.remarks`}
                      placeholder="Remarks"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "terms" && (
            <TableWrapper>
              <TableHead
                headers={[
                  "#",
                  "Additional Investment",
                  "Additional Man Power",
                  "Time Frame",
                  "Expected Time",
                  "Pilot Batch",
                  "Regular Production",
                  "Initial Review",
                  "Detail Review",
                  "Statutory Req",
                  "Follow Up",
                  "Conclusion",
                  "Remarks",
                ]}
              />
              <tbody>
                {termsArray.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    showDelete={false}
                  >
                    <InputCell
                      control={control}
                      name={`terms.${index}.additionalInvestment`}
                      placeholder="Additional Investment"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.additionalManPower`}
                      placeholder="Additional Man Power"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.timeFrame`}
                      type="date"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.expectedTime`}
                      type="date"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.pilotBatch`}
                      placeholder="Pilot Batch"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.regularProduction`}
                      placeholder="Regular Production"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.reviewComments`}
                      placeholder="Initial Review"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.detailReview`}
                      placeholder="Detail Review"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.statutory`}
                      placeholder="Statutory Req"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.followUp`}
                      placeholder="Follow Up"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.conclusion`}
                      placeholder="Conclusion"
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`terms.${index}.remarks`}
                      placeholder="Remarks"
                      errors={errors}
                    />
                  </TableRow>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {activeChildTab === "attachement" && (
            <TableWrapper>
              <TableHead headers={["#", "Attachment", "Action"]} />
              <tbody>
                {attachementArray.fields.map((field, index) => (
                  <TableRow
                    key={field.id}
                    index={index}
                    onRemove={() => handleRemove("attachement", index)}
                    disabled={attachementArray.fields.length <= 1}
                  >
                    <td className="p-1">
                      <Controller
                        name={`attachement.${index}.attchement`}
                        control={control}
                        render={({ field: { onChange } }) => (
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
                            className={`${controlClasses} h-9 text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                            onChange={(e) =>
                              onChange(e.target.files?.[0] || null)
                            }
                          />
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

export default EnquiryForm;