import { ArrowLeft, Save, X } from "lucide-react";
import { useState } from "react";
// import { masterAPI } from "../../../api/itemAPI";

const UPPERCASE_FIELDS = ["itemCode", "hsnCode", "instrumentSeqCode"];


const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

/**
 * Field
 * A single component for every input type used in this form.
 * type: "text" | "number" | "select" | "checkbox"
 */
const Field = ({
  label,
  name,
  value,
  checked,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
}) => {
  if (type === "select") {
    return (
      <div className={`w-full ${className}`}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>

        <select name={name} value={value} onChange={onChange} className={controlClasses}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={`w-full ${className}`}>
        <label className={`${labelClasses} select-none opacity-0`}>-</label>

        <label className={`${controlClasses} flex items-center gap-1.5 cursor-pointer`}>
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-3.5 w-3.5 accent-blue-600 dark:accent-blue-500"
          />
          <span className="text-gray-700 dark:text-gray-200">{label}</span>
        </label>
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
        className={controlClasses}
      />

      {error && <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">{error}</p>}
    </div>
  );
};

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const fieldGrid = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */

const ItemMasterForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));

  const [form, setForm] = useState({
    // Basic Details
    itemCode: data?.itemCode || "",
    itemName: data?.itemName || "",
    itemDescription: data?.itemDescription || "",
    itemType: data?.itemType || "Finished Goods",
    primaryUnit: data?.primaryUnit || "",
    hsnCode: data?.hsnCode || "",
    importLocal: data?.importLocal || "Local",

    // Classification
    materialType: data?.materialType || "",
    materialGroup: data?.materialGroup || "",
    materialSubGroup: data?.materialSubGroup || "",

    // Quality & Inspection
    needQCApproval: data?.needQCApproval || "No",
    inspection: data?.inspection || "No",
    instrumentSeqCode: data?.instrumentSeqCode || "",

    // Stock & Ordering
    minimumOrderQuantity: data?.minimumOrderQuantity ?? "",
    stockLocation: data?.stockLocation || "",
    reorderLevel: data?.reorderLevel ?? "",

    id: data?.id || "",
    active: data?.active ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : UPPERCASE_FIELDS.includes(name)
          ? value.toUpperCase()
          : value,
    }));
  };

  const validate = () => {
    const errors = {};

    if (!form.itemCode.trim())
      errors.itemCode = "Item Code is required";

    if (!form.itemName.trim())
      errors.itemName = "Item Name is required";

    if (!form.itemType.trim())
      errors.itemType = "Item Type is required";

    if (!form.primaryUnit.trim())
      errors.primaryUnit = "Primary Unit is required";

    if (
      form.minimumOrderQuantity !== "" &&
      Number(form.minimumOrderQuantity) < 0
    )
      errors.minimumOrderQuantity = "Minimum Order Quantity cannot be negative";

    if (form.reorderLevel !== "" && Number(form.reorderLevel) < 0)
      errors.reorderLevel = "Reorder Level cannot be negative";

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      ...(data?.id && { id: data.id }),
      orgId,
      ...form,
      minimumOrderQuantity:
        form.minimumOrderQuantity === "" ? 0 : Number(form.minimumOrderQuantity),
      reorderLevel: form.reorderLevel === "" ? 0 : Number(form.reorderLevel),
      cancel: false,
      createdBy: "ITC001",
    };

    console.log(payload);

    try {
      // await masterAPI.saveItem(payload);

      alert(
        data ? "Item Updated Successfully!" : "Item Saved Successfully!"
      );

      onBack();
    } catch (error) {
      console.error(error);
      alert("Failed to save Item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 max-w-7xl ">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="
            p-1 rounded-md
            text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            transition-colors
          "
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Item" : "Add Item"}
        </h2>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">

        {/* Basic Details */}
        <div>
          <SectionHeader>Basic Details</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Item Code"
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              error={fieldErrors.itemCode}
              required
            />

            <Field
              label="Item Name"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              error={fieldErrors.itemName}
              required
            />

            <Field
              label="Item Description"
              name="itemDescription"
              value={form.itemDescription}
              onChange={handleChange}
              error={fieldErrors.itemDescription}
              className="col-span-2"
            />

            <Field
              type="select"
              label="Item Type"
              name="itemType"
              value={form.itemType}
              onChange={handleChange}
              required
              options={[
                { value: "Finished Goods", label: "Finished Goods" },
                { value: "Raw Material", label: "Raw Material" },
                { value: "Consumable", label: "Consumable" },
                { value: "Semi Finished", label: "Semi Finished" },
              ]}
            />

            <Field
              label="Primary Unit"
              name="primaryUnit"
              value={form.primaryUnit}
              onChange={handleChange}
              error={fieldErrors.primaryUnit}
              required
            />

            <Field
              label="HSN Code"
              name="hsnCode"
              value={form.hsnCode}
              onChange={handleChange}
              error={fieldErrors.hsnCode}
            />

            <Field
              type="select"
              label="Import/Local"
              name="importLocal"
              value={form.importLocal}
              onChange={handleChange}
              options={[
                { value: "Local", label: "Local" },
                { value: "Import", label: "Import" },
              ]}
            />
          </div>
        </div>

        {/* Classification */}
        <div>
          <SectionHeader>Classification</SectionHeader>

          <div className={fieldGrid}>
            <Field
              label="Material Type"
              name="materialType"
              value={form.materialType}
              onChange={handleChange}
              error={fieldErrors.materialType}
            />

            <Field
              label="Material Group"
              name="materialGroup"
              value={form.materialGroup}
              onChange={handleChange}
              error={fieldErrors.materialGroup}
            />

            <Field
              label="Material Sub Group"
              name="materialSubGroup"
              value={form.materialSubGroup}
              onChange={handleChange}
              error={fieldErrors.materialSubGroup}
            />
          </div>
        </div>

        {/* Quality & Inspection */}
        <div>
          <SectionHeader>Quality &amp; Inspection</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="select"
              label="Need QC Approval"
              name="needQCApproval"
              value={form.needQCApproval}
              onChange={handleChange}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
            />

            <Field
              type="select"
              label="Inspection"
              name="inspection"
              value={form.inspection}
              onChange={handleChange}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
            />

            <Field
              label="Instrument Seq Code"
              name="instrumentSeqCode"
              value={form.instrumentSeqCode}
              onChange={handleChange}
              error={fieldErrors.instrumentSeqCode}
            />
          </div>
        </div>

        {/* Stock & Ordering */}
        <div>
          <SectionHeader>Stock &amp; Ordering</SectionHeader>

          <div className={fieldGrid}>
            <Field
              type="number"
              label="Minimum Order Quantity"
              name="minimumOrderQuantity"
              value={form.minimumOrderQuantity}
              onChange={handleChange}
              error={fieldErrors.minimumOrderQuantity}
            />

            <Field
              label="Stock Location"
              name="stockLocation"
              value={form.stockLocation}
              onChange={handleChange}
              error={fieldErrors.stockLocation}
            />

            <Field
              type="number"
              label="Reorder Level"
              name="reorderLevel"
              value={form.reorderLevel}
              onChange={handleChange}
              error={fieldErrors.reorderLevel}
            />

            <Field
              type="checkbox"
              label="Active"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded text-xs
              border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-200
              bg-white dark:bg-gray-800
              hover:bg-gray-50 dark:hover:bg-gray-700
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-600 dark:hover:bg-blue-500
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : data ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterForm;