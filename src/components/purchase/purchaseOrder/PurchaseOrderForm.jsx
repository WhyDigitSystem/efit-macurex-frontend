import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  UploadCloud,
  Eye,
  File as FileIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import currencyAPI from "../../../api/currencyAPI";
import itemAPI from "../../../api/itemAPI";
import taxDefinitionAPI from "../../../api/taxDefinitionAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import purchaseOrderAPI from "../../../api/Purchase/purchaseOrderAPI";
import purchaseIndentAPI from "../../../api/Purchase/purchaseIndentAPI";
import { useToast } from "../../Toast/ToastContext";
import countryAPI from "../../../api/countryAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

/* ========================================================================= */
/* DESIGN TOKENS                                                             */
/* ========================================================================= */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  const number = parseInt(value, 10);

  return Number.isFinite(number) ? number : fallback;
};

const round2 = (value) => {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
};

const money = (value) => {
  return round2(value).toFixed(2);
};

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ========================================================================= */
/* FIELD COMPONENT                                                           */
/* ========================================================================= */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  disabled,
  className = "",
  step,
  min,
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <select
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? "border-red-500" : ""}`}
        >
          <option value="">-- Select --</option>

          {(options || []).map((opt) => (
            <option
              key={typeof opt === "object" ? opt.value : opt}
              value={typeof opt === "object" ? opt.value : opt}
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          rows={3}
          disabled={disabled}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-y " +
            "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
            "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        step={step}
        min={min}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? "border-red-500" : ""}`}
      />

      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

/* ========================================================================= */
/* TABLE COMPONENTS                                                          */
/* ========================================================================= */

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full text-xs min-w-max">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((header, index) => (
        <th
          key={index}
          className={`p-1.5 whitespace-nowrap text-[10px] font-medium dark:text-white ${
            index === 0 ? "w-8 text-center" : "text-left"
          }`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-1 text-center font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>

    {children}

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
  </tr>
);

const SelectCell = ({ value, onChange, options, disabled = false }) => (
  <td className="p-0.5 align-top min-w-[130px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className={cellInputClasses}
    >
      <option value="">Select</option>

      {(options || []).map((opt) => (
        <option
          key={typeof opt === "object" ? opt.value : opt}
          value={typeof opt === "object" ? opt.value : opt}
        >
          {typeof opt === "object" ? opt.label : opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({
  value,
  onChange,
  type = "text",
  disabled,
  minWidth = "100px",
  min,
  step,
}) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      min={min}
      step={step}
      className={cellInputClasses}
    />
  </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead
      headers={["#", ...columns.map((column) => column.label), "Action"]}
    />

    <tbody>
      {rows.map((row, index) => (
        <TableRow
          key={index}
          index={index}
          onRemove={() => onRemoveRow(index)}
          disabled={rows.length <= 1}
        >
          {columns.map((column) =>
            column.type === "select" ? (
              <SelectCell
                key={column.key}
                value={row[column.key]}
                disabled={column.disabled}
                onChange={(event) =>
                  onCellChange(index, column.key, event.target.value)
                }
                options={column.options}
              />
            ) : (
              <InputCell
                key={column.key}
                value={row[column.key]}
                type={
                  column.type === "number"
                    ? "number"
                    : column.type === "date"
                      ? "date"
                      : "text"
                }
                disabled={column.disabled}
                min={column.type === "number" ? 0 : undefined}
                step={
                  column.type === "number" ? column.step || "0.01" : undefined
                }
                onChange={(event) =>
                  onCellChange(index, column.key, event.target.value)
                }
              />
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* STATIC OPTIONS                                                            */
/* ========================================================================= */

const PTYPE_OPTIONS = ["Local", "Import"];

const BELONGS_TO = ["Domestic", "Import"];

const YES_NO = ["Yes", "No"];

const TAX_TYPES = ["GST", "IGST", "EXEMPT"];

const UNITS = [
  {
    value: 1000000004,
    label: "NOS",
  },
  {
    value: 1000000005,
    label: "KG",
  },
];

const INCOTERMS = ["FOB", "CIF", "CFR", "EXW", "DDP", "FOR"];

const PACKING_TYPES = ["Standard", "Wooden Packing", "Carton", "Pallet"];

const SCREEN_CODE_BY_TYPE = {
  Local: "POL",
  Import: "POI",
};

/* ========================================================================= */
/* EMPTY ROWS                                                                */
/* ========================================================================= */

const emptyLocalDetailRow = () => ({
  id: 0,

  item: "",
  indentNo: "",
  indentDate: "",

  indentQty: "",
  pendingIndentQty: "",

  customerPartNo: "",

  hsnCode: "",

  taxType: "",
  taxPercentage: "",

  purchaseUnit: "",
  primaryUnit: "",

  poQtyInPurchaseUnit: "",
  qtyInPrimaryUnit: "",

  rateInInr: "",
  discount: "",

  amountInInr: "",

  deliveryDate: "",
});

const emptyImportDetailRow = () => ({
  id: 0,

  item: "",
  indentNo: "",
  indentDate: "",

  indentQty: "",

  hsnCode: "",
  uom: "",

  orderRate: "",

  fobRateFc: "",
  fobRateInr: "",
  fobValueInr: "",
});

const emptyTaxRow = () => ({
  particulars: "",
  tax: "",
  amount: "",
});

const emptyFileRow = () => ({
  name: "",
  file: null,
  filePath: "",
  isExisting: false,
});

/* ========================================================================= */
/* DEFAULT FORM                                                              */
/* ========================================================================= */

const getDefaultValues = () => ({
  active: true,

  poType: "Local",
  belongsTo: "",

  branch: "",

  orderPlacedDate: todayISO(),

  poNo: "",

  department: "",
  supplierCode: "",

  currency: "",

  exchangeRate: 1,

  financialYear: String(new Date().getFullYear()),

  countryOfOrigin: "",

  indentRequired: "Yes",

  isIgstApplicable: "No",

  isReverseCharge: "No",

  itemType: "",

  shipMode: "",

  modeOfDespatch: "",

  incoterm: "",

  foreCloseNo: "",

  portOfLoading: "",
  portOfDischarge: "",

  freight: "",
  freightFc: 0,
  freightInr: 0,
  freightType: "",

  insurance: "",
  insuranceFc: 0,
  insuranceInr: 0,

  packingCharges: 0,
  packingType: "",

  bankCharges: 0,

  surCharges: 0,

  otherChargesFc: 0,
  otherChargesInr: 0,

  totalFobValueFc: 0,
  totalFobValueInr: 0,

  totalPoValueFc: 0,
  totalPoValueInr: 0,

  lmeRate: 0,

  paymentTerms: "",
  deliveryTerms: "",

  termsAndConditions: "",
  notes: "",
  remarks: "",

  amountInWord: "",

  preparedBy: "",
  checkedBy: "",
  authorisedBy: "",

  cancelRemarks: "",
});

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const PurchaseOrderForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));

  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  /* ----------------------------------------------------------------------- */
  /* FORM STATE                                                              */
  /* ----------------------------------------------------------------------- */

  const [formData, setFormData] = useState(() => ({
    ...getDefaultValues(),
    ...(editData || {}),
  }));

  const [localDetailRows, setLocalDetailRows] = useState(
    editData?.purchaseOrderLocalDetailsDTO?.length
      ? editData.purchaseOrderLocalDetailsDTO
      : [emptyLocalDetailRow()],
  );

  const [importDetailRows, setImportDetailRows] = useState(
    editData?.purchaseOrderImportDetailsDTO?.length
      ? editData.purchaseOrderImportDetailsDTO
      : [emptyImportDetailRow()],
  );

  const [taxRows, setTaxRows] = useState(
    editData?.purchaseOrderLocalTaxDetailsDTO?.length
      ? editData.purchaseOrderLocalTaxDetailsDTO
      : [emptyTaxRow()],
  );

  const [fileRows, setFileRows] = useState(
    editData?.purchaseOrderLocalFileUploadDetailsDTO?.length
      ? editData.purchaseOrderLocalFileUploadDetailsDTO.map((file) => ({
          name: file.name || file.fileName || "",
          file: null,
          filePath: file.filePath || "",
          id: file.id,
          isExisting: true,
        }))
      : [emptyFileRow()],
  );

  /* ----------------------------------------------------------------------- */
  /* MASTER DATA                                                             */
  /* ----------------------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState("poDetail");

  const [branchOptions, setBranchOptions] = useState([]);

  const [currencyOptions, setCurrencyOptions] = useState([]);

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [supplierOptions, setSupplierOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  const [taxDefinitionOptions, setTaxDefinitionOptions] = useState([]);

  const [indentItemOptions, setIndentItemOptions] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [countryOptions, setCountryOptions] = useState([]);

  const [shipModeOptions, setShipModeOptions] = useState([]);

  const isLocal = formData.poType === "Local";

  /* ========================================================================= */
  /* MASTER DATA LOADERS                                                       */
  /* ========================================================================= */

  const loadCountries = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await countryAPI.getCountries(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.countryVO ||
          response?.paramObjectsMap?.countries ||
          [];

      console.log("Country API Response:", response);
      console.log("Countries:", list);

      setCountryOptions(
        list.map((country) => ({
          value: country.id,
          label:
            country.countryName ||
            country.name ||
            country.country ||
            country.countryCode ||
            `Country ${country.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load countries:", error);

      setCountryOptions([]);
    }
  }, [ORG_ID]);

  const loadShipModes = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "SHIP MODE",
        ORG_ID,
      );

      const list = Array.isArray(response) ? response : [];

      console.log("Ship Mode API Response:", response);
      console.log("Ship Modes:", list);

      setShipModeOptions(
        list.map((item) => ({
          value: item.id,
          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",
        })),
      );
    } catch (error) {
      console.error("Failed to load ship modes:", error);

      setShipModeOptions([]);
    }
  }, [ORG_ID]);

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await branchAPI.getBranchByOrgId(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.branches ||
          response?.paramObjectsMap?.branchVO ||
          [];

      setBranchOptions(
        list.map((branch) => ({
          value: branch.id,
          label:
            branch.branchName ||
            branch.name ||
            branch.branchCode ||
            `Branch ${branch.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load branches:", error);

      setBranchOptions([]);
    }
  }, [ORG_ID]);

  const loadCurrencies = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await currencyAPI.getCurrencies(ORG_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.currencyVO ||
          response?.paramObjectsMap?.currencies ||
          [];

      setCurrencyOptions(
        list.map((currency) => ({
          value: currency.id,
          label:
            currency.currency ||
            currency.currencyName ||
            currency.code ||
            `Currency ${currency.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load currencies:", error);

      setCurrencyOptions([]);
    }
  }, [ORG_ID]);

  const loadDepartments = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await departmentAPI.getAllDepartments(ORG_ID, BRANCH_ID);

      const list =
        response?.paramObjectsMap?.departmentVO ||
        response?.paramObjectsMap?.departmentMasterVO ||
        response?.paramObjectsMap?.departments ||
        (Array.isArray(response) ? response : []);

      setDepartmentOptions(
        list.map((department) => ({
          value: department.id,
          label:
            department.departmentName ||
            department.name ||
            `Dept ${department.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load departments:", error);

      setDepartmentOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadItemOptions = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await itemAPI.getItems(ORG_ID, BRANCH_ID);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.items ||
          response?.paramObjectsMap?.itemMasterVO ||
          [];

      setItemOptions(
        list.map((item) => ({
          value: item.id,

          label: item.itemCode || item.code || `Item ${item.id}`,

          itemDescription: item.itemDescription || item.description || "",

          hsnCode: item.hsnCode || item.hsnSacCode || item.hsn || "",

          unit:
            item.primaryUnits?.id ||
            item.primaryUnit?.id ||
            item.unit?.id ||
            item.primaryUnit ||
            "",
        })),
      );
    } catch (error) {
      console.error("Failed to load items:", error);

      setItemOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadTaxDefinitions = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await taxDefinitionAPI.getTaxDefinitionByOrgId(
        BRANCH_ID,
        ORG_ID,
      );

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.taxDefinitionVO ||
          response?.paramObjectsMap?.taxDefinitions ||
          [];

      setTaxDefinitionOptions(
        list.map((tax) => ({
          value: tax.id,

          label:
            tax.taxName ||
            tax.particulars ||
            tax.description ||
            `Tax ${tax.id}`,

          percentage: toNumber(
            tax.taxPercentage ?? tax.percentage ?? tax.tax ?? 0,
          ),
        })),
      );
    } catch (error) {
      console.error("Failed to load tax definitions:", error);

      setTaxDefinitionOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  const loadSuppliers = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await purchaseOrderAPI.getSupplierDetails(
        ORG_ID,
        BRANCH_ID,
      );

      const list =
        response?.paramObjectsMap?.mapp ||
        response?.paramObjectsMap?.supplierVO ||
        response?.paramObjectsMap?.suppliers ||
        [];

      setSupplierOptions(
        list.map((supplier) => ({
          value: supplier.supplierId || supplier.id,

          label: `${supplier.supplierCode || ""} - ${
            supplier.supplierName || ""
          }`,

          supplierName: supplier.supplierName || "",

          supplierCode: supplier.supplierCode || "",

          address: supplier.address || "",

          stateName: supplier.stateName || "",

          pinCode: supplier.pinCode || "",

          gstNo: supplier.gstNo || "",

          isRegistered:
            supplier.isRegistered === true || supplier.isRegistered === "true",
        })),
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);

      setSupplierOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  /*
   * Loads the Indent No. dropdown for the PO Local Details grid via
   * GET /api/purchaseservice/getPurchaseIndentItemDropdown?branch=&orgId=
   *
   * Each returned row (itemId, itemCode, itemDescription, purchaseUnit,
   * primaryUnit) is stored as an option. itemId is used as both the value
   * and the label shown to the user (so the dropdown displays the Indent
   * item's id), while itemCode/itemDescription/units are kept on the
   * option for auto-filling the row when selected.
   */
  const loadIndentItemOptions = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await purchaseIndentAPI.getPurchaseIndentItemDropdown(
        BRANCH_ID,
        ORG_ID,
      );

      const list = response?.paramObjectsMap?.itemDropdown || [];

      setIndentItemOptions(
        list.map((row) => ({
          value: row.itemId,

          label: row.itemId != null ? String(row.itemId) : "",

          itemCode: row.itemCode || "",

          itemDescription: row.itemDescription || "",

          purchaseUnit: row.purchaseUnit || "",

          primaryUnit: row.primaryUnit || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load purchase indent item dropdown:", error);

      setIndentItemOptions([]);
    }
  }, [ORG_ID, BRANCH_ID]);

  useEffect(() => {
    loadBranches();
    loadCurrencies();
    loadDepartments();
    loadItemOptions();
    loadTaxDefinitions();
    loadSuppliers();
    loadIndentItemOptions();
    loadCountries();
    loadShipModes();
  }, [
    loadBranches,
    loadCurrencies,
    loadDepartments,
    loadItemOptions,
    loadTaxDefinitions,
    loadSuppliers,
    loadIndentItemOptions,
    loadCountries,
    loadShipModes,
  ]);

  /* ========================================================================= */
  /* DOCUMENT NUMBER                                                           */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const screenCode = SCREEN_CODE_BY_TYPE[formData.poType] || "POL";

        const docId = await purchaseOrderAPI.getPurchaseOrderDocId({
          financialYear: formData.financialYear,

          orgId: ORG_ID,

          screenCode,

          type: formData.poType,
        });

        if (!cancelled) {
          setFormData((previous) => ({
            ...previous,
            poNo: docId || "",
          }));

          if (!docId) {
            addToast("Failed to generate P.O. No", "error");
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating PO doc id:", error);

          addToast("Failed to generate P.O. No", "error");
        }
      } finally {
        if (!cancelled) {
          setGeneratingDocId(false);
        }
      }
    };

    generateDocId();

    return () => {
      cancelled = true;
    };

    // Deliberately generate when PO type changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.poType, isEditMode]);

  /* ========================================================================= */
  /* FIELD CHANGE                                                              */
  /* ========================================================================= */

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (name === "supplierCode") {
      const selected = supplierOptions.find(
        (option) => String(option.value) === String(value),
      );

      setFormData((previous) => ({
        ...previous,

        supplierCode: value,

        gstnNo: selected?.gstNo || previous.gstnNo || "",

        isIgstApplicable: selected?.isRegistered
          ? "Yes"
          : previous.isIgstApplicable,
      }));

      return;
    }

    if (name === "poType") {
      setFormData((previous) => ({
        ...previous,
        poType: value,

        // Import needs currency.
        // Local does not.
        currency: value === "Local" ? previous.currency : previous.currency,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================================================= */
  /* ROW MANAGEMENT                                                            */
  /* ========================================================================= */

  const addLocalRow = () => {
    setLocalDetailRows((previous) => [...previous, emptyLocalDetailRow()]);
  };

  const removeLocalRow = (index) => {
    setLocalDetailRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const addImportRow = () => {
    setImportDetailRows((previous) => [...previous, emptyImportDetailRow()]);
  };

  const removeImportRow = (index) => {
    setImportDetailRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const addTaxRow = () => {
    setTaxRows((previous) => [...previous, emptyTaxRow()]);
  };

  const removeTaxRow = (index) => {
    setTaxRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  /* ========================================================================= */
  /* LOCAL DETAIL CALCULATION                                                  */
  /* ========================================================================= */

  const calculateLocalRow = (row, changedKey, changedValue) => {
    let updated = {
      ...row,
      [changedKey]: changedValue,
    };

    /* Item auto-fill */
    if (changedKey === "item") {
      const selectedItem = itemOptions.find(
        (item) => String(item.value) === String(changedValue),
      );

      if (selectedItem) {
        updated.itemDescription = selectedItem.itemDescription || "";

        updated.hsnCode = selectedItem.hsnCode || updated.hsnCode || "";

        updated.purchaseUnit = selectedItem.unit || updated.purchaseUnit || "";

        updated.primaryUnit = selectedItem.unit || updated.primaryUnit || "";
      }
    }

    /*
     * Indent No. auto-fill.
     *
     * The Indent No. dropdown is sourced from
     * getPurchaseIndentItemDropdown (itemId/itemCode/itemDescription/
     * purchaseUnit/primaryUnit). Selecting an entry here maps it back to
     * the matching row in itemOptions (matched by item code) so the Item
     * Code, HSN, and unit columns populate the same way they do when the
     * Item Code cell is chosen directly.
     */
    if (changedKey === "indentNo") {
      const selectedIndentItem = indentItemOptions.find(
        (option) => String(option.value) === String(changedValue),
      );

      if (selectedIndentItem) {
        const matchedItem = itemOptions.find(
          (item) => String(item.label) === String(selectedIndentItem.itemCode),
        );

        if (matchedItem) {
          updated.item = matchedItem.value;

          updated.itemDescription =
            matchedItem.itemDescription ||
            selectedIndentItem.itemDescription ||
            "";

          updated.hsnCode = matchedItem.hsnCode || updated.hsnCode || "";

          updated.purchaseUnit = matchedItem.unit || updated.purchaseUnit || "";

          updated.primaryUnit = matchedItem.unit || updated.primaryUnit || "";
        } else {
          updated.itemDescription = selectedIndentItem.itemDescription || "";
        }
      }
    }

    /* PO Qty -> Primary Qty */
    if (changedKey === "poQtyInPurchaseUnit") {
      updated.qtyInPrimaryUnit = changedValue;
    }

    /* Calculate amount */

    const quantity = Math.max(0, toNumber(updated.poQtyInPurchaseUnit));

    const rate = Math.max(0, toNumber(updated.rateInInr));

    const discount = Math.min(100, Math.max(0, toNumber(updated.discount)));

    const gross = quantity * rate;

    const discountAmount = (gross * discount) / 100;

    const netAmount = gross - discountAmount;

    updated.amountInInr = money(netAmount);

    return updated;
  };

  const handleLocalCellChange = (index, key, value) => {
    setLocalDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? calculateLocalRow(row, key, value) : row,
      ),
    );
  };

  /* ========================================================================= */
  /* IMPORT DETAIL CALCULATION                                                 */
  /* ========================================================================= */

  const calculateImportRow = (row, changedKey, changedValue) => {
    let updated = {
      ...row,
      [changedKey]: changedValue,
    };

    /* Item auto-fill */
    if (changedKey === "item") {
      const selectedItem = itemOptions.find(
        (item) => String(item.value) === String(changedValue),
      );

      if (selectedItem) {
        updated.itemDescription = selectedItem.itemDescription || "";

        updated.hsnCode = selectedItem.hsnCode || updated.hsnCode || "";

        updated.uom = selectedItem.unit || updated.uom || "";
      }
    }

    /*
     * IMPORT CALCULATION
     *
     * FOB Rate FC = foreign currency unit rate
     *
     * FOB Rate INR =
     * FOB Rate FC × Exchange Rate
     *
     * FOB Value FC =
     * Indent Qty × FOB Rate FC
     *
     * FOB Value INR =
     * Indent Qty × FOB Rate INR
     */

    const quantity = Math.max(0, toNumber(updated.indentQty));

    const exchangeRate = Math.max(0, toNumber(formData.exchangeRate, 1));

    const fobRateFc = Math.max(0, toNumber(updated.fobRateFc));

    let fobRateInr;

    /*
     * If user changes FC rate OR exchange rate,
     * calculate INR rate automatically.
     */
    if (changedKey === "fobRateFc" || changedKey === "exchangeRate") {
      fobRateInr = fobRateFc * exchangeRate;

      updated.fobRateInr = money(fobRateInr);
    } else {
      fobRateInr = Math.max(0, toNumber(updated.fobRateInr));
    }

    const fobValueFc = quantity * fobRateFc;

    const fobValueInr = quantity * fobRateInr;

    updated.fobValueFc = money(fobValueFc);

    updated.fobValueInr = money(fobValueInr);

    return updated;
  };

  const handleImportCellChange = (index, key, value) => {
    setImportDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? calculateImportRow(row, key, value) : row,
      ),
    );
  };

  /* ========================================================================= */
  /* IMPORT EXCHANGE RATE RECALCULATION                                       */
  /* ========================================================================= */

  useEffect(() => {
    if (isLocal) return;

    const exchangeRate = Math.max(0, toNumber(formData.exchangeRate, 1));

    setImportDetailRows((previous) =>
      previous.map((row) => {
        const fobRateFc = toNumber(row.fobRateFc);

        const quantity = toNumber(row.indentQty);

        const fobRateInr = fobRateFc * exchangeRate;

        return {
          ...row,

          fobRateInr: money(fobRateInr),

          fobValueFc: money(quantity * fobRateFc),

          fobValueInr: money(quantity * fobRateInr),
        };
      }),
    );
  }, [formData.exchangeRate, isLocal]);

  /* ========================================================================= */
  /* LOCAL TOTALS                                                             */
  /* ========================================================================= */

  const localGrossAmount = useMemo(() => {
    return round2(
      localDetailRows.reduce(
        (total, row) => total + toNumber(row.amountInInr),
        0,
      ),
    );
  }, [localDetailRows]);

  /* ========================================================================= */
  /* IMPORT TOTALS                                                            */
  /* ========================================================================= */

  const importFobTotalFc = useMemo(() => {
    return round2(
      importDetailRows.reduce(
        (total, row) => total + toNumber(row.fobValueFc),
        0,
      ),
    );
  }, [importDetailRows]);

  const importFobTotalInr = useMemo(() => {
    return round2(
      importDetailRows.reduce(
        (total, row) => total + toNumber(row.fobValueInr),
        0,
      ),
    );
  }, [importDetailRows]);

  /* ========================================================================= */
  /* TAX CALCULATION                                                          */
  /* ========================================================================= */

  const calculateTaxAmount = (taxableAmount, percentage) => {
    const base = Math.max(0, toNumber(taxableAmount));

    const taxPercentage = Math.max(0, toNumber(percentage));

    return round2((base * taxPercentage) / 100);
  };

  const handleTaxCellChange = (index, key, value) => {
    setTaxRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const updated = {
          ...row,
          [key]: value,
        };

        if (key === "particulars") {
          const definition = taxDefinitionOptions.find(
            (option) => String(option.value) === String(value),
          );

          if (definition) {
            const tax = toNumber(definition.percentage);

            updated.tax = tax;

            updated.amount = money(calculateTaxAmount(localGrossAmount, tax));
          } else {
            updated.tax = "";
            updated.amount = "";
          }
        }

        if (key === "tax") {
          const tax = Math.max(0, toNumber(value));

          updated.tax = tax;

          updated.amount = money(calculateTaxAmount(localGrossAmount, tax));
        }

        return updated;
      }),
    );
  };

  /* Recalculate tax whenever gross changes */

  useEffect(() => {
    if (!isLocal) return;

    setTaxRows((previous) =>
      previous.map((row) => {
        if (row.tax === "" || row.tax === null || row.tax === undefined) {
          return row;
        }

        return {
          ...row,

          amount: money(calculateTaxAmount(localGrossAmount, row.tax)),
        };
      }),
    );
  }, [localGrossAmount, isLocal]);

  const taxRowsTotal = useMemo(() => {
    return round2(
      taxRows.reduce((total, row) => total + toNumber(row.amount), 0),
    );
  }, [taxRows]);

  /* ========================================================================= */
  /* CHARGES                                                                  */
  /* ========================================================================= */

  const chargesTotal = useMemo(() => {
    const freight = toNumber(formData.freightInr);

    const insurance = toNumber(formData.insuranceInr);

    const packing = toNumber(formData.packingCharges);

    const bank = toNumber(formData.bankCharges);

    const surcharge = toNumber(formData.surCharges);

    const other = toNumber(formData.otherChargesInr);

    return round2(freight + insurance + packing + bank + surcharge + other);
  }, [
    formData.freightInr,
    formData.insuranceInr,
    formData.packingCharges,
    formData.bankCharges,
    formData.surCharges,
    formData.otherChargesInr,
  ]);

  /* ========================================================================= */
  /* TOTAL PO VALUE                                                           */
  /* ========================================================================= */

  const calculatedTotalPoValueInr = useMemo(() => {
    if (isLocal) {
      return round2(localGrossAmount + taxRowsTotal + chargesTotal);
    }

    return round2(importFobTotalInr + chargesTotal);
  }, [
    isLocal,
    localGrossAmount,
    taxRowsTotal,
    importFobTotalInr,
    chargesTotal,
  ]);

  /* ========================================================================= */
  /* UPDATE TOTALS IN FORM DATA                                               */
  /* ========================================================================= */

  useEffect(() => {
    setFormData((previous) => {
      const nextTotal = calculatedTotalPoValueInr;

      const nextFobInr = isLocal
        ? previous.totalFobValueInr
        : importFobTotalInr;

      const nextFobFc = isLocal ? previous.totalFobValueFc : importFobTotalFc;

      if (
        Number(previous.totalPoValueInr) === Number(nextTotal) &&
        Number(previous.totalFobValueInr) === Number(nextFobInr) &&
        Number(previous.totalFobValueFc) === Number(nextFobFc)
      ) {
        return previous;
      }

      return {
        ...previous,

        totalPoValueInr: money(nextTotal),

        totalFobValueInr: money(nextFobInr),

        totalFobValueFc: money(nextFobFc),
      };
    });
  }, [calculatedTotalPoValueInr, isLocal, importFobTotalFc, importFobTotalInr]);

  /* ========================================================================= */
  /* ATTACHMENTS                                                              */
  /* ========================================================================= */

  const handleFileSelect = (index, file) => {
    if (!file) return;

    setFileRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              file,
              name: file.name,
              filePath: "",
              isExisting: false,
            }
          : row,
      ),
    );
  };

  const handleAddFileRow = () => {
    setFileRows((previous) => [...previous, emptyFileRow()]);
  };

  const handleRemoveFileRow = (index) => {
    setFileRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleViewFile = (row) => {
    if (row.isExisting && row.filePath) {
      window.open(
        purchaseOrderAPI.getViewFileUrl(row.filePath),
        "_blank",
        "noopener,noreferrer",
      );

      return;
    }

    if (row.file) {
      const url = URL.createObjectURL(row.file);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    }
  };

  /* ========================================================================= */
  /* VALIDATION                                                               */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!formData.branch) {
      errors.branch = "Plant is required";
    }

    if (!formData.orderPlacedDate) {
      errors.orderPlacedDate = "Order Placed Date is required";
    }

    if (!formData.poType) {
      errors.poType = "P.O. Type is required";
    }

    if (!formData.supplierCode) {
      errors.supplierCode = "Supplier Code is required";
    }

    if (isLocal && !formData.department) {
      errors.department = "Department is required";
    }

    if (!isLocal && !formData.currency) {
      errors.currency = "Currency is required";
    }

    if (toNumber(formData.exchangeRate) < 0) {
      errors.exchangeRate = "Exchange Rate cannot be negative";
    }

    const activeRows = isLocal
      ? localDetailRows.filter((row) => row.item)
      : importDetailRows.filter((row) => row.item);

    if (activeRows.length === 0) {
      addToast("Please add at least one item", "error");

      return false;
    }

    if (isLocal) {
      const invalidRow = localDetailRows.some(
        (row) => row.item && toNumber(row.poQtyInPurchaseUnit) <= 0,
      );

      if (invalidRow) {
        addToast("PO Quantity must be greater than 0", "error");

        return false;
      }

      const invalidRate = localDetailRows.some(
        (row) => row.item && toNumber(row.rateInInr) < 0,
      );

      if (invalidRate) {
        addToast("Rate cannot be negative", "error");

        return false;
      }
    }

    if (!isLocal) {
      const invalidRow = importDetailRows.some(
        (row) => row.item && toNumber(row.indentQty) <= 0,
      );

      if (invalidRow) {
        addToast("Indent Quantity must be greater than 0", "error");

        return false;
      }

      if (toNumber(formData.exchangeRate) <= 0) {
        errors.exchangeRate = "Exchange Rate must be greater than 0";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields correctly", "error");

      return false;
    }

    return true;
  };

  /* ========================================================================= */
  /* SAVE                                                                      */
  /* ========================================================================= */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const filesToUpload = [];

      const fileUploadDTO = fileRows
        .filter((row) => row.file || row.isExisting)
        .map((row) => {
          if (row.file) {
            filesToUpload.push(row.file);
          }

          if (row.isExisting) {
            return {
              id: row.id,
              name: row.name,
              filePath: row.filePath,
            };
          }

          return {
            name: row.name,
          };
        });

      /* --------------------------------------------------------------- */
      /* LOCAL DETAILS                                                   */
      /* --------------------------------------------------------------- */

      const localDetails = isLocal
        ? localDetailRows
            .filter((row) => row.item)
            .map((row) => ({
              id: toInteger(row.id),

              item: toInteger(row.item),

              indentNo: row.indentNo || "",

              indentDate: row.indentDate || "",

              indentQty: toNumber(row.indentQty),

              pendingIndentQty: toNumber(row.pendingIndentQty),

              customerPartNo: row.customerPartNo || "",

              hsnCode: row.hsnCode || "",

              taxType: row.taxType || "",

              taxPercentage: toNumber(row.taxPercentage),

              purchaseUnit: toInteger(row.purchaseUnit),

              primaryUnit: toInteger(row.primaryUnit),

              poQtyInPurchaseUnit: toNumber(row.poQtyInPurchaseUnit),

              qtyInPrimaryUnit: toNumber(
                row.qtyInPrimaryUnit || row.poQtyInPurchaseUnit,
              ),

              rateInInr: toNumber(row.rateInInr),

              discount: toNumber(row.discount),

              amountInInr: toNumber(row.amountInInr),

              deliveryDate: row.deliveryDate || "",
            }))
        : [];

      /* --------------------------------------------------------------- */
      /* IMPORT DETAILS                                                  */
      /* --------------------------------------------------------------- */

      const importDetails = !isLocal
        ? importDetailRows
            .filter((row) => row.item)
            .map((row) => ({
              id: toInteger(row.id),

              item: toInteger(row.item),

              indentNo: row.indentNo || "",

              indentDate: row.indentDate || "",

              indentQty: toNumber(row.indentQty),

              hsnCode: row.hsnCode || "",

              uom: toInteger(row.uom),

              orderRate: toNumber(row.orderRate),

              fobRateFc: toNumber(row.fobRateFc),

              fobRateInr: toNumber(row.fobRateInr),

              fobValueInr: toNumber(row.fobValueInr),
            }))
        : [];

      /* --------------------------------------------------------------- */
      /* TAX DETAILS                                                     */
      /* --------------------------------------------------------------- */

      const localTaxDetails = isLocal
        ? taxRows
            .filter((row) => row.particulars)
            .map((row) => {
              const definition = taxDefinitionOptions.find(
                (option) => String(option.value) === String(row.particulars),
              );

              return {
                particulars: definition?.label || row.particulars,

                tax: toNumber(row.tax),

                amount: toNumber(row.amount),
              };
            })
        : [];

      /* --------------------------------------------------------------- */
      /* PAYLOAD                                                         */
      /* --------------------------------------------------------------- */

      const payload = {
        ...(isEditMode && {
          id: editData.id,
        }),

        active: formData.active !== false,

        amountInWord: formData.amountInWord || "",

        authorisedBy: formData.authorisedBy || "",

        bankCharges: toNumber(formData.bankCharges),

        belongsTo: formData.belongsTo || "",

        branch: toInteger(formData.branch),

        cancelRemarks: formData.cancelRemarks || "",

        checkedBy: formData.checkedBy || "",

        countryOfOrigin: formData.countryOfOrigin || "",

        createdBy:
          (isEditMode
            ? formData.createdBy
            : localStorage.getItem("userName")) || "SYSTEM",

        ...(isEditMode && {
          updatedBy: localStorage.getItem("userName") || "SYSTEM",
        }),

        currency: toInteger(formData.currency),

        deliveryTerms: formData.deliveryTerms || "",

        department: toInteger(formData.department),

        exchangeRate: toNumber(formData.exchangeRate, 1),

        financialYear:
          formData.financialYear || String(new Date().getFullYear()),

        foreCloseNo: formData.foreCloseNo || "",

        freight: formData.freight || "",

        freightFc: toNumber(formData.freightFc),

        freightInr: toNumber(formData.freightInr),

        freightType: formData.freightType || "",

        incoterm: formData.incoterm || "",

        indentRequired: formData.indentRequired || "No",

        insurance: formData.insurance || "",

        insuranceFc: toNumber(formData.insuranceFc),

        insuranceInr: toNumber(formData.insuranceInr),

        isIgstApplicable: formData.isIgstApplicable || "No",

        isReverseCharge: formData.isReverseCharge || "No",

        itemType: formData.itemType || "",

        lmeRate: toNumber(formData.lmeRate),

        modeOfDespatch: formData.modeOfDespatch || "",

        notes: formData.notes || "",

        orderPlacedDate: formData.orderPlacedDate || todayISO(),

        orgId: ORG_ID,

        otherChargesFc: toNumber(formData.otherChargesFc),

        otherChargesInr: toNumber(formData.otherChargesInr),

        packingCharges: toNumber(formData.packingCharges),

        packingType: formData.packingType || "",

        paymentTerms: formData.paymentTerms || "",

        poNo: formData.poNo || "",

        poType: formData.poType,

        portOfDischarge: formData.portOfDischarge || "",

        portOfLoading: formData.portOfLoading || "",

        preparedBy: formData.preparedBy || "",

        purchaseOrderImportDetailsDTO: importDetails,

        purchaseOrderLocalDetailsDTO: localDetails,

        purchaseOrderLocalFileUploadDetailsDTO: fileUploadDTO,

        purchaseOrderLocalTaxDetailsDTO: localTaxDetails,

        remarks: formData.remarks || "",

        shipMode: formData.shipMode || "",

        supplierCode: toInteger(formData.supplierCode),

        surCharges: toNumber(formData.surCharges),

        termsAndConditions: formData.termsAndConditions || "",

        totalFobValueFc: isLocal
          ? toNumber(formData.totalFobValueFc)
          : importFobTotalFc,

        totalFobValueInr: isLocal
          ? toNumber(formData.totalFobValueInr)
          : importFobTotalInr,

        totalPoValueFc: toNumber(formData.totalPoValueFc),

        totalPoValueInr: calculatedTotalPoValueInr,
      };

      console.log("Purchase Order Payload:", payload);

      const response = await purchaseOrderAPI.createUpdatePurchaseOrder(
        payload,
        filesToUpload,
      );

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isEditMode
            ? "Purchase order updated successfully"
            : "Purchase order created successfully",
          "success",
        );

        if (onSave) {
          onSave(payload);
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save purchase order";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving purchase order:", error);

      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Purchase Order.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* TABS                                                                      */
  /* ========================================================================= */

  const LOCAL_TABS = [
    {
      key: "poDetail",
      label: "1-PO Detail",
    },
    {
      key: "taxDetails",
      label: "2-Tax Details",
    },
    {
      key: "attachments",
      label: "3-Attachments",
    },
    {
      key: "chargesTerms",
      label: "4-Charges & Terms",
    },
    {
      key: "summary",
      label: "5-Summary",
    },
  ];

  const IMPORT_TABS = [
    {
      key: "poDetail",
      label: "1-Item Detail",
    },
    {
      key: "attachments",
      label: "2-Attachments",
    },
    {
      key: "chargesTerms",
      label: "3-Charges & Terms",
    },
    {
      key: "summary",
      label: "4-Summary",
    },
  ];

  const activeTabs = isLocal ? LOCAL_TABS : IMPORT_TABS;

  useEffect(() => {
    const exists = activeTabs.some((tab) => tab.key === activeTab);

    if (!exists) {
      setActiveTab(activeTabs[0].key);
    }
  }, [activeTabs, activeTab]);

  /* ========================================================================= */
  /* LOCAL TABLE COLUMNS                                                       */
  /* ========================================================================= */

  const localDetailColumns = [
    {
      key: "item",
      label: "Item Code",
      type: "select",
      options: itemOptions,
    },

    {
      key: "indentNo",
      label: "Indent No.",
      type: "select",
      options: indentItemOptions,
    },

    {
      key: "indentDate",
      label: "Indent Date",
      type: "date",
    },

    {
      key: "indentQty",
      label: "Indent Qty",
      type: "number",
    },

    {
      key: "pendingIndentQty",
      label: "Pending Qty",
      type: "number",
    },

    {
      key: "customerPartNo",
      label: "Cust. Part No",
    },

    {
      key: "hsnCode",
      label: "HSN Code",
    },

    {
      key: "taxType",
      label: "Tax Type",
      type: "select",
      options: TAX_TYPES,
    },

    {
      key: "taxPercentage",
      label: "Tax %",
      type: "number",
    },

    {
      key: "purchaseUnit",
      label: "Purchase Unit",
      type: "select",
      options: UNITS,
    },

    {
      key: "primaryUnit",
      label: "Primary Unit",
      type: "select",
      options: UNITS,
    },

    {
      key: "poQtyInPurchaseUnit",
      label: "PO Qty",
      type: "number",
    },

    {
      key: "qtyInPrimaryUnit",
      label: "Qty (Primary)",
      type: "number",
    },

    {
      key: "rateInInr",
      label: "Rate (INR)",
      type: "number",
    },

    {
      key: "discount",
      label: "Discount %",
      type: "number",
    },

    {
      key: "amountInInr",
      label: "Amount (INR)",
      type: "number",
      disabled: true,
    },

    {
      key: "deliveryDate",
      label: "Delivery Date",
      type: "date",
    },
  ];

  /* ========================================================================= */
  /* IMPORT TABLE COLUMNS                                                      */
  /* ========================================================================= */

  const importDetailColumns = [
    {
      key: "item",
      label: "Item Code",
      type: "select",
      options: itemOptions,
    },

    {
      key: "indentNo",
      label: "Indent No.",
      type: "select",
      options: indentItemOptions,
    },

    {
      key: "indentDate",
      label: "Indent Date",
      type: "date",
    },

    {
      key: "indentQty",
      label: "Indent Qty",
      type: "number",
    },

    {
      key: "hsnCode",
      label: "HSN Code",
    },

    {
      key: "uom",
      label: "UOM",
      type: "select",
      options: UNITS,
    },

    {
      key: "orderRate",
      label: "Order Rate",
      type: "number",
    },

    {
      key: "fobRateFc",
      label: "FOB Rate (FC)",
      type: "number",
    },

    {
      key: "fobRateInr",
      label: "FOB Rate (INR)",
      type: "number",
      disabled: true,
    },

    {
      key: "fobValueInr",
      label: "FOB Value (INR)",
      type: "number",
      disabled: true,
    },
  ];

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <div className="p-2 max-w-7xl">
      {/* ------------------------------------------------------------------- */}
      {/* TITLE                                                               */}
      {/* ------------------------------------------------------------------- */}

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Purchase Order" : "Add Purchase Order"}
        </h2>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* MAIN CARD                                                           */}
      {/* ------------------------------------------------------------------- */}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* =============================================================== */}
        {/* HEADER                                                          */}
        {/* =============================================================== */}

        <div>
          <SectionHeader>Purchase Order Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={formData.branch}
              onChange={handleFieldChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
            />

            <Field
              label="P.O.No"
              name="poNo"
              value={generatingDocId ? "Generating..." : formData.poNo}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="P.O.Type"
              name="poType"
              value={formData.poType}
              onChange={handleFieldChange}
              error={fieldErrors.poType}
              options={PTYPE_OPTIONS}
              required
            />

            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={formData.belongsTo}
              onChange={handleFieldChange}
              options={BELONGS_TO}
            />

            <Field
              type="date"
              label="Order Placed Date"
              name="orderPlacedDate"
              value={formData.orderPlacedDate}
              onChange={handleFieldChange}
              error={fieldErrors.orderPlacedDate}
              required
            />

            <Field
              type="select"
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleFieldChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required={isLocal}
            />

            <Field
              type="select"
              label="Supplier Code"
              name="supplierCode"
              value={formData.supplierCode}
              onChange={handleFieldChange}
              error={fieldErrors.supplierCode}
              options={supplierOptions}
              required
            />

            <Field
              type="select"
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleFieldChange}
              error={fieldErrors.currency}
              options={currencyOptions}
              required={!isLocal}
            />

            <Field
              label="Exchange Rate"
              name="exchangeRate"
              type="number"
              step="0.0001"
              min="0"
              value={formData.exchangeRate}
              onChange={handleFieldChange}
              error={fieldErrors.exchangeRate}
            />

            <Field
              label="Financial Year"
              name="financialYear"
              value={formData.financialYear}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="Is IGST Appl"
              name="isIgstApplicable"
              value={formData.isIgstApplicable}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              type="select"
              label="Is Reverse Charge"
              name="isReverseCharge"
              value={formData.isReverseCharge}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              type="select"
              label="Indent Required"
              name="indentRequired"
              value={formData.indentRequired}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              label="Item Type"
              name="itemType"
              value={formData.itemType}
              onChange={handleFieldChange}
            />

            {!isLocal && (
              <>
                <Field
                  type="select"
                  label="Ship Mode"
                  name="shipMode"
                  value={formData.shipMode}
                  onChange={handleFieldChange}
                  options={shipModeOptions}
                />

                <Field
                  type="select"
                  label="Incoterm"
                  name="incoterm"
                  value={formData.incoterm}
                  onChange={handleFieldChange}
                  options={INCOTERMS}
                />

                <Field
                  type="select"
                  label="Country of Origin"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleFieldChange}
                  options={countryOptions}
                />

                <Field
                  label="Port of Loading"
                  name="portOfLoading"
                  value={formData.portOfLoading}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Port of Discharge"
                  name="portOfDischarge"
                  value={formData.portOfDischarge}
                  onChange={handleFieldChange}
                />

                <Field
                  label="ForeClose No"
                  name="foreCloseNo"
                  value={formData.foreCloseNo}
                  onChange={handleFieldChange}
                />

                <Field
                  label="LME Rate"
                  name="lmeRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.lmeRate}
                  onChange={handleFieldChange}
                />
              </>
            )}

            <Field
              label="Mode of Despatch"
              name="modeOfDespatch"
              value={formData.modeOfDespatch}
              onChange={handleFieldChange}
            />
          </div>
        </div>

        {/* =============================================================== */}
        {/* TABS                                                            */}
        {/* =============================================================== */}

        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex overflow-x-auto">
              {activeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ADD DETAIL */}
            {activeTab === "poDetail" && (
              <button
                type="button"
                onClick={isLocal ? addLocalRow : addImportRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

            {/* ADD TAX */}
            {activeTab === "taxDetails" && isLocal && (
              <button
                type="button"
                onClick={addTaxRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

            {/* ADD FILE */}
            {activeTab === "attachments" && (
              <button
                type="button"
                onClick={handleAddFileRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* ============================================================= */}
          {/* LOCAL DETAIL                                                  */}
          {/* ============================================================= */}

          {activeTab === "poDetail" && isLocal && (
            <>
              <DynamicTable
                columns={localDetailColumns}
                rows={localDetailRows}
                onCellChange={handleLocalCellChange}
                onRemoveRow={removeLocalRow}
              />

              <div className="flex justify-end mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Gross Amount (INR):
                <span className="font-semibold ml-1">
                  {money(localGrossAmount)}
                </span>
              </div>
            </>
          )}

          {/* ============================================================= */}
          {/* IMPORT DETAIL                                                 */}
          {/* ============================================================= */}

          {activeTab === "poDetail" && !isLocal && (
            <>
              <DynamicTable
                columns={importDetailColumns}
                rows={importDetailRows}
                onCellChange={handleImportCellChange}
                onRemoveRow={removeImportRow}
              />

              <div className="flex justify-end gap-4 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Total FOB (FC):
                  <strong className="ml-1">{money(importFobTotalFc)}</strong>
                </span>

                <span>
                  Total FOB (INR):
                  <strong className="ml-1">{money(importFobTotalInr)}</strong>
                </span>
              </div>
            </>
          )}

          {/* ============================================================= */}
          {/* TAX DETAILS                                                   */}
          {/* ============================================================= */}

          {activeTab === "taxDetails" && isLocal && (
            <>
              <DynamicTable
                columns={[
                  {
                    key: "particulars",
                    label: "Particulars",
                    type: "select",
                    options: taxDefinitionOptions,
                  },

                  {
                    key: "tax",
                    label: "Tax %",
                    type: "number",
                  },

                  {
                    key: "amount",
                    label: "Amount",
                    type: "number",
                    disabled: true,
                  },
                ]}
                rows={taxRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={removeTaxRow}
              />

              <div className="flex justify-end gap-4 px-1 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Gross:
                  <strong className="ml-1">{money(localGrossAmount)}</strong>
                </span>

                <span>
                  Tax:
                  <strong className="ml-1">{money(taxRowsTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {/* ============================================================= */}
          {/* ATTACHMENTS                                                   */}
          {/* ============================================================= */}

          {activeTab === "attachments" && (
            <TableWrapper>
              <TableHead
                headers={["#", "File Name", "Attachment", "View", "Action"]}
              />

              <tbody>
                {fileRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-1 text-center font-medium dark:text-white text-[10px]">
                      {index + 1}
                    </td>

                    <td className="p-1 align-top">
                      <input
                        type="text"
                        value={row.name}
                        readOnly
                        placeholder="No file selected"
                        className={cellInputClasses}
                      />
                    </td>

                    <td className="p-1 align-top">
                      <label className="flex items-center justify-center gap-1 h-8 px-2 rounded border border-dashed border-gray-300 dark:border-gray-600 text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-colors">
                        <UploadCloud size={12} />

                        {row.name ? "Replace file" : "Click to upload"}

                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            handleFileSelect(index, event.target.files?.[0])
                          }
                        />
                      </label>
                    </td>

                    <td className="p-1 text-center">
                      {(row.isExisting || row.file) && (
                        <button
                          type="button"
                          onClick={() => handleViewFile(row)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          {row.isExisting ? (
                            <Eye size={14} />
                          ) : (
                            <FileIcon size={14} />
                          )}
                        </button>
                      )}
                    </td>

                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFileRow(index)}
                        disabled={fileRows.length <= 1}
                        className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                          fileRows.length <= 1
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <Trash2 size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrapper>
          )}

          {/* ============================================================= */}
          {/* CHARGES & TERMS                                               */}
          {/* ============================================================= */}

          {activeTab === "chargesTerms" && (
            <div className="pt-2 space-y-3">
              <div className={fieldGrid}>
                <Field
                  label="Freight"
                  name="freight"
                  value={formData.freight}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Freight Type"
                  name="freightType"
                  value={formData.freightType}
                  onChange={handleFieldChange}
                />

                {!isLocal && (
                  <Field
                    label="Freight (FC)"
                    name="freightFc"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.freightFc}
                    onChange={handleFieldChange}
                  />
                )}

                <Field
                  label="Freight (INR)"
                  name="freightInr"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.freightInr}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Insurance"
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleFieldChange}
                />

                {!isLocal && (
                  <Field
                    label="Insurance (FC)"
                    name="insuranceFc"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.insuranceFc}
                    onChange={handleFieldChange}
                  />
                )}

                <Field
                  label="Insurance (INR)"
                  name="insuranceInr"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.insuranceInr}
                  onChange={handleFieldChange}
                />

                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={formData.packingType}
                  onChange={handleFieldChange}
                  options={PACKING_TYPES}
                />

                <Field
                  label="Packing Charges"
                  name="packingCharges"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.packingCharges}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Bank Charges"
                  name="bankCharges"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.bankCharges}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Sur Charges"
                  name="surCharges"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.surCharges}
                  onChange={handleFieldChange}
                />

                {!isLocal && (
                  <Field
                    label="Other Charges (FC)"
                    name="otherChargesFc"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.otherChargesFc}
                    onChange={handleFieldChange}
                  />
                )}

                <Field
                  label="Other Charges (INR)"
                  name="otherChargesInr"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.otherChargesInr}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Delivery Terms"
                  name="deliveryTerms"
                  value={formData.deliveryTerms}
                  onChange={handleFieldChange}
                />
              </div>

              {/* CHARGES TOTAL */}

              <div className="flex justify-end px-1 text-[11px] text-gray-500 dark:text-gray-400">
                Charges Total (INR):
                <span className="font-semibold ml-1">
                  {money(chargesTotal)}
                </span>
              </div>

              {/* TERMS */}

              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Terms and Conditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />

                <Field
                  type="textarea"
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />

                <Field
                  type="textarea"
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SUMMARY                                                        */}
          {/* ============================================================= */}

          {activeTab === "summary" && (
            <div className="pt-2 space-y-3">
              <div className={fieldGrid}>
                {/* LOCAL GROSS */}

                {isLocal ? (
                  <Field
                    label="Gross Amount (INR)"
                    name="grossAmount"
                    type="number"
                    value={money(localGrossAmount)}
                    onChange={() => {}}
                    disabled
                  />
                ) : (
                  <>
                    <Field
                      label="Total FOB Value (FC)"
                      name="totalFobValueFc"
                      type="number"
                      value={money(importFobTotalFc)}
                      onChange={() => {}}
                      disabled
                    />

                    <Field
                      label="Total FOB Value (INR)"
                      name="totalFobValueInr"
                      type="number"
                      value={money(importFobTotalInr)}
                      onChange={() => {}}
                      disabled
                    />

                    <Field
                      label="Total PO Value (FC)"
                      name="totalPoValueFc"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.totalPoValueFc}
                      onChange={handleFieldChange}
                    />
                  </>
                )}

                {/* LOCAL TAX */}

                {isLocal && (
                  <Field
                    label="Tax Total (INR)"
                    name="taxTotal"
                    type="number"
                    value={money(taxRowsTotal)}
                    onChange={() => {}}
                    disabled
                  />
                )}

                {/* CHARGES */}

                <Field
                  label="Charges Total (INR)"
                  name="chargesTotal"
                  type="number"
                  value={money(chargesTotal)}
                  onChange={() => {}}
                  disabled
                />

                {/* FINAL TOTAL */}

                <Field
                  label="Total PO Value (INR)"
                  name="totalPoValueInr"
                  type="number"
                  value={money(calculatedTotalPoValueInr)}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  label="Amount In Word"
                  name="amountInWord"
                  value={formData.amountInWord}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />

                <Field
                  label="Prepared By"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Checked By"
                  name="checkedBy"
                  value={formData.checkedBy}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Authorised By"
                  name="authorisedBy"
                  value={formData.authorisedBy}
                  onChange={handleFieldChange}
                />
              </div>

              {/* CALCULATION BREAKDOWN */}

              <div className="border rounded-md border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Calculation Summary
                </div>

                {isLocal ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-500">Gross:</span>

                      <span className="font-semibold ml-1">
                        ₹{money(localGrossAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Tax:</span>

                      <span className="font-semibold ml-1">
                        ₹{money(taxRowsTotal)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Charges:</span>

                      <span className="font-semibold ml-1">
                        ₹{money(chargesTotal)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Final:</span>

                      <span className="font-semibold ml-1 text-blue-600">
                        ₹{money(calculatedTotalPoValueInr)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-500">FOB FC:</span>

                      <span className="font-semibold ml-1">
                        {money(importFobTotalFc)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Exchange:</span>

                      <span className="font-semibold ml-1">
                        {money(formData.exchangeRate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">FOB INR:</span>

                      <span className="font-semibold ml-1">
                        ₹{money(importFobTotalInr)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Charges:</span>

                      <span className="font-semibold ml-1">
                        ₹{money(chargesTotal)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Final:</span>

                      <span className="font-semibold ml-1 text-blue-600">
                        ₹{money(calculatedTotalPoValueInr)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* =============================================================== */}
        {/* BUTTONS                                                         */}
        {/* =============================================================== */}

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />

            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
