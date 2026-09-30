import { ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import maintenanceServiceRequestAPI from "../../../api/plantMaintenance/maintenanceServiceRequestAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import employeeAPI from "../../../api/employeeAPI";
import { useToast } from "../../Toast/ToastContext";
import listOfValuesAPI from "../../../api/listOfValuesAPI";

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
  { value: "NO", label: "NO" },
  { value: "YES", label: "YES" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 8);

const HEADER_FIELDS = [
  {
    name: "belongTo",
    label: "Belong To:",
    type: "select",
    options: [],
    required: true,
  },
  { name: "mpNo", label: "MP No:", auto: true, disabled: true },
  {
    name: "department",
    label: "Department:",
    type: "select",
    options: [],
    required: true,
  },
  {
    name: "reportedDate",
    label: "Reported Date:",
    type: "date",
    default: todayISO(),
    required: true,
  },
  { name: "mailId", label: "Mail ID:", type: "email" },
  {
    name: "reportedTime",
    label: "Reported Time:",
    type: "time",
    default: nowTime(),
  },
  { name: "phoneNo", label: "Phone No:" },
  {
    name: "completed",
    label: "Completed:",
    type: "select",
    options: YES_NO,
    default: "NO",
  },
  {
    name: "priority",
    label: "Priority:",
    type: "select",
    options: [],
  },
  { name: "closingDate", label: "Closing Date:", type: "date" },
  {
    name: "requestedBy",
    label: "Requested By:",
    type: "select",
    options: [],
  },
  {
    name: "preparedBy",
    label: "Prepared By:",
    type: "select",
    options: [],
  },
  {
    name: "approvedBy",
    label: "Approved By:",
    type: "select",
    options: YES_NO,
    default: "NO",
  },
  {
    name: "serviceRequired",
    label: "Service Required:",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
  {
    name: "remarks",
    label: "Remarks:",
    type: "textarea",
    className: "col-span-2 md:col-span-4 xl:col-span-3",
  },
];

/* ---------------------------------------------------------------------------- */

const MaintenanceServiceRequestForm = ({ onBack, onSave, editData }) => {
  const ORG_ID = parseInt(localStorage.getItem("orgId"));

  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    ...blankFromFields(HEADER_FIELDS),
    ...editData?.header,
  });

  /* -------- option lists -------- */
  const [belongToOptions, setBelongToOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Belong To                                                        */
  const loadBelongTo = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await listOfValuesAPI.getListValuesGroup(
        "SDS BELONGS TO",
        ORG_ID
      );
      const mapped = (list || []).map((item) => ({
        value: item.id || item.value,
        label: item.valuesDescription || item.label || item.name,
      }));
      setBelongToOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load Belong To:", err);
      addToast("Failed to load Belong To list", "error");
      setBelongToOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  /* ---------------------------------------------------------------- */
  /* Priority                                                         */
  const loadPriorities = useCallback(async () => {
    if (!ORG_ID) return [];
    try {
      const list = await listOfValuesAPI.getListValuesGroup(
        "PRIORITY",
        ORG_ID
      );
      const mapped = (list || []).map((item) => ({
        value: item.id || item.value,
        label: item.valuesDescription || item.label || item.name,
      }));
      setPriorityOptions(mapped);
      return mapped;
    } catch (err) {
      console.error("Failed to load Priorities:", err);
      addToast("Failed to load Priority list", "error");
      setPriorityOptions([]);
      return [];
    }
  }, [ORG_ID, addToast]);

  /* ---------------------------------------------------------------- */
  /* Department                                                       */
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

  /* ---------------------------------------------------------------- */
  /* Employees                                                        */
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

  /* ---------------------------------------------------------------- */
  /* Doc No (MP No) generation                                        */
  const loadDocId = useCallback(async () => {
    if (editData?.id) return;
    if (!ORG_ID) return;
    try {
      const financialYear = new Date().getFullYear().toString();
      const docId =
        await maintenanceServiceRequestAPI.getMaintenanceServiceRequestDocId(
          ORG_ID,
          financialYear
        );
      if (docId) {
        setHeader((p) => ({ ...p, mpNo: docId }));
      }
    } catch (err) {
      console.error("Failed to generate MP No:", err);
      addToast("Failed to generate MP No", "error");
    }
  }, [ORG_ID, editData?.id, addToast]);

  /* ---------------------------------------------------------------- */
  /* Load by id for edit                                             */
  const loadServiceRequestById = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const data =
          await maintenanceServiceRequestAPI.getMaintenanceServiceRequestById(
            id
          );
        if (!data) {
          addToast("Failed to load Maintenance Service Request", "error");
          return;
        }

        setHeader((p) => ({
          ...p,
          // Preserve doc id (mpNo) if the API doesn't return it
          mpNo: data.docId || p.mpNo || "",
          belongTo: data.belongTo?.id || "",
          department: data.department?.id || "",
          reportedDate: data.reportedDate || p.reportedDate || todayISO(),
          mailId: data.mailId || "",
          reportedTime: data.reportedTime || "",
          phoneNo: data.phoneNo || "",
          completed: data.completed || "NO",
          priority: data.priority?.id || "",
          closingDate: data.closingDate || "",
          requestedBy: data.requestedBy?.id || "",
          preparedBy: data.preparedBy?.id || "",
          approvedBy: data.approvedBy || "NO",
          serviceRequired: data.serviceRequired || "",
          remarks: data.remarks || "",
        }));
      } catch (err) {
        console.error("Error loading service request by id:", err);
        addToast("Failed to load Maintenance Service Request", "error");
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
        loadBelongTo(),
        loadPriorities(),
        loadDepartments(),
        loadEmployees(),
      ]);
      setLoadingOptions(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID]);

  /* Doc No generation — only for new records */
  useEffect(() => {
    loadDocId();
  }, [loadDocId]);

  /* Load by id — only when editing */
  useEffect(() => {
    if (editData?.id) {
      loadServiceRequestById(editData.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id]);

  /* ---------------------------------------------------------------- */
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------------------------------------------------------- */
  const validate = () => {
    const errors = {};

    if (!header.belongTo) errors.belongTo = "Belong To is required";
    if (!header.department) errors.department = "Department is required";
    if (!header.reportedDate)
      errors.reportedDate = "Reported Date is required";

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

    // ---------- Build base payload (no id) ----------
    const payload = {
      active:
        editData?.active === "Active" ||
        editData?.active === true ||
        true,
      approvedBy: header.approvedBy || "NO",
      belongTo: parseInt(header.belongTo) || 0,
      cancel: false,
      cancelRemarks: "",
      closingDate: header.closingDate || "",
      completed: header.completed || "NO",
      createdBy: localStorage.getItem("userName") || "SYSTEM",
      department: parseInt(header.department) || 0,
      mailId: header.mailId || "",
      orgId: ORG_ID,
      phoneNo: header.phoneNo || "",
      preparedBy: parseInt(header.preparedBy) || 0,
      priority: parseInt(header.priority) || 0,
      remarks: header.remarks || "",
      reportedTime: header.reportedTime || "",
      requestedBy: parseInt(header.requestedBy) || 0,
      serviceRequired: header.serviceRequired || "",
      updatedBy: localStorage.getItem("userName") || "SYSTEM",
    };

    // ---------- Add id ONLY when updating ----------
    if (editData?.id) {
      payload.id = parseInt(editData.id);
    }

    console.log("📤 Saving Maintenance Service Request Payload:", payload);

    try {
      const response =
        await maintenanceServiceRequestAPI.updateCreateMaintenanceServiceRequest(
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
            ? "Maintenance Service Request updated successfully"
            : "Maintenance Service Request created successfully",
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
        "Failed to save Maintenance Service Request.";
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Build runtime field descriptors with loaded options             */
  const runtimeHeaderFields = useMemo(
    () =>
      HEADER_FIELDS.map((f) => {
        if (f.name === "belongTo")
          return { ...f, options: belongToOptions };
        if (f.name === "priority")
          return { ...f, options: priorityOptions };
        if (f.name === "department")
          return { ...f, options: departmentOptions };
        if (f.name === "requestedBy" || f.name === "preparedBy")
          return { ...f, options: employeeOptions };
        return f;
      }),
    [belongToOptions, priorityOptions, departmentOptions, employeeOptions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading service request…
        </div>
      </div>
    );
  }

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
          {editData
            ? "Edit Maintenance Service Request"
            : "Maintenance Service Request"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-4">
        <div>
          <SectionHeader>
            Service Request Details
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

export default MaintenanceServiceRequestForm;