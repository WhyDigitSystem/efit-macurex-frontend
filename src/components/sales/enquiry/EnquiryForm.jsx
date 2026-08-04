import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import enquiryAPI from "../../../api/Sales/enquiryAPI";
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
  id: "",
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
  enquiryType: ["Contact", "Oral Enquiry", "E-Mail", "Hard Copy", "Telephone", "Supply on"],
  partyId: ["Party 1", "Party 2", "Party 3"],
  status: ["Executed", "Discorded"],
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
            {options?.map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
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
            {options?.map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
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

// Helper function to fetch file as blob
const fetchFileAsBlob = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    return await response.blob();
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
};

// Main Component
const EnquiryForm = ({ data, onBack, onSave }) => {
  const orgId = localStorage.getItem("orgId");
  const branch = localStorage.getItem("branchId");
  const [userId] = useState(localStorage.getItem("userId"));
  const [activeChildTab, setActiveChildTab] = useState("enquiryDetail");
  const [plantData, setPlantData] = useState([]);
  const [partyData, setPartyData] = useState([]);
  const [buyerData, setBuyerData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const enquiryDetailArray = useFieldArray({ control, name: "enquiryDetail" });
  const termsArray = useFieldArray({ control, name: "terms" });
  const attachementArray = useFieldArray({ control, name: "attachement" });

  // Watch attachment files
  const attachmentFiles = watch("attachement");
  const selectedPartyId = watch("partyId");
  const selectedContact = watch("contactName");

  // Load enquiry data if editing
  useEffect(() => {
    if (data?.id) {
      loadEnquiryData(data.id);
    }
  }, [data]);

  useEffect(() => {
    if (!selectedPartyId) {
      setValue("partyName", "");
      return;
    }

    const selectedParty = partyData.find(
      item => String(item.value) === String(selectedPartyId)
    );

    if (selectedParty) {
      setValue("partyName", selectedParty.partyName);
    }
  }, [selectedPartyId, partyData, setValue]);

  useEffect(() => {
    if (!selectedContact) {
      setValue("contactEmail", "");
      return;
    }

    const employee = buyerData.find(
      item => String(item.value) === String(selectedContact)
    );

    if (employee) {
      setValue("contactEmail", employee.contactEmail);
    }
  }, [selectedContact, buyerData, setValue]);

  useEffect(() => {
    loadBranches();
    loadParties();
    loadBuyerDetails();
  }, []);

  const loadEnquiryData = async (enquiryId) => {
    setLoading(true);
    try {
      const response = await enquiryAPI.getEnquiryById(enquiryId);
      console.log("Enquiry data:", response);

      if (response?.status === true && response?.paramObjectsMap?.enquiry) {
        const enquiry = response.paramObjectsMap.enquiry;

        // Set basic fields
        setValue("id", enquiry.id);
        setValue("enquiryNo", enquiry.enquiryNo || "");
        setValue("enquiryType", enquiry.enquiryType || "");
        setValue("enquiryDate", enquiry.enquiryDate || "");
        setValue("plantId", enquiry.branch?.id || "");
        setValue("partyId", enquiry.customerVO?.id || "");
        setValue("partyName", enquiry.partyName || "");
        setValue("partyRefNo", enquiry.partyRefNo || "");
        setValue("status", enquiry.status || "");
        setValue("partyRefDate", enquiry.partyRefDate || "");
        setValue("enquiryDueDate", enquiry.enquiryDueDate || "");
        setValue("contactName", enquiry.contactName?.id || "");
        setValue("contactEmail", enquiry.contactEmail || "");

        // Set enquiry details
        if (enquiry.enquiryDetails && enquiry.enquiryDetails.length > 0) {
          const details = enquiry.enquiryDetails.map(detail => ({
            contactPartNo: detail.itemCode || "",
            itemDescription: detail.itemDescription || "",
            annualQty: detail.annualquantity || 0,
            dlryDate: detail.dlrydate || "",
            needApproval: detail.needrdapproval || "",
            quoteDueDate: detail.quoteduedate || "",
            remarks: detail.remarks || "",
          }));
          enquiryDetailArray.replace(details);
        }

        // Set terms
        if (enquiry.enquiryTermsandCond && enquiry.enquiryTermsandCond.length > 0) {
          const terms = enquiry.enquiryTermsandCond.map(term => ({
            additionalInvestment: term.additionalInvestment || "",
            additionalManPower: term.additionalManPower || "",
            timeFrame: term.likelyTimeFrame || "",
            expectedTime: term.expectedDeliverySample || "",
            pilotBatch: term.pilotBatch || "",
            regularProduction: term.regularProduction || "",
            reviewComments: term.initialReviewComments || "",
            detailReview: term.detailDelivery || "",
            statutory: term.statutoryRegulatoryReq || "",
            followUp: term.followUp || "",
            conclusion: term.conclusion || "",
            remarks: term.remarks || "",
          }));
          termsArray.replace(terms);
        }

        // Set attachments with file path for display
        if (enquiry.enquiryAttachmentDTO && enquiry.enquiryAttachmentDTO.length > 0) {
          const attachments = enquiry.enquiryAttachmentDTO.map(attachment => {
            // Get the file name from the path or use the name field
            const fileName = attachment.name || attachment.fileName || 'attachment';
            // Store both the file path for display and the file name
            return {
              attchement: {
                filePath: attachment.filePath,
                fileName: fileName,
                fileSize: attachment.fileSize,
                contentType: attachment.contentType,
                // Store the full file path for fetching
                fileUrl: attachment.filePath
              }
            };
          });
          attachementArray.replace(attachments);
        }

        addToast("Enquiry data loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error loading enquiry:", error);
      addToast("Failed to load enquiry data", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const loadParties = async () => {
    try {
      const response = await partyMasterAPI.getPartyByOrgId(orgId, branch);
      const options = (response || []).map(branch => ({
        value: branch.id,
        label: branch.vendorCode,
        partyName: branch.customerName,
      }));

      setPartyData(options);
    } catch (error) {
      console.error("Error loading parties:", error);
      setPartyData([]);
    }
  };

  const loadBuyerDetails = useCallback(async () => {
    try {
      const response = await partyMasterAPI.getBuyerDetails(orgId, branch);
      const options = (response || []).map(item => ({
        value: item.employeeId,
        label: item.employeeName,
        contactEmail: item.email,
      }));
      setBuyerData(options);
    } catch (error) {
      console.error("Failed to load items:", error);
      setBuyerData([]);
    }
  }, [orgId, branch]);

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

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return null;
    }
  };

  // Helper function to get file display name
  const getFileDisplayName = (attachment) => {
    if (!attachment) return '';
    if (typeof attachment === 'string') {
      return attachment.split('/').pop() || attachment;
    }
    if (attachment.fileName) {
      return attachment.fileName;
    }
    if (attachment.filePath) {
      return attachment.filePath.split('/').pop() || attachment.filePath;
    }
    return '';
  };

  // Helper function to get file URL for display
  const getFileUrl = (attachment) => {
    if (!attachment) return null;
    if (typeof attachment === 'string') {
      // If it's a file path, we need to serve it through the backend
      // You might need to adjust this URL based on your backend configuration
      return `${process.env.REACT_APP_API_URL}/api/files/download?path=${encodeURIComponent(attachment)}`;
    }
    if (attachment.filePath) {
      return `${process.env.REACT_APP_API_URL}/api/files/download?path=${encodeURIComponent(attachment.filePath)}`;
    }
    return null;
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      // Prepare the enquiry data
      const enquiryData = {
        enquiryNo: formData.enquiryNo || `ENQ-${Date.now()}`,
        enquiryType: formData.enquiryType,
        enquiryDate: formatDateForAPI(formData.enquiryDate),
        branch: Number(formData.plantId),
        partyId: Number(formData.partyId),
        partyName: formData.partyName,
        partyRefNo: formData.partyRefNo,
        partyRefDate: formatDateForAPI(formData.partyRefDate),
        enquiryDueDate: formatDateForAPI(formData.enquiryDueDate),
        contactNameId: Number(formData.contactName),
        contactEmail: formData.contactEmail,
        status: formData.status || "OPEN",
        description: formData.description || "",
        orgId: parseInt(orgId),
        createdBy: userId || "admin",
        cancelRemarks: "",
        active: true,
        enquiryDetails: formData.enquiryDetail.map(detail => ({
          itemcode: detail.contactPartNo || "",
          annualquantity: parseInt(detail.annualQty) || 0,
          dlrydate: formatDateForAPI(detail.dlryDate),
          needrdapproval: detail.needApproval || "NO",
          quoteduedate: formatDateForAPI(detail.quoteDueDate),
          remarks: detail.remarks || "",
        })),
        enquiryTermsandCond: formData.terms.map(term => ({
          additionalInvestment: term.additionalInvestment || "",
          additionalManPower: term.additionalManPower || "",
          conclusion: term.conclusion || "",
          detailDelivery: term.detailReview || "",
          expectedDeliverySample: formatDateForAPI(term.expectedTime),
          followUp: term.followUp || "",
          initialReviewComments: term.reviewComments || "",
          likelyTimeFrame: formatDateForAPI(term.timeFrame),
          pilotBatch: term.pilotBatch || "",
          regularProduction: term.regularProduction || "",
          remarks: term.remarks || "",
          statutoryRegulatoryReq: term.statutory || "",
        })),
      };

      // Add ID if editing
      if (data?.id || formData.id) {
        enquiryData.id = data?.id || formData.id;
      }

      // Create FormData
      const formDataToSend = new FormData();

      // Add enquiry data as JSON blob
      const enquiryDataJSON = JSON.stringify(enquiryData);
      const enquiryDataBlob = new Blob([enquiryDataJSON], {
        type: "application/json",
      });

      formDataToSend.append("enquiryDTO", enquiryDataBlob, "tenquiryDTO.json");

      // Add attachment files if any
      if (attachmentFiles && attachmentFiles.length > 0) {
        for (let i = 0; i < attachmentFiles.length; i++) {
          const fileData = attachmentFiles[i];
          const attachment = fileData.attchement;

          if (attachment instanceof File) {
            // New file
            formDataToSend.append("files", attachment, attachment.name);
          } else if (attachment && typeof attachment === 'object' && attachment.filePath) {
            // Existing file - we need to fetch it and resend if it's a new upload
            // Note: In most cases, existing files should not be re-uploaded
            // You might want to skip this or handle it differently
            console.log('Existing file:', attachment.filePath);
          } else if (attachment && typeof attachment === 'string') {
            // String path - handle if needed
            console.log('Existing file path:', attachment);
          }
        }
      }

      // Log the data being sent
      console.log("Sending enquiry data:", enquiryData);
      console.log("FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Call the API
      const res = await enquiryAPI.updateCreateEnquiry(formDataToSend);

      if (res.status === true) {
        addToast(
          data?.id
            ? "Enquiry updated successfully"
            : "Enquiry created successfully",
          "success"
        );

        reset(getDefaultValues());
        onBack();
      } else {
        addToast(res.message || "Something went wrong", "error");
      }

    } catch (error) {
      console.error("Error saving enquiry:", error);
      addToast("Failed to save enquiry. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading enquiry data...</div>
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
            options={plantData}
            errors={errors}
          />
          <InputField
            control={control}
            name="enquiryNo"
            label="Enquiry No"
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
            options={partyData}
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
          <SelectField
            control={control}
            name="contactName"
            label="Contact Name"
            options={buyerData}
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

        {/* Child Tables Section */}
        <section className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex">
              {["enquiryDetail", "terms", "attachement"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveChildTab(tab)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeChildTab === tab
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
            <div className="pt-3">
              {termsArray.fields.map((field, index) => (
                <div key={field.id} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg relative">
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => handleRemove("terms", index)}
                      disabled={termsArray.fields.length <= 1}
                      className={`h-5 w-5 rounded text-white flex items-center justify-center ${termsArray.fields.length <= 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <InputField
                      control={control}
                      name={`terms.${index}.additionalInvestment`}
                      label="Additional Investment"
                      placeholder="Enter additional investment"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.additionalManPower`}
                      label="Additional Man Power"
                      placeholder="Enter additional manpower"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      type="date"
                      name={`terms.${index}.timeFrame`}
                      label="Time Frame"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      type="date"
                      name={`terms.${index}.expectedTime`}
                      label="Expected Time"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.pilotBatch`}
                      label="Pilot Batch"
                      placeholder="Enter pilot batch details"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.regularProduction`}
                      label="Regular Production"
                      placeholder="Enter regular production details"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.reviewComments`}
                      label="Initial Review"
                      placeholder="Enter initial review comments"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.detailReview`}
                      label="Detail Review"
                      placeholder="Enter detail review"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.statutory`}
                      label="Statutory Requirements"
                      placeholder="Enter statutory requirements"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.followUp`}
                      label="Follow Up"
                      placeholder="Enter follow up details"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.conclusion`}
                      label="Conclusion"
                      placeholder="Enter conclusion"
                      errors={errors}
                    />
                    <InputField
                      control={control}
                      name={`terms.${index}.remarks`}
                      label="Remarks"
                      placeholder="Enter remarks"
                      errors={errors}
                    />
                  </div>
                </div>
              ))}
            </div>
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
                        render={({ field: { onChange, value } }) => {
                          // Get the file display name
                          const fileDisplayName = value && typeof value === 'object'
                            ? value.fileName || value.filePath?.split('/').pop() || 'File'
                            : typeof value === 'string'
                              ? value.split('/').pop() || value
                              : '';

                          return (
                            <div className="space-y-1">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.zip,.rar,.txt"
                                className={`${controlClasses} h-9 text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                              />
                              {value && typeof value === 'object' && value.filePath && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">
                                    📎 {fileDisplayName}
                                  </span>
                                  <a
                                    href={getFileUrl(value)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                  >
                                    View File
                                  </a>
                                </div>
                              )}
                              {value && typeof value === 'string' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-blue-600 dark:text-blue-400">
                                    📎 {fileDisplayName}
                                  </span>
                                  <a
                                    href={getFileUrl(value)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                  >
                                    View File
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        }}
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
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving || isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />{" "}
            {saving || isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;