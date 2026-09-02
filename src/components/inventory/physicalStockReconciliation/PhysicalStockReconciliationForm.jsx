import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import physicalStockReconciliationAPI from "../../../api/Inventory/physicalStockReconciliationAPI";
import branchAPI from "../../../api/branchAPI";
import itemAPI from "../../../api/itemAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

import { useToast } from "../../Toast/ToastContext";

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
/* Helpers                                                                     */

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;

  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
};

const toInteger = (value, fallback = 0) => {
  const n = parseInt(value, 10);

  return Number.isFinite(n) ? n : fallback;
};

const round2 = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const money = (value) => round2(value).toFixed(2);

const todayISO = () => new Date().toISOString().slice(0, 10);

const nowTime = () => new Date().toTimeString().slice(0, 8);

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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={controlClasses}
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
          value={value ?? ""}
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
        value={value ?? ""}
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
/* Table helpers                                                               */

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
          className={`p-1 whitespace-nowrap ${
            i === 0
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

const SelectCell = ({ value, onChange, options }) => (
  <td className="p-1 align-top">
    <select
      value={value ?? ""}
      onChange={onChange}
      className={cellInputClasses}
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
  </td>
);

const InputCell = ({ value, onChange, type = "text", disabled }) => (
  <td className="p-1 align-top">
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className={`${cellInputClasses} ${
        disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
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
/* Empty Item Row                                                              */

const emptyItemRow = () => ({
  id: 0,
  item: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  bookStock: "",
  actualQty: "",
  difference: "",
  lcRate: "",
  rate: "",
  reasonCode: "",
  amount: "",
});

/* ---------------------------------------------------------------------------- */
/* Default Form                                                                */

const getDefaultForm = (branch) => ({
  active: true,

  approvedByPM: "Pending",

  belongsTo: "",

  branch: String(branch || ""),

  cancelRemarks: "",

  docDate: todayISO(),

  docId: "",

  financialYear: `${new Date().getFullYear()}-${String(
    (new Date().getFullYear() % 100) + 1,
  ).padStart(2, "0")}`,

  location: "",

  locationType: "",

  narration: "",

  preparedBy: "",

  refDate: todayISO(),

  refNo: "",

  time: nowTime(),
});

/* ---------------------------------------------------------------------------- */
/* Child Tabs                                                                  */

const CHILD_TABS = [
  {
    key: "physicalStockDetail",
    label: "1-Physical Stock Detail",
    type: "table",
  },
  {
    key: "summary",
    label: "2-Summary",
    type: "fields",
  },
];

/* ---------------------------------------------------------------------------- */
/* Main Component                                                              */

const PhysicalStockReconciliationForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = toInteger(localStorage.getItem("orgId"));

  const BRANCH_ID = toInteger(localStorage.getItem("branchId"));

  const isEditMode = Boolean(editData?.id);

  const { addToast } = useToast();

  const [activeChildTab, setActiveChildTab] = useState("physicalStockDetail");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState(() => ({
    ...getDefaultForm(BRANCH_ID),
    ...(editData || {}),
  }));

  const effectiveBranchId = toInteger(form.branch || BRANCH_ID);

  const [itemRows, setItemRows] = useState(
    editData?.physicalStockReConcilationDetailsDTO?.length
      ? editData.physicalStockReConcilationDetailsDTO
      : [emptyItemRow()],
  );

  /* ========================================================================= */
  /* MASTER DATA                                                               */
  /* ========================================================================= */

  const [branchOptions, setBranchOptions] = useState([]);

  const [locationTypeOptions, setLocationTypeOptions] = useState([]);

  const [locationOptions, setLocationOptions] = useState([]);

  const [belongsToOptions, setBelongsToOptions] = useState([]);

  const [itemOptions, setItemOptions] = useState([]);

  /* ========================================================================= */
  /* LOAD BRANCHES                                                             */
  /* ========================================================================= */

  const loadBranches = useCallback(async () => {
    try {
      if (!ORG_ID) {
        console.warn("ORG_ID is missing. Cannot load branches.");

        setBranchOptions([]);

        return;
      }

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

  /* ========================================================================= */
  /* LOCATION TYPE                                                             */
  /* ========================================================================= */

  const loadLocationTypes = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId) {
        setLocationTypeOptions([]);

        return;
      }

      const options =
        await physicalStockReconciliationAPI.getLocationTypeOptions(
          effectiveBranchId,
          ORG_ID,
        );

      setLocationTypeOptions(options);
    } catch (error) {
      console.error("Failed to load location types:", error);

      setLocationTypeOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  /* ========================================================================= */
  /* BELONGS TO - LOV API                                                      */
  /* ========================================================================= */

  const loadBelongsTo = useCallback(async () => {
    try {
      if (!ORG_ID) {
        console.warn("ORG_ID is missing. Cannot load Belongs To values.");

        setBelongsToOptions([]);

        return;
      }

      const response = await listOfValuesAPI.getListValuesGroup(
        "BELONGS TO",
        ORG_ID,
      );

      console.log("========== BELONGS TO LOV RESPONSE ==========");

      console.log(response);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.listValues ||
          response?.paramObjectsMap?.values ||
          response?.paramObjectsMap?.listValueDetails ||
          [];

      const options = list
        .map((item) => {
          const description =
            item?.valuesDescription ||
            item?.valueDescription ||
            item?.description ||
            item?.value ||
            "";

          return {
            value: description,
            label: description,
          };
        })
        .filter((item) => item.value);

      console.log("========== BELONGS TO OPTIONS ==========");

      console.log(options);

      setBelongsToOptions(options);
    } catch (error) {
      console.error("Failed to load Belongs To values:", error);

      setBelongsToOptions([]);
    }
  }, [ORG_ID]);

  /* ========================================================================= */
  /* LOCATIONS                                                                 */
  /* ========================================================================= */

  const loadLocations = useCallback(async () => {
    try {
      if (!ORG_ID || !effectiveBranchId || !form.locationType) {
        setLocationOptions([]);

        return;
      }

      const options = await physicalStockReconciliationAPI.getLocationDropdown(
        effectiveBranchId,
        form.locationType,
        ORG_ID,
      );

      setLocationOptions(options);
    } catch (error) {
      console.error("Failed to load locations:", error);

      setLocationOptions([]);
    }
  }, [ORG_ID, effectiveBranchId, form.locationType]);

  /* ========================================================================= */
  /* ITEMS                                                                      */
  /* ========================================================================= */

  const loadItems = useCallback(async () => {
    try {
      if (!ORG_ID) {
        setItemOptions([]);

        return;
      }

      const response = await itemAPI.getItems(ORG_ID, effectiveBranchId);

      const list = Array.isArray(response)
        ? response
        : response?.paramObjectsMap?.items ||
          response?.paramObjectsMap?.itemMasterVO ||
          [];

      setItemOptions(
        list.map((item) => ({
          value: item.itemId ?? item.id,

          label: item.itemCode || item.code || `Item ${item.itemId ?? item.id}`,

          itemDescription:
            item.itemDescription || item.itemDesc || item.description || "",

          unit: item.uom || item.unitId || item.unit || "",
        })),
      );
    } catch (error) {
      console.error("Failed to load items:", error);

      setItemOptions([]);
    }
  }, [ORG_ID, effectiveBranchId]);

  /* ========================================================================= */
  /* LOAD MASTER DATA                                                          */
  /* ========================================================================= */

  useEffect(() => {
    loadBranches();
    loadLocationTypes();
    loadBelongsTo();
    loadItems();
  }, [loadBranches, loadLocationTypes, loadBelongsTo, loadItems]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  /* ========================================================================= */
  /* DOC ID - AUTO GENERATE                                                    */
  /* ========================================================================= */

  useEffect(() => {
    if (isEditMode) return;

    if (!ORG_ID || !form.financialYear) {
      return;
    }

    let cancelled = false;

    const generateDocId = async () => {
      setGeneratingDocId(true);

      try {
        const docId =
          await physicalStockReconciliationAPI.getReconciliationDocId({
            financialYear: toInteger(String(form.financialYear).split("-")[0]),

            orgId: ORG_ID,
          });

        console.log("Generated Physical Stock Reconciliation Doc ID:", docId);

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            docId: docId || "",
          }));
        }
      } catch (error) {
        console.error(
          "Error generating physical stock reconciliation doc id:",
          error,
        );

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            docId: "",
          }));

          addToast("Failed to generate Doc No", "error");
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
  }, [isEditMode, ORG_ID, form.financialYear, addToast]);

  /* ========================================================================= */
  /* FIELD CHANGE                                                              */
  /* ========================================================================= */

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "locationType") {
      setForm((prev) => ({
        ...prev,
        locationType: value,
        location: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ========================================================================= */
  /* ITEM ROW CALCULATION                                                      */
  /* ========================================================================= */

  const calculateItemRow = (row, changedKey, changedValue) => {
    const updated = {
      ...row,
      [changedKey]: changedValue,
    };

    if (changedKey === "item") {
      const selected = itemOptions.find(
        (opt) => String(opt.value) === String(changedValue),
      );

      if (selected) {
        updated.itemCode = selected.label || "";

        updated.itemDescription = selected.itemDescription || "";

        updated.unit = selected.unit || "";
      }
    }

    const actualQty = toNumber(updated.actualQty);

    const bookStock = toNumber(updated.bookStock);

    const rate = toNumber(updated.rate);

    updated.difference = round2(actualQty - bookStock);

    updated.amount = money(actualQty * rate);

    return updated;
  };

  const handleItemRowChange = (idx, key, value) => {
    setItemRows((prev) =>
      prev.map((row, i) =>
        i === idx ? calculateItemRow(row, key, value) : row,
      ),
    );
  };

  const addItemRow = () => {
    setItemRows((prev) => [...prev, emptyItemRow()]);
  };

  const removeItemRow = (idx) => {
    setItemRows((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      return prev.filter((_, i) => i !== idx);
    });
  };

  const totalAmount = useMemo(
    () => round2(itemRows.reduce((sum, r) => sum + toNumber(r.amount), 0)),
    [itemRows],
  );

  /* ========================================================================= */
  /* VALIDATION                                                                */
  /* ========================================================================= */

  const validate = () => {
    const errors = {};

    if (!form.branch) {
      errors.branch = "Plant ID is required";
    }

    if (!form.docDate) {
      errors.docDate = "Doc. Date is required";
    }

    if (!form.locationType) {
      errors.locationType = "Location Type is required";
    }

    if (!form.location) {
      errors.location = "Location is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast("Please fill all required fields correctly", "error");

      return false;
    }

    const activeRows = itemRows.filter((r) => r.item);

    if (activeRows.length === 0) {
      addToast("Please add at least one item", "error");

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

    const details = itemRows
      .filter((r) => r.item)
      .map((r) => ({
        ...(r.id
          ? {
              id: toInteger(r.id),
            }
          : {}),

        item: toInteger(r.item),

        bookStock: toNumber(r.bookStock),

        actualQty: toNumber(r.actualQty),

        difference: toNumber(r.difference),

        lcRate: toNumber(r.lcRate),

        rate: toNumber(r.rate),

        reasonCode: r.reasonCode || "",

        amount: toNumber(r.amount),
      }));

    const payload = {
      ...(isEditMode && {
        id: editData.id,
      }),

      active: form.active !== false,

      approvedByPM: form.approvedByPM || "Pending",

      /*
       * IMPORTANT:
       * Belongs To sends the LOV description string.
       * It does NOT send the LOV ID.
       */
      belongsTo: form.belongsTo || "",

      branch: toInteger(form.branch),

      cancelRemarks: "",

      createdBy:
        (isEditMode ? form.createdBy : localStorage.getItem("userName")) ||
        "SYSTEM",

      ...(isEditMode && {
        updatedBy: localStorage.getItem("userName") || "SYSTEM",
      }),

      docDate: form.docDate || todayISO(),

      docId: form.docId || "",

      financialYear: toInteger(String(form.financialYear).split("-")[0]),

      location: toInteger(form.location),

      locationType: toInteger(form.locationType),

      narration: form.narration || "",

      orgId: ORG_ID,

      physicalStockReConcilationDetailsDTO: details,

      preparedBy: toInteger(form.preparedBy),

      refDate: form.refDate || todayISO(),

      refNo: form.refNo || "",

      time: form.time || nowTime(),
    };

    console.log("Physical Stock Reconciliation Payload:", payload);

    try {
      const response =
        await physicalStockReconciliationAPI.updateCreateReconciliation(
          payload,
        );

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        addToast(
          isEditMode
            ? "Physical Stock Reconciliation updated successfully"
            : "Physical Stock Reconciliation created successfully",
          "success",
        );

        if (onSave) {
          onSave(payload);
        } else {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.errorMessage ||
          response?.paramObjectsMap?.message ||
          response?.message ||
          "Failed to save physical stock reconciliation";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);

      addToast(
        error?.response?.data?.paramObjectsMap?.errorMessage ||
          error?.response?.data?.paramObjectsMap?.message ||
          error?.response?.data?.message ||
          "Failed to save Physical Stock Reconciliation.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ========================================================================= */
  /* CHILD TAB CONFIG                                                          */
  /* ========================================================================= */

  const childTabConfig = {
    physicalStockDetail: {
      type: "table",

      rows: itemRows,

      handlers: {
        onCellChange: handleItemRowChange,

        onAddRow: addItemRow,

        onRemoveRow: removeItemRow,
      },

      columns: [
        {
          key: "item",
          label: "Item Code",
          type: "select",
          options: itemOptions,
        },

        {
          key: "itemDescription",
          label: "Item Description",
          readOnly: true,
        },

        {
          key: "unit",
          label: "Unit",
          readOnly: false,
        },

        {
          key: "bookStock",
          label: "Book Stock",
          type: "number",
        },

        {
          key: "actualQty",
          label: "Actual Qty",
          type: "number",
        },

        {
          key: "difference",
          label: "Difference",
          type: "number",
          readOnly: true,
        },

        {
          key: "lcRate",
          label: "LC Rate",
          type: "number",
        },

        {
          key: "rate",
          label: "Rate",
          type: "number",
        },

        {
          key: "reasonCode",
          label: "Reason Code",
        },

        {
          key: "amount",
          label: "Amount",
          type: "number",
          readOnly: true,
        },
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

  /* ========================================================================= */
  /* UI                                                                        */
  /* ========================================================================= */

  return (
    <div className="p-2 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {isEditMode
            ? "Edit Physical Stock Re-Conciliation"
            : "Physical Stock Re-Conciliation"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* Header Fields */}
        <div>
          <SectionHeader>Reconciliation Details</SectionHeader>

          <div className={fieldGrid}>
            {/* Plant ID */}
            <Field
              type="select"
              label="Plant ID"
              name="branch"
              value={form.branch}
              onChange={handleFieldChange}
              error={fieldErrors.branch}
              options={branchOptions}
              required
            />

            {/* Doc No */}
            <Field
              label="Doc No."
              name="docId"
              value={generatingDocId ? "Generating..." : form.docId}
              onChange={() => {}}
              disabled
            />

            {/* Location Type */}
            <Field
              type="select"
              label="Location Type"
              name="locationType"
              value={form.locationType}
              onChange={handleFieldChange}
              error={fieldErrors.locationType}
              options={locationTypeOptions}
              required
            />

            {/* Location */}
            <Field
              type="select"
              label="Location"
              name="location"
              value={form.location}
              onChange={handleFieldChange}
              error={fieldErrors.location}
              options={locationOptions}
              disabled={!form.locationType}
              required
            />

            {/* Doc Date */}
            <Field
              type="date"
              label="Doc. Date"
              name="docDate"
              value={form.docDate}
              onChange={handleFieldChange}
              error={fieldErrors.docDate}
              required
            />

            {/* Time */}
            <Field
              type="time"
              label="Time"
              name="time"
              value={form.time}
              onChange={handleFieldChange}
            />

            {/* Ref No */}
            <Field
              label="Ref. No"
              name="refNo"
              value={form.refNo}
              onChange={handleFieldChange}
            />

            {/* Ref Date */}
            <Field
              type="date"
              label="Ref. Date"
              name="refDate"
              value={form.refDate}
              onChange={handleFieldChange}
            />

            {/* ============================================================= */}
            {/* BELONGS TO - LOV DROPDOWN                                     */}
            {/* ============================================================= */}
            <Field
              type="select"
              label="Belongs to"
              name="belongsTo"
              value={form.belongsTo}
              onChange={handleFieldChange}
              options={belongsToOptions}
            />

            {/* Prepared By PM */}
            <Field
              label="Prepared By PM"
              name="preparedBy"
              value={form.preparedBy}
              onChange={handleFieldChange}
            />

            {/* Financial Year */}
            <Field
              label="Financial Year"
              name="financialYear"
              value={form.financialYear}
              onChange={handleFieldChange}
            />

            {/* Approved By PM */}
            <Field
              label="Approved By PM"
              name="approvedByPM"
              value={form.approvedByPM}
              onChange={handleFieldChange}
            />
          </div>
        </div>

        {/* Child Tabs */}
        <section className="mt-0 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-0">
            <div className="flex overflow-x-auto">
              {CHILD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChildTab(tab.key)}
                  className={`px-4 py-1 text-xs font-semibold rounded-t whitespace-nowrap ${
                    activeChildTab === tab.key
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

          {activeTabConfig.type === "table" ? (
            <>
              <DynamicTable
                columns={activeTabConfig.columns}
                rows={activeTabConfig.rows}
                onCellChange={activeTabConfig.handlers.onCellChange}
                onRemoveRow={activeTabConfig.handlers.onRemoveRow}
              />

              <div className="flex justify-end mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Total Amount:
                <span className="font-semibold ml-1">{money(totalAmount)}</span>
              </div>
            </>
          ) : (
            <div className="pt-3">
              <div className={fieldGrid}>
                <Field
                  type="textarea"
                  label="Narration"
                  name="narration"
                  value={form.narration}
                  onChange={handleFieldChange}
                  className="col-span-2 md:col-span-4 xl:col-span-6"
                />

                <Field
                  label="Total Amount"
                  name="totalAmount"
                  value={money(totalAmount)}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
          )}
        </section>

        {/* Buttons */}
        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={isEditMode ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default PhysicalStockReconciliationForm;
