import { Save, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { taxDefinitionAPI } from "../../../api/taxDefinitionAPI";
import listOfValuesAPI from "../../../api/listOfValuesAPI";
import branchAPI from "../../../api/branchAPI";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Shared field styles (same conventions as CompanyMasterForm)                  */

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

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

const Field = ({
  label,
  name,
  value,
  checked,
  onChange,
  error,
  required,
  type = "text",
  options,
  className = "",
  disabled = false,
}) => {
  if (type === "checkbox") {
    return (
      <div className={`w-full ${className}`}>
        <label className={`${labelClasses} select-none opacity-0`}>-</label>
        <label
          className={`${controlClasses} flex items-center gap-1.5 cursor-pointer`}
        >
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
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
          rows={3}
          className={
            "w-full px-2 py-1.5 rounded border text-xs leading-snug transition-colors resize-none " +
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

const SectionHeader = ({ children, action }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {children}
    </h3>
    {action}
  </div>
);

const FormButtons = ({ onCancel, onSave, isSubmitting, saveLabel }) => (
  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
    <button
      onClick={onCancel}
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
      onClick={onSave}
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
      {isSubmitting ? "Saving..." : saveLabel}
    </button>
  </div>
);

/* ---------------------------------------------------------------------------- */
/* List-of-values group codes used by this screen                              */
/* NOTE: your sample data only shows one tax-related group: listCode "TAX"     */
/* (GST / CGST / SGST / IGST). Both Tax Name and Tax Type are wired to that    */
/* same group below. If Tax Name should come from a different group, change   */
/* TAX_NAME_LIST_CODE to that group's listCode.                                */
const MODULE_LIST_CODE = "MODULE";
const TAX_TYPE_LIST_CODE = "TAX";
const TAX_NAME_LIST_CODE = "TAX"; // <-- change this if Tax Name has its own group

/* ---------------------------------------------------------------------------- */
/* Options                                                                      */

const ADD_LESS_OPTIONS = [
  { value: "ADD", label: "Add" },
  { value: "LESS", label: "Less" },
];

const DB_CR_OPTIONS = [
  { value: "DR", label: "Debit" },
  { value: "CR", label: "Credit" },
];

const YES_NO_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
];

const TAX_POST_OPTIONS = [
  { value: "Ledger", label: "Ledger" },
  { value: "Item", label: "Item" },
];

/* ---------------------------------------------------------------------------- */
/* helpers                                                                      */

// Normalizes a value that may come back either as a plain id/string, or as a
// nested { id, valueDescription } (or { id, <labelKey> }) ref object.
const normalizeIdRef = (val, labelKey = "valueDescription") => {
  if (val && typeof val === "object") {
    return {
      id: val.id ?? "",
      label:
        val[labelKey] ??
        val.valueDescription ??
        val.branchName ??
        val.name ??
        "",
    };
  }
  return { id: val ?? "", label: "" };
};

/* ---------------------------------------------------------------------------- */
/* Empty state helpers                                                          */

const emptyDetailRow = () => ({
  taxId: "",
  taxName: "", // id
  taxNameLabel: "", // display label, kept so edit shows correct text pre-fetch
  taxType: "", // id
  taxTypeLabel: "",
  taxPercent: "",
  formula: "",
  addLess: "ADD",
  dbCr: "CR",
  glAccountName: "",
  postToFinance: "YES",
  print: "YES",
  taxPost: "Ledger",
});

const normalizeDetailRow = (d) => {
  const taxNameRef = normalizeIdRef(d.taxName);
  const taxTypeRef = normalizeIdRef(d.taxType);

  return {
    ...emptyDetailRow(),
    taxId: d.taxId ?? "",
    taxName: taxNameRef.id,
    taxNameLabel: taxNameRef.label,
    taxType: taxTypeRef.id,
    taxTypeLabel: taxTypeRef.label,
    taxPercent: d.taxPercent ?? "",
    formula: d.formula ?? "",
    addLess: d.addLess || "ADD",
    dbCr: d.dbCr || "CR",
    glAccountName: d.glAccountName ?? "",
    postToFinance: d.postToFinance || "YES",
    print: d.print || "YES",
    taxPost: d.taxPost || "Ledger",
  };
};

const emptyTaxForm = (defaultBranch = "") => ({
  id: "",
  taxNo: "",
  taxDescription: "",
  module: "", // id
  moduleName: "", // display label
  branch: defaultBranch, // id
  branchName: "", // display label
  docDate: "",
  effectiveDate: "",
  fillCopyOF: "",
  printName: "",
  cancelRemarks: "",
  active: true,
  details: [emptyDetailRow()],
});

const toDateInputValue = (val) => {
  if (!val) return "";
  // Accepts "27/07/2026" or ISO strings and normalizes to yyyy-MM-dd for <input type="date">
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  const parts = val.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return val;
};

/* ---------------------------------------------------------------------------- */
/* Main component                                                               */

const TaxDefinationForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const defaultBranchId = localStorage.getItem("branchId") || "";
  const { addToast } = useToast();

  const [form, setForm] = useState(emptyTaxForm(defaultBranchId));

  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  const [moduleOptions, setModuleOptions] = useState([]);
  const [taxNameOptions, setTaxNameOptions] = useState([]);
  const [taxTypeOptions, setTaxTypeOptions] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- load branch list once ---------------- */
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchLoading(true);
        const res = await branchAPI.getBranchByOrgId(Number(orgId));
        setBranches(res || []);
      } catch (error) {
        console.error("Branch loading error", error);
      } finally {
        setBranchLoading(false);
      }
    };

    if (orgId) fetchBranches();
  }, [orgId]);

  /* ---------------- when branch (+ org) is set, load MODULE / TAX lists for it ---------------- */
  // listOfValuesAPI.getListValuesGroup returns the RAW detail rows for that
  // group ([{ id, valueCode, valueDescription, active }, ...]) — mapping to
  // { value, label } for the <select> happens right here, same pattern as
  // your original Module fetch.
  useEffect(() => {
    const fetchModules = async () => {
      try {
        console.log("Module API Params:", {
          listCode: MODULE_LIST_CODE,
          branch: form.branch,
          orgId,
        });

        const values = await listOfValuesAPI.getListValuesGroup(
          MODULE_LIST_CODE,
          form.branch,
          orgId,
        );

        console.log("Module API Response:", values);

        setModuleOptions(
          values.map((v) => ({
            value: v.id,
            label: v.valueDescription,
          })),
        );
      } catch (error) {
        console.error("Module loading error", error);
      }
    };

    const fetchTaxLists = async () => {
      try {
        console.log("Tax API Params:", {
          listCode: TAX_TYPE_LIST_CODE,
          branch: form.branch,
          orgId,
        });

        const taxTypeValues = await listOfValuesAPI.getListValuesGroup(
          TAX_TYPE_LIST_CODE,
          form.branch,
          orgId,
        );

        console.log("Tax API Response:", taxTypeValues);

        const mappedTaxTypes = taxTypeValues.map((v) => ({
          value: v.id,
          label: v.valueDescription,
        }));
        setTaxTypeOptions(mappedTaxTypes);

        // Only fetch a second time if Tax Name actually uses a different group
        if (TAX_NAME_LIST_CODE === TAX_TYPE_LIST_CODE) {
          setTaxNameOptions(mappedTaxTypes);
        } else {
          const taxNameValues = await listOfValuesAPI.getListValuesGroup(
            TAX_NAME_LIST_CODE,
            form.branch,
            orgId,
          );
          setTaxNameOptions(
            taxNameValues.map((v) => ({
              value: v.id,
              label: v.valueDescription,
            })),
          );
        }
      } catch (error) {
        console.error("Tax list loading error", error);
        setTaxTypeOptions([]);
        setTaxNameOptions([]);
      }
    };

    const run = async () => {
      setLookupsLoading(true);
      await Promise.all([fetchModules(), fetchTaxLists()]);
      setLookupsLoading(false);
    };

    if (orgId && form.branch) run();
  }, [orgId, form.branch]);

  /* ---------------- populate form from a full tax definition record ---------------- */
  const populateForm = (tax) => {
    if (!tax) return;

    const moduleRef = normalizeIdRef(tax.module, "valuesDescription");
    const branchRef = normalizeIdRef(tax.branch, "branchName");

    setForm({
      ...emptyTaxForm(defaultBranchId),
      id: tax.id ?? "",
      taxNo: tax.taxNo ?? "",
      taxDescription: tax.taxDescription || "",
      module: moduleRef.id,
      moduleName: moduleRef.label,
      branch: branchRef.id || defaultBranchId,
      branchName: branchRef.label,
      docDate: toDateInputValue(tax.docDate),
      effectiveDate: toDateInputValue(tax.effectiveDate),
      fillCopyOF: tax.fillCopyOF || tax.fillCopyOf || "",
      printName: tax.printName ?? "",
      cancelRemarks: tax.cancelRemarks || "",
      active:
        tax.active === undefined
          ? true
          : tax.active === true || tax.active === "Active",
      details:
        Array.isArray(tax.details) && tax.details.length > 0
          ? tax.details.map(normalizeDetailRow)
          : Array.isArray(tax.taxDefinitionDetailsVO) &&
              tax.taxDefinitionDetailsVO.length > 0
            ? tax.taxDefinitionDetailsVO.map(normalizeDetailRow)
            : [emptyDetailRow()],
    });
  };

  // Whenever `data` has an id (i.e. the user clicked Edit), always go back to
  // the server and load the complete record before populating — never trust
  // whatever partial row the list table happened to pass in.
  useEffect(() => {
    if (!data?.id) {
      // Add-new mode — nothing to fetch
      setForm(emptyTaxForm(defaultBranchId));
      return;
    }

    let cancelled = false;

    const fetchTax = async () => {
      setIsLoading(true);
      try {
        const tax = await taxDefinitionAPI.getTaxDefinitionById(data.id);
        if (!cancelled) populateForm(tax);
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          addToast("Failed to load tax definition details");
          populateForm(data); // fall back to partial data rather than a blank screen
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTax();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Changing the branch changes which MODULE / TAX list applies, so any
  // module/taxName/taxType already picked from the OLD branch's list is
  // cleared — same cascading pattern as Country -> State -> City elsewhere.
  const handleBranchChange = (e) => {
    const id = e.target.value;
    const selected = branches.find((b) => String(b.id) === String(id));

    setForm((prev) => ({
      ...prev,
      branch: id,
      branchName: selected?.branchName || "",
      module: "",
      moduleName: "",
      details: prev.details.map((d) => ({
        ...d,
        taxName: "",
        taxNameLabel: "",
        taxType: "",
        taxTypeLabel: "",
      })),
    }));

    if (fieldErrors.branch) {
      setFieldErrors((prev) => ({ ...prev, branch: "" }));
    }
  };

  const handleModuleChange = (e) => {
    const id = e.target.value;
    const selected = moduleOptions.find((m) => String(m.value) === String(id));
    setForm((prev) => ({
      ...prev,
      module: id,
      moduleName: selected?.label || "",
    }));
    if (fieldErrors.module) {
      setFieldErrors((prev) => ({ ...prev, module: "" }));
    }
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const details = [...prev.details];
      details[index] = { ...details[index], [name]: value };
      return { ...prev, details };
    });

    const errKey = `detail_${index}_${name}`;
    if (fieldErrors[errKey]) {
      setFieldErrors((prev) => ({ ...prev, [errKey]: "" }));
    }
  };

  // Dedicated handler for the id-backed Tax Name / Tax Type dropdowns —
  // stores the selected id (sent to the API) AND its label (kept only for
  // display, e.g. so edit mode shows the right text even before options load).
  const handleDetailListChange = (index, field, e) => {
    const id = e.target.value;
    const options = field === "taxName" ? taxNameOptions : taxTypeOptions;
    const selected = options.find((o) => String(o.value) === String(id));

    setForm((prev) => {
      const details = [...prev.details];
      details[index] = {
        ...details[index],
        [field]: id,
        [`${field}Label`]: selected?.label || "",
      };
      return { ...prev, details };
    });

    const errKey = `detail_${index}_${field}`;
    if (fieldErrors[errKey]) {
      setFieldErrors((prev) => ({ ...prev, [errKey]: "" }));
    }
  };

  const addDetailRow = () => {
    setForm((prev) => ({
      ...prev,
      details: [...prev.details, emptyDetailRow()],
    }));
  };

  const removeDetailRow = (index) => {
    setForm((prev) => {
      if (prev.details.length <= 1) return prev; // keep at least one row
      return { ...prev, details: prev.details.filter((_, i) => i !== index) };
    });
  };

  const validate = () => {
    const errors = {};

    if (!String(form.branch || "").trim()) errors.branch = "Branch is required";

    if (!String(form.taxNo).trim()) errors.taxNo = "Tax No is required";

    if (!form.taxDescription.trim())
      errors.taxDescription = "Tax Description is required";

    if (!String(form.module).trim()) errors.module = "Module is required";

    if (!form.effectiveDate)
      errors.effectiveDate = "Effective Date is required";

    form.details.forEach((row, idx) => {
      if (!row.taxId?.trim())
        errors[`detail_${idx}_taxId`] = "Tax ID is required";
      if (!String(row.taxName || "").trim())
        errors[`detail_${idx}_taxName`] = "Tax Name is required";
      if (!String(row.taxType || "").trim())
        errors[`detail_${idx}_taxType`] = "Tax Type is required";
      if (row.taxPercent !== "" && isNaN(Number(row.taxPercent)))
        errors[`detail_${idx}_taxPercent`] = "Enter a valid %";
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      id: form.id ? Number(form.id) : undefined,
      taxNo: Number(form.taxNo),
      taxDescription: form.taxDescription,
      module: Number(form.module),
      branch: Number(form.branch),
      orgId: Number(orgId),
      docDate: form.docDate || null,
      effectiveDate: form.effectiveDate,
      fillCopyOF: form.fillCopyOF,
      printName: form.printName,
      cancelRemarks: form.cancelRemarks,
      active: form.active,
      createdBy: localStorage.getItem("userName") || "Admin",
      // Only send the fields the backend actually expects — dropping the
      // *Label helper fields we use purely for display.
      details: form.details.map((d) => ({
        taxId: d.taxId,
        taxName: d.taxName ? Number(d.taxName) : null,
        taxType: d.taxType ? Number(d.taxType) : null,
        taxPercent: d.taxPercent !== "" ? Number(d.taxPercent) : 0,
        formula: d.formula,
        addLess: d.addLess,
        dbCr: d.dbCr,
        glAccountName: d.glAccountName,
        postToFinance: d.postToFinance,
        print: d.print,
        taxPost: d.taxPost,
      })),
    };

    try {
      const response =
        await taxDefinitionAPI.updateCreateTaxDefinition(payload);

      if (response?.status) {
        addToast("Tax Definition saved successfully!");
        onBack();
      } else {
        const msg =
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.paramObjectsMap?.message ||
          "Failed to save tax definition";
        addToast(msg);
      }
    } catch (error) {
      console.error("Error saving tax definition:", error);
      const serverMsg =
        error?.response?.data?.errors?.[0]?.longMessage ||
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      addToast(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Loading tax definition details...
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Tax Definition" : "Add Tax Definition"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-6">
        {/* Tax Header Details */}
        <div>
          <SectionHeader>Tax Details</SectionHeader>

          <div className={fieldGrid}>
            {/* Branch selector — drives which branch's MODULE / TAX
                list-of-values get loaded for the dropdowns below. */}
            <Field
              type="select"
              label="Branch"
              name="branch"
              value={form.branch}
              onChange={handleBranchChange}
              error={fieldErrors.branch}
              required
              disabled={branchLoading}
              options={[
                ...(form.branch &&
                !branches.some((b) => String(b.id) === String(form.branch))
                  ? [{ value: form.branch, label: form.branchName }]
                  : []),
                ...branches,
              ].map((b) => ({
                value: b.id,
                label: b.branchName ?? b.label,
              }))}
            />

            <Field
              type="number"
              label="Tax No"
              name="taxNo"
              value={form.taxNo}
              onChange={handleChange}
              error={fieldErrors.taxNo}
              required
            />

            <Field
              label="Tax Description"
              name="taxDescription"
              value={form.taxDescription}
              onChange={handleChange}
              error={fieldErrors.taxDescription}
              required
              className="col-span-2"
            />

            <Field
              type="select"
              label="Module"
              name="module"
              value={form.module}
              onChange={handleModuleChange}
              error={fieldErrors.module}
              required
              disabled={!form.branch || lookupsLoading}
              options={[
                ...(form.module &&
                !moduleOptions.some(
                  (m) => String(m.value) === String(form.module),
                )
                  ? [{ value: form.module, label: form.moduleName }]
                  : []),
                ...moduleOptions,
              ]}
            />

            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={form.docDate}
              onChange={handleChange}
              error={fieldErrors.docDate}
            />

            <Field
              type="date"
              label="Effective Date"
              name="effectiveDate"
              value={form.effectiveDate}
              onChange={handleChange}
              error={fieldErrors.effectiveDate}
              required
            />

            <Field
              label="Fill Copy Of"
              name="fillCopyOF"
              value={form.fillCopyOF}
              onChange={handleChange}
              error={fieldErrors.fillCopyOF}
            />

            <Field
              label="Print Name"
              name="printName"
              value={form.printName}
              onChange={handleChange}
              error={fieldErrors.printName}
            />

            <Field
              label="Cancel Remarks"
              name="cancelRemarks"
              value={form.cancelRemarks}
              onChange={handleChange}
              error={fieldErrors.cancelRemarks}
              className="col-span-2"
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

        {/* Tax Detail Rows */}
        <div>
          <SectionHeader
            action={
              <button
                type="button"
                onClick={addDetailRow}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </button>
            }
          >
            Tax Component Details
          </SectionHeader>

          {!form.branch && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2">
              Select a branch above to load Tax Name / Tax Type options.
            </p>
          )}

          <div className="space-y-3">
            {form.details.map((row, idx) => (
              <div
                key={idx}
                className="relative border border-gray-200 dark:border-gray-700 rounded-md p-3"
              >
                {form.details.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDetailRow(idx)}
                    className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start pr-6">
                  <Field
                    label="Tax ID"
                    name="taxId"
                    value={row.taxId}
                    onChange={(e) => handleDetailChange(idx, e)}
                    error={fieldErrors[`detail_${idx}_taxId`]}
                    required
                  />

                  {/* Tax Name — id-backed dropdown sourced from list-of-values.
                      The id is what gets saved; the label is what's shown. */}
                  <Field
                    type="select"
                    label="Tax Name"
                    name="taxName"
                    value={row.taxName}
                    onChange={(e) => handleDetailListChange(idx, "taxName", e)}
                    error={fieldErrors[`detail_${idx}_taxName`]}
                    required
                    disabled={!form.branch || lookupsLoading}
                    options={[
                      ...(row.taxName &&
                      !taxNameOptions.some(
                        (o) => String(o.value) === String(row.taxName),
                      )
                        ? [{ value: row.taxName, label: row.taxNameLabel }]
                        : []),
                      ...taxNameOptions,
                    ]}
                  />

                  {/* Tax Type — id-backed dropdown ("TAX" group: GST / CGST / SGST / IGST) */}
                  <Field
                    type="select"
                    label="Tax Type"
                    name="taxType"
                    value={row.taxType}
                    onChange={(e) => handleDetailListChange(idx, "taxType", e)}
                    error={fieldErrors[`detail_${idx}_taxType`]}
                    required
                    disabled={!form.branch || lookupsLoading}
                    options={[
                      ...(row.taxType &&
                      !taxTypeOptions.some(
                        (o) => String(o.value) === String(row.taxType),
                      )
                        ? [{ value: row.taxType, label: row.taxTypeLabel }]
                        : []),
                      ...taxTypeOptions,
                    ]}
                  />

                  <Field
                    type="number"
                    label="Tax %"
                    name="taxPercent"
                    value={row.taxPercent}
                    onChange={(e) => handleDetailChange(idx, e)}
                    error={fieldErrors[`detail_${idx}_taxPercent`]}
                  />

                  <Field
                    label="Formula"
                    name="formula"
                    value={row.formula}
                    onChange={(e) => handleDetailChange(idx, e)}
                    error={fieldErrors[`detail_${idx}_formula`]}
                    className="col-span-2"
                  />

                  <Field
                    label="GL Account Name"
                    name="glAccountName"
                    value={row.glAccountName}
                    onChange={(e) => handleDetailChange(idx, e)}
                    error={fieldErrors[`detail_${idx}_glAccountName`]}
                    className="col-span-2"
                  />

                  <Field
                    type="select"
                    label="Add / Less"
                    name="addLess"
                    value={row.addLess}
                    onChange={(e) => handleDetailChange(idx, e)}
                    options={ADD_LESS_OPTIONS}
                  />

                  <Field
                    type="select"
                    label="Db / Cr"
                    name="dbCr"
                    value={row.dbCr}
                    onChange={(e) => handleDetailChange(idx, e)}
                    options={DB_CR_OPTIONS}
                  />

                  <Field
                    type="select"
                    label="Tax Post"
                    name="taxPost"
                    value={row.taxPost}
                    onChange={(e) => handleDetailChange(idx, e)}
                    options={TAX_POST_OPTIONS}
                  />

                  <Field
                    type="select"
                    label="Post To Finance"
                    name="postToFinance"
                    value={row.postToFinance}
                    onChange={(e) => handleDetailChange(idx, e)}
                    options={YES_NO_OPTIONS}
                  />

                  <Field
                    type="select"
                    label="Print"
                    name="print"
                    value={row.print}
                    onChange={(e) => handleDetailChange(idx, e)}
                    options={YES_NO_OPTIONS}
                  />
                </div>
              </div>
            ))}
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

export default TaxDefinationForm;
