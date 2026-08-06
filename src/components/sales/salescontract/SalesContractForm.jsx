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
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import branchAPI from "../../../api/branchAPI";
import salesContractAPI from "../../../api/Sales/salesContract";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import currencyAPI from "../../../api/currencyAPI";

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
  oldQuotationNo: "",
  recId: "",

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
      isSystemRow: false,
    },
  ],

  // Charges Summary
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

// Main Component
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
  const isUpdatingRef = useRef(false);

  const LIST_OF_VALUES_GROUPS = {
    PARTICULARS: "Particulars",
  };

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
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

  // Watch for changes
  const customerId = watch("customerId");
  const contactType = watch("contactType");
  const quotNo = watch("quotNo");
  const withQuotation = watch("withQuotation");
  const isIGSTApplicable = watch("isESTApplicable");
  const salesContractDetails = watch("salesContractDetails");

  // Check if contact type is "Direct"
  const isDirectContact = contactType === "Direct";

  // Helper function to check if tax field should be disabled
  const isTaxFieldDisabled = useCallback((rowIndex, fieldName) => {
    const rowTaxType = getValues(`salesContractDetails.${rowIndex}.taxType`) ||
      (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

    if (rowTaxType === "IGST") {
      return fieldName.includes('sgst') || fieldName.includes('cgst');
    } else if (rowTaxType === "SGST") {
      return fieldName.includes('igst');
    }
    return false;
  }, [getValues, isIGSTApplicable]);

  // Helper function to check if a column should be visible
  const shouldShowColumn = useCallback((rowIndex, columnType) => {
    const rowTaxType = getValues(`salesContractDetails.${rowIndex}.taxType`) ||
      (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

    if (columnType === 'igst') {
      return rowTaxType === "IGST";
    } else if (columnType === 'sgst' || columnType === 'cgst') {
      return rowTaxType === "SGST";
    }
    return true;
  }, [getValues, isIGSTApplicable]);

  // Function to calculate tax details
  const calculateTaxDetails = useCallback(() => {
    // Get all contract details
    const contractDetails = getValues('salesContractDetails') || [];

    // Calculate total amount (sum of all amounts in contract details)
    const totalAmount = contractDetails.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Determine tax type
    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

    // Calculate tax amounts
    let sgstTotal = 0, cgstTotal = 0, igstTotal = 0;

    contractDetails.forEach(item => {
      sgstTotal += Number(item.sgstAmount) || 0;
      cgstTotal += Number(item.cgstAmount) || 0;
      igstTotal += Number(item.igstAmount) || 0;
    });

    // Get existing tax details to preserve user-added rows
    const existingTaxDetails = getValues('taxDetails') || [];
    const userAddedRows = existingTaxDetails.filter(item => !item.isSystemRow);

    // Prepare tax details entries - system calculated rows
    const systemRows = [];

    // Always add Gross Amount
    systemRows.push({
      particulars: "Gross Amount",
      amount: totalAmount,
      isSystemRow: true
    });

    // Add appropriate tax based on tax type
    if (taxType === "IGST") {
      systemRows.push({
        particulars: "IGST",
        amount: igstTotal,
        isSystemRow: true
      });
    } else {
      systemRows.push({
        particulars: "SGST",
        amount: sgstTotal,
        isSystemRow: true
      });
      systemRows.push({
        particulars: "CGST",
        amount: cgstTotal,
        isSystemRow: true
      });
    }

    // Combine system rows with user-added rows
    const allTaxEntries = [...systemRows, ...userAddedRows];

    // Replace all tax details with the combined list
    taxDetailsArray.replace(allTaxEntries);

    // Update Charges Summary Total Amount with Gross Amount
    setValue('chargesSummary.totalAmount', totalAmount);

    // Update Amount In Words
    const amountInWords = formatCurrencyInWords(totalAmount);
    setValue('chargesSummary.amountInWords', amountInWords);

  }, [getValues, isIGSTApplicable, taxDetailsArray, setValue]);

  const loadListOfValuesData = async () => {
    try {
      const result = {};

      await Promise.all(
        Object.entries(LIST_OF_VALUES_GROUPS).map(async ([key, group]) => {
          try {
            const response = await listOfValuesAPI.getListValuesGroup(group, orgId);

            // Check if response has the expected structure
            let items = [];
            if (response?.paramObjectsMap?.listValues) {
              items = response.paramObjectsMap.listValues;
            } else if (Array.isArray(response)) {
              items = response;
            }

            result[key] = items.map(item => ({
              value: item.id,
              label: item.valuesDescription,
              ...item,
            }));
          } catch (err) {
            console.error(`${group} failed`, err);
            result[key] = [];
          }
        })
      );

      setListOfValuesData(result);

      // After loading list of values, calculate tax details
      if (salesContractArray.fields.length > 0) {
        setTimeout(() => {
          calculateTaxDetails();
        }, 200);
      }
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  };

  // Add this helper function at the top of your file, after the imports
  const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    const convertHundreds = (num) => {
      let word = '';
      if (num >= 100) {
        word += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num >= 20) {
        word += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      }
      if (num > 0) {
        word += ones[num] + ' ';
      }
      return word.trim();
    };

    const convertNumber = (num) => {
      if (num === 0) return '';

      let word = '';
      let index = 0;

      while (num > 0) {
        if (num % 1000 !== 0) {
          word = convertHundreds(num % 1000) + ' ' + thousands[index] + ' ' + word;
        }
        num = Math.floor(num / 1000);
        index++;
      }
      return word.trim();
    };

    // Handle decimal part
    const parts = String(num).split('.');
    const wholeNumber = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, '0')) : 0;

    let result = convertNumber(wholeNumber);

    if (decimalPart > 0) {
      result += ' and ' + convertNumber(decimalPart) + ' Paise';
    }

    return result || 'Zero';
  };

  // Function to format currency in words with proper capitalization
  const formatCurrencyInWords = (amount) => {
    if (!amount || amount === 0) return 'Zero';

    const roundedAmount = Math.round(amount * 100) / 100;
    const words = numberToWords(roundedAmount);

    // Capitalize first letter of each word
    return words.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Real-time calculation effect
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name || isUpdatingRef.current) return;

      // Check if the changed field is in salesContractDetails
      if (name.startsWith('salesContractDetails.')) {
        const parts = name.split('.');
        const index = parseInt(parts[1]);
        const field = parts[2];

        // Only recalculate if the changed field is one that affects calculations
        const calculationFields = ['qty', 'orderRate', 'discountPercent', 'itemCode', 'taxType'];
        if (!calculationFields.includes(field) && !field.includes('Rate') && !field.includes('Amount')) {
          return;
        }

        // Get all values for this row
        const qty = Number(getValues(`salesContractDetails.${index}.qty`)) || 0;
        const orderRate = Number(getValues(`salesContractDetails.${index}.orderRate`)) || 0;
        const discountPercent = Number(getValues(`salesContractDetails.${index}.discountPercent`)) || 0;
        const itemCode = getValues(`salesContractDetails.${index}.itemCode`);
        const taxType = getValues(`salesContractDetails.${index}.taxType`) || (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

        // Calculate discount amount
        const amountBeforeDiscount = qty * orderRate;
        const discountAmount = (amountBeforeDiscount * discountPercent) / 100;
        const amount = amountBeforeDiscount - discountAmount;

        // Get tax rates from the selected item
        let sgstRate = 0, cgstRate = 0, igstRate = 0;
        if (itemCode) {
          const selectedItem = itemOptions.find(i => String(i.itemCode) === String(itemCode));
          if (selectedItem) {
            sgstRate = Number(selectedItem.sgst) || 0;
            cgstRate = Number(selectedItem.cgst) || 0;
            igstRate = Number(selectedItem.igst) || 0;
          }
        }

        // Calculate tax amounts based on tax type
        let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
        const finalAmount = amount;

        if (taxType === "IGST") {
          igstAmount = (finalAmount * igstRate) / 100;
          sgstAmount = 0;
          cgstAmount = 0;
        } else if (taxType === "SGST") {
          sgstAmount = (finalAmount * sgstRate) / 100;
          cgstAmount = (finalAmount * cgstRate) / 100;
          igstAmount = 0;
        }

        // Check current values to avoid unnecessary updates
        const currentDiscountAmount = Number(getValues(`salesContractDetails.${index}.discountAmount`)) || 0;
        const currentAmount = Number(getValues(`salesContractDetails.${index}.amount`)) || 0;
        const currentSgstAmount = Number(getValues(`salesContractDetails.${index}.sgstAmount`)) || 0;
        const currentCgstAmount = Number(getValues(`salesContractDetails.${index}.cgstAmount`)) || 0;
        const currentIgstAmount = Number(getValues(`salesContractDetails.${index}.igstAmount`)) || 0;
        const currentSgstRate = Number(getValues(`salesContractDetails.${index}.sgstRate`)) || 0;
        const currentCgstRate = Number(getValues(`salesContractDetails.${index}.cgstRate`)) || 0;
        const currentIgstRate = Number(getValues(`salesContractDetails.${index}.igstRate`)) || 0;

        isUpdatingRef.current = true;

        // Update only if values have changed
        if (Math.abs(currentDiscountAmount - discountAmount) > 0.001) {
          setValue(`salesContractDetails.${index}.discountAmount`, discountAmount);
        }

        if (Math.abs(currentAmount - finalAmount) > 0.001) {
          setValue(`salesContractDetails.${index}.amount`, finalAmount);
        }

        if (Math.abs(currentSgstAmount - sgstAmount) > 0.001) {
          setValue(`salesContractDetails.${index}.sgstAmount`, sgstAmount);
        }

        if (Math.abs(currentCgstAmount - cgstAmount) > 0.001) {
          setValue(`salesContractDetails.${index}.cgstAmount`, cgstAmount);
        }

        if (Math.abs(currentIgstAmount - igstAmount) > 0.001) {
          setValue(`salesContractDetails.${index}.igstAmount`, igstAmount);
        }

        if (Math.abs(currentSgstRate - sgstRate) > 0.001) {
          setValue(`salesContractDetails.${index}.sgstRate`, sgstRate);
        }

        if (Math.abs(currentCgstRate - cgstRate) > 0.001) {
          setValue(`salesContractDetails.${index}.cgstRate`, cgstRate);
        }

        if (Math.abs(currentIgstRate - igstRate) > 0.001) {
          setValue(`salesContractDetails.${index}.igstRate`, igstRate);
        }

        // Update tax details after calculations
        setTimeout(() => {
          calculateTaxDetails();
        }, 100);

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues, itemOptions, isIGSTApplicable, calculateTaxDetails]);

  useEffect(() => {
    loadBranches();
    if (isEditMode && data) {
      loadQuotations();
    }
    loadCurrencies();
    loadListOfValuesData();
  }, []);

  useEffect(() => {
    if (orgId && contactType) {
      loadCustomers(contactType);
    }
  }, [orgId, contactType]);

  // Load quotations when customerId or contactType changes
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

  // Load items when quotNo or withQuotation changes
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

  // Auto-fill customer details when customerId changes
  useEffect(() => {
    if (customerId && customerOptions.length > 0) {
      const customer = customerOptions.find(
        (c) => String(c.customerId) === String(customerId)
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

  // Auto-fill quotation date when quotNo changes
  useEffect(() => {
    if (quotNo && quotationOptions.length > 0 && !isDirectContact) {
      const selectedQuotation = quotationOptions.find(
        (q) => String(q.quotationNo) === String(quotNo)
      );
      if (selectedQuotation) {
        setValue("quotDate", selectedQuotation.quotationDate || "");
      }
    }
  }, [quotNo, quotationOptions, setValue, isDirectContact]);

  // Set tax type based on IGST applicability and recalculate tax details
  useEffect(() => {
    const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

    salesContractArray.fields.forEach((_, index) => {
      setValue(`salesContractDetails.${index}.taxType`, taxType);
    });

    // Recalculate tax details when tax type changes
    if (salesContractArray.fields.length > 0) {
      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    }
  }, [isIGSTApplicable, salesContractArray.fields.length, setValue, calculateTaxDetails]);

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

  const loadCustomers = useCallback(async (contactTypeParam) => {
    const effectiveContactType = contactTypeParam || contactType;

    if (!orgId || !branchId || !effectiveContactType) {
      console.log("Cannot load customers - missing params:", {
        orgId,
        branchId,
        effectiveContactType
      });
      return;
    }

    setLoadingCustomer(true);

    try {
      const response = await salesContractAPI.getCustomerDropdown(
        orgId,
        branchId,
        effectiveContactType
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
  }, [orgId, branchId, contactType]);

  const loadQuotations = useCallback(async () => {
    if (!orgId || !branchId || !customerId || !contactType) {
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
        contactType,
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
  }, [orgId, branchId, customerId, contactType, customerOptions, isEditMode, data]);

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

        if (items.length > 0 && salesContractArray.fields.length === 1) {
          const firstItem = items[0];
          const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";

          isUpdatingRef.current = true;

          setValue("salesContractDetails.0.itemCode", firstItem.itemCode || "");
          setValue("salesContractDetails.0.itemDescription", firstItem.itemDescription || "");
          setValue("salesContractDetails.0.hsCode", firstItem.hsnCode || "");
          setValue("salesContractDetails.0.customerPartNo", firstItem.customerPartNo || "");
          setValue("salesContractDetails.0.unit", firstItem.unitId || "");
          setValue("salesContractDetails.0.taxType", taxType);

          // Set tax rates from API
          setValue("salesContractDetails.0.sgstRate", Number(firstItem.sgst) || 0);
          setValue("salesContractDetails.0.cgstRate", Number(firstItem.cgst) || 0);
          setValue("salesContractDetails.0.igstRate", Number(firstItem.igst) || 0);

          // Set Tax % from API rate field
          setValue("salesContractDetails.0.taxRs", Number(firstItem.rate) || 0);

          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 50);
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
  }, [orgId, branchId, salesContractArray.fields.length, setValue, isIGSTApplicable]);

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

  const handleItemSelect = useCallback((index, itemCode) => {
    const selectedItem = itemOptions.find(
      item => String(item.itemCode) === String(itemCode)
    );

    if (selectedItem) {
      isUpdatingRef.current = true;

      setValue(`salesContractDetails.${index}.itemCode`, selectedItem.itemCode || "");
      setValue(`salesContractDetails.${index}.itemDescription`, selectedItem.itemDescription || "");
      setValue(`salesContractDetails.${index}.hsCode`, selectedItem.hsnCode || "");
      setValue(`salesContractDetails.${index}.customerPartNo`, selectedItem.customerPartNo || "");
      setValue(`salesContractDetails.${index}.unit`, selectedItem.unit || selectedItem.unitName || "");

      // Set tax rates
      const sgstRate = Number(selectedItem.sgst) || 0;
      const cgstRate = Number(selectedItem.cgst) || 0;
      const igstRate = Number(selectedItem.igst) || 0;

      setValue(`salesContractDetails.${index}.sgstRate`, sgstRate);
      setValue(`salesContractDetails.${index}.cgstRate`, cgstRate);
      setValue(`salesContractDetails.${index}.igstRate`, igstRate);

      // Set Tax % from API rate field
      setValue(`salesContractDetails.${index}.taxRs`, Number(selectedItem.rate) || 0);

      // Set tax type based on IGST applicability
      const taxType = isIGSTApplicable === "Yes" ? "IGST" : "SGST";
      setValue(`salesContractDetails.${index}.taxType`, taxType);

      setTimeout(() => {
        isUpdatingRef.current = false;
        // Trigger calculation with existing order rate (if any)
        const qty = Number(getValues(`salesContractDetails.${index}.qty`)) || 0;
        const orderRate = Number(getValues(`salesContractDetails.${index}.orderRate`)) || 0;
        const discountPercent = Number(getValues(`salesContractDetails.${index}.discountPercent`)) || 0;

        const amountBeforeDiscount = qty * orderRate;
        const discountAmount = (amountBeforeDiscount * discountPercent) / 100;
        const amount = amountBeforeDiscount - discountAmount;

        setValue(`salesContractDetails.${index}.discountAmount`, discountAmount);
        setValue(`salesContractDetails.${index}.amount`, amount);

        // Calculate tax amounts
        let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
        if (taxType === "IGST") {
          igstAmount = (amount * igstRate) / 100;
        } else {
          sgstAmount = (amount * sgstRate) / 100;
          cgstAmount = (amount * cgstRate) / 100;
        }

        setValue(`salesContractDetails.${index}.sgstAmount`, sgstAmount);
        setValue(`salesContractDetails.${index}.cgstAmount`, cgstAmount);
        setValue(`salesContractDetails.${index}.igstAmount`, igstAmount);

        // Update tax details
        setTimeout(() => {
          calculateTaxDetails();
        }, 100);
      }, 100);
    }
  }, [itemOptions, setValue, getValues, isIGSTApplicable, calculateTaxDetails]);

  const handleAddItem = (arrayName) => {
    const defaultValues = getDefaultValues();
    if (arrayName === "salesContract") {
      const newItem = defaultValues.salesContractDetails[0] || {};
      salesContractArray.append(newItem);
      // Recalculate tax details after adding new row
      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    } else if (arrayName === "taxDetails") {
      // Add a new user row with empty particulars
      const newItem = {
        particulars: "",
        amount: 0.0,
        isSystemRow: false
      };
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
        // Recalculate tax details after removing row
        setTimeout(() => {
          calculateTaxDetails();
        }, 100);
      }
    } else if (arrayName === "taxDetails") {
      // Check if it's a system row
      const isSystemRow = getValues(`taxDetails.${index}.isSystemRow`);
      if (isSystemRow) {
        // Prevent deletion of system rows
        alert('Cannot delete system calculated rows');
        return;
      }
      // Allow deletion of user-added rows even if it's the only one
      taxDetailsArray.remove(index);
      // Recalculate tax details to update totals
      setTimeout(() => {
        calculateTaxDetails();
      }, 100);
    } else if (arrayName === "attachedPOCopy") {
      if (attachedPOCopyArray.fields.length > 1) {
        attachedPOCopyArray.remove(index);
      }
    }
  };

  const handleTaxTypeChange = useCallback((index, newTaxType) => {
    isUpdatingRef.current = true;
    setValue(`salesContractDetails.${index}.taxType`, newTaxType);

    // Trigger recalculation
    setTimeout(() => {
      const qty = Number(getValues(`salesContractDetails.${index}.qty`)) || 0;
      const orderRate = Number(getValues(`salesContractDetails.${index}.orderRate`)) || 0;
      const discountPercent = Number(getValues(`salesContractDetails.${index}.discountPercent`)) || 0;
      const itemCode = getValues(`salesContractDetails.${index}.itemCode`);

      if (itemCode) {
        const selectedItem = itemOptions.find(i => String(i.itemCode) === String(itemCode));
        if (selectedItem) {
          const sgstRate = Number(selectedItem.sgst) || 0;
          const cgstRate = Number(selectedItem.cgst) || 0;
          const igstRate = Number(selectedItem.igst) || 0;

          const amountBeforeDiscount = qty * orderRate;
          const discountAmount = (amountBeforeDiscount * discountPercent) / 100;
          const amount = amountBeforeDiscount - discountAmount;

          let sgstAmount = 0, cgstAmount = 0, igstAmount = 0;
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

          // Update tax details
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

  const onSubmit = async (formData) => {
    try {
      const submitData = {
        ...formData,
        customerDetails: selectedCustomer,
        isEditMode,
      };
      console.log("Sales Contract Data:", submitData, "Org Id:", orgId);
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
            options={plantData}
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
            options={customerOptions.map(c => ({
              value: c.customerId,
              label: `${c.customerCode} - ${c.customerName}`
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
          <SelectField
            control={control}
            name="quotNo"
            label="Quot. No."
            options={quotationOptions.map(q => ({
              value: q.quotationNo,
              label: `${q.quotationNo} - ${q.quotationDate}`
            }))}
            errors={errors}
            disabled={isDirectContact || !customerId || loadingQuotation || withQuotation === "No"}
          />
          <InputField
            control={control}
            type="date"
            name="quotDate"
            label="Quot. Date"
            errors={errors}
            disabled={isDirectContact || !customerId || withQuotation === "No"}
          />
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

        {/* Tabs Section */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("salesContract")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === "salesContract"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Contract Detail
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
              onClick={() => setActiveTab("chargesSummary")}
              className={`px-4 py-1 text-xs font-semibold rounded-t capitalize ${activeTab === "chargesSummary"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Charges Summary
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
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[80px]">Qty</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">Quot. Rate</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">Order Rate *</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[90px]">Discount %</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[110px]">Effective From</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">Effective To</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[120px]">Discount Amount</th>
                      <th className="p-1.5 text-left dark:text-white whitespace-nowrap text-[10px] font-medium min-w-[100px]">Amount</th>
                      {/* Conditionally show/hide columns based on tax type */}
                      {salesContractArray.fields.map((field, idx) => {
                        const rowTaxType = getValues(`salesContractDetails.${idx}.taxType`) ||
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
                    {salesContractArray.fields.map((field, index) => {
                      const rowTaxType = getValues(`salesContractDetails.${index}.taxType`) ||
                        (isIGSTApplicable === "Yes" ? "IGST" : "SGST");

                      return (
                        <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-1 text-center font-medium dark:text-white text-[10px] sticky left-0 bg-white dark:bg-gray-800 z-10">
                            {index + 1}
                          </td>
                          <td className="p-0.5 align-top min-w-[100px]">
                            <SelectCell
                              control={control}
                              name={`salesContractDetails.${index}.itemCode`}
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
                          <td className="p-0.5 align-top min-w-[90px]">
                            <InputCell
                              control={control}
                              name={`salesContractDetails.${index}.quotRate`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              errors={errors}
                            />
                          </td>
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
                          {/* Conditionally render tax columns based on tax type */}
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
                              placeholder="Currency"
                              errors={errors}
                            />
                          </td>
                          <td className="p-1 text-center sticky right-0 bg-white dark:bg-gray-800 z-10">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem("salesContract", index)}
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
                <TableHead headers={["S.No", "Particulars", "Amount", "Action"]} />
                <tbody>
                  {taxDetailsArray.fields.map((field, index) => {
                    // Check if this is a system calculated field (should be read-only)
                    const isSystemRow = getValues(`taxDetails.${index}.isSystemRow`);
                    const particulars = getValues(`taxDetails.${index}.particulars`);
                    const isReadOnly = isSystemRow || ['Gross Amount', 'IGST', 'CGST', 'SGST'].includes(particulars);

                    return (
                      <tr key={field.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-1 text-center font-medium dark:text-white text-[10px]">
                          {index + 1}
                        </td>
                        <td className="p-1 align-top">
                          <Controller
                            name={`taxDetails.${index}.particulars`}
                            control={control}
                            render={({ field }) => {
                              // Get all available options from listOfValuesData
                              const allOptions = listOfValuesData.PARTICULARS || [];

                              // Filter options based on row type
                              let availableOptions = [];
                              if (isSystemRow) {
                                // For system rows, only show their specific value
                                availableOptions = [{ label: particulars, value: particulars }];
                              } else {
                                // For user-added rows, show all options
                                availableOptions = allOptions;
                              }

                              return (
                                <select
                                  {...field}
                                  className={`${controlClasses} h-8 text-xs ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                                  disabled={isReadOnly}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                >
                                  <option value="">Select Particulars</option>
                                  {availableOptions.map((option) => (
                                    <option key={option.value || option.label} value={option.label}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              );
                            }}
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
                                className={`${controlClasses} h-8 text-xs text-right ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                                disabled={isReadOnly}
                              />
                            )}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("taxDetails", index)}
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