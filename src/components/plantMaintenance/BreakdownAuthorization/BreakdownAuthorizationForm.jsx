import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import machineToolBreakdownAPI from "../../../api/plantMaintenance/machineToolBreakdownAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import branchAPI from "../../../api/branchAPI";
import employeeAPI from "../../../api/employeeAPI";
import { useToast } from "../../Toast/ToastContext";

/* ---------------------------------------------------------------------------- */
/* Shared design tokens                                                         */

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 " +
  "placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-2 items-start";

/* ---------------------------------------------------------------------------- */
/* Shared building blocks                                                       */

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
          {(options || []).map((opt) => {
            const optValue =
              typeof opt === "object" ? opt.value : opt;
            const optLabel =
              typeof opt === "object" ? opt.label : opt;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
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

const FieldsGrid = ({
  fields,
  values,
  onChange,
  errors,
  gridClassName = fieldGrid,
}) => (
  <div className={gridClassName}>
    {fields.map((f) => (
      <Field
        key={f.name}
        type={f.type || "text"}
        label={f.label}
        name={f.name}
        value={f.auto ? values[f.name] || "Auto" : values[f.name]}
        onChange={onChange}
        options={f.options}
        disabled={f.disabled || f.auto}
        required={f.required}
        error={errors?.[f.name]}
        className={f.className}
      />
    ))}
  </div>
);

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

const blankFromFields = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.name]: f.default ?? "" }), {});

/* ---------------------------------------------------------------------------- */
/* Static options                                                               */

const YES_NO = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatTime = (value) => {
  if (!value) return "";
  try {
    if (typeof value === "string" && value.includes("T")) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
      }
    }
    return value;
  } catch {
    return value;
  }
};

const HEADER_FIELDS = [
  {
    name: "plant",
    label: "Plant Id",
    type: "select",
    options: [],
    required: true,
  },
  { name: "docNo", label: "DocNo", auto: true, disabled: true },
  {
    name: "docDate",
    label: "DocDate",
    type: "date",
    default: todayISO(),
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: [],
    required: true,
  },
  {
    name: "rectificationNo",
    label: "Rectification No",
    type: "select",
    options: [],
  },
  { name: "breakdownNo", label: "BreakdownNo", disabled: true },
  { name: "rectifiedDate", label: "Rectified Date", type: "date" },
  { name: "breakDownDate", label: "Break Down Date", type: "date" },
  { name: "working", label: "Working", type: "select", options: YES_NO },
  {
    name: "problem",
    label: "Problem",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  { name: "rectifiedTime", label: "Rectified Time", type: "time" },
  {
    name: "solution",
    label: "Solution",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "authorisedBy",
    label: "Authorised By",
    type: "select",
    options: [],
  },
  { name: "machineNo", label: "Machine No." },
  {
    name: "reasonIfNo",
    label: "Reason If No",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-6",
  },
];

/* ---------------------------------------------------------------------------- */

const BreakdownAuthorizationForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));
  const BRANCH_ID = parseInt(localStorage.getItem("branchId"));

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  /* -------- option lists -------- */
  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [rectificationOptions, setRectificationOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  /* ---------------------------------------------------------------- */
  const loadBranches = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await branchAPI.getBranchByOrgId(ORG_ID);
      const rawArray = Array.isArray(list)
        ? list
        : list?.paramObjectsMap?.branchList ||
        list?.paramObjectsMap?.branch ||
        [];
      const mapped = rawArray.map((b) => ({
        value: b.id,
        label: b.branchName || b.branchCode,
      }));
      setPlantOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load branches:", err);
      addToast("Failed to load Plant list", "error");
      setPlantOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  const loadDepartments = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const res = await departmentAPI.getAllDepartments(ORG_ID);

      const rawArray = Array.isArray(res)
        ? res
        : res?.paramObjectsMap?.departmentVO ||
        res?.paramObjectsMap?.departmentList ||
        res?.paramObjectsMap?.departments ||
        [];

      const mapped = rawArray.map((d) => ({
        value: d.id,
        label: d.departmentName || d.departmentCode,
      }));
      setDepartmentOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load departments:", err);
      addToast("Failed to load Department list", "error");
      setDepartmentOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  const loadEmployees = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await employeeAPI.getEmployeeByOrgId(ORG_ID);

      const rawArray = Array.isArray(list)
        ? list
        : list?.paramObjectsMap?.employeeMasterVO || [];

      const mapped = rawArray.map((e) => ({
        value: e.id,
        label: e.employeeName || e.name || e.employeeCode,
      }));
      setEmployeeOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load employees:", err);
      addToast("Failed to load Employee list", "error");
      setEmployeeOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  const loadRectificationList = useCallback(async () => {
    if (!ORG_ID || !BRANCH_ID) return [];
    try {
      const list =
        await machineToolBreakdownAPI.getMachineToolRectificationDetails(
          BRANCH_ID,
          ORG_ID
        );
      const mapped = (list || []).map((r) => ({
        value: r.docId,
        label: r.docId,
        raw: r,
      }));
      setRectificationOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load rectifications:", err);
      addToast("Failed to load Rectification list", "error");
      setRectificationOptions([]);
      return [];
    }
  }, [ORG_ID, BRANCH_ID, addToast]);

  /* ---------------------------------------------------------------- */
  /* Doc No auto-generation                                           */
  const loadDocId = useCallback(async () => {
    if (editData?.id) return;
    if (!ORG_ID) return;
    try {
      const financialYear = new Date().getFullYear().toString();
      const docId =
        await machineToolBreakdownAPI.getAuthorizationForBreakdownDocId(
          ORG_ID,
          financialYear
        );
      if (docId) {
        setHeader((p) => ({ ...p, docNo: docId }));
      }
    } catch (err) {
      console.error("Failed to generate Doc No:", err);
      addToast("Failed to generate Doc No", "error");
    }
  }, [ORG_ID, editData?.id, addToast]);

  /* ---------------------------------------------------------------- */
  /* Load by id for edit                                             */
  const loadBreakdownAuthorizationById = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const data =
          await machineToolBreakdownAPI.getAuthorizationForBreakdownById(id);
        if (!data) {
          addToast("Failed to load Authorization For Breakdown", "error");
          return;
        }

        setHeader((p) => ({
          ...p,
          plant: data.branch?.id || "",
          docNo: data.docId || p.docId || "",
          department: data.department?.id || "",
          docDate: data.rectificationDate || todayISO(),
          rectificationNo: data.rectificationNo || "",
          breakdownNo: data.breakdownNo || "",
          rectifiedDate: data.rectificationDate || "",
          breakDownDate: data.breakdownDate || "",
          working: data.working || "",
          problem: data.problem || "",
          rectifiedTime: formatTime(data.rectifiedTime) || "",
          solution: data.solution || "",
          authorisedBy: data.authorizedBy?.id || "",
          machineNo: data.machineNo || "",
          reasonIfNo: data.reasonIfNo || "",
        }));
      } catch (err) {
        console.error("Error loading authorization by id:", err);
        addToast("Failed to load Authorization For Breakdown", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  /* ---------------------------------------------------------------- */
  /* Initial load of option lists                                     */
  useEffect(() => {
    const init = async () => {
      setLoadingOptions(true);
      await Promise.all([
        loadBranches(),
        loadDepartments(),
        loadEmployees(),
        loadRectificationList(),
      ]);
      setLoadingOptions(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, BRANCH_ID]);

  /* Doc No generation — only when NOT editing */
  useEffect(() => {
    loadDocId();
  }, [loadDocId]);

  /* Load by id — only when editing */
  useEffect(() => {
    if (editData?.id) {
      loadBreakdownAuthorizationById(editData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  /* ---------------------------------------------------------------- */
  /* Rectification selection auto-fills related fields                */
  const handleRectificationChange = (docId) => {
    const found = rectificationOptions.find((o) => o.value === docId);
    const raw = found?.raw;
    if (!raw) {
      setHeader((p) => ({ ...p, rectificationNo: docId }));
      return;
    }

    setHeader((p) => ({
      ...p,
      rectificationNo: docId,
      breakdownNo: raw.breakdownNo || "",
      breakDownDate: raw.breakdownDate || "",
      rectifiedDate: raw.docDate || "",
      problem: raw.natureOfProblem || "",
      solution: raw.actionTaken || "",
      machineNo: raw.machineToolNo || "",
      rectifiedTime: formatTime(raw.rectificationTime) || "",
    }));
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "rectificationNo") {
      handleRectificationChange(value);
      return;
    }

    if (name === "plant") {
      setHeader((prev) => ({ ...prev, plant: value }));
      return;
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------- */
  const validate = () => {
    const errors = {};

    if (!header.plant) errors.plant = "Plant Id is required";
    if (!header.docDate) errors.docDate = "DocDate is required";
    if (!header.department) errors.department = "Department is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------------------------------------------------------- */
  const handleSave = async () => {
    if (!validate()) {
      addToast("Please fix validation errors before saving", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      active: editData?.active === "Active" || editData?.active === true,
      authorizedBy: parseInt(header.authorisedBy) || 0,
      branch: parseInt(header.plant) || parseInt(BRANCH_ID) || 0,
      breakdownDate: header.breakDownDate || "",
      breakdownNo: header.breakdownNo || "",
      cancelRemarks: "",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      department: parseInt(header.department) || 0,
      financialYear: new Date().getFullYear().toString(),
      machineNo: header.machineNo || "",
      orgId: ORG_ID,
      problem: header.problem || "",
      reasonIfNo: header.reasonIfNo || "",
      rectificationDate: header.rectifiedDate || "",
      rectificationNo: header.rectificationNo || "",
      rectifiedTime: header.rectifiedTime || "",
      solution: header.solution || "",
      working: header.working || "",
    };

    // id only when updating
    if (editData?.id) {
      payload.id = parseInt(editData.id);
    }

    console.log("📤 Saving Authorization For Breakdown Payload:", payload);

    try {
      const response =
        await machineToolBreakdownAPI.updateCreateAuthorizationForBreakdown(
          payload
        );
      console.log("📥 Response:", response);

      const status =
        response?.status === true ||
        response?.success === true ||
        response?.statusFlag === "Ok" ||
        response?.status === "SUCCESS" ||
        response?.status === 200 ||
        response?.statusCode === 200;

      if (status) {
        addToast(
          editData?.id
            ? "Authorization For Breakdown updated successfully"
            : "Authorization For Breakdown created successfully",
          "success"
        );
        if (onSave) onSave(payload);
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          response?.errorMessage ||
          response?.error ||
          "Something went wrong";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("❌ Save Error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save Authorization For Breakdown.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  const runtimeHeaderFields = useMemo(
    () =>
      HEADER_FIELDS.map((f) => {
        if (f.name === "plant") return { ...f, options: plantOptions };
        if (f.name === "department")
          return { ...f, options: departmentOptions };
        if (f.name === "rectificationNo")
          return { ...f, options: rectificationOptions };
        if (f.name === "authorisedBy")
          return { ...f, options: employeeOptions };
        return f;
      }),
    [plantOptions, departmentOptions, rectificationOptions, employeeOptions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading authorization data…
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData
            ? "Edit Authorization For Breakdown"
            : "Authorization For Breakdown"}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>
            Breakdown Authorization Details
            {loadingOptions && (
              <span className="ml-2 text-blue-500 normal-case font-normal">
                Loading options…
              </span>
            )}
          </SectionHeader>
          <FieldsGrid
            fields={runtimeHeaderFields}
            values={header}
            onChange={handleHeaderChange}
            errors={fieldErrors}
          />
        </div>

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

export default BreakdownAuthorizationForm;