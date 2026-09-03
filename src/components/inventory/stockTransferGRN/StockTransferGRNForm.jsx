import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  UploadCloud,
  Eye,
  File as FileIcon,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import itemAPI from "../../../api/itemAPI";
import stockTransferGrnAPI from "../../../api/Inventory/stockTransferGRNAPI";
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
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  const number = parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
};

const round2 = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const money = (value) => round2(value).toFixed(2);

const todayISO = () => new Date().toISOString().slice(0, 10);

const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
};

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

const SelectCell = ({
  value,
  onChange,
  options,
  disabled = false,
  minWidth = "110px",
}) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
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
  minWidth = "90px",
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

const DisplayCell = ({ value, minWidth = "120px" }) => (
  <td className="p-0.5 align-top" style={{ minWidth }}>
    <div
      className={
        `${cellInputClasses} flex items-center bg-gray-100 dark:bg-gray-800 ` +
        `cursor-not-allowed whitespace-nowrap overflow-hidden`
      }
      title={value ?? ""}
    >
      {value ?? ""}
    </div>
  </td>
);

const CheckboxCell = ({ checked, onChange, minWidth = "45px" }) => (
  <td className="p-0.5 align-top text-center" style={{ minWidth }}>
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={onChange}
      className="h-3.5 w-3.5 rounded border-gray-300 mt-1.5"
    />
  </td>
);

const DetailTable = ({
  columns,
  rows,
  onCellChange,
  onRemoveRow,
  onCopyRow,
}) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />

    <tbody>
      {rows.map((row, index) => (
        <tr
          key={row.id || index}
          className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td className="p-1 text-center font-medium dark:text-white text-[10px]">
            {index + 1}
          </td>

          {columns.map((column) => {
            const disabled =
              typeof column.disabled === "function"
                ? column.disabled(row, index)
                : column.disabled;

            if (column.type === "display") {
              return (
                <DisplayCell
                  key={column.key}
                  value={row[column.displayKey || column.key]}
                  minWidth={column.minWidth}
                />
              );
            }

            if (column.type === "checkbox") {
              return (
                <CheckboxCell
                  key={column.key}
                  checked={row[column.key]}
                  onChange={(e) =>
                    onCellChange(index, column.key, e.target.checked)
                  }
                  minWidth={column.minWidth}
                />
              );
            }

            if (column.type === "select") {
              return (
                <SelectCell
                  key={column.key}
                  value={row[column.key]}
                  disabled={disabled}
                  minWidth={column.minWidth}
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
                disabled={disabled}
                min={column.type === "number" ? 0 : undefined}
                step={
                  column.type === "number" ? column.step || "0.01" : undefined
                }
                minWidth={column.minWidth}
                onChange={(e) =>
                  onCellChange(index, column.key, e.target.value)
                }
              />
            );
          })}

          <td className="p-1 text-center whitespace-nowrap">
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => onCopyRow(index)}
                className="h-5 w-5 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center"
              >
                <Copy size={10} />
              </button>

              <button
                type="button"
                onClick={() => onRemoveRow(index)}
                disabled={rows.length <= 1}
                className={`h-5 w-5 rounded text-white flex items-center justify-center ${
                  rows.length <= 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 size={10} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </TableWrapper>
);

/* ========================================================================= */
/* STATIC OPTIONS                                                            */
/* ========================================================================= */

const YES_NO = ["Yes", "No"];

const UNITS = [
  { value: 1000000004, label: "NOS" },
  { value: 1000000005, label: "KG" },
];

/* ========================================================================= */
/* EMPTY ROW / DEFAULTS                                                      */
/* ========================================================================= */

const emptyDetailRow = () => ({
  id: 0,

  item: "",
  itemCode: "",
  itemDescription: "",

  primaryUnit: "",
  stock: false,
  purchaseTolerance: "",
  inspectionable: false,

  poRate: "",
  poQty: "",
  poUnit: "",

  challanQty: "",
  storeStock: "",
  pendingQty: "",

  receivedQty: "",
  receivedUnit: "",
  conversionFactor: 1,
  recQtyInPrimaryUnit: "",

  acceptQty: "",
  accQtyInPrimaryUnit: "",
  accUnit: "",

  rejectQty: "",
  rejQtyInPrimaryUnit: "",

  excessQty: "",

  amount: "",
  apportionedCost: "",
  insurance: "",
  handCharge: "",
  lcost: "",
  landedCostRate: "",
  landedValue: "",

  itemMaxQty: 0,
  bankchrg: 0,
});

const emptyFileRow = () => ({
  name: "",
  file: null,
  filePath: "",
  remarks: "",
  isExisting: false,
});

const getDefaultValues = () => ({
  active: true,

  branch: "",
  grnNo: "",
  belongsTo: "",
  grnDate: todayISO(),
  location: "",

  supplierCode: "",
  supplierName: "",
  address: "",
  gstState: "",
  isIgstApplicable: "No",
  gatePassNo: "",
  gstinNo: "",

  poNo: "",
  dealerType: "",
  scheduleNo: "",
  country: "",
  isReverseCharge: "No",

  scheduleDate: "",
  currency: "",
  schStartDate: "",
  exchangeRate: 1,
  schEndDate: "",
  grnClearTime: nowTime(),

  grossAmount: 0,
  modvatCopyReceived: "No",
  totalQtyKg: 0,
  partyDcNo: "",
  discountPerc: 0,
  supplierDcDate: "",

  eSugamNoToggle: "No",
  eSugamNo: "",

  netAmount: 0,
  basicAmount: 0,
  totalAmountTax: 0,
  invoiceSentOn: "",
  remarks: "",

  financialYear: String(new Date().getFullYear()),

  cancelRemarks: "",
});

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

const StockTransferGRNForm = ({ data: editData, onBack }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));
  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  const [formData, setFormData] = useState(() => ({
    ...getDefaultValues(),
    branch: String(editData?.branch ?? BRANCH_ID ?? ""),
    ...(editData || {}),
  }));

  const effectiveBranchId = toInteger(formData.branch || BRANCH_ID);

  const [detailRows, setDetailRows] = useState(
    editData?.stockTransferGrnDetailsDTO?.length
      ? editData.stockTransferGrnDetailsDTO
      : [emptyDetailRow()],
  );

  const [fileRows, setFileRows] = useState(
    editData?.attachments?.length ? editData.attachments : [emptyFileRow()],
  );

  const [activeTab, setActiveTab] = useState("purchaseDetail");

  const [branchOptions, setBranchOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [poOptions, setPoOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

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
        list.map((b) => ({
          value: b.id,
          label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
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

  const loadLocations = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) return;

      const response = await stockTransferGrnAPI.getLocationDetails(
        effectiveBranchId,
        ORG_ID,
      );

      const list =
        response?.paramObjectsMap?.mapp ||
        response?.paramObjectsMap?.locationVO ||
        response?.paramObjectsMap?.locations ||
        (Array.isArray(response) ? response : []);

      setLocationOptions(
        list.map((loc) => ({
          value: loc.id ?? loc.locationId,
          label:
            loc.locationName ||
            loc.name ||
            loc.location ||
            `Location ${loc.id ?? loc.locationId}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadCurrency = useCallback(async () => {
    try {
      if (!ORG_ID) return;
      const response = await stockTransferGrnAPI.getCurrency(ORG_ID);
      const list = response?.paramObjectsMap?.currencyVO || [];

      setCurrencyOptions(
        list.map((c) => ({
          value: c.id,
          label: c.mainCurrency || c.currency || `Currency ${c.id}`,
        })),
      );
    } catch (error) {
      console.error("Failed to load currency:", error);
      setCurrencyOptions([]);
    }
  }, [ORG_ID]);

  const loadItems = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) return;
      const list = await itemAPI.getItems(ORG_ID, effectiveBranchId);
      setItemOptions(
        list.map((item) => ({
          value: item.id,
          label: item.itemCode || `Item ${item.id}`,
          itemDescription: item.itemDescription || "",
          primaryUnit: item.primaryUnits?.id ?? "",
          purchaseUnit: item.purchaseUnit?.id ?? "",
          stock: item.stock === "Yes",
          purchaseTolerance: toNumber(item.pruchaseTalerance),
          itemMaxQty: toNumber(item.maximumOrderQty ?? item.maxOrderQty),
        })),
      );
    } catch (error) {
      console.error("Failed to load item master:", error);
      setItemOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  const loadSuppliers = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) return;

      const response = await stockTransferGrnAPI.getSupplierDetailsForGrn(
        effectiveBranchId,
        ORG_ID,
      );

      const list = response?.paramObjectsMap?.mapp || [];

      setSupplierOptions(
        list.map((s) => ({
          value: s.supplierId,
          label: s.supplierCode || `Supplier ${s.supplierId}`,
          supplierName: s.supplierName || "",
          address: s.address || "",
          stateName: s.stateName || "",
          country: s.country || "",
          gstNo: s.gstNo || "",
          isRegistered:
            s.isRegistered === true ||
            String(s.isRegistered).toLowerCase() === "true",
        })),
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSupplierOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  /* ========================================================================= */
  /* GATE PASS + PO NUMBER (depend on supplier)                                */
  /* ========================================================================= */

  const loadGatePassNo = useCallback(
    async (supplierId) => {
      try {
        if (!ORG_ID || !effectiveBranchId || !supplierId) return;

        const response =
          await stockTransferGrnAPI.getGatePassDocIdDetailsForStockTransfer(
            effectiveBranchId,
            ORG_ID,
            supplierId,
          );

        const list = response?.paramObjectsMap?.mapp;

        const gatePassNo =
          (Array.isArray(list) && list[0]?.docId) ||
          response?.paramObjectsMap?.gatePassNo ||
          response?.paramObjectsMap?.docId ||
          "";

        setFormData((previous) => ({ ...previous, gatePassNo }));
      } catch (error) {
        console.error("Failed to load Gate Pass No:", error);
        addToast("Failed to generate Gate Pass No", "error");
      }
    },
    [ORG_ID, effectiveBranchId, addToast],
  );

  const loadPoOptions = useCallback(
    async (supplierId) => {
      try {
        if (!ORG_ID || !effectiveBranchId || !supplierId) {
          setPoOptions([]);
          return;
        }

        const response =
          await stockTransferGrnAPI.getPurchaseOrderNumberStockTransfer(
            effectiveBranchId,
            ORG_ID,
            supplierId,
          );

        const list = response?.paramObjectsMap?.mapp || [];

        setPoOptions(
          list.map((po) => ({
            value: po.docId,
            label: po.docId,
          })),
        );
      } catch (error) {
        console.error("Failed to load PO numbers:", error);
        setPoOptions([]);
      }
    },
    [ORG_ID, effectiveBranchId],
  );

  /* ========================================================================= */
  /* USE EFFECTS - MASTER DATA                                                 */
  /* ========================================================================= */

  useEffect(() => {
    loadBranches();
    loadBelongsTo();
    loadCurrency();
  }, [loadBranches, loadBelongsTo, loadCurrency]);

  useEffect(() => {
    loadLocations();
    loadItems();
    loadSuppliers();
  }, [loadLocations, loadItems, loadSuppliers]);

  /* GRN No generation */

  useEffect(() => {
    if (isEditMode) return;

    let cancelled = false;

    const generate = async () => {
      setGeneratingDocId(true);
      try {
        const response = await stockTransferGrnAPI.getStockTransferGrnDocId(
          ORG_ID,
          formData.financialYear,
        );

        const docId = response?.paramObjectsMap?.stockTransferGrnId || "";

        if (!cancelled) {
          setFormData((previous) => ({ ...previous, grnNo: docId }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to generate GRN No:", error);
          addToast("Failed to generate GRN No", "error");
        }
      } finally {
        if (!cancelled) setGeneratingDocId(false);
      }
    };

    generate();

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
      setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    }

    /* Plant / Branch change */

    if (name === "branch") {
      setFormData((previous) => ({
        ...previous,
        branch: value,
        supplierCode: "",
        supplierName: "",
        address: "",
        gstState: "",
        gstinNo: "",
        country: "",
        isIgstApplicable: "No",
        gatePassNo: "",
        poNo: "",
        location: "",
      }));

      setSupplierOptions([]);
      setLocationOptions([]);
      setPoOptions([]);
      setDetailRows([emptyDetailRow()]);
      return;
    }

    /* Supplier auto-fill */

    if (name === "supplierCode") {
      const selected = supplierOptions.find(
        (option) => String(option.value) === String(value),
      );

      setFormData((previous) => ({
        ...previous,

        supplierCode: value,

        supplierName: selected?.supplierName || "",
        address: selected?.address || "",
        gstState: selected?.stateName || "",
        gstinNo: selected?.gstNo || "",
        country: selected?.country || "",

        isIgstApplicable: selected?.isRegistered ? "Yes" : "No",

        gatePassNo: "",
        poNo: "",
      }));

      if (value) {
        loadGatePassNo(value);
        loadPoOptions(value);
      } else {
        setPoOptions([]);
      }

      return;
    }

    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  /* ========================================================================= */
  /* DETAIL ROW MANAGEMENT                                                     */
  /* ========================================================================= */

  const calculateDetailRow = (row, changedKey, changedValue) => {
    let updated = { ...row, [changedKey]: changedValue };

    const selectedItem =
      changedKey === "item"
        ? itemOptions.find(
            (item) => String(item.value) === String(changedValue),
          )
        : null;

    if (selectedItem) {
      updated.itemCode = selectedItem.label || "";
      updated.itemDescription = selectedItem.itemDescription || "";
      updated.primaryUnit = selectedItem.primaryUnit || "";
      updated.poUnit = updated.poUnit || selectedItem.purchaseUnit || "";
      updated.receivedUnit =
        updated.receivedUnit || selectedItem.primaryUnit || "";
      updated.stock = selectedItem.stock;
      updated.purchaseTolerance = selectedItem.purchaseTolerance || "";
      updated.itemMaxQty = selectedItem.itemMaxQty || 0;
    }

    const poQty = Math.max(0, toNumber(updated.poQty));
    const receivedQty = Math.max(0, toNumber(updated.receivedQty));
    const acceptQty = Math.max(0, toNumber(updated.acceptQty));
    const rejectQty = Math.max(0, toNumber(updated.rejectQty));
    const conversionFactor = Math.max(0, toNumber(updated.conversionFactor, 1));
    const poRate = Math.max(0, toNumber(updated.poRate));
    const insurance = Math.max(0, toNumber(updated.insurance));
    const handCharge = Math.max(0, toNumber(updated.handCharge));
    const lcost = Math.max(0, toNumber(updated.lcost));

    updated.pendingQty = round2(Math.max(0, poQty - receivedQty));
    updated.excessQty = round2(Math.max(0, receivedQty - poQty));

    updated.recQtyInPrimaryUnit = round2(receivedQty * conversionFactor);
    updated.accQtyInPrimaryUnit = round2(acceptQty * conversionFactor);
    updated.rejQtyInPrimaryUnit = round2(rejectQty * conversionFactor);

    const amount = round2(receivedQty * poRate);
    updated.amount = amount;

    const apportionedCost = round2(insurance + handCharge + lcost);
    updated.apportionedCost = apportionedCost;

    const landedCostRate =
      receivedQty > 0 ? round2((amount + apportionedCost) / receivedQty) : 0;
    updated.landedCostRate = landedCostRate;
    updated.landedValue = round2(landedCostRate * receivedQty);

    return updated;
  };

  const handleDetailCellChange = (index, key, value) => {
    setDetailRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? calculateDetailRow(row, key, value) : row,
      ),
    );
  };

  const addDetailRow = () => {
    setDetailRows((previous) => [...previous, emptyDetailRow()]);
  };

  const removeDetailRow = (index) => {
    setDetailRows((previous) => {
      if (previous.length <= 1) return previous;
      return previous.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const copyDetailRow = (index) => {
    setDetailRows((previous) => {
      const row = previous[index];
      if (!row) return previous;
      return [...previous, { ...row, id: 0 }];
    });
  };

  /* ========================================================================= */
  /* TOTALS                                                                    */
  /* ========================================================================= */

  const detailAmountTotal = useMemo(
    () => round2(detailRows.reduce((t, r) => t + toNumber(r.amount), 0)),
    [detailRows],
  );

  const discountAmount = useMemo(
    () =>
      round2(
        (toNumber(formData.grossAmount) * toNumber(formData.discountPerc)) /
          100,
      ),
    [formData.grossAmount, formData.discountPerc],
  );

  const netAmount = useMemo(
    () => round2(toNumber(formData.grossAmount) - discountAmount),
    [formData.grossAmount, discountAmount],
  );

  const basicAmount = detailAmountTotal;

  useEffect(() => {
    setFormData((previous) => {
      if (
        Number(previous.netAmount) === Number(netAmount) &&
        Number(previous.basicAmount) === Number(basicAmount)
      ) {
        return previous;
      }
      return {
        ...previous,
        netAmount: money(netAmount),
        basicAmount: money(basicAmount),
      };
    });
  }, [netAmount, basicAmount]);

  /* ========================================================================= */
  /* ATTACHMENTS                                                               */
  /* ========================================================================= */

  const handleFileSelect = (index, file) => {
    if (!file) return;
    setFileRows((previous) =>
      previous.map((row, i) =>
        i === index
          ? { ...row, file, name: file.name, filePath: "", isExisting: false }
          : row,
      ),
    );
  };

  const handleAddFileRow = () =>
    setFileRows((previous) => [...previous, emptyFileRow()]);

  const handleRemoveFileRow = (index) =>
    setFileRows((previous) => {
      if (previous.length <= 1) return previous;
      return previous.filter((_, i) => i !== index);
    });

  const handleViewFile = (row) => {
    if (row.isExisting && row.filePath) {
      window.open(
        stockTransferGrnAPI.getViewFileUrl(row.filePath),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    if (row.file) {
      const url = URL.createObjectURL(row.file);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!formData.branch) errors.branch = "Plant is required";
    if (!formData.grnDate) errors.grnDate = "GRN Date is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.supplierCode) errors.supplierCode = "Supplier is required";
    if (!formData.gatePassNo) errors.gatePassNo = "Gate Pass No is required";

    const activeRows = detailRows.filter((row) => row.item);

    if (activeRows.length === 0) {
      addToast("Please add at least one item", "error");
      return false;
    }

    const invalidReceived = detailRows.some(
      (row) => row.item && toNumber(row.receivedQty) <= 0,
    );

    if (invalidReceived) {
      addToast("Received Qty must be greater than 0", "error");
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
      const filesToUpload = [];

      const detailPayload = detailRows
        .filter((row) => row.item)
        .map((row) => ({
          id: toInteger(row.id),
          item: toInteger(row.item),

          primaryUnit: toInteger(row.primaryUnit),
          stock: row.stock ? 1 : 0,
          purchaseTolerance: toNumber(row.purchaseTolerance),
          inspectionable: row.inspectionable ? "Yes" : "No",

          poRate: toNumber(row.poRate),
          poQty: toNumber(row.poQty),
          poUnit: toInteger(row.poUnit),

          challanQty: toNumber(row.challanQty),
          storeStock: toNumber(row.storeStock),
          pendingQty: toNumber(row.pendingQty),

          receivedQty: toNumber(row.receivedQty),
          receivedUnit: toInteger(row.receivedUnit),
          conversionFactor: toNumber(row.conversionFactor, 1),
          recQtyInPrimaryUnit: toNumber(row.recQtyInPrimaryUnit),

          acceptQty: toNumber(row.acceptQty),
          accQtyInPrimaryUnit: toNumber(row.accQtyInPrimaryUnit),
          accUnit: toInteger(row.accUnit),

          rejectQty: toNumber(row.rejectQty),
          rejQtyInPrimaryUnit: toNumber(row.rejQtyInPrimaryUnit),

          excessQty: toNumber(row.excessQty),

          amount: toNumber(row.amount),
          apportionedCost: toNumber(row.apportionedCost),
          insurance: toNumber(row.insurance),
          handCharge: toNumber(row.handCharge),
          lcost: toNumber(row.lcost),
          landedCostRate: toNumber(row.landedCostRate),
          landedValue: toNumber(row.landedValue),

          itemMaxQty: toNumber(row.itemMaxQty),
          bankchrg: toNumber(row.bankchrg),
        }));

      const payload = {
        ...(isEditMode && { id: editData.id }),

        active: formData.active !== false,

        basicAmount: toNumber(formData.basicAmount),
        belongsTo: formData.belongsTo || "",
        branch: toInteger(formData.branch),
        cancelRemarks: formData.cancelRemarks || "",

        createdBy:
          (isEditMode
            ? formData.createdBy
            : localStorage.getItem("userName")) || "SYSTEM",

        ...(isEditMode && {
          updatedBy: localStorage.getItem("userName") || "SYSTEM",
        }),

        currency: toInteger(formData.currency),
        dealerType: formData.dealerType || "",
        discount: toNumber(formData.discountPerc),
        exchangeRate: toNumber(formData.exchangeRate, 1),
        financialYear:
          formData.financialYear || String(new Date().getFullYear()),
        gatePassNo: formData.gatePassNo || "",
        grossAmount: toNumber(formData.grossAmount),
        invoiceSentOn: formData.invoiceSentOn || "",
        isIgstApplicable: formData.isIgstApplicable || "No",
        isReverseCharge: formData.isReverseCharge || "No",
        location: toInteger(formData.location),
        modvatCopyReceived: formData.modvatCopyReceived || "No",
        netAmount: toNumber(formData.netAmount),
        orgId: ORG_ID,
        partyDcNo: formData.partyDcNo || "",
        poNo: formData.poNo || "",
        remarks: formData.remarks || "",
        scheduleDate: formData.scheduleDate || "",
        scheduleEndDate: formData.schEndDate || "",
        scheduleNo: formData.scheduleNo || "",
        scheduleStartDate: formData.schStartDate || "",
        stockTransferGrnDetailsDTO: detailPayload,
        supplierCode: toInteger(formData.supplierCode),
        supplierDcDate: formData.supplierDcDate || "",
        totalAmountTax: toNumber(formData.totalAmountTax),
        totalQtyInKg: toNumber(formData.totalQtyKg),

        /* Extra fields kept for completeness — remove if backend rejects
           unknown keys. */
        grnNo: formData.grnNo || "",
        grnDate: formData.grnDate || todayISO(),
        grnClearTime: formData.grnClearTime || nowTime(),
        gstState: formData.gstState || "",
        gstinNo: formData.gstinNo || "",
        country: formData.country || "",
        supplierName: formData.supplierName || "",
        supplierAddress: formData.address || "",
        eSugamNoToggle: formData.eSugamNoToggle || "No",
        eSugamNo: formData.eSugamNo || "",
      };

      fileRows.forEach((row) => {
        if (row.file) filesToUpload.push(row.file);
      });

      const response = await stockTransferGrnAPI.createUpdateStockTransferGrn(
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
            ? "Stock Transfer GRN updated successfully"
            : "Stock Transfer GRN created successfully",
          "success",
        );
        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save Stock Transfer GRN";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error saving Stock Transfer GRN:", error);
      addToast(
        error?.response?.data?.message ||
          error?.response?.data?.errorMessage ||
          "Failed to save Stock Transfer GRN.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* DETAIL COLUMNS                                                            */
  /* ========================================================================= */

  const detailColumns = [
    {
      key: "item",
      label: "Item Code",
      type: "select",
      options: itemOptions,
      minWidth: "130px",
    },
    {
      key: "itemDescription",
      label: "Item Description",
      type: "display",
      minWidth: "160px",
    },
    {
      key: "primaryUnit",
      label: "Primary Unit",
      type: "select",
      options: UNITS,
      minWidth: "90px",
    },
    { key: "stock", label: "Stock?", type: "checkbox", minWidth: "50px" },
    {
      key: "purchaseTolerance",
      label: "Purchase Tolerance",
      type: "number",
      minWidth: "80px",
    },
    {
      key: "inspectionable",
      label: "Inspectionable?",
      type: "checkbox",
      minWidth: "80px",
    },
    {
      key: "poRate",
      label: "P.O./P.C. Rate",
      type: "number",
      minWidth: "80px",
    },
    { key: "poQty", label: "P.O. Qty", type: "number", minWidth: "70px" },
    {
      key: "poUnit",
      label: "PO Unit",
      type: "select",
      options: UNITS,
      minWidth: "90px",
    },
    {
      key: "challanQty",
      label: "Challan Qty",
      type: "number",
      minWidth: "70px",
    },
    {
      key: "storeStock",
      label: "Store Stock",
      type: "number",
      minWidth: "70px",
    },
    {
      key: "pendingQty",
      label: "Pending Qty",
      type: "number",
      disabled: true,
      minWidth: "70px",
    },
    {
      key: "receivedQty",
      label: "Received Qty",
      type: "number",
      minWidth: "80px",
    },
    {
      key: "receivedUnit",
      label: "Received Unit",
      type: "select",
      options: UNITS,
      minWidth: "90px",
    },
    {
      key: "conversionFactor",
      label: "Conversion Factor",
      type: "number",
      minWidth: "80px",
    },
    {
      key: "recQtyInPrimaryUnit",
      label: "Rec Qty (Primary)",
      type: "number",
      disabled: true,
      minWidth: "90px",
    },
    { key: "acceptQty", label: "Accept Qty", type: "number", minWidth: "70px" },
    {
      key: "accQtyInPrimaryUnit",
      label: "Acc Qty (Primary)",
      type: "number",
      disabled: true,
      minWidth: "90px",
    },
    {
      key: "accUnit",
      label: "Acc Unit",
      type: "select",
      options: UNITS,
      minWidth: "90px",
    },
    { key: "rejectQty", label: "Reject Qty", type: "number", minWidth: "70px" },
    {
      key: "rejQtyInPrimaryUnit",
      label: "Rej Qty (Primary)",
      type: "number",
      disabled: true,
      minWidth: "90px",
    },
    {
      key: "excessQty",
      label: "Excess Qty",
      type: "number",
      disabled: true,
      minWidth: "70px",
    },
    {
      key: "amount",
      label: "Amount",
      type: "number",
      disabled: true,
      minWidth: "80px",
    },
    {
      key: "apportionedCost",
      label: "Apportioned Cost",
      type: "number",
      disabled: true,
      minWidth: "90px",
    },
    { key: "insurance", label: "Insurance", type: "number", minWidth: "70px" },
    {
      key: "handCharge",
      label: "Handling Chrg",
      type: "number",
      minWidth: "80px",
    },
    { key: "lcost", label: "Loss Cost", type: "number", minWidth: "70px" },
    {
      key: "landedCostRate",
      label: "Landed Cost Rate",
      type: "number",
      disabled: true,
      minWidth: "90px",
    },
    {
      key: "landedValue",
      label: "Landed Value",
      type: "number",
      disabled: true,
      minWidth: "90px",
    },
  ];

  const tabs = [
    { key: "purchaseDetail", label: "Purchase Detail" },
    { key: "summary", label: "Summary" },
    { key: "attachments", label: "Attached Invoice Copy" },
  ];

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <div className="p-2 max-w-7xl">
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
          {isEditMode ? "Edit Stock Transfer GRN" : "New Stock Transfer GRN"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>GRN Header</SectionHeader>

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
              label="GRN No"
              name="grnNo"
              value={generatingDocId ? "Generating..." : formData.grnNo}
              onChange={() => {}}
              disabled
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
              type="date"
              label="GRN Date"
              name="grnDate"
              value={formData.grnDate}
              onChange={handleFieldChange}
              error={fieldErrors.grnDate}
              required
            />

            <Field
              type="select"
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleFieldChange}
              error={fieldErrors.location}
              options={locationOptions}
              required
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
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={() => {}}
              disabled
            />

            <Field
              label="GST State"
              name="gstState"
              value={formData.gstState}
              onChange={() => {}}
              disabled
            />

            <Field
              label="Address"
              name="address"
              value={formData.address}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="Is IGST Appl"
              name="isIgstApplicable"
              value={formData.isIgstApplicable}
              onChange={handleFieldChange}
              options={YES_NO}
              disabled
            />

            <Field
              label="Gate Pass No"
              name="gatePassNo"
              value={formData.gatePassNo}
              onChange={() => {}}
              error={fieldErrors.gatePassNo}
              disabled
            />

            <Field
              label="GSTN No"
              name="gstinNo"
              value={formData.gstinNo}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="PO No/PC No"
              name="poNo"
              value={formData.poNo}
              onChange={handleFieldChange}
              options={poOptions}
            />

            <Field
              label="Dealer Type"
              name="dealerType"
              value={formData.dealerType}
              onChange={handleFieldChange}
            />

            <Field
              label="Schedule No"
              name="scheduleNo"
              value={formData.scheduleNo}
              onChange={handleFieldChange}
            />

            <Field
              label="Country"
              name="country"
              value={formData.country}
              onChange={() => {}}
              disabled
            />

            <Field
              type="select"
              label="Is Reverse Chrg"
              name="isReverseCharge"
              value={formData.isReverseCharge}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              type="date"
              label="Schedule Date"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleFieldChange}
              options={currencyOptions}
            />

            <Field
              type="date"
              label="Sch. Start Date"
              name="schStartDate"
              value={formData.schStartDate}
              onChange={handleFieldChange}
            />

            <Field
              label="Exchange Rate"
              name="exchangeRate"
              type="number"
              step="0.0001"
              min="0"
              value={formData.exchangeRate}
              onChange={handleFieldChange}
            />

            <Field
              type="date"
              label="Sch. End Date"
              name="schEndDate"
              value={formData.schEndDate}
              onChange={handleFieldChange}
            />

            <Field
              type="time"
              label="GRN Clear Time"
              name="grnClearTime"
              value={formData.grnClearTime}
              onChange={() => {}}
              disabled
            />

            <Field
              label="Gross Amt"
              name="grossAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.grossAmount}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="Modvat Copy Received"
              name="modvatCopyReceived"
              value={formData.modvatCopyReceived}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              label="Total Qty In Kg"
              name="totalQtyKg"
              type="number"
              step="0.001"
              min="0"
              value={formData.totalQtyKg}
              onChange={handleFieldChange}
            />

            <Field
              label="Party Dc No./Inv. No."
              name="partyDcNo"
              value={formData.partyDcNo}
              onChange={handleFieldChange}
            />

            <Field
              label="Discount %"
              name="discountPerc"
              type="number"
              step="0.01"
              min="0"
              value={formData.discountPerc}
              onChange={handleFieldChange}
            />

            <Field
              type="date"
              label="Supplier DC Date"
              name="supplierDcDate"
              value={formData.supplierDcDate}
              onChange={handleFieldChange}
            />

            <Field
              type="select"
              label="e-Sugam No. Applicable"
              name="eSugamNoToggle"
              value={formData.eSugamNoToggle}
              onChange={handleFieldChange}
              options={YES_NO}
            />

            <Field
              label="e-Sugam No."
              name="eSugamNo"
              value={formData.eSugamNo}
              onChange={handleFieldChange}
              disabled={formData.eSugamNoToggle !== "Yes"}
            />
          </div>
        </div>

        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
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

            {activeTab === "purchaseDetail" && (
              <button
                type="button"
                onClick={addDetailRow}
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

          {activeTab === "purchaseDetail" && (
            <>
              <DetailTable
                columns={detailColumns}
                rows={detailRows}
                onCellChange={handleDetailCellChange}
                onRemoveRow={removeDetailRow}
                onCopyRow={copyDetailRow}
              />

              <div className="flex justify-end gap-4 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span>
                  Amount Total:{" "}
                  <strong className="ml-1">{money(detailAmountTotal)}</strong>
                </span>
              </div>
            </>
          )}

          {activeTab === "summary" && (
            <div className="pt-2 space-y-3">
              <div className={fieldGrid}>
                <Field
                  label="Net Amount"
                  name="netAmount"
                  type="number"
                  value={formData.netAmount}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  label="Basic Amount"
                  name="basicAmount"
                  type="number"
                  value={formData.basicAmount}
                  onChange={() => {}}
                  disabled
                />

                <Field
                  label="Total Tax Amount"
                  name="totalAmountTax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmountTax}
                  onChange={handleFieldChange}
                />

                <Field
                  type="date"
                  label="Invoice Sent On"
                  name="invoiceSentOn"
                  value={formData.invoiceSentOn}
                  onChange={handleFieldChange}
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

              <div className="border rounded-md border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Calculation Summary
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-500">Gross:</span>
                    <span className="font-semibold ml-1">
                      {money(formData.grossAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <span className="font-semibold ml-1">
                      {money(discountAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Net:</span>
                    <span className="font-semibold ml-1">
                      {money(netAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Basic (from items):</span>
                    <span className="font-semibold ml-1 text-blue-600">
                      {money(basicAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <TableWrapper>
              <TableHead
                headers={[
                  "#",
                  "File Name",
                  "Attachment",
                  "Remarks",
                  "View",
                  "Action",
                ]}
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

                    <td className="p-1 align-top">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) =>
                          setFileRows((previous) =>
                            previous.map((r, i) =>
                              i === index
                                ? { ...r, remarks: e.target.value }
                                : r,
                            ),
                          )
                        }
                        className={cellInputClasses}
                      />
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
        </section>

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

export default StockTransferGRNForm;
