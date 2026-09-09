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
import { departmentAPI } from "../../../api/departmentAPI";
import taxDefinitionAPI from "../../../api/taxDefinitionAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import purchaseContractAPI from "../../../api/Purchase/purchaseContractAPI";
import { useToast } from "../../Toast/ToastContext";

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
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = parseInt(value, 10);

  return Number.isFinite(number) ? number : fallback;
};

const round2 = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const money = (value) => round2(value).toFixed(2);

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ========================================================================= */
/* FIELD COMPONENT                                                            */
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

const DisplayCell = ({ value, minWidth = "130px" }) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <div
      className={
        `${cellInputClasses} flex items-center bg-gray-100 ` +
        `dark:bg-gray-800 cursor-not-allowed whitespace-nowrap overflow-hidden`
      }
      title={value ?? ""}
    >
      {value ?? ""}
    </div>
  </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />

    <tbody>
      {rows.map((row, index) => (
        <TableRow
          key={row.id || index}
          index={index}
          onRemove={() => onRemoveRow(index)}
          disabled={rows.length <= 1}
        >
          {columns.map((column) => {
            if (column.type === "display") {
              return (
                <DisplayCell
                  key={column.key}
                  value={row[column.displayKey || column.key]}
                  minWidth={column.minWidth || "130px"}
                />
              );
            }

            if (column.type === "select") {
              return (
                <SelectCell
                  key={column.key}
                  value={row[column.key]}
                  disabled={
                    typeof column.disabled === "function"
                      ? column.disabled(row, index)
                      : column.disabled
                  }
                  onChange={(e) =>
                    onCellChange(index, column.key, e.target.value)
                  }
                  options={
                    typeof column.options === "function"
                      ? column.options(row, index)
                      : column.options
                  }
                />
              );
            }

            return (
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
                disabled={
                  typeof column.disabled === "function"
                    ? column.disabled(row, index)
                    : column.disabled
                }
                min={column.type === "number" ? 0 : undefined}
                step={
                  column.type === "number" ? column.step || "0.01" : undefined
                }
                minWidth={column.minWidth || "100px"}
                onChange={(e) =>
                  onCellChange(index, column.key, e.target.value)
                }
              />
            );
          })}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* STATIC OPTIONS                                                            */
/* ========================================================================= */

const PTYPE_OPTIONS = ["Local", "Import"];
const YES_NO = ["Yes", "No"];

const PACKING_TYPES = ["Standard", "Wooden Packing", "Carton", "Pallet"];

/* ========================================================================= */
/* EMPTY ROWS                                                               */
/* ========================================================================= */

const emptyDetailRow = () => ({
  id: 0,
  item: "",
  itemDescription: "",
  hsnCode: "",
  unit: "",
  unitCode: "",
  rateInCurrency: "",
  taxType: "",
  taxPercentage: "",
  sgstRate: "",
  cgstRate: "",
  igstRate: "",
  sgstAmount: 0,
  cgstAmount: 0,
  igstAmount: 0,
  validFrom: "",
  validTo: "",
});

const emptyTaxRow = () => ({
  id: 0,
  particulars: "",
  tax: "",
  amount: "",
  isSystemRow: false,
});

const emptyFileRow = () => ({
  name: "",
  file: null,
  filePath: "",
  isExisting: false,
});

/* ========================================================================= */
/* DEFAULT FORM                                                             */
/* ========================================================================= */

const getDefaultValues = () => ({
  active: true,

  branch: "",
  belongsTo: "",
  contractNo: "",
  department: "",
  date: todayISO(),

  supplier: "",
  supplierName: "",
  supplierRefNo: "",
  refDate: "",
  gstState: "",

  validFrom: "",
  validTo: "",

  isIgstAppl: "No",

  purchaseOrderType: "Local",

  gstnNo: "",

  currency: "",

  financialYear: String(new Date().getFullYear()),

  accounts: "",
  bank: "",
  swiftCode: "",
  delivery: "",
  freightForwarder: "",
  freightType: "",
  insuranceAmount: 0,
  modeOfDespatch: "",
  packingType: "",
  paymentTerms: "",

  preparedBy: "",
  checkedBy: "",
  authorisedBy: "",

  termsConditions: "",
  notes: "",
  cancelRemarks: "",
});

/* ========================================================================= */
/* COMPONENT                                                                */
/* ========================================================================= */

const PurchaseContractForm = ({ data: editData, onBack }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));

  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  /* ----------------------------------------------------------------------- */
  /* FORM STATE                                                              */
  /* ----------------------------------------------------------------------- */

  const [formData, setFormData] = useState(() => ({
    ...getDefaultValues(),

    branch: String(editData?.branch ?? BRANCH_ID ?? ""),

    ...(editData || {}),
  }));

  const effectiveBranchId = toInteger(formData.branch || BRANCH_ID);

  const [detailRows, setDetailRows] = useState(
    editData?.details?.length ? editData.details : [emptyDetailRow()],
  );

  const [taxRows, setTaxRows] = useState(() => {
    const existing = editData?.taxDetails;

    if (!existing?.length) {
      return [emptyTaxRow()];
    }

    return existing.map((row, index) => ({
      ...row,

      id: row.id ?? index + 1,

      isSystemRow:
        Boolean(row.isSystemRow) ||
        ["Gross Amount", "IGST", "CGST", "SGST"].includes(row.particulars),
    }));
  });

  const [fileRows, setFileRows] = useState(
    editData?.files?.length
      ? editData.files.map((file) => ({
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

  const [activeTab, setActiveTab] = useState("itemDetail");

  const [branchOptions, setBranchOptions] = useState([]);

  const [belongsToOptions, setBelongsToOptions] = useState([]);

  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [currencyOptions, setCurrencyOptions] = useState([]);

  const [supplierOptions, setSupplierOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [taxDefinitionOptions, setTaxDefinitionOptions] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generatingDocId, setGeneratingDocId] = useState(false);

  /* ========================================================================= */
  /* MASTER DATA LOADERS                                                       */
  /* ========================================================================= */

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

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      const list = Array.isArray(response) ? response : [];

      setBelongsToOptions(
        list.map((item) => ({
          value:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",

          label:
            item.valuesDescription ||
            item.valueDescription ||
            item.description ||
            "",
        })),
      );
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);

      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  const loadDepartments = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await departmentAPI.getAllDepartments(ORG_ID);

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

  const loadTaxDefinitions = useCallback(async () => {
    try {
      if (!ORG_ID) return;

      const response = await taxDefinitionAPI.getTaxDefinitionByOrgId(
        effectiveBranchId,
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
  }, [ORG_ID, effectiveBranchId]);

  const loadSuppliers = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        return;
      }

      const list = await purchaseContractAPI.getSupplierDropdown(
        effectiveBranchId,
        ORG_ID,
      );

      setSupplierOptions(
        (Array.isArray(list) ? list : []).map((supplier) => ({
          value: supplier.supplierId,

          label: supplier.supplierCode || `Supplier ${supplier.supplierId}`,

          supplierName: supplier.supplierName || "",

          gstState: supplier.gstState ?? "",

          gstNo: supplier.gstNo || "",

          isGstApplicable: Boolean(supplier.isGstApplicable),
        })),
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);

      setSupplierOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadEmployees = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        return;
      }

      const list = await purchaseContractAPI.getEmployeeDropdown(
        effectiveBranchId,
        ORG_ID,
      );

      setEmployeeOptions(
        (Array.isArray(list) ? list : []).map((emp) => ({
          value: emp.employeeId,

          label: emp.employeeName || `Employee ${emp.employeeId}`,

          employeeName: emp.employeeName || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load employees:", error);

      setEmployeeOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadContractItems = useCallback(
    async (supplierId) => {
      try {
        if (!ORG_ID || !effectiveBranchId || !supplierId) {
          setItemOptions([]);
          return;
        }

        const list = await purchaseContractAPI.getContractItems(
          effectiveBranchId,
          ORG_ID,
          supplierId,
        );

        setItemOptions(
          (Array.isArray(list) ? list : []).map((item) => ({
            value: item.itemId ?? item.id,

            label:
              item.itemCode || item.code || `Item ${item.itemId ?? item.id}`,

            itemDescription:
              item.itemDescription || item.itemDesc || item.description || "",

            hsnCode: item.hsnCode || item.hsnSacCode || item.hsn || "",

            unitId: item.unitId ?? item.uom?.id ?? item.unit?.id ?? "",

            unitCode:
              item.unitCode || item.uom?.unitCode || item.unit?.unitCode || "",
          })),
        );
      } catch (error) {
        console.error("Failed to load contract items:", error);

        setItemOptions([]);
      }
    },
    [ORG_ID, effectiveBranchId],
  );

  /* ========================================================================= */
  /* MASTER DATA USE EFFECT                                                   */
  /* ========================================================================= */

  useEffect(() => {
    loadBranches();
    loadBelongsTo();
    loadDepartments();
    loadCurrencies();
    loadTaxDefinitions();
    loadSuppliers();
    loadEmployees();
  }, [
    loadBranches,
    loadBelongsTo,
    loadDepartments,
    loadCurrencies,
    loadTaxDefinitions,
    loadSuppliers,
    loadEmployees,
  ]);

  useEffect(() => {
    if (formData.supplier) {
      loadContractItems(formData.supplier);
    } else {
      setItemOptions([]);
    }
  }, [formData.supplier, loadContractItems]);

  /* ========================================================================= */
  /* CONTRACT NUMBER                                                           */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId = await purchaseContractAPI.getPurchaseContractDocId({
          financialYear: formData.financialYear,

          orgId: ORG_ID,
        });

        if (!cancelled) {
          setFormData((previous) => ({
            ...previous,
            contractNo: docId || "",
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error generating Contract No:", error);

          addToast("Failed to generate Contract No.", "error");
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

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

    if (name === "branch") {
      setFormData((previous) => ({
        ...previous,

        branch: value,

        supplier: "",
        supplierName: "",

        gstState: "",
        gstnNo: "",

        isIgstAppl: "No",
      }));

      setSupplierOptions([]);

      setDetailRows([emptyDetailRow()]);

      return;
    }

    if (name === "supplier") {
      const selected = supplierOptions.find(
        (option) => String(option.value) === String(value),
      );

      setFormData((previous) => ({
        ...previous,

        supplier: value,

        supplierName: selected?.supplierName || "",

        gstState: selected?.gstState ?? "",

        gstnNo: selected?.gstNo || "",

        isIgstAppl: selected?.isGstApplicable ? "Yes" : "No",
      }));

      setDetailRows([emptyDetailRow()]);

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ========================================================================= */
  /* ITEM TAX TYPE                                                             */
  /* ========================================================================= */

  useEffect(() => {
    const derivedTaxType = formData.isIgstAppl === "Yes" ? "IGST" : "SGST";

    setDetailRows((previous) =>
      previous.map((row) => ({
        ...row,
        taxType: derivedTaxType,
      })),
    );
  }, [formData.isIgstAppl]);

  /* ========================================================================= */
  /* ROW MANAGEMENT                                                            */
  /* ========================================================================= */

  const addDetailRow = () => {
    const derivedTaxType = formData.isIgstAppl === "Yes" ? "IGST" : "SGST";

    setDetailRows((previous) => [
      ...previous,

      {
        ...emptyDetailRow(),
        taxType: derivedTaxType,
      },
    ]);
  };

  const removeDetailRow = (index) => {
    setDetailRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const addTaxRow = () => {
    setTaxRows((previous) => [
      ...previous,

      {
        ...emptyTaxRow(),
        isSystemRow: false,
      },
    ]);
  };

  const removeTaxRow = (index) => {
    setTaxRows((previous) => {
      const row = previous[index];

      if (!row || row.isSystemRow) {
        return previous;
      }

      const userRows = previous.filter((item) => !item.isSystemRow);

      if (userRows.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  /* ========================================================================= */
  /* ITEM CALCULATION                                                          */
  /* ========================================================================= */

  const calculateDetailRow = (row, changedKey, changedValue) => {
    let updated = {
      ...row,
      [changedKey]: changedValue,
    };

    const selectedItem =
      changedKey === "item"
        ? itemOptions.find(
            (item) => String(item.value) === String(changedValue),
          )
        : itemOptions.find(
            (item) => String(item.value) === String(updated.item),
          );

    if (selectedItem) {
      updated.itemDescription = selectedItem.itemDescription || "";

      updated.hsnCode = selectedItem.hsnCode || updated.hsnCode || "";

      updated.unit = selectedItem.unitId || updated.unit || "";

      updated.unitCode = selectedItem.unitCode || "";
    }

    const taxable = Math.max(0, toNumber(updated.rateInCurrency));

    const isIGST = formData.isIgstAppl === "Yes";

    const fallbackTax = toNumber(updated.taxPercentage);

    if (isIGST) {
      updated.taxType = "IGST";

      updated.igstRate = fallbackTax;

      updated.igstAmount = round2((taxable * fallbackTax) / 100);

      updated.sgstRate = 0;
      updated.cgstRate = 0;

      updated.sgstAmount = 0;
      updated.cgstAmount = 0;
    } else {
      const half = fallbackTax / 2;

      updated.taxType = "SGST";

      updated.sgstRate = half;
      updated.cgstRate = half;

      updated.sgstAmount = round2((taxable * half) / 100);

      updated.cgstAmount = round2((taxable * half) / 100);

      updated.igstRate = 0;
      updated.igstAmount = 0;
    }

    return updated;
  };

  const handleDetailCellChange = (index, key, value) => {
    setDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? calculateDetailRow(row, key, value) : row,
      ),
    );
  };

  /* ========================================================================= */
  /* TOTALS                                                                    */
  /* ========================================================================= */

  const grossAmount = useMemo(
    () =>
      round2(
        detailRows.reduce(
          (total, row) => total + toNumber(row.rateInCurrency),
          0,
        ),
      ),
    [detailRows],
  );

  const calculateTaxAmount = (base, percentage) =>
    round2(
      (Math.max(0, toNumber(base)) * Math.max(0, toNumber(percentage))) / 100,
    );

  const calculateTaxDetails = useCallback(() => {
    const isIGST = formData.isIgstAppl === "Yes";

    let sgstAmount = 0;
    let cgstAmount = 0;
    let igstAmount = 0;

    detailRows.forEach((row) => {
      const taxable = Math.max(0, toNumber(row.rateInCurrency));

      if (isIGST) {
        igstAmount += calculateTaxAmount(taxable, row.igstRate);
      } else {
        sgstAmount += calculateTaxAmount(taxable, row.sgstRate);

        cgstAmount += calculateTaxAmount(taxable, row.cgstRate);
      }
    });

    const systemRows = [
      {
        id: "system-gross",

        particulars: "Gross Amount",

        tax: 0,

        amount: money(grossAmount),

        isSystemRow: true,
      },
    ];

    if (isIGST) {
      systemRows.push({
        id: "system-igst",

        particulars: "IGST",

        tax: grossAmount > 0 ? round2((igstAmount / grossAmount) * 100) : 0,

        amount: money(igstAmount),

        isSystemRow: true,
      });
    } else {
      systemRows.push(
        {
          id: "system-sgst",

          particulars: "SGST",

          tax: grossAmount > 0 ? round2((sgstAmount / grossAmount) * 100) : 0,

          amount: money(sgstAmount),

          isSystemRow: true,
        },

        {
          id: "system-cgst",

          particulars: "CGST",

          tax: grossAmount > 0 ? round2((cgstAmount / grossAmount) * 100) : 0,

          amount: money(cgstAmount),

          isSystemRow: true,
        },
      );
    }

    setTaxRows((previous) => {
      const userRows = previous
        .filter((row) => !row.isSystemRow)
        .map((row) => ({
          ...row,

          isSystemRow: false,

          amount:
            row.tax === "" || row.tax === null || row.tax === undefined
              ? row.amount
              : money(calculateTaxAmount(grossAmount, row.tax)),
        }));

      const nextRows = [...systemRows, ...userRows];

      return JSON.stringify(previous) === JSON.stringify(nextRows)
        ? previous
        : nextRows;
    });
  }, [detailRows, formData.isIgstAppl, grossAmount]);

  useEffect(() => {
    calculateTaxDetails();
  }, [calculateTaxDetails]);

  const handleTaxCellChange = (index, key, value) => {
    setTaxRows((previous) =>
      previous.map((row, rowIndex) => {
        if (rowIndex !== index || row.isSystemRow) {
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

            updated.amount = money(calculateTaxAmount(grossAmount, tax));
          } else {
            updated.tax = "";
            updated.amount = "";
          }
        }

        if (key === "tax") {
          const tax = Math.max(0, toNumber(value));

          updated.tax = tax;

          updated.amount = money(calculateTaxAmount(grossAmount, tax));
        }

        return updated;
      }),
    );
  };

  const taxRowsTotal = useMemo(
    () =>
      round2(
        taxRows
          .filter((row) => row.particulars !== "Gross Amount")
          .reduce((total, row) => total + toNumber(row.amount), 0),
      ),
    [taxRows],
  );

  /* ========================================================================= */
  /* ATTACHMENTS                                                               */
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

  const handleAddFileRow = () =>
    setFileRows((previous) => [...previous, emptyFileRow()]);

  const handleRemoveFileRow = (index) => {
    setFileRows((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleViewFile = (row) => {
    if (!row.file) return;

    const url = URL.createObjectURL(row.file);

    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!formData.branch) {
      errors.branch = "Plant is required";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    }

    if (!formData.department) {
      errors.department = "Department is required";
    }

    if (!formData.supplier) {
      errors.supplier = "Supplier Code is required";
    }

    if (!formData.validFrom) {
      errors.validFrom = "Valid From is required";
    }

    if (!formData.validTo) {
      errors.validTo = "Valid To is required";
    }

    if (!formData.purchaseOrderType) {
      errors.purchaseOrderType = "P.O Type is required";
    }

    if (!formData.currency) {
      errors.currency = "Currency is required";
    }

    const activeRows = detailRows.filter((row) => row.item);

    if (activeRows.length === 0) {
      addToast("Please add at least one item", "error");

      return false;
    }

    const invalidRate = detailRows.some(
      (row) => row.item && toNumber(row.rateInCurrency) <= 0,
    );

    if (invalidRate) {
      addToast("Rate must be greater than 0", "error");

      return false;
    }

    const invalidItemRow = detailRows.some(
      (row) => row.item && (!row.unit || toInteger(row.unit) <= 0),
    );

    if (invalidItemRow) {
      addToast("Unit is missing for one or more items", "error");

      return false;
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
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      /*
       * ---------------------------------------------------------------------
       * DETAILS
       *
       * Must exactly match Swagger:
       *
       * cgstAmount       number
       * cgstRate         number
       * hsnCode          string
       * igstAmount       number
       * igstRate         number
       * item             number
       * rateInCurrency   number
       * sgstAmount       number
       * sgstRate         number
       * taxPercentage    string
       * taxType          string
       * unit              number
       * validFrom        string/date
       * validTo          string/date
       * ---------------------------------------------------------------------
       */

      const details = detailRows
        .filter((row) => row.item)
        .map((row) => ({
          cgstAmount: toNumber(row.cgstAmount),

          cgstRate: toNumber(row.cgstRate),

          hsnCode: row.hsnCode || "",

          igstAmount: toNumber(row.igstAmount),

          igstRate: toNumber(row.igstRate),

          item: toInteger(row.item),

          rateInCurrency: toNumber(row.rateInCurrency),

          sgstAmount: toNumber(row.sgstAmount),

          sgstRate: toNumber(row.sgstRate),

          /*
           * Swagger says String.
           */
          taxPercentage: String(row.taxPercentage ?? ""),

          taxType: row.taxType || "",

          unit: toInteger(row.unit),

          validFrom: row.validFrom || formData.validFrom || "",

          validTo: row.validTo || formData.validTo || "",
        }));

      const taxDetails = taxRows
        .filter((row) => row.particulars && !row.isSystemRow)
        .map((row) => {
          const definition = taxDefinitionOptions.find(
            (option) => String(option.value) === String(row.particulars),
          );

          return {
            amount: toNumber(row.amount),

            particulars: definition?.label || String(row.particulars),

            taxPercent: toNumber(row.tax),
          };
        });

      /*
       * ---------------------------------------------------------------------
       * EMPLOYEE NAMES
       *
       * Swagger expects String for these fields.
       * ---------------------------------------------------------------------
       */

      const preparedByName =
        employeeOptions.find(
          (employee) => String(employee.value) === String(formData.preparedBy),
        )?.employeeName ||
        formData.preparedBy ||
        "";

      const checkedByName =
        employeeOptions.find(
          (employee) => String(employee.value) === String(formData.checkedBy),
        )?.employeeName ||
        formData.checkedBy ||
        "";

      const authorisedByName =
        employeeOptions.find(
          (employee) =>
            String(employee.value) === String(formData.authorisedBy),
        )?.employeeName ||
        formData.authorisedBy ||
        "";

      /*
       * ---------------------------------------------------------------------
       * FINAL API PAYLOAD
       *
       * IMPORTANT:
       * This object now follows the Swagger request body exactly.
       * ---------------------------------------------------------------------
       */

      const payload = {
        ...(isEditMode && {
          id: toInteger(editData.id),
        }),

        accounts: formData.accounts || "",

        active: formData.active !== false,

        authorisedBy: authorisedByName,

        bank: formData.bank || "",

        belongsTo: formData.belongsTo || "",

        branch: toInteger(formData.branch),

        cancelRemarks: formData.cancelRemarks || "",

        checkedBy: checkedByName,

        createdBy:
          (isEditMode
            ? formData.createdBy
            : localStorage.getItem("userName")) || "SYSTEM",

        currency: toInteger(formData.currency),

        delivery: formData.delivery || "",

        department: toInteger(formData.department),

        details,

        financialYear:
          formData.financialYear || String(new Date().getFullYear()),

        freightForwarder: formData.freightForwarder || "",

        freightType: formData.freightType || "",

        gstState: toInteger(formData.gstState),

        IGSTAppl: formData.isIgstAppl === "Yes",

        insuranceAmount: toNumber(formData.insuranceAmount),

        modeOfDespatch: formData.modeOfDespatch || "",

        notes: formData.notes || "",

        orgId: toInteger(ORG_ID),

        packingType: formData.packingType || "",

        paymentTerms: formData.paymentTerms || "",

        preparedBy: preparedByName,

        purchaseOrderType: formData.purchaseOrderType || "Local",

        supplier: toInteger(formData.supplier),

        swiftCode: formData.swiftCode || "",

        taxDetails,

        termsConditions: formData.termsConditions || "",

        validFrom: formData.validFrom || "",

        validTo: formData.validTo || "",
      };

      /*
       * ---------------------------------------------------------------------
       * DEBUG
       * ---------------------------------------------------------------------
       */

      console.log("========================================");

      console.log("FINAL PURCHASE CONTRACT PAYLOAD");

      console.log(JSON.stringify(payload, null, 2));

      console.log("DETAILS:", JSON.stringify(details, null, 2));

      console.log("TAX DETAILS:", JSON.stringify(taxDetails, null, 2));

      console.log("========================================");

      /*
       * ---------------------------------------------------------------------
       * API CALL
       * ---------------------------------------------------------------------
       */

      const response = await purchaseContractAPI.createUpdateContract(payload);

      console.log("Purchase Contract API Response:", response);

      const status =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.statusFlag === "Success";

      if (status) {
        addToast(
          isEditMode
            ? "Purchase contract updated successfully"
            : "Purchase contract created successfully",
          "success",
        );

        if (onBack) {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save purchase contract";

        console.error("Backend returned failure:", response);

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("========================================");

      console.error("PURCHASE CONTRACT SAVE ERROR");

      console.error("Status:", error?.response?.status);

      console.error("Response:", error?.response?.data);

      console.error("Message:", error?.message);

      console.error("========================================");

      const backendData = error?.response?.data;

      const errorMessage =
        backendData?.message ||
        backendData?.errorMessage ||
        backendData?.paramObjectsMap?.errorMessage ||
        backendData?.paramObjectsMap?.message ||
        (typeof backendData === "string" ? backendData : "") ||
        "Failed to save Purchase Contract.";

      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* TABS                                                                      */
  /* ========================================================================= */

  const TABS = [
    {
      key: "itemDetail",
      label: "1-Item Detail",
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
  ];

  /* ========================================================================= */
  /* ITEM DETAIL COLUMNS                                                       */
  /* ========================================================================= */

  const detailColumns = [
    {
      key: "item",
      label: "Item Code",
      type: "select",
      options: itemOptions,
    },

    {
      key: "itemDescription",
      label: "Item Description",
      type: "display",
      minWidth: "180px",
    },

    {
      key: "hsnCode",
      label: "HSN Code",
    },

    {
      key: "unitCode",
      label: "Unit",
      type: "display",
      minWidth: "100px",
    },

    {
      key: "rateInCurrency",
      label: "Rate (Currency)",
      type: "number",
    },

    {
      key: "taxType",
      label: "Tax Type",
      type: "display",
    },

    {
      key: "taxPercentage",
      label: "Tax %",
      type: "number",
    },

    {
      key: "sgstAmount",
      label: "SGST Amt",
      type: "number",
      disabled: true,
    },

    {
      key: "cgstAmount",
      label: "CGST Amt",
      type: "number",
      disabled: true,
    },

    {
      key: "igstAmount",
      label: "IGST Amt",
      type: "number",
      disabled: true,
    },

    {
      key: "validFrom",
      label: "Valid From",
      type: "date",
    },

    {
      key: "validTo",
      label: "Valid To",
      type: "date",
    },
  ];

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <div className="p-2 max-w-7xl">
      {/* TITLE */}
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
          {isEditMode ? "Edit Purchase Contract" : "Add Purchase Contract"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* HEADER */}
        <div>
          <SectionHeader>Purchase Contract (Open)</SectionHeader>

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
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={formData.belongsTo}
              onChange={handleFieldChange}
              options={belongsToOptions}
            />

            <Field
              label="Contract No."
              name="contractNo"
              value={generatingDocId ? "Generating..." : formData.contractNo}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleFieldChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required
            />

            <Field
              type="date"
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleFieldChange}
              error={fieldErrors.date}
              required
            />

            <Field
              type="select"
              label="Supplier Code"
              name="supplier"
              value={formData.supplier}
              onChange={handleFieldChange}
              error={fieldErrors.supplier}
              options={supplierOptions}
              required
            />

            <Field
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleFieldChange}
              disabled
            />

            <Field
              label="Supplier Ref. No."
              name="supplierRefNo"
              value={formData.supplierRefNo}
              onChange={handleFieldChange}
            />

            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={formData.refDate}
              onChange={handleFieldChange}
            />

            <Field
              label="GST State"
              name="gstState"
              value={formData.gstState}
              onChange={handleFieldChange}
              disabled
            />

            <Field
              type="date"
              label="Valid From"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleFieldChange}
              error={fieldErrors.validFrom}
              required
            />

            <Field
              type="date"
              label="Valid To"
              name="validTo"
              value={formData.validTo}
              onChange={handleFieldChange}
              error={fieldErrors.validTo}
              required
            />

            <Field
              type="select"
              label="Is IGST Appl"
              name="isIgstAppl"
              value={formData.isIgstAppl}
              onChange={handleFieldChange}
              options={YES_NO}
              disabled
            />

            <Field
              type="select"
              label="P.O Type"
              name="purchaseOrderType"
              value={formData.purchaseOrderType}
              onChange={handleFieldChange}
              error={fieldErrors.purchaseOrderType}
              options={PTYPE_OPTIONS}
              required
            />

            <Field
              label="GSTN No."
              name="gstnNo"
              value={formData.gstnNo}
              onChange={handleFieldChange}
              disabled
            />

            <Field
              type="select"
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleFieldChange}
              error={fieldErrors.currency}
              options={currencyOptions}
              required
            />

            <Field
              label="Financial Year"
              name="financialYear"
              value={formData.financialYear}
              onChange={handleFieldChange}
            />
          </div>
        </div>

        {/* TABS */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex overflow-x-auto">
              {TABS.map((tab) => (
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

            {activeTab === "itemDetail" && (
              <button
                type="button"
                onClick={addDetailRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

            {activeTab === "taxDetails" && (
              <button
                type="button"
                onClick={addTaxRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Plus size={12} />
              </button>
            )}

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

          {/* ITEM DETAIL */}
          {activeTab === "itemDetail" && (
            <>
              <DynamicTable
                columns={detailColumns}
                rows={detailRows}
                onCellChange={handleDetailCellChange}
                onRemoveRow={removeDetailRow}
              />

              <div className="flex justify-end mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Gross Amount:
                <span className="font-semibold ml-1">{money(grossAmount)}</span>
              </div>
            </>
          )}

          {/* TAX DETAILS */}
          {activeTab === "taxDetails" && (
            <>
              <DynamicTable
                columns={[
                  {
                    key: "particulars",
                    label: "Particulars",
                    type: "select",

                    options: (row) =>
                      row.isSystemRow
                        ? [
                            {
                              value: row.particulars,

                              label: row.particulars,
                            },
                          ]
                        : taxDefinitionOptions,

                    disabled: (row) => Boolean(row.isSystemRow),
                  },

                  {
                    key: "tax",
                    label: "Tax %",
                    type: "number",

                    disabled: (row) => Boolean(row.isSystemRow),
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
                  <strong className="ml-1">{money(grossAmount)}</strong>
                </span>

                <span>
                  Tax:
                  <strong className="ml-1">{money(taxRowsTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {/* ATTACHMENTS */}
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
                          onChange={(e) =>
                            handleFileSelect(index, e.target.files?.[0])
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

          {/* CHARGES & TERMS */}
          {activeTab === "chargesTerms" && (
            <div className="pt-2 space-y-3">
              <div className={fieldGrid}>
                <Field
                  label="Accounts"
                  name="accounts"
                  value={formData.accounts}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Bank"
                  name="bank"
                  value={formData.bank}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Swift Code"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Delivery"
                  name="delivery"
                  value={formData.delivery}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Freight Forwarder"
                  name="freightForwarder"
                  value={formData.freightForwarder}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Freight Type"
                  name="freightType"
                  value={formData.freightType}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Insurance Amount"
                  name="insuranceAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.insuranceAmount}
                  onChange={handleFieldChange}
                />

                <Field
                  label="Mode Of Despatch"
                  name="modeOfDespatch"
                  value={formData.modeOfDespatch}
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
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleFieldChange}
                />

                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={handleFieldChange}
                  options={employeeOptions}
                />

                <Field
                  type="select"
                  label="Checked By"
                  name="checkedBy"
                  value={formData.checkedBy}
                  onChange={handleFieldChange}
                  options={employeeOptions}
                />

                <Field
                  type="select"
                  label="Authorised By"
                  name="authorisedBy"
                  value={formData.authorisedBy}
                  onChange={handleFieldChange}
                  options={employeeOptions}
                />
              </div>

              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Terms and Conditions"
                  name="termsConditions"
                  value={formData.termsConditions}
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
                  label="Cancel Remarks"
                  name="cancelRemarks"
                  value={formData.cancelRemarks}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-3"
                />
              </div>
            </div>
          )}
        </section>

        {/* BUTTONS */}
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

export default PurchaseContractForm;
