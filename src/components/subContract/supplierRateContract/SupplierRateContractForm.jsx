import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import locationMasterAPI from "../../../api/locationMasterAPI";
import branchAPI from "../../../api/branchAPI";
import partyMasterAPI from "../../../api/partyMasterAPI";
import itemAPI from "../../../api/itemAPI";
import unitMasterAPI from "../../../api/unitAPI";
import employeeAPI from "../../../api/employeeAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import { useToast } from "../../Toast/ToastContext";
import supplierRateContractAPI from "../../../api/SubContract/supplierRateContractAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                        */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const cellReadOnlyClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none " +
  "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 " +
  "text-gray-500 dark:text-gray-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-4 gap-y-3 items-start";

// Spacious grid used inside the child tabs so fields breathe more.
const subTabFieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-x-5 gap-y-4 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                      */

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  className = "",
  disabled = false,
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${controlClasses} ${error ? controlErrClasses : ""}`}
        >
          <option value="">-- Select --</option>
          {(options || []).map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={1}
          className={
            "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors resize-none pt-1 scrollbar-hide " +
            "bg-white dark:bg-gray-900 " +
            `${error ? controlErrClasses : "border-gray-300 dark:border-gray-600"} ` +
            "text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
            "dark:focus:ring-blue-400 dark:focus:border-blue-400"
          }
        />

        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${controlClasses} ${error ? controlErrClasses : ""}`}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs whitespace-nowrap text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers                                                               */

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => (
        <th
          key={i}
          className={`p-1 whitespace-nowrap ${i === 0
            ? "w-8 text-center"
            : i === headers.length - 1
              ? "w-20 text-left"
              : "text-left"
            } dark:text-white`}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
    <td className="p-2 text-center">
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
  </tr>
);

/* Generic dynamic table. Supports text / select / date / readonly columns.
   Options may be plain strings or { value, label } objects. */
const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow, headerData = {} }) => {
  const { isIgstApplicable } = headerData;
  const taxType = isIgstApplicable === "YES" ? "IGST" : "SGST";

  // Filter columns based on tax type
  const visibleColumns = columns.filter((col) => {
    if (taxType === "IGST") {
      if (col.key === "sgstRate" || col.key === "sgstAmount" ||
        col.key === "cgstRate" || col.key === "cgstAmount") {
        return false;
      }
    }
    if (taxType === "SGST") {
      if (col.key === "igstRate" || col.key === "igstAmount") {
        return false;
      }
    }
    return true;
  });

  return (
    <TableWrapper>
      <TableHead headers={["#", ...visibleColumns.map((c) => c.label), "Action"]} />
      <tbody>
        {rows.map((row, idx) => (
          <TableRow
            key={idx}
            index={idx}
            onRemove={() => onRemoveRow(idx)}
            disabled={rows.length <= 1}
          >
            {visibleColumns.map((col) => {
              if (col.type === "select") {
                // Find the matching option for the current value
                const currentValue = row[col.key] || "";
                const matchedOption = (col.options || []).find(
                  (opt) => String(opt.value) === String(currentValue) ||
                    String(opt.itemCode) === String(currentValue) ||
                    String(opt.label) === String(currentValue)
                );
                const selectValue = matchedOption ? matchedOption.value : currentValue;

                return (
                  <td className="p-2 align-top" key={col.key}>
                    <select
                      value={selectValue}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        const selectedItem = (col.options || []).find((opt) => {
                          const optionValue =
                            typeof opt === "object"
                              ? opt.value
                              : opt;

                          const optionLabel =
                            typeof opt === "object"
                              ? opt.label ?? opt.valuesDescription ?? opt.value
                              : opt;

                          return (
                            String(optionValue) === String(selectedValue) ||
                            String(optionLabel) === String(selectedValue)
                          );
                        });

                        onCellChange(
                          idx,
                          col.key,
                          selectedValue,
                          selectedItem
                        );
                      }}
                      className={cellInputClasses}
                    >
                      <option value="">-- Select --</option>

                      {(col.options || []).map((opt) => {
                        const optionLabel =
                          typeof opt === "object"
                            ? opt.label ??
                            opt.valuesDescription ??
                            opt.value
                            : opt;

                        return (
                          <option
                            key={optionLabel}
                            value={typeof opt === "object" ? opt.value : opt}
                          >
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                );
              }

              if (col.type === "file") {
                return (
                  <td className="p-2 align-top" key={col.key}>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onCellChange(idx, col.key, file);
                          }
                        }}
                        className="text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      {row[col.key] && typeof row[col.key] === 'object' && (
                        <span className="text-xs text-gray-500">{row[col.key].name}</span>
                      )}
                    </div>
                  </td>
                );
              }

              if (col.type === "date") {
                return (
                  <td className="p-2 align-top" key={col.key}>
                    <input
                      type="date"
                      value={row[col.key] || ""}
                      onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                      className={cellInputClasses}
                    />
                  </td>
                );
              }

              if (col.type === "textarea") {
                return (
                  <td className="p-2 align-top" key={col.key}>
                    <textarea
                      value={row[col.key] || ""}
                      onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                      className={`${cellInputClasses} min-h-[60px] resize-y`}
                      rows={2}
                    />
                  </td>
                );
              }

              // Check if this is a tax column that should be disabled based on tax type
              let isDisabled = col.readOnly || false;
              if (taxType === "IGST") {
                if (col.key === "sgstRate" || col.key === "sgstAmount" ||
                  col.key === "cgstRate" || col.key === "cgstAmount") {
                  isDisabled = true;
                }
              }
              if (taxType === "SGST") {
                if (col.key === "igstRate" || col.key === "igstAmount") {
                  isDisabled = true;
                }
              }

              return (
                <td className="p-2 align-top" key={col.key}>
                  <input
                    type={col.type === "number" ? "number" : "text"}
                    value={row[col.key] || ""}
                    readOnly={isDisabled || col.readOnly}
                    onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                    className={
                      isDisabled || col.readOnly ? cellReadOnlyClasses : cellInputClasses
                    }
                  />
                </td>
              );
            })}
          </TableRow>
        ))}
      </tbody>
    </TableWrapper>
  );
};

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const TAX_CODES = ["TX-STD", "TX-ZERO", "TX-EXEMPT", "TX-COMP"];
const SCOPE_OPTIONS = ["Local", "Inter-State", "SEZ", "Overseas"];
const TAX_TYPES = ["SGST", "CGST", "IGST", "GST", "Exempt", "Nil Rated"];
const PAYMENT_TERMS = [
  "40 Days",
  "Immediate",
  "60 Days",
  "With in 7 Days",
  "Against Performa Invoice",
  "45 Days Against Delivery",
  "15 Days",
  "30 Days",
  "45 Days",
  "50% Advance and Balance Against Completion",
  "70 Days PDC",
  "90 Days PDC",
  "30 Days PDC",
];
const FREIGHT_TYPES = ["Macurex", "Supplier"];
const PACKING_TYPES = ["Macurex", "Supplier"];
const MODE_OF_DESPATCH = ["Road", "Rail", "Air", "Sea", "Courier"];
const YES_NO = ["YES", "NO"];

const CHILD_TABS = [
  { key: "itemDetails", label: "Item Details", kind: "table" },
  { key: "taxDetails", label: "Tax Details", kind: "table" },
  { key: "terms", label: "Terms And Conditions", kind: "fields" },
];

const emptyItemDetailRow = () => ({
  itemCode: "",
  itemDescription: "",
  unit: "",
  unitMasterId: "",
  platingType: "",
  thickness: "",
  rate: "",
  sgstRate: "",
  sgstAmount: "",
  cgstRate: "",
  cgstAmount: "",
  igstRate: "",
  igstAmount: "",
  validFrom: "",
  validTo: "",
  toolAmortizationRate: "",
});

const emptyTaxDetailRow = () => ({
  particular: "",
  amount: "",
  isSystemRow: false,
});

const emptyTerms = () => ({
  discountPct: "",
  paymentTerms: "",
  deliveryTerms: "",
  freight: "",
  freightType: "",
  packingType: "",
  insurance: "",
  modeOfDespatch: "",
  inlandCharge: "",
  preparedBy: "",
  authorizedBy: "",
  narration: "",
});

const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* ---------------------------------------------------------------------------- */

const SupplierRateContractForm = ({ data, onBack }) => {
  const [orgId] = useState(Number(localStorage.getItem("orgId")) || 0);
  const [finYear] = useState(Number(localStorage.getItem("finYear")) || 0);
  const [branch] = useState(Number(localStorage.getItem("branchId")) || 0);
  const { addToast } = useToast();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const orgName = (userData?.companyVO?.companyName || userData?.orgName || "").trim();
  const isMacurex = ["mecurex", "macurex"].includes(orgName.toLowerCase());

  const [activeChildTab, setActiveChildTab] = useState("itemDetails");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isUpdatingRef = useRef(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [contractForOptions, setContractForOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMasterMap, setItemMasterMap] = useState({});
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [listOfValuesData, setListOfValuesData] = useState({});

  const [header, setHeader] = useState(() => ({
    plantId: data?.plantId || "",
    department: data?.department || "",
    belongsTo: data?.belongsTo || "",
    contractNo: data?.contractNo || "",
    contractDate: data?.contractDate || todayStr(),
    validFrom: data?.validFrom || "",
    validTo: data?.validTo || "",
    vendorId: data?.vendorId || "",
    vendorName: data?.vendorName || "",
    vendorGstNo: data?.vendorGstNo || "",
    vendorGstStateId: data?.vendorGstStateId || "",
    vendorGstState: data?.vendorGstState || "",
    vendorIgstApplicable: data?.vendorIgstApplicable || "",
    contractFor: data?.contractFor || "",
    deliveryDate: data?.deliveryDate || "",
    gstState: data?.gstState || "",
    gstStateId: data?.gstStateId || "",
    isIgstApplicable: data?.isIgstApplicable || "",
    gstinNo: data?.gstinNo || "",
    taxCode: data?.taxCode || "",
    serviceName: data?.serviceName || "",
    serviceId: data?.serviceId || "",
    hsnSacCode: data?.hsnSacCode || "",
    hsnId: data?.hsnId || "",
    scope: data?.scope || "",
    scrap: data?.scrap || "",
    taxType: data?.taxType || "SGST",
    taxPct: data?.taxPct ?? "",
    active: data?.active !== false,
  }));

  const [itemDetailRows, setItemDetailRows] = useState(
    data?.itemDetails?.length ? data.itemDetails : [emptyItemDetailRow()],
  );
  const [taxDetailRows, setTaxDetailRows] = useState(
    data?.taxDetails?.length ? data.taxDetails : [emptyTaxDetailRow()],
  );
  const [terms, setTerms] = useState({
    ...emptyTerms(),
    ...data?.terms,
  });

  /* ---------------- Transform Data for Form ---------------- */

  // Transform the nested API response to flat structure for the form
  const transformDataForForm = useCallback((apiData) => {
    if (!apiData) return null;

    return {
      id: apiData.id,
      plantId: apiData.branch?.id || "",
      department: apiData.department?.id || "",
      belongsTo: apiData.belongsTo || "",
      contractNo: apiData.docId || "",
      contractDate: apiData.docDate || "",
      validFrom: apiData.validFrom || "",
      validTo: apiData.validTo || "",
      vendorId: apiData.customer?.customerId || "",
      vendorName: apiData.customer?.customerName || "",
      vendorGstNo: apiData.customer?.gstNo || "",
      vendorGstStateId: apiData.gstState?.id || "",
      vendorGstState: apiData.gstState?.gstState || "",
      vendorIgstApplicable: apiData.igstApplicable ? "YES" : "NO",
      contractFor: apiData.contractFor || "",
      deliveryDate: apiData.deliveryDate || "",
      gstState: apiData.gstState?.gstState || "",
      gstStateId: apiData.gstState?.id || "",
      isIgstApplicable: apiData.igstApplicable ? "YES" : "NO",
      gstinNo: apiData.customer?.gstNo || "",
      taxCode: apiData.taxCode || "",
      serviceName: apiData.serviceName?.id || "",
      serviceId: apiData.serviceName?.id || "",
      hsnSacCode: apiData.hsnSacCode?.hsn || "",
      hsnId: apiData.hsnSacCode?.id || "",
      scope: apiData.scope || "",
      scrap: apiData.scrap ? "YES" : "NO",
      taxType: apiData.taxType || "SGST",
      taxPct: apiData.taxPercentage || "",
      active: apiData.active === "Active",
      // Item details
      itemDetails: apiData.supplierRateContractItemDetailsDTO?.map((item) => ({
        itemCode: item.incomingItemCode?.itemCode || "",
        itemDescription: item.incomingItemCode?.itemDescription || "",
        unit: item.incomingItemCode?.unit?.unitId || "",
        unitMasterId: item.incomingItemCode?.unit?.id || "",
        platingType: item.platingType || "",
        thickness: item.thickness || "",
        rate: item.rate || "",
        sgstRate: item.sgstRate || "",
        sgstAmount: item.sgstAmount || "",
        cgstRate: item.cgstRate || "",
        cgstAmount: item.cgstAmount || "",
        igstRate: item.igstRate || "",
        igstAmount: item.igstAmount || "",
        validFrom: item.validFrom || "",
        validTo: item.validTo || "",
        toolAmortizationRate: item.toolAmortizationRate || "",
      })) || [],
      // Tax details
      taxDetails: apiData.supplierRateContractTaxDetailsDTO?.map((tax) => ({
        particular: tax.particulars || "",
        amount: tax.amount || "",
        isSystemRow: ["Gross Amount", "IGST", "CGST", "SGST"].includes(tax.particulars || ""),
      })) || [],
      // Terms
      terms: {
        discountPct: apiData.discount || "",
        paymentTerms: apiData.paymentsTerms || "",
        deliveryTerms: apiData.deliveryTerms || "",
        freight: apiData.freight || "",
        freightType: apiData.freightType || "",
        packingType: apiData.packingType || "",
        insurance: apiData.insurance || "",
        modeOfDespatch: apiData.modeOfDespatch || "",
        inlandCharge: apiData.inlandCharge || "",
        preparedBy: apiData.preparedBy?.employeeId || "",
        authorizedBy: apiData.authoriedBy?.employeeId || "",
        narration: apiData.narration || "",
      },
    };
  }, []);

  /* ---------------- Lookup loading ---------------- */

  const loadPlants = useCallback(async () => {
    try {
      if (isMacurex) {
        const res = await locationMasterAPI.getPlants(orgId);
        setPlantOptions(
          (res || []).map((p) => ({
            value: p.id,
            label: p.plantName || p.plantId || p.id,
          })),
        );
      } else {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (res || []).map((b) => ({
            value: b.id,
            label: b.branchName || b.id,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load plant options:", error);
      setPlantOptions([]);
    }
  }, [orgId, isMacurex]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAllDepartments(orgId);
      const deptList = res?.paramObjectsMap?.departmentVO || [];
      setDepartmentOptions(
        deptList.map((d) => ({
          value: d.id,
          label: d.departmentName || d.departmentCode || d.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load department options:", error);
      setDepartmentOptions([]);
    }
  }, [orgId]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("SDS BELONGS TO", orgId);
      setBelongsToOptions(
        (res || []).map((item) => ({
          value: item.id,
          label: item.valuesDescription || item.valueDescription || item.id,
        }))
      );
    } catch (error) {
      console.error("Failed to load belongs to options:", error);
      setBelongsToOptions([]);
    }
  }, [orgId]);

  const loadContractFor = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup(
        "CONTRACT_FOR",
        orgId
      );

      setContractForOptions(
        (res || []).map((item) => {
          const valueDescription =
            item.valuesDescription ||
            item.valueDescription ||
            item.label ||
            "";

          return {
            value: valueDescription,
            label: valueDescription,
            id: item.id,
          };
        })
      );
    } catch (error) {
      console.error("Failed to load contract for options:", error);
      setContractForOptions([]);
    }
  }, [orgId]);

  const loadListOfValuesData = useCallback(async () => {
    try {
      const groups = ["PARTICULARS"];
      const result = {};

      await Promise.all(
        groups.map(async (group) => {
          try {
            const response =
              await listOfValuesAPI.getListValuesGroup(
                group,
                orgId
              );

            let items = [];

            if (response?.paramObjectsMap?.listValues) {
              items = response.paramObjectsMap.listValues;
            } else if (Array.isArray(response)) {
              items = response;
            }

            result[group] = items.map((item) => {
              const label =
                item.valuesDescription ||
                item.label ||
                item.name ||
                item.value ||
                "";

              return {
                ...item,
                value: label,
                label: label,
              };
            });
          } catch (err) {
            console.error(`${group} failed`, err);
            result[group] = [];
          }
        })
      );

      setListOfValuesData(result);
    } catch (err) {
      console.error("Error loading ListOfValues:", err);
    }
  }, [orgId]);

  const loadVendors = useCallback(async () => {
    try {
      const res = await supplierRateContractAPI.getCustomersForSupplierRateContract(branch, orgId);
      const customerList = res?.paramObjectsMap?.customerList || [];
      setVendorOptions(
        customerList.map((v) => ({
          value: v.customerId,
          label: `${v.customerCode} - ${v.customerName}`,
          customer: v,
        })),
      );
    } catch (error) {
      console.error("Failed to load vendor options:", error);
      setVendorOptions([]);
    }
  }, [orgId, branch]);

  const loadServices = useCallback(async () => {
    try {
      const res = await supplierRateContractAPI.getServicesForSupplierRateContract(branch, orgId);
      const serviceList = res?.paramObjectsMap?.serviceList || [];
      setServiceOptions(
        serviceList.map((s) => ({
          value: s.serviceId,
          label: `${s.serviceName} - ${s.serviceDescription || ''}`,
          service: s,
        })),
      );
    } catch (error) {
      console.error("Failed to load service options:", error);
      setServiceOptions([]);
    }
  }, [orgId, branch]);

  const loadItemDropdown = useCallback(async () => {
    try {
      const res = await supplierRateContractAPI.getSupplierRateContractItemDropdown(branch, orgId);
      const itemDetails = res?.paramObjectsMap?.itemDetails || [];
      const map = {};
      const options = itemDetails.map((it) => {
        map[it.item] = it;
        return {
          value: it.item,
          label: `${it.item} - ${it.itemDesc || ''}`,
          itemId: it.itemId,
          itemDesc: it.itemDesc,
          unitMasterId: it.unitmasterId,
          unitId: it.unitId,
          unitDescription: it.unitDescription,
        };
      });
      setItemOptions(options);
      setItemMasterMap(map);
    } catch (error) {
      console.error("Failed to load item options:", error);
      setItemOptions([]);
      setItemMasterMap({});
    }
  }, [orgId, branch]);

  const loadDocId = useCallback(async () => {
    if (data?.contractNo) {
      return;
    }

    try {
      const currentYear = finYear || new Date().getFullYear();
      const res = await supplierRateContractAPI.getSupplierRateContractDocId(currentYear, orgId);
      const docId = res?.paramObjectsMap?.supplierRateContractDocId || "";
      if (docId) {
        setHeader((prev) => ({
          ...prev,
          contractNo: docId,
        }));
      }
    } catch (error) {
      console.error("Failed to load document ID:", error);
    }
  }, [orgId, data?.contractNo, finYear]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getEmployeeByOrgId(orgId);
      setEmployeeOptions(
        (res || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.id,
        })),
      );
    } catch (error) {
      console.error("Failed to load employee options:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  // Load all data when component mounts
  useEffect(() => {
    if (!orgId) {
      console.warn("No orgId found, skipping data loading");
      return;
    }

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadPlants(),
          loadDepartments(),
          loadBelongsTo(),
          loadContractFor(),
          loadDocId(),
          loadVendors(),
          loadServices(),
          loadItemDropdown(),
          loadEmployees(),
          loadListOfValuesData(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [orgId, branch, loadPlants, loadDepartments, loadBelongsTo, loadContractFor, loadDocId, loadVendors, loadServices, loadItemDropdown, loadEmployees, loadListOfValuesData]);

  // Populate form with data if provided
  useEffect(() => {
    if (data && data.id && itemOptions.length > 0) {
      const transformedData = transformDataForForm(data);
      if (transformedData) {
        setHeader({
          plantId: transformedData.plantId || "",
          department: transformedData.department || "",
          belongsTo: transformedData.belongsTo || "",
          contractNo: transformedData.contractNo || "",
          contractDate: transformedData.contractDate || todayStr(),
          validFrom: transformedData.validFrom || "",
          validTo: transformedData.validTo || "",
          vendorId: transformedData.vendorId || "",
          vendorName: transformedData.vendorName || "",
          vendorGstNo: transformedData.vendorGstNo || "",
          vendorGstStateId: transformedData.vendorGstStateId || "",
          vendorGstState: transformedData.vendorGstState || "",
          vendorIgstApplicable: transformedData.vendorIgstApplicable || "",
          contractFor: transformedData.contractFor || "",
          deliveryDate: transformedData.deliveryDate || "",
          gstState: transformedData.gstState || "",
          gstStateId: transformedData.gstStateId || "",
          isIgstApplicable: transformedData.isIgstApplicable || "",
          gstinNo: transformedData.gstinNo || "",
          taxCode: transformedData.taxCode || "",
          serviceName: transformedData.serviceName || "",
          serviceId: transformedData.serviceId || "",
          hsnSacCode: transformedData.hsnSacCode || "",
          hsnId: transformedData.hsnId || "",
          scope: transformedData.scope || "",
          scrap: transformedData.scrap || "",
          taxType: transformedData.taxType || "SGST",
          taxPct: transformedData.taxPct || "",
          active: transformedData.active !== false,
        });

        if (transformedData.itemDetails?.length) {
          // Ensure itemCode matches the options value
          const mappedItems = transformedData.itemDetails.map((item) => {
            // Find matching option
            const matchedOpt = itemOptions.find(
              (opt) => String(opt.value) === String(item.itemCode) ||
                String(opt.itemCode) === String(item.itemCode)
            );
            return {
              ...item,
              itemCode: matchedOpt ? matchedOpt.value : item.itemCode,
            };
          });
          setItemDetailRows(mappedItems);
        }

        if (transformedData.taxDetails?.length) {
          setTaxDetailRows(transformedData.taxDetails);
        }

        if (transformedData.terms) {
          setTerms({
            ...emptyTerms(),
            ...transformedData.terms,
          });
        }
      }
    }
  }, [data, itemOptions, transformDataForForm]);

  // Calculate tax details
  const calculateTaxDetails = useCallback(() => {
    if (isUpdatingRef.current) return;

    const totalAmount = itemDetailRows.reduce(
      (sum, item) => sum + (Number(item.rate) || 0),
      0,
    );

    const taxType = header.isIgstApplicable === "YES" ? "IGST" : "SGST";

    let sgstTotal = 0,
      cgstTotal = 0,
      igstTotal = 0;

    itemDetailRows.forEach((item) => {
      sgstTotal += Number(item.sgstAmount) || 0;
      cgstTotal += Number(item.cgstAmount) || 0;
      igstTotal += Number(item.igstAmount) || 0;
    });

    const userAddedRows = taxDetailRows.filter(
      (item) => !item.isSystemRow,
    );

    const systemRows = [];

    systemRows.push({
      particular: "Gross Amount",
      amount: totalAmount,
      isSystemRow: true,
    });

    if (taxType === "IGST") {
      systemRows.push({
        particular: "IGST",
        amount: igstTotal,
        isSystemRow: true,
      });
    } else {
      systemRows.push({
        particular: "SGST",
        amount: sgstTotal,
        isSystemRow: true,
      });
      systemRows.push({
        particular: "CGST",
        amount: cgstTotal,
        isSystemRow: true,
      });
    }

    const allTaxEntries = [...systemRows, ...userAddedRows];
    setTaxDetailRows(allTaxEntries);
  }, [itemDetailRows, taxDetailRows, header.isIgstApplicable]);

  // Calculate row calculations
  const calculateRowCalculation = useCallback((index) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const rate = Number(itemDetailRows[index]?.rate) || 0;
      const sgstRate = Number(itemDetailRows[index]?.sgstRate) || 0;
      const cgstRate = Number(itemDetailRows[index]?.cgstRate) || 0;
      const igstRate = Number(itemDetailRows[index]?.igstRate) || 0;
      const toolAmortizationRate = Number(itemDetailRows[index]?.toolAmortizationRate) || 0;
      const taxType = header.isIgstApplicable === "YES" ? "IGST" : "SGST";

      let sgstAmount = 0,
        cgstAmount = 0,
        igstAmount = 0;

      // Calculate tax amounts based on rate + tool amortization rate
      const totalRate = rate + toolAmortizationRate;

      if (taxType === "IGST") {
        igstAmount = (totalRate * igstRate) / 100;
      } else {
        sgstAmount = (totalRate * sgstRate) / 100;
        cgstAmount = (totalRate * cgstRate) / 100;
      }

      setItemDetailRows((prev) =>
        prev.map((row, i) => {
          if (i === index) {
            return {
              ...row,
              sgstAmount: taxType === "SGST" ? sgstAmount : 0,
              cgstAmount: taxType === "SGST" ? cgstAmount : 0,
              igstAmount: taxType === "IGST" ? igstAmount : 0,
            };
          }
          return row;
        })
      );

      setTimeout(() => {
        calculateTaxDetails();
      }, 50);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [header.isIgstApplicable, calculateTaxDetails, itemDetailRows]);

  // Handle tax type change
  const handleTaxTypeChange = useCallback((newTaxType) => {
    setHeader((prev) => ({
      ...prev,
      taxType: newTaxType,
      isIgstApplicable: newTaxType === "IGST" ? "YES" : "NO"
    }));

    // Recalculate all rows with new tax type
    setTimeout(() => {
      itemDetailRows.forEach((_, index) => {
        calculateRowCalculation(index);
      });
    }, 100);
  }, [itemDetailRows, calculateRowCalculation]);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "vendorId") {
        const vendor = vendorOptions.find((v) => String(v.value) === String(value));
        if (vendor?.customer) {
          const customer = vendor.customer;
          next.vendorName = customer.customerName || "";
          next.vendorGstNo = customer.gstNo || "";
          next.vendorGstStateId = customer.gstStateId || "";
          next.vendorGstState = customer.gstState || "";
          next.vendorIgstApplicable = customer.igstApplicable ? "YES" : "NO";

          // Auto-populate GST State and IGST Applicable from vendor
          if (customer.gstStateId) {
            next.gstStateId = customer.gstStateId;
            next.gstState = customer.gstState || "";
          }
          if (customer.igstApplicable !== undefined) {
            next.isIgstApplicable = customer.igstApplicable ? "YES" : "NO";
            next.taxType = customer.igstApplicable ? "IGST" : "SGST";
          }
          if (customer.gstNo) {
            next.gstinNo = customer.gstNo;
          }
        }
      }

      if (name === "serviceName") {
        const service = serviceOptions.find((s) => String(s.value) === String(value));
        if (service?.service) {
          const serviceData = service.service;
          next.serviceId = serviceData.serviceId || "";
          next.hsnId = serviceData.hsnId || "";
          next.hsnSacCode = serviceData.hsn || "";
          next.taxPct = serviceData.rate || 0;

          if (serviceData.igstRate && serviceData.igstRate > 0) {
            next.isIgstApplicable = "YES";
            next.taxType = "IGST";
            setItemDetailRows((prev) =>
              prev.map((row) => ({
                ...row,
                igstRate: serviceData.igstRate || 0,
                sgstRate: 0,
                cgstRate: 0,
              }))
            );
          } else {
            next.isIgstApplicable = "NO";
            next.taxType = "SGST";
            setItemDetailRows((prev) =>
              prev.map((row) => ({
                ...row,
                sgstRate: serviceData.sgstRate || 0,
                cgstRate: serviceData.cgstRate || 0,
                igstRate: 0,
              }))
            );
          }

          setTimeout(() => {
            itemDetailRows.forEach((_, index) => {
              calculateRowCalculation(index);
            });
          }, 100);
        }
      }

      if (name === "taxType") {
        handleTaxTypeChange(value);
      }

      return next;
    });
  };

  const handleTermsChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setTerms((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemCellChange = (idx, key, value, selectedItem = null) => {
    setItemDetailRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        let next = { ...row, [key]: value };

        if (key === "itemCode") {
          // If selectedItem is provided, use it
          if (selectedItem) {
            const item = selectedItem;
            next = {
              ...next,
              itemCode: item.value || item.itemCode || "",
              itemDescription: item.itemDesc || item.itemDescription || "",
              unit: item.unitId || item.unit || "",
              unitMasterId: item.unitMasterId || item.unitmasterId || "",
            };
          } else {
            // If no selectedItem, try to find it from itemOptions
            const foundItem = itemOptions.find(
              (opt) => String(opt.value) === String(value) || String(opt.itemCode) === String(value)
            );
            if (foundItem) {
              next = {
                ...next,
                itemCode: foundItem.value || foundItem.itemCode || "",
                itemDescription: foundItem.itemDesc || foundItem.itemDescription || "",
                unit: foundItem.unitId || foundItem.unit || "",
                unitMasterId: foundItem.unitMasterId || foundItem.unitmasterId || "",
              };
            }
          }
        }

        if (["rate", "sgstRate", "cgstRate", "igstRate"].includes(key)) {
          const rate = parseFloat(next.rate) || 0;
          const sgstRate = parseFloat(next.sgstRate) || 0;
          const cgstRate = parseFloat(next.cgstRate) || 0;
          const igstRate = parseFloat(next.igstRate) || 0;

          const taxType =
            header.isIgstApplicable === "YES" ? "IGST" : "SGST";

          if (taxType === "IGST") {
            next.sgstAmount = 0;
            next.cgstAmount = 0;
            next.igstAmount = (rate * igstRate) / 100;
          } else {
            next.sgstAmount = (rate * sgstRate) / 100;
            next.cgstAmount = (rate * cgstRate) / 100;
            next.igstAmount = 0;
          }

          // Tool Amortization Rate = CGST + SGST + IGST
          next.toolAmortizationRate =
            (Number(next.cgstAmount) || 0) +
            (Number(next.sgstAmount) || 0) +
            (Number(next.igstAmount) || 0);
        }

        return next;
      })
    );

    setTimeout(() => {
      calculateTaxDetails();
    }, 100);
  };

  const handleTaxCellChange = (idx, key, value) => {
    setTaxDetailRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddItemRow = () =>
    setItemDetailRows((prev) => [...prev, emptyItemDetailRow()]);
  const handleRemoveItemRow = (idx) =>
    setItemDetailRows((prev) => prev.filter((_, i) => i !== idx));
  const handleAddTaxRow = () =>
    setTaxDetailRows((prev) => [...prev, emptyTaxDetailRow()]);
  const handleRemoveTaxRow = (idx) => {
    const row = taxDetailRows[idx];
    if (row?.isSystemRow) {
      addToast("Cannot delete system calculated rows", "error");
      return;
    }
    setTaxDetailRows((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ---------------- Validation & Save ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plantId) errors.plantId = "Plant ID is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.contractNo?.trim()) errors.contractNo = "Contract No is required";
    if (!header.contractDate) errors.contractDate = "Contract Date is required";
    if (!header.validFrom) errors.validFrom = "Valid From is required";
    if (
      header.validFrom &&
      header.validTo &&
      header.validTo < header.validFrom
    )
      errors.validTo = "Valid To cannot be before Valid From";
    if (!header.vendorId) errors.vendorId = "Vendor Id is required";
    if (!header.vendorName?.trim()) errors.vendorName = "Vendor Name is required";
    if (!header.contractFor) errors.contractFor = "Contract For is required";
    if (!header.gstStateId) errors.gstStateId = "GST State is required";
    if (!header.isIgstApplicable)
      errors.isIgstApplicable = "Is IGST Applicable is required";
    if (!header.taxType) errors.taxType = "Tax Type is required";

    const hasValidItemRow = itemDetailRows.some(
      (r) =>
        r.itemCode &&
        Number(r.rate) > 0 &&
        r.validFrom &&
        r.validTo,
    );
    if (!hasValidItemRow)
      errors.itemDetails =
        "Add at least one item with Item Code, Rate, Valid From and Valid To";

    if (!terms.paymentTerms) errors.paymentTerms = "Payment Terms is required";
    if (!terms.modeOfDespatch)
      errors.modeOfDespatch = "Mode of Despatch is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      const firstError = Object.values(fieldErrors)[0];
      addToast(firstError, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const isUpdate = Boolean(data?.id);

      // Build the payload according to the API schema
      const payload = {
        active: header.active !== false,
        belongsTo: header.belongsTo || "",
        branch: Number(header.plantId),
        cancelRemarks: "",
        contractFor: header.contractFor || "",
        createdBy: localStorage.getItem("usersId") || "SYSTEM",
        customer: Number(header.vendorId) || 0,
        deliveryDate: header.deliveryDate || "",
        deliveryTerms: terms.deliveryTerms || "",
        department: Number(header.department) || 0,
        discount: Number(terms.discountPct) || 0,
        financialYear: String(finYear) || new Date().getFullYear().toString(),
        freight: Number(terms.freight) || 0,
        freightType: terms.freightType || "",
        gstState: Number(header.gstStateId) || 0,
        hsnSacCode: Number(header.hsnId) || Number(header.hsnSacCode) || 0,
        igstApplicable: header.isIgstApplicable === "YES",
        inlandCharge: Number(terms.inlandCharge) || 0,
        insurance: Number(terms.insurance) || 0,
        modeOfDespatch: terms.modeOfDespatch || "",
        narration: terms.narration || "",
        orgId: orgId,
        packingType: terms.packingType || "",
        paymentsTerms: terms.paymentTerms || "",
        preparedBy: Number(terms.preparedBy) || 0,
        authoriedBy: Number(terms.authorizedBy) || 0,
        scrap: header.scrap === "YES",
        serviceName: Number(header.serviceId) || Number(header.serviceName) || 0,
        taxPercentage: Number(header.taxPct) || 0,
        taxType: header.taxType || "SGST",
        validFrom: header.validFrom || "",
        validTo: header.validTo || "",
        ...(isUpdate ? { id: Number(data.id) } : {}),
      };

      // Add item details
      payload.supplierRateContractItemDetailsDTO = itemDetailRows
        .filter((row) => row.itemCode && row.itemCode.trim() !== "")
        .map((row) => {
          // Find the selected item to get the actual IDs
          const selectedItem = itemOptions.find(
            (opt) => opt.label === row.itemCode || opt.value === row.itemCode
          );

          return {
            incomingItemCode: Number(selectedItem?.itemId) || Number(selectedItem?.value) || 0,
            platingType: row.platingType || "",
            purchaseUnit: Number(row.unitMasterId) || Number(selectedItem?.unitMasterId) || 0,
            rate: Number(row.rate) || 0,
            sgstRate: Number(row.sgstRate) || 0,
            cgstRate: Number(row.cgstRate) || 0,
            igstRate: Number(row.igstRate) || 0,
            thickness: Number(row.thickness) || 0,
            toolAmortizationRate: Number(row.toolAmortizationRate) || 0,
            validFrom: row.validFrom || "",
            validTo: row.validTo || "",
          };
        });

      // Add tax details
      payload.supplierRateContractTaxDetailsDTO = taxDetailRows
        .filter((row) => row.particular && row.particular.trim() !== "")
        .map((row) => ({
          amount: Number(row.amount) || 0,
          particulars: row.particular || "",
        }));

      console.log("Saving payload:", payload);

      const response = await supplierRateContractAPI.createUpdateSupplierRateContract(payload);

      console.log("API Response:", response);

      const isSuccess = response?.status === true || response?.status === "Ok" || response?.status === "SUCCESS";

      if (isSuccess) {
        addToast(
          isUpdate
            ? "Supplier Rate Contract updated successfully!"
            : "Supplier Rate Contract created successfully!",
          "success"
        );
        onBack?.();
      } else {
        const errorMessage = response?.paramObjectsMap?.message || response?.message || "Failed to save Supplier Rate Contract.";
        addToast(errorMessage, "error");
      }
    } catch (err) {
      console.error("Save Error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Something went wrong";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTabMeta = CHILD_TABS.find((t) => t.key === activeChildTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data && data.id
            ? "Edit Supplier Rate Contract"
            : "Add Supplier Rate Contract"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Info ---------------- */}
        <div>
          <SectionHeader>Supplier Rate Contract</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant ID"
              name="plantId"
              value={header.plantId}
              onChange={handleHeaderChange}
              error={fieldErrors.plantId}
              options={plantOptions}
              required
            />
            <Field
              type="select"
              label="Department"
              name="department"
              value={header.department}
              onChange={handleHeaderChange}
              error={fieldErrors.department}
              options={departmentOptions}
              required
            />
            <Field
              type="select"
              label="Belongs To"
              name="belongsTo"
              value={header.belongsTo}
              onChange={handleHeaderChange}
              options={belongsToOptions}
            />
            <Field
              label="Contract No"
              name="contractNo"
              value={header.contractNo}
              onChange={handleHeaderChange}
              error={fieldErrors.contractNo}
              required
              disabled={!data}
            />
            <Field
              type="date"
              label="Contract Date"
              name="contractDate"
              value={header.contractDate}
              onChange={handleHeaderChange}
              error={fieldErrors.contractDate}
              required
              disabled
            />
            <Field
              type="date"
              label="Valid From"
              name="validFrom"
              value={header.validFrom}
              onChange={handleHeaderChange}
              error={fieldErrors.validFrom}
              required
            />
            <Field
              type="date"
              label="Valid To"
              name="validTo"
              value={header.validTo}
              onChange={handleHeaderChange}
              error={fieldErrors.validTo}
            />
            <Field
              type="select"
              label="Vendor Id"
              name="vendorId"
              value={header.vendorId}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorId}
              options={vendorOptions}
              required
            />
            <Field
              label="Vendor Name"
              name="vendorName"
              value={header.vendorName}
              onChange={handleHeaderChange}
              error={fieldErrors.vendorName}
              required
              disabled
            />
            <Field
              label="Vendor GST No"
              name="vendorGstNo"
              value={header.vendorGstNo}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              label="Vendor GST State"
              name="vendorGstState"
              value={header.vendorGstState}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Contract For"
              name="contractFor"
              value={header.contractFor}
              onChange={handleHeaderChange}
              error={fieldErrors.contractFor}
              options={contractForOptions}
              required
            />
            <Field
              type="date"
              label="Delivery Date"
              name="deliveryDate"
              value={header.deliveryDate}
              onChange={handleHeaderChange}
            />
            <Field
              label="GST State"
              name="gstState"
              value={header.gstState}
              onChange={handleHeaderChange}
              error={fieldErrors.gstStateId}
              required
              disabled
            />
            <Field
              label="Is IGST Applicable"
              name="isIgstApplicable"
              value={header.isIgstApplicable}
              onChange={handleHeaderChange}
              error={fieldErrors.isIgstApplicable}
              required
              disabled
            />
            <Field
              label="GSTIN No"
              name="gstinNo"
              value={header.gstinNo}
              onChange={handleHeaderChange}
            />
            <Field
              type="select"
              label="Service Name"
              name="serviceName"
              value={header.serviceName}
              onChange={handleHeaderChange}
              options={serviceOptions}
            />
            <Field
              label="HSN/SAC Code"
              name="hsnSacCode"
              value={header.hsnSacCode}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="select"
              label="Scrap"
              name="scrap"
              value={header.scrap}
              onChange={handleHeaderChange}
              options={YES_NO}
            />
            <Field
              type="select"
              label="Tax Type"
              name="taxType"
              value={header.taxType}
              onChange={handleHeaderChange}
              error={fieldErrors.taxType}
              options={TAX_TYPES}
              required
            />
            <Field
              type="number"
              label="Tax %"
              name="taxPct"
              value={header.taxPct}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* ---------------- Child Tabs ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex flex-wrap">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${activeChildTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTabMeta.kind === "table" && (
              <button
                type="button"
                onClick={() =>
                  activeChildTab === "itemDetails"
                    ? handleAddItemRow()
                    : handleAddTaxRow()
                }
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Item Details tab */}
          {activeChildTab === "itemDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "itemCode",
                    label: "Incoming Item Code(s)",
                    type: "select",
                    options: itemOptions,
                  },
                  {
                    key: "itemDescription",
                    label: "Incoming Item Description",
                    readOnly: true,
                  },
                  {
                    key: "unit",
                    label: "Purchase Unit",
                    readOnly: true,
                  },
                  { key: "platingType", label: "Plating Type" },
                  { key: "thickness", label: "Thickness" },
                  { key: "rate", label: "Rate", type: "number" },
                  { key: "sgstRate", label: "SGST Rate", type: "number" },
                  {
                    key: "sgstAmount",
                    label: "SGST Amount",
                    readOnly: true,
                  },
                  { key: "cgstRate", label: "CGST Rate", type: "number" },
                  {
                    key: "cgstAmount",
                    label: "CGST Amount",
                    readOnly: true,
                  },
                  { key: "igstRate", label: "IGST Rate", type: "number" },
                  {
                    key: "igstAmount",
                    label: "IGST Amount",
                    readOnly: true,
                  },
                  { key: "validFrom", label: "Valid From", type: "date" },
                  { key: "validTo", label: "Valid To", type: "date" },
                  {
                    key: "toolAmortizationRate",
                    label: "Tool Amortization Rate",
                    type: "number",
                    readOnly: true
                  }
                ]}
                rows={itemDetailRows}
                onCellChange={handleItemCellChange}
                onRemoveRow={handleRemoveItemRow}
                headerData={{ isIgstApplicable: header.isIgstApplicable }}
              />
              {fieldErrors.itemDetails && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                  {fieldErrors.itemDetails}
                </p>
              )}
            </div>
          )}

          {/* Tax Details tab */}
          {activeChildTab === "taxDetails" && (
            <div className="pt-3">
              <DynamicTable
                columns={[
                  {
                    key: "particular",
                    label: "Particulars",
                    type: "select",
                    options: listOfValuesData.PARTICULARS || [],
                  },
                  { key: "amount", label: "Amount", type: "number" },
                ]}
                rows={taxDetailRows}
                onCellChange={handleTaxCellChange}
                onRemoveRow={handleRemoveTaxRow}
                headerData={{ isIgstApplicable: header.isIgstApplicable }}
              />
            </div>
          )}

          {/* Terms And Conditions tab */}
          {activeChildTab === "terms" && (
            <div className="pt-3">
              <div className={subTabFieldGrid}>
                <Field
                  type="number"
                  label="Discount %"
                  name="discountPct"
                  value={terms.discountPct}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Payment Terms"
                  name="paymentTerms"
                  value={terms.paymentTerms}
                  onChange={handleTermsChange}
                  error={fieldErrors.paymentTerms}
                  options={PAYMENT_TERMS}
                  required
                />
                <Field
                  type="textarea"
                  label="Delivery Terms"
                  name="deliveryTerms"
                  value={terms.deliveryTerms}
                  onChange={handleTermsChange}
                />
                <Field
                  type="number"
                  label="Freight"
                  name="freight"
                  value={terms.freight}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Freight Type"
                  name="freightType"
                  value={terms.freightType}
                  onChange={handleTermsChange}
                  options={FREIGHT_TYPES}
                />
                <Field
                  type="select"
                  label="Packing Type"
                  name="packingType"
                  value={terms.packingType}
                  onChange={handleTermsChange}
                  options={PACKING_TYPES}
                />
                <Field
                  type="number"
                  label="Insurance"
                  name="insurance"
                  value={terms.insurance}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Mode of Despatch"
                  name="modeOfDespatch"
                  value={terms.modeOfDespatch}
                  onChange={handleTermsChange}
                  error={fieldErrors.modeOfDespatch}
                  options={MODE_OF_DESPATCH}
                  required
                />
                <Field
                  type="number"
                  label="Inland Charge"
                  name="inlandCharge"
                  value={terms.inlandCharge}
                  onChange={handleTermsChange}
                />
                <Field
                  type="select"
                  label="Prepared By"
                  name="preparedBy"
                  value={terms.preparedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                />
                <Field
                  type="select"
                  label="Authorized By"
                  name="authorizedBy"
                  value={terms.authorizedBy}
                  onChange={handleTermsChange}
                  options={employeeOptions}
                />
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={terms.narration}
                  onChange={handleTermsChange}
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data && data.id ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default SupplierRateContractForm;