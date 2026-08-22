import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import enquiryAPI from "../../../api/Sales/enquiryAPI";
import itemAPI from "../../../api/itemAPI";
import currencyAPI from "../../../api/currencyAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import quotationAPI from "../../../api/Sales/quotationAPI";
import docTypeMappingAPI from "../../../api/docTypeMappingAPI";

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
  quotationNo: "",
  date: new Date().toISOString().split("T")[0],
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
      date: new Date().toISOString().split("T")[0],
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
            value={value !== undefined ? value : field.value}
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
  value,
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
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            value={value !== undefined ? value : field.value}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);

              if (onChange) {
                onChange(e, field);
              }
            }}
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
  const [branch] = useState(localStorage.getItem("branchId"));
  const [userId] = useState(localStorage.getItem("userId"));
  const [activeChildTab, setActiveChildTab] = useState("quotationItems");
  const [plantData, setPlantData] = useState([]);
  const [partyData, setPartyData] = useState([]);
  const [enquiryData, setEnquiryData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [kindAttentionData, setKindAttentionData] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(),
  });

  const quotationItemsArray = useFieldArray({
    control,
    name: "quotationItems",
  });
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

  const selectedPartyId = watch("partyId");
  const selectedEnquiry = watch("enquiryNo");
  const watchQuotationItems = watch("quotationItems");
  const watchTaxDetails = watch("taxDetails");

  const grossAmount = (watchQuotationItems || []).reduce(
    (sum, item) => sum + (Number(item.quotAmount) || 0),
    0,
  );

  const LIST_OF_VALUES_GROUPS = {
    PARTICULARS: "Particulars",
  };

  // Load quotation data if editing
  useEffect(() => {
    if (data?.id) {
      loadQuotationData(data.id);
    }
  }, [data]);

  useEffect(() => {
    if (!selectedPartyId) {
      setValue("partyName", "");
      return;
    }

    const selectedParty = partyData.find(
      (party) => String(party.value) === String(selectedPartyId),
    );

    if (selectedParty) {
      setValue("partyName", selectedParty.partyName);
    }
  }, [selectedPartyId, partyData, setValue]);

  useEffect(() => {
    if (!selectedEnquiry) {
      setValue("enquiryDate", "");
      setValue("customerEnquiryNo", "");
      setValue("customerEnquiryDate", "");
      return;
    }

    const enquiry = enquiryData.find(
      (item) => String(item.value) === String(selectedEnquiry),
    );

    if (enquiry) {
      setValue("enquiryDate", enquiry.enquiryDate);
      setValue("customerEnquiryNo", enquiry.customerEnquiryNo);
      setValue("customerEnquiryDate", enquiry.customerEnquiryDate);

      // If you also want to populate quotation items:
      setValue(
        "quotationItems",
        enquiry.enquiryDetails.map((item) => ({
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          qtyOffered: item.annualquantity,
          date: item.quoteduedate,
        })),
      );
    }
  }, [selectedEnquiry, enquiryData, setValue]);

  useEffect(() => {
    watchQuotationItems?.forEach((row, index) => {
      if (!row?.itemCode) return;

      const selectedItem = itemData.find(
        (item) => String(item.value) === String(row.itemCode),
      );

      if (selectedItem) {
        setValue(
          `quotationItems.${index}.itemDescription`,
          selectedItem.itemDescription,
        );

        setValue(`quotationItems.${index}.unit`, selectedItem.unit);
      }
    });
  }, [watchQuotationItems, itemData, setValue]);

  useEffect(() => {
    if (!taxDetailsArray.fields.length) return;

    const grossOption = listOfValuesData.PARTICULARS?.find(
      (item) =>
        item.label?.toUpperCase() === "GROSS AMOUNT" ||
        item.valuesDescription?.toUpperCase() === "GROSS AMOUNT",
    );

    if (grossOption) {
      setValue("taxDetails.0.particulars", grossOption.value);
    }

    setValue("taxDetails.0.amount", grossAmount.toFixed(2));
  }, [grossAmount, listOfValuesData, setValue]);

  useEffect(() => {
    const freightOption = listOfValuesData.PARTICULARS?.find(
      (item) => item.valuesDescription?.toUpperCase() === "FREIGHT",
    );

    if (!freightOption) return;

    const freightAmount = (watchTaxDetails || []).reduce((total, row) => {
      if (String(row.particulars) === String(freightOption.value)) {
        return total + Number(row.amount || 0);
      }
      return total;
    }, 0);

    setValue("chargesSummary.freight", freightAmount);

    // Update total amount
    const amount = Number(watch("chargesSummary.amount") || 0);
    setValue("chargesSummary.totalAmount", amount + freightAmount);
  }, [watchTaxDetails, listOfValuesData, setValue]);

  useEffect(() => {
    loadBranches();
    loadParties();
    loadEnquiry();
    loadItems();
    loadKindAttention();
    loadCurrencies();
    loadListOfValuesData();
  }, []);
  const [generatingDocId, setGeneratingDocId] = useState(false);
  useEffect(() => {
    // Don't generate a new quotation number while editing
    if (data?.id) return;

    const generateQuotationNo = async () => {
      setGeneratingDocId(true);
      setValue("quotationNo", "");

      try {
        const storedOrgId = localStorage.getItem("orgId");
        const storedBranchId = localStorage.getItem("branchId");

        if (!storedOrgId || !storedBranchId) {
          console.error("OrgId or BranchId not found in localStorage");
          return;
        }

        const mappingList =
          await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            storedOrgId,
            storedBranchId,
          );

        const record = mappingList?.[0];
        const quotationDetail = record?.documentTypeMappingDetails?.find(
          (d) => d.screenCode === "QO",
        );

        if (!quotationDetail) {
          console.error(
            "Quotation document mapping not found for screenCode QO",
          );
          addToast(
            "No document type mapping found for Quotation (QO)",
            "error",
          );
          return;
        }

        const docId = await quotationAPI.getQuotationDocId({
          financialYear: quotationDetail.finYear,
          orgId: quotationDetail.orgId,
          screenCode: quotationDetail.screenCode,
        });

        if (docId) {
          setValue("quotationNo", docId);
        } else {
          addToast("Failed to generate Quotation No", "error");
        }
      } catch (error) {
        console.error("Error generating quotation number:", error);
        addToast("Failed to generate Quotation No", "error");
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateQuotationNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const loadQuotationData = async (quotationId) => {
    setLoading(true);
    try {
      const response = await quotationAPI.getQuotationById(quotationId);
      console.log("Quotation data:", response);

      if (
        response?.status === true &&
        response?.paramObjectsMap?.quotationResponseVO
      ) {
        const quotation = response.paramObjectsMap.quotationResponseVO;

        // Set basic fields
        setValue("id", quotation.id);
        setValue("plantId", quotation.branch?.id || "");
        setValue("quotationNo", quotation.quotationSerialNo || "");
        setValue(
          "date",
          quotation.docDate || new Date().toISOString().split("T")[0],
        );
        setValue("withEnquiry", quotation.withEnquiry || "NO");
        setValue("partyId", quotation.customer?.id || "");
        setValue("partyName", quotation.customer?.customerName || "");
        setValue("enquiryNo", quotation.enquiryNo || "");
        setValue("enquiryDate", quotation.enquiryDate || "");
        setValue("validTill", quotation.validTill || "");
        setValue("quotationSerialNo", quotation.quotationSerialNo || "");
        setValue("kindAttention", quotation.kindAttention || "");
        setValue("customerEnquiryNo", quotation.customerEnquiryNo || "");
        setValue("customerEnquiryDate", quotation.customerEnquiryDate || "");

        // Set quotation items
        if (
          quotation.quotationItemDetailsResponseDTO &&
          quotation.quotationItemDetailsResponseDTO.length > 0
        ) {
          const items = quotation.quotationItemDetailsResponseDTO.map(
            (item) => ({
              itemCode: item.itemCodes?.id || "",
              itemDescription: item.itemCodes?.itemDescription || "",
              unit: item.itemCodes?.unit?.unitId || "",
              qtyOffered: item.qtyOffered || 0,
              basicPrice: item.basicPrice || 0,
              discPercent: item.discountPercentage || 0,
              discountAmount: item.discountAmount || 0,
              quotAmount: item.quotationAmount || 0,
              qty: item.qtyOffered || 0,
              currencyName: item.currency?.id || "",
              date: item.deliveryDate || "",
            }),
          );
          quotationItemsArray.replace(items);
        }

        // Set tax details
        if (
          quotation.quotationItemTaxDetailsDTO &&
          quotation.quotationItemTaxDetailsDTO.length > 0
        ) {
          const taxes = quotation.quotationItemTaxDetailsDTO.map((tax) => ({
            particulars: tax.particulars || "",
            amount: tax.amount || 0,
          }));
          taxDetailsArray.replace(taxes);
        }

        // Set charges summary
        setValue("chargesSummary.amount", quotation.amount || 0);
        setValue("chargesSummary.freight", quotation.freight || 0);
        setValue("chargesSummary.freightBy", quotation.freightBy || "");
        setValue("chargesSummary.totalAmount", quotation.totalAmount || 0);
        setValue("chargesSummary.terms", quotation.terms || "");
        setValue("chargesSummary.remarks", quotation.remarks || "");

        // Set PDF attachments - match the Enquiry form pattern
        if (
          quotation.quotationIemFileUploadDetailsDTO &&
          quotation.quotationIemFileUploadDetailsDTO.length > 0
        ) {
          const attachments = quotation.quotationIemFileUploadDetailsDTO.map(
            (file) => ({
              attachment: {
                filePath: file.filePath,
                fileName: file.fileName || file.name,
                name: file.name,
                fileSize: file.fileSize,
                uploadOn: file.uploadOn,
                id: file.id,
              },
            }),
          );
          pdfAttachmentArray.replace(attachments);
        }

        addToast("Quotation data loaded successfully", "success");
      } else {
        addToast(
          response?.paramObjectsMap?.message || "Failed to load quotation data",
          "error",
        );
      }
    } catch (error) {
      console.error("Error loading quotation:", error);
      addToast("Failed to load quotation data", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = useCallback(async () => {
    try {
      const response = await branchAPI.getBranchByOrgId(orgId);
      const options = (response || []).map((branch) => ({
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
      const options = (response || []).map((branch) => ({
        value: branch.id,
        label: branch.customerCode,
        partyName: branch.customerName,
      }));

      setPartyData(options);
    } catch (error) {
      console.error("Error loading parties:", error);
      setPartyData([]);
    }
  };

  const loadEnquiry = async () => {
    try {
      const response = await enquiryAPI.getEnquiryByOrgId(orgId, branch);

      const enquiryList = response?.paramObjectsMap?.enquiryList || [];

      const options = enquiryList.map((item) => ({
        value: item.id,
        label: item.enquiryNo,
        enquiryDate: item.enquiryDate,
        customerEnquiryNo: item.partyRefNo,
        customerEnquiryDate: item.partyRefDate,
        enquiryDetails: item.enquiryDetails,
      }));

      setEnquiryData(options);
    } catch (error) {
      console.error(error);
      setEnquiryData([]);
    }
  };

  const loadItems = async () => {
    try {
      const response = await itemAPI.getItems(orgId, branch);
      const options = response.map((item) => ({
        value: item.id,
        label: item.itemCode,
        itemDescription: item.itemDescription,
        unit: item.primaryUnits?.primaryUnit || "",
      }));
      setItemData(options);
    } catch (error) {
      console.error("Error loading items:", error);
      setItemData([]);
    }
  };

  const loadKindAttention = useCallback(async () => {
    try {
      const response = await partyMasterAPI.getBuyerDetails(orgId, branch);
      const options = (response || []).map((item) => ({
        value: item.employeeId,
        label: item.employeeName,
      }));
      setKindAttentionData(options);
    } catch (error) {
      console.error("Failed to load items:", error);
      setKindAttentionData([]);
    }
  }, [orgId, branch]);

  const loadCurrencies = useCallback(async () => {
    try {
      const response = await currencyAPI.getCurrencies(orgId);
      const options = (response || []).map((item) => ({
        value: item.id,
        label: item.currency,
      }));
      setCurrencyData(options);
    } catch (error) {
      console.error("Failed to load currencies:", error);
      setCurrencyData([]);
    }
  }, [orgId]);

  const loadListOfValuesData = async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(
              group,
              orgId,
            );

            const excludedValues = ["CGST", "SGST", "IGST"];

            result[key] = Array.isArray(response)
              ? response
                  .filter(
                    (item) =>
                      !excludedValues.includes(
                        item.valuesDescription?.toUpperCase(),
                      ),
                  )
                  .map((item) => ({
                    value: item.id,
                    label: item.valuesDescription,
                    ...item,
                  }))
              : [];
          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        }),
      );

      setListOfValuesData(result);
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
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

  // Helper function to get file display name - same as Enquiry form
  const getFileDisplayName = (attachment) => {
    if (!attachment) return "";
    if (typeof attachment === "string") {
      return attachment.split("/").pop() || attachment;
    }
    if (attachment.fileName) {
      return attachment.fileName;
    }
    if (attachment.filePath) {
      return attachment.filePath.split("/").pop() || attachment.filePath;
    }
    if (attachment.name) {
      return attachment.name;
    }
    return "File";
  };

  // Helper function to get file URL for display - same as Enquiry form
  const getFileUrl = (attachment) => {
    if (!attachment) return null;
    if (typeof attachment === "string") {
      return `${import.meta.env.VITE_API_URL}/api/files/download?path=${encodeURIComponent(attachment)}`;
    }
    if (attachment.filePath) {
      return `${import.meta.env.VITE_API_URL}/api/files/download?path=${encodeURIComponent(attachment.filePath)}`;
    }
    return null;
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      // Prepare the quotation data
      const quotationData = {
        active: true,
        branchId: Number(formData.plantId || branch),
        cancel: false,
        cancelRemarks: "",
        createdBy: userId || "admin",
        customer: Number(formData.partyId),
        customerEnquiryDate:
          formatDateForAPI(formData.customerEnquiryDate) || "",
        customerEnquiryNo: formData.customerEnquiryNo || "",
        enqBasicId: "",
        enquiryControl: "",
        enquiryDate: formatDateForAPI(formData.enquiryDate) || "",
        enquiryNo: formData.enquiryNo || "",
        financialYear: "",
        freight: Number(formData.chargesSummary?.freight || 0),
        freightBy: formData.chargesSummary?.freightBy || "",
        kindAttention: formData.kindAttention || "",
        oldEnquryNo: "",
        orgId: parseInt(orgId),
        partyName: formData.partyName || "",
        preparedBy: userId || "admin",
        quotationItemDetailsDTO: (formData.quotationItems || []).map(
          (item) => ({
            basicPrice: Number(item.basicPrice || 0),
            currencyName: Number(item.currencyName) || 0,
            deliveryDate:
              formatDateForAPI(item.date) ||
              new Date().toISOString().split("T")[0],
            discountPercentage: Number(item.discPercent || 0),
            discountAmount: Number(item.discountAmount || 0),
            item: Number(item.itemCode),
            qty: Number(item.qty || 0),
            qtyOffered: Number(item.qtyOffered || 0),
            quotationAmount: Number(item.quotAmount || 0),
            unit: item.unit || "",
          }),
        ),
        quotationItemTaxDetailsDTO: (formData.taxDetails || []).map((tax) => ({
          amount: Number(tax.amount || 0),
          particulars: String(tax.particulars),
        })),
        quotationSerialNo: formData.quotationSerialNo || "",
        reason: "",
        remarks: formData.chargesSummary?.remarks || "",
        screenCode: "QUOTATION",
        screenName: "Quotation",
        terms: formData.chargesSummary?.terms || "",
        updatedBy: userId || "admin",
        userCategory: "",
        validTill: formatDateForAPI(formData.validTill) || "",
        withEnquiry: formData.withEnquiry || "NO",
        quotationNo: formData.quotationNo || "",
        date:
          formatDateForAPI(formData.date) ||
          new Date().toISOString().split("T")[0],
        amount: Number(grossAmount || 0),
        totalAmount:
          Number(grossAmount || 0) +
          Number(formData.chargesSummary?.freight || 0),
      };

      // Add ID only if updating (data exists)
      if (data?.id) {
        quotationData.id = data.id;
      }

      // Create FormData
      const formDataToSend = new FormData();

      // Add quotation data as JSON blob
      const quotationDataJSON = JSON.stringify(quotationData);
      const quotationDataBlob = new Blob([quotationDataJSON], {
        type: "application/json",
      });

      formDataToSend.append(
        "quotation",
        quotationDataBlob,
        "quotationDTO.json",
      );

      // Add PDF attachment files if any
      const pdfAttachments = watch("pdfAttachment");
      if (pdfAttachments && pdfAttachments.length > 0) {
        for (let i = 0; i < pdfAttachments.length; i++) {
          const attachment = pdfAttachments[i]?.attachment;

          if (attachment instanceof File) {
            // New file
            formDataToSend.append("files", attachment, attachment.name);
          } else if (
            attachment &&
            typeof attachment === "object" &&
            attachment.filePath
          ) {
            // Existing file - skip if it's already uploaded
            console.log("Existing file:", attachment.filePath);
          } else if (attachment && typeof attachment === "string") {
            // String path - handle if needed
            console.log("Existing file path:", attachment);
          }
        }
      }

      // Log the data being sent
      console.log("Sending quotation data:", quotationData);

      // Call the API
      const response = await quotationAPI.createUpdateQuotation(formDataToSend);

      console.log("Full API Response:", response);

      const isSuccess =
        response?.status === true ||
        response?.success === true ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          data?.id
            ? "Quotation updated successfully"
            : "Quotation created successfully",
          "success",
        );

        reset(getDefaultValues());
        onBack();
      } else {
        const errorMessage =
          response?.message ||
          response?.paramObjectsMap?.message ||
          response?.errorMessage ||
          response?.error ||
          "Something went wrong";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save quotation. Please try again.";
      addToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading quotation data...
        </div>
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
          {data ? "Edit Quotation" : "Add Quotation"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Row 1 */}
          <SelectField
            control={control}
            name="plantId"
            label="Plant Id"
            options={plantData}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="quotationNo"
            label="Quotation No"
            errors={errors}
            disabled
            placeholder={generatingDocId ? "Generating..." : ""}
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
            options={partyData}
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
            options={enquiryData}
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
          <InputField
            control={control}
            name="validTill"
            label="Valid Till"
            type="date"
            errors={errors}
          />
          <InputField
            control={control}
            name="quotationSerialNo"
            label="Quotation Serial No."
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="kindAttention"
            label="Kind Attention"
            options={kindAttentionData}
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
              {[
                "quotationItems",
                "taxDetails",
                "chargesSummary",
                "pdfAttachment",
              ].map((tab) => (
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
                  const qtyOffered =
                    watchQuotationItems?.[index]?.qtyOffered || 0;
                  const basicPrice =
                    watchQuotationItems?.[index]?.basicPrice || 0;
                  const discPercent =
                    watchQuotationItems?.[index]?.discPercent || 0;
                  const discountAmount = (basicPrice * discPercent) / 100;
                  const quotAmount = basicPrice - discountAmount;

                  return (
                    <TableRow
                      key={field.id}
                      index={index}
                      onRemove={() => handleRemove("quotationItems", index)}
                      disabled={quotationItemsArray.fields.length <= 1}
                    >
                      <td className="p-1">
                        <Controller
                          control={control}
                          name={`quotationItems.${index}.itemCode`}
                          render={({ field }) => (
                            <select
                              {...field}
                              className={controlClasses}
                              onChange={(e) => {
                                field.onChange(e);
                                const selectedItem = itemData.find(
                                  (item) =>
                                    String(item.value) ===
                                    String(e.target.value),
                                );
                                if (selectedItem) {
                                  setValue(
                                    `quotationItems.${index}.itemDescription`,
                                    selectedItem.itemDescription || "",
                                  );
                                  setValue(
                                    `quotationItems.${index}.unit`,
                                    selectedItem.unit || "",
                                  );
                                }
                              }}
                            >
                              <option value="">Select Item</option>
                              {itemData.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </td>
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.itemDescription`}
                        placeholder="Item Description"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.unit`}
                        placeholder="Unit"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.qtyOffered`}
                        type="number"
                        placeholder="Qty Offered"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.basicPrice`}
                        type="number"
                        placeholder="Basic Price"
                        required
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.discPercent`}
                        type="number"
                        placeholder="Disc.%"
                        errors={errors}
                      />
                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.discountAmount`}
                        type="number"
                        step="0.01"
                        placeholder="Discount Amount"
                        errors={errors}
                      />

                      <InputCell
                        control={control}
                        name={`quotationItems.${index}.quotAmount`}
                        type="number"
                        step="0.01"
                        placeholder="Quotation Amount"
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
                        options={currencyData}
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
                      options={listOfValuesData.PARTICULARS || []}
                      errors={errors}
                    />
                    <InputCell
                      control={control}
                      name={`taxDetails.${index}.amount`}
                      type="number"
                      step="0.01"
                      value={index === 0 ? grossAmount : undefined}
                      errors={errors}
                      onChange={(e) => {
                        const rows = getValues("taxDetails");

                        const total = rows.reduce((sum, row, i) => {
                          const amount =
                            i === index
                              ? Number(e.target.value || 0)
                              : Number(row.amount || 0);
                          const freightOption =
                            listOfValuesData.PARTICULARS?.find(
                              (item) =>
                                item.valuesDescription?.toUpperCase() ===
                                "FREIGHT",
                            );

                          return String(row.particulars) ===
                            String(freightOption?.value)
                            ? sum + amount
                            : sum;
                        }, 0);

                        setValue("chargesSummary.freight", total);
                      }}
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
                disabled
                value={grossAmount}
                placeholder="Enter amount"
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.freight"
                label="Freight"
                type="number"
                disabled
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.freightBy"
                label="Freight By"
                errors={errors}
              />
              <InputField
                control={control}
                name="chargesSummary.totalAmount"
                label="Total Amount"
                type="number"
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

          {/* Tab Content - PDF Attachment - Updated to match Enquiry form */}
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
                        render={({ field: { onChange, value } }) => {
                          // Get the file display name - same as Enquiry form
                          const fileDisplayName =
                            value && typeof value === "object"
                              ? value.fileName ||
                                value.name ||
                                value.filePath?.split("/").pop() ||
                                "File"
                              : typeof value === "string"
                                ? value.split("/").pop() || value
                                : "";

                          return (
                            <div className="space-y-1">
                              <input
                                type="file"
                                accept=".pdf"
                                className={`${controlClasses} h-9 text-xs file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                              />
                              {value &&
                                typeof value === "object" &&
                                value.filePath && (
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
                              {value && typeof value === "string" && (
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

export default QuotationForm;
