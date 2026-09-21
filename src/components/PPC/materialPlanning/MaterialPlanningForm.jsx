import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import materialPlanningAPI from "../../../api/PPC/materialPlanningAPI";
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

const fieldGrid =
  "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-4 items-start";

const MRP_TYPE_OPTIONS = [
  { value: "Provisional", label: "Provisional" },
  { value: "Final", label: "Final" },
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

/* ---------------------------------------------------------------------------- */
/* Empty state builder                                                         */

const emptyHeader = () => ({
  fromDate: dayjs().format("YYYY-MM-DD"),
  toDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
  docNo: "",
  docDate: dayjs().format("YYYY-MM-DD"),
  mrpType: "",
});

/* ---------------------------------------------------------------------------- */

const MaterialPlanningForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const branch = Number(localStorage.getItem("branchId"));
  const usersId = localStorage.getItem("usersId");

  const isEditMode = Boolean(data?.id);
  const docIdLoadedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const base = { ...emptyHeader(), ...(data?.header || {}) };
    base.fromDate = fmtDate(base.fromDate);
    base.toDate = fmtDate(base.toDate);
    base.docDate = fmtDate(base.docDate) || dayjs().format("YYYY-MM-DD");
    base.docNo = data?.header?.docNo || data?.docId || "";
    return base;
  });

  /* ---------------- Re-sync when data prop changes ---------------- */
  useEffect(() => {
    if (!data) return;
    const base = { ...emptyHeader(), ...(data.header || {}) };
    base.fromDate = fmtDate(base.fromDate);
    base.toDate = fmtDate(base.toDate);
    base.docDate = fmtDate(base.docDate) || dayjs().format("YYYY-MM-DD");
    base.docNo = data.header?.docNo || data.docId || "";
    setHeader(base);
  }, [data]);

  /* ---------------- Doc Id auto-generation (Add mode) ---------------- */
  useEffect(() => {
    if (isEditMode || docIdLoadedRef.current) return;
    if (!orgId) return;

    let cancelled = false;

    (async () => {
      try {
        const financialYear = String(new Date().getFullYear());
        const docId = await materialPlanningAPI.getDocId({
          financialYear,
          orgId,
        });
        if (!cancelled && docId) {
          setHeader((prev) => ({ ...prev, docNo: docId }));
          docIdLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Failed to generate Material Planning DocId:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, orgId]);

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Validation ---------------- */

  const validateHeader = () => {
    const errors = {};
    if (!header.fromDate) errors.fromDate = "From Date is required";
    if (!header.toDate) errors.toDate = "To Date is required";
    if (!header.docNo?.trim()) errors.docNo = "Doc No is required";
    if (!header.docDate) errors.docDate = "Doc Date is required";
    if (!header.mrpType?.trim()) errors.mrpType = "MRP Type is required";

    if (
      header.fromDate &&
      header.toDate &&
      dayjs(header.fromDate).isAfter(dayjs(header.toDate))
    ) {
      errors.fromDate = "From Date cannot be after To Date";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validateHeader()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);
    const financialYear = String(new Date().getFullYear());

    /* ---- Payload matches the backend contract exactly ---- */
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),

      active: data?.active ?? true,
      cancelRemarks: data?.cancelRemarks ?? "",

      orgId: Number(orgId),
      branch: Number(branch) || 0,
      financialYear,

      createdBy: isUpdate ? data?.createdBy ?? usersId ?? "" : usersId ?? "",

      docDate: header.docDate || dayjs().format("YYYY-MM-DD"),
      fromDate: header.fromDate || "",
      toDate: header.toDate || "",

      mrpType: header.mrpType || "",
    };

    console.log("Saving Material Planning payload:", payload);

    try {
      const response = await materialPlanningAPI.createUpdate(payload);

      const isSuccess =
        response?.status === true ||
        response?.statusFlag === "Ok" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (isSuccess) {
        addToast(
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "Material Planning record updated successfully!"
            : "Material Planning record created successfully!"),
          "success",
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
          response?.errors?.[0]?.longMessage ||
          response?.message ||
          response?.paramObjectsMap?.message ||
          "Failed to save Material Planning record.",
          "error",
        );
      }
    } catch (err) {
      console.error("Save Material Planning Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
          err.response.data.statusMessage ||
          err.response.data.error ||
          "Failed to save Material Planning record.",
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
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data ? "Edit Material Planning" : "Add Material Planning"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>Planning Header</SectionHeader>
          <div className={fieldGrid}>
            <Field
              type="date"
              label="From Date"
              name="fromDate"
              value={header.fromDate}
              onChange={handleHeaderChange}
              error={fieldErrors.fromDate}
              required
            />
            <Field
              type="date"
              label="To Date"
              name="toDate"
              value={header.toDate}
              onChange={handleHeaderChange}
              error={fieldErrors.toDate}
              required
            />
            <Field
              label="Doc No"
              name="docNo"
              value={header.docNo}
              onChange={handleHeaderChange}
              error={fieldErrors.docNo}
              disabled
              required
            />
            <Field
              type="date"
              label="Doc Date"
              name="docDate"
              value={header.docDate}
              onChange={handleHeaderChange}
              error={fieldErrors.docDate}
              disabled
              required
            />
            <Field
              type="select"
              label="MRP Type"
              name="mrpType"
              value={header.mrpType}
              onChange={handleHeaderChange}
              error={fieldErrors.mrpType}
              options={MRP_TYPE_OPTIONS}
              required
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

export default MaterialPlanningForm;