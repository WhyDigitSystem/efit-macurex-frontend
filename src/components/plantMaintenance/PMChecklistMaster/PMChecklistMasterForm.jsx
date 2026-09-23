import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  FilePlus2,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dayjs from "dayjs";
import { useToast } from "../../Toast/ToastContext";
import pmChecklistMasterAPI from "../../../api/plantMaintenance/pmChecklistMasterAPI";
import { departmentAPI } from "../../../api/departmentAPI";
import branchAPI from "../../../api/branchAPI";

const controlClasses =
  "w-full h-[30px] px-2 rounded border text-xs leading-none transition-colors " +
  "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 " +
  "text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 " +
  "dark:focus:ring-blue-400 dark:focus:border-blue-400 " +
  "[color-scheme:light] dark:[color-scheme:dark]";

const labelClasses =
  "block text-[11px] text-gray-500 dark:text-gray-400 mb-0.5";

const fieldGrid =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-4 items-start";

const SectionHeader = ({ children }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
    {children}
  </h3>
);

const getFieldError = (errors, name) => {
  const parts = name.split(".");
  let error = errors;
  for (const part of parts) {
    if (error && error[part]) {
      error = error[part];
    } else {
      return null;
    }
  }
  return error?.message;
};

const InputField = ({
  control,
  name,
  label,
  type = "text",
  required,
  placeholder,
  errors,
  disabled,
  step,
  readOnly,
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const SelectField = ({
  control,
  name,
  label,
  options,
  required,
  errors,
  placeholder = "-- Select --",
  disabled,
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <div>
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const DatePickerField = ({
  control,
  name,
  label,
  required = false,
  errors,
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const errorMessage = getFieldError(errors, name);

  const getCalendarDays = (month) => {
    const startOfMonth = month.startOf("month");
    const startDay = startOfMonth.day();
    const daysInMonth = month.daysInMonth();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(month.date(i));
    return days;
  };

  return (
    <div className="relative">
      <label className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required` } : undefined}
        render={({ field }) => {
          const selectedDate = field.value
            ? dayjs(field.value, "DD-MM-YYYY", true)
            : null;

          return (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={field.value || ""}
                  placeholder="DD-MM-YYYY"
                  readOnly
                  onClick={() => setOpen((prev) => !prev)}
                  className={`${controlClasses} cursor-pointer pr-8 ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <Calendar
                  size={15}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
              {open && (
                <div className="absolute z-[9999] mt-1 w-[280px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth((prev) => prev.subtract(1, "month"))
                      }
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      &#8249;
                    </button>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {currentMonth.format("MMMM YYYY")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentMonth((prev) => prev.add(1, "month"))
                      }
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      &#8250;
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div
                        key={d}
                        className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays(currentMonth).map((day, idx) => {
                      if (!day) {
                        return <div key={`empty-${idx}`} />;
                      }
                      const isToday = day.isSame(dayjs(), "day");
                      const isSelected =
                        selectedDate && day.isSame(selectedDate, "day");
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            field.onChange(day.format("DD-MM-YYYY"));
                            setOpen(false);
                          }}
                          className={`text-[11px] p-1.5 rounded ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : isToday
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {day.date()}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange(dayjs().format("DD-MM-YYYY"));
                      setOpen(false);
                    }}
                    className="mt-2 w-full text-[11px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded py-1"
                  >
                    Today
                  </button>
                </div>
              )}
            </>
          );
        }}
      />
      {errorMessage && (
        <p className="text-red-500 text-[11px] mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

// ===================== Table Components =====================

const TableWrapper = ({ children }) => (
  <div className="w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
    <table className="w-full min-w-max text-xs">{children}</table>
  </div>
);

const TableHead = ({ headers }) => (
  <thead className="bg-gray-100 dark:bg-gray-700">
    <tr>
      {headers.map((h, i) => {
        const cls =
          i === 0
            ? "w-8 text-center"
            : i === headers.length - 1
              ? "w-20 text-center"
              : "text-left";
        return (
          <th
            key={i}
            className={`${cls} p-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-[10px] font-medium`}
          >
            {h}
          </th>
        );
      })}
    </tr>
  </thead>
);

const TableRow = ({ children, index, onRemove, disabled }) => (
  <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
    <td className="p-2 text-center font-medium dark:text-white text-[10px]">
      {index + 1}
    </td>
    {children}
    <td className="p-2 text-center">
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

const SelectCell = ({
  control,
  name,
  options,
  required,
  errors,
  onChange,
  disabled,
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className="p-2 align-top min-w-[120px]">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <select
            {...field}
            className={`${controlClasses} ${errorMessage ? "border-red-500 focus:border-red-500" : ""}`}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e.target.value);
            }}
            disabled={disabled}
          >
            <option value="">-- Select --</option>
            {options.map((opt) => (
              <option
                key={typeof opt === "object" ? opt.value : opt}
                value={typeof opt === "object" ? opt.value : opt}
              >
                {typeof opt === "object" ? opt.label : opt}
              </option>
            ))}
          </select>
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

const InputCell = ({
  control,
  name,
  type = "text",
  step,
  placeholder,
  required,
  errors,
  align = "left",
  disabled,
  readOnly,
  onChange,
}) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className="p-2 align-top min-w-[100px]">
      <Controller
        name={name}
        control={control}
        rules={required ? { required: "This field is required" } : undefined}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            step={step}
            className={`${controlClasses} ${align === "right" ? "text-right" : ""} ${errorMessage ? "border-red-500 focus:border-red-500" : ""} ${readOnly ? "bg-gray-50 dark:bg-gray-800" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) onChange(e);
            }}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

const TextareaCell = ({ control, name, placeholder, errors, rows = 1 }) => {
  const errorMessage = getFieldError(errors, name);

  return (
    <td className="p-2 align-top min-w-[120px]">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            rows={rows}
            placeholder={placeholder}
            className={`w-full px-2 py-1 rounded border text-xs leading-relaxed transition-colors bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 ${errorMessage ? "border-red-500" : ""}`}
          />
        )}
      />
      {errorMessage && (
        <p className="text-red-500 text-[9px] mt-0.5">{errorMessage}</p>
      )}
    </td>
  );
};

// ===================== Utility =====================

const fmtDate = (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "");

const getDefaultDetailRow = () => ({
  id: 0,
  category: "",
  activity: "",
  checkingPoints: "",
  parameter: "",
  specification: "",
  generalDevObs: "",
  remediesRemarks: "",
  noOfHrs: "0.00",
  frequency: "",
});

// ===================== Defaults =====================

/* documentNo is now server-issued via getPMCheckListMasterDocId, so on
   create it starts blank and is populated once the API call resolves
   (see fetchDocId in the component). On edit it comes straight from the
   record returned for that checklist. */
const getDefaultValues = (record) => ({
  plant: record?.branch?.id ?? "",
  documentNo: record?.docId || "",
  date: fmtDate(record?.commonDate?.createdon) || dayjs().format("DD-MM-YYYY"),
  department: record?.department?.id ?? "",
  pmCheckListFor: record?.pmCheckListFor || "",
  pmCheckListNo: record?.pmCheckListNo || "",
  toolCategory: record?.toolCategory?.id ?? "",
  preparedBy: record?.preparedBy?.id ?? "",
  approvedBy: record?.approvedBy?.id ?? "",
  cancelRemarks: record?.cancelRemarks || "",
  pmCheckListDetails: record?.pmCheckListDetailsResponseDTO?.length
    ? record.pmCheckListDetailsResponseDTO.map((row) => ({
        id: row.id || 0,
        category: row.category?.id ?? "",
        activity: row.activity?.id ?? "",
        checkingPoints: row.checkingPoints || "",
        parameter: row.parameter || "",
        specification: row.specification || "",
        generalDevObs: row.generalDevObs || "",
        remediesRemarks: row.remediesRemarks || "",
        noOfHrs: row.noOfHrs?.toString() || "0.00",
        frequency: row.frequency || "",
      }))
    : [getDefaultDetailRow()],
});

// ===================== Main Form =====================

const PMChecklistMasterForm = ({ onBack, onSave, editData, editId }) => {
  const ORG_ID = Number(localStorage.getItem("orgId")) || 0;
  const CREATED_BY = localStorage.getItem("userName") || "SYSTEM";

  const { addToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [plantOptions, setPlantOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [toolCategoryGroups, setToolCategoryGroups] = useState([]); // raw grouped response
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [activityOptions, setActivityOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const saveCounter = useRef(0);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: getDefaultValues(editData),
  });

  const detailsArray = useFieldArray({
    control,
    name: "pmCheckListDetails",
  });

  const selectedPlant = watch("plant");
  const selectedDepartment = watch("department");
  const selectedPmCheckListFor = watch("pmCheckListFor");

  useEffect(() => {
    reset(getDefaultValues(editData));
  }, [editData, editId, reset]);

  // ===================== Document No (server-generated) =====================

  const fetchDocId = useCallback(() => {
    if (!ORG_ID) return;
    const financialYear =
      editData?.financialYear || String(new Date().getFullYear());

    pmChecklistMasterAPI
      .getDocId(ORG_ID, financialYear)
      .then((res) => {
        const status = res?.status === true || res?.statusFlag === "Ok";
        if (status) {
          setValue("documentNo", res?.paramObjectsMap?.docId || "");
        } else {
          console.error(
            "Failed to load document number:",
            res?.paramObjectsMap?.message || res,
          );
        }
      })
      .catch((error) => {
        console.error("Failed to load document number:", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, editData, setValue]);

  useEffect(() => {
    // Only auto-generate a doc number for a brand-new record.
    // Edit mode keeps whatever doc number the record already has.
    if (!editData?.id) {
      fetchDocId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID, editData]);

  // ===================== Data Loading =====================

  useEffect(() => {
    if (!ORG_ID) return;

    branchAPI
      .getBranchByOrgId(ORG_ID)
      .then((list) =>
        setPlantOptions(
          (list || []).map((b) => ({ value: b.id, label: b.branchName })),
        ),
      )
      .catch((error) => {
        console.error("Failed to load plant options:", error);
        setPlantOptions([]);
      });

    // departmentAPI.getAllDepartments resolves with the raw response
    // envelope (paramObjectsMap.departmentVO), not a pre-unwrapped array.
    departmentAPI
      .getAllDepartments(ORG_ID)
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : res?.paramObjectsMap?.departmentVO || [];
        setDepartmentOptions(
          list.map((d) => ({ value: d.id, label: d.departmentName })),
        );
      })
      .catch((error) => {
        console.error("Failed to load department options:", error);
        setDepartmentOptions([]);
      });

    pmChecklistMasterAPI
      .getToolCategoryGroups(ORG_ID)
      .then((groups) => {
        console.log("Tool category groups loaded:", groups);
        setToolCategoryGroups(Array.isArray(groups) ? groups : []);
      })
      .catch((error) => {
        console.error("Failed to load tool category groups:", error);
        setToolCategoryGroups([]);
      });

    pmChecklistMasterAPI
      .getEmployees(ORG_ID)
      .then((list) =>
        setEmployeeOptions(
          (list || []).map((e) => ({ value: e.id, label: e.employeeName })),
        ),
      )
      .catch((error) => {
        console.error("Failed to load employees:", error);
        setEmployeeOptions([]);
      });

    // Detail-row "Category" options - org-configurable list-master values,
    // not a fixed enum. Display the value description ("1"/"2"/etc.) but
    // send back the real id.
    pmChecklistMasterAPI
      .getCategories(ORG_ID)
      .then((list) =>
        setCategoryOptions(
          (list || []).map((c) => ({
            value: c.id,
            label: c.valuesDescription,
          })),
        ),
      )
      .catch((error) => {
        console.error("Failed to load category options:", error);
        setCategoryOptions([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ORG_ID]);

  // "PM Check List For" options = distinct apllicableFor values from the
  // tool-category groups.
  const pmCheckListForOptions = toolCategoryGroups.map((g) => ({
    value: g.apllicableFor,
    label: g.apllicableFor,
  }));

  // "Machine/Tool Category" options = the detail list of whichever group's
  // apllicableFor matches the selected "PM Check List For".
  const machineToolCategoryOptions = (
    toolCategoryGroups.find((g) => g.apllicableFor === selectedPmCheckListFor)
      ?.toolCategoryDetailResponseDTO || []
  ).map((c) => ({ value: c.id, label: c.category }));

  // Activities depend on the selected Department.
  useEffect(() => {
    if (!ORG_ID || !selectedDepartment) {
      setActivityOptions([]);
      return;
    }

    pmChecklistMasterAPI
      .getActivities(selectedDepartment, ORG_ID)
      .then((list) =>
        setActivityOptions(
          (list || []).map((a) => ({ value: a.id, label: a.name })),
        ),
      )
      .catch((error) => {
        console.error("Failed to load activities:", error);
        setActivityOptions([]);
      });
  }, [ORG_ID, selectedDepartment]);

  // ===================== Detail Row Handlers =====================

  const handleAddDetail = () => {
    detailsArray.append(getDefaultDetailRow());
  };

  const handleRemoveDetail = (index) => {
    if (detailsArray.fields.length > 1) detailsArray.remove(index);
  };

  // ===================== Validation & Save =====================

  const validate = () => {
    const missingFields = [];
    if (!watch("plant")) missingFields.push("Plant ID");
    if (!watch("department")) missingFields.push("Department");
    if (!watch("pmCheckListFor")) missingFields.push("PM Checklist For");
    if (!watch("pmCheckListNo")) missingFields.push("PM Checklist No");
    if (!watch("toolCategory")) missingFields.push("Machine/Tool Category");
    if (!watch("preparedBy")) missingFields.push("Prepared By");
    if (!watch("approvedBy")) missingFields.push("Approved By");

    if (missingFields.length) {
      addToast(
        `Missing mandatory fields: ${missingFields.join(", ")}`,
        "error",
      );
      return false;
    }

    const details = getValues("pmCheckListDetails") || [];
    const hasValidRow = details.some(
      (row) => row.checkingPoints && row.frequency,
    );

    if (!hasValidRow) {
      addToast(
        "At least one detail row with Checking Points and Frequency is required",
        "error",
      );
      return false;
    }

    return true;
  };

  const onSubmit = async (formData) => {
    if (!validate()) return;

    setSaving(true);
    const isUpdate = Boolean(editData?.id);

    const payload = {
      // id is only ever sent on update; on create the key is omitted
      // entirely rather than sent as 0.
      ...(isUpdate ? { id: parseInt(editData.id, 10) } : {}),
      active: editData?.active ?? true,
      orgId: ORG_ID,
      createdBy: CREATED_BY,
      financialYear:
        editData?.financialYear || String(new Date().getFullYear()),
      cancelRemarks: formData.cancelRemarks || "",
      branch: formData.plant ? Number(formData.plant) : null,
      department: formData.department ? Number(formData.department) : null,
      pmCheckListFor: formData.pmCheckListFor || "",
      pmCheckListNo: formData.pmCheckListNo || "",
      toolCategory: formData.toolCategory
        ? Number(formData.toolCategory)
        : null,
      preparedBy: formData.preparedBy ? Number(formData.preparedBy) : null,
      approvedBy: formData.approvedBy ? Number(formData.approvedBy) : null,
      pmCheckListDetailsDTO: (formData.pmCheckListDetails || [])
        .filter((row) => row.checkingPoints)
        .map((row) => ({
          ...(row.id ? { id: parseInt(row.id, 10) } : {}),
          category: row.category ? Number(row.category) : null,
          activity: row.activity ? Number(row.activity) : null,
          checkingPoints: row.checkingPoints || "",
          parameter: row.parameter || "",
          specification: row.specification || "",
          generalDevObs: row.generalDevObs || "",
          remediesRemarks: row.remediesRemarks || "",
          noOfHrs: parseFloat(row.noOfHrs) || 0,
          frequency: row.frequency || "",
        })),
    };

    saveCounter.current += 1;

    try {
      const response =
        await pmChecklistMasterAPI.createUpdateChecklist(payload);

      const status = response?.status === true || response?.statusFlag === "Ok";

      if (status) {
        const successMessage =
          response?.paramObjectsMap?.message ||
          (isUpdate
            ? "PM Checklist updated successfully!"
            : "PM Checklist created successfully!");

        addToast(successMessage, "success");

        if (onSave) {
          onSave(payload);
        } else {
          onBack();
        }
      } else {
        const errorMessage =
          response?.paramObjectsMap?.message ||
          response?.paramObjectsMap?.errorMessage ||
          response?.message ||
          "Failed to save PM Checklist";

        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage =
        error.response?.data?.paramObjectsMap?.message ||
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "Save failed! Try again.";

      addToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const detailHeaders = [
    "S.No",
    "Category",
    "Activity",
    "Checking Points",
    "Parameter",
    "Specification",
    "General Dev. Obs.",
    "Remedies / Remarks",
    "No. of Hrs",
    "Frequency",
    "Action",
  ];

  return (
    <div className="p-2 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {editData || editId ? "Edit PM Checklist" : "Add PM Checklist"}
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        {/* Header Section */}
        <SectionHeader>Header</SectionHeader>
        <div className={fieldGrid}>
          <SelectField
            control={control}
            name="plant"
            label="Plant ID"
            options={plantOptions}
            required
            errors={errors}
          />

          <InputField
            control={control}
            name="documentNo"
            label="Document No"
            readOnly
            placeholder="Fetching document number..."
            errors={errors}
          />

          <SelectField
            control={control}
            name="department"
            label="Department"
            options={departmentOptions}
            required
            errors={errors}
          />

          <DatePickerField
            control={control}
            name="date"
            label="Date"
            errors={errors}
          />

          <SelectField
            control={control}
            name="pmCheckListFor"
            label="PM Check List For"
            options={pmCheckListForOptions}
            required
            errors={errors}
          />

          <InputField
            control={control}
            name="pmCheckListNo"
            label="PM Check List No"
            required
            placeholder="Enter checklist no"
            errors={errors}
          />

          <SelectField
            control={control}
            name="toolCategory"
            label="Machine/Tool Category"
            options={machineToolCategoryOptions}
            required
            errors={errors}
            disabled={!selectedPmCheckListFor}
          />

          <SelectField
            control={control}
            name="preparedBy"
            label="Prepared By"
            options={employeeOptions}
            required
            errors={errors}
          />

          <SelectField
            control={control}
            name="approvedBy"
            label="Approved By"
            options={employeeOptions}
            required
            errors={errors}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 mb-4"></div>

        {/* Checklist Details Section */}
        <div>
          <SectionHeader>Checklist Details</SectionHeader>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-2">
            <button
              type="button"
              onClick={handleAddDetail}
              className="ml-auto h-6 w-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          <TableWrapper>
            <TableHead headers={detailHeaders} />
            <tbody>
              {detailsArray.fields.map((field, index) => (
                <TableRow
                  key={field.id}
                  index={index}
                  onRemove={() => handleRemoveDetail(index)}
                  disabled={detailsArray.fields.length <= 1}
                >
                  <SelectCell
                    control={control}
                    name={`pmCheckListDetails.${index}.category`}
                    options={categoryOptions}
                    errors={errors}
                  />
                  <SelectCell
                    control={control}
                    name={`pmCheckListDetails.${index}.activity`}
                    options={activityOptions}
                    required
                    errors={errors}
                    disabled={!selectedDepartment}
                  />
                  <InputCell
                    control={control}
                    name={`pmCheckListDetails.${index}.checkingPoints`}
                    required
                    placeholder="Enter checking points"
                    errors={errors}
                  />
                  <InputCell
                    control={control}
                    name={`pmCheckListDetails.${index}.parameter`}
                    placeholder="Enter parameter"
                    errors={errors}
                  />
                  <InputCell
                    control={control}
                    name={`pmCheckListDetails.${index}.specification`}
                    placeholder="Enter specification"
                    errors={errors}
                  />
                  <TextareaCell
                    control={control}
                    name={`pmCheckListDetails.${index}.generalDevObs`}
                    placeholder="Deviations"
                    errors={errors}
                    rows={1}
                  />
                  <TextareaCell
                    control={control}
                    name={`pmCheckListDetails.${index}.remediesRemarks`}
                    placeholder="Remedies"
                    errors={errors}
                    rows={1}
                  />
                  <InputCell
                    control={control}
                    name={`pmCheckListDetails.${index}.noOfHrs`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    errors={errors}
                    align="right"
                  />
                  <InputCell
                    control={control}
                    name={`pmCheckListDetails.${index}.frequency`}
                    required
                    placeholder="Enter frequency"
                    errors={errors}
                  />
                </TableRow>
              ))}
            </tbody>
          </TableWrapper>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>

          <button
            onClick={() => {
              reset(getDefaultValues(null));
              fetchDocId();
            }}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-700 disabled:opacity-60"
          >
            <FilePlus2 className="h-3 w-3" />
            New
          </button>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-3 w-3" />
            {saving ? "Saving..." : editData || editId ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PMChecklistMasterForm;
