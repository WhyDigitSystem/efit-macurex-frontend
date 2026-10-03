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
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import salesContractAPI from "../../../api/Sales/salesContract";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import currencyAPI from "../../../api/currencyAPI";
import { useToast } from "../../Toast/ToastContext";
import { formatDateForDisplay } from "../../../utils/dateFormatter";
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
  plantId: "",
  custContactNo: "",
  contractNo: "",
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
  oldQuotationNo: "",
  recId: "",

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
      _itemId: "",
      _unitMasterId: "",
      _gstRateMasterId: "",
    },
  ],

  taxDetails: [
    {
      id: 1,
      particulars: "",
      amount: 0.0,
      isSystemRow: false,
    },
  ],

  chargesSummary: {
    totalAmount: 100.0,
    amountInWords: "Rupees One Hundred Only",
    paymentTerms: "30 days",
    priceTerms: "",
    terms: "",
    note: "",
  },

  attachedPOCopy: [
    {
      sno: "",
      pdfAttached: null,
      fileName: "",
    },
  ],
});

const SELECT_OPTIONS = {
  belongsTo: ["Appliances", "Bosch"],
  contactType: ["Direct", "Flow"],
  withQuotation: ["Yes", "No"],
  invoiceType: ["Export", "InterState", "Local"],
  isESTApplicable: ["Yes", "No"],
  postRate: ["Yes", "No"],
  unit: ["Pcs", "Kg", "Meter", "Liter", "Box", "NOS"],
  taxType: ["SGST", "IGST"],
  modeOfTransport: ["Road", "Rail", "Air", "Sea", "Courier"],
  yesNo: ["Yes", "No"],
};

/* ------------------------- Helper Components ------------------------- */

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  onChange,
  disabled,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
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
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
              }`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e.target.value);
            }}
            disabled={disabled}
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
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
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
        rules={{ ...(required && { required: `${label} is required` }) }}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""
              }`}
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
          className={`p-1 ${i === 0 ? "w-8 text-center" : "text-left"
            } dark:text-white whitespace-nowrap text-[10px]`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled, showDelete = true }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white text-[10px]">
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

const SelectCell = ({
  control,
  name,
  options,
  required,
  errors,
  onChange,
  disabled,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
    }
    return error?.message;
  };
  const errorMessage = getError();

  return (
    <div className="p-0.5 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-7 text-[10px] ${errorMessage ? "border-red-500 focus:border-red-500" : ""
              }`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e.target.value);
            }}
            disabled={disabled}
          >
            <option value="">Select</option>
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
        <div className="text-red-500 text-[9px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
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
  disabled,
  onChange,
}) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
    }
    return error?.message;
  };
  const errorMessage = getError();

  return (
    <div className="p-0.5 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} h-7 text-[10px] ${align === "right" ? "text-right" : ""
              } ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e);
            }}
          />
        )}
      />
      {errorMessage && (
        <div className="text-red-500 text-[9px] mt-0.5 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

const FileUploadCell = ({ control, name, errors }) => {
  const getError = () => {
    const parts = name.split(".");
    let error = errors;
    for (const part of parts) {
      if (error && error[part]) error = error[part];
      else return null;
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
              className={`border-2 border-dashed rounded-md p-2 text-center cursor-pointer transition-colors ${errorMessage
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

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

const SalesContractForm = ({ data, onBack, isEditMode = false }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const [activeTab, setActiveTab] = useState("salesContract");
  const [plantData, setPlantData] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [quotationOptions, setQuotationOptions] = useState([]);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [listOfValuesData, setListOfValuesData] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isUpdatingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const dataLoadedRef = useRef(false);
  const { addToast } = useToast();

  const LIST_OF_VALUES_GROUPS = {
    PARTICULARS: "Particulars",
  };

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
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

  const customerId = watch("customerId");
  const contactType = watch("contactType");
  const quotNo = watch("quotNo");
  const withQuotation = watch("withQuotation");
  const isIGSTApplicable = watch("isESTApplicable");
  const watchSalesContractDetails = watch("salesContractDetails") || [];

  const isDirectContact = contactType === "Direct";

  // 👇 Hide Quot. No. and Quot. Date for Direct / With Quotation = No
  const showQuotationFields = !isDirectContact && withQuotation !== "No";

  /* ---------------------- Tax calculations ---------------------- */
  const calculateTaxDetails = useCallback(() => {
    const contractDetails = getValues("salesContractDetails") || [];

    const totalAmount = contractDetails.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

    let sgstTotal = 0,
      cgstTotal = 0,
      igstTotal = 0;

    contractDetails.forEach((item) => {
      sgstTotal += Number(item.sgstAmount) || 0;
      cgstTotal += Number(item.cgstAmount) || 0;
      igstTotal += Number(item.igstAmount) || 0;
    });

    const existingTaxDetails = getValues("taxDetails") || [];
    const userAddedRows = existingTaxDetails.filter(
      (item) => !item.isSystemRow,
    );

    const systemRows = [];

    systemRows.push({
      particulars: "Gross Amount",
      amount: totalAmount,
      isSystemRow: true,
    });

    if (taxType === "IGST") {
      systemRows.push({
        particulars: "IGST",
        amount: igstTotal,
        isSystemRow: true,
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        amount: sgstTotal,
        isSystemRow: true,
      });
      systemRows.push({
        particulars: "CGST",
        amount: cgstTotal,
        isSystemRow: true,
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];
    const currentRows = getValues("taxDetails") || [];
    const hasChanged =
      JSON.stringify(currentRows) !== JSON.stringify(allTaxEntries);

    if (hasChanged) {
      taxDetailsArray.replace(allTaxEntries);
    }

    if (getValues("chargesSummary.totalAmount") !== totalAmount) {
      setValue("chargesSummary.totalAmount", totalAmount);
    }

    const amountInWords = formatCurrencyInWords(totalAmount);

    if (getValues("chargesSummary.amountInWords") !== amountInWords) {
      setValue("chargesSummary.amountInWords", amountInWords);
    }
  }, [getValues, isIGSTApplicable, taxDetailsArray, setValue]);

  const calculateRowCalculation = useCallback(
    (index) => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        const qty = Number(getValues(`salesContractDetails.${index}.qty`)) || 0;
        const orderRate =
          Number(getValues(`salesContractDetails.${index}.orderRate`)) || 0;
        const discountPercent =
          Number(getValues(`salesContractDetails.${index}.discountPercent`)) ||
          0;

        const itemCode = getValues(`salesContractDetails.${index}.itemCode`);
        const taxType =
          getValues(`salesContractDetails.${index}.taxType`) ||
          (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

        const amountBeforeDiscount = qty * orderRate;
        const discountAmount = (amountBeforeDiscount * discountPercent) / 100;
        const amount = amountBeforeDiscount - discountAmount;

        let sgstRate = 0,
          cgstRate = 0,
          igstRate = 0;

        if (itemCode) {
          const selectedItem = itemOptions.find(
            (i) => String(i.itemCode) === String(itemCode),
          );
          if (selectedItem) {
            sgstRate = Number(selectedItem.sgst) || 0;
            cgstRate = Number(selectedItem.cgst) || 0;
            igstRate = Number(selectedItem.igst) || 0;
          }
        }

        let sgstAmount = 0,
          cgstAmount = 0,
          igstAmount = 0;

        if (taxType === "IGST") {
          igstAmount = (amount * igstRate) / 100;
        } else {
          sgstAmount = (amount * sgstRate) / 100;
          cgstAmount = (amount * cgstRate) / 100;
        }

        const updateField = (name, value) => {
          if (getValues(name) !== value) {
            setValue(name, value, {
              shouldDirty: false,
              shouldValidate: false,
              shouldTouch: false,
            });
          }
        };

        updateField(
          `salesContractDetails.${index}.discountAmount`,
          discountAmount,
        );
        updateField(`salesContractDetails.${index}.amount`, amount);
        updateField(`salesContractDetails.${index}.sgstRate`, sgstRate);
        updateField(`salesContractDetails.${index}.cgstRate`, cgstRate);
        updateField(`salesContractDetails.${index}.igstRate`, igstRate);
        updateField(`salesContractDetails.${index}.sgstAmount`, sgstAmount);
        updateField(`salesContractDetails.${index}.cgstAmount`, cgstAmount);
        updateField(`salesContractDetails.${index}.igstAmount`, igstAmount);

        calculateTaxDetails();
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [getValues, setValue, itemOptions, isIGSTApplicable, calculateTaxDetails],
  );

  /* ---------------------- Populate Form ---------------------- */
  const populateFormData = useCallback(
    (contractData) => {
      if (!contractData) return;

      try {
        setValue("plantId", contractData.branch?.id || "");
        setValue("belongsTo", contractData.belongsTo || "");
        // 👇 contractDate first, fallback to docDate
        setValue(
          "date",
          contractData.contractDate || contractData.docDate || "",
        );
        setValue("contactType", contractData.contractType || "");
        setValue("withQuotation", contractData.withQuotation || "");
        setValue("invoiceType", contractData.invoiceType || "");
        setValue("customerName", contractData.customer?.customerName || "");
        setValue("customerId", contractData.customer?.customerId || "");
        setValue("quotDate", contractData.quotationDate || "");
        setValue("quotNo", contractData.quotationNo || "");
        setValue("customerPONo", contractData.customerPoNo || "");
        setValue("customerPODate", contractData.customerPoDate || "");
        setValue("effectiveFrom", contractData.effectiveFrom || "");
        setValue("effectiveTo", contractData.effectiveTo || "");
        setValue("postRate", contractData.postRate || "");
        setValue(
          "isESTApplicable",
          contractData.customer?.igstApplicable ? "Yes" : "No",
        );
        setValue("gstNo", contractData.customer?.gstnNo || "");
        setValue("customerType", contractData.customer?.customerType || "");

        // 👇 THE FIX — docId goes into contractNo
        setValue("contractNo", contractData.docId || "");
        // custContactNo is a different field
        setValue(
          "custContactNo",
          contractData.customerContractNo || "",
        );

        setValue("chargesSummary.totalAmount", contractData.totalAmount || 0);
        setValue(
          "chargesSummary.amountInWords",
          contractData.amountInWords || "",
        );
        setValue(
          "chargesSummary.paymentTerms",
          contractData.paymentTerms || "",
        );
        setValue("chargesSummary.priceTerms", contractData.priceTerms || "");
        setValue("chargesSummary.terms", contractData.terms || "");
        setValue("chargesSummary.note", contractData.notes || "");

        if (contractData.details && contractData.details.length > 0) {
          const details = contractData.details.map((item) => ({
            itemCode: item.item?.itemCode || "",
            _itemId: item.item?.id || "",
            customerPartNo: item.item?.customerPoNo || "",
            itemDescription: item.item?.itemDescription || "",
            hsCode: item.item?.hsnCode || "",
            taxType: item.taxType || "",
            taxRs: item.taxPercentage?.taxPercentage || 0,
            _gstRateMasterId: item.taxPercentage?.id || "",
            unit: item.unit?.unitId || "",
            _unitMasterId: item.unit?.id || "",
            qty: item.quantity || 0,
            quotRate: item.quotationRate || 0,
            orderRate: item.orderRate || 0,
            discountPercent: item.discountPercentage || 0,
            effectiveFrom: item.effectiveFrom || "",
            effectiveTo: item.effectiveTo || "",
            discountAmount: item.discountAmount || 0,
            amount: item.amount || 0,
            sgstRate: item.sgstRate || 0,
            sgstAmount: item.sgstAmount || 0,
            cgstRate: item.cgstRate || 0,
            cgstAmount: item.cgstAmount || 0,
            igstRate: item.igstRate || 0,
            igstAmount: item.igstAmount || 0,
            currencyName: item.currency || "",
          }));
          salesContractArray.replace(details);
        }

        if (
          contractData.salesContractTaxDetailsDTO &&
          contractData.salesContractTaxDetailsDTO.length > 0
        ) {
          const taxDetails = contractData.salesContractTaxDetailsDTO.map(
            (item) => ({
              particulars: item.particulars?.description || "",
              amount: item.amount || 0,
              isSystemRow: ["Gross Amount", "IGST", "CGST", "SGST"].includes(
                item.particulars?.description || "",
              ),
            }),
          );
          taxDetailsArray.replace(taxDetails);
        }

        if (contractData.attachments && contractData.attachments.length > 0) {
          const attachments = contractData.attachments.map((item) => ({
            pdfAttached: {
              filePath: item.pdfAttached,
              fileName:
                item.pdfAttached?.split("\\").pop() ||
                item.pdfAttached?.split("/").pop() ||
                "Attachment",
              id: item.id,
            },
          }));
          attachedPOCopyArray.replace(attachments);
        }

        dataLoadedRef.current = true;
      } catch (error) {
        console.error("Error populating form data:", error);
      }
    },
    [setValue, salesContractArray, taxDetailsArray, attachedPOCopyArray],
  );

  const loadSalesContractData = useCallback(
    async (contractId) => {
      if (!contractId) return;
      setLoading(true);
      try {
        const response =
          await salesContractAPI.getSalesContractById(contractId);

        if (response?.status && response?.paramObjectsMap?.salesContract) {
          const contract = response.paramObjectsMap.salesContract;
          populateFormData(contract);
          addToast("Sales contract loaded successfully", "success");
        } else {
          addToast("Failed to load sales contract data", "error");
        }
      } catch (error) {
        console.error("Error loading sales contract:", error);
        addToast("Failed to load sales contract data", "error");
      } finally {
        setLoading(false);
      }
    },
    [populateFormData, addToast],
  );

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

            let items = [];
            if (response?.paramObjectsMap?.listValues) {
              items = response.paramObjectsMap.listValues;
            } else if (response?.data?.paramObjectsMap?.listValues) {
              items = response.data.paramObjectsMap.listValues;
            } else if (Array.isArray(response)) {
              items = response;
            } else if (response?.listValues) {
              items = response.listValues;
            }

            result[key] = items.map((item) => ({
              value: item.id || item.value,
              label: item.valuesDescription || item.label || item.name,
              ...item,
            }));
          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        }),
      );
      setListOfValuesData(result);

      if (salesContractArray.fields.length > 0) {
        setTimeout(() => calculateTaxDetails(), 200);
      }
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  };

  /* ---------------- Number-to-words helpers ---------------- */
  const numberToWords = (num) => {
    if (num === 0) return "Zero";
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const thousands = ["", "Thousand", "Million", "Billion", "Trillion"];

    const convertHundreds = (num) => {
      let word = "";
      if (num >= 100) {
        word += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num >= 20) {
        word += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      }
      if (num > 0) {
        word += ones[num] + " ";
      }
      return word.trim();
    };

    const convertNumber = (num) => {
      if (num === 0) return "";
      let word = "";
      let index = 0;
      while (num > 0) {
        if (num % 1000 !== 0) {
          word =
            convertHundreds(num % 1000) + " " + thousands[index] + " " + word;
        }
        num = Math.floor(num / 1000);
        index++;
      }
      return word.trim();
    };

    const parts = String(num).split(".");
    const wholeNumber = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, "0")) : 0;

    let result = convertNumber(wholeNumber);

    if (decimalPart > 0) {
      result += " and " + convertNumber(decimalPart) + " Paise";
    }

    return result || "Zero";
  };

  const formatCurrencyInWords = (amount) => {
    if (!amount || amount === 0) return "Zero";
    const roundedAmount = Math.round(amount * 100) / 100;
    const words = numberToWords(roundedAmount);
    return words
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  /* ---------------------- Watchers / Effects ---------------------- */
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name || isUpdatingRef.current) return;
      if (!name.startsWith("salesContractDetails.")) return;

      const parts = name.split(".");
      const index = Number(parts[1]);
      const field = parts[2];

      const triggerFields = [
        "qty",
        "orderRate",
        "discountPercent",
        "itemCode",
        "taxType",
      ];

      if (!triggerFields.includes(field)) return;
      calculateRowCalculation(index);
    });

    return () => subscription.unsubscribe();
  }, [watch, calculateRowCalculation]);

  useEffect(() => {
    if (dataLoadedRef.current) return;
    loadBranches();
    loadCurrencies();
    loadListOfValuesData();

    if (isEditMode && data) {
      if (data.id) {
        loadSalesContractData(data.id);
      } else {
        populateFormData(data);
      }
    }

    return () => {
      dataLoadedRef.current = false;
    };
  }, [isEditMode]);

  useEffect(() => {
    if (orgId && contactType) {
      loadCustomers(contactType);
    }
  }, [orgId, contactType]);

  useEffect(() => {
    if (orgId && branchId && customerId && contactType) {
      if (!isDirectContact) {
        loadQuotations();
      } else {
        setQuotationOptions([]);
        setValue("quotNo", "");
        setValue("quotDate", "");
      }
    }
  }, [customerId, contactType, orgId, branchId, isDirectContact]);

  useEffect(() => {
    if (orgId && branchId) {
      if (withQuotation === "Yes" && quotNo) {
        loadQuotationItems(quotNo);
      } else if (withQuotation === "No") {
        loadFinishedGoodsItems();
      } else {
        setItemOptions([]);
      }
    }
  }, [quotNo, withQuotation, orgId, branchId]);

  useEffect(() => {
    if (customerId && customerOptions.length > 0) {
      const customer = customerOptions.find(
        (c) => String(c.customerId) === String(customerId),
      );
      if (customer) {
        setSelectedCustomer(customer);
        setValue("customerName", customer.customerName || "");
        setValue("address", customer.address || "");
        setValue("gstNo", customer.gstNo || "");
        setValue("isESTApplicable", customer.igstApplicable ? "Yes" : "No");
        if (customer.gstType) {
          setValue("customerType", customer.gstType);
        }
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [customerId, customerOptions, setValue]);

  useEffect(() => {
    if (quotNo && quotationOptions.length > 0 && !isDirectContact) {
      const selectedQuotation = quotationOptions.find(
        (q) => String(q.quotationNo) === String(quotNo),
      );
      if (selectedQuotation) {
        setValue("quotDate", selectedQuotation.quotationDate || "");
      }
    }
  }, [quotNo, quotationOptions, setValue, isDirectContact]);

  useEffect(() => {
    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";
    salesContractArray.fields.forEach((_, index) => {
      setValue(`salesContractDetails.${index}.taxType`, taxType);
    });
    if (salesContractArray.fields.length > 0) {
      setTimeout(() => calculateTaxDetails(), 100);
    }
  }, [
    isIGSTApplicable,
    salesContractArray.fields.length,
    setValue,
    calculateTaxDetails,
  ]);

  /* ---------------------- Doc Number generation ---------------------- */
  const [generatingDocId, setGeneratingDocId] = useState(false);

  useEffect(() => {
    // Skip if editing an existing record
    if (isEditMode && data?.id) return;
    // 👇 Skip if a contractNo is already loaded (e.g., from API)
    if (getValues("contractNo")) return;

    const generateContractNo = async () => {
      setGeneratingDocId(true);

      try {
        const storedOrgId = localStorage.getItem("orgId");
        const storedBranchId = localStorage.getItem("branchId");
        if (!storedOrgId || !storedBranchId) return;

        const mappingList =
          await docTypeMappingAPI.getDocumentTypeMappingByOrgId(
            storedOrgId,
            storedBranchId,
          );

        const record = mappingList?.[0];
        const contractDetail = record?.documentTypeMappingDetails?.find(
          (d) => d.screenCode === "SAC",
        );

        if (!contractDetail) {
          addToast(
            "No document type mapping found for Sales Contract (SAC)",
            "error",
          );
          return;
        }

        const docId = await salesContractAPI.getSalesContractDocId({
          financialYear: contractDetail.finYear,
          orgId: contractDetail.orgId,
          screenCode: contractDetail.screenCode,
        });

        // Only set if still empty (avoid clobbering a loaded value)
        if (docId && !getValues("contractNo")) {
          setValue("contractNo", docId);
        }
      } catch (error) {
        console.error("Error generating sales contract number:", error);
        addToast("Failed to generate Contract No", "error");
      } finally {
        setGeneratingDocId(false);
      }
    };

    generateContractNo();
  }, [isEditMode, data]);

  /* ---------------------- Lookup loaders ---------------------- */
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

  const loadCustomers = useCallback(
    async (contactTypeParam) => {
      const effectiveContactType = contactTypeParam || contactType;
      if (!orgId || !branchId || !effectiveContactType) return;

      setLoadingCustomer(true);
      try {
        const response = await salesContractAPI.getCustomerDropdown(
          orgId,
          branchId,
          effectiveContactType,
        );
        if (response?.status && response?.paramObjectsMap?.customers) {
          setCustomerOptions(response.paramObjectsMap.customers);
        } else {
          setCustomerOptions([]);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
        setCustomerOptions([]);
      } finally {
        setLoadingCustomer(false);
      }
    },
    [orgId, branchId, contactType],
  );

  const loadQuotations = useCallback(async () => {
    if (!orgId || !branchId || !customerId || !contactType) return;

    setLoadingQuotation(true);
    try {
      const customer = customerOptions.find(
        (c) => String(c.customerId) === String(customerId),
      );
      const customerCode = customer?.customerCode || "";
      const recId = isEditMode && data?.recId ? data.recId : 0;
      const oldQuotationNo =
        isEditMode && data?.oldQuotationNo ? data.oldQuotationNo : "";

      const response = await salesContractAPI.getQuotationDropdown(
        orgId,
        branchId,
        contactType,
        customerCode,
        recId,
        oldQuotationNo,
      );

      if (response?.status && response?.paramObjectsMap?.quotations) {
        setQuotationOptions(response.paramObjectsMap.quotations);
      } else {
        setQuotationOptions([]);
      }
    } catch (error) {
      console.error("Error loading quotations:", error);
      setQuotationOptions([]);
    } finally {
      setLoadingQuotation(false);
    }
  }, [
    orgId,
    branchId,
    customerId,
    contactType,
    customerOptions,
    isEditMode,
    data,
  ]);

  const loadQuotationItems = useCallback(
    async (quotationNoParam) => {
      if (!orgId || !branchId || !quotationNoParam) return;

      setLoadingItems(true);

      try {
        const response = await salesContractAPI.getQuotationItems(
          orgId,
          branchId,
          quotationNoParam,
        );

        if (response?.status && response?.paramObjectsMap?.items) {
          const items = response.paramObjectsMap.items;
          setItemOptions(items);

          if (items.length > 0 && salesContractArray.fields.length === 1) {
            const firstItem = items[0];
            const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

            const cgstRate = Number(firstItem.cgst) || 0;
            const sgstRate = Number(firstItem.sgst) || 0;
            const igstRate = Number(firstItem.igst) || 0;
            const totalTaxRate =
              taxType === "IGST" ? igstRate : cgstRate + sgstRate;
            const quotationRate = Number(firstItem.quotationRate) || 0;

            isUpdatingRef.current = true;

            setValue(
              "salesContractDetails.0.itemCode",
              firstItem.itemCode || "",
            );
            setValue(
              "salesContractDetails.0.itemDescription",
              firstItem.itemDescription || "",
            );
            setValue("salesContractDetails.0.hsCode", firstItem.hsnCode || "");
            setValue(
              "salesContractDetails.0.customerPartNo",
              firstItem.customerPartNo || "",
            );
            setValue("salesContractDetails.0.unit", firstItem.unitId || "");
            setValue("salesContractDetails.0.taxType", taxType);
            setValue("salesContractDetails.0.sgstRate", sgstRate);
            setValue("salesContractDetails.0.cgstRate", cgstRate);
            setValue("salesContractDetails.0.igstRate", igstRate);
            setValue("salesContractDetails.0.taxRs", totalTaxRate);

            setValue("salesContractDetails.0._itemId", firstItem.itemId || "");
            setValue(
              "salesContractDetails.0._unitMasterId",
              firstItem.unitMasterId || "",
            );
            setValue(
              "salesContractDetails.0._gstRateMasterId",
              firstItem.gstRateMasterId || "",
            );

            // 👇 Quot. Rate from quotationRate
            setValue("salesContractDetails.0.quotRate", quotationRate);
            // 👇 Order Rate defaults to quotationRate
            setValue("salesContractDetails.0.orderRate", quotationRate);
            // 👇 Qty from API
            setValue(
              "salesContractDetails.0.qty",
              Number(firstItem.qty) || 0,
            );

            setTimeout(() => {
              isUpdatingRef.current = false;
              const qty =
                Number(getValues(`salesContractDetails.0.qty`)) || 0;
              const orderRate =
                Number(getValues(`salesContractDetails.0.orderRate`)) || 0;
              const discountPercent =
                Number(getValues(`salesContractDetails.0.discountPercent`)) ||
                0;

              const amountBeforeDiscount = qty * orderRate;
              const discountAmount =
                (amountBeforeDiscount * discountPercent) / 100;
              const amount = amountBeforeDiscount - discountAmount;

              setValue(`salesContractDetails.0.discountAmount`, discountAmount);
              setValue(`salesContractDetails.0.amount`, amount);

              let sgstAmount = 0,
                cgstAmount = 0,
                igstAmount = 0;
              if (taxType === "IGST") {
                igstAmount = (amount * igstRate) / 100;
              } else {
                sgstAmount = (amount * sgstRate) / 100;
                cgstAmount = (amount * cgstRate) / 100;
              }

              setValue(`salesContractDetails.0.sgstAmount`, sgstAmount);
              setValue(`salesContractDetails.0.cgstAmount`, cgstAmount);
              setValue(`salesContractDetails.0.igstAmount`, igstAmount);

              setTimeout(() => calculateTaxDetails(), 100);
            }, 100);
          }
        } else {
          setItemOptions([]);
        }
      } catch (error) {
        console.error("Error loading quotation items:", error);
        setItemOptions([]);
      } finally {
        setLoadingItems(false);
      }
    },
    [
      orgId,
      branchId,
      salesContractArray.fields.length,
      setValue,
      getValues,
      isIGSTApplicable,
      calculateTaxDetails,
    ],
  );

  const loadFinishedGoodsItems = useCallback(async () => {
    if (!orgId || !branchId) return;
    setLoadingItems(true);
    try {
      const response = await salesContractAPI.getFinishedGoodsItems(
        orgId,
        branchId,
      );
      if (response?.status && response?.paramObjectsMap?.items) {
        setItemOptions(response.paramObjectsMap.items);
      } else {
        setItemOptions([]);
      }
    } catch (error) {
      console.error("Error loading finished goods items:", error);
      setItemOptions([]);
    } finally {
      setLoadingItems(false);
    }
  }, [orgId, branchId]);

  const handleItemSelect = useCallback(
    (index, itemCode) => {
      const selectedItem = itemOptions.find(
        (item) => String(item.itemCode) === String(itemCode),
      );

      if (selectedItem) {
        const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";
        const cgstRate = Number(selectedItem.cgst) || 0;
        const sgstRate = Number(selectedItem.sgst) || 0;
        const igstRate = Number(selectedItem.igst) || 0;
        const totalTaxRate =
          taxType === "IGST" ? igstRate : cgstRate + sgstRate;
        const quotationRate = Number(selectedItem.quotationRate) || 0;

        isUpdatingRef.current = true;

        setValue(
          `salesContractDetails.${index}.itemCode`,
          selectedItem.itemCode || "",
        );
        setValue(
          `salesContractDetails.${index}.itemDescription`,
          selectedItem.itemDescription || "",
        );
        setValue(
          `salesContractDetails.${index}.hsCode`,
          selectedItem.hsnCode || "",
        );
        setValue(
          `salesContractDetails.${index}.customerPartNo`,
          selectedItem.customerPartNo || "",
        );
        setValue(
          `salesContractDetails.${index}.unit`,
          selectedItem.unitId || "",
        );

        setValue(`salesContractDetails.${index}.sgstRate`, sgstRate);
        setValue(`salesContractDetails.${index}.cgstRate`, cgstRate);
        setValue(`salesContractDetails.${index}.igstRate`, igstRate);
        setValue(`salesContractDetails.${index}.taxRs`, totalTaxRate);

        setValue(
          `salesContractDetails.${index}._itemId`,
          selectedItem.itemId || "",
        );
        setValue(
          `salesContractDetails.${index}._unitMasterId`,
          selectedItem.unitMasterId || "",
        );
        setValue(
          `salesContractDetails.${index}._gstRateMasterId`,
          selectedItem.gstRateMasterId || "",
        );

        // 👇 Quot. Rate
        setValue(`salesContractDetails.${index}.quotRate`, quotationRate);
        // 👇 Order Rate defaults to quotation rate
        setValue(`salesContractDetails.${index}.orderRate`, quotationRate);
        // 👇 Qty from API if present
        if (selectedItem.qty !== undefined && selectedItem.qty !== null) {
          setValue(
            `salesContractDetails.${index}.qty`,
            Number(selectedItem.qty) || 0,
          );
        }

        setValue(`salesContractDetails.${index}.taxType`, taxType);

        setTimeout(() => {
          isUpdatingRef.current = false;
          const qty =
            Number(getValues(`salesContractDetails.${index}.qty`)) || 0;
          const orderRate =
            Number(getValues(`salesContractDetails.${index}.orderRate`)) || 0;
          const discountPercent =
            Number(
              getValues(`salesContractDetails.${index}.discountPercent`),
            ) || 0;

          const amountBeforeDiscount = qty * orderRate;
          const discountAmount = (amountBeforeDiscount * discountPercent) / 100;
          const amount = amountBeforeDiscount - discountAmount;

          setValue(
            `salesContractDetails.${index}.discountAmount`,
            discountAmount,
          );
          setValue(`salesContractDetails.${index}.amount`, amount);

          let sgstAmount = 0,
            cgstAmount = 0,
            igstAmount = 0;
          if (taxType === "IGST") {
            igstAmount = (amount * igstRate) / 100;
          } else {
            sgstAmount = (amount * sgstRate) / 100;
            cgstAmount = (amount * cgstRate) / 100;
          }

          setValue(`salesContractDetails.${index}.sgstAmount`, sgstAmount);
          setValue(`salesContractDetails.${index}.cgstAmount`, cgstAmount);
          setValue(`salesContractDetails.${index}.igstAmount`, igstAmount);

          setTimeout(() => calculateTaxDetails(), 100);
        }, 100);
      }
    },
    [itemOptions, setValue, getValues, isIGSTApplicable, calculateTaxDetails],
  );

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "salesContract") {
      const newItem = defaultValues.salesContractDetails[0] || {};
      salesContractArray.append(newItem);
      setTimeout(() => calculateTaxDetails(), 100);
    } else if (arrayName === "taxDetails") {
      taxDetailsArray.append({
        particulars: "",
        amount: 0.0,
        isSystemRow: false,
      });
    } else if (arrayName === "attachedPOCopy") {
      attachedPOCopyArray.append(defaultValues.attachedPOCopy[0] || {});
    }
  };

  const handleRemoveItem = (arrayName, index) => {
    if (arrayName === "salesContract") {
      if (salesContractArray.fields.length > 1) {
        salesContractArray.remove(index);
        setTimeout(() => calculateTaxDetails(), 100);
      }
    } else if (arrayName === "taxDetails") {
      const currentTaxDetails = getValues("taxDetails") || [];
      const isSystemRow = currentTaxDetails[index]?.isSystemRow;
      if (isSystemRow) {
        alert("Cannot delete system calculated rows");
        return;
      }
      taxDetailsArray.remove(index);
      setTimeout(() => calculateTaxDetails(), 100);
    } else if (arrayName === "attachedPOCopy") {
      if (attachedPOCopyArray.fields.length > 1) {
        attachedPOCopyArray.remove(index);
      }
    }
  };

  const handleTaxTypeChange = useCallback(
    (index, newTaxType) => {
      isUpdatingRef.current = true;
      setValue(`salesContractDetails.${index}.taxType`, newTaxType);

      setTimeout(() => {
        const qty = Number(getValues(`salesContractDetails.${index}.qty`)) || 0;
        const orderRate =
          Number(getValues(`salesContractDetails.${index}.orderRate`)) || 0;
        const discountPercent =
          Number(getValues(`salesContractDetails.${index}.discountPercent`)) ||
          0;
        const itemCode = getValues(`salesContractDetails.${index}.itemCode`);

        if (itemCode) {
          const selectedItem = itemOptions.find(
            (i) => String(i.itemCode) === String(itemCode),
          );
          if (selectedItem) {
            const sgstRate = Number(selectedItem.sgst) || 0;
            const cgstRate = Number(selectedItem.cgst) || 0;
            const igstRate = Number(selectedItem.igst) || 0;

            const amountBeforeDiscount = qty * orderRate;
            const discountAmount =
              (amountBeforeDiscount * discountPercent) / 100;
            const amount = amountBeforeDiscount - discountAmount;

            let sgstAmount = 0,
              cgstAmount = 0,
              igstAmount = 0;
            if (newTaxType === "IGST") {
              igstAmount = (amount * igstRate) / 100;
              setValue(`salesContractDetails.${index}.sgstRate`, 0);
              setValue(`salesContractDetails.${index}.cgstRate`, 0);
            } else {
              sgstAmount = (amount * sgstRate) / 100;
              cgstAmount = (amount * cgstRate) / 100;
              setValue(`salesContractDetails.${index}.igstRate`, 0);
            }

            setValue(`salesContractDetails.${index}.sgstAmount`, sgstAmount);
            setValue(`salesContractDetails.${index}.cgstAmount`, cgstAmount);
            setValue(`salesContractDetails.${index}.igstAmount`, igstAmount);

            setTimeout(() => calculateTaxDetails(), 100);
          }
        }

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      }, 100);
    },
    [setValue, getValues, itemOptions, calculateTaxDetails],
  );

  /* ------------------------------ Submit ------------------------------ */
  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch {
          return null;
        }
      };

      const getParticularId = (label) => {
        if (!label) return "";
        const allOptions = listOfValuesData.PARTICULARS || [];
        const found = allOptions.find((option) => option.label === label);
        return found ? found.value : label;
      };

      const salesContractData = {
        active: true,
        amountInWords: formData.chargesSummary?.amountInWords || "",
        belongsTo: formData.belongsTo || "",
        branch: parseInt(branchId),
        cancelRemarks: "",
        contractDate:
          formatDateForAPI(formData.date) ||
          new Date().toISOString().split("T")[0],
        contractType: formData.contactType || "",
        createdBy: localStorage.getItem("userId") || "admin",
        customer: parseInt(formData.customerId) || 0,
        customerContractNo: formData.custContactNo || "",
        // 👇 Send the docId back as contractNo (and docId) so the API
        //    knows which record to update.
        contractNo: formData.contractNo || "",
        docId: formData.contractNo || "",
        customerPoDate: formatDateForAPI(formData.customerPODate) || "",
        customerPoNo: formData.customerPONo || "",
        details: (formData.salesContractDetails || []).map((item) => ({
          currency: item.currencyName || "",
          discountPercentage: parseFloat(item.discountPercent) || 0,
          effectiveFrom: formatDateForAPI(item.effectiveFrom) || "",
          effectiveTo: formatDateForAPI(item.effectiveTo) || "",
          item: parseInt(item._itemId) || 0,
          orderRate: parseFloat(item.orderRate) || 0,
          quantity: parseFloat(item.qty) || 0,
          quotationRate: parseFloat(item.quotRate) || 0,
          taxPercentage: parseInt(item._gstRateMasterId) || 0,
          taxType: item.taxType || "",
          unit: parseInt(item._unitMasterId) || 0,
        })),
        effectiveFrom: formatDateForAPI(formData.effectiveFrom) || "",
        effectiveTo: formatDateForAPI(formData.effectiveTo) || "",
        financialYear: new Date().getFullYear().toString(),
        invoiceType: formData.invoiceType || "",
        isIgstApplicable: formData.isESTApplicable || "No",
        notes: formData.chargesSummary?.note || "",
        orgId: parseInt(orgId),
        paymentTerms: formData.chargesSummary?.paymentTerms || "",
        postRate: formData.postRate || "",
        priceTerms: formData.chargesSummary?.priceTerms || "",
        quotationDate: formatDateForAPI(formData.quotDate) || "",
        quotationNo: formData.quotNo || "",
        salesContractTaxDetailsDTO: (formData.taxDetails || [])
          .filter((item) => item.particulars && item.particulars.trim() !== "")
          .map((item) => ({
            amount: parseFloat(item.amount) || 0,
            particulars: parseInt(getParticularId(item.particulars)) || 0,
          })),
        terms: formData.chargesSummary?.terms || "",
        totalAmount: parseFloat(formData.chargesSummary?.totalAmount) || 0,
        withQuotation: formData.withQuotation || "No",
      };

      if (isEditMode && data?.id) {
        salesContractData.id = parseInt(data.id);
      }

      const formDataToSend = new FormData();
      const salesContractDataBlob = new Blob(
        [JSON.stringify(salesContractData)],
        { type: "application/json" },
      );
      formDataToSend.append(
        "salesContract",
        salesContractDataBlob,
        "salesContractDTO.json",
      );

      const pdfAttachments = watch("attachedPOCopy");
      if (pdfAttachments?.length) {
        for (let i = 0; i < pdfAttachments.length; i++) {
          const attachment = pdfAttachments[i]?.pdfAttached;
          if (
            attachment &&
            typeof attachment === "object" &&
            "name" in attachment &&
            "size" in attachment
          ) {
            formDataToSend.append("files", attachment, attachment.name);
          }
        }
      }

      const response =
        await salesContractAPI.createUpdateSalesContract(formDataToSend);

      const isSuccess =
        response?.status === true ||
        response?.success === true ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          isEditMode
            ? "Sales contract updated successfully"
            : "Sales contract created successfully",
          "success",
        );
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
      console.error("Error saving sales contract:", error);
      addToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save sales contract. Please try again.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading sales contract data...
        </div>
      </div>
    );
  }

  /* ------------------------------ Render ------------------------------ */
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
            options={plantData}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="contractNo"
            label="Contract No"
            placeholder={generatingDocId ? "Generating..." : "Auto generated"}
            disabled
            errors={errors}
          />
          <SelectField
            control={control}
            name="belongsTo"
            label="Belongs To"
            options={SELECT_OPTIONS.belongsTo}
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
            onChange={(value) => {
              setValue("contactType", value);
              if (value === "Direct") {
                setValue("withQuotation", "No");
                setQuotationOptions([]);
                setValue("quotNo", "");
                setValue("quotDate", "");
              } else if (value === "Flow") {
                setValue("withQuotation", "Yes");
              }
              loadCustomers(value);
            }}
          />
          <SelectField
            control={control}
            name="withQuotation"
            label="With Quotation"
            options={SELECT_OPTIONS.withQuotation}
            required
            errors={errors}
            onChange={(value) => {
              setValue("withQuotation", value);
              if (value === "No") {
                setValue("quotNo", "");
                setValue("quotDate", "");
              }
            }}
          />
          <SelectField
            control={control}
            name="invoiceType"
            label="Invoice Type"
            options={SELECT_OPTIONS.invoiceType}
            errors={errors}
          />
          <SelectField
            control={control}
            name="customerId"
            label="Customer ID"
            options={customerOptions.map((c) => ({
              value: c.customerId,
              label: `${c.customerCode} - ${c.customerName}`,
            }))}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="customerName"
            label="Customer Name"
            placeholder="Auto-filled from selection"
            errors={errors}
            disabled={!!selectedCustomer}
          />

          {/* 👇 Quot. No. & Quot. Date — hidden for Direct / With Quotation = No */}
          {showQuotationFields && (
            <>
              <SelectField
                control={control}
                name="quotNo"
                label="Quot. No."
                options={quotationOptions.map((q) => ({
                  value: q.quotationNo,
                  label: `${q.quotationNo} - ${formatDateForDisplay(q.quotationDate)}`,
                }))}
                errors={errors}
                disabled={!customerId || loadingQuotation}
              />
              <InputField
                control={control}
                type="date"
                name="quotDate"
                label="Quot. Date"
                errors={errors}
                disabled={!customerId}
              />
            </>
          )}

          <InputField
            control={control}
            name="address"
            label="Address"
            placeholder="Auto-filled from selection"
            errors={errors}
            disabled={!!selectedCustomer || isDirectContact}
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
          <InputField
            control={control}
            name="isESTApplicable"
            label="Is IGST Applicable"
            required
            disabled
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
            disabled
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
          <InputField
            control={control}
            name="customerType"
            label="Customer Type"
            errors={errors}
            disabled={isDirectContact}
          />
        </div>

        {/* Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            {[
              { key: "salesContract", label: "Contract Detail" },
              { key: "taxDetails", label: "Tax Details" },
              { key: "chargesSummary", label: "Charges Summary" },
              { key: "attachedPOCopy", label: "Attached PO Copy" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === t.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Contract Detail */}
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

              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs min-w-max">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-1.5 text-center dark:text-white whitespace-nowrap text-[10px] font-medium sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                        S.No
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Item Code *
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[120px]">
                        Customer Part No
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[120px]">
                        Item Description
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[110px]">
                        HSN/SAC Code *
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Tax Type *
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">
                        Tax (%)
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">
                        Unit *
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">
                        Qty
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">
                        Quot. Rate
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">
                        Order Rate *
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">
                        Discount %
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[110px]">
                        Effective From
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Effective To
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[120px]">
                        Discount Amount
                      </th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Amount
                      </th>
                      {salesContractArray.fields.map((field, idx) => {
                        const rowTaxType =
                          getValues(`salesContractDetails.${idx}.taxType`) ||
                          (isIGSTApplicable === "Yes" ? "IGST" : "SGST");
                        if (rowTaxType === "SGST") {
                          return (
                            <React.Fragment key={`sgst-cols-${idx}`}>
                              <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">
                                SGST Rate
                              </th>
                              <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                                SGST Amount
                              </th>
                              <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">
                                CGST Rate
                              </th>
                              <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                                CGST Amount
                              </th>
                            </React.Fragment>
                          );
                        } else if (rowTaxType === "IGST") {
                          return (
                            <React.Fragment key={`igst-cols-${idx}`}>
                              <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">
                                IGST Rate
                              </th>
                              <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                                IGST Amount
                              </th>
                            </React.Fragment>
                          );
                        }
                        return null;
                      })}
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">
                        Currency Name
                      </th>
                      <th className="p-1.5 text-center dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[60px] sticky right-0 bg-gray-100 dark:bg-gray-700 z-10">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesContractArray.fields.map((field, index) => {
                      const rowTaxType =
                        getValues(`salesContractDetails.${index}.taxType`) ||
                        (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

                      return (
                        <tr
                          key={field.id}
                          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="p-1 text-center font-medium dark:text-white text-[10px] sticky left-0 bg-white dark:bg-gray-800 z-10">
                            {index + 1}
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <SelectCell
                              control={control}
                              name={`salesContractDetails.${index}.itemCode`}
                              options={itemOptions.map((item) => ({
                                value: item.itemCode,
                                label: `${item.itemCode} - ${item.itemDescription}`,
                              }))}
                              required
                              errors={errors}
                              onChange={(value) =>
                                handleItemSelect(index, value)
                              }
                              disabled={loadingItems}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[120px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.customerPartNo`}
                              placeholder="Part No"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[120px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.itemDescription`}
                              placeholder="Description"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[110px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.hsCode`}
                              placeholder="HS Code"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <Controller
                              name={`salesContractDetails.${index}.taxType`}
                              control={control}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className={`${controlClasses} h-7 text-[10px]`}
                                  onChange={(e) => {
                                    const newTaxType = e.target.value;
                                    field.onChange(newTaxType);
                                    handleTaxTypeChange(index, newTaxType);
                                  }}
                                  disabled={isDirectContact}
                                >
                                  <option value="SGST">SGST</option>
                                  <option value="IGST">IGST</option>
                                </select>
                              )}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[80px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.taxRs`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[80px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.unit`}
                              placeholder="Unit"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[80px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.qty`}
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              required
                              errors={errors}
                            />
                          </td>

                          {/* 👇 Quot. Rate — read-only, from API */}
                          <td className="p-0.5 align-top min-w-[90px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.quotRate`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                              disabled
                            />
                          </td>

                          {/* 👇 Order Rate — editable */}
                          <td className="p-0.5 align-top min-w-[90px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.orderRate`}
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              required
                              errors={errors}
                            />
                          </td>

                          <td className="p-0.5 align-top min-w-[90px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.discountPercent`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[110px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.effectiveFrom`}
                              type="date"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.effectiveTo`}
                              type="date"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[120px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.discountAmount`}
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.amount`}
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          {rowTaxType === "SGST" ? (
                            <>
                              <td className="p-0.5 align-top min-w-[90px]">
                                <InputCell
                                  control={control}
                                  name={`salesContractDetails.${index}.sgstRate`}
                                  type="number"
                                  step="0.0001"
                                  placeholder="0.0000"
                                  errors={errors}
                                  disabled
                                />
                              </td>
                              <td className="p-0.5 align-top min-w-[100px]">
                                <InputCell
                                  control={control}
                                  name={`salesContractDetails.${index}.sgstAmount`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  errors={errors}
                                  disabled
                                />
                              </td>
                              <td className="p-0.5 align-top min-w-[90px]">
                                <InputCell
                                  control={control}
                                  name={`salesContractDetails.${index}.cgstRate`}
                                  type="number"
                                  step="0.0001"
                                  placeholder="0.0000"
                                  errors={errors}
                                  disabled
                                />
                              </td>
                              <td className="p-0.5 align-top min-w-[100px]">
                                <InputCell
                                  control={control}
                                  name={`salesContractDetails.${index}.cgstAmount`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  errors={errors}
                                  disabled
                                />
                              </td>
                            </>
                          ) : rowTaxType === "IGST" ? (
                            <>
                              <td className="p-0.5 align-top min-w-[90px]">
                                <InputCell
                                  control={control}
                                  name={`salesContractDetails.${index}.igstRate`}
                                  type="number"
                                  step="0.0001"
                                  placeholder="0.0000"
                                  errors={errors}
                                  disabled
                                />
                              </td>
                              <td className="p-0.5 align-top min-w-[100px]">
                                <InputCell
                                  control={control}
                                  name={`salesContractDetails.${index}.igstAmount`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  errors={errors}
                                  disabled
                                />
                              </td>
                            </>
                          ) : null}
                          <td className="p-0.5 align-top min-w-[100px]">
                            <SelectCell
                              control={control}
                              name={`salesContractDetails.${index}.currencyName`}
                              options={currencyData}
                              errors={errors}
                            />
                          </td>
                          <td className="p-1 text-center sticky right-0 bg-white dark:bg-gray-800 z-10">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem("salesContract", index)
                              }
                              disabled={salesContractArray.fields.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${salesContractArray.fields.length <= 1
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                              <Trash2 size={10} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                  headers={["S.No", "Particulars", "Amount", "Action"]}
                />
                <tbody>
                  {taxDetailsArray.fields.map((field, index) => {
                    const isSystemRow = getValues(
                      `taxDetails.${index}.isSystemRow`,
                    );
                    const particulars = getValues(
                      `taxDetails.${index}.particulars`,
                    );
                    const isReadOnly =
                      isSystemRow ||
                      ["Gross Amount", "IGST", "CGST", "SGST"].includes(
                        particulars,
                      );

                    const allOptions = listOfValuesData.PARTICULARS || [];
                    let availableOptions = [];
                    if (isSystemRow) {
                      availableOptions = [
                        { label: particulars, value: particulars },
                      ];
                    } else {
                      availableOptions = allOptions.filter(
                        (option) =>
                          !["Gross Amount", "IGST", "CGST", "SGST"].includes(
                            option.label,
                          ),
                      );
                    }

                    return (
                      <tr
                        key={field.id}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-1 text-center font-medium dark:text-white text-[10px]">
                          {index + 1}
                        </td>
                        <td className="p-1 align-top">
                          <Controller
                            name={`taxDetails.${index}.particulars`}
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className={`${controlClasses} h-8 text-xs ${isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                    : ""
                                  }`}
                                disabled={isReadOnly}
                                onChange={(e) =>
                                  field.onChange(e.target.value)
                                }
                                value={field.value || ""}
                              >
                                <option value="">Select Particulars</option>
                                {availableOptions.map((option) => (
                                  <option
                                    key={option.value || option.label}
                                    value={option.label}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
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
                                className={`${controlClasses} h-8 text-xs text-right ${isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                    : ""
                                  }`}
                                disabled={isReadOnly}
                                value={field.value || 0}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            )}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem("taxDetails", index)
                            }
                            disabled={isSystemRow}
                            className={`h-5 w-5 rounded text-white flex items-center justify-center ${isSystemRow
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                              }`}
                          >
                            <Trash2 size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Tab 3: Charges Summary */}
          {activeTab === "chargesSummary" && (
            <div className="p-2 grid grid-cols-5 gap-x-6 gap-y-4">
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
                      className={`${controlClasses} text-right bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                      disabled
                    />
                  )}
                />
              </div>
              <div className="col-span-4">
                <label className={labelClasses}>Amount In Words</label>
                <Controller
                  name="chargesSummary.amountInWords"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`${controlClasses} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                      disabled
                      placeholder="Auto-calculated from total amount"
                    />
                  )}
                />
              </div>
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
                      className={`${controlClasses} ${errors?.chargesSummary?.paymentTerms
                          ? "border-red-500 focus:border-red-500"
                          : ""
                        }`}
                      placeholder="Enter payment terms"
                    />
                  )}
                />
              </div>
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

export default SalesContractForm;