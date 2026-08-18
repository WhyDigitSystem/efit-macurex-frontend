import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  File,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import orderAcceptanceAPI from "../../../api/Sales/orderAcceptanceAPI";
import salesContractAPI from "../../../api/Sales/salesContract";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import currencyAPI from "../../../api/currencyAPI";
import { useToast } from "../../Toast/ToastContext";
import { formatDateForDisplay } from "../../../utils/dateFormatter";

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
  belongsTo: "",
  soType: "",
  withQuotation: "",
  customerId: "",
  customerName: "",
  quotationNo: "",
  quotationDate: "",
  enquiryNo: "",
  enquiryDate: "",
  custPONo: "",
  custPODate: "",
  invoiceType: "",
  postRate: "",
  taxCode: "",
  isGSTAppl: "",
  customerType: "",
  gstnNo: "",
  auto: "",
  orderDate: "",
  recId: "",
  oldQuotationNo: "",

  // Order Acceptance Details Table
  orderAcceptanceDetails: [
    {
      sno: 1,
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

  // Tax Details Table
  taxDetails: [
    {
      id: 1,
      particulars: "",
      acceptedAmount: 0,
      revisedAmount: 0,
      isSystemRow: false,
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
  belongsTo: ["Appliances", "Bosch"],
  soType: ["Direct", "Flow"],
  withQuotation: ["Yes", "No"],
  quotationNo: ["QTN001", "QTN002", "QTN003"],
  enquiryNo: ["ENQ001", "ENQ002", "ENQ003"],
  invoiceType: ["Export", "InterState", "Local"],
  postRate: ["Yes", "No"],
  taxCode: ["TC001", "TC002", "TC003"],
  isGSTAppl: ["Yes", "No"],
  customerType: ["Individual", "Business", "Government", "International"],
  gstnNo: ["GSTIN001", "GSTIN002", "GSTIN003"],
  unit: ["Pcs", "Kg", "Meter", "Liter", "Box", "NOS"],
  taxType: ["SGST", "IGST"],
  particulars: ["GST", "CGST", "SGST", "IGST", "Cess", "Other"],
  modeOfTransport: ["Road", "Rail", "Air", "Sea", "Courier"],
};

// Helper Components
const SelectField = ({ control, name, label, options, required, errors, onChange, disabled }) => {
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
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
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
          className={`p-1 ${i === 0 ? "w-8 text-center" : "text-left"} dark:text-white whitespace-nowrap text-[10px]`}
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
    <td className="p-1 text-center font-medium dark:text-white text-[10px]">{index + 1}</td>
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

const SelectCell = ({ control, name, options, required, errors, onChange, disabled }) => {
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
    <div className="p-0.5 align-top">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} h-7 text-[10px] ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
          >
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={typeof opt === "object" ? opt.value : opt} value={typeof opt === "object" ? opt.value : opt}>
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
            className={`${controlClasses} h-7 text-[10px] ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e);
              }
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

const FileUploadCell = ({ control, name, errors, onView }) => {
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
    <td className="p-2 align-top">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          // Check if there's an existing file from the API response
          const isExistingFile = value && typeof value === 'object' && value.filePath && !value.name;
          const isNewFile = value && typeof value === 'object' && value.name && !value.filePath;

          return (
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
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
                      }
                    }}
                  />

                  {(isNewFile || (value && value.name)) ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <File className="h-4 w-4" />
                      <span className="text-xs truncate max-w-[150px]">
                        {value?.name || "Uploaded File"}
                      </span>
                    </div>
                  ) : isExistingFile ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                      <File className="h-4 w-4" />
                      <span className="text-xs truncate max-w-[150px]">
                        {value?.fileName || "Existing File"}
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

              {/* Eye Button - Show when file exists */}
              {(isExistingFile || isNewFile) && onView && (
                <button
                  type="button"
                  onClick={() => {
                    const filePath = isExistingFile ? value?.filePath : URL.createObjectURL(value);
                    if (filePath) {
                      onView(filePath);
                    }
                  }}
                  className="p-2 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors flex-shrink-0"
                  title="View File"
                >
                  <Eye className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        }}
      />
    </td>
  );
};

// Main Component
const OrderAcceptanceForm = ({ data, onBack, isEditMode = false }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const [branchId] = useState(localStorage.getItem("branchId"));
  const [activeTab, setActiveTab] = useState("orderAcceptance");
  const [plantData, setPlantData] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [quotationOptions, setQuotationOptions] = useState([]);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currencyData, setCurrencyData] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isUpdatingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
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

  const orderAcceptanceArray = useFieldArray({
    control,
    name: "orderAcceptanceDetails",
  });
  const taxDetailsArray = useFieldArray({ control, name: "taxDetails" });
  const attachedPOCopyArray = useFieldArray({
    control,
    name: "attachedPOCopy",
  });

  // Watch for changes
  const customerId = watch("customerId");
  const soType = watch("soType");
  const withQuotation = watch("withQuotation");
  const quotationNo = watch("quotationNo");
  const isIGSTApplicable = watch("isGSTAppl");

  // Check if SO Type is "Direct" or With Quotation is "No"
  const isDirectSoType = soType === "Direct";
  const isWithQuotationNo = withQuotation === "No";
  const shouldDisableQuotation = isDirectSoType || isWithQuotationNo || !customerId;

  const calculateTaxDetails = useCallback(() => {
    console.log("calculateTaxDetails called");
    const orderDetails = getValues('orderAcceptanceDetails') || [];

    const totalAmount = orderDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

    let sgstTotal = 0, cgstTotal = 0, igstTotal = 0;

    orderDetails.forEach(item => {
      sgstTotal += Number(item.sgstAmount) || 0;
      cgstTotal += Number(item.cgstAmount) || 0;
      igstTotal += Number(item.igstAmount) || 0;
    });

    const existingTaxDetails = getValues('taxDetails') || [];
    const userAddedRows = existingTaxDetails.filter(item => !item.isSystemRow);

    const systemRows = [];

    systemRows.push({
      particulars: "Gross Amount",
      acceptedAmount: totalAmount,
      revisedAmount: totalAmount,
      isSystemRow: true
    });

    if (taxType === "IGST") {
      systemRows.push({
        particulars: "IGST",
        acceptedAmount: igstTotal,
        revisedAmount: igstTotal,
        isSystemRow: true
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        acceptedAmount: sgstTotal,
        revisedAmount: sgstTotal,
        isSystemRow: true
      });
      systemRows.push({
        particulars: "CGST",
        acceptedAmount: cgstTotal,
        revisedAmount: cgstTotal,
        isSystemRow: true
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];

    const currentRows = getValues("taxDetails") || [];

    const hasChanged =
      JSON.stringify(currentRows) !== JSON.stringify(allTaxEntries);

    if (hasChanged) {
      taxDetailsArray.replace(allTaxEntries);
    }

  }, [getValues, isIGSTApplicable, taxDetailsArray, setValue]);

  const calculateRowCalculation = useCallback((index) => {
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    try {
      const quantity = Number(getValues(`orderAcceptanceDetails.${index}.quantity`)) || 0;
      const unitRate = Number(getValues(`orderAcceptanceDetails.${index}.unitRate`)) || 0;
      const otherRate = Number(getValues(`orderAcceptanceDetails.${index}.otherRate`)) || 0;
      const dis = Number(getValues(`orderAcceptanceDetails.${index}.dis`)) || 0;

      const itemCode = getValues(`orderAcceptanceDetails.${index}.itemCode`);
      const taxType =
        getValues(`orderAcceptanceDetails.${index}.taxType`) ||
        (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

      // Calculate amount before discount
      const amountBeforeDiscount = quantity * unitRate;
      const discountAmount = (amountBeforeDiscount * dis) / 100;
      const amount = amountBeforeDiscount - discountAmount;

      let sgstRate = 0, cgstRate = 0, igstRate = 0;

      if (itemCode) {
        const selectedItem = itemOptions.find(
          (i) => String(i.itemCode) === String(itemCode)
        );

        if (selectedItem) {
          sgstRate = Number(selectedItem.sgst) || 0;
          cgstRate = Number(selectedItem.cgst) || 0;
          igstRate = Number(selectedItem.igst) || 0;
        }
      }

      let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;

      if (taxType === "IGST") {
        igstAmount = (amount * igstRate) / 100;
        sgstAmount = 0;
        cgstAmount = 0;
      } else {
        sgstAmount = (amount * sgstRate) / 100;
        cgstAmount = (amount * cgstRate) / 100;
        igstAmount = 0;
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

      updateField(`orderAcceptanceDetails.${index}.amount`, amount);

      updateField(`orderAcceptanceDetails.${index}.sgstRate`, sgstRate);
      updateField(`orderAcceptanceDetails.${index}.cgstRate`, cgstRate);
      updateField(`orderAcceptanceDetails.${index}.igstRate`, igstRate);

      updateField(`orderAcceptanceDetails.${index}.sgstAmount`, sgstAmount);
      updateField(`orderAcceptanceDetails.${index}.cgstAmount`, cgstAmount);
      updateField(`orderAcceptanceDetails.${index}.igstAmount`, igstAmount);

      calculateTaxDetails();
    } finally {
      isUpdatingRef.current = false;
    }
  }, [getValues, setValue, itemOptions, isIGSTApplicable, calculateTaxDetails]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name || isUpdatingRef.current) return;

      if (!name.startsWith("orderAcceptanceDetails.")) return;

      const parts = name.split(".");
      const index = Number(parts[1]);
      const field = parts[2];

      const triggerFields = [
        "quantity",
        "unitRate",
        "otherRate",
        "dis",
        "itemCode",
        "taxType",
      ];

      if (!triggerFields.includes(field)) return;

      calculateRowCalculation(index);
    });

    return () => subscription.unsubscribe();
  }, [watch, calculateRowCalculation]);

  // Set tax type based on GST applicability
  useEffect(() => {
    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

    orderAcceptanceArray.fields.forEach((_, index) => {
      setValue(`orderAcceptanceDetails.${index}.taxType`, taxType);
    });

    if (orderAcceptanceArray.fields.length > 0) {
      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    }
  }, [isIGSTApplicable, orderAcceptanceArray.fields.length, setValue, calculateTaxDetails]);

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

  const loadCurrencies = useCallback(async () => {
    try {
      const response = await currencyAPI.getCurrencies(orgId);
      const options = (response || []).map(item => ({
        value: item.id,
        label: item.currency,
      }));
      setCurrencyData(options);
    } catch (error) {
      console.error("Failed to load currencies:", error);
      setCurrencyData([]);
    }
  }, [orgId]);

  const loadCustomers = useCallback(async (soTypeParam) => {
    const effectiveSoType = soTypeParam || soType;

    if (!orgId || !branchId || !effectiveSoType) {
      console.log("Cannot load customers - missing params:", {
        orgId,
        branchId,
        effectiveSoType
      });
      return;
    }

    setLoadingCustomer(true);

    try {
      const response = await orderAcceptanceAPI.getCustomerDropdown(
        orgId,
        branchId,
        effectiveSoType
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
  }, [orgId, branchId, soType]);

  const loadQuotations = useCallback(async () => {
    if (!orgId || !branchId || !customerId || !soType) {
      return;
    }

    setLoadingQuotation(true);

    try {
      const customer = customerOptions.find(
        (c) => String(c.customerId) === String(customerId)
      );

      const customerCode = customer?.customerCode || "";
      const recId = isEditMode && data?.recId ? data.recId : 0;
      const oldQuotationNo = isEditMode && data?.oldQuotationNo ? data.oldQuotationNo : "";

      const response = await salesContractAPI.getQuotationDropdown(
        orgId,
        branchId,
        soType,
        customerCode,
        recId,
        oldQuotationNo
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
  }, [orgId, branchId, customerId, soType, customerOptions, isEditMode, data]);

  const loadQuotationItems = useCallback(async (quotationNo) => {
    if (!orgId || !branchId || !quotationNo) {
      return;
    }

    setLoadingItems(true);

    try {
      const response = await salesContractAPI.getQuotationItems(
        orgId,
        branchId,
        quotationNo
      );

      if (response?.status && response?.paramObjectsMap?.items) {
        const items = response.paramObjectsMap.items;
        setItemOptions(items);

        if (items.length > 0 && orderAcceptanceArray.fields.length === 1) {
          const firstItem = items[0];
          const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

          isUpdatingRef.current = true;

          setValue(`orderAcceptanceDetails.0.itemCode`, firstItem.itemCode || "");
          setValue(`orderAcceptanceDetails.0.itemDescription`, firstItem.itemDescription || "");
          setValue(`orderAcceptanceDetails.0.hsCode`, firstItem.hsnCode || "");
          setValue(`orderAcceptanceDetails.0.customerPartNo`, firstItem.customerPartNo || "");
          setValue(`orderAcceptanceDetails.0.unit`, firstItem.unitId || "");
          setValue(`orderAcceptanceDetails.0.taxType`, taxType);

          setValue(`orderAcceptanceDetails.0.sgstRate`, Number(firstItem.sgst) || 0);
          setValue(`orderAcceptanceDetails.0.cgstRate`, Number(firstItem.cgst) || 0);
          setValue(`orderAcceptanceDetails.0.igstRate`, Number(firstItem.igst) || 0);

          setValue(`orderAcceptanceDetails.0.taxRs`, Number(firstItem.rate) || 0);

          setValue(`orderAcceptanceDetails.0._itemId`, firstItem.itemId || "");
          setValue(`orderAcceptanceDetails.0._unitMasterId`, firstItem.unitMasterId || "");
          setValue(`orderAcceptanceDetails.0._gstRateMasterId`, firstItem.gstRateMasterId || "");

          setValue(`orderAcceptanceDetails.0.unitRate`, Number(firstItem.rate) || 0);

          setTimeout(() => {
            isUpdatingRef.current = false;
            const quantity = Number(getValues(`orderAcceptanceDetails.0.quantity`)) || 0;
            const unitRate = Number(getValues(`orderAcceptanceDetails.0.unitRate`)) || 0;
            const dis = Number(getValues(`orderAcceptanceDetails.0.dis`)) || 0;

            const amountBeforeDiscount = quantity * unitRate;
            const discountAmount = (amountBeforeDiscount * dis) / 100;
            const amount = amountBeforeDiscount - discountAmount;

            setValue(`orderAcceptanceDetails.0.amount`, amount);

            const sgstRate = Number(firstItem.sgst) || 0;
            const cgstRate = Number(firstItem.cgst) || 0;
            const igstRate = Number(firstItem.igst) || 0;

            let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
            if (taxType === "IGST") {
              igstAmount = (amount * igstRate) / 100;
            } else {
              sgstAmount = (amount * sgstRate) / 100;
              cgstAmount = (amount * cgstRate) / 100;
            }

            setValue(`orderAcceptanceDetails.0.sgstAmount`, sgstAmount);
            setValue(`orderAcceptanceDetails.0.cgstAmount`, cgstAmount);
            setValue(`orderAcceptanceDetails.0.igstAmount`, igstAmount);

            setTimeout(() => {
              calculateTaxDetails();
            }, 100);
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
  }, [orgId, branchId, orderAcceptanceArray.fields.length, setValue, getValues, isIGSTApplicable, calculateTaxDetails]);

  const loadFinishedGoodsItems = useCallback(async () => {
    if (!orgId || !branchId) {
      return;
    }

    setLoadingItems(true);

    try {
      const response = await salesContractAPI.getFinishedGoodsItems(
        orgId,
        branchId
      );

      if (response?.status && response?.paramObjectsMap?.items) {
        const items = response.paramObjectsMap.items;
        setItemOptions(items);
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

  const loadItems = useCallback(async () => {
    if (!orgId || !branchId) {
      return;
    }

    setLoadingItems(true);

    try {
      const response = await orderAcceptanceAPI.getItems(
        orgId,
        branchId
      );

      if (response?.status && response?.paramObjectsMap?.items) {
        setItemOptions(response.paramObjectsMap.items);
      } else {
        setItemOptions([]);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      setItemOptions([]);
    } finally {
      setLoadingItems(false);
    }
  }, [orgId, branchId]);

  const loadListOfValuesData = async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(group, orgId);

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

            result[key] = items.map(item => ({
              value: item.id || item.value,
              label: item.valuesDescription || item.label || item.name,
              ...item,
            }));

          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        })
      );

      setListOfValuesData(result);

      if (orderAcceptanceArray.fields.length > 0) {
        setTimeout(() => {
          calculateTaxDetails();
        }, 200);
      }
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  };

  const handleItemSelect = useCallback((index, itemCode) => {
    const selectedItem = itemOptions.find(
      item => String(item.itemCode) === String(itemCode)
    );

    if (selectedItem) {
      isUpdatingRef.current = true;

      setValue(`orderAcceptanceDetails.${index}.itemCode`, selectedItem.itemCode || "");
      setValue(`orderAcceptanceDetails.${index}.itemDescription`, selectedItem.itemDescription || "");
      setValue(`orderAcceptanceDetails.${index}.hsCode`, selectedItem.hsnCode || "");
      setValue(`orderAcceptanceDetails.${index}.customerPartNo`, selectedItem.customerPartNo || "");
      setValue(`orderAcceptanceDetails.${index}.unit`, selectedItem.unitId || "");

      const sgstRate = Number(selectedItem.sgst) || 0;
      const cgstRate = Number(selectedItem.cgst) || 0;
      const igstRate = Number(selectedItem.igst) || 0;

      setValue(`orderAcceptanceDetails.${index}.sgstRate`, sgstRate);
      setValue(`orderAcceptanceDetails.${index}.cgstRate`, cgstRate);
      setValue(`orderAcceptanceDetails.${index}.igstRate`, igstRate);

      setValue(`orderAcceptanceDetails.${index}.taxRs`, Number(selectedItem.rate) || 0);

      setValue(`orderAcceptanceDetails.${index}._itemId`, selectedItem.itemId || "");
      setValue(`orderAcceptanceDetails.${index}._unitMasterId`, selectedItem.unitMasterId || "");
      setValue(`orderAcceptanceDetails.${index}._gstRateMasterId`, selectedItem.gstRateMasterId || "");

      setValue(`orderAcceptanceDetails.${index}.unitRate`, Number(selectedItem.rate) || 0);

      const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";
      setValue(`orderAcceptanceDetails.${index}.taxType`, taxType);

      setTimeout(() => {
        isUpdatingRef.current = false;
        const quantity = Number(getValues(`orderAcceptanceDetails.${index}.quantity`)) || 0;
        const unitRate = Number(getValues(`orderAcceptanceDetails.${index}.unitRate`)) || 0;
        const dis = Number(getValues(`orderAcceptanceDetails.${index}.dis`)) || 0;

        const amountBeforeDiscount = quantity * unitRate;
        const discountAmount = (amountBeforeDiscount * dis) / 100;
        const amount = amountBeforeDiscount - discountAmount;

        setValue(`orderAcceptanceDetails.${index}.amount`, amount);

        let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
        if (taxType === "IGST") {
          igstAmount = (amount * igstRate) / 100;
        } else {
          sgstAmount = (amount * sgstRate) / 100;
          cgstAmount = (amount * cgstRate) / 100;
        }

        setValue(`orderAcceptanceDetails.${index}.sgstAmount`, sgstAmount);
        setValue(`orderAcceptanceDetails.${index}.cgstAmount`, cgstAmount);
        setValue(`orderAcceptanceDetails.${index}.igstAmount`, igstAmount);

        setTimeout(() => {
          calculateTaxDetails();
        }, 100);
      }, 100);
    }
  }, [itemOptions, setValue, getValues, isIGSTApplicable, calculateTaxDetails]);

  const handleTaxTypeChange = useCallback((index, newTaxType) => {
    isUpdatingRef.current = true;
    setValue(`orderAcceptanceDetails.${index}.taxType`, newTaxType);

    setTimeout(() => {
      const quantity = Number(getValues(`orderAcceptanceDetails.${index}.quantity`)) || 0;
      const unitRate = Number(getValues(`orderAcceptanceDetails.${index}.unitRate`)) || 0;
      const dis = Number(getValues(`orderAcceptanceDetails.${index}.dis`)) || 0;
      const itemCode = getValues(`orderAcceptanceDetails.${index}.itemCode`);

      if (itemCode) {
        const selectedItem = itemOptions.find(i => String(i.itemCode) === String(itemCode));
        if (selectedItem) {
          const sgstRate = Number(selectedItem.sgst) || 0;
          const cgstRate = Number(selectedItem.cgst) || 0;
          const igstRate = Number(selectedItem.igst) || 0;

          const amountBeforeDiscount = quantity * unitRate;
          const discountAmount = (amountBeforeDiscount * dis) / 100;
          const amount = amountBeforeDiscount - discountAmount;

          let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
          if (newTaxType === "IGST") {
            igstAmount = (amount * igstRate) / 100;
            setValue(`orderAcceptanceDetails.${index}.sgstRate`, 0);
            setValue(`orderAcceptanceDetails.${index}.cgstRate`, 0);
          } else {
            sgstAmount = (amount * sgstRate) / 100;
            cgstAmount = (amount * cgstRate) / 100;
            setValue(`orderAcceptanceDetails.${index}.igstRate`, 0);
          }

          setValue(`orderAcceptanceDetails.${index}.sgstAmount`, sgstAmount);
          setValue(`orderAcceptanceDetails.${index}.cgstAmount`, cgstAmount);
          setValue(`orderAcceptanceDetails.${index}.igstAmount`, igstAmount);

          setTimeout(() => {
            calculateTaxDetails();
          }, 100);
        }
      }

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }, 100);
  }, [setValue, getValues, itemOptions, calculateTaxDetails]);

  const populateFormData = useCallback((orderData) => {
    console.log("Populating form from raw data:", orderData);
    if (!orderData) return;

    try {
      // Header Fields
      setValue("plantId", orderData.plantId || orderData.branch?.id || "");
      setValue("belongsTo", orderData.belongsTo || "");
      setValue("soType", orderData.soType || "");
      setValue("withQuotation", orderData.withQuotation || "");
      setValue("customerId", orderData.customerId || "");
      setValue("customerName", orderData.customerName || "");
      setValue("quotationNo", orderData.quotationNo || "");
      setValue("quotationDate", orderData.quotationDate || "");
      setValue("enquiryNo", orderData.enquiryNo || "");
      setValue("enquiryDate", orderData.enquiryDate || "");
      setValue("custPONo", orderData.custPONo || orderData.customerPurchaseOrderNo || "");
      setValue("custPODate", orderData.custPODate || orderData.customerPurchaseOrderDate || "");
      setValue("invoiceType", orderData.invoiceType || "");
      setValue("postRate", orderData.postRate || "");
      setValue("isGSTAppl", orderData.isGSTAppl || "");
      setValue("customerType", orderData.customerType || "");
      setValue("gstnNo", orderData.gstnNo || "");
      setValue("auto", orderData.auto || orderData.docId || orderData.orderNo || "");
      setValue("orderDate", orderData.orderDate || orderData.docDate || "");
      setValue("recId", orderData.recId || "");
      setValue("oldQuotationNo", orderData.oldQuotationNo || "");

      // Auto-fill customer details if customerId is present and customerOptions are loaded
      if (orderData.customerId && customerOptions.length > 0) {
        const customer = customerOptions.find(
          (c) => String(c.customerId) === String(orderData.customerId)
        );
        if (customer) {
          setSelectedCustomer(customer);
          setValue("customerName", customer.customerName || orderData.customerName || "");
          setValue("gstnNo", customer.gstNo || orderData.gstnNo || "");
          setValue("isGSTAppl", customer.igstApplicable ? "Yes" : orderData.isGSTAppl || "No");
          if (customer.gstType) {
            setValue("customerType", customer.gstType || orderData.customerType || "");
          }
        }
      }

      // Terms and Conditions
      if (orderData.termsConditions) {
        setValue("termsConditions.destination", orderData.termsConditions.destination || "");
        setValue("termsConditions.freight", orderData.termsConditions.freight || "");
        setValue("termsConditions.modeOfTransport", orderData.termsConditions.modeOfTransport || "");
        setValue("termsConditions.grossValue", orderData.termsConditions.grossValue || 0);
        setValue("termsConditions.deliveryTerms", orderData.termsConditions.deliveryTerms || "");
        setValue("termsConditions.paymentTerms", orderData.termsConditions.paymentTerms || "");
        setValue("termsConditions.specification", orderData.termsConditions.specification || "");
        setValue("termsConditions.note", orderData.termsConditions.note || "");
      } else {
        // If termsConditions is not in the data, try to set from root level
        setValue("termsConditions.destination", orderData.destination || "");
        setValue("termsConditions.freight", orderData.freight || "");
        setValue("termsConditions.modeOfTransport", orderData.modeOfTransport || "");
        setValue("termsConditions.grossValue", orderData.grossalue || orderData.grossValue || 0);
        setValue("termsConditions.deliveryTerms", orderData.deliveryTerms || "");
        setValue("termsConditions.paymentTerms", orderData.paymentTerms || "");
        setValue("termsConditions.specification", orderData.specification || "");
        setValue("termsConditions.note", orderData.note || "");
      }

      // Order Acceptance Details
      if (orderData.orderAcceptanceDetails && orderData.orderAcceptanceDetails.length > 0) {
        const details = orderData.orderAcceptanceDetails.map((item, index) => ({
          sno: index + 1,
          itemCode: item.itemCode || "",
          _itemId: item._itemId || item.item?.id || 0,
          customerPartNo: item.customerPartNo || "",
          itemDescription: item.itemDescription || item.item?.itemDescription || "",
          hsCode: item.hsCode || item.item?.hsnCode || "",
          taxType: item.taxType || "",
          taxRs: item.taxRs || item.taxPercentage?.taxPercentage || 0,
          _gstRateMasterId: item._gstRateMasterId || item.taxPercentage?.id || 0,
          lastInvitedDate: item.lastInvitedDate || item.lastInvoiceDate || "",
          unit: item.unit || item.unit?.unitId || "",
          _unitMasterId: item._unitMasterId || item.unit?.id || 0,
          quantity: item.quantity || 0,
          unitRate: item.unitRate || item.orderRate || 0,
          otherRate: item.otherRate || 0,
          dis: item.dis || item.discount || 0,
          amount: item.amount || 0,
          sgstRate: item.sgstRate || 0,
          sgstAmount: item.sgstAmount || 0,
          cgstRate: item.cgstRate || 0,
          cgstAmount: item.cgstAmount || 0,
          igstRate: item.igstRate || 0,
          igstAmount: item.igstAmount || 0,
          currencyName: item.currencyName || "",
        }));
        orderAcceptanceArray.replace(details);
      }

      // Tax Details
      if (orderData.taxDetails && orderData.taxDetails.length > 0) {
        const taxDetails = orderData.taxDetails.map((item, index) => ({
          id: index + 1,
          particulars: item.particulars || "",
          acceptedAmount: item.acceptedAmount || item.acceptedQtyAmount || 0,
          revisedAmount: item.revisedAmount || 0,
          isSystemRow: item.isSystemRow ||
            ['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(item.particulars || "") ||
            ['1000000092', '1000000093'].includes(String(item.particulars)),
        }));
        taxDetailsArray.replace(taxDetails);
      }

      // Attachments
      if (orderData.attachments && orderData.attachments.length > 0) {
        const attachments = orderData.attachments.map(item => ({
          pdfAttached: {
            filePath: item.filePath || item.pdfAttached?.filePath || "",
            fileName: item.fileName || item.pdfAttached?.fileName || item.name || "Attachment",
            id: item.id || item.pdfAttached?.id,
            name: item.name || item.pdfAttached?.name,
            fileSize: item.fileSize || item.pdfAttached?.fileSize,
            uploadOn: item.uploadOn || item.pdfAttached?.uploadOn,
            // Flag to indicate this is an existing file
            isExisting: true,
          },
        }));
        attachedPOCopyArray.replace(attachments);
      }

      dataLoadedRef.current = true;
    } catch (error) {
      console.error("Error populating form data:", error);
    }
  }, [setValue, orderAcceptanceArray, taxDetailsArray, attachedPOCopyArray, customerOptions, setSelectedCustomer]);

  const loadOrderAcceptanceData = useCallback(async (orderId) => {
    if (!orderId) {
      console.log("No order ID provided");
      return;
    }

    setLoading(true);
    try {
      console.log("Calling getOrderAcceptanceById with ID:", orderId);
      const response = await orderAcceptanceAPI.getOrderAcceptanceById(orderId);
      console.log("Order Acceptance Data Response:", response);

      if (response?.status && response?.paramObjectsMap?.orderAcceptanceResponseVO) {
        const order = response.paramObjectsMap.orderAcceptanceResponseVO;
        console.log("Order data received:", order);

        // Map the response fields to form fields
        const mappedData = {
          id: order.id,
          plantId: order.branch?.id || "",
          belongsTo: order.belongsTo || "",
          soType: order.soType || "",
          withQuotation: order.withQuotation || "",
          customerId: order.customerId?.id || "",
          customerName: order.customerId?.customerName || "",
          quotationNo: order.quotationNo || "",
          quotationDate: order.quotationDate || "",
          enquiryNo: order.enquiryNo || "",
          enquiryDate: order.enquiryDate || "",
          custPONo: order.customerPurchaseOrderNo || "",
          custPODate: order.customerPurchaseOrderDate || "",
          invoiceType: order.invoiceType || "",
          postRate: order.postRate || "",
          isGSTAppl: order.customerId?.gstApproval || "",
          customerType: order.customerId?.customerType || "",
          gstnNo: order.customerId?.customerGstNo || "",
          auto: order.docId || order.orderNo || "",
          orderDate: order.docDate || order.orderDate || "",
          recId: order.recId || "",
          oldQuotationNo: order.oldQuotationNo || "",
          active: order.active !== false,
          createdBy: order.createdBy || "",
          updatedBy: order.updatedBy || "",
          cancelRemarks: order.cancelRemarks || "",
          financialYear: order.financialYear || "",
          branch: order.branch?.branchName || "",
          destination: order.destination || "",
          freight: order.freight || "",
          modeOfTransport: order.modeOfTransport || "",
          grossValue: order.grossalue || order.grossValue || 0,
          deliveryTerms: order.deliveryTerms || "",
          paymentTerms: order.paymentTerms || "",
          specification: order.specification || "",
          note: order.note || "",
          orderAcceptanceDetails: (order.orderAcceptanceDetailsResponseDTO || []).map(item => ({
            itemCode: item.item?.itemCode || "",
            _itemId: item.item?.id || 0,
            customerPartNo: item.customerPartNo || "",
            itemDescription: item.item?.itemDescription || "",
            hsCode: item.hsCode || item.item?.hsnCode || "",
            taxType: item.taxType || "",
            taxRs: item.taxPercentage?.taxPercentage || 0,
            _gstRateMasterId: item.taxPercentage?.id || 0,
            lastInvitedDate: item.lastInvoiceDate || "",
            unit: item.unit || item.unit?.unitId || "",
            _unitMasterId: item.unit?.id || 0,
            quantity: item.quantity || 0,
            unitRate: item.orderRate || 0,
            otherRate: item.orderRate || 0,
            dis: item.discount || 0,
            amount: item.amount || 0,
            currencyName: item.currencyName || "",
          })),
          taxDetails: (order.orderAcceptanceTaxDetailsResponsVO || []).map(item => {
            // Get particulars label from listOfValuesData if available
            let particularsLabel = item.particulars || "";
            if (listOfValuesData.PARTICULARS && listOfValuesData.PARTICULARS.length > 0) {
              const found = listOfValuesData.PARTICULARS.find(
                option => String(option.value) === String(item.particulars)
              );
              if (found) {
                particularsLabel = found.label;
              }
            }
            return {
              particulars: particularsLabel,
              acceptedAmount: item.acceptedQtyAmount || 0,
              revisedAmount: item.revisedAmount || 0,
              isSystemRow: ['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(particularsLabel) ||
                ['1000000092', '1000000093'].includes(String(item.particulars)),
            };
          }),
          attachments: (order.orderAcceptanceFileUploadDetailsDTO || []).map(item => ({
            filePath: item.filePath,
            fileName: item.fileName || item.name || "Attachment",
            id: item.id,
            name: item.name,
            fileSize: item.fileSize,
            uploadOn: item.uploadOn,
          })),
        };

        // Set the values in the form
        populateFormData(mappedData);
        addToast("Order acceptance loaded successfully", "success");
      } else {
        console.error("Invalid response structure:", response);
        addToast("Failed to load order acceptance data", "error");
      }
    } catch (error) {
      console.error("Error loading order acceptance:", error);
      addToast("Failed to load order acceptance data", "error");
    } finally {
      setLoading(false);
    }
  }, [populateFormData, addToast, listOfValuesData]);

  useEffect(() => {
    if (dataLoadedRef.current) return;

    loadBranches();
    loadCurrencies();
    loadItems();
    loadListOfValuesData();

    // Check if we're in edit mode and have data with an ID
    if (isEditMode && data?.id) {
      console.log("Loading order acceptance by ID:", data.id);
      loadOrderAcceptanceData(data.id);
    } else if (isEditMode && data) {
      // If edit mode but no ID, try to populate from data directly
      console.log("Populating form from raw data:", data);
      populateFormData(data);
    }

    return () => {
      dataLoadedRef.current = false;
    };
  }, [isEditMode, data]); // Add data as dependency

  // Load customers when soType changes and set With Quotation based on soType
  useEffect(() => {
    if (orgId && soType) {
      loadCustomers(soType);

      // Set With Quotation based on SO Type
      if (soType === "Direct") {
        setValue("withQuotation", "No");
        setValue("quotationNo", "");
        setValue("quotationDate", "");
        setQuotationOptions([]);
      } else if (soType === "Flow") {
        setValue("withQuotation", "Yes");
      }

      // Reset customer fields when soType changes
      setValue("customerId", "");
      setValue("customerName", "");
      setSelectedCustomer(null);
    }
  }, [orgId, soType]);

  // Load quotations when customerId changes and conditions are met
  useEffect(() => {
    if (orgId && branchId && customerId && soType && !isDirectSoType && withQuotation === "Yes") {
      loadQuotations();
    } else {
      setQuotationOptions([]);
      setValue("quotationNo", "");
      setValue("quotationDate", "");
    }
  }, [customerId, soType, orgId, branchId, isDirectSoType, withQuotation]);

  // Load quotation items when quotationNo changes
  useEffect(() => {
    if (orgId && branchId) {
      if (withQuotation === "Yes" && quotationNo) {
        loadQuotationItems(quotationNo);
      } else if (withQuotation === "No") {
        loadFinishedGoodsItems();
      } else {
        setItemOptions([]);
      }
    }
  }, [quotationNo, withQuotation, orgId, branchId]);

  // Auto-fill customer details when customerId changes
  useEffect(() => {
    if (customerId && customerOptions.length > 0) {
      const customer = customerOptions.find(
        (c) => String(c.customerId) === String(customerId)
      );
      if (customer) {
        setSelectedCustomer(customer);
        setValue("customerName", customer.customerName || "");
        setValue("gstnNo", customer.gstNo || "");
        setValue("isGSTAppl", customer.igstApplicable ? "Yes" : "No");
        if (customer.gstType) {
          setValue("customerType", customer.gstType);
        }
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [customerId, customerOptions, setValue]);

  // Auto-fill quotation date when quotationNo changes
  useEffect(() => {
    if (quotationNo && quotationOptions.length > 0 && !isDirectSoType && withQuotation === "Yes") {
      const selectedQuotation = quotationOptions.find(
        (q) => String(q.quotationNo) === String(quotationNo)
      );
      if (selectedQuotation) {
        setValue("quotationDate", selectedQuotation.quotationDate || "");
        setValue("enquiryNo", selectedQuotation.enquiryNo || "");
        setValue("enquiryDate", selectedQuotation.enquiryDate || "");
      }
    }
  }, [quotationNo, quotationOptions, setValue, isDirectSoType, withQuotation]);

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "orderAcceptance") {
      const newItem = defaultValues.orderAcceptanceDetails[0] || {};
      orderAcceptanceArray.append(newItem);
      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    } else if (arrayName === "taxDetails") {
      const newItem = {
        particulars: "",
        acceptedAmount: 0,
        revisedAmount: 0,
        isSystemRow: false
      };
      taxDetailsArray.append(newItem);
    } else if (arrayName === "attachedPOCopy") {
      const newItem = defaultValues.attachedPOCopy[0] || {};
      attachedPOCopyArray.append(newItem);
    }
  };

  const handleFileView = (filePath) => {
    if (filePath) {
      // Open the file in a new tab
      window.open(filePath, '_blank');
    }
  };

  const handleRemoveItem = (arrayName, index) => {
    if (arrayName === "orderAcceptance") {
      if (orderAcceptanceArray.fields.length > 1) {
        orderAcceptanceArray.remove(index);
        setTimeout(() => {
          calculateTaxDetails();
        }, 100);
      }
    } else if (arrayName === "taxDetails") {
      const currentTaxDetails = getValues('taxDetails') || [];
      const isSystemRow = currentTaxDetails[index]?.isSystemRow;

      if (isSystemRow) {
        alert('Cannot delete system calculated rows');
        return;
      }

      taxDetailsArray.remove(index);

      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    } else if (arrayName === "attachedPOCopy") {
      if (attachedPOCopyArray.fields.length > 1) {
        attachedPOCopyArray.remove(index);
      }
    }
  };

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
        } catch (e) {
          return null;
        }
      };

      const getParticularId = (label) => {
        if (!label) return "";
        const allOptions = listOfValuesData.PARTICULARS || [];
        const found = allOptions.find(option => option.label === label);
        return found ? found.value : label;
      };

      // Get the tax type from the first row
      const taxType = formData.orderAcceptanceDetails?.[0]?.taxType ||
        (formData.isGSTAppl === "Yes" ? "IGST" : "SGST");

      // Build order acceptance details
      const orderAcceptanceDetailsDTO = (formData.orderAcceptanceDetails || [])
        .filter(item => item.itemCode && item.quantity > 0)
        .map(item => {
          // Calculate quantity rate (quantity * unitRate)
          const quantity = parseFloat(item.quantity) || 0;
          const unitRate = parseFloat(item.unitRate) || 0;
          const quantityRate = quantity * unitRate;

          // Calculate discount amount
          const dis = parseFloat(item.dis) || 0;
          const discountAmount = (quantityRate * dis) / 100;
          const amount = quantityRate - discountAmount;

          // Determine tax type for this row
          const rowTaxType = item.taxType || taxType;

          // Get SGST, CGST, IGST rates from item selection or calculated values
          let sgstRate = parseFloat(item.sgstRate) || 0;
          let cgstRate = parseFloat(item.cgstRate) || 0;
          let igstRate = parseFloat(item.igstRate) || 0;

          // If tax type is IGST, use IGST rate, else use SGST + CGST
          let finalTaxPercentage = 0;
          if (rowTaxType === "IGST") {
            finalTaxPercentage = igstRate;
          } else {
            finalTaxPercentage = sgstRate + cgstRate;
          }

          return {
            amount: amount,
            customerPartNo: item.customerPartNo || "",
            discount: parseFloat(item.dis) || 0,
            item: parseInt(item._itemId) || 0,
            lastInvoiceDate: formatDateForAPI(item.lastInvitedDate) || "",
            orderRate: parseFloat(item.unitRate) || 0,
            quantity: quantity,
            quantityRate: quantityRate,
            taxPercentage: parseInt(item._gstRateMasterId) || 0,
            taxType: rowTaxType,
            unit: parseInt(item._unitMasterId) || 0,
            currencyName: item.currencyName || "INR",
          };
        });

      // Build tax details
      const orderAcceptanceTaxDetailsDTO = (formData.taxDetails || [])
        .filter(item => item.particulars && item.particulars.trim() !== "")
        .map(item => ({
          acceptedQtyAmount: parseFloat(item.acceptedAmount) || 0,
          revisedAmount: parseFloat(item.revisedAmount) || 0,
          particulars: parseInt(getParticularId(item.particulars)) || 0,
        }));

      // Build the payload
      const orderAcceptanceData = {
        active: true,
        branch: parseInt(branchId),
        belongsTo: formData.belongsTo || "",
        invoiceType: formData.invoiceType || "",
        cancelRemarks: "",
        createdBy: localStorage.getItem("userId") || "admin",
        customer: parseInt(formData.customerId) || 0,
        customerPurchaseOrderDate: formatDateForAPI(formData.custPODate) || "",
        customerPurchaseOrderNo: formData.custPONo || "",
        deliveryTerms: formData.termsConditions?.deliveryTerms || "",
        destination: formData.termsConditions?.destination || "",
        docId: formData.auto || `OA/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 100000)).padStart(6, "0")}`,
        enquiryDate: formatDateForAPI(formData.enquiryDate) || "",
        enquiryNo: formData.enquiryNo || "",
        financialYear: new Date().getFullYear() + "-" + String(new Date().getFullYear() + 1).slice(-2),
        freight: formData.termsConditions?.freight || "",
        grossValue: parseFloat(formData.termsConditions?.grossValue) || 0,
        gstApproval: formData.isGSTAppl || "No",
        modeOfTransport: formData.termsConditions?.modeOfTransport || "",
        note: formData.termsConditions?.note || "",
        orderAcceptanceDetailsDTO: orderAcceptanceDetailsDTO,
        orderAcceptanceTaxDetailsDTO: orderAcceptanceTaxDetailsDTO,
        orderDate: formatDateForAPI(formData.orderDate) || new Date().toISOString().split('T')[0],
        orderNo: formData.auto || `OA/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 100000)).padStart(6, "0")}`,
        orgId: parseInt(orgId),
        paymentTerms: formData.termsConditions?.paymentTerms || "",
        postRate: formData.postRate || "",
        quotationDate: formatDateForAPI(formData.quotationDate) || "",
        quotationNo: formData.quotationNo || "",
        soType: formData.soType || "",
        specification: formData.termsConditions?.specification || "",
        withQuotation: formData.withQuotation || "",
      };

      // If editing, add id and updatedBy
      if (isEditMode && data?.id) {
        orderAcceptanceData.id = parseInt(data.id);
        orderAcceptanceData.updatedBy = localStorage.getItem("userId") || "admin";
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Convert orderAcceptanceData to JSON and append as blob
      const orderAcceptanceDataJSON = JSON.stringify(orderAcceptanceData);
      const orderAcceptanceDataBlob = new Blob([orderAcceptanceDataJSON], {
        type: "application/json",
      });

      formDataToSend.append("orderAcceptance", orderAcceptanceDataBlob, "orderAcceptanceDTO.json");

      // Handle attachments - only send new files, not existing ones
      const pdfAttachments = watch("attachedPOCopy");
      if (pdfAttachments && pdfAttachments.length > 0) {
        // Collect existing file IDs to send in payload
        const existingFileIds = [];

        for (let i = 0; i < pdfAttachments.length; i++) {
          const attachment = pdfAttachments[i]?.pdfAttached;

          // Check if this is a new file (has 'name' and 'size' properties) - using typeof instead of instanceof
          if (
            attachment &&
            typeof attachment === "object" &&
            "name" in attachment &&
            "size" in attachment
          ) {
            // This is a new file, send it
            formDataToSend.append("files", attachment, attachment.name);
            console.log("Uploading new file:", attachment.name);
          } else if (attachment && typeof attachment === 'object' && attachment.filePath) {
            // This is an existing file, keep its ID
            if (attachment.id) {
              existingFileIds.push(attachment.id);
            }
            console.log('Existing file - keeping:', attachment.filePath);
          } else if (attachment && typeof attachment === 'string') {
            console.log('Existing file path:', attachment);
          }
        }

        // Add existing file IDs to the payload if there are any
        if (existingFileIds.length > 0) {
          orderAcceptanceData.existingFileIds = existingFileIds;
          // Update the blob with the new data
          const updatedOrderAcceptanceDataJSON = JSON.stringify(orderAcceptanceData);
          const updatedOrderAcceptanceDataBlob = new Blob([updatedOrderAcceptanceDataJSON], {
            type: "application/json",
          });
          formDataToSend.set("orderAcceptance", updatedOrderAcceptanceDataBlob, "orderAcceptanceDTO.json");
        }
      }

      console.log("Sending order acceptance data:", orderAcceptanceData);
      console.log("FormData entries:");
      for (let pair of formDataToSend.entries()) {
        // Use typeof check instead of instanceof
        const isFile = pair[1] && typeof pair[1] === 'object' && 'name' in pair[1] && 'size' in pair[1];
        console.log(pair[0] + ': ' + (isFile ? pair[1].name : 'Blob'));
      }

      const response = await orderAcceptanceAPI.createUpdateOrderAcceptance(formDataToSend);

      console.log("Full API Response:", response);

      const isSuccess = response?.status === true ||
        response?.success === true ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          isEditMode
            ? "Order acceptance updated successfully"
            : "Order acceptance created successfully",
          "success"
        );
        onBack();
      } else {
        const errorMessage = response?.message ||
          response?.paramObjectsMap?.message ||
          response?.errorMessage ||
          response?.error ||
          "Something went wrong";
        addToast(errorMessage, "error");
      }

    } catch (error) {
      console.error("Error saving order acceptance:", error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        "Failed to save order acceptance. Please try again.";
      addToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading order acceptance data...</div>
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
          {data ? "Edit Order Acceptance" : "Add Order Acceptance"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SelectField
            control={control}
            name="plantId"
            label="Plant Id"
            options={plantData.length > 0 ? plantData : SELECT_OPTIONS.plantId}
            required
            errors={errors}
          />
          <InputField
            control={control}
            name="auto"
            label="Order No"
            placeholder="Auto generated"
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
            name="orderDate"
            label="Date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="soType"
            label="S.O.Type"
            options={SELECT_OPTIONS.soType}
            required
            errors={errors}
            onChange={(value) => {
              setValue("soType", value);
              loadCustomers(value);

              // Set With Quotation based on SO Type
              if (value === "Direct") {
                setValue("withQuotation", "No");
                setValue("quotationNo", "");
                setValue("quotationDate", "");
                setQuotationOptions([]);
              } else if (value === "Flow") {
                setValue("withQuotation", "Yes");
              }
            }}
          />
          <SelectField
            control={control}
            name="withQuotation"
            label="With Quotation"
            options={SELECT_OPTIONS.withQuotation}
            required
            errors={errors}
            disabled={isDirectSoType}
            onChange={(value) => {
              setValue("withQuotation", value);
              if (value === "No") {
                setValue("quotationNo", "");
                setValue("quotationDate", "");
                setQuotationOptions([]);
              }
            }}
          />
          <SelectField
            control={control}
            name="customerId"
            label="Customer Id"
            options={customerOptions.map(c => ({
              value: c.customerId,
              label: `${c.customerCode} - ${c.customerName}`
            }))}
            required
            errors={errors}
            disabled={loadingCustomer || !soType}
          />
          <InputField
            control={control}
            name="customerName"
            label="Customer Name"
            placeholder="Auto-filled from selection"
            errors={errors}
            disabled={true}
          />
          <SelectField
            control={control}
            name="quotationNo"
            label="Quotation No"
            options={quotationOptions.map(q => ({
              value: q.quotationNo,
              label: `${q.quotationNo} - ${formatDateForDisplay(q.quotationDate)}`
            }))}
            errors={errors}
            disabled={shouldDisableQuotation || loadingQuotation}
          />
          <InputField
            control={control}
            type="date"
            name="quotationDate"
            label="Quotation Date"
            errors={errors}
            disabled={shouldDisableQuotation}
          />
          <InputField
            control={control}
            name="enquiryNo"
            label="Enquiry No"
            errors={errors}
            disabled={shouldDisableQuotation}
          />
          <InputField
            control={control}
            type="date"
            name="enquiryDate"
            label="Enquiry Date"
            errors={errors}
            disabled={shouldDisableQuotation}
          />
          <InputField
            control={control}
            name="custPONo"
            label="Cust. P.O.No."
            placeholder="Enter PO number"
            errors={errors}
          />
          <InputField
            control={control}
            type="date"
            name="custPODate"
            label="Cust.P.O.Date"
            required
            errors={errors}
          />
          <SelectField
            control={control}
            name="invoiceType"
            label="Invoice Type"
            options={SELECT_OPTIONS.invoiceType}
            required
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
            name="isGSTAppl"
            label="Is GST Appl"
            errors={errors}
            disabled={true}
          />
          <InputField
            control={control}
            name="customerType"
            label="Customer Type"
            errors={errors}
          />
          <InputField
            control={control}
            name="gstnNo"
            label="GSTN No"
            errors={errors}
            disabled={true}
          />
        </div>

        {/* Tabs Section */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("orderAcceptance")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === "orderAcceptance"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Order Acceptance Detail
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("taxDetails")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === "taxDetails"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Tax Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("termsConditions")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === "termsConditions"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Terms and Conditions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attachedPOCopy")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === "attachedPOCopy"
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

              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs min-w-max">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="p-1.5 text-center dark:text-white whitespace-nowrap text-[10px] font-medium sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">S.No</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">Item Code *</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[120px]">Customer Part No</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[120px]">Item Description</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[110px]">HSN/SAC Code *</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">Tax Type *</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">Tax (%)</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">Unit *</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">Quantity</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">Quot. Rate</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">Order Rate</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">Dis. %</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">Amount</th>
                      {/* Conditionally show/hide columns based on tax type */}
                      {orderAcceptanceArray.fields.map((field, idx) => {
                        const rowTaxType = getValues(`orderAcceptanceDetails.${idx}.taxType`) ||
                          (isIGSTApplicable === "Yes" ? "IGST" : "SGST");
                        if (rowTaxType === "SGST") {
                          return (
                            <>
                              <th key={`sgst-rate-${idx}`} className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">SGST Rate</th>
                              <th key={`sgst-amount-${idx}`} className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">SGST Amount</th>
                              <th key={`cgst-rate-${idx}`} className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">CGST Rate</th>
                              <th key={`cgst-amount-${idx}`} className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">CGST Amount</th>
                            </>
                          );
                        } else if (rowTaxType === "IGST") {
                          return (
                            <>
                              <th key={`igst-rate-${idx}`} className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">IGST Rate</th>
                              <th key={`igst-amount-${idx}`} className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">IGST Amount</th>
                            </>
                          );
                        }
                        return null;
                      })}
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">Currency Name</th>
                      <th className="p-1.5 text-center dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[60px] sticky right-0 bg-gray-100 dark:bg-gray-700 z-10">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderAcceptanceArray.fields.map((field, index) => {
                      const rowTaxType = getValues(`orderAcceptanceDetails.${index}.taxType`) ||
                        (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

                      return (
                        <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-1 text-center font-medium dark:text-white text-[10px] sticky left-0 bg-white dark:bg-gray-800 z-10">
                            {index + 1}
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <SelectCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.itemCode`}
                              options={itemOptions.map(item => ({
                                value: item.itemCode,
                                label: `${item.itemCode} - ${item.itemDescription}`
                              }))}
                              required
                              errors={errors}
                              onChange={(value) => handleItemSelect(index, value)}
                              disabled={loadingItems}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[120px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.customerPartNo`}
                              placeholder="Part No"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[120px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.itemDescription`}
                              placeholder="Description"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[110px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.hsCode`}
                              placeholder="HS Code"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <Controller
                              name={`orderAcceptanceDetails.${index}.taxType`}
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
                                  disabled={isDirectSoType}
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
                              name={`orderAcceptanceDetails.${index}.taxRs`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[80px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.unit`}
                              placeholder="Unit"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[80px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.quantity`}
                              type="number"
                              step="1"
                              placeholder="0"
                              required
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[90px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.unitRate`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              required
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[90px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.otherRate`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[80px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.dis`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                            />
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <InputCell
                              control={control}
                              name={`orderAcceptanceDetails.${index}.amount`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              required
                              errors={errors}
                              disabled
                            />
                          </td>
                          {/* Conditionally render tax columns based on tax type */}
                          {rowTaxType === "SGST" ? (
                            <>
                              <td className="p-0.5 align-top min-w-[90px]">
                                <InputCell
                                  control={control}
                                  name={`orderAcceptanceDetails.${index}.sgstRate`}
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
                                  name={`orderAcceptanceDetails.${index}.sgstAmount`}
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
                                  name={`orderAcceptanceDetails.${index}.cgstRate`}
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
                                  name={`orderAcceptanceDetails.${index}.cgstAmount`}
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
                                  name={`orderAcceptanceDetails.${index}.igstRate`}
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
                                  name={`orderAcceptanceDetails.${index}.igstAmount`}
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
                              name={`orderAcceptanceDetails.${index}.currencyName`}
                              options={currencyData}
                              placeholder="Currency"
                              errors={errors}
                            />
                          </td>
                          <td className="p-1 text-center sticky right-0 bg-white dark:bg-gray-800 z-10">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("orderAcceptance", index)}
                              disabled={orderAcceptanceArray.fields.length <= 1}
                              className={`h-5 w-5 rounded text-white flex items-center justify-center ${orderAcceptanceArray.fields.length <= 1
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
                <TableHead headers={["S.No", "Particulars", "Accepted Amount", "Revised Amount", "Action"]} />
                <tbody>
                  {taxDetailsArray.fields.map((field, index) => {
                    const isSystemRow = getValues(`taxDetails.${index}.isSystemRow`);
                    const particulars = getValues(`taxDetails.${index}.particulars`);
                    const isReadOnly = isSystemRow || ['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(particulars);

                    const allOptions = listOfValuesData.PARTICULARS || [];

                    let availableOptions = [];
                    if (isSystemRow) {
                      availableOptions = [{ label: particulars, value: particulars }];
                    } else {
                      availableOptions = allOptions.filter(option =>
                        !['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(option.label)
                      );
                    }

                    return (
                      <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
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
                                className={`${controlClasses} h-8 text-xs ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                }}
                                value={field.value || ""}
                              >
                                <option value="">Select Particulars</option>
                                {availableOptions.map((option) => (
                                  <option key={option.value || option.label} value={option.label}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </td>
                        <td className="p-1 align-top">
                          <Controller
                            name={`taxDetails.${index}.acceptedAmount`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={`${controlClasses} h-8 text-xs text-right ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                                disabled={isReadOnly}
                                value={field.value || 0}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0);
                                }}
                              />
                            )}
                          />
                        </td>
                        <td className="p-1 align-top">
                          <Controller
                            name={`taxDetails.${index}.revisedAmount`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={`${controlClasses} h-8 text-xs text-right ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                                disabled={isReadOnly}
                                value={field.value || 0}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0);
                                }}
                              />
                            )}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              handleRemoveItem("taxDetails", index);
                            }}
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

          {/* Tab 3: Terms and Conditions */}
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
                    <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 text-center font-medium dark:text-white text-[10px]">
                        {index + 1}
                      </td>
                      <td className="p-2 align-top">
                        <Controller
                          control={control}
                          name={`attachedPOCopy.${index}.pdfAttached`}
                          render={({ field: { onChange, value } }) => {
                            // Check if there's an existing file from the API response
                            const isExistingFile = value && typeof value === 'object' && value.filePath && !value.name;
                            const isNewFile = value && typeof value === 'object' && value.name && !value.filePath;

                            return (
                              <div className="relative">
                                <div
                                  className={`border-2 border-dashed rounded-md p-2 text-center cursor-pointer transition-colors ${"border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
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
                                    }
                                  }}
                                  onClick={() =>
                                    document.getElementById(`file-input-${field.id}`)?.click()
                                  }
                                >
                                  <input
                                    id={`file-input-${field.id}`}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        onChange(e.target.files[0]);
                                      }
                                    }}
                                  />

                                  {/* Show uploaded file or existing file */}
                                  {(isNewFile || (value && value.name)) ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                                      <File className="h-4 w-4" />
                                      <span className="text-xs truncate max-w-[150px]">
                                        {value?.name || "Uploaded File"}
                                      </span>
                                    </div>
                                  ) : isExistingFile ? (
                                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                                      <File className="h-4 w-4" />
                                      <span className="text-xs truncate max-w-[150px]">
                                        {value?.fileName || "Existing File"}
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
                              </div>
                            );
                          }}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Eye Button - Only show when there's a file */}
                          <Controller
                            control={control}
                            name={`attachedPOCopy.${index}.pdfAttached`}
                            render={({ field: { value } }) => {
                              const hasFile = value && (value.filePath || value.name);
                              return hasFile ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filePath = value?.filePath || value?.name;
                                    if (filePath) {
                                      window.open(filePath, '_blank');
                                    }
                                  }}
                                  className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                  title="View File"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              ) : null;
                            }}
                          />
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("attachedPOCopy", index)}
                            disabled={attachedPOCopyArray.fields.length <= 1}
                            className={`p-1 rounded transition-colors ${attachedPOCopyArray.fields.length <= 1
                              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                              }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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

export default OrderAcceptanceForm;