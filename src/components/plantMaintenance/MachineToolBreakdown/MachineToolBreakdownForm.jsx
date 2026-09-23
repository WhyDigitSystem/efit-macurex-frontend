// MachineToolBreakdownForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Save, X, Upload, Clock3 } from "lucide-react";
import { useToast } from "../../Toast/ToastContext";
import machineToolBreakdownAPI from "../../../api/machineToolBreakdownAPI";

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

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  options = [],
  className = "",
  placeholder = "",
  disabled = false,
  step,
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
          className={`${controlClasses} ${
            error ? "border-red-500 dark:border-red-500" : ""
          }`}
          disabled={disabled}
        >
          <option value="">Select an option</option>

          {options.map((opt) => (
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
        className={`${controlClasses} ${
          error ? "border-red-500 dark:border-red-500" : ""
        }`}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
      />

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

/*
 * Time field styled to match the existing form.
 * Keeps the native browser time picker but adds a clock icon,
 * compact border, focus state and consistent height.
 */
const TimeField = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div className="w-full">
      <label className={labelClasses}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div
        className={`relative h-[30px] rounded border bg-white dark:bg-gray-900
        ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-gray-300 dark:border-gray-600"
        }
        focus-within:ring-1 focus-within:ring-blue-500
        focus-within:border-blue-500
        dark:focus-within:ring-blue-400
        dark:focus-within:border-blue-400`}
      >
        <Clock3
          className="absolute left-2 top-1/2 -translate-y-1/2
          h-3.5 w-3.5 text-gray-400 dark:text-gray-500
          pointer-events-none"
        />

        <input
          type="time"
          name={name}
          value={value ?? ""}
          onChange={onChange}
          step="1"
          className="w-full h-full pl-7 pr-2 rounded bg-transparent
          border-0 outline-none text-xs leading-none
          text-gray-900 dark:text-gray-100
          cursor-pointer"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-2 items-start";

const MachineToolBreakdownForm = ({ data, onBack }) => {
  const [orgId] = useState(localStorage.getItem("orgId"));
  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatingDocId, setGeneratingDocId] = useState(false);

  const [imageFile, setImageFile] = useState(null);

  const branchesLoadedRef = useRef(false);
  const departmentsLoadedRef = useRef(false);
  const toolCategoriesLoadedRef = useRef(false);
  const employeesLoadedRef = useRef(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [toolCategoryOptions, setToolCategoryOptions] = useState([]);
  const [machineToolList, setMachineToolList] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [maintenanceTypeOptions, setMaintenanceTypeOptions] = useState([]);
  const [natureOfBreakdownOptions, setNatureOfBreakdownOptions] = useState([]);
  const [breakdownTypeOptions, setBreakdownTypeOptions] = useState([]);
  const getToday = () => new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    plantId: data?.branch?.id || "",
    department: data?.department?.id || "",
    breakdownNo: data?.docId || "",

    selectMachineToolInst: data?.selectMachineToolInst?.id || "",

    date: data?.reportedDate || getToday(),

    machineToolIdInst: data?.machineToolIdInst || "",
    machineName: data?.machineName || "",
    pmCheckListNo: data?.pmCheckListNo?.id || "",
    location: data?.location || "",

    breakdownTime:
      typeof data?.breakdownTime === "string"
        ? data.breakdownTime.substring(0, 8)
        : "",

    breakdownDate: data?.reportedDate || getToday(),

    reportedDate: data?.reportedDate || getToday(),

    reportedTime:
      typeof data?.reportedTime === "string"
        ? data.reportedTime.substring(0, 8)
        : "",

    reportedBy: data?.reportedBy?.id || data?.reportedBy || "",

    operatorName:
      data?.operatorName?.id ||
      data?.operatorName?.employeeId ||
      data?.operatorName ||
      "",

    maintenanceType: data?.maintenanceType?.id || "",
    natureOfBreakdown: data?.natureOfBreakdown?.id || "",
    natureOfProblem: data?.natureOfProblem || "",
    estimatedTime: data?.estimatedTime || "",
    breakdownType: data?.breakdownType?.id || "",
    remarks: data?.remarks || "",

    image: data?.image || null,
  });

  // ---------------------------------------------------------
  // Load Branches
  // ---------------------------------------------------------
  const loadBranches = useCallback(async () => {
    if (branchesLoadedRef.current) return;

    try {
      const branches = await machineToolBreakdownAPI.getBranchByOrgId(orgId);

      setPlantOptions(
        (branches || []).map((b) => ({
          value: b.id,
          label: b.branchName || b.branchCode || b.id,
        })),
      );

      branchesLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load branches:", error);
      setPlantOptions([]);
    }
  }, [orgId]);

  // ---- Load Common List Values ----
  const loadListValues = useCallback(async () => {
    try {
      const [maintenanceTypes, natureOfBreakdowns, breakdownTypes] =
        await Promise.all([
          machineToolBreakdownAPI.getListValuesGroup("MAINTENANCE TYPE", orgId),
          machineToolBreakdownAPI.getListValuesGroup(
            "NATURE OF BREAKDOWN",
            orgId,
          ),
          machineToolBreakdownAPI.getListValuesGroup("BREAKDOWN TYPE", orgId),
        ]);

      setMaintenanceTypeOptions(
        maintenanceTypes.map((item) => ({
          value: item.id,
          label: item.valuesDescription,
        })),
      );

      setNatureOfBreakdownOptions(
        natureOfBreakdowns.map((item) => ({
          value: item.id,
          label: item.valuesDescription,
        })),
      );

      setBreakdownTypeOptions(
        breakdownTypes.map((item) => ({
          value: item.id,
          label: item.valuesDescription,
        })),
      );
    } catch (error) {
      console.error("Failed to load breakdown list values:", error);

      setMaintenanceTypeOptions([]);
      setNatureOfBreakdownOptions([]);
      setBreakdownTypeOptions([]);
    }
  }, [orgId]);

  // ---------------------------------------------------------
  // Load Departments
  // ---------------------------------------------------------
  const loadDepartments = useCallback(async () => {
    if (departmentsLoadedRef.current) return;

    try {
      const departments =
        await machineToolBreakdownAPI.getAllDepartmentByOrgId(orgId);

      setDepartmentOptions(
        (departments || []).map((d) => ({
          value: d.id,
          label: d.departmentName || d.departmentCode || d.id,
        })),
      );

      departmentsLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartmentOptions([]);
    }
  }, [orgId]);

  // ---------------------------------------------------------
  // Load Tool Categories
  // ---------------------------------------------------------
  const loadToolCategories = useCallback(async () => {
    if (toolCategoriesLoadedRef.current) return;

    try {
      const categories =
        await machineToolBreakdownAPI.getToolCategoryByOrgId(orgId);

      setToolCategoryOptions(
        (categories || []).map((c) => ({
          value: c.id,
          label:
            c.apllicableFor || c.applicableFor || c.toolCategoryName || c.id,
        })),
      );

      toolCategoriesLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load tool categories:", error);
      setToolCategoryOptions([]);
    }
  }, [orgId]);

  // ---------------------------------------------------------
  // Load Employees
  // ---------------------------------------------------------
  const loadEmployees = useCallback(async () => {
    if (employeesLoadedRef.current) return;

    try {
      const employees =
        await machineToolBreakdownAPI.getEmployeeMasterByOrgId(orgId);

      setEmployeeOptions(
        (employees || []).map((e) => ({
          value: e.id,
          label: e.employeeName || e.employeeId || e.id,
        })),
      );

      employeesLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployeeOptions([]);
    }
  }, [orgId]);

  // ---------------------------------------------------------
  // Load Machine / Tool List
  // IMPORTANT: use selected plant, not localStorage branchId
  // ---------------------------------------------------------
  const loadMachineTools = useCallback(
    async (toolCategoryId, selectedBranchId) => {
      if (!toolCategoryId || !selectedBranchId) {
        setMachineToolList([]);
        return;
      }

      try {
        const list = await machineToolBreakdownAPI.getMachineToolForBreakdown(
          toolCategoryId,
          orgId,
          selectedBranchId,
        );

        setMachineToolList(list || []);
      } catch (error) {
        console.error("Failed to load machine tools:", error);
        setMachineToolList([]);
      }
    },
    [orgId],
  );

  // ---------------------------------------------------------
  // Generate Breakdown Document ID
  // ---------------------------------------------------------
  const generateDocId = useCallback(async () => {
    if (data?.id) return;

    setGeneratingDocId(true);

    try {
      const financialYear = new Date().getFullYear().toString();

      const docId = await machineToolBreakdownAPI.getMachineToolBreakdownDocId(
        orgId,
        financialYear,
      );

      setForm((prev) => ({
        ...prev,
        breakdownNo: docId,
      }));
    } catch (error) {
      console.error("Failed to generate doc id:", error);
    } finally {
      setGeneratingDocId(false);
    }
  }, [data?.id, orgId]);

  // ---------------------------------------------------------
  // Initial Load
  // ---------------------------------------------------------
  useEffect(() => {
    loadBranches();
    loadDepartments();
    loadToolCategories();
    loadEmployees();
    loadListValues();
    generateDocId();
  }, [
    loadBranches,
    loadDepartments,
    loadToolCategories,
    loadEmployees,
    loadListValues,
    generateDocId,
  ]);
  // ---------------------------------------------------------
  // Load Machines whenever category or plant changes
  // ---------------------------------------------------------
  useEffect(() => {
    if (form.selectMachineToolInst && form.plantId) {
      loadMachineTools(form.selectMachineToolInst, form.plantId);
    } else {
      setMachineToolList([]);
    }
  }, [form.selectMachineToolInst, form.plantId, loadMachineTools]);

  // ---------------------------------------------------------
  // Edit - Fetch complete record
  // ---------------------------------------------------------
  useEffect(() => {
    if (!data?.id) return;

    const fetchById = async () => {
      try {
        const record =
          await machineToolBreakdownAPI.getMachineToolBreakdownById(data.id);

        if (!record) return;

        setForm((prev) => ({
          ...prev,

          plantId: record.branch?.id || "",
          department: record.department?.id || "",

          breakdownNo: record.docId || record.breakdownNo || "",

          selectMachineToolInst: record.selectMachineToolInst?.id || "",

          machineToolIdInst: record.machineToolIdInst || "",

          machineName: record.machineName || "",

          pmCheckListNo: record.pmCheckListNo?.id || "",

          location: record.location || "",

          breakdownTime:
            typeof record.breakdownTime === "string"
              ? record.breakdownTime.substring(0, 8)
              : "",

          breakdownDate: record.breakdownDate || record.reportedDate || "",

          reportedDate: record.reportedDate || "",

          reportedTime:
            typeof record.reportedTime === "string"
              ? record.reportedTime.substring(0, 8)
              : "",

          reportedBy: record.reportedBy?.id || record.reportedBy || "",

          operatorName:
            record.operatorName?.id ||
            record.operatorName?.employeeId ||
            record.operatorName ||
            "",

          maintenanceType: record.maintenanceType?.id || "",

          natureOfBreakdown: record.natureOfBreakdown?.id || "",

          natureOfProblem: record.natureOfProblem || "",

          estimatedTime: record.estimatedTime || "",

          breakdownType: record.breakdownType?.id || "",

          remarks: record.remarks || "",

          image: record.image || null,
        }));
      } catch (error) {
        console.error("Failed to fetch breakdown by id:", error);
      }
    };

    fetchById();
  }, [data?.id]);

  // ---------------------------------------------------------
  // Change Handler
  // ---------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Change Machine / Tool / Installation category
    if (name === "selectMachineToolInst") {
      setForm((prev) => ({
        ...prev,
        selectMachineToolInst: value,
        machineToolIdInst: "",
        machineName: "",
        location: "",
      }));

      return;
    }

    // Select Machine / Tool ID
    if (name === "machineToolIdInst") {
      const selected = machineToolList.find(
        (m) => String(m.number) === String(value),
      );

      setForm((prev) => ({
        ...prev,
        machineToolIdInst: value,
        machineName: selected?.name || selected?.machineName || "",
        location: selected?.location || "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // Image Upload
  // ---------------------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);

    setForm((prev) => ({
      ...prev,
      image: null,
    }));
  };

  // ---------------------------------------------------------
  // Validation
  // ---------------------------------------------------------
  const validate = () => {
    const errors = {};

    if (!form.plantId) {
      errors.plantId = "Plant ID is required";
    }

    if (!form.department) {
      errors.department = "Department is required";
    }

    if (!form.selectMachineToolInst) {
      errors.selectMachineToolInst = "Machine/Tool/Inst. is required";
    }

    if (!form.date) {
      errors.date = "Date is required";
    }

    if (!form.breakdownTime) {
      errors.breakdownTime = "Breakdown Time is required";
    }

    if (!form.reportedDate) {
      errors.reportedDate = "Reported Date is required";
    }

    if (!form.reportedTime) {
      errors.reportedTime = "Reported Time is required";
    }

    if (!form.maintenanceType) {
      errors.maintenanceType = "Maintenance Type is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ---------------------------------------------------------
  // Convert HTML time value to Java LocalTime string
  // Example: 17:40:55
  // ---------------------------------------------------------
  const toTimeString = (timeStr) => {
    if (!timeStr) return null;

    const [hour = "00", minute = "00", second = "00"] = timeStr.split(":");

    return [
      String(hour).padStart(2, "0"),
      String(minute).padStart(2, "0"),
      String(second).padStart(2, "0"),
    ].join(":");
  };

  // ---------------------------------------------------------
  // Save
  // ---------------------------------------------------------
  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...(data?.id ? { id: data.id } : {}),

        active: true,

        branch: Number(form.plantId),

        department: Number(form.department),

        selectMachineToolInst: Number(form.selectMachineToolInst),

        machineToolIdInst: form.machineToolIdInst || "",

        machineName: form.machineName || "",

        pmCheckListNo: form.pmCheckListNo ? Number(form.pmCheckListNo) : null,

        location: form.location || "",

        breakdownTime: toTimeString(form.breakdownTime),

        breakdownDate: form.breakdownDate || null,

        date: form.date || null,

        reportedDate: form.reportedDate || null,

        reportedTime: toTimeString(form.reportedTime),

        reportedBy: form.reportedBy ? Number(form.reportedBy) : null,

        operatorName: form.operatorName ? Number(form.operatorName) : null,

        maintenanceType: form.maintenanceType
          ? Number(form.maintenanceType)
          : null,

        natureOfBreakdown: form.natureOfBreakdown
          ? Number(form.natureOfBreakdown)
          : null,

        natureOfProblem: form.natureOfProblem || "",

        estimatedTime: form.estimatedTime || "",

        breakdownType: form.breakdownType ? Number(form.breakdownType) : null,

        remarks: form.remarks || "",

        image: "",

        financialYear: new Date().getFullYear().toString(),

        createdBy: localStorage.getItem("usersId") || "",

        orgId: Number(orgId),

        cancelRemarks: "",
      };

      console.log("Submit Payload:", payload);

      await machineToolBreakdownAPI.updateCreateMachineToolBreakdown(
        payload,
        imageFile,
      );

      addToast(
        data?.id
          ? "Machine/Tool Breakdown updated successfully!"
          : "Machine/Tool Breakdown created successfully!",
        "success",
      );

      onBack();
    } catch (err) {
      console.error("Save Machine/Tool Breakdown Error:", err);

      const errorMessage =
        err?.response?.data?.errors?.[0]?.longMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong while saving.";

      addToast(errorMessage, "error");
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
          disabled={isSubmitting}
          className="p-1 rounded-md
          text-gray-600 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-700
          hover:text-gray-900 dark:hover:text-white
          disabled:opacity-60
          transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {data?.id
            ? "Edit Machine/Tool Breakdown"
            : "Add Machine/Tool Breakdown"}
        </h2>
      </div>

      {/* Main Card */}
      <div
        className="bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg p-3 space-y-3"
      >
        {/* Row 1 */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Plant ID"
            name="plantId"
            value={form.plantId}
            onChange={handleChange}
            error={fieldErrors.plantId}
            required
            options={plantOptions}
          />

          <Field
            type="select"
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            error={fieldErrors.department}
            required
            options={departmentOptions}
          />

          <Field
            label="Breakdown No"
            name="breakdownNo"
            value={form.breakdownNo}
            onChange={handleChange}
            placeholder={generatingDocId ? "Generating..." : "Auto"}
            disabled
          />

          <Field
            type="select"
            label="Select Machine/Tool/Inst."
            name="selectMachineToolInst"
            value={form.selectMachineToolInst}
            onChange={handleChange}
            error={fieldErrors.selectMachineToolInst}
            required
            options={toolCategoryOptions}
          />

          <Field
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            error={fieldErrors.date}
            required
          />

          <Field
            type="select"
            label="Machine / Tool ID/Inst."
            name="machineToolIdInst"
            value={form.machineToolIdInst}
            onChange={handleChange}
            options={machineToolList.map((m) => ({
              value: m.number,
              label: m.number || m.machineToolId || m.id,
            }))}
          />

          <Field
            label="Machine Name"
            name="machineName"
            value={form.machineName}
            onChange={handleChange}
            placeholder="Machine Name"
            disabled
          />

          <Field
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            disabled
          />

          <TimeField
            label="Breakdown Time"
            name="breakdownTime"
            value={form.breakdownTime}
            onChange={handleChange}
            error={fieldErrors.breakdownTime}
            required
          />

          <Field
            label="Breakdown Date"
            name="breakdownDate"
            type="date"
            value={form.breakdownDate}
            onChange={handleChange}
          />

          <Field
            label="Reported Date"
            name="reportedDate"
            type="date"
            value={form.reportedDate}
            onChange={handleChange}
            error={fieldErrors.reportedDate}
            required
          />

          <TimeField
            label="Reported Time"
            name="reportedTime"
            value={form.reportedTime}
            onChange={handleChange}
            error={fieldErrors.reportedTime}
            required
          />
        </div>

        {/* Image */}
        <div className="mt-2">
          <label className={labelClasses}>Image</label>

          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div
                className="flex items-center gap-2
                px-4 py-2
                border border-gray-300 dark:border-gray-600
                rounded-md
                hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors"
              >
                <Upload
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />

                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Upload Image
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </label>

            {form.image && (
              <div className="relative">
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded
                  border border-gray-200 dark:border-gray-700"
                />

                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-1 -right-1
                  h-4 w-4 rounded-full
                  bg-red-500 text-white
                  flex items-center justify-center
                  text-xs hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className={fieldGrid}>
          <Field
            type="select"
            label="Reported By"
            name="reportedBy"
            value={form.reportedBy}
            onChange={handleChange}
            options={employeeOptions}
          />

          <Field
            type="select"
            label="Operator Name"
            name="operatorName"
            value={form.operatorName}
            onChange={handleChange}
            options={employeeOptions}
          />

          <Field
            type="select"
            label="Maintenance Type"
            name="maintenanceType"
            value={form.maintenanceType}
            onChange={handleChange}
            error={fieldErrors.maintenanceType}
            required
            options={maintenanceTypeOptions}
          />

          <Field
            type="select"
            label="Nature Of Breakdown"
            name="natureOfBreakdown"
            value={form.natureOfBreakdown}
            onChange={handleChange}
            options={natureOfBreakdownOptions}
          />

          <Field
            label="Nature of Problem"
            name="natureOfProblem"
            value={form.natureOfProblem}
            onChange={handleChange}
            placeholder="Enter nature of problem"
          />

          <Field
            label="Estimated Time (Hrs/Min)"
            name="estimatedTime"
            value={form.estimatedTime}
            onChange={handleChange}
            placeholder="e.g. 2 Hours"
          />

          <Field
            type="select"
            label="Breakdown Type"
            name="breakdownType"
            value={form.breakdownType}
            onChange={handleChange}
            options={breakdownTypeOptions}
          />

          <Field
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Enter remarks"
            className="col-span-2"
          />
        </div>

        {/* Buttons */}
        <div
          className="flex justify-end gap-2 pt-3
          border-t border-gray-200 dark:border-gray-700"
        >
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1
            px-3 py-1.5 rounded text-xs
            border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-200
            bg-white dark:bg-gray-800
            hover:bg-gray-50 dark:hover:bg-gray-700
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1
            px-3 py-1.5 rounded text-xs
            text-white
            bg-blue-600 hover:bg-blue-700
            dark:bg-blue-600 dark:hover:bg-blue-500
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition-colors"
          >
            <Save className="h-3 w-3" />

            {isSubmitting ? "Saving..." : data?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineToolBreakdownForm;
