import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import stockTransferAPI from "../../../api/Inventory/stockTransferAPI";
import branchAPI from "../../../api/branchAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import locationMasterAPI from "../../../api/locationMasterAPI";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens - identical to PurchaseContractForm / PartyMasterForm  */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const cellInputClasses =
  "w-full h-8 px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks */

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
          className={controlClasses}
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
          rows={4}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
            "bg-white dark:bg-gray-900 " +
            "border-gray-300 dark:border-gray-600 " +
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
        className={controlClasses}
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
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <X className="h-3 w-3" />
      Cancel
    </button>

    <button
      onClick={onSave}
      disabled={isSubmitting}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <Save className="h-3 w-3" />
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* Table helpers */

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
    <td className="p-1 text-center font-medium dark:text-white">{index + 1}</td>
    {children}
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
  </tr>
);

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top">
    <select value={value} onChange={onChange} className={cellInputClasses}>
      <option value="">-- Select --</option>
      {(options || []).map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", disabled }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${cellInputClasses} ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
        }`}
    />
  </td>
);

const DynamicTable = ({ columns, rows, onCellChange, onRemoveRow }) => (
  <TableWrapper>
    <TableHead headers={["#", ...columns.map((c) => c.label), "Action"]} />
    <tbody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          index={idx}
          onRemove={() => onRemoveRow(idx)}
          disabled={rows.length <= 1}
        >
          {columns.map((col) =>
            col.type === "select" ? (
              <SelectCell
                key={col.key}
                value={row[col.key]}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
                options={col.options}
              />
            ) : (
              <InputCell
                key={col.key}
                value={row[col.key]}
                type={col.type === "number" ? "number" : "text"}
                disabled={col.readOnly}
                onChange={(e) => onCellChange(idx, col.key, e.target.value)}
              />
            ),
          )}
        </TableRow>
      ))}
    </tbody>
  </TableWrapper>
);

/* ---------------------------------------------------------------------------- */
/* Options (hardcoded)                                                         */

const REASONS = [
  "NON MOVING ITEMS",
  "SCRAP FROM R&D",
  "SALES RETURN FROM BOSCH",
  "SCHORTAGE",
  "MATERIAL RETURN TO WITHOUT PROCESS",
  "WRONGE ENTRY",
  "ITEM TRANSFER",
];

/* ---------------------------------------------------------------------------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyHeader = () => ({
  fromPlantId: "",
  stockTransferNo: "",
  toPlant: "",
  stockTransferDate: todayISO(),
  belongsTo: "",
  fromLocation: "",
  toLocation: "",
  reason: "",
});

const emptySummary = () => ({
  narration: "",
});

const emptyItemRow = () => ({
  itemCode: "",
  itemmastid: "",
  ItemIDn: "",
  itemDescription: "",
  unit: "",
  unitmasterId: "",
  unitLabel: "", // For displaying unit name
  availableQty: "",
  qty: "",
  rate: "",
});

/* ---------------------------------------------------------------------------- */
/* Child tabs - Bin Transfer Details is a table, Summary is a field grid       */

const CHILD_TABS = [
  { key: "binTransfer", label: "Bin Transfer Details", type: "table" },
  { key: "summary", label: "Summary", type: "fields" },
];

const StockTransferForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const branch = parseInt(localStorage.getItem("branchId"));
  const [activeChildTab, setActiveChildTab] = useState("binTransfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);
  const docIdGeneratedRef = useRef(false);

  // API data states
  const [plantOptions, setPlantOptions] = useState([]);
  const [belongsToOptions, setBelongsToOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});

  const [header, setHeader] = useState({
    ...emptyHeader(),
    ...editData?.header,
  });

  const [summary, setSummary] = useState({
    ...emptySummary(),
    ...editData?.summary,
  });

  const [itemRows, setItemRows] = useState(
    editData?.binTransferDetails?.length
      ? editData.binTransferDetails
      : [emptyItemRow()],
  );

  /* ---------------- Generate Document ID ---------------- */

  const generateDocId = useCallback(async () => {
    // Don't generate if editing or already generated
    if (editData?.id || docIdGeneratedRef.current || generatingDocId) {
      return;
    }

    setGeneratingDocId(true);

    try {
      const financialYear = new Date().getFullYear().toString();
      const response = await stockTransferAPI.getStockTransferDocId(
        financialYear,
        ORG_ID
      );
      console.log("Document ID Response:", response);

      const docId = response?.paramObjectsMap?.invoiceDocId || "";
      if (docId) {
        setHeader((prev) => ({ ...prev, stockTransferNo: docId }));
        docIdGeneratedRef.current = true;
      } else {
        console.error("Failed to generate Document ID");
        const fallbackId = `STR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
        setHeader((prev) => ({ ...prev, stockTransferNo: fallbackId }));
        docIdGeneratedRef.current = true;
      }
    } catch (error) {
      console.error("Error generating document ID:", error);
      const fallbackId = `STR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
      setHeader((prev) => ({ ...prev, stockTransferNo: fallbackId }));
      docIdGeneratedRef.current = true;
    } finally {
      setGeneratingDocId(false);
    }
  }, [editData, ORG_ID, generatingDocId]);

  /* ---------------- API Loading ---------------- */

  const loadBranches = useCallback(async () => {
    try {
      const res = await branchAPI.getBranchByOrgId(ORG_ID);
      const options = (res || []).map((branch) => ({
        value: branch.id,
        label: branch.branchName || branch.branchCode || branch.id,
      }));
      setPlantOptions(options);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantOptions([]);
    }
  }, [ORG_ID]);

  const loadBelongsTo = useCallback(async () => {
    try {
      const res = await listOfValuesAPI.getListValuesGroup("SDS BELONGS TO", ORG_ID);
      console.log("Belongs To Response:", res);
      const options = (res || []).map((item) => ({
        value: item.valuesDescription || item.valueDescription || item.id,
        label: item.valuesDescription || item.valueDescription || item.id,
      }));
      setBelongsToOptions(options);
    } catch (error) {
      console.error("Failed to load Belongs To options:", error);
      setBelongsToOptions([
        { value: "APPLIANCES", label: "APPLIANCES" },
        { value: "BOSCH", label: "BOSCH" },
        { value: "AUTOMOTIVE", label: "AUTOMOTIVE" },
      ]);
    }
  }, [ORG_ID]);

  const loadLocations = useCallback(async () => {
    try {
      const res = await locationMasterAPI.getLocationMasterByOrgId(ORG_ID, branch);
      console.log("Location Response:", res);
      const options = (res || []).map((location) => ({
        value: location.id,
        label: location.locationName || location.locationId || location.id,
      }));
      setLocationOptions(options);
    } catch (error) {
      console.error("Failed to load locations:", error);
      setLocationOptions([]);
    }
  }, [ORG_ID, branch]);

  const loadItems = useCallback(async () => {
    try {
      const response = await stockTransferAPI.getStockTransferItemDetails(branch, ORG_ID);
      console.log("Item Response:", response);

      const items = response?.paramObjectsMap?.mapp || [];
      const map = {};
      const options = items.map((item) => {
        map[item.itemId] = {
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          unit: item.unitId || "",
          unitmasterId: item.unitmasterId || "",
          unitLabel: item.unitId || "",
          locationId: item.locationId,
        };
        return {
          value: item.itemId,
          label: `${item.itemCode} - ${item.itemDescription || ''}`,
        };
      });
      setItemOptions(options);
      setItemMap(map);
    } catch (error) {
      console.error("Failed to load items:", error);
      setItemOptions([]);
      setItemMap({});
    }
  }, [ORG_ID, branch]);

  useEffect(() => {
    if (ORG_ID) {
      loadBranches();
      loadBelongsTo();
      loadLocations();
      loadItems();
    }
  }, [ORG_ID, loadBranches, loadBelongsTo, loadLocations, loadItems]);

  // Generate document ID on mount (only for new records and only once)
  useEffect(() => {
    if (!editData?.id && ORG_ID && !docIdGeneratedRef.current && !generatingDocId) {
      generateDocId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemCellChange = (idx, key, value) => {
    setItemRows((prev) =>
      prev.map((row, i) => {
        if (i === idx) {
          const next = { ...row, [key]: value };
          // If item code changes, auto-populate item details
          if (key === "itemCode") {
            const item = itemMap[value];
            if (item) {
              next.itemDescription = item.itemDescription || "";
              next.unit = item.unitmasterId || ""; // Store unitmasterId as unit
              next.unitmasterId = item.unitmasterId || "";
              next.unitLabel = item.unitLabel || ""; // Display label
              next.itemmastid = item.itemId || "";
              next.ItemIDn = item.itemId || "";
            }
          }
          return next;
        }
        return row;
      })
    );
  };

  const makeTableHandlers = (setter, emptyRow) => ({
    onCellChange: (idx, key, value) =>
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
      ),
    onAddRow: () => setter((prev) => [...prev, emptyRow()]),
    onRemoveRow: (idx) => setter((prev) => prev.filter((_, i) => i !== idx)),
  });

  const itemHandlers = makeTableHandlers(setItemRows, emptyItemRow);

  // Override itemHandlers.onCellChange to include auto-populate logic
  const originalOnCellChange = itemHandlers.onCellChange;
  itemHandlers.onCellChange = (idx, key, value) => {
    if (key === "itemCode") {
      handleItemCellChange(idx, key, value);
    } else {
      originalOnCellChange(idx, key, value);
    }
  };

  // Config-driven lookup
  const childTabConfig = {
    binTransfer: {
      type: "table",
      rows: itemRows,
      handlers: itemHandlers,
      columns: [
        {
          key: "itemCode",
          label: "Item Code",
          type: "select",
          options: itemOptions,
        },
        { key: "itemmastid", label: "Item Master Id", readOnly: true },
        { key: "ItemIDn", label: "Item Idn", readOnly: true },
        { key: "itemDescription", label: "Item Description", readOnly: true },
        { key: "unitLabel", label: "Unit", readOnly: true }, // Use unitLabel for display
        {
          key: "availableQty",
          label: "Available Qty",
          type: "number",
        },
        { key: "qty", label: "Qty", type: "number" },
        { key: "rate", label: "Rate", type: "number" },
      ],
    },
    summary: {
      type: "fields",
    },
  };

  const activeTabConfig = childTabConfig[activeChildTab];

  const handleAddChildRow = () => {
    if (activeTabConfig.type === "table") {
      activeTabConfig.handlers.onAddRow();
    }
  };

  const validate = () => {
    const errors = {};

    if (!header.fromPlantId) errors.fromPlantId = "From Plant ID is required";
    if (!header.toPlant) errors.toPlant = "To Plant is required";
    if (!header.stockTransferDate)
      errors.stockTransferDate = "Stock Transfer Date is required";
    if (!header.fromLocation) errors.fromLocation = "From Location is required";
    if (!header.toLocation) errors.toLocation = "To Location is required";
    if (!header.reason) errors.reason = "Reason is required";

    if (
      header.fromLocation &&
      header.toLocation &&
      header.fromLocation === header.toLocation
    ) {
      errors.toLocation = "To Location must be different from From Location";
    }

    // Validate at least one item row has qty > 0
    const hasValidItem = itemRows.some((row) => Number(row.qty) > 0);
    if (!hasValidItem) {
      errors.itemRows = "Add at least one item with quantity greater than 0";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(editData?.id);
    const financialYear = new Date().getFullYear().toString();
    const usersId = localStorage.getItem("userName") || "SYSTEM";

    // Build payload matching the API schema
    const payload = {
      active: true,
      belongsTo: header.belongsTo || "",
      branch: Number(header.fromPlantId) || 0,
      cancelRemarks: "",
      createdBy: usersId,
      financialYear: financialYear,
      fromLocation: Number(header.fromLocation) || 0,
      narration: summary.narration || "",
      orgId: ORG_ID,
      reason: header.reason || "",
      stockTransferDetailsDTO: itemRows
        .filter((row) => row.itemCode && Number(row.qty) > 0)
        .map((row) => ({
          availableQty: Number(row.availableQty) || 0,
          item: Number(row.itemCode) || 0,
          qty: Number(row.qty) || 0,
          rate: Number(row.rate) || 0,
          unit: Number(row.unit) || Number(row.unitmasterId) || 0, // Use unit or unitmasterId
        })),
      toBranch: Number(header.toPlant) || 0,
      toLocation: Number(header.toLocation) || 0,
    };

    // Add id if updating
    if (isUpdate && editData.id) {
      payload.id = editData.id;
    }

    console.log("📤 Saving Stock Transfer Payload:", payload);

    try {
      const response = await stockTransferAPI.updateCreateStockTransfer(payload);
      console.log("📥 Response:", response);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        if (onSave) {
          onSave(payload);
        }
        onBack();
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save stock transfer";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      alert("Failed to save Stock Transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData ? "Edit Stock Transfer" : "Stock Transfer"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Fields ---------------- */}
        <div>
          <SectionHeader>Transfer Details</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="From Plant ID"
              name="fromPlantId"
              value={header.fromPlantId}
              onChange={handleHeaderChange}
              error={fieldErrors.fromPlantId}
              options={plantOptions}
              required
            />
            <Field
              type="select"
              label="To Plant"
              name="toPlant"
              value={header.toPlant}
              onChange={handleHeaderChange}
              error={fieldErrors.toPlant}
              options={plantOptions}
              required
            />
            <Field
              label="Stock Transfer No"
              name="stockTransferNo"
              value={header.stockTransferNo || "Auto"}
              onChange={handleHeaderChange}
              disabled={!!editData?.id || generatingDocId}
              placeholder={generatingDocId ? "Generating..." : ""}
            />
            <Field
              type="date"
              label="Stock Transfer Date"
              name="stockTransferDate"
              value={header.stockTransferDate}
              onChange={handleHeaderChange}
              error={fieldErrors.stockTransferDate}
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
              type="select"
              label="From Location"
              name="fromLocation"
              value={header.fromLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.fromLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="To Location"
              name="toLocation"
              value={header.toLocation}
              onChange={handleHeaderChange}
              error={fieldErrors.toLocation}
              options={locationOptions}
              required
            />
            <Field
              type="select"
              label="Reason"
              name="reason"
              value={header.reason}
              onChange={handleHeaderChange}
              error={fieldErrors.reason}
              options={REASONS}
              required
            />
          </div>
        </div>

        {/* ---------------- Child Tabs: Bin Transfer Details / Summary ---------------- */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
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

            {activeTabConfig.type === "table" && (
              <button
                type="button"
                onClick={handleAddChildRow}
                className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Active tab's content */}
          {activeTabConfig.type === "table" ? (
            <>
              <DynamicTable
                columns={activeTabConfig.columns}
                rows={activeTabConfig.rows}
                onCellChange={activeTabConfig.handlers.onCellChange}
                onRemoveRow={activeTabConfig.handlers.onRemoveRow}
              />
              {fieldErrors.itemRows && (
                <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 px-1">
                  {fieldErrors.itemRows}
                </p>
              )}
            </>
          ) : (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={summary.narration}
                  onChange={handleSummaryChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />
              </div>
            </div>
          )}
        </section>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={editData ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default StockTransferForm;