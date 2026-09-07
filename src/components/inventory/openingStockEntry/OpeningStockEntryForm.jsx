import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import openingStockEntryAPI from "../../../api/Inventory/openingStockEntryAPI";
import { branchAPI } from "../../../api/branchAPI";
import stockTransferGrnAPI from "../../../api/Inventory/stockTransferGRNAPI";
import { itemAPI } from "../../../api/itemAPI";
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

const controlErrClasses =
  "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

// Adequate spacing between header fields for clarity
const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const MULTILINE_CLASSES =
  "w-full px-2 py-1.5 rounded border text-xs leading-relaxed transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400";

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
  placeholder,
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
          <option value="">Select {label}</option>
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
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className={`${MULTILINE_CLASSES} ${error ? controlErrClasses : ""}`}
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
        placeholder={placeholder}
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
/* Helpers                                                                      */

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const emptyHeader = () => ({
  plant: "",
  asOnDate: dayjs().format("YYYY-MM-DD"),
  location: "",
  itemCode: "",
  itemDescription: "",
  unit: "",
  quantity: "",
  rate: "",
  amount: "",
});

const emptySummary = () => ({
  remarks: "",
});

/* ---------------------------------------------------------------------------- */

const OpeningStockEntryForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- Lookup options ---------------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const d = data?.header || data || {};
    const s = (data?.stockDetails || data?.stockDetailList || [])[0] || {};
    return {
      ...emptyHeader(),
      plant: d.plant ?? "",
      asOnDate: fmtDate(d.asOnDate),
      location: d.location ?? "",
      itemCode: s.itemCode ?? s.item ?? "",
      itemDescription:
        s.itemDescription ??
        s.itemDesc ??
        s.description ??
        s.name ??
        "",
      unit: s.unit ?? "",
      quantity: s.quantity ?? "",
      rate: s.rate ?? "",
      amount: s.amount ?? "",
    };
  });

  const [summary, setSummary] = useState(() => ({
    ...emptySummary(),
    ...(data?.summary || data || {}),
  }));

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

    const loadPlants = async () => {
      try {
        const res = await branchAPI.getBranchByOrgId(orgId);
        setPlantOptions(
          (Array.isArray(res) ? res : []).map((b) => ({
            value: b.id ?? b.branchId,
            label: b.branchName || b.name || b.branchCode || `Branch ${b.id}`,
          })),
        );
      } catch {
        setPlantOptions([]);
      }
    };

    const loadItems = async () => {
      try {
        const res = await itemAPI.getItems(orgId, branch);
        const map = {};
        const opts = (res || []).map((it) => {
          const code = it.itemCode || it.code || it.id?.toString() || "";
          map[code] = it;
          return { value: code, label: code };
        });
        setItemOptions(opts);
        setItemMap(map);
      } catch {
        setItemOptions([]);
        setItemMap({});
      }
    };

    Promise.all([loadPlants(), loadItems()]);
  }, [orgId, branch]);

  // Locations depend on the selected Plant
  useEffect(() => {
    if (!orgId || !header.plant) {
      setLocationOptions([]);
      return;
    }
    let cancelled = false;
    const loadLocations = async () => {
      try {
        const res = await stockTransferGrnAPI.getLocationDetails(
          header.plant,
          orgId,
        );
        if (cancelled) return;
        const list =
          res?.paramObjectsMap?.mapp ||
          res?.paramObjectsMap?.locationVO ||
          res?.paramObjectsMap?.locations ||
          (Array.isArray(res) ? res : []);
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
      } catch {
        if (!cancelled) setLocationOptions([]);
      }
    };
    loadLocations();
    return () => {
      cancelled = true;
    };
  }, [orgId, header.plant]);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Item Code selection auto-fills description and unit
    if (name === "itemCode") {
      const item = itemMap[value];
      setHeader((prev) => ({
        ...prev,
        itemCode: value,
        itemDescription:
          item?.itemDescription || item?.description || prev.itemDescription || "",
        unit: item?.primaryUnits?.primaryUnit || item?.unit || item?.uom || "",
      }));
      return;
    }

    // Recalculate Amount = Quantity x Rate
    if (name === "quantity" || name === "rate") {
      setHeader((prev) => {
        const qty = name === "quantity" ? value : prev.quantity;
        const rate = name === "rate" ? value : prev.rate;
        const amount =
          toNumber(qty) * toNumber(rate) !== 0
            ? (toNumber(qty) * toNumber(rate)).toFixed(2)
            : "";
        return { ...prev, [name]: value, amount };
      });
      return;
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant is required";
    if (!header.asOnDate) errors.asOnDate = "As On Date is required";
    if (!header.location) errors.location = "Location is required";
    if (!header.itemCode?.trim()) errors.itemCode = "Item Code is required";
    if (!header.unit?.trim()) errors.unit = "Unit is required";
    if (header.quantity === "" || Number(header.quantity) <= 0)
      errors.quantity = "Quantity must be greater than 0";
    if (header.rate === "" || Number(header.rate) < 0)
      errors.rate = "Rate cannot be negative";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fill all mandatory fields before saving.", "error");
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id ?? data?.header?.id);

    // Single-transaction payload: header + stock details + summary.
    // The backend persists all of these together, links the record to the
    // plant, location and item details and keeps the complete opening stock
    // history for audit & reporting (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data?.id ?? data?.header?.id } : {}),
      orgId,
      header: {
        plant: header.plant,
        asOnDate: header.asOnDate,
        location: header.location,
      },
      stockDetails: [
        {
          itemCode: header.itemCode,
          itemDescription: header.itemDescription,
          unit: header.unit,
          quantity: header.quantity,
          rate: header.rate,
          amount: header.amount,
        },
      ],
      summary,
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await openingStockEntryAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Opening stock entry updated successfully!"
              : "Opening stock entry created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Opening Stock Entry.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Opening Stock Entry Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
          "error",
        );
      } else {
        addToast("Something went wrong.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {data ? "Edit Opening Stock Entry" : "Add Opening Stock Entry"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Section ---------------- */}
        <div>
          <SectionHeader>Opening Stock Entry Details</SectionHeader>

          {/* Row 1: Plant / As On Date / Location */}
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Plant"
              name="plant"
              value={header.plant}
              onChange={handleChange}
              error={fieldErrors.plant}
              options={plantOptions}
              required
            />
            <Field
              type="date"
              label="As On Date"
              name="asOnDate"
              value={header.asOnDate}
              onChange={handleChange}
              error={fieldErrors.asOnDate}
              required
            />
            <Field
              type="select"
              label="Location"
              name="location"
              value={header.location}
              onChange={handleChange}
              error={fieldErrors.location}
              options={locationOptions}
              required
            />
          </div>

          {/* Row 2: Item Code / Item Description / Unit */}
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Item Code"
              name="itemCode"
              value={header.itemCode}
              onChange={handleChange}
              error={fieldErrors.itemCode}
              options={itemOptions}
              required
            />
            <Field
              type="text"
              label="Item Description"
              name="itemDescription"
              value={header.itemDescription}
              onChange={handleChange}
            />
            <Field
              type="text"
              label="Unit"
              name="unit"
              value={header.unit}
              onChange={handleChange}
              error={fieldErrors.unit}
              placeholder="e.g. PCS, KG"
              required
            />
          </div>

          {/* Row 3: Quantity / Rate / Amount */}
          <div className={fieldGrid}>
            <Field
              type="number"
              label="Quantity"
              name="quantity"
              value={header.quantity}
              onChange={handleChange}
              error={fieldErrors.quantity}
              step="0.001"
              placeholder="0.000"
              required
            />
            <Field
              type="number"
              label="Rate"
              name="rate"
              value={header.rate}
              onChange={handleChange}
              error={fieldErrors.rate}
              step="0.01"
              placeholder="0.00"
              required
            />
            <Field
              type="number"
              label="Amount (Auto)"
              name="amount"
              value={header.amount}
              readOnly
              disabled
              placeholder="0.00"
            />
          </div>

          {/* Remarks */}
          <div className={fieldGrid}>
            <Field
              className="col-span-full"
              type="textarea"
              label="Remarks"
              name="remarks"
              value={summary.remarks}
              onChange={(e) => {
                if (fieldErrors.remarks)
                  setFieldErrors((prev) => ({ ...prev, remarks: "" }));
                setSummary((prev) => ({ ...prev, remarks: e.target.value }));
              }}
              placeholder="Enter comments / notes..."
            />
          </div>
        </div>

        <FormButtons
          onCancel={onBack}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          saveLabel={data ? "Update" : "Save"}
        />
      </div>
    </div>
  );
};

export default OpeningStockEntryForm;