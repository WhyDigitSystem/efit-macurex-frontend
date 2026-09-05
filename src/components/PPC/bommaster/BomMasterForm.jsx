import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import bomMasterAPI from "../../../api/PPC/bomMasterAPI";
import { itemAPI } from "../../../api/itemAPI";
import { unitMasterAPI } from "../../../api/unitAPI";
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

const labelClasses = "block text-[11px] text-gray-500 dark:text-gray-400 mb-1";

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
/* Lookup / option lists                                                        */

// Static option lists used for screen design. These should be wired to the
// relevant backend master lookups when the endpoints are available.
const TYPE_OF_BOM_OPTIONS = [
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "SALES", label: "Sales" },
  { value: "SERVICE", label: "Service" },
];

const TYPE_OF_ITEM_OPTIONS = [
  { value: "FG", label: "Finished Good (FG)" },
  { value: "SFG", label: "Semi Finished Good (SFG)" },
];

const ITEM_TYPE_OPTIONS = [
  { value: "FG", label: "FG" },
  { value: "SFG", label: "SFG" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
  { value: "PACKING_MATERIAL", label: "Packing Material" },
  { value: "SPARES", label: "Spares" },
];

const FG_REFERENCE_TO_PROFIT_OPTIONS = [
  { value: "PROFIT_CENTRE_1", label: "Profit Centre 1" },
  { value: "PROFIT_CENTRE_2", label: "Profit Centre 2" },
  { value: "PROFIT_CENTRE_3", label: "Profit Centre 3" },
];

const FILL_DETAILS_OF_OPTIONS = [
  { value: "ITEM", label: "Item" },
  { value: "MATERIAL", label: "Material" },
  { value: "RAW_MATERIAL", label: "Raw Material" },
  { value: "SUB_ASSEMBLY", label: "Sub Assembly" },
];

const SCRAP_ITEM_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

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
/* Table building blocks                                                       */

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
        X
      </button>
    </td>
  </tr>
);

const SelectCell = ({ value, onChange, options, error }) => (
  <td className="p-1 align-top min-w-[120px]">
    <select
      value={value ?? ""}
      onChange={onChange}
      className={`${cellInputClasses} ${error ? controlErrClasses : ""}`}
    >
      <option value="">-- Select --</option>
      {(options || []).map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </td>
);

const InputCell = ({ value, onChange, type = "text", step, error }) => (
  <td
    className={`p-1 align-top ${
      type === "date"
        ? "min-w-[140px]"
        : type === "number"
          ? "min-w-[100px]"
          : "min-w-[120px]"
    }`}
  >
    <input
      type={type}
      step={step}
      value={value ?? ""}
      onChange={onChange}
      className={`${cellInputClasses} ${error ? controlErrClasses : ""}`}
    />
  </td>
);

const ReadOnlyCell = ({ value }) => (
  <td className="p-1 align-top min-w-[140px]">
    <input value={value ?? ""} readOnly className={cellReadOnlyClasses} />
  </td>
);

/* ---------------------------------------------------------------------------- */
/* Helpers                                                                      */

const fmtDate = (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "");

/* ---------------------------------------------------------------------------- */
/* Empty state builders                                                        */

const emptyHeader = () => ({
  typeOfBom: "",
  typeOfItem: "",
  fgSfgItemCode: "",
  revisionNo: 1,
  fgSfgItemDescription: "",
  specifications: "",
  wef: dayjs().format("YYYY-MM-DD"),
  fgRefToProfit: "",
  fillDetailsOf: "",
  fillDetailsOfItem: "",
});

const emptyMaterialRow = () => ({
  itemCode: "",
  itemDescription: "",
  itemType: "",
  uom: "",
  weight: "",
  qty: "",
  sfgBomRefNo: "",
  sfgBomRefDate: "",
  scrapItem: "",
  scrapUnit: "",
  scrapQty: "",
});

const emptySummary = () => ({
  remarks: "",
});

/* ---------------------------------------------------------------------------- */

const BomMasterForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId")) || 1000000001;
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [tableError, setTableError] = useState("");

  /* ---------------- Lookup options ---------------- */
  const [itemOptions, setItemOptions] = useState([]);
  const [itemMap, setItemMap] = useState({});
  const [unitOptions, setUnitOptions] = useState([]);

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const d = data?.header || data || {};
    return {
      ...emptyHeader(),
      ...d,
      wef: fmtDate(d.wef),
    };
  });

  const [materialRows, setMaterialRows] = useState(() => {
    const rows = data?.materialDetails || data?.materialDetailList || [];
    return rows.length
      ? rows.map((r) => ({
          ...emptyMaterialRow(),
          ...r,
          sfgBomRefDate: fmtDate(r.sfgBomRefDate),
        }))
      : [emptyMaterialRow()];
  });

  const [summary, setSummary] = useState(() => ({
    ...emptySummary(),
    ...(data?.summary || {}),
  }));

  /* ---------------- Lookup loading ---------------- */

  useEffect(() => {
    if (!orgId) return;

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

    const loadUnits = async () => {
      try {
        const res = await unitMasterAPI.getUnits(orgId);
        setUnitOptions(
          (res || []).map((u) => ({
            value: u.unitCode || u.code || u.id?.toString() || "",
            label:
              u.unitName ||
              u.name ||
              u.unitCode ||
              u.code ||
              u.id?.toString() ||
              "",
          })),
        );
      } catch {
        setUnitOptions([]);
      }
    };

    Promise.all([loadItems(), loadUnits()]);
  }, [orgId, branch]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => {
      let next = { ...prev, [name]: value };
      // Auto-fill FG/SFG item description when the item code is chosen
      if (name === "fgSfgItemCode") {
        const item = itemMap[value];
        next.fgSfgItemDescription =
          item?.itemDescription || item?.description || "";
      }
      return next;
    });
  };

  /* ---------------- Material detail row handlers ---------------- */

  const handleCellChange = (idx, key, value) => {
    setMaterialRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        let next = { ...row, [key]: value };
        // Auto-fill item description when the item code is chosen
        if (key === "itemCode") {
          const item = itemMap[value];
          next.itemDescription = item?.itemDescription || item?.description || "";
          if (item?.primaryUnits?.primaryUnit) {
            next.uom = item.primaryUnits.primaryUnit;
          }
        }
        return next;
      }),
    );
  };

  const handleAddRow = () =>
    setMaterialRows((prev) => [...prev, emptyMaterialRow()]);
  const handleRemoveRow = (idx) =>
    setMaterialRows((prev) => prev.filter((_, i) => i !== idx));

  /* ---------------- Summary handlers ---------------- */

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation ---------------- */

  const validate = () => {
    const errors = {};

    if (!header.typeOfBom?.trim()) errors.typeOfBom = "Type of BOM is required";
    if (!header.typeOfItem?.trim()) errors.typeOfItem = "Type of Item is required";
    if (!header.fgSfgItemCode?.trim())
      errors.fgSfgItemCode = "FG / SFG Item Code is required";
    if (!header.wef) errors.wef = "WEF is required";
    if (!header.fillDetailsOf?.trim())
      errors.fillDetailsOf = "Fill Details Of is required";
    if (!header.fillDetailsOfItem?.trim())
      errors.fillDetailsOfItem = "Fill Details Of Item is required";

    setFieldErrors(errors);

    const validRows = materialRows.every(
      (r) =>
        r.itemCode?.trim() &&
        r.itemType?.trim() &&
        r.uom?.trim() &&
        r.qty !== "" &&
        Number(r.qty) > 0,
    );

    if (!validRows)
      setTableError("Complete all mandatory columns in the Material Details grid");
    else setTableError("");

    return Object.keys(errors).length === 0 && validRows;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fill all mandatory fields before saving.", "error");
      return;
    }

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id ?? data?.header?.id);

    // Single-transaction payload: header + material details + summary.
    // The backend persists all of these together, links the BOM to the FG/SFG
    // item and revision, and keeps the complete BOM history with material &
    // scrap references (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data?.id ?? data?.header?.id } : {}),
      orgId,
      header,
      materialDetails: materialRows,
      summary,
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await bomMasterAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Bill of Material updated successfully!"
              : "Bill of Material created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Bill of Material.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Bill of Material Error:", err);
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

  /* ---------------- Column config ---------------- */

  const materialColumns = [
    { key: "itemCode", label: "Item Code *", type: "select" },
    { key: "itemDescription", label: "Item Description", readOnly: true },
    { key: "itemType", label: "Item Type *", type: "select" },
    { key: "uom", label: "UOM *", type: "select" },
    { key: "weight", label: "Weight", type: "number", step: "0.001" },
    { key: "qty", label: "Qty *", type: "number", step: "0.001" },
    { key: "sfgBomRefNo", label: "SFG BOM Ref No", type: "text" },
    { key: "sfgBomRefDate", label: "SFG BOM Ref Date", type: "date" },
    { key: "scrapItem", label: "Scrap Item", type: "select" },
    { key: "scrapUnit", label: "Scrap Unit", type: "select" },
    { key: "scrapQty", label: "Scrap Qty", type: "number", step: "0.001" },
  ];

  const rowErrors = materialRows.reduce((acc, row, idx) => {
    const errs = {};
    if (!row.itemCode?.trim()) errs.itemCode = true;
    if (!row.itemType?.trim()) errs.itemType = true;
    if (!row.uom?.trim()) errs.uom = true;
    if (row.qty === "" || Number(row.qty) <= 0) errs.qty = true;
    if (Object.keys(errs).length > 0) acc[idx] = errs;
    return acc;
  }, {});

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
          {data ? "Edit Bill of Material" : "Add Bill of Material"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Header Section ---------------- */}
        <div>
          <SectionHeader>Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="select"
              label="Type of BOM"
              name="typeOfBom"
              value={header.typeOfBom}
              onChange={handleHeaderChange}
              error={fieldErrors.typeOfBom}
              options={TYPE_OF_BOM_OPTIONS}
              required
            />
            <Field
              type="select"
              label="Type of Item"
              name="typeOfItem"
              value={header.typeOfItem}
              onChange={handleHeaderChange}
              error={fieldErrors.typeOfItem}
              options={TYPE_OF_ITEM_OPTIONS}
              required
            />
            <Field
              type="select"
              label="FG / SFG Item Code"
              name="fgSfgItemCode"
              value={header.fgSfgItemCode}
              onChange={handleHeaderChange}
              error={fieldErrors.fgSfgItemCode}
              options={itemOptions}
              required
            />
            <Field
              type="number"
              label="Revision No"
              name="revisionNo"
              value={header.revisionNo}
              onChange={handleHeaderChange}
              disabled={Boolean(data)}
            />
            <Field
              label="FG / SFG Item Description"
              name="fgSfgItemDescription"
              value={header.fgSfgItemDescription}
              onChange={handleHeaderChange}
              disabled
            />
            <Field
              type="date"
              label="WEF"
              name="wef"
              value={header.wef}
              onChange={handleHeaderChange}
              error={fieldErrors.wef}
              required
            />
            <Field
              type="select"
              label="FG Reference To Profit"
              name="fgRefToProfit"
              value={header.fgRefToProfit}
              onChange={handleHeaderChange}
              options={FG_REFERENCE_TO_PROFIT_OPTIONS}
            />
            <Field
              type="select"
              label="Fill Details Of"
              name="fillDetailsOf"
              value={header.fillDetailsOf}
              onChange={handleHeaderChange}
              error={fieldErrors.fillDetailsOf}
              options={FILL_DETAILS_OF_OPTIONS}
              required
            />
            <Field
              type="select"
              label="Fill Details Of Item"
              name="fillDetailsOfItem"
              value={header.fillDetailsOfItem}
              onChange={handleHeaderChange}
              error={fieldErrors.fillDetailsOfItem}
              options={itemOptions}
              required
            />
          </div>

          <div className="mt-4">
            <Field
              type="textarea"
              label="Specifications"
              name="specifications"
              value={header.specifications}
              onChange={handleHeaderChange}
              placeholder="Enter specifications..."
            />
          </div>
        </div>

        {/* ---------------- Material Details Section ---------------- */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionHeader>Material Details</SectionHeader>
            <button
              type="button"
              onClick={handleAddRow}
              className="h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Plus size={12} />
            </button>
          </div>

          {tableError && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
              {tableError}
            </p>
          )}

          <TableWrapper>
            <TableHead
              headers={[
                "#",
                ...materialColumns.map((c) => c.label),
                "Action",
              ]}
            />
            <tbody>
              {materialRows.map((row, idx) => {
                const errs = rowErrors[idx] || {};
                return (
                  <TableRow
                    key={idx}
                    index={idx}
                    onRemove={() => handleRemoveRow(idx)}
                    disabled={materialRows.length <= 1}
                  >
                    {materialColumns.map((col) => {
                      if (col.type === "select") {
                        const options =
                          col.key === "itemCode" || col.key === "uom"
                            ? col.key === "itemCode"
                              ? itemOptions
                              : unitOptions
                            : col.key === "itemType"
                              ? ITEM_TYPE_OPTIONS
                              : col.key === "scrapItem"
                                ? SCRAP_ITEM_OPTIONS
                                : unitOptions;
                        return (
                          <SelectCell
                            key={col.key}
                            value={row[col.key]}
                            error={errs[col.key]}
                            options={options}
                            onChange={(e) =>
                              handleCellChange(idx, col.key, e.target.value)
                            }
                          />
                        );
                      }
                      if (col.readOnly) {
                        return (
                          <ReadOnlyCell key={col.key} value={row[col.key]} />
                        );
                      }
                      return (
                        <InputCell
                          key={col.key}
                          value={row[col.key]}
                          type={col.type}
                          step={col.step}
                          error={errs[col.key]}
                          onChange={(e) =>
                            handleCellChange(idx, col.key, e.target.value)
                          }
                        />
                      );
                    })}
                  </TableRow>
                );
              })}
            </tbody>
          </TableWrapper>
        </div>

        {/* ---------------- Summary Section ---------------- */}
        <div>
          <SectionHeader>Summary</SectionHeader>
          <Field
            type="textarea"
            label="Remarks"
            name="remarks"
            value={summary.remarks}
            onChange={handleSummaryChange}
            placeholder="Enter remarks / comments..."
          />
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

export default BomMasterForm;