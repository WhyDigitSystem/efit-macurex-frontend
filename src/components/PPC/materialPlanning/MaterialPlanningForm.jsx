import { ArrowLeft, Save, X, CalendarCheck, Boxes } from "lucide-react";
import { useState } from "react";
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
  { value: "MRP", label: "MRP" },
  { value: "LIGHT | LOP | MRP", label: "Light | LOP | MRP" },
  { value: "MPS | MRP", label: "MPS | MRP" },
  { value: "MRP II", label: "MRP II" },
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

const generateDocNo = () => `MPL${dayjs().format("YYYYMMDDHHmmss")}`;

const nowTimestamp = () => dayjs().format("YYYY-MM-DD HH:mm:ss");

/* ---------------------------------------------------------------------------- */
/* Empty state builder                                                         */

const emptyHeader = () => ({
  fromDate: dayjs().format("YYYY-MM-DD"),
  toDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
  docNo: generateDocNo(),
  docDate: dayjs().format("YYYY-MM-DD"),
  mrpType: "",
});

const emptyExecution = () => ({
  postPlanningDone: false,
  postPlanningAt: "",
  mrpRunDone: false,
  mrpRunAt: "",
});

const MaterialPlanningForm = ({ data, onBack }) => {
  const { addToast } = useToast();
  const orgId = Number(localStorage.getItem("orgId"));
  const usersId = localStorage.getItem("usersId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [execError, setExecError] = useState("");

  /* ---------------- Form state ---------------- */
  const [header, setHeader] = useState(() => {
    const base = { ...emptyHeader(), ...data?.header };
    base.fromDate = fmtDate(base.fromDate);
    base.toDate = fmtDate(base.toDate);
    base.docDate = fmtDate(base.docDate);
    return base;
  });

  const [execution, setExecution] = useState(() => ({
    ...emptyExecution(),
    ...data?.execution,
  }));

  /* ---------------- Header handlers ---------------- */

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Execution handlers ---------------- */

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

  // Post Planning action button
  const handlePostPlanning = () => {
    setExecError("");
    if (!validateHeader()) {
      setExecError(
        "Complete all mandatory Planning Header fields before running Post Planning.",
      );
      return;
    }
    setExecution((prev) => ({
      ...prev,
      postPlanningDone: true,
      postPlanningAt: prev.postPlanningAt || nowTimestamp(),
    }));
    addToast("Post Planning run completed. You can now click MRP Run.");
  };

  // MRP Run action button (enabled only after Post Planning)
  const handleMrpRun = () => {
    setExecError("");
    if (!execution.postPlanningDone) {
      setExecError(
        "Please run Post Planning first before clicking the MRP Run button.",
      );
      return;
    }
    setExecution((prev) => ({
      ...prev,
      mrpRunDone: true,
      mrpRunAt: prev.mrpRunAt || nowTimestamp(),
    }));
    addToast("MRP Run completed successfully.");
  };

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    if (!validateHeader()) return;

    setIsSubmitting(true);

    const isUpdate = Boolean(data?.id);

    // Single-transaction payload: header + execution records.
    // The execution records maintain the complete planning history and the
    // backend keeps the audit trail (server-side validation).
    const payload = {
      ...(isUpdate ? { id: data.id } : {}),
      orgId,
      header: {
        ...header,
        docNo: header.docNo || generateDocNo(),
      },
      execution,
      active: data?.active ?? true,
      createdBy: isUpdate ? data?.createdBy || usersId : usersId,
      ...(isUpdate ? { updatedBy: usersId } : {}),
    };

    try {
      const response = await materialPlanningAPI.createUpdate(payload);

      if (response?.status) {
        addToast(
          response?.paramObjectsMap?.message ||
            (isUpdate
              ? "Material Planning record updated successfully!"
              : "Material Planning record created successfully!"),
        );
        onBack?.();
      } else {
        addToast(
          response?.errors?.[0]?.shortMessage ||
            response?.errors?.[0]?.longMessage ||
            response?.message ||
            response?.paramObjectsMap?.message ||
            "Failed to save Material Planning record.",
        );
      }
    } catch (err) {
      console.error("Save Material Planning Error:", err);
      if (err.response?.data) {
        addToast(
          err.response.data.message ||
            err.response.data.statusMessage ||
            err.response.data.error ||
            JSON.stringify(err.response.data),
        );
      } else {
        addToast("Something went wrong.");
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
          {data ? "Edit Material Planning" : "Add Material Planning"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        {/* ---------------- Planning Header Section ---------------- */}
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

        {/* ---------------- Planning Execution Section ---------------- */}
        <div>
          <SectionHeader>Planning Execution</SectionHeader>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2 text-xs text-blue-700 dark:text-blue-300 mb-3">
            First do Post Planning, then click on MRP Run button for MRP Run to
            happen.
          </div>

          {execError && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mb-2">
              {execError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handlePostPlanning}
              disabled={execution.postPlanningDone}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white transition-colors ${
                execution.postPlanningDone
                  ? "bg-green-600 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <CalendarCheck className="h-3 w-3" />
              {execution.postPlanningDone
                ? "Post Planning Done"
                : "Post Planning"}
            </button>

            <button
              type="button"
              onClick={handleMrpRun}
              disabled={!execution.postPlanningDone || execution.mrpRunDone}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white transition-colors ${
                execution.mrpRunDone
                  ? "bg-green-600 cursor-default"
                  : !execution.postPlanningDone
                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Boxes className="h-3 w-3" />
              {execution.mrpRunDone ? "MRP Run Done" : "MRP Run"}
            </button>
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